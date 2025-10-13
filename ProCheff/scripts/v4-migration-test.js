// Tailwind v4 Migration Stability Test
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🧪 Tailwind v4 Migration Test başlatılıyor...');

// Test 1: PostCSS v4 Plugin
try {
  execSync('npm install -D @tailwindcss/postcss@^4.0.0', { cwd: '.' });
  
  // PostCSS config güncelle
  const postcssConfig = `
// Test: Tailwind v4 PostCSS yapılandırması
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}`;
  
  fs.writeFileSync('postcss.config.js', postcssConfig);
  
  // Test build
  execSync('npm run build', { cwd: '.' });
  console.log('✅ Tailwind v4 build başarılı');
  
} catch (error) {
  console.log('❌ Tailwind v4 build hatası:', error.message);
  
  // Fallback'e geri dön
  const fallbackConfig = `
// Fallback: Vercel uyumlu PostCSS yapılandırması
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
  
  fs.writeFileSync('postcss.config.js', fallbackConfig);
  execSync('npm uninstall @tailwindcss/postcss && npm install -D tailwindcss@^3.4.0', { cwd: '.' });
  console.log('🔄 Fallback v3 yapılandırması geri yüklendi');
}