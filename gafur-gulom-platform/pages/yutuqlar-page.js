/**
 * Yutuqlar — live achievement dashboard via AchievementEngine + UserProgress
 */

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function achHref(relativePath) {
    return (window.platformUrl || (r => r))(relativePath);
}

function applyAchLinks() {
    document.querySelectorAll('[data-ach-link]').forEach(el => {
        const path = el.getAttribute('data-ach-link');
        if (path) el.setAttribute('href', achHref(path));
    });
}

let achInitialLoadDone = false;
let achRefreshPromise = null;

function showLoading(show) {
    const loading = document.getElementById('ach-loading');
    const content = document.getElementById('ach-content');
    const error = document.getElementById('ach-error');
    if (loading) {
        loading.hidden = !show;
        loading.classList.toggle('is-hidden', !show);
        loading.setAttribute('aria-busy', show ? 'true' : 'false');
    }
    if (content) {
        content.hidden = show;
        content.classList.toggle('is-hidden', show);
    }
    if (error) {
        error.hidden = true;
        error.classList.add('is-hidden');
    }
}

function showError(show) {
    const loading = document.getElementById('ach-loading');
    const content = document.getElementById('ach-content');
    const error = document.getElementById('ach-error');
    if (loading) {
        loading.hidden = true;
        loading.classList.add('is-hidden');
    }
    if (content) {
        content.hidden = show;
        content.classList.toggle('is-hidden', show);
    }
    if (error) {
        error.hidden = !show;
        error.classList.toggle('is-hidden', !show);
    }
}

function renderEmptyState(message, ctaLabel, ctaHref) {
    const href = achHref(ctaHref || 'pages/asarlar.html');
    const cta = ctaLabel
        ? `<a href="${escapeHtml(href)}" class="ach-btn ach-btn--outline ach-btn--sm">${escapeHtml(ctaLabel)}</a>`
        : '';
    return `<div class="ach-empty">${escapeHtml(message)}${cta}</div>`;
}

