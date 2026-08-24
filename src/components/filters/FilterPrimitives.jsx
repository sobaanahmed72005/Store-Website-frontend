import { useState } from 'react'
import { MinusIcon, PlusIcon, CheckIcon } from '../icons'

export function FilterAccordion({ title, defaultOpen = true, separator = true, children }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="flex flex-col">
      {separator && <div className="h-px w-full bg-slate-200/80 my-2" />}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between py-2 cursor-pointer text-left"
      >
        <h3 className="text-[15px] font-bold text-slate-800 font-heading m-0">{title}</h3>
        <span className="text-slate-500">
          {open ? <MinusIcon size={15} /> : <PlusIcon size={15} />}
        </span>
      </button>
      {open && <div className="flex flex-col pt-2 mb-4 gap-2">{children}</div>}
    </div>
  )
}

export function FilterCheckbox({ id, label, count, checked = false, onChange }) {
  return (
    <div className="group flex items-center py-1 px-1.5 -mx-1.5 rounded-lg transition-all duration-200 hover:bg-slate-100/70 hover:translate-x-1 cursor-pointer">
      <div className="relative inline-flex w-4 h-4 shrink-0 cursor-pointer select-none">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          className="peer absolute inset-0 w-full h-full z-10 m-0 p-0 opacity-0 cursor-pointer"
        />
        <div
          className={`flex items-center justify-center w-4 h-4 rounded border transition-colors duration-200 ${
            checked
              ? 'bg-[#0c4a6e] border-[#0c4a6e] text-white shadow-sm'
              : 'bg-white border-slate-300 text-transparent group-hover:border-[#0c4a6e]'
          }`}
        >
          <CheckIcon size={11} />
        </div>
      </div>
      <label htmlFor={id} className="pl-2.5 text-[14px] font-medium text-slate-700 group-hover:text-[#0c4a6e] cursor-pointer transition-colors duration-200">
        {label}
      </label>
      {count != null && (
        <small className="pl-1.5 text-[13px] font-normal text-slate-400 group-hover:text-slate-500">({count})</small>
      )}
    </div>
  )
}

export function CheckboxGroup({ items, selectedIds, onToggle }) {
  const [internalIds, setInternalIds] = useState(() => new Set())
  const controlled = selectedIds != null
  const checkedIds = controlled ? selectedIds : internalIds

  const toggle = (id) => {
    if (controlled) {
      onToggle?.(id)
      return
    }
    setInternalIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <>
      {(items || []).map((item) => (
        <FilterCheckbox
          key={item.id}
          id={item.id}
          label={item.label}
          count={item.count}
          checked={checkedIds?.has(item.id)}
          onChange={() => toggle(item.id)}
        />
      ))}
    </>
  )
}
