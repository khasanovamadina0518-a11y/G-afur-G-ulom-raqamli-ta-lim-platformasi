// ===================================
// Hayoti — Digital Biography (Phase 10)
// Data: hayot.json only
// ===================================

let hayotData = null;
let activeFilter = 'all';

const BOSQICH_ORDER = ['yoshlik', 'boshlanish', 'kamolot', 'urush', 'songgi'];

const BOSQICH_ICONS = {
    yoshlik: { icon: '👶', label: 'Childhood' },
    boshlanish: { icon: '✍️', label: 'Creative Career' },
    kamolot: { icon: '📚', label: 'Creative Peak' },
    urush: { icon: '⚔️', label: 'War Years' },
    songgi: { icon: '🏅', label: 'Recognition' }
};

const AWARD_YEARS = [1930, 1950, 1960, 1965];

const EVENT_WORKS = {
    1925: [{ title: 'Yillar sadosi' }],
    1939: [{ title: 'Shum bola' }],
    1943: [{ title: 'Seni kutaman' }, { title: 'Vatan' }]
};

const OVERVIEW_CARDS = [
    { label: 'Tug\'ilish', title: 'Tug\'ildi', year: 1903 },
    { label: 'Ta\'lim', title: 'Ta\'lim yo\'li', year: 1909 },
    { label: 'Ijod', title: 'Ijod boshlanishi', year: 1924 },
    { label: 'Asar', title: 'Shum bola', year: 1939 },
    { label: 'Unvon', title: 'Tan olinish', year: 1960 },
    { label: 'Meros', title: 'Vafoti', year: 1966 }
];

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

function countUniqueAsarlar() {
    const set = new Set();
    Object.values(hayotData.bosqichlar || {}).forEach(b => {
        (b.asarlar || []).forEach(a => set.add(a));
    });
    return set.size;
}

function getVoqeaByYear(yil) {
    return (hayotData.voqealar || []).find(v => v.yil === yil);
}

function getWorksForEvent(voqea) {
    const mapped = EVENT_WORKS[voqea.yil];
    if (mapped) {
        return mapped.map(w => ({
            title: w.title,
            excerpt: extractWorkExcerpt(voqea.batafsil, w.title)
        }));
    }
    return [];
}

function extractWorkExcerpt(batafsil, title) {
    if (!batafsil) return '';
    const lower = batafsil.toLowerCase();
    const tLower = title.toLowerCase();
    if (lower.includes(tLower)) {
        const idx = lower.indexOf(tLower);
        const start = Math.max(0, batafsil.lastIndexOf('.', idx) + 1);
        let end = batafsil.indexOf('.', idx + title.length);
        if (end === -1) end = Math.min(batafsil.length, idx + 120);
        return batafsil.slice(start, end + 1).trim();
    }
    return '';
}

function getStageWorksWithoutEvent(bosqichKey) {
    const bosqich = hayotData.bosqichlar[bosqichKey];
    if (!bosqich) return [];

    const eventLinked = new Set();
    (hayotData.voqealar || [])
        .filter(v => v.bosqich === bosqichKey)
        .forEach(v => {
            (EVENT_WORKS[v.yil] || []).forEach(w => eventLinked.add(w.title));
        });

    return (bosqich.asarlar || []).filter(a => !eventLinked.has(a));
}

// ===================================
// RENDER: Hero
// ===================================

function renderHero() {
    const yoshlik = hayotData.bosqichlar?.yoshlik;
    const featured = hayotData.xotiralar?.[0];

    const introEl = document.getElementById('hy-hero-intro');
    if (introEl && yoshlik) {
        introEl.textContent = firstParagraph(yoshlik.matn);
    }

    const quoteEl = document.getElementById('hy-hero-quote');
    if (quoteEl && featured) {
        quoteEl.innerHTML = `
            ${escapeHtml(featured.matn)}
            <cite>— ${escapeHtml(featured.muallif)}, ${featured.yil}</cite>
        `;
    }

    const statsEl = document.getElementById('hy-hero-stats');
    if (statsEl) {
        statsEl.innerHTML = `
            <span><span class="hy-hero__stat-num">77</span> yil hayot</span>
            <span><span class="hy-hero__stat-num">${hayotData.voqealar.length}</span> muhim voqea</span>
            <span><span class="hy-hero__stat-num">${BOSQICH_ORDER.length}</span> ijodiy bosqich</span>
            <span><span class="hy-hero__stat-num">2</span> yuksak unvon</span>
        `;
    }
}

