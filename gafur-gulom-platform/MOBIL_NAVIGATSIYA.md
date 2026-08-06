# 📱 Mobil Navigatsiya Tizimi

## Umumiy Ma'lumot
G'afur G'ulom platformasining mobil navigatsiyasi zamonaviy va qulay foydalanuvchi tajribasini ta'minlaydi.

## 🎨 Dizayn Xususiyatlari

### 1️⃣ Pastki Navigatsiya Bar (Bottom Navigation)
**Joylashuvi:** Ekranning pastki qismida, doimo ko'rinadi

**Bo'limlar (5 ta):**
- 🏠 **Bosh sahifa** - Asosiy sahifa
- 📚 **Asarlari** - She'rlar va asarlar to'plami
- 📖 **Ta'lim** - Ta'limiy materiallar
- ▶️ **Multimedia** - Video va audio materiallar
- 👥 **Hamjamiyat** - Ijtimoiy bo'lim

**Dizayn elementlari:**
- SVG ikonkalar (Lucide icons asosida)
- Kichik matn label
- Aktiv holatda: oltin rang (#d4af37)
- Aktiv bo'limda tepada rangli chiziq
- Smooth animatsiyalar
- Dark mode qo'llab-quvvatlash

### 2️⃣ Drawer Menyu (Hamburger)
**Joylashuvi:** Headerda, o'ng tomondan ochiladi

**Qo'shimcha bo'limlar (3 ta):**
- 👤 **Hayoti** - Hayot va ijodi
- 📚 **Ilmiy** - Ilmiy maqolalar
- 🎮 **Interaktiv** - O'yinlar va testlar

**Dizayn xususiyatlari:**
- Karta uslubida (card-style)
- Har bir element: icon + sarlavha + tavsif
- Yumaloq burchaklar (border-radius: 12px)
- Yengil soyalar (box-shadow)
- 16px padding
- Elementlar orasida 12px bo'shliq
- Smooth slide-in animatsiya
- Backdrop blur effekti

### 3️⃣ Hamburger Tugmasi
**Dizayn:**
- Gradient fon (oltin ranglar)
- 46x46 px o'lcham
- Yumaloq burchaklar (12px)
- Yengil soya
- Active holatda scale animatsiya

## 🎨 Rang Sxemasi

### Light Mode
- **Aksent rang:** #d4af37 (oltin/sariq)
- **Fon:** #f9f6f0
- **Karta fon:** #ffffff
- **Matn:** #2d2d2d
- **Yorug' matn:** #666666

### Dark Mode
- **Aksent rang:** #d4af37 (oltin/sariq)
- **Fon:** #0f1923
- **Karta fon:** #1a2d3d
- **Matn:** #e8e0d0
- **Yorug' matn:** #a89f91

## 📐 Responsive Breakpoints

```css
/* Mobile (768px va undan kichik) */
- Pastki navigatsiya ko'rinadi
- Drawer menyu faol
- Desktop navigatsiya yashiriladi

/* Kichik mobile (480px va undan kichik) */
- Header elementlari soddalashtiriladi
- Qidiruv, til, kirish tugmalari yashiriladi
```

## ⚙️ Texnik Tafsilotlar

### Fayllar
1. **components/header.js** - Header komponenti va navigatsiya logikasi
2. **assets/css/responsive.css** - Mobil navigatsiya stillari

### Asosiy Funksiyalar

```javascript
// Drawer ochish/yopish
menuToggle.addEventListener("click") → drawer.classList.add("open")
drawerClose.addEventListener("click") → drawer.classList.remove("open")
drawerOverlay.addEventListener("click") → drawer.classList.remove("open")

// Aktiv sahifa belgilash
currentPath.includes(href) → item.classList.add("active")
```

### CSS Sinflar
- `.mobile-bottom-nav` - Pastki navigatsiya konteyner
- `.bottom-nav-item` - Navigatsiya elementi
- `.bottom-nav-item.active` - Aktiv holat
- `.mobile-drawer` - Drawer konteyner
- `.drawer-content` - Drawer mazmuni
- `.drawer-item` - Drawer menyu elementi

## 📱 Mobil Optimizatsiya

### Performance
- `will-change: transform` animatsiyalar uchun
- CSS transitions (0.3s ease)
- Hardware acceleration (transform)

### UX Yaxshilanishlar
- Touch-friendly o'lchamlar (44px+)
- Visual feedback (scale animatsiyalar)
- Safe area padding (iPhone notch)
- Backdrop blur (zamonaviy ko'rinish)
- Scroll locking (drawer ochiq bo'lganda)

### Accessibility
- Semantic HTML
- ARIA labels (qo'shish kerak)
- Keyboard navigation qo'llab-quvvatlash
- High contrast dark mode

## 🚀 Ishlatish

### Desktop
- Standard header navigatsiya ishlatiladi
- Barcha 8 ta bo'lim ko'rinadi

### Mobile (< 768px)
1. **Asosiy 5 ta bo'lim** - Pastki navigatsiyada
2. **Qo'shimcha 3 ta bo'lim** - Hamburger menyuda
3. Hamburger tugmasini bosing → Drawer ochiladi
4. Kerakli bo'limni tanlang
5. Drawer avtomatik yopiladi

## 🔄 Yangilanishlar

### Versiya 2.0 (Joriy)
- ✅ Pastki navigatsiya bar qo'shildi
- ✅ Drawer menyu yaratildi
- ✅ Karta uslubida dizayn
- ✅ SVG ikonkalar
- ✅ Dark mode qo'llab-quvvatlash
- ✅ Smooth animatsiyalar
- ✅ Active state indicator

### Keyingi Rejalar
- [ ] ARIA labels qo'shish
- [ ] Keyboard navigation
- [ ] Gesture support (swipe)
- [ ] PWA bottom nav integration

## 📞 Muammolarni Hal Qilish

### Pastki navigatsiya ko'rinmayapti
- Ekran kengligi 768px dan kichikligini tekshiring
- Browser cache tozalang (Ctrl+Shift+R)
- Console'da xatolarni tekshiring

### Drawer ochilmayapti
- JavaScript yuklanganligi tekshiring
- Event listener'lar qo'shilganligini tekshiring
- z-index konfliktlarini tekshiring

### Dark mode ishlamayapti
- localStorage'da theme kalit mavjudligini tekshiring
- CSS o'zgaruvchilari to'g'ri o'rnatilganligini tekshiring

## 🎯 Optimal Foydalanish

Mobil qurilmalarda optimal tajriba uchun:
- **Chrome/Safari** brauzerlaridan foydalaning
- **WiFi** ulanishini ta'minlang
- **JavaScript** yoqilganligini tekshiring
- **Zamonaviy brauzer** versiyasini o'rnating

---

**Muallif:** Kiro AI  
**Sana:** 2026-08-04  
**Versiya:** 2.0
