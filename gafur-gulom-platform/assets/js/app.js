// ===================================
// Main Application JavaScript
// ===================================

// DOMContentLoaded Event
document.addEventListener('DOMContentLoaded', function() {
    console.log("G'afur G'ulom platformasi yuklandi");

    // Komponentlarni yuklash
    loadComponents();

    // Hero portrait
    setupHeroPortrait();

    // Statistics — bosh sahifa dinamik statistikasi
    if (document.getElementById('home-stats-panel')) {
        initHomeStatistics();
    } else if (document.querySelector('.stat-number')) {
        animateStats();
        loadStatistics();
    }

    // Today's poem widget
    if (document.getElementById('poem-title')) {
        loadTodaysPoem();

        const newPoemBtn = document.getElementById('new-poem-btn');
        if (newPoemBtn) {
            newPoemBtn.addEventListener('click', loadNewPoem);
        }
    }

    // She'rlarni yuklash
    if (document.getElementById('poems-container')) {
        loadFeaturedPoems();
    }

    // Smooth scroll
    initSmoothScroll();

});

// ===================================
// Komponentlarni yuklash funksiyasi
// ===================================
function loadComponents() {
    // Header is initialized by components/header.js
    
    // Footer komponentini yuklash
    if (typeof renderFooter === 'function') {
        renderFooter();
    }
    
    console.log('Komponentlar yuklandi');
}

// ===================================
// Dark Mode - header.js da boshqariladi
// ===================================

// ===================================
// She'rlarni yuklash funksiyasi
// ===================================
async function loadFeaturedPoems() {
    const container = document.getElementById('poems-container');
    if (!container) return;
    
    try {
        // Loading spinner ko'rsatish
        container.innerHTML = '<div class="spinner"></div>';
        
        // She'rlarni olish
        const poems = await getSherlar();
        
        // Faqat birinchi 4 ta she'rni ko'rsatish
        const featuredPoems = poems.slice(0, 4);
        
        // She'rlarni render qilish
        container.innerHTML = featuredPoems.map(poem => `
            <div class="card">
                <h3>${poem.sarlavha}</h3>
                <div class="badge-group">
                    ${poem.mavzu.map(m => `<span class="badge">${m}</span>`).join('')}
                </div>
                <p class="text-light">${poem.qisqa}</p>
                <p class="text-light"><strong>Yil:</strong> ${poem.yil}</p>
                <a href="pages/asarlar.html?id=${poem.id}" class="card-link">To'liq o'qish →</a>
            </div>
        `).join('');
        
        console.log('She\'rlar yuklandi:', featuredPoems.length);
    } catch (error) {
        console.error('She\'rlarni yuklashda xatolik:', error);
        container.innerHTML = `
            <div class="alert alert-error">
                She'rlarni yuklashda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.
            </div>
        `;
    }
}

// ===================================
// Statistics Counter Animation
// ===================================
function animateStats(root) {
    const statNumbers = (root || document).querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'), 10);
                if (Number.isNaN(target)) {
                    observer.unobserve(entry.target);
                    return;
                }
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => observer.observe(stat));
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target > 0 ? target / 50 : 0;
    const duration = 2000;
    const stepTime = duration / 50;
    const suffix = element.getAttribute('data-suffix') || '';

    if (target <= 0) {
        element.textContent = String(target) + suffix;
        return;
    }

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + suffix;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + suffix;
        }
    }, stepTime);
}

async function initHomeStatistics() {
    const panel = document.getElementById('home-stats-panel');
    if (!panel) return;

    panel.querySelectorAll('.stat-number').forEach(function (el) {
        el.textContent = '—';
        el.removeAttribute('data-target');
        el.removeAttribute('data-suffix');
    });

    try {
        if (typeof getPlatformStatistics !== 'function') {
            throw new Error('getPlatformStatistics() mavjud emas');
        }

        const stats = await getPlatformStatistics();
        if (!stats) {
            throw new Error('Statistika ma\'lumotlari qaytmadi');
        }

        panel.querySelectorAll('.stat-number[data-stat-key]').forEach(function (el) {
            const key = el.getAttribute('data-stat-key');
            const value = Number(stats[key]);
            const safeValue = Number.isFinite(value) ? value : 0;
            el.setAttribute('data-target', String(safeValue));
            el.textContent = '0';
        });

        animateStats(panel);
    } catch (error) {
        console.error('Bosh sahifa statistikasi yuklanmadi:', error);
        panel.querySelectorAll('.stat-number').forEach(function (el) {
            el.textContent = '—';
        });
    }
}

