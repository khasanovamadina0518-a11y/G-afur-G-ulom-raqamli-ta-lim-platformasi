/**
 * PlatformDataService — centralized JSON data layer (Phase 11)
 * Single source of truth for all platform content.
 */
(function (global) {
    'use strict';

    const DEFAULT_REGISTRY = {
        hayot: { file: 'hayot.json', optional: false },
        sherlar: { file: 'sherlar.json', optional: false },
        dostonlar: { file: 'dostonlar.json', optional: false },
        ilmiy: { file: 'ilmiy.json', optional: false },
        quiz: { file: 'quiz.json', optional: false },
        videolar: { file: 'videolar.json', optional: true },
        asarlar: { file: 'asarlar.json', optional: true }
    };

    const EVENTS = ['dataUpdated', 'progressChanged', 'contentAdded'];

    function resolveBasePath() {
        if (typeof global.platformUrl === 'function') {
            return global.platformUrl('data/');
        }
        const path = global.location?.pathname || '';
        return path.includes('/pages/') ? '../data/' : 'data/';
    }

    function normalizeQuery(q) {
        return String(q || '')
            .toLowerCase()
            .replace(/[''`ʻʼ]/g, "'")
            .replace(/\s+/g, ' ')
            .trim();
    }

    function pickYear(item) {
        return item?.yil ?? item?.year ?? item?.id ?? 0;
    }

    function shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function textBlob(item) {
        if (!item || typeof item !== 'object') return '';
        return Object.values(item)
            .filter(v => typeof v === 'string' || typeof v === 'number')
            .concat(
                Array.isArray(item.mavzu) ? item.mavzu : [],
                Array.isArray(item.kalitSozlar) ? item.kalitSozlar : [],
                Array.isArray(item.mualliflar) ? item.mualliflar : []
            )
            .join(' ');
    }

    const PlatformDataService = {
        _registry: { ...DEFAULT_REGISTRY },
        _cache: {},
        _loadPromise: null,
        _listeners: Object.fromEntries(EVENTS.map(e => [e, new Set()])),
        _basePath: null,

        getBasePath() {
            if (!this._basePath) this._basePath = resolveBasePath();
            return this._basePath;
        },

        /**
         * Register a future JSON source.
         * @param {string} key
         * @param {{ file: string, optional?: boolean }} config
         */
        registerSource(key, config) {
            this._registry[key] = { ...config, file: config.file };
            return this;
        },

        on(event, handler) {
            if (!this._listeners[event]) this._listeners[event] = new Set();
            this._listeners[event].add(handler);
            return () => this.off(event, handler);
        },

        off(event, handler) {
            this._listeners[event]?.delete(handler);
        },

        emit(event, payload) {
            this._listeners[event]?.forEach(fn => {
                try { fn(payload); } catch (e) { console.error(`PlatformDataService.${event}:`, e); }
            });
        },

        async ensureLoaded(force = false) {
            if (!force && Object.keys(this._cache).length > 0) return this._cache;
            if (!force && this._loadPromise) return this._loadPromise;

            this._loadPromise = this._loadAll(force);
            return this._loadPromise;
        },

        async _loadAll(force) {
            if (force) this._cache = {};

            const base = this.getBasePath();
            const entries = Object.entries(this._registry);
            const results = await Promise.all(
                entries.map(async ([key, cfg]) => {
                    try {
                        const res = await fetch(base + cfg.file);
                        if (!res.ok) {
                            if (cfg.optional) return [key, null];
                            throw new Error(`Failed ${cfg.file}: ${res.status}`);
                        }
                        const json = await res.json();
                        return [key, json];
                    } catch (err) {
                        if (cfg.optional) {
                            console.warn(`PlatformDataService: optional ${cfg.file} skipped`, err);
                            return [key, null];
                        }
                        throw err;
                    }
                })
            );

            this._cache = Object.fromEntries(results.filter(([, v]) => v != null));
            this.emit('dataUpdated', { sources: Object.keys(this._cache), statistics: this.getStatistics() });
            return this._cache;
        },

        async reload() {
            this._loadPromise = null;
            await this.ensureLoaded(true);
            this.emit('dataUpdated', { sources: Object.keys(this._cache), statistics: this.getStatistics() });
            return this._cache;
        },

        /** Raw parsed JSON by registry key */
        getSource(key) {
            return this._cache[key] ?? null;
        },

        /** Raw parsed JSON by filename e.g. hayot.json */
        getRawByFile(filename) {
            const entry = Object.entries(this._registry).find(([, c]) => c.file === filename);
            return entry ? this._cache[entry[0]] : null;
        },

        getBiography() {
            return this.getSource('hayot') || { voqealar: [], bosqichlar: {}, xotiralar: [] };
        },

        getPoems() {
            return this.getSource('sherlar')?.sherlar || [];
        },

        getBooks() {
            const dostonlar = this.getSource('dostonlar')?.dostonlar || [];
            const asarlar = this.getSource('asarlar')?.asarlar || [];
            return [...dostonlar, ...asarlar];
        },

        getDostonlar() {
            return this.getSource('dostonlar')?.dostonlar || [];
        },

        getAsarlar() {
            return this.getSource('asarlar')?.asarlar || [];
        },

        getScientificArticles() {
            const ilmiy = this.getSource('ilmiy');
            if (!ilmiy) return { maqolalar: [], dissertatsiyalar: [], atamalar: [] };
            return {
                maqolalar: ilmiy.maqolalar || [],
                dissertatsiyalar: ilmiy.dissertatsiyalar || [],
                atamalar: ilmiy.atamalar || []
            };
        },

        getVideos() {
            return this.getSource('videolar') || { kurs: null, darslar: [], materiallar: [] };
        },

        getQuizQuestions() {
            return this.getSource('quiz')?.savollar || [];
        },

        getStatistics() {
            const bio = this.getBiography();
            const ilmiy = this.getScientificArticles();
            const videos = this.getVideos();

            return {
                poems: this.getPoems().length,
                dostonlar: this.getDostonlar().length,
                asarlar: this.getAsarlar().length,
                books: this.getBooks().length,
                works: this.getPoems().length + this.getDostonlar().length + this.getAsarlar().length,
                scientificArticles: ilmiy.maqolalar.length,
                dissertations: ilmiy.dissertatsiyalar.length,
                terms: ilmiy.atamalar.length,
                scientificTotal: ilmiy.maqolalar.length + ilmiy.dissertatsiyalar.length + ilmiy.atamalar.length,
                quizQuestions: this.getQuizQuestions().length,
                lifeEvents: (bio.voqealar || []).length,
                lifeStages: Object.keys(bio.bosqichlar || {}).length,
                memories: (bio.xotiralar || []).length,
                videos: (videos.darslar || []).length,
                videoMaterials: (videos.materiallar || []).length
            };
        },

        _allSearchableItems() {
            const items = [];
            const push = (type, source, item, titleField = 'sarlavha') => {
                items.push({
                    type,
                    source,
                    item,
                    title: item[titleField] || item.nomi || item.savol || item.sarlavha || '',
                    text: textBlob(item)
                });
            };

            this.getPoems().forEach(p => push('poem', 'sherlar', p));
            this.getDostonlar().forEach(d => push('doston', 'dostonlar', d));
            this.getAsarlar().forEach(a => push('book', 'asarlar', a, 'nomi'));
            this.getBiography().voqealar?.forEach(v => push('lifeEvent', 'hayot', v));
            Object.entries(this.getBiography().bosqichlar || {}).forEach(([key, b]) => {
                push('lifeStage', 'hayot', { ...b, key }, 'sarlavha');
            });
            this.getScientificArticles().maqolalar.forEach(m => push('article', 'ilmiy', m));
            this.getQuizQuestions().forEach(q => push('quiz', 'quiz', q, 'savol'));
            (this.getVideos().darslar || []).forEach(v => push('video', 'videolar', v));

            return items;
        },

        searchAll(query, limit = 20) {
            const q = normalizeQuery(query);
            if (!q) return [];

            return this._allSearchableItems()
                .map(entry => {
                    const hay = normalizeQuery(`${entry.title} ${entry.text}`);
                    let score = 0;
                    if (hay.includes(q)) score += 10;
                    q.split(' ').forEach(t => {
                        if (t.length > 1 && hay.includes(t)) score += 2;
                    });
                    return { ...entry, score };
                })
                .filter(r => r.score > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, limit);
        },

        recommendContent(options = {}) {
            const { context = '', type = null, limit = 3 } = options;
            const ctx = normalizeQuery(context);

            const poems = this.getPoems();
            const books = this.getBooks();
            const articles = this.getScientificArticles().maqolalar;
            const quizzes = this.getQuizQuestions();
            const videos = this.getVideos().darslar || [];
            const events = this.getBiography().voqealar || [];

            const pool = [];
            poems.forEach(p => pool.push({ kind: 'poem', item: p, title: p.sarlavha, year: pickYear(p) }));
            books.forEach(b => pool.push({ kind: 'book', item: b, title: b.sarlavha || b.nomi, year: pickYear(b) }));
            articles.forEach(a => pool.push({ kind: 'article', item: a, title: a.sarlavha, year: pickYear(a) }));
            quizzes.forEach(q => pool.push({ kind: 'quiz', item: q, title: q.savol, year: q.id }));
            videos.forEach(v => pool.push({ kind: 'video', item: v, title: v.sarlavha, year: v.tartib || v.id }));
            events.forEach(e => pool.push({ kind: 'lifeEvent', item: e, title: e.sarlavha, year: e.yil }));

            const filtered = type ? pool.filter(p => p.kind === type) : pool;

            const related = ctx
                ? filtered.filter(p => normalizeQuery(`${p.title} ${textBlob(p.item)}`).includes(ctx) ||
                    ctx.split(' ').some(t => t.length > 2 && normalizeQuery(p.title).includes(t)))
                : filtered;

            const byNewest = [...filtered].sort((a, b) => (b.year || 0) - (a.year || 0));
            const featured = [...filtered].filter(p => p.item?.featured || p.item?.tavsiya);
            const featuredPool = featured.length ? featured : byNewest.slice(0, Math.min(5, byNewest.length));

            return {
                newest: byNewest.slice(0, limit),
                featured: featuredPool.slice(0, limit),
                related: (related.length ? related : filtered).slice(0, limit),
                random: shuffle(filtered).slice(0, limit)
            };
        },

        notifyProgressChanged(payload) {
            this.emit('progressChanged', payload);
        },

        notifyContentAdded(payload) {
            this.emit('contentAdded', payload);
        }
    };

    global.PlatformDataService = PlatformDataService;
})(typeof window !== 'undefined' ? window : globalThis);
