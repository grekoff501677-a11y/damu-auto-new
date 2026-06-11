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

// зона выхватывания (снизу, где живёт пульс на 6 часах): длинная полутень,
// гаснет ЗАДОЛГО до краёв блока — никаких квадратных обрезов
const SPOT =
  'radial-gradient(circle at 50% 84%,' +
  ' #000 0%, #000 20%, rgba(0,0,0,0.82) 33%, rgba(0,0,0,0.52) 45%,' +
  ' rgba(0,0,0,0.24) 57%, rgba(0,0,0,0.07) 67%, transparent 76%)'

// тёплое свечение от пульса — мягко освещает тень снизу (погашено рано)
const GLOW =
  'radial-gradient(circle at 50% 88%, rgba(244,226,180,0.20) 0%, rgba(231,201,132,0.08) 32%, transparent 58%)'

const LOGO_BOX = 'absolute inset-[12%] h-[76%] w-[76%] object-contain'

export function HeroLogo({ className }: { className?: string }) {
  return (
    <div className={cn('relative aspect-square', className)}>
      {/* эмблема в тени */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO} alt="Damu Auto" loading="lazy" decoding="async"
        className={LOGO_BOX}
        style={{ filter: 'brightness(0.4) saturate(0.82)' }}
      />

      {/* тёплое освещение тени снизу */}
      <div aria-hidden className="absolute inset-0" style={{ background: GLOW }} />

      {/* свет мягко выхватывает эмблему из тени (нижняя часть) */}
      <div aria-hidden className="absolute inset-0" style={{ WebkitMaskImage: SPOT, maskImage: SPOT }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LOGO} alt="" aria-hidden loading="lazy" decoding="async"
          className={LOGO_BOX}
          style={{ filter: 'brightness(1.4) drop-shadow(0 0 16px rgba(244,226,180,0.4))' }}
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