function renderBadges(badges) {
    if (!badges.length) {
        return renderEmptyState(
            'Hali badge olmadingiz. Kutubxona, testlar yoki videolardan boshlang!',
            'Birinchi yutug\'ingizni qo\'lga kiriting',
            'pages/asarlar.html'
        );
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
        return renderEmptyState('Barcha yutuqlar ochilgan — tabriklaymiz!', 'Kutubxonaga o\'tish', 'pages/asarlar.html');
    }
    return items.slice(0, 12).map(item => {
        const pct = Math.min(100, Math.round((item.current / Math.max(item.target, 1)) * 100));
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
        { icon: '📚', num: stats.completed, label: 'Tugatilgan asarlar', empty: 'Hali asar tugatilmagan', cta: 'Asarlarni ko\'rish', href: 'pages/asarlar.html' },
        { icon: '📂', num: stats.works, label: 'Ochilgan asarlar', empty: 'Hali asar ochilmagan', cta: 'Asarlarni ko\'rish', href: 'pages/asarlar.html' },
        { icon: '📜', num: stats.poems, label: 'O\'qilgan she\'rlar', empty: 'She\'rlar bo\'limini oching', cta: 'She\'rlar', href: 'pages/asarlar.html' },
        { icon: '📖', num: stats.qissalar, label: 'O\'qilgan hikoyalar', empty: 'Hikoyalar hali ochilmagan', cta: 'Hikoyalar', href: 'pages/asarlar.html?tab=hikoyalar' },
        { icon: '🎬', num: stats.videos, label: 'Ko\'rilgan videolar', empty: 'Video hali ko\'rilmagan', cta: 'Videolar', href: 'pages/multimedia.html' },
        { icon: '🎧', num: stats.audios, label: 'Tinglangan audiolar', empty: 'Audio hali tinglanmagan', cta: 'Audiokitob', href: 'pages/asarlar.html' },
        { icon: '📝', num: stats.tests, label: 'Yechilgan testlar', empty: 'Test hali ishlanmagan', cta: 'Birinchi testni boshlash', href: 'pages/interaktiv.html' },
        { icon: '📊', num: stats.tests ? `${stats.avgQuiz}%` : '0%', label: 'O\'rtacha test natijasi', empty: 'Test hali ishlanmagan', cta: 'Testlar', href: 'pages/interaktiv.html' },
        { icon: '🏆', num: stats.tests ? `${stats.bestQuiz}%` : '0%', label: 'Eng yaxshi natija', empty: 'Test hali ishlanmagan', cta: 'Testlar', href: 'pages/interaktiv.html' },
        { icon: '🎮', num: stats.games, label: 'O\'ynalgan o\'yinlar', empty: 'O\'yin hali o\'ynalmagan', cta: 'O\'yinlar', href: 'pages/interaktiv-oyinlar.html' },
        { icon: '⭐', num: stats.xp, label: 'To\'plangan XP', empty: '', cta: '', href: '' },
        { icon: '🏅', num: stats.badges, label: 'Olingan yutuqlar', empty: '', cta: '', href: '' }
    ];
    return items.map(s => {
        const isEmpty = (s.num === 0 || s.num === '0%') && s.empty;
        return `
            <div class="ach-stat ${isEmpty ? 'ach-stat--empty' : ''}">
                <span class="ach-stat__icon" aria-hidden="true">${s.icon}</span>
                <p class="ach-stat__num">${s.num}</p>
                <p class="ach-stat__label">${escapeHtml(s.label)}</p>
                ${isEmpty && s.cta ? `<a href="${escapeHtml(achHref(s.href))}" class="ach-stat__cta">${escapeHtml(s.cta)}</a>` : ''}
            </div>
        `;
    }).join('');
}

function renderWeekDays(days) {
    if (!days?.length) return '';
    return days.map(d => `
        <div class="ach-week__day ${d.active ? 'is-active' : ''} ${d.isToday ? 'is-today' : ''}">
            <span class="ach-week__label">${escapeHtml(d.label)}</span>
            <span class="ach-week__mark" aria-hidden="true">${d.active ? '✓' : '○'}</span>
        </div>
    `).join('');
}

function renderMonthDays(days) {
    if (!days?.length) return '';
    return days.map(d => `
        <span class="ach-month__day ${d.active ? 'is-active' : ''} ${d.isToday ? 'is-today' : ''}" title="${escapeHtml(d.date)}"></span>
    `).join('');
}

function renderContinueItems(items) {
    if (!items?.length) {
        return renderEmptyState(
            'Yarim tugatilgan asar yo\'q. Kutubxonadan yangi asar tanlang.',
            'Kutubxona',
            'pages/asarlar.html'
        );
    }
    return items.map(item => `
        <article class="ach-continue">
            <div class="ach-continue__info">
                <h3 class="ach-continue__title">${escapeHtml(item.title)}</h3>
                <p class="ach-continue__meta">${escapeHtml(item.type)} · ${item.progress}% o'qilgan</p>
                <div class="ach-continue__bar" role="progressbar" aria-valuenow="${item.progress}" aria-valuemin="0" aria-valuemax="100">
                    <div class="ach-continue__fill" style="width: ${item.progress}%"></div>
                </div>
            </div>
            <a href="${escapeHtml(achHref(item.href))}" class="ach-btn ach-btn--primary ach-btn--sm">Davom etish</a>
        </article>
    `).join('');
}

function renderTimelineItems(items, emptyMsg, ctaLabel, ctaHref) {
    if (!items?.length) {
        return `<li class="ach-timeline__item ach-timeline__item--empty">${renderEmptyState(emptyMsg, ctaLabel, ctaHref)}</li>`;
    }
    return items.map(item => `
        <li class="ach-timeline__item">
            <span class="ach-timeline__icon" aria-hidden="true">${item.icon || '🏅'}</span>
            <div>
                <p class="ach-timeline__text">${escapeHtml(item.title || item.text)}</p>
                ${item.desc ? `<p class="ach-timeline__sub">${escapeHtml(item.desc)}</p>` : ''}
                <p class="ach-timeline__time">${escapeHtml(item.date || item.time || '')}</p>
            </div>
        </li>
    `).join('');
}

function renderEarnedTimeline(items) {
    if (!items?.length) {
        return renderEmptyState(
            'Hoziroq birinchi yutug\'ingizni qo\'lga kiriting!',
            'Kutubxonadan boshlash',
            'pages/asarlar.html'
        );
    }
    return items.map(item => `
        <article class="ach-earned__item">
            <span class="ach-earned__icon" aria-hidden="true">${item.icon}</span>
            <div class="ach-earned__body">
                <h3 class="ach-earned__title">${escapeHtml(item.title)}</h3>
                <p class="ach-earned__desc">${escapeHtml(item.desc)}</p>
                <time class="ach-earned__date">${escapeHtml(item.date)}</time>
            </div>
        </article>
    `).join('');
}

function renderCertificates(certs, hasCerts) {
    if (!hasCerts || !certs?.length) {
        return `
            <div class="ach-cert ach-cert--empty">
                <div class="ach-cert__info">
                    <span class="ach-cert__icon" aria-hidden="true">📜</span>
                    <div>
                        <p class="ach-cert__title">Hali sertifikat yo'q</p>
                        <p class="ach-cert__date">Test ishlang — 70% va undan yuqori natija sertifikatni avtomatik beradi.</p>
                    </div>
                </div>
            </div>
        `;
    }
    return certs.map(c => `
        <div class="ach-cert">
            <div class="ach-cert__info">
                <span class="ach-cert__icon" aria-hidden="true">📜</span>
                <div>
                    <p class="ach-cert__title">${escapeHtml(c.title)}</p>
                    <p class="ach-cert__date">${escapeHtml(c.date)}${c.score != null ? ` · ${c.score}%` : ''}</p>
                </div>
            </div>
            <span class="ach-cert__badge">Yakunlangan</span>
        </div>
    `).join('');
}

function animateXpBar(pct) {
    requestAnimationFrame(() => {
        const fill = document.getElementById('ach-xp-fill');
        const bar = document.getElementById('ach-xp-bar');
        if (fill) fill.style.width = `${pct}%`;
        if (bar) bar.setAttribute('aria-valuenow', String(pct));
    });
}

function renderYutuqlar(data) {
    const xpPct = data.level.progressPercent || 0;

    const avatar = document.getElementById('ach-user-avatar');
    const userName = document.getElementById('ach-user-name');
    const userRank = document.getElementById('ach-user-rank');
    if (avatar) avatar.textContent = data.user?.initials || 'F';
    if (userName) userName.textContent = data.user?.name || 'Foydalanuvchi';
    if (userRank) userRank.textContent = data.level.rank || data.level.title;

    const levelNum = document.getElementById('ach-level-num');
    const levelTitle = document.getElementById('ach-level-title');
    const levelXp = document.getElementById('ach-level-xp');
    const levelXpRemaining = document.getElementById('ach-level-xp-remaining');
    const levelNext = document.getElementById('ach-level-next');
    const levelPct = document.getElementById('ach-level-pct');
    if (levelNum) levelNum.textContent = data.level.number;
    if (levelTitle) levelTitle.textContent = data.level.title;
    if (levelXp) levelXp.textContent = `${data.level.currentXp} / ${data.level.nextLevelXp} XP`;
    if (levelXpRemaining) levelXpRemaining.textContent = `${data.level.xpRemaining} XP qoldi`;
    if (levelNext) levelNext.textContent = `Keyingi daraja: ${data.level.nextLevelTitle}`;
    if (levelPct) levelPct.textContent = `${xpPct}% bajarildi`;
    animateXpBar(xpPct);

    const statsEl = document.getElementById('ach-stats-grid');
    if (statsEl) statsEl.innerHTML = renderStats(data.stats);

    const continueEl = document.getElementById('ach-continue-list');
    if (continueEl) continueEl.innerHTML = renderContinueItems(data.continueItems);

    const streakCurrent = document.getElementById('ach-streak-current');
    const streakLongest = document.getElementById('ach-streak-longest');
    const streakToday = document.getElementById('ach-streak-today');
    if (streakCurrent) streakCurrent.textContent = data.streak.current;
    if (streakLongest) streakLongest.textContent = data.streak.longest;
    if (streakToday) streakToday.hidden = !data.streak.activeToday;

    const weekEl = document.getElementById('ach-week');
    if (weekEl) weekEl.innerHTML = renderWeekDays(data.streak.weekDays);

    const monthEl = document.getElementById('ach-month');
    if (monthEl) monthEl.innerHTML = renderMonthDays(data.streak.monthDays);

    const badgesCount = document.getElementById('ach-badges-count');
    if (badgesCount) badgesCount.textContent = `${data.unlockedBadges.length} ta ochilgan`;

    const badgesEl = document.getElementById('ach-badges-grid');
    if (badgesEl) badgesEl.innerHTML = renderBadges(data.unlockedBadges);

    const lockedEl = document.getElementById('ach-locked-grid');
    if (lockedEl) lockedEl.innerHTML = renderLocked(data.lockedBadges);

    const earnedEl = document.getElementById('ach-earned-timeline');
    if (earnedEl) earnedEl.innerHTML = renderEarnedTimeline(data.earnedTimeline);

    const timelineEl = document.getElementById('ach-timeline');
    if (timelineEl) {
        timelineEl.innerHTML = renderTimelineItems(
            data.recentUnlocks,
            'So\'nggi yutuqlar hali yo\'q.',
            'Faol bo\'ling',
            'pages/asarlar.html'
        );
    }

    const activityEl = document.getElementById('ach-activity-list');
    if (activityEl) {
        activityEl.innerHTML = renderTimelineItems(
            data.activity,
            'Faoliyat tarixi hali bo\'sh.',
            'Birinchi qadam',
            'pages/asarlar.html'
        );
    }

    const certsEl = document.getElementById('ach-certs-list');
    if (certsEl) certsEl.innerHTML = renderCertificates(data.certificates, data.hasCertificates);

    const libraryBtn = document.getElementById('ach-library-btn');
    if (libraryBtn && data.links?.library) {
        libraryBtn.setAttribute('data-ach-link', data.links.library);
        libraryBtn.setAttribute('href', achHref(data.links.library));
    }

    applyAchLinks();
}

async function waitForProgress(maxAttempts = 50) {
    let attempts = 0;
    while ((!window.UserProgress || !window.AchievementEngine) && attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 100));
        attempts += 1;
    }
    return window.UserProgress && window.AchievementEngine;
}

