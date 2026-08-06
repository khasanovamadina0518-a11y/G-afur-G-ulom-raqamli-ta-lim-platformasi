/**
 * Dashboard — live user dashboard powered by PlatformDataService + UserProgress
 */

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
    if (!certs.length) {
        return '<li class="dash-cert"><span class="dash-cert__icon" aria-hidden="true">📜</span><div><p class="dash-cert__title">Hali sertifikat yo\'q</p><p class="dash-cert__date">Test ishlang (70%+)</p></div></li>';
    }
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
    if (!items.length) {
        return '<li class="dash-activity__item"><span class="dash-activity__dot" aria-hidden="true"></span><div><p class="dash-activity__text">Hali faoliyat yo\'q</p><p class="dash-activity__time">Platformada o\'rganishni boshlang</p></div></li>';
    }
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

function renderDashboard(data) {
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
    const progressBar = document.querySelector('[aria-labelledby="dash-progress-title"] .dash-progress__bar');
    if (progressFill) progressFill.style.width = `${data.progress.percent}%`;
    if (progressPct) progressPct.textContent = `${data.progress.percent}%`;
    if (progressHint) progressHint.textContent = data.progress.nextGoal;
    if (progressBar) {
        progressBar.setAttribute('aria-valuenow', String(data.progress.percent));
    }

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

async function loadPlatformDataForDashboard() {
    if (window.platformDataReady) {
        await window.platformDataReady;
        return;
    }
    await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = '../assets/js/data.js';
        script.onload = () => (window.platformDataReady || Promise.resolve()).then(resolve).catch(reject);
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function refreshDashboard() {
    await loadPlatformDataForDashboard();

    let stats = null;
    let recommendations = null;

    if (typeof getPlatformStatistics === 'function') {
        stats = await getPlatformStatistics();
    }
    if (typeof recommendPlatformContent === 'function') {
        recommendations = await recommendPlatformContent({ limit: 3 });
    }

    if (window.UserProgress) {
        const model = UserProgress.buildDashboardModel(stats, recommendations);
        renderDashboard(model);
    }
}

function bindDashboardEvents() {
    const refresh = () => refreshDashboard();

    if (window.PlatformDataService?.on) {
        PlatformDataService.on('dataUpdated', refresh);
        PlatformDataService.on('progressChanged', refresh);
        PlatformDataService.on('contentOpened', refresh);
        PlatformDataService.on('favoriteChanged', refresh);
        PlatformDataService.on('achievementUnlocked', refresh);
    }

    ['platform:progressChanged', 'platform:contentOpened', 'platform:favoriteChanged', 'platform:achievementUnlocked'].forEach(evt => {
        window.addEventListener(evt, refresh);
    });

    window.addEventListener('storage', (e) => {
        if (e.key && e.key.includes('progress')) refresh();
    });
}

document.addEventListener('DOMContentLoaded', async function () {
    await refreshDashboard();
    bindDashboardEvents();

    document.getElementById('dash-sidebar-toggle')?.addEventListener('click', () => {
        document.getElementById('dash-sidebar')?.classList.toggle('is-open');
    });

    document.querySelectorAll('.dash-nav__link').forEach(link => {
        link.addEventListener('click', () => {
            document.getElementById('dash-sidebar')?.classList.remove('is-open');
        });
    });
});

window.DashboardApp = {
    refresh: refreshDashboard,
    getLiveData: () => window.UserProgress?.buildDashboardModel()
};
