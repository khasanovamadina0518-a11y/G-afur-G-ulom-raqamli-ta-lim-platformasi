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
        { id: 'first-step', icon: '🛡️', title: 'Birinchi qadam', desc: 'Birinchi asarni ochdingiz', progress: s => ({ c: s.booksOpened, t: 1 }) },
        { id: 'bookworm', icon: '📚', title: 'Kitobxon', desc: '5 ta asar o\'qildi', progress: s => ({ c: s.booksOpened, t: 5 }) },
        { id: 'avid-reader', icon: '📖', title: '20 ta kitob o\'qing', desc: 'Asarlarda 20 ta asarni o\'qing', progress: s => ({ c: s.booksOpened, t: 20 }) },
        { id: 'book-finisher', icon: '✅', title: 'Asar ustasi', desc: '3 ta asarni to\'liq o\'qidingiz', progress: s => ({ c: s.booksCompleted, t: 3 }) },
        { id: 'active', icon: '⭐', title: 'Faol ishtirokchi', desc: '7 kun ketma-ket faollik', progress: s => ({ c: s.streak, t: 7 }) },
        { id: 'streak-fire', icon: '🔥', title: 'Streak ustasi', desc: '30 kunlik eng uzoq streak', progress: s => ({ c: s.streakLongest, t: 30 }) },
        { id: 'test-expert', icon: '📝', title: 'Test eksperti', desc: 'Testni 70%+ natija bilan topshiring', progress: s => ({ c: s.testsPassed70, t: 1 }) },
        { id: 'test-marathon', icon: '🎯', title: 'Test marathon', desc: '10 ta test yakunlandi', progress: s => ({ c: s.testsCompleted, t: 10 }) },
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
        const avgQuiz = tests.length
            ? Math.round(tests.reduce((s, t) => s + t.percentage, 0) / tests.length)
            : 0;
        return {
            booksOpened: (state.booksOpened || []).length,
            booksCompleted: (state.booksCompleted || []).length,
            videosWatched: (state.videosWatched || []).length,
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
            platformVideos: platformStats?.videos || 4
        };
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

        buildYutuqlarModel(state, platformStats) {
            syncLegacyDates(state);
            const ctx = buildContext(state, platformStats);
            const level = getLevelInfo(state.totalXp || 0);
            const unlocked = this.getUnlocked(state, platformStats);
            const locked = this.getLocked(state, platformStats);
            const recent = this.getRecentUnlocks(state);
            const tests = state.testsCompleted || [];

            const certificates = tests
                .filter(t => t.percentage >= 70)
                .slice(0, 5)
                .map(t => ({
                    title: t.title,
                    date: formatDate(t.completedAt)
                }));

            const xpRemaining = level.nextLevelXp - level.currentXp;
            let encourage = 'Platformada o\'rganishni boshlang — birinchi badjingiz sizni kutmoqda!';
            if (unlocked.length >= 5) {
                encourage = `Ajoyib natija! Keyingi darajaga yetish uchun yana ${xpRemaining} XP kerak. Bugun kamida bitta test yoki video dars bilan davom eting.`;
            } else if (unlocked.length > 0) {
                encourage = `${unlocked.length} ta badj ochildi. Keyingi yutuq uchun o'qishda davom eting!`;
            }

            return {
                level: {
                    number: level.level,
                    title: level.title,
                    currentXp: level.currentXp,
                    nextLevelXp: level.nextLevelXp,
                    nextLevelTitle: level.nextTitle
                },
                unlockedBadges: unlocked,
                lockedBadges: locked,
                stats: {
                    books: ctx.booksOpened,
                    videos: ctx.videosWatched,
                    tests: ctx.testsCompleted,
                    games: ctx.gamesCompleted,
                    aiChats: ctx.aiChats,
                    studyHours: Math.round(ctx.timeSpentMin / 60)
                },
                streak: {
                    current: ctx.streak,
                    longest: ctx.streakLongest,
                    calendarDays: Math.min(28, ctx.streak)
                },
                recent: recent.length ? recent : state.activity?.filter(a => a.type === 'achievement').slice(0, 4).map(a => ({
                    icon: '🏅',
                    text: a.text,
                    time: formatRelativeTime(a.at)
                })) || [],
                certificates,
                motivation: {
                    quote: '"Ilm – inson kamolotining yo\'lidir."',
                    author: 'G\'afur G\'ulom',
                    message: encourage
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
