import { useSiteSettings } from '../context/SiteSettingsContext'

function splitName(name) {
  const secondCapIndex = [...name].findIndex((ch, i) => i > 0 && ch === ch.toUpperCase() && ch !== ch.toLowerCase())
  if (secondCapIndex > 0) return [name.slice(0, secondCapIndex), name.slice(secondCapIndex)]
  const mid = Math.ceil(name.length / 2)
  return [name.slice(0, mid), name.slice(mid)]
}

export default function Logo({ variant = 'dark', className = '', textClassName = 'text-2xl' }) {
  const { siteName, logoUrl } = useSiteSettings()
  const isLight = variant === 'light'
  const [first, second] = splitName(siteName)

  return (
    <span className={`flex items-center gap-2 font-heading font-bold leading-none whitespace-nowrap ${textClassName} ${className}`}>
      {logoUrl && <img src={logoUrl} alt={siteName} className="h-7 w-auto object-contain shrink-0" />}
      <span className={isLight ? 'text-white' : 'text-cz-primary'}>{first}</span>
      <span className={isLight ? 'text-cz-accent' : 'text-cz-maroon-light'}>{second}</span>
    </span>
  )
}
