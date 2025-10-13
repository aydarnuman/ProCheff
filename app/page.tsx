export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary-600 mb-4">
          👨‍🍳 ProCheff
        </h1>
        <p className="text-xl text-gray-600">
          AI destekli tarif yönetim sistemi
        </p>
      </header>
      
      <main className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-semibold mb-2">Menü Planlama</h3>
          <p className="text-gray-600">Aylık menü planlarınızı oluşturun</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="text-4xl mb-4">🥘</div>
          <h3 className="text-lg font-semibold mb-2">Tarif Yönetimi</h3>
          <p className="text-gray-600">Tariflerinizi organize edin</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-lg font-semibold mb-2">Maliyet Takibi</h3>
          <p className="text-gray-600">Maliyetlerinizi kontrol altında tutun</p>
        </div>
      </main>
      
      <div className="text-center mt-12">
        <p className="text-sm text-gray-500">
          Sistem kurulum aşamasında - Otomatik deployment aktif
        </p>
      </div>
    </div>
  )
}