import { useSiteSettings } from '../store/siteSettingsStore'

// Only splits into two colors at a real word/case boundary (e.g. "IT Network", "TechStore").
// A leading acronym like "IT" in "ITNetwork" is a run of capitals, so the boundary is where
// that run hands off to the next capitalized word (before the last capital in the run), not
// after its first letter — otherwise "IT" itself would end up split across two colors.
// A single word like "Network" has no natural boundary, so it stays one color instead of
// getting cut in half with mismatched colors.
function splitName(name) {
  const spaceIndex = name.indexOf(' ')
  if (spaceIndex > 0) return [name.slice(0, spaceIndex), name.slice(spaceIndex + 1), true, true]
  const isCap = (ch) => !!ch && ch === ch.toUpperCase() && ch !== ch.toLowerCase()
  let boundary = -1
  for (let i = 1; i < name.length; i++) {
    if (isCap(name[i]) && !isCap(name[i + 1])) {
      boundary = i
      break
    }
  }
  if (boundary > 0) return [name.slice(0, boundary), name.slice(boundary), true, false]
  return [name, '', false, false]
}

export default function Logo({ variant = 'dark', className = '', textClassName = 'text-2xl', iconOnly = false, hideIcon = false, iconClassName = 'h-7', truncate = false }) {
  const { siteName, logoUrl } = useSiteSettings()
  const isLight = variant === 'light'
  const [first, second, hasBoundary, hasSpace] = splitName(siteName)

  if (iconOnly && logoUrl) {
    return (
      <img src={logoUrl} alt={siteName} width={32} height={32} className={`h-8 w-auto object-contain shrink-0 ${className}`} />
    )
  }

  return (
    <span
      className={`flex items-center gap-2 font-heading font-bold leading-none whitespace-nowrap ${
        truncate ? 'min-w-0' : ''
      } ${textClassName} ${className}`}
    >
      {logoUrl && !hideIcon && (
        <img src={logoUrl} alt={siteName} width={28} height={28} className={`w-auto object-contain shrink-0 ${iconClassName}`} />
      )}
      <span className={truncate ? 'min-w-0 truncate' : ''}>
        <span className={isLight ? 'text-white' : 'text-cz-primary'}>{first}</span>
        {hasBoundary && (
          <>
            {hasSpace && ' '}
            <span className={isLight ? 'text-white' : 'text-cz-accent-hover'}>{second}</span>
          </>
        )}
      </span>
    </span>
  )
}
