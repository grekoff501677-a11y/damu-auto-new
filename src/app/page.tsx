import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  ShieldCheck,
  Wrench,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react'

const CAR_MODELS = [
  { slug: 'geely-monjaro', label: 'Geely Monjaro' },
  { slug: 'geely-tugella',  label: 'Geely Tugella' },
  { slug: 'geely-preface',  label: 'Geely Preface' },
  { slug: 'geely-coolray',  label: 'Geely Coolray' },
  { slug: 'li-auto-l7',    label: 'Li Auto L7' },
  { slug: 'li-auto-l9',    label: 'Li Auto L9' },
]

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Только оригинал',
    desc: 'Каждая позиция с OEM-номером. Проверяй подлинность по нашим гайдам.',
  },
  {
    icon: Wrench,
    title: 'Калькулятор ТО',
    desc: 'Введи пробег — получи персональный чек-лист замены и проверки.',
  },
  {
    icon: ExternalLink,
    title: 'Заказ через Kaspi',
    desc: 'Прямые ссылки на каждый товар. Оплата и доставка привычным способом.',
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <Badge
              variant="outline"
              className="mb-6 text-accent border-accent/30 bg-accent/5 text-xs font-medium tracking-wide"
            >
              Специализированный магазин · Павлодар
            </Badge>

            <h1 className="font-[family-name:var(--font-rubik)] text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground leading-tight tracking-tight">
              Оригинальные запчасти для{' '}
              <span className="text-accent">Geely</span> и{' '}
              <span className="text-accent">Li Auto</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl">
              Каталог с OEM-номерами, калькулятор ТО и гид по проверке подлинности.
              Никакого шума — только нужные детали для вашего автомобиля.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/catalog">
                <Button size="lg" className="gap-2 cursor-pointer">
                  Открыть каталог
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/calculator">
                <Button size="lg" variant="outline" className="gap-2 cursor-pointer">
                  <Wrench className="h-4 w-4" />
                  Калькулятор ТО
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-[0.03]"
          style={{ background: 'radial-gradient(ellipse at 80% 50%, #22c55e 0%, transparent 70%)' }}
        />
      </section>

      {/* MODEL CHIPS */}
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest mr-2 shrink-0">
              Ваша модель:
            </span>
            {CAR_MODELS.map(({ slug, label }) => (
              <Link key={slug} href={`/catalog?model=${slug}`}>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-foreground hover:text-background hover:border-foreground transition-colors duration-150 text-sm py-1 px-3"
                >
                  {label}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                <Icon className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-foreground font-[family-name:var(--font-rubik)]">
                  {title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* CALCULATOR CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="rounded-2xl border border-border bg-secondary/40 p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
                Инструмент №1
              </p>
              <h2 className="font-[family-name:var(--font-rubik)] text-3xl font-semibold text-foreground leading-tight">
                Калькулятор технического обслуживания
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Выберите модель и введите пробег — система покажет, что нужно заменить
                прямо сейчас и что стоит проверить. Каждый пункт с техническими
                характеристиками и ссылкой на Kaspi.
              </p>
              <Link href="/calculator" className="inline-block mt-6">
                <Button className="gap-2 cursor-pointer">
                  Рассчитать ТО
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Checklist preview */}
            <div className="space-y-3">
              {[
                { type: 'replace', label: 'Моторное масло',     spec: '5W-30 · 4 л' },
                { type: 'replace', label: 'Воздушный фильтр',   spec: 'Оригинальный' },
                { type: 'replace', label: 'Салонный фильтр',    spec: 'Оригинальный' },
                { type: 'inspect', label: 'Антифриз LEC II',    spec: 'Проверить плотность' },
                { type: 'inspect', label: 'Тормозная жидкость', spec: 'Проверить уровень' },
              ].map(({ type, label, spec }) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    {type === 'replace' ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                    )}
                    <span className="text-sm font-medium text-foreground">{label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{spec}</span>
                </div>
              ))}
              <p className="text-xs text-muted-foreground text-center pt-1">
                Пример для Geely Monjaro · 15 000 км
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BLOG PREVIEW */}
      <section className="border-t border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-xl mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
              Наша миссия
            </p>
            <h2 className="font-[family-name:var(--font-rubik)] text-3xl font-semibold text-foreground leading-tight">
              Оригинал vs Подделка
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Рынок наводнён контрафактными деталями. Мы публикуем пошаговые гиды
              по проверке подлинности — с визуальным сравнением и контрольными чеклистами.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { category: 'guide',  title: 'Как проверить подлинность масляного фильтра Geely' },
              { category: 'guide',  title: 'Антифриз LEC II: 5 признаков подделки' },
              { category: 'update', title: 'Новое поступление: запчасти для Li Auto L7 и L9' },
            ].map(({ category, title }) => (
              <Link key={title} href="/blog">
                <Card className="cursor-pointer hover:border-foreground/20 hover:shadow-sm transition-all duration-150 h-full">
                  <CardContent className="p-5">
                    <Badge
                      variant="outline"
                      className={`mb-3 text-xs ${
                        category === 'guide'
                          ? 'text-accent border-accent/30 bg-accent/5'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {category === 'guide' ? 'Гид' : 'Обновление'}
                    </Badge>
                    <p className="font-medium text-foreground leading-snug">{title}</p>
                    <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                      Читать <ChevronRight className="h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/blog">
              <Button variant="outline" className="cursor-pointer gap-2">
                Все статьи
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="font-[family-name:var(--font-rubik)] text-2xl font-semibold text-foreground">
            Есть вопрос? Напишите нам
          </h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Поможем подобрать нужную деталь или проверить совместимость
          </p>
          <Link href="/contact" className="inline-block mt-6">
            <Button variant="outline" className="cursor-pointer gap-2">
              Связаться
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

    </div>
  )
}
