// ===================================
// Asarlar sahifasi JavaScript
// ===================================

let allPoems = [];
let filteredPoems = [];
let allQissalar = [];
let filteredQissalar = [];
let allTarjimalar = [];
let filteredTarjimalar = [];
let allTanlanganAsarlar = [];
let filteredTanlanganAsarlar = [];
let favorites = [];
let currentPoemId = null;
let currentReadingContext = null;
let activeReadingTracker = null;

function normalizeLibrarySearch(value) {
    if (window.PlatformSearchUtils?.normalizeQuery) {
        return window.PlatformSearchUtils.normalizeQuery(value);
    }
    return String(value || '')
        .toLowerCase()
        .replace(/[\u2018\u2019\u02BC\u02BB'`ʻʼ‛]/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

function librarySearchMatches(query, fields) {
    const normalizedQuery = normalizeLibrarySearch(query);
    if (!normalizedQuery) return true;
    const haystack = normalizeLibrarySearch(
        (Array.isArray(fields) ? fields : [fields]).filter(Boolean).join(' ')
    );
    return haystack.includes(normalizedQuery);
}

function bindLibrarySearchInput(input, handler) {
    if (!input || typeof handler !== 'function') return;
    input.addEventListener('input', handler);
    input.addEventListener('search', handler);
}

function getSavedReadingPosition(kind, id) {
    return window.UserProgress?.getReadingPosition?.(kind, id) || null;
}

function trackContentOpened(kind, id, title, type, defaultProgress = 25) {
    if (!window.UserProgress?.recordContentOpened || kind == null || id == null) return;
    const saved = getSavedReadingPosition(kind, id);
    const progress = saved?.progress || defaultProgress;
    UserProgress.recordContentOpened({
        kind,
        id,
        title: title || 'Asar',
        type: type || 'Asar',
        href: UserProgress.getContinueHref({ kind, id, progress }),
        progress
    });
}

function restoreTextModalScroll(kind, id) {
    const saved = getSavedReadingPosition(kind, id);
    const modalText = document.getElementById('modal-text');
    if (!modalText || !saved?.scrollRatio) return;

    const applyScroll = () => {
        const maxScroll = modalText.scrollHeight - modalText.clientHeight;
        if (maxScroll > 0) {
            modalText.scrollTop = saved.scrollRatio * maxScroll;
        }
    };

    requestAnimationFrame(() => {
        applyScroll();
        window.setTimeout(applyScroll, 120);
    });
}

function stopReadingProgressTracker() {
    if (!activeReadingTracker) return;
    activeReadingTracker.modalText.removeEventListener('scroll', activeReadingTracker.onScroll);
    if (activeReadingTracker.timer) window.clearTimeout(activeReadingTracker.timer);
    activeReadingTracker = null;
}

function startReadingProgressTracker(kind, id) {
    stopReadingProgressTracker();
    const modalText = document.getElementById('modal-text');
    if (!modalText) return;

    const onScroll = () => {
        if (activeReadingTracker?.timer) window.clearTimeout(activeReadingTracker.timer);
        activeReadingTracker.timer = window.setTimeout(() => {
            const maxScroll = modalText.scrollHeight - modalText.clientHeight;
            if (maxScroll <= 0) return;
            const scrollRatio = modalText.scrollTop / maxScroll;
            const progress = Math.min(99, Math.round(10 + scrollRatio * 90));
            window.UserProgress?.updateReadingPosition?.({ kind, id, scrollRatio, progress });
        }, 250);
    };

    modalText.addEventListener('scroll', onScroll, { passive: true });
    activeReadingTracker = { modalText, onScroll, kind, id, timer: null };
}

function saveReadingPositionFromModal(kind, id) {
    const modalText = document.getElementById('modal-text');
    if (!modalText || !kind || id == null) return;
    const maxScroll = modalText.scrollHeight - modalText.clientHeight;
    if (maxScroll <= 0) return;
    const scrollRatio = modalText.scrollTop / maxScroll;
    const progress = Math.min(99, Math.round(10 + scrollRatio * 90));
    window.UserProgress?.updateReadingPosition?.({ kind, id, scrollRatio, progress });
}

function savePdfReadingPosition(kind, id, readPage) {
    if (!kind || id == null) return;
    const page = Math.max(1, Number(readPage) || 1);
    const progress = Math.min(99, Math.max(10, page * 5));
    window.UserProgress?.updateReadingPosition?.({ kind, id, readPage: page, progress });
}

function shouldResumeReading(options = {}) {
    if (options.resume === false) return false;
    if (options.resume === true) return true;
    const params = new URLSearchParams(window.location.search);
    return params.get('resume') === '1';
}

let displayLimit = 10;
let qissalarDisplayLimit = 10;
let tarjimalarDisplayLimit = 10;
let tanlanganAsarlarDisplayLimit = 10;

const BOOKMARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`;

let activeLibraryAudioEl = null;
let activeLibraryAudioKey = null;

const platformTranslate = window.PlatformI18n?.t || null;

const uiT = (key, fallback, vars) => {
    return platformTranslate ? platformTranslate(key, fallback, vars) : (fallback ?? key);
};

function getLibraryAudioParts(prefix, id) {
    return {
        audio: document.getElementById(`${prefix}-audio-${id}`),
        panel: document.getElementById(`${prefix}-audio-panel-${id}`),
        btn: document.getElementById(`${prefix}-audio-btn-${id}`)
    };
}

function parseLibraryAudioEl(audioEl) {
    const match = audioEl?.id?.match(/^(poem|qissa|doston)-audio-(.+)$/);
    if (!match) return null;
    return { prefix: match[1], id: match[2], key: `${match[1]}-${match[2]}` };
}

function resetLibraryAudioButton(prefix, id, title, workType) {
    const { btn } = getLibraryAudioParts(prefix, id);
    if (!btn) return;

    const icon = btn.querySelector('.library-item__audio-icon');
    const label = btn.querySelector('.library-item__audio-label');
    if (icon) icon.textContent = '🔊';
    if (label) label.textContent = uiT('listenAudio');
    btn.setAttribute('aria-label', `${title} ${workType}ini tinglash`);
    btn.setAttribute('aria-pressed', 'false');
    btn.classList.remove('is-playing');
}

function updateLibraryAudioButton(audioEl) {
    const parsed = parseLibraryAudioEl(audioEl);
    if (!parsed) return;

    const { btn, panel } = getLibraryAudioParts(parsed.prefix, parsed.id);
    if (!btn || !panel || panel.hidden) return;

    const title = btn.dataset.audioTitle || '';
    const workType = btn.dataset.audioType || 'asar';
    const playing = !audioEl.paused && !audioEl.ended;
    const icon = btn.querySelector('.library-item__audio-icon');
    const label = btn.querySelector('.library-item__audio-label');
    if (icon) icon.textContent = playing ? '⏸' : '🔊';
    if (label) label.textContent = playing ? uiT('pauseAudio') : uiT('listenAudio');
    btn.setAttribute('aria-label', playing ? `${title} ${workType}ini to'xtatish` : `${title} ${workType}ini tinglash`);
    btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
    btn.classList.toggle('is-playing', playing);
}

function closeLibraryAudio(prefix, id) {
    const { audio, panel, btn } = getLibraryAudioParts(prefix, id);
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;

    if (panel) panel.hidden = true;

    const title = btn?.dataset.audioTitle || '';
    const workType = btn?.dataset.audioType || 'asar';
    resetLibraryAudioButton(prefix, id, title, workType);

    const key = `${prefix}-${id}`;
    if (activeLibraryAudioKey === key) {
        activeLibraryAudioEl = null;
        activeLibraryAudioKey = null;
    }
}

function openLibraryAudio(prefix, id) {
    const { audio, panel } = getLibraryAudioParts(prefix, id);
    if (!audio || !panel) return;

    panel.hidden = false;
    activeLibraryAudioEl = audio;
    activeLibraryAudioKey = `${prefix}-${id}`;
    audio.play().catch(() => {});
    updateLibraryAudioButton(audio);
}

function onLibraryAudioPlay(audioEl) {
    const parsed = parseLibraryAudioEl(audioEl);
    if (!parsed) return;

    if (activeLibraryAudioEl && activeLibraryAudioEl !== audioEl) {
        const prev = parseLibraryAudioEl(activeLibraryAudioEl);
        if (prev) closeLibraryAudio(prev.prefix, prev.id);
    }

    activeLibraryAudioEl = audioEl;
    activeLibraryAudioKey = parsed.key;
    updateLibraryAudioButton(audioEl);
    const btn = document.getElementById(`${parsed.prefix}-audio-btn-${parsed.id}`);
    window.UserProgress?.recordAudioListened?.({
        id: `${parsed.prefix}-${parsed.id}`,
        title: btn?.dataset.audioTitle || 'Audio'
    });
}

function onLibraryAudioPause(audioEl) {
    updateLibraryAudioButton(audioEl);
}

function onLibraryAudioEnded(audioEl) {
    const parsed = parseLibraryAudioEl(audioEl);
    if (!parsed) return;
    closeLibraryAudio(parsed.prefix, parsed.id);
}

function toggleLibraryAudio(prefix, id) {
    const { audio, panel, btn } = getLibraryAudioParts(prefix, id);
    if (!audio || !panel || !btn || btn.disabled) return;

    const key = `${prefix}-${id}`;
    const isOpen = activeLibraryAudioKey === key && !panel.hidden;

    if (isOpen) {
        closeLibraryAudio(prefix, id);
        return;
    }

    if (activeLibraryAudioKey !== null) {
        const [activePrefix, activeId] = activeLibraryAudioKey.split('-');
        closeLibraryAudio(activePrefix, activeId);
    }

    openLibraryAudio(prefix, id);
}

function onLibraryAudioError(prefix, id) {
    const { audio } = getLibraryAudioParts(prefix, id);
    const btn = document.getElementById(`${prefix}-audio-btn-${id}`);

    const message = audio?.error?.code === MediaError.MEDIA_ERR_NETWORK
        ? 'Audio tarmoq xatosi'
        : audio?.error?.code === MediaError.MEDIA_ERR_DECODE
            ? 'Audio codec xatosi'
            : 'Audio fayl topilmadi (404) yoki yuklanmadi';

    console.warn(`${message} (${prefix}, id: ${id})`, audio?.currentSrc || audio?.src || '');

    closeLibraryAudio(prefix, id);

    if (btn) {
        btn.disabled = true;
        btn.classList.add('is-unavailable');
        btn.title = message;
    }

    if (audio) {
        audio.removeAttribute('src');
        const source = audio.querySelector('source');
        if (source) source.removeAttribute('src');
    }
}

function getAudioMimeType(path) {
    const ext = String(path || '').split('.').pop()?.toLowerCase();
    if (ext === 'm4a' || ext === 'mp4') return 'audio/mp4';
    if (ext === 'ogg') return 'audio/ogg';
    if (ext === 'wav') return 'audio/wav';
    return 'audio/mpeg';
}

function buildLibraryAudioParts(prefix, item, workType) {
    if (!item.audio) {
        return { audioAction: '', audioPanel: '' };
    }

    const src = resolveAssetPath(item.audio);
    const mimeType = getAudioMimeType(item.audio);
    const safeTitle = item.sarlavha.replace(/"/g, '&quot;');
    const listenLabel = `${safeTitle} ${workType}ini tinglash`;

    return {
        audioAction: `<button class="library-item__audio" type="button" id="${prefix}-audio-btn-${item.id}" data-audio-title="${safeTitle}" data-audio-type="${workType}" aria-label="${listenLabel}" aria-pressed="false" aria-controls="${prefix}-audio-panel-${item.id}" onclick="toggleLibraryAudio('${prefix}', ${item.id}); event.stopPropagation();"><span class="library-item__audio-icon" aria-hidden="true">🔊</span><span class="library-item__audio-label">Audio</span></button>`,
        audioPanel: `
            <div class="library-item__audio-panel" id="${prefix}-audio-panel-${item.id}" hidden>
                <audio class="library-item__audio-player" id="${prefix}-audio-${item.id}" controls preload="none" onplay="onLibraryAudioPlay(this)" onpause="onLibraryAudioPause(this)" onended="onLibraryAudioEnded(this)" onerror="onLibraryAudioError('${prefix}', ${item.id})">
                    <source src="${src}" type="${mimeType}">
                </audio>
            </div>`
    };
}

function buildPoemAudioParts(poem) {
    return buildLibraryAudioParts('poem', poem, "she'r");
}

function isPdfPoem(poem) {
    return Boolean(poem && poem.pdf);
}

function buildPdfPoemTags() {
    return `<div class="library-item__tags"><span class="library-item__tag library-item__tag--pdf">PDF</span></div>`;
}

function buildQissaAudioParts(qissa) {
    return buildLibraryAudioParts('qissa', qissa, 'qissa');
}

function buildDostonAudioParts(doston) {
    const workType = doston.janr === 'Hikoya' ? 'hikoya' : 'doston';
    return buildLibraryAudioParts('doston', doston, workType);
}

/* She'r audio — eski nomlar (HTML onclick mosligi) */
function togglePoemAudio(id) { toggleLibraryAudio('poem', id); }
function onPoemAudioPlay(el) { onLibraryAudioPlay(el); }
function onPoemAudioPause(el) { onLibraryAudioPause(el); }
function onPoemAudioEnded(el) { onLibraryAudioEnded(el); }
function onPoemAudioError(id) { onLibraryAudioError('poem', id); }

function resolveAssetPath(path) {
    if (!path || path === '#') return '';
    if (/^(https?:)?\/\//i.test(path)) return path;
    if (window.PlatformThumbnails) {
        return window.PlatformThumbnails.resolvePlatformAsset(path);
    }
    const relative = String(path).trim().replace(/^(\.\/|\.\.\/)+/, '').replace(/^\/+/, '');
    const encoded = relative.split('/').filter(Boolean).map(encodeURIComponent).join('/');
    return (window.platformUrl || function (r) { return r; })(encoded);
}

function getLibraryCoverSrc(rasm, type) {
    if (window.PlatformThumbnails) {
        return type === 'tanlangan'
            ? window.PlatformThumbnails.resolveTanlanganCover(rasm)
            : window.PlatformThumbnails.resolveBookCover(rasm);
    }
    return rasm ? resolveAssetPath(rasm) : '';
}

function getLibraryCoverFallback(type) {
    if (!window.PlatformThumbnails) return '';
    return type === 'tanlangan'
        ? window.PlatformThumbnails.getTanlanganAsarlarThumbnail()
        : window.PlatformThumbnails.getBookThumbnail();
}

function buildCoverImg(title, rasm, type) {
    const fallback = getLibraryCoverFallback(type);
    const src = getLibraryCoverSrc(rasm, type) || fallback;
    const esc = window.PlatformThumbnails?.escapeHtmlAttr || function (v) {
        return String(v || '').replace(/"/g, '&quot;');
    };

    if (!src) {
        return `<span class="library-item__cover-label">${title}</span>`;
    }

    const safeSrc = esc(src);
    const safeFallback = esc(fallback || src);

    return `<img class="library-item__cover-img" src="${safeSrc}" alt="" loading="lazy" data-thumb-fallback="${safeFallback}" onerror="window.PlatformThumbnails&&window.PlatformThumbnails.handleImgError(this)">`;
}

function getCoverVariant(id) {
    const variants = ['', 'library-item__cover--gold', 'library-item__cover--slate'];
    return variants[id % 3];
}

function buildLibraryItem({ id, domId = '', title, category, description, coverVariant, rasm = '', coverType = 'book', readAction, audioAction = '', audioPanel = '', showBookmark = true, tagsHtml = '' }) {
    const favActive = isFavorite(id);
    const bookmark = showBookmark ? `
                <button class="library-item__bookmark favorite-btn ${favActive ? 'active' : ''}"
                        type="button"
                        aria-label="${favActive ? uiT('bookmarkRemove') : uiT('bookmarkAdd')}"
                        onclick="toggleFavorite(${id}); event.stopPropagation();">
                    ${BOOKMARK_SVG}
                </button>` : '';

    const coverInner = buildCoverImg(title, rasm, coverType);

    return `
        <article class="library-item" data-id="${id}"${domId ? ` id="${domId}"` : ''}>
            <div class="library-item__cover ${coverVariant}" aria-hidden="true">
                ${coverInner}
            </div>
            <div class="library-item__body">
                <h3 class="library-item__title">${title}</h3>
                <p class="library-item__category">${category}</p>
                <p class="library-item__desc">${description}</p>
                ${tagsHtml}
            </div>
            <div class="library-item__actions">
                ${readAction}
                ${audioAction}
                ${bookmark}
            </div>
            ${audioPanel}
        </article>
    `;
}

// ===================================
// Initialize
// ===================================
document.addEventListener('DOMContentLoaded', async function() {
    await loadPoems();
    loadFavorites();
    initFilters();
    initTabs();
    initModal();
    initLoadMore();
    await loadQissalar();
    initQissalarFilters();
    initQissalarLoadMore();
    await loadTarjimalar();
    initTarjimalarFilters();
    initTarjimalarLoadMore();
    await loadTanlanganAsarlar();
    initTanlanganAsarlarFilters();
    initTanlanganAsarlarLoadMore();
    checkUrlParams();
    window.PlatformI18n?.registerRefresh?.('asarlar', refreshAsarlarUI);
});

function refreshAsarlarUI() {
    applyFilters();
    applyQissalarFilters();
    applyTarjimalarFilters();
    applyTanlanganAsarlarFilters();
    renderQissalarCategoryChips();
}

// ===================================
// Check URL Parameters
// ===================================
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const highlight = urlParams.get('highlight');

    function afterContentOpen(delayMs = 900) {
        if (highlight && window.PlatformSearchLanding) {
            setTimeout(() => window.PlatformSearchLanding.highlight(highlight), delayMs);
        }
    }

    const tabParam = urlParams.get('tab');
    const tab = tabParam === 'hikoyalar' ? 'dostonlar' : tabParam;
    if (tab && ['sherlar', 'dostonlar', 'qissalar', 'tarjimalar', 'tanlangan-asarlar'].includes(tab)) {
        switchTab(tab, false);
    }

    const poemId = urlParams.get('id') || urlParams.get('poem');
    const resume = urlParams.get('resume') === '1';

    if (poemId) {
        const id = parseInt(poemId, 10);
        const poem = allPoems.find(p => p.id === id);
        if (poem) {
            switchTab('sherlar', false);
            setTimeout(() => {
                openPoemModal(id, { resume });
                afterContentOpen(600);
            }, 500);
            return;
        }
    }

    const qissaId = urlParams.get('qissa');
    if (qissaId) {
        const id = parseInt(qissaId, 10);
        switchTab('qissalar', false);
        setTimeout(() => {
            openQissaRead(id, { resume });
            afterContentOpen(700);
        }, 500);
        return;
    }

    const dostonId = urlParams.get('doston');
    if (dostonId) {
        const id = parseInt(dostonId, 10);
        switchTab('dostonlar', false);
        setTimeout(() => {
            openDostonRead(id);
            afterContentOpen(700);
        }, 500);
        return;
    }

    const tarjimaId = urlParams.get('tarjima');
    if (tarjimaId) {
        const id = parseInt(tarjimaId, 10);
        switchTab('tarjimalar', false);
        setTimeout(() => {
            openTarjimaRead(id);
            afterContentOpen(700);
        }, 500);
        return;
    }

    const tanlanganId = urlParams.get('tanlangan');
    if (tanlanganId) {
        const id = parseInt(tanlanganId, 10);
        switchTab('tanlangan-asarlar', false);
        setTimeout(() => {
            openTanlanganRead(id);
            afterContentOpen(700);
        }, 500);
        return;
    }

    if (highlight) {
        afterContentOpen(1200);
    }
}

// ===================================
// Load Poems
// ===================================
async function loadPoems() {
    try {
        allPoems = await getSherlar();
        filteredPoems = [...allPoems];
        displayPoems();
        loadDostonlar();
        updateResultsCount();
    } catch (error) {
        console.error('She\'rlarni yuklashda xatolik:', error);
    }
}

// ===================================
// Display Poems
// ===================================
function displayPoems() {
    const container = document.getElementById('poems-grid');
    if (!container) return;

    if (filteredPoems.length === 0) {
        container.innerHTML = `<p class="library-empty">${uiT('asarlarEmpty')}</p>`;
        updateLoadMoreButton();
        return;
    }

    const visiblePoems = filteredPoems.slice(0, displayLimit);

    container.innerHTML = visiblePoems.map(poem => {
        const pdfPoem = isPdfPoem(poem);
        const category = pdfPoem
            ? (poem.muallif || "G'afur G'ulom")
            : `${poem.mavzu[0] || 'She\'r'} · She'r · ${poem.yil}`;
        const readLabel = pdfPoem ? uiT('readPdf') : uiT('read');
        const readAction = `<button class="library-item__read" type="button" onclick="openPoemModal(${poem.id})">${readLabel}</button>`;
        const { audioAction, audioPanel } = buildPoemAudioParts(poem);

        return buildLibraryItem({
            id: poem.id,
            domId: `poem-card-${poem.id}`,
            title: poem.sarlavha,
            category,
            description: poem.qisqa || '',
            coverVariant: getCoverVariant(poem.id),
            readAction,
            audioAction,
            audioPanel,
            tagsHtml: pdfPoem ? buildPdfPoemTags() : ''
        });
    }).join('');

    updateLoadMoreButton();
}

function updateLoadMoreButton() {
    const btn = document.getElementById('load-more-btn');
    if (!btn) return;

    if (filteredPoems.length > displayLimit) {
        btn.classList.remove('is-hidden');
    } else {
        btn.classList.add('is-hidden');
    }
}

function initLoadMore() {
    const btn = document.getElementById('load-more-btn');
    if (!btn) return;

    btn.addEventListener('click', function() {
        displayLimit += 10;
        displayPoems();
    });
}

// ===================================
// Filters
// ===================================
function initFilters() {
    const sherlarTab = document.querySelector('.tab-content[data-tab="sherlar"]');
    const searchInput = document.getElementById('search-input');
    bindLibrarySearchInput(searchInput, applyFilters);

    const filterToggle = document.getElementById('filter-toggle');
    const filterPanel = document.getElementById('filter-panel');
    if (filterToggle && filterPanel) {
        filterToggle.addEventListener('click', function() {
            const isOpen = filterPanel.classList.toggle('is-open');
            filterToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    const mavzuButtons = sherlarTab
        ? sherlarTab.querySelectorAll('.filter-btn[data-mavzu]')
        : document.querySelectorAll('.filter-btn[data-mavzu]');
    mavzuButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            mavzuButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            applyFilters();
        });
    });

    const yearSelect = document.getElementById('year-filter');
    if (yearSelect) {
        yearSelect.addEventListener('change', applyFilters);
    }

    const viewButtons = sherlarTab
        ? sherlarTab.querySelectorAll('.view-btn[data-view]')
        : [];
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            viewButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const view = this.getAttribute('data-view');
            const grid = document.getElementById('poems-grid');
            if (!grid) return;
            if (view === 'grid') {
                grid.classList.add('library-list--grid');
            } else {
                grid.classList.remove('library-list--grid');
            }
        });
    });
}

