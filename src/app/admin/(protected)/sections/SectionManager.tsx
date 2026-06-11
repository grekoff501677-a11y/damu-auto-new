'use client'

import { useState, useTransition } from 'react'
import { Reorder, useDragControls } from 'motion/react'
import {
  Eye, EyeOff, Pencil, X, Plus, Trash2, Save, Loader2, Check, RotateCcw,
  GripVertical, Monitor, Smartphone, RefreshCw,
} from 'lucide-react'
import { SECTION_REGISTRY, type SectionDef, type SectionConfig } from '@/lib/page-sections'
import { TextField, TextArea, Label, Toggle } from '@/components/admin/AdminField'
import { cn } from '@/lib/utils'
import { saveSectionConfig, setSectionVisible, reorderSections, resetSectionConfig } from './actions'

type SItem = { key: string; visible: boolean; config: SectionConfig }

const meta = (key: string) => SECTION_REGISTRY.find((s) => s.key === key) as SectionDef

export function SectionManager({ initial }: { initial: SItem[] }) {
  const [sections, setSections] = useState<SItem[]>(initial)
  const [editing, setEditing] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)
  const [busyVis, setBusyVis] = useState<string | null>(null)
  const [, startReorder] = useTransition()

  const refresh = () => setNonce((n) => n + 1)

  function onReorder(next: SItem[]) {
    setSections(next)
  }
  function commitOrder() {
    startReorder(async () => { await reorderSections(sections.map((s) => s.key)); refresh() })
  }

  function toggle(key: string) {
    const cur = sections.find((s) => s.key === key)
    if (!cur) return
    const visible = !cur.visible
    setSections((ss) => ss.map((s) => (s.key === key ? { ...s, visible } : s)))
    setBusyVis(key)
    setSectionVisible(key, visible).finally(() => { setBusyVis(null); refresh() })
  }

  function onSaved(key: string, config: SectionConfig) {
    setSections((ss) => ss.map((s) => (s.key === key ? { ...s, config } : s)))
    setEditing(null)
    refresh()
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_minmax(340px,400px)]">
      {/* ── section list (drag to reorder) ── */}
      <div>
        <Reorder.Group axis="y" values={sections} onReorder={onReorder} className="space-y-2.5">
          {sections.map((s) => (
            <SectionRow
              key={s.key} item={s} editing={editing === s.key} busyVis={busyVis === s.key}
              onToggle={() => toggle(s.key)} onEdit={() => setEditing(editing === s.key ? null : s.key)}
              onDragEnd={commitOrder} onSaved={(cfg) => onSaved(s.key, cfg)}
            />
          ))}
        </Reorder.Group>
        <p className="mt-3 text-xs text-muted-foreground">
          Тяните за <GripVertical className="inline h-3.5 w-3.5" /> чтобы менять порядок. Глазом — скрыть/показать, карандашом — тексты и кнопки.
        </p>
      </div>

      {/* ── live preview ── */}
      <PreviewPanel nonce={nonce} onRefresh={refresh} />
    </div>
  )
}

function SectionRow({ item, editing, busyVis, onToggle, onEdit, onDragEnd, onSaved }: {
  item: SItem; editing: boolean; busyVis: boolean
  onToggle: () => void; onEdit: () => void; onDragEnd: () => void; onSaved: (cfg: SectionConfig) => void
}) {
  const controls = useDragControls()
  const m = meta(item.key)
  return (
    <Reorder.Item value={item} dragListener={false} dragControls={controls} onDragEnd={onDragEnd}
      className={cn('glass overflow-hidden rounded-2xl border', item.visible ? 'border-glass-border' : 'border-glass-border opacity-60')}>
      <div className="flex items-center gap-3 p-3.5">
        <button onPointerDown={(e) => controls.start(e)}
          className="flex h-9 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted-foreground/50 transition-colors hover:text-foreground active:cursor-grabbing" aria-label="Перетащить">
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-sm font-600">{m.label}</p>
          <p className="truncate text-xs text-muted-foreground">{m.note}</p>
        </div>

        <button onClick={onToggle}
          className={cn('flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-600 transition-colors cursor-pointer',
            item.visible ? 'border-accent/40 text-accent' : 'border-input text-muted-foreground hover:text-foreground')}>
          {busyVis ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : item.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{item.visible ? 'Видна' : 'Скрыта'}</span>
        </button>

        <button onClick={onEdit}
          className={cn('flex h-9 w-9 items-center justify-center rounded-lg border transition-colors cursor-pointer',
            editing ? 'border-accent/40 text-accent' : 'border-input text-muted-foreground hover:text-foreground')}
          aria-label="Редактировать">
          {editing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
        </button>
      </div>

      {editing && <SectionEditor section={item} def={m} onSaved={onSaved} />}
    </Reorder.Item>
  )
}

function PreviewPanel({ nonce, onRefresh }: { nonce: number; onRefresh: () => void }) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  return (
    <div className="lg:sticky lg:top-20 h-fit">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-600 uppercase tracking-widest text-muted-foreground">Превью</span>
        <div className="flex items-center gap-1">
          <DeviceBtn active={device === 'desktop'} onClick={() => setDevice('desktop')} icon={<Monitor className="h-4 w-4" />} label="Десктоп" />
          <DeviceBtn active={device === 'mobile'} onClick={() => setDevice('mobile')} icon={<Smartphone className="h-4 w-4" />} label="Моб" />
          <button onClick={onRefresh} title="Обновить превью"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-input text-muted-foreground transition-colors hover:text-foreground cursor-pointer">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-glass-border bg-surface">
        <div className={cn('mx-auto bg-background', device === 'mobile' ? 'w-[390px] max-w-full' : 'w-full')}>
          <iframe key={`${device}-${nonce}`} src="/" title="Превью главной"
            className="block h-[640px] w-full border-0" />
        </div>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground/70">
        Превью обновляется после сохранения. Десктоп показан в масштабе колонки.
      </p>
    </div>
  )
}

function DeviceBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick}
      className={cn('flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-600 transition-colors cursor-pointer',
        active ? 'border-accent/40 text-accent' : 'border-input text-muted-foreground hover:text-foreground')}>
      {icon}<span className="hidden sm:inline">{label}</span>
    </button>
  )
}

