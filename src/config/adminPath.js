// The admin login/dashboard is served from this path instead of the guessable
// "/admin" so casual visitors and automated scanners don't stumble onto the
// login form. This only obscures the URL — it is NOT the access control.
// Real security is the backend JWT auth + login rate limiting, which apply
// regardless of what this path is set to. Override via VITE_ADMIN_PATH in
// .env if you want your own secret path (must start with "/", no trailing slash).
export const ADMIN_PATH = import.meta.env.VITE_ADMIN_PATH || '/mgmt-8f2k1c'
