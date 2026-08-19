/**
 * Local knowledge base for AI Yordamchi — Phase 7
 * Loads platform JSON and provides reusable search + response building.
 * No external API. Never invents content — only returns matched JSON text.
 */

const resolvePlatformPath = window.platformUrl || function (relativePath) { return relativePath; };

const KB_PATHS = {
    hayot: resolvePlatformPath('data/hayot.json'),
    sherlar: resolvePlatformPath('data/sherlar.json'),
    dostonlar: resolvePlatformPath('data/dostonlar.json'),
    ilmiy: resolvePlatformPath('data/ilmiy.json'),
    quiz: resolvePlatformPath('data/quiz.json')
};

const SERVICE_SCRIPT = resolvePlatformPath('assets/js/platform-data-service.js');

const STOP_WORDS = new Set([
    'va', 'yoki', 'bu', 'shu', 'u', 'men', 'siz', 'ber', 'haqida', 'nima', 'qanday',
    'kim', 'qaysi', 'menga', 'bilan', 'uchun', 'dan', 'ga', 'ni', 'da', 'de', 'mi',
    'the', 'a', 'an', 'is', 'are', 'about', 'what', 'who', 'how'
]);

/** @typedef {{ type: string, score: number, item: object, source: string, field?: string }} SearchHit */

const KnowledgeBase = {
    _data: null,
    _loadPromise: null,
    _lastContext: null,

    async _ensureService() {
        if (window.platformDataReady) {
            await window.platformDataReady;
            return window.PlatformDataService;
        }
        if (window.PlatformDataService) {
            await window.PlatformDataService.ensureLoaded();
            return window.PlatformDataService;
        }
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = SERVICE_SCRIPT;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
        await window.PlatformDataService.ensureLoaded();
        return window.PlatformDataService;
    },

    async load() {
        if (this._data) return this._data;
        if (this._loadPromise) return this._loadPromise;

        this._loadPromise = this._ensureService().then(svc => {
            this._data = {
                hayot: svc.getSource('hayot') || svc.getBiography(),
                sherlar: svc.getSource('sherlar') || { sherlar: svc.getPoems() },
                dostonlar: svc.getSource('dostonlar') || { dostonlar: svc.getDostonlar() },
                qissalar: svc.getSource('qissalar') || { qissalar: svc.getQissalar() },
                tarjimalar: svc.getSource('tarjimalar') || { tarjimalar: svc.getTarjimalar() },
                tanlanganAsarlar: svc.getSource('tanlangan-asarlar') || { asarlar: svc.getTanlanganAsarlar() },
                ilmiy: svc.getSource('ilmiy') || svc.getScientificArticles(),
                quiz: svc.getSource('quiz') || { savollar: svc.getQuizQuestions() },
                videolar: svc.getSource('videolar') || svc.getVideos()
            };

            if (typeof svc.on === 'function') {
                svc.on('dataUpdated', () => {
                    this._data = null;
                    this._loadPromise = null;
                });
            }

            return this._data;
        });

        return this._loadPromise;
    },

    getData() {
        return this._data;
    },

    setLastContext(ctx) {
        this._lastContext = ctx;
    },

    getLastContext() {
        return this._lastContext;
    }
};

