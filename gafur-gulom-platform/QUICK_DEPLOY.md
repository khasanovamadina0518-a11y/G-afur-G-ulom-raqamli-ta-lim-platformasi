# ⚡ Tezkor Deploy Yo'riqnomasi

5 daqiqada GitHub Pages ga deploy qiling!

## 🚀 Buyruqlar Ketma-ketligi

PowerShell yoki CMD da quyidagi buyruqlarni ketma-ket bajaring:

```powershell
# 1. Loyiha papkasiga o'ting
cd "D:\G'afur G'ulom\gafur-gulom-platform"

# 2. Git ni ishga tushiring
git init

# 3. Barcha fayllarni qo'shing
git add .

# 4. Birinchi commit
git commit -m "Initial commit: G'afur G'ulom ta'limiy platformasi"

# 5. Main branch yarating
git branch -M main

# 6. GitHub repository ga ulang (O'ZGARTIRING!)
git remote add origin https://github.com/SIZNING_ISMINGIZ/gafur-gulom-platform.git

# 7. GitHub ga yuklang
git push -u origin main
```

## ⚠️ MUHIM: O'zgartiring!

6-qadamda `SIZNING_ISMINGIZ` ni o'z GitHub username ingiz bilan almashtiring!

```bash
# Misol:
git remote add origin https://github.com/azamatdev/gafur-gulom-platform.git
```

## 🔐 Agar parol so'ralsa

### 1. Personal Access Token yarating:

1. GitHub.com ga kiring
2. Settings → Developer settings → Personal access tokens → Tokens (classic)
3. "Generate new token (classic)"
4. Note: `Gafur Gulom Deploy`
5. Expiration: `90 days`
6. Scope: `repo` (barcha belgilang)
7. "Generate token"
8. **Tokenni nusxalang!** (bir marta ko'rsatiladi)

### 2. Terminal da:

- Username: `SIZNING_ISMINGIZ`
- Password: **Token** ni kiriting (parol emas!)

## 🌐 GitHub Pages Sozlash

1. **GitHub repository ga o'ting**:
   ```
   https://github.com/SIZNING_ISMINGIZ/gafur-gulom-platform
   ```

2. **Settings** → **Pages**

3. **Source**:
   - Branch: `main`
   - Folder: `/ (root)`
   - **Save**

4. **Kutish**: 2-5 daqiqa

5. **URL ko'rinadi**:
   ```
   ✅ Your site is published at https://SIZNING_ISMINGIZ.github.io/gafur-gulom-platform/
   ```

## ✅ Tekshirish

Brauzerda oching:
```
https://SIZNING_ISMINGIZ.github.io/gafur-gulom-platform/
```

### Ishlayaptimi?

- [x] Bosh sahifa ochiladi
- [x] Rasm ko'rinadi
- [x] Dark mode ishlaydi
- [x] Menu ishlaydi
- [x] She'rlar ochiladi

## 🔄 Yangilanish

Kelajakda o'zgarish qilsangiz:

```powershell
cd "D:\G'afur G'ulom\gafur-gulom-platform"
git add .
git commit -m "Yangilanish tavsifi"
git push
```

**2-3 daqiqada yangilanadi!**

## 🐛 Xatolik?

### "Repository not found"
- GitHub da repository yarating!
- Repository nomi: `gafur-gulom-platform`
- Public bo'lsin

### "Permission denied"
- Personal Access Token ishlatayapsizmi?
- Token scope da `repo` belgilanganmi?

### "Nothing to commit"
- `git status` tekshiring
- Fayllar qo'shilganmi?

### "Connection refused"
- Internet ulanishini tekshiring
- GitHub ochiq yoki yo'qligini tekshiring

## 📞 Yordam Kerakmi?

1. CHECK.md - Barcha tekshiruvlar
2. DEPLOY.md - To'liq yo'riqnoma
3. README.md - Loyiha hujjati

---

## 🎉 Tayyor!

Platformangiz jonli: `https://SIZNING_ISMINGIZ.github.io/gafur-gulom-platform/`

**Omad! 🚀**
