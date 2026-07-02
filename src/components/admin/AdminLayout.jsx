import { useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Logo from '../Logo'
import { HamburgerIcon, CloseIcon } from '../icons'
import { ADMIN_PATH } from '../../config/adminPath'
import OrderNotificationBell from './OrderNotificationBell'

const navItems = [
  { to: ADMIN_PATH, label: 'Dashboard', end: true },
  { to: `${ADMIN_PATH}/profile`, label: 'Profile' },
  { to: `${ADMIN_PATH}/currency`, label: 'Currency' },
  { to: `${ADMIN_PATH}/shipping`, label: 'Shipping' },
  { to: `${ADMIN_PATH}/courier`, label: 'Courier' },
  { to: `${ADMIN_PATH}/payments`, label: 'Payment Methods' },
  { to: `${ADMIN_PATH}/discount-codes`, label: 'Discount Codes' },
  { to: `${ADMIN_PATH}/announcement`, label: 'Announcement Bar' },
  { to: `${ADMIN_PATH}/banners`, label: 'Hero Banners' },
  { to: `${ADMIN_PATH}/products`, label: 'Products' },
  { to: `${ADMIN_PATH}/bulk-sale`, label: 'Bulk Sale' },
  { to: `${ADMIN_PATH}/categories`, label: 'Categories' },
  { to: `${ADMIN_PATH}/orders`, label: 'Orders' },
  { to: `${ADMIN_PATH}/customers`, label: 'Customers' },
  { to: `${ADMIN_PATH}/reports`, label: 'Reports' },
  { to: `${ADMIN_PATH}/reviews`, label: 'Reviews' },
  { to: `${ADMIN_PATH}/email-templates`, label: 'Email Templates' },
  { to: `${ADMIN_PATH}/about-us`, label: 'About Us Page' },
  { to: `${ADMIN_PATH}/footer`, label: 'Footer / Store Info' },
  { to: `${ADMIN_PATH}/policies`, label: 'Policies Page' },
  { to: `${ADMIN_PATH}/privacy-policy`, label: 'Privacy Policy Page' },
  { to: `${ADMIN_PATH}/newsletter`, label: 'Newsletter' },
  { to: `${ADMIN_PATH}/promo-emails`, label: 'Promo Emails' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-cz-gold-light">
      <div
        aria-hidden="true"
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[220px] shrink-0 overflow-y-auto bg-cz-topbar text-white flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <Logo variant="light" textClassName="text-lg" />
            <div className="text-[12px] text-white/60 mt-0.5">Admin Panel</div>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
            className="text-white/70 hover:text-white lg:hidden"
          >
            <CloseIcon size={18} />
          </button>
        </div>
        <nav className="flex flex-col py-4 gap-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `rounded-md px-3 py-2.5 text-[14px] font-medium transition-colors ${
                  isActive ? 'bg-cz-primary text-white' : 'text-white/80 hover:bg-white/10'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto px-3 py-4 border-t border-white/10 flex flex-col gap-2">
          <Link to="/" className="text-[13px] text-white/70 hover:text-white px-3">
            ← View Store
          </Link>
          <button
            type="button"
            onClick={logout}
            className="text-left text-[13px] text-white/70 hover:text-white px-3"
          >
            Logout ({user?.name})
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center gap-3 bg-cz-topbar text-white px-4 py-3 lg:hidden">
          <button type="button" aria-label="Open menu" onClick={() => setSidebarOpen(true)}>
            <HamburgerIcon size={24} />
          </button>
          <Logo variant="light" textClassName="text-base" />
        </div>

        <div className="flex items-center justify-end bg-white border-b border-[#dedede] px-4 py-2">
          <OrderNotificationBell />
        </div>

        <main className="flex-1 min-w-0 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
