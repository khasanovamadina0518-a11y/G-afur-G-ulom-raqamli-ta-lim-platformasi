// ===================================
// G'afur G'ulom Platform
// Header Component v2
// ===================================

function renderHeader() {

    const container = document.getElementById("header-container");
    if (!container) return;

    const isInPages = window.location.pathname.includes("/pages/");
    const base = isInPages ? "../" : "";

    container.innerHTML = `
<header class="site-header">

    <div class="header-content">

        <!-- Logo -->
        <a href="${base}index.html" class="logo">
            📖 G'afur G'ulom
        </a>
        <button class="menu-toggle" id="menuToggle">
    ☰
</button>

        <!-- Desktop Navigation -->
        <nav class="main-nav desktop-nav">

            <ul class="nav-menu">

                <li><a href="${base}index.html">Bosh sahifa</a></li>

                <li><a href="${base}pages/hayot.html">Hayoti</a></li>

                <li><a href="${base}pages/asarlar.html">Asarlari</a></li>

                <li><a href="${base}pages/ilmiy.html">Ilmiy</a></li>

                <li><a href="${base}pages/talim.html">Ta'lim</a></li>

                <li><a href="${base}pages/multimedia.html">Multimedia</a></li>

                <li><a href="${base}pages/interaktiv.html">Interaktiv</a></li>

                <li><a href="${base}pages/hamjamiyat.html">Hamjamiyat</a></li>

            </ul>

        </nav>

        <!-- Right Side -->
        <div class="header-right">

    <div class="search-box">

    <input
        type="text"
        id="searchInput"
        placeholder="Qidirish...">

    <div id="searchResults" class="search-results"></div>

</div>

    <div class="lang-switch">
        <button class="lang-btn active">O'Z</button>
        <button class="lang-btn">EN</button>
    </div>

    <button class="login-btn">
        👤 Kirish
    </button>

   <button
    class="dark-mode-toggle"
    id="darkBtn"
    onclick="window.toggleDarkMode()">
    🌙
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
            <button class="drawer-close" id="drawerClose">✕</button>
        </div>
        <div class="drawer-menu">
            <a href="${base}pages/hayot.html" class="drawer-item">
                <div class="drawer-icon">👤</div>
                <div class="drawer-text">
                    <div class="drawer-title">Hayoti</div>
                    <div class="drawer-desc">Hayot va ijodi</div>
                </div>
            </a>
            <a href="${base}pages/ilmiy.html" class="drawer-item">
                <div class="drawer-icon">📚</div>
                <div class="drawer-text">
                    <div class="drawer-title">Ilmiy</div>
                    <div class="drawer-desc">Ilmiy maqolalar</div>
                </div>
            </a>
            <a href="${base}pages/interaktiv.html" class="drawer-item">
                <div class="drawer-icon">🎮</div>
                <div class="drawer-text">
                    <div class="drawer-title">Interaktiv</div>
                    <div class="drawer-desc">O'yinlar va testlar</div>
                </div>
            </a>
        </div>
        <div class="drawer-footer">
            <button class="drawer-dark-btn" id="drawerDarkBtn" onclick="window.toggleDarkMode()">
                <span class="drawer-btn-icon">🌙</span>
                <span class="drawer-btn-text">Dark Mode</span>
            </button>
            <div class="drawer-lang">
                <span class="drawer-lang-label">Til:</span>
                <button class="drawer-lang-btn active">O'Z</button>
                <button class="drawer-lang-btn">EN</button>
            </div>
            <button class="drawer-login-btn">
                <span>👤</span>
                <span>Kirish</span>
            </button>
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
        <span>Asarlari</span>
    </a>
    <a href="${base}pages/talim.html" class="bottom-nav-item" data-page="talim">
        <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
        <span>Ta'lim</span>
    </a>
    <a href="${base}pages/multimedia.html" class="bottom-nav-item" data-page="multimedia">
        <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        <span>Multimedia</span>
    </a>
    <a href="${base}pages/hamjamiyat.html" class="bottom-nav-item" data-page="hamjamiyat">
        <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        <span>Hamjamiyat</span>
    </a>
</nav>
`;

// Load saved theme
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {

    document.body.classList.add("dark-mode");

    const btn = document.getElementById("darkBtn");

    if (btn) {
        btn.textContent = "☀️";
    }

}

// Mobile Menu Toggle
const menuBtn = document.getElementById("menuToggle");
const drawer = document.getElementById("mobileDrawer");
const drawerOverlay = document.getElementById("drawerOverlay");
const drawerClose = document.getElementById("drawerClose");

if (menuBtn && drawer) {
    menuBtn.addEventListener("click", () => {
        drawer.classList.add("open");
        document.body.style.overflow = "hidden";
    });
}

if (drawerOverlay) {
    drawerOverlay.addEventListener("click", () => {
        drawer.classList.remove("open");
        document.body.style.overflow = "";
    });
}

if (drawerClose) {
    drawerClose.addEventListener("click", () => {
        drawer.classList.remove("open");
        document.body.style.overflow = "";
    });
}

// Set active state for bottom nav
const currentPath = window.location.pathname;
const bottomNavItems = document.querySelectorAll(".bottom-nav-item");
bottomNavItems.forEach(item => {
    const href = item.getAttribute("href");
    if (currentPath.includes(href.replace("../", "")) || 
        (currentPath === "/" && href.includes("index.html"))) {
        item.classList.add("active");
    }
});

// Update drawer dark mode button
const drawerDarkBtn = document.getElementById("drawerDarkBtn");
if (drawerDarkBtn && savedTheme === "dark") {
    drawerDarkBtn.querySelector(".drawer-btn-icon").textContent = "☀️";
    drawerDarkBtn.querySelector(".drawer-btn-text").textContent = "Light Mode";
}

}

if (document.readyState === "loading") {

    document.addEventListener("DOMContentLoaded", renderHeader);

} else {

    renderHeader();

}