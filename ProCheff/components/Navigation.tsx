import Link from 'next/link'

function Navigation() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-orange-600">👨‍🍳</span>
            <span className="text-xl font-bold text-gray-800">ProCheff</span>
          </Link>
          
          <div className="hidden md:flex space-x-8">
            <Link href="/recipes" className="text-gray-600 hover:text-orange-600 transition-colors">
              Tarifler
            </Link>
            <Link href="/create" className="text-gray-600 hover:text-orange-600 transition-colors">
              Tarif Oluştur
            </Link>
            <Link href="/planning" className="text-gray-600 hover:text-orange-600 transition-colors">
              📊 Planlama
            </Link>
            <Link href="/favorites" className="text-gray-600 hover:text-orange-600 transition-colors">
              Favoriler
            </Link>
            <Link href="/profile" className="text-gray-600 hover:text-orange-600 transition-colors">
              Profil
            </Link>
          </div>
          
          <div className="md:hidden">
            <button className="text-gray-600 hover:text-orange-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export { Navigation }