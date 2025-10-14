# ProCheff - Google Cloud Run Deployment Rehberi

## 🚀 GitHub Secrets Kurulumu

ProCheff'in Google Cloud Run'da otomatik deploy edilmesi için aşağıdaki GitHub Secrets'ları ayarlayın:

### 1. Service Account Oluşturma

Cloud Shell'de şu komutları çalıştırın:

```bash
# Service account oluşturun
gcloud iam service-accounts create procheff-github-actions \
  --display-name="ProCheff GitHub Actions" \
  --description="GitHub Actions deployment service account" \
  --project=degsan-site

# Gerekli rolleri verin
gcloud projects add-iam-policy-binding degsan-site \
  --member="serviceAccount:procheff-github-actions@degsan-site.iam.gserviceaccount.com" \
  --role="roles/run.developer"

gcloud projects add-iam-policy-binding degsan-site \
  --member="serviceAccount:procheff-github-actions@degsan-site.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding degsan-site \
  --member="serviceAccount:procheff-github-actions@degsan-site.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

### 2. Workload Identity Federation

```bash
# Workload Identity Pool oluşturun
gcloud iam workload-identity-pools create "github-actions" \
    --project="degsan-site" \
    --location="global" \
    --display-name="GitHub Actions Pool"

# GitHub Provider oluşturun
gcloud iam workload-identity-pools providers create-oidc "github" \
    --project="degsan-site" \
    --location="global" \
    --workload-identity-pool="github-actions" \
    --display-name="GitHub provider" \
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
    --issuer-uri="https://token.actions.githubusercontent.com"

# Service Account impersonation yetkisi
gcloud iam service-accounts add-iam-policy-binding \
    procheff-github-actions@degsan-site.iam.gserviceaccount.com \
    --project="degsan-site" \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/projects/178180503011/locations/global/workloadIdentityPools/github-actions/attribute.repository/aydarnuman/ProCheff"

# Provider ID'yi alın
gcloud iam workload-identity-pools providers describe "github" \
    --project="degsan-site" \
    --location="global" \
    --workload-identity-pool="github-actions" \
    --format="value(name)"
```

### 3. GitHub Repository Secrets

GitHub repository'nize gidin: **Settings > Secrets and variables > Actions**

Aşağıdaki secret'ı ekleyin:

#### WIF_PROVIDER
- **Name**: `WIF_PROVIDER`
- **Value**: Son komuttan aldığınız provider full name (örn: `projects/178180503011/locations/global/workloadIdentityPools/github-actions/providers/github`)

## 🔧 Deployment Workflow

### Otomatik Deployment
- `main` branch'e her push'ta otomatik deploy olur
- Pull request'lerde sadece build test edilir

### Manuel Deployment
```bash
# Lokal build test
npm run build

# Type check
npm run type-check

# Google Cloud'a direkt deploy
npm run deploy
```

## 📊 Deployment Monitoring

### Cloud Run Logs
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=procheff" --limit 50 --project=degsan-site
```

### Service URL
```bash
gcloud run services describe procheff --platform managed --region us-west1 --format 'value(status.url)' --project degsan-site
```

## 🛠️ Troubleshooting

### Build Hatası
1. Lokal'de `npm run build` çalıştırın
2. TypeScript hatalarını düzeltin
3. Tekrar push yapın

### Deployment Hatası
1. GitHub Actions logs'unu kontrol edin
2. GCP Service Account permissions'ını kontrol edin
3. Cloud Run quotas'ını kontrol edin

### Performance Optimization
- Memory: 1Gi (artırılabilir)
- CPU: 1 (artırılabilir) 
- Max instances: 10 (artırılabilir)

## 🔐 Environment Variables

Production için gerekli env vars:
- `NODE_ENV=production` (otomatik set edilir)
- `NEXT_PUBLIC_APP_URL` (Cloud Run URL'i ile otomatik)

## 📈 Next Steps

1. Custom domain bağlama
2. HTTPS sertifikası kurma
3. CDN (Cloud CDN) kurma
4. Monitoring ve alerting kurma