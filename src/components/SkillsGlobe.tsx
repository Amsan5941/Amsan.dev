import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'

// ── Types ─────────────────────────────────────────────────────────────────────

type CategoryKey = 'frontend' | 'backend' | 'infra' | 'ai'

interface SkillDef {
  name: string
  color: string
  logo: string
  category: CategoryKey
}

// ── Category metadata ──────────────────────────────────────────────────────────

const CATEGORIES: { key: CategoryKey; label: string; color: string; bg: string; border: string }[] = [
  { key: 'frontend', label: 'Frontend',      color: '#3b82f6', bg: 'rgba(59,130,246,0.10)',  border: 'rgba(59,130,246,0.30)' },
  { key: 'backend',  label: 'Backend',       color: '#d97706', bg: 'rgba(217,119,6,0.10)',   border: 'rgba(217,119,6,0.30)' },
  { key: 'infra',    label: 'Infra & Cloud', color: '#10b981', bg: 'rgba(16,185,129,0.10)',  border: 'rgba(16,185,129,0.30)' },
  { key: 'ai',       label: 'AI & Data',     color: '#a855f7', bg: 'rgba(168,85,247,0.10)',  border: 'rgba(168,85,247,0.30)' },
]

// ── Skills ─────────────────────────────────────────────────────────────────────

