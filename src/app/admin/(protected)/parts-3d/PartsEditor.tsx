'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Save, Box, Move } from 'lucide-react'
import { Model3D } from '@/components/calculator/Model3D'
import { baseInput } from '@/components/admin/AdminField'
import { cn } from '@/lib/utils'
import { saveParts3D } from './actions'
import type { BodyNode } from '@/components/calculator/VehicleBlueprint'
import type { CarModel, Part3DPlacement } from '@/lib/types'

const NODES: { value: BodyNode; label: string }[] = [
  { value: 'engine',       label: 'Двигатель' },
  { value: 'cooling',      label: 'Охлаждение' },
  { value: 'cabin',        label: 'Салон' },
  { value: 'transmission', label: 'Трансмиссия' },
  { value: 'brakes',       label: 'Тормоза' },
]

// Кузов нормализован: длинная ось = 3.4, центр в нуле, вертикаль — Y.
// Отсюда и пределы ползунков: за габарит машины уходить незачем.
const AXES = [
  { key: 'z' as const, label: 'Вдоль машины', hint: '+ вперёд, − назад' },
  { key: 'y' as const, label: 'По высоте',    hint: '+ вверх, − вниз' },
  { key: 'x' as const, label: 'Поперёк',      hint: '+ вправо, − влево' },
]

