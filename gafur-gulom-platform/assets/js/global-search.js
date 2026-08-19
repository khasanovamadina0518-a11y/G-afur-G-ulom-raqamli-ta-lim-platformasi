/**
 * Global search modal — indexes platform data, navigates with highlight
 */
(function (global) {
    'use strict';

    const DEBOUNCE_MS = 260;
    const MIN_QUERY_LEN = 2;
    const RESULT_LIMIT = 30;

    let debounceTimer = null;
    let searchInitialized = false;
    let modalEl = null;
    let inputEl = null;
    let resultsEl = null;

    function href(relativePath) {
        if (typeof global.platformUrl === 'function') {
            return global.platformUrl(relativePath);
        }
        return relativePath;
    }

    function t(key) {
        return global.PlatformI18n?.t(key) || key;
    }

    function esc(str) {
        return global.PlatformSearchUtils?.escapeHtml(str) || String(str || '');
    }

    function getTypeMeta(type) {
        const map = {
            poem: { section: 'searchCatWorks', subsection: 'searchCatPoem', icon: '📖' },
            hikoya: { section: 'searchCatWorks', subsection: 'searchCatStory', icon: '📚' },
            doston: { section: 'searchCatWorks', subsection: 'searchCatDoston', icon: '📜' },
            qissa: { section: 'searchCatWorks', subsection: 'searchCatQissa', icon: '📕' },
            tarjima: { section: 'searchCatWorks', subsection: 'searchCatTranslation', icon: '🌐' },
            tanlangan: { section: 'searchCatWorks', subsection: 'searchCatSelected', icon: '📗' },
            book: { section: 'searchCatWorks', subsection: 'searchCatWorks', icon: '📚' },
            lifeEvent: { section: 'searchCatLife', subsection: 'searchCatEvent', icon: '📅' },
            lifeStage: { section: 'searchCatLife', subsection: 'searchCatStage', icon: '👤' },
            memory: { section: 'searchCatLife', subsection: 'searchCatMemory', icon: '💬' },
            article: { section: 'searchCatScientific', subsection: 'searchCatArticle', icon: '📄' },
            dissertation: { section: 'searchCatScientific', subsection: 'searchCatDissertation', icon: '🎓' },
            research: { section: 'searchCatScientific', subsection: 'searchCatResearch', icon: '🔬' },
            term: { section: 'searchCatScientific', subsection: 'searchCatTerm', icon: '📖' },
            bibliography: { section: 'searchCatScientific', subsection: 'searchCatBibliography', icon: '📚' },
            quiz: { section: 'searchCatEducation', subsection: 'searchCatQuiz', icon: '❓' },
            education: { section: 'searchCatEducation', subsection: 'searchCatEducation', icon: '🎓' },
            video: { section: 'searchCatVideos', subsection: 'searchCatVideo', icon: '🎬' },
            videoMaterial: { section: 'searchCatVideos', subsection: 'searchCatVideo', icon: '🎬' },
            videoCourse: { section: 'searchCatVideos', subsection: 'searchCatVideo', icon: '🎬' },
            interactive: { section: 'searchCatInteractive', subsection: 'searchCatGame', icon: '🎮' },
            test: { section: 'searchCatTests', subsection: 'searchCatTests', icon: '📝' }
        };
        return map[type] || { section: 'searchCatWorks', subsection: 'searchCatWorks', icon: '📄' };
    }

    function buildSearchUrl(result) {
        const item = result.item || {};
        const id = result.itemId ?? item.id;
        const params = new URLSearchParams();
        const highlight = result.highlight || '';

        if (highlight) params.set('highlight', highlight);

        switch (result.type) {
            case 'poem':
                params.set('id', id);
                return href(`pages/asarlar.html?${params}`);
            case 'hikoya':
            case 'doston':
                params.set('tab', 'dostonlar');
                params.set('doston', id);
                return href(`pages/asarlar.html?${params}`);
            case 'qissa':
                params.set('qissa', id);
                return href(`pages/asarlar.html?${params}`);
            case 'tarjima':
                params.set('tab', 'tarjimalar');
                params.set('tarjima', id);
                return href(`pages/asarlar.html?${params}`);
            case 'tanlangan':
                params.set('tab', 'tanlangan-asarlar');
                params.set('tanlangan', id);
                return href(`pages/asarlar.html?${params}`);
            case 'lifeEvent':
                params.set('event', id);
                return href(`pages/hayot.html?${params}`);
            case 'lifeStage':
                if (item.key) params.set('stage', item.key);
                return href(`pages/hayot.html?${params}`);
            case 'memory':
                params.set('xotira', id);
                return href(`pages/hayot.html?${params}`);
            case 'article':
                params.set('tab', 'maqolalar');
                params.set('article', id);
                return href(`pages/ilmiy.html?${params}`);
            case 'dissertation':
                params.set('tab', 'dissertatsiyalar');
                params.set('dissertation', id);
                return href(`pages/ilmiy.html?${params}`);
            case 'research':
                params.set('tab', 'tadqiqotlar');
                params.set('research', id);
                return href(`pages/ilmiy.html?${params}`);
            case 'term':
                params.set('tab', 'lugat');
                params.set('term', id);
                return href(`pages/ilmiy.html?${params}`);
            case 'bibliography':
                params.set('tab', 'bibliografiya');
                params.set('biblio', id);
                return href(`pages/ilmiy.html?${params}`);
            case 'quiz':
            case 'education':
                return href(`pages/talim.html?${params}`);
            case 'video':
            case 'videoMaterial':
            case 'videoCourse':
                params.set('video', id);
                return href(`pages/multimedia.html?${params}`);
            case 'interactive':
                return href(`pages/interaktiv-oyinlar.html?${params}`);
            case 'test':
                return href(`pages/interaktiv.html?${params}`);
            default:
                return href(`index.html?${params}`);
        }
    }

    function renderResult(result) {
        const meta = getTypeMeta(result.type);
        const section = t(meta.section);
        const subsection = t(meta.subsection);
        const url = buildSearchUrl(result);
        const title = result.title || result.item?.sarlavha || result.item?.atama || '';
        const fieldLabel = result.matchFieldLabel || '';
        const snippet = result.snippet || '';

        return `
            <a class="global-search-result" href="${esc(url)}" data-result-id="${esc(result.resultId)}">
                <div class="global-search-result__head">
                    <span class="global-search-result__icon" aria-hidden="true">${meta.icon}</span>
                    <div class="global-search-result__titles">
                        <div class="global-search-result__title">${esc(title)}</div>
                        <div class="global-search-result__meta">${esc(section)} → ${esc(subsection)}${fieldLabel ? ` · ${esc(fieldLabel)}` : ''}</div>
                    </div>
                </div>
                ${snippet ? `<p class="global-search-result__snippet">${snippet}</p>` : ''}
            </a>`;
    }

    function renderEmpty(messageKey) {
        return `<div class="global-search-empty" role="status">${esc(t(messageKey))}</div>`;
    }

    async function runSearch(query) {
        if (typeof global.searchAllPlatform === 'function') {
            return global.searchAllPlatform(query, RESULT_LIMIT);
        }
        if (global.PlatformDataService?.searchAll) {
            await global.PlatformDataService.ensureLoaded();
            return global.PlatformDataService.searchAll(query, RESULT_LIMIT);
        }
        throw new Error('Search API unavailable');
    }

    function ensureModal() {
        if (modalEl) return;

        modalEl = document.createElement('div');
        modalEl.id = 'globalSearchModal';
        modalEl.className = 'global-search-modal';
        modalEl.hidden = true;
        modalEl.innerHTML = `
            <div class="global-search-modal__backdrop" data-close-search></div>
            <div class="global-search-modal__panel" role="dialog" aria-modal="true" aria-label="${esc(t('search'))}">
                <div class="global-search-modal__head">
                    <span class="global-search-modal__search-icon" aria-hidden="true">🔍</span>
                    <input type="search" id="globalSearchInput" class="global-search-modal__input"
                        autocomplete="off" placeholder="${esc(t('searchPlaceholder'))}" />
                    <kbd class="global-search-modal__hint">ESC</kbd>
                    <button type="button" class="global-search-modal__close" data-close-search aria-label="${esc(t('close'))}">✕</button>
                </div>
                <div id="globalSearchResults" class="global-search-modal__results" role="listbox"></div>
            </div>`;

        document.body.appendChild(modalEl);
        inputEl = modalEl.querySelector('#globalSearchInput');
        resultsEl = modalEl.querySelector('#globalSearchResults');

        modalEl.querySelectorAll('[data-close-search]').forEach(el => {
            el.addEventListener('click', closeSearchModal);
        });

        inputEl.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => handleSearchInput(inputEl.value.trim()), DEBOUNCE_MS);
        });

        inputEl.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                e.preventDefault();
                closeSearchModal();
            }
        });

        resultsEl.addEventListener('click', e => {
            const link = e.target.closest('.global-search-result');
            if (link) closeSearchModal();
        });
    }

    function openSearchModal() {
        ensureModal();
        modalEl.hidden = false;
        document.body.classList.add('global-search-open');
        inputEl.value = '';
        resultsEl.innerHTML = '';
        setTimeout(() => inputEl.focus(), 50);
    }

    function closeSearchModal() {
        if (!modalEl) return;
        modalEl.hidden = true;
        document.body.classList.remove('global-search-open');
        resultsEl.innerHTML = '';
    }

    async function handleSearchInput(query) {
        if (!resultsEl) return;

        if (query.length < MIN_QUERY_LEN) {
            resultsEl.innerHTML = '';
            return;
        }

        resultsEl.innerHTML = renderEmpty('searchLoading');

        try {
            const results = await runSearch(query);
            if (!results.length) {
                resultsEl.innerHTML = renderEmpty('searchEmpty');
                return;
            }
            resultsEl.innerHTML = results.map(renderResult).join('');
        } catch (err) {
            console.error('Global search error:', err);
            resultsEl.innerHTML = renderEmpty('searchError');
        }
    }

    function initGlobalSearch() {
        if (searchInitialized) return;
        searchInitialized = true;

        ensureModal();

        const headerToggle = document.getElementById('searchToggle');
        if (headerToggle) {
            headerToggle.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
                if (modalEl && !modalEl.hidden) closeSearchModal();
                else openSearchModal();
            });
        }

        document.addEventListener('keydown', e => {
            const isMac = navigator.platform.toUpperCase().includes('MAC');
            const modKey = isMac ? e.metaKey : e.ctrlKey;
            if (modKey && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                openSearchModal();
            }
        });

        global.addEventListener('languageChanged', () => {
            if (inputEl) inputEl.placeholder = t('searchPlaceholder');
            const q = inputEl?.value.trim();
            if (q && q.length >= MIN_QUERY_LEN) handleSearchInput(q);
        });
    }

    global.initGlobalSearch = initGlobalSearch;
    global.openGlobalSearch = openSearchModal;
    global.closeGlobalSearch = closeSearchModal;
})(typeof window !== 'undefined' ? window : globalThis);
