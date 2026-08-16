// ===================================
// Hayoti — Academic Biography
// Data: hayot.json (Karimov, 2003)
// ===================================

let hayotData = null;
let activeFilter = 'all';

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function firstParagraph(text) {
    if (!text) return '';
    return text.split('\n\n')[0].trim();
}

function allParagraphs(text) {
    if (!text) return '';
    return text.split('\n\n').map(p => `<p>${escapeHtml(p.trim())}</p>`).join('');
}

function getVoqeaById(id) {
    return (hayotData.voqealar || []).find(v => v.id === id);
}

function getBosqichOrder() {
    return hayotData.bosqichTartibi || Object.keys(hayotData.bosqichlar || {});
}

// ===================================
// RENDER: Hero
// ===================================

function renderHero() {
    const hero = hayotData.hero || {};

    const kickerEl = document.getElementById('hy-hero-kicker');
    if (kickerEl && hero.kicker) kickerEl.textContent = hero.kicker;

    const yearsEl = document.getElementById('hy-hero-years');
    if (yearsEl && hero.yillar) yearsEl.textContent = hero.yillar;

    const introEl = document.getElementById('hy-hero-intro');
    if (introEl && hero.intro) introEl.textContent = hero.intro;

    const quoteEl = document.getElementById('hy-hero-quote');
    if (quoteEl && hero.iqtibos) {
        quoteEl.innerHTML = `
            ${escapeHtml(hero.iqtibos)}
            ${hero.iqtibosManba ? `<cite>— ${escapeHtml(hero.iqtibosManba)}</cite>` : ''}
        `;
    }

    const sourceEl = document.getElementById('hy-hero-source');
    if (sourceEl && hayotData.manba) {
        sourceEl.textContent = 'Manba: ' + hayotData.manba;
    }
}

// ===================================
// RENDER: Overview
// ===================================

function renderOverview() {
    const grid = document.getElementById('hy-overview-grid');
    if (!grid) return;

    grid.innerHTML = (hayotData.overview || []).map(card => `
        <button type="button" class="hy-overview-card" data-scroll-to="${escapeHtml(card.scrollTo)}">
            <div class="hy-overview-card__label">${escapeHtml(card.label)}</div>
            <h3 class="hy-overview-card__title">${escapeHtml(card.title)}</h3>
            <p class="hy-overview-card__text">${escapeHtml(card.text)}</p>
        </button>
    `).join('');

    grid.querySelectorAll('.hy-overview-card').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = document.getElementById(btn.dataset.scrollTo);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                if (target.classList.contains('hy-event') && !target.classList.contains('is-open')) {
                    target.querySelector('.hy-event__head')?.click();
                }
            }
        });
    });
}

// ===================================
// RENDER: Timeline
// ===================================

function renderFilters() {
    const container = document.getElementById('hy-timeline-filters');
    if (!container) return;

    const buttons = [{ key: 'all', label: 'Barchasi' }];
    getBosqichOrder().forEach(key => {
        const b = hayotData.bosqichlar[key];
        if (b) buttons.push({ key, label: b.sarlavha });
    });

    container.innerHTML = buttons.map(({ key, label }) => `
        <button type="button" class="hy-filter-btn ${key === 'all' ? 'active' : ''}"
                data-filter="${key}" role="tab">${escapeHtml(label)}</button>
    `).join('');

    container.querySelectorAll('.hy-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            activeFilter = btn.dataset.filter;
            container.querySelectorAll('.hy-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyTimelineFilter();
        });
    });
}

function applyTimelineFilter() {
    document.querySelectorAll('.hy-stage').forEach(stage => {
        const key = stage.dataset.bosqich;
        stage.classList.toggle('is-hidden', activeFilter !== 'all' && activeFilter !== key);
    });

    document.querySelectorAll('.hy-event').forEach(ev => {
        const key = ev.dataset.bosqich;
        ev.classList.toggle('is-hidden', activeFilter !== 'all' && activeFilter !== key);
    });
}

