'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

// Cloudinary delivers the heavy source SVG as an optimised raster (~96 KB)
const LOGO =
  'https://res.cloudinary.com/djjcxxgfm/image/upload/f_auto,q_auto,w_700/v1781090790/%D0%91%D0%B5%D0%B7_%D0%BD%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F_%D0%BA%D0%BE%D0%BF%D0%B8%D1%8F_ibm0gt.svg'

// One-tailed comet: bright head at 0deg (top), single tail trailing clockwise.
const TAIL =
  'conic-gradient(from 0deg,' +
  ' #FFF6E2 0deg,' +
  ' rgba(217,184,112,0.75) 14deg,' +
  ' rgba(217,184,112,0.35) 48deg,' +
  ' rgba(217,184,112,0.10) 92deg,' +
  ' rgba(217,184,112,0) 135deg,' +
  ' rgba(217,184,112,0) 360deg)'

// thin annulus for the comet line (closest-side → 100% == half the box)
const RING = 'radial-gradient(circle closest-side, transparent 0 89%, #000 91%, #000 94.5%, transparent 96.5%)'

const SPIN = { duration: 6, repeat: Infinity, ease: 'linear' as const }
const CW = { rotate: 360 }

const LOGO_BOX = 'absolute inset-[11%] h-[78%] w-[78%] object-contain'

export function HeroLogo({ className }: { className?: string }) {
  return (
    <div className={cn('relative aspect-square', className)}>
      {/* soft ambient glow (no hard boundary) */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(196,154,69,0.08), transparent 66%)' }}
      />

      {/* logo, held in a light shadow (visible, slightly subdued) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO} alt="Damu Auto" loading="lazy" decoding="async"
        className={LOGO_BOX}
        style={{ filter: 'brightness(0.9) saturate(0.97)' }}
      />

      {/* travelling light that follows the comet and lifts the nearby part of the logo */}
      <motion.div aria-hidden className="absolute inset-0" style={{ mixBlendMode: 'screen' }} animate={CW} transition={SPIN}>
        <div
          className="absolute rounded-full"
          style={{
            left: '50%', top: '16%', width: '66%', aspectRatio: '1',
            transform: 'translate(-50%, -50%)',
            background:
              'radial-gradient(circle, rgba(255,248,230,0.72) 0%, rgba(217,184,112,0.40) 34%, rgba(217,184,112,0.12) 60%, transparent 76%)',
            filter: 'blur(2px)',
          }}
        />
      </motion.div>

      {/* faint full track ring */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{ background: 'rgba(196,154,69,0.12)', WebkitMaskImage: RING, maskImage: RING }}
      />

      {/* comet (tail + head), orbiting in sync with the light */}
      <motion.div aria-hidden className="absolute inset-0" animate={CW} transition={SPIN}>
        {/* single tail */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: TAIL, WebkitMaskImage: RING, maskImage: RING }}
        />
        {/* glowing head dot at 12 o'clock (sits on the ring) */}
        <div
          className="absolute rounded-full"
          style={{
            left: '50%', top: '3.5%', width: '4.4%', aspectRatio: '1',
            transform: 'translate(-50%, -50%)',
            background: '#FFF7E6',
            boxShadow: '0 0 10px 3px rgba(251,232,196,0.95), 0 0 24px 9px rgba(217,184,112,0.5)',
          }}
        />
      </motion.div>
    </div>
  )
}
