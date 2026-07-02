import { Link } from 'react-router-dom'
import { ChevronDownIcon } from './icons'
import { useCategories } from '../context/CategoryContext'

function categorySlugToPath(slug) {
  return slug === 'laptops' ? '/laptops' : `/category/${slug}`
}

export function useNavItems() {
  const { navCategories } = useCategories()

  const fixedItems = [
    { label: 'Home', to: '/' },
    { label: 'Products', to: '/products', hasDropdown: true },
  ]

  const dynamicItems = navCategories
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
    .map((cat) => ({
      label: cat.name,
      to: categorySlugToPath(cat.slug),
      hasDropdown: cat.subcategories && cat.subcategories.length > 0,
      subcategories: cat.subcategories,
    }))

  return [...fixedItems, ...dynamicItems]
}

function MegaMenuPanel({ item }) {
  const { navCategories } = useCategories()
  let links
  if (item.label === 'Products') {
    links = [...navCategories]
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
      .map((cat) => ({ label: cat.name, to: categorySlugToPath(cat.slug) }))
  } else if (item.subcategories) {
    links = item.subcategories.map((sub) => ({ label: sub.name, to: categorySlugToPath(sub.slug) }))
  }
  if (!links || links.length === 0) return null

  const isWide = links.length > 14

  return (
    <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-150 z-40">
      <div
        className={`bg-cz-gold-light rounded-[10px] shadow-[0_0_15px_1px_rgba(0,0,0,0.178)] p-[20px] ${
          isWide ? 'grid grid-cols-3 gap-x-8 gap-y-1 w-[640px]' : 'flex flex-col gap-1 min-w-[220px]'
        }`}
      >
        {links.map((link) => (
          <Link
            key={link.label}
            to={link.to}
            className="text-[13px] text-[#353535] whitespace-nowrap py-1 hover:text-cz-primary hover:underline"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function CategoryMenu() {
  const navItems = useNavItems()

  return (
    <nav className="hidden lg:block bg-cz-nav sticky top-0 z-30">
      <div className="max-w-[1400px] 2xl:max-w-[1800px] min-[2000px]:max-w-[2200px] mx-auto px-5 py-2.5">
        <ul className="flex flex-row flex-wrap items-center gap-x-5">
          {navItems.map((item) => {
            const content = (
              <>
                <span className="relative group-hover:text-cz-accent-hover transition-colors">
                  {item.label}
                  <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-cz-accent-hover transition-all duration-300 group-hover:w-full" />
                </span>
                {item.hasDropdown && (
                  <ChevronDownIcon size={14} className="ms-2 group-hover:text-cz-accent-hover" />
                )}
              </>
            )
            return (
              <li key={item.label} className="relative group">
                {item.to ? (
                  <Link
                    to={item.to}
                    className="group flex items-center text-[13px] font-normal text-white"
                  >
                    {content}
                  </Link>
                ) : (
                  <span className="group flex items-center text-[13px] font-normal text-white cursor-default">
                    {content}
                  </span>
                )}
                {item.hasDropdown && <MegaMenuPanel item={item} />}
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
