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
let displayLimit = 10;
let qissalarDisplayLimit = 10;
let tarjimalarDisplayLimit = 10;
let tanlanganAsarlarDisplayLimit = 10;

const BOOKMARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`;

function getCoverVariant(id) {
    const variants = ['', 'library-item__cover--gold', 'library-item__cover--slate'];
    return variants[id % 3];
}

function buildLibraryItem({ id, title, category, description, coverVariant, coverSrc, readAction, showBookmark = true, tagsHtml = '' }) {
    const favActive = isFavorite(id);
    const bookmark = showBookmark ? `
                <button class="library-item__bookmark favorite-btn ${favActive ? 'active' : ''}"
                        type="button"
                        aria-label="${favActive ? 'Sevimlilardan olib tashlash' : 'Sevimlilarga qo\'shish'}"
                        onclick="toggleFavorite(${id}); event.stopPropagation();">
                    ${BOOKMARK_SVG}
                </button>` : '';

    const coverInner = coverSrc
        ? `<img class="library-item__cover-img" src="${coverSrc}" alt="" loading="lazy">`
        : `<span class="library-item__cover-label">${title}</span>`;

    return `
        <article class="library-item" data-id="${id}">
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
                ${bookmark}
            </div>
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
});

// ===================================
// Check URL Parameters
// ===================================
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && ['sherlar', 'dostonlar', 'qissalar', 'tarjimalar', 'tanlangan-asarlar'].includes(tab)) {
        switchTab(tab, false);
    }

    const poemId = urlParams.get('id') || urlParams.get('poem');
    
    if (poemId) {
        const id = parseInt(poemId);
        const poem = allPoems.find(p => p.id === id);
        if (poem) {
            switchTab('sherlar', false);
            setTimeout(() => openPoemModal(id), 500);
        }
    }

    const qissaId = urlParams.get('qissa');
    if (qissaId) {
        const id = parseInt(qissaId, 10);
        switchTab('qissalar', false);
        setTimeout(() => openQissaRead(id), 500);
    }

    const tarjimaId = urlParams.get('tarjima');
    if (tarjimaId) {
        const id = parseInt(tarjimaId, 10);
        switchTab('tarjimalar', false);
        setTimeout(() => openTarjimaRead(id), 500);
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
        container.innerHTML = `<p class="library-empty">Hech qanday she'r topilmadi. Filtrlarni o'zgartiring.</p>`;
        updateLoadMoreButton();
        return;
    }

    const visiblePoems = filteredPoems.slice(0, displayLimit);

    container.innerHTML = visiblePoems.map(poem => {
        const category = `${poem.mavzu[0] || 'She\'r'} · She'r · ${poem.yil}`;
        const readAction = `<button class="library-item__read" type="button" onclick="openPoemModal(${poem.id})">O'qish</button>`;

        return buildLibraryItem({
            id: poem.id,
            title: poem.sarlavha,
            category,
            description: poem.qisqa,
            coverVariant: getCoverVariant(poem.id),
            readAction
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
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', function() {
        applyFilters();
    });

    const filterToggle = document.getElementById('filter-toggle');
    const filterPanel = document.getElementById('filter-panel');
    if (filterToggle && filterPanel) {
        filterToggle.addEventListener('click', function() {
            const isOpen = filterPanel.classList.toggle('is-open');
            filterToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    const mavzuButtons = document.querySelectorAll('.filter-btn[data-mavzu]');
    mavzuButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            mavzuButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            applyFilters();
        });
    });

    const yearSelect = document.getElementById('year-filter');
    yearSelect.addEventListener('change', applyFilters);

    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            viewButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const view = this.getAttribute('data-view');
            const grid = document.getElementById('poems-grid');
            if (view === 'grid') {
                grid.classList.add('library-list--grid');
            } else {
                grid.classList.remove('library-list--grid');
            }
        });
    });
}

