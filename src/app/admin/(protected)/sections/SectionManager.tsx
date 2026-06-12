'use client'

import { useState, useTransition } from 'react'
import { Reorder, useDragControls } from 'motion/react'
import {
  Eye, EyeOff, Pencil, X, Plus, Trash2, Save, Loader2, Check, RotateCcw,
  GripVertical, Monitor, Smartphone, RefreshCw, Type, Megaphone, Minus, Lock,
} from 'lucide-react'
import { blockDef, BLOCK_LIBRARY, type SectionDef, type SectionConfig } from '@/lib/page-sections'
import { TextField, TextArea, Label, Toggle } from '@/components/admin/AdminField'
import { cn } from '@/lib/utils'
import {
  saveBlockConfig, setBlockVisible, reorderBlocks, addBlock, deleteBlock,
} from './actions'

type SItem = { id: string; type: string; label: string; note: string; system: boolean; visible: boolean; config: SectionConfig }

const PALETTE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  text: Type, banner: Megaphone, divider: Minus,
}

export function SectionManager({ initial }: { initial: SItem[] }) {
  const [sections, setSections] = useState<SItem[]>(initial)
  const [editing, setEditing] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)
  const [busyVis, setBusyVis] = useState<string | null>(null)
  const [adding, setAdding] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [, startReorder] = useTransition()

  const refresh = () => setNonce((n) => n + 1)

  function onReorder(next: SItem[]) { setSections(next) }
  function commitOrder() {
    startReorder(async () => { await reorderBlocks(sections.map((s) => s.id)); refresh() })
  }

  function toggle(id: string) {
    const cur = sections.find((s) => s.id === id)
    if (!cur) return
    const visible = !cur.visible
    setSections((ss) => ss.map((s) => (s.id === id ? { ...s, visible } : s)))
    setBusyVis(id)
    setBlockVisible(id, visible).finally(() => { setBusyVis(null); refresh() })
  }

  function onSaved(id: string, config: SectionConfig) {
    setSections((ss) => ss.map((s) => (s.id === id ? { ...s, config } : s)))
    setEditing(null); refresh()
  }

  async function add(type: string) {
    setError(null); setAdding(type)
    const r = await addBlock(type)
    setAdding(null)
    if (!('id' in r)) { setError(r.error ?? 'Не удалось добавить блок'); return }
    const def = blockDef(type)
    if (!def) return
    const block: SItem = { id: r.id, type, label: def.label, note: def.note, system: false, visible: true, config: { ...def.defaults } }
    setSections((ss) => [...ss, block])
    setEditing(r.id) // open the new block for editing right away
    refresh()
  }

  async function remove(id: string) {
    setSections((ss) => ss.filter((s) => s.id !== id))
    if (editing === id) setEditing(null)
    await deleteBlock(id); refresh()
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_minmax(340px,400px)]">
      {/* ── blocks + palette ── */}
      <div>
        <Reorder.Group axis="y" values={sections} onReorder={onReorder} className="space-y-2.5">
          {sections.map((s) => (
            <BlockRow
              key={s.id} item={s} editing={editing === s.id} busyVis={busyVis === s.id}
              onToggle={() => toggle(s.id)} onEdit={() => setEditing(editing === s.id ? null : s.id)}
              onDelete={() => remove(s.id)} onDragEnd={commitOrder} onSaved={(cfg) => onSaved(s.id, cfg)}
            />
          ))}
        </Reorder.Group>

        {/* palette */}
        <div className="mt-4 rounded-2xl border border-dashed border-glass-border p-4">
          <p className="mb-2.5 text-xs font-600 uppercase tracking-widest text-muted-foreground">Добавить блок</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {BLOCK_LIBRARY.map((b) => {
              const Icon = PALETTE_ICONS[b.key] ?? Plus
              return (
                <button key={b.key} onClick={() => add(b.key)} disabled={adding === b.key}
                  className="flex items-center gap-2.5 rounded-xl border border-input p-3 text-left transition-colors hover:border-accent/40 disabled:opacity-50 cursor-pointer">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    {adding === b.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-600">{b.label}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{b.note}</span>
                  </span>
                </button>
              )
            })}
          </div>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Тяните за <GripVertical className="inline h-3.5 w-3.5" /> чтобы менять порядок. Системные блоки <Lock className="inline h-3 w-3" /> можно скрыть, но не удалить.
        </p>
      </div>

      {/* ── live preview ── */}
      <PreviewPanel nonce={nonce} onRefresh={refresh} />
    </div>
  )
}

