import { lazy, Suspense, useState, useLayoutEffect } from 'react'
import Navbar            from './components/Navbar'
import Starfield         from './components/Starfield'
import ScrollProgress    from './components/ScrollProgress'
import CustomCursor      from './components/CustomCursor'
import HeroChat          from './components/HeroChat'
import ProofBar          from './components/ProofBar'
import About            from './components/About'
import Experience       from './components/Experience'
import Projects         from './components/Projects'
import FlagshipCaseStudies from './components/FlagshipCaseStudies'
import GitHubContributions from './components/GitHubContributions'
import RecruiterQuickPack from './components/RecruiterQuickPack'
import Testimonials     from './components/Testimonials'
import Contact          from './components/Contact'
import Footer           from './components/Footer'
import ChatWidget       from './components/ChatWidget'

const SkillsGlobe = lazy(() => import('./components/SkillsGlobe'))

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('light')

  useLayoutEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null
    const initialTheme = savedTheme ?? 'light'
    setTheme(initialTheme)
    document.body.classList.toggle('light', initialTheme === 'light')
  }, [])

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.body.classList.toggle('light', newTheme === 'light')
  }

  return (
    <>
      {/* Availability banner — sits above the navbar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 101,
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          background: 'linear-gradient(90deg, #1e3a8a 0%, #1d4ed8 50%, #1e3a8a 100%)',
          backgroundSize: '200% 100%',
          fontSize: '12px',
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: 600,
          letterSpacing: '0.05em',
          color: '#e0e7ff',
          whiteSpace: 'nowrap' as const,
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#34d399',
            boxShadow: '0 0 8px #34d399',
            flexShrink: 0,
          }}
        />
        <span>Available for full-time roles · May 2026 · SRE / Platform / AI Engineering</span>
        <span style={{ opacity: 0.5, fontSize: '11px' }}>·</span>
        <a
          href="mailto:amsan5941@gmail.com"
          style={{ color: '#fbbf24', textDecoration: 'none', fontSize: '11px', opacity: 0.9 }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.9')}
        >
          amsan5941@gmail.com
        </a>
      </div>
      <Navbar theme={theme} onThemeChange={handleThemeChange} />
      <Starfield />
      <ScrollProgress />
      <CustomCursor />
      <ChatWidget />
      {/* paddingTop = 36px banner + 80px navbar */}
      <div className="relative min-h-screen bg-transparent" style={{ paddingTop: '116px' }}>
        <main>
          <div id="home">
            <HeroChat />
          </div>
          <GitHubContributions />
          <ProofBar />
          <div id="skills">
            <Suspense fallback={<div className="section-pad" />}>
              <SkillsGlobe />
            </Suspense>
          </div>
          <About />
          <Experience />
          <Projects />
          <div id="case-studies">
            <FlagshipCaseStudies />
          </div>
          <Testimonials />
          <RecruiterQuickPack />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  )
}
