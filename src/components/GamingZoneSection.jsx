import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Product3DCanvas from './3d/Product3DCanvas'

const GAMING_GEAR = [
  {
    id: 1,
    title: 'ASUS ROG Strix SCAR 18',
    category: 'Flagship Gaming Laptop',
    specs: 'Intel i9-14900HX • RTX 4090 16GB • 240Hz Mini-LED',
    price: 'Rs. 985,000',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format&fit=crop&q=80',
    tag: 'ULTRA HIGH END',
  },
  {
    id: 2,
    title: 'Razer BlackWidow V4 Pro',
    category: 'RGB Mechanical Keyboard',
    specs: 'Green Clicky Switches • Chroma RGB • Dial Control',
    price: 'Rs. 58,500',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80',
    tag: 'BESTSELLER',
  },
  {
    id: 3,
    title: 'Corsair Virtuoso SE Wireless',
    category: 'Spatial Audio Headset',
    specs: 'High-Fidelity 24bit/96kHz • RGB • Broadcast Mic',
    price: 'Rs. 64,999',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    tag: 'PRO AUDIO',
  },
  {
    id: 4,
    title: 'NVIDIA RTX 4090 Gaming OC',
    category: 'Graphic Card GPU',
    specs: '24GB GDDR6X • DLSS 3.5 • Vapor Chamber Cooling',
    price: 'Rs. 645,000',
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&auto=format&fit=crop&q=80',
    tag: 'EXTREME POWER',
  },
]

export default function GamingZoneSection() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [activeTab, setActiveTab] = useState('3d-scene') // '3d-scene' or 'gear-cards'

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setMousePos({ x, y })
  }

  return (
    <section
      onMouseMove={handleMouseMove}
      className="w-full py-16 bg-slate-950 text-white overflow-hidden my-10 border-y border-cyan-900/40 relative shadow-2xl"
    >
      {/* Mouse-Reactive RGB Ambient Spotlight Background */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none opacity-40 transition-all duration-300 ease-out"
        style={{
          top: `calc(50% + ${mousePos.y * 150}px)`,
          left: `calc(50% + ${mousePos.x * 200}px)`,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(6,182,212,0.8) 0%, rgba(236,72,153,0.5) 50%, transparent 100%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-5 relative z-10">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-black tracking-widest text-cyan-400 uppercase">
                EXCLUSIVE GAMING SHOWROOM
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              DOMINATE YOUR GAMEPLAY 🎮
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-full text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('3d-scene')}
                className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                  activeTab === '3d-scene'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🧊 3D Hardware Scene
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('gear-cards')}
                className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                  activeTab === 'gear-cards'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🔥 Pro Gaming Gear
              </button>
            </div>

            <Link
              to="/shop"
              className="rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-5 py-2.5 shadow-lg shadow-cyan-500/25 transition-all hover:scale-105"
            >
              Shop All Gaming →
            </Link>
          </div>
        </div>

        {/* Tab 1: Interactive 3D Hardware Room Scene */}
        {activeTab === '3d-scene' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md">
            <div className="lg:col-span-6 flex flex-col gap-4">
              <span className="text-xs font-bold text-rose-400 bg-rose-950/80 border border-rose-500/30 px-3.5 py-1 rounded-full w-fit">
                CHORDLESS 240HZ BEAST
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold leading-tight">
                Interactive 3D Hardware Inspection Canvas
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Orbit, drag, and tilt 3D gaming hardware in real-time. Designed with precision cooling & RGB lighting.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/product/asus-rog-strix-scar-18"
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs px-6 py-3 shadow-lg shadow-cyan-500/30 hover:scale-105 transition-all"
                >
                  Inspect Product Details
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 w-full aspect-square max-h-[380px] bg-slate-950 rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl shadow-cyan-500/20 relative">
              <Product3DCanvas title="ASUS ROG Strix Gaming Laptop" className="w-full h-full" />
            </div>
          </div>
        ) : (
          /* Tab 2: Floating Pro Gaming Gear Cards with Parallax Tilt */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {GAMING_GEAR.map((gear) => (
              <motion.div
                key={gear.id}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-xl hover:border-cyan-500/60 hover:shadow-cyan-500/20 transition-all cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
                      {gear.tag}
                    </span>
                    <span className="text-xs text-slate-400">{gear.category}</span>
                  </div>

                  <div className="w-full h-40 bg-slate-950 rounded-xl overflow-hidden mb-4 border border-slate-800 p-3 flex items-center justify-center group-hover:border-cyan-500/40 transition-colors">
                    <img
                      src={gear.image}
                      alt={gear.title}
                      className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  <h4 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                    {gear.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{gear.specs}</p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800 pt-3 mt-2">
                  <span className="text-sm font-extrabold text-white">{gear.price}</span>
                  <Link
                    to="/shop"
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    View →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
