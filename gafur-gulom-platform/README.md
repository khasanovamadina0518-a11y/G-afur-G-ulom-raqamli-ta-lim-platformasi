# G'afur G'ulom Raqamli Ta'lim Platformasi

**G'afur G'ulom Raqamli Ta'lim Platformasi** — O'zbekiston xalq shoiri G'afur G'ulom (1903–1966) hayoti, ijodi va merosi haqida interaktiv ta'lim resurslarini bir joyga jamlagan zamonaviy veb-platforma. Loyiha o'quvchilar, talabalar, o'qituvchilar va adabiyot ixlosmandlari uchun mo'ljallangan.

Platforma she'rlar va dostonlar kutubxonasi, biografik ma'lumotlar, ilmiy arxiv, video darslar, testlar, interaktiv o'yinlar, AI yordamchi, shaxsiy dashboard va yutuqlar tizimini o'z ichiga oladi. Barcha kontent JSON formatidagi ma'lumotlar bazasidan yuklanadi va markaziy `PlatformDataService` orqali boshqariladi.

Loyiha frontend texnologiyalari asosida qurilgan: HTML5, CSS3 va JavaScript (ES6). Foydalanuvchi faolligi `localStorage` da saqlanadi, yutuqlar esa `AchievementEngine` orqali avtomatik ochiladi.

---

## Platforma haqida

G'afur G'ulom — o'zbek adabiyotining buyuk shoiri, dramaturg va tarjimon. Uning «Shum bola», «Yoshlik» kabi asarlari o'zbek maktab o'quv dasturlarining ajralmas qismidir. Ushbu platforma shoir merosini raqamli shaklda o'rganish, o'qish va sinash imkonini beradi.

Platformaning ta'limiy qiymati quyidagilarda namoyon bo'ladi:

- Adabiy merosni tizimli va qulay shaklda taqdim etish
- Interaktiv testlar va o'yinlar orqali bilimni mustahkamlash
- O'qituvchilar va talabalar uchun tayyor materiallar bazasi
- Foydalanuvchi progressini kuzatish va rag'batlantirish tizimi

---

## Asosiy imkoniyatlar

- 📌 **Bosh sahifa** — hero bo'limi, platform statistikasi, bugungi she'r, tezkor havolalar
- 👤 **Hayoti** — biografiya, voqealar xronologiyasi, mukofotlar, xotiralar va meros bo'limlari
- 📚 **Elektron kutubxona** — she'rlar va dostonlar, filtrlash, sevimlilar, o'qish rejimi
- 🔬 **Ilmiy arxiv** — maqolalar, dissertatsiyalar, lug'at va bibliografiya
- 🎬 **Video darslar** — video materiallar katalogi va tomosha qilish interfeysi
- 🎓 **Ta'lim markazi** — darslar, o'quv materiallari, vazifalar, progress va sertifikat
- 🎮 **Interaktiv o'yinlar** — viktorina, she'r yodlash, xronologiya, so'z qidiruv o'yinlari
- 📝 **Testlar** — kategoriyalar bo'yicha professional test markazi
- 🤖 **AI yordamchi** — mahalliy bilim bazasi asosidagi chat interfeysi
- 📊 **Dashboard** — jonli statistika, maqsadlar, tavsiyalar va faoliyat tarixi
- 🏆 **Yutuqlar tizimi** — 20 ta avtomatik badge, XP, daraja va streak kuzatuvi
- 🔍 **Global qidiruv** — she'rlar va dostonlar bo'yicha header qidiruvi
- 🌙 **Dark Mode** — tungi/kunduzgi mavzu, `localStorage` da saqlanadi
- 📱 **Responsive Design** — mobil menyu, pastki navigatsiya va moslashuvchan grid
- 🗄️ **PlatformDataService** — markaziy JSON ma'lumotlar qatlami
- 💾 **UserProgress** — o'qish, test, video va AI faolligini kuzatish
- ⚙️ **Achievement Engine** — yutuqlarni avtomatik ochish va dashboard bilan integratsiya

---

## Platforma tuzilishi

```
gafur-gulom-platform/
├── index.html                  # Bosh sahifa
├── manifest.json               # PWA manifest
├── 404.html                    # Xato sahifasi
│
├── assets/
│   ├── css/
│   │   ├── main.css
│   │   ├── components.css
│   │   ├── responsive.css
│   │   ├── theme.css
│   │   └── home.css
│   ├── js/
│   │   ├── app.js
│   │   ├── data.js
│   │   ├── platform-base.js
│   │   ├── platform-data-service.js
│   │   ├── user-progress.js
│   │   └── achievement-engine.js
│   └── images/
│       └── gafur-gulom.jpg
│
├── components/
│   ├── header.js
│   └── footer.js
│
├── data/
│   ├── hayot.json
│   ├── sherlar.json
│   ├── dostonlar.json
│   ├── ilmiy.json
│   ├── quiz.json
│   ├── videolar.json
│   └── asarlar.json
│
└── pages/
    ├── hayot.html
    ├── asarlar.html
    ├── ilmiy.html
    ├── multimedia.html
    ├── talim.html
    ├── interaktiv.html
    ├── interaktiv-oyinlar.html
    ├── ai-yordamchi.html
    ├── dashboard.html
    └── yutuqlar.html
```

