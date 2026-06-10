'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

const LOGO =
  'https://res.cloudinary.com/djjcxxgfm/image/upload/f_auto,q_auto,w_700/v1781097287/%D0%91%D0%B5%D0%B7_%D0%BD%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F_%D0%BA%D0%BE%D0%BF%D0%B8%D1%8F_1_tcyixo.svg'

// Comet: bright head at 0deg (top). CCW rotation → head leads, tail trails.
const COMET =
  'conic-gradient(from 0deg,' +
  ' rgba(255,248,230,1) 0deg,' +
  ' rgba(231,201,132,0.7) 16deg,' +
  ' rgba(217,184,112,0.32) 52deg,' +
  ' rgba(217,184,112,0.08) 96deg,' +
  ' rgba(217,184,112,0) 140deg,' +
  ' rgba(217,184,112,0) 360deg)'

const RING = 'radial-gradient(circle closest-side, transparent 0 88%, #000 90%, #000 92.5%, transparent 95%)'

// soft moving spotlight that REVEALS the natural logo (no colour overlay).
// Compact patch co-located with the comet head so the rest stays clearly in shadow.
const SPOTLIGHT =
  'radial-gradient(circle at 50% 9%, #000 0%, #000 20%, rgba(0,0,0,0.6) 34%, transparent 50%)'

const SPIN = { duration: 7, repeat: Infinity, ease: 'linear' as const }
const CCW = { rotate: -360 } // head leads
const CW = { rotate: 360 }   // counter-spin to keep the revealed logo upright
const LOGO_BOX = 'absolute inset-[13%] h-[74%] w-[74%] object-contain'

export function HeroLogo({ className }: { className?: string }) {
  return (
    <div className={cn('relative aspect-square', className)}>
      {/* logo held in shadow */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO} alt="Damu Auto" loading="lazy" decoding="async"
        className={LOGO_BOX}
        style={{ filter: 'brightness(0.32) saturate(0.7)' }}
      />

      {/* natural logo, revealed only inside the orbiting spotlight — the light
          restores the logo to its true look (no yellow tint) */}
      <motion.div
        aria-hidden className="absolute inset-0"
        style={{ WebkitMaskImage: SPOTLIGHT, maskImage: SPOTLIGHT }}
        animate={CCW} transition={SPIN}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          src={LOGO} alt="" aria-hidden loading="lazy" decoding="async"
          className={LOGO_BOX}
          style={{ filter: 'brightness(1.45) saturate(1.05) drop-shadow(0 0 10px rgba(251,232,196,0.45))' }}
          animate={CW} transition={SPIN}
        />
      </motion.div>

      {/* faint track ring */}
      <div
        aria-hidden className="absolute inset-0 rounded-full"
        style={{ background: 'rgba(196,154,69,0.10)', WebkitMaskImage: RING, maskImage: RING }}
      />

      {/* comet wide soft halo — makes the directional light obviously the comet */}
      <motion.div
        aria-hidden className="absolute inset-0 rounded-full"
        style={{ background: COMET, WebkitMaskImage: RING, maskImage: RING, filter: 'blur(9px)', opacity: 0.95 }}
        animate={CCW} transition={SPIN}
      />
      {/* comet soft glow trail */}
      <motion.div
        aria-hidden className="absolute inset-0 rounded-full"
        style={{ background: COMET, WebkitMaskImage: RING, maskImage: RING, filter: 'blur(3px)', opacity: 0.95 }}
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
