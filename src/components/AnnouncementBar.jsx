import { useEffect, useState } from 'react'
import { api } from '../api/client'

export default function AnnouncementBar() {
  const [bar, setBar] = useState(null)

  useEffect(() => {
    api.get('/content/announcement-bar').then(setBar).catch(() => {})
  }, [])

  if (!bar?.enabled || !bar?.text?.trim()) return null

  const duration = `${bar.speed || 25}s`

  return (
    <>
      <style>{`
        @keyframes announcement-scroll {
          0%   { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
      <div
        style={{ backgroundColor: bar.bgColor || '#c62828', color: bar.textColor || '#ffffff' }}
        className="w-full overflow-hidden py-2"
      >
        <span
          style={{ animation: `announcement-scroll ${duration} linear infinite` }}
          className="inline-block whitespace-nowrap text-[13px] font-semibold tracking-wide"
        >
          {bar.text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{bar.text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{bar.text}
        </span>
      </div>
    </>
  )
}