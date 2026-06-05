'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { ShoppingCart, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/catalog',    label: 'Каталог' },
  { href: '/calculator', label: 'Центр ТО' },
  { href: '/blog',       label: 'Оригинал vs Подделка' },
  { href: '/contact',   label: 'Контакты' },
]

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
    strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
)

export function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (pathname.startsWith('/admin')) return null

  return (
    <>
      {/* Geely Club marquee */}
      <div className="relative z-50 overflow-hidden border-b border-glass-border bg-accent/5">
        <div className="flex w-max animate-marquee whitespace-nowrap py-1.5">
          {Array.from({ length: 2 }).map((_, dup) => (
            <div key={dup} className="flex items-center" aria-hidden={dup === 1}>
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="mx-6 flex items-center gap-2 text-xs font-medium tracking-wide text-accent">
                  <Sparkles className="h-3.5 w-3.5" />
                  Geely Club Pavlodar — VIP-скидка&nbsp;5% на все заказы
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Floating glass nav */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-40 w-full px-3 pt-3 sm:px-4 sm:pt-4"
      >
        <div
          className={cn(
            'mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 rounded-2xl px-4 py-3 transition-all duration-300 sm:px-5',
            scrolled ? 'glass-strong shadow-2xl shadow-black/40' : 'glass'
          )}
        >
          <Link href="/" className="group flex items-center gap-2.5 cursor-pointer select-none">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 ring-1 ring-accent/30">
              <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_2px_rgba(196,154,69,0.7)]" />
            </span>
            <span className="font-heading text-lg font-700 tracking-tight text-foreground">
              Damu<span className="text-accent">Auto</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-150 cursor-pointer',
                    active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {label}
                  {active && (
                    <motion.span layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-lg bg-accent/10 ring-1 ring-accent/20"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-accent/10 hover:text-accent cursor-pointer">
              <InstagramIcon className="h-5 w-5" />
            </a>
            <a href="https://kaspi.kz" target="_blank" rel="noopener noreferrer">
              <button className="group flex h-11 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-600 text-accent-foreground transition-all duration-200 hover:shadow-[0_0_20px_-2px_rgba(196,154,69,0.6)] cursor-pointer">
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Kaspi.kz</span>
              </button>
            </a>
          </div>
        </div>
      </motion.header>
    </>
  )
}