function BlockRow({ item, editing, busyVis, onToggle, onEdit, onDelete, onDragEnd, onSaved }: {
  item: SItem; editing: boolean; busyVis: boolean
  onToggle: () => void; onEdit: () => void; onDelete: () => void; onDragEnd: () => void; onSaved: (cfg: SectionConfig) => void
}) {
  const controls = useDragControls()
  const def = blockDef(item.type)
  return (
    <Reorder.Item value={item} dragListener={false} dragControls={controls} onDragEnd={onDragEnd}
      className={cn('glass overflow-hidden rounded-2xl border', item.visible ? 'border-glass-border' : 'border-glass-border opacity-60')}>
      <div className="flex items-center gap-2.5 p-3.5">
        <button onPointerDown={(e) => controls.start(e)}
          className="flex h-9 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted-foreground/50 transition-colors hover:text-foreground active:cursor-grabbing" aria-label="Перетащить">
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate font-heading text-sm font-600">
            {item.label}
            {item.system && <Lock className="h-3 w-3 shrink-0 text-muted-foreground/60" />}
          </p>
          <p className="truncate text-xs text-muted-foreground">{item.note}</p>
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

        {!item.system && (
          <button onClick={onDelete}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-input text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive cursor-pointer"
            aria-label="Удалить блок">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {editing && def && <BlockEditor item={item} def={def} onSaved={onSaved} />}
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
          <iframe key={`${device}-${nonce}`} src="/" title="Превью главной" className="block h-[640px] w-full border-0" />
        </div>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground/70">Превью обновляется после каждого изменения.</p>
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

function BlockEditor({ item, def, onSaved }: {
  item: SItem; def: SectionDef; onSaved: (config: SectionConfig) => void
}) {
  const [draft, setDraft] = useState<SectionConfig>({ ...def.defaults, ...item.config })
  const [pending, start] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setField = (k: string, v: unknown) => setDraft((d) => ({ ...d, [k]: v }))

  function save() {
    setError(null); setSaved(false)
    start(async () => {
      const r = await saveBlockConfig(item.id, draft)
      if (r?.error) setError(r.error)
      else { setSaved(true); onSaved(draft); setTimeout(() => setSaved(false), 2000) }
    })
  }
  function reset() {
    start(async () => {
      const r = await saveBlockConfig(item.id, {})
      if (r?.error) setError(r.error)
      else { setDraft({ ...def.defaults }); onSaved({ ...def.defaults }) }
    })
  }

  return (
    <div className="space-y-4 border-t border-glass-border bg-surface/30 p-4">
      {def.fields.length === 0 && <p className="text-xs text-muted-foreground">У этого блока нет настроек.</p>}
      {def.fields.map((f) => {
        if (f.kind === 'text') {
          return <TextField key={f.key} id={`${item.id}-${f.key}`} label={f.label}
            value={String(draft[f.key] ?? '')} onChange={(v) => setField(f.key, v)} placeholder={f.placeholder} />
        }
        if (f.kind === 'textarea') {
          return <TextArea key={f.key} id={`${item.id}-${f.key}`} label={f.label} rows={3}
            value={String(draft[f.key] ?? '')} onChange={(v) => setField(f.key, v)} placeholder={f.placeholder} />
        }
        if (f.kind === 'toggle') {
          return <Toggle key={f.key} label={f.label} checked={draft[f.key] !== false} onChange={(v) => setField(f.key, v)} />
        }
        const items = (Array.isArray(draft[f.key]) ? draft[f.key] : []) as Record<string, string>[]
        const setItems = (next: Record<string, string>[]) => setField(f.key, next)
        return (
          <div key={f.key}>
            <Label>{f.label}</Label>
            <div className="space-y-2.5">
              {items.map((it, idx) => (
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
                      const upd = (v: string) => setItems(items.map((x, k) => (k === idx ? { ...x, [itf.key]: v } : x)))
                      return itf.kind === 'textarea'
                        ? <TextArea key={itf.key} id={`${item.id}-${f.key}-${idx}-${itf.key}`} label={itf.label} rows={2} value={it[itf.key] ?? ''} onChange={upd} />
                        : <TextField key={itf.key} id={`${item.id}-${f.key}-${idx}-${itf.key}`} label={itf.label} value={it[itf.key] ?? ''} onChange={upd} />
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
