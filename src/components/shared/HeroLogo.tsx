'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

const LOGO =
  'https://res.cloudinary.com/djjcxxgfm/image/upload/f_auto,q_auto,w_700/v1781090790/%D0%91%D0%B5%D0%B7_%D0%BD%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F_%D0%BA%D0%BE%D0%BF%D0%B8%D1%8F_ibm0gt.svg'

// Comet: bright head at 0deg (top). Rotation is CCW, so the head LEADS and the
// tail (spanning clockwise from the head) trails behind it.
const COMET =
  'conic-gradient(from 0deg,' +
  ' rgba(255,247,228,0.95) 0deg,' +
  ' rgba(226,196,128,0.6) 16deg,' +
  ' rgba(217,184,112,0.22) 52deg,' +
  ' rgba(217,184,112,0.05) 96deg,' +
  ' rgba(217,184,112,0) 140deg,' +
  ' rgba(217,184,112,0) 360deg)'

const RING = 'radial-gradient(circle closest-side, transparent 0 88%, #000 90%, #000 92.5%, transparent 95%)'

const SPIN = { duration: 7, repeat: Infinity, ease: 'linear' as const }
const CCW = { rotate: -360 } // head leads
const LOGO_BOX = 'absolute inset-[13%] h-[74%] w-[74%] object-contain'

export function HeroLogo({ className }: { className?: string }) {
  return (
    <div className={cn('relative aspect-square', className)}>
      {/* logo, held in shadow */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO} alt="Damu Auto" loading="lazy" decoding="async"
        className={LOGO_BOX}
        style={{ filter: 'brightness(0.5) saturate(0.85)' }}
      />

      {/* travelling light — CLIPPED to the emblem disc so it lifts only the logo
          out of shadow (never touches the surroundings) */}
      <div className="absolute inset-[13%] overflow-hidden rounded-full">
        <motion.div className="absolute inset-0" style={{ mixBlendMode: 'screen' }} animate={CCW} transition={SPIN}>
          <div
            className="absolute rounded-full"
            style={{
              left: '50%', top: '4%', width: '86%', aspectRatio: '1',
              transform: 'translate(-50%, -50%)',
              background:
                'radial-gradient(circle, rgba(255,245,220,0.6) 0%, rgba(217,184,112,0.2) 34%, rgba(217,184,112,0) 66%)',
              filter: 'blur(12px)',
            }}
          />
        </motion.div>
      </div>

      {/* faint track ring */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{ background: 'rgba(196,154,69,0.10)', WebkitMaskImage: RING, maskImage: RING }}
      />

      {/* comet soft glow trail */}
      <motion.div
        aria-hidden className="absolute inset-0 rounded-full"
        style={{ background: COMET, WebkitMaskImage: RING, maskImage: RING, filter: 'blur(4px)', opacity: 0.7 }}
        animate={CCW} transition={SPIN}
      />
      {/* comet crisp line */}
      <motion.div
        aria-hidden className="absolute inset-0 rounded-full"
        style={{ background: COMET, WebkitMaskImage: RING, maskImage: RING }}
        animate={CCW} transition={SPIN}
      />
    </div>
  )
}