// ===================================
// RENDER: Overview
// ===================================

function renderOverview() {
    const grid = document.getElementById('hy-overview-grid');
    if (!grid) return;

    grid.innerHTML = OVERVIEW_CARDS.map(card => {
        const voqea = getVoqeaByYear(card.year);
        const text = voqea ? voqea.qisqa : '';
        return `
            <button type="button" class="hy-overview-card" data-scroll-year="${card.year}">
                <div class="hy-overview-card__label">${escapeHtml(card.label)}</div>
                <h3 class="hy-overview-card__title">${escapeHtml(card.title)}</h3>
                <p class="hy-overview-card__text">${escapeHtml(text)}</p>
            </button>
        `;
    }).join('');

    grid.querySelectorAll('.hy-overview-card').forEach(btn => {
        btn.addEventListener('click', () => {
            const year = btn.dataset.scrollYear;
            const target = document.getElementById(`hy-event-${year}`);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                if (!target.classList.contains('is-open')) {
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
    BOSQICH_ORDER.forEach(key => {
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

    const meta = BOSQICH_ICONS[key] || { icon: '📖', label: '' };
    const extraWorks = getStageWorksWithoutEvent(key);

    return `
        <div class="hy-stage" data-bosqich="${key}" id="hy-stage-${key}">
            <div class="hy-stage-sep">
                <span class="hy-stage-sep__icon" aria-hidden="true" title="${escapeHtml(meta.label)}">${meta.icon}</span>
                <div class="hy-stage-sep__body">
                    <h3 class="hy-stage-sep__title">${escapeHtml(bosqich.sarlavha)}</h3>
                    <p class="hy-stage-sep__years">${escapeHtml(bosqich.yillar)}</p>
                    <p class="hy-stage-sep__excerpt">${escapeHtml(firstParagraph(bosqich.matn))}</p>
                    ${extraWorks.length ? `
                        <div class="hy-stage-tags">
                            ${extraWorks.map(w => `<span class="hy-stage-tag">${escapeHtml(w)}</span>`).join('')}
                        </div>
                    ` : ''}
                    <button type="button" class="hy-stage-toggle" data-stage="${key}">Bosqich haqida</button>
                    <div class="hy-stage-full" id="hy-stage-full-${key}">
                        ${allParagraphs(bosqich.matn)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderEventCard(voqea) {
    const works = getWorksForEvent(voqea);
    const rasmHtml = voqea.rasm
        ? `<img class="hy-event__rasm" src="${escapeHtml(voqea.rasm)}" alt="${escapeHtml(voqea.sarlavha)}">`
        : '';

    const worksHtml = works.length ? works.map(w => `
        <div class="hy-work">
            <h4 class="hy-work__title">${escapeHtml(w.title)}</h4>
            ${w.excerpt ? `<p class="hy-work__excerpt">${escapeHtml(w.excerpt)}</p>` : ''}
            <a class="hy-btn-primary hy-btn-navy" href="pages/asarlar.html">Kutubxonada ochish</a>
        </div>
    `).join('') : '';

    return `
        <article class="hy-event" id="hy-event-${voqea.yil}" data-bosqich="${voqea.bosqich}">
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
                    ${worksHtml}
                    ${rasmHtml}
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
                btn.textContent = full.classList.contains('is-open') ? 'Yopish' : 'Bosqich haqida';
            }
        });
    });

    initTimelineObserver();
}

function initTimelineObserver() {
    const items = document.querySelectorAll('.hy-event');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.15 });

    items.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(16px)';
        item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(item);
    });
}

// ===================================
// RENDER: Facts
// ===================================

