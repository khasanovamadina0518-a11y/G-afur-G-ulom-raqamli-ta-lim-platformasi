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
        asarlar: { file: 'asarlar.json', optional: true },
        qissalar: { file: 'qissalar.json', optional: false },
        tarjimalar: { file: 'tarjimalar.json', optional: true },
        tanlanganAsarlar: { file: 'tanlangan-asarlar.json', optional: true }
    };

    const DATA_CACHE_VERSION = '20260819';

    const EVENTS = ['dataUpdated', 'progressChanged', 'contentAdded'];

    function resolveBasePath() {
        if (typeof global.platformUrl === 'function') {
            return global.platformUrl('data/');
        }
        const path = global.location?.pathname || '';
        return '/data/';
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
        const parts = Object.values(item)
            .filter(v => typeof v === 'string' || typeof v === 'number');
        if (Array.isArray(item.mavzu)) parts.push(...item.mavzu);
        if (Array.isArray(item.kalitSozlar)) parts.push(...item.kalitSozlar);
        if (Array.isArray(item.mualliflar)) parts.push(...item.mualliflar);
        if (Array.isArray(item.teglar)) parts.push(...item.teglar);
        if (item.muallif) parts.push(item.muallif);
        if (item.tarif) parts.push(item.tarif);
        if (item.annotatsiya) parts.push(item.annotatsiya);
        if (item.atama) parts.push(item.atama);
        if (item.qisqa) parts.push(item.qisqa);
        if (item.qisqaSarlavha) parts.push(item.qisqaSarlavha);
        return parts.join(' ');
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
                        const res = await fetch(`${base}${cfg.file}?v=${DATA_CACHE_VERSION}`, { cache: 'no-store' });
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
            this._cachedSearchItems = null;
            this.emit('dataUpdated', { sources: Object.keys(this._cache), statistics: this.getStatistics() });
            return this._cache;
        },

        async reload() {
            this._loadPromise = null;
            this._cachedSearchItems = null;
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

        getQissalar() {
            return this.getSource('qissalar')?.qissalar || [];
        },

        getTarjimalar() {
            return this.getSource('tarjimalar')?.tarjimalar || [];
        },

        getTanlanganAsarlar() {
            return this.getSource('tanlanganAsarlar')?.tanlanganAsarlar || [];
        },

        getHikoyalar() {
            return this.getDostonlar().filter(function (item) {
                return String(item.janr || '').trim().toLowerCase() === 'hikoya';
            });
        },

        getScientificArticles() {
            const ilmiy = this.getSource('ilmiy');
            if (!ilmiy) {
                return {
                    maqolalar: [],
                    dissertatsiyalar: [],
                    tadqiqotlar: [],
                    atamalar: [],
                    bibliografiya: []
                };
            }
            return {
                maqolalar: ilmiy.maqolalar || [],
                dissertatsiyalar: ilmiy.dissertatsiyalar || [],
                tadqiqotlar: ilmiy.tadqiqotlar || [],
                atamalar: ilmiy.atamalar || [],
                bibliografiya: ilmiy.bibliografiya || []
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
            const poems = this.getPoems();
            const hikoyalar = this.getHikoyalar();
            const qissalar = this.getQissalar();
            const tarjimalar = this.getTarjimalar();
            const tanlanganAsarlar = this.getTanlanganAsarlar();

            const scientificTotal =
                ilmiy.maqolalar.length +
                ilmiy.dissertatsiyalar.length +
                ilmiy.tadqiqotlar.length +
                ilmiy.atamalar.length +
                ilmiy.bibliografiya.length;

            const totalWorks =
                poems.length +
                hikoyalar.length +
                qissalar.length +
                tarjimalar.length +
                tanlanganAsarlar.length;

            return {
                poems: poems.length,
                stories: hikoyalar.length,
                qissalar: qissalar.length,
                translations: tarjimalar.length,
                selectedWorks: tanlanganAsarlar.length,
                totalWorks: totalWorks,
                totalScientific: scientificTotal,

                scientificArticles: ilmiy.maqolalar.length,
                dissertations: ilmiy.dissertatsiyalar.length,
                research: ilmiy.tadqiqotlar.length,
                terms: ilmiy.atamalar.length,
                bibliography: ilmiy.bibliografiya.length,
                scientificTotal: scientificTotal,

                dostonlar: hikoyalar.length,
                asarlar: this.getAsarlar().length,
                books: this.getBooks().length,
                works: totalWorks,
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
                    title: item[titleField] || item.nomi || item.savol || item.sarlavha || item.atama || '',
                    text: textBlob(item)
                });
            };

            this.getPoems().forEach(p => push('poem', 'sherlar', p));
            this.getDostonlar().forEach(d => {
                const isStory = String(d.janr || '').trim().toLowerCase() === 'hikoya';
                push(isStory ? 'hikoya' : 'doston', 'dostonlar', d);
            });
            this.getAsarlar().forEach(a => push('book', 'asarlar', a, 'nomi'));
            this.getQissalar().forEach(q => push('qissa', 'qissalar', q));
            this.getTarjimalar().forEach(t => push('tarjima', 'tarjimalar', t));
            this.getTanlanganAsarlar().forEach(t => push('tanlangan', 'tanlangan-asarlar', t));

            const bio = this.getBiography();
            bio.voqealar?.forEach(v => push('lifeEvent', 'hayot', v));
            Object.entries(bio.bosqichlar || {}).forEach(([key, b]) => {
                push('lifeStage', 'hayot', { ...b, key }, 'sarlavha');
            });
            (bio.xotiralar || []).forEach((x, idx) => push('memory', 'hayot', { ...x, id: x.id ?? idx + 1 }));

            const ilmiy = this.getScientificArticles();
            ilmiy.maqolalar.forEach(m => push('article', 'ilmiy', m));
            ilmiy.dissertatsiyalar.forEach(d => push('dissertation', 'ilmiy', d));
            ilmiy.tadqiqotlar.forEach(t => push('research', 'ilmiy', t));
            ilmiy.atamalar.forEach(a => push('term', 'ilmiy', a, 'atama'));
            ilmiy.bibliografiya.forEach(b => push('bibliography', 'ilmiy', b));

            this.getQuizQuestions().forEach(q => push('quiz', 'quiz', q, 'savol'));

            const videos = this.getVideos();
            (videos.darslar || []).forEach(v => push('video', 'videolar', v));
            (videos.materiallar || []).forEach(v => push('videoMaterial', 'videolar', v));
            if (videos.kurs) push('videoCourse', 'videolar', videos.kurs);

            this._getStaticSearchEntries().forEach(entry => items.push(entry));

            return items;
        },

        _getStaticSearchEntries() {
            return [
                { type: 'interactive', source: 'interaktiv', item: { id: 'quiz', sarlavha: "Kim ko'p biladi?" }, title: "Kim ko'p biladi?", text: "viktorina savol javob interaktiv o'yin test" },
                { type: 'interactive', source: 'interaktiv', item: { id: 'memory', sarlavha: "She'r yodlash" }, title: "She'r yodlash", text: "she'r yodlash interaktiv o'yin" },
                { type: 'interactive', source: 'interaktiv', item: { id: 'timeline', sarlavha: 'Yilni moslang' }, title: 'Yilni moslang', text: "xronologiya yil hayot voqea interaktiv o'yin" },
                { type: 'interactive', source: 'interaktiv', item: { id: 'wordsearch', sarlavha: "So'z topish" }, title: "So'z topish", text: "so'z topish interaktiv o'yin" },
                { type: 'test', source: 'interaktiv', item: { id: 'tests', sarlavha: 'Testlar' }, title: 'Testlar', text: 'test viktorina bilim sinash interaktiv' },
                { type: 'education', source: 'talim', item: { id: 'talim', sarlavha: "Ta'lim resurslari" }, title: "Ta'lim resurslari", text: "dars reja sinf o'quv material ta'lim viktorina" },
                { type: 'education', source: 'talim', item: { id: '6-sinf', sarlavha: "6-sinf dars materiallari" }, title: "6-sinf dars materiallari", text: "6 sinf darslik gafur gulom ta'lim" },
                { type: 'education', source: 'talim', item: { id: '8-sinf', sarlavha: "8-sinf dars materiallari" }, title: "8-sinf dars materiallari", text: "8 sinf darslik shum bola ta'lim" }
            ];
        },

        _cachedSearchItems: null,

        _searchFieldsForType(type, item) {
            const common = [
                { key: 'sarlavha', label: 'Sarlavha' },
                { key: 'matn', label: 'Matn' },
                { key: 'qisqa', label: 'Qisqa' },
                { key: 'nota', label: 'Nota' },
                { key: 'muallif', label: 'Muallif' },
                { key: 'annotatsiya', label: 'Annotatsiya' },
                { key: 'tarif', label: 'Tarif' },
                { key: 'batafsil', label: 'Batafsil' },
                { key: 'savol', label: 'Savol' },
                { key: 'javob', label: 'Javob' },
                { key: 'atama', label: 'Atama' },
                { key: 'nomi', label: 'Nomi' },
                { key: 'tavsif', label: 'Tavsif' }
            ];

            if (type === 'term') return [{ key: 'atama', label: 'Atama' }, { key: 'tarif', label: 'Tarif' }, { key: 'misol', label: 'Misol' }];
            if (type === 'quiz') return [{ key: 'savol', label: 'Savol' }, { key: 'javob', label: 'Javob' }];
            if (type === 'lifeEvent') return [{ key: 'sarlavha', label: 'Sarlavha' }, { key: 'qisqa', label: 'Qisqa' }, { key: 'batafsil', label: 'Batafsil' }];
            if (type === 'lifeStage') return [{ key: 'sarlavha', label: 'Sarlavha' }, { key: 'matn', label: 'Matn' }];
            if (type === 'memory') return [{ key: 'matn', label: 'Xotira' }, { key: 'muallif', label: 'Muallif' }];
            if (type === 'interactive' || type === 'test' || type === 'education') {
                return [{ key: 'sarlavha', label: 'Sarlavha' }];
            }
            return common;
        },

        _getCachedSearchItems() {
            if (this._cachedSearchItems) return this._cachedSearchItems;
            this._cachedSearchItems = this._allSearchableItems();
            return this._cachedSearchItems;
        },

        searchAll(query, limit = 30) {
            const utils = global.PlatformSearchUtils;
            const rawQuery = String(query || '').trim();
            const q = normalizeQuery(rawQuery);
            if (!q || q.length < 2) return [];

            const results = [];
            const items = this._getCachedSearchItems();

            items.forEach(entry => {
                const item = entry.item || {};
                const itemId = item.id ?? item.key ?? entry.title;
                const title = entry.title || item.sarlavha || item.atama || item.nomi || item.savol || '';
                const fields = this._searchFieldsForType(entry.type, item);
                let itemMatched = false;

                fields.forEach(field => {
                    const text = item[field.key];
                    if (!text || typeof text !== 'string') return;

                    const ranges = utils
                        ? utils.findMatchRanges(text, q, 4)
                        : [{ start: 0, end: Math.min(text.length, q.length), match: q }];

                    if (!ranges.length) {
                        const hay = normalizeQuery(text);
                        if (!hay.includes(q) && !q.split(' ').some(t => t.length > 1 && hay.includes(t))) return;
                        ranges.push({ start: 0, end: 0, match: q });
                    }

                    ranges.forEach((range, occurrenceIndex) => {
                        const snippet = utils
                            ? utils.buildSnippet(text, q, range)
                            : text.slice(0, 120);
                        const score = utils
                            ? utils.scoreMatch(title, field.key, text, q, range, occurrenceIndex)
                            : 10;

                        results.push({
                            ...entry,
                            resultId: `${entry.type}-${itemId}-${field.key}-${occurrenceIndex}`,
                            itemId,
                            matchField: field.key,
                            matchFieldLabel: field.label,
                            occurrenceIndex,
                            snippet,
                            score,
                            highlight: rawQuery
                        });
                        itemMatched = true;
                    });
                });

                if (!itemMatched) {
                    const blob = normalizeQuery(`${title} ${entry.text || ''}`);
                    const tokens = q.split(' ').filter(t => t.length > 1);
                    const partial = tokens.length
                        ? tokens.some(t => blob.includes(t))
                        : blob.includes(q);
                    if (partial || blob.includes(q)) {
                        results.push({
                            ...entry,
                            resultId: `${entry.type}-${itemId}-meta-0`,
                            itemId,
                            matchField: 'meta',
                            matchFieldLabel: 'Umumiy',
                            occurrenceIndex: 0,
                            snippet: utils ? utils.escapeHtml(title) : title,
                            score: blob.includes(q) ? 8 : 4,
                            highlight: rawQuery
                        });
                    }
                }
            });

            return results
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
