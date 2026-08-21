import React, { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

export function MagneticDock({ children, className = '' }) {
  const mouseX = useMotionValue(Infinity)

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={`flex h-16 items-end gap-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 pb-3 border border-slate-200/80 dark:border-slate-800 shadow-xl ${className}`}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { mouseX })
        }
        return child
      })}
    </motion.div>
  )
}

export function MagneticDockItem({ children, mouseX, onClick, className = '' }) {
  const ref = useRef(null)

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return val - bounds.x - bounds.width / 2
  })

  const widthSync = useTransform(distance, [-150, 0, 150], [40, 64, 40])
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 })

  return (
    <motion.div
      ref={ref}
      style={{ width, height: width }}
      onClick={onClick}
      className={`aspect-square rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-cz-primary shadow-sm hover:shadow-md transition-colors cursor-pointer relative group ${className}`}
    >
      {children}
    </motion.div>
  )
}
