'use client'

import { useRef, useState, useTransition } from 'react'
import { Plus, Trash2, Save, Loader2, Check, Spline, Eye, EyeOff } from 'lucide-react'
import { saveBlueprint } from './actions'
import { cn } from '@/lib/utils'
import type { BlueprintHotspot, BodyNode } from '@/lib/types'

const BODY_NODES: { value: BodyNode | ''; label: string }[] = [
  { value: '',             label: '— без узла (просто подпись)' },
  { value: 'engine',       label: 'Двигатель' },
  { value: 'cooling',      label: 'Охлаждение' },
  { value: 'cabin',        label: 'Салон' },
  { value: 'transmission', label: 'Трансмиссия' },
  { value: 'brakes',       label: 'Тормоза / подвеска' },
]

type Drag = { id: string; kind: 'dot' | 'line' } | null

let idc = 0
const newId = () => `h${Date.now().toString(36)}${idc++}`

export function BlueprintEditor({
  modelId, modelName, initialUrl, initialHotspots,
}: {
  modelId: string; modelName: string; initialUrl: string; initialHotspots: BlueprintHotspot[]
}) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [url, setUrl] = useState(initialUrl)
  const [hotspots, setHotspots] = useState<BlueprintHotspot[]>(initialHotspots)
  const [selected, setSelected] = useState<string | null>(initialHotspots[0]?.id ?? null)
  const [drag, setDrag] = useState<Drag>(null)
  const [preview, setPreview] = useState(true)
  const [pending, start] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sel = hotspots.find((h) => h.id === selected) ?? null

  function pctFromEvent(e: React.PointerEvent | React.MouseEvent) {
    const r = canvasRef.current?.getBoundingClientRect()
    if (!r) return { x: 50, y: 50 }
    return {
      x: Math.round(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)) * 10) / 10,
      y: Math.round(Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100)) * 10) / 10,
    }
  }

  function patch(id: string, p: Partial<BlueprintHotspot>) {
    setHotspots((hs) => hs.map((h) => (h.id === id ? { ...h, ...p } : h)))
  }

  function addAt(x: number, y: number) {
    const h: BlueprintHotspot = { id: newId(), x, y, bodyNode: 'engine', label: '' }
    setHotspots((hs) => [...hs, h])
    setSelected(h.id)
  }

  function onCanvasClick(e: React.MouseEvent) {
    if (drag) return
    // ignore clicks that originate on a handle (they stopPropagation)
    const { x, y } = pctFromEvent(e)
    addAt(x, y)
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag) return
    const { x, y } = pctFromEvent(e)
    if (drag.kind === 'dot') patch(drag.id, { x, y })
    else patch(drag.id, { line: { x2: x, y2: y } })
  }

  function remove(id: string) {
    setHotspots((hs) => hs.filter((h) => h.id !== id))
    if (selected === id) setSelected(null)
  }

  function toggleLine(h: BlueprintHotspot) {
    if (h.line) patch(h.id, { line: undefined })
    else patch(h.id, { line: { x2: Math.min(100, h.x + 14), y2: Math.max(0, h.y - 14) } })
  }

  function onSave() {
    setError(null); setSaved(false)
    start(async () => {
      const r = await saveBlueprint(modelId, url, hotspots)
      if (r?.error) setError(r.error)
      else { setSaved(true); setTimeout(() => setSaved(false), 2500) }
    })
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
      {/* ── Canvas ── */}
      <div>
        <div className="mb-3">
          <label className="mb-1.5 block text-xs font-600 text-muted-foreground">URL изображения (Cloudinary)</label>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://res.cloudinary.com/..."
            className="min-h-11 w-full rounded-xl border border-input bg-surface/60 px-4 text-sm outline-none focus:border-accent" />
        </div>

        <div
          ref={canvasRef}
          onClick={onCanvasClick}
          onPointerMove={onPointerMove}
          onPointerUp={() => setDrag(null)}
          onPointerLeave={() => setDrag(null)}
          className="relative w-full overflow-hidden rounded-2xl border border-glass-border bg-surface select-none"
          style={{ cursor: drag ? 'grabbing' : 'crosshair', minHeight: 280 }}
        >
          <div aria-hidden className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 62% 48% at 50% 56%, rgba(196,154,69,0.18), transparent 72%)' }} />
          {url
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={url} alt="" className="pointer-events-none relative block h-auto w-full" />
            : <div className="grid h-[280px] place-items-center text-sm text-muted-foreground">Вставьте URL изображения выше</div>}

          {/* leader lines */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {hotspots.filter((h) => h.line).map((h) => {
              const on = preview && !!h.bodyNode
              return <line key={h.id} x1={h.x} y1={h.y} x2={h.line!.x2} y2={h.line!.y2}
                stroke={on ? '#EAF6FF' : 'rgba(196,154,69,0.6)'} strokeWidth={1} vectorEffect="non-scaling-stroke" />
            })}
          </svg>

          {/* hotspots */}
          {hotspots.map((h) => {
            const on = preview && !!h.bodyNode
            const isSel = h.id === selected
            const lx = h.line ? h.line.x2 : h.x
            const ly = h.line ? h.line.y2 : h.y
            return (
              <div key={h.id}>
                {/* dot handle */}
                <button
                  onClick={(e) => { e.stopPropagation(); setSelected(h.id) }}
                  onPointerDown={(e) => { e.stopPropagation(); setSelected(h.id); setDrag({ id: h.id, kind: 'dot' }) }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab"
                  style={{ left: `${h.x}%`, top: `${h.y}%` }}
                >
                  <span className="block rounded-full" style={
                    on
                      ? { width: 14, height: 14, border: '2px solid #9FE0FF', background: 'rgba(56,189,248,0.12)', boxShadow: '0 0 0 1px rgba(6,21,33,0.9), 0 0 14px 3px rgba(56,189,248,0.7)' }
                      : { width: 14, height: 14, border: `2px solid ${h.bodyNode ? 'rgba(214,232,250,0.5)' : 'rgba(196,154,69,0.8)'}`, background: 'transparent', boxShadow: '0 0 0 1px rgba(6,21,33,0.7)' }
                  } />
                  {isSel && <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-sky-300" style={{ width: 26, height: 26 }} />}
                </button>

                {/* line endpoint handle */}
                {h.line && (
                  <button
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => { e.stopPropagation(); setSelected(h.id); setDrag({ id: h.id, kind: 'line' }) }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab"
                    style={{ left: `${h.line.x2}%`, top: `${h.line.y2}%` }}
                  >
                    <span className="block rounded-sm bg-sky-300" style={{ width: 8, height: 8, boxShadow: '0 0 0 2px #061521' }} />
                  </button>
                )}

                {/* label */}
                {h.label && (
                  <span className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border border-accent/30 bg-black/70 px-1.5 py-0.5 text-[10px] font-600 text-accent"
                    style={{ left: `${lx}%`, top: `calc(${ly}% - 14px)` }}>
                    {h.label}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Клик по схеме — добавить точку. Тяните точку, чтобы переместить. Линию и подпись настройте справа.
        </p>
      </div>

      {/* ── Inspector ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button onClick={() => addAt(50, 50)} className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-input text-sm font-600 transition-colors hover:border-accent/40 cursor-pointer">
            <Plus className="h-4 w-4" /> Точка
          </button>
          <button onClick={() => setPreview((v) => !v)} title="Предпросмотр свечения"
            className={cn('flex h-10 w-10 items-center justify-center rounded-lg border cursor-pointer', preview ? 'border-sky-300/40 text-sky-300' : 'border-input text-muted-foreground')}>
            {preview ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </div>

        {/* hotspot list */}
        <div className="space-y-1.5">
          {hotspots.length === 0 && <p className="text-xs text-muted-foreground">Точек пока нет.</p>}
          {hotspots.map((h, i) => (
            <button key={h.id} onClick={() => setSelected(h.id)}
              className={cn('flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs cursor-pointer',
                h.id === selected ? 'border-accent/40 bg-accent/10' : 'border-glass-border hover:border-accent/30')}>
              <span className="truncate">{h.label || `Точка ${i + 1}`}</span>
              <span className="text-muted-foreground">{h.bodyNode ?? '—'}</span>
            </button>
          ))}
        </div>

        {/* selected editor */}
        {sel && (
          <div className="space-y-3 rounded-2xl border border-glass-border p-4">
            <div>
              <label className="mb-1 block text-[11px] font-600 text-muted-foreground">Подпись</label>
              <input value={sel.label ?? ''} onChange={(e) => patch(sel.id, { label: e.target.value })}
                placeholder="напр. Двигатель"
                className="min-h-10 w-full rounded-lg border border-input bg-surface/60 px-3 text-sm outline-none focus:border-accent" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-600 text-muted-foreground">Узел ТО (что подсвечивать)</label>
              <select value={sel.bodyNode ?? ''} onChange={(e) => patch(sel.id, { bodyNode: (e.target.value || undefined) as BodyNode | undefined })}
                className="min-h-10 w-full cursor-pointer rounded-lg border border-input bg-surface/60 px-3 text-sm outline-none focus:border-accent">
                {BODY_NODES.map((b) => <option key={b.value} value={b.value} className="bg-surface">{b.label}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleLine(sel)}
                className={cn('flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border text-sm font-600 cursor-pointer',
                  sel.line ? 'border-sky-300/40 text-sky-300' : 'border-input text-muted-foreground hover:border-accent/40')}>
                <Spline className="h-4 w-4" /> {sel.line ? 'Убрать линию' : 'Выноска'}
              </button>
              <button onClick={() => remove(sel.id)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-input text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive cursor-pointer">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">X {sel.x}% · Y {sel.y}%{sel.line ? ` · линия → ${sel.line.x2}/${sel.line.y2}` : ''}</p>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
        <button onClick={onSave} disabled={pending}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-700 text-accent-foreground transition-all hover:shadow-[0_0_20px_-4px_rgba(196,154,69,0.7)] disabled:opacity-50 cursor-pointer">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? 'Сохранено' : 'Сохранить схему'}
        </button>
      </div>
    </div>
  )
}
