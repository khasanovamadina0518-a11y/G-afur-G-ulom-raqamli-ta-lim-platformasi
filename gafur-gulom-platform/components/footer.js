// ===================================
// Footer Component
// ===================================

function platformHref(relativePath) {
    if (typeof window.platformUrl === 'function') {
        return window.platformUrl(relativePath);
    }
    const base = (typeof window.PLATFORM_BASE === 'string' && window.PLATFORM_BASE) ? window.PLATFORM_BASE : '/';
    return base + String(relativePath || '').replace(/^\//, '');
}

function renderFooter() {
    const footerContainer = document.getElementById('footer-container');
    if (!footerContainer) return;
    
    const currentYear = new Date().getFullYear();
    
    const footerHTML = `
        <footer class="site-footer">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>Tezkor havolalar</h3>
                    <ul class="footer-links">
                        <li><a href="${platformHref('pages/hayot.html')}">Hayoti</a></li>
                        <li><a href="${platformHref('pages/asarlar.html')}">Elektron kutubxona</a></li>
                        <li><a href="${platformHref('pages/ilmiy.html')}">Ilmiy tadqiqotlar</a></li>
                        <li><a href="${platformHref('pages/talim.html')}">Ta'lim resurslari</a></li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h3>Resurslar</h3>
                    <ul class="footer-links">
                        <li><a href="${platformHref('pages/multimedia.html')}">Video darslar</a></li>
                        <li><a href="${platformHref('pages/interaktiv.html')}">Testlar</a></li>
                        <li><a href="${platformHref('pages/hamjamiyat.html')}">AI yordamchi</a></li>
                        <li><a href="#" onclick="scrollToTop(); return false;">Yuqoriga ↑</a></li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h3>Aloqa</h3>
                    <p>
                        📧 info@gafurgulom.uz<br>
                        📱 +998 71 123 45 67<br>
                        📍 Toshkent, O'zbekiston
                    </p>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p>
                    © ${currentYear} G'afur G'ulom ta'limiy platformasi. 
                    Barcha huquqlar himoyalangan.
                </p>
                <p style="margin-top: 0.5rem; font-size: 0.9rem;">
                    O'zbek adabiyotini rivojlantirish va targ'ib qilish maqsadida yaratilgan.
                </p>
            </div>
        </footer>
    `;
    
    footerContainer.innerHTML = footerHTML;
}

// DOMContentLoaded da footer ni render qilish
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderFooter);
} else {
    renderFooter();
}
