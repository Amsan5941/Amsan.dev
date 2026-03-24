import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  maxOpacity: number
  pulse: number
  pulseSpeed: number
  tint: string | null // null = white, otherwise a color
}

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let rafId: number

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize, { passive: true })

    const TINTS = ['#1e3a8a', '#f59e0b', '#1e3a8a', null, null]

    // Layer 1: small/dim background stars
    const layer1: Star[] = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 0.8 + 0.3,
      speedX: (Math.random() - 0.5) * 0.06,
      speedY: Math.random() * 0.08 + 0.02,
      opacity: 0,
      maxOpacity: Math.random() * 0.2 + 0.2,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.008 + 0.003,
      tint: null,
    }))

    // Layer 2: medium stars
    const layer2: Star[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.2 + 0.6,
      speedX: (Math.random() - 0.5) * 0.1,
      speedY: Math.random() * 0.12 + 0.04,
      opacity: 0,
      maxOpacity: Math.random() * 0.3 + 0.4,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.012 + 0.005,
      tint: null,
    }))

    // Layer 3: large/bright + some tinted
    const layer3: Star[] = Array.from({ length: 15 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.8 + 1.0,
      speedX: (Math.random() - 0.5) * 0.15,
      speedY: Math.random() * 0.15 + 0.05,
      opacity: 0,
      maxOpacity: Math.random() * 0.3 + 0.7,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.015 + 0.008,
      tint: TINTS[Math.floor(Math.random() * TINTS.length)],
    }))

    const allStars = [...layer1, ...layer2, ...layer3]

    const render = () => {
      const isLightMode = document.body.classList.contains('light')
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const s of allStars) {
        s.x += s.speedX
        s.y += s.speedY
        s.pulse += s.pulseSpeed

        // Wrap
        if (s.y > canvas.height + 4) { s.y = -4; s.x = Math.random() * canvas.width }
        if (s.x > canvas.width + 4) s.x = -4
        if (s.x < -4) s.x = canvas.width + 4

        const alpha = s.maxOpacity + Math.sin(s.pulse) * 0.15
        const a = Math.max(0.03, Math.min(1, alpha))

        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)

        if (s.tint) {
          // Colored star with glow
          ctx.fillStyle = s.tint
          ctx.globalAlpha = a
          ctx.fill()
          // Glow
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.size * 3, 0, Math.PI * 2)
          ctx.fillStyle = s.tint
          ctx.globalAlpha = a * 0.15
          ctx.fill()
          ctx.globalAlpha = 1
        } else {
          // In light mode, use light purple dots; in dark mode, use white
          const starColor = isLightMode ? 'rgba(196, 181, 253, 0.3)' : `rgba(248, 250, 252, ${a.toFixed(3)})`
          ctx.fillStyle = starColor
          ctx.fill()
        }
      }

      rafId = requestAnimationFrame(render)
    }
    render()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}
