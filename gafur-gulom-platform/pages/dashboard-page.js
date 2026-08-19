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

function dashHref(relativePath) {
    return (window.platformUrl || (r => r))(relativePath);
}

let currentContinueItem = null;

const GOAL_LINKS = {
    'Bitta asar o\'qing': 'pages/asarlar.html',
    'Test ishlash': 'pages/interaktiv.html',
    'AI bilan suhbat': 'pages/ai-yordamchi.html'
};

const TASK_ICON = '<span class="dash-metric__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></span>';

function renderGoals(goals) {
    const activeGoals = (goals || []).filter(goal => !goal.done);
    if (!activeGoals.length) {
        const allDone = goals?.length && goals.every(goal => goal.done);
        return `
            <div class="dash-metric__inner">
                <div class="dash-metric__visual dash-metric__visual--slot" aria-hidden="true"></div>
                <p class="dash-metric__label">${allDone ? 'Bugungi vazifalar bajarildi' : 'Bugun uchun vazifa yo\'q'}</p>
                <div class="dash-metric__meta">
                    <span class="dash-metric__status">Kutubxona yoki testlardan tanlang</span>
                </div>
                <div class="dash-metric__progress dash-metric__progress--slot" aria-hidden="true"></div>
                <div class="dash-metric__action">
                    <a href="${escapeHtml(dashHref('pages/asarlar.html'))}" class="dash-btn dash-btn--primary dash-btn--block dash-btn--metric" data-dash-library-link>Kutubxona</a>
                </div>
            </div>
        `;
    }

    const goal = activeGoals[0];
    const href = dashHref(GOAL_LINKS[goal.title] || 'pages/asarlar.html');
    return `
        <div class="dash-metric__inner">
            <div class="dash-metric__visual">${TASK_ICON}</div>
            <p class="dash-metric__label">${escapeHtml(goal.title)}</p>
            <div class="dash-metric__meta">
                <span class="dash-metric__pill">${escapeHtml(goal.time)} · Kunlik vazifa</span>
            </div>
            <div class="dash-metric__progress dash-metric__progress--slot" aria-hidden="true"></div>
            <div class="dash-metric__action">
                <a href="${escapeHtml(href)}" class="dash-btn dash-btn--primary dash-btn--block dash-btn--metric">Boshlash</a>
            </div>
        </div>
    `;
}

function renderRecommendations(recs) {
    if (!recs?.length) return '';
    return recs.map(rec => `
        <li class="dash-rec">
            <div>
                <p class="dash-rec__text">${escapeHtml(rec.text)}</p>
                <a class="dash-rec__link" href="${escapeHtml(dashHref(rec.link))}">${escapeHtml(rec.linkText)}</a>
            </div>
        </li>
    `).join('');
}

function renderCompactStats(data) {
    const stats = data.stats || {};
    const items = [
        { label: 'O\'qilgan asarlar', value: String(stats.booksOpened || 0) },
        { label: 'Ko\'rilgan videolar', value: String(stats.videosWatched || 0) },
        { label: 'Yechilgan testlar', value: String(stats.testsCompleted || 0) },
        { label: 'Olingan yutuqlar', value: String(data.achievements.badges || 0) },
        { label: 'O\'qish ketma-ketligi', value: `${data.achievements.streak || 0} kun` }
    ];

    return items.map(item => `
        <div class="dash-stat">
            <p class="dash-stat__value">${escapeHtml(item.value)}</p>
            <p class="dash-stat__label">${escapeHtml(item.label)}</p>
        </div>
    `).join('');
}

function renderAchievementList(badges, data) {
    const list = (badges || []).filter(b => b && b !== 'Boshlang\'ich');
    if (!list.length) {
        return `
            <div class="dash-empty-state dash-empty-state--inline">
                <p class="dash-empty-state__title">Hali yutuq qayd etilmagan.</p>
                <p class="dash-empty-state__text">Asar o'qing, test ishlang yoki videolar tomosha qiling — natijalar shu yerda ko'rinadi.</p>
            </div>
        `;
    }

    return list.map(title => `
        <article class="dash-ach-item">
            <span class="dash-ach-item__mark" aria-hidden="true"></span>
            <div>
                <h3 class="dash-ach-item__title">${escapeHtml(title)}</h3>
                <p class="dash-ach-item__meta">O'quv faoliyati natijasi · ${escapeHtml(data.xp.title)}</p>
            </div>
        </article>
    `).join('');
}