---

## Texnologiyalar

| Texnologiya | Qo'llanishi |
|-------------|-------------|
| HTML5 | Sahifa strukturasi va semantik markup |
| CSS3 | Dizayn, animatsiya, dark mode, responsive layout |
| JavaScript (ES6) | Interaktiv funksionallik va komponentlar |
| JSON | Kontent va konfiguratsiya ma'lumotlari |
| LocalStorage | Foydalanuvchi progressi, mavzu, AI suhbatlari |
| PlatformDataService | Markaziy ma'lumotlar yuklash va qidiruv |
| Git | Versiya nazorati |
| GitHub | Manba kodini saqlash va GitHub Pages deploy |
| Vercel | Production hosting |

---

## O'rnatish

### 1. Repozitoriyani klonlash

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd gafur-gulom-platform
```

### 2. Lokal serverni ishga tushirish

Platforma statik veb-loyiha bo'lgani uchun brauzerda to'g'ri ishlashi uchun HTTP server kerak.

**Python orqali (tavsiya etiladi):**

```bash
python -m http.server 8000
```

Brauzerda oching: `http://localhost:8000`

**Visual Studio Code Live Server (muqobil):**

1. VS Code da loyiha papkasini oching
2. `index.html` faylini oching
3. **Live Server** kengaytmasi orqali **Go Live** tugmasini bosing

> **Eslatma:** Fayllarni to'g'ridan-to'g'ri `file://` protokoli orqali ochish ba'zi funksiyalarda (JSON yuklash, modullar) xatolikka olib kelishi mumkin.

---

## Demo

| Platforma | Havola |
|-----------|--------|
| 🌐 Vercel | https://YOUR-VERCEL-URL |
| 📦 GitHub | https://github.com/YOUR_USERNAME/YOUR_REPOSITORY |

---

## Platforma imkoniyatlari

| Modul | Tavsif |
|-------|--------|
| 🏠 Bosh sahifa | Hero bo'limi, platform statistikasi, bugungi she'r, foydalanuvchi toifalari va tezkor havolalar |
| 👤 Hayoti | G'afur G'ulom biografiyasi, interaktiv vaqt chizig'i, mukofotlar, zamondoshlar xotirasi va meros bo'limi |
| 📚 Elektron kutubxona | She'rlar va dostonlar, mavzu/yil filtri, sevimlilar, modal o'qish, ulashish va nusxa olish |
| 🔬 Ilmiy arxiv | Ilmiy maqolalar, dissertatsiyalar, adabiy lug'at va bibliografiya generatori |
| 🎬 Video darslar | Video darslar katalogi, tomosha interfeysi va progress kuzatuvi |
| 🎓 Ta'lim markazi | Sinflar bo'yicha darslar, o'quv materiallari, vazifalar, viktorina va sertifikat yuklab olish |
| 🎮 Interaktiv o'yinlar | «Kim ko'p biladi?», she'r yodlash, xronologiya va so'z qidiruv o'yinlari |
| 📝 Testlar | Hayot, asarlar va boshqa mavzular bo'yicha kategoriyali test markazi |
| 🤖 AI yordamchi | Mahalliy bilim bazasi (`ai-knowledge.js`) asosida suhbat, tavsiya va tezkor savollar |
| 📊 Dashboard | XP, streak, o'qish progressi, kunlik maqsadlar, tavsiyalar va faoliyat tarixi |
| 🏆 Yutuqlar | 20 ta badge, daraja tizimi, ochilgan/qulflangan yutuqlar va motivatsiya bo'limi |

---

## Kelajakdagi rivojlantirish

Quyidagi yo'nalishlar kelajakda amalga oshirilishi mumkin:

- 🛠️ **Admin Panel** — kontentni boshqarish uchun maxsus interfeys
- 🔐 **Authentication** — ro'yxatdan o'tish va haqiqiy foydalanuvchi hisobi
- 🗃️ **Database integration** — JSON o'rniga server-side ma'lumotlar bazasi
- 🌍 **Multi-language support** — o'zbek va ingliz tillarida to'liq lokalizatsiya
- 📈 **Analytics** — foydalanuvchi statistikasi va o'qitish samaradorligi tahlili
- 📲 **Mobile App** — iOS va Android uchun native ilova
- 🧠 **AI improvements** — tashqi AI API integratsiyasi va aqlliroq tavsiyalar

---

## Muallif

**Madina Xasanova**

Bitiruv malakaviy ishi

2026

---

*G'afur G'ulom merosini kelajak avlodlarga yetkazish maqsadida yaratilgan.*