async function loadPlatformScripts() {
    if (window.platformProgressReady) {
        await window.platformProgressReady;
        return;
    }
    if (window.platformDataReady) {
        await window.platformDataReady;
    }
}

async function refreshYutuqlar(newUnlockIds) {
    if (achRefreshPromise) return achRefreshPromise;

    const showSkeleton = !achInitialLoadDone;
    if (showSkeleton) showLoading(true);

    achRefreshPromise = (async () => {
        try {
            await loadPlatformScripts();
            const ready = await waitForProgress();
            if (!ready) throw new Error('Progress tizimi yuklanmadi');

            let stats = {};
            let recommendations = null;
            if (typeof getPlatformStatistics === 'function') {
                stats = await getPlatformStatistics();
            }
            if (typeof recommendPlatformContent === 'function') {
                recommendations = await recommendPlatformContent({ limit: 6 });
            }

            if (!newUnlockIds?.length) {
                UserProgress.syncAchievements(stats);
            }
            const model = AchievementEngine.buildYutuqlarModel(UserProgress.getState(), stats, recommendations);
            renderYutuqlar(model);
            if (newUnlockIds?.length) {
                AchievementEngine.markNewBadgeElements(newUnlockIds);
            }
            achInitialLoadDone = true;
            showLoading(false);
        } catch (err) {
            console.error('Yutuqlar yuklash xatosi:', err);
            showError(true);
        } finally {
            achRefreshPromise = null;
        }
    })();

    return achRefreshPromise;
}

