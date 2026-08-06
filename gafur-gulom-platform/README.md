# 📖 G'afur G'ulom Ta'limiy Platformasi

> O'zbek adabiyotining buyuk shoiri va yozuvchisi G'afur G'ulom haqida to'liq ta'limiy veb-platforma

![G'afur G'ulom](assets/images/gafur-gulom.jpg)

## 🎯 Loyiha haqida

Bu platforma G'afur G'ulomning hayoti, asarlari va ijodi bilan tanishish uchun yaratilgan zamonaviy ta'limiy veb-platforma. O'quvchilar, talabalar, o'qituvchilar va adabiyot ixlosmandlari uchun mo'ljallangan.

### ⭐ Asosiy xususiyatlar

- **📜 Hayot tarixi** - Shoirning hayot yo'li va muhim voqealar interaktiv vaqt chizig'ida
- **📚 Asarlar to'plami** - She'rlar, dostonlar va hikoyalar to'liq matnlari bilan
- **📖 Ilmiy arxiv** - Maqolalar, dissertatsiyalar, bibliografiya generatori
- **🎓 Ta'lim resurslari** - Darsliklar, viktorinalar va o'quv materiallari
- **🎮 Interaktiv o'yinlar** - 5 xil ta'limiy o'yin: viktorina, she'r yodlash, xronologiya, so'z topish
- **🎬 Multimedia** - Video, audio va interaktiv materiallar
- **💬 Hamjamiyat** - Forum, muhokamalar va tadbirlar
- **🌙 Dark Mode** - Ko'z sog'lig'ini asrash uchun tungi rejim
- **🔍 Global qidiruv** - Barcha kontentni tezkor qidirish
- **📱 PWA** - Offline rejimda ishlash imkoniyati

## 📁 Papka tuzilmasi

```
gafur-gulom-platform/
├── index.html                 # Bosh sahifa
├── manifest.json              # PWA manifest
├── service-worker.js          # Service Worker (offline mode)
├── offline.html               # Offline sahifa
├── README.md                  # Loyiha hujjati
│
├── assets/                    # Statik resurslar
│   ├── css/
│   │   ├── main.css          # Asosiy uslublar
│   │   ├── components.css    # Komponent uslublari
│   │   ├── responsive.css    # Responsive dizayn
│   │   └── theme.css         # Rang temalari
│   ├── js/
│   │   ├── app.js            # Asosiy JavaScript
│   │   ├── data.js           # Ma'lumotlar yuklash
│   │   └── router.js         # Marshrutizatsiya
│   └── images/               # Rasmlar
│       └── gafur-gulom.jpg
│
├── components/               # Qayta ishlatiladigan komponentlar
│   ├── header.js            # Header komponenti
│   └── footer.js            # Footer komponenti
│
├── data/                    # JSON ma'lumotlar bazasi
│   ├── sherlar.json        # She'rlar to'plami
│   ├── sherlar-full.json   # To'liq she'rlar
│   ├── hayot.json          # Hayot voqealari
│   ├── dostonlar.json      # Dostonlar
│   ├── quiz.json           # Viktorina savollari (50 ta)
│   └── ilmiy.json          # Ilmiy maqolalar, dissertatsiyalar, atamalar
│
└── pages/                   # Sahifalar
    ├── hayot.html          # Hayot tarixi
    ├── hayot-page.js
    ├── asarlar.html        # Asarlar to'plami
    ├── asarlar-page.js
    ├── ilmiy.html          # Ilmiy arxiv
    ├── ilmiy-page.js
    ├── talim.html          # Ta'lim resurslari
    ├── talim-page.js
    ├── interaktiv.html     # Interaktiv o'yinlar
    ├── interaktiv-page.js
    ├── multimedia.html     # Multimedia
    └── hamjamiyat.html     # Hamjamiyat
```

## 🚀 O'rnatish va ishga tushirish

### Lokal kompyuterda

1. **Loyihani yuklab oling**
```bash
git clone https://github.com/username/gafur-gulom-platform.git
cd gafur-gulom-platform
```

2. **HTTP server ishga tushiring**

**Python 3:**
```bash
python -m http.server 8000
```

**Node.js:**
```bash
npx http-server -p 8000
```

**VS Code Live Server:**
- Live Server extension o'rnating
- index.html ni oching
- "Go Live" tugmasini bosing

3. **Brauzerda oching**
```
http://localhost:8000
```

### GitHub Pages orqali joylashtirish

1. **Repository yarating**
   - GitHub da yangi repository yarating
   - Loyihani repository ga push qiling

2. **GitHub Pages sozlang**
   - Repository Settings → Pages
   - Source: `main` branch, root papka
   - Save

3. **Tayyor!**
   - Sahifangiz: `https://username.github.io/gafur-gulom-platform/`

## 📝 Kontent qo'shish yo'riqnomasi

### She'r qo'shish

