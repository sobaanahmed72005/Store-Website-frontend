const HOSTNAMES = new Set([
  'czone.com.pk',
  'www.czone.com.pk',
  typeof window !== 'undefined' ? window.location.hostname : 'localhost',
])

const INTERNAL_ROUTES = {
  '/': '/',
  '/products': '/products',
  '/signin': '/signin',
  '/signup': '/signup',
  '/forgotpassword': '/signin',
  '/cart': '/cart',
  '/checkout': '/checkout',
  '/account': '/account',
  '/orderlist': '/account',
  '/about-us': '/about-us',
  '/contact': '/contact',
  '/return-exchange': '/return-exchange',
  '/new-arrivals': '/products',
  '/monitors': '/category/monitors',
  '/lian-li': '/category/lian-li',
  '/laptops-pakistan-ppt.74.aspx': '/laptops',
  '/laptops-used-pakistan-ppt.715.aspx': '/category/used-laptops',
  '/casing-pakistan-ppt.168.aspx': '/category/casing',
  '/cooling-solutions-pakistan-ppt.141.aspx': '/category/cooling-solutions',
  '/processors-pakistan-ppt.85.aspx': '/category/processors',
  '/tablet-pc-pakistan-ppt.278.aspx': '/category/tablets',
  '/cameras-drones-pakistan-ppt.136.aspx': '/category/cameras-drones',
  '/headsets-headphones-mic-pakistan-ppt.175.aspx': '/category/headsets-microphones',
  '/gaming-furniture-pakistan-ppt.773.aspx': '/category/gaming-furniture',
  '/gaming-consoles-pakistan-ppt.506.aspx': '/category/gaming-consoles',
  '/smart-watches-pakistan-ppt.403.aspx': '/category/smart-wearables',
  '/keyboard-pakistan-ppt.162.aspx': '/category/keyboard',
  '/graphic-cards-pakistan-ppt.154.aspx': '/category/gpu',
  '/lcd-led-monitors-pakistan-ppt.108.aspx': '/category/monitors',
  '/printers-pakistan-ppt.90.aspx': '/category/printers',
  '/hard-drives-pakistan-ppt.93.aspx': '/category/hdd',
  '/solid-state-drives-ssd-pakistan-ppt.263.aspx': '/category/ssd',
  '/network-products-pakistan-ppt.192.aspx': '/category/network',
  '/memory-module-ram-pakistan-ppt.127.aspx': '/category/ram',
  '/power-supply-pakistan-ppt.183.aspx': '/category/psu',
  '/peripherals-misc-pakistan-ppt.244.aspx': '/category/peripherals',
  // Standalone collection/brand pages that don't fit a prefix rule below
  '/desktop-computers-pakistan-ppt.227.aspx': '/category/desktop-computers',
  '/laptop-accessories-pakistan-ppt.202.aspx': '/category/laptop-accessories',
  '/cartridges-toners-pakistan-ppt.150.aspx': '/category/cartridges-toners',
  '/gaming-products-pakistan-ppt.146.aspx': '/category/gaming-products',
  '/graphic-tablets-pakistan-ppt.165.aspx': '/category/graphic-tablets',
  '/memory-cards-pakistan-ppt.143.aspx': '/category/memory-cards',
  '/motherboards-pakistan-ppt.157.aspx': '/category/motherboards',
  '/mouse-pakistan-ppt.95.aspx': '/category/mouse',
  '/point-of-sale-pos-pakistan-ppt.762.aspx': '/category/pos',
  '/projectors-pakistan-ppt.252.aspx': '/category/projectors',
  '/scanner-pakistan-ppt.124.aspx': '/category/scanner',
  '/softwares-pakistan-ppt.103.aspx': '/category/softwares',
  '/speakers-pakistan-ppt.97.aspx': '/category/speakers',
  '/ups-pakistan-ppt.132.aspx': '/category/ups',
  '/tv-devices-streaming-media-players-pakistan-ppt.180.aspx': '/category/tv-devices',
  '/usb-flash-drives-pakistan-ppt.82.aspx': '/category/usb-flash-drives',
  '/uncategorized-2': '/category/uncategorized',
  '/cable-management': '/category/peripherals',
  '/chargers': '/category/peripherals',
  '/usb-hubs-docking-stations': '/category/peripherals',
  '/enterprise-networking': '/category/network',
  '/network-media-accessories': '/category/network',
  '/wireless-networking': '/category/network',
  '/m-2-nvme-ssds-pakistan': '/category/ssd',
  '/sata-ssds-pakistan': '/category/ssd',
  '/thermaltake-power-supplies': '/category/psu',
  '/gamemax-2': '/category/casing',
  '/koorui': '/category/monitors',
}

// Brand/sub-category variants of an already-mapped top-level category
// (e.g. "/laptops-dell-laptops-pakistan-pt.75.aspx") roll up to the same page.
const PREFIX_ROUTES = [
  ['/laptops-', '/laptops'],
  ['/graphic-cards-', '/category/gpu'],
  ['/lcd-led-monitors-', '/category/monitors'],
  ['/hard-drives-', '/category/hdd'],
  ['/memory-module-ram-', '/category/ram'],
  ['/power-supply-', '/category/psu'],
  ['/printers-', '/category/printers'],
  ['/peripherals-misc-', '/category/peripherals'],
  ['/network-products-', '/category/network'],
  ['/solid-state-drives-ssd-', '/category/ssd'],
]

function deriveCategorySlug(pathname) {
  const slug = pathname
    .replace(/^\//, '')
    .replace(/-pakistan-ppt\.\d+\.aspx$/, '')
    .replace(/-pakistan-pt\.\d+\.aspx$/, '')
    .replace(/\.aspx$/, '')
  return `/category/${slug}`
}

const ALREADY_INTERNAL_PREFIXES = ['/category/', '/product/']

export function resolveInternalPath(href) {
  if (!href) return null
  let url
  try {
    const base = typeof window !== 'undefined' ? window.location.href : 'http://localhost:5173/'
    url = new URL(href, base)
  } catch {
    return null
  }
  if (!HOSTNAMES.has(url.hostname)) return null

  // Already a well-formed internal route (e.g. admin typed "/category/laptops" directly) — use as-is.
  if (ALREADY_INTERNAL_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) return url.pathname

  if (INTERNAL_ROUTES[url.pathname]) return INTERNAL_ROUTES[url.pathname]

  const prefixMatch = PREFIX_ROUTES.find(([prefix]) => url.pathname.startsWith(prefix))
  if (prefixMatch) return prefixMatch[1]

  return deriveCategorySlug(url.pathname)
}
