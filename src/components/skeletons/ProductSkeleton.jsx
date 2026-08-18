export default function ProductSkeleton({ count = 8 }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="flex flex-col bg-white border border-slate-200 rounded-[10px] shadow-sm overflow-hidden h-full animate-pulse"
        >
          {/* Image Placeholder */}
          <div className="aspect-square bg-slate-100 relative w-full" />

          {/* Card Body Placeholder */}
          <div className="flex flex-1 flex-col justify-between gap-3 p-4">
            <div className="flex flex-col gap-2">
              <div className="h-4 bg-slate-200 rounded-md w-5/6" />
              <div className="h-4 bg-slate-200 rounded-md w-1/2" />
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: 5 }, (_, j) => (
                  <div key={j} className="w-3 h-3 bg-slate-200 rounded-full" />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <div className="h-6 bg-slate-200 rounded-md w-2/3" />
              <div className="h-9 bg-slate-200 rounded-lg w-full mt-1" />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
