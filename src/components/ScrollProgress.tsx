import { useEffect, useState } from 'react'

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] h-[2px]"
      style={{ background: 'rgba(15,23,42,0.14)' }}
    >
      <div
        className="h-full transition-[width] duration-100 ease-out"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #1e3a8a, #f59e0b)',
          boxShadow: '0 0 8px rgba(30,58,138,0.35)',
        }}
      />
    </div>
  )
}
