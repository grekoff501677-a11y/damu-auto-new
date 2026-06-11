'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

// Новый знак DAMU (вектор). e_trim обрезает пустые поля артборда SVG,
// f_auto,q_auto,w_700 отдаёт оптимизированный растр (~23 КБ).
const LOGO =
  'https://res.cloudinary.com/djjcxxgfm/image/upload/e_trim/f_auto,q_auto,w_700/v1781179834/%D0%B4%D0%B0%D0%BC%D1%832_ztg9td.svg'

// ── Choreography ─────────────────────────────────────────────────────────
// Two light pulses are born at 12 and 6 o'clock, split in BOTH directions
// and meet at 3 and 9 o'clock, fading as they merge. Implemented as two
// counter-rotating layers (0→+90° and 0→−90°), each carrying two thin
// comet arcs (heads at 0° and 180°); opacity is keyed so the cycle starts
// at the vertical axis and dies on the horizontal one.

// heads lead CLOCKWISE (tail ramps up behind the head, sharp front edge)
const ARC_CW =
  'conic-gradient(from 0deg,' +
  ' rgba(244,226,180,0.95) 0deg, rgba(231,201,132,0) 4deg,' +
  ' rgba(231,201,132,0) 118deg, rgba(212,180,112,0.06) 130deg,' +
  ' rgba(231,201,132,0.45) 162deg, rgba(244,226,180,0.95) 180deg,' +
  ' rgba(231,201,132,0) 184deg, rgba(231,201,132,0) 298deg,' +
  ' rgba(212,180,112,0.06) 310deg, rgba(231,201,132,0.45) 342deg,' +
  ' rgba(244,226,180,0.95) 360deg)'

// mirror: heads lead COUNTER-clockwise (tail trails at increasing angles)
const ARC_CCW =
  'conic-gradient(from 0deg,' +
  ' rgba(244,226,180,0.95) 0deg, rgba(231,201,132,0.45) 18deg,' +
  ' rgba(212,180,112,0.06) 50deg, rgba(231,201,132,0) 62deg,' +
  ' rgba(231,201,132,0) 176deg, rgba(244,226,180,0.95) 180deg,' +
  ' rgba(231,201,132,0.45) 198deg, rgba(212,180,112,0.06) 230deg,' +
  ' rgba(231,201,132,0) 242deg, rgba(231,201,132,0) 356deg,' +
  ' rgba(244,226,180,0.95) 360deg)'

// thin elegant ring bands (the look the user liked in gradient-tracing)
const RING = 'radial-gradient(circle closest-side, transparent 0 90%, #000 91.5%, #000 92.5%, transparent 94%)'
const RING_GLOW = 'radial-gradient(circle closest-side, transparent 0 87%, #000 90.5%, #000 93.5%, transparent 97%)'

// twin diffused spotlights at 12 and 6 o'clock — long multi-stop penumbra,
// no visible light boundary; they ride inside the rotating layers and
// softly pull the logo out of shadow where the light lines pass
const SPOTS =
  'radial-gradient(circle at 50% 9%,' +
  ' #000 0%, #000 12%, rgba(0,0,0,0.8) 22%, rgba(0,0,0,0.5) 33%,' +
  ' rgba(0,0,0,0.25) 45%, rgba(0,0,0,0.08) 58%, transparent 70%),' +
  ' radial-gradient(circle at 50% 91%,' +
  ' #000 0%, #000 12%, rgba(0,0,0,0.8) 22%, rgba(0,0,0,0.5) 33%,' +
  ' rgba(0,0,0,0.25) 45%, rgba(0,0,0,0.08) 58%, transparent 70%)'

const DUR = 3.6
// rotation is linear over the whole cycle; light fades in fast at the
// vertical axis and dies right as the halves meet on the horizontal
const SPIN = { duration: DUR, repeat: Infinity, ease: 'linear' as const }
const FADE = { duration: DUR, repeat: Infinity, ease: 'linear' as const, times: [0, 0.08, 0.8, 1] }
const OPACITY = [0, 1, 1, 0]
const LOGO_BOX = 'absolute inset-[13%] h-[74%] w-[74%] object-contain'

function ArcPair({ gradient, to }: { gradient: string; to: number }) {
  return (
    <>
      <motion.div
        aria-hidden className="absolute inset-0 rounded-full"
        style={{ background: gradient, WebkitMaskImage: RING_GLOW, maskImage: RING_GLOW, filter: 'blur(7px)' }}
        animate={{ rotate: [0, to], opacity: OPACITY }}
        transition={{ rotate: SPIN, opacity: FADE }}
      />
      <motion.div
        aria-hidden className="absolute inset-0 rounded-full"
        style={{ background: gradient, WebkitMaskImage: RING, maskImage: RING }}
        animate={{ rotate: [0, to], opacity: OPACITY }}
        transition={{ rotate: SPIN, opacity: FADE }}
      />
    </>
  )
}

function Reveal({ to }: { to: number }) {
  return (
    <motion.div
      aria-hidden className="absolute inset-0"
      style={{ WebkitMaskImage: SPOTS, maskImage: SPOTS }}
      animate={{ rotate: [0, to], opacity: OPACITY }}
      transition={{ rotate: SPIN, opacity: FADE }}
    >
      {/* counter-spin keeps the revealed logo upright */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <motion.img
        src={LOGO} alt="" aria-hidden loading="lazy" decoding="async"
        className={LOGO_BOX}
        style={{ filter: 'brightness(1.45) saturate(1.05) drop-shadow(0 0 10px rgba(251,232,196,0.45))' }}
        animate={{ rotate: [0, -to] }}
        transition={{ rotate: SPIN }}
      />
    </motion.div>
  )
}

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

      {/* natural logo revealed where the light passes (both directions) */}
      <Reveal to={90} />
      <Reveal to={-90} />

      {/* thin gold arcs: born at 12/6, meet at 3/9 */}
      <ArcPair gradient={ARC_CW} to={90} />
      <ArcPair gradient={ARC_CCW} to={-90} />
    </div>
  )
}
