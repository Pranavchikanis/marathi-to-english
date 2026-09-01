'use client'

import { Inter, Mukta } from 'next/font/google'
import { Button } from '@/components/ui/button'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const mukta = Mukta({ weight: ['400', '500', '600', '700'], subsets: ['devanagari', 'latin'], variable: '--font-mukta' })

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mukta.variable}`}>
      <body className="font-sans bg-background-app text-text-primary min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">A critical error occurred</h1>
        <p className="text-text-secondary mb-8 max-w-md">
          The application encountered a fatal error. Please refresh the page to continue.
        </p>
        <Button onClick={() => window.location.reload()} variant="default">
          Refresh Page
        </Button>
      </body>
    </html>
  )
}
