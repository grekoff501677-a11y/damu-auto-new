'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { cn } from '@/lib/utils'

type TiltCardProps = {
  children: React.ReactNode
  className?: string
  /** max tilt in degrees (0 disables tilt) */
  intensity?: number
  /** show moving glare highlight */
  glare?: boolean
}

const SPRING = { stiffness: 100, damping: 15, mass: 0.5 }

export function TiltCard({ children, className, intensity = 8, glare = true }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  // All hooks are called unconditionally (stable hook order across renders).
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const rotateX = useSpring(useTransform(my, [0, 1], [intensity, -intensity]), SPRING)
  const rotateY = useSpring(useTransform(mx, [0, 1], [-intensity, intensity]), SPRING)
  const glareBg = useTransform([mx, my], ([x, y]: number[]) =>
    `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.10), transparent 50%)`
  )

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!intensity) return
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    mx.set((e.clientX - rect.left) / rect.width)
    my.set((e.clientY - rect.top) / rect.height)
  }

  function handleLeave() {
    mx.set(0.5)
    my.set(0.5)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={intensity ? handleMove : undefined}
      onMouseLeave={intensity ? handleLeave : undefined}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', transformPerspective: 1000 }}
      className={cn('relative', className)}
    >
      {children}
      {glare && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glareBg }}
        />
      )}
    </motion.div>
  )
}
