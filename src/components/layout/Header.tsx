'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, ShoppingCart, Share2 } from 'lucide-react'

// lucide-react doesn't include Instagram — using inline SVG
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
  </svg>
)
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/catalog',    label: 'Каталог' },
  { href: '/calculator', label: 'Калькулятор ТО' },
  { href: '/blog',       label: 'Оригинал vs Подделка' },
  { href: '/contact',   label: 'Контакты' },
]

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-sm">
      {/* Geely Club Pavlodar promo banner */}
      <div className="bg-accent/10 border-b border-accent/20 py-1.5 text-center text-xs text-accent font-medium tracking-wide">
        Членам&nbsp;
        <span className="font-semibold">Geely Club Pavlodar</span>
        &nbsp;— скидка&nbsp;5% на все заказы&nbsp;🎁
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <span
              className="font-[family-name:var(--font-rubik)] text-xl font-700 tracking-tight text-foreground"
            >
              Damu<span className="text-accent">Auto</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-150 cursor-pointer"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-150 cursor-pointer"
            >
              <InstagramIcon />
            </a>

            <a
              href="https://kaspi.kz"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex"
            >
              <Button size="sm" className="gap-2 cursor-pointer">
                <ShoppingCart className="h-4 w-4" />
                Kaspi.kz
              </Button>
            </a>

            {/* Mobile burger */}
            <button
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-150 cursor-pointer"
              onClick={() => setOpen(!open)}
              aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-150 cursor-pointer"
              >
                {label}
              </Link>
            ))}
            <Separator className="my-2" />
            <a
              href="https://kaspi.kz"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
            >
              <Button size="sm" className="w-full gap-2 cursor-pointer">
                <ShoppingCart className="h-4 w-4" />
                Открыть магазин на Kaspi.kz
              </Button>
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
