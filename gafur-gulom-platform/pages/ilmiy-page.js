// ===================================
// Ilmiy Arxiv — JavaScript (Phase 8)
// IA + functionality preserved
// ===================================

let ilmiyData = { maqolalar: [], dissertatsiyalar: [], tadqiqotlar: [], atamalar: [], bibliografiya: [] };
let selectedArticles = [];
let selectedFormat = 'apa';

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function resolveAssetPath(path) {
    if (!path || path === '#') return '';
    if (/^(https?:)?\/\//i.test(path)) return path;
    const relative = String(path).trim().replace(/^\/+/, '');
    const encoded = relative.split('/').map(encodeURIComponent).join('/');
    return (window.platformUrl || function (r) { return r; })(encoded);
}

const platformTranslate = window.PlatformI18n?.t || null;

const uiT = (key, fallback, vars) => {
    return platformTranslate ? platformTranslate(key, fallback, vars) : (fallback ?? key);
};

function refreshIlmiyUI() {
    renderHeroStats();
    const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab;
    if (activeTab === 'maqolalar') displayArticles(ilmiyData.maqolalar);
    else if (activeTab === 'dissertatsiyalar') displayDissertations(ilmiyData.dissertatsiyalar);
    else if (activeTab === 'tadqiqotlar') displayResearch(ilmiyData.tadqiqotlar || []);
    else if (activeTab === 'lugat') { displayTerms(ilmiyData.atamalar); createAlphabetNav(); }
    else if (activeTab === 'bibliografiya') displayBibliography(ilmiyData.bibliografiya || []);
    updateSelectedCount();
    window.PlatformI18n?.apply(document);
}

function updateSelectedCount() {
    const el = document.getElementById('selected-count');
    if (el) {
        el.textContent = uiT('ilmSelectedSources', 'Tanlangan manbalar: {count}', { count: selectedArticles.length });
    }
}

function renderHeroStats() {
    const el = document.getElementById('ilm-hero-stats');
    if (!el) return;

    const t = (k) => window.PlatformI18n?.t(k) ?? k;
    const chips = [
        { num: ilmiyData.maqolalar.length, label: t('ilmStatArticle'), icon: '📄' },
        { num: ilmiyData.dissertatsiyalar.length, label: t('ilmStatDiss'), icon: '🎓' },
        { num: (ilmiyData.tadqiqotlar || []).length, label: t('ilmStatResearch'), icon: '🔬' },
        { num: ilmiyData.atamalar.length, label: t('ilmStatTerm'), icon: '📖' }
    ];

    el.innerHTML = chips.map(chip => `
        <div class="ilm-stat-chip">
            <span class="ilm-stat-chip__icon" aria-hidden="true">${chip.icon}</span>
            <div class="ilm-stat-chip__body">
                <span class="ilm-stat-chip__num">${chip.num}</span>
                <span class="ilm-stat-chip__label">${chip.label}</span>
            </div>
        </div>
    `).join('');
}

// ===================================
// TABS
// ===================================

function activateIlmiyTab(tab) {
    const btn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
    if (!btn) return;
    btn.click();
}

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const tab = this.dataset.tab;

        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        this.classList.add('active');
        document.querySelector(`.tab-content[data-tab="${tab}"]`).classList.add('active');

        if (tab === 'maqolalar') {
            displayArticles(ilmiyData.maqolalar);
        } else if (tab === 'dissertatsiyalar') {
            displayDissertations(ilmiyData.dissertatsiyalar);
        } else if (tab === 'tadqiqotlar') {
            displayResearch(ilmiyData.tadqiqotlar || []);
        } else if (tab === 'lugat') {
            displayTerms(ilmiyData.atamalar);
            createAlphabetNav();
        } else if (tab === 'bibliografiya') {
            displayBibliography(ilmiyData.bibliografiya || []);
        }
    });
});

// ===================================
// MAQOLALAR (ARTICLES)
// ===================================

