import { PriceList, Recipe, MonthlyPlan, AiSettings, ApiResource, AiError, InstitutionalMenus } from './types';

export const DEFAULT_PRICES: PriceList = {
    "Ayçiçek Yağı": { unit: "l", price: 100.19, group: "Yağlar", status: "auto", isLocked: false, manualOverridePrice: null },
    "Tereyağı": { unit: "kg", price: 375.0, group: "Kahvaltılık Grubu", status: "auto", isLocked: false, manualOverridePrice: null },
    "Pirinç": { unit: "kg", price: 49.5, group: "Temel Gıda", status: "auto", isLocked: false, manualOverridePrice: null },
    "Bulgur": { unit: "kg", price: 25.84, group: "Temel Gıda", status: "auto", isLocked: false, manualOverridePrice: null },
    "Makarna": { unit: "kg", price: 32.33, group: "Temel Gıda", status: "auto", isLocked: false, manualOverridePrice: null },
    "Yoğurt": { unit: "kg", price: 73.5, group: "Kahvaltılık Grubu", status: "auto", isLocked: false, manualOverridePrice: null },
    "Kırmızı Mercimek": { unit: "kg", price: 69.33, group: "Bakliyat Grubu", status: "auto", isLocked: false, manualOverridePrice: null },
    "Tavuk Göğüs": { unit: "kg", price: 243.0, group: "Et Grubu", status: "auto", isLocked: false, manualOverridePrice: null },
    "Dana Kıyma": { unit: "kg", price: 669.9, group: "Et Grubu", status: "auto", isLocked: false, manualOverridePrice: null },
    "Dana Eti": { unit: "kg", price: 759.9, group: "Et Grubu", status: "auto", isLocked: false, manualOverridePrice: null },
    "Soğan": { unit: "kg", price: 29.95, group: "Sebzeler", status: "auto", isLocked: false, manualOverridePrice: null },
    "Salça": { unit: "kg", price: 60.18, group: "Temel Gıda", status: "auto", isLocked: false, manualOverridePrice: null },
    "Tuz": { unit: "kg", price: 6.06, group: "Baharatlar", status: "auto", isLocked: false, manualOverridePrice: null },
    "Karabiber": { unit: "kg", price: 275.0, group: "Baharatlar", status: "auto", isLocked: false, manualOverridePrice: null },
    "Pul Biber": { unit: "kg", price: 155.0, group: "Baharatlar", status: "auto", isLocked: false, manualOverridePrice: null },
    "Un": { unit: "kg", price: 53.2, group: "Temel Gıda", status: "auto", isLocked: false, manualOverridePrice: null },
    "Su": { unit: "l", price: 7.0, group: "Yan Ürünler", status: "auto", isLocked: false, manualOverridePrice: null },
    "Ekmek": { unit: "adet", price: null, group: "Yan Ürünler", status: "auto", isLocked: false, manualOverridePrice: null },
    "Ayran": { unit: "l", price: null, group: "Yan Ürünler", status: "auto", isLocked: false, manualOverridePrice: null },
    "Tarhana": { unit: "kg", price: 149.9, group: "Temel Gıda", status: "auto", isLocked: false, manualOverridePrice: null },
    "Tel Şehriye": { unit: "kg", price: 61.9, group: "Temel Gıda", status: "auto", isLocked: false, manualOverridePrice: null },
    "Mantar": { unit: "kg", price: null, group: "Sebzeler", status: "auto", isLocked: false, manualOverridePrice: null },
    "Patates": { unit: "kg", price: 34.95, group: "Sebzeler", status: "auto", isLocked: false, manualOverridePrice: null },
    "Süt": { unit: "l", price: 36.75, group: "Kahvaltılık Grubu", status: "auto", isLocked: false, manualOverridePrice: null },
    "Şeker": { unit: "kg", price: 125.0, group: "Temel Gıda", status: "auto", isLocked: false, manualOverridePrice: null },
    "İrmik": { unit: "kg", price: 30.0, group: "Temel Gıda", status: "auto", isLocked: false, manualOverridePrice: null },
    "Yumurta": { unit: "adet", price: null, group: "Et Grubu", status: "auto", isLocked: false, manualOverridePrice: null },
    "Nohut": { unit: "kg", price: 51.0, group: "Bakliyat Grubu", status: "auto", isLocked: false, manualOverridePrice: null },
    "Kuru Fasulye": { unit: "kg", price: 64.6, group: "Bakliyat Grubu", status: "auto", isLocked: false, manualOverridePrice: null },
    "200cc Su": { unit: "adet", price: null, group: "Yan Ürünler", status: "auto", isLocked: false, manualOverridePrice: null },
    "500cc Su": { unit: "adet", price: null, group: "Yan Ürünler", status: "auto", isLocked: false, manualOverridePrice: null },
    "Dilim Ekmek": { unit: "adet", price: null, group: "Yan Ürünler", status: "auto", isLocked: false, manualOverridePrice: null },
    "Roll Ekmek": { unit: "adet", price: null, group: "Yan Ürünler", status: "auto", isLocked: false, manualOverridePrice: null },
    "Diyet Ekmek": { unit: "adet", price: null, group: "Yan Ürünler", status: "auto", isLocked: false, manualOverridePrice: null },
    "Arpa Şehriye": { unit: "kg", price: 25.95, group: "Temel Gıda", status: "auto", isLocked: false, manualOverridePrice: null },
    "Erişte": { unit: "kg", price: 25.95, group: "Temel Gıda", status: "auto", isLocked: false, manualOverridePrice: null },
    "Kakao": { unit: "kg", price: 630.00, group: "Baharatlar", status: "auto", isLocked: false, manualOverridePrice: null },
    "Köftelik Bulgur": { unit: "kg", price: 23.50, group: "Temel Gıda", status: "auto", isLocked: false, manualOverridePrice: null },
    "Sarımsak Tozu": { unit: "kg", price: 395.00, group: "Baharatlar", status: "auto", isLocked: false, manualOverridePrice: null },
    "Margarin": { unit: "kg", price: 18.75, group: "Yağlar", status: "auto", isLocked: false, manualOverridePrice: null },
    "Blok Margarin": { unit: "adet", price: 200.00, group: "Yağlar", status: "auto", isLocked: false, manualOverridePrice: null },
    "Kova Çikolata": { unit: "adet", price: 585.00, group: "Tatlı", status: "auto", isLocked: false, manualOverridePrice: null },
    "Şekerpare": { unit: "adet", price: 105.00, group: "Tatlı", status: "auto", isLocked: false, manualOverridePrice: null },
    "Barbunya": { unit: "kg", price: 66.00, group: "Bakliyat Grubu", status: "auto", isLocked: false, manualOverridePrice: null },
    "Spagetti": { unit: "kg", price: 25.95, group: "Temel Gıda", status: "auto", isLocked: false, manualOverridePrice: null },
    "Mayonez": { unit: "adet", price: 235.00, group: "Salata/Turşu", status: "auto", isLocked: false, manualOverridePrice: null },
    "Ketçap": { unit: "adet", price: 220.00, group: "Salata/Turşu", status: "auto", isLocked: false, manualOverridePrice: null },
    "Mantı": { unit: "kg", price: 52.0, group: "Temel Gıda", status: "auto", isLocked: false, manualOverridePrice: null },
    "Kadayıf": { unit: "adet", price: 125.00, group: "Tatlı", status: "auto", isLocked: false, manualOverridePrice: null },
    "Karışık Turşu": { unit: "adet", price: 389.00, group: "Salata/Turşu", status: "auto", isLocked: false, manualOverridePrice: null },
    "Meyve Suyu": { unit: "ml", price: 0.03, group: "Meşrubat/Komposto", status: "auto", isLocked: false, manualOverridePrice: null },
    "Tek Sargılı Küp Şeker": { unit: "adet", price: 295.00, group: "Temel Gıda", status: "auto", isLocked: false, manualOverridePrice: null },
    "Sebze Çeşni": { unit: "adet", price: 475.00, group: "Baharatlar", status: "auto", isLocked: false, manualOverridePrice: null },
    "Tavuk Bulyon": { unit: "adet", price: 425.00, group: "Baharatlar", status: "auto", isLocked: false, manualOverridePrice: null },
    "Et Bulyon": { unit: "adet", price: 425.00, group: "Baharatlar", status: "auto", isLocked: false, manualOverridePrice: null },
    "Susam": { unit: "kg", price: 130.00, group: "Baharatlar", status: "auto", isLocked: false, manualOverridePrice: null },
    "Donuk Ispanak": { unit: "kg", price: 51.90, group: "Sebzeler", status: "auto", isLocked: false, manualOverridePrice: null },
    "Pekmez": { unit: "kg", price: 68.75, group: "Temel Gıda", status: "auto", isLocked: false, manualOverridePrice: null },
    "Limon Suyu": { unit: "l", price: 40.00, group: "Salata/Turşu", status: "auto", isLocked: false, manualOverridePrice: null },
    "Piknik Çikolata": { unit: "adet", price: 2.07, group: "Tatlı", status: "auto", isLocked: false, manualOverridePrice: null },
    "Piknik Bal": { unit: "adet", price: 2.85, group: "Tatlı", status: "auto", isLocked: false, manualOverridePrice: null },
    "Donuk Bezelye": { unit: "kg", price: 52.00, group: "Sebzeler", status: "auto", isLocked: false, manualOverridePrice: null },
    "Donuk Karnabahar": { unit: "kg", price: 70.00, group: "Sebzeler", status: "auto", isLocked: false, manualOverridePrice: null },
    "Donuk Bamya": { unit: "kg", price: 110.00, group: "Sebzeler", status: "auto", isLocked: false, manualOverridePrice: null },
    "Donuk Garnitür": { unit: "kg", price: 57.50, group: "Sebzeler", status: "auto", isLocked: false, manualOverridePrice: null },
    "Donuk Taze Fasulye": { unit: "kg", price: 59.50, group: "Sebzeler", status: "auto", isLocked: false, manualOverridePrice: null },
    "Aşurelik Buğday": { unit: "kg", price: 21.50, group: "Temel Gıda", status: "auto", isLocked: false, manualOverridePrice: null },
    "Petibör Bisküvi": { unit: "kg", price: 55.00, group: "Tatlı", status: "auto", isLocked: false, manualOverridePrice: null },
    "Ceviz": { unit: "kg", price: 440.00, group: "Meyveler", status: "auto", isLocked: false, manualOverridePrice: null },
    "Kuru Kayısı": { unit: "kg", price: 394.90, group: "Meyveler", status: "auto", isLocked: false, manualOverridePrice: null },
    "Nar Ekşisi": { unit: "l", price: 114.90, group: "Salata/Turşu", status: "auto", isLocked: false, manualOverridePrice: null },
    "Donuk Mısır": { unit: "kg", price: 80.00, group: "Sebzeler", status: "auto", isLocked: false, manualOverridePrice: null },
    "Salça (Kutu)": { unit: "adet", price: 270.00, group: "Temel Gıda", status: "auto", isLocked: false, manualOverridePrice: null },
    "Patates Kroket": { unit: "kg", price: 123.20, group: "Sebzeler", status: "auto", isLocked: false, manualOverridePrice: null },
    "Donuk Milföy": { unit: "kg", price: 61.75, group: "Temel Gıda", status: "auto", isLocked: false, manualOverridePrice: null },
    "Bal": { unit: "kg", price: 162.5, group: "Kahvaltılık Grubu", status: "auto", isLocked: false, manualOverridePrice: null },
    "Bezelye": { unit: "kg", price: 151.41, group: "Bakliyat Grubu", status: "auto", isLocked: false, manualOverridePrice: null },
    "Buğday Nişastası": { unit: "kg", price: 255.0, group: "Temel Gıda", status: "auto", isLocked: false, manualOverridePrice: null },
    "Galeta Unu": { unit: "kg", price: 35.0, group: "Temel Gıda", status: "auto", isLocked: false, manualOverridePrice: null },
    "Helva": { unit: "kg", price: 221.35, group: "Tatlı", status: "auto", isLocked: false, manualOverridePrice: null },
    "Hindistan Cevizi": { unit: "kg", price: 225.0, group: "Temel Gıda", status: "auto", isLocked: false, manualOverridePrice: null },
    "Kalburabastı": { unit: "kg", price: 150.0, group: "Tatlı", status: "auto", isLocked: false, manualOverridePrice: null },
    "Kekik": { unit: "kg", price: 560.0, group: "Baharatlar", status: "auto", isLocked: false, manualOverridePrice: null },
    "Kemalpaşa": { unit: "kg", price: 150.0, group: "Tatlı", status: "auto", isLocked: false, manualOverridePrice: null },
    "Kimyon": { unit: "kg", price: 155.0, group: "Baharatlar", status: "auto", isLocked: false, manualOverridePrice: null },
    "Kuru Üzüm": { unit: "kg", price: 175.0, group: "Meyveler", status: "auto", isLocked: false, manualOverridePrice: null },
    "Tahin": { unit: "kg", price: 305.0, group: "Temel Gıda", status: "auto", isLocked: false, manualOverridePrice: null },
    "Toz Kırmızı Biber": { unit: "kg", price: 142.0, group: "Baharatlar", status: "auto", isLocked: false, manualOverridePrice: null },
    "Yeşil Mercimek": { unit: "kg", price: 65.4, group: "Bakliyat Grubu", status: "auto", isLocked: false, manualOverridePrice: null },
    "Zerdeçal": { unit: "kg", price: 160.0, group: "Baharatlar", status: "auto", isLocked: false, manualOverridePrice: null },
    "Çay": { unit: "kg", price: 145.0, group: "Meşrubat/Komposto", status: "auto", isLocked: false, manualOverridePrice: null }
};

