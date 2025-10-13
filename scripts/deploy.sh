#!/bin/bash

# ProCheff Google Cloud Deployment Script
echo "🚀 ProCheff Google Cloud Deployment Başlatılıyor..."

# Proje dizinine git
cd ~/Desktop/ProCheff/ProCheff

# Git repository'yi initialize et
if [ ! -d ".git" ]; then
    echo "📦 Git repository initialize ediliyor..."
    git init
    git remote add origin https://github.com/aydarnuman/ProCheff.git
fi

# Değişiklikleri commit et
echo "📝 Değişiklikler commit ediliyor..."
git add .
git commit -m "feat: migrate from Vercel to Google Cloud Run"

# Main branch'a push et
echo "⬆️  GitHub'a push ediliyor..."
git branch -M main
git push -u origin main

# Google Cloud'a deploy et
echo "☁️  Google Cloud Run'a deploy ediliyor..."
gcloud run deploy procheff \
    --source . \
    --region=us-central1 \
    --allow-unauthenticated \
    --project=degsan-site

echo "✅ Deployment tamamlandı!"
echo "🔗 Repository: https://github.com/aydarnuman/ProCheff"
echo "🌐 Live URL: https://procheff.app"