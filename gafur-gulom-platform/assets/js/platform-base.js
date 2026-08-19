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
    global.platformUrl = function platformUrl(relativePath) {
        const path = String(relativePath || '').trim();

        if (!path) return '';

        if (/^(https?:)?\/\//i.test(path)) {
            return path;
        }

        return base + path.replace(/^\/+/, '');
    };
})(window);
