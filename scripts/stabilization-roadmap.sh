#!/bin/bash
# ProCheff Stabilization & V4 Migration Roadmap

echo "🚀 ProCheff Stabilization Pipeline başlatılıyor..."

# 1️⃣ V4 Migration Branch
git checkout -b feature/tailwind-v4-stabilization
echo "✅ Migration branch oluşturuldu"

# 2️⃣ Theme Audit Script  
cd ProCheff
npx tailwindcss --content "app/**/*.{ts,tsx}" --dry-run > theme-check.log
echo "📋 Theme audit tamamlandı → theme-check.log"

# 3️⃣ Vercel Cache Temizliği
vercel builds rm --yes --force procheff || echo "⚠️ Cache temizliği için 'vercel login' gerekli"

# 4️⃣ Claude Auto-Review Aktifleştirme
if [ -f ".github/workflows/claude-auto-review.yml.disabled" ]; then
    mv .github/workflows/claude-auto-review.yml.disabled .github/workflows/claude-auto-review.yml
    echo "✅ Claude auto-review workflow aktifleştirildi"
fi

echo "🎯 Roadmap hazır. 'git push origin feature/tailwind-v4-stabilization' ile başlat"