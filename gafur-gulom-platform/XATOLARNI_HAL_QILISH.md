# 🔧 Xatolarni hal qilish

## ❌ Muammo: Bosh sahifa va Hayoti bo'limlari ishlamayapti

### Sabablari:

1. **Server ishlamayapti** - JSON fayllarni yuklash uchun server kerak
2. **CORS xatosi** - Brauzer file:// protokolida JSON yuklashga ruxsat bermaydi
3. **Yo'l xatolari** - Noto'g'ri fayl yo'llari

### ✅ Yechim:

## 1-qadam: Serverni ishga tushiring

### Python server (Tavsiya etiladi):

```bash
# Loyiha papkasiga o'ting
cd "D:\G'afur G'ulom\gafur-gulom-platform"

# Serverni ishga tushiring
python -m http.server 8000
```

Keyin brauzerda oching: **http://localhost:8000**

### Node.js server:

```bash
# http-server o'rnatish (bir marta)
npm install -g http-server

# Serverni ishga tushiring
cd "D:\G'afur G'ulom\gafur-gulom-platform"
http-server -p 8000
```

## 2-qadam: Brauzer console ni tekshiring

1. Sahifani oching: http://localhost:8000
2. **F12** bosing (Developer Tools)
3. **Console** tabiga o'ting
4. Qizil xatolarni o'qing

### Keng tarqalgan xatolar:

#### ❌ "Failed to fetch" yoki "NetworkError"
**Sabab**: Server ishlamayapti
**Yechim**: 1-qadamni bajaring

#### ❌ "CORS policy" xatosi
**Sabab**: file:// protokolida ochilgan
**Yechim**: Server orqali oching (http://localhost:8000)

#### ❌ "404 Not Found: data/sherlar.json"
**Sabab**: Fayl topilmadi
**Yechim**: Faylning mavjudligini tekshiring:
```bash
dir data\sherlar.json
```

#### ❌ "Unexpected token" yoki "JSON.parse error"
**Sabab**: JSON fayl buzilgan
**Yechim**: JSON faylni tekshiring (vergul, qavs)

## 3-qadam: Fayllarni tekshiring

### Kerakli fayllar:

```
gafur-gulom-platform/
├── index.html ✓
├── data/
│   ├── sherlar.json ✓
│   ├── hayot.json ✓
│   ├── dostonlar.json ✓
│   └── quiz.json ✓
├── assets/
│   └── js/
│       ├── app.js ✓
│       └── data.js ✓
└── pages/
    ├── hayot.html ✓
    └── hayot-page.js ✓
```

### Tekshirish:

```bash
cd "D:\G'afur G'ulom\gafur-gulom-platform"

# Fayllarni tekshirish
dir data
dir assets\js
dir pages
```

## 4-qadam: JSON fayllarni validatsiya qiling

### Online validator:
1. https://jsonlint.com ga o'ting
2. JSON faylni oching va mazmunini nusxalang
3. "Validate JSON" bosing
4. Xatolarni to'g'irlang

### Keng tarqalgan JSON xatolari:

```json
// ❌ Noto'g'ri - oxirgi elementdan keyin vergul
{
  "sherlar": [
    {"id": 1},
    {"id": 2},  // ← Bu vergul noto'g'ri
  ]
}

// ✅ To'g'ri
{
  "sherlar": [
    {"id": 1},
    {"id": 2}
  ]
}
```

## 5-qadam: Cache ni tozalang

Agar o'zgarishlar ko'rinmasa:

1. **Ctrl + Shift + R** (Windows/Linux)
2. **Cmd + Shift + R** (Mac)
3. Yoki Developer Tools → Network → "Disable cache" ✓

## 6-qadam: Yo'llarni tekshiring

### index.html dan:
```javascript
fetch('data/sherlar.json')  // ✓ To'g'ri
```

### pages/hayot.html dan:
```javascript
fetch('../data/hayot.json')  // ✓ To'g'ri
```

## 🔍 Debugging

### Console da tekshirish:

```javascript
// Browser console da (F12)

// 1. getSherlar funksiyasi mavjudmi?
console.log(typeof getSherlar);  // "function" bo'lishi kerak

// 2. She'rlarni yuklash
getSherlar().then(sherlar => {
    console.log('She\'rlar:', sherlar);
    console.log('Soni:', sherlar.length);
});

// 3. Hayot ma'lumotlarini yuklash
getHayotMalumotlari().then(voqealar => {
    console.log('Voqealar:', voqealar);
    console.log('Soni:', voqealar.length);
});
```

## 📞 Agar muammo hal bo'lmasa:

1. Browser console screenshot oling
2. Network tab ni tekshiring (F12 → Network)
3. Qizil xatolarni o'qing
4. Xato xabarini yuboring

## ✅ Muvaffaqiyatli ishlash belgisi:

- ✓ Bosh sahifada 4 ta she'r ko'rinadi
- ✓ Statistika raqamlari 0 dan yuqoriga hisoblaydi
- ✓ Hayot sahifasida timeline ko'rinadi
- ✓ Console da xato yo'q

---

**Eslatma**: Har doim server orqali ishlating, file:// protokolida emas!