const SKILLS: SkillDef[] = [
  // Frontend
  { name: 'React',        category: 'frontend', color: '#61dafb', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
  { name: 'TypeScript',   category: 'frontend', color: '#3178c6', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
  { name: 'Next.js',      category: 'frontend', color: '#f8fafc', logo: 'https://cdn.simpleicons.org/nextdotjs/ffffff' },
  // Backend
  { name: 'Python',       category: 'backend',  color: '#3776ab', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
  { name: 'Node.js',      category: 'backend',  color: '#68a063', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
  { name: 'C#/.NET',      category: 'backend',  color: '#6b4ce6', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dot-net/dot-net-original.svg' },
  { name: 'FastAPI',      category: 'backend',  color: '#009688', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg' },
  { name: 'Java',         category: 'backend',  color: '#ED8B00', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg' },
  { name: 'Spring Boot',  category: 'backend',  color: '#6DB33F', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg' },
  // Infra & Cloud
  { name: 'Docker',       category: 'infra',    color: '#2496ed', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg' },
  { name: 'Kubernetes',   category: 'infra',    color: '#326CE5', logo: 'https://cdn.simpleicons.org/kubernetes/326CE5' },
  { name: 'Azure',        category: 'infra',    color: '#0078d4', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg' },
  { name: 'Jenkins',      category: 'infra',    color: '#D33833', logo: 'https://cdn.simpleicons.org/jenkins/D33833' },
  { name: 'Git',          category: 'infra',    color: '#f1502f', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg' },
  { name: 'GitHub',       category: 'infra',    color: '#f8fafc', logo: 'https://cdn.simpleicons.org/github/ffffff' },
  // AI & Data
  { name: 'Claude / AI',  category: 'ai',       color: '#CC785C', logo: 'https://cdn.simpleicons.org/anthropic/CC785C' },
  { name: 'PostgreSQL',   category: 'ai',       color: '#336791', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
  { name: 'Supabase',     category: 'ai',       color: '#3ecf8e', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg' },
  { name: 'SQL/Oracle',   category: 'ai',       color: '#f97316', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/oracle/oracle-original.svg' },
]

const GLOBE_HEIGHT = 480

const secFade = {
  initial:     { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true, margin: '-60px' as const },
  transition:  { duration: 0.6, ease: 'easeOut' as const },
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function SkillsGlobe() {
  const containerRef      = useRef<HTMLDivElement>(null)
  const hoveredRef        = useRef<string | null>(null)
  const activeCategoryRef = useRef<CategoryKey | null>(null)

  const [isLightMode,     setIsLightMode]     = useState(false)
  const [activeCategory,  setActiveCategory]  = useState<CategoryKey | null>(null)
  const [hovered, setHovered] = useState<{ name: string; x: number; y: number; color: string } | null>(null)

  // Theme detection
  useEffect(() => {
    const update = () => setIsLightMode(document.body.classList.contains('light'))
    update()
    const mo = new MutationObserver(update)
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    return () => mo.disconnect()
  }, [])

  // Toggle category filter — keeps ref in sync for the RAF loop
  const toggleCategory = (key: CategoryKey) => {
    const next = activeCategory === key ? null : key
    setActiveCategory(next)
    activeCategoryRef.current = next
  }

  // Three.js globe
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width  = container.clientWidth
    const height = GLOBE_HEIGHT

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.z = 14

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)
    renderer.domElement.style.cursor = 'grab'

    const globe = new THREE.Group()
    scene.add(globe)

    const RADIUS = 5

    // Wireframe sphere
    const sphereGeo = new THREE.IcosahedronGeometry(RADIUS, 2)
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0xa78bfa, wireframe: true, transparent: true, opacity: 0.07,
    })
    globe.add(new THREE.Mesh(sphereGeo, sphereMat))

    // Orbit rings
    const ringMats: THREE.MeshBasicMaterial[] = []
    const makeRing = (rx: number, ry: number, rz: number, op: number, col: number) => {
      const geo = new THREE.RingGeometry(RADIUS + 0.02, RADIUS + 0.07, 128)
      const mat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, side: THREE.DoubleSide })
      const ring = new THREE.Mesh(geo, mat)
      ring.rotation.set(rx, ry, rz)
      globe.add(ring)
      ringMats.push(mat)
    }
    makeRing(Math.PI / 2,   0,           0,           0.10, 0xa78bfa)
    makeRing(Math.PI / 3,   0,           Math.PI / 6, 0.06, 0xec4899)
    makeRing(Math.PI / 2.5, Math.PI / 4, 0,           0.05, 0x60a5fa)

    // Skill nodes
    const glowGeo    = new THREE.SphereGeometry(0.4, 16, 16)
    const iconSprites: THREE.Sprite[] = []
    const loader     = new THREE.TextureLoader()

    SKILLS.forEach((skill, i) => {
      const phi   = Math.acos(1 - (2 * (i + 0.5)) / SKILLS.length)
      const theta = Math.PI * (1 + Math.sqrt(5)) * i
      const x = RADIUS * Math.sin(phi) * Math.cos(theta)
      const y = RADIUS * Math.cos(phi)
      const z = RADIUS * Math.sin(phi) * Math.sin(theta)

      // Icon sprite
      const spriteMat = new THREE.SpriteMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false })
      const sprite    = new THREE.Sprite(spriteMat)
      sprite.position.set(x, y, z)
      sprite.scale.set(1, 1, 1)
      sprite.userData = { name: skill.name, baseColor: skill.color, baseScale: 1, category: skill.category }

      loader.load(
        skill.logo,
        texture => {
          texture.colorSpace = THREE.SRGBColorSpace
          spriteMat.map = texture
          spriteMat.needsUpdate = true
          const img = texture.image as HTMLImageElement | undefined
          if (img?.width && img?.height) {
            const aspect = img.width / img.height
            const base   = 0.9
            sprite.scale.set(base * aspect, base, 1)
            sprite.userData.baseScale = base
            sprite.userData.aspect    = aspect
          }
        },
        undefined,
        () => { spriteMat.color = new THREE.Color(skill.color); spriteMat.opacity = 0.85 },
      )

      // Glow shell
      const glowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(skill.color), transparent: true, opacity: 0 })
      const glow    = new THREE.Mesh(glowGeo, glowMat)
      glow.position.set(x, y, z)
      glow.userData = { isGlow: true, parentName: skill.name, category: skill.category }

      globe.add(sprite)
      globe.add(glow)
      iconSprites.push(sprite)
    })

    // Pointer / drag / touch
    const raycaster = new THREE.Raycaster()
    const mouse     = new THREE.Vector2(-999, -999)
    let isDragging  = false
    let prevMouse   = { x: 0, y: 0 }
    let autoSpeed   = 0.003
    const velocity  = { x: 0, y: 0 }

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }
      autoSpeed = 0; renderer.domElement.style.cursor = 'grabbing'
    }
    const onPointerUp = () => {
      isDragging = false; renderer.domElement.style.cursor = 'grab'
    }
    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1
      if (isDragging) {
        velocity.y = (e.clientX - prevMouse.x) * 0.005
        velocity.x = (e.clientY - prevMouse.y) * 0.003
        prevMouse  = { x: e.clientX, y: e.clientY }
      }
    }
    const onTouchStart = (e: TouchEvent) => {
      isDragging = true; autoSpeed = 0
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    const onTouchEnd  = () => { isDragging = false }
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || !e.touches.length) return
      velocity.y = (e.touches[0].clientX - prevMouse.x) * 0.005
      velocity.x = (e.touches[0].clientY - prevMouse.y) * 0.003
      prevMouse  = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }

    const el = renderer.domElement
    el.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    el.addEventListener('touchmove', onTouchMove, { passive: true })

    let rafId: number

    const animate = () => {
      const catActive = activeCategoryRef.current

      // Smoothly slow down when a category is filtered so highlighted skills are readable
      const targetSpeed = catActive ? 0.0008 : 0.003
      autoSpeed += (targetSpeed - autoSpeed) * 0.04

      globe.rotation.y += autoSpeed
      if (!isDragging) { velocity.x *= 0.94; velocity.y *= 0.94 }
      globe.rotation.y += velocity.y
      globe.rotation.x += velocity.x
      globe.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, globe.rotation.x))

      // Tint wireframe + rings to active category color
      const activeCatDef  = CATEGORIES.find(c => c.key === catActive)
      const activeCatHex  = activeCatDef ? parseInt(activeCatDef.color.replace('#', ''), 16) : null
      const isLight       = document.body.classList.contains('light')

      const defaultSphere = isLight ? 0x1e3a8a : 0xa78bfa
      const defaultRing0  = isLight ? 0x1e3a8a : 0xa78bfa
      const defaultRing1  = isLight ? 0x334155 : 0xec4899
      const defaultRing2  = isLight ? 0x1e40af : 0x60a5fa

      sphereMat.color.set(activeCatHex ?? defaultSphere)
      sphereMat.opacity = isLight ? (catActive ? 0.18 : 0.15) : (catActive ? 0.11 : 0.07)

      if (ringMats[0]) { ringMats[0].color.set(activeCatHex ?? defaultRing0); ringMats[0].opacity = catActive ? (isLight ? 0.22 : 0.18) : (isLight ? 0.14 : 0.10) }
      if (ringMats[1]) { ringMats[1].color.set(activeCatHex ?? defaultRing1); ringMats[1].opacity = catActive ? (isLight ? 0.14 : 0.12) : (isLight ? 0.09 : 0.06) }
      if (ringMats[2]) { ringMats[2].color.set(activeCatHex ?? defaultRing2); ringMats[2].opacity = catActive ? (isLight ? 0.14 : 0.10) : (isLight ? 0.10 : 0.05) }

      // Per-sprite opacity / scale — category filter dims non-matching skills
      iconSprites.forEach(sprite => {
        const worldPos = sprite.position.clone().applyMatrix4(globe.matrixWorld)
        const dist = worldPos.distanceTo(camera.position)
        const minD = camera.position.z - RADIUS
        const maxD = camera.position.z + RADIUS
        const t    = Math.max(0, Math.min(1, 1 - (dist - minD) / (maxD - minD)))

        const isHov    = hoveredRef.current === sprite.userData.name
        const inCat    = !catActive || sprite.userData.category === catActive

        // Depth-based base scale/opacity (three tiers)
        let scale: number, opacity: number
        if (t > 0.6)      { scale = 0.85 + t * 0.70; opacity = 0.92 + t * 0.08 }
        else if (t > 0.3) { scale = 0.50 + t * 0.55; opacity = 0.45 + t * 0.28 }
        else              { scale = 0.28 + t * 0.38; opacity = 0.18 + t * 0.18 }

        // Category filter overrides
        if (catActive) {
          if (inCat)  { opacity = Math.max(opacity, 0.88); scale *= 1.15 }
          else        { opacity = 0.08; scale *= 0.70 }
        }

        if (isHov) { scale = 1.9; opacity = 1.0 }

        const aspect    = sprite.userData.aspect    ?? 1
        const baseScale = sprite.userData.baseScale ?? 0.9
        const s = scale * baseScale
        sprite.scale.set(s * aspect, s, 1)
        ;(sprite.material as THREE.SpriteMaterial).opacity = opacity
      })

      // Glow shells — pulse ambient glow on category-matched skills when filter is active
      globe.children.forEach(child => {
        if (!child.userData?.isGlow) return
        const isHov       = hoveredRef.current === child.userData.parentName
        const inCat       = !catActive || child.userData.category === catActive
        const showAmbient = catActive && inCat && !isHov

        ;(child as THREE.Mesh).scale.setScalar(isHov ? 3.1 : showAmbient ? 2.0 : 0)
        ;((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity =
          isHov ? 0.20 : showAmbient ? 0.13 : 0
      })

      // Raycasting for hover tooltip
      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(iconSprites)
      if (hits.length > 0) {
        const obj = hits[0].object as THREE.Sprite
        const wp  = obj.position.clone().applyMatrix4(globe.matrixWorld)
        wp.project(camera)
        const rect = el.getBoundingClientRect()
        hoveredRef.current = obj.userData.name
        setHovered({
          name:  obj.userData.name,
          x:     (wp.x * 0.5 + 0.5) * rect.width,
          y:     (-wp.y * 0.5 + 0.5) * rect.height,
          color: obj.userData.baseColor,
        })
        if (!isDragging) el.style.cursor = 'pointer'
      } else {
        hoveredRef.current = null
        setHovered(null)
        if (!isDragging) el.style.cursor = 'grab'
      }

      renderer.render(scene, camera)
      rafId = requestAnimationFrame(animate)
    }
    animate()

    const onResize = () => {
      const w = container.clientWidth
      camera.aspect = w / height
      camera.updateProjectionMatrix()
      renderer.setSize(w, height)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      renderer.dispose()
      sphereGeo.dispose()
      sphereMat.dispose()
      glowGeo.dispose()
      if (container.contains(el)) container.removeChild(el)
    }
  }, [])

  // Skill chips for the active category strip
  const activeSkills  = activeCategory ? SKILLS.filter(s => s.category === activeCategory) : null
  const activeCatDef  = CATEGORIES.find(c => c.key === activeCategory)

  return (
    <section id="skills-globe" className="section-pad relative z-10 overflow-hidden">
      <div className="wrap">

        {/* Header */}
        <motion.div {...secFade} className="text-center mb-8">
          <span style={{
            color: isLightMode ? 'rgba(30,41,59,0.8)' : 'rgba(226,232,240,0.9)',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '13px', fontWeight: 700,
            letterSpacing: '0.16em', textTransform: 'uppercase' as const,
          }}>
            TECH STACK
          </span>
          <h2
            className="font-display font-bold mt-4 inline-block"
            style={{
              fontSize: 'clamp(3rem, 7vw, 78px)', lineHeight: 1,
              textShadow: isLightMode ? '0 0 22px rgba(30,58,138,0.12)' : '0 0 30px rgba(30,58,138,0.2)',
            }}
          >
            <span style={{ color: isLightMode ? '#0f172a' : '#f8fafc' }}>My </span>
            <span className="skills-title-accent">Skills</span>
          </h2>
        </motion.div>

        {/* Category filter pills */}
        <motion.div
          {...secFade}
          transition={{ ...secFade.transition, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-2"
        >
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.key
            return (
              <button
                key={cat.key}
                onClick={() => toggleCategory(cat.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 16px', borderRadius: '999px', cursor: 'pointer',
                  border: `1.5px solid ${isActive ? cat.color : isLightMode ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.12)'}`,
                  background: isActive ? cat.bg : 'transparent',
                  color: isActive ? cat.color : isLightMode ? '#64748b' : '#94a3b8',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '11px', fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? `0 0 14px ${cat.color}44` : 'none',
                }}
              >
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: cat.color, flexShrink: 0,
                  boxShadow: isActive ? `0 0 7px ${cat.color}` : 'none',
                  transition: 'box-shadow 0.2s ease',
                }} />
                {cat.label}
              </button>
            )
          })}
        </motion.div>

        {/* Globe */}
        <motion.div {...secFade} transition={{ ...secFade.transition, delay: 0.15 }}>
          <div
            ref={containerRef}
            className="relative mx-auto"
            style={{ maxWidth: 800, height: GLOBE_HEIGHT, minHeight: GLOBE_HEIGHT }}
          >
            {/* Hover tooltip */}
            {hovered && (
              <div
                className="absolute pointer-events-none z-50 px-4 py-2 rounded-full
                           text-xs font-mono font-semibold tracking-wide uppercase"
                style={{
                  left: hovered.x, top: hovered.y + 26, transform: 'translateX(-50%)',
                  background: isLightMode
                    ? 'linear-gradient(135deg, rgba(15,23,42,0.94), rgba(30,41,59,0.9))'
                    : 'linear-gradient(135deg, rgba(2,6,23,0.92), rgba(15,23,42,0.9))',
                  border: `1px solid ${hovered.color}aa`, color: '#f8fafc',
                  textShadow: '0 1px 2px rgba(0,0,0,0.55)',
                  boxShadow: `0 10px 24px rgba(2,6,23,0.45), 0 0 0 1px ${hovered.color}33`,
                }}
              >
                {hovered.name}
              </div>
            )}
          </div>
        </motion.div>

        {/* Active category chip strip — fades in below the globe */}
        <AnimatePresence mode="wait">
          {activeSkills && activeCatDef && (
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="flex flex-wrap justify-center gap-2 mt-1 mb-3"
            >
              {activeSkills.map(skill => (
                <span
                  key={skill.name}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '5px 12px', borderRadius: '8px',
                    background: activeCatDef.bg, border: `1px solid ${activeCatDef.border}`,
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 600,
                    color: isLightMode ? '#1e293b' : '#e2e8f0',
                  }}
                >
                  <img
                    src={skill.logo} alt={skill.name} width={13} height={13}
                    style={{ objectFit: 'contain' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  {skill.name}
                </span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint */}
        <motion.p
          {...secFade}
          transition={{ ...secFade.transition, delay: 0.25 }}
          className="text-center text-xs mt-3"
          style={{ color: isLightMode ? 'rgba(51,65,85,0.65)' : 'rgba(203,213,225,0.7)' }}
        >
          {activeCategory
            ? 'Click pill to clear · Drag to rotate · Hover nodes for details'
            : 'Filter by category · Drag to rotate · Hover nodes for details'}
        </motion.p>

      </div>
    </section>
  )
}
