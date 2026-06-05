'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { Cookie } from 'lucide-react'

const STORAGE_KEY = 'damu-cookie-consent'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // show only if no decision stored yet
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    }
  }, [])

  function decide(value: 'accepted' | 'declined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ value, at: new Date().toISOString() }))
      // also drop a cookie for SSR-readability / future analytics gating
      document.cookie = `${STORAGE_KEY}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
    } catch { /* storage unavailable */ }
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', stiffness: 220, damping: 26 }}
          className="fixed inset-x-3 bottom-28 z-[55] sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-w-md"
          role="dialog"
          aria-label="Согласие на использование cookie"
        >
          <div className="glass-strong rounded-2xl p-5 shadow-2xl shadow-black/50">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Cookie className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="font-heading text-sm font-700">Мы используем cookie</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Сайт использует файлы cookie для корректной работы и улучшения сервиса.
                  Продолжая, вы соглашаетесь с{' '}
                  <Link href="/privacy-policy" className="text-accent underline-offset-2 hover:underline">
                    политикой конфиденциальности
                  </Link>{' '}
                  (Закон РК «О персональных данных и их защите»).
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => decide('accepted')}
                className="flex min-h-11 flex-1 items-center justify-center rounded-lg bg-accent px-4 text-sm font-700 text-accent-foreground transition-all duration-200 hover:shadow-[0_0_20px_-4px_rgba(196,154,69,0.7)] cursor-pointer"
              >
                Принять
              </button>
              <button
                onClick={() => decide('declined')}
                className="flex min-h-11 items-center justify-center rounded-lg border border-input px-4 text-sm font-600 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
              >
                Только необходимые
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
