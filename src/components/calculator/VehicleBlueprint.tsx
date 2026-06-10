'use client'

import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import type { BlueprintConfig } from '@/lib/vehicle-blueprints'

export type BodyNode = 'engine' | 'cabin' | 'brakes' | 'transmission' | 'cooling'

const NODE_LABELS: Record<BodyNode, string> = {
  engine: 'Двигатель',
  cooling: 'Охлаждение',
  cabin: 'Салон',
  transmission: 'Трансмиссия',
  brakes: 'Тормоза / подвеска',
}

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
  /** when provided, renders the AI wireframe image with glowing hotspots */
  blueprint?: BlueprintConfig
}

export function VehicleBlueprint({ active, className, blueprint }: Props) {
  // ── Image mode: AI-generated wireframe render + glowing hotspot overlay ──
  if (blueprint?.image) {
    const entries = Object.entries(blueprint.nodes) as [BodyNode, { x: number; y: number }][]
    return (
      <div className={cn('relative', className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={blueprint.image} alt="Схема автомобиля" loading="lazy" decoding="async" className="h-full w-full object-contain" />
        {entries.map(([node, pos]) => {
          const on = active.includes(node)
          return (
            <div key={node} className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}>
              {on && (
                <motion.span
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/30"
                  style={{ width: 34, height: 34 }}
                  animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              <span className={cn('relative block rounded-full transition-all duration-300',
                on ? 'h-3 w-3 bg-accent shadow-[0_0_16px_4px_rgba(196,154,69,0.85)]'
                   : 'h-2 w-2 bg-white/25')} />
              <AnimatePresence>
                {on && (
                  <motion.span
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute left-1/2 top-3 -translate-x-1/2 whitespace-nowrap rounded-md border border-accent/30 bg-black/60 px-1.5 py-0.5 text-[9px] font-600 text-accent backdrop-blur-sm">
                    {NODE_LABELS[node]}
                  </motion.span>
                )}
              </AnimatePresence>
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

        {/* ground reflection line */}
        <line x1="20" y1="196" x2="380" y2="196" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="2 6" />

        {/* ── SUV side silhouette ── */}
        <motion.path
          d="M30 168
             C30 150 34 140 52 136
             C60 122 74 116 92 114
             L120 90
             C128 78 140 72 158 71
             L250 69
             C272 69 288 78 300 96
             L356 104
             C372 107 378 118 378 134
             L378 168"
          stroke="url(#bp-stroke)"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
        />
        {/* beltline + windows */}
        <motion.path
          d="M124 112 L292 110 M132 90 L186 88 L188 110 M196 88 L256 87 L258 110"
          stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeLinecap="round"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.8 }}
        />
        {/* door split */}
        <motion.line x1="216" y1="110" x2="216" y2="160"
          stroke="rgba(255,255,255,0.10)" strokeWidth="1"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.6 }} />

        {/* wheels */}
        {[120, 312].map((cx, i) => (
          <motion.g key={cx}
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + i * 0.15, type: 'spring', stiffness: 120, damping: 14 }}
            style={{ originX: `${cx}px`, originY: '170px' }}
          >
            <circle cx={cx} cy="170" r="26" stroke="url(#bp-stroke)" strokeWidth="1.75" />
            <circle cx={cx} cy="170" r="11" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
          </motion.g>
        ))}

        {/* ── Maintenance nodes ── */}
        {(Object.keys(NODES) as BodyNode[]).map((key) => {
          const node = NODES[key]
          const isOn = active.includes(key)
          return (
            <g key={key}>
              {isOn && (
                <motion.circle
                  cx={node.x} cy={node.y} r="18"
                  fill="#C49A45" fillOpacity="0.14"
                  initial={{ scale: 0 }} animate={{ scale: [1, 1.35, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              <motion.circle
                cx={node.x} cy={node.y} r="4.5"
                animate={{
                  fill: isOn ? '#C49A45' : 'rgba(255,255,255,0.2)',
                  filter: isOn ? 'url(#bp-glow)' : 'none',
                }}
                transition={{ duration: 0.3 }}
              />
              {isOn && (
                <motion.text
                  x={node.x} y={node.y - 14}
                  textAnchor="middle"
                  className="fill-accent font-[family-name:var(--font-space-grotesk)]"
                  fontSize="8" fontWeight="600"
                  initial={{ opacity: 0, y: node.y - 8 }}
                  animate={{ opacity: 1, y: node.y - 14 }}
                >
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
