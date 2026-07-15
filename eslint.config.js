import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // This codebase's data-fetching idiom is `useEffect(() => { setLoading(true); fetch... }, [])`
      // on mount, used consistently across every page/admin component. The rule's cascading-render
      // concern doesn't apply to a one-shot mount fetch, so it's downgraded rather than rewriting
      // every data-fetching component to work around a lint preference.
      'react-hooks/set-state-in-effect': 'off',
      // Several places destructure a field out of an object specifically to exclude it from a
      // `...rest` spread (e.g. SiteLink.jsx pulling `onClick` out before spreading onto a plain
      // `<span>`, or AdminBanners.jsx stripping a client-only `_key` before saving) — the
      // destructured name is deliberately unused, that's the whole point, not a bug.
      'no-unused-vars': ['error', { ignoreRestSiblings: true }],
    },
  },
  {
    files: ['*.config.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['e2e/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
  },
])