function applyFilters() {
    const searchInput = document.getElementById('search-input');
    const searchQuery = searchInput?.value || '';
    const activeChip = document.querySelector('.tab-content[data-tab="sherlar"] .filter-btn.active[data-mavzu]');
    const activeMavzu = activeChip?.getAttribute('data-mavzu') || 'all';
    const yearRange = document.getElementById('year-filter')?.value || 'all';
    
    filteredPoems = allPoems.filter(poem => {
        const matchesSearch = librarySearchMatches(searchQuery, [
            poem.sarlavha,
            poem.matn,
            poem.qisqa,
            poem.muallif,
            poem.nota,
            ...(Array.isArray(poem.mavzu) ? poem.mavzu : []),
            poem.yil
        ]);
        
        // Mavzu filter
        let matchesMavzu = true;
        if (activeMavzu === 'favorites') {
            matchesMavzu = isFavorite(poem.id);
        } else if (activeMavzu !== 'all') {
            matchesMavzu = (poem.mavzu || []).includes(activeMavzu);
        }
        
        // Year filter
        let matchesYear = true;
        if (yearRange !== 'all') {
            const [start, end] = yearRange.split('-').map(Number);
            matchesYear = poem.yil >= start && poem.yil <= end;
        }
        
        return matchesSearch && matchesMavzu && matchesYear;
    });

    displayLimit = 10;
    displayPoems();
    updateResultsCount();
}

