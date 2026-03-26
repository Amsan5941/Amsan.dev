import { useState, useEffect } from 'react'

interface NavbarProps {
  theme: 'dark' | 'light'
  onThemeChange: (theme: 'dark' | 'light') => void
}

export default function Navbar({ theme, onThemeChange }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const ids = ['home', 'experience', 'projects', 'case-studies', 'recognition', 'contact']
    const sections = ids
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el)

    if (!sections.length) return

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible[0]?.target?.id) setActiveSection(visible[0].target.id)
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: [0.2, 0.4, 0.6] },
    )

    sections.forEach(section => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'recognition', label: 'Recognition' },
    { id: 'contact', label: 'Contact' },
  ]

  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId)
    setIsMobileMenuOpen(false)
    
    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    onThemeChange(newTheme)
  }

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      {/* Logo */}
      <a href="#home" className="navbar-logo" onClick={() => handleNavClick('home')}>
        <div className="navbar-logo-circle">AN</div>
        <span>Amsan.dev</span>
      </a>

      {/* Desktop Navigation Links */}
      <ul className="navbar-links">
        {navLinks.map((link) => (
          <li key={link.id}>
            <a
              href={`#${link.id}`}
              className={`navbar-link ${activeSection === link.id ? 'active' : ''}`}
              aria-current={activeSection === link.id ? 'page' : undefined}
              onClick={(e) => {
                e.preventDefault()
                handleNavClick(link.id)
              }}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      {/* Right Side: Theme Toggle + Hamburger */}
      <div className="navbar-right">
        <a href="/resume.pdf" download="Amsan_Naheswaran_Resume.pdf" className="btn-primary navbar-resume-btn">
          Resume
        </a>

        {/* Theme Toggle */}
        <button
          className={`theme-toggle ${theme}`}
          onClick={toggleTheme}
          aria-label="Toggle dark/light mode"
        >
          <div className="theme-toggle-slider">
            {theme === 'dark' ? '🌙' : '☀️'}
          </div>
        </button>

        {/* Hamburger Menu */}
        <button
          className={`navbar-hamburger ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      <div className={`navbar-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <ul className="navbar-drawer-links">
          {navLinks.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                className={`navbar-drawer-link ${activeSection === link.id ? 'active' : ''}`}
                aria-current={activeSection === link.id ? 'page' : undefined}
                onClick={(e) => {
                  e.preventDefault()
                  handleNavClick(link.id)
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
