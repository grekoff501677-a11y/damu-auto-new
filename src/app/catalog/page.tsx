import { CatalogGrid } from '@/components/catalog/CatalogGrid'
import { getCatalogProducts, getCarModels, CATEGORY_LABELS } from '@/lib/queries'

export const metadata = { title: 'Каталог запчастей' }

// always reflect latest admin changes
export const dynamic = 'force-dynamic'

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ model?: string }> }) {
  const { model: modelSlug } = await searchParams
  const [products, carModels] = await Promise.all([getCatalogProducts(), getCarModels()])

  // distinct compatible model names actually present on products
  const modelNames = Array.from(new Set(products.flatMap((p) => p.models)))
    .sort((a, b) => a.localeCompare(b, 'ru'))

  // resolve preselected model slug -> name
  const initialModel = carModels.find((m) => m.slug === modelSlug)?.name

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-8">
      <p className="text-xs font-600 uppercase tracking-widest text-accent">Каталог</p>
      <h1 className="mt-2 font-heading text-4xl font-700 tracking-tight">Запчасти и аксессуары</h1>
      <p className="mt-3 max-w-xl text-muted-foreground leading-relaxed">
        Оригинальные детали для Geely. Нажмите на карточку — описание,
        совместимость и кнопка Kaspi откроются прямо здесь.
      </p>
      <div className="mt-10">
        <CatalogGrid products={products} categories={CATEGORY_LABELS} models={modelNames} initialModel={initialModel} />
      </div>
    </div>
  )
}
