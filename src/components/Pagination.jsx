function getPageNumbers(current, total) {
  const pages = []
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }
  return pages
}

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const pageNumbers = getPageNumbers(page, totalPages)

  return (
    <div className="flex flex-col items-center justify-center gap-2.5 my-8">
      {/* Cute Main Control Bar */}
      <div className="inline-flex items-center gap-1.5 p-1.5 bg-white border border-[#e2e8f0] rounded-full shadow-sm hover:shadow-md transition-shadow">
        
        {/* Previous Button */}
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="group inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none text-[#334155] hover:text-[#0ea5e9] hover:bg-[#f0f9ff] active:scale-95"
          aria-label="Previous Page"
        >
          <svg
            className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Page Number Bubbles */}
        <div className="flex items-center gap-1 px-1">
          {pageNumbers.map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`dots-${idx}`} className="px-1.5 text-[12px] text-[#94a3b8] font-bold select-none">
                  •••
                </span>
              )
            }
            const isCurrent = p === page
            return (
              <button
                key={p}
                type="button"
                onClick={() => onChange(p)}
                className={`w-8 h-8 rounded-full text-[13px] font-bold transition-all duration-200 flex items-center justify-center ${
                  isCurrent
                    ? 'bg-[#0ea5e9] text-white shadow-md shadow-[#0ea5e9]/30 scale-105'
                    : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0ea5e9] active:scale-95'
                }`}
                aria-label={`Page ${p}`}
                aria-current={isCurrent ? 'page' : undefined}
              >
                {p}
              </button>
            )
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="group inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none text-white bg-[#0ea5e9] hover:bg-[#0284c7] shadow-sm hover:shadow-md active:scale-95"
          aria-label="Next Page"
        >
          <span>Next</span>
          <svg
            className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>

      {/* Cute Info Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#f8fafc] border border-[#e2e8f0] text-[11px] font-medium text-[#64748b]">
        <span>✨ Page <strong className="text-[#0f172a]">{page}</strong> of <strong className="text-[#0f172a]">{totalPages}</strong></span>
      </div>
    </div>
  )
}
