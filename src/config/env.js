// Central place for every environment variable the frontend reads. Change a
// default or add a new var here — nothing else should read import.meta.env directly.

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// The admin login/dashboard is served from this path instead of the guessable
// "/admin" so casual visitors and automated scanners don't stumble onto the
// login form. This only obscures the URL — it is NOT the access control.
// Real security is the backend JWT auth + login rate limiting, which apply
// regardless of what this path is set to. Override via VITE_ADMIN_PATH in
// .env if you want your own secret path (must start with "/", no trailing slash).
export const ADMIN_PATH = import.meta.env.VITE_ADMIN_PATH || '/mgmt-8f2k1c'