// ===================================
// Today's Poem Widget
// ===================================
let currentPoemIndex = 0;
let todaysPoems = [];

async function loadTodaysPoem() {
    try {
        todaysPoems = (await getSherlar()).filter(poem => poem.matn);

        if (todaysPoems.length > 0) {
            displayRandomPoem();
        }
    } catch (error) {
        console.error('Bugungi she\'rni yuklashda xatolik:', error);
        document.getElementById('poem-title').textContent = 'Xatolik yuz berdi';
        document.getElementById('poem-excerpt').textContent = 'She\'rni yuklashda muammo yuz berdi.';
    }
}

function displayRandomPoem() {
   if (todaysPoems.length === 0) return;

currentPoemIndex = Math.floor(Math.random() * todaysPoems.length);

const poem = todaysPoems[currentPoemIndex];
    
    // She'r nomini ko'rsatish
    document.getElementById('poem-title').textContent = poem.sarlavha;
    
    // Birinchi 4 misrani olish
    const lines = poem.matn.split('\n').filter(line => line.trim() !== '');
    const excerpt = lines.slice(0, 4).join('\n');
    document.getElementById('poem-excerpt').textContent = excerpt;
    
    // To'liq o'qish havolasini yangilash
    const readFullBtn = document.getElementById('read-full-btn');
    readFullBtn.href = `pages/asarlar.html?id=${poem.id}`;
}

function loadNewPoem() {
    displayRandomPoem();
}

// ===================================
// Hero Portrait Fallback
// ===================================
function setupHeroPortrait() {
    const portrait = document.getElementById('hero-portrait');
    if (portrait) {
        // Agar rasm yuklanmasa, placeholder ko'rsatish
        portrait.onerror = function() {
            this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%231a3c5e" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="120" fill="white"%3EG.G%3C/text%3E%3C/svg%3E';
        };
    }
}

// ===================================
// Smooth Scroll Funksiyasi
// ===================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href || href === '#' || !href.startsWith('#')) return;

            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===================================
// Utility Funksiyalar
// ===================================

// Sahifani yuqoriga scroll qilish
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Loading holatini ko'rsatish
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="spinner"></div>';
    }
}

// Xatolikni ko'rsatish
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="alert alert-error">
                ${message}
            </div>
        `;
    }
}

// Muvaffaqiyatli xabarni ko'rsatish
function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="alert alert-success">
                ${message}
            </div>
        `;
    }
}
// ===================================
// Statistikalarni yuklash
// ===================================
async function loadStatistics() {

    const poems = document.getElementById("poems-count");
    const doston = document.getElementById("doston-count");
    const ilmiy = document.getElementById("ilmiy-count");
    const quiz = document.getElementById("quiz-count");

    if (!poems || !doston || !ilmiy || !quiz) {
        return;
    }

    try {
        const stats = typeof getPlatformStatistics === 'function'
            ? await getPlatformStatistics()
            : null;

        if (stats) {
            poems.textContent = stats.poems + (poems.getAttribute('data-suffix') || '');
            doston.textContent = stats.dostonlar;
            ilmiy.textContent = stats.scientificArticles;
            quiz.textContent = stats.quizQuestions;
            return;
        }

        const [sherlar, dostonlar, ilmiyData, quizData] = await Promise.all([
            getSherlar(),
            getDostonlar(),
            getIlmiy(),
            getQuizlar()
        ]);

        poems.textContent = sherlar.length + (poems.getAttribute('data-suffix') || '');
        doston.textContent = dostonlar.length;
        ilmiy.textContent = ilmiyData.length;
        quiz.textContent = quizData.length;

    } catch (err) {
        console.error("Statistika yuklanmadi:", err);
    }
}
// ===================================
// Export funksiyalar (agar kerak bo'lsa)
// ===================================
window.scrollToTop = scrollToTop;
window.showLoading = showLoading;
window.showError = showError;
window.showSuccess = showSuccess;
// Global Search — global-search.js da (header orqali yuklanadi)