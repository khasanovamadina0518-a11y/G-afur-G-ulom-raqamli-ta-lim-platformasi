// ===================================
// Footer Component
// ===================================

function platformHref(relativePath) {
    if (typeof window.platformUrl === 'function') {
        return window.platformUrl(relativePath);
    }
    const path = String(relativePath || '').trim();
    if (!path) return '';
    if (/^(https?:)?\/\//i.test(path)) return path;
    const base = (typeof window.PLATFORM_BASE === 'string' && window.PLATFORM_BASE) ? window.PLATFORM_BASE : '/';
    return base + path.replace(/^\/+/, '');
}

function renderFooter() {
    const footerContainer = document.getElementById('footer-container');
    if (!footerContainer) return;

    const currentYear = new Date().getFullYear();

    footerContainer.innerHTML = `
        <footer class="site-footer">
            <div class="footer-content">
                <div class="footer-section">
                    <h3 data-i18n="footerQuickLinks">Tezkor havolalar</h3>
                    <ul class="footer-links">
                        <li><a href="${platformHref('pages/hayot.html')}" data-i18n="life">Hayoti</a></li>
                        <li><a href="${platformHref('pages/asarlar.html')}" data-i18n="works">Asarlari</a></li>
                        <li><a href="${platformHref('pages/ilmiy.html')}" data-i18n="research">Ilmiy tadqiqotlar</a></li>
                        <li><a href="${platformHref('pages/talim.html')}" data-i18n="talimTitle">Ta'lim resurslari</a></li>
                    </ul>
                </div>

                <div class="footer-section">
                    <h3 data-i18n="footerResources">Resurslar</h3>
                    <ul class="footer-links">
                        <li><a href="${platformHref('pages/multimedia.html')}" data-i18n="videos">Videolar</a></li>
                        <li><a href="${platformHref('pages/interaktiv.html')}" data-i18n="tests">Testlar</a></li>
                        <li><a href="${platformHref('pages/ai-yordamchi.html')}" data-i18n="aiAssistant">AI yordamchi</a></li>
                        <li><a href="#" onclick="scrollToTop(); return false;" data-i18n="footerScrollTop">Yuqoriga ↑</a></li>
                    </ul>
                </div>

                <div class="footer-section">
                    <h3 data-i18n="footerContact">Aloqa</h3>
                    <p>
                        📧 info@gafurgulom.uz<br>
                        📱 +998 71 123 45 67<br>
                        📍 Toshkent, O'zbekiston
                    </p>
                </div>
            </div>

            <div class="footer-bottom">
                <p>© ${currentYear} <span data-i18n="footerCopyrightText">G'afur G'ulom ta'limiy platformasi. Barcha huquqlar himoyalangan.</span></p>
                <p style="margin-top: 0.5rem; font-size: 0.9rem;" data-i18n="footerMission">
                    O'zbek adabiyotini rivojlantirish va targ'ib qilish maqsadida yaratilgan.
                </p>
            </div>
        </footer>
    `;

    window.PlatformI18n?.apply(footerContainer);
}

function initFooter() {
    renderFooter();
    window.PlatformI18n?.registerRefresh?.('footer', renderFooter);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooter);
} else {
    initFooter();
}
