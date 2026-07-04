import { Routes, Route, Navigate } from 'react-router-dom'
import { useSiteSettings } from './context/SiteSettingsContext'
import { ADMIN_PATH } from './config/adminPath'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Product from './pages/Product'
import Products from './pages/Products'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import CategoryListing from './pages/CategoryListing'
import AboutUs from './pages/AboutUs'
import Contact from './pages/Contact'
import Policies from './pages/Policies'
import PrivacyPolicy from './pages/PrivacyPolicy'
import NotFound from './pages/NotFound'
import CheckoutSuccess from './pages/CheckoutSuccess'
import CheckoutCancelled from './pages/CheckoutCancelled'
import SearchResults from './pages/SearchResults'
import Account from './pages/Account'
import VerifyEmail from './pages/VerifyEmail'
import Unsubscribe from './pages/Unsubscribe'
import Shop from './pages/Shop'
import AdminRoute from './components/admin/AdminRoute'
import AdminLayout from './components/admin/AdminLayout'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminReports from './pages/admin/AdminReports'
import AdminProducts from './pages/admin/AdminProducts'
import AdminProductForm from './pages/admin/AdminProductForm'
import AdminCategories from './pages/admin/AdminCategories'
import AdminCategoryAttributes from './pages/admin/AdminCategoryAttributes'
import AdminOrders from './pages/admin/AdminOrders'
import AdminCustomers from './pages/admin/AdminCustomers'
import AdminReviews from './pages/admin/AdminReviews'
import AdminAboutUs from './pages/admin/AdminAboutUs'
import AdminFooter from './pages/admin/AdminFooter'
import AdminProfile from './pages/admin/AdminProfile'
import AdminCurrency from './pages/admin/AdminCurrency'
import AdminShipping from './pages/admin/AdminShipping'
import AdminCourier from './pages/admin/AdminCourier'
import AdminPayments from './pages/admin/AdminPayments'
import AdminDiscountCodes from './pages/admin/AdminDiscountCodes'
import AdminPolicies from './pages/admin/AdminPolicies'
import AdminPrivacyPolicy from './pages/admin/AdminPrivacyPolicy'
import AdminNewsletter from './pages/admin/AdminNewsletter'
import AdminBulkSale from './pages/admin/AdminBulkSale'
import AdminBanners from './pages/admin/AdminBanners'
import AdminAnnouncement from './pages/admin/AdminAnnouncement'
import AdminEmailTemplates from './pages/admin/AdminEmailTemplates'
import AdminPromotionalEmails from './pages/admin/AdminPromotionalEmails'
import AdminAuditLog from './pages/admin/AdminAuditLog'

function StoreNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-5">
      <h1 className="text-[24px] font-semibold text-[#212121] mb-2">Store not found</h1>
      <p className="text-[14px] text-[#4b4b4b] max-w-[420px]">
        There's no store at this address. Double-check the link.
      </p>
    </div>
  )
}

function AdminNotFound() {
  return (
    <div className="p-8 flex flex-col items-center text-center py-20">
      <h1 className="text-[20px] font-semibold text-[#212121] mb-2">Page not found</h1>
      <p className="text-[14px] text-[#4b4b4b]">This admin page doesn't exist.</p>
    </div>
  )
}

function App() {
  const { storeStatus } = useSiteSettings()

  if (storeStatus === 'not-found') {
    return <StoreNotFound />
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/product/:slug" element={<Product />} />
      <Route path="/laptops" element={<Navigate to="/category/laptops" replace />} />
      <Route path="/products" element={<Products />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/checkout/success" element={<CheckoutSuccess />} />
      <Route path="/checkout/cancelled" element={<CheckoutCancelled />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/category/:slug" element={<CategoryListing />} />
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/return-exchange" element={<Policies />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/account" element={<Account />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/unsubscribe" element={<Unsubscribe />} />

      <Route path={`${ADMIN_PATH}/login`} element={<AdminLogin />} />
      <Route
        path={ADMIN_PATH}
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="currency" element={<AdminCurrency />} />
        <Route path="shipping" element={<AdminShipping />} />
        <Route path="courier" element={<AdminCourier />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="discount-codes" element={<AdminDiscountCodes />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminProductForm />} />
        <Route path="products/:id/edit" element={<AdminProductForm />} />
        <Route path="announcement" element={<AdminAnnouncement />} />
        <Route path="banners" element={<AdminBanners />} />
        <Route path="bulk-sale" element={<AdminBulkSale />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="categories/:id/filters" element={<AdminCategoryAttributes />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="email-templates" element={<AdminEmailTemplates />} />
        <Route path="about-us" element={<AdminAboutUs />} />
        <Route path="footer" element={<AdminFooter />} />
        <Route path="policies" element={<AdminPolicies />} />
        <Route path="privacy-policy" element={<AdminPrivacyPolicy />} />
        <Route path="newsletter" element={<AdminNewsletter />} />
        <Route path="promo-emails" element={<AdminPromotionalEmails />} />
        <Route path="audit-log" element={<AdminAuditLog />} />
        <Route path="*" element={<AdminNotFound />} />
      </Route>
      <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
