import { AdminHeader } from '@/components/admin/AdminHeader'
import { BlogForm } from '../BlogForm'

export const metadata = { title: 'Новая статья · Админ' }

export default function NewBlogPage() {
  return (
    <div>
      <AdminHeader title="Новая статья" desc="Создайте обновление или гид" />
      <div className="glass rounded-2xl p-5 sm:p-6">
        <BlogForm />
      </div>
    </div>
  )
}
