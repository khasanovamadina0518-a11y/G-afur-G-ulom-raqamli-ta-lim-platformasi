// ===================================
// Video darslar sahifasi
// ===================================

let videoData = null;
let activeLessonId = null;
let activeSelection = { type: 'kurs', id: null };
let activeCategoryFilter = 'all';
let activeYouTubeId = null;
let courseVideo = null;

const VIDEO_PROGRESS_KEY = 'gafur-video-progress';

const DEFAULT_CATEGORIES = [
    {
        slug: 'hayoti-ijodi',
        tartib: '01',
        nom: 'Hayoti va ijodi',
        tavsif: "G'afur G'ulomning hayoti, ijodiy shakllanishi va adabiy faoliyatiga bag'ishlangan videomateriallar."
    },
    {
        slug: 'asarlar-tahlili',
        tartib: '02',
        nom: 'Asarlari va ularning tahlili',
        tavsif: "G'afur G'ulom asarlari, she'rlari va hikoyalari bo'yicha adabiy tahlil va tushuntirish videolari."
    },
    {
        slug: 'gafur-gulom-haqida',
        tartib: '03',
        nom: "G'afur G'ulom haqida",
        tavsif: "Adabiyotshunoslar, olimlar va tadqiqotchilarning G'afur G'ulom ijodi haqidagi ilmiy-ma'rifiy videolari."
    },
    {
        slug: 'filmlar',
        tartib: '04',
        nom: 'Asarlar asosida yaratilgan filmlar',
        tavsif: "G'afur G'ulom asarlari asosida yaratilgan badiiy filmlar."
    }
];

document.addEventListener('DOMContentLoaded', async function () {
    courseVideo = document.getElementById('course-video');
    await loadVideoData();
    initVideoTabs();
    initPlayerControls();
    initLessonNavigation();
});

function resolveAssetPath(path) {
    if (!path || path === '#') return '';
    return (window.platformUrl || function (r) { return r; })(path);
}

