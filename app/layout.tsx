import './globals.css'
import { Inter } from 'next/font/google'
import ClientLayout from './components/ClientLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ProCheff - AI Recipe Assistant',
  description: 'AI-powered recipe management and cooking assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={inter.className} style={{ backgroundColor: '#0f1419' }}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}