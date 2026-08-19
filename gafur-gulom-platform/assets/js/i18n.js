/**
 * Platform i18n — centralized UI translation system
 * Content (poems, articles) stays in original language unless JSON has uz/en fields.
 */
(function (global) {
    'use strict';

    const STORAGE_KEY = 'language';
    const DEFAULT_LANG = 'uz';
    const refreshHandlers = new Map();

    function getMessages() {
        const ext = global.I18N_MESSAGES || {};
        return {
            uz: ext.uz || {},
            en: ext.en || {}
        };
    }

    function normalizeLang(lang) {
        return lang === 'en' ? 'en' : 'uz';
    }

    function getLang() {
        return normalizeLang(localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG);
    }

    function t(key, fallback, vars) {
        const lang = getLang();
        const messages = getMessages();
        let str = messages[lang]?.[key] ?? messages.uz[key] ?? fallback ?? key;
        if (vars && typeof vars === 'object') {
            Object.keys(vars).forEach(k => {
                str = String(str).replace(new RegExp(`\\{${k}\\}`, 'g'), vars[k]);
            });
        }
        return str;
    }

    /** Pick localized string from plain text or { uz, en } object */
    function loc(value, fallback) {
        if (value == null || value === '') return fallback ?? '';
        if (typeof value === 'string') return value;
        if (typeof value === 'object') {
            const lang = getLang();
            return value[lang] ?? value.uz ?? value.en ?? fallback ?? '';
        }
        return String(value);
    }

    function apply(root) {
        const scope = root || document;

        scope.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const value = t(key);
            if (value && value !== key) el.textContent = value;
        });

        scope.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            const value = t(key);
            if (value && value !== key) el.innerHTML = value;
        });

        scope.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const value = t(key);
            if (value && value !== key) el.setAttribute('placeholder', value);
        });

        scope.querySelectorAll('[data-i18n-aria]').forEach(el => {
            const key = el.getAttribute('data-i18n-aria');
            const value = t(key);
            if (value && value !== key) el.setAttribute('aria-label', value);
        });

        scope.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const value = t(key);
            if (value && value !== key) el.setAttribute('title', value);
        });

        scope.querySelectorAll('[data-i18n-alt]').forEach(el => {
            const key = el.getAttribute('data-i18n-alt');
            const value = t(key);
            if (value && value !== key) el.setAttribute('alt', value);
        });
    }

    function syncLangUI() {
        const lang = getLang();
        const label = lang === 'en' ? 'EN' : 'UZ';

        document.querySelectorAll('.lang-picker__label').forEach(el => {
            el.textContent = label;
        });

        document.querySelectorAll('.lang-switch__options .lang-btn, .drawer-lang-btn').forEach(btn => {
            const btnLang = btn.dataset.lang || (btn.textContent.trim().toUpperCase() === 'EN' ? 'en' : 'uz');
            btn.classList.toggle('active', btnLang === lang);
        });

        syncDarkModeLabels();
    }

    function syncDarkModeLabels() {
        const isDark = document.body.classList.contains('dark-mode');
        const drawerDarkBtn = document.getElementById('drawerDarkBtn');
        if (drawerDarkBtn) {
            const text = drawerDarkBtn.querySelector('.drawer-btn-text');
            if (text) text.textContent = isDark ? t('lightMode') : t('darkMode');
        }
    }

    function registerRefresh(id, fn) {
        if (typeof fn === 'function') refreshHandlers.set(id, fn);
    }

    function unregisterRefresh(id) {
        refreshHandlers.delete(id);
    }

    function refreshAll() {
        syncLangUI();
        refreshHandlers.forEach(fn => {
            try { fn(); } catch (err) { console.error('i18n refresh error:', err); }
        });
        apply(document);
    }

    function setLang(lang) {
        const next = normalizeLang(lang);
        localStorage.setItem(STORAGE_KEY, next);
        document.documentElement.lang = next === 'en' ? 'en' : 'uz';
        refreshAll();
        global.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: next } }));
        return next;
    }

    function boot() {
        document.documentElement.lang = getLang() === 'en' ? 'en' : 'uz';
        apply(document);
        syncLangUI();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    global.PlatformI18n = {
        getLang,
        setLang,
        t,
        loc,
        apply,
        syncLangUI,
        syncDarkModeLabels,
        registerRefresh,
        unregisterRefresh,
        refreshAll,
        get MESSAGES() { return getMessages(); }
    };

    global.uiT = t;
})(typeof window !== 'undefined' ? window : globalThis);
