import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'BUR JO’SS | Pesan Makan',
  icons: { icon: '/favicon.svg' },
  description: 'Pesan nasi, Indomie, minuman, dan topping langsung dari BUR JO’SS.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="id"><head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@400;500;700&display=swap" />
  </head><body>{children}</body></html>
}
