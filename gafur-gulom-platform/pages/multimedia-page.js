// ===================================
// Video darslar sahifasi
// ===================================

let videoData = null;
let activeLessonId = null;

document.addEventListener('DOMContentLoaded', async function () {
    await loadVideoData();
    initVideoTabs();
    initPlaylist();
    initPlayerControls();
});

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
    const thumbEl = document.getElementById('player-thumb');
    const currentEl = document.getElementById('player-current');
    const totalEl = document.getElementById('player-total');
    const progressEl = document.getElementById('player-progress-fill');

    const displayTitle = kurs.sarlavha;

    if (titleEl) titleEl.textContent = displayTitle;
    if (descEl) descEl.textContent = kurs.tavsif;
    if (overlayEl) overlayEl.textContent = displayTitle;
    if (thumbEl && kurs.thumbnail) thumbEl.src = kurs.thumbnail;
    if (currentEl) currentEl.textContent = kurs.currentTime;
    if (totalEl) totalEl.textContent = kurs.totalTime;
    if (progressEl) progressEl.style.width = `${Math.round((kurs.progress || 0) * 100)}%`;

    const continueBtn = document.getElementById('continue-btn');
    const downloadBtn = document.getElementById('download-btn');
    if (continueBtn && kurs.videoUrl) continueBtn.href = kurs.videoUrl;
    if (downloadBtn && kurs.downloadUrl) downloadBtn.href = kurs.downloadUrl;
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
    if (!playBtn || !player) return;

    playBtn.addEventListener('click', function () {
        const isPlaying = player.classList.toggle('is-playing');
        playBtn.setAttribute('aria-label', isPlaying ? 'Pauza' : 'Ijro etish');
        playBtn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
    });
}
