import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import GoogleSignInButton from './components/GoogleSignInButton';
import './globals.css'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'Comic Theorem',
  description: 'Created by SiddhantDCT',
  generator: 'Siddhant Bhuyar',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}