function displayArticles(articles) {
    const container = document.getElementById('articles-container');
    if (!container) return;

    if (!articles.length) {
        container.innerHTML = `<p class="ilm-empty">${uiT('ilmEmptyArticle', 'Maqola topilmadi.')}</p>`;
        return;
    }

    container.innerHTML = articles.map(article => {
        const pdfUrl = article.pdf ? resolveAssetPath(article.pdf) : '';
        const hasPdf = Boolean(article.pdf || (article.pdfHavola && article.pdfHavola !== '#'));
        const typeBadge = escapeHtml(article.tur || article.til);
        const manbaHtml = article.manba
            ? `<p class="ilm-paper__source">🔗 <a class="ilm-paper__source-link" href="${escapeHtml(article.manba)}" target="_blank" rel="noopener noreferrer">Rasmiy manba (samdu.uz)</a></p>`
            : '';
        const downloadAction = pdfUrl
            ? `<a class="ilm-btn-outline" href="${escapeHtml(pdfUrl)}" download target="_blank" rel="noopener noreferrer">Yuklab olish</a>`
            : '';

        return `
        <article class="ilm-paper" id="ilm-article-${article.id}">
            <div class="ilm-paper__head">
                <h3 class="ilm-paper__title">${escapeHtml(article.sarlavha)}</h3>
                <label class="ilm-paper__select">
                    <input type="checkbox" class="cite-checkbox" data-id="${article.id}"
                           onchange="toggleArticleSelection(${article.id})"
                           ${selectedArticles.includes(article.id) ? 'checked' : ''}>
                    Tanlash
                </label>
            </div>

            <div class="ilm-paper__meta">
                <span class="ilm-paper__meta-item">👤 <strong>${escapeHtml(article.mualliflar.join(', '))}</strong></span>
                <span class="ilm-paper__meta-item">🏛 ${escapeHtml(article.nashriyot)}</span>
                <span class="ilm-paper__meta-item">📅 ${article.yil}</span>
                <span class="ilm-badge">${typeBadge}</span>
            </div>

            <p class="ilm-paper__abstract">${escapeHtml(article.annotatsiya)}</p>
            ${manbaHtml}

            <div class="ilm-paper__keywords">
                ${article.kalitSozlar.map(kw => `<span class="ilm-keyword">${escapeHtml(kw)}</span>`).join('')}
            </div>

            <div class="ilm-paper__actions">
                <button class="ilm-btn-primary" type="button" onclick="openPdf(${article.id})" ${hasPdf ? '' : 'disabled'}>${hasPdf ? 'PDFni ochish' : 'PDF'}</button>
                ${downloadAction}
                <button class="ilm-btn-outline ilm-btn-gold" type="button" onclick="quickCite(${article.id})">Iqtibos</button>
                <button class="ilm-btn-outline" type="button" onclick="shareArticle(${article.id})">Ulashish</button>
            </div>
        </article>
    `;
    }).join('');
}

function openPdf(id) {
    const article = ilmiyData.maqolalar.find(a => a.id === id);
    if (!article) return;

    if (article.pdf) {
        openIlmPdfModal(article);
        return;
    }

    if (article.pdfHavola && article.pdfHavola !== '#') {
        window.open(article.pdfHavola, '_blank', 'noopener,noreferrer');
    } else {
        alert('PDF hozircha mavjud emas. Tez kunda qo\'shiladi.');
    }
}

function shareArticle(id) {
    const article = ilmiyData.maqolalar.find(a => a.id === id);
    const text = article ? `${article.sarlavha} — ${window.location.href}` : window.location.href;

    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            alert('Havola nusxa olindi.');
        }).catch(() => {
            alert(text);
        });
    } else {
        alert(text);
    }
}

