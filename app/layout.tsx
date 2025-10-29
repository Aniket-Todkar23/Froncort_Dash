import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { LoadingProvider } from '@/components/providers/loading-provider'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Froncort - Collaborative Project Management',
  description: 'Confluence-style documentation + Jira-style Kanban boards',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <LoadingProvider>
            {children}
            <Toaster position="top-right" />
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
