'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ExternalLink, CheckCircle2, AlertTriangle, Wrench } from 'lucide-react'
import { VehicleBlueprint, type BodyNode } from './VehicleBlueprint'
import { cn } from '@/lib/utils'
import type { PublicMaintModel } from '@/lib/queries'

export function MaintenanceCenter({ models }: { models: PublicMaintModel[] }) {
  const [modelSlug, setModelSlug] = useState(models[0]?.slug ?? '')
  const [milestoneIdx, setMilestoneIdx] = useState(0)

  const model = useMemo(() => models.find((m) => m.slug === modelSlug) ?? models[0], [models, modelSlug])
  const milestones = model?.milestones ?? []
  const safeIdx = Math.min(milestoneIdx, Math.max(0, milestones.length - 1))
  const milestone = milestones[safeIdx]
  const activeNodes = useMemo<BodyNode[]>(
    () => (milestone ? Array.from(new Set(milestone.parts.map((p) => p.node))) : []),
    [milestone]
  )

  if (!models.length) {
    return (
      <div className="glass flex flex-col items-center justify-center rounded-3xl p-16 text-center">
        <Wrench className="mb-3 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Модели пока не настроены. Добавьте их в админ-панели.</p>
      </div>
    )
  }

  return (
    <div className="glass overflow-hidden rounded-3xl">
      {/* Header + model carousel */}
      <div className="border-b border-glass-border p-5 sm:p-6">
        <p className="text-xs font-600 uppercase tracking-widest text-accent">Контрольный центр</p>
        <h3 className="mt-1 font-heading text-xl font-700">Интерактивное ТО</h3>
        <div className="no-scrollbar mt-4 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1">
          {models.map((m) => {
            const active = m.slug === model?.slug
            return (
              <button key={m.slug} onClick={() => { setModelSlug(m.slug); setMilestoneIdx(0) }}
                className={cn('flex min-h-12 shrink-0 snap-start flex-col items-start justify-center rounded-xl border px-4 py-2 text-left transition-all duration-200 cursor-pointer',
                  active ? 'border-accent bg-accent/10 shadow-[0_0_18px_-6px_rgba(196,154,69,0.7)]' : 'border-input bg-surface/60 hover:border-accent/40')}>
                <span className={cn('text-[10px] uppercase tracking-wide', active ? 'text-accent' : 'text-muted-foreground')}>{m.brand}</span>
                <span className="text-sm font-600 text-foreground">{m.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
        {/* Blueprint */}
        <div className="relative grid-backdrop border-b border-glass-border lg:border-b-0 lg:border-r">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-gold-soft/5" />
          <div className="relative flex h-full min-h-[240px] items-center justify-center p-6">
            <VehicleBlueprint active={activeNodes} className="w-full max-w-md" />
          </div>
          <div className="absolute bottom-4 left-6 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent shadow-[0_0_8px_2px_rgba(196,154,69,0.6)]" />
            {activeNodes.length} активных узлов · {model?.brand} {model?.name}
          </div>
        </div>

        {/* Gauge + parts */}
        <div className="p-5 sm:p-6">
          {milestones.length === 0 ? (
            <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
              <Wrench className="mb-3 h-7 w-7 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Для {model?.name} интервалы ТО ещё не заданы.<br />Добавьте их в админ-панели.</p>
            </div>
          ) : (
            <>
              <div className="no-scrollbar -mx-1 mb-6 overflow-x-auto px-1">
                <div className="relative flex min-w-max justify-between gap-6 sm:gap-2">
                  <div className="absolute left-0 right-0 top-[19px] h-px bg-glass-border" />
                  <motion.div className="absolute left-0 top-[19px] h-px bg-accent shadow-[0_0_8px_rgba(196,154,69,0.6)]"
                    animate={{ width: `${milestones.length > 1 ? (safeIdx / (milestones.length - 1)) * 100 : 0}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 18 }} />
                  {milestones.map((m, i) => (
                    <button key={m.km} onClick={() => setMilestoneIdx(i)} className="relative z-10 flex flex-col items-center gap-2 cursor-pointer">
                      <span className={cn('flex h-10 w-10 items-center justify-center rounded-full border text-[11px] font-700 transition-all duration-300',
                        i === safeIdx ? 'scale-110 border-accent bg-accent text-accent-foreground shadow-[0_0_16px_-2px_rgba(196,154,69,0.8)]'
                          : i < safeIdx ? 'border-accent/40 bg-accent/10 text-accent' : 'border-glass-border bg-surface text-muted-foreground')}>
                        {m.km / 1000}k
                      </span>
                      <span className={cn('text-[10px] transition-colors', i === safeIdx ? 'text-foreground' : 'text-muted-foreground')}>{m.months} мес</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-1">
                <AnimatePresence mode="popLayout">
                  {milestone?.parts.map((part, i) => (
                    <motion.div key={`${milestone.km}-${part.name}-${i}`} layout
                      initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                      transition={{ type: 'spring', stiffness: 130, damping: 16, delay: i * 0.05 }}
                      className="gpu flex flex-col rounded-2xl border border-glass-border bg-surface/60 p-3.5 transition-colors duration-200 hover:border-accent/30 lg:flex-row lg:items-center lg:gap-4">
                      <div className="mb-2 flex items-center gap-2 lg:mb-0 lg:shrink-0">
                        <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', part.type === 'replace' ? 'bg-accent/10 text-accent' : 'bg-amber-400/10 text-amber-400')}>
                          {part.type === 'replace' ? <CheckCircle2 className="h-4.5 w-4.5" /> : <AlertTriangle className="h-4.5 w-4.5" />}
                        </span>
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-600 uppercase tracking-wide lg:hidden', part.type === 'replace' ? 'bg-accent/10 text-accent' : 'bg-amber-400/10 text-amber-400')}>
                          {part.type === 'replace' ? 'Замена' : 'Проверка'}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-600 text-foreground">{part.name}</p>
                          <span className={cn('hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-600 uppercase tracking-wide lg:inline', part.type === 'replace' ? 'bg-accent/10 text-accent' : 'bg-amber-400/10 text-amber-400')}>
                            {part.type === 'replace' ? 'Замена' : 'Проверка'}
                          </span>
                        </div>
                        {part.spec && <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{part.spec}</p>}
                      </div>
                      <a href={part.kaspiUrl} target="_blank" rel="noopener noreferrer"
                        className="mt-3 flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-white/5 px-3 text-[12px] font-600 text-foreground transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer lg:mt-0 lg:shrink-0">
                        Kaspi <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {milestone && (
                <p className="mt-5 text-center text-xs text-muted-foreground">
                  Интервал <span className="text-foreground">{milestone.km.toLocaleString('ru')} км</span> ·
                  или <span className="text-foreground">{milestone.months} мес</span> — что наступит раньше
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