function getYouTubeVideoId(url) {
    if (!url) return null;

    try {
        const parsed = new URL(String(url));
        if (parsed.hostname.includes('youtube.com')) {
            return parsed.searchParams.get('v');
        }
        if (parsed.hostname === 'youtu.be') {
            return parsed.pathname.replace(/^\//, '') || null;
        }
    } catch {
        const match = String(url).match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        return match ? match[1] : null;
    }

    return null;
}

function getYouTubeEmbedUrl(videoId, autoplay = false) {
    const params = new URLSearchParams({ rel: '0', modestbranding: '1' });
    if (autoplay) params.set('autoplay', '1');
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

function setYouTubePlayerMode(youtubeId, title, autoplay = false) {
    const player = document.getElementById('video-player');
    const youtubeFrame = document.getElementById('course-youtube');
    const controls = player?.querySelector('.video-player__controls');
    const gradient = document.getElementById('player-overlay-gradient');
    const overlayEl = document.getElementById('player-overlay-title');

    activeYouTubeId = youtubeId || null;

    if (!youtubeId || !youtubeFrame || !courseVideo) {
        if (youtubeFrame) {
            youtubeFrame.hidden = true;
            youtubeFrame.removeAttribute('src');
        }
        if (courseVideo) courseVideo.hidden = false;
        player?.classList.remove('is-youtube');
        if (controls) controls.hidden = false;
        if (gradient) gradient.hidden = false;
        if (overlayEl) overlayEl.hidden = false;
        return false;
    }

    pauseCourseVideo();
    courseVideo.pause();
    courseVideo.removeAttribute('src');
    courseVideo.load();
    courseVideo.hidden = true;
    youtubeFrame.hidden = false;
    youtubeFrame.title = title || 'Video dars';
    youtubeFrame.src = getYouTubeEmbedUrl(youtubeId, autoplay);
    player?.classList.add('is-youtube');
    if (controls) controls.hidden = true;
    if (gradient) gradient.hidden = true;
    if (overlayEl) overlayEl.hidden = true;
    if (autoplay) setPlayerPlayingState(true);
    return true;
}

function getMediaErrorMessage(mediaEl) {
    if (!mediaEl) return 'Media yuklanmadi.';

    const code = mediaEl.error?.code;
    const src = mediaEl.currentSrc || mediaEl.src || '';

    if (code === MediaError.MEDIA_ERR_NETWORK) {
        return 'Tarmoq xatosi: media faylga ulanib bo‘lmadi.';
    }
    if (code === MediaError.MEDIA_ERR_DECODE) {
        return 'Codec xatosi: brauzer ushbu media formatini ocha olmadi.';
    }
    if (code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
        if (/^https?:\/\//i.test(src)) {
            return 'Media manbasi topilmadi (404) yoki qo‘llab-quvvatlanmaydi.';
        }
        return 'Media manbasi topilmadi yoki noto‘g‘ri yo‘l.';
    }
    return 'Media yuklanmadi yoki mavjud emas.';
}

function showVideoLoadError(message) {
    const overlayEl = document.getElementById('player-overlay-title');
    if (overlayEl) {
        overlayEl.textContent = message;
        overlayEl.hidden = false;
    }
    setPlayerPlayingState(false);
}

function getDownloadFilename(path) {
    const parts = String(path || '').split('/');
    return parts[parts.length - 1] || 'video.mp4';
}

function getLessonDisplayTitle(lesson) {
    if (!lesson) return '';
    if (lesson.sarlavhaToLiql) return lesson.sarlavha;
    return `${lesson.tartib}. ${lesson.sarlavha}`;
}

function getItemCategory(item) {
    return item?.kategoriya || item?.category || '';
}

function getCategories() {
    return videoData?.kategoriyalar?.length ? videoData.kategoriyalar : DEFAULT_CATEGORIES;
}

function getActiveLesson() {
    if (!videoData?.darslar?.length) return null;
    if (activeSelection.type === 'lesson' && activeLessonId) {
        return videoData.darslar.find(d => d.id === activeLessonId) || null;
    }
    return videoData.darslar.find(d => d.active) || videoData.darslar[0];
}

function getActiveFilm() {
    if (activeSelection.type !== 'film' || !videoData?.filmlar?.length) return null;
    return videoData.filmlar.find(f => f.id === activeSelection.id) || null;
}

function getActiveLessonIndex() {
    if (!videoData?.darslar?.length || activeSelection.type !== 'lesson' || !activeLessonId) return -1;
    return videoData.darslar.findIndex(d => d.id === activeLessonId);
}

function loadProgressMap() {
    try {
        return JSON.parse(localStorage.getItem(VIDEO_PROGRESS_KEY) || '{}');
    } catch {
        return {};
    }
}

function getProgressKey(type, id) {
    return `${type}:${id}`;
}

function saveItemProgress(type, id, currentTime, duration) {
    if (!id || !Number.isFinite(duration) || duration <= 0) return;
    const map = loadProgressMap();
    const key = getProgressKey(type, id);
    map[key] = {
        currentTime,
        duration,
        percent: Math.min(currentTime / duration, 1),
        updated: Date.now()
    };
    localStorage.setItem(VIDEO_PROGRESS_KEY, JSON.stringify(map));
}

function getItemProgress(type, id) {
    return loadProgressMap()[getProgressKey(type, id)] || null;
}

function saveLessonProgress(lessonId, currentTime, duration) {
    saveItemProgress('lesson', lessonId, currentTime, duration);
}

function getLessonProgress(lessonId) {
    return getItemProgress('lesson', lessonId);
}

function isItemCompleted(type, id) {
    const progress = getItemProgress(type, id);
    return progress && progress.percent >= 0.9;
}

function isLessonCompleted(lessonId) {
    return isItemCompleted('lesson', lessonId);
}

async function triggerVideoDownload(url, filename) {
    if (!url) return;

    try {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
    } catch (error) {
        console.error('Video yuklab olishda xatolik:', error);
        const fallback = document.createElement('a');
        fallback.href = url;
        fallback.download = filename;
        fallback.style.display = 'none';
        document.body.appendChild(fallback);
        fallback.click();
        fallback.remove();
    }
}

function formatVideoTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
    const total = Math.floor(seconds);
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function buildCatalogItems() {
    if (!videoData) return [];

    const items = [];
    const kurs = videoData.kurs;

    if (kurs) {
        items.push({
            key: 'kurs',
            type: 'kurs',
            id: kurs.id || 'kurs',
            kategoriya: getItemCategory(kurs) || 'hayoti-ijodi',
            sarlavha: kurs.sarlavha || "G'afur G'ulom hayoti va ijodi",
            tavsif: kurs.tavsif || '',
            thumbnail: kurs.thumbnail,
            videoUrl: kurs.videoUrl,
            downloadUrl: kurs.downloadUrl,
            davomiylik: kurs.totalTime || kurs.davomiylik || '—',
            mavzu: kurs.mavzu || 'Hayoti va ijodi'
        });
    }

    (videoData.darslar || []).forEach(lesson => {
        if (!lesson.videoUrl) return;

        items.push({
            key: `lesson-${lesson.id}`,
            type: 'lesson',
            id: lesson.id,
            kategoriya: getItemCategory(lesson),
            sarlavha: getLessonDisplayTitle(lesson),
            tavsif: lesson.tavsif || '',
            thumbnail: lesson.thumbnail || kurs?.thumbnail,
            videoUrl: lesson.videoUrl,
            downloadUrl: lesson.downloadUrl,
            davomiylik: lesson.davomiylik || '—',
            mavzu: lesson.mavzu || '—',
            lessonRef: lesson
        });
    });

    (videoData.filmlar || []).forEach(film => {
        items.push({
            key: `film-${film.id}`,
            type: 'film',
            id: film.id,
            kategoriya: getItemCategory(film) || 'filmlar',
            sarlavha: film.sarlavha || film.title || 'Film',
            tavsif: film.tavsif || film.description || '',
            thumbnail: film.thumbnail,
            videoUrl: film.videoUrl,
            downloadUrl: film.downloadUrl,
            davomiylik: film.davomiylik || film.yil || '—',
            asar: film.asar || film.sourceWork || '',
            janr: film.janr || 'Badiiy film',
            yil: film.yil || null
        });
    });

    items.forEach(item => {
        if (!item.kategoriya) {
            console.warn(
                `[Multimedia] "${item.sarlavha}" (key: ${item.key}) uchun kategoriya ko'rsatilmagan. ` +
                'U "Barchasi" bo\'limida ko\'rsatiladi. JSON ga "kategoriya" maydonini qo\'shing.'
            );
            item.kategoriya = 'uncategorized';
        }
    });

    return items;
}

function isItemActive(item) {
    if (item.type === 'kurs') return activeSelection.type === 'kurs';
    if (item.type === 'lesson') return activeSelection.type === 'lesson' && activeSelection.id === item.id;
    if (item.type === 'film') return activeSelection.type === 'film' && activeSelection.id === item.id;
    return false;
}

function getActiveProgressKey() {
    if (activeSelection.type === 'kurs') return getProgressKey('kurs', videoData?.kurs?.id || 'kurs');
    if (activeSelection.type === 'lesson') return getProgressKey('lesson', activeLessonId);
    if (activeSelection.type === 'film') return getProgressKey('film', activeSelection.id);
    return null;
}

async function loadVideoData() {
    try {
        const response = await fetch((window.platformUrl || function (r) { return r; })('data/videolar.json?v=20260819'));
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        videoData = await response.json();

        activeSelection = { type: 'kurs', id: videoData.kurs?.id || 'kurs' };
        const firstLesson = videoData.darslar?.[0];
        activeLessonId = firstLesson ? firstLesson.id : null;

        if (videoData.darslar?.length) {
            videoData.darslar.forEach(d => {
                d.active = false;
            });
        }

        renderCategoryNav();
        renderCatalog();
        renderLesson();
        renderMaterials();
        renderCommentsTab();
    } catch (error) {
        console.error('Video ma\'lumotlarini yuklashda xatolik:', error);
    }
}

function renderCategoryNav() {
    const nav = document.getElementById('category-nav');
    if (!nav) return;

    const categories = getCategories();
    const filters = [
        { slug: 'all', label: 'Barchasi' },
        ...categories.map(cat => ({ slug: cat.slug, label: cat.nom }))
    ];

    nav.innerHTML = filters.map(filter => `
        <button
            type="button"
            class="video-category-nav__btn${activeCategoryFilter === filter.slug ? ' is-active' : ''}"
            data-category="${filter.slug}"
            aria-pressed="${activeCategoryFilter === filter.slug ? 'true' : 'false'}">
            ${filter.label}
        </button>
    `).join('');

    nav.querySelectorAll('.video-category-nav__btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const slug = this.getAttribute('data-category');
            setCategoryFilter(slug);
        });
    });
}

