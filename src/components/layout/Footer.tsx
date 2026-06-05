'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MapPin, Phone, ExternalLink } from 'lucide-react'

const CATALOG_LINKS = [
  { href: '/catalog?model=geely-monjaro', label: 'Geely Monjaro' },
  { href: '/catalog?model=geely-tugella', label: 'Geely Tugella' },
  { href: '/catalog?model=geely-preface', label: 'Geely Preface' },
  { href: '/catalog?model=li-auto-l7',    label: 'Li Auto L7' },
  { href: '/catalog?model=li-auto-l9',    label: 'Li Auto L9' },
]

const INFO_LINKS = [
  { href: '/calculator', label: 'Центр ТО' },
  { href: '/blog',       label: 'Оригинал vs Подделка' },
  { href: '/contact',   label: 'Связаться с нами' },
]

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
    strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
)

export function Footer() {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return null

  return (
    <footer className="relative mt-24 border-t border-glass-border">
      <div className="grid-backdrop absolute inset-0 -z-10 opacity-40" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 cursor-pointer">
              <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 ring-1 ring-accent/30">
                <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_2px_rgba(0,230,118,0.7)]" />
              </span>
              <span className="font-heading text-lg font-700 tracking-tight">
                Damu<span className="text-accent">Auto</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Премиальный хаб оригинальных запчастей для Geely и Li Auto.
              Только проверенные детали с OEM-номерами.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="rounded-lg border border-glass-border p-2.5 text-muted-foreground transition-colors duration-150 hover:border-accent/30 hover:text-accent cursor-pointer">
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a href="https://kaspi.kz" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-glass-border p-2.5 text-xs text-muted-foreground transition-colors duration-150 hover:border-accent/30 hover:text-accent cursor-pointer">
                <ExternalLink className="h-3.5 w-3.5" />
                Kaspi магазин
              </a>
            </div>
          </div>

          <FooterCol title="Каталог" links={CATALOG_LINKS} />
          <FooterCol title="Информация" links={INFO_LINKS} />

          <div>
            <p className="mb-4 text-xs font-600 uppercase tracking-widest text-muted-foreground">Контакты</p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>г. Павлодар, ул. Примерная 1</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-accent" />
                <a href="tel:+77001234567" className="transition-colors duration-150 hover:text-foreground cursor-pointer">
                  +7 (700) 123-45-67
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-glass-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Damu Auto. Все права защищены.</p>
          <p>ИП Damu Auto · г. Павлодар, Казахстан</p>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="mb-4 text-xs font-600 uppercase tracking-widest text-muted-foreground">{title}</p>
      <ul className="space-y-2.5">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link href={href} className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground cursor-pointer">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
