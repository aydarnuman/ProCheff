#!/bin/bash

# ProCheff Otomatik Deployment Script
echo "🚀 ProCheff Deployment Başlatılıyor..."

# Proje dizinine git
cd ~/Desktop/ProCheff

# Git repository'yi initialize et
if [ ! -d ".git" ]; then
    echo "📦 Git repository initialize ediliyor..."
    git init
    git remote add origin https://github.com/aydarnuman/ProCheff.git
fi

# Değişiklikleri commit et
echo "📝 Değişiklikler commit ediliyor..."
git add .
git commit -m "feat: initial project setup with automated deployment pipeline"

# Main branch'a push et
echo "⬆️  GitHub'a push ediliyor..."
git branch -M main
git push -u origin main

echo "✅ Deployment tamamlandı!"
echo "🔗 Repository: https://github.com/aydarnuman/ProCheff"
echo "🌐 Live URL: https://procheff.vercel.app"