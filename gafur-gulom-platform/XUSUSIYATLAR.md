# 🎯 G'afur G'ulom Platformasi - Asosiy Xususiyatlar

## 📚 Kontent bo'limlari

### 1. Bosh sahifa (index.html)
- Hero section - shoirning asosiy ma'lumotlari
- 6 ta tezkor havola kartasi
- Tanlangan she'rlar (dinamik yuklash)
- To'liq responsive dizayn

### 2. Hayoti (hayot.html)
- **Timeline dizayni** - 15 ta muhim sana
- Vertikal vaqt chizig'i
- Har bir voqea uchun batafsil tavsif
- Yil ko'rsatkichlari

### 3. Asarlari (asarlar.html)
- **10 ta to'liq she'r** matnlari bilan
- Mavzu bo'yicha filtrlash (Vatan, Tabiat, Mehnat, Sevgi)
- Har bir she'r uchun:
  - Sarlavha
  - Yozilgan yili
  - Mavzular (badge'lar)
  - To'liq matn

### 4. Ilmiy tadqiqotlar (ilmiy.html)
- Maqolalar bo'limi
- Dissertatsiyalar
- Monografiyalar
- Konferensiyalar

### 5. Ta'lim resurslari (talim.html)
- Dars ishlanmalari
- Testlar
- Asarlar tahlili
- Ijodiy topshiriqlar
- Prezentatsiyalar
- Metodikalar

### 6. Multimedia (multimedia.html)
- Video darslar
- Audio she'rlar
- Teatr qo'yilmalari
- Foto galereya

### 7. Interaktiv o'yinlar (interaktiv.html)
- **To'liq ishlaydigan viktorina**
- 5 ta savol
- To'g'ri/noto'g'ri javoblarni ko'rsatish
- Ball hisoblash
- Natijalarni ko'rsatish
- Qaytadan boshlash imkoniyati

### 8. Hamjamiyat (hamjamiyat.html)
- Forum
- Tadbirlar
- Blog
- Tanlovlar

## 🎨 Dizayn tizimi

### Ranglar
```css
--primary: #1a3c5e      /* To'q ko'k */
--secondary: #c9a84c    /* Oltin */
--bg: #f9f6f0          /* Qog'oz rangi */
--text: #2d2d2d        /* Matn rangi */
--card-bg: #ffffff     /* Karta foni */
```

### Shriftlar
- **Playfair Display** - Sarlavhalar uchun (serif)
- **Inter** - Asosiy matn uchun (sans-serif)

### Komponentlar

#### 1. Card
```html
<div class="card">
    <div class="card-icon">📚</div>
    <h3>Sarlavha</h3>
    <p>Tavsif</p>
    <a href="#" class="card-link">Havola →</a>
</div>
```

#### 2. Buttons
- `.btn-primary` - Asosiy tugma (oltin)
- `.btn-secondary` - Ikkilamchi tugma (shaffof)
- `.btn-outline` - Kontur tugma

#### 3. Badge
- `.badge` - Oddiy badge
- `.badge-primary` - Asosiy rang
- `.badge-secondary` - Ikkilamchi rang
- `.badge-outline` - Kontur badge

#### 4. Grid Layouts
- `.grid-2` - 2 ustunli grid
- `.grid-3` - 3 ustunli grid
- `.grid-4` - 4 ustunli grid

#### 5. Alert
- `.alert-success` - Muvaffaqiyat xabari
- `.alert-warning` - Ogohlantirish
- `.alert-error` - Xato xabari
- `.alert-info` - Ma'lumot

## 🔧 JavaScript Funksiyalari

### app.js
- `loadComponents()` - Header va footer yuklash
- `initDarkMode()` - Dark mode ni sozlash
- `toggleDarkMode()` - Dark mode ni yoqish/o'chirish
- `loadFeaturedPoems()` - She'rlarni yuklash
- `initSmoothScroll()` - Smooth scroll
- `initSearch()` - Qidiruv funksiyasi

### data.js
- `getSherlar()` - She'rlarni olish
- `getDostonlar()` - Dostonlarni olish
- `getHayotMalumotlari()` - Hayot ma'lumotlarini olish
- `getQuizSavollari()` - Quiz savollarini olish
- `getSherById(id)` - ID bo'yicha she'r topish
- `getSherlarByMavzu(mavzu)` - Mavzu bo'yicha filtrlash
- `searchContent(query)` - Qidiruv

### router.js
- `Router.navigate(path)` - Sahifaga o'tish
- `Router.getQueryParams()` - URL parametrlarini olish
- `PageLoader.loadPage(url)` - Sahifani dinamik yuklash
- `Breadcrumb.generate()` - Breadcrumb yaratish

### header.js
- `renderHeader()` - Header ni render qilish
- `highlightActiveLink()` - Faol havolani belgilash

### footer.js
- `renderFooter()` - Footer ni render qilish

## 📱 Responsive Breakpoints

```css
/* Desktop */
@media (min-width: 1400px) { ... }

/* Laptop */
@media (max-width: 1399px) { ... }

/* Tablet */
@media (max-width: 768px) { ... }

/* Mobile */
@media (max-width: 480px) { ... }
```

## 🌙 Dark Mode

- LocalStorage da saqlanadi
- Tugma orqali yoqish/o'chirish
- Barcha ranglar avtomatik o'zgaradi
- Icon o'zgaradi: 🌙 ↔ ☀️

## 📊 Ma'lumotlar Strukturasi

### sherlar.json
```json
{
  "id": 1,
  "sarlavha": "She'r nomi",
  "yil": 1934,
  "mavzu": ["Vatan", "Sevgi"],
  "matn": "To'liq matn...",
  "qisqa": "Qisqa tavsif"
}
```

### hayot.json
```json
{
  "yil": 1889,
  "sarlavha": "Tug'ildi",
  "tavsif": "Batafsil tavsif...",
  "rasm": ""
}
```

### quiz.json
```json
{
  "id": 1,
  "savol": "Savol matni?",
  "variantlar": ["A", "B", "C", "D"],
  "togriJavob": 0,
  "tushuntirish": "Tushuntirish..."
}
```

## ✨ Maxsus Effektlar

1. **Hover effektlari** - Kartalar va tugmalar
2. **Smooth scroll** - Sahifa ichida harakatlanish
3. **Transition** - Barcha o'zgarishlar silliq
4. **Shadow** - Kartalar uchun soya
5. **Gradient** - Hero section va timeline
6. **Animation** - Loading spinner

## 🎯 Foydalanuvchi tajribasi (UX)

- ✅ Tez yuklanish
- ✅ Intuitiv navigatsiya
- ✅ Mobil-friendly
- ✅ Accessibility (ARIA labels)
- ✅ Keyboard navigation
- ✅ Loading states
- ✅ Error handling
- ✅ Success messages

## 🔍 SEO Optimizatsiya

- Meta tags
- Semantic HTML
- Alt text lar (rasmlar qo'shilganda)
- Proper heading hierarchy
- Descriptive links

## 📈 Kelajakda qo'shish mumkin

1. Backend integratsiyasi
2. Foydalanuvchi autentifikatsiyasi
3. Izohlar tizimi
4. Qidiruv funksiyasi (to'liq)
5. Rasm galereyasi
6. Video player
7. Audio player
8. PDF yuklab olish
9. Print funksiyasi
10. Social media ulashish

---

**Loyiha to'liq tayyor va ishlatishga tayyor! 🎉**
