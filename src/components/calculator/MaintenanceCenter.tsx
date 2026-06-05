'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ExternalLink, CheckCircle2, AlertTriangle, ChevronDown } from 'lucide-react'
import { VehicleBlueprint, type BodyNode } from './VehicleBlueprint'
import { DEMO_MODELS } from '@/lib/maintenance-data'
import { cn } from '@/lib/utils'

export function MaintenanceCenter() {
  const [modelSlug, setModelSlug] = useState(DEMO_MODELS[0].slug)
  const [milestoneIdx, setMilestoneIdx] = useState(1)
  const [selectOpen, setSelectOpen] = useState(false)

  const model = useMemo(
    () => DEMO_MODELS.find((m) => m.slug === modelSlug)!,
    [modelSlug]
  )
  const milestone = model.milestones[milestoneIdx]
  const activeNodes = useMemo<BodyNode[]>(
    () => Array.from(new Set(milestone.parts.map((p) => p.node))),
    [milestone]
  )

  return (
    <div className="glass overflow-hidden rounded-3xl">
      {/* ── Header / model selector ── */}
      <div className="flex flex-col gap-4 border-b border-glass-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-xs font-600 uppercase tracking-widest text-accent">Контрольный центр</p>
          <h3 className="mt-1 font-heading text-xl font-700">Интерактивное ТО</h3>
        </div>

        {/* Custom model select */}
        <div className="relative">
          <button
            onClick={() => setSelectOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-3 rounded-xl border border-input bg-surface px-4 py-2.5 text-sm font-500 transition-colors hover:border-accent/40 cursor-pointer sm:w-56"
          >
            <span>{model.brand} {model.name}</span>
            <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', selectOpen && 'rotate-180')} />
          </button>
          <AnimatePresence>
            {selectOpen && (
              <motion.ul
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="glass-strong absolute right-0 z-20 mt-2 w-full overflow-hidden rounded-xl p-1 shadow-2xl shadow-black/50 sm:w-56"
              >
                {DEMO_MODELS.map((m) => (
                  <li key={m.slug}>
                    <button
                      onClick={() => { setModelSlug(m.slug); setSelectOpen(false) }}
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer',
                        m.slug === modelSlug ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                      )}
                    >
                      {m.brand} {m.name}
                      {m.slug === modelSlug && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
        {/* ── LEFT: blueprint ── */}
        <div className="relative grid-backdrop border-b border-glass-border lg:border-b-0 lg:border-r">
          <div className="absolute inset-0 bg-gradient-to-br from-ice/5 via-transparent to-accent/5" />
          <div className="relative flex h-full min-h-[280px] items-center justify-center p-6">
            <VehicleBlueprint active={activeNodes} className="w-full max-w-md" />
          </div>
          <div className="absolute bottom-4 left-6 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent shadow-[0_0_8px_2px_rgba(0,230,118,0.6)]" />
            {activeNodes.length} активных узлов · {model.brand} {model.name}
          </div>
        </div>

        {/* ── RIGHT: timeline + parts ── */}
        <div className="p-5 sm:p-6">
          {/* Timeline */}
          <div className="relative mb-6 flex justify-between">
            <div className="absolute left-0 right-0 top-[15px] h-px bg-glass-border" />
            <motion.div
              className="absolute left-0 top-[15px] h-px bg-accent shadow-[0_0_8px_rgba(0,230,118,0.6)]"
              animate={{ width: `${(milestoneIdx / (model.milestones.length - 1)) * 100}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            />
            {model.milestones.map((m, i) => {
              const active = i <= milestoneIdx
              return (
                <button
                  key={m.km}
                  onClick={() => setMilestoneIdx(i)}
                  className="relative z-10 flex flex-col items-center gap-2 cursor-pointer"
                >
                  <span className={cn(
                    'flex h-[30px] w-[30px] items-center justify-center rounded-full border text-[10px] font-700 transition-all duration-300',
                    i === milestoneIdx
                      ? 'border-accent bg-accent text-accent-foreground shadow-[0_0_16px_-2px_rgba(0,230,118,0.8)] scale-110'
                      : active
                        ? 'border-accent/40 bg-accent/10 text-accent'
                        : 'border-glass-border bg-surface text-muted-foreground'
                  )}>
                    {m.km / 1000}k
                  </span>
                  <span className={cn('text-[10px] transition-colors', i === milestoneIdx ? 'text-foreground' : 'text-muted-foreground')}>
                    {m.months} мес
                  </span>
                </button>
              )
            })}
          </div>

          {/* Parts fly-out */}
          <div className="space-y-2.5">
            <AnimatePresence mode="popLayout">
              {milestone.parts.map((part, i) => (
                <motion.a
                  key={`${milestone.km}-${part.oem}`}
                  href={part.kaspiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  layout
                  initial={{ opacity: 0, x: 24, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: -24, filter: 'blur(4px)' }}
                  transition={{ type: 'spring', stiffness: 120, damping: 16, delay: i * 0.06 }}
                  className="group flex items-center gap-4 rounded-2xl border border-glass-border bg-surface/60 p-3.5 transition-all duration-200 hover:border-accent/30 hover:bg-surface cursor-pointer"
                >
                  <span className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                    part.type === 'replace' ? 'bg-accent/10 text-accent' : 'bg-amber-400/10 text-amber-400'
                  )}>
                    {part.type === 'replace' ? <CheckCircle2 className="h-4.5 w-4.5" /> : <AlertTriangle className="h-4.5 w-4.5" />}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-600 text-foreground">{part.name}</p>
                      <span className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-600 uppercase tracking-wide',
                        part.type === 'replace' ? 'bg-accent/10 text-accent' : 'bg-amber-400/10 text-amber-400'
                      )}>
                        {part.type === 'replace' ? 'Замена' : 'Проверка'}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{part.spec}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/70">OEM {part.oem}</p>
                  </div>

                  <span className="flex shrink-0 items-center gap-1 rounded-lg bg-white/5 px-2.5 py-2 text-[11px] font-600 text-foreground transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                    Kaspi
                    <ExternalLink className="h-3 w-3" />
                  </span>
                </motion.a>
              ))}
            </AnimatePresence>
          </div>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Интервал <span className="text-foreground">{milestone.km.toLocaleString('ru')} км</span> ·
            пробег или <span className="text-foreground">{milestone.months} мес</span> — что наступит раньше
          </p>
        </div>
      </div>
    </div>
  )
}
