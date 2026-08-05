/**
 * Yutuqlar (Achievements) — local placeholder data
 * Future: sync with DashboardApp / auth provider.
 */

const YUTUQLAR_STORAGE_KEY = 'yutuqlar-data';

const DEFAULT_YUTUQLAR = {
    level: {
        number: 12,
        title: 'Yaxshi',
        currentXp: 2400,
        nextLevelXp: 5000,
        nextLevelTitle: 'A\'lo'
    },
    unlockedBadges: [
        { icon: '🛡️', title: 'Birinchi qadam', desc: 'Birinchi darsni yakunladingiz', date: '2025-yil 12-yanvar' },
        { icon: '📚', title: 'Kitobxon', desc: '5 ta asar o\'qildi', date: '2025-yil 3-mart' },
        { icon: '⭐', title: 'Faol ishtirokchi', desc: '7 kun ketma-ket faollik', date: '2025-yil 18-aprel' },
        { icon: '📝', title: 'Test eksperti', desc: '10 ta test muvaffaqiyatli topshirildi', date: '2025-yil 22-iyun' },
        { icon: '🎥', title: 'Video ustasi', desc: '8 ta video dars ko\'rildi', date: '2025-yil 5-avgust' },
        { icon: '🤖', title: 'AI tadqiqotchisi', desc: 'AI yordamchi bilan 20 ta suhbat', date: '2026-yil 10-fevral' },
        { icon: '🏅', title: 'Bilimdon', desc: 'Umumiy XP 2000 dan oshdi', date: '2026-yil 1-mart' },
        { icon: '🎮', title: 'Interaktiv ustasi', desc: '4 ta o\'yin yakunlandi', date: '2026-yil 15-mart' }
    ],
    lockedBadges: [
        { icon: '📖', title: '20 ta kitob o\'qing', desc: 'Elektron kutubxonada 20 ta asarni o\'qing', current: 8, target: 20 },
        { icon: '📝', title: '100 ta test', desc: 'Jami 100 ta test savolini to\'g\'ri javoblang', current: 42, target: 100 },
        { icon: '🎬', title: 'Barcha videolar', desc: 'Barcha video darslarni tomosha qiling', current: 5, target: 12 }
    ],
    stats: {
        books: 8,
        videos: 5,
        tests: 42,
        games: 4,
        aiChats: 20,
        studyHours: 36
    },
    streak: {
        current: 28,
        longest: 35,
        calendarDays: 28
    },
    recent: [
        { icon: '🏅', text: '"Bilimdon" badji qo\'lga kiritildi', time: '2 kun oldin' },
        { icon: '📝', text: 'Test eksperti badji ochildi', time: '1 hafta oldin' },
        { icon: '🔥', text: '28 kunlik streak davom etmoqda', time: 'Bugun' },
        { icon: '📜', text: 'Yangi sertifikat: G\'afur G\'ulom asarlari', time: '2 hafta oldin' }
    ],
    certificates: [
        { title: 'G\'afur G\'ulom asarlari', date: '2026-yil 15-mart' },
        { title: 'She\'riyat bo\'yicha test', date: '2026-yil 2-fevral' },
        { title: 'Elektron kutubxona kursi', date: '2025-yil 20-dekabr' }
    ],
    motivation: {
        quote: '"Ilm – inson kamolotining yo\'lidir."',
        author: 'G\'afur G\'ulom',
        message: 'Siz ajoyib natija ko\'rsatyapsiz! Keyingi darajaga yetish uchun yana 2600 XP kerak. Bugun kamida bitta test yoki video dars bilan davom eting.'
    }
};

