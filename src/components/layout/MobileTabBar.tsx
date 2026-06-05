'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import { Package, Gauge, ShieldCheck, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { href: '/catalog',    label: 'Каталог',  icon: Package },
  { href: '/calculator', label: 'ТО',       icon: Gauge },
  { href: '/blog',       label: 'Подделки', icon: ShieldCheck },
  { href: '/contact',   label: 'Заявка',   icon: Send },
]

export function MobileTabBar() {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return null

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Основная навигация"
    >
      <div className="glass-strong mx-3 mb-3 flex items-stretch justify-around gap-1 rounded-2xl p-1.5 shadow-2xl shadow-black/50">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className="relative flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 cursor-pointer"
            >
              {active && (
                <motion.span
                  layoutId="tab-active"
                  className="absolute inset-0 -z-10 rounded-xl bg-accent/12 ring-1 ring-accent/25"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={cn('h-5 w-5 transition-colors', active ? 'text-accent' : 'text-muted-foreground')} />
              <span className={cn('text-[10px] font-600 transition-colors', active ? 'text-accent' : 'text-muted-foreground')}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