export const DEFAULT_RECIPES: Recipe[] = [
    { group: "Çorba", name: "Mercimek Çorbası", ingredients: [ { name: "Kırmızı Mercimek", qty: 70, unit: "g" }, { name: "Soğan", qty: 20, unit: "g" }, { name: "Ayçiçek Yağı", qty: 8, unit: "ml" }, { name: "Un", qty: 5, unit: "g" }, { name: "Tuz", qty: 2, unit: "g" }, { name: "Su", qty: 250, unit: "ml" } ] },
    { group: "Çorba", name: "Ezogelin Çorbası", ingredients: [ { name: "Kırmızı Mercimek", qty: 50, unit: "g" }, { name: "Bulgur", qty: 20, unit: "g" }, { name: "Pirinç", qty: 15, unit: "g" }, { name: "Soğan", qty: 20, unit: "g" }, { name: "Ayçiçek Yağı", qty: 8, unit: "ml" }, { name: "Salça", qty: 5, unit: "g" }, { name: "Tuz", qty: 2, unit: "g" }, { name: "Su", qty: 280, unit: "ml" } ] },
    { group: "Çorba", name: "Yayla Çorbası", ingredients: [ { name: "Yoğurt", qty: 50, unit: "g" }, { name: "Pirinç", qty: 10, unit: "g" }, { name: "Un", qty: 5, unit: "g" }, { name: "Tereyağı", qty: 2, unit: "g" }, { name: "Yumurta", qty: 0.25, unit: "adet" }, { name: "Tuz", qty: 2, unit: "g" }, { name: "Su", qty: 250, unit: "ml" } ] },
    { group: "Çorba", name: "Tarhana Çorbası", ingredients: [ { name: "Tarhana", qty: 40, unit: "g" }, { name: "Tereyağı", qty: 5, unit: "g" }, { name: "Tuz", qty: 2, unit: "g" }, { name: "Su", qty: 250, unit: "ml" } ] },
    { group: "Çorba", name: "Domates Çorbası", ingredients: [ { name: "Salça", qty: 15, unit: "g" }, { name: "Un", qty: 5, unit: "g" }, { name: "Tereyağı", qty: 5, unit: "g" }, { name: "Tuz", qty: 2, unit: "g" }, { name: "Su", qty: 250, unit: "ml" } ] },
    { group: "Çorba", name: "Şehriye Çorbası", ingredients: [ { name: "Tel Şehriye", qty: 20, unit: "g" }, { name: "Salça", qty: 5, unit: "g" }, { name: "Tereyağı", qty: 4, unit: "g" }, { name: "Tuz", qty: 2, unit: "g" }, { name: "Su", qty: 250, unit: "ml" } ] },
    { group: "Çorba", name: "Mantar Çorbası", ingredients: [ { name: "Mantar", qty: 50, unit: "g" }, { name: "Un", qty: 5, unit: "g" }, { name: "Tereyağı", qty: 5, unit: "g" }, { name: "Süt", qty: 100, unit: "ml" }, { name: "Su", qty: 150, unit: "ml" }, { name: "Tuz", qty: 2, unit: "g" } ] },
    { group: "Ana Yemek", name: "Tavuk Sote", ingredients: [ { name: "Tavuk Göğüs", qty: 120, unit: "g" }, { name: "Soğan", qty: 25, unit: "g" }, { name: "Ayçiçek Yağı", qty: 10, unit: "ml" }, { name: "Tuz", qty: 2, unit: "g" } ] },
    { group: "Ana Yemek", name: "Sulu Köfte", ingredients: [ { name: "Dana Kıyma", qty: 90, unit: "g" }, { name: "Soğan", qty: 20, unit: "g" }, { name: "Pirinç", qty: 12, unit: "g" }, { name: "Ayçiçek Yağı", qty: 8, unit: "ml" }, { name: "Tuz", qty: 2, unit: "g" } ] },
    { group: "Ana Yemek", name: "Etli Kuru Fasulye", ingredients: [ { name: "Kuru Fasulye", qty: 80, unit: "g" }, { name: "Dana Eti", qty: 50, unit: "g" }, { name: "Soğan", qty: 20, unit: "g" }, { name: "Salça", qty: 10, unit: "g" }, { name: "Ayçiçek Yağı", qty: 10, unit: "ml" }, { name: "Tuz", qty: 2, unit: "g" }, { name: "Su", qty: 250, unit: "ml" } ] },
    { group: "Ana Yemek", name: "İzmir Köfte", ingredients: [ { name: "Dana Kıyma", qty: 80, unit: "g" }, { name: "Patates", qty: 50, unit: "g" }, { name: "Soğan", qty: 20, unit: "g" }, { name: "Yumurta", qty: 0.25, unit: "adet" }, { name: "Un", qty: 5, unit: "g" }, { name: "Salça", qty: 10, unit: "g" }, { name: "Ayçiçek Yağı", qty: 10, unit: "ml" }, { name: "Tuz", qty: 2, unit: "g" }, { name: "Su", qty: 150, unit: "ml" } ] },
    { group: "Ana Yemek", name: "Nohut Yahni", ingredients: [ { name: "Nohut", qty: 60, unit: "g" }, { name: "Dana Eti", qty: 40, unit: "g" }, { name: "Soğan", qty: 15, unit: "g" }, { name: "Salça", qty: 10, unit: "g" }, { name: "Ayçiçek Yağı", qty: 8, unit: "ml" }, { name: "Tuz", qty: 2, unit: "g" }, { name: "Su", qty: 250, unit: "ml" } ] },
    { group: "Garnitür", name: "Pirinç Pilavı", ingredients: [ { name: "Pirinç", qty: 70, unit: "g" }, { name: "Tereyağı", qty: 6, unit: "g" }, { name: "Ayçiçek Yağı", qty: 6, unit: "ml" }, { name: "Tuz", qty: 2, unit: "g" }, { name: "Su", qty: 120, unit: "ml" } ] },
    { group: "Garnitür", name: "Bulgur Pilavı", ingredients: [ { name: "Bulgur", qty: 70, unit: "g" }, { name: "Soğan", qty: 10, unit: "g" }, { name: "Tereyağı", qty: 5, unit: "g" }, { name: "Ayçiçek Yağı", qty: 5, unit: "ml" }, { name: "Tuz", qty: 2, unit: "g" }, { name: "Su", qty: 150, unit: "ml" } ] },
    { group: "Garnitür", name: "Şehriyeli Pirinç Pilavı", ingredients: [ { name: "Pirinç", qty: 60, unit: "g" }, { name: "Tel Şehriye", qty: 15, unit: "g" }, { name: "Tereyağı", qty: 5, unit: "g" }, { name: "Ayçiçek Yağı", qty: 5, unit: "ml" }, { name: "Tuz", qty: 2, unit: "g" }, { name: "Su", qty: 150, unit: "ml" } ] },
    { group: "Garnitür", name: "Patates Püresi", ingredients: [ { name: "Patates", qty: 150, unit: "g" }, { name: "Süt", qty: 50, unit: "ml" }, { name: "Tereyağı", qty: 10, unit: "g" }, { name: "Tuz", qty: 2, unit: "g" } ] },
    { group: "Garnitür", name: "Makarna (Sade)", ingredients: [ { name: "Makarna", qty: 80, unit: "g" }, { name: "Ayçiçek Yağı", qty: 5, unit: "ml" }, { name: "Tuz", qty: 2, unit: "g" }, { name: "Su", qty: 300, unit: "ml" } ] },
    { group: "Tatlı", name: "Sütlaç", ingredients: [ { name: "Pirinç", qty: 20, unit: "g" }, { name: "Süt", qty: 200, unit: "ml" }, { name: "Şeker", qty: 30, unit: "g" }, { name: "Su", qty: 50, unit: "ml" } ] },
    { group: "Tatlı", name: "Muhallebi", ingredients: [ { name: "Süt", qty: 200, unit: "ml" }, { name: "Şeker", qty: 30, unit: "g" }, { name: "Un", qty: 15, unit: "g" }, { name: "Tereyağı", qty: 5, unit: "g" } ] },
    { group: "Tatlı", name: "Revani", ingredients: [ { name: "İrmik", qty: 40, unit: "g" }, { name: "Un", qty: 20, unit: "g" }, { name: "Şeker", qty: 50, unit: "g" }, { name: "Yumurta", qty: 1, unit: "adet" }, { name: "Yoğurt", qty: 30, unit: "g" }, { name: "Ayçiçek Yağı", qty: 10, unit: "ml" } ] },
    { group: "Çorba", name: "Sebze Çorbası", ingredients: [ { name: "Patates", qty: 60, unit: "g" }, { name: "Soğan", qty: 20, unit: "g" }, { name: "Mantar", qty: 30, unit: "g" }, { name: "Ayçiçek Yağı", qty: 8, unit: "ml" }, { name: "Un", qty: 5, unit: "g" }, { name: "Tuz", qty: 2, unit: "g" }, { name: "Su", qty: 250, unit: "ml" } ] },
    { group: "Çorba", name: "Tavuk Şehriye Çorbası", ingredients: [ { name: "Tavuk Göğüs", qty: 30, unit: "g" }, { name: "Tel Şehriye", qty: 15, unit: "g" }, { name: "Soğan", qty: 10, unit: "g" }, { name: "Ayçiçek Yağı", qty: 8, unit: "ml" }, { name: "Un", qty: 5, unit: "g" }, { name: "Tuz", qty: 2, unit: "g" }, { name: "Su", qty: 250, unit: "ml" } ] },
    { group: "Ana Yemek", name: "Sebzeli Tavuk Sote", ingredients: [ { name: "Tavuk Göğüs", qty: 100, unit: "g" }, { name: "Mantar", qty: 40, unit: "g" }, { name: "Patates", qty: 50, unit: "g" }, { name: "Soğan", qty: 20, unit: "g" }, { name: "Ayçiçek Yağı", qty: 10, unit: "ml" }, { name: "Tuz", qty: 2, unit: "g" }, { name: "Su", qty: 50, unit: "ml" } ] },
    { group: "Ana Yemek", name: "Dana Sote", ingredients: [ { name: "Dana Eti", qty: 100, unit: "g" }, { name: "Soğan", qty: 30, unit: "g" }, { name: "Mantar", qty: 40, unit: "g" }, { name: "Ayçiçek Yağı", qty: 10, unit: "ml" }, { name: "Tuz", qty: 2, unit: "g" } ] },
    { group: "Ana Yemek", name: "Etli Patates Yemeği", ingredients: [ { name: "Dana Eti", qty: 80, unit: "g" }, { name: "Patates", qty: 100, unit: "g" }, { name: "Soğan", qty: 20, unit: "g" }, { name: "Salça", qty: 10, unit: "g" }, { name: "Ayçiçek Yağı", qty: 10, unit: "ml" }, { name: "Tuz", qty: 2, unit: "g" }, { name: "Su", qty: 200, unit: "ml" } ] },
    { group: "Garnitür", name: "Mantar Sote", ingredients: [ { name: "Mantar", qty: 80, unit: "g" }, { name: "Soğan", qty: 20, unit: "g" }, { name: "Tereyağı", qty: 5, unit: "g" }, { name: "Ayçiçek Yağı", qty: 5, unit: "ml" }, { name: "Tuz", qty: 2, unit: "g" } ] },
    { group: "Tatlı", name: "İrmik Helvası", ingredients: [ { name: "İrmik", qty: 50, unit: "g" }, { name: "Tereyağı", qty: 10, unit: "g" }, { name: "Şeker", qty: 30, unit: "g" }, { name: "Su", qty: 100, unit: "ml" }, { name: "Süt", qty: 50, unit: "ml" } ] },
    { group: "Tatlı", name: "Keşkül", ingredients: [ { name: "Süt", qty: 200, unit: "ml" }, { name: "Şeker", qty: 40, unit: "g" }, { name: "İrmik", qty: 20, unit: "g" }, { name: "Un", qty: 10, unit: "g" }, { name: "Tereyağı", qty: 5, unit: "g" } ] },
    { group: "Ana Yemek", name: "Fırın Tavuk", ingredients: [ { name: "Tavuk Göğüs", qty: 120, unit: "g" }, { name: "Patates", qty: 50, unit: "g" }, { name: "Soğan", qty: 20, unit: "g" }, { name: "Ayçiçek Yağı", qty: 10, unit: "ml" }, { name: "Tuz", qty: 2, unit: "g" }, { name: "Su", qty: 50, unit: "ml" } ] },
    { group: "Ana Yemek", name: "Kuru Fasulye", ingredients: [ { name: "Kuru Fasulye", qty: 80, unit: "g" }, { name: "Soğan", qty: 15, unit: "g" }, { name: "Salça", qty: 10, unit: "g" }, { name: "Ayçiçek Yağı", qty: 8, unit: "ml" }, { name: "Tuz", qty: 2, unit: "g" }, { name: "Su", qty: 250, unit: "ml" } ] },
    { group: "Ana Yemek", name: "Sebzeli Türlü", ingredients: [ { name: "Patates", qty: 80, unit: "g" }, { name: "Mantar", qty: 40, unit: "g" }, { name: "Soğan", qty: 20, unit: "g" }, { name: "Salça", qty: 10, unit: "g" }, { name: "Ayçiçek Yağı", qty: 10, unit: "ml" }, { name: "Tuz", qty: 2, unit: "g" }, { name: "Su", qty: 250, unit: "ml" } ] },
    { group: "Ana Yemek", name: "Mantarlı Tavuk Sote", ingredients: [ { name: "Tavuk Göğüs", qty: 100, unit: "g" }, { name: "Mantar", qty: 50, unit: "g" }, { name: "Soğan", qty: 20, unit: "g" }, { name: "Ayçiçek Yağı", qty: 10, unit: "ml" }, { name: "Tuz", qty: 2, unit: "g" } ] },
    { group: "Ana Yemek", name: "Köfte", ingredients: [ { name: "Dana Kıyma", qty: 80, unit: "g" }, { name: "Soğan", qty: 20, unit: "g" }, { name: "Un", qty: 5, unit: "g" }, { name: "Yumurta", qty: 0.25, unit: "adet" }, { name: "Tuz", qty: 2, unit: "g" } ] },
    { group: "Garnitür", name: "Mercimekli Bulgur Pilavı", ingredients: [ { name: "Bulgur", qty: 60, unit: "g" }, { name: "Kırmızı Mercimek", qty: 20, unit: "g" }, { name: "Soğan", qty: 10, unit: "g" }, { name: "Tereyağı", qty: 5, unit: "g" }, { name: "Ayçiçek Yağı", qty: 5, unit: "ml" }, { name: "Tuz", qty: 2, unit: "g" }, { name: "Su", qty: 150, unit: "ml" } ] },
    { group: "Garnitür", name: "Soslu Makarna", ingredients: [ { name: "Makarna", qty: 80, unit: "g" }, { name: "Salça", qty: 10, unit: "g" }, { name: "Soğan", qty: 15, unit: "g" }, { name: "Ayçiçek Yağı", qty: 5, unit: "ml" }, { name: "Tuz", qty: 2, unit: "g" }, { name: "Su", qty: 200, unit: "ml" } ] },
    { group: "Garnitür", name: "Fırın Makarna", ingredients: [ { name: "Makarna", qty: 80, unit: "g" }, { name: "Süt", qty: 50, unit: "ml" }, { name: "Tereyağı", qty: 10, unit: "g" }, { name: "Un", qty: 10, unit: "g" }, { name: "Tuz", qty: 2, unit: "g" } ] },
    { group: "Tatlı", name: "Şekerpare", ingredients: [ { name: "İrmik", qty: 25, unit: "g" }, { name: "Un", qty: 15, unit: "g" }, { name: "Şeker", qty: 30, unit: "g" }, { name: "Tereyağı", qty: 10, unit: "g" }, { name: "Yumurta", qty: 0.5, unit: "adet" }, { name: "Süt", qty: 20, unit: "ml" } ] },
    { group: "Ana Yemek", name: "Patates Oturtma", ingredients: [ { name: "Patates", qty: 100, unit: "g" }, { name: "Dana Kıyma", qty: 60, unit: "g" }, { name: "Soğan", qty: 20, unit: "g" }, { name: "Salça", qty: 10, unit: "g" }, { name: "Ayçiçek Yağı", qty: 10, unit: "ml" }, { name: "Tuz", qty: 2, unit: "g" }, { name: "Su", qty: 150, unit: "ml" } ] },
    { group: "Çorba", name: "Düğün Çorbası", ingredients: [ { name: "Dana Eti", qty: 40, unit: "g" }, { name: "Un", qty: 5, unit: "g" }, { name: "Tereyağı", qty: 4, unit: "g" }, { name: "Yumurta", qty: 0.25, unit: "adet" }, { name: "Yoğurt", qty: 25, unit: "g" }, { name: "Tuz", qty: 2, unit: "g" }, { name: "Su", qty: 250, unit: "ml" } ] },
    { group: "Ana Yemek", name: "Tavuk Pirzola", ingredients: [ { name: "Tavuk Göğüs", qty: 120, unit: "g" }, { name: "Soğan", qty: 20, unit: "g" }, { name: "Ayçiçek Yağı", qty: 10, unit: "ml" }, { name: "Tereyağı", qty: 5, unit: "g" }, { name: "Tuz", qty: 2, unit: "g" }, { name: "Su", qty: 50, unit: "ml" } ] },
    { group: "Ana Yemek", name: "Mitite Köfte", ingredients: [ { name: "Dana Kıyma", qty: 70, unit: "g" }, { name: "Soğan", qty: 15, unit: "g" }, { name: "Bulgur", qty: 10, unit: "g" }, { name: "Yumurta", qty: 0.25, unit: "adet" }, { name: "Un", qty: 5, unit: "g" }, { name: "Tuz", qty: 2, unit: "g" }, { name: "Su", qty: 50, unit: "ml" } ] },
    { group: "Çorba", name: "Ayran Aşı Çorbası", ingredients: [ { name: "Yoğurt", qty: 60, unit: "g" }, { name: "Bulgur", qty: 15, unit: "g" }, { name: "Nohut", qty: 10, unit: "g" }, { name: "Un", qty: 5, unit: "g" }, { name: "Tereyağı", qty: 3, unit: "g" }, { name: "Tuz", qty: 2, unit: "g" }, { name: "Su", qty: 250, unit: "ml" } ] },
    { group: "Ana Yemek", name: "Hasan Paşa Köfte", ingredients: [ { name: "Dana Kıyma", qty: 80, unit: "g" }, { name: "Soğan", qty: 20, unit: "g" }, { name: "Yumurta", qty: 0.25, unit: "adet" }, { name: "Un", qty: 5, unit: "g" }, { name: "Patates", qty: 80, unit: "g" }, { name: "Tereyağı", qty: 5, unit: "g" }, { name: "Süt", qty: 30, unit: "ml" }, { name: "Salça", qty: 10, unit: "g" }, { name: "Ayçiçek Yağı", qty: 5, unit: "ml" }, { name: "Tuz", qty: 2, unit: "g" }, { name: "Su", qty: 50, unit: "ml" } ] },
    { group: "Ana Yemek", name: "Macar Gülaş", ingredients: [ { name: "Dana Eti", qty: 90, unit: "g" }, { name: "Soğan", qty: 30, unit: "g" }, { name: "Patates", qty: 50, unit: "g" }, { name: "Salça", qty: 10, unit: "g" }, { name: "Un", qty: 5, unit: "g" }, { name: "Ayçiçek Yağı", qty: 10, unit: "ml" }, { name: "Tuz", qty: 2, unit: "g" }, { name: "Su", qty: 250, unit: "ml" } ] },
    { group: "Salata/Turşu", name: "Kuru Fasulye Piyazı", ingredients: [ { name: "Kuru Fasulye", qty: 50, unit: "g" }, { name: "Soğan", qty: 10, unit: "g" }, { name: "Ayçiçek Yağı", qty: 5, unit: "ml" }, { name: "Tuz", qty: 2, unit: "g" }, { name: "Su", qty: 20, unit: "ml" } ] },
    { group: "Meşrubat/Komposto", name: "Ayran", ingredients: [ { name: "Yoğurt", qty: 100, unit: "g" }, { name: "Su", qty: 200, unit: "ml" }, { name: "Tuz", qty: 1, unit: "g" } ] },
    { group: "Meşrubat/Komposto", name: "Komposto", ingredients: [ { name: "Şeker", qty: 20, unit: "g" }, { name: "Su", qty: 250, unit: "ml" } ] },
    { group: "Salata/Turşu", name: "Patates Salatası", ingredients: [ { name: "Patates", qty: 100, unit: "g" }, { name: "Soğan", qty: 20, unit: "g" }, { name: "Ayçiçek Yağı", qty: 5, unit: "ml" }, { name: "Tuz", qty: 2, unit: "g" }, { name: "Su", qty: 20, unit: "ml" } ] },
    { group: "Salata/Turşu", name: "Kısır", ingredients: [ { name: "Bulgur", qty: 50, unit: "g" }, { name: "Salça", qty: 20, unit: "g" }, { name: "Soğan", qty: 10, unit: "g" }, { name: "Ayçiçek Yağı", qty: 5, unit: "ml" }, { name: "Tuz", qty: 2, unit: "g" }, { name: "Su", qty: 50, unit: "ml" } ] },
    { group: "Meşrubat/Komposto", name: "Cacık", ingredients: [ { name: "Yoğurt", qty: 100, unit: "g" }, { name: "Su", qty: 200, unit: "ml" }, { name: "Tuz", qty: 2, unit: "g" } ] }
];

