'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

const LOGO =
  'https://res.cloudinary.com/djjcxxgfm/image/upload/f_auto,q_auto,w_700/v1781097287/%D0%91%D0%B5%D0%B7_%D0%BD%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F_%D0%BA%D0%BE%D0%BF%D0%B8%D1%8F_1_tcyixo.svg'

// ── Comet ────────────────────────────────────────────────────────────────
// Head at 0deg (top). CCW rotation → head leads, tail trails clockwise.
// Three arcs of DIFFERENT length stacked on ring bands of DIFFERENT width:
// near the head all layers overlap (thick, hot, bloomy), the far tail is the
// thin core alone — so the tail visibly tapers instead of being a flat line.
const COMET_CORE =
  'conic-gradient(from 0deg,' +
  ' rgba(255,250,240,1) 0deg,' +
  ' rgba(246,224,170,0.85) 14deg,' +
  ' rgba(226,194,126,0.5) 46deg,' +
  ' rgba(212,180,112,0.22) 92deg,' +
  ' rgba(206,174,106,0.07) 132deg,' +
  ' rgba(206,174,106,0) 166deg,' +
  ' transparent 360deg)'
const COMET_MID =
  'conic-gradient(from 0deg,' +
  ' rgba(255,246,228,0.95) 0deg,' +
  ' rgba(240,212,152,0.55) 18deg,' +
  ' rgba(222,188,120,0.24) 56deg,' +
  ' rgba(222,188,120,0) 106deg,' +
  ' transparent 360deg)'
const COMET_HALO =
  'conic-gradient(from 0deg,' +
  ' rgba(255,242,214,0.9) 0deg,' +
  ' rgba(238,208,144,0.42) 22deg,' +
  ' rgba(230,198,130,0) 72deg,' +
  ' transparent 360deg)'

// ring bands (% of closest-side): narrow for the crisp core, wide for bloom.
// NO static track underneath — the comet floats on its own.
const RING_CORE = 'radial-gradient(circle closest-side, transparent 0 89%, #000 90.5%, #000 92%, transparent 93.5%)'
const RING_SOFT = 'radial-gradient(circle closest-side, transparent 0 86%, #000 89.5%, #000 93%, transparent 96.5%)'

// soft moving spotlight that REVEALS the natural logo (no colour overlay).
// Long multi-stop falloff → diffused penumbra, no visible light boundary.
const SPOTLIGHT =
  'radial-gradient(circle at 50% 9%,' +
  ' #000 0%, #000 13%,' +
  ' rgba(0,0,0,0.85) 24%,' +
  ' rgba(0,0,0,0.55) 36%,' +
  ' rgba(0,0,0,0.28) 49%,' +
  ' rgba(0,0,0,0.10) 62%,' +
  ' transparent 76%)'

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

      {/* comet wide bloom — shortest arc, widest band, heaviest blur */}
      <motion.div
        aria-hidden className="absolute inset-0 rounded-full"
        style={{ background: COMET_HALO, WebkitMaskImage: RING_SOFT, maskImage: RING_SOFT, filter: 'blur(14px)', opacity: 0.85 }}
        animate={CCW} transition={SPIN}
      />
      {/* comet glow trail — medium arc */}
      <motion.div
        aria-hidden className="absolute inset-0 rounded-full"
        style={{ background: COMET_MID, WebkitMaskImage: RING_SOFT, maskImage: RING_SOFT, filter: 'blur(4px)', opacity: 0.95 }}
        animate={CCW} transition={SPIN}
      />
      {/* comet crisp core — longest arc, thinnest band → tapering tail tip */}
      <motion.div
        aria-hidden className="absolute inset-0 rounded-full"
        style={{ background: COMET_CORE, WebkitMaskImage: RING_CORE, maskImage: RING_CORE }}
        animate={CCW} transition={SPIN}
      />
      {/* comet head — hot core with a soft round bloom (no mask, orbits with the arcs) */}
      <motion.div aria-hidden className="absolute inset-0" animate={CCW} transition={SPIN}>
        <span
          className="absolute left-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            top: '4.4%', // ring band centre: 50% − (91.25% of the 50% radius)
            width: '9%', height: '9%',
            background:
              'radial-gradient(circle, rgba(255,255,250,0.95) 0%, rgba(255,243,212,0.5) 24%, rgba(243,213,150,0.16) 48%, transparent 70%)',
          }}
        />
      </motion.div>
    </div>
  )
}
