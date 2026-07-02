import { useState } from 'react'
import { MinusIcon, PlusIcon, CheckIcon, ChevronRightIcon } from '../icons'

export function FilterAccordion({ title, defaultOpen = true, separator = true, children }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="flex flex-col">
      {separator && <div className="h-px w-full bg-[#ccc] my-[3px]" />}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between py-[10px] cursor-pointer text-left"
      >
        <span className="text-[15px] font-semibold text-[#212121]">{title}</span>
        <span className="text-[#212121]">
          {open ? <MinusIcon size={15} /> : <PlusIcon size={15} />}
        </span>
      </button>
      {open && <div className="flex flex-col pt-2 mb-5 gap-2">{children}</div>}
    </div>
  )
}

export function FilterCheckbox({ id, label, count, checked = false, onChange }) {
  return (
    <div className="flex items-center">
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
              ? 'bg-cz-primary border-cz-primary text-white'
              : 'bg-white border-[#cbd5e1] text-transparent'
          }`}
        >
          <CheckIcon size={11} />
        </div>
      </div>
      <label htmlFor={id} className="pl-[10px] text-[14px] font-normal text-[#212121] cursor-pointer">
        {label}
      </label>
      {count != null && (
        <small className="pl-[10px] text-[14px] text-[#212121] opacity-75">({count})</small>
      )}
    </div>
  )
}

export function PriceRangeFilter({ min = 0, max = 1499999, onApply }) {
  const [from, setFrom] = useState(min)
  const [to, setTo] = useState(max)

  const fromPct = ((from - min) / (max - min)) * 100
  const toPct = ((to - min) / (max - min)) * 100

  const handleFromSlider = (value) => {
    const next = Math.min(Number(value), to)
    setFrom(next)
  }
  const handleToSlider = (value) => {
    const next = Math.max(Number(value), from)
    setTo(next)
  }

  return (
    <div className="flex flex-col w-full">
      <div className="my-4 px-1">
        <div className="relative flex items-center h-[3px] w-full rounded-lg bg-[#e5e7eb]">
          <span
            className="absolute top-0 h-full rounded-lg bg-cz-primary"
            style={{ left: `${fromPct}%`, width: `${toPct - fromPct}%` }}
          />
          <input
            type="range"
            min={min}
            max={max}
            value={from}
            onChange={(e) => handleFromSlider(e.target.value)}
            className="range-thumb absolute w-full h-[3px] bg-transparent appearance-none pointer-events-none"
          />
          <input
            type="range"
            min={min}
            max={max}
            value={to}
            onChange={(e) => handleToSlider(e.target.value)}
            className="range-thumb absolute w-full h-[3px] bg-transparent appearance-none pointer-events-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2 items-center">
        <div className="col-span-5 text-[14px] font-normal text-[#212121] pl-[10px]">From</div>
        <div className="col-span-5 text-[14px] font-normal text-[#212121] pl-[10px]">To</div>
        <div className="col-span-2" />

        <div className="col-span-5">
          <input
            type="number"
            value={from}
            onChange={(e) => setFrom(Number(e.target.value))}
            className="w-full rounded-full border border-[#a9a9a9] bg-white text-[14px] text-[#212121] px-4 py-2 outline-none focus:border-[#212121]"
          />
        </div>
        <div className="col-span-5">
          <input
            type="number"
            value={to}
            onChange={(e) => setTo(Number(e.target.value))}
            className="w-full rounded-full border border-[#a9a9a9] bg-white text-[14px] text-[#212121] px-4 py-2 outline-none focus:border-[#212121]"
          />
        </div>
        <div className="col-span-2 flex items-center justify-center">
          <button
            type="button"
            aria-label="Apply price range"
            onClick={() => onApply?.(from, to)}
            className="flex items-center justify-center text-[#212121] hover:text-cz-primary"
          >
            <ChevronRightIcon size={24} />
          </button>
        </div>
      </div>
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
      {items.map((item) => (
        <FilterCheckbox
          key={item.id}
          id={item.id}
          label={item.label}
          count={item.count}
          checked={checkedIds.has(item.id)}
          onChange={() => toggle(item.id)}
        />
      ))}
    </>
  )
}