function applyFilters() {
    const search = document.getElementById('search-input').value.toLowerCase();
    const lang = document.getElementById('filter-lang').value;
    const yearFrom = parseInt(document.getElementById('filter-year-from').value, 10) || 1960;
    const yearTo = parseInt(document.getElementById('filter-year-to').value, 10) || 2024;

    const filtered = ilmiyData.maqolalar.filter(article => {
        const matchSearch = search === '' ||
            article.sarlavha.toLowerCase().includes(search) ||
            article.mualliflar.some(m => m.toLowerCase().includes(search));

        const matchLang = lang === 'all' || article.til === lang;
        const matchYear = article.yil >= yearFrom && article.yil <= yearTo;

        return matchSearch && matchLang && matchYear;
    });

    displayArticles(filtered);
}

function resetFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('filter-lang').value = 'all';
    document.getElementById('filter-year-from').value = '';
    document.getElementById('filter-year-to').value = '';
    displayArticles(ilmiyData.maqolalar);
}

function toggleArticleSelection(id) {
    const checkbox = document.querySelector(`.cite-checkbox[data-id="${id}"]`);

    if (checkbox?.checked) {
        if (!selectedArticles.includes(id)) selectedArticles.push(id);
    } else {
        selectedArticles = selectedArticles.filter(aid => aid !== id);
    }

    updateSelectedCount();
}

function updateSelectedCount() {
    const countEl = document.getElementById('count');
    if (countEl) countEl.textContent = selectedArticles.length;
    updateSelectedCount();
}

function quickCite(id) {
    const article = ilmiyData.maqolalar.find(a => a.id === id);
    if (!article) return;

    const citation = formatCitation(article, 'apa');

    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(citation).then(() => {
            alert('Iqtibos nusxa olindi:\n\n' + citation);
        });
    } else {
        alert('Iqtibos:\n\n' + citation);
    }
}

// ===================================
// DISSERTATSIYALAR
// ===================================

function displayDissertations(dissertations) {
    const container = document.getElementById('dissertations-container');
    if (!container) return;

    if (!dissertations.length) {
        container.innerHTML = `<p class="ilm-empty">${uiT('ilmEmptyDiss', 'Dissertatsiya topilmadi.')}</p>`;
        return;
    }

    container.innerHTML = dissertations.map(diss => {
        const readAction = diss.pdf
            ? `<div class="ilm-paper__actions"><button class="ilm-btn-primary" type="button" onclick="openDissertationPdf(${diss.id})">O'qish</button></div>`
            : '';
        const kafedraLine = diss.kafedraMudiri
            ? `<strong>Kafedra mudiri:</strong> ${escapeHtml(diss.kafedraMudiri)}<br>`
            : '';

        return `
        <article class="ilm-paper" id="ilm-dissertation-${diss.id}">
            <h3 class="ilm-paper__title">${escapeHtml(diss.sarlavha)}</h3>
            <div class="ilm-paper__meta">
                <span class="ilm-paper__meta-item">👤 <strong>${escapeHtml(diss.muallif)}</strong></span>
                <span class="ilm-paper__meta-item">📅 ${diss.yil}</span>
                <span class="ilm-badge">${escapeHtml(diss.daraja)}</span>
            </div>
            <p class="ilm-paper__abstract">
                <strong>Ilmiy rahbar:</strong> ${escapeHtml(diss.ilmiyRahbar)}<br>
                ${kafedraLine}
                <strong>Muassasa:</strong> ${escapeHtml(diss.muassasa || diss.joy || '')}
            </p>
            ${readAction}
        </article>
    `;
    }).join('');
}

function openDissertationPdf(id) {
    const item = (ilmiyData.dissertatsiyalar || []).find(entry => entry.id === id);
    openIlmPdfModal(item);
}

document.getElementById('diss-search')?.addEventListener('input', function() {
    const search = this.value.toLowerCase();
    const filtered = ilmiyData.dissertatsiyalar.filter(diss =>
        diss.muallif.toLowerCase().includes(search) ||
        diss.sarlavha.toLowerCase().includes(search)
    );
    displayDissertations(filtered);
});

