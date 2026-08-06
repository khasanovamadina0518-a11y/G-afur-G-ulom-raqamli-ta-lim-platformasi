// ===================================
// Simple Router for SPA functionality
// ===================================

const Router = {
    routes: {},
    currentRoute: null,
    
    // Route qoshish
    add: function(path, handler) {
        this.routes[path] = handler;
    },
    
    // Route ni yuklash
    navigate: function(path) {
        if (this.routes[path]) {
            this.currentRoute = path;
            this.routes[path]();
            
            // URL ni yangilash (history API)
            if (window.history && window.history.pushState) {
                window.history.pushState({ path: path }, '', path);
            }
        } else {
            console.warn('Route topilmadi:', path);
        }
    },
    
    // Orqaga qaytish
    back: function() {
        window.history.back();
    },
    
    // Oldinga otish
    forward: function() {
        window.history.forward();
    },
    
    // Query parametrlarini olish
    getQueryParams: function() {
        const params = {};
        const queryString = window.location.search.substring(1);
        const pairs = queryString.split('&');
        
        pairs.forEach(pair => {
            const [key, value] = pair.split('=');
            if (key) {
                params[decodeURIComponent(key)] = decodeURIComponent(value || '');
            }
        });
        
        return params;
    },
    
    // Joriy sahifa yo'lini olish
    getCurrentPath: function() {
        return window.location.pathname;
    },
    
    // Hash ni olish
    getHash: function() {
        return window.location.hash.substring(1);
    }
};

// Browser orqaga/oldinga tugmalari uchun
window.addEventListener('popstate', function(event) {
    if (event.state && event.state.path) {
        Router.navigate(event.state.path);
    }
});

// ===================================
// Page Loader - Sahifalarni dinamik yuklash
// ===================================
const PageLoader = {
    // Sahifani yuklash
    loadPage: async function(url, containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Container topilmadi:', containerId);
            return;
        }
        
        try {
            // Loading ko'rsatish
            container.innerHTML = '<div class="spinner"></div>';
            
            // Sahifani fetch qilish
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const html = await response.text();
            container.innerHTML = html;
            
            // Script'larni qayta ishga tushirish
            this.executeScripts(container);
            
            console.log('Sahifa yuklandi:', url);
        } catch (error) {
            console.error('Sahifani yuklashda xatolik:', error);
            container.innerHTML = `
                <div class="alert alert-error">
                    Sahifani yuklashda xatolik yuz berdi: ${error.message}
                </div>
            `;
        }
    },
    
    // Script'larni ishga tushirish
    executeScripts: function(container) {
        const scripts = container.querySelectorAll('script');
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });
            newScript.textContent = oldScript.textContent;
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });
    }
};

// ===================================
// Breadcrumb Generator
// ===================================
const Breadcrumb = {
    generate: function() {
        const path = window.location.pathname;
        const segments = path.split('/').filter(s => s);
        
        const breadcrumbs = [
            { name: 'Bosh sahifa', url: '/' }
        ];
        
        let currentPath = '';
        segments.forEach((segment, index) => {
            currentPath += '/' + segment;
            const name = this.formatSegmentName(segment);
            breadcrumbs.push({
                name: name,
                url: currentPath,
                isLast: index === segments.length - 1
            });
        });
        
        return breadcrumbs;
    },
    
    formatSegmentName: function(segment) {
        // .html ni olib tashlash
        segment = segment.replace('.html', '');
        
        // Maxsus nomlar
        const names = {
            'hayot': 'Hayoti',
            'asarlar': 'Asarlari',
            'ilmiy': 'Ilmiy tadqiqotlar',
            'talim': 'Ta\'lim resurslari',
            'multimedia': 'Multimedia',
            'interaktiv': 'Interaktiv',
            'hamjamiyat': 'Hamjamiyat'
        };
        
        return names[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    },
    
    render: function(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const breadcrumbs = this.generate();
        
        container.innerHTML = `
            <nav class="breadcrumb">
                ${breadcrumbs.map((crumb, index) => `
                    ${index > 0 ? '<span class="separator">›</span>' : ''}
                    ${crumb.isLast 
                        ? `<span class="current">${crumb.name}</span>`
                        : `<a href="${crumb.url}">${crumb.name}</a>`
                    }
                `).join('')}
            </nav>
        `;
    }
};

// ===================================
// Export
// ===================================
window.Router = Router;
window.PageLoader = PageLoader;
window.Breadcrumb = Breadcrumb;