function setCategoryFilter(slug) {
    activeCategoryFilter = slug || 'all';
    renderCategoryNav();
    renderCatalog();

    if (activeCategoryFilter !== 'all') {
        const section = document.querySelector(`.video-category-section[data-category="${activeCategoryFilter}"]`);
        section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function renderCatalog() {
    const container = document.getElementById('video-catalog');
    if (!container) return;

    const categories = getCategories();
    const items = buildCatalogItems();
    const visibleCategories = activeCategoryFilter === 'all'
        ? categories
        : categories.filter(cat => cat.slug === activeCategoryFilter);

    container.innerHTML = visibleCategories.map(category => {
        const categoryItems = items.filter(item => item.kategoriya === category.slug);
        const cardsHtml = categoryItems.length
            ? `<div class="video-card-grid">${categoryItems.map(item => renderCatalogCard(item)).join('')}</div>`
            : `<p class="video-category-section__empty">${category.slug === 'filmlar'
                ? 'Hozircha bu bo\'limda filmlar qo\'shilmagan. Yangi film qo\'shish uchun videolar.json faylidagi "filmlar" massiviga yozing.'
                : 'Bu kategoriyada videolar tez orada qo\'shiladi.'}</p>`;

        return `
            <section class="video-category-section" data-category="${category.slug}" aria-labelledby="category-title-${category.slug}">
                <header class="video-category-section__head">
                    <span class="video-category-section__num">${category.tartib}</span>
                    <div class="video-category-section__text">
                        <h2 class="video-category-section__title" id="category-title-${category.slug}">${category.nom}</h2>
                        <p class="video-category-section__desc">${category.tavsif}</p>
                    </div>
                </header>
                ${cardsHtml}
            </section>
        `;
    }).join('');

    if (activeCategoryFilter === 'all') {
        const uncategorized = items.filter(item => item.kategoriya === 'uncategorized');
        if (uncategorized.length) {
            container.innerHTML += `
                <section class="video-category-section video-category-section--uncategorized" data-category="uncategorized">
                    <header class="video-category-section__head">
                        <span class="video-category-section__num">—</span>
                        <div class="video-category-section__text">
                            <h2 class="video-category-section__title">Kategoriyasi aniqlanmagan</h2>
                            <p class="video-category-section__desc">Quyidagi videolar uchun JSON faylida "kategoriya" maydoni ko'rsatilmagan.</p>
                        </div>
                    </header>
                    <div class="video-card-grid">
                        ${uncategorized.map(item => renderCatalogCard(item)).join('')}
                    </div>
                </section>
            `;
        }
    }

    container.querySelectorAll('[data-catalog-key]').forEach(card => {
        card.querySelector('[data-action="play"]')?.addEventListener('click', function (event) {
            event.preventDefault();
            selectCatalogItem(this.closest('[data-catalog-key]').getAttribute('data-catalog-key'));
        });

        card.querySelector('[data-action="download"]')?.addEventListener('click', function (event) {
            event.preventDefault();
            const key = this.closest('[data-catalog-key]').getAttribute('data-catalog-key');
            const item = buildCatalogItems().find(i => i.key === key);
            if (!item?.downloadUrl) return;
            triggerVideoDownload(resolveAssetPath(item.downloadUrl), getDownloadFilename(item.downloadUrl));
        });
    });
}

function renderCatalogCard(item) {
    const isActive = isItemActive(item);
    const isFilm = item.type === 'film';
    const progress = getItemProgress(item.type === 'kurs' ? 'kurs' : item.type, item.type === 'kurs' ? (videoData?.kurs?.id || 'kurs') : item.id);
    const progressWidth = progress ? Math.round(progress.percent * 100) : 0;
    const thumb = resolveAssetPath((item.thumbnail || '').replace(/^\.\.\//, ''));
    const primaryLabel = isFilm ? 'Tomosha qilish' : 'Davom ettirish';
    const cardClass = `video-card${isFilm ? ' video-card--film' : ''}${isActive ? ' is-active' : ''}`;

    const metaHtml = isFilm
        ? `
            ${item.asar ? `<p class="video-card__meta"><span>Asar:</span> «${item.asar}»</p>` : ''}
            <p class="video-card__meta"><span>Janr:</span> ${item.janr || 'Badiiy film'}</p>
            ${item.yil ? `<p class="video-card__meta"><span>Yil:</span> ${item.yil}</p>` : ''}
        `
        : `
            ${item.davomiylik && item.davomiylik !== '—' ? `<p class="video-card__meta"><span>Davomiylik:</span> ${item.davomiylik}</p>` : ''}
            ${item.mavzu && item.mavzu !== '—' ? `<p class="video-card__meta"><span>Mavzu:</span> ${item.mavzu}</p>` : ''}
        `;

    const downloadHtml = !isFilm && item.downloadUrl
        ? `<button type="button" class="video-btn video-btn--secondary video-card__btn" data-action="download">Yuklab olish</button>`
        : '';

    return `
        <article class="${cardClass}" data-catalog-key="${item.key}" aria-current="${isActive ? 'true' : 'false'}">
            <div class="video-card__preview">
                ${thumb
                    ? `<img src="${thumb}" alt="" class="video-card__thumb" loading="lazy">`
                    : `<div class="video-card__thumb video-card__thumb--placeholder" aria-hidden="true"></div>`}
                ${isFilm ? '<span class="video-card__badge">Film</span>' : ''}
                ${isActive ? '<span class="video-card__playing">Hoziroq ko\'rilmoqda</span>' : ''}
                <span class="video-card__progress" aria-hidden="true"><span style="width:${progressWidth}%"></span></span>
            </div>
            <div class="video-card__body">
                <h3 class="video-card__title">${item.sarlavha}</h3>
                ${item.tavsif ? `<p class="video-card__desc">${item.tavsif}</p>` : ''}
                ${metaHtml}
                <div class="video-card__actions">
                    <button type="button" class="video-btn video-btn--primary video-card__btn" data-action="play">${primaryLabel}</button>
                    ${downloadHtml}
                </div>
            </div>
        </article>
    `;
}

function selectCatalogItem(key) {
    const item = buildCatalogItems().find(i => i.key === key);
    if (!item) return;

    if (item.type === 'kurs') {
        selectKurs();
    } else if (item.type === 'lesson') {
        selectLesson(item.id);
    } else if (item.type === 'film') {
        selectFilm(item.id);
    }
}

function selectKurs() {
    pauseCourseVideo();
    activeSelection = { type: 'kurs', id: videoData?.kurs?.id || 'kurs' };
    if (videoData?.darslar) {
        videoData.darslar.forEach(lesson => {
            lesson.active = false;
        });
    }
    renderLesson();
    document.getElementById('video-player')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function selectLesson(id) {
    if (!videoData?.darslar) return;

    pauseCourseVideo();
    activeSelection = { type: 'lesson', id };
    activeLessonId = id;
    videoData.darslar.forEach(lesson => {
        lesson.active = lesson.id === id;
    });
    renderLesson();
    document.getElementById('video-player')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function selectFilm(id) {
    if (!videoData?.filmlar) return;

    pauseCourseVideo();
    activeSelection = { type: 'film', id };
    if (videoData.darslar) {
        videoData.darslar.forEach(lesson => {
            lesson.active = false;
        });
    }
    renderLesson();
    document.getElementById('video-player')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderLesson() {
    if (!videoData) return;

    const kurs = videoData.kurs || {};
    const lesson = getActiveLesson();
    const film = getActiveFilm();
    const titleEl = document.getElementById('lesson-title');
    const descEl = document.getElementById('lesson-desc');
    const overlayEl = document.getElementById('player-overlay-title');
    const badgeEl = document.getElementById('lesson-badge');
    const durationEl = document.getElementById('lesson-duration');
    const topicEl = document.getElementById('lesson-topic');
    const nowEl = document.getElementById('lesson-now');

    let displayTitle = kurs.sarlavha || 'Video dars';
    let displayDesc = kurs.tavsif || '';
    let displayDuration = kurs.totalTime || '—';
    let displayTopic = kurs.mavzu || '—';
    let videoUrl = kurs.videoUrl;
    let downloadUrl = kurs.downloadUrl;
    let poster = kurs.thumbnail;
    let progressType = 'kurs';
    let progressId = kurs.id || 'kurs';
    let badgeText = 'Video dars';

    if (activeSelection.type === 'film' && film) {
        displayTitle = film.sarlavha || film.title || 'Film';
        displayDesc = film.tavsif || film.description || '';
        displayDuration = film.yil ? String(film.yil) : (film.davomiylik || '—');
        displayTopic = film.asar ? `Asar: «${film.asar}»` : (film.janr || 'Badiiy film');
        videoUrl = film.videoUrl;
        downloadUrl = film.downloadUrl;
        poster = film.thumbnail;
        progressType = 'film';
        progressId = film.id;
        badgeText = 'Film';
    } else if (activeSelection.type === 'lesson' && lesson) {
        const usesLessonVideo = Boolean(lesson.videoUrl);
        displayTitle = getLessonDisplayTitle(lesson);
        displayDesc = lesson.tavsif || (usesLessonVideo ? '' : kurs.tavsif || '');
        displayDuration = lesson.davomiylik || (usesLessonVideo ? '—' : (kurs.totalTime || '—'));
        displayTopic = lesson.mavzu || kurs.mavzu || '—';
        videoUrl = usesLessonVideo ? lesson.videoUrl : kurs.videoUrl;
        downloadUrl = usesLessonVideo ? lesson.downloadUrl : kurs.downloadUrl;
        poster = usesLessonVideo ? lesson.thumbnail : kurs.thumbnail;
        progressType = 'lesson';
        progressId = lesson.id;
        badgeText = `Dars ${lesson.tartib}`;
    } else {
        badgeText = 'Asosiy dars';
    }

    if (titleEl) titleEl.textContent = displayTitle;
    if (descEl) descEl.textContent = displayDesc;
    if (overlayEl) overlayEl.textContent = displayTitle;
    if (badgeEl) badgeEl.textContent = badgeText;
    if (durationEl) durationEl.textContent = displayDuration;
    if (topicEl) topicEl.textContent = displayTopic;
    if (nowEl) nowEl.hidden = false;

    const resolvedVideoUrl = resolveAssetPath(videoUrl);
    const resolvedPoster = resolveAssetPath((poster || '').replace(/^\.\.\//, ''));
    const youtubeId = getYouTubeVideoId(videoUrl);

    if (setYouTubePlayerMode(youtubeId, displayTitle)) {
        // YouTube player uses its own controls; duration may be unavailable in JSON.
    } else if (courseVideo && resolvedVideoUrl) {
        const saved = getItemProgress(progressType, progressId);
        courseVideo.src = resolvedVideoUrl;
        if (resolvedPoster) courseVideo.poster = resolvedPoster;

        const applySavedTime = () => {
            if (saved?.currentTime && Number.isFinite(courseVideo.duration)) {
                courseVideo.currentTime = Math.min(saved.currentTime, courseVideo.duration);
            }
            updatePlayerProgress();
        };

        if (courseVideo.readyState >= 1) {
            applySavedTime();
        } else {
            courseVideo.addEventListener('loadedmetadata', applySavedTime, { once: true });
        }
    }

    const continueBtn = document.getElementById('continue-btn');
    const downloadBtn = document.getElementById('download-btn');
    const resolvedDownloadUrl = resolveAssetPath(downloadUrl);
    const continueLabel = activeSelection.type === 'film' ? 'Tomosha qilish' : 'Darsni davom ettirish';

    if (continueBtn) {
        continueBtn.textContent = continueLabel;
        continueBtn.href = '#';
        continueBtn.onclick = function (event) {
            event.preventDefault();
            document.getElementById('video-player')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            playCourseVideo();
        };
    }

    if (downloadBtn) {
        if (resolvedDownloadUrl && activeSelection.type !== 'film' && !youtubeId) {
            downloadBtn.hidden = false;
            const downloadFilename = getDownloadFilename(downloadUrl);
            downloadBtn.href = '#';
            downloadBtn.onclick = function (event) {
                event.preventDefault();
                triggerVideoDownload(resolvedDownloadUrl, downloadFilename);
            };
        } else {
            downloadBtn.hidden = true;
        }
    }

    updateLessonNavigation();
    renderCatalog();
}

function setPlayerPlayingState(isPlaying) {
    const player = document.getElementById('video-player');
    const playBtn = document.getElementById('player-play');
    if (player) player.classList.toggle('is-playing', isPlaying);
    if (playBtn) {
        playBtn.setAttribute('aria-label', isPlaying ? 'Pauza' : 'Ijro etish');
        playBtn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
    }
}

function playCourseVideo() {
    if (activeYouTubeId) {
        setYouTubePlayerMode(activeYouTubeId, document.getElementById('lesson-title')?.textContent || 'Video dars', true);
        return;
    }

    if (!courseVideo) return;
    courseVideo.play().then(() => {
        setPlayerPlayingState(true);
    }).catch(() => {
        setPlayerPlayingState(false);
    });
}

function pauseCourseVideo() {
    if (activeYouTubeId) {
        setPlayerPlayingState(false);
        return;
    }

    if (!courseVideo) return;
    courseVideo.pause();
    setPlayerPlayingState(false);
}

function toggleCourseVideo() {
    if (activeYouTubeId) {
        playCourseVideo();
        return;
    }

    if (!courseVideo) return;
    if (courseVideo.paused) {
        playCourseVideo();
    } else {
        pauseCourseVideo();
    }
}

function updatePlayerProgress() {
    if (activeYouTubeId || !courseVideo) return;

    const currentEl = document.getElementById('player-current');
    const totalEl = document.getElementById('player-total');
    const progressEl = document.getElementById('player-progress-fill');
    const progressBar = document.querySelector('.video-player__progress');

    const duration = courseVideo.duration;
    const current = courseVideo.currentTime;
    const percent = duration > 0 ? (current / duration) * 100 : 0;

    if (currentEl) currentEl.textContent = formatVideoTime(current);
    if (totalEl) totalEl.textContent = formatVideoTime(duration);
    if (progressEl) progressEl.style.width = `${percent}%`;
    if (progressBar) progressBar.setAttribute('aria-valuenow', String(Math.round(percent)));

    if (Number.isFinite(duration) && duration > 0) {
        if (activeSelection.type === 'kurs') {
            saveItemProgress('kurs', videoData?.kurs?.id || 'kurs', current, duration);
        } else if (activeSelection.type === 'lesson' && activeLessonId) {
            saveLessonProgress(activeLessonId, current, duration);
        } else if (activeSelection.type === 'film' && activeSelection.id) {
            saveItemProgress('film', activeSelection.id, current, duration);
        }
    }
}

function seekCourseVideo(event) {
    if (!courseVideo || !Number.isFinite(courseVideo.duration)) return;

    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    courseVideo.currentTime = ratio * courseVideo.duration;
    updatePlayerProgress();
}

function renderMaterials() {
    const container = document.getElementById('materials-list');
    if (!container) return;

    const sections = [
        { title: 'Dars materiallari', note: 'Tez orada qo\'shiladi' },
        { title: 'Konspekt', note: 'Tez orada qo\'shiladi' },
        { title: 'Qo\'shimcha manbalar', note: 'Tez orada qo\'shiladi' },
        { title: 'Yuklab olish', note: 'Tez orada qo\'shiladi' }
    ];

    container.innerHTML = sections.map(section => `
        <section class="video-material-slot">
            <h4 class="video-material-slot__title">${section.title}</h4>
            <p class="video-material-slot__note">${section.note}</p>
        </section>
    `).join('');
}

function renderCommentsTab() {
    const tab = document.getElementById('tab-comments');
    if (tab) {
        const count = videoData?.izohlar_soni;
        tab.textContent = Number.isFinite(count) && count > 0 ? `Izohlar (${count})` : 'Izohlar';
    }
}

function updateLessonNavigation() {
    const prevBtn = document.getElementById('prev-lesson');
    const nextBtn = document.getElementById('next-lesson');
    const index = getActiveLessonIndex();
    const lastIndex = (videoData?.darslar?.length || 0) - 1;

    if (prevBtn) prevBtn.disabled = activeSelection.type !== 'lesson' || index <= 0;
    if (nextBtn) nextBtn.disabled = activeSelection.type !== 'lesson' || index < 0 || index >= lastIndex;
}

function initLessonNavigation() {
    const prevBtn = document.getElementById('prev-lesson');
    const nextBtn = document.getElementById('next-lesson');

    prevBtn?.addEventListener('click', function () {
        const index = getActiveLessonIndex();
        if (index > 0) selectLesson(videoData.darslar[index - 1].id);
    });

    nextBtn?.addEventListener('click', function () {
        const index = getActiveLessonIndex();
        if (index >= 0 && index < videoData.darslar.length - 1) {
            selectLesson(videoData.darslar[index + 1].id);
        }
    });
}

function initVideoTabs() {
    const tabs = document.querySelectorAll('.video-tabs .tab-btn');
    const panels = document.querySelectorAll('.video-tab-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const target = this.getAttribute('data-tab');

            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            panels.forEach(p => p.classList.remove('active'));

            this.classList.add('active');
            this.setAttribute('aria-selected', 'true');
            const panel = document.querySelector(`.video-tab-panel[data-tab="${target}"]`);
            if (panel) panel.classList.add('active');
        });
    });
}

function initPlayerControls() {
    const playBtn = document.getElementById('player-play');
    const player = document.getElementById('video-player');
    const progressBar = document.querySelector('.video-player__progress');
    const fullscreenBtn = document.querySelector('.video-player__tool[aria-label="To\'liq ekran"]');

    if (!playBtn || !player || !courseVideo) return;

    playBtn.addEventListener('click', toggleCourseVideo);

    courseVideo.addEventListener('play', () => setPlayerPlayingState(true));
    courseVideo.addEventListener('pause', () => setPlayerPlayingState(false));
    courseVideo.addEventListener('ended', () => {
        setPlayerPlayingState(false);
        if (Number.isFinite(courseVideo.duration)) {
            if (activeSelection.type === 'kurs') {
                saveItemProgress('kurs', videoData?.kurs?.id || 'kurs', courseVideo.duration, courseVideo.duration);
            } else if (activeSelection.type === 'lesson' && activeLessonId) {
                saveLessonProgress(activeLessonId, courseVideo.duration, courseVideo.duration);
            } else if (activeSelection.type === 'film' && activeSelection.id) {
                saveItemProgress('film', activeSelection.id, courseVideo.duration, courseVideo.duration);
            }
            renderCatalog();
        }
    });
    courseVideo.addEventListener('timeupdate', updatePlayerProgress);
    courseVideo.addEventListener('loadedmetadata', updatePlayerProgress);
    courseVideo.addEventListener('error', () => {
        const message = getMediaErrorMessage(courseVideo);
        console.warn('Video yuklanmadi:', courseVideo.currentSrc || courseVideo.src, message);
        showVideoLoadError(message);
    });

    if (progressBar) {
        progressBar.addEventListener('click', seekCourseVideo);
    }

    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', function () {
            const target = courseVideo.requestFullscreen
                ? courseVideo
                : (player.requestFullscreen ? player : null);
            if (target && target.requestFullscreen) {
                target.requestFullscreen().catch(() => {});
            }
        });
    }
}
