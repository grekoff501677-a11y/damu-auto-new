'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

// Cloudinary delivers the heavy source SVG as an optimised raster (~96 KB)
const LOGO =
  'https://res.cloudinary.com/djjcxxgfm/image/upload/f_auto,q_auto,w_700/v1781090790/%D0%91%D0%B5%D0%B7_%D0%BD%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F_%D0%BA%D0%BE%D0%BF%D0%B8%D1%8F_ibm0gt.svg'

const R = 46
const C = 2 * Math.PI * R

export function HeroLogo({ className }: { className?: string }) {
  return (
    <div className={cn('relative aspect-square', className)}>
      {/* warm glow */}
      <div
        aria-hidden
        className="absolute inset-[14%] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(196,154,69,0.20), transparent 70%)' }}
      />

      {/* logo */}
      <motion.img
        src={LOGO}
        alt="Damu Auto"
        loading="lazy"
        decoding="async"
        className="absolute inset-[11%] h-[78%] w-[78%] object-contain"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* gradient-traced ring (light pulse running around the logo) */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
        <defs>
          <linearGradient id="hero-trace" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FBE8C4" />
            <stop offset="50%" stopColor="#D9B870" />
            <stop offset="100%" stopColor="#C49A45" />
          </linearGradient>
          <filter id="hero-trace-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.1" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* faint base ring */}
        <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(196,154,69,0.16)" strokeWidth="0.5" />

        {/* travelling light arc */}
        <motion.circle
          cx="50" cy="50" r={R} fill="none"
          stroke="url(#hero-trace)" strokeWidth="1.1" strokeLinecap="round"
          strokeDasharray={`${C * 0.2} ${C * 0.8}`}
          filter="url(#hero-trace-glow)"
          animate={{ strokeDashoffset: [C, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
        />
        {/* second, shorter trailing arc for depth */}
        <motion.circle
          cx="50" cy="50" r={R} fill="none"
          stroke="url(#hero-trace)" strokeWidth="0.6" strokeLinecap="round" strokeOpacity="0.5"
          strokeDasharray={`${C * 0.06} ${C * 0.94}`}
          animate={{ strokeDashoffset: [C, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'linear', delay: 0.4 }}
        />
      </svg>
    </div>
  )
}
