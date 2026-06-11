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

// мягкий свет снизу (6 часов): длинная полутень, гаснет ЗАДОЛГО до краёв
// блока — никаких квадратных обрезов свечения
const SPOT =
  'radial-gradient(circle at 50% 86%,' +
  ' #000 0%, #000 16%, rgba(0,0,0,0.8) 28%, rgba(0,0,0,0.5) 40%,' +
  ' rgba(0,0,0,0.22) 52%, rgba(0,0,0,0.06) 62%, transparent 70%)'

const LOGO_BOX = 'absolute inset-[12%] h-[76%] w-[76%] object-contain'

export function HeroLogo({ className }: { className?: string }) {
  return (
    <div className={cn('relative aspect-square', className)}>
      {/* эмблема в лёгкой тени */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO} alt="Damu Auto" loading="lazy" decoding="async"
        className={LOGO_BOX}
        style={{ filter: 'brightness(0.45) saturate(0.85)' }}
      />

      {/* свет снизу выхватывает эмблему из тени */}
      <div aria-hidden className="absolute inset-0" style={{ WebkitMaskImage: SPOT, maskImage: SPOT }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LOGO} alt="" aria-hidden loading="lazy" decoding="async"
          className={LOGO_BOX}
          style={{ filter: 'brightness(1.2) drop-shadow(0 0 12px rgba(244,226,180,0.3))' }}
        />
      </div>

      {/* золотой пульс по кольцу; −90° → свет живёт на 6 часах (внизу) */}
      <div className="absolute inset-0" aria-hidden style={{ transform: 'rotate(-90deg)' }}>
        <GradientTracing
          responsive
          width={SIZE}
          height={SIZE}
          strokeWidth={2.5}
          baseColor="transparent"
          gradientColors={['#F1DFAE', '#E7C984', '#C49A45']}
          animationDuration={4}
          path={CIRCLE}
        />
      </div>
    </div>
  )
}
