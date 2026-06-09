import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft } from 'lucide-react'
import { MacroCompareSlider } from '@/components/blog/MacroCompareSlider'
import { getPostBySlug } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  return { title: post?.title ?? 'Статья', description: post?.excerpt ?? undefined }
}

const MD =
  'max-w-none text-muted-foreground leading-relaxed ' +
  '[&_h1]:font-heading [&_h1]:text-foreground [&_h1]:text-3xl [&_h1]:font-700 [&_h1]:mt-8 [&_h1]:mb-3 ' +
  '[&_h2]:font-heading [&_h2]:text-foreground [&_h2]:text-2xl [&_h2]:font-700 [&_h2]:mt-8 [&_h2]:mb-3 ' +
  '[&_h3]:font-heading [&_h3]:text-foreground [&_h3]:text-lg [&_h3]:font-600 [&_h3]:mt-6 [&_h3]:mb-2 ' +
  '[&_p]:my-4 [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 ' +
  '[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1.5 ' +
  '[&_strong]:text-foreground [&_strong]:font-700 ' +
  '[&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_blockquote]:italic ' +
  '[&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_code]:font-mono ' +
  '[&_img]:rounded-xl [&_img]:my-6'

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const hasCompare = !!(post.before_image && post.after_image)
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-12 pb-20">
      <Link href="/blog" className="mb-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground cursor-pointer">
        <ArrowLeft className="h-3.5 w-3.5" /> Все статьи
      </Link>

      <div className="flex items-center gap-3">
        <span className="rounded-full border border-accent/25 bg-accent/5 px-2.5 py-1 text-[10px] font-600 text-accent">
          {post.category === 'guide' ? 'Гид' : 'Обновление'}
        </span>
        {date && <span className="text-xs text-muted-foreground">{date}</span>}
      </div>

      <h1 className="mt-4 font-heading text-3xl font-700 leading-tight tracking-tight md:text-4xl">{post.title}</h1>
      {post.excerpt && <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>}

      {post.cover_image && (
        <img src={post.cover_image} alt={post.title} className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover" />
      )}

      {hasCompare && (
        <div className="mt-8">
          <MacroCompareSlider
            original={{ label: post.before_label, image: post.before_image! }}
            counterfeit={{ label: post.after_label, image: post.after_image! }}
            caption="Перетащите ползунок · удержите для макро-линзы"
          />
        </div>
      )}

      <div className={`mt-8 ${MD}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>
    </article>
  )
}