// ===================================
// ILMIY TADQIQOTLAR
// ===================================

function displayResearch(items) {
    const container = document.getElementById('research-container');
    if (!container) return;

    if (!items.length) {
        container.innerHTML = `<p class="ilm-empty">${uiT('ilmEmptyResearch', 'Ilmiy tadqiqot topilmadi.')}</p>`;
        return;
    }

    container.innerHTML = items.map(item => {
        const authorMeta = item.muallif
            ? `<span class="ilm-paper__meta-item">👤 <strong>${escapeHtml(item.muallif)}</strong></span>`
            : '';
        const yearMeta = item.yil
            ? `<span class="ilm-paper__meta-item">📅 ${item.yil}</span>`
            : '';

        return `
        <article class="ilm-paper" id="ilm-research-${item.id}">
            <h3 class="ilm-paper__title">${escapeHtml(item.sarlavha)}</h3>
            <div class="ilm-paper__meta">
                ${authorMeta}
                ${yearMeta}
                <span class="ilm-badge">${escapeHtml(item.tur || 'Ilmiy tadqiqot')}</span>
            </div>
            <p class="ilm-paper__abstract">${escapeHtml(item.qisqa || '')}</p>
            <div class="ilm-paper__actions">
                <button class="ilm-btn-primary" type="button" onclick="openResearchPdf(${item.id})">O'qish</button>
            </div>
        </article>
    `;
    }).join('');
}

function openResearchPdf(id) {
    const item = (ilmiyData.tadqiqotlar || []).find(entry => entry.id === id);
    openIlmPdfModal(item);
}

function openIlmPdfModal(item) {
    if (!item) return;

    const pdfPath = item.pdf || item.pdfHavola;
    if (!pdfPath || pdfPath === '#') {
        alert('PDF hozircha mavjud emas. Tez kunda qo\'shiladi.');
        return;
    }

    const pdfUrl = resolveAssetPath(pdfPath);
    const modal = document.getElementById('ilm-pdf-modal');
    const frame = document.getElementById('ilm-pdf-frame');
    const title = document.getElementById('ilm-pdf-title');
    const external = document.getElementById('ilm-pdf-external');

    if (!modal || !frame || !title) return;

    title.textContent = item.sarlavha;
    frame.src = `${pdfUrl}#page=1`;
    if (external) {
        external.href = pdfUrl;
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeResearchPdfModal() {
    const modal = document.getElementById('ilm-pdf-modal');
    const frame = document.getElementById('ilm-pdf-frame');
    if (!modal) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (frame) frame.src = '';
}

function initResearchPdfModal() {
    document.getElementById('ilm-pdf-close')?.addEventListener('click', closeResearchPdfModal);
    document.getElementById('ilm-pdf-backdrop')?.addEventListener('click', closeResearchPdfModal);

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeResearchPdfModal();
        }
    });
}

document.getElementById('research-search')?.addEventListener('input', function() {
    const search = this.value.toLowerCase();
    const filtered = (ilmiyData.tadqiqotlar || []).filter(item => {
        const author = (item.muallif || '').toLowerCase();
        const title = (item.sarlavha || '').toLowerCase();
        const summary = (item.qisqa || '').toLowerCase();
        const type = (item.tur || '').toLowerCase();
        return title.includes(search) ||
            author.includes(search) ||
            summary.includes(search) ||
            type.includes(search);
    });
    displayResearch(filtered);
});

// ===================================
// ATAMALAR LUG'ATI
// ===================================

function createAlphabetNav() {
    const alphabet = ['A', 'B', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
        'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z', 'O\'', 'G\'', 'SH', 'CH'];
    const container = document.getElementById('alphabet-nav');
    if (!container) return;

    container.innerHTML = alphabet.map(letter => `
        <button class="letter-btn" type="button" data-letter="${escapeHtml(letter)}">${escapeHtml(letter)}</button>
    `).join('');

    container.querySelectorAll('.letter-btn').forEach(btn => {
        btn.addEventListener('click', () => filterByLetter(btn.dataset.letter));
    });
}

