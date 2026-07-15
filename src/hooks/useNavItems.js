import { useCategories } from '../store/categoryStore'
import { categorySlugToPath } from '../utils/categoryPath'

// Shared by CategoryMenu (desktop nav bar) and Header's mobile NavDrawer, so both show the same
// category list built the same way. Lives in its own file (not alongside the CategoryMenu
// component) so this hook can be imported without pulling in a component-only module — Fast
// Refresh only reliably fast-reloads files that export solely components.
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