function normalizeText(text) {
    return String(text || '')
        .toLowerCase()
        .replace(/[''`ʻʼ]/g, '\'')
        .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function tokenize(text) {
    return normalizeText(text)
        .split(/\s+/)
        .filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

function includesPhrase(haystack, phrase) {
    const h = normalizeText(haystack);
    const p = normalizeText(phrase);
    return p.length > 1 && h.includes(p);
}

function scoreText(queryTokens, text, weight = 1) {
    if (!text) return 0;
    const norm = normalizeText(text);
    let score = 0;
    for (const token of queryTokens) {
        if (norm.includes(token)) score += weight;
        if (token.length > 4 && norm.split(/\s+/).some(w => w.startsWith(token.slice(0, 4)))) {
            score += weight * 0.35;
        }
    }
    return score;
}

function scoreRecord(queryTokens, fields, baseWeight = 1) {
    let total = 0;
    for (const [field, weight] of fields) {
        const val = Array.isArray(field) ? field.join(' ') : field;
        total += scoreText(queryTokens, val, weight * baseWeight);
    }
    return total;
}

function topHits(hits, limit = 5) {
    return hits
        .filter(h => h.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}

function hasPoetryIntent(query) {
    const q = normalizeText(query);
    return /she['']?r|sherlar|lirika|qo'shiq/.test(q);
}

function detectIntent(query) {
    const q = normalizeText(query);

    if (/\b(test|quiz|viktorina|savol)\b/.test(q) && /\b(tavsiya|tavsiya qil|ber|yech)\b/.test(q)) {
        return 'quiz_recommend';
    }
    if (/\b(test|quiz|viktorina)\b/.test(q)) return 'quiz';

    if (/\b(ilmiy|maqola|tadqiqot|monografiya|annotatsiya)\b/.test(q)) return 'ilmiy';

    if (hasPoetryIntent(q)) return 'sherlar';

    if (/\b(doston|asar|roman|qissa|kitob|shum bola|yulduz|yillar sadosi)\b/.test(q) || includesPhrase(q, 'shum bola')) {
        return 'works';
    }

    if (/\b(video|dars|ko['']rish|tomosha)\b/.test(q)) return 'video';

    if (/\b(o['']?qish|bugun|tavsiya)\b/.test(q)) return 'study';

    if ((/\bmashhur\b/.test(q) || /\beng\b/.test(q)) && /\basar|kitob|she['']?r|doston/.test(q)) return 'works';

    if (/\b(kim|hayot|tug['']ilgan|biograf|vafot|yoshlik)\b/.test(q)) return 'hayot';

    if (/\b(batafsil|ko['']proq|yanada)\b/.test(q)) return 'followup_detail';
    if (/\b(qisqacha|qisqa)\b/.test(q)) return 'followup_brief';
    if (/\b(boshqa)\b/.test(q) && /\b(asar|she['']?r|kitob|test)\b/.test(q)) return 'followup_other';

    return 'general';
}

function searchHayot(query) {
    const data = KnowledgeBase.getData();
    if (!data?.hayot) return [];
    const tokens = tokenize(query);
    const hits = [];

    for (const v of data.hayot.voqealar || []) {
        const score = scoreRecord(tokens, [
            [v.sarlavha, 3],
            [v.qisqa, 2],
            [v.batafsil, 1.5],
            [String(v.yil), 1],
            [v.bosqich, 0.5]
        ]);
        if (score > 0) hits.push({ type: 'voqea', score, item: v, source: 'hayot' });
    }

    for (const [key, stage] of Object.entries(data.hayot.bosqichlar || {})) {
        const score = scoreRecord(tokens, [
            [stage.sarlavha, 2.5],
            [stage.matn, 1],
            [stage.yillar, 1],
            [(stage.asarlar || []).join(' '), 2],
            [key, 0.5]
        ]);
        if (score > 0) hits.push({ type: 'bosqich', score, item: { ...stage, key }, source: 'hayot' });
    }

    for (const x of data.hayot.xotiralar || []) {
        const score = scoreRecord(tokens, [[x.muallif, 1.5], [x.matn, 2], [String(x.yil), 0.5]]);
        if (score > 0) hits.push({ type: 'xotira', score, item: x, source: 'hayot' });
    }

    if (includesPhrase(query, 'g\'afur g\'ulom kim') || (tokens.includes('kim') && scoreText(tokens, 'g\'afur g\'ulom', 2) > 0)) {
        const birth = (data.hayot.voqealar || []).find(v => v.yil === 1903);
        const death = (data.hayot.voqealar || []).find(v => v.sarlavha === 'Vafoti');
        hits.push({
            type: 'bio_summary',
            score: 100,
            item: { birth, death, intro: data.hayot.bosqichlar?.yoshlik?.matn },
            source: 'hayot'
        });
    }

    return topHits(hits, 6);
}

function searchSherlar(query) {
    const data = KnowledgeBase.getData();
    if (!data?.sherlar?.sherlar) return [];
    const tokens = tokenize(query);
    const hits = [];

    for (const s of data.sherlar.sherlar) {
        const score = scoreRecord(tokens, [
            [s.sarlavha, 3],
            [s.qisqa, 2],
            [s.nota, +2],
            [(s.mavzu || []).join(' '), 1.5],
            [s.matn, 0.5]
        ]);
        if (score > 0) hits.push({ type: 'sher', score, item: s, source: 'sherlar' });
    }

    if (hasPoetryIntent(query) && !hits.length) {
        return data.sherlar.sherlar.slice(0, 4).map(s => ({
            type: 'sher', score: 1, item: s, source: 'sherlar'
        }));
    }

    return topHits(hits, 5);
}

function searchDostonlar(query) {
    const data = KnowledgeBase.getData();
    if (!data?.dostonlar?.dostonlar) return [];
    const tokens = tokenize(query);

    const hits = data.dostonlar.dostonlar.map(d => ({
        type: 'doston',
        score: scoreRecord(tokens, [
            [d.sarlavha, 3],
            [d.qisqa, 2.5],
            [d.matn, 1.5],
            [(d.mavzu || []).join(' '), 1]
        ]),
        item: d,
        source: 'dostonlar'
    }));

    return topHits(hits, 4);
}

function searchQissalar(query) {
    const list = KnowledgeBase.getData()?.qissalar?.qissalar || [];
    if (!list.length) return [];
    const tokens = tokenize(query);

    const hits = list.map(q => ({
        type: 'qissa',
        score: scoreRecord(tokens, [
            [q.sarlavha, 3],
            [q.qisqa, 2.5],
            [q.matn, 1],
            [(q.mavzu || []).join(' '), 1]
        ]),
        item: q,
        source: 'qissalar'
    }));

    if (/\bqissa\b/.test(normalizeText(query)) && !hits.some(h => h.score > 0)) {
        return list.slice(0, 3).map(q => ({ type: 'qissa', score: 1, item: q, source: 'qissalar' }));
    }

    return topHits(hits, 4);
}

function searchIlmiy(query) {
    const data = KnowledgeBase.getData();
    if (!data?.ilmiy?.maqolalar) return [];
    const tokens = tokenize(query);

    const hits = data.ilmiy.maqolalar.map(m => ({
        type: 'maqola',
        score: scoreRecord(tokens, [
            [m.sarlavha, 3],
            [m.annotatsiya, 2],
            [(m.kalitSozlar || []).join(' '), 2],
            [(m.mualliflar || []).join(' '), 1],
            [m.nashriyot, 0.5]
        ]),
        item: m,
        source: 'ilmiy'
    }));

    if (/\b(ilmiy|maqola)\b/.test(normalizeText(query)) && !hits.some(h => h.score > 0)) {
        return data.ilmiy.maqolalar.slice(0, 3).map(m => ({
            type: 'maqola', score: 1, item: m, source: 'ilmiy'
        }));
    }

    return topHits(hits, 4);
}

function searchQuiz(query, recommend = false) {
    const data = KnowledgeBase.getData();
    if (!data?.quiz?.savollar) return [];
    const tokens = tokenize(query);

    const hits = data.quiz.savollar.map(s => ({
        type: 'savol',
        score: scoreRecord(tokens, [
            [s.savol, 2],
            [s.mavzu, 2],
            [s.daraja, 1],
            [(s.variantlar || []).join(' '), 0.5]
        ]),
        item: s,
        source: 'quiz'
    }));

    if (recommend || /\btavsiya\b/.test(normalizeText(query))) {
        const byTopic = {};
        for (const s of data.quiz.savollar) {
            const topic = s.mavzu || 'umumiy';
            if (!byTopic[topic]) byTopic[topic] = { count: 0, easy: 0, samples: [] };
            byTopic[topic].count++;
            if (s.daraja === 'oson') byTopic[topic].easy++;
            if (byTopic[topic].samples.length < 2) byTopic[topic].samples.push(s);
        }
        return Object.entries(byTopic)
            .map(([topic, info]) => ({
                type: 'quiz_topic',
                score: info.count,
                item: { topic, ...info },
                source: 'quiz'
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 4);
    }

    return topHits(hits, 4);
}

function searchAll(query) {
    return {
        hayot: searchHayot(query),
        sherlar: searchSherlar(query),
        dostonlar: searchDostonlar(query),
        qissalar: searchQissalar(query),
        ilmiy: searchIlmiy(query),
        quiz: searchQuiz(query)
    };
}

function buildPlatformLinks(intent, all) {
    const links = [];

    switch (intent) {
        case 'hayot':
            links.push({ label: 'Hayoti sahifasi', href: 'pages/hayot.html' });
            break;
        case 'sherlar': {
            const sher = all?.sherlar?.[0]?.item;
            if (sher?.id) {
                links.push({ label: `«${sher.sarlavha}»ni o'qish`, href: `pages/asarlar.html?poem=${sher.id}` });
            }
            links.push({ label: 'She\'rlar bo\'limi', href: 'pages/asarlar.html?tab=sherlar' });
            break;
        }
        case 'works': {
            const qissa = all?.qissalar?.[0]?.item;
            const doston = all?.dostonlar?.[0]?.item;
            if (qissa?.id) {
                links.push({ label: `«${qissa.sarlavha}» qissasi`, href: `pages/asarlar.html?qissa=${qissa.id}` });
            } else if (doston?.id) {
                links.push({ label: `«${doston.sarlavha}» hikoyasi`, href: `pages/asarlar.html?doston=${doston.id}` });
            }
            links.push({ label: 'Asarlar kutubxonasi', href: 'pages/asarlar.html' });
            break;
        }
        case 'ilmiy':
            links.push({ label: 'Ilmiy arxiv', href: 'pages/ilmiy.html' });
            break;
        case 'quiz':
        case 'quiz_recommend':
            links.push({ label: 'Testlar sahifasi', href: 'pages/interaktiv.html' });
            break;
        case 'video':
            links.push({ label: 'Video darslar', href: 'pages/multimedia.html' });
            break;
        case 'study':
            links.push({ label: 'Ta\'lim materiallari', href: 'pages/talim.html' });
            links.push({ label: 'Interaktiv o\'yinlar', href: 'pages/interaktiv-oyinlar.html' });
            break;
        default:
            links.push({ label: 'Asarlar', href: 'pages/asarlar.html' });
            break;
    }

    return links.slice(0, 3);
}

