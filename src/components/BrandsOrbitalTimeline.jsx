import { ShieldCheck, Cpu, Smartphone, Video, BatteryCharging, Radio } from 'lucide-react'
import RadialOrbitalTimeline from './ui/radial-orbital-timeline'

const BRANDS_TIMELINE_DATA = [
  {
    id: 1,
    title: 'Apple',
    date: 'EST 1976',
    content: 'Flagship Computing & Mobile Ecosystem. Premium MacBook, iPad, iPhone, and official accessories.',
    category: 'Computers & Mobile',
    icon: Smartphone,
    logoUrl: 'https://cdn.simpleicons.org/apple/000000',
    relatedIds: [2, 3],
    status: 'completed',
    energy: 98,
  },
  {
    id: 2,
    title: 'Romoss',
    date: 'EST 2012',
    content: 'High-Capacity Power Banks, Rapid Charging Stations, and Mobile Power Solutions.',
    category: 'Power & Charging',
    icon: BatteryCharging,
    relatedIds: [1, 4],
    status: 'completed',
    energy: 95,
  },
  {
    id: 3,
    title: 'Vivo',
    date: 'EST 2009',
    content: 'Next-Gen Mobile Technology, AMOLED Displays, and Pro Photo Camera Smartphones.',
    category: 'Smart Mobility',
    icon: Cpu,
    logoUrl: 'https://cdn.simpleicons.org/vivo/0051C5',
    relatedIds: [1, 5],
    status: 'in-progress',
    energy: 92,
  },
  {
    id: 4,
    title: 'EZVIZ',
    date: 'EST 2013',
    content: 'AI-Powered Smart Security Cameras, Wireless Outdoor Vision, and Smart Home Automation.',
    category: 'Smart Security',
    icon: Video,
    relatedIds: [2, 5],
    status: 'completed',
    energy: 90,
  },
  {
    id: 5,
    title: 'Hikvision',
    date: 'EST 2001',
    content: 'World-Leading Security Surveillance, Ultra HD NVR Systems, and Enterprise Optical Tech.',
    category: 'Surveillance',
    icon: ShieldCheck,
    relatedIds: [3, 4, 6],
    status: 'completed',
    energy: 96,
  },
  {
    id: 6,
    title: 'IMOU',
    date: 'EST 2015',
    content: 'Consumer IoT & Smart Cloud Cameras, Wi-Fi 6 Routers, and Smart Lock Security.',
    category: 'Smart Home',
    icon: Radio,
    relatedIds: [4, 5],
    status: 'in-progress',
    energy: 88,
  },
]

export default function BrandsOrbitalTimeline() {
  return (
    <section className="w-full py-4 bg-white relative overflow-hidden my-2 border-y border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Matching Store Section Headings */}
        <div className="mb-4">
          <h2 className="text-[24px] font-bold text-[#0c4a6e] font-heading tracking-tight">
            Brands
          </h2>
        </div>

        {/* 3D Radial Orbital Component (Compact Height, Borderless Canvas) */}
        <div className="w-full">
          <RadialOrbitalTimeline timelineData={BRANDS_TIMELINE_DATA} />
        </div>
      </div>
    </section>
  )
}
