'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { FogBackground } from '@/components/ui/realistic-fog-background'
import type { BlueprintHotspot } from '@/lib/types'

export type BodyNode = 'engine' | 'cabin' | 'brakes' | 'transmission' | 'cooling'

export type BlueprintData = { image: string; hotspots: BlueprintHotspot[] }

const NODES: Record<BodyNode, { x: number; y: number; label: string }> = {
  engine:       { x: 88,  y: 116, label: 'Двигатель' },
  cooling:      { x: 56,  y: 126, label: 'Система охлаждения' },
  cabin:        { x: 196, y: 78,  label: 'Салон' },
  transmission: { x: 168, y: 150, label: 'Трансмиссия' },
  brakes:       { x: 312, y: 168, label: 'Тормоза' },
}

type Props = {
  active: BodyNode[]
  className?: string
  blueprint?: BlueprintData
}

export function VehicleBlueprint({ active, className, blueprint }: Props) {
  // ── Image mode: AI wireframe render + glowing hotspot overlay ──
  if (blueprint?.image) {
    const hotspots = blueprint.hotspots ?? []
    const lines = hotspots.filter((h) => h.line)
    return (
      <div className={cn('relative overflow-hidden rounded-2xl', className)}>
        {/* animated mist behind the car (replaces static glow so node glows read clearly) */}
        <FogBackground className="pointer-events-none absolute inset-0 opacity-80" />
        {/* faint central lift */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 58% 44% at 50% 56%, rgba(196,154,69,0.10), transparent 70%)' }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={blueprint.image} alt="Схема автомобиля" loading="lazy" decoding="async" className="relative block h-auto w-full" />

        {/* leader lines */}
        {lines.length > 0 && (
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {lines.map((h) => {
              const on = !!h.bodyNode && active.includes(h.bodyNode)
              return (
                <line key={h.id} x1={h.x} y1={h.y} x2={h.line!.x2} y2={h.line!.y2}
                  stroke={on ? '#EAF6FF' : 'rgba(196,154,69,0.55)'} strokeWidth={1}
                  vectorEffect="non-scaling-stroke" strokeLinecap="round" />
              )
            })}
          </svg>
        )}

        {/* hotspots */}
        {hotspots.map((h) => {
          const decorative = !h.bodyNode
          const on = !!h.bodyNode && active.includes(h.bodyNode)
          const labelAtLine = !!h.line
          const lx = labelAtLine ? h.line!.x2 : h.x
          const ly = labelAtLine ? h.line!.y2 : h.y
          return (
            <div key={h.id} className="pointer-events-none absolute inset-0">
              {/* dot */}
              <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${h.x}%`, top: `${h.y}%` }}>
                {on && (
                  <motion.span
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{ width: 30, height: 30, background: 'rgba(56,189,248,0.35)' }}
                    animate={{ scale: [1, 1.7, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
                <span
                  className="relative block rounded-full transition-all duration-300"
                  style={
                    on
                      ? { width: 13, height: 13, background: '#EAF6FF', boxShadow: '0 0 0 2px #061521, 0 0 16px 5px rgba(56,189,248,0.9)' }
                      : decorative
                        ? { width: 9, height: 9, background: '#C49A45', boxShadow: '0 0 0 2px #061521, 0 0 8px 2px rgba(196,154,69,0.6)' }
                        : { width: 9, height: 9, background: 'rgba(234,246,255,0.55)', boxShadow: '0 0 0 2px #061521' }
                  }
                />
              </div>

              {/* label */}
              {h.label && (h.label.length > 0) && (on || decorative || labelAtLine) && (
                <span
                  className={cn(
                    'absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[9px] font-600 backdrop-blur-sm',
                    on ? 'border-sky-300/40 bg-black/70 text-sky-100'
                       : 'border-accent/30 bg-black/60 text-accent'
                  )}
                  style={{ left: `${lx}%`, top: `calc(${ly}% - 14px)` }}
                >
                  {h.label}
                </span>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // ── Fallback: schematic SVG silhouette ──
  return (
    <div className={className}>
      <svg viewBox="0 0 400 220" fill="none" className="h-full w-full">
        <defs>
          <linearGradient id="bp-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#D9B870" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#C49A45" stopOpacity="0.7" />
          </linearGradient>
          <filter id="bp-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <line x1="20" y1="196" x2="380" y2="196" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="2 6" />

        <motion.path
          d="M30 168 C30 150 34 140 52 136 C60 122 74 116 92 114 L120 90 C128 78 140 72 158 71 L250 69 C272 69 288 78 300 96 L356 104 C372 107 378 118 378 134 L378 168"
          stroke="url(#bp-stroke)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }} />
        <motion.path
          d="M124 112 L292 110 M132 90 L186 88 L188 110 M196 88 L256 87 L258 110"
          stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeLinecap="round"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.8 }} />
        <motion.line x1="216" y1="110" x2="216" y2="160" stroke="rgba(255,255,255,0.10)" strokeWidth="1"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.6 }} />

        {[120, 312].map((cx, i) => (
          <motion.g key={cx}
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + i * 0.15, type: 'spring', stiffness: 120, damping: 14 }}
            style={{ originX: `${cx}px`, originY: '170px' }}>
            <circle cx={cx} cy="170" r="26" stroke="url(#bp-stroke)" strokeWidth="1.75" />
            <circle cx={cx} cy="170" r="11" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
          </motion.g>
        ))}

        {(Object.keys(NODES) as BodyNode[]).map((key) => {
          const node = NODES[key]
          const isOn = active.includes(key)
          return (
            <g key={key}>
              {isOn && (
                <motion.circle cx={node.x} cy={node.y} r="18" fill="#C49A45" fillOpacity="0.14"
                  initial={{ scale: 0 }} animate={{ scale: [1, 1.35, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
              )}
              <motion.circle cx={node.x} cy={node.y} r="4.5"
                animate={{ fill: isOn ? '#C49A45' : 'rgba(255,255,255,0.2)', filter: isOn ? 'url(#bp-glow)' : 'none' }}
                transition={{ duration: 0.3 }} />
              {isOn && (
                <motion.text x={node.x} y={node.y - 14} textAnchor="middle"
                  className="fill-accent font-[family-name:var(--font-space-grotesk)]" fontSize="8" fontWeight="600"
                  initial={{ opacity: 0, y: node.y - 8 }} animate={{ opacity: 1, y: node.y - 14 }}>
                  {node.label}
                </motion.text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
