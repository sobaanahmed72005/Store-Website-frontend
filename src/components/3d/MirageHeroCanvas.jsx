import { useEffect, useState, useRef } from 'react'

const TOTAL_FRAMES = 90

// Helper to format frame path: /frames/frame_001.jpg
const getFramePath = (index) => {
  const padded = String(index).padStart(3, '0')
  return `/frames/frame_${padded}.jpg`
}

export default function MirageHeroCanvas({ progress = 0 }) {
  const canvasRef = useRef(null)
  const [loadedCount, setLoadedCount] = useState(0)
  const imagesRef = useRef([])
  const progressRef = useRef(progress)

  // Interactive 3D mouse parallax states
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const targetMouseRef = useRef({ x: 0, y: 0 })
  const currentMouseRef = useRef({ x: 0, y: 0 })

  const [hud, setHud] = useState({ frameIndex: 1, totalFrames: TOTAL_FRAMES, progress: 0 })

  useEffect(() => {
    progressRef.current = progress
  }, [progress])

  // Mouse move listener for interactive 3D tilt
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window
      const normX = (e.clientX / innerWidth - 0.5) * 2
      const normY = (e.clientY / innerHeight - 0.5) * 2
      targetMouseRef.current = { x: normX, y: normY }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Preload all 90 frames into memory for 0ms instant rendering
  useEffect(() => {
    let loaded = 0
    const imgs = []

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image()
      img.src = getFramePath(i)
      img.onload = () => {
        loaded++
        setLoadedCount(loaded)
      }
      imgs.push(img)
    }

    imagesRef.current = imgs
  }, [])

  // High-Performance 60 FPS Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId
    let currentFrameIndex = 0

    const render = () => {
      // 1. Interactive 3D Mouse Parallax (0.08 lerp for weightless tilt)
      currentMouseRef.current.x += (targetMouseRef.current.x - currentMouseRef.current.x) * 0.08
      currentMouseRef.current.y += (targetMouseRef.current.y - currentMouseRef.current.y) * 0.08
      setMousePos({ x: currentMouseRef.current.x, y: currentMouseRef.current.y })

      // Resize canvas to match display size
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth || window.innerWidth
        canvas.height = canvas.clientHeight || window.innerHeight
      }

      // 2. Real-Time Instant Scroll Tracking
      const currentProgress = progressRef.current
      // Map 0%..80% scroll progress across full 90-frame sequence
      const normalizedProgress = Math.min(Math.max(currentProgress / 0.80, 0), 1)
      const targetFrameIndex = Math.min(
        Math.floor(normalizedProgress * (TOTAL_FRAMES - 1)),
        TOTAL_FRAMES - 1
      )

      // Smooth liquid interpolation between frames (0.25 lerp for instantaneous motion)
      currentFrameIndex += (targetFrameIndex - currentFrameIndex) * 0.25
      const frameToDraw = Math.min(Math.max(Math.round(currentFrameIndex), 0), TOTAL_FRAMES - 1)

      const img = imagesRef.current[frameToDraw]
      if (img && img.complete && img.naturalWidth > 0) {
        // Cover-fit image on canvas
        const cw = canvas.width
        const ch = canvas.height
        const iw = img.naturalWidth
        const ih = img.naturalHeight

        const scaleRatio = Math.max(cw / iw, ch / ih)
        const nw = iw * scaleRatio
        const nh = ih * scaleRatio
        const nx = (cw - nw) / 2
        const ny = (ch - nh) / 2

        ctx.clearRect(0, 0, cw, ch)
        ctx.drawImage(img, nx, ny, nw, nh)

        setHud({
          frameIndex: frameToDraw + 1,
          totalFrames: TOTAL_FRAMES,
          progress: Number((currentProgress * 100).toFixed(0)),
        })
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  // Interactive 3D Perspective Transformations
  const scale = 1 + progress * 0.096
  const tiltX = -mousePos.y * 6.5 // Pitch tilt up/down
  const tiltY = mousePos.x * 6.5  // Yaw tilt left/right
  const panX = mousePos.x * 15     // Horizontal pan offset
  const panY = mousePos.y * 15     // Vertical pan offset

  const isFullyLoaded = loadedCount >= TOTAL_FRAMES * 0.2 // Show as soon as 20% loaded

  return (
    <div className="absolute inset-0 z-0 overflow-hidden select-none bg-[#03070A] [perspective:1000px]">
      {/* 3D Tilting Canvas Layer */}
      <div
        className="w-full h-full pointer-events-none will-change-transform transition-transform duration-75 ease-out"
        style={{
          transform: `scale(${scale}) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translate3d(${panX}px, ${panY}px, 0px)`,
        }}
      >
        <canvas
          ref={canvasRef}
          className={`w-full h-full object-cover transition-opacity duration-700 ${
            isFullyLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {/* Atmospheric Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#03070A]/50 via-transparent to-[#03070A] pointer-events-none" />
      <div className="absolute inset-0 bg-radial from-transparent via-[#03070A]/20 to-[#03070A]/80 pointer-events-none" />
    </div>
  )
}
