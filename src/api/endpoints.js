// Central place for every backend API path. Change a URL here instead of hunting
// through every page/component that calls it.

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: (token) => `/auth/verify-email?token=${encodeURIComponent(token)}`,
    RESEND_VERIFICATION: '/auth/resend-verification',
    TWO_FA_VERIFY: '/auth/2fa/verify',
    TWO_FA_STATUS: '/auth/2fa/status',
    TWO_FA_SETUP: '/auth/2fa/setup',
    TWO_FA_CONFIRM: '/auth/2fa/confirm',
    TWO_FA_DISABLE: '/auth/2fa/disable',
  },

  CONTENT: {
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
    LIST: '/products',
    FEATURED: '/products?featured=1',
    NEW_ARRIVALS: '/products?new_arrival=1',
    ON_SALE: '/products?on_sale=1',
    BY_SLUG: (slug) => `/products/${slug}`,
    BY_CATEGORY: (slug) => `/products?category=${slug}`,
    SEARCH: (query) => `/products?search=${encodeURIComponent(query)}`,
  },

  CATEGORIES: {
    BY_SLUG: (slug) => `/categories/${slug}`,
  },

  CART: {
    BY_USER: (userId) => `/cart/${userId}`,
  },

  WISHLIST: {
    BASE: '/wishlist',
    BY_ID: (id) => `/wishlist/${id}`,
  },

  REVIEWS: {
    BASE: '/reviews',
  },

  DISCOUNT_CODES: {
    VALIDATE: '/discount-codes/validate',
  },

  NEWSLETTER: {
    SUBSCRIBE: '/newsletter/subscribe',
    UNSUBSCRIBE: '/newsletter/unsubscribe',
  },

  CONTACT: {
    BASE: '/contact',
  },

  ORDERS: {
    BASE: '/orders',
    PAYMENT_PROOF: '/orders/payment-proof',
  },

  ADMIN: {
    UPLOAD: '/admin/upload',

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
      BASE: '/admin/products',
      BY_ID: (id) => `/admin/products/${id}`,
      BULK_SALE: '/admin/products/bulk-sale',
      REVIEWS: (productId) => `/admin/products/${productId}/reviews`,
    },

    ORDERS: {
      BASE: '/admin/orders',
      NEW_SINCE: (sinceId) => `/admin/orders/new?since_id=${sinceId}`,
      BY_ID: (id) => `/admin/orders/${id}`,
      STATUS: (id) => `/admin/orders/${id}/status`,
      BOOK_COURIER: (id) => `/admin/orders/${id}/book-courier`,
      TRACKING: (id) => `/admin/orders/${id}/tracking`,
      INVOICE: (id) => `/admin/orders/${id}/invoice`,
    },

    CUSTOMERS: {
      BASE: '/admin/customers',
      BY_ID: (id) => `/admin/customers/${id}`,
    },

    DISCOUNT_CODES: {
      BASE: '/admin/discount-codes',
      BY_ID: (id) => `/admin/discount-codes/${id}`,
    },

    NEWSLETTER: {
      BASE: '/admin/newsletter',
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
      REVENUE_SUMMARY: '/admin/reports/revenue-summary',
      BOTTOM_PRODUCTS: (limit) => `/admin/reports/bottom-products?limit=${limit}`,
      SALES_BY_CITY: (limit) => `/admin/reports/sales-by-city?limit=${limit}`,
      ORDER_STATUS_BREAKDOWN: '/admin/reports/order-status-breakdown',
      PAYMENT_METHOD_BREAKDOWN: '/admin/reports/payment-method-breakdown',
      ORDER_VALUE_HISTOGRAM: '/admin/reports/order-value-histogram',
      SALE_SPLIT: '/admin/reports/sale-split',
      REVENUE_TREND: (period) => `/admin/reports/revenue-trend?period=${period}`,
      TOP_PRODUCTS: (limit, by) => `/admin/reports/top-products?limit=${limit}&by=${by}`,
    },

    COURIER_SETTINGS: {
      BASE: '/admin/courier-settings',
      TEST: '/admin/courier-settings/test',
    },

    CONTENT: {
      ABOUT_US: '/admin/content/about-us',
      ANNOUNCEMENT_BAR: '/admin/content/announcement-bar',
      HERO_BANNERS: '/admin/content/hero-banners',
      CURRENCY_SETTINGS: '/admin/content/currency-settings',
      SHIPPING_SETTINGS: '/admin/content/shipping-settings',
      EMAIL_TEMPLATES: '/admin/content/email-templates',
      FOOTER_BRAND: '/admin/content/footer-brand',
      PAYMENT_SETTINGS: '/admin/content/payment-settings',
      POLICIES: '/admin/content/policies',
      PRIVACY_POLICY: '/admin/content/privacy-policy',
      SITE_SETTINGS: '/admin/content/site-settings',
    },
  },
}
