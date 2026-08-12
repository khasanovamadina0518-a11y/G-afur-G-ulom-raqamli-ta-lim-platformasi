// ===================================
// Video darslar sahifasi
// ===================================

let videoData = null;
let activeLessonId = null;
let courseVideo = null;

document.addEventListener('DOMContentLoaded', async function () {
    courseVideo = document.getElementById('course-video');
    await loadVideoData();
    initVideoTabs();
    initPlaylist();
    initPlayerControls();
});

function resolveAssetPath(path) {
    if (!path || path === '#') return '';
    return (window.platformUrl || function (r) { return r; })(path);
}

function formatVideoTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
    const total = Math.floor(seconds);
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

async function loadVideoData() {
    try {
        const response = await fetch((window.platformUrl || function (r) { return r; })('data/videolar.json'));
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        videoData = await response.json();
        renderLesson();
        renderMaterials();
        renderCommentsTab();
    } catch (error) {
        console.error('Video ma\'lumotlarini yuklashda xatolik:', error);
    }
}

function renderLesson() {
    if (!videoData || !videoData.kurs) return;

    const kurs = videoData.kurs;
    const activeLesson = videoData.darslar.find(d => d.active) || videoData.darslar[0];
    activeLessonId = activeLesson ? activeLesson.id : null;

    const titleEl = document.getElementById('lesson-title');
    const descEl = document.getElementById('lesson-desc');
    const overlayEl = document.getElementById('player-overlay-title');
    const currentEl = document.getElementById('player-current');
    const totalEl = document.getElementById('player-total');
    const progressEl = document.getElementById('player-progress-fill');
    const progressBar = document.querySelector('.video-player__progress');

    const displayTitle = kurs.sarlavha;
    const videoUrl = resolveAssetPath(kurs.videoUrl);

    if (titleEl) titleEl.textContent = displayTitle;
    if (descEl) descEl.textContent = kurs.tavsif;
    if (overlayEl) overlayEl.textContent = displayTitle;

    if (courseVideo && videoUrl) {
        courseVideo.src = videoUrl;
        if (kurs.thumbnail) {
            courseVideo.poster = resolveAssetPath(kurs.thumbnail.replace(/^\.\.\//, ''));
        }
    }

    if (currentEl) currentEl.textContent = kurs.currentTime || '00:00';
    if (totalEl) totalEl.textContent = kurs.totalTime || '00:00';
    if (progressEl) progressEl.style.width = `${Math.round((kurs.progress || 0) * 100)}%`;
    if (progressBar) progressBar.setAttribute('aria-valuenow', String(Math.round((kurs.progress || 0) * 100)));

    const continueBtn = document.getElementById('continue-btn');
    const downloadBtn = document.getElementById('download-btn');

    if (continueBtn) {
        continueBtn.href = videoUrl || '#';
        continueBtn.onclick = function (event) {
            event.preventDefault();
            const player = document.getElementById('video-player');
            if (player) {
                player.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            playCourseVideo();
        };
    }

    if (downloadBtn && kurs.downloadUrl) {
        downloadBtn.href = resolveAssetPath(kurs.downloadUrl);
        downloadBtn.setAttribute('download', '');
    }
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
    if (!courseVideo) return;
    courseVideo.play().then(() => {
        setPlayerPlayingState(true);
    }).catch(() => {
        setPlayerPlayingState(false);
    });
}

function pauseCourseVideo() {
    if (!courseVideo) return;
    courseVideo.pause();
    setPlayerPlayingState(false);
}

function toggleCourseVideo() {
    if (!courseVideo) return;
    if (courseVideo.paused) {
        playCourseVideo();
    } else {
        pauseCourseVideo();
    }
}

function updatePlayerProgress() {
    if (!courseVideo) return;

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
    const list = document.getElementById('materials-list');
    if (!list || !videoData || !videoData.materiallar) return;

    list.innerHTML = videoData.materiallar.map(item => `
        <li class="video-material">
            <div class="video-material__icon" aria-hidden="true">${getMaterialIcon(item.tur)}</div>
            <div class="video-material__body">
                <span class="video-material__title">${item.sarlavha}</span>
                <span class="video-material__meta">${item.hajm}</span>
            </div>
            <a href="#" class="video-material__link" aria-label="${item.sarlavha}ni yuklab olish">Yuklab olish</a>
        </li>
    `).join('');
}

function getMaterialIcon(type) {
    const icons = { pdf: '📄', doc: '📝', ppt: '📊' };
    return icons[type] || '📎';
}

function renderCommentsTab() {
    const tab = document.getElementById('tab-comments');
    if (tab && videoData) {
        tab.textContent = `Izohlar (${videoData.izohlar_soni || 0})`;
    }
}

function initPlaylist() {
    const list = document.getElementById('playlist');
    if (!list || !videoData) return;

    list.innerHTML = videoData.darslar.map(lesson => `
        <button
            type="button"
            class="video-playlist__item${lesson.active ? ' is-active' : ''}"
            data-lesson-id="${lesson.id}"
            aria-current="${lesson.active ? 'true' : 'false'}">
            <span class="video-playlist__index">${lesson.tartib}.</span>
            <span class="video-playlist__title">${lesson.sarlavha}</span>
            <span class="video-playlist__duration">${lesson.davomiylik}</span>
        </button>
    `).join('');

    list.querySelectorAll('.video-playlist__item').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = parseInt(this.getAttribute('data-lesson-id'), 10);
            selectLesson(id);
        });
    });
}

function selectLesson(id) {
    if (!videoData) return;

    videoData.darslar.forEach(lesson => {
        lesson.active = lesson.id === id;
    });
    activeLessonId = id;
    initPlaylist();
}

function initVideoTabs() {
    const tabs = document.querySelectorAll('.video-tabs .tab-btn');
    const panels = document.querySelectorAll('.video-tab-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const target = this.getAttribute('data-tab');

            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            this.classList.add('active');
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
    courseVideo.addEventListener('ended', () => setPlayerPlayingState(false));
    courseVideo.addEventListener('timeupdate', updatePlayerProgress);
    courseVideo.addEventListener('loadedmetadata', updatePlayerProgress);

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
