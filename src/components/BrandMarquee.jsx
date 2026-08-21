import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const BRANDS = [
  {
    id: 'apple',
    name: 'Apple',
    logo: 'https://cdn.simpleicons.org/apple/000000',
    accentColor: '#000000',
    gradient: 'from-slate-100 via-slate-50 to-white',
    glow: 'rgba(15, 23, 42, 0.15)',
  },
  {
    id: 'romoss',
    name: 'Romoss',
    logo: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/romoss.png',
    accentColor: '#f97316',
    gradient: 'from-orange-100/60 via-amber-50/40 to-white',
    glow: 'rgba(249, 115, 22, 0.2)',
  },
  {
    id: 'vivo',
    name: 'Vivo',
    logo: 'https://cdn.simpleicons.org/vivo/0051C5',
    accentColor: '#0051C5',
    gradient: 'from-blue-100/60 via-sky-50/40 to-white',
    glow: 'rgba(0, 81, 197, 0.2)',
  },
  {
    id: 'ezviz',
    name: 'EZVIZ',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/EZVIZ_logo.svg/1024px-EZVIZ_logo.svg.png',
    accentColor: '#0d9488',
    gradient: 'from-teal-100/60 via-emerald-50/40 to-white',
    glow: 'rgba(13, 148, 136, 0.2)',
  },
  {
    id: 'hikvision',
    name: 'Hikvision',
    logo: 'https://cdn.simpleicons.org/hikvision/D71920',
    accentColor: '#D71920',
    gradient: 'from-red-100/60 via-rose-50/40 to-white',
    glow: 'rgba(215, 25, 32, 0.2)',
  },
  {
    id: 'imou',
    name: 'IMOU',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Imou_logo.svg/1024px-Imou_logo.svg.png',
    accentColor: '#0284c7',
    gradient: 'from-cyan-100/60 via-sky-50/40 to-white',
    glow: 'rgba(2, 132, 199, 0.2)',
  },
]

export default function BrandMarquee() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % BRANDS.length)
    }, 3800)
    return () => clearInterval(timer)
  }, [])

  const currentBrand = BRANDS[index]

  return (
    <section className="w-full py-8 bg-white overflow-hidden my-6 border-y border-slate-200/80 relative">
      <div className="max-w-xl mx-auto px-4">
        
        {/* UI/UX Pro Max Clean Header */}
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse shadow-sm shadow-cyan-500/50" />
            <h3 className="text-xs font-black tracking-widest text-slate-900 uppercase bg-gradient-to-r from-slate-900 via-cyan-700 to-slate-900 bg-clip-text text-transparent">
              OFFICIAL BRANDS
            </h3>
          </div>

          <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 border border-cyan-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            100% Genuine
          </span>
        </div>

        {/* UI/UX Pro Max Glassmorphism Canvas */}
        <div className="relative w-full h-[220px] rounded-3xl bg-gradient-to-b from-slate-50/90 via-white to-slate-50/60 border border-slate-200/90 p-6 flex flex-col items-center justify-center shadow-xl shadow-slate-200/40 overflow-hidden">
          
          {/* Dynamic Ambient Color Mesh Glow */}
          <motion.div
            key={`glow-${currentBrand.id}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{ backgroundColor: currentBrand.glow }}
            className="absolute inset-0 blur-3xl pointer-events-none rounded-3xl"
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentBrand.id}
              initial={{ opacity: 0, scale: 0.85, y: 20, rotateX: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: -20, rotateX: -15 }}
              transition={{
                type: 'spring',
                stiffness: 280,
                damping: 22,
              }}
              className="flex flex-col items-center justify-center gap-3.5 relative z-10 cursor-pointer"
            >
              {/* Pro Max Frameless Floating Logo Stage */}
              <motion.div
                whileHover={{ scale: 1.12, rotateY: 10, y: -4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="w-22 h-22 rounded-2xl bg-white/90 backdrop-blur-xl border border-slate-200/80 p-4 flex items-center justify-center shadow-2xl shadow-slate-300/40 relative group"
              >
                <img
                  src={currentBrand.logo}
                  alt={currentBrand.name}
                  className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform"
                />
              </motion.div>

              {/* Brand Name with Micro Badge */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="flex flex-col items-center gap-0.5"
              >
                <span className="text-sm font-extrabold tracking-wider uppercase text-slate-900">
                  {currentBrand.name}
                </span>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* UI/UX Pro Max Interactive Pill Navigation Bar */}
          <div className="absolute bottom-4.5 flex items-center gap-2 z-20">
            {BRANDS.map((b, i) => (
              <motion.button
                key={b.id}
                type="button"
                onClick={() => setIndex(i)}
                className="h-2 rounded-full cursor-pointer transition-all"
                animate={{
                  width: i === index ? 24 : 8,
                  backgroundColor: i === index ? currentBrand.accentColor : '#cbd5e1',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
