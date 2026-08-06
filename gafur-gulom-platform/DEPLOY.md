# 🚀 GitHub Pages orqali Deploy qilish

Bu yo'riqnoma G'afur G'ulom platformasini GitHub Pages orqali joylashtirish uchun.

## 📋 Talablar

- GitHub akkaunt
- Git o'rnatilgan (Windows uchun: [Git for Windows](https://git-scm.com/download/win))
- Loyiha fayllari tayyor

## 🔧 1-Qadam: Repository yaratish

1. **GitHub ga kiring**: https://github.com
2. **Yangi repository yarating**:
   - O'ng yuqoridagi `+` → `New repository`
   - **Repository name**: `gafur-gulom-platform`
   - **Description**: "G'afur G'ulom ta'limiy platformasi"
   - **Public** tanlang (GitHub Pages bepul faqat public uchun)
   - `README` ni qo'shMANG (biz allaqachon bor)
   - **Create repository** bosing

## 💻 2-Qadam: Git sozlash

Loyiha papkasida (PowerShell yoki CMD):

```powershell
cd "D:\G'afur G'ulom\gafur-gulom-platform"
```

### Git ni o'rnatish (agar kerak bo'lsa)

```powershell
# Git o'rnatilgan yoki yo'qligini tekshirish
git --version

# Agar xato chiqsa, https://git-scm.com/download/win dan yuklab oling
```

### Git konfiguratsiya

```powershell
git config --global user.name "SIZNING_ISMINGIZ"
git config --global user.email "sizning@email.com"
```

## 📦 3-Qadam: Loyihani Git ga qo'shish

```powershell
# Git repository yaratish
git init

# Barcha fayllarni qo'shish
git add .

# Birinchi commit
git commit -m "Initial commit: G'afur G'ulom platformasi"

# Main branch yaratish
git branch -M main

# GitHub repository ga ulash (SIZNING_ISMINGIZ o'rniga GitHub username)
git remote add origin https://github.com/SIZNING_ISMINGIZ/gafur-gulom-platform.git

# GitHub ga yuklash
git push -u origin main
```

### Parol so'ralsa:

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token (classic)"
3. **Note**: "Gafur Gulom Deploy"
4. **Expiration**: 90 days
5. **Select scopes**: `repo` (barcha checkboxlar)
6. "Generate token"
7. Tokenni nusxalang (bir marta ko'rsatiladi!)
8. Terminal da parol o'rniga tokenni kiriting

## 🌐 4-Qadam: GitHub Pages sozlash

1. **GitHub repository ga o'ting**: 
   ```
   https://github.com/SIZNING_ISMINGIZ/gafur-gulom-platform
   ```

2. **Settings** → **Pages** (chap menyu)

3. **Source** bo'limida:
   - **Branch**: `main` tanlang
   - **Folder**: `/ (root)` tanlang
   - **Save** bosing

4. **GitHub Actions** (tavsiya etiladi):
   - Loyihada `.github/workflows/deploy.yml` fayli bor
   - Har safar `main` branchga push qilganda avtomatik deploy bo'ladi

## ⏰ 5-Qadam: Kutish

- GitHub Pages deploy jarayoni **2-5 daqiqa** davom etadi
- Settings → Pages da URL ko'rinadi:
  ```
  Your site is published at https://SIZNING_ISMINGIZ.github.io/gafur-gulom-platform/
  ```

## ✅ 6-Qadam: Tekshirish

Brauzerda oching:
```
https://SIZNING_ISMINGIZ.github.io/gafur-gulom-platform/
```

### Tekshirish ro'yxati:

- [ ] Bosh sahifa ochiladi
- [ ] Rasm yuklandi (G'afur G'ulom portreti)
- [ ] Menu ishlaydi
- [ ] She'rlar sahifasi ochiladi
- [ ] Dark mode ishlaydi
- [ ] Qidiruv ishlaydi
- [ ] Interaktiv o'yinlar ishlaydi
- [ ] Mobilda responsive dizayn to'g'ri

## 🔄 Yangilanishlar yuklash

Kelajakda o'zgarish qilganingizda:

```powershell
cd "D:\G'afur G'ulom\gafur-gulom-platform"

# O'zgarishlarni saqlash
git add .
git commit -m "Yangilanish tavsifi"
git push

# 2-3 daqiqada GitHub Pages yangilanadi
```

## 🎯 Custom Domain (Ixtiyoriy)

Agar o'z domeningiz bo'lsa (masalan, `gafurgulom.uz`):

1. **DNS sozlamalari** (domen provayderida):
   ```
   Type: CNAME
   Name: www
   Value: SIZNING_ISMINGIZ.github.io
   ```

2. **GitHub Settings → Pages**:
   - **Custom domain**: `www.gafurgulom.uz`
   - **Enforce HTTPS**: ✓ belgilang

3. **CNAME fayl** (loyiha root da):
   ```
   www.gafurgulom.uz
   ```

## 🐛 Muammolar va yechimlar

### Sahifa 404 xatosi

**Muammo**: `https://username.github.io/gafur-gulom-platform/` 404 ko'rsatadi

**Yechim**:
1. Repository nomi to'g'rimi? (harflar, tire)
2. `main` branch bo'lishi kerak
3. 2-5 daqiqa kutish kerak
4. Hard refresh: `Ctrl + Shift + R`

### CSS/JS yuklanmayapti

**Muammo**: Sahifa stilsiz

**Yechim**:
- Barcha yo'llar nisbiy: `./assets/css/main.css` ✓
- Mutlaq yo'llar yo'q: `/assets/css/main.css` ✗
- Browser console tekshiring: `F12`

### Service Worker xatosi

**Muammo**: Console da "Service Worker registration failed"

**Yechim**:
- Bu normal (GitHub Pages HTTPS ishlaydi)
- Localhost da xatolik, GitHub da ishlaydi
- Yoki service worker registratsiyasini o'chirib qo'ying

### Rasm yuklanmayapti

**Muammo**: `gafur-gulom.jpg` ko'rinmayapti

**Yechim**:
- Rasm fayli bor ekanligini tekshiring
- Yo'l to'g'rimi: `./assets/images/gafur-gulom.jpg`
- Fayl nomi kichik harflar bilan

## 📊 GitHub Actions Status

Repository da **Actions** tabini oching:
- ✅ Yashil - Deploy muvaffaqiyatli
- ❌ Qizil - Xatolik, detallarga bosing

## 🎉 Tayyor!

Platformangiz jonli: `https://SIZNING_ISMINGIZ.github.io/gafur-gulom-platform/`

### Keyingi qadamlar:

1. **Kontent qo'shish**: She'rlar, maqolalar
2. **Google Analytics**: Statistika kuzatish
3. **SEO**: Google Search Console
4. **Ijtimoiy tarmoqlar**: Share tugmalari
5. **Feedback**: Foydalanuvchilardan fikr

## 📞 Yordam

Muammo yuzaga kelsa:
- GitHub Discussions: Community support
- GitHub Issues: Bug report
- Email: sizning@email.com

---

**Omad! 🚀**

Platformangiz hozir butun dunyoga ochiq va ishlayapti!
