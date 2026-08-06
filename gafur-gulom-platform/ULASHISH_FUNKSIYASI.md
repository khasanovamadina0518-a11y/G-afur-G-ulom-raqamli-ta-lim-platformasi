# She'rni Ulashish Funksiyasi

## ✅ Qo'shilgan xususiyatlar

### 1. 🔗 Ulashish Tugmasi
- Har bir she'rning modal oynasiga **"🔗 Ulashish"** tugmasi qo'shildi
- Tugma modal actions qatorining birinchi o'rnida joylashgan

### 2. 📱 Web Share API (Mobil va Yangi Brauzerlar)
Agar brauzer Web Share API ni qo'llab-quvvatlasa:
- **Native ulashish oynasi** ochiladi
- Foydalanuvchi o'zi xohlagan ilova orqali ulashishi mumkin:
  - WhatsApp
  - Telegram
  - Facebook
  - Email
  - va boshqalar

Ulashiladigan ma'lumotlar:
```
Sarlavha: [She'r nomi] - G'afur G'ulom
Matn: She'r nomi, yili, birinchi 2 misra
URL: Bevosita she'rga havola
```

### 3. 📋 Clipboard Fallback (Eski Brauzerlar)
Agar brauzer Web Share API ni qo'llab-quvvatlamasa:
- She'r ma'lumoti va havolasi **avtomatik clipboard ga nusxa olinadi**
- Ekranning pastki o'ng burchagida **"Havola nusxa olindi! ✓"** xabari ko'rsatiladi
- Xabar 3 soniyadan keyin avtomatik yo'qoladi

### 4. 🔗 Deep Linking
Ulashilgan havola orqali kirilganda:
- Sahifa avtomatik ochiladi
- Tegishli she'r modali avtomatik ochiladi
- URL formatı: `http://localhost:8000/pages/asarlar.html?poem=11`

## 🎨 Dizayn

### Notification Stili
```css
- Position: Fixed, bottom-right
- Background: Success green / Error red
- Shadow: 3D ko'rinishi
- Animation: Fade in/out + slide up
- Duration: 3 soniya
```

## 💻 Texnik Detalllar

### Web Share API Check
```javascript
if (navigator.share) {
    // Modern brauzer - native ulashish
    navigator.share({...})
} else {
    // Eski brauzer - clipboard fallback
    navigator.clipboard.writeText(...)
}
```

### URL Parameters
```javascript
// URL dan poem ID ni olish
const urlParams = new URLSearchParams(window.location.search);
const poemId = urlParams.get('poem');
```

## 📱 Qo'llab-quvvatlanadigan Brauzerlar

### Web Share API (Native ulashish)
✅ Chrome/Edge 89+ (Android/Mobile)
✅ Safari 12.1+ (iOS/macOS)
✅ Opera 76+ (Android)
❌ Firefox (hozircha qo'llab-quvvatlamaydi)
❌ Desktop Chrome/Edge (faqat HTTPS da ishlaydi)

### Clipboard API (Fallback)
✅ Barcha zamonaviy brauzerlar
✅ Chrome 63+
✅ Firefox 53+
✅ Safari 13.1+
✅ Edge 79+

## 🧪 Test Qilish

### 1. Mobil qurilmada (Native ulashish)
```
1. Saytni mobil qurilmada oching
2. Asarlar sahifasiga o'ting
3. Biror she'rni oching
4. "🔗 Ulashish" tugmasini bosing
5. Native ulashish oynasi ochilishi kerak
6. WhatsApp/Telegram ga ulashing
```

### 2. Desktop brauzerda (Clipboard fallback)
```
1. Saytni desktop da oching
2. Asarlar sahifasiga o'ting
3. Biror she'rni oching
4. "🔗 Ulashish" tugmasini bosing
5. "Havola nusxa olindi!" xabari ko'rinishi kerak
6. Ctrl+V bilan havolani qo'yib ko'ring
```

### 3. Deep Link Test
```
1. She'rni ulashing (havola oling)
2. Yangi tab ochib havolani kiriting
3. Sahifa ochilishi va avtomatik she'r modali ochilishi kerak
```

## 📁 O'zgartirilgan Fayllar

### 1. `pages/asarlar.html`
- ✅ Share tugmasi qo'shildi
- ✅ Notification CSS qo'shildi

### 2. `pages/asarlar-page.js`
- ✅ `sharePoem()` funksiyasi
- ✅ `showNotification()` funksiyasi
- ✅ `checkUrlParams()` funksiyasi
- ✅ Share button event listener

## 🎯 Foydalanuvchi Tajribasi

### Mobil Foydalanuvchi
1. She'rni ochadi
2. "Ulashish" tugmasini bosadi
3. Native ulashish menyusi ochiladi
4. O'zi xohlagan ilovani tanlaydi
5. She'r ulashiladi ✅

### Desktop Foydalanuvchi
1. She'rni ochadi
2. "Ulashish" tugmasini bosadi
3. "Havola nusxa olindi!" xabari ko'rinadi
4. Istalgan joyga Ctrl+V qiladi
5. Havola ulashiladi ✅

### Qabul Qiluvchi
1. Havolani oladi
2. Havolani ochadi
3. Sahifa yuklanadi va she'r avtomatik ochiladi ✅

## 🔮 Kelajak Rejalari

- [ ] QR kod generatsiya qilish
- [ ] Ijtimoiy tarmoqlar uchun maxsus formatlar
- [ ] She'rni rasm sifatida ulashish (Canvas)
- [ ] PDF eksport
- [ ] Audio ulashish (audio mavjud bo'lsa)

---

**Muallif:** Kiro AI  
**Sana:** 2026-07-02  
**Versiya:** 1.0
