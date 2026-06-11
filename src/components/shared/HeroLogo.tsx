'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

// Знак DAMU (вектор). e_trim обрезает пустые поля артборда SVG (обязателен),
// f_auto,q_auto,w_700 отдаёт оптимизированный растр (~23 КБ).
const LOGO =
  'https://res.cloudinary.com/djjcxxgfm/image/upload/e_trim/f_auto,q_auto,w_700/v1781179834/%D0%B4%D0%B0%D0%BC%D1%832_ztg9td.svg'

// ── Сценарий ─────────────────────────────────────────────────────────────
// Две кометы рождаются на 6 часах, поднимаются по обеим сторонам кольца и
// встречаются на 12. Каждая везёт с собой мягкий спотлайт, выхватывающий
// логотип из тени со своей стороны. В момент встречи арки гаснут и по
// логотипу сверху вниз мягким градиентом проходит свет.

// тонкие conic-кометы (головы на 180° = низ), толщина как у tracing-линии
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

// спотлайт у головы кометы (внизу в нулевой позиции), длинная полутень —
// гаснет к 70%, до краёв блока не дотягивается (без «квадратов»)
const SPOT =
  'radial-gradient(circle at 50% 91%,' +
  ' #000 0%, #000 14%, rgba(0,0,0,0.78) 25%, rgba(0,0,0,0.45) 37%,' +
  ' rgba(0,0,0,0.2) 49%, rgba(0,0,0,0.06) 60%, transparent 70%)'

// финальная заливка: свет проходит по лого сверху вниз мягким градиентом
const WASH = 'linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.75) 35%, rgba(0,0,0,0.35) 65%, transparent 92%)'

const DUR = 4.4
// кометы доезжают до 12 часов к 88% цикла и гаснут; заливка вспыхивает
// в момент встречи и тает к началу нового цикла
const ROT = { duration: DUR, repeat: Infinity, ease: 'linear' as const, times: [0, 0.88, 1] }
const ARC_FADE = { duration: DUR, repeat: Infinity, ease: 'linear' as const, times: [0, 0.06, 0.88, 1] }
const WASH_FADE = { duration: DUR, repeat: Infinity, ease: 'linear' as const, times: [0, 0.8, 0.9, 1] }

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

// спотлайт, едущий вместе с кометой; внутренний <img> контр-вращается,
// чтобы выхваченный логотип оставался ровным
function Reveal({ to }: { to: number }) {
  return (
    <motion.div
      aria-hidden className="absolute inset-0"
      style={{ WebkitMaskImage: SPOT, maskImage: SPOT }}
      animate={{ rotate: [0, to, to], opacity: [0, 1, 1, 0] }}
      transition={{ rotate: ROT, opacity: ARC_FADE }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <motion.img
        src={LOGO} alt="" aria-hidden loading="lazy" decoding="async"
        className={LOGO_BOX}
        style={{ filter: 'brightness(1.25) drop-shadow(0 0 12px rgba(244,226,180,0.3))' }}
        animate={{ rotate: [0, -to, -to] }}
        transition={{ rotate: ROT }}
      />
    </motion.div>
  )
}

export function HeroLogo({ className }: { className?: string }) {
  return (
    <div className={cn('relative aspect-square', className)}>
      {/* эмблема в тени */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO} alt="Damu Auto" loading="lazy" decoding="async"
        className={LOGO_BOX}
        style={{ filter: 'brightness(0.45) saturate(0.85)' }}
      />

      {/* свет комет по своим сторонам: правая (CW: 6→3→12) и левая (CCW: 6→9→12) */}
      <Reveal to={-180} />
      <Reveal to={180} />

      {/* финал: при встрече на 12 часах свет мягко проходит по лого сверху вниз */}
      <motion.div
        aria-hidden className="absolute inset-0"
        style={{ WebkitMaskImage: WASH, maskImage: WASH }}
        animate={{ opacity: [0, 0, 0.9, 0] }}
        transition={{ opacity: WASH_FADE }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LOGO} alt="" aria-hidden loading="lazy" decoding="async"
          className={LOGO_BOX}
          style={{ filter: 'brightness(1.22) drop-shadow(0 0 14px rgba(244,226,180,0.28))' }}
        />
      </motion.div>

      {/* сами кометы */}
      <Comet gradient={ARC_CCW} to={-180} />
      <Comet gradient={ARC_CW} to={180} />
    </div>
  )
}
