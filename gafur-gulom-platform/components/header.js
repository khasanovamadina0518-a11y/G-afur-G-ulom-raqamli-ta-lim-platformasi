// ===================================
// G'afur G'ulom Platform
// Header Component v2
// ===================================

// Dark mode — barcha sahifalarda ishlaydi (index.html dagi inline versiyani almashtiradi)
window.toggleDarkMode = function () {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    const btn = document.getElementById('darkBtn');
    const icon = btn && btn.querySelector('.dark-mode-toggle__icon');
    if (icon) icon.textContent = isDark ? '☀️' : '🌙';

    const drawerDarkBtn = document.getElementById('drawerDarkBtn');
    if (drawerDarkBtn) {
        const icon = drawerDarkBtn.querySelector('.drawer-btn-icon');
        const text = drawerDarkBtn.querySelector('.drawer-btn-text');
        if (icon) icon.textContent = isDark ? '☀️' : '🌙';
        if (text) text.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    }
};

let headerInitialized = false;

function renderHeader() {

    if (headerInitialized) return;

    const container = document.getElementById('header-container');
    if (!container) return;

    const base = '';

    container.innerHTML = `
<header class="site-header site-header--premium">

    <div class="header-content">

        <!-- Brand lockup (reference layout) -->
        <a href="${base}index.html" class="brand-lockup" aria-label="G'afur G'ulom — Bosh sahifa">
            <img
                class="brand-lockup__avatar"
                src="${base}assets/images/gafur-gulom.jpg"
                alt=""
                width="44"
                height="44"
                onerror="this.style.display='none'">
            <span class="brand-lockup__text">
                <span class="brand-lockup__title">G'AFUR G'ULOM</span>
                <span class="brand-lockup__subtitle">RAQAMLI TA'LIM PLATFORMASI</span>
            </span>
        </a>

        <button class="menu-toggle" id="menuToggle" type="button" aria-label="Menyuni ochish" aria-expanded="false">
            <span aria-hidden="true">☰</span>
        </button>

        <!-- Desktop Navigation — original platform IA (visual layout only modernized) -->
        <nav class="main-nav desktop-nav" aria-label="Asosiy navigatsiya">
            <ul class="nav-menu">
                <li><a href="${base}index.html">Bosh sahifa</a></li>
                <li><a href="${base}pages/hayot.html">Hayoti</a></li>
                <li><a href="${base}pages/asarlar.html">Elektron kutubxona</a></li>
                <li><a href="${base}pages/multimedia.html">Video darslar</a></li>
                <li><a href="${base}pages/interaktiv-oyinlar.html">Interaktiv</a></li>
                <li><a href="${base}pages/interaktiv.html">Testlar</a></li>
                <li><a href="${base}pages/ai-yordamchi.html">AI yordamchi</a></li>
                <li><a href="${base}pages/ilmiy.html">Ilmiy</a></li>
                <li><a href="${base}pages/talim.html">Ta'lim</a></li>
            </ul>
        </nav>

        <!-- Right actions -->
        <div class="header-right">

            <div class="search-expand" id="searchExpand">
                <button
                    class="header-icon-btn search-toggle"
                    id="searchToggle"
                    type="button"
                    aria-label="Qidirish"
                    aria-expanded="false"
                    aria-controls="searchInput">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                </button>
                <div class="search-box" id="searchBox">
                    <input
                        type="search"
                        id="searchInput"
                        placeholder="Qidirish..."
                        autocomplete="off"
                        aria-label="Qidirish">
                    <div id="searchResults" class="search-results"></div>
                </div>
            </div>

            <div class="lang-switch lang-switch--compact">
                <button class="lang-picker" type="button" aria-label="Tilni tanlash">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                    <span class="lang-picker__label">UZ</span>
                    <svg class="lang-picker__chevron" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
                </button>
                <div class="lang-switch__options">
                    <button class="lang-btn active" type="button" data-lang="uz">O'Z</button>
                    <button class="lang-btn" type="button" data-lang="en">EN</button>
                </div>
            </div>

            <a href="${base}pages/dashboard.html" class="login-btn">Kirish</a>

            <button
                class="header-icon-btn dark-mode-toggle"
                id="darkBtn"
                type="button"
                aria-label="Tungi rejim"
                onclick="window.toggleDarkMode()">
                <span class="dark-mode-toggle__icon" aria-hidden="true">🌙</span>
            </button>
        </div>

    </div>

</header>

<!-- Mobile Drawer Menu -->
<div class="mobile-drawer" id="mobileDrawer">
    <div class="drawer-overlay" id="drawerOverlay"></div>
    <div class="drawer-content">
        <div class="drawer-header">
            <h3>Menyu</h3>
            <button class="drawer-close" id="drawerClose" type="button" aria-label="Menyuni yopish">✕</button>
        </div>
        <div class="drawer-menu">
            <a href="${base}index.html" class="drawer-item">
                <div class="drawer-icon">🏠</div>
                <div class="drawer-text">
                    <div class="drawer-title">Bosh sahifa</div>
                    <div class="drawer-desc">Asosiy sahifa</div>
                </div>
            </a>
            <a href="${base}pages/hayot.html" class="drawer-item">
                <div class="drawer-icon">👤</div>
                <div class="drawer-text">
                    <div class="drawer-title">Hayoti</div>
                    <div class="drawer-desc">Hayot va ijodi</div>
                </div>
            </a>
            <a href="${base}pages/asarlar.html" class="drawer-item">
                <div class="drawer-icon">📚</div>
                <div class="drawer-text">
                    <div class="drawer-title">Asarlari</div>
                    <div class="drawer-desc">Elektron kutubxona</div>
                </div>
            </a>
            <a href="${base}pages/multimedia.html" class="drawer-item">
                <div class="drawer-icon">🎬</div>
                <div class="drawer-text">
                    <div class="drawer-title">Video darslar</div>
                    <div class="drawer-desc">Video va audio</div>
                </div>
            </a>
            <a href="${base}pages/interaktiv-oyinlar.html" class="drawer-item">
                <div class="drawer-icon">🎮</div>
                <div class="drawer-text">
                    <div class="drawer-title">Interaktiv</div>
                    <div class="drawer-desc">Viktorinalar va o'yinlar</div>
                </div>
            </a>
            <a href="${base}pages/interaktiv.html" class="drawer-item">
                <div class="drawer-icon">📝</div>
                <div class="drawer-text">
                    <div class="drawer-title">Testlar</div>
                    <div class="drawer-desc">O'yinlar va testlar</div>
                </div>
            </a>
            <a href="${base}pages/ai-yordamchi.html" class="drawer-item">
                <div class="drawer-icon">🤖</div>
                <div class="drawer-text">
                    <div class="drawer-title">AI yordamchi</div>
                    <div class="drawer-desc">Sun'iy intellekt yordam</div>
                </div>
            </a>
            <a href="${base}pages/ilmiy.html" class="drawer-item">
                <div class="drawer-icon">🔬</div>
                <div class="drawer-text">
                    <div class="drawer-title">Ilmiy</div>
                    <div class="drawer-desc">Ilmiy maqolalar</div>
                </div>
            </a>
            <a href="${base}pages/talim.html" class="drawer-item">
                <div class="drawer-icon">🎓</div>
                <div class="drawer-text">
                    <div class="drawer-title">Ta'lim</div>
                    <div class="drawer-desc">Dars materiallari</div>
                </div>
            </a>
        </div>
        <div class="drawer-footer">
            <button class="drawer-dark-btn" id="drawerDarkBtn" type="button" onclick="window.toggleDarkMode()">
                <span class="drawer-btn-icon">🌙</span>
                <span class="drawer-btn-text">Dark Mode</span>
            </button>
            <div class="drawer-lang">
                <span class="drawer-lang-label">Til:</span>
                <button class="drawer-lang-btn active" type="button">O'Z</button>
                <button class="drawer-lang-btn" type="button">EN</button>
            </div>
            <a href="${base}pages/dashboard.html" class="drawer-login-btn">
                <span>👤</span>
                <span>Kirish</span>
            </a>
        </div>
    </div>
</div>

<!-- Mobile Bottom Navigation -->
<nav class="mobile-bottom-nav">
    <a href="${base}index.html" class="bottom-nav-item" data-page="home">
        <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        <span>Bosh sahifa</span>
    </a>
    <a href="${base}pages/asarlar.html" class="bottom-nav-item" data-page="asarlar">
        <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
        <span>Elektron kutubxona</span>
    </a>
    <a href="${base}pages/talim.html" class="bottom-nav-item" data-page="talim">
        <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
        <span>Ta'lim</span>
    </a>
    <a href="${base}pages/multimedia.html" class="bottom-nav-item" data-page="multimedia">
        <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        <span>Video darslar</span>
    </a>
    <a href="${base}pages/ai-yordamchi.html" class="bottom-nav-item" data-page="ai-yordamchi">
        <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        <span>AI yordamchi</span>
    </a>
</nav>
`;

    // Saqlangan mavzuni qo'llash
    const savedTheme = localStorage.getItem('theme');
    const isDarkTheme = savedTheme === 'dark';

    document.body.classList.toggle('dark-mode', isDarkTheme);

    const btn = document.getElementById('darkBtn');
    const icon = btn && btn.querySelector('.dark-mode-toggle__icon');
    if (icon) icon.textContent = isDarkTheme ? '☀️' : '🌙';

    const drawerDarkBtn = document.getElementById('drawerDarkBtn');
    if (drawerDarkBtn) {
        const drawerIcon = drawerDarkBtn.querySelector('.drawer-btn-icon');
        const drawerText = drawerDarkBtn.querySelector('.drawer-btn-text');
        if (drawerIcon) drawerIcon.textContent = isDarkTheme ? '☀️' : '🌙';
        if (drawerText) drawerText.textContent = isDarkTheme ? 'Light Mode' : 'Dark Mode';
    }

    initHeaderSearchExpand();
    setActiveNavLink();
    initLangPicker();

    // Mobil drawer
    const menuBtn = document.getElementById('menuToggle');
    const drawer = document.getElementById('mobileDrawer');
    const drawerOverlay = document.getElementById('drawerOverlay');
    const drawerClose = document.getElementById('drawerClose');

    function closeMobileDrawer() {
        if (!drawer) return;
        drawer.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (menuBtn && drawer) {
        menuBtn.addEventListener('click', () => {
            drawer.classList.add('open');
            document.body.style.overflow = 'hidden';
        });
    }

    if (drawerOverlay) {
        drawerOverlay.addEventListener('click', closeMobileDrawer);
    }

    if (drawerClose) {
        drawerClose.addEventListener('click', closeMobileDrawer);
    }

    document.querySelectorAll('.drawer-item').forEach(item => {
        item.addEventListener('click', closeMobileDrawer);
    });

    // Pastki navigatsiyada aktiv sahifani belgilash
    const currentPath = window.location.pathname;
    const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
    bottomNavItems.forEach(item => {
        const href = item.getAttribute('href');
        const normalizedHref = href.replace(/^\.\.\//, '');

        if (normalizedHref.endsWith('index.html')) {
            if (currentPath.endsWith('/') || currentPath.endsWith('/index.html') || /\/index\.html$/.test(currentPath)) {
                item.classList.add('active');
            }
            return;
        }

        if (currentPath.includes(normalizedHref)) {
            item.classList.add('active');
        }
    });

    headerInitialized = true;
}

function initHeaderSearchExpand() {
    const expand = document.getElementById('searchExpand');
    const toggle = document.getElementById('searchToggle');
    const input = document.getElementById('searchInput');
    const box = document.getElementById('searchBox');

    if (!expand || !toggle || !input) return;

    function openSearch() {
        expand.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
        input.focus();
    }

    function closeSearch() {
        expand.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (expand.classList.contains('is-open')) {
            closeSearch();
        } else {
            openSearch();
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-expand')) {
            closeSearch();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSearch();
    });

    if (box) {
        box.addEventListener('click', (e) => e.stopPropagation());
    }
}

function setActiveNavLink() {
    const path = window.location.pathname;
    const file = path.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.nav-menu a');

    links.forEach(link => {
        const href = link.getAttribute('href') || '';
        const target = href.split('/').pop() || 'index.html';
        link.classList.remove('active');

        const onHome = file === 'index.html' || file === '' || path.endsWith('/');
        const isHomeLink = target === 'index.html';

        if (isHomeLink && onHome) {
            link.classList.add('active');
            return;
        }

        if (!isHomeLink && file === target) {
            link.classList.add('active');
        }
    });
}

function initLangPicker() {
    const wrap = document.querySelector('.lang-switch--compact');
    const picker = document.querySelector('.lang-picker');
    const label = document.querySelector('.lang-picker__label');
    const buttons = document.querySelectorAll('.lang-switch__options .lang-btn');

    if (!wrap || !picker) return;

    picker.addEventListener('click', (e) => {
        e.stopPropagation();
        wrap.classList.toggle('is-open');
    });

    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (label) {
                label.textContent = btn.dataset.lang === 'en' ? 'EN' : 'UZ';
            }
            wrap.classList.remove('is-open');
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.lang-switch--compact')) {
            wrap.classList.remove('is-open');
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderHeader);
} else {
    renderHeader();
}
