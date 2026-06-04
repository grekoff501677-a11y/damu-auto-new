import Link from 'next/link'
import { MapPin, Phone, ExternalLink } from 'lucide-react'

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
  </svg>
)
import { Separator } from '@/components/ui/separator'

const CATALOG_LINKS = [
  { href: '/catalog?model=geely-monjaro', label: 'Geely Monjaro' },
  { href: '/catalog?model=geely-tugella', label: 'Geely Tugella' },
  { href: '/catalog?model=geely-preface', label: 'Geely Preface' },
  { href: '/catalog?model=li-auto-l7',    label: 'Li Auto L7' },
  { href: '/catalog?model=li-auto-l9',    label: 'Li Auto L9' },
]

const INFO_LINKS = [
  { href: '/calculator', label: 'Калькулятор ТО' },
  { href: '/blog',       label: 'Гид: Оригинал vs Подделка' },
  { href: '/contact',   label: 'Связаться с нами' },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40 mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block cursor-pointer">
              <span className="font-[family-name:var(--font-rubik)] text-lg font-600 tracking-tight">
                Damu<span className="text-accent">Auto</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Специализированный магазин оригинальных запчастей для Geely и Li Auto.
              Только проверенные детали с OEM-номерами.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors duration-150 cursor-pointer"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://kaspi.kz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 p-2 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors duration-150 cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Kaspi магазин
              </a>
            </div>
          </div>

          {/* Catalog */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Каталог
            </p>
            <ul className="space-y-2">
              {CATALOG_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150 cursor-pointer"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Информация
            </p>
            <ul className="space-y-2">
              {INFO_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150 cursor-pointer"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Контакты
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
                <span>г. Павлодар, ул. Примерная 1</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-accent" />
                <a
                  href="tel:+77001234567"
                  className="hover:text-foreground transition-colors duration-150 cursor-pointer"
                >
                  +7 (700) 123-45-67
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Damu Auto. Все права защищены.</p>
          <p>ИП Damu Auto · г. Павлодар, Казахстан</p>
        </div>
      </div>
    </footer>
  )
}