`data/sherlar.json` faylini oching:

```json
{
  "id": 11,
  "sarlavha": "Yangi she'r nomi",
  "muallif": "G'afur G'ulom",
  "yil": 1940,
  "mavzu": "tabiat",
  "matn": "She'r matnini shu yerga yozing..."
}
```

### Viktorina savoli qo'shish

`data/quiz.json` faylini oching:

```json
{
  "id": 51,
  "savol": "Savolingiz?",
  "variantlar": ["A variant", "B variant", "C variant", "D variant"],
  "togri": 1,
  "daraja": "oson",
  "mavzu": "hayot"
}
```

### Ilmiy maqola qo'shish

`data/ilmiy.json` faylini oching:

```json
{
  "id": 11,
  "sarlavha": "Maqola sarlavhasi",
  "mualliflar": ["Muallif ismi"],
  "nashriyot": "Nashriyot nomi",
  "yil": 2024,
  "til": "o'zbek",
  "kalitSozlar": ["kalit", "so'zlar"],
  "annotatsiya": "Qisqa ta'rif...",
  "pdfHavola": "#"
}
```

## 🛠 Texnologiyalar

- **HTML5** - Semantik markup
- **CSS3** - Custom Properties, Grid, Flexbox, Animations
- **JavaScript (ES6+)** - Vanilla JS, Async/Await, Fetch API
- **JSON** - Ma'lumotlar bazasi
- **PWA** - Progressive Web App
- **Service Worker** - Offline ishlash
- **LocalStorage** - Mahalliy ma'lumotlar saqlash
- **Canvas API** - Sertifikat generatsiya
- **Drag & Drop API** - Interaktiv o'yinlar
- **Clipboard API** - Nusxa olish

## 🎨 Dizayn tizimi

### Ranglar

```css
--primary: #1a3c5e;      /* To'q ko'k */
--secondary: #c9a84c;    /* Oltin */
--bg: #f9f6f0;           /* Qog'oz rangi */
--text: #2d2d2d;         /* Matn */
--success: #4caf50;      /* Yashil */
--error: #f44336;        /* Qizil */
```

### Shriftlar

- **Sarlavhalar**: Playfair Display
- **Asosiy matn**: Inter

## 🌟 Xususiyatlar

### ✅ Tayyor

- [x] Responsive dizayn (mobil, planshet, desktop)
- [x] Dark mode
- [x] Global qidiruv
- [x] PWA (Progressive Web App)
- [x] Offline rejim
- [x] 10 ta she'r to'liq matn bilan
- [x] 50 ta viktorina savoli
- [x] 5 ta interaktiv o'yin
- [x] Bibliografiya generatori (4 format)
- [x] 30 ta adabiyot atamasi
- [x] LocalStorage integr atsiyasi
- [x] SEO optimizatsiya
- [x] Schema.org markup

### 🔮 Kelajak rejalar

- [ ] Backend (Node.js + MongoDB)
- [ ] Foydalanuvchi autentifikatsiyasi
- [ ] Administrator paneli
- [ ] Kontent yuklash API
- [ ] Ko'proq she'rlar (500+)
- [ ] Audio she'rlar
- [ ] Video darsliklar
- [ ] Forum funksionali
- [ ] Mobil ilova (React Native)
- [ ] Ko'p tillilik (rus, ingliz)

## 📊 Statistika

- **She'rlar**: 10+ (to'liq matn bilan)
- **Viktorina savollari**: 50
- **O'yinlar**: 5
- **Sahifalar**: 8
- **Ilmiy maqolalar**: 10
- **Dissertatsiyalar**: 10
- **Atamalar**: 30
- **Kod qatorlari**: ~8000+

## 🤝 Hissa qo'shish

Loyihani yaxshilash uchun takliflar va hissa qo'shishlar qabul qilinadi!

1. Fork qiling
2. Feature branch yarating (`git checkout -b feature/AmazingFeature`)
3. Commit qiling (`git commit -m 'Add some AmazingFeature'`)
4. Push qiling (`git push origin feature/AmazingFeature`)
5. Pull Request oching

## 📄 Litsenziya

Bu loyiha ta'limiy maqsadlarda yaratilgan va O'zbek adabiyotini rivojlantirish uchun mo'ljallangan.

## 📧 Aloqa

- **Website**: [gafurgulom.uz](https://gafurgulom.uz)
- **Email**: info@gafurgulom.uz
- **Telegram**: @gafurgulom_platform

## 🙏 Minnatdorchilik

- G'afur G'ulom merosi fondi
- O'zbekiston adabiyoti va san'ati nashriyoti
- O'zbek tili va adabiyoti instituti
- Barcha o'qituvchi va talabalar

---

**© 2024 G'afur G'ulom Ta'limiy Platformasi. Barcha huquqlar himoyalangan.**

Made with ❤️ for O'zbek adabiyoti
