# 🚀 Loyihani ishga tushirish bo'yicha qo'llanma

## 1-usul: To'g'ridan-to'g'ri brauzerda ochish

1. `gafur-gulom-platform` papkasiga kiring
2. `index.html` faylini ikki marta bosing
3. Fayl avtomatik ravishda brauzeringizda ochiladi

**Eslatma**: Ba'zi funksiyalar (masalan, JSON fayllarni yuklash) local file protokolida ishlamasligi mumkin. Shuning uchun 2 yoki 3-usulni tavsiya qilamiz.

## 2-usul: Python orqali local server

### Python 3 o'rnatilgan bo'lsa:

```bash
# Loyiha papkasiga o'ting
cd "D:\G'afur G'ulom\gafur-gulom-platform"

# Serverni ishga tushiring
python -m http.server 8000
```

Keyin brauzerda ochish: `http://localhost:8000`

## 3-usul: Node.js orqali local server

### Node.js o'rnatilgan bo'lsa:

```bash
# Loyiha papkasiga o'ting
cd "D:\G'afur G'ulom\gafur-gulom-platform"

# http-server ni o'rnatish (bir marta)
npm install -g http-server

# Serverni ishga tushiring
http-server -p 8000
```

Keyin brauzerda ochish: `http://localhost:8000`

## 4-usul: VS Code Live Server

Agar VS Code ishlatayotgan bo'lsangiz:

1. VS Code da loyihani oching
2. "Live Server" extension ni o'rnating
3. `index.html` faylini oching
4. Pastki o'ng burchakdagi "Go Live" tugmasini bosing

## 🎯 Tekshirish

Loyiha to'g'ri ishlayotganini tekshirish uchun:

1. ✅ Bosh sahifa ochilishi kerak
2. ✅ Header va footer ko'rinishi kerak
3. ✅ 6 ta karta (Asarlari, Ta'lim, Multimedia, va h.k.) ko'rinishi kerak
4. ✅ "Tanlangan she'rlar" bo'limida 4 ta she'r yuklanishi kerak
5. ✅ Dark mode tugmasi ishlashi kerak (🌙/☀️)
6. ✅ Navigatsiya havolalari ishlashi kerak

## 🐛 Muammolarni hal qilish

### She'rlar yuklanmayapti
- Local server ishlatayotganingizni tekshiring (1-usul o'rniga 2 yoki 3-usulni ishlating)
- Browser console ni oching (F12) va xatolarni ko'ring

### CSS ishlamayapti
- Fayl yo'llari to'g'ri ekanligini tekshiring
- Browser cache ni tozalang (Ctrl+Shift+R)

### Dark mode ishlamayapti
- Browser console ni oching va JavaScript xatolarini tekshiring
- LocalStorage yoqilganligini tekshiring

## 📱 Mobil qurilmalarda test qilish

1. Local server ishga tushiring
2. Kompyuter va telefon bir xil Wi-Fi ga ulangan bo'lishi kerak
3. Kompyuteringizning IP manzilini toping:
   - Windows: `ipconfig` (cmd da)
   - Mac/Linux: `ifconfig`
4. Telefon brauzerida oching: `http://[IP_MANZIL]:8000`
   - Masalan: `http://192.168.1.100:8000`

## 🎨 Tavsiya etiladigan brauzerlar

- ✅ Google Chrome (tavsiya etiladi)
- ✅ Mozilla Firefox
- ✅ Microsoft Edge
- ✅ Safari
- ⚠️ Internet Explorer (qo'llab-quvvatlanmaydi)

## 📞 Yordam kerakmi?

Agar muammo yuzaga kelsa:
1. Browser console ni tekshiring (F12)
2. README.md faylini o'qing
3. Barcha fayllar to'g'ri joyda ekanligini tekshiring

---

**Omad tilaymiz! 🎉**
