/**
 * Universal thumbnail paths and platform asset URL helpers.
 *
 * Confirmed files (do not rename):
 *   assets/images/book thumbnail.jpg
 *   assets/images/tanlangan asarlar thumbnail.jpg
 *   assets/images/video thumbnail.jpg
 */
(function (global) {
    'use strict';

    const THUMB_PATHS = {
        book: 'assets/images/book thumbnail.jpg',
        tanlanganAsarlar: 'assets/images/tanlangan asarlar thumbnail.jpg',
        video: 'assets/images/video thumbnail.jpg'
    };

    function platformUrlFn() {
        return global.platformUrl || function (relativePath) {
            const path = String(relativePath || '').trim().replace(/^\/+/, '');
            return '/' + path;
        };
    }

    /** Encode local relative asset paths for safe use in HTML src/href (spaces, unicode). */
    function encodeLocalAssetPath(path) {
        const trimmed = String(path || '').trim();
        if (!trimmed) return '';
        if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('data:')) {
            return trimmed;
        }
        const relative = trimmed.replace(/^(\.\/|\.\.\/)+/, '').replace(/^\/+/, '');
        return relative.split('/').filter(function (segment) {
            return segment.length > 0;
        }).map(encodeURIComponent).join('/');
    }

    function resolvePlatformAsset(path) {
        const encoded = encodeLocalAssetPath(path);
        if (!encoded) return '';
        return platformUrlFn()(encoded);
    }

    function hasIndividualPath(path) {
        const value = String(path || '').trim();
        return Boolean(value && value !== '#');
    }

    function getBookThumbnail() {
        return resolvePlatformAsset(THUMB_PATHS.book);
    }

    function getTanlanganAsarlarThumbnail() {
        return resolvePlatformAsset(THUMB_PATHS.tanlanganAsarlar);
    }

    function getVideoThumbnail() {
        return resolvePlatformAsset(THUMB_PATHS.video);
    }

    function resolveBookCover(individualPath) {
        if (hasIndividualPath(individualPath)) {
            return resolvePlatformAsset(individualPath);
        }
        return getBookThumbnail();
    }

    function resolveTanlanganCover(individualPath) {
        if (hasIndividualPath(individualPath)) {
            return resolvePlatformAsset(individualPath);
        }
        return getTanlanganAsarlarThumbnail();
    }

    function resolveVideoThumbnail(individualPath) {
        const normalized = String(individualPath || '').replace(/^(\.\/|\.\.\/)+/, '').trim();
        if (hasIndividualPath(normalized)) {
            return resolvePlatformAsset(normalized);
        }
        return getVideoThumbnail();
    }

    function escapeHtmlAttr(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;');
    }

    /** main.css sets img[loading="lazy"] { opacity: 0 } until .loaded is added. */
    function markLazyLoaded(img) {
        if (!img) return;

        function reveal() {
            img.classList.add('loaded');
        }

        if (img.complete) {
            reveal();
            return;
        }

        img.addEventListener('load', reveal, { once: true });
        img.addEventListener('error', reveal, { once: true });
    }

    function handleImgError(img) {
        if (!img || img.dataset.fallbackApplied === '1') return;
        const fallback = img.getAttribute('data-thumb-fallback');
        if (!fallback) return;
        if (img.getAttribute('src') === fallback || img.src === fallback) return;
        img.dataset.fallbackApplied = '1';
        img.src = fallback;
        markLazyLoaded(img);
    }

    function bindThumbnailFallbacks(root) {
        const scope = root && root.querySelectorAll ? root : document;
        scope.querySelectorAll('img[data-thumb-fallback]').forEach(function (img) {
            if (img.dataset.thumbBound === '1') return;
            img.dataset.thumbBound = '1';
            img.addEventListener('error', function () {
                handleImgError(img);
            });
            markLazyLoaded(img);
        });
    }

    function initThumbnailImages() {
        bindThumbnailFallbacks(document);

        if (!global.MutationObserver || !document.body) return;

        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(function (node) {
                    if (node.nodeType !== 1) return;
                    if (node.matches && node.matches('img[data-thumb-fallback]')) {
                        bindThumbnailFallbacks(node.parentElement || document);
                        return;
                    }
                    if (node.querySelectorAll && node.querySelectorAll('img[data-thumb-fallback]').length) {
                        bindThumbnailFallbacks(node);
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initThumbnailImages);
    } else {
        initThumbnailImages();
    }

    global.PlatformThumbnails = {
        THUMB_PATHS: Object.freeze(Object.assign({}, THUMB_PATHS)),
        encodeLocalAssetPath,
        resolvePlatformAsset,
        resolveThumbnailPath: resolvePlatformAsset,
        getBookThumbnail,
        getTanlanganAsarlarThumbnail,
        getVideoThumbnail,
        resolveBookCover,
        resolveTanlanganCover,
        resolveVideoThumbnail,
        escapeHtmlAttr,
        handleImgError,
        markLazyLoaded,
        bindThumbnailFallbacks,
        initThumbnailImages
    };
})(window);
