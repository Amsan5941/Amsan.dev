import { motion } from 'framer-motion'

const PROOF_ITEMS = [
  { value: '4', label: 'Production co-ops' },
  { value: '3+', label: 'Years shipping software' },
  { value: '30%', label: 'Infra cost reduction' },
  { value: 'May 2026', label: 'Full-time availability' },
]

export default function ProofBar() {
  return (
    <section className="relative z-10 -mt-8 md:-mt-10 px-4">
      <div className="wrap">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' as const }}
          transition={{ duration: 0.45 }}
          className="card-standard p-4 md:p-5"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {PROOF_ITEMS.map(item => (
              <div key={item.label} className="rounded-xl border px-4 py-3" style={{ borderColor: 'var(--card-border)' }}>
                <p className="text-ink font-display font-bold text-2xl leading-none mb-1">{item.value}</p>
                <p className="text-muted text-xs uppercase tracking-wider">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