function bindYutuqlarEvents() {
    let refreshTimer = null;
    const refresh = detail => {
        if (!achInitialLoadDone) return;
        const ids = detail?.id ? [detail.id] : (Array.isArray(detail) ? detail.map(d => d.id) : undefined);
        clearTimeout(refreshTimer);
        refreshTimer = setTimeout(() => refreshYutuqlar(ids), 200);
    };

    window.addEventListener('platform:progressChanged', e => refresh(e.detail));
    window.addEventListener('platform:achievementUnlocked', e => refresh(e.detail));

    if (window.PlatformDataService?.on) {
        PlatformDataService.on('dataUpdated', () => refresh());
    }

    window.addEventListener('storage', e => {
        if (!e.key) return;
        const isProgress = e.key.includes('platform-user-progress') || e.key === 'gafur-video-progress';
        if (isProgress) refresh();
    });

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && achInitialLoadDone) {
            refresh();
        }
    });

    document.getElementById('ach-retry-btn')?.addEventListener('click', () => refreshYutuqlar());

    document.getElementById('ach-view-all-badges')?.addEventListener('click', e => {
        e.preventDefault();
        document.getElementById('ach-badges-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

async function initYutuqlar() {
    applyAchLinks();
    bindYutuqlarEvents();
    await refreshYutuqlar();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initYutuqlar);
} else {
    initYutuqlar();
}

window.YutuqlarApp = { refresh: refreshYutuqlar };
