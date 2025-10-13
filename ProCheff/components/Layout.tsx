import React from 'react'
import Head from 'next/head'

interface LayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export default function Layout({
  children,
  title = 'ProCheff - AI Powered Recipe Assistant',
  description = 'Discover, create, and manage your favorite recipes with AI assistance',
}: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        <nav className="bg-white shadow-lg p-4">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold text-orange-600">👨‍🍳 ProCheff</h1>
          </div>
        </nav>
        <main className="flex-1 container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-gray-800 text-white p-4 text-center">
          <p>&copy; 2025 ProCheff. Tüm hakları saklıdır.</p>
        </footer>
      </div>
    </>
  )
}