import { useEffect, useRef, useState } from 'react'

// Scroll-in reveal (Tio Luncin-style): the wrapped block stays hidden until
// it scrolls into the viewport, then fades + rises into place. Uses an
// IntersectionObserver, so it's cheap — no scroll listeners.
//
//   <Reveal delay={80}>
//     <section>…</section>
//   </Reveal>
//
// Respects the user's reduced-motion preference (shows content immediately).
export default function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // No motion for users who prefer reduced motion.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true)
            io.disconnect() // reveal once, then stop observing
          }
        })
      },
      { threshold: 0.15 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal ${shown ? 'reveal-shown' : ''} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
