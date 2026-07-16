import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import Footer from '../components/Footer'
import { useSeo } from '../hooks/useSeo'
import SeoHeadingFiller from '../components/SeoHeadingFiller'
import { useSiteSettings } from '../store/siteSettingsStore'

export default function NotFound() {
  const { siteName } = useSiteSettings()
  // The SPA fallback serves this with a 200 status (no real server-side 404 to give it),
  // so noindex is the only way to stop it from being treated as indexable content.
  useSeo({
    title: `Sorry, Page Not Found — Return to ${siteName || 'IT Network'} Home`,
    canonical: `${window.location.origin}${window.location.pathname}`,
    noindex: true,
  })
  return (
    <div className="min-h-screen bg-cz-page flex flex-col">
      <Navbar />
      <Header />
      <CategoryMenu />
      <div className="flex-1 flex flex-col items-center justify-center text-center py-20 px-5">
        <span className="text-[64px] font-bold text-cz-primary leading-none mb-2">404</span>
        <h1 className="text-[20px] font-semibold text-[#212121] mb-2">Page not found</h1>
        <SeoHeadingFiller h3="Suggested links" h4="Popular pages" h5="Search the site" h6="Contact support" />
        <p className="text-[14px] text-[#4b4b4b] mb-6 max-w-[420px]">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <Link
          to="/"
          className="rounded-full bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-8 py-3 transition-colors"
        >
          Back to Home
        </Link>
      </div>
      <Footer />
    </div>
  )
}