function filterByLetter(letter) {
    const filtered = ilmiyData.atamalar.filter(term =>
        term.atama.toUpperCase().startsWith(letter.toUpperCase())
    );
    displayTerms(filtered);

    document.querySelectorAll('.letter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent === letter);
    });
}

function displayTerms(terms) {
    const container = document.getElementById('terms-container');
    if (!container) return;

    if (!terms.length) {
        container.innerHTML = `<p class="ilm-empty">${uiT('ilmEmptyTerm', 'Atama topilmadi.')}</p>`;
        return;
    }

    container.innerHTML = terms.map(term => `
        <article class="term-card" id="ilm-term-${term.id}">
            <h3 class="term-title">${escapeHtml(term.atama)}</h3>
            <p class="term-pronunciation">[${escapeHtml(term.talaffuz)}]</p>
            <p class="term-definition">${escapeHtml(term.tarif)}</p>
            <p class="term-example"><strong>Misol:</strong> ${escapeHtml(term.misol)}</p>
        </article>
    `).join('');
}

document.getElementById('term-search')?.addEventListener('input', function() {
    const search = this.value.toLowerCase();

    if (search === '') {
        displayTerms(ilmiyData.atamalar);
        document.querySelectorAll('.letter-btn').forEach(btn => btn.classList.remove('active'));
        return;
    }

    const filtered = ilmiyData.atamalar.filter(term =>
        term.atama.toLowerCase().includes(search) ||
        term.tarif.toLowerCase().includes(search)
    );
    displayTerms(filtered);
});

// ===================================
// BIBLIOGRAFIYA
// ===================================

function displayBibliography(items) {
    const container = document.getElementById('bibliografiya-container');
    if (!container) return;

    if (!items.length) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = items.map(item => {
        const authorMeta = item.muallif
            ? `<span class="ilm-paper__meta-item">👤 <strong>${escapeHtml(item.muallif)}</strong></span>`
            : '';
        const yearMeta = item.yil
            ? `<span class="ilm-paper__meta-item">📅 ${item.yil}</span>`
            : '';
        const placeMeta = item.joy
            ? `<span class="ilm-paper__meta-item">📍 ${escapeHtml(item.joy)}</span>`
            : '';

        return `
        <article class="ilm-paper" id="ilm-biblio-${item.id}">
            <h3 class="ilm-paper__title">${escapeHtml(item.sarlavha)}</h3>
            <div class="ilm-paper__meta">
                ${authorMeta}
                ${yearMeta}
                ${placeMeta}
                <span class="ilm-badge">Kitob</span>
            </div>
            <p class="ilm-paper__abstract">${escapeHtml(item.nashriyot || '')}</p>
            <div class="ilm-paper__actions">
                <button class="ilm-btn-primary" type="button" onclick="openBibliographyPdf(${item.id})">O'qish</button>
            </div>
        </article>
    `;
    }).join('');
}

function openBibliographyPdf(id) {
    const item = (ilmiyData.bibliografiya || []).find(entry => entry.id === id);
    openIlmPdfModal(item);
}

// ===================================
// BIBLIOGRAFIYA GENERATOR
// ===================================

document.querySelectorAll('.format-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        selectedFormat = this.dataset.format;
    });
});

function generateBibliography() {
    if (!selectedArticles.length) {
        alert('Iltimos, kamida bitta maqola tanlang!\n\nMaqolalar bo\'limiga o\'ting va kerakli maqolalarni belgilang.');
        return;
    }

    const citations = selectedArticles
        .map(id => ilmiyData.maqolalar.find(a => a.id === id))
        .filter(Boolean)
        .map(article => formatCitation(article, selectedFormat))
        .join('\n\n');

    document.getElementById('bibliography-output').textContent = citations;
    document.getElementById('bibliography-output').style.display = 'block';
    document.getElementById('bibliography-actions').style.display = 'block';
}

