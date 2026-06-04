// Phase 3 — Product Catalog with model filters
// TODO: implement ProductGrid + ModelFilter components
export default function CatalogPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-[family-name:var(--font-rubik)] text-3xl font-600 text-foreground mb-2">
        Каталог запчастей
      </h1>
      <p className="text-muted-foreground mb-8">
        Оригинальные запчасти для Geely и Li Auto с OEM-номерами
      </p>
      {/* TODO: <ModelFilter /> + <ProductGrid /> */}
    </div>
  )
}
