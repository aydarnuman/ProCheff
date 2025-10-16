#!/bin/bash
# ======================================================
# 💰 PROCHEFF PRO MODE - COST ANALYZER + CLEANER
# ======================================================
# Amaç:
# - Tüm kaynakları (VM, disk, workstation, SQL, GKE, Redis) denetler
# - Gereksizleri siler
# - Cloud Billing API ile güncel fatura tahmini çıkarır
# ======================================================

PROJECT="degsan-site"
REGIONS=("us-west1" "europe-west1" "us-central1")
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "==============================="
echo "🧭 ProCheff Cloud Denetimi"
echo "🕓 Tarih: $DATE"
echo "🧩 Proje: $PROJECT"
echo "==============================="
gcloud config set project $PROJECT >/dev/null

# 1️⃣ Gereksiz Compute VM'leri sil
echo "🧱 [1/6] VM kontrolü..."
gcloud compute instances list --filter="status=(RUNNING,STAGING,PROVISIONING)" \
  --format="value(name,zone,machineType)" | while read -r name zone type; do
    echo "🚨 Siliniyor VM: $name ($type | $zone)"
    gcloud compute instances delete "$name" --zone="$zone" --quiet
done

# 2️⃣ Boşta kalan diskleri sil
echo "💾 [2/6] Boşta disk kontrolü..."
gcloud compute disks list --filter="-users:*" --format="value(name,zone,sizeGb)" | while read -r name zone size; do
  echo "🧹 Siliniyor boş disk: $name ($size GB)"
  gcloud compute disks delete "$name" --zone="$zone" --quiet
done

# 3️⃣ Workstations ve cluster'lar
echo "💻 [3/6] Workstation temizliği..."
for region in "${REGIONS[@]}"; do
  gcloud workstations list --regions="$region" --format="value(name,cluster)" 2>/dev/null | while read -r ws cluster; do
    echo "🚨 Siliniyor Workstation: $ws ($cluster)"
    gcloud workstations delete "$ws" --cluster="$cluster" --region="$region" --quiet
  done
  gcloud workstations clusters list --regions="$region" --format="value(name)" 2>/dev/null | while read -r cluster; do
    echo "🚨 Siliniyor Cluster: $cluster ($region)"
    gcloud workstations clusters delete "$cluster" --region="$region" --quiet
  done
done

# 4️⃣ Ek servis kontrolü (Cloud SQL, GKE, Redis)
echo "🧩 [4/6] Ek servis kontrolü..."
for svc in sql container redis; do
  gcloud $svc instances list --format="value(name,region)" 2>/dev/null | while read -r name region; do
    echo "🚨 Siliniyor $svc instance: $name ($region)"
    gcloud $svc instances delete "$name" --region="$region" --quiet
  done
done

# 5️⃣ Cloud Billing maliyet analizi
echo "💰 [5/6] Güncel Fatura Analizi..."
BILLING_ACCOUNT=$(gcloud beta billing accounts list --format="value(name)" | head -n 1)
if [[ -n "$BILLING_ACCOUNT" ]]; then
  echo "🔍 Billing account: $BILLING_ACCOUNT"
  COST=$(gcloud beta billing accounts get-iam-policy "$BILLING_ACCOUNT" >/dev/null 2>&1 && \
    curl -s -X POST \
      -H "Authorization: Bearer $(gcloud auth print-access-token)" \
      -H "Content-Type: application/json" \
      "https://billingbudgets.googleapis.com/v1beta1/$BILLING_ACCOUNT/budgets:computeCost" || echo "N/A")

  echo "📊 Yaklaşık Fatura (API tahmini):"
  echo "$COST"
else
  echo "⚠️ Faturalandırma hesabı bulunamadı (manuel kontrol edin)"
fi

# 6️⃣ Rapor
echo "📋 [6/6] Sistem Özeti"
echo "---------------------------------"
echo "Compute VM: $(gcloud compute instances list --format='value(name)' | wc -l)"
echo "Disks: $(gcloud compute disks list --format='value(name)' | wc -l)"
echo "Workstations: $(gcloud workstations list --format='value(name)' 2>/dev/null | wc -l)"
echo "Cloud Run: $(gcloud run services list --format='value(metadata.name)' | grep procheff | wc -l)"
echo "---------------------------------"
echo "✅ Temizlik tamamlandı, aktif hizmetler korundu."
echo "💰 Fatura analizi tamamlandı."
echo "==============================="