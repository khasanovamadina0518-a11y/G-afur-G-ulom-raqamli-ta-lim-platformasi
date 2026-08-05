/**
 * Dashboard — local placeholder data
 * Future: replace loadDashboardData with API/auth provider.
 */

const DASHBOARD_STORAGE_KEY = 'dashboard-user-data';

const DEFAULT_DASHBOARD = {
    user: {
        name: 'Umida Karimova',
        initials: 'UK',
        email: 'umida@example.uz',
        memberSince: '2025-yil yanvar'
    },
    progress: {
        percent: 78,
        nextGoal: "Keyingi maqsad: \"Netay\" hikoyasini o'qishni yakunlash"
    },
    xp: {
        level: 12,
        currentXp: 2400,
        nextLevelXp: 3000,
        title: 'Faol o\'quvchi'
    },
    continueLearning: {
        title: 'Shum bola',
        type: 'Roman',
        progress: 64,
        href: 'asarlar.html'
    },
    todayGoals: [
        { icon: '🏆', title: "\"Shum bola\" hikoyasini o'qish", time: '20 daqiqa', done: true },
        { icon: '📋', title: 'Test ishlash', time: '15 daqiqa', done: true },
        { icon: '🤖', title: 'AI bilan suhbat', time: '10 daqiqa', done: false }
    ],
    achievements: {
        certificates: 5,
        badges: 12,
        streak: 28,
        xp: 2400,
        badgeList: ['Birinchi test', 'Kitobxon', 'She\'rsevar', '7 kun streak', 'Video dars']
    },
    aiRecommendations: [
        { icon: '📖', text: 'Bugun \"Yillar sadosi\" she\'rlar to\'plamidan 2 ta she\'r o\'qing.', link: 'ai-yordamchi.html', linkText: 'AI yordamchi' },
        { icon: '🎯', text: '\"G\'afur G\'ulom hayoti\" testini yechib bilimingizni mustahkamlang.', link: 'interaktiv.html', linkText: 'Testlar' },
        { icon: '🎬', text: 'Video dars: G\'afur G\'ulom hayoti va ijodi.', link: 'multimedia.html', linkText: 'Video darslar' }
    ],
    certificates: [
        { title: 'G\'afur G\'ulom asarlari', date: '2026-yil 15-mart' },
        { title: 'She\'riyat bo\'yicha test', date: '2026-yil 2-fevral' },
        { title: 'Elektron kutubxona kursi', date: '2025-yil 20-dekabr' }
    ],
    recentActivity: [
        { text: '\"Shum bola\" romani 3-bob o\'qildi', time: '2 soat oldin' },
        { text: 'Test: G\'afur G\'ulom hayoti — 85%', time: 'Kecha' },
        { text: 'AI yordamchi bilan suhbat boshlandi', time: 'Kecha' },
        { text: 'Video dars ko\'rildi: Hayot va ijod', time: '3 kun oldin' }
    ],
    favorites: [
        { label: 'Saqlangan asarlar', count: 8 },
        { label: 'Sevimli she\'rlar', count: 14 },
        { label: 'Video darslar', count: 5 }
    ]
};

function loadDashboardData() {
    try {
        const raw = localStorage.getItem(DASHBOARD_STORAGE_KEY);
        if (!raw) {
            localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(DEFAULT_DASHBOARD));
            return structuredClone(DEFAULT_DASHBOARD);
        }
        return { ...DEFAULT_DASHBOARD, ...JSON.parse(raw) };
    } catch (e) {
        return structuredClone(DEFAULT_DASHBOARD);
    }
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function renderGoals(goals) {
    return goals.map(goal => `
        <li class="dash-goal">
            <span class="dash-goal__icon" aria-hidden="true">${goal.icon}</span>
            <div class="dash-goal__text">
                <p class="dash-goal__title">${escapeHtml(goal.title)}</p>
                <p class="dash-goal__time">${escapeHtml(goal.time)}</p>
            </div>
            <span class="dash-goal__check ${goal.done ? 'is-done' : ''}" aria-label="${goal.done ? 'Bajarildi' : 'Bajarilmagan'}">${goal.done ? '✓' : ''}</span>
        </li>
    `).join('');
}

