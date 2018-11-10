import { ProviderMap } from './common';
import { fromHover, fromLocation, toPosition } from './types';
/** @internal */
export class ExtLanguageFeatures {
    constructor(proxy, documents) {
        this.proxy = proxy;
        this.documents = documents;
        this.registrations = new ProviderMap(id => this.proxy.$unregister(id));
    }
    async $provideHover(id, resource, position) {
        const provider = this.registrations.get(id);
        return Promise.resolve(provider.provideHover(await this.documents.getSync(resource), toPosition(position))).then(result => (result ? fromHover(result) : result));
    }
    registerHoverProvider(selector, provider) {
        const { id, subscription } = this.registrations.add(provider);
        this.proxy.$registerHoverProvider(id, selector);
        return subscription;
    }
    async $provideDefinition(id, resource, position) {
        const provider = this.registrations.get(id);
        return Promise.resolve(provider.provideDefinition(await this.documents.getSync(resource), toPosition(position))).then(toDefinition);
    }
    registerDefinitionProvider(selector, provider) {
        const { id, subscription } = this.registrations.add(provider);
        this.proxy.$registerDefinitionProvider(id, selector);
        return subscription;
    }
    async $provideTypeDefinition(id, resource, position) {
        const provider = this.registrations.get(id);
        return Promise.resolve(provider.provideTypeDefinition(await this.documents.getSync(resource), toPosition(position))).then(toDefinition);
    }
    registerTypeDefinitionProvider(selector, provider) {
        const { id, subscription } = this.registrations.add(provider);
        this.proxy.$registerTypeDefinitionProvider(id, selector);
        return subscription;
    }
    async $provideImplementation(id, resource, position) {
        const provider = this.registrations.get(id);
        return Promise.resolve(provider.provideImplementation(await this.documents.getSync(resource), toPosition(position))).then(toDefinition);
    }
    registerImplementationProvider(selector, provider) {
        const { id, subscription } = this.registrations.add(provider);
        this.proxy.$registerImplementationProvider(id, selector);
        return subscription;
    }
    async $provideReferences(id, resource, position, context) {
        const provider = this.registrations.get(id);
        return Promise.resolve(provider.provideReferences(await this.documents.getSync(resource), toPosition(position), context)).then(toLocations);
    }
    registerReferenceProvider(selector, provider) {
        const { id, subscription } = this.registrations.add(provider);
        this.proxy.$registerReferenceProvider(id, selector);
        return subscription;
    }
}
function toLocations(result) {
    return result ? result.map(location => fromLocation(location)) : result;
}
function toDefinition(result) {
    return result
        ? Array.isArray(result)
            ? result.map(location => fromLocation(location))
            : fromLocation(result)
        : result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VGZWF0dXJlcy5qcyIsInNvdXJjZVJvb3QiOiJzcmMvIiwic291cmNlcyI6WyJleHRlbnNpb24vYXBpL2xhbmd1YWdlRmVhdHVyZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBYUEsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLFVBQVUsQ0FBQTtBQUV0QyxPQUFPLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsTUFBTSxTQUFTLENBQUE7QUF3QjdELGdCQUFnQjtBQUNoQixNQUFNLE9BQU8sbUJBQW1CO0lBSzVCLFlBQW9CLEtBQWdDLEVBQVUsU0FBdUI7UUFBakUsVUFBSyxHQUFMLEtBQUssQ0FBMkI7UUFBVSxjQUFTLEdBQVQsU0FBUyxDQUFjO1FBSjdFLGtCQUFhLEdBQUcsSUFBSSxXQUFXLENBRXJDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUVxRCxDQUFDO0lBRWxGLEtBQUssQ0FBQyxhQUFhLENBQ3RCLEVBQVUsRUFDVixRQUFnQixFQUNoQixRQUF3QjtRQUV4QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBZ0IsRUFBRSxDQUFDLENBQUE7UUFDMUQsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUNsQixRQUFRLENBQUMsWUFBWSxDQUFDLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQ3RGLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtJQUMzRCxDQUFDO0lBRU0scUJBQXFCLENBQUMsUUFBMEIsRUFBRSxRQUF1QjtRQUM1RSxNQUFNLEVBQUUsRUFB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cnhqcydcbmltcG9ydCB7XG4gICAgRGVmaW5pdGlvblByb3ZpZGVyLFxuICAgIERvY3VtZW50U2VsZWN0b3IsXG4gICAgSG92ZXJQcm92aWRlcixcbiAgICBJbXBsZW1lbnRhdGlvblByb3ZpZGVyLFxuICAgIExvY2F0aW9uLFxuICAgIFJlZmVyZW5jZUNvbnRleHQsXG4gICAgUmVmZXJlbmNlUHJvdmlkZXIsXG4gICAgVHlwZURlZmluaXRpb25Qcm92aWRlcixcbn0gZnJvbSAnc291cmNlZ3JhcGgnXG5pbXBvcnQgeyBDbGllbnRMYW5ndWFnZUZlYXR1cmVzQVBJIH0gZnJvbSAnLi4vLi4vY2xpZW50L2FwaS9sYW5ndWFnZUZlYXR1cmVzJ1xuaW1wb3J0ICogYXMgcGxhaW4gZnJvbSAnLi4vLi4vcHJvdG9jb2wvcGxhaW5UeXBlcydcbmltcG9ydCB7IFByb3ZpZGVyTWFwIH0gZnJvbSAnLi9jb21tb24nXG5pbXBvcnQgeyBFeHREb2N1bWVudHMgfSBmcm9tICcuL2RvY3VtZW50cydcbmltcG9ydCB7IGZyb21Ib3ZlciwgZnJvbUxvY2F0aW9uLCB0b1Bvc2l0aW9uIH0gZnJvbSAnLi90eXBlcydcblxuLyoqIEBpbnRlcm5hbCAqL1xuZXhwb3J0IGludGVyZmFjZSBFeHRMYW5ndWFnZUZlYXR1cmVzQVBJIHtcbiAgICAkcHJvdmlkZUhvdmVyKGlkOiBudW1iZXIsIHJlc291cmNlOiBzdHJpbmcsIHBvc2l0aW9uOiBwbGFpbi5Qb3NpdGlvbik6IFByb21pc2U8cGxhaW4uSG92ZXIgfCBudWxsIHwgdW5kZWZpbmVkPlxuICAgICRwcm92aWRlRGVmaW5pdGlvbihpZDogbnVtYmVyLCByZXNvdXJjZTogc3RyaW5nLCBwb3NpdGlvbjogcGxhaW4uUG9zaXRpb24pOiBQcm9taXNlPHBsYWluLkRlZmluaXRpb24gfCB1bmRlZmluZWQ+XG4gICAgJHByb3ZpZGVUeXBlRGVmaW5pdGlvbihcbiAgICAgICAgaWQ6IG51bWJlcixcbiAgICAgICAgcmVzb3VyY2U6IHN0cmluZyxcbiAgICAgICAgcG9zaXRpb246IHBsYWluLlBvc2l0aW9uXG4gICAgKTogUHJvbWlzZTxwbGFpbi5EZWZpbml0aW9uIHwgdW5kZWZpbmVkPlxuICAgICRwcm92aWRlSW1wbGVtZW50YXRpb24oXG4gICAgICAgIGlkOiBudW1iZXIsXG4gICAgICAgIHJlc291cmNlOiBzdHJpbmcsXG4gICAgICAgIHBvc2l0aW9uOiBwbGFpbi5Qb3NpdGlvblxuICAgICk6IFByb21pc2U8cGxhaW4uRGVmaW5pdGlvbiB8IHVuZGVmaW5lZD5cbiAgICAkcHJvdmlkZVJlZmVyZW5jZXMoXG4gICAgICAgIGlkOiBudW1iZXIsXG4gICAgICAgIHJlc291cmNlOiBzdHJpbmcsXG4gICAgICAgIHBvc2l0aW9uOiBwbGFpbi5Qb3NpdGlvbixcbiAgICAgICAgY29udGV4dDogUmVmZXJlbmNlQ29udGV4dFxuICAgICk6IFByb21pc2U8cGxhaW4uTG9jYXRpb25bXSB8IG51bGwgfCB1bmRlZmluZWQ+XG59XG5cbi8qKiBAaW50ZXJuYWwgKi9cbmV4cG9ydCBjbGFzcyBFeHRMYW5ndWFnZUZlYXR1cmVzIGltcGxlbWVudHMgRXh0TGFuZ3VhZ2VGZWF0dXJlc0FQSSB7XG4gICAgcHJpdmF0ZSByZWdpc3RyYXRpb25zID0gbmV3IFByb3ZpZGVyTWFwPFxuICAgICAgICBIb3ZlclByb3ZpZGVyIHwgRGVmaW5pdGlvblByb3ZpZGVyIHwgVHlwZURlZmluaXRpb25Qcm92aWRlciB8IEltcGxlbWVudGF0aW9uUHJvdmlkZXIgfCBSZWZlcmVuY2VQcm92aWRlclxuICAgID4oaWQgPT4gdGhpcy5wcm94eS4kdW5yZWdpc3RlcihpZCkpXG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHByb3h5OiBDbGllbnRMYW5ndWFnZUZlYXR1cmVzQVBJLCBwcml2YXRlIGRvY3VtZW50czogRXh0RG9jdW1lbnRzKSB7fVxuXG4gICAgcHVibGljIGFzeW5jICRwcm92aWRlSG92ZXIoXG4gICAgICAgIGlkOiBudW1iZXIsXG4gICAgICAgIHJlc291cmNlOiBzdHJpbmcsXG4gICAgICAgIHBvc2l0aW9uOiBwbGFpbi5Qb3NpdGlvblxuICAgICk6IFByb21pc2U8cGxhaW4uSG92ZXIgfCBudWxsIHwgdW5kZWZpbmVkPiB7XG4gICAgICAgIGNvbnN0IHByb3ZpZGVyID0gdGhpcy5yZWdpc3RyYXRpb25zLmdldDxIb3ZlclByb3ZpZGVyPihpZClcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShcbiAgICAgICAgICAgIHByb3ZpZGVyLnByb3ZpZGVIb3Zlcihhd2FpdCB0aGlzLmRvY3VtZW50cy5nZXRTeW5jKHJlc291cmNlKSwgdG9Qb3NpdGlvbihwb3NpdGlvbikpXG4gICAgICAgICkudGhlbihyZXN1bHQgPT4gKHJlc3VsdCA/IGZyb21Ib3ZlcihyZXN1bHQpIDogcmVzdWx0KSlcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVnaXN0ZXJIb3ZlclByb3ZpZGVyKHNlbGVjdG9yOiBEb2N1bWVudFNlbGVjdG9yLCBwcm92aWRlcjogSG92ZXJQcm92aWRlcik6IFVuc3Vic2NyaWJhYmxlIHtcbiAgICAgICAgY29uc3QgeyBpZCwgc3Vic2NyaXB0aW9uIH0gPSB0aGlzLnJlZ2lzdHJhdGlvbnMuYWRkKHByb3ZpZGVyKVxuICAgICAgICB0aGlzLnByb3h5LiRyZWdpc3RlckhvdmVyUHJvdmlkZXIoaWQsIHNlbGVjdG9yKVxuICAgICAgICByZXR1cm4gc3Vic2NyaXB0aW9uXG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jICRwcm92aWRlRGVmaW5pdGlvbihcbiAgICAgICAgaWQ6IG51bWJlcixcbiAgICAgICAgcmVzb3VyY2U6IHN0cmluZyxcbiAgICAgICAgcG9zaXRpb246IHBsYWluLlBvc2l0aW9uXG4gICAgKTogUHJvbWlzZTxwbGFpbi5EZWZpbml0aW9uIHwgbnVsbCB8IHVuZGVmaW5lZD4ge1xuICAgICAgICBjb25zdCBwcm92aWRlciA9IHRoaXMucmVnaXN0cmF0aW9ucy5nZXQ8RGVmaW5pdGlvblByb3ZpZGVyPihpZClcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShcbiAgICAgICAgICAgIHByb3ZpZGVyLnByb3ZpZGVEZWZpbml0aW9uKGF3YWl0IHRoaXMuZG9jdW1lbnRzLmdldFN5bmMocmVzb3VyY2UpLCB0b1Bvc2l0aW9uKHBvc2l0aW9uKSlcbiAgICAgICAgKS50aGVuKHRvRGVmaW5pdGlvbilcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVnaXN0ZXJEZWZpbml0aW9uUHJvdmlkZXIoc2VsZWN0b3I6IERvY3VtZW50U2VsZWN0b3IsIHByb3ZpZGVyOiBEZWZpbml0aW9uUHJvdmlkZXIpOiBVbnN1YnNjcmliYWJsZSB7XG4gICAgICAgIGNvbnN0IHsgaWQsIHN1YnNjcmlwdGlvbiB9ID0gdGhpcy5yZWdpc3RyYXRpb25zLmFkZChwcm92aWRlcilcbiAgICAgICAgdGhpcy5wcm94eS4kcmVnaXN0ZXJEZWZpbml0aW9uUHJvdmlkZXIoaWQsIHNlbGVjdG9yKVxuICAgICAgICByZXR1cm4gc3Vic2NyaXB0aW9uXG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jICRwcm92aWRlVHlwZURlZmluaXRpb24oXG4gICAgICAgIGlkOiBudW1iZXIsXG4gICAgICAgIHJlc291cmNlOiBzdHJpbmcsXG4gICAgICAgIHBvc2l0aW9uOiBwbGFpbi5Qb3NpdGlvblxuICAgICk6IFByb21pc2U8cGxhaW4uRGVmaW5pdGlvbiB8IG51bGwgfCB1bmRlZmluZWQ+IHtcbiAgICAgICAgY29uc3QgcHJvdmlkZXIgPSB0aGlzLnJlZ2lzdHJhdGlvbnMuZ2V0PFR5cGVEZWZpbml0aW9uUHJvdmlkZXI+KGlkKVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFxuICAgICAgICAgICAgcHJvdmlkZXIucHJvdmlkZVR5cGVEZWZpbml0aW9uKGF3YWl0IHRoaXMuZG9jdW1lbnRzLmdldFN5bmMocmVzb3VyY2UpLCB0b1Bvc2l0aW9uKHBvc2l0aW9uKSlcbiAgICAgICAgKS50aGVuKHRvRGVmaW5pdGlvbilcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVnaXN0ZXJUeXBlRGVmaW5pdGlvblByb3ZpZGVyKFxuICAgICAgICBzZWxlY3RvcjogRG9jdW1lbnRTZWxlY3RvcixcbiAgICAgICAgcHJvdmlkZXI6IFR5cGVEZWZpbml0aW9uUHJvdmlkZXJcbiAgICApOiBVbnN1YnNjcmliYWJsZSB7XG4gICAgICAgIGNvbnN0IHsgaWQsIHN1YnNjcmlwdGlvbiB9ID0gdGhpcy5yZWdpc3RyYXRpb25zLmFkZChwcm92aWRlcilcbiAgICAgICAgdGhpcy5wcm94eS4kcmVnaXN0ZXJUeXBlRGVmaW5pdGlvblByb3ZpZGVyKGlkLCBzZWxlY3RvcilcbiAgICAgICAgcmV0dXJuIHN1YnNjcmlwdGlvblxuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyAkcHJvdmlkZUltcGxlbWVudGF0aW9uKFxuICAgICAgICBpZDogbnVtYmVyLFxuICAgICAgICByZXNvdXJjZTogc3RyaW5nLFxuICAgICAgICBwb3NpdGlvbjogcGxhaW4uUG9zaXRpb25cbiAgICApOiBQcm9taXNlPHBsYWluLkRlZmluaXRpb24gfCB1bmRlZmluZWQ+IHtcbiAgICAgICAgY29uc3QgcHJvdmlkZXIgPSB0aGlzLnJlZ2lzdHJhdGlvbnMuZ2V0PEltcGxlbWVudGF0aW9uUHJvdmlkZXI+KGlkKVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFxuICAgICAgICAgICAgcHJvdmlkZXIucHJvdmlkZUltcGxlbWVudGF0aW9uKGF3YWl0IHRoaXMuZG9jdW1lbnRzLmdldFN5bmMocmVzb3VyY2UpLCB0b1Bvc2l0aW9uKHBvc2l0aW9uKSlcbiAgICAgICAgKS50aGVuKHRvRGVmaW5pdGlvbilcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVnaXN0ZXJJbXBsZW1lbnRhdGlvblByb3ZpZGVyKFxuICAgICAgICBzZWxlY3RvcjogRG9jdW1lbnRTZWxlY3RvcixcbiAgICAgICAgcHJvdmlkZXI6IEltcGxlbWVudGF0aW9uUHJvdmlkZXJcbiAgICApOiBVbnN1YnNjcmliYWJsZSB7XG4gICAgICAgIGNvbnN0IHsgaWQsIHN1YnNjcmlwdGlvbiB9ID0gdGhpcy5yZWdpc3RyYXRpb25zLmFkZChwcm92aWRlcilcbiAgICAgICAgdGhpcy5wcm94eS4kcmVnaXN0ZXJJbXBsZW1lbnRhdGlvblByb3ZpZGVyKGlkLCBzZWxlY3RvcilcbiAgICAgICAgcmV0dXJuIHN1YnNjcmlwdGlvblxuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyAkcHJvdmlkZVJlZmVyZW5jZXMoXG4gICAgICAgIGlkOiBudW1iZXIsXG4gICAgICAgIHJlc291cmNlOiBzdHJpbmcsXG4gICAgICAgIHBvc2l0aW9uOiBwbGFpbi5Qb3NpdGlvbixcbiAgICAgICAgY29udGV4dDogUmVmZXJlbmNlQ29udGV4dFxuICAgICk6IFByb21pc2U8cGxhaW4uTG9jYXRpb25bXSB8IG51bGwgfCB1bmRlZmluZWQ+IHtcbiAgICAgICAgY29uc3QgcHJvdmlkZXIgPSB0aGlzLnJlZ2lzdHJhdGlvbnMuZ2V0PFJlZmVyZW5jZVByb3ZpZGVyPihpZClcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShcbiAgICAgICAgICAgIHByb3ZpZGVyLnByb3ZpZGVSZWZlcmVuY2VzKGF3YWl0IHRoaXMuZG9jdW1lbnRzLmdldFN5bmMocmVzb3VyY2UpLCB0b1Bvc2l0aW9uKHBvc2l0aW9uKSwgY29udGV4dClcbiAgICAgICAgKS50aGVuKHRvTG9jYXRpb25zKVxuICAgIH1cblxuICAgIHB1YmxpYyByZWdpc3RlclJlZmVyZW5jZVByb3ZpZGVyKHNlbGVjdG9yOiBEb2N1bWVudFNlbGVjdG9yLCBwcm92aWRlcjogUmVmZXJlbmNlUHJvdmlkZXIpOiBVbnN1YnNjcmliYWJsZSB7XG4gICAgICAgIGNvbnN0IHsgaWQsIHN1YnNjcmlwdGlvbiB9ID0gdGhpcy5yZWdpc3RyYXRpb25zLmFkZChwcm92aWRlcilcbiAgICAgICAgdGhpcy5wcm94eS4kcmVnaXN0ZXJSZWZlcmVuY2VQcm92aWRlcihpZCwgc2VsZWN0b3IpXG4gICAgICAgIHJldHVybiBzdWJzY3JpcHRpb25cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHRvTG9jYXRpb25zKHJlc3VsdDogTG9jYXRpb25bXSB8IG51bGwgfCB1bmRlZmluZWQpOiBwbGFpbi5Mb2NhdGlvbltdIHwgbnVsbCB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHJlc3VsdCA/IHJlc3VsdC5tYXAobG9jYXRpb24gPT4gZnJvbUxvY2F0aW9uKGxvY2F0aW9uKSkgOiByZXN1bHRcbn1cblxuZnVuY3Rpb24gdG9EZWZpbml0aW9uKHJlc3VsdDogTG9jYXRpb25bXSB8IExvY2F0aW9uIHwgbnVsbCB8IHVuZGVmaW5lZCk6IHBsYWluLkRlZmluaXRpb24gfCB1bmRlZmluZWQge1xuICAgIHJldHVybiByZXN1bHRcbiAgICAgICAgPyBBcnJheS5pc0FycmF5KHJlc3VsdClcbiAgICAgICAgICAgID8gcmVzdWx0Lm1hcChsb2NhdGlvbiA9PiBmcm9tTG9jYXRpb24obG9jYXRpb24pKVxuICAgICAgICAgICAgOiBmcm9tTG9jYXRpb24ocmVzdWx0KVxuICAgICAgICA6IHJlc3VsdFxufVxuIl19