/**
 * AchievementEngine — automatic badge unlocks (Phase 11.3)
 * Uses UserProgress state + PlatformDataService statistics only.
 */
(function (global) {
    'use strict';

    const LEVEL_XP = 200;

    const LEVEL_TITLES = [
        { min: 1, title: 'Boshlang\'ich o\'quvchi', next: 'Faol o\'quvchi' },
        { min: 4, title: 'Faol o\'quvchi', next: 'Yaxshi o\'quvchi' },
        { min: 8, title: 'Yaxshi o\'quvchi', next: 'Bilimdon' },
        { min: 12, title: 'Bilimdon', next: 'Usta o\'quvchi' },
        { min: 16, title: 'Usta o\'quvchi', next: 'Afsona' }
    ];

    const CATALOG = [
        { id: 'first-step', icon: '📖', title: 'Birinchi kitob', desc: 'Birinchi asarni o\'qish', progress: s => ({ c: s.booksOpened, t: 1 }) },
        { id: 'first-video', icon: '🎬', title: 'Tomoshabin', desc: 'Birinchi videoni ko\'rish', progress: s => ({ c: s.videosWatched, t: 1 }) },
        { id: 'first-game', icon: '🎮', title: 'O\'yinchi', desc: 'Birinchi interaktiv o\'yinni o\'ynash', progress: s => ({ c: s.gamesCompleted, t: 1 }) },
        { id: 'streak-3', icon: '🔥', title: '3 kunlik streak', desc: '3 kun ketma-ket faol bo\'lish', progress: s => ({ c: Math.max(s.streak, s.streakLongest), t: 3 }) },
        { id: 'bookworm', icon: '📚', title: 'Kitobxon (5)', desc: '5 ta asar o\'qildi', progress: s => ({ c: s.booksOpened, t: 5 }) },
        { id: 'bookworm-10', icon: '📚', title: 'Kitobxon', desc: '10 ta asar o\'qish', progress: s => ({ c: s.booksOpened, t: 10 }) },
        { id: 'avid-reader', icon: '📖', title: '20 ta kitob o\'qing', desc: 'Asarlarda 20 ta asarni o\'qing', progress: s => ({ c: s.booksOpened, t: 20 }) },
        { id: 'book-finisher', icon: '✅', title: 'Asar ustasi', desc: '3 ta asarni to\'liq o\'qidingiz', progress: s => ({ c: s.booksCompleted, t: 3 }) },
        { id: 'active', icon: '🔥', title: '7 kunlik streak', desc: '7 kun ketma-ket faol bo\'lish', progress: s => ({ c: Math.max(s.streak, s.streakLongest), t: 7 }) },
        { id: 'active-user', icon: '⭐', title: 'Faol foydalanuvchi', desc: 'Platformada 20 ta faoliyat bajarish', progress: s => ({ c: s.activityCount, t: 20 }) },
        { id: 'streak-fire', icon: '🔥', title: 'Streak ustasi', desc: '30 kunlik eng uzoq streak', progress: s => ({ c: s.streakLongest, t: 30 }) },
        { id: 'test-expert', icon: '📝', title: 'Bilimdon', desc: 'Birinchi testni muvaffaqiyatli yakunlash', progress: s => ({ c: s.testsPassed70, t: 1 }) },
        { id: 'test-marathon', icon: '🏆', title: 'Bilim ustasi', desc: '10 ta testni muvaffaqiyatli bajarish', progress: s => ({ c: s.testsPassed70, t: 10 }) },
        { id: 'test-centurion', icon: '🏆', title: '100 ta test', desc: 'Jami 100 ta test yakunlang', progress: s => ({ c: s.testsCompleted, t: 100 }) },
        { id: 'quiz-scholar', icon: '🧠', title: 'Viktorina ustasi', desc: 'O\'rtacha test natijasi 80%+', progress: s => ({ c: s.avgQuiz, t: 80 }) },
        { id: 'video-master', icon: '🎥', title: 'Video ustasi', desc: '3 ta video dars ko\'rildi', progress: s => ({ c: s.videosWatched, t: 3 }) },
        { id: 'video-complete', icon: '🎬', title: 'Barcha videolar', desc: 'Barcha videolarni tomosha qiling', progress: (s, p) => ({ c: s.videosWatched, t: Math.max(p.videos, 1) }) },
        { id: 'ai-researcher', icon: '🤖', title: 'AI tadqiqotchisi', desc: 'AI yordamchi bilan 10 ta suhbat', progress: s => ({ c: s.aiChats, t: 10 }) },
        { id: 'ai-master', icon: '💬', title: 'AI eksperti', desc: 'AI yordamchi bilan 20 ta suhbat', progress: s => ({ c: s.aiChats, t: 20 }) },
        { id: 'scholar', icon: '🏅', title: 'Bilimdon', desc: 'Umumiy XP 500 dan oshdi', progress: s => ({ c: s.totalXp, t: 500 }) },
        { id: 'xp-legend', icon: '👑', title: 'XP afsonasi', desc: 'Umumiy XP 2000 dan oshdi', progress: s => ({ c: s.totalXp, t: 2000 }) },
        { id: 'game-master', icon: '🎮', title: 'Interaktiv ustasi', desc: '2 ta o\'yin yakunlandi', progress: s => ({ c: s.gamesCompleted, t: 2 }) },
        { id: 'favorite-collector', icon: '❤️', title: 'Sevimlilar to\'plovchi', desc: '5 ta sevimli asar saqlang', progress: s => ({ c: s.favorites, t: 5 }) },
        { id: 'time-learner', icon: '⏱️', title: 'O\'quv vaqti', desc: '60 daqiqa o\'qish vaqti', progress: s => ({ c: s.timeSpentMin, t: 60 }) },
        { id: 'dedicated', icon: '📅', title: 'Sodiq o\'quvchi', desc: '180 daqiqa o\'qish vaqti', progress: s => ({ c: s.timeSpentMin, t: 180 }) }
    ];

    function formatDate(ts) {
        return new Date(ts).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    function formatRelativeTime(ts) {
        const diff = Date.now() - ts;
        const min = Math.floor(diff / 60000);
        if (min < 1) return 'Hozirgina';
        if (min < 60) return `${min} daqiqa oldin`;
        const hrs = Math.floor(min / 60);
        if (hrs < 24) return hrs === 1 ? '1 soat oldin' : `${hrs} soat oldin`;
        const days = Math.floor(hrs / 24);
        if (days === 1) return 'Kecha';
        if (days < 7) return `${days} kun oldin`;
        if (days < 14) return '1 hafta oldin';
        return `${Math.floor(days / 7)} hafta oldin`;
    }

    function buildContext(state, platformStats) {
        const tests = state.testsCompleted || [];
        const books = state.booksOpened || [];
        const avgQuiz = tests.length
            ? Math.round(tests.reduce((s, t) => s + t.percentage, 0) / tests.length)
            : 0;
        const countKind = kind => books.filter(b => b.kind === kind).length;
        return {
            booksOpened: books.length,
            booksCompleted: (state.booksCompleted || []).length,
            poemsRead: countKind('poem'),
            qissalarRead: countKind('qissa'),
            dostonlarRead: countKind('doston') + countKind('book'),
            tarjimalarRead: countKind('tarjima'),
            tanlanganRead: countKind('book'),
            videosWatched: (state.videosWatched || []).length,
            audiosListened: (state.audiosListened || []).length,
            testsCompleted: tests.length,
            testsPassed70: tests.filter(t => t.percentage >= 70).length,
            avgQuiz,
            favorites: (state.favorites?.poems?.length || 0) + (state.favorites?.books?.length || 0),
            totalXp: state.totalXp || 0,
            timeSpentMin: state.timeSpentMin || 0,
            aiChats: state.aiChats || 0,
            gamesCompleted: state.gamesCompleted || 0,
            streak: state.streak?.current || 0,
            streakLongest: state.streak?.longest || 0,
            activityCount: (state.activity || []).length,
            platformVideos: platformStats?.videos || 4
        };
    }

    const WEEKDAY_LABELS = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];

    const ACTIVITY_ICONS = {
        poem: '📖', qissa: '📖', doston: '📖', book: '📖', tarjima: '📖', lesson: '📖',
        quiz: '📝', video: '🎬', game: '🎮', ai: '🤖', achievement: '🏆', favorite: '❤️', audio: '🎧',
        default: '📌'
    };

    function collectActiveDates(state) {
        const dates = new Set();
        const addTs = ts => {
            if (!ts) return;
            dates.add(new Date(ts).toISOString().slice(0, 10));
        };
        (state.activity || []).forEach(a => addTs(a.at));
        (state.booksOpened || []).forEach(b => addTs(b.openedAt));
        (state.videosWatched || []).forEach(v => addTs(v.watchedAt));
        (state.testsCompleted || []).forEach(t => addTs(t.completedAt));
        (state.audiosListened || []).forEach(a => addTs(a.listenedAt));
        if (state.streak?.lastDate) dates.add(state.streak.lastDate);
        return dates;
    }

    function buildWeekActivity(state) {
        const activeDates = collectActiveDates(state);
        const days = [];
        const today = new Date();
        for (let i = 6; i >= 0; i -= 1) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            days.push({
                label: WEEKDAY_LABELS[d.getDay()],
                date: key,
                active: activeDates.has(key),
                isToday: i === 0
            });
        }
        return days;
    }

    function buildMonthActivity(state) {
        const activeDates = collectActiveDates(state);
        const days = [];
        const today = new Date();
        for (let i = 29; i >= 0; i -= 1) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            days.push({ date: key, active: activeDates.has(key), isToday: i === 0 });
        }
        return days;
    }

    function buildContinueItems(state) {
        const buildHref = item => {
            if (global.UserProgress?.getContinueHref) return global.UserProgress.getContinueHref(item);
            return 'pages/asarlar.html';
        };
        return (state.booksOpened || [])
            .filter(b => {
                const p = Number(b.progress) || 0;
                const key = `${b.kind}:${b.id}`;
                return p > 0 && p < 100 && !(state.booksCompleted || []).includes(key);
            })
            .sort((a, b) => (b.openedAt || 0) - (a.openedAt || 0))
            .slice(0, 4)
            .map(b => ({
                title: b.title || 'Asar',
                type: b.type || 'Asar',
                progress: Math.round(Number(b.progress) || 0),
                href: buildHref(b)
            }));
    }

    function buildActivityFeed(state) {
        return (state.activity || []).slice(0, 10).map(a => ({
            icon: ACTIVITY_ICONS[a.type] || ACTIVITY_ICONS.default || '📌',
            text: a.text,
            time: formatRelativeTime(a.at)
        }));
    }

    function buildEarnedTimeline(state) {
        const dates = state.achievementDates || {};
        return CATALOG
            .filter(def => (state.achievementsUnlocked || []).includes(def.id))
            .map(def => ({
                id: def.id,
                icon: def.icon,
                title: def.title,
                desc: def.desc,
                date: dates[def.id] ? formatDate(dates[def.id]) : 'Yaqinda',
                at: dates[def.id] || 0
            }))
            .sort((a, b) => b.at - a.at);
    }

    function buildAllBadges(state, platformStats) {
        const ctx = buildContext(state, platformStats);
        const dates = state.achievementDates || {};
        const unlockedSet = new Set(state.achievementsUnlocked || []);
        return CATALOG.map(def => {
            const unlocked = unlockedSet.has(def.id);
            const prog = getProgress(def, ctx, platformStats);
            return {
                id: def.id,
                icon: def.icon,
                title: def.title,
                desc: def.desc,
                unlocked,
                date: unlocked && dates[def.id] ? formatDate(dates[def.id]) : '',
                current: prog.current,
                target: prog.target,
                percent: prog.percent
            };
        });
    }

    function isUnlocked(def, ctx) {
        const { c, t } = def.progress(ctx, { videos: ctx.platformVideos });
        if (def.id === 'quiz-scholar') return ctx.avgQuiz >= 80 && ctx.testsCompleted >= 3;
        if (def.id === 'test-expert') return ctx.testsPassed70 >= 1;
        return c >= t;
    }

    function getProgress(def, ctx, platformStats) {
        const { c, t } = def.progress(ctx, platformStats);
        return { current: Math.min(c, t), target: t, percent: Math.min(100, Math.round((c / Math.max(t, 1)) * 100)) };
    }

    function getLevelInfo(totalXp) {
        const level = Math.max(1, Math.floor(totalXp / LEVEL_XP) + 1);
        const base = (level - 1) * LEVEL_XP;
        let title = LEVEL_TITLES[0].title;
        let nextTitle = LEVEL_TITLES[0].next;
        LEVEL_TITLES.forEach(entry => {
            if (level >= entry.min) {
                title = entry.title;
                nextTitle = entry.next;
            }
        });
        return { level, title, nextTitle, currentXp: totalXp - base, nextLevelXp: LEVEL_XP, totalXp };
    }

    function ensureUnlockStyles() {
        if (document.getElementById('ach-unlock-styles')) return;
        const style = document.createElement('style');
        style.id = 'ach-unlock-styles';
        style.textContent = `
            .ach-unlock-toast{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem;background:rgba(26,60,94,.45);animation:achFadeIn .3s ease}
            .ach-unlock-card{background:#fff;border-radius:16px;padding:2rem 2.5rem;text-align:center;max-width:360px;width:100%;box-shadow:0 24px 48px rgba(26,60,94,.25);animation:achPopIn .5s cubic-bezier(.34,1.56,.64,1)}
            .ach-unlock-card__icon{font-size:3.5rem;display:block;margin-bottom:.75rem;animation:achBounce .6s ease .2s both}
            .ach-unlock-card__label{font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;color:#c9a84c;font-weight:600;margin:0 0 .5rem}
            .ach-unlock-card__title{font-size:1.35rem;color:#1a3c5e;margin:0 0 .35rem;font-family:'Playfair Display',serif}
            .ach-unlock-card__desc{font-size:.9rem;color:#6b7280;margin:0}
            .ach-badge.is-new-unlock{animation:achBadgeUnlock .7s cubic-bezier(.34,1.56,.64,1)}
            @keyframes achFadeIn{from{opacity:0}to{opacity:1}}
            @keyframes achPopIn{from{opacity:0;transform:scale(.7)}to{opacity:1;transform:scale(1)}}
            @keyframes achBounce{0%{transform:scale(0) rotate(-20deg)}60%{transform:scale(1.15) rotate(5deg)}100%{transform:scale(1) rotate(0)}}
            @keyframes achBadgeUnlock{0%{transform:scale(.85);opacity:.5;box-shadow:0 0 0 0 rgba(201,168,76,.6)}50%{transform:scale(1.05);box-shadow:0 0 0 12px rgba(201,168,76,0)}100%{transform:scale(1);opacity:1}}
            body.dark-mode .ach-unlock-card{background:#1e293b;color:#f1f5f9}
            body.dark-mode .ach-unlock-card__title{color:#f1f5f9}
        `;
        document.head.appendChild(style);
    }

    const AchievementEngine = {
        catalog: CATALOG,

        buildContext(state, platformStats) {
            return buildContext(state, platformStats || {});
        },

        evaluateAndUnlock(state, platformStats) {
            if (!state.achievementDates) state.achievementDates = {};
            if (!state.achievementsUnlocked) state.achievementsUnlocked = [];

            const ctx = buildContext(state, platformStats);
            const newly = [];

            CATALOG.forEach(def => {
                if (state.achievementsUnlocked.includes(def.id)) return;
                if (isUnlocked(def, ctx)) {
                    const now = Date.now();
                    state.achievementsUnlocked.push(def.id);
                    state.achievementDates[def.id] = now;
                    newly.push({ id: def.id, icon: def.icon, title: def.title, desc: def.desc, unlockedAt: now });
                }
            });

            return newly;
        },

        getUnlocked(state, platformStats) {
            const ctx = buildContext(state, platformStats);
            const dates = state.achievementDates || {};
            return CATALOG.filter(def => state.achievementsUnlocked?.includes(def.id)).map(def => ({
                id: def.id,
                icon: def.icon,
                title: def.title,
                desc: def.desc,
                date: dates[def.id] ? formatDate(dates[def.id]) : 'Yaqinda'
            }));
        },

        getLocked(state, platformStats) {
            const ctx = buildContext(state, platformStats);
            return CATALOG.filter(def => !state.achievementsUnlocked?.includes(def.id)).map(def => {
                const prog = getProgress(def, ctx, platformStats);
                return {
                    id: def.id,
                    icon: def.icon,
                    title: def.title,
                    desc: def.desc,
                    current: prog.current,
                    target: prog.target
                };
            });
        },

        getRecentUnlocks(state, limit = 6) {
            const dates = state.achievementDates || {};
            return CATALOG
                .filter(def => dates[def.id])
                .map(def => ({ def, at: dates[def.id] }))
                .sort((a, b) => b.at - a.at)
                .slice(0, limit)
                .map(({ def, at }) => ({
                    icon: def.icon,
                    text: `"${def.title}" badji qo'lga kiritildi`,
                    time: formatRelativeTime(at)
                }));
        },

        buildYutuqlarModel(state, platformStats, recommendations) {
            syncLegacyDates(state);
            const ctx = buildContext(state, platformStats);
            const level = getLevelInfo(state.totalXp || 0);
            const unlocked = this.getUnlocked(state, platformStats);
            const locked = this.getLocked(state, platformStats);
            const earnedTimeline = buildEarnedTimeline(state);
            const recentUnlocks = earnedTimeline.slice(0, 5);
            const tests = state.testsCompleted || [];
            const today = new Date().toISOString().slice(0, 10);
            const activeToday = collectActiveDates(state).has(today)
                || state.streak?.lastDate === today;

            const authUser = global.PlatformAuth?.getCurrentUser?.();
            const profileUser = authUser
                ? {
                    name: authUser.name || `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim() || state.user?.name || 'Foydalanuvchi',
                    initials: authUser.initials || state.user?.initials || 'F',
                    email: authUser.email || state.user?.email || ''
                }
                : {
                    name: state.user?.name || 'Foydalanuvchi',
                    initials: state.user?.initials || 'F',
                    email: state.user?.email || ''
                };

            const certificates = global.UserProgress?.getCertificates?.(5)
                || tests
                    .filter(t => t.percentage >= 70)
                    .slice(0, 5)
                    .map(t => ({
                        title: t.title,
                        date: formatDate(t.completedAt),
                        score: Math.round(t.percentage)
                    }));

            const continueItems = buildContinueItems(state);
            const xpPct = Math.min(100, Math.round((level.currentXp / level.nextLevelXp) * 100));
            const xpRemaining = level.nextLevelXp - level.currentXp;

            let libraryHref = 'pages/asarlar.html';
            if (continueItems.length && global.UserProgress) {
                const cont = global.UserProgress.buildDashboardModel?.(platformStats, recommendations)?.continueLearning;
                if (cont && !cont.empty && cont.href) libraryHref = cont.href;
            }

            const testBest = tests.length
                ? Math.max(...tests.map(t => Number(t.percentage) || 0))
                : 0;

            return {
                user: profileUser,
                level: {
                    number: level.level,
                    title: level.title,
                    rank: level.title,
                    currentXp: level.currentXp,
                    nextLevelXp: level.nextLevelXp,
                    totalXp: level.totalXp,
                    nextLevelTitle: level.nextTitle,
                    xpRemaining,
                    progressPercent: xpPct
                },
                unlockedBadges: unlocked,
                lockedBadges: locked,
                allBadges: buildAllBadges(state, platformStats),
                stats: {
                    works: ctx.booksOpened,
                    completed: ctx.booksCompleted,
                    poems: ctx.poemsRead,
                    qissalar: ctx.qissalarRead,
                    dostonlar: ctx.dostonlarRead,
                    tarjimalar: ctx.tarjimalarRead,
                    tanlangan: ctx.tanlanganRead,
                    books: ctx.booksOpened,
                    videos: ctx.videosWatched,
                    audios: ctx.audiosListened,
                    tests: ctx.testsCompleted,
                    testsPassed: ctx.testsPassed70,
                    avgQuiz: ctx.avgQuiz,
                    bestQuiz: testBest,
                    games: ctx.gamesCompleted,
                    aiChats: ctx.aiChats,
                    xp: ctx.totalXp,
                    badges: unlocked.length,
                    studyHours: Math.round(ctx.timeSpentMin / 60)
                },
                streak: {
                    current: ctx.streak,
                    longest: ctx.streakLongest,
                    activeToday,
                    weekDays: buildWeekActivity(state),
                    monthDays: buildMonthActivity(state)
                },
                continueItems,
                activity: buildActivityFeed(state),
                earnedTimeline,
                recentUnlocks: recentUnlocks.map(item => ({
                    icon: item.icon,
                    title: item.title,
                    desc: item.desc,
                    date: item.date,
                    text: item.title,
                    time: item.date
                })),
                certificates,
                hasCertificates: certificates.length > 0,
                links: {
                    library: libraryHref,
                    tests: 'pages/interaktiv.html',
                    videos: 'pages/multimedia.html',
                    games: 'pages/interaktiv-oyinlar.html',
                    dashboard: 'pages/dashboard.html',
                    profile: 'pages/dashboard.html#profile-section'
                }
            };
        },

        getBadgeTitles(state) {
            return this.getUnlocked(state, {}).map(b => b.title);
        },

        showUnlockAnimation(achievement) {
            ensureUnlockStyles();
            const overlay = document.createElement('div');
            overlay.className = 'ach-unlock-toast';
            overlay.setAttribute('role', 'alert');
            overlay.innerHTML = `
                <div class="ach-unlock-card">
                    <span class="ach-unlock-card__label">Yangi yutuq!</span>
                    <span class="ach-unlock-card__icon">${achievement.icon || '🏅'}</span>
                    <h3 class="ach-unlock-card__title">${achievement.title}</h3>
                    <p class="ach-unlock-card__desc">${achievement.desc || ''}</p>
                </div>
            `;
            document.body.appendChild(overlay);
            overlay.addEventListener('click', () => overlay.remove());
            setTimeout(() => overlay.remove(), 3200);
        },

        markNewBadgeElements(ids) {
            if (!ids?.length) return;
            ids.forEach(id => {
                document.querySelector(`[data-ach-id="${id}"]`)?.classList.add('is-new-unlock');
            });
        }
    };

    function syncLegacyDates(state) {
        if (!state.achievementDates) state.achievementDates = {};
        (state.achievementsUnlocked || []).forEach(id => {
            if (!state.achievementDates[id]) state.achievementDates[id] = Date.now();
        });
    }

    global.AchievementEngine = AchievementEngine;
})(typeof window !== 'undefined' ? window : globalThis);
