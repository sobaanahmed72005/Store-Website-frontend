import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCategories } from '../context/CategoryContext'
import { resolveImageUrl } from '../api/client'

const SLIDE_WIDTH = 140 + 15

function categorySlugToPath(slug) {
  return slug === 'laptops' ? '/laptops' : `/category/${slug}`
}

export default function CategoryIcons() {
  const { iconCategories } = useCategories()
  const categories = iconCategories
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))

  const trackRef = useRef(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (categories.length === 0) return
    const id = setInterval(() => {
      setActive((i) => (i + 1) % categories.length)
    }, 3000)
    return () => clearInterval(id)
  }, [categories.length])

  useEffect(() => {
    trackRef.current?.scrollTo({ left: active * SLIDE_WIDTH, behavior: 'smooth' })
  }, [active])

  if (categories.length === 0) return null

  return (
    <section className="max-w-[1400px] 2xl:max-w-[1800px] min-[2000px]:max-w-[2200px] mx-auto px-5 py-5">
      <div
        ref={trackRef}
        className="flex gap-[15px] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((cat) => (
          <Link key={cat.slug} to={categorySlugToPath(cat.slug)} className="flex flex-col shrink-0 w-[140px]">
            <div className="aspect-square w-full rounded-full overflow-hidden cursor-pointer bg-cz-gold-light">
              {cat.image && (
                <img src={resolveImageUrl(cat.image)} alt={cat.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="text-[15px] font-semibold text-black text-center mt-[10px] cursor-pointer">
              {cat.name}
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-center items-center gap-1 mt-4">
        {categories.map((cat, i) => (
          <span
            key={cat.slug}
            className="w-2 h-2 rounded-full bg-black transition-opacity"
            style={{ opacity: i === active ? 1 : 0.2 }}
          />
        ))}
      </div>
    </section>
  )
}