export const PRICE_GROUPS = [
    'Kahvaltılık Grubu', 'Bakliyat Grubu', 'Yağlar', 'Et Grubu', 'Baharatlar',
    'Sebzeler', 'Meyveler', 'Temel Gıda', 'Salata/Turşu', 'Meşrubat/Komposto',
    'Tatlı', 'Yan Ürünler', 'Diğer'
];

export const UNITS = ['kg', 'g', 'l', 'ml', 'adet'];

export const RECIPE_CATEGORIES = [
  'Çorba', 'Ana Yemek', 'Garnitür', 'Tatlı', 'Salata/Turşu', 'Meşrubat/Komposto'
];

export const DAY_NAMES = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
export const MEAL_SLOTS: (keyof import('./types').MealSlots)[] = ['Çorba', 'Ana Yemek', 'Garnitür', 'Ek / Diğer'];


export const INITIAL_MONTHLY_PLAN: MonthlyPlan = {};

export const DEFAULT_AI_SETTINGS: AiSettings = {
  freshnessThreshold: 3,
  minSources: 3,
  outlierThreshold: 30,
  analysisMode: 'Normal',
  autoUpdate: true,
  advanced: {
    autoRollback: false,
    emailOnError: false,
  },
};

const DEFAULT_MAPPINGS = { name: '$.name', price: '$.price', unit: '$.unit', captured_at: '$.timestamp', brand: '$.brand', url: '$.url' };

