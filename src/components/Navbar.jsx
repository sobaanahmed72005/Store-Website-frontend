import { Link } from 'react-router-dom'
import { useSiteSettings } from '../store/siteSettingsStore'
import AnnouncementBar from './AnnouncementBar'

const DEFAULT_MESSAGES = [
  'We operate only one official store.',
  'Prices may vary due to currency changes.',
  'Beware of fake stores claiming our name.',
]

export default function Navbar() {
  const { brand } = useSiteSettings()
  const messages = brand.marqueeMessages?.length > 0 ? brand.marqueeMessages : DEFAULT_MESSAGES

  // Duplicate list twice so the infinite marquee seamlessly loops without gaps
  const marqueeList = [...messages, ...messages]

  return (
    <>
      <AnnouncementBar />
      <div className="bg-cz-topbar text-[var(--cz-topbar-text)] text-[12px] sm:text-[13px] py-2 border-b border-slate-700/20 overflow-hidden relative">
      <style>{`
        @keyframes navbarMarquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-navbar-marquee {
          display: flex;
          width: max-content;
          animation: navbarMarquee 22s linear infinite;
        }
        .animate-navbar-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Auto-moving continuous announcement marquee */}
        <div className="flex-1 overflow-hidden relative min-w-0 py-0.5 select-none">
          <div className="animate-navbar-marquee flex items-center gap-6 font-medium tracking-wide">
            {marqueeList.map((msg, i) => (
              <span key={i} className="inline-flex items-center gap-6 shrink-0">
                <span className="whitespace-nowrap">{msg}</span>
                <span className="text-cz-gold text-[9px] opacity-70">✦</span>
              </span>
            ))}
          </div>
        </div>

        {/* Most Right side: Order Tracking Link (100% Untouched) */}
        <Link
          to="/order-tracking"
          className="shrink-0 text-[13px] font-medium text-[var(--cz-topbar-text)] hover:text-cz-gold transition-colors cursor-pointer z-10 bg-cz-topbar pl-3"
        >
          Order Tracking
        </Link>
      </div>
    </div>
    </>
  )
}