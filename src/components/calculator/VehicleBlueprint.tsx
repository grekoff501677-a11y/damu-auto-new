'use client'

import { motion } from 'motion/react'

export type BodyNode = 'engine' | 'cabin' | 'brakes' | 'transmission' | 'cooling'

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
}

export function VehicleBlueprint({ active, className }: Props) {
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