function renderFacts() {
    const grid = document.getElementById('hy-facts-grid');
    if (!grid) return;

    const shumVoqea = getVoqeaByYear(1939);
    const pullQuote = shumVoqea?.batafsil?.includes('bir necha avlod')
        ? shumVoqea.batafsil.split('.').find(s => s.includes('bir necha avlod'))?.trim() + '.'
        : null;

    grid.innerHTML = `
        <div class="hy-fact">
            <span class="hy-fact__num">1903</span>
            <p class="hy-fact__label">Tug'ilgan yil</p>
        </div>
        <div class="hy-fact">
            <span class="hy-fact__num">77</span>
            <p class="hy-fact__label">Yoshida vafot etdi</p>
        </div>
        <div class="hy-fact">
            <span class="hy-fact__num">${hayotData.voqealar.length}</span>
            <p class="hy-fact__label">Muhim hayot voqeasi</p>
        </div>
        <div class="hy-fact">
            <span class="hy-fact__num">${countUniqueAsarlar()}+</span>
            <p class="hy-fact__label">Asar nomi (JSON)</p>
        </div>
        <div class="hy-fact">
            <span class="hy-fact__num">${hayotData.xotiralar.length}</span>
            <p class="hy-fact__label">Zamondosh xotirasi</p>
        </div>
        <div class="hy-fact">
            <span class="hy-fact__num">3</span>
            <p class="hy-fact__label">Til: arabcha, forscha, rus</p>
        </div>
        ${pullQuote ? `
            <div class="hy-fact hy-fact--quote">
                <p>${escapeHtml(pullQuote)}</p>
            </div>
        ` : ''}
    `;
}

// ===================================
// RENDER: Awards
// ===================================

