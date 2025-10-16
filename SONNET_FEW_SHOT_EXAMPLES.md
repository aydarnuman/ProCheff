# Sonnet Ekibi - Few-Shot Training Examples
## İhale & Şartname Ekstraksiyon Örnekleri (8 Adet)

Bu örnekler Sonnet-4 prompt'unun few-shot kısmına kopyalanacak.
Her örnek: kaynak snippet → beklenen JSON response

---

## Örnek 1: Net Hastane Şartnamesi

**SNIPPET:**
```
Ankara Şehir Hastanesi Ana Yemekhane İşletmesi — İhale Şartnamesi
```

**EXPECTED_JSON:**
```json
{
  "project_name": "Ankara Şehir Hastanesi Ana Yemekhane İşletmesi",
  "location": "Ankara/Çankaya",
  "institution_type": "Şehir Hastanesi",
  "contract_duration_days": 730,
  "servings_per_day": 3000,
  "meal_types": [
    {
      "name": "Kahvaltı",
      "frequency_per_week": 7,
      "portion_gram_per_person": 250,
      "menu_examples": ["peynir", "zeytin", "simit"]
    },
    {
      "name": "Öğle",
      "frequency_per_week": 7,
      "portion_gram_per_person": 500,
      "menu_examples": ["etli yemek", "pilav", "salata"]
    },
    {
      "name": "Akşam",
      "frequency_per_week": 7,
      "portion_gram_per_person": 350,
      "menu_examples": ["sebze yemeği", "pilav"]
    }
  ],
  "dietary_restrictions": [],
  "critical_requirements": ["günlük sıcak teslimat", "alerjen hatları ayrılmış"],
  "expected_start_date": null,
  "notes": "",
  "confidence_score": 0.95,
  "field_confidences": {
    "project_name": 0.98,
    "location": 0.95,
    "servings_per_day": 0.95
  },
  "snippets": [
    {
      "field": "project_name",
      "page": 1,
      "text": "Ankara Şehir Hastanesi Ana Yemekhane İşletmesi — İhale Şartnamesi"
    }
  ],
  "error": null
}
```

---

## Örnek 2: İhale Sahibi Açık

**SNIPPET:**
```
İhale Sahibi: Çankaya Belediyesi - Sağlık Tesisleri
```

**EXPECTED_JSON:**
```json
{
  "project_name": "Sağlık Tesisleri Yemek Hizmeti İhalesi",
  "location": "Ankara/Çankaya",
  "institution_type": "Belediye",
  "contract_duration_days": 365,
  "servings_per_day": 800,
  "meal_types": [
    {
      "name": "Günlük Menü",
      "frequency_per_week": 7,
      "portion_gram_per_person": 400,
      "menu_examples": ["öğle", "akşam"]
    }
  ],
  "dietary_restrictions": [],
  "critical_requirements": ["öğle servisi 12:00-14:00 arası", "soğutmadan teslim"],
  "expected_start_date": null,
  "notes": "İdare başlığı açıkça 'İhale Sahibi' alanında belirtilmiş.",
  "confidence_score": 0.92,
  "field_confidences": {
    "project_name": 0.85,
    "institution_type": 0.95
  },
  "snippets": [
    {
      "field": "institution_type",
      "page": 1,
      "text": "İhale Sahibi: Çankaya Belediyesi - Sağlık Tesisleri"
    }
  ],
  "error": null
}
```

---

## Örnek 3: Tablo Verisi

**SNIPPET:**
```
Tablo: Kurum | Lokasyon -> "X Üniversitesi" | "Eskişehir"
```

**EXPECTED_JSON:**
```json
{
  "project_name": "X Üniversitesi Kantin Hizmeti",
  "location": "Eskişehir",
  "institution_type": "Üniversite",
  "contract_duration_days": 365,
  "servings_per_day": 1200,
  "meal_types": [
    {
      "name": "Öğün",
      "frequency_per_week": 7,
      "portion_gram_per_person": 450,
      "menu_examples": ["öğle"]
    }
  ],
  "dietary_restrictions": [],
  "critical_requirements": ["öğün başı 11:30-13:30 arası"],
  "expected_start_date": null,
  "notes": "Kurum tablo satırından direkt alındı (yüksek güven).",
  "confidence_score": 0.97,
  "field_confidences": {
    "project_name": 0.99,
    "location": 0.98,
    "servings_per_day": 0.90
  },
  "snippets": [
    {
      "field": "project_name",
      "page": 2,
      "text": "X Üniversitesi"
    }
  ],
  "error": null
}
```

---

## Örnek 4: Kısmi Bilgi

**SNIPPET:**
```
Madde 3: Günlük ort. 250 porsiyon; Menü: kahvaltı, öğle
```

**EXPECTED_JSON:**
```json
{
  "project_name": "Belirtilmemiş",
  "location": null,
  "institution_type": null,
  "contract_duration_days": null,
  "servings_per_day": 250,
  "meal_types": [
    {
      "name": "Kahvaltı",
      "frequency_per_week": 7,
      "portion_gram_per_person": 250,
      "menu_examples": []
    },
    {
      "name": "Öğle",
      "frequency_per_week": 7,
      "portion_gram_per_person": 500,
      "menu_examples": []
    }
  ],
  "dietary_restrictions": [],
  "critical_requirements": [],
  "expected_start_date": null,
  "notes": "Project name bulunamadı; servings açıkça ifade edilmiş.",
  "confidence_score": 0.78,
  "field_confidences": {
    "servings_per_day": 0.92,
    "meal_types": 0.80
  },
  "snippets": [
    {
      "field": "servings_per_day",
      "page": 3,
      "text": "Günlük ort. 250 porsiyon"
    }
  ],
  "error": null
}
```

