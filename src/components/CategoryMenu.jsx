import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDownIcon } from './icons'
import { useCategories } from '../store/categoryStore'
import { useNavItems } from '../hooks/useNavItems'
import { categorySlugToPath } from '../utils/categoryPath'
import { prefetchCategory } from '../utils/routePrefetch'

function MegaMenuPanel({ item, isOpen, leftPos }) {
  const { navCategories } = useCategories()
  let links
  if (item.label === 'Products') {
    links = [...navCategories]
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
      .map((cat) => ({ label: cat.name, to: categorySlugToPath(cat.slug) }))
  } else if (item.subcategories) {
    links = item.subcategories.map((sub) => ({ label: sub.name, to: categorySlugToPath(sub.slug) }))
  }
  if (!links || links.length === 0) return null

  const isWide = links.length > 14
  const panelWidth = isWide ? 640 : 240
  // Prevent panel from extending past the right viewport edge
  const maxLeft = typeof window !== 'undefined' ? window.innerWidth - panelWidth - 40 : 800
  const clampedLeft = Math.min(Math.max(20, leftPos), maxLeft > 20 ? maxLeft : 20)

  return (
    <div
      style={{ left: `${clampedLeft}px` }}
      className={`absolute top-full pt-2 transition-all duration-200 z-[120] ${
        isOpen
          ? 'opacity-100 visible pointer-events-auto'
          : 'opacity-0 invisible pointer-events-none'
      }`}
    >
      <div
        className={`bg-cz-gold-light rounded-[10px] shadow-[0_4px_25px_rgba(0,0,0,0.25)] border border-[#e2e8f0] p-[20px] ${
          isWide ? 'grid grid-cols-3 gap-x-8 gap-y-1 w-[640px]' : 'flex flex-col gap-1 min-w-[220px]'
        }`}
      >
        {links.map((link) => {
          const slug = link.to.replace('/category/', '').replace('/', '')
          return (
            <Link
              key={link.label}
              to={link.to}
              onMouseEnter={() => prefetchCategory(slug)}
              onTouchStart={() => prefetchCategory(slug)}
              className="text-[13px] text-[#353535] whitespace-nowrap py-1 hover:text-cz-primary hover:underline font-medium"
            >
              {link.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default function CategoryMenu() {
  const navItems = useNavItems()
  const [openDropdown, setOpenDropdown] = useState(null)
  const [panelLeft, setPanelLeft] = useState(20)
  const menuRef = useRef(null)
  const scrollRef = useRef(null)
  const itemRefs = useRef({})

  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  // Calculate exact left pixel offset for the active category tab
  const updatePanelPosition = (label) => {
    const el = itemRefs.current[label]
    const container = menuRef.current
    if (el && container) {
      const elRect = el.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      const left = elRect.left - containerRect.left
      setPanelLeft(left)
    }
  }

  const handleOpen = (label) => {
    updatePanelPosition(label)
    setOpenDropdown(label)
  }

  const handleClose = () => {
    setOpenDropdown(null)
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        handleClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMouseDown = (e) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 1.8
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  const scrollBy = (offset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }

  const activeItem = navItems.find((i) => i.label === openDropdown && i.hasDropdown)

  return (
    <nav ref={menuRef} onMouseLeave={handleClose} className="hidden lg:block bg-cz-nav relative z-30 shadow-md group/nav">
      <div className="mx-auto px-5 relative flex items-center">
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={() => scrollBy(-250)}
          aria-label="Scroll left"
          className="absolute left-1 z-40 w-7 h-7 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center opacity-0 group-hover/nav:opacity-100 transition-opacity shadow cursor-pointer"
        >
          ‹
        </button>

        {/* Category Items Horizontal Scroll Track */}
        <ul
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeaveOrUp}
          onMouseUp={handleMouseLeaveOrUp}
          onMouseMove={handleMouseMove}
          className={`flex flex-row flex-nowrap items-center gap-x-6 overflow-x-auto no-scrollbar py-2.5 whitespace-nowrap scroll-smooth ${
            isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
          }`}
        >
          {navItems.map((item) => {
            const isOpen = openDropdown === item.label

            const toggleOpen = (e) => {
              e.preventDefault()
              e.stopPropagation()
              if (isOpen) {
                handleClose()
              } else {
                handleOpen(item.label)
              }
            }

            return (
              <li
                key={item.label}
                ref={(el) => (itemRefs.current[item.label] = el)}
                onMouseEnter={() => item.hasDropdown && handleOpen(item.label)}
                className="relative flex items-center shrink-0"
              >
                {item.to ? (
                  <Link
                    to={item.to}
                    onClick={handleClose}
                    className="flex items-center text-[13px] font-normal text-[var(--cz-nav-text,#ffffff)] hover:text-cz-sky transition-colors"
                  >
                    <span className="relative font-medium">
                      {item.label}
                      <span className="absolute left-0 -bottom-0.5 h-[2px] w-0 bg-cz-sky transition-all duration-300 group-hover:w-full" />
                    </span>
                  </Link>
                ) : (
                  <span
                    onClick={toggleOpen}
                    className="flex items-center text-[13px] font-normal text-[var(--cz-nav-text,#ffffff)] cursor-pointer hover:text-cz-sky transition-colors"
                  >
                    <span className="relative font-medium">{item.label}</span>
                  </span>
                )}

                {item.hasDropdown && (
                  <button
                    type="button"
                    onClick={toggleOpen}
                    aria-label={`Toggle ${item.label} subcategories`}
                    className="p-1.5 ml-0.5 text-[var(--cz-nav-text,#ffffff)] hover:text-cz-sky transition-colors cursor-pointer"
                  >
                    <ChevronDownIcon
                      size={14}
                      className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-cz-sky' : ''}`}
                    />
                  </button>
                )}
              </li>
            )
          })}
        </ul>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={() => scrollBy(250)}
          aria-label="Scroll right"
          className="absolute right-1 z-40 w-7 h-7 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center opacity-0 group-hover/nav:opacity-100 transition-opacity shadow cursor-pointer"
        >
          ›
        </button>

        {/* Unclipped Mega Menu Dropdown Panel (outside ul overflow-x-auto boundary) */}
        {activeItem && (
          <div onMouseLeave={handleClose}>
            <MegaMenuPanel item={activeItem} isOpen={true} leftPos={panelLeft} />
          </div>
        )}
      </div>
    </nav>
  )
}