function renderBadgeChips(badges) {
    return renderAchievementList(badges, { xp: { title: '' } });
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

function renderProfileStats(data) {
    const stats = data.stats || {};
    const items = [
        { label: 'O\'qish darajasi', value: `${data.progress.percent}%` },
        { label: 'Joriy daraja', value: `${data.xp.level} — ${data.xp.title}` },
        { label: 'XP', value: `${data.achievements.xp} ball` },
        { label: 'O\'qilgan asarlar', value: String(stats.booksOpened || 0) },
        { label: 'Yakunlangan asarlar', value: String(stats.booksCompleted || 0) },
        { label: 'Test natijalari', value: stats.testsCompleted
            ? `${stats.testsCompleted} ta · o'rtacha ${stats.avgQuizScore}%`
            : 'Hali test yo\'q' },
        { label: 'Yutuqlar', value: `${data.achievements.badges} ta` },
        { label: 'Ketma-ket kun', value: `${data.achievements.streak} kun` }
    ];

    return items.map(item => `
        <div class="dash-profile-stat">
            <div>
                <p class="dash-profile-stat__label">${escapeHtml(item.label)}</p>
                <p class="dash-profile-stat__value">${escapeHtml(item.value)}</p>
            </div>
        </div>
    `).join('');
}

function renderProfileTests(tests) {
    if (!tests?.length) {
        return '<li class="dash-profile-tests__empty">Hali test natijalari yo\'q. Interaktiv bo\'limdan test ishlang.</li>';
    }
    return tests.slice(0, 5).map(test => `
        <li class="dash-profile-tests__item">
            <div>
                <p class="dash-profile-tests__title">${escapeHtml(test.title)}</p>
                <p class="dash-profile-tests__meta">${escapeHtml(test.category || 'Test')} · ${Math.round(test.percentage)}%</p>
            </div>
            <span class="dash-profile-tests__score">${Math.round(test.percentage)}%</span>
        </li>
    `).join('');
}

function parseLessonKey(raw) {
    const value = String(raw || '').trim();
    if (!value.includes('::')) return { classNum: '', title: value };
    const [classNum, ...rest] = value.split('::');
    return {
        classNum: classNum.trim(),
        title: rest.join('::').trim() || value
    };
}

function formatContinueDisplay(item) {
    const source = item.id || item.title || '';
    if (item.kind === 'lesson') {
        const parsed = parseLessonKey(source);
        const title = parsed.title || item.title || 'Dars';
        const initial = title.replace(/^['"]/, '').trim().charAt(0).toUpperCase();
        return {
            title,
            coverMark: initial || parsed.classNum || 'D',
            typeLabel: parsed.classNum ? `${parsed.classNum}-sinf dars` : (item.type || 'Dars'),
            badge: parsed.classNum ? `${parsed.classNum}-sinf` : 'Dars'
        };
    }
    const title = item.title || 'Asar';
    return {
        title,
        coverMark: title.trim().charAt(0).toUpperCase() || 'G',
        typeLabel: item.type || 'Asar',
        badge: item.type || 'Asar'
    };
}

async function enrichContinueLearning(item) {
    if (!item || item.empty) return item;
    const enriched = { ...item };
    const platformUrl = window.platformUrl || (r => r);

    try {
        if (item.kind === 'poem' && typeof getSherById === 'function') {
            const poem = await getSherById(item.id);
            if (poem) {
                enriched.author = "G'afur G'ulom";
                enriched.description = poem.qisqa || '';
                enriched.type = "She'r";
            }
        } else if (item.kind === 'qissa' && typeof getQissalar === 'function') {
            const list = await getQissalar();
            const qissa = list.find(q => q.id === item.id);
            if (qissa) {
                enriched.author = qissa.muallif || "G'afur G'ulom";
                enriched.description = qissa.qisqa || '';
                enriched.type = 'Qissa';
                if (qissa.rasm) enriched.cover = platformUrl(qissa.rasm);
            }
        } else if (item.kind === 'doston' && typeof getDostonlar === 'function') {
            const list = await getDostonlar();
            const doston = list.find(d => d.id === item.id);
            if (doston) {
                enriched.author = "G'afur G'ulom";
                enriched.description = doston.qisqa || '';
                enriched.type = 'Doston';
            }
        } else if (item.kind === 'lesson') {
            const parsed = parseLessonKey(item.id || item.title);
            enriched.title = parsed.title || item.title;
            enriched.type = parsed.classNum ? `${parsed.classNum}-sinf dars` : 'Dars';
            enriched.href = item.href || 'pages/talim.html';
        }
    } catch (e) {
        console.warn('Continue learning enrich skipped:', e);
    }

    if (window.UserProgress?.getContinueHref && enriched.kind && enriched.id != null) {
        enriched.href = window.UserProgress.getContinueHref(enriched);
    }

    return enriched;
}

function resolveContinueTarget(item) {
    if (!item || item.empty) return dashHref('pages/asarlar.html');
    let rawPath = item.completed
        ? (item.nextHref || 'pages/asarlar.html')
        : (window.UserProgress?.getContinueHref?.(item) || item.href || 'pages/asarlar.html');

    if (!item.completed) {
        const progress = Number(item.progress) || 0;
        if (progress > 0 && progress < 100 && !String(rawPath).includes('resume=1')) {
            rawPath += String(rawPath).includes('?') ? '&resume=1' : '?resume=1';
        }
    }

    return dashHref(rawPath);
}

function navigateToContinueReading(item) {
    window.location.href = resolveContinueTarget(item);
}

function renderContinueSection(item) {
    currentContinueItem = item && !item.empty ? { ...item } : null;
    const content = document.getElementById('dash-continue-content');
    const empty = document.getElementById('dash-continue-empty');
    if (!content || !empty) return;

    if (!item || item.empty) {
        content.hidden = true;
        empty.hidden = false;
        content.classList.remove('is-completed');
        return;
    }

    content.hidden = false;
    empty.hidden = true;

    const display = formatContinueDisplay(item);
    const progress = item.completed ? 100 : Math.max(0, Math.min(100, Number(item.progress) || 0));
    const pctLabel = item.completed ? 'Yakunlangan ✓' : `${progress}%`;

    content.classList.toggle('is-completed', Boolean(item.completed));

    const authorEl = document.getElementById('dash-continue-author');
    if (authorEl) {
        if (item.author) {
            authorEl.textContent = item.author;
            authorEl.hidden = false;
        } else {
            authorEl.hidden = true;
            authorEl.textContent = '';
        }
    }

    const titleEl = document.getElementById('dash-continue-title');
    if (titleEl) titleEl.textContent = display.title;

    const metaTypeEl = document.getElementById('dash-continue-meta-type');
    const metaStatusEl = document.getElementById('dash-continue-meta-status');
    const metaSepEl = document.getElementById('dash-continue-meta-sep');
    if (metaTypeEl) metaTypeEl.textContent = display.typeLabel;
    if (metaStatusEl) {
        metaStatusEl.textContent = item.completed ? 'Yakunlangan' : `${progress}% o'qilgan`;
    }
    if (metaSepEl) metaSepEl.hidden = false;

    const descEl = document.getElementById('dash-continue-desc');
    if (descEl) {
        descEl.textContent = item.description || '';
        descEl.hidden = !item.description;
    }

    const progressWrap = document.getElementById('dash-continue-progress-wrap');
    const progressBar = document.getElementById('dash-continue-progress-bar');
    const progressFill = document.getElementById('dash-continue-progress-fill');
    const progressPct = document.getElementById('dash-continue-pct');
    if (progressWrap) progressWrap.hidden = Boolean(item.completed);
    if (progressFill) progressFill.style.width = `${progress}%`;
    if (progressPct) progressPct.textContent = pctLabel;
    if (progressBar) {
        progressBar.setAttribute('aria-valuenow', String(progress));
        progressBar.setAttribute('aria-label', item.completed
            ? `${item.title} yakunlangan`
            : `${item.title} bo'yicha o'qish progressi ${progress} foiz`);
    }

    const btn = document.getElementById('dash-continue-btn');
    if (btn) {
        if (item.completed) {
            btn.textContent = 'Keyingi asarni tanlash';
            btn.href = resolveContinueTarget(item);
        } else {
            btn.textContent = 'Davom etish';
            btn.href = resolveContinueTarget(item);
        }
    }
}

function resolveDashboardUser(data) {
    const authUser = window.PlatformAuth?.getCurrentUser?.();
    if (authUser) {
        const name = (authUser.name || `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim()).trim();
        const firstName = authUser.firstName || name.split(/\s+/)[0] || '';
        const lastName = authUser.lastName || name.split(/\s+/).slice(1).join(' ') || '';
        return {
            name: name || 'Foydalanuvchi',
            initials: authUser.initials || getProfileInitials(firstName, lastName),
            email: authUser.email || '',
            memberSince: authUser.memberSince || data?.user?.memberSince || ''
        };
    }

    const progressUser = data?.user || {};
    const name = String(progressUser.name || '').trim();
    const parts = name.split(/\s+/).filter(Boolean);
    return {
        name: name || 'Foydalanuvchi',
        initials: String(progressUser.initials || '').trim() || getProfileInitials(parts[0] || '', parts.slice(1).join(' ') || ''),
        email: progressUser.email || '',
        memberSince: progressUser.memberSince || ''
    };
}

async function ensureDashboardDataReady() {
    if (window.platformProgressReady) {
        await window.platformProgressReady;
        return;
    }
    if (window.platformDataReady) {
        await window.platformDataReady;
    }
    let attempts = 0;
    while (!window.UserProgress && attempts < 40) {
        await new Promise(resolve => window.setTimeout(resolve, 50));
        attempts += 1;
    }
}

async function syncAuthToDashboardProgress() {
    await ensureDashboardDataReady();
    window.PlatformAuth?.syncUserToProgress?.();
}

function renderProfileSection(data) {
    const user = resolveDashboardUser(data);
    const sectionAvatar = document.getElementById('dash-profile-section-avatar');
    const sectionName = document.getElementById('dash-profile-section-name');
    const sectionEmail = document.getElementById('dash-profile-section-email');
    const sectionRank = document.getElementById('dash-profile-section-rank');
    const memberSince = document.getElementById('dash-profile-member-since');
    const statsEl = document.getElementById('dash-profile-stats');
    const testsEl = document.getElementById('dash-profile-tests-list');

    if (sectionAvatar) sectionAvatar.textContent = user.initials;
    if (sectionName) sectionName.textContent = user.name;
    if (sectionEmail) sectionEmail.textContent = user.email || 'Email kiritilmagan';
    if (sectionRank) sectionRank.textContent = data.xp.title;
    if (memberSince) {
        memberSince.textContent = user.memberSince
            ? `A\'zolik: ${user.memberSince}`
            : '';
    }
    if (statsEl) statsEl.innerHTML = renderProfileStats(data);

    const state = window.UserProgress?.getState?.();
    if (testsEl) testsEl.innerHTML = renderProfileTests(state?.testsCompleted);
}

function setActiveNav(navKey) {
    document.querySelectorAll('.dash-nav__link[data-dash-nav]').forEach(link => {
        link.classList.toggle('is-active', link.dataset.dashNav === navKey);
    });
}

function navigateToSection(sectionId, navKey) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('dash-sidebar')?.classList.remove('is-open');
    if (navKey) setActiveNav(navKey);

    if (sectionId === 'profile-section') {
        section.classList.add('is-highlighted');
        window.setTimeout(() => section.classList.remove('is-highlighted'), 1200);
    }
}

function splitUserName(fullName) {
    const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return { firstName: '', lastName: '' };
    if (parts.length === 1) return { firstName: parts[0], lastName: '' };
    return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

function getProfileInitials(firstName, lastName) {
    const a = firstName.trim().charAt(0);
    const b = lastName.trim().charAt(0);
    return (a + b).toUpperCase() || 'F';
}

function updateStoredAuthUser(userId, { firstName, lastName }) {
    try {
        const raw = localStorage.getItem('platform-auth-users');
        const users = raw ? JSON.parse(raw) : [];
        const index = users.findIndex(u => u.id === userId);
        if (index === -1) return false;
        users[index].firstName = firstName;
        users[index].lastName = lastName;
        localStorage.setItem('platform-auth-users', JSON.stringify(users));
        return true;
    } catch (e) {
        return false;
    }
}

function openProfileEditModal() {
    const modal = document.getElementById('dash-profile-modal');
    const user = window.PlatformAuth?.getCurrentUser?.();
    const progressUser = window.UserProgress?.getState?.()?.user;
    const source = user || progressUser || {};
    const { firstName, lastName } = user
        ? {
            firstName: user.firstName || splitUserName(user.name).firstName,
            lastName: user.lastName || splitUserName(user.name).lastName
        }
        : splitUserName(source.name);

    const firstInput = document.getElementById('profile-edit-firstname');
    const lastInput = document.getElementById('profile-edit-lastname');
    const emailInput = document.getElementById('profile-edit-email');

    if (firstInput) firstInput.value = firstName;
    if (lastInput) lastInput.value = lastName;
    if (emailInput) {
        emailInput.value = source.email || '';
        emailInput.readOnly = !!user;
    }

    document.querySelectorAll('.dash-profile-field__error').forEach(el => {
        el.hidden = true;
        el.textContent = '';
    });

    modal?.classList.add('is-open');
    modal?.setAttribute('aria-hidden', 'false');
    firstInput?.focus();
}

function closeProfileEditModal() {
    const modal = document.getElementById('dash-profile-modal');
    modal?.classList.remove('is-open');
    modal?.setAttribute('aria-hidden', 'true');
}

function showProfileFieldError(fieldId, message) {
    const errorEl = document.getElementById(fieldId);
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.hidden = !message;
}

async function saveProfileFromForm(event) {
    event.preventDefault();

    const firstName = document.getElementById('profile-edit-firstname')?.value.trim() || '';
    const lastName = document.getElementById('profile-edit-lastname')?.value.trim() || '';
    const email = document.getElementById('profile-edit-email')?.value.trim() || '';

    showProfileFieldError('profile-edit-firstname-error', '');
    showProfileFieldError('profile-edit-lastname-error', '');

    let hasError = false;
    if (!firstName) {
        showProfileFieldError('profile-edit-firstname-error', 'Ismni kiriting.');
        hasError = true;
    }
    if (!lastName) {
        showProfileFieldError('profile-edit-lastname-error', 'Familiyani kiriting.');
        hasError = true;
    }
    if (hasError) return;

    const name = `${firstName} ${lastName}`.trim();
    const initials = getProfileInitials(firstName, lastName);
    const authUser = window.PlatformAuth?.getCurrentUser?.();

    if (authUser) {
        updateStoredAuthUser(authUser.id, { firstName, lastName });
        window.PlatformAuth?.syncUserToProgress?.();
        window.dispatchEvent(new CustomEvent('platform:authChanged', {
            detail: { user: window.PlatformAuth.getCurrentUser() }
        }));
    } else if (window.UserProgress?.updateProfile) {
        window.UserProgress.updateProfile({ name, initials, email });
    }

    closeProfileEditModal();
    await refreshDashboard();
}

function handleDashboardLogout() {
    window.PlatformAuth?.logout();
    window.location.href = (window.platformUrl || (r => r))('index.html');
}

function bindProfileNavigation() {
    const profileTargets = [
        { selector: '[data-dash-nav="profile"]', sectionId: 'profile-section', navKey: 'profile' },
        { selector: '[data-dash-nav="achievements"]', sectionId: 'achievements', navKey: 'achievements' },
        { selector: '[data-dash-nav="home"]', sectionId: 'dashboard-home', navKey: 'home' }
    ];

    profileTargets.forEach(({ selector, sectionId, navKey }) => {
        document.querySelectorAll(selector).forEach(el => {
            el.addEventListener('click', (event) => {
                event.preventDefault();
                navigateToSection(sectionId, navKey);
            });
        });
    });

    document.addEventListener('click', (event) => {
        const btn = event.target.closest('#header-auth-btn, #drawer-auth-btn');
        if (!btn || btn.dataset.authAction !== 'dashboard') return;
        if (!document.body.classList.contains('page-dashboard')) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        navigateToSection('profile-section', 'profile');
    }, true);
}

function bindProfileEditModal() {
    document.getElementById('dash-profile-edit-form')?.addEventListener('submit', saveProfileFromForm);
    document.getElementById('dash-profile-edit-btn')?.addEventListener('click', openProfileEditModal);

    document.querySelectorAll('[data-profile-modal-close]').forEach(el => {
        el.addEventListener('click', closeProfileEditModal);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && document.getElementById('dash-profile-modal')?.classList.contains('is-open')) {
            closeProfileEditModal();
        }
    });
}

function handleInitialDashboardHash() {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'profile-section') {
        window.requestAnimationFrame(() => navigateToSection('profile-section', 'profile'));
    } else if (hash === 'achievements') {
        window.requestAnimationFrame(() => navigateToSection('achievements', 'achievements'));
    }
}

function setCircularProgress(percent) {
    const ring = document.getElementById('dash-progress-ring');
    const ringFill = document.getElementById('dash-progress-ring-fill');
    const pct = Math.max(0, Math.min(100, Number(percent) || 0));
    const circumference = 2 * Math.PI * 36;
    const offset = circumference * (1 - pct / 100);
    if (ringFill) {
        ringFill.style.strokeDasharray = String(circumference);
        ringFill.style.strokeDashoffset = String(offset);
    }
    if (ring) {
        ring.setAttribute('aria-valuenow', String(pct));
    }
}

function renderDashboard(data) {
    const user = resolveDashboardUser(data);
    const xpPct = Math.round((data.xp.currentXp / data.xp.nextLevelXp) * 100);

    const greeting = document.getElementById('dash-greeting');
    if (greeting) {
        const firstName = user.name.split(/\s+/)[0] || 'foydalanuvchi';
        greeting.textContent = `Assalomu alaykum, ${firstName}!`;
    }

    const greetingSub = document.getElementById('dash-greeting-sub');
    if (greetingSub) {
        greetingSub.textContent = data.progress.nextGoal
            ? `Bugun o'qishni davom ettirish uchun: ${data.progress.nextGoal.replace(/^Keyingi maqsad:\s*/i, '')}`
            : 'Bugun o\'qishni davom ettirish uchun sizga mos tavsiyalar.';
    }

    const lastActivity = document.getElementById('dash-last-activity');
    const recent = data.recentActivity?.[0];
    if (lastActivity) {
        if (recent?.text) {
            lastActivity.textContent = `Oxirgi faoliyat: ${recent.text}${recent.time ? ` · ${recent.time}` : ''}`;
            lastActivity.hidden = false;
        } else {
            lastActivity.hidden = true;
            lastActivity.textContent = '';
        }
    }

    const profileName = document.getElementById('dash-profile-name');
    const profileMeta = document.getElementById('dash-profile-meta');
    const profileAvatar = document.getElementById('dash-profile-avatar');
    if (profileName) profileName.textContent = user.name;
    if (profileMeta) profileMeta.textContent = user.email;
    if (profileAvatar) profileAvatar.textContent = user.initials;

    const progressFill = document.getElementById('dash-progress-fill');
    const progressPct = document.getElementById('dash-progress-pct');
    const progressHint = document.getElementById('dash-progress-hint');
    if (progressFill) progressFill.style.width = `${data.progress.percent}%`;
    if (progressPct) progressPct.textContent = `${data.progress.percent}%`;
    if (progressHint) progressHint.textContent = data.progress.nextGoal;
    setCircularProgress(data.progress.percent);

    const xpLevel = document.getElementById('dash-xp-level');
    const xpTitle = document.getElementById('dash-xp-title');
    const xpPoints = document.getElementById('dash-xp-points');
    const xpFill = document.getElementById('dash-xp-fill');
    if (xpLevel) xpLevel.textContent = data.xp.level;
    if (xpTitle) xpTitle.textContent = data.xp.title;
    if (xpPoints) xpPoints.textContent = `${data.xp.currentXp} / ${data.xp.nextLevelXp} XP`;
    if (xpFill) xpFill.style.width = `${xpPct}%`;

    renderContinueSection(data.continueLearning);

    const goalsList = document.getElementById('dash-goals-list');
    if (goalsList) goalsList.innerHTML = renderGoals(data.todayGoals);

    const achCerts = document.getElementById('dash-stat-certs');
    const achBadges = document.getElementById('dash-stat-badges');
    const achStreak = document.getElementById('dash-stat-streak');
    const achXp = document.getElementById('dash-stat-xp');
    const badgeList = document.getElementById('dash-badge-list');
    const statsGrid = document.getElementById('dash-stats-grid');
    if (achCerts) achCerts.textContent = data.achievements.certificates;
    if (achBadges) achBadges.textContent = data.achievements.badges;
    if (achStreak) achStreak.textContent = data.achievements.streak;
    if (achXp) achXp.textContent = data.achievements.xp;
    if (statsGrid) statsGrid.innerHTML = renderCompactStats(data);
    if (badgeList) badgeList.innerHTML = renderAchievementList(data.achievements.badgeList, data);

    const recsList = document.getElementById('dash-recs-list');
    if (recsList) recsList.innerHTML = renderRecommendations(data.aiRecommendations);

    renderProfileSection(data);
}

async function loadPlatformDataForDashboard() {
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

async function refreshDashboard() {
    await ensureDashboardDataReady();

    let stats = null;
    let recommendations = null;

    if (typeof getPlatformStatistics === 'function') {
        stats = await getPlatformStatistics();
    }
    if (typeof recommendPlatformContent === 'function') {
        recommendations = await recommendPlatformContent({ limit: 3 });
    }

    if (window.UserProgress) {
        UserProgress.syncAchievements(stats);
        const model = UserProgress.buildDashboardModel(stats, recommendations);
        model.continueLearning = await enrichContinueLearning(model.continueLearning);
        renderDashboard(model);
    }
}

function bindContinueReadingButton() {
    const btn = document.getElementById('dash-continue-btn');
    if (!btn || btn.dataset.continueBound === '1') return;
    btn.dataset.continueBound = '1';

    btn.addEventListener('click', (event) => {
        if (!currentContinueItem) return;
        event.preventDefault();
        navigateToContinueReading(currentContinueItem);
    });
}

function bindDashboardEvents() {
    const refresh = () => refreshDashboard();

    const onUnlock = (ach) => {
        const ids = ach?.id ? [ach.id] : [];
        refresh().then(() => {
            if (ids.length && window.AchievementEngine) {
                AchievementEngine.markNewBadgeElements(ids);
            }
        });
    };

    if (window.PlatformDataService?.on) {
        PlatformDataService.on('dataUpdated', refresh);
        PlatformDataService.on('progressChanged', refresh);
        PlatformDataService.on('contentOpened', refresh);
        PlatformDataService.on('favoriteChanged', refresh);
        PlatformDataService.on('achievementUnlocked', onUnlock);
    }

    ['platform:progressChanged', 'platform:contentOpened', 'platform:favoriteChanged', 'platform:achievementUnlocked'].forEach(evt => {
        window.addEventListener(evt, (e) => {
            if (evt === 'platform:achievementUnlocked') onUnlock(e.detail);
            else refresh();
        });
    });

    window.addEventListener('storage', (e) => {
        if (e.key && e.key.includes('progress')) refresh();
    });
}

async function initDashboard() {
    const dashboardUrl = (window.platformUrl || (r => r))('pages/dashboard.html');

    if (window.PlatformAuth && !window.PlatformAuth.isAuthenticated()) {
        window.PlatformAuthUI?.open('login', { redirect: dashboardUrl });
    } else {
        await syncAuthToDashboardProgress();
    }

    await refreshDashboard();
    bindDashboardEvents();
    bindContinueReadingButton();

    bindProfileNavigation();
    bindProfileEditModal();
    handleInitialDashboardHash();

    document.getElementById('dash-logout-btn')?.addEventListener('click', handleDashboardLogout);
    document.querySelectorAll('.dash-profile-logout').forEach(btn => {
        btn.addEventListener('click', handleDashboardLogout);
    });

    window.addEventListener('platform:authChanged', async () => {
        if (!window.PlatformAuth?.isAuthenticated()) {
            window.PlatformAuthUI?.open('login', { redirect: dashboardUrl });
            return;
        }
        await syncAuthToDashboardProgress();
        await refreshDashboard();
    });

    document.getElementById('dash-sidebar-toggle')?.addEventListener('click', () => {
        navigateToSection('profile-section', 'profile');
    });

    document.querySelectorAll('.dash-nav__link:not([data-dash-nav])').forEach(link => {
        link.addEventListener('click', () => {
            document.getElementById('dash-sidebar')?.classList.remove('is-open');
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}

window.DashboardApp = {
    refresh: refreshDashboard,
    getLiveData: () => window.UserProgress?.buildDashboardModel(),
    getContinueItem: () => currentContinueItem
};
