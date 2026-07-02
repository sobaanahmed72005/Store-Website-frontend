import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import Footer from '../components/Footer'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <Header />
      <CategoryMenu />
      <div className="flex-1 flex flex-col items-center justify-center text-center py-20 px-5">
        <span className="text-[64px] font-bold text-cz-primary leading-none mb-2">404</span>
        <h1 className="text-[20px] font-semibold text-[#212121] mb-2">Page not found</h1>
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