function updateResultsCount() {
    const count = document.getElementById('results-count');
    if (!count) return;
    count.textContent = uiT('asarlarResultsPoems', '{total} ta she\'rdan {shown} ta ko\'rsatilmoqda', {
        total: allPoems.length,
        shown: filteredPoems.length
    });
}

// ===================================
// Favorites
// ===================================
function loadFavorites() {
    const saved = localStorage.getItem('gafur-favorites');
    favorites = saved ? JSON.parse(saved) : [];
}

function saveFavorites() {
    localStorage.setItem('gafur-favorites', JSON.stringify(favorites));
}

function isFavorite(poemId) {
    return favorites.includes(poemId);
}

function toggleFavorite(poemId) {
    const poem = allPoems.find(p => p.id === poemId);
    const added = !isFavorite(poemId);
    if (isFavorite(poemId)) {
        favorites = favorites.filter(id => id !== poemId);
    } else {
        favorites.push(poemId);
    }
    saveFavorites();
    if (window.UserProgress?.recordFavoriteChange) {
        UserProgress.recordFavoriteChange({
            kind: 'poem',
            id: poemId,
            added,
            title: poem?.sarlavha || ''
        });
    }
    displayPoems();
}

// ===================================
// Modal
// ===================================
function initModal() {
    const modal = document.getElementById('poem-modal');
    const closeBtn = document.getElementById('modal-close');
    const closeBtn2 = document.getElementById('close-btn');
    const shareBtn = document.getElementById('share-btn');
    const copyBtn = document.getElementById('copy-btn');
    const printBtn = document.getElementById('print-btn');
    const favoriteBtn = document.getElementById('favorite-modal-btn');
    
    closeBtn.addEventListener('click', closeModal);
    closeBtn2.addEventListener('click', closeModal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeModal();
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeModal();
    });
    
    shareBtn.addEventListener('click', sharePoem);
    copyBtn.addEventListener('click', copyToClipboard);
    printBtn.addEventListener('click', printPoem);
    favoriteBtn.addEventListener('click', function() {
        if (currentPoemId) {
            toggleFavorite(currentPoemId);
            updateFavoriteButton();
        }
    });
}

