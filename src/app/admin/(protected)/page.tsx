import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Package, FileText, Wrench, Users, Car } from 'lucide-react'

const SECTIONS = [
  { href: '/admin/products',   icon: Package,  title: 'Товары',         desc: 'Добавление, редактирование и удаление позиций каталога' },
  { href: '/admin/blog',       icon: FileText, title: 'Блог / Статьи',  desc: 'Публикация обновлений и гайдов «Оригинал vs Подделка»' },
  { href: '/admin/calculator', icon: Wrench,   title: 'Калькулятор ТО', desc: 'Матрица интервалов замены и проверки по моделям' },
  { href: '/admin/blueprints', icon: Car,      title: 'Схемы авто',     desc: 'Изображения моделей и интерактивные точки для блока ТО' },
  { href: '/admin/leads',      icon: Users,    title: 'Заявки',         desc: 'Просмотр входящих заявок с сайта' },
]

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  // counts for a quick overview (RLS allows authenticated full access)
  const [{ count: products }, { count: leads }, { count: posts }] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Товаров', value: products ?? 0 },
    { label: 'Заявок', value: leads ?? 0 },
    { label: 'Статей', value: posts ?? 0 },
  ]

  return (
    <div>
      <h1 className="font-heading text-2xl font-700">Панель управления</h1>
      <p className="mt-1 text-sm text-muted-foreground">Обзор и управление контентом сайта</p>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-4">
            <p className="font-heading text-2xl font-700 text-accent">{s.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Sections */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SECTIONS.map(({ href, icon: Icon, title, desc }) => (
          <Link key={href} href={href} className="cursor-pointer">
            <div className="glass h-full rounded-2xl p-5 transition-colors duration-150 hover:border-accent/30">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-heading text-base font-600">{title}</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
