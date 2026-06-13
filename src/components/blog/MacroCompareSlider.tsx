'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { motion } from 'motion/react'
import { ShieldCheck, ShieldX, Search, Move } from 'lucide-react'
import { cn } from '@/lib/utils'

type Side = {
  label: string
  image?: string
  texture?: string
}

type Props = {
  original: Side
  counterfeit: Side
  className?: string
  caption?: string
}

const ZOOM = 2.6
const LENS = 150          // px diameter
const TOUCH_OFFSET = 96   // lens sits this far above the thumb
const LONG_PRESS = 300    // ms

export function MacroCompareSlider({ original, counterfeit, className, caption }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startX = useRef(0)
  const dragging = useRef(false)

  const [pos, setPos] = useState(50)
  const [source, setSource] = useState<{ x: number; y: number } | null>(null) // point being magnified
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [lensOn, setLensOn] = useState(false)        // mouse toggle
  const [touchLens, setTouchLens] = useState(false)  // touch hold

  const rectOf = () => ref.current?.getBoundingClientRect()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const syncSize = () => {
      const rect = el.getBoundingClientRect()
      setSize({ width: rect.width, height: rect.height })
    }
    syncSize()
    const ro = new ResizeObserver(syncSize)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const updateSlider = useCallback((clientX: number) => {
    const rect = rectOf(); if (!rect) return
    setPos(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)))
  }, [])

  const setSrc = useCallback((clientX: number, clientY: number) => {
    const rect = rectOf(); if (!rect) return
    setSource({ x: clientX - rect.left, y: clientY - rect.top })
  }, [])

  function clearPress() {
    if (pressTimer.current) { clearTimeout(pressTimer.current); pressTimer.current = null }
  }

  function onPointerDown(e: React.PointerEvent) {
    const isTouch = e.pointerType === 'touch'
    startX.current = e.clientX
    dragging.current = false
    if (isTouch) {
      setSrc(e.clientX, e.clientY)
      pressTimer.current = setTimeout(() => { setTouchLens(true); setSrc(e.clientX, e.clientY) }, LONG_PRESS)
    } else if (!lensOn) {
      updateSlider(e.clientX)
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    const isTouch = e.pointerType === 'touch'
    if (isTouch) {
      if (touchLens) { setSrc(e.clientX, e.clientY); return }
      if (Math.abs(e.clientX - startX.current) > 6) { dragging.current = true; clearPress(); updateSlider(e.clientX) }
    } else {
      if (lensOn) setSrc(e.clientX, e.clientY)
      else if (e.buttons === 1) updateSlider(e.clientX)
    }
  }

  function onPointerEnd(e: React.PointerEvent) {
    clearPress()
    if (e.pointerType === 'touch') { setTouchLens(false); setSource(null) }
  }

  // which side is magnified?
  const overOriginal = source && size.width ? (source.x / size.width) * 100 < pos : false
  const lensSide = overOriginal ? original : counterfeit
  const active = lensOn || touchLens

  // lens box is drawn above the thumb on touch
  const lensCenterY = source ? source.y - (touchLens ? TOUCH_OFFSET : 0) : 0

  return (
    <div className={cn('select-none', className)}>
      <div
        ref={ref}
        className="relative aspect-[16/10] w-full touch-none overflow-hidden rounded-2xl border border-glass-border bg-surface"
        style={{ cursor: lensOn ? 'none' : 'ew-resize' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onPointerLeave={(e) => { if (e.pointerType !== 'touch') setSource(null); onPointerEnd(e) }}
        onPointerEnter={(e) => { if (e.pointerType !== 'touch' && lensOn) setSrc(e.clientX, e.clientY) }}
      >
        <Layer side={counterfeit} badge="fake" />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <Layer side={original} badge="real" />
        </div>

        {/* divider */}
        <div className="absolute inset-y-0 z-20" style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}>
          <div className="h-full w-px bg-accent/80 shadow-[0_0_12px_rgba(196,154,69,0.6)]" />
          <div className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent/40 bg-black/50 backdrop-blur-md">
            <Move className="h-4 w-4 text-accent" />
          </div>
        </div>

        <Tag className="left-3 top-3 text-accent" icon={<ShieldCheck className="h-3.5 w-3.5" />}>{original.label}</Tag>
        <Tag className="right-3 top-3 text-destructive" icon={<ShieldX className="h-3.5 w-3.5" />}>{counterfeit.label}</Tag>

        {/* Macro lens */}
        {active && source && size.width > 0 && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="pointer-events-none absolute z-30 rounded-full border-2 border-accent/70"
            style={{
              width: LENS, height: LENS,
              left: source.x - LENS / 2, top: lensCenterY - LENS / 2,
              backgroundImage: lensSide.image ? `url(${lensSide.image})` : lensSide.texture,
              backgroundRepeat: lensSide.image ? 'no-repeat' : undefined,
              backgroundSize: lensSide.image
                ? `${size.width * ZOOM}px ${size.height * ZOOM}px`
                : `${48 * ZOOM}px ${48 * ZOOM}px`,
              backgroundPosition: `-${source.x * ZOOM - LENS / 2}px -${source.y * ZOOM - LENS / 2}px`,
              boxShadow: '0 0 0 4px rgba(0,0,0,0.4), 0 20px 40px -8px rgba(0,0,0,0.7), 0 0 24px -4px rgba(196,154,69,0.5)',
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
        <p className="text-xs text-muted-foreground">
          {caption}
          <span className="ml-1 text-muted-foreground/60 sm:hidden">· удержите для макро-линзы</span>
        </p>
        <button
          onClick={() => setLensOn((v) => !v)}
          className={cn(
            'hidden min-h-10 items-center gap-2 rounded-lg border px-3 text-xs font-600 transition-all duration-200 cursor-pointer sm:flex',
            lensOn ? 'border-accent/40 bg-accent/10 text-accent glow-accent' : 'border-glass-border text-muted-foreground hover:text-foreground'
          )}
        >
          <Search className="h-3.5 w-3.5" />
          {lensOn ? 'Макро-линза включена' : 'Макро-линза'}
        </button>
      </div>
    </div>
  )
}

function Layer({ side, badge }: { side: Side; badge: 'real' | 'fake' }) {
  return (
    <div className="absolute inset-0" style={{
      backgroundImage: side.image ? `url(${side.image})` : side.texture,
      backgroundSize: side.image ? 'cover' : '48px 48px',
      backgroundPosition: 'center',
    }}>
      <div className={cn('absolute inset-0',
        badge === 'real'
          ? 'bg-gradient-to-tr from-accent/10 via-transparent to-transparent'
          : 'bg-gradient-to-tl from-destructive/10 via-transparent to-transparent'
      )} />
    </div>
  )
}

function Tag({ children, icon, className }: { children: React.ReactNode; icon: React.ReactNode; className?: string }) {
  return (
    <span className={cn('absolute z-20 flex items-center gap-1.5 rounded-full border border-glass-border bg-black/50 px-2.5 py-1 text-[11px] font-600 backdrop-blur-md', className)}>
      {icon}{children}
    </span>
  )
}