function openPoemModal(poemId, options = {}) {
    const poem = allPoems.find(p => p.id === poemId);
    if (!poem) return;

    currentReadingContext = { kind: 'poem', id: poemId };
    const resume = shouldResumeReading(options);

    if (isPdfPoem(poem)) {
        const saved = resume ? getSavedReadingPosition('poem', poemId) : null;
        openQissaPdfReader({
            ...poem,
            mavzu: poem.mavzu || (poem.muallif ? [poem.muallif] : [])
        }, saved?.readPage || 1);
        return;
    }

    currentPoemId = poemId;

    const poemModal = document.getElementById('poem-modal');
    poemModal.classList.remove('modal--pdf');

    document.getElementById('modal-title').textContent = poem.sarlavha;
    document.getElementById('modal-year').textContent = poem.yil;
    document.getElementById('modal-badges').innerHTML =
        poem.mavzu.map(m => `<span class="badge">${m}</span>`).join('');
    document.getElementById('modal-text').textContent = poem.matn;

    updateFavoriteButton();

    poemModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (resume) restoreTextModalScroll('poem', poemId);
    startReadingProgressTracker('poem', poemId);
}

function closeModal() {
    if (currentReadingContext && !document.getElementById('poem-modal')?.classList.contains('modal--pdf')) {
        saveReadingPositionFromModal(currentReadingContext.kind, currentReadingContext.id);
    }

    stopReadingProgressTracker();

    const modal = document.getElementById('poem-modal');
    modal.classList.remove('active');
    modal.classList.remove('modal--pdf');
    document.body.style.overflow = 'auto';
    currentPoemId = null;
    currentReadingContext = null;

    const modalText = document.getElementById('modal-text');
    if (modalText) {
        modalText.innerHTML = '';
        modalText.textContent = '';
    }
}

