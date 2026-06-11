'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

// Знак DAMU (вектор). e_trim обрезает пустые поля артборда SVG (обязателен),
// f_auto,q_auto,w_700 отдаёт оптимизированный растр (~23 КБ).
const LOGO =
  'https://res.cloudinary.com/djjcxxgfm/image/upload/e_trim/f_auto,q_auto,w_700/v1781179834/%D0%B4%D0%B0%D0%BC%D1%832_ztg9td.svg'

// ── Сценарий ─────────────────────────────────────────────────────────────
// Две тонкие кометы рождаются на 6 часах, поднимаются по обеим сторонам
// кольца и встречаются на 12. Выхватывания лого из тени НЕТ (по фидбеку) —
// только аккуратные золотые линии.

// тонкие conic-кометы (головы на 180° = низ)
const ARC_CW =
  'conic-gradient(from 0deg,' +
  ' rgba(231,201,132,0) 0deg, rgba(231,201,132,0) 118deg,' +
  ' rgba(212,180,112,0.07) 132deg, rgba(231,201,132,0.5) 166deg,' +
  ' rgba(244,226,180,0.97) 180deg, rgba(244,226,180,0) 184deg,' +
  ' rgba(231,201,132,0) 360deg)'
const ARC_CCW =
  'conic-gradient(from 0deg,' +
  ' rgba(231,201,132,0) 0deg, rgba(231,201,132,0) 176deg,' +
  ' rgba(244,226,180,0.97) 180deg, rgba(231,201,132,0.5) 194deg,' +
  ' rgba(212,180,112,0.07) 228deg, rgba(231,201,132,0) 242deg,' +
  ' rgba(231,201,132,0) 360deg)'

const RING = 'radial-gradient(circle closest-side, transparent 0 90.6%, #000 91.6%, #000 92.4%, transparent 93.4%)'
const RING_GLOW = 'radial-gradient(circle closest-side, transparent 0 88%, #000 91%, #000 93%, transparent 96%)'

const DUR = 4.4
// кометы доезжают до 12 часов к 88% цикла и гаснут
const ROT = { duration: DUR, repeat: Infinity, ease: 'linear' as const, times: [0, 0.88, 1] }
const ARC_FADE = { duration: DUR, repeat: Infinity, ease: 'linear' as const, times: [0, 0.06, 0.88, 1] }

const LOGO_BOX = 'absolute inset-[12%] h-[76%] w-[76%] object-contain'

// дуга (чёткая линия + мягкий glow), едет от 6 часов к 12 по своей стороне
function Comet({ gradient, to }: { gradient: string; to: number }) {
  return (
    <>
      <motion.div
        aria-hidden className="absolute inset-0 rounded-full"
        style={{ background: gradient, WebkitMaskImage: RING_GLOW, maskImage: RING_GLOW, filter: 'blur(6px)' }}
        animate={{ rotate: [0, to, to], opacity: [0, 1, 1, 0] }}
        transition={{ rotate: ROT, opacity: ARC_FADE }}
      />
      <motion.div
        aria-hidden className="absolute inset-0 rounded-full"
        style={{ background: gradient, WebkitMaskImage: RING, maskImage: RING }}
        animate={{ rotate: [0, to, to], opacity: [0, 1, 1, 0] }}
        transition={{ rotate: ROT, opacity: ARC_FADE }}
      />
    </>
  )
}

export function HeroLogo({ className }: { className?: string }) {
  return (
    <div className={cn('relative aspect-square', className)}>
      {/* эмблема в естественной яркости + лёгкое золотое свечение */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO} alt="Damu Auto" loading="lazy" decoding="async"
        className={LOGO_BOX}
        style={{ filter: 'drop-shadow(0 0 26px rgba(196,154,69,0.22))' }}
      />

      {/* две тонкие кометы: правая (CW 6→3→12) и левая (CCW 6→9→12) */}
      <Comet gradient={ARC_CCW} to={-180} />
      <Comet gradient={ARC_CW} to={180} />
    </div>
  )
}
