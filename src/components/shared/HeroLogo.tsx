'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

// Cloudinary delivers the heavy source SVG as an optimised raster (~96 KB)
const LOGO =
  'https://res.cloudinary.com/djjcxxgfm/image/upload/f_auto,q_auto,w_700/v1781090790/%D0%91%D0%B5%D0%B7_%D0%BD%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F_%D0%BA%D0%BE%D0%BF%D0%B8%D1%8F_ibm0gt.svg'

// Symmetric comet: transparent → gold peak → transparent (tapers at both ends, no hard cut)
const COMET =
  'conic-gradient(from 0deg,' +
  ' rgba(217,184,112,0) 0deg,' +
  ' rgba(217,184,112,0.55) 16deg,' +
  ' #FBE8C4 27deg,' +
  ' rgba(217,184,112,0.55) 38deg,' +
  ' rgba(217,184,112,0) 54deg,' +
  ' rgba(217,184,112,0) 360deg)'

// thin annulus masks — closest-side so 100% == half the box (edge), predictable sizing
const RING_TRACK = 'radial-gradient(circle closest-side, transparent 0 90%, #000 92%, #000 94%, transparent 96%)'
const RING_LINE  = 'radial-gradient(circle closest-side, transparent 0 89%, #000 91%, #000 94.5%, transparent 96.5%)'
const RING_GLOW  = 'radial-gradient(circle closest-side, transparent 0 80%, #000 92%, transparent 104%)'

const ROTATE = { rotate: 360 }
const SPIN = { duration: 5.5, repeat: Infinity, ease: 'linear' as const }

export function HeroLogo({ className }: { className?: string }) {
  return (
    <div className={cn('relative aspect-square', className)}>
      {/* warm ambient glow */}
      <div
        aria-hidden
        className="absolute inset-[16%] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(196,154,69,0.18), transparent 70%)' }}
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

      {/* faint full track ring */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background: 'rgba(196,154,69,0.14)',
          WebkitMaskImage: RING_TRACK,
          maskImage: RING_TRACK,
        }}
      />

      {/* soft LED glow cast from the comet (blurred, reaches inward onto the logo) */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background: COMET,
          WebkitMaskImage: RING_GLOW,
          maskImage: RING_GLOW,
          filter: 'blur(7px)',
          opacity: 0.55,
        }}
        animate={ROTATE}
        transition={SPIN}
      />

      {/* crisp comet line (tapered both ends) */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background: COMET,
          WebkitMaskImage: RING_LINE,
          maskImage: RING_LINE,
        }}
        animate={ROTATE}
        transition={SPIN}
      />
    </div>
  )
}
