import { ShieldCheck, Cpu, Smartphone, Video, BatteryCharging, Radio, Laptop, Monitor, HardDrive } from 'lucide-react'
import RadialOrbitalTimeline from './ui/radial-orbital-timeline'
import { useBrandStore } from '../store/brandStore'

const ICON_MAP = {
  Smartphone,
  BatteryCharging,
  Cpu,
  Video,
  ShieldCheck,
  Radio,
  Laptop,
  Monitor,
  HardDrive,
}

export default function BrandsOrbitalTimeline() {
  const storeBrands = useBrandStore((s) => s.brands)

  // Hydrate Lucide Icon component if iconName is provided
  const timelineData = storeBrands.map((b) => ({
    ...b,
    icon: b.icon || (b.iconName ? ICON_MAP[b.iconName] : Cpu),
  }))

  return (
    <section className="mx-auto px-5 pt-[30px] pb-0 md:pb-[30px] bg-white border-y border-slate-200/80 my-2 overflow-visible">
      <div className="flex items-center justify-between mb-[20px]">
        <h2 className="text-[24px] font-bold text-[#0c4a6e] font-heading tracking-tight">
          Brands
        </h2>
      </div>

      {/* Floating 3D Horizontal Elliptical Orbit (Standard Speed + Hover Pause) */}
      <div className="w-full overflow-visible">
        <RadialOrbitalTimeline
          timelineData={timelineData}
          orbitStyle="horizontal"
          showLine={false}
          rotationSpeed={1.0}
        />
      </div>
    </section>
  )
}