function truncate(text, max = 320) {
    const t = String(text || '').replace(/\s+/g, ' ').trim();
    if (t.length <= max) return t;
    return t.slice(0, max).trim() + '…';
}

function buildHayotResponse(hits, detailed) {
    const bio = hits.find(h => h.type === 'bio_summary');
    if (bio) {
        const { birth, death } = bio.item;
        let text = '';
        if (birth) text += birth.qisqa + ' ';
        if (death) text += death.qisqa;
        if (detailed && birth?.batafsil) text += '\n\n' + truncate(birth.batafsil, 400);
        return text.trim();
    }

    const voqealar = hits.filter(h => h.type === 'voqea');
    if (voqealar.length) {
        return voqealar.slice(0, detailed ? 3 : 2).map(h => {
            const v = h.item;
            const body = detailed ? (v.batafsil || v.qisqa) : v.qisqa;
            return `${v.yil} — ${v.sarlavha}: ${truncate(body, detailed ? 280 : 180)}`;
        }).join('\n\n');
    }

    const bosqich = hits.find(h => h.type === 'bosqich');
    if (bosqich) {
        const b = bosqich.item;
        return `${b.sarlavha} (${b.yillar}): ${truncate(detailed ? b.matn : b.matn.split('\n\n')[0], detailed ? 400 : 220)}`;
    }

    const xotira = hits.find(h => h.type === 'xotira');
    if (xotira) return `${xotira.item.muallif} (${xotira.item.yil}): ${truncate(xotira.item.matn, 260)}`;

    return '';
}