export function PartsEditor({ model }: { model: CarModel }) {
  const [parts, setParts] = useState<Part3DPlacement[]>(
    Array.isArray(model.model_3d_parts) ? model.model_3d_parts : []
  )
  const [selectedId, setSelectedId] = useState<string | null>(parts[0]?.id ?? null)
  const [saving, startSave] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)

  const selected = parts.find((p) => p.id === selectedId) ?? null

  const patch = (id: string, next: Partial<Part3DPlacement>) =>
    setParts((prev) => prev.map((p) => (p.id === id ? { ...p, ...next } : p)))

  const addPart = () => {
    const id = `part-${Date.now().toString(36)}`
    // ставим у передней части, примерно на уровне моторного отсека — дальше
    // двигают ползунками, глядя на превью
    const fresh: Part3DPlacement = {
      id, label: 'Масляный фильтр', url: '', x: 0.15, y: -0.2, z: 1.1, height: 0.18,
      bodyNode: 'engine', glowRadius: 1.4, glowDensity: 120,
    }
    setParts((prev) => [...prev, fresh])
    setSelectedId(id)
  }

  const removePart = (id: string) => {
    setParts((prev) => prev.filter((p) => p.id !== id))
    setSelectedId((cur) => (cur === id ? null : cur))
  }

  const save = () => startSave(async () => {
    const res = await saveParts3D(model.id, parts)
    setMsg(res.error ? `Ошибка: ${res.error}` : 'Сохранено')
    setTimeout(() => setMsg(null), 4000)
  })

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/parts-3d" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer">
          <ArrowLeft className="h-4 w-4" /> Все модели
        </Link>
        <div className="flex items-center gap-3">
          {msg && <span className={cn('text-xs', msg.startsWith('Ошибка') ? 'text-destructive' : 'text-accent')}>{msg}</span>}
          <button onClick={save} disabled={saving}
            className="flex min-h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-700 text-accent-foreground disabled:opacity-50 cursor-pointer">
            <Save className="h-4 w-4" /> {saving ? 'Сохраняю…' : 'Сохранить'}
          </button>
        </div>
      </div>

      <h1 className="mb-1 font-heading text-xl font-700">{model.brand} {model.name}</h1>
      <p className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        <Move className="h-4 w-4 shrink-0 text-accent" />
        Тащите деталь курсором прямо в превью — она идёт в плоскости экрана.
        Чтобы задать глубину, поверните машину и потащите ещё раз. Ползунки — для точной подгонки.
      </p>

      {!model.model_3d_url && (
        <p className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">
          У модели не задан 3D-кузов (model_3d_url) — превью показать не на чем.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-2xl border border-glass-border bg-surface/40">
          {model.model_3d_url ? (
            <Model3D
              key={model.model_3d_url}
              src={model.model_3d_url}
              modelKey={model.slug}
              className="mx-auto h-[460px] w-full"
              activeNodes={NODES.map((n) => n.value)}
              nodes={model.model_3d_nodes}
              parts={parts.filter((p) => p.url)}
              showNodeSwarms={false}
              draggablePartId={selectedId}
              onPartMove={(id, [x, y, z]) => patch(id, { x, y, z })}
            />
          ) : (
            <div className="flex h-[460px] items-center justify-center text-sm text-muted-foreground">Нет 3D-модели</div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-glass-border bg-surface/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-600 uppercase tracking-widest text-muted-foreground">Детали</p>
              <button onClick={addPart} className="flex items-center gap-1.5 text-xs font-600 text-accent cursor-pointer">
                <Plus className="h-3.5 w-3.5" /> Добавить
              </button>
            </div>
            {parts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Пока пусто. Добавьте деталь и укажите ссылку на .glb.</p>
            ) : (
              <ul className="space-y-1.5">
                {parts.map((p) => (
                  <li key={p.id}>
                    <div className={cn('flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors',
                      p.id === selectedId ? 'border-accent/50 bg-accent/10' : 'border-input')}>
                      <button onClick={() => setSelectedId(p.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left cursor-pointer">
                        <Box className="h-4 w-4 shrink-0 text-accent" />
                        <span className="truncate text-sm">{p.label}</span>
                        {!p.url && <span className="shrink-0 text-[10px] text-destructive">нет .glb</span>}
                      </button>
                      <button onClick={() => removePart(p.id)} aria-label="Удалить"
                        className="shrink-0 text-muted-foreground hover:text-destructive cursor-pointer">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selected && (
            <div className="space-y-4 rounded-2xl border border-glass-border bg-surface/40 p-4">
              <label className="block">
                <span className="mb-1 block text-xs text-muted-foreground">Подпись при наведении</span>
                <input className={baseInput} value={selected.label}
                  onChange={(e) => patch(selected.id, { label: e.target.value })} />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs text-muted-foreground">Ссылка на .glb</span>
                <input className={baseInput} placeholder="https://…/models/oil-filter.glb" value={selected.url}
                  onChange={(e) => patch(selected.id, { url: e.target.value.trim() })} />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs text-muted-foreground">Светится вместе с узлом</span>
                <select className={baseInput} value={selected.bodyNode ?? ''}
                  onChange={(e) => patch(selected.id, { bodyNode: (e.target.value || undefined) as BodyNode | undefined })}>
                  <option value="">— не привязана —</option>
                  {NODES.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
                </select>
              </label>

              {AXES.map(({ key, label, hint }) => (
                <Slider key={key} label={label} hint={hint} min={-2} max={2} step={0.01}
                  value={selected[key]} onChange={(v) => patch(selected.id, { [key]: v })} />
              ))}
              <Slider label="Размер" hint="высота детали" min={0.03} max={0.8} step={0.01}
                value={selected.height} onChange={(v) => patch(selected.id, { height: v })} />

              <div className="border-t border-glass-border pt-4">
                <p className="mb-3 text-xs font-600 uppercase tracking-widest text-muted-foreground">Свечение детали</p>
                <div className="space-y-4">
                  <Slider label="Объём" hint="радиус облака искр" min={0} max={4} step={0.05}
                    value={selected.glowRadius ?? 1.4} onChange={(v) => patch(selected.id, { glowRadius: v })} />
                  <Slider label="Густота" hint="число частиц" min={0} max={600} step={10} digits={0}
                    value={selected.glowDensity ?? 120} onChange={(v) => patch(selected.id, { glowDensity: v })} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Slider({ label, hint, min, max, step, value, onChange, digits = 2 }: {
  label: string; hint: string; min: number; max: number; step: number
  value: number; onChange: (v: number) => void; digits?: number
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-baseline justify-between text-xs">
        <span className="text-muted-foreground">{label} <span className="opacity-60">· {hint}</span></span>
        <span className="font-mono text-foreground">{value.toFixed(digits)}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-brand-white/10 accent-accent" />
    </label>
  )
}