export const MOCK_API_RESOURCES: ApiResource[] = [
    { 
      id: 'api-1',
      name: 'Tarım Kredi Kooperatifi', 
      logo: '/logos/default.png', 
      type: 'Market',
      baseUrl: 'https://api.tarimkredi.com.tr/v1',
      auth: { type: 'none' },
      weight: 0.8,
      mappings: DEFAULT_MAPPINGS,
      state: 'down', 
      lastSyncAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
      lastErrorAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
      details: 'Bağlantı zaman aşımına uğradı. Sunucu yanıt vermiyor.',
      metrics: { latencyMsAvg: 5000, uptime24h: 0, lastStatusCode: 503 }
    },
    { 
      id: 'api-2',
      name: 'GetirÇarşı Entegrasyonu', 
      logo: '/logos/getir.png',
      type: 'Market',
      baseUrl: 'https://api.getir.com/v2',
      auth: { type: 'apiKey', key: 'X-Api-Key', value: 'secret', in: 'header'},
      weight: 0.9,
      mappings: DEFAULT_MAPPINGS,
      state: 'down', 
      lastSyncAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      lastErrorAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      details: 'Kimlik doğrulama başarısız. API anahtarı geçersiz veya süresi dolmuş.',
      metrics: { latencyMsAvg: 1200, uptime24h: 0, lastStatusCode: 401 }
    },
    { 
      id: 'api-3',
      name: 'CarrefourSA Online', 
      logo: '/logos/carrefoursa.png', 
      type: 'Market',
      baseUrl: 'https://api.carrefoursa.com/v1',
      auth: { type: 'none' },
      weight: 1.0,
      mappings: DEFAULT_MAPPINGS,
      state: 'degraded', 
      lastSyncAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      lastOkAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      details: 'Bazı isteklerde gecikme artışı gözlendi.',
      metrics: { latencyMsAvg: 1850, uptime24h: 100, lastStatusCode: 200 },
      pendingAnalyses: 3,
    },
    { 
      id: 'api-4',
      name: 'Migros Sanal Market', 
      logo: '/logos/migros.png', 
      type: 'Market',
      baseUrl: 'https://api.migros.com.tr/v1',
      auth: { type: 'none' },
      weight: 1.0,
      mappings: DEFAULT_MAPPINGS,
      state: 'operational', 
      lastSyncAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      lastOkAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      metrics: { latencyMsAvg: 420, uptime24h: 100, lastStatusCode: 200 }
    },
    { 
      id: 'api-5',
      name: 'Trendyol Hızlı Market', 
      logo: '/logos/trendyol.png', 
      type: 'Market',
      baseUrl: 'https://api.trendyol.com/v1',
      auth: { type: 'oauth' },
      weight: 0.9,
      mappings: DEFAULT_MAPPINGS,
      state: 'operational', 
      lastSyncAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      lastOkAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      metrics: { latencyMsAvg: 310, uptime24h: 100, lastStatusCode: 200 }
    },
    { 
      id: 'api-6',
      name: 'TÜİK Gıda Endeksi', 
      logo: '/logos/default.png', 
      type: 'Resmi Kurum',
      baseUrl: 'https://data.tuik.gov.tr/v1',
      auth: { type: 'none' },
      weight: 0.5,
      mappings: DEFAULT_MAPPINGS,
      state: 'operational', 
      lastSyncAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      lastOkAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      metrics: { latencyMsAvg: 650, uptime24h: 99.8, lastStatusCode: 200 }
    },
];

