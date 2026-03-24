import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import * as THREE from 'three'

interface SkillDef {
  name: string
  color: string
  logo: string
}

const SKILLS: SkillDef[] = [
  { name: 'Python',       color: '#3776ab', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
  { name: 'React',        color: '#61dafb', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
  { name: 'TypeScript',   color: '#3178c6', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
  { name: 'Next.js',      color: '#f8fafc', logo: 'https://cdn.simpleicons.org/nextdotjs/ffffff' },
  { name: 'Node.js',      color: '#68a063', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
  { name: 'C#/.NET',      color: '#6b4ce6', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dot-net/dot-net-original.svg' },
  { name: 'Docker',       color: '#2496ed', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg' },
  { name: 'Azure',        color: '#0078d4', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg' },
  { name: 'Kubernetes',   color: '#326CE5', logo: 'https://cdn.simpleicons.org/kubernetes/326CE5' },
  { name: 'Jenkins',      color: '#D33833', logo: 'https://cdn.simpleicons.org/jenkins/D33833' },
  { name: 'FastAPI',      color: '#009688', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg' },
  { name: 'Supabase',     color: '#3ecf8e', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg' },
  { name: 'SQL/Oracle',   color: '#f97316', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/oracle/oracle-original.svg' },
  { name: 'Git',          color: '#f1502f', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg' },
  { name: 'React Native', color: '#61dafb', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
  { name: 'Claude',       color: '#CC785C', logo: 'https://cdn.simpleicons.org/anthropic/CC785C' },
  { name: 'PostgreSQL',   color: '#336791', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
  { name: 'Java',         color: '#ED8B00', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg' },
  { name: 'Spring Boot',  color: '#6DB33F', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg' },
  { name: 'GitHub',       color: '#f8fafc', logo: 'https://cdn.simpleicons.org/github/ffffff' },
]

const GLOBE_HEIGHT = 480

const secFade = {
  initial:     { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true, margin: '-60px' as const },
  transition:  { duration: 0.6, ease: 'easeOut' as const },
}

export default function SkillsGlobe() {
  const containerRef = useRef<HTMLDivElement>(null)
  const hoveredRef = useRef<string | null>(null)
  const [isLightMode, setIsLightMode] = useState(false)
  const [hovered, setHovered] = useState<{
    name: string
    x: number
    y: number
    color: string
  } | null>(null)

  useEffect(() => {
    const updateMode = () => setIsLightMode(document.body.classList.contains('light'))
    updateMode()
    const mo = new MutationObserver(updateMode)
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    return () => mo.disconnect()
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth
    const height = GLOBE_HEIGHT

    const scene = new THREE.Scene()
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

    // Wireframe sphere — brighter
    const sphereGeo = new THREE.IcosahedronGeometry(RADIUS, 2)
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0xa78bfa,
      wireframe: true,
      transparent: true,
      opacity: 0.07,
    })
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat)
    globe.add(sphereMesh)

    // Orbit rings
    const ringMats: THREE.MeshBasicMaterial[] = []
    const makeRing = (rx: number, ry: number, rz: number, op: number, col: number) => {
      const geo = new THREE.RingGeometry(RADIUS + 0.02, RADIUS + 0.07, 128)
      const mat = new THREE.MeshBasicMaterial({
        color: col,
        transparent: true,
        opacity: op,
        side: THREE.DoubleSide,
      })
      const ring = new THREE.Mesh(geo, mat)
      ring.rotation.set(rx, ry, rz)
      globe.add(ring)
      ringMats.push(mat)
    }
    makeRing(Math.PI / 2, 0, 0, 0.1, 0xa78bfa)
    makeRing(Math.PI / 3, 0, Math.PI / 6, 0.06, 0xec4899)
    makeRing(Math.PI / 2.5, Math.PI / 4, 0, 0.05, 0x60a5fa)

    // Skill nodes
    const glowGeo = new THREE.SphereGeometry(0.4, 16, 16)
    const iconSprites: THREE.Sprite[] = []
    const loader = new THREE.TextureLoader()

    SKILLS.forEach((skill, i) => {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / SKILLS.length)
      const theta = Math.PI * (1 + Math.sqrt(5)) * i

      const x = RADIUS * Math.sin(phi) * Math.cos(theta)
      const y = RADIUS * Math.cos(phi)
      const z = RADIUS * Math.sin(phi) * Math.sin(theta)

      // Logo sprite
      const spriteMat = new THREE.SpriteMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      })
      const sprite = new THREE.Sprite(spriteMat)
      sprite.position.set(x, y, z)
      sprite.scale.set(1, 1, 1)
      sprite.userData = { name: skill.name, baseColor: skill.color, baseScale: 1 }

      loader.load(
        skill.logo,
        texture => {
          texture.colorSpace = THREE.SRGBColorSpace
          spriteMat.map = texture
          spriteMat.needsUpdate = true
          const img = texture.image as HTMLImageElement | undefined
          if (img?.width && img?.height) {
            const aspect = img.width / img.height
            const base = 0.9
            sprite.scale.set(base * aspect, base, 1)
            sprite.userData.baseScale = base
            sprite.userData.aspect = aspect
          }
        },
        undefined,
        () => {
          // keep colored fallback if icon fails
          spriteMat.color = new THREE.Color(skill.color)
          spriteMat.opacity = 0.85
        },
      )

      // Glow shell
      const glowMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(skill.color),
        transparent: true,
        opacity: 0,
      })
      const glow = new THREE.Mesh(glowGeo, glowMat)
      glow.position.set(x, y, z)
      glow.userData = { isGlow: true, parentName: skill.name }

      globe.add(sprite)
      globe.add(glow)
      iconSprites.push(sprite)
    })

    // Interaction
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2(-999, -999)

    let isDragging = false
    let prevMouse = { x: 0, y: 0 }
    let autoSpeed = 0.003
    const velocity = { x: 0, y: 0 }

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true
      prevMouse = { x: e.clientX, y: e.clientY }
      autoSpeed = 0
      renderer.domElement.style.cursor = 'grabbing'
    }

    const onPointerUp = () => {
      isDragging = false
      renderer.domElement.style.cursor = 'grab'
      setTimeout(() => { autoSpeed = 0.003 }, 800)
    }

    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      if (isDragging) {
        const dx = e.clientX - prevMouse.x
        const dy = e.clientY - prevMouse.y
        velocity.y = dx * 0.005
        velocity.x = dy * 0.003
        prevMouse = { x: e.clientX, y: e.clientY }
      }
    }

    const onTouchStart = (e: TouchEvent) => {
      isDragging = true
      autoSpeed = 0
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    const onTouchEnd = () => {
      isDragging = false
      setTimeout(() => { autoSpeed = 0.003 }, 800)
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || !e.touches.length) return
      const dx = e.touches[0].clientX - prevMouse.x
      const dy = e.touches[0].clientY - prevMouse.y
      velocity.y = dx * 0.005
      velocity.x = dy * 0.003
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }
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
      globe.rotation.y += autoSpeed

      if (!isDragging) {
        velocity.x *= 0.94
        velocity.y *= 0.94
      }
      globe.rotation.y += velocity.y
      globe.rotation.x += velocity.x
      globe.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, globe.rotation.x))

      // Theme-aware globe appearance: darker globe in light mode
      if (document.body.classList.contains('light')) {
        sphereMat.color.set(0x1e3a8a)
        sphereMat.opacity = 0.15
        if (ringMats[0]) {
          ringMats[0].color.set(0x1e3a8a)
          ringMats[0].opacity = 0.14
        }
        if (ringMats[1]) {
          ringMats[1].color.set(0x334155)
          ringMats[1].opacity = 0.09
        }
        if (ringMats[2]) {
          ringMats[2].color.set(0x1e40af)
          ringMats[2].opacity = 0.1
        }
      } else {
        sphereMat.color.set(0xa78bfa)
        sphereMat.opacity = 0.07
        if (ringMats[0]) {
          ringMats[0].color.set(0xa78bfa)
          ringMats[0].opacity = 0.1
        }
        if (ringMats[1]) {
          ringMats[1].color.set(0xec4899)
          ringMats[1].opacity = 0.06
        }
        if (ringMats[2]) {
          ringMats[2].color.set(0x60a5fa)
          ringMats[2].opacity = 0.05
        }
      }

      // Depth-based scaling with enhanced contrast
      iconSprites.forEach(sprite => {
        const worldPos = sprite.position.clone().applyMatrix4(globe.matrixWorld)
        const dist = worldPos.distanceTo(camera.position)
        const minD = camera.position.z - RADIUS
        const maxD = camera.position.z + RADIUS
        const t = Math.max(0, Math.min(1, 1 - (dist - minD) / (maxD - minD)))

        const isHovered = hoveredRef.current === sprite.userData.name

        // Three depth tiers:
        // t > 0.6 = foreground (full color, large, glow)
        // t > 0.3 = mid-range (70% opacity, medium)
        // t <= 0.3 = background (30% opacity, small)
        let scale: number, opacity: number
        if (t > 0.6) {
          scale = 0.85 + t * 0.7
          opacity = 0.92 + t * 0.08
        } else if (t > 0.3) {
          scale = 0.5 + t * 0.55
          opacity = 0.45 + t * 0.28
        } else {
          scale = 0.28 + t * 0.38
          opacity = 0.18 + t * 0.18
        }

        if (isHovered) {
          scale = 1.9
          opacity = 1.0
        }

        const aspect = sprite.userData.aspect ?? 1
        const baseScale = sprite.userData.baseScale ?? 0.9
        const s = scale * baseScale
        sprite.scale.set(s * aspect, s, 1)
        ;(sprite.material as THREE.SpriteMaterial).opacity = opacity
      })

      // Update glow shells
      globe.children.forEach(child => {
        if (child.userData?.isGlow) {
          const parentName = child.userData.parentName
          const isHovered = hoveredRef.current === parentName
          ;(child as THREE.Mesh).scale.setScalar(isHovered ? 3.1 : 0)
          ;((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = isHovered ? 0.2 : 0
        }
      })

      // Raycasting
      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(iconSprites)

      if (hits.length > 0) {
        const obj = hits[0].object as THREE.Sprite
        const wp = obj.position.clone().applyMatrix4(globe.matrixWorld)
        wp.project(camera)

        const rect = el.getBoundingClientRect()
        const sx = (wp.x * 0.5 + 0.5) * rect.width
        const sy = (-wp.y * 0.5 + 0.5) * rect.height

        hoveredRef.current = obj.userData.name
        setHovered({
          name: obj.userData.name,
          x: sx,
          y: sy,
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

  return (
    <section
      id="skills-globe"
      className="section-pad relative z-10 overflow-hidden"
    >
      <div className="wrap">
        <motion.div {...secFade} className="text-center mb-12">
          <span
            className="tracking-widest"
            style={{
              color: isLightMode ? 'rgba(30,41,59,0.8)' : 'rgba(226,232,240,0.9)',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.16em',
            }}
          >
            TECH STACK
          </span>
          <h2
            className="font-display font-bold mt-4 inline-block"
            style={{
              fontSize: 'clamp(3rem, 7vw, 78px)',
              lineHeight: 1,
              textShadow: isLightMode ? '0 0 22px rgba(30,58,138,0.12)' : '0 0 30px rgba(30,58,138,0.2)',
            }}
          >
            <span style={{ color: isLightMode ? '#0f172a' : '#f8fafc' }}>My </span>
            <span className="skills-title-accent">Skills</span>
          </h2>
        </motion.div>

        <motion.div {...secFade} transition={{ ...secFade.transition, delay: 0.15 }}>
          <div
            ref={containerRef}
            className="relative mx-auto"
            style={{ maxWidth: 800, height: GLOBE_HEIGHT }}
          >
            {hovered && (
              <div
                className="absolute pointer-events-none z-50 px-4 py-2 rounded-full
                           text-xs font-mono font-semibold tracking-wide uppercase
                           transition-opacity duration-150"
                style={{
                  left: hovered.x,
                  top: hovered.y + 26,
                  transform: 'translateX(-50%)',
                  background: isLightMode
                    ? 'linear-gradient(135deg, rgba(15,23,42,0.94), rgba(30,41,59,0.9))'
                    : 'linear-gradient(135deg, rgba(2,6,23,0.92), rgba(15,23,42,0.9))',
                  border: `1px solid ${hovered.color}aa`,
                  color: '#f8fafc',
                  textShadow: '0 1px 2px rgba(0,0,0,0.55)',
                  boxShadow: `0 10px 24px rgba(2,6,23,0.45), 0 0 0 1px ${hovered.color}33`,
                }}
              >
                {hovered.name}
              </div>
            )}
          </div>
        </motion.div>

        <motion.p
          {...secFade}
          transition={{ ...secFade.transition, delay: 0.25 }}
          className="text-center text-xs mt-4"
          style={{ color: isLightMode ? 'rgba(51,65,85,0.72)' : 'rgba(203,213,225,0.8)' }}
        >
          Drag to rotate · Hover nodes for details
        </motion.p>
      </div>
    </section>
  )
}
