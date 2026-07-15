// Shared Prev/Next pager — same control used by AdminAuditLog and now every paginated
// storefront/admin list. Renders nothing for a single-page result set.
export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-3 mt-6 mb-2">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="rounded-md border border-[#d1d5db] text-[13px] px-3 py-1.5 disabled:opacity-40"
      >
        Previous
      </button>
      <span className="text-[13px] text-[#4b4b4b]">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="rounded-md border border-[#d1d5db] text-[13px] px-3 py-1.5 disabled:opacity-40"
      >
        Next
      </button>
    </div>
  )
}