export const MOCK_AI_ERRORS: AiError[] = [
    { 
        id: 'err-001', 
        type: 'ai_learning',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), 
        status: 'Düzeltilmiş', 
        description: 'Ayçiçek yağı 18L fiyatı yanlış normalize edilmiş (800→44.4 ₺/L).',
        details: {
            dataId: 'Ayçiçek Yağı',
            source: 'AI Normalization Engine',
            oldValue: { packagePrice: 800, packageSize: 18, unit: 'L' },
            newValue: { unitPrice: 44.44, unit: 'L' },
        }
    },
    { 
        id: 'err-002', 
        type: 'ai_learning',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), 
        status: 'Beklemede', 
        description: 'Tarım Kredi API geçici hata verdi, veri çekilemedi.',
        details: {
            dataId: 'Tüm Liste',
            source: 'Tarım Kredi API',
            oldValue: 'N/A',
            newValue: 'API Error 503',
        }
    },
    { 
        id: 'err-003', 
        type: 'ai_learning',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), 
        status: 'Onay Bekliyor', 
        description: 'Süt (3L) fiyatında 2 kaynak arasında %40 çelişki bulundu.',
        details: {
            dataId: 'Süt',
            source: 'Kaynak Karşılaştırma Motoru',
            oldValue: { source: 'Migros', price: 35.50 },
            newValue: { source: 'CarrefourSA', price: 49.75 },
        }
    },
    { 
        id: 'err-004', 
        type: 'ai_learning',
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), 
        status: 'Düzeltilmiş', 
        description: 'Birim çıkarımı "1 koli yumurta" için başarısız oldu, manuel düzeltme yapıldı.',
        details: {
            dataId: 'Yumurta',
            source: 'AI Unit Extraction',
            oldValue: '1 koli',
            newValue: { qty: 30, unit: 'adet' },
        }
    },
];

