import { Component } from 'react'

const CHUNK_RELOAD_FLAG = 'cz_chunk_reload_attempted'

// Catches render-time errors anywhere in its subtree so one broken component doesn't take down
// the whole app to a blank white screen. Deliberately has no dependency on Navbar/Footer/context
// providers etc. — the error could be coming from any of those, so the fallback has to stand on
// its own with plain markup.
export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Unhandled render error:', error, info.componentStack)
  }

  componentDidMount() {
    // Once routes are code-split (lazy-loaded), a tab left open across a deploy will try to fetch
    // a chunk whose filename hash no longer exists on the server — that's not a bug in the code,
    // just a stale tab, and the fix is to get it the current build. Vite dispatches this window
    // event for exactly that case, so reload once rather than showing the generic fallback. The
    // sessionStorage guard stops a reload loop if the deploy is actually broken (missing asset,
    // bad CDN, etc.) — after one attempt we fall through to the normal error UI instead.
    window.addEventListener('vite:preloadError', this.handleChunkLoadError)
  }

  componentWillUnmount() {
    window.removeEventListener('vite:preloadError', this.handleChunkLoadError)
  }

  handleChunkLoadError = () => {
    if (sessionStorage.getItem(CHUNK_RELOAD_FLAG)) return
    sessionStorage.setItem(CHUNK_RELOAD_FLAG, '1')
    window.location.reload()
  }

  handleRetry = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen bg-cz-page flex flex-col items-center justify-center text-center py-20 px-5">
        <h1 className="text-[20px] font-semibold text-[#212121] mb-2">Something went wrong</h1>
        <p className="text-[14px] text-[#4b4b4b] mb-6 max-w-[420px]">
          Sorry about that — you can try again, or reload the page if it keeps happening.
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={this.handleRetry}
            className="rounded-full border border-cz-primary text-cz-primary hover:bg-cz-primary hover:text-white text-[14px] font-medium px-8 py-3 transition-colors"
          >
            Try Again
          </button>
          <a
            href="/"
            className="rounded-full bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-8 py-3 transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    )
  }
}
