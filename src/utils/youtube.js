// Matches watch/shorts/embed/share URL shapes and pulls out the 11-char video id — mirrors the
// backend's own extraction in productsController.js, which is what actually decides what gets
// stored (always a normalized https://www.youtube.com/watch?v=<id>, never the raw admin input).
const YOUTUBE_URL_PATTERN = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/

export function extractYoutubeId(url) {
  if (!url) return null
  const match = String(url).match(YOUTUBE_URL_PATTERN)
  return match ? match[1] : null
}

export function getYoutubeThumbnail(videoId) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

export function getYoutubeWatchUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`
}
