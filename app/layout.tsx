import { type Metadata } from 'next'
import {
  ClerkProvider
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/ui/Navbar'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Email Automation',
  description: 'Email Automation for Tuskers',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`bg- white ${geistSans.variable} ${geistMono.variable} antialiased`}>
          {/* // navbar below */}
          <Navbar/>
          {/* // main content below */}
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}