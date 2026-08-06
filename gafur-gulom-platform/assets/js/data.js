// ===================================
// Data Management — PlatformDataService facade (Phase 11)
// Backward-compatible wrappers + fetch shim for legacy page loads
// ===================================

(function () {
    'use strict';

    const SERVICE_PATH = (function () {
        const inPages = window.location.pathname.includes('/pages/');
        return (inPages ? '../assets/js/' : 'assets/js/') + 'platform-data-service.js';
    })();

    let nativeFetch = window.fetch.bind(window);
    let shimInstalled = false;

    function loadServiceScript() {
        if (window.PlatformDataService) return Promise.resolve();
        return new Promise((resolve, reject) => {
            const existing = document.querySelector('script[data-platform-data-service]');
            if (existing) {
                existing.addEventListener('load', () => resolve());
                existing.addEventListener('error', reject);
                if (window.PlatformDataService) resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = SERVICE_PATH;
            script.dataset.platformDataService = '1';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('PlatformDataService script failed to load'));
            document.head.appendChild(script);
        });
    }

    const platformDataReady = loadServiceScript()
        .then(() => window.PlatformDataService.ensureLoaded())
        .catch(err => {
            console.error('Platform data initialization failed:', err);
        });

    window.platformDataReady = platformDataReady;

    function installFetchShim() {
        if (shimInstalled || !window.PlatformDataService) return;
        shimInstalled = true;

        window.fetch = function (input, init) {
            const url = typeof input === 'string' ? input : (input && input.url) || '';
            const match = url.match(/\/data\/([^/?#]+\.json)(?:\?.*)?$/);

            if (match) {
                const filename = match[1];
                return platformDataReady.then(() => {
                    const data = window.PlatformDataService.getRawByFile(filename);
                    if (data == null) {
                        return nativeFetch(input, init);
                    }
                    return new Response(JSON.stringify(data), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    });
                });
            }

            return nativeFetch(input, init);
        };
    }

    platformDataReady.then(installFetchShim);

    const PROGRESS_PATH = (function () {
        const inPages = window.location.pathname.includes('/pages/');
        return (inPages ? '../assets/js/' : 'assets/js/') + 'user-progress.js';
    })();

    const ACHIEVEMENT_PATH = (function () {
        const inPages = window.location.pathname.includes('/pages/');
        return (inPages ? '../assets/js/' : 'assets/js/') + 'achievement-engine.js';
    })();

    function loadAchievementEngineScript() {
        if (window.AchievementEngine) return Promise.resolve();
        return new Promise((resolve, reject) => {
            const existing = document.querySelector('script[data-achievement-engine]');
            if (existing) {
                existing.addEventListener('load', () => resolve());
                existing.addEventListener('error', reject);
                if (window.AchievementEngine) resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = ACHIEVEMENT_PATH;
            script.dataset.achievementEngine = '1';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('AchievementEngine script failed to load'));
            document.head.appendChild(script);
        });
    }

    function loadUserProgressScript() {
        if (window.UserProgress) return Promise.resolve();
        return new Promise((resolve, reject) => {
            const existing = document.querySelector('script[data-user-progress]');
            if (existing) {
                existing.addEventListener('load', () => resolve());
                existing.addEventListener('error', reject);
                if (window.UserProgress) resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = PROGRESS_PATH;
            script.dataset.userProgress = '1';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('UserProgress script failed to load'));
            document.head.appendChild(script);
        });
    }

    platformDataReady
        .then(loadAchievementEngineScript)
        .then(loadUserProgressScript)
        .catch(err => {
            console.warn('UserProgress load skipped:', err);
        });

    async function withService(method) {
        await platformDataReady;
        return window.PlatformDataService[method]();
    }

    // ===================================
    // Legacy API (unchanged signatures)
    // ===================================

    async function getSherlar() {
        await platformDataReady;
        return window.PlatformDataService.getPoems();
    }

    async function getDostonlar() {
        await platformDataReady;
        return window.PlatformDataService.getDostonlar();
    }

    async function getHayotMalumotlari() {
        await platformDataReady;
        return window.PlatformDataService.getBiography().voqealar || [];
    }

    async function getHayotFull() {
        await platformDataReady;
        return window.PlatformDataService.getBiography();
    }

    async function getQuizSavollari() {
        await platformDataReady;
        return window.PlatformDataService.getQuizQuestions();
    }

    async function getIlmiy() {
        await platformDataReady;
        return window.PlatformDataService.getScientificArticles().maqolalar;
    }

    async function getIlmiyFull() {
        await platformDataReady;
        return window.PlatformDataService.getScientificArticles();
    }

    async function getQuizlar() {
        return getQuizSavollari();
    }

    async function getVideolar() {
        await platformDataReady;
        return window.PlatformDataService.getVideos();
    }

    async function getAsarlarList() {
        await platformDataReady;
        return window.PlatformDataService.getAsarlar();
    }

    async function getPlatformStatistics() {
        await platformDataReady;
        return window.PlatformDataService.getStatistics();
    }

    async function getSherById(id) {
        const sherlar = await getSherlar();
        return sherlar.find(sher => sher.id === parseInt(id, 10));
    }

    async function getSherlarByMavzu(mavzu) {
        const sherlar = await getSherlar();
        return sherlar.filter(sher =>
            sher.mavzu.some(m => m.toLowerCase().includes(mavzu.toLowerCase()))
        );
    }

    async function searchContent(query) {
        await platformDataReady;
        const results = window.PlatformDataService.searchAll(query, 50);
        return {
            sherlar: results.filter(r => r.type === 'poem').map(r => r.item),
            dostonlar: results.filter(r => r.type === 'doston').map(r => r.item)
        };
    }

    async function searchAllPlatform(query, limit) {
        await platformDataReady;
        return window.PlatformDataService.searchAll(query, limit);
    }

    async function recommendPlatformContent(options) {
        await platformDataReady;
        return window.PlatformDataService.recommendContent(options);
    }

    window.getSherlar = getSherlar;
    window.getDostonlar = getDostonlar;
    window.getHayotMalumotlari = getHayotMalumotlari;
    window.getHayotFull = getHayotFull;
    window.getQuizSavollari = getQuizSavollari;
    window.getIlmiy = getIlmiy;
    window.getIlmiyFull = getIlmiyFull;
    window.getQuizlar = getQuizlar;
    window.getVideolar = getVideolar;
    window.getAsarlarList = getAsarlarList;
    window.getPlatformStatistics = getPlatformStatistics;
    window.getSherById = getSherById;
    window.getSherlarByMavzu = getSherlarByMavzu;
    window.searchContent = searchContent;
    window.searchAllPlatform = searchAllPlatform;
    window.recommendPlatformContent = recommendPlatformContent;
})();
