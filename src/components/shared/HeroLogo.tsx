'use client'

import { GradientTracing } from '@/components/ui/gradient-tracing'
import { cn } from '@/lib/utils'

// TODO: заменить на новый знак, когда будет файл с рендеримым слоем
// (.ai сохранён без PDF-совместимости — Cloudinary отдаёт пустой растр).
// Замена = одна строка: новый URL с f_auto,q_auto,w_700.
const LOGO =
  'https://res.cloudinary.com/djjcxxgfm/image/upload/f_auto,q_auto,w_700/v1781097287/%D0%91%D0%B5%D0%B7_%D0%BD%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F_%D0%BA%D0%BE%D0%BF%D0%B8%D1%8F_1_tcyixo.svg'

// design space for the tracing ring (scales to the container via viewBox)
const SIZE = 600
const R = 282
const CIRCLE =
  `M${SIZE / 2},${SIZE / 2 - R}` +
  ` A${R},${R} 0 1,1 ${SIZE / 2},${SIZE / 2 + R}` +
  ` A${R},${R} 0 1,1 ${SIZE / 2},${SIZE / 2 - R}`

export function HeroLogo({ className }: { className?: string }) {
  return (
    <div className={cn('relative aspect-square', className)}>
      {/* ambient gold wash behind the emblem */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(196,154,69,0.14) 0%, transparent 64%)' }}
      />

      {/* emblem at natural brightness */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO} alt="Damu Auto" loading="lazy" decoding="async"
        className="absolute inset-[12%] h-[76%] w-[76%] object-contain"
        style={{ filter: 'drop-shadow(0 0 26px rgba(196,154,69,0.22))' }}
      />

      {/* gold gradient pulse tracing a circle around the emblem;
          baseColor transparent → no static track (по фидбеку) */}
      <div className="absolute inset-0" aria-hidden>
        <GradientTracing
          responsive
          width={SIZE}
          height={SIZE}
          strokeWidth={2.5}
          baseColor="transparent"
          gradientColors={['#F1DFAE', '#E7C984', '#C49A45']}
          animationDuration={3.2}
          path={CIRCLE}
        />
      </div>
    </div>
  )
}
