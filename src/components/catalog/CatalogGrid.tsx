'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ExternalLink, X, Check } from 'lucide-react'
import { TiltCard } from '@/components/shared/TiltCard'
import { useMediaQuery } from '@/lib/useMediaQuery'
import { CATEGORIES, DEMO_PRODUCTS, type CatalogCategory, type CatalogProduct } from '@/lib/catalog-data'
import { cn } from '@/lib/utils'

function productBg(hue: number) {
  // brand-tinted product imagery (oceanic blue + warm gold highlights)
  return `radial-gradient(circle at 30% 25%, hsla(${hue},45%,55%,0.22), transparent 60%),
          radial-gradient(circle at 75% 80%, rgba(196,154,69,0.18), transparent 55%),
          linear-gradient(160deg, #0B253A, #061521)`
}

export function CatalogGrid() {
  const [cat, setCat] = useState<CatalogCategory | 'all'>('all')
  const [selected, setSelected] = useState<CatalogProduct | null>(null)
  const isMobile = useMediaQuery('(max-width: 767px)')

  const products = useMemo(
    () => (cat === 'all' ? DEMO_PRODUCTS : DEMO_PRODUCTS.filter((p) => p.category === cat)),
    [cat]
  )

  return (
    <div>
      {/* Category tabs (scrollable, 48px targets) */}
      <div className="no-scrollbar mb-8 flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => {
          const active = cat === c.id
          return (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={cn(
                'relative min-h-11 shrink-0 rounded-full px-4 text-sm font-500 transition-colors duration-150 cursor-pointer',
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

      {/* Grid — strict 2-col on mobile */}
      <motion.div layout className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
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
              <TiltCard className="h-full rounded-2xl" intensity={isMobile ? 0 : 8} glare={!isMobile}>
                <div className="glass h-full overflow-hidden rounded-2xl transition-colors duration-200 group-hover:border-accent/30">
                  <motion.div layoutId={`img-${p.id}`} className="relative aspect-[4/3] overflow-hidden"
                    style={{ background: productBg(p.hue) }}>
                    <div className="absolute inset-0 grid-backdrop opacity-30" />
                    <div className="absolute right-2 top-2 rounded-full border border-glass-border bg-black/40 px-2 py-0.5 font-mono text-[10px] text-muted-foreground backdrop-blur-md">
                      OEM {p.oem}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <div className="flex flex-wrap gap-1">
                        {p.models.map((m) => (
                          <span key={m} className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-foreground">{m}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                  <div className="p-3 sm:p-4">
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

      {/* Expansion: bottom sheet (mobile) / morph modal (desktop) */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
            />

            {isMobile ? (
              /* ── Bottom sheet ── */
              <motion.div
                className="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto rounded-t-3xl glass-strong"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.4 }}
                onDragEnd={(_, info) => { if (info.offset.y > 120) setSelected(null) }}
              >
                <div className="sticky top-0 flex justify-center bg-transparent pt-3 pb-1">
                  <span className="h-1.5 w-12 rounded-full bg-white/20" />
                </div>
                <SheetBody product={selected} onClose={() => setSelected(null)} />
              </motion.div>
            ) : (
              /* ── Desktop morph modal ── */
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
                <motion.div
                  layoutId={`card-${selected.id}`}
                  className="glass-strong w-full max-w-lg overflow-hidden rounded-3xl"
                  onClick={(e) => e.stopPropagation()}
                  transition={{ type: 'spring', stiffness: 200, damping: 26 }}
                >
                  <motion.div layoutId={`img-${selected.id}`} className="relative aspect-[16/10]" style={{ background: productBg(selected.hue) }}>
                    <div className="absolute inset-0 grid-backdrop opacity-30" />
                    <button onClick={() => setSelected(null)}
                      className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-glass-border bg-black/50 text-foreground backdrop-blur-md transition-colors hover:bg-black/70 cursor-pointer">
                      <X className="h-4 w-4" />
                    </button>
                    <div className="absolute left-3 top-3 rounded-full border border-glass-border bg-black/40 px-2.5 py-1 font-mono text-[11px] text-muted-foreground backdrop-blur-md">
                      OEM {selected.oem}
                    </div>
                  </motion.div>
                  <div className="p-6">
                    <motion.h3 layoutId={`title-${selected.id}`} className="font-heading text-xl font-700">{selected.name}</motion.h3>
                    <DetailBody product={selected} />
                  </div>
                </motion.div>
              </div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function SheetBody({ product, onClose }: { product: CatalogProduct; onClose: () => void }) {
  return (
    <div>
      <div className="relative mx-4 aspect-[16/9] overflow-hidden rounded-2xl" style={{ background: productBg(product.hue) }}>
        <div className="absolute inset-0 grid-backdrop opacity-30" />
        <button onClick={onClose}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-glass-border bg-black/50 text-foreground backdrop-blur-md cursor-pointer">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-5">
        <p className="font-mono text-[11px] text-muted-foreground">OEM {product.oem}</p>
        <h3 className="mt-1 font-heading text-xl font-700">{product.name}</h3>
        <DetailBody product={product} />
      </div>
    </div>
  )
}

function DetailBody({ product }: { product: CatalogProduct }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
      <div className="mt-4">
        <p className="mb-2 text-xs font-600 uppercase tracking-widest text-muted-foreground">Применимость</p>
        <div className="flex flex-wrap gap-1.5">
          {product.models.map((m) => (
            <span key={m} className="flex items-center gap-1 rounded-full border border-accent/25 bg-accent/5 px-2.5 py-1 text-xs text-accent">
              <Check className="h-3 w-3" /> {m}
            </span>
          ))}
        </div>
      </div>
      <a href={product.kaspiUrl} target="_blank" rel="noopener noreferrer"
        className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-700 text-accent-foreground transition-all duration-200 hover:shadow-[0_0_24px_-4px_rgba(196,154,69,0.7)] cursor-pointer">
        Заказать на Kaspi.kz
        <ExternalLink className="h-4 w-4" />
      </a>
    </motion.div>
  )
}
