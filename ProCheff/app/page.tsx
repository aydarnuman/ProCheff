import React from 'react';

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          ProCheff'e Hoş Geldiniz! 👨‍🍳
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          AI destekli tarif asistanınız ile mutfakta harikalar yaratın
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="text-3xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">Tarif Keşfet</h3>
            <p className="text-gray-600">
              Binlerce tarif arasından istediğinizi bulun
            </p>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="text-3xl mb-4">✨</div>
            <h3 className="text-lg font-semibold mb-2">Tarif Oluştur</h3>
            <p className="text-gray-600">
              Kendi tariflerinizi oluşturun ve paylaşın
            </p>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="text-3xl mb-4">❤️</div>
            <h3 className="text-lg font-semibold mb-2">Favoriler</h3>
            <p className="text-gray-600">
              Beğendiğiniz tarifleri favorilere ekleyin
            </p>
          </div>
        </div>
        
        <div className="mt-12">
          <button className="bg-orange-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-orange-700 transition-colors">
            Tarifleri Keşfet
          </button>
        </div>
      </section>
    </div>
  );
}