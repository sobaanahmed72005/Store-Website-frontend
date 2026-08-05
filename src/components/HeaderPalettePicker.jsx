import { useState, useEffect } from 'react'

const PALETTES = [
  {
    id: 2,
    name: 'Option 2: Deep Ocean Navy Top (#0C4A6E), Slate Center (#0B658A) & Ocean Cyan Nav (#0891B2)',
    desc: 'Top: Deep Ocean Navy (#0C4A6E), Center: Ocean Slate (#0B658A), Nav: Bright Ocean Cyan (#0891B2).',
    topbar: '#0c4a6e',
    topbarText: '#ffffff',
    header: '#0b658a',
    headerText: '#ffffff',
    nav: '#0891b2',
    navText: '#ffffff',
  },
  {
    id: 3,
    name: 'Option 3: Abyssal Navy Top (#08384D), Deep Ocean Navy Center (#0C4A6E) & Ocean Cyan Nav (#0891B2)',
    desc: 'Top: Abyssal Navy (#08384D), Center: Deep Ocean Navy (#0C4A6E), Nav: Bright Ocean Cyan (#0891B2).',
    topbar: '#08384d',
    topbarText: '#ffffff',
    header: '#0c4a6e',
    headerText: '#ffffff',
    nav: '#0891b2',
    navText: '#ffffff',
  },
]

export default function HeaderPalettePicker() {
  const [selectedId, setSelectedId] = useState(2)
  const [minimized, setMinimized] = useState(false)

  const applyPalette = (palette) => {
    const root = document.documentElement
    root.style.setProperty('--cz-topbar', palette.topbar)
    root.style.setProperty('--cz-topbar-text', palette.topbarText)
    root.style.setProperty('--cz-header', palette.header)
    root.style.setProperty('--cz-header-text', palette.headerText)
    root.style.setProperty('--cz-nav', palette.nav)
    root.style.setProperty('--cz-nav-text', palette.navText)
    setSelectedId(palette.id)
  }

  useEffect(() => {
    applyPalette(PALETTES[0]) // Default to Option 2
  }, [])

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans max-w-sm w-full bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-cyan-500/40 p-4 transition-all">
      <div className="flex items-center justify-between border-b border-slate-700 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
          <h3 className="text-sm font-bold tracking-wide text-cyan-300">Compare Option 2 & 3</h3>
        </div>
        <button
          type="button"
          onClick={() => setMinimized(!minimized)}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded transition"
        >
          {minimized ? 'Expand 🎨' : 'Minimize _'}
        </button>
      </div>

      {!minimized && (
        <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
          <p className="text-xs text-slate-300">
            Compare Option 2 vs Option 3 side by side:
          </p>
          {PALETTES.map((p) => {
            const isSelected = p.id === selectedId
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPalette(p)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/60 ring-2 ring-cyan-400/40 shadow-lg'
                    : 'border-slate-800 bg-slate-800/60 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-bold ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                    {p.name}
                  </span>
                  {isSelected && <span className="text-[10px] bg-cyan-400 text-slate-950 font-bold px-1.5 py-0.5 rounded">ACTIVE</span>}
                </div>
                
                {/* Color swatches preview */}
                <div className="flex h-6 rounded-md overflow-hidden border border-slate-700 mb-1.5">
                  <div style={{ backgroundColor: p.topbar }} className="flex-1 flex items-center justify-center text-[9px] font-bold text-white">Top</div>
                  <div style={{ backgroundColor: p.header }} className="flex-1 flex items-center justify-center text-[9px] font-bold text-white">Center</div>
                  <div style={{ backgroundColor: p.nav }} className="flex-1 flex items-center justify-center text-[9px] font-bold text-white">Nav</div>
                </div>

                <p className="text-[11px] text-slate-400 leading-tight">{p.desc}</p>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
