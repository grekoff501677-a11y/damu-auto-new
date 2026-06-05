import { CatalogGrid } from '@/components/catalog/CatalogGrid'

export const metadata = { title: 'Каталог запчастей' }

export default function CatalogPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-8">
      <p className="text-xs font-600 uppercase tracking-widest text-accent">Каталог</p>
      <h1 className="mt-2 font-heading text-4xl font-700 tracking-tight">Запчасти и аксессуары</h1>
      <p className="mt-3 max-w-xl text-muted-foreground leading-relaxed">
        Оригинальные детали для Geely и Li Auto. Нажмите на карточку — описание,
        совместимость и кнопка Kaspi откроются прямо здесь.
      </p>
      <div className="mt-10">
        <CatalogGrid />
      </div>
    </div>
  )
}