function buildSherlarResponse(hits) {
    if (!hits.length) return '';
    const lines = hits.map(h => {
        const s = h.item;
        return `«${s.sarlavha}» (${s.yil}): ${s.nota || s.qisqa}`;
    });
    return lines.join('\n\n');
}

function buildWorksResponse(query, hitsHayot, hitsDoston, detailed, hitsQissalar = []) {
    const q = normalizeText(query);
    const parts = [];

    const shum = (hitsHayot || []).find(h =>
        h.type === 'voqea' && includesPhrase(h.item.sarlavha, 'shum bola')
    ) || (includesPhrase(q, 'shum bola') ? searchHayot('shum bola')[0] : null);

    if (shum) {
        const v = shum.item;
        parts.push(`«Shum bola» (${v.yil}): ${truncate(detailed ? v.batafsil : v.qisqa, detailed ? 350 : 200)}`);
    }

    for (const h of hitsDoston || []) {
        const d = h.item;
        parts.push(`«${d.sarlavha}» (${d.yil}): ${truncate(d.qisqa || d.matn, 180)}`);
    }

    for (const h of hitsQissalar || []) {
        const qissa = h.item;
        parts.push(`«${qissa.sarlavha}» qissasi${qissa.yil ? ` (${qissa.yil})` : ''}: ${truncate(qissa.qisqa || qissa.matn, 180)}`);
    }

    const stage = (hitsHayot || []).find(h => h.type === 'bosqich' && (h.item.asarlar || []).length);
    if (!parts.length && stage) {
        parts.push(`Bu davr asarlari: ${stage.item.asarlar.join(', ')}.`);
        parts.push(truncate(stage.item.matn.split('\n\n')[0], 220));
    }

    return parts.join('\n\n');
}

