import { useCategories } from '../store/categoryStore'
import { categorySlugToPath } from '../utils/categoryPath'

// Shared by CategoryMenu (desktop nav bar) and Header's mobile NavDrawer, so both show the same
// category list built the same way. Lives in its own file (not alongside the CategoryMenu
// component) so this hook can be imported without pulling in a component-only module — Fast
// Refresh only reliably fast-reloads files that export solely components.
export function useNavItems() {
  const { navCategories } = useCategories()
  const safeCategories = Array.isArray(navCategories) ? navCategories : []

  const fixedItems = [
    { label: 'Home', to: '/' },
    { label: 'Products', to: '/products', hasDropdown: true },
  ]

  const dynamicItems = safeCategories
    .slice()
    .sort((a, b) => (a?.sort_order || 0) - (b?.sort_order || 0) || (a?.name || '').localeCompare(b?.name || ''))
    .map((cat) => {
      const subs = Array.isArray(cat?.subcategories) ? cat.subcategories : []
      return {
        label: cat?.name || '',
        to: categorySlugToPath(cat?.slug || ''),
        hasDropdown: subs.length > 0,
        subcategories: subs,
      }
    })

  return [...fixedItems, ...dynamicItems]
}
