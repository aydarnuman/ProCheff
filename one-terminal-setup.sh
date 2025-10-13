#!/bin/bash
set -e

echo "🌐 ProCheff Cloud Pipeline kurulumu..."
echo "VS Code → GitHub → Vercel → Google Cloud entegrasyonu"

# Vercel + GitHub entegrasyonu
echo "🔹 Vercel login..."
vercel login

echo "🔹 GitHub CLI login..."  
gh auth login

echo "🔹 Google Cloud login..."
gcloud auth login
gcloud config set project procheff

# Environment variables setup
echo "🔹 Environment variables ayarlanıyor..."
vercel env add NEXT_PUBLIC_API_URL production <<< "https://www.procheff.app/api"

echo "✅ Unified pipeline hazır!"
echo "Artık tek komutla deploy: git add . && git commit -m 'update' && git push origin main"