function renderAwards() {
    const grid = document.getElementById('hy-awards-grid');
    if (!grid) return;

    const awards = hayotData.voqealar.filter(v => AWARD_YEARS.includes(v.yil));

    grid.innerHTML = awards.map(v => `
        <article class="hy-award" id="hy-award-${v.yil}">
            <button type="button" class="hy-award__head" aria-expanded="false">
                <span class="hy-award__year">${v.yil}</span>
                <h3 class="hy-award__title">${escapeHtml(v.sarlavha)}</h3>
            </button>
            <div class="hy-award__body">
                <p><strong>${escapeHtml(v.qisqa)}</strong></p>
                <p style="margin-top:0.65rem">${escapeHtml(v.batafsil)}</p>
            </div>
        </article>
    `).join('');

    grid.querySelectorAll('.hy-award__head').forEach(head => {
        head.addEventListener('click', () => {
            const award = head.closest('.hy-award');
            const isOpen = award.classList.toggle('is-open');
            head.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    });
}

// ===================================
// RENDER: Xotiralar
// ===================================

function renderXotiralar() {
    const grid = document.getElementById('hy-quotes-grid');
    if (!grid) return;

    grid.innerHTML = hayotData.xotiralar.map(x => `
        <blockquote class="hy-quote-card">
            <p class="hy-quote-card__text">${escapeHtml(x.matn)}</p>
            <footer>
                <p class="hy-quote-card__author">${escapeHtml(x.muallif)}</p>
                <p class="hy-quote-card__year">${x.yil}</p>
            </footer>
        </blockquote>
    `).join('');
}

// ===================================
// RENDER: Documents
// ===================================

function renderDocuments() {
    const grid = document.getElementById('hy-documents-grid');
    if (!grid) return;

    const birthVoqea = getVoqeaByYear(1903);
    const docs = [
        {
            type: 'Portret',
            src: (window.platformUrl || function (r) { return r; })('assets/images/gafur-gulom.jpg'),
            caption: birthVoqea?.qisqa || 'G\'afur G\'ulom portreti'
        }
    ];

    (hayotData.voqealar || []).forEach(v => {
        if (v.rasm) {
            docs.push({
                type: 'Arxiv',
                src: v.rasm,
                caption: `${v.yil} — ${v.sarlavha}`
            });
        }
    });

    grid.innerHTML = docs.map(d => `
        <figure class="hy-doc">
            <div class="hy-doc__img-wrap">
                <img class="hy-doc__img" src="${escapeHtml(d.src)}" alt="${escapeHtml(d.caption)}" loading="lazy">
            </div>
            <figcaption class="hy-doc__meta">
                <div class="hy-doc__type">${escapeHtml(d.type)}</div>
                <p class="hy-doc__caption">${escapeHtml(d.caption)}</p>
            </figcaption>
        </figure>
    `).join('');
}

// ===================================
// RENDER: Legacy
// ===================================

function renderLegacy() {
    const el = document.getElementById('hy-legacy-content');
    if (!el) return;

    const vafot = getVoqeaByYear(1966);
    const songgi = hayotData.bosqichlar?.songgi;
    const mirtemir = hayotData.xotiralar?.find(x => x.muallif === 'Mirtemir');

    const excerpts = [];
    if (vafot?.batafsil) {
        const parts = vafot.batafsil.split('. ');
        const merosIdx = parts.findIndex(p => p.includes('meros qoldirdi'));
        if (merosIdx >= 0) {
            excerpts.push(parts.slice(merosIdx).join('. ').trim());
        }
    }
    if (songgi?.matn) {
        const last = songgi.matn.split('\n\n').pop();
        if (last) excerpts.push(last.trim());
    }

    const mainText = excerpts[0] || (vafot ? vafot.qisqa : '');
    const secondary = mirtemir ? mirtemir.matn : (excerpts[1] || '');

    el.innerHTML = `
        <div class="hy-legacy__icon" aria-hidden="true">📖</div>
        <p class="hy-legacy__text">${escapeHtml(mainText)}</p>
        ${secondary ? `<p class="hy-legacy__text" style="font-size:1rem;opacity:0.9">${escapeHtml(secondary)}</p>` : ''}
        <p class="hy-legacy__source">Manba: hayot.json — 1966 voqea va so'nggi yillar bosqichi</p>
        <a class="hy-btn-primary" href="pages/asarlar.html">Meros asarlarni o'qish</a>
    `;
}

// ===================================
// RENDER: Next steps
// ===================================

function renderNextSteps() {
    const grid = document.getElementById('hy-next-grid');
    if (!grid) return;

    const kamolot = hayotData.bosqichlar?.kamolot;
    const urush = hayotData.bosqichlar?.urush;

    grid.innerHTML = `
        <article class="hy-next-card">
            <div class="hy-next-card__icon" aria-hidden="true">📖</div>
            <div class="hy-next-card__label">Tavsiya etilgan kitob</div>
            <h3 class="hy-next-card__title">Shum bola</h3>
            <p class="hy-next-card__text">1939-yilda nashr etilgan roman — G'afur G'ulom ijodining eng mashhur asarlaridan biri.</p>
            <a class="hy-btn-primary" href="pages/asarlar.html">Kutubxonada o'qish</a>
        </article>
        <article class="hy-next-card">
            <div class="hy-next-card__icon" aria-hidden="true">🎬</div>
            <div class="hy-next-card__label">Tavsiya etilgan video</div>
            <h3 class="hy-next-card__title">${escapeHtml(urush?.sarlavha || 'Urush yillari')}</h3>
            <p class="hy-next-card__text">${escapeHtml(firstParagraph(urush?.matn || ''))}</p>
            <a class="hy-btn-primary" href="pages/multimedia.html">Video darslarni ko'rish</a>
        </article>
        <article class="hy-next-card">
            <div class="hy-next-card__icon" aria-hidden="true">✅</div>
            <div class="hy-next-card__label">Tavsiya etilgan test</div>
            <h3 class="hy-next-card__title">G'afur G'ulom hayoti viktorinasi</h3>
            <p class="hy-next-card__text">Biografiyani o'rganganingizdan keyin bilimingizni ${escapeHtml(kamolot?.sarlavha || 'viktorina')} orqali sinab ko'ring.</p>
            <a class="hy-btn-primary" href="pages/talim.html">Testni boshlash</a>
        </article>
    `;
}

// ===================================
// INIT
// ===================================

async function loadHayotData() {
    try {
        const response = await fetch((window.platformUrl || function (r) { return r; })('data/hayot.json'));
        if (!response.ok) throw new Error('Ma\'lumotlarni yuklashda xatolik');
        hayotData = await response.json();

        renderHero();
        renderOverview();
        renderFilters();
        renderTimeline();
        renderFacts();
        renderAwards();
        renderXotiralar();
        renderDocuments();
        renderLegacy();
        renderNextSteps();
    } catch (error) {
        console.error('Hayot sahifasi xatolik:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadHayotData);

window.HayotBiografiya = {
    loadHayotData,
    getVoqeaByYear
};