function SectionEditor({ section, def, onSaved }: {
  section: SItem; def: SectionDef; onSaved: (config: SectionConfig) => void
}) {
  const [draft, setDraft] = useState<SectionConfig>({ ...def.defaults, ...section.config })
  const [pending, start] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setField = (k: string, v: unknown) => setDraft((d) => ({ ...d, [k]: v }))

  function save() {
    setError(null); setSaved(false)
    start(async () => {
      const r = await saveSectionConfig(section.key, draft)
      if (r?.error) setError(r.error)
      else { setSaved(true); onSaved(draft); setTimeout(() => setSaved(false), 2000) }
    })
  }
  function reset() {
    start(async () => {
      const r = await resetSectionConfig(section.key)
      if (r?.error) setError(r.error)
      else { setDraft({ ...def.defaults }); onSaved({ ...def.defaults }) }
    })
  }

  return (
    <div className="space-y-4 border-t border-glass-border bg-surface/30 p-4">
      {def.fields.map((f) => {
        if (f.kind === 'text') {
          return <TextField key={f.key} id={`${section.key}-${f.key}`} label={f.label}
            value={String(draft[f.key] ?? '')} onChange={(v) => setField(f.key, v)} placeholder={f.placeholder} />
        }
        if (f.kind === 'textarea') {
          return <TextArea key={f.key} id={`${section.key}-${f.key}`} label={f.label} rows={3}
            value={String(draft[f.key] ?? '')} onChange={(v) => setField(f.key, v)} placeholder={f.placeholder} />
        }
        if (f.kind === 'toggle') {
          return <Toggle key={f.key} label={f.label} checked={draft[f.key] !== false} onChange={(v) => setField(f.key, v)} />
        }
        // list
        const items = (Array.isArray(draft[f.key]) ? draft[f.key] : []) as Record<string, string>[]
        const setItems = (next: Record<string, string>[]) => setField(f.key, next)
        return (
          <div key={f.key}>
            <Label>{f.label}</Label>
            <div className="space-y-2.5">
              {items.map((item, idx) => (
                <div key={idx} className="rounded-xl border border-glass-border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-600 text-muted-foreground">{f.itemLabel} {idx + 1}</span>
                    <button onClick={() => setItems(items.filter((_, k) => k !== idx))}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer" aria-label="Удалить">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {f.itemFields.map((itf) => {
                      const upd = (v: string) => setItems(items.map((it, k) => (k === idx ? { ...it, [itf.key]: v } : it)))
                      return itf.kind === 'textarea'
                        ? <TextArea key={itf.key} id={`${section.key}-${f.key}-${idx}-${itf.key}`} label={itf.label} rows={2} value={item[itf.key] ?? ''} onChange={upd} />
                        : <TextField key={itf.key} id={`${section.key}-${f.key}-${idx}-${itf.key}`} label={itf.label} value={item[itf.key] ?? ''} onChange={upd} />
                    })}
                  </div>
                </div>
              ))}
              {items.length < f.max && (
                <button onClick={() => setItems([...items, Object.fromEntries(f.itemFields.map((x) => [x.key, '']))])}
                  className="flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-input text-sm font-600 text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground cursor-pointer">
                  <Plus className="h-4 w-4" /> Добавить
                </button>
              )}
            </div>
          </div>
        )
      })}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-2">
        <button onClick={save} disabled={pending}
          className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-700 text-accent-foreground transition-all hover:shadow-[0_0_20px_-4px_rgba(196,154,69,0.7)] disabled:opacity-50 cursor-pointer">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? 'Сохранено' : 'Сохранить'}
        </button>
        <button onClick={reset} disabled={pending} title="Вернуть исходные тексты"
          className="flex h-10 items-center gap-1.5 rounded-xl border border-input px-3 text-xs font-600 text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground disabled:opacity-50 cursor-pointer">
          <RotateCcw className="h-3.5 w-3.5" /> Сбросить
        </button>
      </div>
    </div>
  )
}
