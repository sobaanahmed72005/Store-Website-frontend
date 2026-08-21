import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function Product3DCanvas({ title = '', className = 'w-full h-full aspect-square' }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth || 250
    const height = container.clientHeight || 250

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf8fafc)

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 1.5, 6.5)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 1.4)
    scene.add(ambLight)

    const cyanLight = new THREE.DirectionalLight(0x0ea5e9, 2.8)
    cyanLight.position.set(5, 8, 5)
    scene.add(cyanLight)

    const accentLight = new THREE.DirectionalLight(0x38bdf8, 1.5)
    accentLight.position.set(-5, -4, -5)
    scene.add(accentLight)

    const productGroup = new THREE.Group()

    const titleLower = title.toLowerCase()

    if (titleLower.includes('headphone') || titleLower.includes('headset') || titleLower.includes('sony') || titleLower.includes('airpods')) {
      // --- 3D Headphones Mesh ---
      const headbandGeo = new THREE.TorusGeometry(1.6, 0.12, 16, 50, Math.PI)
      const matDark = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 })
      const headbandMesh = new THREE.Mesh(headbandGeo, matDark)
      headbandMesh.rotation.z = Math.PI
      headbandMesh.position.y = 0.5
      productGroup.add(headbandMesh)

      // Ear Cups
      const cupGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.4, 32)
      const cupMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, metalness: 0.9, roughness: 0.1 })

      const leftCup = new THREE.Mesh(cupGeo, cupMat)
      leftCup.rotation.z = Math.PI / 2
      leftCup.position.set(-1.6, -0.5, 0)
      productGroup.add(leftCup)

      const rightCup = new THREE.Mesh(cupGeo, cupMat)
      rightCup.rotation.z = Math.PI / 2
      rightCup.position.set(1.6, -0.5, 0)
      productGroup.add(rightCup)

    } else if (titleLower.includes('monitor') || titleLower.includes('odyssey') || titleLower.includes('display') || titleLower.includes('tv') || titleLower.includes('samsung')) {
      // --- 3D Curved Ultrawide Monitor Mesh ---
      const screenGeo = new THREE.BoxGeometry(3.8, 1.8, 0.1)
      const screenMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.1 })
      const screenMesh = new THREE.Mesh(screenGeo, screenMat)
      screenMesh.position.y = 0.6
      productGroup.add(screenMesh)

      // Screen Display Glow
      const displayGeo = new THREE.PlaneGeometry(3.6, 1.6)
      const displayMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, wireframe: true })
      const displayMesh = new THREE.Mesh(displayGeo, displayMat)
      displayMesh.position.set(0, 0.6, 0.06)
      productGroup.add(displayMesh)

      // Stand Base & Pole
      const standPoleGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 16)
      const standMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.95, roughness: 0.1 })
      const standPole = new THREE.Mesh(standPoleGeo, standMat)
      standPole.position.set(0, -0.3, -0.1)
      productGroup.add(standPole)

      const standBaseGeo = new THREE.BoxGeometry(1.4, 0.06, 1.0)
      const standBase = new THREE.Mesh(standBaseGeo, standMat)
      standBase.position.set(0, -0.9, 0.2)
      productGroup.add(standBase)

    } else {
      // --- Default 3D Tech Hardware / Laptop Mesh ---
      const bodyGeo = new THREE.BoxGeometry(3.0, 0.2, 2.0)
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 })
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)
      productGroup.add(bodyMesh)

      const screenLidGeo = new THREE.BoxGeometry(3.0, 1.9, 0.08)
      const screenLidMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.95, roughness: 0.15 })
      const screenLidMesh = new THREE.Mesh(screenLidGeo, screenLidMat)
      screenLidMesh.position.set(0, 0.95, -0.95)
      productGroup.add(screenLidMesh)

      const screenDispGeo = new THREE.PlaneGeometry(2.8, 1.7)
      const screenDispMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, wireframe: true })
      const screenDispMesh = new THREE.Mesh(screenDispGeo, screenDispMat)
      screenDispMesh.position.set(0, 0.95, -0.9)
      productGroup.add(screenDispMesh)
    }

    scene.add(productGroup)

    let is3DDrag = false
    let prevMouseX = 0
    let prevMouseY = 0

    const onMouseDown3D = (e) => {
      is3DDrag = true
      prevMouseX = e.clientX
      prevMouseY = e.clientY
    }

    const onMouseMove3D = (e) => {
      if (!is3DDrag) return
      const deltaX = e.clientX - prevMouseX
      const deltaY = e.clientY - prevMouseY

      productGroup.rotation.y += deltaX * 0.012
      productGroup.rotation.x += deltaY * 0.012

      prevMouseX = e.clientX
      prevMouseY = e.clientY
    }

    const onMouseUp3D = () => {
      is3DDrag = false
    }

    const domElem = renderer.domElement
    domElem.addEventListener('mousedown', onMouseDown3D)
    window.addEventListener('mousemove', onMouseMove3D)
    window.addEventListener('mouseup', onMouseUp3D)

    let reqId
    const animate3D = () => {
      if (!is3DDrag) {
        productGroup.rotation.y += 0.007
      }
      renderer.render(scene, camera)
      reqId = requestAnimationFrame(animate3D)
    }
    animate3D()

    return () => {
      cancelAnimationFrame(reqId)
      domElem.removeEventListener('mousedown', onMouseDown3D)
      window.removeEventListener('mousemove', onMouseMove3D)
      window.removeEventListener('mouseup', onMouseUp3D)
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [title])

  return (
    <div className={`group relative rounded-xl overflow-hidden shadow-inner border border-slate-200 select-none bg-slate-50 ${className}`}>
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      {/* Subtle, non-intrusive badge label in bottom right corner */}
      <div className="absolute bottom-1 right-1 bg-slate-900/70 text-cyan-300 text-[9px] font-bold px-1.5 py-0.5 rounded pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
        3D
      </div>
    </div>
  )
}
