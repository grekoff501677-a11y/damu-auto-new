'use client'

import { GradientTracing } from '@/components/ui/gradient-tracing'
import { cn } from '@/lib/utils'

// Знак DAMU (вектор). e_trim обрезает пустые поля артборда SVG (обязателен),
// f_auto,q_auto,w_700 отдаёт оптимизированный растр (~23 КБ).
const LOGO =
  'https://res.cloudinary.com/djjcxxgfm/image/upload/e_trim/f_auto,q_auto,w_700/v1781179834/%D0%B4%D0%B0%D0%BC%D1%832_ztg9td.svg'

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

      {/* emblem, slightly shaded */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO} alt="Damu Auto" loading="lazy" decoding="async"
        className="absolute inset-[12%] h-[76%] w-[76%] object-contain"
        style={{ filter: 'brightness(0.9) drop-shadow(0 0 26px rgba(196,154,69,0.22))' }}
      />

      {/* gentle light from below — where the pulse lives */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: 'radial-gradient(circle at 50% 92%, rgba(241,223,174,0.12) 0%, transparent 52%)' }}
      />

      {/* gold gradient pulse tracing the circle; rotated 90° so the light
          sits at 6 o'clock instead of the side; no static track */}
      <div className="absolute inset-0" aria-hidden style={{ transform: 'rotate(90deg)' }}>
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