function renderRecommendations(recs) {
    return recs.map(rec => `
        <li class="dash-rec">
            <span class="dash-rec__icon" aria-hidden="true">${rec.icon}</span>
            <div>
                <p class="dash-rec__text">${escapeHtml(rec.text)}</p>
                <a class="dash-rec__link" href="${escapeHtml(rec.link)}">${escapeHtml(rec.linkText)} →</a>
            </div>
        </li>
    `).join('');
}

function renderCertificates(certs) {
    return certs.map(cert => `
        <li class="dash-cert">
            <span class="dash-cert__icon" aria-hidden="true">🏅</span>
            <div>
                <p class="dash-cert__title">${escapeHtml(cert.title)}</p>
                <p class="dash-cert__date">${escapeHtml(cert.date)}</p>
            </div>
        </li>
    `).join('');
}

function renderActivity(items) {
    return items.map(item => `
        <li class="dash-activity__item">
            <span class="dash-activity__dot" aria-hidden="true"></span>
            <div>
                <p class="dash-activity__text">${escapeHtml(item.text)}</p>
                <p class="dash-activity__time">${escapeHtml(item.time)}</p>
            </div>
        </li>
    `).join('');
}

function renderFavorites(favs) {
    return favs.map(fav => `
        <div class="dash-fav">
            <p class="dash-fav__num">${fav.count}</p>
            <p class="dash-fav__label">${escapeHtml(fav.label)}</p>
        </div>
    `).join('');
}

function renderBadgeChips(badges) {
    return badges.map(b => `<span class="dash-badge-chip">${escapeHtml(b)}</span>`).join('');
}

function renderDashboard() {
    const data = loadDashboardData();
    const xpPct = Math.round((data.xp.currentXp / data.xp.nextLevelXp) * 100);

    const greeting = document.getElementById('dash-greeting');
    if (greeting) {
        greeting.textContent = `Assalomu alaykum, ${data.user.name.split(' ')[0]}!`;
    }

    const profileName = document.getElementById('dash-profile-name');
    const profileMeta = document.getElementById('dash-profile-meta');
    const profileAvatar = document.getElementById('dash-profile-avatar');
    if (profileName) profileName.textContent = data.user.name;
    if (profileMeta) profileMeta.textContent = data.user.email;
    if (profileAvatar) profileAvatar.textContent = data.user.initials;

    const progressFill = document.getElementById('dash-progress-fill');
    const progressPct = document.getElementById('dash-progress-pct');
    const progressHint = document.getElementById('dash-progress-hint');
    if (progressFill) progressFill.style.width = `${data.progress.percent}%`;
    if (progressPct) progressPct.textContent = `${data.progress.percent}%`;
    if (progressHint) progressHint.textContent = data.progress.nextGoal;

    const xpLevel = document.getElementById('dash-xp-level');
    const xpTitle = document.getElementById('dash-xp-title');
    const xpPoints = document.getElementById('dash-xp-points');
    const xpFill = document.getElementById('dash-xp-fill');
    if (xpLevel) xpLevel.textContent = data.xp.level;
    if (xpTitle) xpTitle.textContent = data.xp.title;
    if (xpPoints) xpPoints.textContent = `${data.xp.currentXp} / ${data.xp.nextLevelXp} XP`;
    if (xpFill) xpFill.style.width = `${xpPct}%`;

    const continueTitle = document.getElementById('dash-continue-title');
    const continueMeta = document.getElementById('dash-continue-meta');
    const continueBtn = document.getElementById('dash-continue-btn');
    if (continueTitle) continueTitle.textContent = data.continueLearning.title;
    if (continueMeta) continueMeta.textContent = `${data.continueLearning.type} · ${data.continueLearning.progress}% o'qilgan`;
    if (continueBtn) continueBtn.href = data.continueLearning.href;

    const goalsList = document.getElementById('dash-goals-list');
    if (goalsList) goalsList.innerHTML = renderGoals(data.todayGoals);

    const achCerts = document.getElementById('dash-stat-certs');
    const achBadges = document.getElementById('dash-stat-badges');
    const achStreak = document.getElementById('dash-stat-streak');
    const achXp = document.getElementById('dash-stat-xp');
    const badgeList = document.getElementById('dash-badge-list');
    if (achCerts) achCerts.textContent = data.achievements.certificates;
    if (achBadges) achBadges.textContent = data.achievements.badges;
    if (achStreak) achStreak.textContent = data.achievements.streak;
    if (achXp) achXp.textContent = data.achievements.xp;
    if (badgeList) badgeList.innerHTML = renderBadgeChips(data.achievements.badgeList);

    const recsList = document.getElementById('dash-recs-list');
    if (recsList) recsList.innerHTML = renderRecommendations(data.aiRecommendations);

    const certsList = document.getElementById('dash-certs-list');
    if (certsList) certsList.innerHTML = renderCertificates(data.certificates);

    const activityList = document.getElementById('dash-activity-list');
    if (activityList) activityList.innerHTML = renderActivity(data.recentActivity);

    const favGrid = document.getElementById('dash-favorites-grid');
    if (favGrid) favGrid.innerHTML = renderFavorites(data.favorites);
}

