/**
 * Platform root path helper — requires inline base bootstrap in HTML <head>.
 */
(function (global) {
    'use strict';

    if (typeof global.platformUrl === 'function') {
        return;
    }

    function detectPlatformBase() {
        const path = (global.location?.pathname || '/').replace(/\\/g, '/');
        const marker = '/gafur-gulom-platform/';

        if (path.includes(marker)) {
            return path.slice(0, path.indexOf(marker) + marker.length);
        }

        if (path.includes('/pages/')) {
            return path.slice(0, path.indexOf('/pages/') + 1);
        }

        const slash = path.lastIndexOf('/');
        return slash <= 0 ? '/' : path.slice(0, slash + 1);
    }

    const base = global.PLATFORM_BASE || detectPlatformBase();
    global.PLATFORM_BASE = base;
    global.platformUrl = function platformUrl(relativePath) {
        const path = String(relativePath || '').trim();

        if (!path) return '';

        if (/^(https?:)?\/\//i.test(path)) {
            return path;
        }

        return base + path.replace(/^\//, '');
    };
})(window);