function applyFilters() {
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    const activeMavzu = document.querySelector('.filter-btn.active[data-mavzu]').getAttribute('data-mavzu');
    const yearRange = document.getElementById('year-filter').value;
    
    filteredPoems = allPoems.filter(poem => {
        // Search filter
        const matchesSearch = poem.sarlavha.toLowerCase().includes(searchQuery) ||
                            poem.matn.toLowerCase().includes(searchQuery);
        
        // Mavzu filter
        let matchesMavzu = true;
        if (activeMavzu === 'favorites') {
            matchesMavzu = isFavorite(poem.id);
        } else if (activeMavzu !== 'all') {
            matchesMavzu = poem.mavzu.includes(activeMavzu);
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
    count.textContent = `${allPoems.length} ta she'rdan ${filteredPoems.length} ta ko'rsatilmoqda`;
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
    if (isFavorite(poemId)) {
        favorites = favorites.filter(id => id !== poemId);
    } else {
        favorites.push(poemId);
    }
    saveFavorites();
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

function openPoemModal(poemId) {
    const poem = allPoems.find(p => p.id === poemId);
    if (!poem) return;

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
}

function closeModal() {
    const modal = document.getElementById('poem-modal');
    modal.classList.remove('active');
    modal.classList.remove('modal--pdf');
    document.body.style.overflow = 'auto';
    currentPoemId = null;

    const modalText = document.getElementById('modal-text');
    if (modalText) {
        modalText.innerHTML = '';
        modalText.textContent = '';
    }
}

function updateFavoriteButton() {
    const btn = document.getElementById('favorite-modal-btn');
    if (isFavorite(currentPoemId)) {
        btn.textContent = '❤️ Sevimlilardan olib tashlash';
    } else {
        btn.textContent = "❤️ Sevimlilarga qo'shish";
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
// ===================================
// Doston modalini ochish
// ===================================
async function openDostonModal(dostonId) {

    const dostonlar = await getDostonlar();
    const doston = dostonlar.find(d => d.id === dostonId);

    if (!doston) return;

    const modal = document.getElementById('poem-modal');
    modal.classList.remove('modal--pdf');

    document.getElementById('modal-title').textContent = doston.sarlavha;
    document.getElementById('modal-year').textContent = doston.yil;
    document.getElementById('modal-badges').innerHTML =
        doston.mavzu.map(m => `<span class="badge">${m}</span>`).join('');

    const modalText = document.getElementById('modal-text');
    modalText.innerHTML = '';
    modalText.textContent = doston.matn;

    document.getElementById('poem-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
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
            const category = `${doston.mavzu[0] || 'Doston'} · Doston · ${doston.yil}`;
            const readAction = `<button class="library-item__read" type="button" onclick="openDostonModal(${doston.id})">O'qish</button>`;

            return buildLibraryItem({
                id: doston.id,
                title: doston.sarlavha,
                category,
                description: doston.qisqa,
                coverVariant: getCoverVariant(doston.id + 2),
                readAction,
                showBookmark: false
            });
        }).join('');

    } catch (error) {
        console.error("Dostonlarni yuklashda xatolik:", error);
    }

}

// ===================================
// Qissalar
// ===================================
function resolveAssetPath(path) {
    if (!path) return '';
    return (window.platformUrl || function (r) { return r; })(path);
}

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

    chips.innerHTML = `<button class="filter-btn active" type="button" data-qissa-mavzu="all">Barchasi</button>` +
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
            : 'Hech qanday qissa topilmadi. Filtrlarni o\'zgartiring.';
        container.innerHTML = `<p class="library-empty">${message}</p>`;
        updateQissalarLoadMoreButton();
        return;
    }

    const visible = filteredQissalar.slice(0, qissalarDisplayLimit);

    container.innerHTML = visible.map(qissa => {
        const author = qissa.muallif || "G'afur G'ulom";
        const category = `${author} · Qissa · ${qissa.yil || ''}`.replace(/ · $/, '');
        const readAction = `<button class="library-item__read" type="button" onclick="openQissaRead(${qissa.id})">O'qish</button>`;
        const coverSrc = qissa.rasm ? resolveAssetPath(qissa.rasm) : '';

        return buildLibraryItem({
            id: qissa.id,
            title: qissa.sarlavha,
            category,
            description: qissa.qisqa || '',
            coverVariant: getCoverVariant(qissa.id + 4),
            coverSrc,
            readAction,
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
    const searchInput = document.getElementById('qissalar-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', applyQissalarFilters);
    }

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
    const searchQuery = (searchInput?.value || '').toLowerCase();
    const activeChip = document.querySelector('.filter-btn.active[data-qissa-mavzu]');
    const activeMavzu = activeChip ? activeChip.getAttribute('data-qissa-mavzu') : 'all';
    const yearRange = document.getElementById('qissalar-year-filter')?.value || 'all';

    filteredQissalar = allQissalar.filter(qissa => {
        const searchBlob = [
            qissa.sarlavha,
            qissa.muallif,
            qissa.qisqa,
            qissa.matn,
            ...(Array.isArray(qissa.boblar) ? qissa.boblar.map(b => b.sarlavha) : []),
            ...(Array.isArray(qissa.mavzu) ? qissa.mavzu : []),
            ...(Array.isArray(qissa.teglar) ? qissa.teglar : [])
        ].filter(Boolean).join(' ').toLowerCase();

        const matchesSearch = !searchQuery || searchBlob.includes(searchQuery);

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
        count.textContent = '0 ta qissa topildi';
        return;
    }

    count.textContent = `${allQissalar.length} ta qissadan ${filteredQissalar.length} ta ko'rsatilmoqda`;
}

function openQissaRead(qissaId) {
    const qissa = allQissalar.find(q => q.id === qissaId);
    if (!qissa) return;

    if (qissa.pdf) {
        openQissaPdfReader(qissa);
        return;
    }

    if (qissa.matn) {
        openQissaModal(qissaId);
        return;
    }

    showNotification('Bu qissa uchun hozircha elektron fayl mavjud emas.', 'error');
}

function openQissaPdfReader(qissa, startPage) {
    currentPoemId = null;

    const pdfUrl = resolveAssetPath(qissa.pdf);
    const page = startPage || 1;
    const modal = document.getElementById('poem-modal');
    const modalText = document.getElementById('modal-text');

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
            <a class="qissa-reader__external" href="${pdfUrl}" target="_blank" rel="noopener noreferrer">PDF ni yangi oynada ochish</a>
        </p>`;

    modalText.querySelectorAll('.qissa-reader__chapter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetPage = this.getAttribute('data-page');
            const frame = modalText.querySelector('.qissa-reader__frame');
            if (frame) frame.src = `${pdfUrl}#page=${targetPage}`;
            modalText.querySelectorAll('.qissa-reader__chapter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    modal.classList.add('modal--pdf');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function openQissaModal(qissaId) {
    const qissa = allQissalar.find(q => q.id === qissaId);
    if (!qissa) return;

    currentPoemId = null;

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
            : 'Hech qanday tarjima topilmadi. Qidiruvni o\'zgartiring.';
        container.innerHTML = `<p class="library-empty">${message}</p>`;
        updateTarjimalarLoadMoreButton();
        return;
    }

    const visible = filteredTarjimalar.slice(0, tarjimalarDisplayLimit);

    container.innerHTML = visible.map(tarjima => {
        const author = tarjima.muallif || "G'afur G'ulom";
        const asl = tarjima.aslMuallif ? ` · ${tarjima.aslMuallif}` : '';
        const category = `${author} · Tarjima${asl}${tarjima.yil ? ` · ${tarjima.yil}` : ''}`;
        const readAction = `<button class="library-item__read" type="button" onclick="openTarjimaRead(${tarjima.id})">O'qish</button>`;
        const coverSrc = tarjima.rasm ? resolveAssetPath(tarjima.rasm) : '';

        return buildLibraryItem({
            id: tarjima.id,
            title: tarjima.sarlavha,
            category,
            description: tarjima.qisqa || '',
            coverVariant: getCoverVariant(tarjima.id + 6),
            coverSrc,
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
    const searchInput = document.getElementById('tarjimalar-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', applyTarjimalarFilters);
    }
}

function applyTarjimalarFilters() {
    const searchInput = document.getElementById('tarjimalar-search-input');
    const searchQuery = (searchInput?.value || '').toLowerCase();

    filteredTarjimalar = allTarjimalar.filter(tarjima => {
        const searchBlob = [
            tarjima.sarlavha,
            tarjima.muallif,
            tarjima.aslMuallif,
            tarjima.qisqa,
            ...(Array.isArray(tarjima.teglar) ? tarjima.teglar : [])
        ].filter(Boolean).join(' ').toLowerCase();

        return !searchQuery || searchBlob.includes(searchQuery);
    });

    tarjimalarDisplayLimit = 10;
    displayTarjimalar();
    updateTarjimalarResultsCount();
}

function updateTarjimalarResultsCount() {
    const count = document.getElementById('tarjimalar-results-count');
    if (!count) return;

    if (allTarjimalar.length === 0) {
        count.textContent = '0 ta tarjima topildi';
        return;
    }

    count.textContent = `${allTarjimalar.length} ta tarjimadan ${filteredTarjimalar.length} ta ko'rsatilmoqda`;
}

function openTarjimaRead(tarjimaId) {
    const tarjima = allTarjimalar.find(t => t.id === tarjimaId);
    if (!tarjima) return;

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
        const dataUrl = (window.platformUrl || function (r) { return r; })('data/tanlangan-asarlar.json?v=20260813');
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
            : 'Hech qanday asar topilmadi. Qidiruvni o\'zgartiring.';
        container.innerHTML = `<p class="library-empty">${message}</p>`;
        updateTanlanganAsarlarLoadMoreButton();
        return;
    }

    const visible = filteredTanlanganAsarlar.slice(0, tanlanganAsarlarDisplayLimit);

    container.innerHTML = visible.map(asar => {
        const category = asar.qisqaSarlavha || '';
        const description = [asar.nashr, asar.joy, asar.yil].filter(Boolean).join(' · ');
        const readAction = `<button class="library-item__read" type="button" onclick="openTanlanganRead(${asar.id})">O'qish</button>`;
        const coverSrc = asar.rasm ? resolveAssetPath(asar.rasm) : '';

        return buildLibraryItem({
            id: asar.id,
            title: asar.sarlavha,
            category,
            description,
            coverVariant: getCoverVariant(asar.id + 8),
            coverSrc,
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
    const searchInput = document.getElementById('tanlangan-asarlar-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', applyTanlanganAsarlarFilters);
    }
}

function applyTanlanganAsarlarFilters() {
    const searchInput = document.getElementById('tanlangan-asarlar-search-input');
    const searchQuery = (searchInput?.value || '').toLowerCase();

    filteredTanlanganAsarlar = allTanlanganAsarlar.filter(asar => {
        const searchBlob = [
            asar.sarlavha,
            asar.qisqaSarlavha,
            asar.nashr
        ].filter(Boolean).join(' ').toLowerCase();

        return !searchQuery || searchBlob.includes(searchQuery);
    });

    tanlanganAsarlarDisplayLimit = 10;
    displayTanlanganAsarlar();
    updateTanlanganAsarlarResultsCount();
}

function updateTanlanganAsarlarResultsCount() {
    const count = document.getElementById('tanlangan-asarlar-results-count');
    if (!count) return;

    if (allTanlanganAsarlar.length === 0) {
        count.textContent = '0 ta asar topildi';
        return;
    }

    count.textContent = `${allTanlanganAsarlar.length} ta asardan ${filteredTanlanganAsarlar.length} ta ko'rsatilmoqda`;
}

function openTanlanganRead(asarId) {
    const asar = allTanlanganAsarlar.find(a => a.id === asarId);
    if (!asar) return;

    if (asar.pdf) {
        openQissaPdfReader({
            ...asar,
            mavzu: asar.qisqaSarlavha ? [asar.qisqaSarlavha] : []
        });
        return;
    }

    showNotification('Bu asar uchun hozircha elektron fayl mavjud emas.', 'error');
}

window.openQissaRead = openQissaRead;
window.openTarjimaRead = openTarjimaRead;
window.openTanlanganRead = openTanlanganRead;
