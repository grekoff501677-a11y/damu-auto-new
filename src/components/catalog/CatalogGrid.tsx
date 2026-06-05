'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ExternalLink, X, Check } from 'lucide-react'
import { TiltCard } from '@/components/shared/TiltCard'
import { CATEGORIES, DEMO_PRODUCTS, type CatalogCategory, type CatalogProduct } from '@/lib/catalog-data'
import { cn } from '@/lib/utils'

function productBg(hue: number) {
  return `radial-gradient(circle at 30% 25%, hsla(${hue},70%,55%,0.25), transparent 60%),
          radial-gradient(circle at 75% 80%, hsla(${hue + 30},70%,50%,0.18), transparent 55%),
          linear-gradient(160deg, #14161F, #0d0e15)`
}

export function CatalogGrid() {
  const [cat, setCat] = useState<CatalogCategory | 'all'>('all')
  const [selected, setSelected] = useState<CatalogProduct | null>(null)

  const products = useMemo(
    () => (cat === 'all' ? DEMO_PRODUCTS : DEMO_PRODUCTS.filter((p) => p.category === cat)),
    [cat]
  )

  return (
    <div>
      {/* Tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => {
          const active = cat === c.id
          return (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={cn(
                'relative rounded-full px-4 py-2 text-sm font-500 transition-colors duration-150 cursor-pointer',
                active ? 'text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {active && (
                <motion.span layoutId="cat-pill" className="absolute inset-0 -z-10 rounded-full bg-accent"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
              )}
              {c.label}
            </button>
          )
        })}
      </div>

      {/* Grid */}
      <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {products.map((p) => (
            <motion.div
              key={p.id}
              layout
              layoutId={`card-${p.id}`}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 200, damping: 24 }}
              onClick={() => setSelected(p)}
              className="group cursor-pointer"
            >
              <TiltCard className="h-full rounded-2xl">
                <div className="glass h-full overflow-hidden rounded-2xl transition-colors duration-200 group-hover:border-accent/30">
                  {/* image */}
                  <motion.div layoutId={`img-${p.id}`} className="relative aspect-[4/3] overflow-hidden"
                    style={{ background: productBg(p.hue) }}>
                    <div className="absolute inset-0 grid-backdrop opacity-30" />
                    <div className="absolute right-2 top-2 rounded-full border border-glass-border bg-black/40 px-2 py-0.5 font-mono text-[10px] text-muted-foreground backdrop-blur-md">
                      OEM {p.oem}
                    </div>
                    {/* specs fade-in on hover */}
                    <div className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <div className="flex flex-wrap gap-1">
                        {p.models.map((m) => (
                          <span key={m} className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-foreground">{m}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                  {/* meta */}
                  <div className="p-4">
                    <motion.h3 layoutId={`title-${p.id}`} className="font-heading text-sm font-600 leading-snug">
                      {p.name}
                    </motion.h3>
                    <p className="mt-1 text-xs text-muted-foreground">{p.short}</p>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Expanded morph overlay */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
              <motion.div
                layoutId={`card-${selected.id}`}
                className="glass-strong w-full max-w-lg overflow-hidden rounded-3xl"
                onClick={(e) => e.stopPropagation()}
                transition={{ type: 'spring', stiffness: 200, damping: 26 }}
              >
                <motion.div layoutId={`img-${selected.id}`} className="relative aspect-[16/10]"
                  style={{ background: productBg(selected.hue) }}>
                  <div className="absolute inset-0 grid-backdrop opacity-30" />
                  <button
                    onClick={() => setSelected(null)}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-glass-border bg-black/50 text-foreground backdrop-blur-md transition-colors hover:bg-black/70 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="absolute left-3 top-3 rounded-full border border-glass-border bg-black/40 px-2.5 py-1 font-mono text-[11px] text-muted-foreground backdrop-blur-md">
                    OEM {selected.oem}
                  </div>
                </motion.div>

                <div className="p-6">
                  <motion.h3 layoutId={`title-${selected.id}`} className="font-heading text-xl font-700">
                    {selected.name}
                  </motion.h3>

                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{selected.description}</p>

                    <div className="mt-4">
                      <p className="mb-2 text-xs font-600 uppercase tracking-widest text-muted-foreground">Применимость</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.models.map((m) => (
                          <span key={m} className="flex items-center gap-1 rounded-full border border-accent/20 bg-accent/5 px-2.5 py-1 text-xs text-accent">
                            <Check className="h-3 w-3" /> {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    <a href={selected.kaspiUrl} target="_blank" rel="noopener noreferrer"
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-700 text-accent-foreground transition-all duration-200 hover:shadow-[0_0_24px_-4px_rgba(0,230,118,0.7)] cursor-pointer">
                      Заказать на Kaspi.kz
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