---

## Örnek 5: İşveren Etiketi

**SNIPPET:**
```
İşveren: Kamu Hastaneleri Birliği Genel Sekreterliği
```

**EXPECTED_JSON:**
```json
{
  "project_name": "Hastane Yemek Hizmeti",
  "location": null,
  "institution_type": "Kamu Hastaneleri Birliği",
  "contract_duration_days": null,
  "servings_per_day": null,
  "meal_types": [],
  "dietary_restrictions": [],
  "critical_requirements": [],
  "expected_start_date": null,
  "notes": "İşveren açıkça 'İşveren' olarak etiketlenmiş; idare bu alandan alındı.",
  "confidence_score": 0.90,
  "field_confidences": {
    "institution_type": 0.95
  },
  "snippets": [
    {
      "field": "institution_type",
      "page": 1,
      "text": "İşveren: Kamu Hastaneleri Birliği Genel Sekreterliği"
    }
  ],
  "error": null
}
```

---

## Örnek 6: Porsiyon Detayları

**SNIPPET:**
```
Paragraf: "Ana Yemek: 350 g; Yan Yemek: 150 g; Çorba: 200 ml"
```

**EXPECTED_JSON:**
```json
{
  "project_name": null,
  "location": null,
  "institution_type": null,
  "contract_duration_days": null,
  "servings_per_day": null,
  "meal_types": [
    {
      "name": "Ana Yemek",
      "frequency_per_week": null,
      "portion_gram_per_person": 350,
      "menu_examples": []
    },
    {
      "name": "Yan Yemek",
      "frequency_per_week": null,
      "portion_gram_per_person": 150,
      "menu_examples": []
    },
    {
      "name": "Çorba",
      "frequency_per_week": null,
      "portion_gram_per_person": 200,
      "menu_examples": []
    }
  ],
  "dietary_restrictions": [],
  "critical_requirements": [],
  "expected_start_date": null,
  "notes": "Porsiyon boyutları paragrafa açıkça yazılmış.",
  "confidence_score": 0.88,
  "field_confidences": {
    "meal_types": 0.90
  },
  "snippets": [
    {
      "field": "meal_types",
      "page": 4,
      "text": "Ana Yemek: 350 g; Yan Yemek: 150 g; Çorba: 200 ml"
    }
  ],
  "error": null
}
```

---

## Örnek 7: Para Birimi

**SNIPPET:**
```
Satır: "Maks. birim fiyat: 24 TRY"
```

**EXPECTED_JSON:**
```json
{
  "project_name": null,
  "location": null,
  "institution_type": null,
  "contract_duration_days": null,
  "servings_per_day": null,
  "meal_types": [],
  "dietary_restrictions": [],
  "critical_requirements": [],
  "expected_start_date": null,
  "notes": "Maksimum birim fiyat açıkça verilmiş.",
  "confidence_score": 0.92,
  "field_confidences": {
    "currency": 0.95
  },
  "snippets": [
    {
      "field": "currency",
      "page": 2,
      "text": "Maks. birim fiyat: 24 TRY"
    }
  ],
  "error": null
}
```

---

## Örnek 8: Belirsiz Taraflar

**SNIPPET:**
```
Karma: "Taraflar: Y A.Ş. (Yüklenici) — İşveren: Belediye"
```

**EXPECTED_JSON:**
```json
{
  "project_name": "Belirtilmemiş",
  "location": null,
  "institution_type": null,
  "contract_duration_days": null,
  "servings_per_day": null,
  "meal_types": [],
  "dietary_restrictions": [],
  "critical_requirements": [],
  "expected_start_date": null,
  "notes": "Belirsiz 'Taraflar' ifadesi; işveren label'ı önceliklidir. Candidate list sunulmalı.",
  "confidence_score": 0.60,
  "field_confidences": {
    "institution_type": 0.50
  },
  "snippets": [
    {
      "field": "candidates",
      "page": 1,
      "text": "Taraflar: Y A.Ş. (Yüklenici) — İşveren: Belediye"
    }
  ],
  "error": null
}
```

---

## 🎯 Sonnet Implementation Notes

### Önemli Kurallar:
1. **Tablo verisine öncelik:** Tablo hücresi > paragraf > başlık
2. **İdare etiketleri:** "İhale Sahibi", "İşveren", "Kurum" alanlarına odaklan
3. **Confidence calculation:** SourceEvidence (table=1.0, paragraph=0.9, inference=0.55)
4. **Null handling:** Bulunamayan alanlar için null döndür
5. **Snippet requirement:** Her field için kaynak snippet gerekli

### Institution Type Aliases:
- "Hastane" → "Hastane" / "Şehir Hastanesi" / "Devlet Hastanesi"
- "Belediye" → "Belediye" / "Büyükşehir Belediyesi"
- "Üniversite" → "Üniversite" / "Devlet Üniversitesi"
- "Kamu" → "Kamu Hastaneleri Birliği" / "Bakanlık"

### Meal Types Standards:
- "Kahvaltı" → 200-300g typical
- "Öğle" → 400-600g typical  
- "Akşam" → 300-500g typical
- "Ara Öğün" → 100-200g typical

Bu örnekler Sonnet-4'ün tutarlı ve doğru ekstraksiyon yapmasını sağlayacak.