function renderStageSeparator(key) {
    const bosqich = hayotData.bosqichlar[key];
    if (!bosqich) return '';

    return `
        <div class="hy-stage" data-bosqich="${key}" id="hy-stage-${key}">
            <div class="hy-stage-sep">
                <span class="hy-stage-sep__marker" aria-hidden="true"></span>
                <div class="hy-stage-sep__body">
                    <h3 class="hy-stage-sep__title">${escapeHtml(bosqich.sarlavha)}</h3>
                    <p class="hy-stage-sep__years">${escapeHtml(bosqich.yillar)}</p>
                    <p class="hy-stage-sep__excerpt">${escapeHtml(firstParagraph(bosqich.matn))}</p>
                    <button type="button" class="hy-stage-toggle" data-stage="${key}">Batafsil</button>
                    <div class="hy-stage-full" id="hy-stage-full-${key}">
                        ${allParagraphs(bosqich.matn)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderEventCard(voqea) {
    return `
        <article class="hy-event" id="hy-event-${voqea.id}" data-bosqich="${voqea.bosqich}">
            <div class="hy-event__card">
                <button type="button" class="hy-event__head" aria-expanded="false">
                    <span class="hy-event__year">${voqea.yil}</span>
                    <div class="hy-event__summary">
                        <h4 class="hy-event__title">${escapeHtml(voqea.sarlavha)}</h4>
                        <p class="hy-event__qisqa">${escapeHtml(voqea.qisqa)}</p>
                    </div>
                    <span class="hy-event__chevron" aria-hidden="true">▾</span>
                </button>
                <div class="hy-event__body">
                    <p class="hy-event__batafsil">${escapeHtml(voqea.batafsil)}</p>
                </div>
            </div>
        </article>
    `;
}

function renderTimeline() {
    const root = document.getElementById('hy-timeline-root');
    if (!root) return;

    let html = '';
    let lastBosqich = null;

    (hayotData.voqealar || []).forEach(voqea => {
        if (voqea.bosqich !== lastBosqich) {
            html += renderStageSeparator(voqea.bosqich);
            lastBosqich = voqea.bosqich;
        }
        html += renderEventCard(voqea);
    });

    root.innerHTML = html;

    root.querySelectorAll('.hy-event__head').forEach(head => {
        head.addEventListener('click', () => {
            const event = head.closest('.hy-event');
            const isOpen = event.classList.toggle('is-open');
            head.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    });

    root.querySelectorAll('.hy-stage-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const full = document.getElementById(`hy-stage-full-${btn.dataset.stage}`);
            if (full) {
                full.classList.toggle('is-open');
                btn.textContent = full.classList.contains('is-open') ? 'Yopish' : 'Batafsil';
            }
        });
    });
}

// ===================================
// RENDER: Info sections
// ===================================

function renderInfoSection(sectionKey, gridId, leadId) {
    const section = hayotData[sectionKey];
    const grid = document.getElementById(gridId);
    const leadEl = document.getElementById(leadId);

    if (!section || !grid) return;

    if (leadEl && section.lead) leadEl.textContent = section.lead;

    grid.innerHTML = (section.bolimlar || []).map(bolim => `
        <article class="hy-info-card">
            <h3 class="hy-info-card__title">${escapeHtml(bolim.sarlavha)}</h3>
            <div class="hy-info-card__body">${allParagraphs(bolim.matn)}</div>
        </article>
    `).join('');
}

// ===================================
// RENDER: Muhim sanalar
// ===================================

function renderSanalar() {
    const grid = document.getElementById('hy-dates-grid');
    if (!grid) return;

    grid.innerHTML = (hayotData.sanalar || []).map(item => `
        <article class="hy-date-card">
            <time class="hy-date-card__sana">${escapeHtml(item.sana)}</time>
            <p class="hy-date-card__matn">${escapeHtml(item.matn)}</p>
        </article>
    `).join('');
}

// ===================================
// RENDER: Xotiralar
// ===================================

function renderXotiralar() {
    const grid = document.getElementById('hy-quotes-grid');
    if (!grid) return;

    const typeLabels = {
        xotira: 'Xotira',
        iqtibos: 'Iqtibos',
        sher: 'She\'r'
    };

    grid.innerHTML = (hayotData.xotiralar || []).map(x => `
        <blockquote class="hy-quote-card">
            <p class="hy-quote-card__type">${escapeHtml(typeLabels[x.turi] || x.turi || '')}</p>
            <p class="hy-quote-card__text">${escapeHtml(x.matn)}</p>
            <footer>
                <p class="hy-quote-card__author">${escapeHtml(x.muallif)}</p>
                ${x.manba ? `<p class="hy-quote-card__source">${escapeHtml(x.manba)}</p>` : ''}
            </footer>
        </blockquote>
    `).join('');
}

// ===================================
// RENDER: Xulosa
// ===================================

function renderXulosa() {
    const el = document.getElementById('hy-conclusion-content');
    if (!el) return;

    el.innerHTML = `
        <p class="hy-conclusion__text">${escapeHtml(hayotData.xulosa || '')}</p>
        <p class="hy-conclusion__source">Manba: ${escapeHtml(hayotData.manba || '')}</p>
    `;
}

// ===================================
// INIT
// ===================================

async function loadHayotData() {
    try {
        const response = await fetch((window.platformUrl || function (r) { return r; })('data/hayot.json?v=20260815'));
        if (!response.ok) throw new Error('Ma\'lumotlarni yuklashda xatolik');
        hayotData = await response.json();

        renderHero();
        renderOverview();
        renderFilters();
        renderTimeline();
        renderInfoSection('bolalik', 'hy-bolalik-grid', 'hy-bolalik-lead');
        renderInfoSection('oila', 'hy-oila-grid', 'hy-oila-lead');
        renderInfoSection('mehnat', 'hy-mehnat-grid', 'hy-mehnat-lead');
        renderInfoSection('ijod', 'hy-ijod-grid', 'hy-ijod-lead');
        renderSanalar();
        renderXotiralar();
        renderXulosa();
    } catch (error) {
        console.error('Hayot sahifasi xatolik:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadHayotData);

window.HayotBiografiya = {
    loadHayotData,
    getVoqeaById
};
