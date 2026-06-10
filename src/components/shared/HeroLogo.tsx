'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

const LOGO =
  'https://res.cloudinary.com/djjcxxgfm/image/upload/f_auto,q_auto,w_700/v1781090790/%D0%91%D0%B5%D0%B7_%D0%BD%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F_%D0%BA%D0%BE%D0%BF%D0%B8%D1%8F_ibm0gt.svg'

// One-tailed comet: bright head at 0deg (top), single tail fading clockwise. No hard dot.
const COMET =
  'conic-gradient(from 0deg,' +
  ' rgba(255,247,228,0.95) 0deg,' +
  ' rgba(226,196,128,0.6) 16deg,' +
  ' rgba(217,184,112,0.22) 52deg,' +
  ' rgba(217,184,112,0.05) 96deg,' +
  ' rgba(217,184,112,0) 140deg,' +
  ' rgba(217,184,112,0) 360deg)'

const RING = 'radial-gradient(circle closest-side, transparent 0 90%, #000 92%, #000 94%, transparent 96%)'

const SPIN = { duration: 7, repeat: Infinity, ease: 'linear' as const }
const CW = { rotate: 360 }
const LOGO_BOX = 'absolute inset-[12%] h-[76%] w-[76%] object-contain'

export function HeroLogo({ className }: { className?: string }) {
  return (
    <div className={cn('relative aspect-square', className)}>
      {/* logo, deep in shadow */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO} alt="Damu Auto" loading="lazy" decoding="async"
        className={LOGO_BOX}
        style={{ filter: 'brightness(0.5) saturate(0.85)' }}
      />

      {/* travelling light — large, heavily blurred, fully fading: lifts the nearby
          part of the logo out of shadow with no visible boundary */}
      <motion.div aria-hidden className="absolute inset-0" style={{ mixBlendMode: 'screen' }} animate={CW} transition={SPIN}>
        <div
          className="absolute rounded-full"
          style={{
            left: '50%', top: '14%', width: '88%', aspectRatio: '1',
            transform: 'translate(-50%, -50%)',
            background:
              'radial-gradient(circle, rgba(255,244,218,0.5) 0%, rgba(217,184,112,0.16) 32%, rgba(217,184,112,0) 64%)',
            filter: 'blur(14px)',
          }}
        />
      </motion.div>

      {/* faint track ring */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{ background: 'rgba(196,154,69,0.10)', WebkitMaskImage: RING, maskImage: RING }}
      />

      {/* comet — soft blurred glow trail */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{ background: COMET, WebkitMaskImage: RING, maskImage: RING, filter: 'blur(5px)', opacity: 0.7 }}
        animate={CW} transition={SPIN}
      />
      {/* comet — crisp line on top (head bright → single tail) */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{ background: COMET, WebkitMaskImage: RING, maskImage: RING }}
        animate={CW} transition={SPIN}
      />
    </div>
  )
}
