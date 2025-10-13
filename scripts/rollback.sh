#!/bin/bash

# ProCheff Rollback Script
echo "🔄 ProCheff Rollback Başlatılıyor..."

# 1. Cloud Run rollback
echo "☁️  Cloud Run önceki revizyona dönülüyor..."
gcloud run services update-traffic procheff \
  --to-revisions=PREVIOUS=100 \
  --region=us-central1 \
  --project=degsan-site

# 2. Git rollback
echo "📝 Git commit rollback..."
git revert HEAD --no-edit
git push origin main

echo "✅ Rollback tamamlandı!"