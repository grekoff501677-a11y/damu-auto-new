import { Fragment } from 'react'
import Link from 'next/link'
import { ArrowRight, ShieldCheck, Wrench, ExternalLink, Gauge } from 'lucide-react'
import { Reveal } from '@/components/shared/Reveal'
import { MaintenanceCenter } from '@/components/calculator/MaintenanceCenter'
import { MacroCompareSlider } from '@/components/blog/MacroCompareSlider'
import { LeadForm } from '@/components/forms/LeadForm'
import { HeroLogo } from '@/components/shared/HeroLogo'
import { getMaintenanceModels, getCarModels, getHomeSections } from '@/lib/queries'
import type { PublicMaintModel } from '@/lib/queries'
import type { SectionConfig } from '@/lib/page-sections'
import type { CarModel } from '@/lib/types'
import { TEXTURE_ORIGINAL_FILTER, TEXTURE_FAKE_FILTER } from '@/lib/textures'

export const dynamic = 'force-dynamic'

const FEATURE_ICONS = [ShieldCheck, Gauge, ExternalLink]

type Ctx = { maintModels: PublicMaintModel[]; carModels: CarModel[] }

export default async function HomePage() {
  const [maintModels, carModels, sections] = await Promise.all([
    getMaintenanceModels(),
    getCarModels(),
    getHomeSections(),
  ])
  const ctx: Ctx = { maintModels, carModels }

  return (
    <div className="flex flex-col">
      {sections.map((s) => {
        const render = RENDERERS[s.key]
        return render ? <Fragment key={s.key}>{render(s.config, ctx)}</Fragment> : null
      })}
    </div>
  )
}

// ── section renderers (keyed by section_key) ──
const RENDERERS: Record<string, (c: SectionConfig, ctx: Ctx) => React.ReactNode> = {
  hero: renderHero,
  features: renderFeatures,
  maintenance: renderMaintenance,
  originality: renderOriginality,
  lead_form: renderLeadForm,
}

const str = (c: SectionConfig, k: string) => String(c[k] ?? '')

// internal links keep SPA nav; external (http…) open in a new tab
function SmartLink({ href, children }: { href: string; children: React.ReactNode }) {
  if (/^https?:\/\//.test(href)) {
    return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
  }
  return <Link href={href || '/'}>{children}</Link>
}

function renderHero(c: SectionConfig, { carModels }: Ctx) {
  return (
    <section className="relative overflow-hidden">
      <div className="grid-backdrop absolute inset-0 -z-10 opacity-50" />
      <div className="absolute left-1/2 top-0 -z-10 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" />

      {/* gradient-traced logo on the right (desktop) */}
      <div className="pointer-events-none absolute inset-y-0 right-2 z-0 hidden items-center justify-center md:flex lg:right-12">
        <HeroLogo className="w-[clamp(300px,30vw,440px)]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-12 md:pt-28 md:pb-16">
        {/* logo for mobile (centered above the headline) */}
        <div className="mb-6 flex justify-center md:hidden">
          <HeroLogo className="w-52" />
        </div>

        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-surface/60 px-3 py-1 text-xs font-500 text-muted-foreground backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_2px_rgba(196,154,69,0.6)]" />
            {str(c, 'badge')}
          </span>
        </Reveal>

        <Reveal delay={0.08}>
          <h1 className="mt-6 max-w-4xl font-heading text-4xl font-700 leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
            {str(c, 'titlePre')}{' '}
            <span className="text-accent">{str(c, 'titleAccent')}</span>{' '}
            <span className="text-gradient">{str(c, 'titlePost')}</span>
          </h1>
        </Reveal>

        <Reveal delay={0.16}>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{str(c, 'subtitle')}</p>
        </Reveal>

        <Reveal delay={0.24}>
          <div className="mt-8 flex flex-wrap gap-3">
            <SmartLink href={str(c, 'ctaPrimaryHref') || '/catalog'}>
              <button className="group flex min-h-12 items-center gap-2 rounded-xl bg-accent px-6 text-sm font-700 text-accent-foreground transition-all duration-200 hover:shadow-[0_0_28px_-4px_rgba(196,154,69,0.7)] cursor-pointer">
                {str(c, 'ctaPrimary')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </SmartLink>
            {c.ctaSecondaryOn !== false && (
              <SmartLink href={str(c, 'ctaSecondaryHref') || '/calculator'}>
                <button className="flex min-h-12 items-center gap-2 rounded-xl border border-input bg-surface/60 px-6 text-sm font-600 backdrop-blur-md transition-colors hover:border-accent/40 cursor-pointer">
                  <Wrench className="h-4 w-4" />
                  {str(c, 'ctaSecondary')}
                </button>
              </SmartLink>
            )}
          </div>
        </Reveal>

        {/* model chips */}
        {c.modelsOn !== false && carModels.length > 0 && (
          <Reveal delay={0.32}>
            <div className="mt-12 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-500 uppercase tracking-widest text-muted-foreground">{str(c, 'modelsLabel')}</span>
              {carModels.map((m) => (
                <Link key={m.id} href={`/catalog?model=${m.slug}`}>
                  <span className="rounded-full border border-glass-border bg-surface/40 px-3 py-1.5 text-sm text-muted-foreground backdrop-blur-md transition-colors hover:border-accent/40 hover:text-foreground cursor-pointer">
                    {m.brand} {m.name}
                  </span>
                </Link>
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}

function renderFeatures(c: SectionConfig) {
  const items = (Array.isArray(c.items) ? c.items : []) as { title: string; desc: string }[]
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {items.map((item, i) => {
          const Icon = FEATURE_ICONS[i] ?? ShieldCheck
          return (
            <Reveal key={i} delay={i * 0.08}>
              <div className="glass h-full rounded-2xl p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-4 font-heading font-600">{item.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

function renderMaintenance(c: SectionConfig, { maintModels }: Ctx) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <Reveal>
        <SectionHead kicker={str(c, 'kicker')} title={str(c, 'title')} desc={str(c, 'desc')} />
      </Reveal>
      <Reveal delay={0.1}>
        <MaintenanceCenter models={maintModels} />
      </Reveal>
    </section>
  )
}

function renderOriginality(c: SectionConfig) {
  return (
    <section className="border-y border-glass-border bg-surface/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <Reveal>
          <SectionHead kicker={str(c, 'kicker')} title={str(c, 'title')} desc={str(c, 'desc')} />
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mx-auto max-w-3xl">
            <MacroCompareSlider
              original={{ label: 'Оригинал Geely', texture: TEXTURE_ORIGINAL_FILTER }}
              counterfeit={{ label: 'Подделка', texture: TEXTURE_FAKE_FILTER }}
              caption={str(c, 'caption')}
            />
          </div>
        </Reveal>
        <Reveal delay={0.16}>
          <div className="mt-8 text-center">
            <Link href="/blog">
              <button className="inline-flex items-center gap-2 rounded-xl border border-input bg-surface/60 px-6 py-3 text-sm font-600 backdrop-blur-md transition-colors hover:border-accent/40 cursor-pointer">
                {str(c, 'ctaLabel')}
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function renderLeadForm(c: SectionConfig) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
        <Reveal>
          <SectionHead kicker={str(c, 'kicker')} title={str(c, 'title')} desc={str(c, 'desc')} className="mb-0" />
        </Reveal>
        <Reveal delay={0.1}>
          <LeadForm source="website" />
        </Reveal>
      </div>
    </section>
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
