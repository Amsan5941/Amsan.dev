import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    // Check for touch device
    if ('ontouchstart' in window) return

    let mouseX = -100
    let mouseY = -100
    let ringX = -100
    let ringY = -100

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const onEnterInteractive = () => setHovering(true)
    const onLeaveInteractive = () => setHovering(false)

    // Track interactive elements
    const observe = () => {
      const els = document.querySelectorAll('a, button, [role="button"], input, textarea')
      els.forEach(el => {
        el.addEventListener('mouseenter', onEnterInteractive)
        el.addEventListener('mouseleave', onLeaveInteractive)
      })
      return els
    }

    window.addEventListener('mousemove', onMove, { passive: true })

    // Initial observe
    let tracked = observe()

    // Re-observe on DOM changes
    const mo = new MutationObserver(() => {
      tracked.forEach(el => {
        el.removeEventListener('mouseenter', onEnterInteractive)
        el.removeEventListener('mouseleave', onLeaveInteractive)
      })
      tracked = observe()
    })
    mo.observe(document.body, { childList: true, subtree: true })

    let rafId: number
    const animate = () => {
      // Dot follows instantly
      dot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`

      // Ring follows with lag
      ringX += (mouseX - ringX) * 0.15
      ringY += (mouseY - ringY) * 0.15
      ring.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px)`

      rafId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMove)
      mo.disconnect()
      tracked.forEach(el => {
        el.removeEventListener('mouseenter', onEnterInteractive)
        el.removeEventListener('mouseleave', onLeaveInteractive)
      })
    }
  }, [])

  return (
    <>
      {/* Small dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#1e3a8a',
          transition: hovering ? 'width 0.2s, height 0.2s, opacity 0.2s' : 'none',
          opacity: hovering ? 0 : 1,
          mixBlendMode: 'normal',
        }}
      />
      {/* Outer ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: hovering ? '2px solid #f59e0b' : '1.5px solid rgba(30,58,138,0.35)',
          transition: 'width 0.2s ease, height 0.2s ease, border 0.2s ease, transform 0.08s ease',
          transform: hovering ? 'scale(1.2)' : 'scale(1)',
          background: hovering ? 'rgba(245,158,11,0.09)' : 'transparent',
          mixBlendMode: 'normal',
        }}
      />
    </>
  )
}
