import { MaintenanceCenter } from '@/components/calculator/MaintenanceCenter'
import { getMaintenanceModels } from '@/lib/queries'

export const metadata = { title: 'Центр ТО' }
export const dynamic = 'force-dynamic'

export default async function CalculatorPage() {
  const models = await getMaintenanceModels()
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-16">
      <p className="text-xs font-600 uppercase tracking-widest text-accent">Контрольный центр</p>
      <h1 className="mt-2 font-heading text-4xl font-700 tracking-tight">Калькулятор обслуживания</h1>
      <p className="mt-3 max-w-xl text-muted-foreground leading-relaxed">
        Выберите модель и точку на временной шкале — система подсветит узлы автомобиля
        и покажет, что заменить и проверить.
      </p>
      <div className="mt-10">
        <MaintenanceCenter models={models} />
      </div>
    </div>
  )
}
