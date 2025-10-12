import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="text-2xl mr-2">👨‍🍳</span>
              ProCheff
            </h3>
            <p className="text-gray-300 text-sm">
              AI destekli yemek tarifleri ve mutfak asistanınız. 
              Lezzetli tarifler keşfedin ve mutfak becerilerinizi geliştirin.
            </p>
          </div>
          
          <div>
            <h4 className="text-md font-semibold mb-4">Tarifler</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/recipes/turkish" className="text-gray-300 hover:text-white transition-colors">Türk Mutfağı</Link></li>
              <li><Link href="/recipes/world" className="text-gray-300 hover:text-white transition-colors">Dünya Mutfağı</Link></li>
              <li><Link href="/recipes/desserts" className="text-gray-300 hover:text-white transition-colors">Tatlılar</Link></li>
              <li><Link href="/recipes/healthy" className="text-gray-300 hover:text-white transition-colors">Sağlıklı</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-semibold mb-4">Hakkında</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-gray-300 hover:text-white transition-colors">Hakkımızda</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors">İletişim</Link></li>
              <li><Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">Gizlilik</Link></li>
              <li><Link href="/terms" className="text-gray-300 hover:text-white transition-colors">Kullanım Koşulları</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-semibold mb-4">Sosyal Medya</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                📘
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                📷
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                🐦
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300 text-sm">
            &copy; {currentYear} ProCheff. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
};