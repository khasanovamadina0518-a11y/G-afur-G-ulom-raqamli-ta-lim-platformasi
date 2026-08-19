/**
 * Platform root path helper — sets platformUrl without document <base>.
 */
(function (global) {
    'use strict';

    if (typeof global.platformUrl === 'function') {
        return;
    }

    function detectPlatformBase() {
        let path = (global.location?.pathname || '/').replace(/\\/g, '/');
        if (!path.startsWith('/')) {
            path = '/' + path;
        }

        const marker = '/gafur-gulom-platform/';
        if (path.includes(marker)) {
            return path.slice(0, path.indexOf(marker) + marker.length);
        }

        return '/';
    }

    const base = global.PLATFORM_BASE || detectPlatformBase();
    global.PLATFORM_BASE = base;
    global.R2_MEDIA_BASE = 'https://pub-c7b42c70f3cc4256969aba58bc94e566.r2.dev';

    // i18n — sync load in <head> so PlatformI18n exists before body/scripts
    if (!global.__PLATFORM_I18N_BOOT__) {
        global.__PLATFORM_I18N_BOOT__ = true;
        document.write('<script src="' + base + 'assets/js/i18n-messages.js?v=6"><\/script>');
        document.write('<script src="' + base + 'assets/js/i18n.js?v=5"><\/script>');
    }

    global.platformUrl = function platformUrl(relativePath) {
        const path = String(relativePath || '').trim();

        if (!path) return '';

        if (/^(https?:)?\/\//i.test(path)) {
            return path;
        }

        return base + path.replace(/^\/+/, '');
    };
})(window);
