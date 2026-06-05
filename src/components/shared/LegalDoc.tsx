import { Reveal } from '@/components/shared/Reveal'

export type LegalSection = {
  heading: string
  body?: string[]
  list?: string[]
}

type Props = {
  title: string
  updated: string
  intro?: string
  sections: LegalSection[]
}

export function LegalDoc({ title, updated, intro, sections }: Props) {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-12 pb-20">
      <Reveal>
        <p className="text-xs font-600 uppercase tracking-widest text-accent">Правовая информация</p>
        <h1 className="mt-2 font-heading text-3xl font-700 tracking-tight md:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">Последнее обновление: {updated}</p>
        {intro && <p className="mt-6 leading-relaxed text-muted-foreground">{intro}</p>}
      </Reveal>

      <div className="mt-10 space-y-8">
        {sections.map((s, i) => (
          <Reveal key={s.heading} delay={Math.min(i * 0.04, 0.2)}>
            <section className="glass rounded-2xl p-6">
              <h2 className="font-heading text-lg font-700 text-foreground">
                <span className="mr-2 text-accent">{i + 1}.</span>{s.heading}
              </h2>
              {s.body?.map((p, j) => (
                <p key={j} className="mt-3 text-sm leading-relaxed text-muted-foreground">{p}</p>
              ))}
              {s.list && (
                <ul className="mt-3 space-y-2">
                  {s.list.map((item, k) => (
                    <li key={k} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
