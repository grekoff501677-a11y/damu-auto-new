import { MapPin, Phone, Clock, ExternalLink } from 'lucide-react'
import { LeadForm } from '@/components/forms/LeadForm'
import { Reveal } from '@/components/shared/Reveal'

export const metadata = { title: 'Контакты' }

const InfoRow = ({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) => (
  <div className="flex items-start gap-3">
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
      <Icon className="h-5 w-5" />
    </span>
    <div>
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-500 text-foreground">{value}</p>
    </div>
  </div>
)

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-16">
      <p className="text-xs font-600 uppercase tracking-widest text-accent">Контакты</p>
      <h1 className="mt-2 font-heading text-4xl font-700 tracking-tight">Свяжитесь с нами</h1>
      <p className="mt-3 max-w-xl text-muted-foreground leading-relaxed">
        Поможем подобрать запчасть, проверить совместимость или оформить заказ.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <Reveal>
          <div className="glass space-y-6 rounded-3xl p-7">
            <InfoRow icon={MapPin} label="Адрес" value="г. Павлодар, ул. Примерная 1" />
            <InfoRow icon={Phone} label="Телефон" value="+7 (700) 123-45-67" />
            <InfoRow icon={Clock} label="Режим работы" value="Пн–Сб · 10:00–19:00" />
            <a href="https://kaspi.kz" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-input bg-surface/60 px-4 py-3 text-sm font-600 transition-colors hover:border-accent/40 cursor-pointer">
              <ExternalLink className="h-4 w-4" />
              Магазин на Kaspi.kz
            </a>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <LeadForm source="website" />
        </Reveal>
      </div>
    </div>
  )
}
