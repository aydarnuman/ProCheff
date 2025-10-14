# 🔧 ProCheff - VS Code Simple Browser Açma Rehberi

## ✅ Server Durumu
Next.js Development Server: **ÇALIŞIYOR** 🟢
- URL: http://localhost:3000
- Port: 3000 ✅
- Status: Ready 🚀

## 🎯 VS Code Simple Browser Açma Yöntemleri

### Yöntem 1: Command Palette (Önerilen)
1. `Cmd + Shift + P` (Mac) veya `Ctrl + Shift + P` (Windows/Linux)
2. **"Simple Browser: Show"** yazın
3. Enter'a basın
4. URL olarak: `http://localhost:3000` girin

### Yöntem 2: View Menüsü
1. **View** → **Command Palette**
2. **"Simple Browser"** arayın
3. **Simple Browser: Show** seçin
4. `http://localhost:3000` URL'sini girin

### Yöntem 3: Live Preview Extension
1. `Cmd + Shift + P` (Mac) veya `Ctrl + Shift + P` (Windows/Linux)  
2. **"Live Preview: Show Preview"** yazın
3. External Preview seçeneğini kullanın

### Yöntem 4: Panel'de Arama
1. Alt panel'i açın (Terminal yanında)
2. **Simple Browser** tab'ını arayın
3. Eğer yoksa **+** butonuna tıklayıp **Simple Browser** ekleyin

## 🚀 Hızlı Test Linkleri

**Ana Sayfa:**
```
http://localhost:3000
```

**AI Tarif Üretici:**
```
http://localhost:3000/menu-management  
```

**Market Intelligence:**
```
http://localhost:3000/market-intelligence
```

## 🔍 Sorun Giderme

**Eğer Simple Browser hâlâ açılmıyorsa:**

1. **VS Code'u yeniden başlatın** - Extension'lar yeniden yüklenecek
2. **Extension'ları kontrol edin** - Live Preview yüklü mü?
3. **Sistem tarayıcısı kullanın** - `open http://localhost:3000` 
4. **Port kontrolü** - `lsof -ti:3000` ile server kontrolü

## 📱 Alternatif Çözümler

**dev-browser.html** dosyası oluşturuldu:
- VS Code'da bu dosyayı açın  
- Sağ tıklayıp **"Open with Live Server"** seçin
- Veya sistem tarayıcısında açın

**Manuel URL Girme:**
- Herhangi bir tarayıcıda `http://localhost:3000` adresini girin
- ProCheff uygulaması direkt açılacak

---
**💡 İpucu:** VS Code Simple Browser bazen gözükmeyebilir. Bu durumda sistem tarayıcısı en güvenli yöntemdir!