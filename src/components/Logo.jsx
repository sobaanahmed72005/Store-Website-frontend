import { useSiteSettings } from '../context/SiteSettingsContext'

// Only splits into two colors at a real word/case boundary (e.g. "IT Network", "TechStore").
// A single word like "Network" has no natural boundary, so it stays one color instead of
// getting cut in half with mismatched colors.
function splitName(name) {
  const spaceIndex = name.indexOf(' ')
  if (spaceIndex > 0) return [name.slice(0, spaceIndex), name.slice(spaceIndex + 1), true]
  const secondCapIndex = [...name].findIndex((ch, i) => i > 0 && ch === ch.toUpperCase() && ch !== ch.toLowerCase())
  if (secondCapIndex > 0) return [name.slice(0, secondCapIndex), name.slice(secondCapIndex), true]
  return [name, '', false]
}

export default function Logo({ variant = 'dark', className = '', textClassName = 'text-2xl', iconOnly = false, hideIcon = false, iconClassName = 'h-7' }) {
  const { siteName, logoUrl } = useSiteSettings()
  const isLight = variant === 'light'
  const [first, second, hasBoundary] = splitName(siteName)

  if (iconOnly) {
    return logoUrl ? (
      <img src={logoUrl} alt={siteName} className={`h-8 w-auto object-contain shrink-0 ${className}`} />
    ) : null
  }

  return (
    <span className={`flex items-center gap-2 font-heading font-bold leading-none whitespace-nowrap ${textClassName} ${className}`}>
      {logoUrl && !hideIcon && <img src={logoUrl} alt={siteName} className={`w-auto object-contain shrink-0 ${iconClassName}`} />}
      <span>
        <span className={isLight ? 'text-white' : 'text-cz-primary'}>{first}</span>
        {hasBoundary && (
          <span className={isLight ? 'text-white' : 'text-cz-accent-hover'}>{second}</span>
        )}
      </span>
    </span>
  )
}
