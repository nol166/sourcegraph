import * as React from 'react'
import { Link } from 'react-router-dom'

/**
 * The LinkOrSpan component renders a <Link> (from react-router-dom) if the "to" property is a non-empty string;
 * otherwise it renders the text in a <span> (with no link).
 */
export const LinkOrSpan: React.SFC<{
    to: string | undefined | null
    className?: string
    children?: React.ReactNode
}> = ({ to, className = '', children }) =>
    to ? (
        <Link to={to} className={className}>
            {children}
        </Link>
    ) : (
        <span className={className}>{children}</span>
    )