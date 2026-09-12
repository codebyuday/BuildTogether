import { useEffect, useRef, useState } from 'react'

function useCountUp(target, duration = 1600, startOnView = true) {
  const [value, setValue] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    if (!startOnView || !ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const start = performance.now()
          const animate = (now) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setValue(Math.round(eased * target))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration, startOnView])

  return { value, ref }
}

export default function NumberTicker({ value, suffix = '', prefix = '', duration = 1600, className = '' }) {
  const numericValue = typeof value === 'number' ? value : parseInt(value, 10) || 0
  const { value: animated, ref } = useCountUp(numericValue, duration)

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}{animated}{suffix}
    </span>
  )
}
