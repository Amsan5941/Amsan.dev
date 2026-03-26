export default function Footer() {
  return (
    <footer className="relative z-10 py-12 border-t" style={{ borderColor: 'var(--card-border)' }}>
      <div className="wrap">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-display font-bold text-ink text-lg grad-static">AN</span>
            <span className="text-muted">·</span>
            <span className="label text-muted">
              © {new Date().getFullYear()} Amsan Naheswaran
            </span>
          </div>

          <div className="flex items-center gap-6 flex-wrap">
            <a
              href="https://github.com/Amsan5941"
              target="_blank"
              rel="noopener noreferrer"
              className="lnk text-sm font-medium hover:text-purple transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/amsan-naheswaran-243407231/"
              target="_blank"
              rel="noopener noreferrer"
              className="lnk text-sm font-medium hover:text-cyan transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="mailto:amsan5941@gmail.com"
              className="lnk text-sm font-medium hover:text-pink transition-colors"
            >
              Email
            </a>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <span className="label text-muted">Built with React &amp; Tailwind</span>
            <span className="text-muted">·</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="label text-muted hover:text-purple transition-colors"
            >
              Back to top ↑
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