function buildIlmiyResponse(hits) {
    if (!hits.length) return '';
    return hits.map(h => {
        const m = h.item;
        const authors = (m.mualliflar || []).join(', ');
        return `«${m.sarlavha}» (${m.yil}, ${authors}): ${truncate(m.annotatsiya, 200)}`;
    }).join('\n\n');
}

function buildQuizRecommendResponse(hits) {
    if (!hits.length) return '';
    return hits.map(h => {
        const t = h.item;
        const samples = (t.samples || []).map(s => `• ${s.savol}`).join('\n');
        return `${t.topic} mavzusi (${t.count} ta savol, ${t.easy} tasi oson daraja):\n${samples}`;
    }).join('\n\n');
}

function buildStudyRecommendResponse() {
    const data = KnowledgeBase.getData();
    const parts = [];

    const stage = data?.hayot?.bosqichlar?.kamolot;
    if (stage?.asarlar?.length) {
        parts.push(`Kitob tavsiyasi: «${stage.asarlar[0]}» — ${truncate(stage.matn.split('\n\n')[1] || stage.matn, 160)}`);
    }

    const sher = (data?.sherlar?.sherlar || []).slice(0, 2);
    if (sher.length) {
        parts.push(`She'r tavsiyasi: ${sher.map(s => `«${s.sarlavha}» (${s.nota || s.qisqa})`).join('; ')}`);
    }

    const quizTopics = searchQuiz('', true);
    if (quizTopics.length) {
        parts.push(`Test tavsiyasi: «${quizTopics[0].item.topic}» mavzusidagi testlar (${quizTopics[0].item.count} savol).`);
    }

    const bosqichlar = Object.values(data?.hayot?.bosqichlar || {}).slice(0, 3);
    if (bosqichlar.length) {
        parts.push(`Video dars mavzulari (multimedia bo'limi): ${bosqichlar.map(b => b.sarlavha).join(', ')}.`);
    }

    return parts.join('\n\n');
}

function buildVideoRecommendResponse(query) {
    const data = KnowledgeBase.getData();
    const tokens = tokenize(query);
    const stages = Object.values(data?.hayot?.bosqichlar || []);
    const matched = stages
        .map(s => ({ s, score: scoreRecord(tokens, [[s.sarlavha, 2], [s.matn, 1]]) }))
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score);

    const list = (matched.length ? matched : stages.slice(0, 3)).map(x => x.s || x);
    return `Videolar bo'limida quyidagi mavzularni ko'rishingiz mumkin:\n${list.map(s => `• ${s.sarlavha} (${s.yillar})`).join('\n')}\n\nBu mavzular hayot.json dagi ijodiy bosqichlar bilan mos keladi.`;
}

function buildNotFoundResponse(query) {
    return `Kechirasiz, «${query.trim()}» bo'yicha bilim bazasida mos ma'lumot topilmadi. ` +
        `Men faqat platformadagi hayot, she'rlar, dostonlar, ilmiy maqolalar va testlar ma'lumotlaridan foydalanaman. ` +
        `Iltimos, G'afur G'ulom hayoti, asarlari, she'rlari yoki testlar haqida aniqroq savol bering.`;
}

function buildFollowups(intent, hits, query) {
    const chips = [];

    switch (intent) {
        case 'hayot':
            chips.push('Shum bola haqida ma\'lumot ber.', 'G\'afur G\'ulomning she\'rlari.', 'Ilmiy maqolalar');
            break;
        case 'sherlar':
            if (hits?.sherlar?.[0]) chips.push(`«${hits.sherlar[0].item.sarlavha}» haqida batafsil`);
            chips.push('Menga test tavsiya qil.', 'Eng mashhur asarlari qaysilar?');
            break;
        case 'works':
            chips.push('Batafsilroq ayting', 'G\'afur G\'ulom kim?', 'Ilmiy maqolalar');
            break;
        case 'ilmiy':
            chips.push('G\'afur G\'ulom hayoti', 'Shum bola haqida', 'Menga test tavsiya qil.');
            break;
        case 'quiz_recommend':
        case 'quiz':
            chips.push('G\'afur G\'ulom kim?', 'Testlar sahifasiga o\'tish', 'Bugun nimani o\'qishni tavsiya qilasan?');
            break;
        case 'study':
        case 'video':
            chips.push('G\'afur G\'ulomning she\'rlari.', 'Menga test tavsiya qil.', 'Eng mashhur asarlari qaysilar?');
            break;
        default:
            chips.push('G\'afur G\'ulom kim?', 'Shum bola haqida ma\'lumot ber.', 'Menga test tavsiya qil.');
    }

    return chips.slice(0, 3);
}

