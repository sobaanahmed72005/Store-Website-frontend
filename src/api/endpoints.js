// Central place for every backend API path. Change a URL here instead of hunting
// through every page/component that calls it. Paths are relative to BASE_URL (which
// already includes /api — see api/client.js), matching every route file under
// Store-Website-backend/routes/.

export const ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    ADMIN_LOGIN: '/auth/admin-login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: (token) => `/auth/verify-email?token=${encodeURIComponent(token)}`,
    RESEND_VERIFICATION: '/auth/resend-verification',
    TWO_FA_STATUS: '/auth/2fa/status',
    TWO_FA_SETUP: '/auth/2fa/setup',
    TWO_FA_CONFIRM: '/auth/2fa/confirm',
    TWO_FA_VERIFY: '/auth/2fa/verify',
    TWO_FA_DISABLE: '/auth/2fa/disable',
  },

  CONTENT: {
    BY_KEY: (key) => `/content/${key}`,
    SITE_SETTINGS: '/content/site-settings',
    ANNOUNCEMENT_BAR: '/content/announcement-bar',
    HERO_BANNERS: '/content/hero-banners',
    CURRENCY_SETTINGS: '/content/currency-settings',
    SHIPPING_SETTINGS: '/content/shipping-settings',
    EMAIL_TEMPLATES: '/content/email-templates',
    PAYMENT_SETTINGS: '/content/payment-settings',
    POLICIES: '/content/policies',
    PRIVACY_POLICY: '/content/privacy-policy',
    ABOUT_US: '/content/about-us',
    FOOTER_BRAND: '/content/footer-brand',
  },

  CURRENCY: {
    RATES: '/currency/rates',
  },

  PRODUCTS: {
    LIST: (qs = '') => `/products${qs}`,
    BRANDS: '/products/brands',
    SUGGEST: (query) => `/products/suggest?q=${encodeURIComponent(query)}`,
    BY_SLUG: (slug) => `/products/${slug}`,
    BY_CATEGORY: (slug) => `/products?category=${slug}`,
    SEARCH: (query) => `/products?search=${encodeURIComponent(query)}`,
  },

  CATEGORIES: {
    LIST: '/categories',
    TREE: '/categories/tree',
    BY_SLUG: (slug) => `/categories/${slug}`,
  },

  CART: {
    BY_USER: (userId) => `/cart/${userId}`,
  },

  WISHLIST: {
    BASE: '/wishlist',
    BY_PRODUCT_ID: (productId) => `/wishlist/${productId}`,
  },

  REVIEWS: {
    LIST: (qs = '') => `/reviews${qs}`,
    ELIGIBILITY: (productId) => `/reviews/eligibility?product_id=${productId}`,
    BASE: '/reviews',
    BY_ID: (id) => `/reviews/${id}`,
  },

  DISCOUNT_CODES: {
    VALIDATE: '/discount-codes/validate',
  },

  NEWSLETTER: {
    SUBSCRIBE: '/newsletter/subscribe',
    STATUS: (email) => `/newsletter/status?email=${encodeURIComponent(email)}`,
    UNSUBSCRIBE: '/newsletter/unsubscribe',
  },

  CONTACT: {
    BASE: '/contact',
  },

  ORDERS: {
    BASE: '/orders',
    PAYMENT_PROOF: '/orders/payment-proof',
    PAYMENT_PROOF_FILE: (filename) => `/orders/payment-proof/${filename}`,
    BY_USER: (userId, qs = '') => `/orders/user/${userId}${qs}`,
  },

  ADMIN: {
    STATS: '/admin/stats',
    UPLOAD: '/admin/upload',
    UPLOAD_VIDEO: '/admin/upload-video',
    AUDIT_LOG: (qs = '') => `/admin/audit-log${qs}`,

    CATEGORIES: {
      BASE: '/admin/categories',
      BY_ID: (id) => `/admin/categories/${id}`,
      ATTRIBUTES: (id) => `/admin/categories/${id}/attributes`,
      ATTRIBUTES_EFFECTIVE: (id) => `/admin/categories/${id}/attributes?effective=1`,
      ATTRIBUTES_MERGED: (id) => `/admin/categories/${id}/attributes?merged=1`,
    },

    ATTRIBUTES: {
      BY_ID: (id) => `/admin/attributes/${id}`,
      OPTIONS: (id) => `/admin/attributes/${id}/options`,
    },

    OPTIONS: {
      BY_ID: (id) => `/admin/options/${id}`,
    },

    PRODUCTS: {
      BASE: (qs = '') => `/admin/products${qs}`,
      BY_ID: (id) => `/admin/products/${id}`,
      BRANDS: '/admin/products/brands',
      BULK_SALE: '/admin/products/bulk-sale',
      REVIEWS: (productId) => `/admin/products/${productId}/reviews`,
    },

    ORDERS: {
      BASE: (qs = '') => `/admin/orders${qs}`,
      NEW: (sinceId) => `/admin/orders/new?since_id=${sinceId}`,
      BY_ID: (id) => `/admin/orders/${id}`,
      STATUS: (id) => `/admin/orders/${id}/status`,
      TRACKING: (id) => `/admin/orders/${id}/tracking`,
      BOOK_COURIER: (id) => `/admin/orders/${id}/book-courier`,
      INVOICE: (id) => `/admin/orders/${id}/invoice`,
    },

    CUSTOMERS: {
      BASE: (qs = '') => `/admin/customers${qs}`,
      BY_ID: (id) => `/admin/customers/${id}`,
    },

    DISCOUNT_CODES: {
      BASE: (qs = '') => `/admin/discount-codes${qs}`,
      BY_ID: (id) => `/admin/discount-codes/${id}`,
    },

    NEWSLETTER: {
      BASE: (qs = '') => `/admin/newsletter${qs}`,
      NEW: (sinceId) => `/admin/newsletter/new?since_id=${sinceId}`,
      BY_ID: (id) => `/admin/newsletter/${id}`,
      SEND: '/admin/newsletter/send',
    },

    PROMO_EMAILS: {
      BASE: '/admin/promo-emails',
      BY_ID: (id) => `/admin/promo-emails/${id}`,
      SEND: (id) => `/admin/promo-emails/${id}/send`,
    },

    REVIEWS: {
      LIST: (qs = '') => `/admin/reviews${qs}`,
      BY_ID: (id) => `/admin/reviews/${id}`,
    },

    REPORTS: {
      REVENUE_TREND: (qs = '') => `/admin/reports/revenue-trend${qs}`,
      REVENUE_SUMMARY: '/admin/reports/revenue-summary',
      TOP_PRODUCTS: (qs = '') => `/admin/reports/top-products${qs}`,
      BOTTOM_PRODUCTS: (qs = '') => `/admin/reports/bottom-products${qs}`,
      SALES_BY_CITY: (qs = '') => `/admin/reports/sales-by-city${qs}`,
      ORDER_STATUS_BREAKDOWN: '/admin/reports/order-status-breakdown',
      PAYMENT_METHOD_BREAKDOWN: '/admin/reports/payment-method-breakdown',
      ORDER_VALUE_HISTOGRAM: '/admin/reports/order-value-histogram',
      SALE_SPLIT: '/admin/reports/sale-split',
    },

    COURIER_SETTINGS: {
      BASE: '/admin/courier-settings',
      TEST: '/admin/courier-settings/test',
    },

    CONTENT: {
      BY_KEY: (key) => `/admin/content/${key}`,
      SITE_SETTINGS: '/admin/content/site-settings',
      ANNOUNCEMENT_BAR: '/admin/content/announcement-bar',
      HERO_BANNERS: '/admin/content/hero-banners',
      CURRENCY_SETTINGS: '/admin/content/currency-settings',
      SHIPPING_SETTINGS: '/admin/content/shipping-settings',
      EMAIL_TEMPLATES: '/admin/content/email-templates',
      FOOTER_BRAND: '/admin/content/footer-brand',
      PAYMENT_SETTINGS: '/admin/content/payment-settings',
      POLICIES: '/admin/content/policies',
      PRIVACY_POLICY: '/admin/content/privacy-policy',
      ABOUT_US: '/admin/content/about-us',
    },
  },
}
