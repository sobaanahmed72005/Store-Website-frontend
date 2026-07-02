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
    },
  },
  {
    files: ['backend/**/*.js', '*.config.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
  },
])
