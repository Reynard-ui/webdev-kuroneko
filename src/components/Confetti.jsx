import { useEffect, useRef } from 'react'

// A lightweight canvas confetti burst — plays once when the order is
// confirmed. Pure canvas, no libraries. Respects the user's reduced-motion
// preference by skipping the animation entirely.
// Strict tri-color confetti: vermillion, charcoal, and cream only.
const COLORS = ['#c0392b', '#c0392b', '#26262b', '#26262b', '#f5eee1', '#f5eee1', 'rgba(192,57,43,0.55)']

export default function Confetti({ playKey = 0 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !playKey) return
    const ctx = canvas.getContext('2d')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const W = (canvas.width = canvas.offsetWidth || 460)
    const H = (canvas.height = 300)
    const pieces = Array.from({ length: 90 }, () => ({
      x: W / 2 + (Math.random() - 0.5) * 120,
      y: H * 0.2,
      vx: (Math.random() - 0.5) * 7,
      vy: -Math.random() * 7 - 2,
      w: 5 + Math.random() * 5,
      h: 4 + Math.random() * 4,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 1,
    }))

    let raf
    function frame() {
      ctx.clearRect(0, 0, W, H)
      let alive = false
      for (const p of pieces) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.18 // gravity
        p.rot += p.vr
        p.life -= 0.006
        if (p.life > 0 && p.y < H + 20) {
          alive = true
          ctx.save()
          ctx.globalAlpha = Math.max(p.life, 0)
          ctx.translate(p.x, p.y)
          ctx.rotate(p.rot)
          ctx.fillStyle = p.color
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
          ctx.restore()
        }
      }
      if (alive) raf = requestAnimationFrame(frame)
      else ctx.clearRect(0, 0, W, H)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [playKey])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 }}
      aria-hidden="true"
    />
  )
}
