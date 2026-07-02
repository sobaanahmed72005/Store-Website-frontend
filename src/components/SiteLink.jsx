import { Link } from 'react-router-dom'
import { resolveInternalPath } from '../utils/internalLinks'

export default function SiteLink({ to, href, children, ...rest }) {
  const internalPath = to || resolveInternalPath(href)

  if (internalPath) {
    return (
      <Link to={internalPath} {...rest}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    )
  }

  const { onClick, ...spanRest } = rest
  return <span {...spanRest}>{children}</span>
}
