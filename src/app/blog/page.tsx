import Link from 'next/link'
import { ChevronRight, FileText } from 'lucide-react'
import { Reveal } from '@/components/shared/Reveal'
import { getPublishedPosts } from '@/lib/queries'

export const metadata = { title: 'Оригинал vs Подделка' }
export const dynamic = 'force-dynamic'

export default async function BlogPage() {
  const posts = await getPublishedPosts()

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-12 pb-16">
      <p className="text-xs font-600 uppercase tracking-widest text-accent">Экспертный блог</p>
      <h1 className="mt-2 font-heading text-4xl font-700 tracking-tight">Оригинал vs Подделка</h1>
      <p className="mt-3 max-w-xl text-muted-foreground leading-relaxed">
        Обновления магазина и образовательные материалы по проверке подлинности запчастей.
      </p>

      {posts.length === 0 ? (
        <div className="glass mt-12 flex flex-col items-center justify-center rounded-2xl p-16 text-center">
          <FileText className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Статьи скоро появятся. Загляните позже.</p>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {posts.map((p, i) => (
            <Reveal key={p.id} delay={Math.min(i * 0.05, 0.25)}>
              <Link href={`/blog/${p.slug}`} className="group block h-full">
                <article className="glass flex h-full flex-col overflow-hidden rounded-2xl transition-colors duration-200 hover:border-accent/30">
                  <div className="relative aspect-[16/9] overflow-hidden"
                    style={{ background: p.cover_image ? undefined : 'linear-gradient(160deg,#0B253A,#061521)' }}>
                    {p.cover_image && <img src={p.cover_image} alt={p.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                    <div className="absolute inset-0 grid-backdrop opacity-30" />
                    <span className="absolute left-3 top-3 rounded-full border border-accent/25 bg-black/50 px-2.5 py-1 text-[10px] font-600 text-accent backdrop-blur-md">
                      {p.category === 'guide' ? 'Гид' : 'Обновление'}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="font-heading text-lg font-700 leading-snug">{p.title}</h2>
                    {p.excerpt && <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">{p.excerpt}</p>}
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-600 text-accent">
                      Читать <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </article>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  )
}
