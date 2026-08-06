// ===================================
// Ilmiy Arxiv — JavaScript (Phase 8)
// IA + functionality preserved
// ===================================

let ilmiyData = { maqolalar: [], dissertatsiyalar: [], atamalar: [] };
let selectedArticles = [];
let selectedFormat = 'apa';

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function renderHeroStats() {
    const el = document.getElementById('ilm-hero-stats');
    if (!el) return;

    el.innerHTML = `
        <div class="ilm-hero__stat"><span class="ilm-hero__stat-num">${ilmiyData.maqolalar.length}</span> maqola</div>
        <div class="ilm-hero__stat"><span class="ilm-hero__stat-num">${ilmiyData.dissertatsiyalar.length}</span> dissertatsiya</div>
        <div class="ilm-hero__stat"><span class="ilm-hero__stat-num">${ilmiyData.atamalar.length}</span> atama</div>
    `;
}

// ===================================
// TABS
// ===================================

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
        } else if (tab === 'lugat') {
            displayTerms(ilmiyData.atamalar);
            createAlphabetNav();
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
        container.innerHTML = '<p class="ilm-empty">Maqola topilmadi.</p>';
        return;
    }

    container.innerHTML = articles.map(article => `
        <article class="ilm-paper">
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
                <span class="ilm-badge">${escapeHtml(article.til)}</span>
            </div>

            <p class="ilm-paper__abstract">${escapeHtml(article.annotatsiya)}</p>

            <div class="ilm-paper__keywords">
                ${article.kalitSozlar.map(kw => `<span class="ilm-keyword">${escapeHtml(kw)}</span>`).join('')}
            </div>

            <div class="ilm-paper__actions">
                <button class="ilm-btn-primary" type="button" onclick="openPdf(${article.id})">PDF</button>
                <button class="ilm-btn-outline ilm-btn-gold" type="button" onclick="quickCite(${article.id})">Iqtibos</button>
                <button class="ilm-btn-outline" type="button" onclick="shareArticle(${article.id})">Ulashish</button>
            </div>
        </article>
    `).join('');
}

function openPdf(id) {
    const article = ilmiyData.maqolalar.find(a => a.id === id);
    if (!article) return;

    if (article.pdfHavola && article.pdfHavola !== '#') {
        window.open(article.pdfHavola, '_blank', 'noopener');
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
        container.innerHTML = '<p class="ilm-empty">Dissertatsiya topilmadi.</p>';
        return;
    }

    container.innerHTML = dissertations.map(diss => `
        <article class="ilm-paper">
            <h3 class="ilm-paper__title">${escapeHtml(diss.sarlavha)}</h3>
            <div class="ilm-paper__meta">
                <span class="ilm-paper__meta-item">👤 <strong>${escapeHtml(diss.muallif)}</strong></span>
                <span class="ilm-paper__meta-item">📅 ${diss.yil}</span>
                <span class="ilm-badge">${escapeHtml(diss.daraja)}</span>
            </div>
            <p class="ilm-paper__abstract">
                <strong>Ilmiy rahbar:</strong> ${escapeHtml(diss.ilmiyRahbar)}<br>
                <strong>Muassasa:</strong> ${escapeHtml(diss.muassasa)}
            </p>
        </article>
    `).join('');
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
        container.innerHTML = '<p class="ilm-empty">Atama topilmadi.</p>';
        return;
    }

    container.innerHTML = terms.map(term => `
        <article class="term-card">
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
        alert('Bibliografiya nusxa olindi!');
    }).catch(() => {
        alert('Nusxa olishda xatolik yuz berdi.');
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

    alert('Fayl yuklab olindi: bibliografiya.txt');
}

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch((window.platformUrl || function (r) { return r; })('data/ilmiy.json'));
        ilmiyData = await response.json();

        renderHeroStats();
        displayArticles(ilmiyData.maqolalar);
    } catch (error) {
        console.error('Ma\'lumotlarni yuklashda xatolik:', error);
        alert('Ma\'lumotlar yuklanmadi. Iltimos, sahifani qayta yuklang.');
    }
});

// Future integration hook
window.IlmiyArxiv = {
    getData: () => ilmiyData,
    applyFilters,
    resetFilters
};
