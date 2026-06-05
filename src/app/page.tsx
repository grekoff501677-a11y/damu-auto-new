import Link from 'next/link'
import { ArrowRight, ShieldCheck, Wrench, ExternalLink, Gauge } from 'lucide-react'
import { Reveal } from '@/components/shared/Reveal'
import { MaintenanceCenter } from '@/components/calculator/MaintenanceCenter'
import { MacroCompareSlider } from '@/components/blog/MacroCompareSlider'
import { LeadForm } from '@/components/forms/LeadForm'
import {
  TEXTURE_ORIGINAL_FILTER, TEXTURE_FAKE_FILTER,
} from '@/lib/textures'

const CAR_MODELS = [
  'Geely Monjaro', 'Geely Tugella', 'Geely Preface', 'Geely Coolray', 'Li Auto L7', 'Li Auto L9',
]

const FEATURES = [
  { icon: ShieldCheck, title: 'Только оригинал', desc: 'Каждая позиция с OEM-номером и гидом по проверке подлинности.' },
  { icon: Gauge, title: 'Контрольный центр ТО', desc: 'Интерактивный расчёт обслуживания по пробегу с визуализацией.' },
  { icon: ExternalLink, title: 'Заказ через Kaspi', desc: 'Прямые ссылки на каждый товар — привычная оплата и доставка.' },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div className="grid-backdrop absolute inset-0 -z-10 opacity-50" />
        <div className="absolute left-1/2 top-0 -z-10 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-28">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-surface/60 px-3 py-1 text-xs font-500 text-muted-foreground backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_2px_rgba(0,230,118,0.6)]" />
              Экспертный хаб · Павлодар
            </span>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-6 max-w-4xl font-heading text-4xl font-700 leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              Оригинальные запчасти для{' '}
              <span className="text-accent">Geely</span>{' '}
              <span className="text-gradient">и Li Auto</span>
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Инженерный подход без воды. Интерактивный центр ТО, макро-сравнение
              оригинала и подделки, каталог с проверенными OEM-номерами.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/catalog">
                <button className="group flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-700 text-accent-foreground transition-all duration-200 hover:shadow-[0_0_28px_-4px_rgba(0,230,118,0.7)] cursor-pointer">
                  Открыть каталог
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </Link>
              <Link href="/calculator">
                <button className="flex items-center gap-2 rounded-xl border border-input bg-surface/60 px-6 py-3.5 text-sm font-600 backdrop-blur-md transition-colors hover:border-accent/40 cursor-pointer">
                  <Wrench className="h-4 w-4" />
                  Центр ТО
                </button>
              </Link>
            </div>
          </Reveal>

          {/* model chips */}
          <Reveal delay={0.32}>
            <div className="mt-12 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-500 uppercase tracking-widest text-muted-foreground">Модели:</span>
              {CAR_MODELS.map((m) => (
                <Link key={m} href={`/catalog`}>
                  <span className="rounded-full border border-glass-border bg-surface/40 px-3 py-1.5 text-sm text-muted-foreground backdrop-blur-md transition-colors hover:border-accent/40 hover:text-foreground cursor-pointer">
                    {m}
                  </span>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <Reveal key={title} delay={i * 0.08}>
              <div className="glass h-full rounded-2xl p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-4 font-heading font-600">{title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── MAINTENANCE CENTER ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <Reveal>
          <SectionHead
            kicker="Инструмент №1"
            title="Контрольный центр обслуживания"
            desc="Выберите модель и точку на временной шкале — силуэт автомобиля подсветит узлы, а нужные детали появятся справа с OEM-спецификацией и ссылкой на Kaspi."
          />
        </Reveal>
        <Reveal delay={0.1}>
          <MaintenanceCenter />
        </Reveal>
      </section>

      {/* ── ORIGINALITY HUB ── */}
      <section className="border-y border-glass-border bg-surface/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <Reveal>
            <SectionHead
              kicker="Наша миссия"
              title="Оригинал vs Подделка"
              desc="Включите макро-линзу и наведите на сравнение — увеличение ×2.6 покажет разницу в структуре волокон фильтра оригинала и подделки."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mx-auto max-w-3xl">
              <MacroCompareSlider
                original={{ label: 'Оригинал Geely', texture: TEXTURE_ORIGINAL_FILTER }}
                counterfeit={{ label: 'Подделка', texture: TEXTURE_FAKE_FILTER }}
                caption="Масляный фильтр · структура фильтровальной бумаги"
              />
            </div>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="mt-8 text-center">
              <Link href="/blog">
                <button className="inline-flex items-center gap-2 rounded-xl border border-input bg-surface/60 px-6 py-3 text-sm font-600 backdrop-blur-md transition-colors hover:border-accent/40 cursor-pointer">
                  Все гиды и обновления
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── LEAD FORM ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <SectionHead
              kicker="Связь"
              title="Не нашли нужную деталь?"
              desc="Оставьте заявку — подберём запчасть по VIN или модели и проверим совместимость. Отвечаем быстро."
              className="mb-0"
            />
          </Reveal>
          <Reveal delay={0.1}>
            <LeadForm source="website" />
          </Reveal>
        </div>
      </section>
    </div>
  )
}

function SectionHead({ kicker, title, desc, className = 'mb-8' }: {
  kicker: string; title: string; desc: string; className?: string
}) {
  return (
    <div className={className}>
      <p className="text-xs font-600 uppercase tracking-widest text-accent">{kicker}</p>
      <h2 className="mt-2 max-w-2xl font-heading text-3xl font-700 leading-tight md:text-4xl">{title}</h2>
      <p className="mt-3 max-w-xl text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  )
}
