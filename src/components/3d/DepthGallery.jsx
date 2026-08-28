import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeftIcon, ChevronRightIcon } from '../icons'

const depthVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 80 : -80,
    z: -140,
    rotateY: direction > 0 ? 12 : -12,
    scale: 0.9,
    opacity: 0,
    filter: 'brightness(0.85) blur(3px)',
  }),
  center: {
    x: 0,
    z: 0,
    rotateY: 0,
    scale: 1,
    opacity: 1,
    filter: 'brightness(1) blur(0px)',
    transition: {
      duration: 0.42,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: (direction) => ({
    x: direction > 0 ? -50 : 50,
    z: -100,
    rotateY: direction > 0 ? -6 : 6,
    scale: 0.94,
    opacity: 0,
    filter: 'blur(2px)',
    transition: {
      duration: 0.16, // Snappy 160ms exit!
      ease: [0.4, 0, 1, 1],
    },
  }),
}

export default function DepthGallery({ items, activeIndex, onSelectIndex, title }) {
  const [[page, direction], setPage] = useState([activeIndex, 0])
  const prevIndexRef = useRef(activeIndex)

  useEffect(() => {
    if (activeIndex !== prevIndexRef.current) {
      const dir = activeIndex > prevIndexRef.current ? 1 : -1
      prevIndexRef.current = activeIndex
      setPage([activeIndex, dir])
    }
  }, [activeIndex])

  if (!items || items.length === 0) return null

  const currentItem = items[page] || items[0]

  const paginate = (newDirection) => {
    const newIndex = (page + newDirection + items.length) % items.length
    prevIndexRef.current = newIndex
    setPage([newIndex, newDirection])
    onSelectIndex?.(newIndex)
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-white rounded-xl select-none" style={{ perspective: 1200 }}>
      <AnimatePresence initial={false} custom={direction} mode="sync">
        <motion.div
          key={page}
          custom={direction}
          variants={depthVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 flex items-center justify-center p-4 sm:p-6"
          style={{ transformStyle: 'preserve-3d', willChange: 'transform, opacity, filter' }}
        >
          {currentItem.type === 'video' ? (
            <video src={currentItem.src || currentItem.image} controls className="max-w-full max-h-full object-contain bg-black rounded-lg" />
          ) : (
            <img
              src={currentItem.src || currentItem.image}
              alt={currentItem.alt || title || `Product image ${page + 1}`}
              className="max-w-full max-h-full object-contain drop-shadow-sm select-none"
              draggable={false}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {items.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={() => paginate(-1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-9 h-9 rounded-full bg-white/90 shadow-md text-slate-800 hover:text-[#0c4a6e] hover:bg-white hover:scale-110 active:scale-95 transition-all cursor-pointer border border-slate-200/80"
          >
            <ChevronLeftIcon size={20} />
          </button>

          <button
            type="button"
            aria-label="Next image"
            onClick={() => paginate(1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-9 h-9 rounded-full bg-white/90 shadow-md text-slate-800 hover:text-[#0c4a6e] hover:bg-white hover:scale-110 active:scale-95 transition-all cursor-pointer border border-slate-200/80"
          >
            <ChevronRightIcon size={20} />
          </button>
        </>
      )}
    </div>
  )
}