function updateFavoriteButton() {
    const btn = document.getElementById('favorite-modal-btn');
    if (isFavorite(currentPoemId)) {
        btn.textContent = '❤️ ' + uiT('bookmarkRemove');
    } else {
        btn.textContent = '❤️ ' + uiT('bookmarkAdd');
    }
}

function copyToClipboard() {
    const text = document.getElementById('modal-text').textContent;
    const title = document.getElementById('modal-title').textContent;
    const year = document.getElementById('modal-year').textContent;
    
    const fullText = `${title}\n(${year})\n\n${text}\n\n— G'afur G'ulom`;
    
    navigator.clipboard.writeText(fullText).then(() => {
        alert('She\'r nusxalandi!');
    }).catch(err => {
        console.error('Nusxalashda xatolik:', err);
    });
}

function printPoem() {
    window.print();
}

// ===================================
// Share Poem
// ===================================
function sharePoem() {
    const poem = allPoems.find(p => p.id === currentPoemId);
    if (!poem) return;
    
    const title = `${poem.sarlavha} - G'afur G'ulom`;
    const text = `${poem.sarlavha} (${poem.yil})\n\n${poem.qisqa}\n\n— G'afur G'ulom`;
    const url = `${window.location.origin}${window.location.pathname}?poem=${poem.id}`;
    
    // Check if Web Share API is supported
    if (navigator.share) {
        navigator.share({
            title: title,
            text: text,
            url: url
        })
        .then(() => {
            console.log('She\'r muvaffaqiyatli ulashildi');
        })
        .catch((error) => {
            console.log('Ulashish bekor qilindi:', error);
        });
    } else {
        // Fallback: Copy to clipboard
        const shareText = `${title}\n\n${text}\n\n${url}`;
        navigator.clipboard.writeText(shareText)
            .then(() => {
                showNotification('Havola nusxa olindi! ✓');
            })
            .catch((err) => {
                console.error('Nusxalashda xatolik:', err);
                showNotification('Nusxalashda xatolik!', 'error');
            });
    }
}

