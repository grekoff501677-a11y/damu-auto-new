'use client'

import { useState, useTransition } from 'react'
import {
  ChevronUp, ChevronDown, Eye, EyeOff, Pencil, X, Plus, Trash2,
  Save, Loader2, Check, RotateCcw, GripVertical,
} from 'lucide-react'
import { SECTION_REGISTRY, type SectionDef, type SectionConfig } from '@/lib/page-sections'
import { TextField, TextArea, Label } from '@/components/admin/AdminField'
import { cn } from '@/lib/utils'
import { saveSectionConfig, setSectionVisible, reorderSections, resetSectionConfig } from './actions'

type SItem = { key: string; visible: boolean; config: SectionConfig }

const meta = (key: string) => SECTION_REGISTRY.find((s) => s.key === key) as SectionDef

export function SectionManager({ initial }: { initial: SItem[] }) {
  const [sections, setSections] = useState<SItem[]>(initial)
  const [editing, setEditing] = useState<string | null>(null)
  const [, startReorder] = useTransition()
  const [busyVis, setBusyVis] = useState<string | null>(null)

  function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= sections.length) return
    const next = [...sections]
    ;[next[i], next[j]] = [next[j], next[i]]
    setSections(next)
    startReorder(() => { reorderSections(next.map((s) => s.key)) })
  }

  function toggle(key: string) {
    const cur = sections.find((s) => s.key === key)
    if (!cur) return
    const visible = !cur.visible
    setSections((ss) => ss.map((s) => (s.key === key ? { ...s, visible } : s)))
    setBusyVis(key)
    setSectionVisible(key, visible).finally(() => setBusyVis(null))
  }

  function onSaved(key: string, config: SectionConfig) {
    setSections((ss) => ss.map((s) => (s.key === key ? { ...s, config } : s)))
    setEditing(null)
  }

  return (
    <div className="space-y-2.5">
      {sections.map((s, i) => {
        const m = meta(s.key)
        const isEditing = editing === s.key
        return (
          <div key={s.key} className={cn('glass overflow-hidden rounded-2xl border', s.visible ? 'border-glass-border' : 'border-glass-border opacity-60')}>
            <div className="flex items-center gap-3 p-3.5">
              {/* reorder */}
              <div className="flex flex-col">
                <button onClick={() => move(i, -1)} disabled={i === 0}
                  className="flex h-5 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground disabled:opacity-25 cursor-pointer" aria-label="Выше">
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button onClick={() => move(i, 1)} disabled={i === sections.length - 1}
                  className="flex h-5 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground disabled:opacity-25 cursor-pointer" aria-label="Ниже">
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
              <GripVertical className="hidden h-4 w-4 shrink-0 text-muted-foreground/40 sm:block" />

              {/* title + note */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-heading text-sm font-600">{m.label}</p>
                <p className="truncate text-xs text-muted-foreground">{m.note}</p>
              </div>

              {/* visibility */}
              <button onClick={() => toggle(s.key)}
                className={cn('flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-600 transition-colors cursor-pointer',
                  s.visible ? 'border-accent/40 text-accent' : 'border-input text-muted-foreground hover:text-foreground')}>
                {busyVis === s.key ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : s.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{s.visible ? 'Видна' : 'Скрыта'}</span>
              </button>

              {/* edit */}
              <button onClick={() => setEditing(isEditing ? null : s.key)}
                className={cn('flex h-9 w-9 items-center justify-center rounded-lg border transition-colors cursor-pointer',
                  isEditing ? 'border-accent/40 text-accent' : 'border-input text-muted-foreground hover:text-foreground')}
                aria-label="Редактировать тексты">
                {isEditing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
              </button>
            </div>

            {isEditing && (
              <SectionEditor section={s} def={m} onSaved={(cfg) => onSaved(s.key, cfg)} />
            )}
          </div>
        )
      })}
    </div>
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
