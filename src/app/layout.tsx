import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileTabBar } from '@/components/layout/MobileTabBar'
import { PageTransition } from '@/components/shared/PageTransition'
import { CookieConsent } from '@/components/shared/CookieConsent'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Damu Auto — Оригинальные запчасти Geely и Li Auto · Павлодар',
    template: '%s | Damu Auto',
  },
  description:
    'Премиальный хаб оригинальных запчастей для Geely и Li Auto. Интерактивный калькулятор ТО, макро-сравнение оригинала и подделки, каталог с OEM-номерами.',
  keywords: ['Geely', 'Li Auto', 'запчасти', 'Павлодар', 'ТО', 'оригинал', 'Damu Auto'],
  openGraph: { type: 'website', locale: 'ru_RU', siteName: 'Damu Auto' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${spaceGrotesk.variable} dark h-full`} suppressHydrationWarning>
      <head>
        {/* Satoshi — neo-grotesque body font from Fontshare */}
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap"
        />
        <style>{`:root { --font-satoshi: 'Satoshi', 'Inter', system-ui, sans-serif; }`}</style>
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
        {/* spacer so fixed mobile tab bar never covers footer content */}
        <div className="h-24 md:hidden" aria-hidden />
        <MobileTabBar />
        <CookieConsent />
      </body>
    </html>
  )
}
