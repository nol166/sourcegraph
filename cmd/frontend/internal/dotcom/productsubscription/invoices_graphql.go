package productsubscription

import (
	"context"
	"time"

	"github.com/pkg/errors"
	"github.com/sourcegraph/enterprise/cmd/frontend/internal/dotcom/billing"
	"github.com/sourcegraph/sourcegraph/cmd/frontend/backend"
	"github.com/sourcegraph/sourcegraph/cmd/frontend/graphqlbackend"
	stripe "github.com/stripe/stripe-go"
	"github.com/stripe/stripe-go/invoice"
	"github.com/stripe/stripe-go/plan"
	"github.com/stripe/stripe-go/sub"
)

type productSubscriptionPreviewInvoice struct {
	price         int32
	amountDue     int32
	prorationDate *int64
	before, after *productSubscriptionInvoiceItem
}

func (r *productSubscriptionPreviewInvoice) Price() int32     { return r.price }
func (r *productSubscriptionPreviewInvoice) AmountDue() int32 { return r.amountDue }
func (r *productSubscriptionPreviewInvoice) ProrationDate() *string {
	if v := r.prorationDate; v != nil {
		s := time.Unix(*v, 0).Format(time.RFC3339)
		return &s
	}
	return nil
}

func (r *productSubscriptionPreviewInvoice) IsDowngradeRequiringManualIntervention() bool {
	return r.before != nil && isDowngradeRequiringManualIntervention(r.before.userCount, r.before.plan.Amount, r.after.userCount, r.after.plan.Amount)
}

func isDowngradeRequiringManualIntervention(beforeUserCount int32, beforePlanPrice int64, afterUserCount int32, afterPlanPrice int64) bool {
	return afterUserCount < beforeUserCount || afterPlanPrice < beforePlanPrice
}

func (r *productSubscriptionPreviewInvoice) BeforeInvoiceItem() graphqlbackend.ProductSubscriptionInvoiceItem {
	if r.before == nil {
		return nil // untyped nil is necessary for graphql-go
	}
	return r.before
}

func (r *productSubscriptionPreviewInvoice) AfterInvoiceItem() graphqlbackend.ProductSubscriptionInvoiceItem {
	return r.after
}

func (ProductSubscriptionLicensingResolver) PreviewProductSubscriptionInvoice(ctx context.Context, args *graphqlbackend.PreviewProductSubscriptionInvoiceArgs) (graphqlbackend.ProductSubscriptionPreviewInvoice, error) {
	accountUser, err := graphqlbackend.UserByID(ctx, args.Account)
	if err != nil {
		return nil, err
	}
	custID, err := billing.GetOrAssignUserCustomerID(ctx, accountUser.SourcegraphID())
	if err != nil {
		return nil, err
	}

	// 🚨 SECURITY: Users may only preview invoices for their own product subscriptions. Site admins
	// may preview invoices for all product subscriptions.
	if err := backend.CheckSiteAdminOrSameUser(ctx, accountUser.SourcegraphID()); err != nil {
		return nil, err
	}

	// Get the "before" subscription invoice item.
	planParams := &stripe.PlanParams{Params: stripe.Params{Context: ctx}}
	planParams.AddExpand("product")
	plan, err := plan.Get(args.ProductSubscription.BillingPlanID, planParams)
	if err != nil {
		return nil, err
	}
	result := productSubscriptionPreviewInvoice{
		after: &productSubscriptionInvoiceItem{
			plan:      plan,
			userCount: args.ProductSubscription.UserCount,
			// The expiresAt field will be set below, not here, because its value depends on whether
			// this is a new vs. updated subscription.
		},
	}

	params := &stripe.InvoiceParams{
		Params:            stripe.Params{Context: ctx},
		Customer:          stripe.String(custID),
		SubscriptionItems: []*stripe.SubscriptionItemsParams{billing.ToSubscriptionItemsParams(args.ProductSubscription)},
	}

	if args.SubscriptionToUpdate != nil {
		// Update a subscription.
		//
		// When updating an existing subscription, craft the params to replace the existing subscription
		// item (otherwise the invoice would include both the existing and updated subscription items).
		subToUpdate, err := productSubscriptionByID(ctx, *args.SubscriptionToUpdate)
		if err != nil {
			return nil, err
		}
		// 🚨 SECURITY: Only site admins and the subscription's account owner may preview invoices
		// for product subscriptions.
		if err := backend.CheckSiteAdminOrSameUser(ctx, subToUpdate.v.UserID); err != nil {
			return nil, err
		}

		// 🚨 SECURITY: Ensure that the subscription is owned by the account (i.e., that the
		// parameters are internally consistent). These checks are redundant for site admins, but
		// it's good to be robust against bugs.
		if subToUpdate.v.UserID != accountUser.SourcegraphID() {
			return nil, errors.New("product subscription's account owner does not match the provided account parameter")
		}
		if subToUpdate.v.BillingSubscriptionID == nil {
			return nil, errors.New("unable to get preview invoice for product subscription that has no associated billing information")
		}

		subParams := &stripe.SubscriptionParams{Params: stripe.Params{Context: ctx}}
		subParams.AddExpand("plan.product")
		billingSubToUpdate, err := sub.Get(*subToUpdate.v.BillingSubscriptionID, subParams)
		if err != nil {
			return nil, err
		}

		params.SubscriptionProrationDate = stripe.Int64(time.Now().Unix())
		params.Subscription = stripe.String(*subToUpdate.v.BillingSubscriptionID)
		params.SubscriptionProrate = stripe.Bool(true)
		idToReplace, err := billing.GetSubscriptionItemIDToReplace(billingSubToUpdate, custID)
		if err != nil {
			return nil, err
		}
		params.SubscriptionItems[0].ID = stripe.String(idToReplace)

		result.prorationDate = params.SubscriptionProrationDate
		result.before = &productSubscriptionInvoiceItem{
			plan:      billingSubToUpdate.Plan,
			userCount: int32(billingSubToUpdate.Quantity),
			expiresAt: time.Unix(billingSubToUpdate.CurrentPeriodEnd, 0),
		}
	}

	// Get the preview invoice.
	invoice, err := invoice.GetNext(params)
	if err != nil {
		return nil, err
	}

	// Calculate the price and expiration.
	for _, invoiceItem := range invoice.Lines.Data {
		// When updating an existing subscription, only include invoice items that are affected by
		// the update (== whose proration date is the same as the one we set on the update params).
		if result.prorationDate != nil && invoiceItem.Period.Start != *result.prorationDate {
			continue
		}
		result.price += int32(invoiceItem.Amount)

		// Set the period end to the farthest ahead future invoice item's end date.
		periodEnd := time.Unix(invoiceItem.Period.End, 0)
		if periodEnd.After(result.after.expiresAt) {
			result.after.expiresAt = periodEnd
		}
	}
	return &result, nil
}