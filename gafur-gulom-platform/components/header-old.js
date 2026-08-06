// Header Component - MINIMAL (Dark mode inline da)
function renderHeader() {
    const container = document.getElementById('header-container');
    if (!container) return;
    
    const isInPages = window.location.pathname.includes('/pages/');
    const base = isInPages ? '../' : '';
    
    container.innerHTML = `
    <header class="site-header">
        <div class="header-content">

            <a href="${base}index.html" class="logo">
                📖 G'afur G'ulom
            </a>

            <div class="header-right">

                <nav>
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

                <div class="search-box">
                    <input type="text" id="searchInput" placeholder="Qidirish...">
                </div>

                <button class="dark-mode-toggle" id="darkBtn" onclick="window.toggleDarkMode()">
                    🌙
                </button>

            </div>

        </div>
    </header>
`;

    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const btn = document.getElementById('darkBtn');
        if (btn) btn.textContent = '☀️';
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderHeader);
} else {
    renderHeader();
}
