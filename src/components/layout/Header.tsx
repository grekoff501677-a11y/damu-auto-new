'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Menu, X, ShoppingCart, Sparkles } from 'lucide-react'
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
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // hide header chrome inside admin
  if (pathname.startsWith('/admin')) return null

  return (
    <>
      {/* ── Geely Club marquee ── */}
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

      {/* ── Floating glass nav ── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-40 w-full px-3 pt-3 sm:px-4 sm:pt-4"
      >
        <div
          className={cn(
            'mx-auto flex h-15 max-w-7xl items-center justify-between gap-4 rounded-2xl px-4 py-3 transition-all duration-300 sm:px-5',
            scrolled ? 'glass-strong shadow-2xl shadow-black/40' : 'glass'
          )}
        >
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5 cursor-pointer select-none">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 ring-1 ring-accent/30">
              <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_2px_rgba(0,230,118,0.7)]" />
            </span>
            <span className="font-heading text-lg font-700 tracking-tight text-foreground">
              Damu<span className="text-accent">Auto</span>
            </span>
          </Link>

          {/* Desktop nav */}
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
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-lg bg-white/[0.05] ring-1 ring-glass-border"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <a
              href="https://instagram.com" target="_blank" rel="noopener noreferrer"
              aria-label="Instagram"
              className="rounded-lg p-2 text-muted-foreground transition-colors duration-150 hover:bg-white/5 hover:text-foreground cursor-pointer"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>

            <a href="https://kaspi.kz" target="_blank" rel="noopener noreferrer" className="hidden sm:block">
              <button className="group flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-600 text-accent-foreground transition-all duration-200 hover:shadow-[0_0_20px_-2px_rgba(0,230,118,0.6)] cursor-pointer">
                <ShoppingCart className="h-4 w-4" />
                Kaspi.kz
              </button>
            </a>

            <button
              className="rounded-lg p-2 text-muted-foreground transition-colors duration-150 hover:bg-white/5 hover:text-foreground md:hidden cursor-pointer"
              onClick={() => setOpen(!open)}
              aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="glass-strong mx-auto mt-2 flex max-w-7xl flex-col gap-1 rounded-2xl p-3 md:hidden"
            >
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-white/5 hover:text-foreground cursor-pointer"
                >
                  {label}
                </Link>
              ))}
              <a href="https://kaspi.kz" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="mt-1">
                <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-600 text-accent-foreground cursor-pointer">
                  <ShoppingCart className="h-4 w-4" />
                  Открыть магазин на Kaspi.kz
                </button>
              </a>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  )
}