function loadYutuqlarData() {
    try {
        const raw = localStorage.getItem(YUTUQLAR_STORAGE_KEY);
        if (!raw) {
            localStorage.setItem(YUTUQLAR_STORAGE_KEY, JSON.stringify(DEFAULT_YUTUQLAR));
            return structuredClone(DEFAULT_YUTUQLAR);
        }
        return { ...DEFAULT_YUTUQLAR, ...JSON.parse(raw) };
    } catch (e) {
        return structuredClone(DEFAULT_YUTUQLAR);
    }
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function renderBadges(badges) {
    return badges.map(b => `
        <article class="ach-badge">
            <span class="ach-badge__icon" aria-hidden="true">${b.icon}</span>
            <h3 class="ach-badge__title">${escapeHtml(b.title)}</h3>
            <p class="ach-badge__desc">${escapeHtml(b.desc)}</p>
            <p class="ach-badge__date">${escapeHtml(b.date)}</p>
        </article>
    `).join('');
}

function renderLocked(items) {
    return items.map(item => {
        const pct = Math.round((item.current / item.target) * 100);
        return `
            <article class="ach-locked">
                <div class="ach-locked__head">
                    <span class="ach-locked__icon" aria-hidden="true">${item.icon}</span>
                    <div>
                        <h3 class="ach-locked__title">${escapeHtml(item.title)}</h3>
                        <p class="ach-locked__desc">${escapeHtml(item.desc)}</p>
                    </div>
                </div>
                <div class="ach-locked__bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
                    <div class="ach-locked__fill" style="width: ${pct}%"></div>
                </div>
                <p class="ach-locked__pct">${item.current} / ${item.target} (${pct}%)</p>
            </article>
        `;
    }).join('');
}

function renderStats(stats) {
    const items = [
        { icon: '📚', num: stats.books, label: 'O\'qilgan kitoblar' },
        { icon: '🎬', num: stats.videos, label: 'Ko\'rilgan videolar' },
        { icon: '📝', num: stats.tests, label: 'Bajarilgan testlar' },
        { icon: '🎮', num: stats.games, label: 'O\'ynalgan o\'yinlar' },
        { icon: '🤖', num: stats.aiChats, label: 'AI suhbatlar' },
        { icon: '⏱️', num: stats.studyHours, label: 'O\'qish soatlari' }
    ];
    return items.map(s => `
        <div class="ach-stat">
            <span class="ach-stat__icon" aria-hidden="true">${s.icon}</span>
            <p class="ach-stat__num">${s.num}</p>
            <p class="ach-stat__label">${escapeHtml(s.label)}</p>
        </div>
    `).join('');
}

function renderCalendar(activeDays) {
    const cells = [];
    for (let i = 1; i <= 28; i++) {
        const isActive = i > 28 - activeDays;
        const isToday = i === 28;
        cells.push(`<span class="ach-calendar__day ${isActive ? 'is-active' : ''} ${isToday ? 'is-today' : ''}">${i}</span>`);
    }
    return cells.join('');
}

function renderTimeline(items) {
    return items.map(item => `
        <li class="ach-timeline__item">
            <span class="ach-timeline__icon" aria-hidden="true">${item.icon}</span>
            <div>
                <p class="ach-timeline__text">${escapeHtml(item.text)}</p>
                <p class="ach-timeline__time">${escapeHtml(item.time)}</p>
            </div>
        </li>
    `).join('');
}

function renderCertificates(certs) {
    return certs.map(c => `
        <div class="ach-cert">
            <div class="ach-cert__info">
                <span class="ach-cert__icon" aria-hidden="true">📜</span>
                <div>
                    <p class="ach-cert__title">${escapeHtml(c.title)}</p>
                    <p class="ach-cert__date">${escapeHtml(c.date)}</p>
                </div>
            </div>
            <button type="button" class="ach-download" disabled title="Tez kunda">Yuklab olish</button>
        </div>
    `).join('');
}

function animateXpBar(pct) {
    requestAnimationFrame(() => {
        const fill = document.getElementById('ach-xp-fill');
        if (fill) fill.style.width = `${pct}%`;
    });
}

function renderYutuqlar() {
    const data = loadYutuqlarData();
    const xpPct = Math.round((data.level.currentXp / data.level.nextLevelXp) * 100);

    const levelNum = document.getElementById('ach-level-num');
    const levelTitle = document.getElementById('ach-level-title');
    const levelXp = document.getElementById('ach-level-xp');
    const levelNext = document.getElementById('ach-level-next');
    if (levelNum) levelNum.textContent = data.level.number;
    if (levelTitle) levelTitle.textContent = data.level.title;
    if (levelXp) levelXp.textContent = `${data.level.currentXp} / ${data.level.nextLevelXp} XP`;
    if (levelNext) levelNext.textContent = `Keyingi daraja: ${data.level.nextLevelTitle}`;

    animateXpBar(xpPct);

    const statsEl = document.getElementById('ach-stats-grid');
    if (statsEl) statsEl.innerHTML = renderStats(data.stats);

    const streakCurrent = document.getElementById('ach-streak-current');
    const streakLongest = document.getElementById('ach-streak-longest');
    if (streakCurrent) streakCurrent.textContent = data.streak.current;
    if (streakLongest) streakLongest.textContent = data.streak.longest;

    const calEl = document.getElementById('ach-calendar');
    if (calEl) calEl.innerHTML = renderCalendar(data.streak.calendarDays);

    const badgesEl = document.getElementById('ach-badges-grid');
    if (badgesEl) badgesEl.innerHTML = renderBadges(data.unlockedBadges);

    const lockedEl = document.getElementById('ach-locked-grid');
    if (lockedEl) lockedEl.innerHTML = renderLocked(data.lockedBadges);

    const timelineEl = document.getElementById('ach-timeline');
    if (timelineEl) timelineEl.innerHTML = renderTimeline(data.recent);

    const certsEl = document.getElementById('ach-certs-list');
    if (certsEl) certsEl.innerHTML = renderCertificates(data.certificates);

    const quoteEl = document.getElementById('ach-quote');
    const quoteAuthor = document.getElementById('ach-quote-author');
    const encourageEl = document.getElementById('ach-encourage');
    if (quoteEl) quoteEl.textContent = data.motivation.quote;
    if (quoteAuthor) quoteAuthor.textContent = `— ${data.motivation.author}`;
    if (encourageEl) encourageEl.textContent = data.motivation.message;
}

document.addEventListener('DOMContentLoaded', renderYutuqlar);

window.YutuqlarApp = {
    getData: loadYutuqlarData,
    setData(nextData) {
        localStorage.setItem(YUTUQLAR_STORAGE_KEY, JSON.stringify(nextData));
        renderYutuqlar();
    },
    syncFromDashboard(dashboardData) {
        if (!dashboardData) return;
        const merged = loadYutuqlarData();
        if (dashboardData.xp) {
            merged.level.currentXp = dashboardData.xp.currentXp;
            merged.level.nextLevelXp = dashboardData.xp.nextLevelXp;
            merged.level.number = dashboardData.xp.level;
            merged.level.title = dashboardData.xp.title;
        }
        if (dashboardData.achievements) {
            merged.stats.tests = dashboardData.achievements.badges || merged.stats.tests;
            merged.streak.current = dashboardData.achievements.streak || merged.streak.current;
        }
        localStorage.setItem(YUTUQLAR_STORAGE_KEY, JSON.stringify(merged));
        renderYutuqlar();
    }
};
