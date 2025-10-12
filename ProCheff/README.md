# ProCheff 👨‍🍳

AI destekli yemek tarifleri ve mutfak asistanı uygulaması. React, Next.js ve Express.js kullanılarak geliştirilmiştir.

## 🚀 Özellikler

- **Tarif Yönetimi**: Tarif oluşturma, düzenleme ve silme
- **Akıllı Arama**: Tarif arama ve filtreleme
- **Kategori Sistemi**: Tarifleri kategorilere göre organize etme
- **Zorluk Seviyeleri**: Kolay, orta ve zor seviyelerde tarifler
- **Responsive Design**: Mobil ve desktop uyumlu tasarım
- **API Entegrasyonu**: RESTful API ile backend bağlantısı

## 🏗️ Proje Yapısı

```
ProCheff/
├── components/          # React UI bileşenleri
│   ├── Layout.tsx      # Ana sayfa düzeni
│   ├── Navigation.tsx  # Navigasyon bileşeni
│   └── Footer.tsx      # Alt bilgi bileşeni
├── hooks/              # Custom React hook'ları
│   ├── useRecipes.ts   # Tarif yönetimi hook'u
│   └── useForm.ts      # Form yönetimi hook'u
├── utils/              # Yardımcı fonksiyonlar
│   ├── recipeUtils.ts  # Tarif validasyonu ve biçimlendirme
│   └── apiHelpers.ts   # API istekleri için yardımcılar
├── server/             # Backend Express.js uygulaması
│   ├── index.js        # Ana server dosyası
│   ├── package.json    # Server bağımlılıkları
│   └── .env.example    # Environment değişkenleri örneği
├── package.json        # Ana proje bağımlılıkları
├── next.config.js      # Next.js yapılandırması
└── tsconfig.json       # TypeScript yapılandırması
```

## 🛠️ Kurulum

### Gereksinimler
- Node.js (v18 veya üzeri)
- npm veya yarn

### 1. Projeyi klonlayın
```bash
git clone <repository-url>
cd ProCheff-git/ProCheff
```

### 2. Bağımlılıkları yükleyin
```bash
# Ana proje bağımlılıkları
npm install

# Server bağımlılıkları
cd server
npm install
cd ..
```

### 3. Environment dosyalarını ayarlayın
```bash
# Server için .env dosyası oluşturun
cp server/.env.example server/.env
```

### 4. Uygulamayı başlatın

#### Development modunda (önerilen)
```bash
# Hem frontend hem backend'i aynı anda başlatır
npm run dev:all
```

#### Ayrı ayrı başlatma
```bash
# Frontend (Terminal 1)
npm run dev

# Backend (Terminal 2)
npm run server
```

## 📱 Kullanım

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 🎯 API Endpoints

### Tarifler
- `GET /api/recipes` - Tüm tarifleri listele
- `GET /api/recipes/:id` - Belirli bir tarifi getir
- `GET /api/recipes/search?q=query` - Tarif ara
- `POST /api/recipes` - Yeni tarif oluştur (TODO)
- `PUT /api/recipes/:id` - Tarif güncelle (TODO)
- `DELETE /api/recipes/:id` - Tarif sil (TODO)

### Sistem
- `GET /api/health` - Sunucu durumu kontrolü

## 🧰 Kullanılan Teknolojiler

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling (gelecek güncelleme)
- **Axios** - HTTP client

### Backend
- **Express.js** - Node.js web framework
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger
- **Multer** - File upload handling

## 🔧 Development Scripts

```bash
# Frontend development server
npm run dev

# Production build
npm run build

# Production server
npm run start

# Linting
npm run lint

# Server development
npm run server

# Hem frontend hem backend başlat
npm run dev:all
```

## 📁 Geliştirme Rehberi

### Component Oluşturma
```typescript
// components/RecipeCard.tsx
import React from 'react';

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (id: string) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSelect }) => {
  return (
    <div className="recipe-card">
      {/* Component içeriği */}
    </div>
  );
};
```

### Custom Hook Kullanımı
```typescript
// pages/recipes.tsx
import { useRecipes } from '@/hooks/useRecipes';

export default function RecipesPage() {
  const { recipes, loading, error, fetchRecipes } = useRecipes();
  
  // Component logic
}
```

### API Helpers Kullanımı
```typescript
import { apiHelpers } from '@/utils/apiHelpers';

const recipes = await apiHelpers.get('/api/recipes');
```

## 🚧 Gelecek Özellikler

- [ ] Kullanıcı kimlik doğrulama
- [ ] Favori tarifler
- [ ] Tarif paylaşımı
- [ ] Yorum sistemi
- [ ] AI öneri sistemi
- [ ] Malzeme listesi oluşturma
- [ ] Beslenme bilgileri
- [ ] Tarif videoları

## 📝 Lisans

MIT License - Detaylar için LICENSE dosyasına bakınız.

## 👨‍💻 Geliştirici

**Numan Aydar** - [GitHub](https://github.com/numanaydar)

---

⭐ Bu proje beğendiniz? Star vermeyi unutmayın!