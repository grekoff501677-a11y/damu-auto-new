'use client'

import { useRef, useState, useCallback } from 'react'
import { motion } from 'motion/react'
import { ShieldCheck, ShieldX, Search, Move } from 'lucide-react'
import { cn } from '@/lib/utils'

type Side = {
  label: string
  /** real high-res image URL (optional). If omitted, a procedural texture is used. */
  image?: string
  /** CSS background for procedural demo texture */
  texture: string
}

type Props = {
  /** authentic (left) */
  original: Side
  /** counterfeit (right) */
  counterfeit: Side
  className?: string
  caption?: string
}

const ZOOM = 2.6
const LENS = 150 // px

export function MacroCompareSlider({ original, counterfeit, className, caption }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState(50)          // slider %
  const [lens, setLens] = useState<{ x: number; y: number } | null>(null)
  const [active, setActive] = useState(false) // macro lens engaged

  const rectOf = () => ref.current?.getBoundingClientRect()

  const updateSlider = useCallback((clientX: number) => {
    const rect = rectOf()
    if (!rect) return
    const p = ((clientX - rect.left) / rect.width) * 100
    setPos(Math.min(100, Math.max(0, p)))
  }, [])

  const onLensMove = useCallback((clientX: number, clientY: number) => {
    const rect = rectOf()
    if (!rect) return
    setLens({ x: clientX - rect.left, y: clientY - rect.top })
  }, [])

  // which side is under the lens?
  const lensSidePct = lens && rectOf()
    ? (lens.x / rectOf()!.width) * 100
    : 50
  const overOriginal = lensSidePct < pos
  const lensSide = overOriginal ? original : counterfeit

  return (
    <div className={cn('select-none', className)}>
      <div
        ref={ref}
        className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-glass-border bg-surface"
        style={{ cursor: active ? 'none' : 'ew-resize' }}
        onMouseMove={(e) => {
          if (active) onLensMove(e.clientX, e.clientY)
          else if (e.buttons === 1) updateSlider(e.clientX)
        }}
        onMouseDown={(e) => { if (!active) updateSlider(e.clientX) }}
        onMouseLeave={() => setLens(null)}
      >
        {/* counterfeit (base) */}
        <Layer side={counterfeit} badge="fake" />

        {/* original (clipped overlay) */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <Layer side={original} badge="real" />
        </div>

        {/* divider handle */}
        <div className="absolute inset-y-0 z-20" style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}>
          <div className="h-full w-px bg-white/70 shadow-[0_0_12px_rgba(255,255,255,0.5)]" />
          <div className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 backdrop-blur-md">
            <Move className="h-4 w-4 text-white" />
          </div>
        </div>

        {/* labels */}
        <Tag className="left-3 top-3 text-accent" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
          {original.label}
        </Tag>
        <Tag className="right-3 top-3 text-destructive" icon={<ShieldX className="h-3.5 w-3.5" />}>
          {counterfeit.label}
        </Tag>

        {/* ── Macro lens ── */}
        {active && lens && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="pointer-events-none absolute z-30 rounded-full border-2 border-white/60 shadow-2xl"
            style={{
              width: LENS, height: LENS,
              left: lens.x - LENS / 2, top: lens.y - LENS / 2,
              backgroundImage: lensSide.image ? `url(${lensSide.image})` : lensSide.texture,
              backgroundRepeat: lensSide.image ? 'no-repeat' : undefined,
              backgroundSize: lensSide.image
                ? `${(rectOf()?.width ?? 0) * ZOOM}px ${(rectOf()?.height ?? 0) * ZOOM}px`
                : `${48 * ZOOM}px ${48 * ZOOM}px`,
              backgroundPosition: `-${lens.x * ZOOM - LENS / 2}px -${lens.y * ZOOM - LENS / 2}px`,
              boxShadow: '0 0 0 4px rgba(0,0,0,0.4), 0 20px 40px -8px rgba(0,0,0,0.7)',
            }}
          >
            <span className={cn(
              'absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-600',
              overOriginal ? 'bg-accent/20 text-accent' : 'bg-destructive/20 text-destructive'
            )}>
              ×{ZOOM} {overOriginal ? 'оригинал' : 'подделка'}
            </span>
          </motion.div>
        )}
      </div>

      {/* controls */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">{caption}</p>
        <button
          onClick={() => setActive((v) => !v)}
          className={cn(
            'flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-600 transition-all duration-200 cursor-pointer',
            active
              ? 'border-accent/40 bg-accent/10 text-accent glow-accent'
              : 'border-glass-border text-muted-foreground hover:text-foreground'
          )}
        >
          <Search className="h-3.5 w-3.5" />
          {active ? 'Макро-линза включена' : 'Макро-линза'}
        </button>
      </div>
    </div>
  )
}

function Layer({ side, badge }: { side: Side; badge: 'real' | 'fake' }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: side.image ? `url(${side.image})` : side.texture,
        backgroundSize: side.image ? 'cover' : '48px 48px',
        backgroundPosition: 'center',
      }}
    >
      <div className={cn(
        'absolute inset-0',
        badge === 'real'
          ? 'bg-gradient-to-tr from-accent/10 via-transparent to-transparent'
          : 'bg-gradient-to-tl from-destructive/10 via-transparent to-transparent'
      )} />
    </div>
  )
}

function Tag({ children, icon, className }: { children: React.ReactNode; icon: React.ReactNode; className?: string }) {
  return (
    <span className={cn(
      'absolute z-20 flex items-center gap-1.5 rounded-full border border-glass-border bg-black/50 px-2.5 py-1 text-[11px] font-600 backdrop-blur-md',
      className
    )}>
      {icon}
      {children}
    </span>
  )
}
