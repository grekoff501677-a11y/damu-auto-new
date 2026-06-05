import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, FileText, Wrench, Users, LogOut } from 'lucide-react'

const SECTIONS = [
  {
    href:  '/admin/products',
    icon:  Package,
    title: 'Товары',
    desc:  'Добавление, редактирование и удаление позиций каталога',
  },
  {
    href:  '/admin/blog',
    icon:  FileText,
    title: 'Блог / Статьи',
    desc:  'Публикация обновлений и гайдов «Оригинал vs Подделка»',
  },
  {
    href:  '/admin/calculator',
    icon:  Wrench,
    title: 'Калькулятор ТО',
    desc:  'Матрица интервалов замены и проверки по моделям',
  },
  {
    href:  '/admin/leads',
    icon:  Users,
    title: 'Заявки',
    desc:  'Просмотр входящих заявок с сайта',
  },
]

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-rubik)] text-2xl font-600 text-foreground">
            Панель управления
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
        </div>
        <form action="/admin/logout" method="POST">
          <Button variant="outline" size="sm" className="gap-2 cursor-pointer" formAction="/api/auth/logout">
            <LogOut className="h-4 w-4" />
            Выйти
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SECTIONS.map(({ href, icon: Icon, title, desc }) => (
          <Link key={href} href={href} className="cursor-pointer">
            <Card className="h-full hover:border-foreground/20 hover:shadow-sm transition-all duration-150 cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <CardTitle className="text-base font-600">{title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