// Show notification
function showNotification(message, type = 'success') {
    // Remove existing notification if any
    const existing = document.querySelector('.share-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `share-notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Fade in
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Fade out and remove
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===================================
// Tabs
// ===================================
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function switchTab(tabName, updateUrl = true) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    const tabBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    const tabContent = document.querySelector(`.tab-content[data-tab="${tabName}"]`);
    if (!tabBtn || !tabContent) return;

    tabBtn.classList.add('active');
    tabContent.classList.add('active');

    if (updateUrl) {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', tabName);
        history.replaceState(null, '', url);
    }
}

// ===================================
// Make functions global
// ===================================
window.openPoemModal = openPoemModal;
window.toggleFavorite = toggleFavorite;
window.openDostonModal = openDostonModal;
window.openDostonRead = openDostonRead;
// ===================================
// Doston modalini ochish
// ===================================
async function openDostonModal(dostonId) {

    const dostonlar = await getDostonlar();
    const doston = dostonlar.find(d => d.id === dostonId);

    if (!doston) return;

    currentReadingContext = { kind: 'doston', id: dostonId };

    const modal = document.getElementById('poem-modal');
    modal.classList.remove('modal--pdf');

    document.getElementById('modal-title').textContent = doston.sarlavha;
    document.getElementById('modal-year').textContent = doston.yil;
    document.getElementById('modal-badges').innerHTML =
        (doston.mavzu || []).map(m => `<span class="badge">${m}</span>`).join('');

    const modalText = document.getElementById('modal-text');
    modalText.innerHTML = '';
    modalText.textContent = doston.matn;

    document.getElementById('poem-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}
async function openDostonRead(dostonId) {
    const dostonlar = await getDostonlar();
    const doston = dostonlar.find(d => d.id === dostonId);
    if (!doston) return;

    currentReadingContext = { kind: 'doston', id: dostonId };

    if (doston.pdf) {
        trackContentOpened('doston', dostonId, doston.sarlavha, 'Doston', 25);
        openQissaPdfReader(doston);
        return;
    }

    if (doston.matn) {
        openDostonModal(dostonId);
        return;
    }

    showNotification('Bu asar uchun hozircha elektron fayl mavjud emas.', 'error');
}

// ===================================
// Dostonlarni yuklash
// ===================================
async function loadDostonlar() {

    const container = document.getElementById('dostonlar-grid');
    if (!container) return;

    try {

        const dostonlar = await getDostonlar();

        container.innerHTML = dostonlar.map(doston => {
            const author = doston.muallif || "G'afur G'ulom";
            const janr = doston.janr || 'Doston';
            const category = `${author} · ${janr}${doston.yil ? ` · ${doston.yil}` : ''}`;
            const readAction = doston.pdf || doston.matn
                ? `<button class="library-item__read" type="button" onclick="openDostonRead(${doston.id})">${uiT('read')}</button>`
                : '';
            const { audioAction, audioPanel } = buildDostonAudioParts(doston);

            return buildLibraryItem({
                id: doston.id,
                domId: `doston-card-${doston.id}`,
                title: doston.sarlavha,
                category,
                description: doston.qisqa,
                coverVariant: getCoverVariant(doston.id + 2),
                readAction,
                audioAction,
                audioPanel,
                showBookmark: false,
                tagsHtml: buildQissaTags(doston.mavzu)
            });
        }).join('');

    } catch (error) {
        console.error("Dostonlarni yuklashda xatolik:", error);
    }

}

// ===================================
// Qissalar
// ===================================
function buildQissaTags(mavzu) {
    if (!Array.isArray(mavzu) || mavzu.length === 0) return '';
    const tags = mavzu.map(m => `<span class="library-item__tag">${m}</span>`).join('');
    return `<div class="library-item__tags">${tags}</div>`;
}

async function loadQissalar() {
    const container = document.getElementById('qissalar-grid');
    if (!container) return;

    try {
        allQissalar = await getQissalar();

        if (allQissalar.length === 0) {
            const dataUrl = (window.platformUrl || function (r) { return r; })('data/qissalar.json?v=20260812');
            const res = await fetch(dataUrl, { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                allQissalar = Array.isArray(data.qissalar) ? data.qissalar : [];
            } else {
                console.warn('Qissalar JSON yuklanmadi:', res.status, dataUrl);
            }
        }

        filteredQissalar = [...allQissalar];
        renderQissalarCategoryChips();
        displayQissalar();
        updateQissalarResultsCount();
    } catch (error) {
        console.error('Qissalarni yuklashda xatolik:', error);
        container.innerHTML = `<p class="library-empty">Qissalar yuklanmadi. Keyinroq qayta urinib ko'ring.</p>`;
    }
}

function renderQissalarCategoryChips() {
    const chips = document.getElementById('qissalar-chips');
    if (!chips) return;

    const categories = [...new Set(
        allQissalar.flatMap(q => Array.isArray(q.mavzu) ? q.mavzu : [])
    )].sort();

    chips.innerHTML = `<button class="filter-btn active" type="button" data-qissa-mavzu="all">${uiT('filterAll')}</button>` +
        categories.map(cat =>
            `<button class="filter-btn" type="button" data-qissa-mavzu="${cat}">${cat}</button>`
        ).join('');
}

function displayQissalar() {
    const container = document.getElementById('qissalar-grid');
    if (!container) return;

    if (filteredQissalar.length === 0) {
        const message = allQissalar.length === 0
            ? 'Qissalar hozircha qo\'shilmagan.'
            : uiT('asarlarEmptyQissa');
        container.innerHTML = `<p class="library-empty">${message}</p>`;
        updateQissalarLoadMoreButton();
        return;
    }

    const visible = filteredQissalar.slice(0, qissalarDisplayLimit);

    container.innerHTML = visible.map(qissa => {
        const author = qissa.muallif || "G'afur G'ulom";
        const category = `${author} · Qissa · ${qissa.yil || ''}`.replace(/ · $/, '');
        const readAction = `<button class="library-item__read" type="button" onclick="openQissaRead(${qissa.id})">${uiT('read')}</button>`;
        const { audioAction, audioPanel } = buildQissaAudioParts(qissa);

        return buildLibraryItem({
            id: qissa.id,
            domId: `qissa-card-${qissa.id}`,
            title: qissa.sarlavha,
            category,
            description: qissa.qisqa || '',
            coverVariant: getCoverVariant(qissa.id + 4),
            rasm: qissa.rasm,
            readAction,
            audioAction,
            audioPanel,
            showBookmark: false,
            tagsHtml: buildQissaTags(qissa.mavzu)
        });
    }).join('');

    updateQissalarLoadMoreButton();
}

function updateQissalarLoadMoreButton() {
    const btn = document.getElementById('qissalar-load-more-btn');
    if (!btn) return;

    if (filteredQissalar.length > qissalarDisplayLimit) {
        btn.classList.remove('is-hidden');
    } else {
        btn.classList.add('is-hidden');
    }
}

function initQissalarLoadMore() {
    const btn = document.getElementById('qissalar-load-more-btn');
    if (!btn) return;

    btn.addEventListener('click', function() {
        qissalarDisplayLimit += 10;
        displayQissalar();
    });
}

function initQissalarFilters() {
    bindLibrarySearchInput(document.getElementById('qissalar-search-input'), applyQissalarFilters);

    const filterToggle = document.getElementById('qissalar-filter-toggle');
    const filterPanel = document.getElementById('qissalar-filter-panel');
    if (filterToggle && filterPanel) {
        filterToggle.addEventListener('click', function() {
            const isOpen = filterPanel.classList.toggle('is-open');
            filterToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    const yearSelect = document.getElementById('qissalar-year-filter');
    if (yearSelect) {
        yearSelect.addEventListener('change', applyQissalarFilters);
    }

    const chips = document.getElementById('qissalar-chips');
    if (chips) {
        chips.addEventListener('click', function(e) {
            const btn = e.target.closest('.filter-btn[data-qissa-mavzu]');
            if (!btn) return;
            chips.querySelectorAll('.filter-btn[data-qissa-mavzu]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyQissalarFilters();
        });
    }

    const viewButtons = document.querySelectorAll('[data-qissa-view]');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            viewButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const view = this.getAttribute('data-qissa-view');
            const grid = document.getElementById('qissalar-grid');
            if (!grid) return;
            if (view === 'grid') {
                grid.classList.add('library-list--grid');
            } else {
                grid.classList.remove('library-list--grid');
            }
        });
    });
}

function applyQissalarFilters() {
    const searchInput = document.getElementById('qissalar-search-input');
    const searchQuery = searchInput?.value || '';
    const activeChip = document.querySelector('.tab-content[data-tab="qissalar"] .filter-btn.active[data-qissa-mavzu]');
    const activeMavzu = activeChip?.getAttribute('data-qissa-mavzu') || 'all';
    const yearRange = document.getElementById('qissalar-year-filter')?.value || 'all';

    filteredQissalar = allQissalar.filter(qissa => {
        const matchesSearch = librarySearchMatches(searchQuery, [
            qissa.sarlavha,
            qissa.muallif,
            qissa.qisqa,
            qissa.matn,
            ...(Array.isArray(qissa.boblar) ? qissa.boblar.map(b => b.sarlavha) : []),
            ...(Array.isArray(qissa.mavzu) ? qissa.mavzu : []),
            ...(Array.isArray(qissa.teglar) ? qissa.teglar : [])
        ]);

        let matchesMavzu = true;
        if (activeMavzu !== 'all') {
            matchesMavzu = Array.isArray(qissa.mavzu) && qissa.mavzu.includes(activeMavzu);
        }

        let matchesYear = true;
        if (yearRange !== 'all' && qissa.yil) {
            const [start, end] = yearRange.split('-').map(Number);
            matchesYear = qissa.yil >= start && qissa.yil <= end;
        }

        return matchesSearch && matchesMavzu && matchesYear;
    });

    qissalarDisplayLimit = 10;
    displayQissalar();
    updateQissalarResultsCount();
}

function updateQissalarResultsCount() {
    const count = document.getElementById('qissalar-results-count');
    if (!count) return;

    if (allQissalar.length === 0) {
        count.textContent = uiT('asarlarResultsEmptyQissas', '0 ta qissa topildi');
        return;
    }

    count.textContent = uiT('asarlarResultsQissas', '{total} ta qissadan {shown} ta ko\'rsatilmoqda', {
        total: allQissalar.length,
        shown: filteredQissalar.length
    });
}

function openQissaRead(qissaId, options = {}) {
    const qissa = allQissalar.find(q => q.id === qissaId);
    if (!qissa) return;

    currentReadingContext = { kind: 'qissa', id: qissaId };
    const resume = shouldResumeReading(options);
    const saved = resume ? getSavedReadingPosition('qissa', qissaId) : null;

    if (qissa.pdf) {
        openQissaPdfReader(qissa, saved?.readPage || 1);
        return;
    }

    if (qissa.matn) {
        openQissaModal(qissaId, { resume });
        return;
    }

    showNotification('Bu qissa uchun hozircha elektron fayl mavjud emas.', 'error');
}

function openQissaPdfReader(qissa, startPage) {
    currentPoemId = null;
    if (!currentReadingContext && qissa?.id != null) {
        currentReadingContext = { kind: qissa.kind || (isPdfPoem(qissa) ? 'poem' : 'qissa'), id: qissa.id };
    }

    const pdfUrl = resolveAssetPath(qissa.pdf);
    const page = startPage || 1;
    const modal = document.getElementById('poem-modal');
    const modalText = document.getElementById('modal-text');
    const readingKind = currentReadingContext?.kind || 'qissa';
    const readingId = currentReadingContext?.id ?? qissa.id;

    document.getElementById('modal-title').textContent = qissa.sarlavha;
    document.getElementById('modal-year').textContent = qissa.yil || '';
    document.getElementById('modal-badges').innerHTML =
        (qissa.mavzu || []).map(m => `<span class="badge">${m}</span>`).join('');

    let chaptersHtml = '';
    if (Array.isArray(qissa.boblar) && qissa.boblar.length > 0) {
        chaptersHtml = `
            <nav class="qissa-reader__chapters" aria-label="Bo'limlar">
                ${qissa.boblar.map(b => {
                    const isActive = b.sahifa === page ? ' active' : '';
                    return `<button type="button" class="qissa-reader__chapter-btn${isActive}" data-page="${b.sahifa}">${b.sarlavha}</button>`;
                }).join('')}
            </nav>`;
    }

    modalText.innerHTML = `
        ${chaptersHtml}
        <div class="qissa-reader__frame-wrap">
            <iframe class="qissa-reader__frame" src="${pdfUrl}#page=${page}" title="${qissa.sarlavha} — PDF"></iframe>
        </div>
        <p class="qissa-reader__hint">
            <a class="qissa-reader__external" href="${pdfUrl}" target="_blank" rel="noopener noreferrer">${uiT('openPdfNewTab')}</a>
        </p>`;

    modalText.querySelectorAll('.qissa-reader__chapter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetPage = this.getAttribute('data-page');
            const frame = modalText.querySelector('.qissa-reader__frame');
            if (frame) frame.src = `${pdfUrl}#page=${targetPage}`;
            modalText.querySelectorAll('.qissa-reader__chapter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            savePdfReadingPosition(readingKind, readingId, targetPage);
        });
    });

    savePdfReadingPosition(readingKind, readingId, page);

    modal.classList.add('modal--pdf');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function openQissaModal(qissaId, options = {}) {
    const qissa = allQissalar.find(q => q.id === qissaId);
    if (!qissa) return;

    currentPoemId = null;
    currentReadingContext = { kind: 'qissa', id: qissaId };
    const resume = shouldResumeReading(options);

    const modal = document.getElementById('poem-modal');
    modal.classList.remove('modal--pdf');

    document.getElementById('modal-title').textContent = qissa.sarlavha;
    document.getElementById('modal-year').textContent = qissa.yil || '';
    document.getElementById('modal-badges').innerHTML =
        (qissa.mavzu || []).map(m => `<span class="badge">${m}</span>`).join('');

    const modalText = document.getElementById('modal-text');
    modalText.innerHTML = '';
    modalText.textContent = qissa.matn;

    document.getElementById('poem-modal').classList.add('active');
    document.body.style.overflow = 'hidden';

    if (resume) restoreTextModalScroll('qissa', qissaId);
    startReadingProgressTracker('qissa', qissaId);
}

// ===================================
// Tarjimalar
// ===================================

function buildTarjimaTags(teglar) {
    if (!Array.isArray(teglar) || teglar.length === 0) return '';
    const tags = teglar.map(t => `<span class="library-item__tag">${t}</span>`).join('');
    return `<div class="library-item__tags">${tags}</div>`;
}

async function loadTarjimalar() {
    const container = document.getElementById('tarjimalar-grid');
    if (!container) return;

    try {
        const dataUrl = (window.platformUrl || function (r) { return r; })('data/tarjimalar.json?v=20260812');
        const res = await fetch(dataUrl, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        allTarjimalar = Array.isArray(data.tarjimalar) ? data.tarjimalar : [];

        filteredTarjimalar = [...allTarjimalar];
        displayTarjimalar();
        updateTarjimalarResultsCount();
    } catch (error) {
        console.error('Tarjimalarni yuklashda xatolik:', error);
        container.innerHTML = `<p class="library-empty">Tarjimalar yuklanmadi. Keyinroq qayta urinib ko'ring.</p>`;
    }
}

function displayTarjimalar() {
    const container = document.getElementById('tarjimalar-grid');
    if (!container) return;

    if (filteredTarjimalar.length === 0) {
        const message = allTarjimalar.length === 0
            ? 'Tarjimalar hozircha qo\'shilmagan.'
            : uiT('asarlarEmptyTarjima');
        container.innerHTML = `<p class="library-empty">${message}</p>`;
        updateTarjimalarLoadMoreButton();
        return;
    }

    const visible = filteredTarjimalar.slice(0, tarjimalarDisplayLimit);

    container.innerHTML = visible.map(tarjima => {
        const author = tarjima.muallif || "G'afur G'ulom";
        const asl = tarjima.aslMuallif ? ` · ${tarjima.aslMuallif}` : '';
        const category = `${author} · Tarjima${asl}${tarjima.yil ? ` · ${tarjima.yil}` : ''}`;
        const readAction = `<button class="library-item__read" type="button" onclick="openTarjimaRead(${tarjima.id})">${uiT('read')}</button>`;

        return buildLibraryItem({
            id: tarjima.id,
            domId: `tarjima-card-${tarjima.id}`,
            title: tarjima.sarlavha,
            category,
            description: tarjima.qisqa || '',
            coverVariant: getCoverVariant(tarjima.id + 6),
            rasm: tarjima.rasm,
            readAction,
            showBookmark: false,
            tagsHtml: buildTarjimaTags(tarjima.teglar)
        });
    }).join('');

    updateTarjimalarLoadMoreButton();
}

function updateTarjimalarLoadMoreButton() {
    const btn = document.getElementById('tarjimalar-load-more-btn');
    if (!btn) return;

    if (filteredTarjimalar.length > tarjimalarDisplayLimit) {
        btn.classList.remove('is-hidden');
    } else {
        btn.classList.add('is-hidden');
    }
}

function initTarjimalarLoadMore() {
    const btn = document.getElementById('tarjimalar-load-more-btn');
    if (!btn) return;

    btn.addEventListener('click', function() {
        tarjimalarDisplayLimit += 10;
        displayTarjimalar();
    });
}

function initTarjimalarFilters() {
    bindLibrarySearchInput(document.getElementById('tarjimalar-search-input'), applyTarjimalarFilters);
}

function applyTarjimalarFilters() {
    const searchInput = document.getElementById('tarjimalar-search-input');
    const searchQuery = searchInput?.value || '';

    filteredTarjimalar = allTarjimalar.filter(tarjima => librarySearchMatches(searchQuery, [
        tarjima.sarlavha,
        tarjima.muallif,
        tarjima.aslMuallif,
        tarjima.qisqa,
        ...(Array.isArray(tarjima.teglar) ? tarjima.teglar : [])
    ]));

    tarjimalarDisplayLimit = 10;
    displayTarjimalar();
    updateTarjimalarResultsCount();
}

function updateTarjimalarResultsCount() {
    const count = document.getElementById('tarjimalar-results-count');
    if (!count) return;

    if (allTarjimalar.length === 0) {
        count.textContent = uiT('asarlarResultsEmptyTarjima', '0 ta tarjima topildi');
        return;
    }

    count.textContent = uiT('asarlarResultsTarjima', '{total} ta tarjimadan {shown} ta ko\'rsatilmoqda', {
        total: allTarjimalar.length,
        shown: filteredTarjimalar.length
    });
}

function openTarjimaRead(tarjimaId) {
    const tarjima = allTarjimalar.find(t => t.id === tarjimaId);
    if (!tarjima) return;

    currentReadingContext = { kind: 'tarjima', id: tarjimaId };
    trackContentOpened('tarjima', tarjimaId, tarjima.sarlavha, 'Tarjima', 25);

    if (tarjima.pdf) {
        openQissaPdfReader({
            ...tarjima,
            mavzu: tarjima.teglar || tarjima.mavzu || []
        });
        return;
    }

    showNotification('Bu tarjima uchun hozircha elektron fayl mavjud emas.', 'error');
}

// ===================================
// Tanlangan asarlar
// ===================================

async function loadTanlanganAsarlar() {
    const container = document.getElementById('tanlangan-asarlar-grid');
    if (!container) return;

    try {
        const dataUrl = (window.platformUrl || function (r) { return r; })('data/tanlangan-asarlar.json?v=20260819');
        const res = await fetch(dataUrl, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        allTanlanganAsarlar = Array.isArray(data.tanlanganAsarlar) ? data.tanlanganAsarlar : [];

        filteredTanlanganAsarlar = [...allTanlanganAsarlar];
        displayTanlanganAsarlar();
        updateTanlanganAsarlarResultsCount();
    } catch (error) {
        console.error('Tanlangan asarlarni yuklashda xatolik:', error);
        container.innerHTML = `<p class="library-empty">Tanlangan asarlar yuklanmadi. Keyinroq qayta urinib ko'ring.</p>`;
    }
}

function displayTanlanganAsarlar() {
    const container = document.getElementById('tanlangan-asarlar-grid');
    if (!container) return;

    if (filteredTanlanganAsarlar.length === 0) {
        const message = allTanlanganAsarlar.length === 0
            ? 'Tanlangan asarlar hozircha qo\'shilmagan.'
            : uiT('asarlarEmptyTanlangan');
        container.innerHTML = `<p class="library-empty">${message}</p>`;
        updateTanlanganAsarlarLoadMoreButton();
        return;
    }

    const visible = filteredTanlanganAsarlar.slice(0, tanlanganAsarlarDisplayLimit);

    container.innerHTML = visible.map(asar => {
        const category = asar.qisqaSarlavha || asar.muallif || '';
        const description = (asar.qisqaSarlavha
            ? [asar.nashr, asar.joy, asar.yil]
            : [asar.nashriyot, asar.joy, asar.yil]
        ).filter(Boolean).join(' · ');
        const readAction = `<button class="library-item__read" type="button" onclick="openTanlanganRead(${asar.id})">${uiT('read')}</button>`;

        return buildLibraryItem({
            id: asar.id,
            domId: `tanlangan-card-${asar.id}`,
            title: asar.sarlavha,
            category,
            description,
            coverVariant: getCoverVariant(asar.id + 8),
            rasm: asar.rasm,
            coverType: 'tanlangan',
            readAction,
            showBookmark: false
        });
    }).join('');

    updateTanlanganAsarlarLoadMoreButton();
}

function updateTanlanganAsarlarLoadMoreButton() {
    const btn = document.getElementById('tanlangan-asarlar-load-more-btn');
    if (!btn) return;

    if (filteredTanlanganAsarlar.length > tanlanganAsarlarDisplayLimit) {
        btn.classList.remove('is-hidden');
    } else {
        btn.classList.add('is-hidden');
    }
}

function initTanlanganAsarlarLoadMore() {
    const btn = document.getElementById('tanlangan-asarlar-load-more-btn');
    if (!btn) return;

    btn.addEventListener('click', function() {
        tanlanganAsarlarDisplayLimit += 10;
        displayTanlanganAsarlar();
    });
}

function initTanlanganAsarlarFilters() {
    bindLibrarySearchInput(document.getElementById('tanlangan-asarlar-search-input'), applyTanlanganAsarlarFilters);
}

function applyTanlanganAsarlarFilters() {
    const searchInput = document.getElementById('tanlangan-asarlar-search-input');
    const searchQuery = searchInput?.value || '';

    filteredTanlanganAsarlar = allTanlanganAsarlar.filter(asar => librarySearchMatches(searchQuery, [
        asar.sarlavha,
        asar.qisqaSarlavha,
        asar.nashr,
        asar.muallif,
        asar.nashriyot,
        asar.joy
    ]));

    tanlanganAsarlarDisplayLimit = 10;
    displayTanlanganAsarlar();
    updateTanlanganAsarlarResultsCount();
}

function updateTanlanganAsarlarResultsCount() {
    const count = document.getElementById('tanlangan-asarlar-results-count');
    if (!count) return;

    if (allTanlanganAsarlar.length === 0) {
        count.textContent = uiT('asarlarResultsEmptyTanlangan', '0 ta asar topildi');
        return;
    }

    count.textContent = uiT('asarlarResultsTanlangan', '{total} ta asardan {shown} ta ko\'rsatilmoqda', {
        total: allTanlanganAsarlar.length,
        shown: filteredTanlanganAsarlar.length
    });
}

function openTanlanganRead(asarId) {
    const asar = allTanlanganAsarlar.find(a => a.id === asarId);
    if (!asar) return;

    currentReadingContext = { kind: 'book', id: asarId };
    trackContentOpened('book', asarId, asar.sarlavha, 'Tanlangan asar', 25);

    if (asar.pdf) {
        openQissaPdfReader({
            ...asar,
            mavzu: asar.qisqaSarlavha
                ? [asar.qisqaSarlavha]
                : (asar.muallif ? [asar.muallif] : [])
        });
        return;
    }

    showNotification('Bu asar uchun hozircha elektron fayl mavjud emas.', 'error');
}

window.openQissaRead = openQissaRead;
window.openTarjimaRead = openTarjimaRead;
window.openTanlanganRead = openTanlanganRead;
