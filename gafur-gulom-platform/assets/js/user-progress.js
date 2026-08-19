/**
 * UserProgress — localStorage progress tracker (Phase 11.2)
 * Tracks reading, video, quiz, favorites, XP, achievements.
 * Emits PlatformDataService events without modifying PDS core.
 */
(function (global) {
    'use strict';

    const STORAGE_PREFIX = 'platform-user-progress';
    const GUEST_KEY = 'platform-user-progress-guest';
    /** @deprecated legacy single-key storage — migrated to GUEST_KEY on init */
    const STORAGE_KEY = 'platform-user-progress';
    const LEGACY_FAVORITES = 'gafur-favorites';
    const LEGACY_TALIM = 'talim-progress';
    const LEGACY_AI = 'ai-yordamchi-conversations';

    const XP = {
        bookOpen: 10,
        bookComplete: 50,
        videoWatch: 25,
        quizComplete: 30,
        quizHighScore: 20,
        favorite: 5,
        aiChat: 8,
        lessonComplete: 15
    };

    const LEVEL_XP = 200;

    const LEVEL_TITLES = [
        { min: 1, title: 'Boshlang\'ich o\'quvchi' },
        { min: 4, title: 'Faol o\'quvchi' },
        { min: 8, title: 'Yaxshi o\'quvchi' },
        { min: 12, title: 'Bilimdon' },
        { min: 16, title: 'Usta o\'quvchi' }
    ];

    const CERT_PASS_SCORE = 70;

    let activeProgressKey = GUEST_KEY;

    function resolveProgressKey(userId) {
        return userId ? `${STORAGE_PREFIX}-${userId}` : GUEST_KEY;
    }

    function migrateLegacyProgress() {
        try {
            const legacy = global.localStorage.getItem(STORAGE_KEY);
            if (legacy && !global.localStorage.getItem(GUEST_KEY)) {
                global.localStorage.setItem(GUEST_KEY, legacy);
            }
        } catch (e) { /* ignore */ }
    }

    function defaultState() {
        return {
            user: {
                name: '',
                initials: '',
                email: '',
                memberSince: ''
            },
            booksOpened: [],
            booksCompleted: [],
            videosWatched: [],
            testsCompleted: [],
            certificatesIssued: [],
            gamesCompleted: 0,
            gamesPlayed: [],
            audiosListened: [],
            favorites: { poems: [], books: [], videos: [] },
            activity: [],
            achievementsUnlocked: [],
            achievementDates: {},
            totalXp: 0,
            timeSpentMin: 0,
            aiChats: 0,
            streak: { current: 0, longest: 0, lastDate: null },
            lastOpened: null
        };
    }

    function loadState(key) {
        const storageKey = key || activeProgressKey;
        try {
            const raw = global.localStorage.getItem(storageKey);
            if (!raw) return defaultState();
            return { ...defaultState(), ...JSON.parse(raw) };
        } catch (e) {
            return defaultState();
        }
    }

    function saveState(state, key) {
        global.localStorage.setItem(key || activeProgressKey, JSON.stringify(state));
    }

    function emitEvent(name, payload) {
        if (global.PlatformDataService?.emit) {
            global.PlatformDataService.emit(name, payload);
        }
        if (name === 'progressChanged' && global.PlatformDataService?.notifyProgressChanged) {
            global.PlatformDataService.notifyProgressChanged(payload);
        }
        global.dispatchEvent(new CustomEvent('platform:' + name, { detail: payload }));
    }

    function todayKey() {
        return new Date().toISOString().slice(0, 10);
    }

    function touchStreak(state) {
        const today = todayKey();
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

        if (state.streak.lastDate === today) return;

        if (state.streak.lastDate === yesterday) {
            state.streak.current += 1;
        } else if (state.streak.lastDate !== today) {
            state.streak.current = state.streak.lastDate ? 1 : 1;
        }
        state.streak.lastDate = today;
        state.streak.longest = Math.max(state.streak.longest, state.streak.current);
    }

    function addXp(state, amount) {
        state.totalXp = Math.max(0, (state.totalXp || 0) + amount);
    }

    function normalizeGamesPlayed(state) {
        if (!Array.isArray(state.gamesPlayed)) state.gamesPlayed = [];
        if (state.gamesPlayed.length === 0 && (state.gamesCompleted || 0) > 0) {
            state.gamesCompleted = Math.max(state.gamesCompleted, state.gamesPlayed.length);
        } else {
            state.gamesCompleted = state.gamesPlayed.length;
        }
    }

    function pushActivity(state, text, type) {
        state.activity.unshift({ text, type, at: Date.now() });
        state.activity = state.activity.slice(0, 30);
    }

    function formatCertDate(ts) {
        if (!ts) return '';
        try {
            return new Date(ts).toLocaleDateString('uz-UZ', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return '';
        }
    }

    function issueCertificate(state, payload) {
        const {
            category,
            title,
            score,
            issuedAt,
            silent = false
        } = payload || {};
        const pct = Math.round(Number(score) || 0);
        if (pct < CERT_PASS_SCORE) {
            return { issued: false, isNew: false };
        }

        if (!Array.isArray(state.certificatesIssued)) {
            state.certificatesIssued = [];
        }

        const catKey = String(category || title || 'general');
        const certTitle = title || catKey;
        const idx = state.certificatesIssued.findIndex(c => String(c.category || c.title) === catKey);

        if (idx >= 0) {
            const existing = state.certificatesIssued[idx];
            if (pct > (Number(existing.score) || 0)) {
                state.certificatesIssued[idx] = {
                    ...existing,
                    title: certTitle,
                    score: pct,
                    category: catKey
                };
            }
            return { issued: true, isNew: false, title: certTitle, score: pct };
        }

        state.certificatesIssued.unshift({
            category: catKey,
            title: certTitle,
            score: pct,
            issuedAt: issuedAt || Date.now()
        });
        state.certificatesIssued = state.certificatesIssued.slice(0, 20);

        if (!silent) {
            pushActivity(state, `Sertifikat berildi: ${certTitle} (${pct}%)`, 'certificate');
        }

        return { issued: true, isNew: true, title: certTitle, score: pct };
    }

    function syncCertificatesIssued(state) {
        if (!Array.isArray(state.certificatesIssued)) {
            state.certificatesIssued = [];
        }

        (state.testsCompleted || []).forEach(t => {
            const pct = Math.round(Number(t.percentage) || 0);
            if (pct < CERT_PASS_SCORE) return;
            issueCertificate(state, {
                category: t.category || t.title || 'test',
                title: t.title || 'Test',
                score: pct,
                issuedAt: t.completedAt,
                silent: true
            });
        });

        if ((state._talimQuizBest || 0) >= CERT_PASS_SCORE) {
            issueCertificate(state, {
                category: 'talim-quiz',
                title: 'Ta\'lim viktorinasi',
                score: Math.round(state._talimQuizBest),
                silent: true
            });
        }
    }

    function getCertificatesForDisplay(state, limit) {
        syncCertificatesIssued(state);
        return (state.certificatesIssued || [])
            .slice(0, limit || 5)
            .map(c => ({
                title: c.title,
                date: formatCertDate(c.issuedAt),
                score: c.score
            }));
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

    function getInitials(firstName, lastName) {
        const a = (firstName || '').trim().charAt(0);
        const b = (lastName || '').trim().charAt(0);
        const initials = (a + b).toUpperCase();
        return initials || 'F';
    }

    function profileFromAuthUser(authUser, fallbackUser) {
        if (!authUser) return fallbackUser;
        const name = (authUser.name || `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim()).trim();
        return {
            name: name || fallbackUser?.name || '',
            initials: authUser.initials || getInitials(authUser.firstName, authUser.lastName) || fallbackUser?.initials || '',
            email: authUser.email || fallbackUser?.email || '',
            memberSince: authUser.memberSince || fallbackUser?.memberSince || ''
        };
    }

    function buildContinueHref(item) {
        if (!item?.kind || item.id == null) return 'pages/asarlar.html';
        const base = 'pages/asarlar.html';
        const progress = Number(item.progress) || 0;
        const resume = progress > 0 && progress < 100 ? '&resume=1' : '';
        switch (item.kind) {
            case 'poem': return `${base}?poem=${item.id}${resume}`;
            case 'qissa': return `${base}?qissa=${item.id}${resume}`;
            case 'doston': return `${base}?tab=dostonlar&doston=${item.id}${resume}`;
            case 'book': return `${base}?tanlangan=${item.id}${resume}`;
            case 'tarjima': return `${base}?tarjima=${item.id}${resume}`;
            case 'lesson': return item.href || 'pages/talim.html';
            case 'video': return 'pages/multimedia.html';
            default: return item.href || base;
        }
    }

    function findBookEntry(state, kind, id) {
        const key = `${kind}:${id}`;
        return state.booksOpened.find(b => `${b.kind}:${b.id}` === key) || null;
    }

    function resolveContinueLearning(state, recommendations) {
        const readableKinds = ['poem', 'qissa', 'doston', 'tarjima', 'lesson', 'book'];
        const books = state.booksOpened.filter(b => readableKinds.includes(b.kind));

        let last = null;
        if (state.lastOpened && readableKinds.includes(state.lastOpened.kind)) {
            last = { ...state.lastOpened };
        } else if (books.length) {
            last = books.reduce((a, b) => ((a.openedAt || 0) > (b.openedAt || 0) ? a : b));
        }

        if (!last) {
            return {
                empty: true,
                completed: false,
                title: '',
                type: '',
                author: '',
                description: '',
                cover: '',
                progress: 0,
                href: 'pages/asarlar.html',
                kind: null,
                id: null
            };
        }

        const key = `${last.kind}:${last.id}`;
        const entry = books.find(b => `${b.kind}:${b.id}` === key);
        if (entry) {
            last = {
                ...last,
                progress: entry.progress,
                title: entry.title,
                type: entry.type,
                kind: entry.kind,
                id: entry.id
            };
        }

        const progress = Math.min(100, Math.max(0, Number(last.progress) || 0));
        const completed = progress >= 100 || state.booksCompleted.includes(key);

        const item = {
            empty: false,
            completed,
            kind: last.kind,
            id: last.id,
            title: last.title || '',
            type: last.type || 'Asar',
            author: '',
            description: '',
            cover: '',
            progress,
            href: buildContinueHref(last)
        };

        if (completed) {
            const pools = [...(recommendations?.featured || []), ...(recommendations?.newest || [])];
            for (const rec of pools) {
                const recKind = rec.kind === 'book' ? 'doston' : rec.kind;
                const recId = rec.item?.id;
                if (!recKind || recId == null) continue;
                const recKey = `${recKind}:${recId}`;
                if (!state.booksCompleted.includes(recKey)) {
                    item.nextTitle = rec.title;
                    item.nextHref = buildContinueHref({ kind: recKind, id: recId });
                    break;
                }
            }
            if (!item.nextHref) {
                item.nextTitle = 'Asarlarni ko\'rish';
                item.nextHref = 'pages/asarlar.html';
            }
        }

        return item;
    }

    function getLevelInfo(totalXp) {
        const level = Math.max(1, Math.floor(totalXp / LEVEL_XP) + 1);
        const currentLevelBase = (level - 1) * LEVEL_XP;
        const nextLevelXp = level * LEVEL_XP;
        let title = LEVEL_TITLES[0].title;
        LEVEL_TITLES.forEach(entry => {
            if (level >= entry.min) title = entry.title;
        });
        return { level, currentXp: totalXp - currentLevelBase, nextLevelXp: LEVEL_XP, title, totalXp };
    }

    function checkAchievements(state, platformStats) {
        if (!global.AchievementEngine) return [];
        const stats = platformStats || global.PlatformDataService?.getStatistics?.() || {};
        const newly = AchievementEngine.evaluateAndUnlock(state, stats);
        newly.forEach(ach => {
            pushActivity(state, `"${ach.title}" badji qo'lga kiritildi`, 'achievement');
            emitEvent('achievementUnlocked', ach);
            AchievementEngine.showUnlockAnimation(ach);
        });
        return newly;
    }

    function syncLegacy(state) {
        try {
            const favRaw = global.localStorage.getItem(LEGACY_FAVORITES);
            if (favRaw) {
                const ids = JSON.parse(favRaw);
                if (Array.isArray(ids)) {
                    state.favorites.poems = [...new Set(ids.map(Number).filter(Boolean))];
                }
            }
        } catch (e) { /* ignore */ }

        try {
            const talimRaw = global.localStorage.getItem(LEGACY_TALIM);
            if (talimRaw) {
                const talim = JSON.parse(talimRaw);
                if (talim.quizBest >= 70 && !state.certificatesFromTalim) {
                    state._talimQuizBest = talim.quizBest;
                }
                (talim.completedLessons || []).forEach(key => {
                    if (!state.booksOpened.find(b => b.id === key)) {
                        state.booksOpened.push({
                            id: key,
                            kind: 'lesson',
                            title: key.replace(/-/g, ' '),
                            type: 'Dars',
                            progress: 100,
                            href: 'pages/talim.html',
                            openedAt: Date.now()
                        });
                    }
                });
            }
        } catch (e) { /* ignore */ }

        try {
            const aiRaw = global.localStorage.getItem(LEGACY_AI);
            if (aiRaw) {
                const convos = JSON.parse(aiRaw);
                state.aiChats = Array.isArray(convos) ? convos.length : 0;
            }
        } catch (e) { /* ignore */ }
    }

    const UserProgress = {
        _state: loadState(),
        _hooksInstalled: false,

        syncAchievements(platformStats) {
            syncLegacy(this._state);
            const newly = checkAchievements(this._state, platformStats);
            if (newly.length) saveState(this._state);
            return newly;
        },

        getState() {
            syncLegacy(this._state);
            normalizeGamesPlayed(this._state);
            syncCertificatesIssued(this._state);
            return structuredClone(this._state);
        },

        _persist(reason) {
            normalizeGamesPlayed(this._state);
            syncCertificatesIssued(this._state);
            saveState(this._state);
            checkAchievements(this._state);
            emitEvent('progressChanged', { reason });
        },

        markBookCompleted(kind, id, title) {
            const key = `${kind}:${id}`;
            if (this._state.booksCompleted.includes(key)) return false;
            this._state.booksCompleted.push(key);
            addXp(this._state, XP.bookComplete);
            const label = title || 'Asar';
            pushActivity(this._state, `"${label}" to'liq o'qildi`, kind);
            return true;
        },

        recordContentOpened(payload) {
            const { kind, id, title, type, href, progress = 10 } = payload;
            touchStreak(this._state);

            const key = `${kind}:${id}`;
            let entry = this._state.booksOpened.find(b => `${b.kind}:${b.id}` === key);
            const isNew = !entry;

            if (entry) {
                entry.progress = Math.min(100, Math.max(entry.progress || 0, progress));
                entry.openedAt = Date.now();
                if (title) entry.title = title;
                if (type) entry.type = type;
            } else {
                entry = {
                    kind,
                    id,
                    title,
                    type,
                    href: href || buildContinueHref({ kind, id, progress }),
                    progress,
                    readPage: 1,
                    scrollRatio: 0,
                    openedAt: Date.now()
                };
                this._state.booksOpened.push(entry);
                addXp(this._state, XP.bookOpen);
                this._state.timeSpentMin += 5;
                pushActivity(this._state, `"${title}" ochildi`, kind);
            }

            if (progress >= 100) {
                this.markBookCompleted(kind, id, title);
            }

            this._state.lastOpened = { kind, id, title, type, href: entry.href, progress: entry.progress, openedAt: Date.now() };
            this._persist(isNew ? 'contentOpened' : 'contentReopened');
            if (isNew) emitEvent('contentOpened', payload);
        },

        recordVideoWatched(payload) {
            const { id, title } = payload;
            touchStreak(this._state);
            const isNew = !this._state.videosWatched.find(v => String(v.id) === String(id));

            if (isNew) {
                addXp(this._state, XP.videoWatch);
                this._state.timeSpentMin += 10;
                this._state.videosWatched.push({ id, title, watchedAt: Date.now() });
                pushActivity(this._state, `Video dars ko'rildi: ${title}`, 'video');
            } else {
                this._state.videosWatched = this._state.videosWatched.map(v =>
                    String(v.id) === String(id) ? { ...v, title: title || v.title, watchedAt: Date.now() } : v
                );
            }

            this._state.lastOpened = {
                kind: 'video',
                id,
                title,
                type: 'Video dars',
                href: 'pages/multimedia.html',
                progress: 100,
                openedAt: Date.now()
            };
            this._persist('videoWatched');
            if (isNew) emitEvent('contentOpened', { kind: 'video', ...payload });
        },

        recordQuizCompleted(payload) {
            const { category, title, score, maxScore, percentage } = payload;
            touchStreak(this._state);
            addXp(this._state, XP.quizComplete, 'quiz');
            const pct = Math.round(Number(percentage) || 0);
            if (pct >= CERT_PASS_SCORE) addXp(this._state, XP.quizHighScore, 'quizHigh');
            this._state.timeSpentMin += 15;

            this._state.testsCompleted.unshift({
                category,
                title,
                score,
                maxScore,
                percentage: pct,
                completedAt: Date.now()
            });
            this._state.testsCompleted = this._state.testsCompleted.slice(0, 50);

            const certResult = issueCertificate(this._state, {
                category: category || title || 'test',
                title: title || 'Test',
                score: pct,
                issuedAt: Date.now()
            });

            pushActivity(this._state, `Test: ${title} — ${pct}%`, 'quiz');
            this._persist('quizCompleted');
            emitEvent('progressChanged', { kind: 'quiz', ...payload, certificate: certResult });
            return certResult;
        },

        getCertificates(limit) {
            return getCertificatesForDisplay(this._state, limit);
        },

        recordTalimQuizResult(percentage) {
            syncLegacy(this._state);
            const pct = Math.round(Number(percentage) || 0);
            if (pct > (this._state._talimQuizBest || 0)) {
                this._state._talimQuizBest = pct;
            }
            if (pct < CERT_PASS_SCORE) {
                this._persist('talimQuiz');
                return { issued: false, isNew: false };
            }
            const certResult = issueCertificate(this._state, {
                category: 'talim-quiz',
                title: 'Ta\'lim viktorinasi',
                score: pct,
                issuedAt: Date.now()
            });
            this._persist('talimCertificate');
            emitEvent('progressChanged', { kind: 'talim-quiz', percentage: pct, certificate: certResult });
            return certResult;
        },

        recordGameCompleted(title) {
            if (!title) return;
            normalizeGamesPlayed(this._state);
            if (this._state.gamesPlayed.includes(title)) return;
            this._state.gamesPlayed.push(title);
            this._state.gamesCompleted = this._state.gamesPlayed.length;
            touchStreak(this._state);
            addXp(this._state, 20);
            pushActivity(this._state, `O'yin yakunlandi: ${title}`, 'game');
            this._persist('gameCompleted');
        },

        recordAudioListened(payload) {
            const { id, title } = payload || {};
            if (id == null) return;
            touchStreak(this._state);
            if (!this._state.audiosListened) this._state.audiosListened = [];
            const key = String(id);
            const isNew = !this._state.audiosListened.find(a => String(a.id) === key);
            if (isNew) {
                this._state.audiosListened.push({ id, title: title || 'Audio', listenedAt: Date.now() });
                addXp(this._state, 8, 'audio');
                pushActivity(this._state, title ? `Audio tinglandi: ${title}` : 'Audio tinglandi', 'audio');
            } else {
                this._state.audiosListened = this._state.audiosListened.map(a =>
                    String(a.id) === key ? { ...a, listenedAt: Date.now() } : a
                );
            }
            this._state.timeSpentMin += isNew ? 3 : 0;
            this._persist('audioListened');
        },

        recordFavoriteChange(payload) {
            const { kind, id, added, title } = payload;
            if (kind === 'poem') {
                if (added && !this._state.favorites.poems.includes(id)) {
                    this._state.favorites.poems.push(id);
                    addXp(this._state, XP.favorite, 'favorite');
                } else if (!added) {
                    this._state.favorites.poems = this._state.favorites.poems.filter(x => x !== id);
                }
            }
            if (added) {
                pushActivity(this._state, title ? `Sevimlilarga qo'shildi: ${title}` : 'Sevimlilarga qo\'shildi', 'favorite');
            }
            this._persist('favoriteChanged');
            emitEvent('favoriteChanged', payload);
        },

        recordAiChat() {
            this._state.aiChats += 1;
            touchStreak(this._state);
            addXp(this._state, XP.aiChat, 'ai');
            pushActivity(this._state, 'AI yordamchi bilan suhbat boshlandi', 'ai');
            this._persist('aiChat');
        },

        getAverageQuizScore() {
            const tests = this._state.testsCompleted;
            if (!tests.length) return 0;
            return Math.round(tests.reduce((s, t) => s + t.percentage, 0) / tests.length);
        },

        computeProgressPercent(stats) {
            if (!stats) return 0;
            const works = stats.works || 1;
            const videos = stats.videos || 1;
            const bookPct = Math.min(100, (this._state.booksOpened.length / Math.max(works, 1)) * 100);
            const videoPct = Math.min(100, (this._state.videosWatched.length / Math.max(videos, 1)) * 100);
            const testPct = Math.min(100, (this._state.testsCompleted.length / 10) * 100);
            return Math.round((bookPct + videoPct + testPct) / 3);
        },

        getContinueHref(item) {
            return buildContinueHref(item || {});
        },

        getReadingPosition(kind, id) {
            const entry = findBookEntry(this._state, kind, id);
            if (!entry) return null;
            return {
                progress: entry.progress || 0,
                readPage: entry.readPage || 1,
                scrollRatio: entry.scrollRatio || 0
            };
        },

        updateReadingPosition(payload) {
            const { kind, id, progress, readPage, scrollRatio } = payload || {};
            if (!kind || id == null) return;
            const entry = findBookEntry(this._state, kind, id);
            if (!entry) return;

            if (progress != null) {
                entry.progress = Math.min(100, Math.max(entry.progress || 0, Number(progress) || 0));
            }
            if (readPage != null) entry.readPage = Math.max(1, Number(readPage) || 1);
            if (scrollRatio != null) {
                entry.scrollRatio = Math.min(1, Math.max(0, Number(scrollRatio) || 0));
            }
            entry.openedAt = Date.now();
            entry.href = buildContinueHref(entry);

            if (this._state.lastOpened?.kind === kind && this._state.lastOpened?.id === id) {
                this._state.lastOpened = {
                    ...this._state.lastOpened,
                    progress: entry.progress,
                    href: entry.href,
                    openedAt: entry.openedAt
                };
            }

            if (entry.progress >= 100) {
                this.markBookCompleted(kind, id, entry.title);
            }

            this._persist('readingPosition');
        },

        getTestStats() {
            const tests = this._state.testsCompleted || [];
            if (!tests.length) return { count: 0, avg: 0, best: 0, passed70: 0 };
            const percentages = tests.map(t => Number(t.percentage) || 0);
            return {
                count: tests.length,
                avg: Math.round(percentages.reduce((s, p) => s + p, 0) / percentages.length),
                best: Math.max(...percentages),
                passed70: tests.filter(t => (Number(t.percentage) || 0) >= 70).length
            };
        },

        syncLegacyVideoProgress(entries) {
            if (!Array.isArray(entries) || !entries.length) return;
            let map = {};
            try {
                const raw = global.localStorage.getItem('gafur-video-progress');
                if (raw) map = JSON.parse(raw);
            } catch (e) { /* ignore */ }

            entries.forEach(item => {
                if (!item?.type || item.id == null) return;
                const progressKey = `${item.type}:${item.id}`;
                const stored = map[progressKey];
                if (!stored || (stored.percent || 0) < 0.9) return;
                const vid = `${item.type}:${item.id}`;
                if (this._state.videosWatched.find(v => String(v.id) === vid)) return;
                this.recordVideoWatched({ id: vid, title: item.title || 'Video' });
            });
        },

        buildDashboardModel(stats, recommendations) {
            syncLegacy(this._state);
            const state = this._state;
            const xp = getLevelInfo(state.totalXp);
            const progressPct = this.computeProgressPercent(stats);
            const avgQuiz = this.getAverageQuizScore();
            const continueItem = resolveContinueLearning(state, recommendations);

            const badgeList = global.AchievementEngine
                ? AchievementEngine.getBadgeTitles(state)
                : [];

            const certificates = getCertificatesForDisplay(state, 3);

            const today = todayKey();
            const booksToday = state.booksOpened.some(b => new Date(b.openedAt).toISOString().slice(0, 10) === today);
            const testsToday = state.testsCompleted.some(t => new Date(t.completedAt).toISOString().slice(0, 10) === today);
            const aiToday = state.activity.some(a => a.type === 'ai' && new Date(a.at).toISOString().slice(0, 10) === today);
            const videosToday = (state.videosWatched || []).some(v => new Date(v.watchedAt).toISOString().slice(0, 10) === today);
            const gamesToday = state.activity.some(a => a.type === 'game' && new Date(a.at).toISOString().slice(0, 10) === today);
            const testStats = this.getTestStats();
            const unlockedBadges = global.AchievementEngine
                ? AchievementEngine.getUnlocked(state, stats)
                : [];

            const poem = recommendations?.featured?.[0] || recommendations?.newest?.[0];
            const video = recommendations?.newest?.find(r => r.kind === 'video') || recommendations?.random?.find(r => r.kind === 'video');

            let nextGoal = 'Birinchi asarni oching yoki test ishlang';
            if (continueItem.empty) {
                nextGoal = 'Birinchi asarni oching yoki test ishlang';
            } else if (continueItem.completed) {
                nextGoal = continueItem.nextTitle
                    ? `Keyingi asar: "${continueItem.nextTitle}"`
                    : 'Keyingi asarni tanlang';
            } else if (continueItem.progress > 0 && continueItem.progress < 100) {
                nextGoal = `Keyingi maqsad: "${continueItem.title}" ni yakunlash`;
            } else if (!booksToday) {
                nextGoal = 'Bugun kamida bitta asar o\'qing';
            } else if (!testsToday) {
                nextGoal = 'Bugun bitta test ishlang';
            }

            const authUser = global.PlatformAuth?.getCurrentUser?.();
            const profileUser = authUser
                ? profileFromAuthUser(authUser, state.user)
                : state.user;

            return {
                user: profileUser,
                progress: { percent: progressPct, nextGoal },
                xp: {
                    level: xp.level,
                    currentXp: xp.totalXp - (xp.level - 1) * LEVEL_XP,
                    nextLevelXp: LEVEL_XP,
                    title: xp.title
                },
                continueLearning: continueItem,
                todayGoals: [
                    { icon: '📖', title: 'Bitta asar o\'qing', time: '20 daqiqa', done: booksToday },
                    { icon: '📝', title: 'Test ishlash', time: '15 daqiqa', done: testsToday },
                    { icon: '🤖', title: 'AI bilan suhbat', time: '10 daqiqa', done: aiToday }
                ],
                streak: {
                    current: state.streak.current,
                    longest: state.streak.longest,
                    activeToday: state.streak.lastDate === today || booksToday || testsToday || aiToday || videosToday || gamesToday
                },
                testStats,
                unlockedBadges,
                achievements: {
                    certificates: certificates.length,
                    badges: unlockedBadges.length || badgeList.length,
                    streak: state.streak.current,
                    streakLongest: state.streak.longest,
                    xp: state.totalXp,
                    badgeList: badgeList.length ? badgeList : [],
                    unlockedBadges
                },
                aiRecommendations: poem ? [
                    {
                        icon: '📖',
                        text: `Bugun "${poem.title}" bilan tanishing.`,
                        link: buildContinueHref({ kind: poem.kind === 'book' ? 'doston' : (poem.kind || 'poem'), id: poem.item?.id ?? poem.id }),
                        linkText: 'Kutubxona'
                    },
                    { icon: '🎯', text: 'G\'afur G\'ulom hayoti bo\'yicha viktorinani yeching.', link: 'pages/interaktiv.html', linkText: 'Testlar' },
                    { icon: '🎬', text: video ? `Video dars: ${video.title}.` : 'Videolar bo\'limini ko\'ring.', link: 'pages/multimedia.html', linkText: 'Videolar' }
                ] : [],
                certificates,
                recentActivity: state.activity.slice(0, 6).map(a => ({
                    text: a.text,
                    time: formatRelativeTime(a.at)
                })),
                favorites: [
                    { label: 'Saqlangan asarlar', count: state.favorites.poems.length + state.booksCompleted.length },
                    { label: 'Sevimli she\'rlar', count: state.favorites.poems.length },
                    { label: 'Videolar', count: state.videosWatched.length }
                ],
                stats: {
                    booksOpened: state.booksOpened.length,
                    booksCompleted: state.booksCompleted.length,
                    videosWatched: state.videosWatched.length,
                    testsCompleted: state.testsCompleted.length,
                    avgQuizScore: avgQuiz,
                    bestQuizScore: testStats.best,
                    gamesCompleted: state.gamesCompleted || 0,
                    audiosListened: (state.audiosListened || []).length,
                    timeSpentMin: state.timeSpentMin,
                    aiChats: state.aiChats
                }
            };
        },

        updateProfile(profile) {
            if (!profile) return;
            this._state.user = {
                ...this._state.user,
                name: profile.name || this._state.user.name,
                initials: profile.initials || this._state.user.initials,
                email: profile.email || this._state.user.email,
                memberSince: profile.memberSince || this._state.user.memberSince
            };
            this._persist('profileUpdate');
        },

        switchAccount(userId) {
            saveState(this._state);
            activeProgressKey = resolveProgressKey(userId);
            this._state = loadState(activeProgressKey);
            syncLegacy(this._state);

            const authUser = global.PlatformAuth?.getCurrentUser?.();
            if (authUser && userId && authUser.id === userId) {
                this._state.user = profileFromAuthUser(authUser, this._state.user);
                saveState(this._state);
            }

            emitEvent('progressChanged', { source: 'accountSwitch', userId: userId || null });
        },

        getActiveAccountKey() {
            return activeProgressKey;
        },

        installHooks() {
            if (this._hooksInstalled) return;
            this._hooksInstalled = true;

            const wrapFn = (name, before) => {
                const attempt = () => {
                    const fn = global[name];
                    if (typeof fn !== 'function' || fn.__progressWrapped) return;
                    const original = fn;
                    global[name] = function (...args) {
                        try { before.apply(this, args); } catch (e) { console.warn('UserProgress hook:', e); }
                        return original.apply(this, args);
                    };
                    global[name].__progressWrapped = true;
                };
                attempt();
                global.addEventListener('DOMContentLoaded', attempt);
                global.setTimeout(attempt, 800);
            };

            wrapFn('openPoemModal', function (poemId) {
                global.getSherById?.(poemId).then(poem => {
                    if (!poem) return;
                    const existing = UserProgress.getReadingPosition('poem', poem.id);
                    UserProgress.recordContentOpened({
                        kind: 'poem',
                        id: poem.id,
                        title: poem.sarlavha,
                        type: 'She\'r',
                        href: buildContinueHref({ kind: 'poem', id: poem.id, progress: existing?.progress || 10 }),
                        progress: existing?.progress || 10
                    });
                });
            });

            wrapFn('openDostonModal', function (dostonId) {
                global.getDostonlar?.().then(list => {
                    const d = list?.find(x => x.id === dostonId);
                    if (!d) return;
                    UserProgress.recordContentOpened({
                        kind: 'doston',
                        id: d.id,
                        title: d.sarlavha || d.nomi,
                        type: 'Doston',
                        href: 'pages/asarlar.html',
                        progress: 40
                    });
                });
            });

            wrapFn('openQissaRead', function (qissaId) {
                global.getQissalar?.().then(list => {
                    const q = list?.find(x => x.id === qissaId);
                    if (!q) return;
                    UserProgress.recordContentOpened({
                        kind: 'qissa',
                        id: q.id,
                        title: q.sarlavha,
                        type: 'Qissa',
                        href: 'pages/asarlar.html',
                        progress: q.pdf ? 25 : 40
                    });
                });
            });

            global.addEventListener('click', (e) => {
                const card = e.target.closest('.video-card[data-catalog-key]');
                if (!card) return;
                const catalogKey = card.getAttribute('data-catalog-key');
                const title = card.querySelector('.video-card__title')?.textContent?.trim() || 'Video';
                if (catalogKey) {
                    UserProgress.recordVideoWatched({ id: catalogKey, title });
                }
            }, true);

            const nativeSetItem = global.Storage.prototype.setItem;
            global.Storage.prototype.setItem = function (key, value) {
                nativeSetItem.call(this, key, value);
                if (key === LEGACY_FAVORITES) {
                    try {
                        const ids = JSON.parse(value);
                        if (Array.isArray(ids)) {
                            UserProgress._state.favorites.poems = ids.map(Number).filter(Boolean);
                            UserProgress._persist('favoriteSync');
                            emitEvent('favoriteChanged', { source: 'legacy' });
                        }
                    } catch (err) { /* ignore */ }
                }
                if (key === LEGACY_AI) {
                    try {
                        const convos = JSON.parse(value);
                        UserProgress._state.aiChats = Array.isArray(convos) ? convos.length : 0;
                        UserProgress._persist('aiSync');
                    } catch (err) { /* ignore */ }
                }
            };

            global.addEventListener('storage', (e) => {
                if (!e.key) return;
                const isProgressKey = e.key === activeProgressKey
                    || e.key.startsWith(STORAGE_PREFIX);
                if (isProgressKey || [LEGACY_FAVORITES, LEGACY_TALIM, LEGACY_AI].includes(e.key)) {
                    UserProgress._state = loadState(activeProgressKey);
                    syncLegacy(UserProgress._state);
                    emitEvent('progressChanged', { source: 'storage' });
                }
            });
        },

        init() {
            migrateLegacyProgress();
            const authUser = global.PlatformAuth?.getCurrentUser?.();
            activeProgressKey = resolveProgressKey(authUser?.id || null);
            this._state = loadState(activeProgressKey);
            syncLegacy(this._state);
            if (authUser) {
                this._state.user = profileFromAuthUser(authUser, this._state.user);
            }
            saveState(this._state);
            this.installHooks();
        }
    };

    UserProgress.init();
    global.UserProgress = UserProgress;
})(typeof window !== 'undefined' ? window : globalThis);
