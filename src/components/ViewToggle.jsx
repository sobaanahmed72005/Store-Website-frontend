import { GridIcon, ListIcon } from './icons'

// Grid/list layout switcher shared by every product-listing page (Products, Shop,
// CategoryListing) — previously these were two buttons with no onClick at all, so clicking
// "List view" did nothing.
export default function ViewToggle({ view, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label="Grid view"
        aria-pressed={view === 'grid'}
        onClick={() => onChange('grid')}
        className={`text-[#212121] ${view === 'grid' ? '' : 'opacity-50 hover:opacity-80'}`}
      >
        <GridIcon size={16} />
      </button>
      <button
        type="button"
        aria-label="List view"
        aria-pressed={view === 'list'}
        onClick={() => onChange('list')}
        className={`text-[#212121] ${view === 'list' ? '' : 'opacity-50 hover:opacity-80'}`}
      >
        <ListIcon size={16} />
      </button>
    </div>
  )
}