/**
 * Main query handler — returns { content, followups, context }
 * @param {string} query
 * @param {Array<{role:string, content:string}>} messages
 */
async function queryKnowledgeBase(query, messages = []) {
    await KnowledgeBase.load();
    const intent = detectIntent(query);
    const detailed = intent === 'followup_detail' || /\bbatafsil\b/.test(normalizeText(query));
    const brief = intent === 'followup_brief';

    let effectiveQuery = query;
    const ctx = KnowledgeBase.getLastContext();

    if (intent.startsWith('followup_') && ctx?.lastQuery) {
        effectiveQuery = ctx.lastQuery;
    }

    const all = searchAll(effectiveQuery);
    let content = '';
    let resolvedIntent = intent;

    if (intent === 'followup_detail' && ctx?.lastIntent) resolvedIntent = ctx.lastIntent;
    if (intent === 'followup_brief') resolvedIntent = ctx?.lastIntent || 'hayot';
    if (intent === 'followup_other') resolvedIntent = 'works';

    switch (resolvedIntent) {
        case 'hayot':
        case 'followup_detail':
        case 'followup_brief':
            content = buildHayotResponse(all.hayot, detailed && !brief);
            if (!content && all.hayot.length) content = buildHayotResponse(all.hayot, false);
            break;
        case 'sherlar':
            content = buildSherlarResponse(all.sherlar);
            if (!content && hasPoetryIntent(query)) {
                content = buildSherlarResponse(searchSherlar('she\'rlar'));
            }
            break;
        case 'works':
        case 'followup_other':
            content = buildWorksResponse(effectiveQuery, all.hayot, all.dostonlar, detailed, all.qissalar);
            if (!content) content = buildHayotResponse(all.hayot, detailed);
            break;
        case 'ilmiy':
            content = buildIlmiyResponse(all.ilmiy);
            break;
        case 'quiz_recommend':
            content = buildQuizRecommendResponse(searchQuiz(effectiveQuery, true));
            if (content) content = 'Test tavsiyalari (quiz.json):\n\n' + content;
            break;
        case 'quiz':
            content = buildQuizRecommendResponse(searchQuiz(effectiveQuery, true));
            if (content) content = 'Mavzular bo\'yicha testlar:\n\n' + content;
            break;
        case 'study':
            content = buildStudyRecommendResponse();
            break;
        case 'video':
            content = buildVideoRecommendResponse(effectiveQuery);
            break;
        default: {
            const scores = [
                ['hayot', all.hayot[0]?.score || 0],
                ['sherlar', all.sherlar[0]?.score || 0],
                ['works', Math.max(all.dostonlar[0]?.score || 0, all.qissalar[0]?.score || 0, all.hayot[0]?.score || 0)],
                ['ilmiy', all.ilmiy[0]?.score || 0]
            ].sort((a, b) => b[1] - a[1]);

            if (scores[0][1] <= 0) {
                content = buildNotFoundResponse(query);
            } else {
                resolvedIntent = scores[0][0];
                switch (resolvedIntent) {
                    case 'hayot': content = buildHayotResponse(all.hayot, false); break;
                    case 'sherlar': content = buildSherlarResponse(all.sherlar); break;
                    case 'works': content = buildWorksResponse(effectiveQuery, all.hayot, all.dostonlar, false, all.qissalar); break;
                    case 'ilmiy': content = buildIlmiyResponse(all.ilmiy); break;
                }
            }
        }
    }

    if (!content || !content.trim()) {
        content = buildNotFoundResponse(query);
    }

    const newContext = {
        lastQuery: effectiveQuery,
        lastIntent: resolvedIntent,
        lastHits: all
    };
    KnowledgeBase.setLastContext(newContext);

    return {
        content: content.trim(),
        followups: buildFollowups(resolvedIntent, all, query),
        links: buildPlatformLinks(resolvedIntent, all),
        context: newContext
    };
}

window.AIKnowledge = {
    KnowledgeBase,
    queryKnowledgeBase,
    searchHayot,
    searchSherlar,
    searchDostonlar,
    searchQissalar,
    searchIlmiy,
    searchQuiz,
    searchAll,
    detectIntent,
    normalizeText
};
