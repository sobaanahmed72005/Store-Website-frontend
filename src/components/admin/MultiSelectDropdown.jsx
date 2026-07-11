import { useEffect, useRef, useState } from 'react'
import { ChevronDownIcon } from '../icons'

// Generic id-toggle multi-select popover. Doesn't know anything about merged attribute-option
// shapes ({value, ids: [...]}) — callers map their own option ids/labels in and handle toggling.
export default function MultiSelectDropdown({ options, selectedIds, onToggle, placeholder = 'Select...' }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const onClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const selectedLabels = options.filter((o) => selectedIds.has(o.id)).map((o) => o.label)

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 text-left bg-white"
      >
        <span className={`truncate ${selectedLabels.length ? 'text-[#212121]' : 'text-[#9ca3af]'}`}>
          {selectedLabels.length ? selectedLabels.join(', ') : placeholder}
        </span>
        <ChevronDownIcon size={14} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-white border border-[#dedede] rounded-md shadow-lg max-h-[220px] overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-[13px] text-[#9ca3af]">No options defined yet.</div>
          ) : (
            options.map((opt) => (
              <label
                key={opt.id}
                className="flex items-center gap-2 px-3 py-2 text-[14px] text-[#212121] hover:bg-cz-gold-light cursor-pointer"
              >
                <input type="checkbox" checked={selectedIds.has(opt.id)} onChange={() => onToggle(opt.id)} />
                {opt.label}
              </label>
            ))
          )}
        </div>
      )}
    </div>
  )
}
