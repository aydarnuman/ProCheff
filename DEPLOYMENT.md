# ProCheff - Google Cloud Run Deployment Rehberi

## 🚀 GitHub Secrets Kurulumu

ProCheff'in Google Cloud Run'da otomatik deploy edilmesi için aşağıdaki GitHub Secrets'ları ayarlayın:

### 1. GCP Service Account Key

1. **Google Cloud Console'a gidin**: https://console.cloud.google.com
2. **IAM & Admin > Service Accounts**'a gidin
3. **CREATE SERVICE ACCOUNT** butonuna tıklayın
4. Bilgileri doldurun:
   - **Name**: `procheff-github-actions`
   - **Description**: `GitHub Actions için ProCheff deployment`
5. **DONE** butonuna tıklayın
6. Oluşturulan service account'a tıklayın
7. **KEYS** sekmesine gidin
8. **ADD KEY > Create new key** seçin
9. **JSON** formatını seçip **CREATE** butonuna tıklayın
10. İndirilen JSON dosyasının içeriğini kopyalayın

### 2. Service Account Permissions

Service Account'a aşağıdaki rolleri verin:
- `Cloud Run Developer`
- `Storage Admin`
- `Container Registry Service Agent`

### 3. GitHub Repository Secrets

GitHub repository'nize gidin: **Settings > Secrets and variables > Actions**

Aşağıdaki secret'ı ekleyin:

#### GCP_SERVICE_ACCOUNT_KEY
- **Name**: `GCP_SERVICE_ACCOUNT_KEY`
- **Value**: Yukarıda indirdiğiniz JSON dosyasının tüm içeriği

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