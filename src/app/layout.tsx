import type { Metadata } from 'next'
import { Rubik, Nunito_Sans } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const rubik = Rubik({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-rubik',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const nunitoSans = Nunito_Sans({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-nunito',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Damu Auto — Оригинальные запчасти Geely и Li Auto в Павлодаре',
    template: '%s | Damu Auto',
  },
  description:
    'Специализированный магазин оригинальных запчастей и аксессуаров для Geely и Li Auto. Каталог с OEM-номерами, калькулятор ТО, гид по проверке подлинности.',
  keywords: ['Geely', 'Li Auto', 'запчасти', 'Павлодар', 'ТО', 'оригинал', 'Damu Auto'],
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'Damu Auto',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ru"
      className={`${rubik.variable} ${nunitoSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-[family-name:var(--font-nunito)]">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
