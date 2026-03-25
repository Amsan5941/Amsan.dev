import { lazy, Suspense, useState, useLayoutEffect } from 'react'
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
      <Navbar theme={theme} onThemeChange={handleThemeChange} />
      <Starfield />
      <ScrollProgress />
      <CustomCursor />
      <ChatWidget />
      <div className="relative min-h-screen bg-transparent" style={{ paddingTop: '80px' }}>
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
          <Craft />
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
