#  Solo Developer Plan - İhale & Şartname Merkezi

## 🎯 DURUM RAPORU

### ✅ HAZIR OLANLAR (Zaten implement edildi)
- Sonnet API integration (`lib/services/sonnet-extraction.ts`)
- Table-first extraction strategy
- Institution candidates system
- API endpoint (`app/api/sonnet-extraction/extract/route.ts`)
- TypeScript types ve test cases

### 🔧 YAPMANIZ GEREKENLER

Sadece **Frontend UI** eksik! Backend tamamen hazır.

---

## 🚀 BUGÜN YAPABİLİRSİNİZ (2-3 saat)

### Adım 1: Page Component Oluştur (30 dk)

```bash
#  Folder oluştur
mkdir -p app/ihale-sartname

#  Page component oluştur  
touch app/ihale-sartname/page.tsx
```bash

### Adım 2: Minimal UI (60 dk)

Basit bir UI yazın:
- File upload input
- Loading spinner
- Results display
- Institution selection radio buttons

### Adım 3: API Integration (30 dk)

Frontend'den `/api/sonnet-extraction/extract` endpoint'ini çağırın.

### Adım 4: Test (30 dk)

Bir PDF upload edip sonuçları görün!

---

## 📝 KOD ÖRNEĞİ

İşte minimal başlangıç kodu:

```typescript
'use client';

import { useState } from 'react';

export default function IhaleSartnamePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setLoading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/sonnet-extraction/extract', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">İhale & Şartname Merkezi</h1>
      
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleUpload}
        disabled={loading}
      />

      {loading && <p>Processing...</p>}

      {result && (
        <div className="mt-4">
          <h2>Sonuçlar:</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```bash

Bu kod ile 30 dakikada çalışan bir sistem elde edebilirsiniz!

---

## 🎨 İYİLEŞTİRMELER (İsteğe bağlı)

Temel versiyon çalıştıktan sonra bunları ekleyebilirsiniz:

1. **Better UI**: Tailwind CSS ile styling
2. **Institution Selection**: Radio buttons for candidates  
3. **Progress Bar**: Upload progress gösterimi
4. **Error Handling**: Better error messages
5. **Confidence Display**: Color-coded confidence scores

---

## 📂 KLASÖR YAPISI

```bash
app/
  ihale-sartname/
    page.tsx          # ← Bu dosyayı oluşturacaksınız
lib/
  services/
    sonnet-extraction.ts  # ← Zaten hazır
app/api/
  sonnet-extraction/
    extract/
      route.ts        # ← Zaten hazır
```bash

---

## 🎯 İLK HEDEF

**30 dakikada çalışan bir sistem elde edin:**

1. `app/ihale-sartname/page.tsx` oluştur
2. Yukarıdaki minimal kodu yapıştır
3. `npm run dev` ile test et
4. PDF upload et, sonuç gör!

Sonra iyileştirmeleri yaparız. Önce çalışan bir şey elde edin! 🚀
