/**
 * Yutuqlar — live achievements via AchievementEngine + UserProgress
 */

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function renderBadges(badges) {
    if (!badges.length) {
        return '<p class="ach-empty">Hali badj ochilmagan. Kutubxona, testlar yoki video darslardan boshlang!</p>';
    }
    return badges.map(b => `
        <article class="ach-badge" data-ach-id="${escapeHtml(b.id)}">
            <span class="ach-badge__icon" aria-hidden="true">${b.icon}</span>
            <h3 class="ach-badge__title">${escapeHtml(b.title)}</h3>
            <p class="ach-badge__desc">${escapeHtml(b.desc)}</p>
            <p class="ach-badge__date">${escapeHtml(b.date)}</p>
        </article>
    `).join('');
}

function renderLocked(items) {
    if (!items.length) {
        return '<p class="ach-empty">Barcha yutuqlar ochilgan — tabriklaymiz!</p>';
    }
    return items.map(item => {
        const pct = Math.round((item.current / item.target) * 100);
        return `
            <article class="ach-locked" data-ach-id="${escapeHtml(item.id)}">
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
    if (!items.length) {
        return '<li class="ach-timeline__item"><span class="ach-timeline__icon" aria-hidden="true">🏅</span><div><p class="ach-timeline__text">Hali yutuq yo\'q</p><p class="ach-timeline__time">Faol bo\'ling!</p></div></li>';
    }
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
    if (!certs.length) {
        return '<div class="ach-cert"><div class="ach-cert__info"><span class="ach-cert__icon" aria-hidden="true">📜</span><div><p class="ach-cert__title">Hali sertifikat yo\'q</p><p class="ach-cert__date">70%+ test natija kerak</p></div></div><button type="button" class="ach-download" disabled title="Tez kunda">Yuklab olish</button></div>';
    }
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

function renderYutuqlar(data) {
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

async function loadPlatformScripts() {
    if (window.platformDataReady) {
        await window.platformDataReady;
        return;
    }
    await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = (window.platformUrl || function (r) { return r; })('assets/js/data.js');
        script.onload = () => (window.platformDataReady || Promise.resolve()).then(resolve).catch(reject);
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function refreshYutuqlar(newUnlockIds) {
    await loadPlatformScripts();

    let stats = {};
    if (typeof getPlatformStatistics === 'function') {
        stats = await getPlatformStatistics();
    }

    if (window.UserProgress && window.AchievementEngine) {
        if (!newUnlockIds?.length) {
            UserProgress.syncAchievements(stats);
        }
        const model = AchievementEngine.buildYutuqlarModel(UserProgress.getState(), stats);
        renderYutuqlar(model);
        if (newUnlockIds?.length) {
            AchievementEngine.markNewBadgeElements(newUnlockIds);
        }
    }
}

function bindYutuqlarEvents() {
    const refresh = (detail) => {
        const ids = detail?.id ? [detail.id] : detail?.map?.(d => d.id);
        refreshYutuqlar(ids);
    };

    if (window.PlatformDataService?.on) {
        PlatformDataService.on('progressChanged', refresh);
        PlatformDataService.on('achievementUnlocked', ach => refresh(ach));
        PlatformDataService.on('dataUpdated', refresh);
    }

    ['platform:progressChanged', 'platform:achievementUnlocked'].forEach(evt => {
        window.addEventListener(evt, e => refresh(e.detail));
    });

    window.addEventListener('storage', e => {
        if (e.key === 'platform-user-progress') refresh();
    });
}

async function initYutuqlar() {
    await refreshYutuqlar();
    bindYutuqlarEvents();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initYutuqlar);
} else {
    initYutuqlar();
}

window.YutuqlarApp = {
    refresh: refreshYutuqlar
};
