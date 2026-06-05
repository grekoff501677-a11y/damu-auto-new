import { MacroCompareSlider } from '@/components/blog/MacroCompareSlider'
import { Reveal } from '@/components/shared/Reveal'
import {
  TEXTURE_ORIGINAL_FILTER, TEXTURE_FAKE_FILTER,
  TEXTURE_ORIGINAL_FLUID, TEXTURE_FAKE_FLUID,
} from '@/lib/textures'

export const metadata = { title: 'Оригинал vs Подделка' }

const GUIDES = [
  {
    title: 'Масляный фильтр Geely: оригинал против подделки',
    caption: 'Структура фильтровальной бумаги · ×2.6',
    original: { label: 'Оригинал', texture: TEXTURE_ORIGINAL_FILTER },
    counterfeit: { label: 'Подделка', texture: TEXTURE_FAKE_FILTER },
    text: 'У оригинала плотная равномерная гофра и одинаковая толщина волокон. Подделка выдаёт себя рыхлой, неравномерной структурой и инородными вкраплениями.',
  },
  {
    title: 'Антифриз LEC II: плотность жидкости',
    caption: 'Однородность раствора · ×2.6',
    original: { label: 'Оригинал', texture: TEXTURE_ORIGINAL_FLUID },
    counterfeit: { label: 'Подделка', texture: TEXTURE_FAKE_FLUID },
    text: 'Оригинальный концентрат однороден по всей массе. Подделка расслаивается, образует мутные пятна и осадок.',
  },
]

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-12 pb-16">
      <p className="text-xs font-600 uppercase tracking-widest text-accent">Экспертный блог</p>
      <h1 className="mt-2 font-heading text-4xl font-700 tracking-tight">Оригинал vs Подделка</h1>
      <p className="mt-3 max-w-xl text-muted-foreground leading-relaxed">
        Включите макро-линзу и наведите курсор на сравнение, чтобы рассмотреть
        детали структуры под увеличением.
      </p>

      <div className="mt-12 space-y-16">
        {GUIDES.map((g, i) => (
          <Reveal key={g.title} delay={i * 0.05}>
            <article className="glass rounded-3xl p-5 sm:p-7">
              <h2 className="mb-1 font-heading text-2xl font-700">{g.title}</h2>
              <p className="mb-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{g.text}</p>
              <MacroCompareSlider original={g.original} counterfeit={g.counterfeit} caption={g.caption} />
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