document.addEventListener('DOMContentLoaded', async function () {
    renderDashboard();
    enrichDashboardFromPlatform();

    document.getElementById('dash-sidebar-toggle')?.addEventListener('click', () => {
        document.getElementById('dash-sidebar')?.classList.toggle('is-open');
    });

    document.querySelectorAll('.dash-nav__link').forEach(link => {
        link.addEventListener('click', () => {
            document.getElementById('dash-sidebar')?.classList.remove('is-open');
        });
    });
});

async function enrichDashboardFromPlatform() {
    if (typeof recommendPlatformContent !== 'function') {
        await loadPlatformDataForDashboard();
    }
    if (typeof recommendPlatformContent !== 'function') return;

    try {
        const recs = await recommendPlatformContent({ limit: 1 });
        const poem = recs.featured[0] || recs.newest[0];
        const video = recs.newest.find(r => r.kind === 'video') || recs.random.find(r => r.kind === 'video');

        const continueTitle = document.getElementById('dash-continue-title');
        if (continueTitle && poem?.title) {
            continueTitle.textContent = poem.title;
        }

        const recsList = document.getElementById('dash-recs-list');
        if (recsList && poem) {
            const dynamicRecs = [
                {
                    icon: '📖',
                    text: `Bugun "${poem.title}" bilan tanishing.`,
                    link: 'asarlar.html',
                    linkText: 'Kutubxona'
                },
                {
                    icon: '🎯',
                    text: 'G\'afur G\'ulom hayoti bo\'yicha viktorinani yeching.',
                    link: 'talim.html',
                    linkText: 'Testlar'
                },
                {
                    icon: '🎬',
                    text: video ? `Video dars: ${video.title}.` : 'Video darslar bo\'limini ko\'ring.',
                    link: 'multimedia.html',
                    linkText: 'Video darslar'
                }
            ];
            recsList.innerHTML = renderRecommendations(dynamicRecs);
        }

        if (typeof PlatformDataService?.on === 'function') {
            PlatformDataService.on('dataUpdated', () => enrichDashboardFromPlatform());
        }
    } catch (e) {
        console.warn('Dashboard platform enrichment skipped:', e);
    }
}

function loadPlatformDataForDashboard() {
    return new Promise((resolve, reject) => {
        if (window.platformDataReady) {
            window.platformDataReady.then(resolve).catch(reject);
            return;
        }
        const script = document.createElement('script');
        script.src = '../assets/js/data.js';
        script.onload = () => (window.platformDataReady || Promise.resolve()).then(resolve).catch(reject);
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

window.DashboardApp = {
    getData: loadDashboardData,
    setData(nextData) {
        localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(nextData));
        renderDashboard();
    }
};
