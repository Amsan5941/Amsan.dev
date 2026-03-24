import { lazy, Suspense, useState, useEffect } from 'react'
import Navbar            from './components/Navbar'
import Starfield         from './components/Starfield'
import ScrollProgress    from './components/ScrollProgress'
import CustomCursor      from './components/CustomCursor'
import HeroChat          from './components/HeroChat'
import ProofBar          from './components/ProofBar'
import About            from './components/About'
import Craft            from './components/Craft'
import Experience       from './components/Experience'
import Projects         from './components/Projects'
import FlagshipCaseStudies from './components/FlagshipCaseStudies'
import GitHubContributions from './components/GitHubContributions'
import Achievements     from './components/Achievements'
import RecruiterQuickPack from './components/RecruiterQuickPack'
import Contact          from './components/Contact'
import Footer           from './components/Footer'

const SkillsGlobe = lazy(() => import('./components/SkillsGlobe'))

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.body.classList.toggle('light', savedTheme === 'light')
    }
  }, [])

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.body.classList.toggle('light', newTheme === 'light')
  }

  return (
    <>
      <Navbar theme={theme} onThemeChange={handleThemeChange} />
      <Starfield />
      <ScrollProgress />
      <CustomCursor />
      <div className="relative min-h-screen bg-transparent" style={{ paddingTop: '80px' }}>
        <main>
          <div id="home">
            <HeroChat />
          </div>
          <ProofBar />
          <div id="skills">
            <Suspense fallback={<div className="section-pad" />}>
              <SkillsGlobe />
            </Suspense>
          </div>
          <About />
          <Craft />
          <Experience />
          <Projects />
          <GitHubContributions />
          <div id="case-studies">
            <FlagshipCaseStudies />
          </div>
          <Achievements />
          <RecruiterQuickPack />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  )
}