function formatCitation(article, format) {
    const authors = article.mualliflar.join(', ');
    const firstAuthor = article.mualliflar[0];
    const year = article.yil;
    const title = article.sarlavha;
    const publisher = article.nashriyot;

    switch (format) {
        case 'apa':
            return `${firstAuthor} (${year}). ${title}. ${publisher}.`;
        case 'mla':
            return `${firstAuthor}. "${title}." ${publisher}, ${year}.`;
        case 'gost':
            return `${firstAuthor}. ${title}. ${publisher}, ${year}.`;
        case 'uzbek':
            return `${authors}. ${title} // ${publisher}. – ${year}.`;
        default:
            return `${authors}. ${title}. ${publisher}, ${year}.`;
    }
}

function copyToClipboard() {
    const text = document.getElementById('bibliography-output').textContent;

    navigator.clipboard.writeText(text).then(() => {
        alert(uiT('ilmPdfCopied', 'Bibliografiya nusxa olindi!'));
    }).catch(() => {
        alert(uiT('ilmCopyError', 'Nusxa olishda xatolik yuz berdi.'));
    });
}

function exportToWord() {
    const text = document.getElementById('bibliography-output').textContent;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'bibliografiya.txt';
    link.click();
    URL.revokeObjectURL(link.href);

    alert(uiT('ilmFileDownloaded', 'Fayl yuklab olindi: bibliografiya.txt'));
}

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch((window.platformUrl || function (r) { return r; })('data/ilmiy.json?v=20260819b'));
        ilmiyData = await response.json();
        ilmiyData.tadqiqotlar = ilmiyData.tadqiqotlar || [];
        ilmiyData.bibliografiya = ilmiyData.bibliografiya || [];

        renderHeroStats();
        initResearchPdfModal();
        displayArticles(ilmiyData.maqolalar);
        displayBibliography(ilmiyData.bibliografiya);

        const tabParam = new URLSearchParams(window.location.search).get('tab');
        if (tabParam) {
            activateIlmiyTab(tabParam);
        }

        const params = new URLSearchParams(window.location.search);
        const articleId = params.get('article');
        const dissId = params.get('dissertation');
        const researchId = params.get('research');
        const termId = params.get('term');
        const biblioId = params.get('biblio');

        if (articleId) {
            activateIlmiyTab('maqolalar');
            setTimeout(() => {
                document.getElementById(`ilm-article-${articleId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 400);
        } else if (dissId) {
            activateIlmiyTab('dissertatsiyalar');
            setTimeout(() => {
                document.getElementById(`ilm-dissertation-${dissId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 400);
        } else if (researchId) {
            activateIlmiyTab('tadqiqotlar');
            setTimeout(() => {
                document.getElementById(`ilm-research-${researchId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 400);
        } else if (termId) {
            activateIlmiyTab('lugat');
            setTimeout(() => {
                document.getElementById(`ilm-term-${termId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 400);
        } else if (biblioId) {
            activateIlmiyTab('bibliografiya');
            setTimeout(() => {
                document.getElementById(`ilm-biblio-${biblioId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 400);
        }

        if (window.PlatformI18n) {
            window.PlatformI18n.apply(document);
            window.PlatformI18n.registerRefresh('ilmiy', refreshIlmiyUI);
        }
        updateSelectedCount();
    } catch (error) {
        console.error('Ma\'lumotlarni yuklashda xatolik:', error);
        alert(uiT('ilmDataLoadError', 'Ma\'lumotlar yuklanmadi. Iltimos, sahifani qayta yuklang.'));
    }
});

// Future integration hook
window.IlmiyArxiv = {
    getData: () => ilmiyData,
    applyFilters,
    resetFilters
};