export const MOCK_INSTITUTIONAL_MENUS: InstitutionalMenus = {
  "KYK Yurt Menüsü": {
    personCount: 1500,
    days: {
      "2024-10-01": { 'Çorba': { name: "Ezogelin Çorbası", group: "Çorba"}, 'Ana Yemek': { name: "Tavuk Sote", group: "Ana Yemek"}, 'Garnitür': { name: "Pirinç Pilavı", group: "Garnitür" }, 'Ek / Diğer': { name: "Sütlaç", group: "Tatlı" } },
      "2024-10-02": { 'Çorba': { name: "Mercimek Çorbası", group: "Çorba"}, 'Ana Yemek': { name: "Etli Kuru Fasulye", group: "Ana Yemek"}, 'Garnitür': { name: "Bulgur Pilavı", group: "Garnitür" }, 'Ek / Diğer': { name: "Ayran", group: "Meşrubat/Komposto"} },
    }
  },
  "Hastane Menüsü": {
    personCount: 800,
    days: {
      "2024-10-01": { 'Çorba': { name: "Yayla Çorbası", group: "Çorba"}, 'Ana Yemek': { name: "Fırın Tavuk", group: "Ana Yemek"}, 'Garnitür': { name: "Patates Püresi", group: "Garnitür" }, 'Ek / Diğer': { name: "Komposto", group: "Meşrubat/Komposto"} },
    }
  }
};