// ===================================
// Ta'lim Resurslari — JavaScript (Phase 9)
// IA + functionality preserved
// ===================================

const PROGRESS_KEY = 'talim-progress';
const CUSTOM_QUESTIONS_KEY = 'gafurGulomCustomQuestions';

let quizData = [];
let baseQuizData = [];
let currentQuiz = [];
let currentQuestionIndex = 0;
let score = 0;
let wrongAnswers = [];
let timerInterval = null;
let timeLeft = 60;
let selectedDifficulty = 'oson';
let selectedQuizClass = '6';
let userName = '';
let activeClass = '6';

const MODULE_CLASSES = ['6', '8'];

const learningPath = [
    { title: "G'afur G'ulom hayoti bilan tanishish", detail: '5-sinf — biografiya va davr' },
    { title: "'Bahor' she'ri tahlili", detail: '5-sinf — tabiat obrazlari' },
    { title: "'Shum bola' romani bilan tanishish", detail: '8-sinf — roman tahlili' },
    { title: 'G\'afur G\'ulom dostonlari', detail: '9-sinf — doston janri' },
    { title: 'Adabiyotdagi o\'rni va merosi', detail: '10-sinf — umumiy xulosa' }
];

const downloadableMaterials = [
    { title: 'Dars rejasi shabloni', meta: 'PDF · 120 KB' },
    { title: 'She\'rlar to\'plami', meta: 'PDF · 340 KB' },
    { title: 'Viktorina savollari', meta: 'JSON · quiz.json' },
    { title: 'Amaliy topshiriqlar', meta: 'DOCX · 85 KB' }
];

const practicalAssignments = [
    'G\'afur G\'ulom hayotidan 5 ta muhim voqea yozing',
    'Sevimli she\'rni o\'qing va obrazlarini tahlil qiling',
    'Vatan mavzusidagi she\'r yarating (8 qator)',
    'Viktorinada kamida 70% natija oling'
];

// ===================================
// DARS REJALARI
// ===================================

const darsRejalari = {
    5: [
        {
            sarlavha: "G'afur G'ulom hayoti bilan tanishish",
            maqsad: "O'quvchilar G'afur G'ulomning tug'ilgan joyi va davri haqida bilim oladi",
            vaqt: "45 daqiqa",
            mavzular: ["Hayot tarixi", "Tug'ilgan joy", "Oila muhiti", "Bolalik davri"]
        },
        {
            sarlavha: "'Bahor' she'ri tahlili",
            maqsad: "She'rni o'qish va tabiat tasvirini tushunish",
            vaqt: "45 daqiqa",
            mavzular: ["She'rni o'qish", "Obrazlar tahlili", "Til xususiyatlari", "Yodlash"]
        }
    ],
    6: [],
    7: [
        {
            sarlavha: "G'afur G'ulomning Vatan mavzuidagi she'rlari",
            maqsad: "Vatanparvarlik g'oyasi va uning ifodasini tushunish",
            vaqt: "45 daqiqa",
            mavzular: ["Vatan mavzusi", "Vatanparvarlik", "She'rlar tahlili", "Ahamiyati"]
        },
        {
            sarlavha: "'Yomg'ir' she'ri chuqur tahlili",
            maqsad: "Tabiat va insonning bog'liqligini anglash",
            vaqt: "45 daqiqa",
            mavzular: ["Obrazli tizim", "Ramzlar", "Badiiy vositalar", "Taqqoslash"]
        }
    ],
    8: [],
    9: [
        {
            sarlavha: "G'afur G'ulom dostonlari",
            maqsad: "Dostonlar bilan tanishish va tahlil qilish",
            vaqt: "45 daqiqa",
            mavzular: ["Doston janri", "'Yulduz' dostoni", "Tarixiy asos", "Badiiylik"]
        },
        {
            sarlavha: "Urush davridagi ijodi",
            maqsad: "Urush yillaridagi asarlarning o'ziga xosligi",
            vaqt: "45 daqiqa",
            mavzular: ["Urush mavzusi", "Vatanparvarlik", "Qahramonlik", "Frontga xitob"]
        }
    ],
    10: [
        {
            sarlavha: "G'afur G'ulom she'riyatining badiiy xususiyatlari",
            maqsad: "She'riy uslub va badiiy vositalarni tahlil qilish",
            vaqt: "45 daqiqa",
            mavzular: ["Uslub xususiyatlari", "Badiiy vositalar", "Til boyligi", "Taqqoslash"]
        },
        {
            sarlavha: "Adabiyotdagi o'rni va merosi",
            maqsad: "O'zbek adabiyotiga qo'shgan hissasini baholash",
            vaqt: "45 daqiqa",
            mavzular: ["Adabiy meros", "Ta'siri", "Davom ettiruvchilar", "Zamonaviylik"]
        }
    ],
    11: [
        {
            sarlavha: "G'afur G'ulom ijodining davrlari",
            maqsad: "Ijod bosqichlarini tahlil qilish va farqlash",
            vaqt: "45 daqiqa",
            mavzular: ["Dastlabki davr", "Voyaga yetish", "Kambag'allik", "Oxirgi asarlar"]
        },
        {
            sarlavha: "G'afur G'ulom va jahon adabiyoti",
            maqsad: "Jahon adabiyoti bilan aloqalarni o'rganish",
            vaqt: "45 daqiqa",
            mavzular: ["Tarjimalar", "Ta'sirlar", "Taqqoslash", "Jahon miqyosi"]
        }
    ]
};

const oquvMateriallari = {
    6: [
        {
            sarlavha: "G'afur G'ulom",
            sinf: '6-sinf',
            qisqa: "6-sinf darsligida G'afur G'ulomga oid materiallar",
            pdf: 'assets/pdf/talim/6-sinf-gafur-gulom.pdf'
        }
    ],
    8: [
        {
            sarlavha: "G'afur G'ulom",
            sinf: '8-sinf',
            qisqa: "8-sinf darsligida G'afur G'ulomga oid materiallar",
            pdf: 'assets/pdf/talim/8-sinf-gafur-gulom.pdf'
        }
    ]
};

// ===================================
// HELPERS
// ===================================

const platformTranslate = window.PlatformI18n?.t || null;

const uiT = (key, fallback, vars) => {
    return platformTranslate ? platformTranslate(key, fallback, vars) : (fallback ?? key);
};

function refreshTalimUI() {
    renderHeroStats();
    if (activeTab === 'dars') loadLessons();
    else if (activeTab === 'bank') loadSavolBanki();
    if (document.getElementById('quiz-question')?.style.display === 'block' && currentQuiz.length) {
        showQuestion();
    }
    window.PlatformI18n?.apply(document);
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function resolveAssetPath(path) {
    if (!path || path === '#') return '';
    return (window.platformUrl || function (r) { return r; })(path);
}

function getTotalLessons() {
    return MODULE_CLASSES.reduce((sum, cls) => sum + (oquvMateriallari[cls]?.length || 0), 0);
}

function filterQuestionsByDifficulty(pool, difficulty) {
    return pool.filter(q => q.daraja === difficulty || (difficulty === 'orta' && q.daraja === 'o\'rta'));
}

function filterQuestionsForQuiz(classNum) {
    return quizData.filter(q => q.sinf === 'umumiy' || String(q.sinf) === String(classNum));
}

function filterQuestionsForBank(classKey) {
    if (classKey === 'umumiy') {
        return quizData.filter(q => q.sinf === 'umumiy');
    }
    return quizData.filter(q => String(q.sinf) === String(classKey));
}

function getProgress() {
    try {
        const data = JSON.parse(localStorage.getItem(PROGRESS_KEY));
        if (data && typeof data === 'object') {
            return {
                completedLessons: Array.isArray(data.completedLessons) ? data.completedLessons : [],
                lastClass: data.lastClass || '6',
                lastLesson: data.lastLesson || '',
                quizBest: Number(data.quizBest) || 0
            };
        }
    } catch {
        /* localStorage xatosi — default qiymat */
    }
    return {
        completedLessons: [],
        lastClass: '6',
        lastLesson: '',
        quizBest: 0
    };
}

function saveProgress(data) {
    try {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
    } catch {
        /* localStorage xatosi — sahifa ishlashda davom etadi */
    }
}

function lessonKey(classNum, sarlavha) {
    return `${classNum}::${sarlavha}`;
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// ===================================
// PREMIUM SECTIONS
// ===================================

function renderHeroStats() {
    const el = document.getElementById('tl-hero-stats');
    if (!el) return;

    const classCount = MODULE_CLASSES.length;
    const lessonCount = getTotalLessons();
    const quizCount = quizData.length || '—';

    const chips = [
        { num: classCount, label: uiT('talimStatGrade', 'sinf'), icon: '🎓' },
        { num: lessonCount, label: uiT('talimStatsLessons', 'dars'), icon: '📚' },
        { num: quizCount, label: uiT('talimStatQuiz', 'viktorina savoli'), icon: '✦' }
    ];

    el.innerHTML = chips.map(chip => `
        <div class="tl-stat-chip">
            <span class="tl-stat-chip__icon" aria-hidden="true">${chip.icon}</span>
            <div class="tl-stat-chip__body">
                <span class="tl-stat-chip__num">${chip.num}</span>
                <span class="tl-stat-chip__label">${chip.label}</span>
            </div>
        </div>
    `).join('');
}

function renderCourseOverview() {
    const el = document.getElementById('tl-course-overview');
    if (!el) return;

    el.innerHTML = `
        <p class="tl-overview__text">
            Ushbu kurs G'afur G'ulom ijodini 6 va 8-sinflar uchun bosqichma-bosqich o'rgatadi.
            Dars rejalar, PDF materiallar, viktorina va savol banki o'qituvchi hamda o'quvchi uchun tayyorlangan.
        </p>
        <div class="tl-overview__meta">
            <span><strong>2</strong> sinf darajasi</span>
            <span><strong>${getTotalLessons()}</strong> dars rejasi</span>
            <span><strong>3</strong> bo'lim (Dars, Viktorina, Bank)</span>
        </div>
    `;
}

function renderLearningPath() {
    const el = document.getElementById('tl-learning-path');
    if (!el) return;

    el.innerHTML = learningPath.map((step, i) => `
        <li>
            <span class="tl-path-num">${i + 1}</span>
            <div>
                <strong>${escapeHtml(step.title)}</strong><br>
                <span style="color: var(--tl-muted); font-size: 0.8125rem;">${escapeHtml(step.detail)}</span>
            </div>
        </li>
    `).join('');
}

function renderMaterials() {
    const el = document.getElementById('tl-materials');
    if (!el) return;

    el.innerHTML = downloadableMaterials.map(m => `
        <div class="tl-material">
            <p class="tl-material__title">${escapeHtml(m.title)}</p>
            <p class="tl-material__meta">${escapeHtml(m.meta)}</p>
        </div>
    `).join('');
}

function renderAssignments() {
    const el = document.getElementById('tl-assignments');
    if (!el) return;

    el.innerHTML = practicalAssignments.map(a => `
        <li><span class="tl-path-num">✓</span><span>${escapeHtml(a)}</span></li>
    `).join('');
}

let activeTab = 'dars';

function switchTab(tabName) {
    activeTab = tabName;
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.tab === tabName);
    });
    document.querySelectorAll('.tab-content').forEach(c => {
        c.classList.toggle('active', c.dataset.tab === tabName);
    });

    if (tabName === 'bank') {
        loadSavolBanki();
    }
}

// ===================================
// TABS
// ===================================

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        switchTab(this.dataset.tab);
    });
});

// ===================================
// GRADE META
// ===================================

const GRADE_META = {
    6: {
        title: '6-sinf darslari',
        desc: "6-sinf o'quvchilari uchun G'afur G'ulom hayoti va ijodi bo'yicha dars materiallari.",
        theme: '6'
    },
    8: {
        title: '8-sinf darslari',
        desc: "8-sinf o'quvchilari uchun G'afur G'ulom hayoti va ijodi bo'yicha dars materiallari.",
        theme: '8'
    }
};

function renderLessonRow(classNum, lesson, index, progress) {
    const key = lessonKey(classNum, lesson.sarlavha);
    const isDone = progress.completedLessons.includes(key);
    const theme = GRADE_META[classNum]?.theme || '6';

    return `
        <article class="tl-lesson-row tl-lesson-row--${theme}" data-class="${escapeHtml(classNum)}" data-lesson="${escapeHtml(lesson.sarlavha)}">
            <div class="tl-lesson-row__num">${index + 1}</div>
            <div class="tl-lesson-row__body">
                <h3 class="tl-lesson-row__title">
                    ${escapeHtml(lesson.sarlavha)}
                    ${isDone ? '<span class="tl-lesson-row__done" aria-label="Tugallangan">✓</span>' : ''}
                </h3>
                <ul class="tl-lesson-row__meta">
                    <li><span class="tl-lesson-row__icon" aria-hidden="true">◎</span><span><strong>Maqsad:</strong> ${escapeHtml(lesson.maqsad)}</span></li>
                    <li><span class="tl-lesson-row__icon" aria-hidden="true">◷</span><span><strong>Vaqt:</strong> ${escapeHtml(lesson.vaqt)}</span></li>
                    <li><span class="tl-lesson-row__icon" aria-hidden="true">☰</span><span><strong>Mavzular:</strong> ${escapeHtml(lesson.mavzular.join(', '))}</span></li>
                </ul>
            </div>
            <button class="tl-lesson-row__btn tl-view-btn" type="button" data-action="view">Ko'rish →</button>
        </article>
    `;
}

function renderPdfMaterialCard(classNum, material) {
    const gradeLabel = `${classNum}-SINF`;

    return `
        <article class="tl-material-card tl-material-card--${escapeHtml(classNum)}">
            <h2 class="tl-material-card__grade">${gradeLabel}</h2>
            <p class="tl-material-card__desc">${escapeHtml(material.qisqa)}</p>
            <button class="tl-material-card__btn tl-btn-primary tl-pdf-btn" type="button" data-pdf="${escapeHtml(material.pdf)}" data-title="${escapeHtml(material.sinf)}">${uiT('talimReadPdfBtn', 'PDFni o\'qish')}</button>
        </article>
    `;
}

function loadLessons() {
    const container = document.getElementById('lessons-container');
    if (!container) return;

    const cards = MODULE_CLASSES
        .map(classNum => {
            const material = oquvMateriallari[String(classNum)]?.[0];
            if (!material) return '';
            return renderPdfMaterialCard(classNum, material);
        })
        .filter(Boolean)
        .join('');

    container.innerHTML = cards
        ? `<div class="tl-materials-grid">${cards}</div>`
        : `<p class="tl-materials-empty">${uiT('talimMaterialsEmpty', 'Dars materiallari hozircha mavjud emas.')}</p>`;
}

function loadLessonsForClass(classNum) {
    activeClass = String(classNum);
    loadLessons();
    document.querySelector(`.tl-material-card--${classNum}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function openTalimPdfModal(title, pdfPath) {
    if (!pdfPath || pdfPath === '#') return;

    const pdfUrl = resolveAssetPath(pdfPath);
    const modal = document.getElementById('tl-pdf-modal');
    const frame = document.getElementById('tl-pdf-frame');
    const titleEl = document.getElementById('tl-pdf-title');
    const external = document.getElementById('tl-pdf-external');

    if (!modal || !frame || !titleEl) return;

    titleEl.textContent = title || '';
    frame.src = `${pdfUrl}#page=1`;
    if (external) {
        external.href = pdfUrl;
    }

    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeTalimPdfModal() {
    const modal = document.getElementById('tl-pdf-modal');
    const frame = document.getElementById('tl-pdf-frame');

    if (!modal) return;

    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    if (frame) frame.src = '';
    document.body.style.overflow = '';
}

function initTalimPdfModal() {
    document.getElementById('tl-pdf-close')?.addEventListener('click', closeTalimPdfModal);

    document.getElementById('lessons-container')?.addEventListener('click', function(event) {
        const btn = event.target.closest('.tl-pdf-btn');
        if (!btn) return;

        openTalimPdfModal(btn.dataset.title, btn.dataset.pdf);
    });

    const modal = document.getElementById('tl-pdf-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeTalimPdfModal();
            }
        });
    }
}

function showLessonModal(classNum, sarlavha) {
    const progress = getProgress();
    const key = lessonKey(classNum, sarlavha);

    if (!progress.completedLessons.includes(key)) {
        progress.completedLessons.push(key);
    }
    progress.lastClass = String(classNum);
    progress.lastLesson = sarlavha;
    saveProgress(progress);
    loadLessons();

    alert(`${classNum}-sinf: "${sarlavha}" dars rejasi\n\nTo'liq versiya tez orada qo'shiladi!`);
}

// ===================================
// VIKTORINA
// ===================================

document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        selectedDifficulty = this.dataset.level;
    });
});

document.querySelectorAll('.quiz-class-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.quiz-class-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        selectedQuizClass = this.dataset.quizClass;
    });
});

function startQuiz() {
    userName = document.getElementById('user-name').value.trim();

    if (!userName) {
        alert('Iltimos, ismingizni kiriting!');
        return;
    }

    if (quizData.length === 0) {
        alert('Savollar yuklanmadi. Iltimos, sahifani qayta yuklang.');
        return;
    }

    currentQuestionIndex = 0;
    score = 0;
    wrongAnswers = [];

    const classPool = filterQuestionsForQuiz(selectedQuizClass);
    const filtered = filterQuestionsByDifficulty(classPool, selectedDifficulty);

    if (filtered.length < 10) {
        const classLabel = `${selectedQuizClass}-sinf`;
        const diffLabel = selectedDifficulty === 'orta' ? "o'rta" : selectedDifficulty;
        alert(
            `${classLabel} va "${diffLabel}" daraja uchun faqat ${filtered.length} ta savol mavjud (viktorina uchun 10 ta kerak).\n\n` +
            `Boshqa daraja yoki sinfni tanlang.`
        );
        return;
    }

    currentQuiz = shuffleArray(filtered).slice(0, 10);

    document.getElementById('quiz-start').style.display = 'none';
    document.getElementById('quiz-question').style.display = 'block';

    showQuestion();
}

function showQuestion() {
    if (currentQuestionIndex >= currentQuiz.length) {
        showResult();
        return;
    }

    const question = currentQuiz[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentQuiz.length) * 100;

    document.getElementById('progress-fill').style.width = progress + '%';
    document.getElementById('question-number').textContent = uiT('talimQuestionOf', 'Savol {current} / {total}', {
        current: currentQuestionIndex + 1,
        total: currentQuiz.length
    });
    document.getElementById('question-text').textContent = question.savol;

    const answersContainer = document.getElementById('answers-container');
    answersContainer.innerHTML = question.variantlar.map((variant, index) => `
        <button class="answer-btn" type="button" onclick="selectAnswer(${index})">
            <strong>${String.fromCharCode(65 + index)}.</strong> ${escapeHtml(variant)}
        </button>
    `).join('');

    document.getElementById('next-btn').style.display = 'none';
    startTimer();
}

function startTimer() {
    timeLeft = 60;
    updateTimerDisplay();

    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 10) {
            document.getElementById('timer').classList.add('warning');
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timeOut();
        }
    }, 1000);
}

function updateTimerDisplay() {
    document.getElementById('timer').textContent = timeLeft;
}

function timeOut() {
    const question = currentQuiz[currentQuestionIndex];
    wrongAnswers.push({
        savol: question.savol,
        sizningJavob: 'Vaqt tugadi',
        togriJavob: question.variantlar[question.togri]
    });

    const buttons = document.querySelectorAll('.answer-btn');
    buttons[question.togri].classList.add('correct');
    buttons.forEach(btn => btn.disabled = true);

    setTimeout(() => {
        document.getElementById('next-btn').style.display = 'block';
    }, 1500);
}

function selectAnswer(index) {
    clearInterval(timerInterval);
    document.getElementById('timer').classList.remove('warning');

    const question = currentQuiz[currentQuestionIndex];
    const buttons = document.querySelectorAll('.answer-btn');

    buttons.forEach(btn => btn.disabled = true);

    if (index === question.togri) {
        buttons[index].classList.add('correct');
        score++;
    } else {
        buttons[index].classList.add('wrong');
        buttons[question.togri].classList.add('correct');

        wrongAnswers.push({
            savol: question.savol,
            sizningJavob: question.variantlar[index],
            togriJavob: question.variantlar[question.togri]
        });
    }

    setTimeout(() => {
        document.getElementById('next-btn').style.display = 'block';
    }, 1500);
}

function nextQuestion() {
    currentQuestionIndex++;
    showQuestion();
}

function showResult() {
    clearInterval(timerInterval);

    document.getElementById('quiz-question').style.display = 'none';
    document.getElementById('quiz-result').style.display = 'block';

    const percentage = Math.round((score / currentQuiz.length) * 100);
    const starCount = Math.ceil(percentage / 20);

    document.getElementById('stars').textContent = '⭐'.repeat(starCount) + '☆'.repeat(5 - starCount);
    document.getElementById('score-display').textContent = `${score} / ${currentQuiz.length}`;

    let message = '';
    if (percentage >= 90) {
        message = `A'lo, ${userName}! Siz zo'r bilim egasisiz! 🎉`;
    } else if (percentage >= 70) {
        message = `Yaxshi, ${userName}! Davom eting! 👍`;
    } else if (percentage >= 50) {
        message = `O'rtacha, ${userName}. Ko'proq o'qing! 📚`;
    } else {
        message = `${userName}, yanada ko'proq mashq qiling! 💪`;
    }
    document.getElementById('result-message').textContent = message;

    if (wrongAnswers.length > 0) {
        document.getElementById('wrong-answers').innerHTML = `
            <h3 style="color: #dc2626; margin-bottom: 1rem;">Xato javoblar:</h3>
            ${wrongAnswers.map(w => `
                <div class="tl-bank-item">
                    <p class="tl-bank-item__q">${escapeHtml(w.savol)}</p>
                    <p style="color: #dc2626;"><strong>Sizning javobingiz:</strong> ${escapeHtml(w.sizningJavob)}</p>
                    <p style="color: #059669;"><strong>To'g'ri javob:</strong> ${escapeHtml(w.togriJavob)}</p>
                </div>
            `).join('')}
        `;
    } else {
        document.getElementById('wrong-answers').innerHTML = `<p style="color: #059669; font-size: 1.125rem;">🎉 ${uiT('talimAllCorrect', 'Barcha javoblar to\'g\'ri!')}</p>`;
    }

    const certBtn = document.getElementById('cert-btn');
    certBtn.style.display = percentage >= 70 ? 'inline-flex' : 'none';

    const progress = getProgress();
    if (percentage > progress.quizBest) {
        progress.quizBest = percentage;
        saveProgress(progress);
    }
}

function restartQuiz() {
    document.getElementById('quiz-result').style.display = 'none';
    document.getElementById('quiz-start').style.display = 'block';
}

function newQuiz() {
    location.reload();
}

// ===================================
// SERTIFIKAT
// ===================================

function showCertificate() {
    const modal = document.getElementById('cert-modal');
    modal.style.display = 'flex';
    generateCertificate();
}

function closeCertModal() {
    document.getElementById('cert-modal').style.display = 'none';
}

function generateCertificate() {
    const canvas = document.getElementById('certificate-canvas');
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f9f6f0';
    ctx.fillRect(0, 0, 800, 600);

    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = 15;
    ctx.strokeRect(20, 20, 760, 560);

    ctx.strokeStyle = '#1a3c5e';
    ctx.lineWidth = 3;
    ctx.strokeRect(35, 35, 730, 530);

    ctx.font = 'bold 80px Arial';
    ctx.fillStyle = '#c9a84c';
    ctx.textAlign = 'center';
    ctx.fillText('🏆', 400, 120);

    ctx.font = 'bold 48px "Playfair Display", serif';
    ctx.fillStyle = '#1a3c5e';
    ctx.fillText('SERTIFIKAT', 400, 180);

    ctx.font = '24px "Inter", sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText('Taqdim etiladi', 400, 220);

    ctx.font = 'bold 36px "Playfair Display", serif';
    ctx.fillStyle = '#1a3c5e';
    ctx.fillText(userName, 400, 280);

    ctx.font = '20px "Inter", sans-serif';
    ctx.fillStyle = '#2d2d2d';
    const percentage = Math.round((score / currentQuiz.length) * 100);
    ctx.fillText(`G'afur G'ulom ijodini o'rgandi va`, 400, 330);
    ctx.fillText(`${percentage}% natija ko'rsatdi`, 400, 360);

    ctx.font = '18px "Inter", sans-serif';
    ctx.fillStyle = '#666';
    const today = new Date().toLocaleDateString('uz-UZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    ctx.fillText(today, 400, 420);

    ctx.font = 'italic 16px "Inter", sans-serif';
    ctx.fillStyle = '#1a3c5e';
    ctx.fillText('G\'afur G\'ulom ta\'limiy platformasi', 400, 520);
    ctx.fillText('www.gafurgulom.uz', 400, 545);
}

function downloadCertificate() {
    const canvas = document.getElementById('certificate-canvas');
    const link = document.createElement('a');
    link.download = `sertifikat-${userName}.png`;
    link.href = canvas.toDataURL();
    link.click();
}

// ===================================
// SAVOL BANKI
// ===================================

let editingCustomQuestionId = null;

function loadCustomQuestionsFromStorage() {
    try {
        const raw = localStorage.getItem(CUSTOM_QUESTIONS_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveCustomQuestionsToStorage(questions) {
    try {
        localStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(questions));
    } catch (error) {
        console.error('Custom savollarni saqlashda xatolik:', error);
    }
}

function mergeQuizData() {
    const custom = loadCustomQuestionsFromStorage();
    quizData = [...baseQuizData, ...custom];
}

function getCustomQuestions() {
    return loadCustomQuestionsFromStorage();
}

function getSinfLabel(sinf) {
    if (sinf === 'umumiy') return 'Umumiy';
    return `${sinf}-sinf`;
}

function getDarajaLabel(daraja) {
    if (daraja === 'orta' || daraja === "o'rta") return "O'rta";
    if (daraja === 'qiyin') return 'Qiyin';
    return 'Oson';
}

function renderBankCard(options) {
    const {
        icon,
        title,
        meta,
        btnLabel,
        btnClass = 'tl-bank-card__btn--primary',
        onclick,
        modifier = ''
    } = options;

    return `
        <article class="tl-bank-card${modifier ? ' ' + modifier : ''}">
            <div class="tl-bank-card__accent" aria-hidden="true"></div>
            <div class="tl-bank-card__main">
                <span class="tl-bank-card__icon" aria-hidden="true">${icon}</span>
                <div class="tl-bank-card__text">
                    <h3 class="tl-bank-card__title">${title}</h3>
                    <p class="tl-bank-card__meta">${meta}</p>
                </div>
            </div>
            <div class="tl-bank-card__footer">
                <button class="tl-bank-card__btn ${btnClass}" type="button" onclick="${onclick}">${btnLabel}</button>
            </div>
        </article>
    `;
}

function renderCustomQuestionsSection() {
    const section = document.getElementById('bank-custom-section');
    if (!section) return;

    const custom = getCustomQuestions();
    if (custom.length === 0) {
        section.hidden = true;
        section.innerHTML = '';
        return;
    }

    section.hidden = false;
    section.innerHTML = `
        <h3 class="tl-bank-custom__title">Men qo'shgan savollar</h3>
        <div class="tl-bank-custom__list">
            ${custom.map(q => {
                const safeId = String(q.id).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
                return `
                <article class="tl-bank-custom-item" data-id="${escapeHtml(String(q.id))}">
                    <div class="tl-bank-custom-item__body">
                        <p class="tl-bank-custom-item__q">${escapeHtml(q.savol)}</p>
                        <div class="tl-bank-custom-item__meta">
                            <span class="tl-bank-custom-item__tag">${escapeHtml(getSinfLabel(q.sinf))}</span>
                            <span class="tl-bank-custom-item__tag">${escapeHtml(getDarajaLabel(q.daraja))}</span>
                        </div>
                    </div>
                    <div class="tl-bank-custom-item__actions">
                        <button class="tl-bank-custom-item__btn" type="button" onclick="editCustomQuestion('${safeId}')">Tahrirlash</button>
                        <button class="tl-bank-custom-item__btn tl-bank-custom-item__btn--danger" type="button" onclick="deleteCustomQuestion('${safeId}')">O'chirish</button>
                    </div>
                </article>
            `;
            }).join('')}
        </div>
    `;
}

function hideCustomQuestionsSection() {
    const section = document.getElementById('bank-custom-section');
    if (section) section.hidden = true;
}

function loadSavolBanki() {
    const container = document.getElementById('bank-container');

    if (quizData.length === 0) {
        container.innerHTML = `<p class="tl-empty">${uiT('talimQuestionsLoading', 'Savollar yuklanmoqda...')}</p>`;
        return;
    }

    const count6 = filterQuestionsForBank('6').length;
    const count8 = filterQuestionsForBank('8').length;
    const countUmumiy = filterQuestionsForBank('umumiy').length;

    container.className = 'tl-bank-grid tl-bank-grid--main';
    container.innerHTML = [
        renderBankCard({
            icon: '6',
            title: '6-sinf savollari',
            meta: `Jami: ${count6} ta savol`,
            btnLabel: "Ko'rish →",
            onclick: "showBankLevels('6')",
            modifier: 'tl-bank-card--grade-6'
        }),
        renderBankCard({
            icon: '✦',
            title: 'Umumiy savollar',
            meta: `Jami: ${countUmumiy} ta savol`,
            btnLabel: "Ko'rish →",
            onclick: "showBankLevels('umumiy')",
            modifier: 'tl-bank-card--general'
        }),
        renderBankCard({
            icon: '8',
            title: '8-sinf savollari',
            meta: `Jami: ${count8} ta savol`,
            btnLabel: "Ko'rish →",
            onclick: "showBankLevels('8')",
            modifier: 'tl-bank-card--grade-8'
        }),
        renderBankCard({
            icon: '＋',
            title: "O'z savolingizni qo'shing",
            meta: "O'qituvchilar uchun",
            btnLabel: "Savol qo'shish →",
            btnClass: 'tl-bank-card__btn--outline',
            onclick: 'showAddQuestionForm()',
            modifier: 'tl-bank-card--action'
        })
    ].join('');

    renderCustomQuestionsSection();
}

function showBankLevels(classKey) {
    const pool = filterQuestionsForBank(classKey);
    const label = classKey === 'umumiy' ? 'Umumiy' : `${classKey}-sinf`;
    const oson = filterQuestionsByDifficulty(pool, 'oson');
    const orta = filterQuestionsByDifficulty(pool, 'orta');
    const qiyin = filterQuestionsByDifficulty(pool, 'qiyin');

    document.getElementById('bank-container').className = 'tl-bank-detail-wrap';
    hideCustomQuestionsSection();
    document.getElementById('bank-container').innerHTML = `
        <div class="tl-bank-detail">
            <header class="tl-bank-detail__head">
                <h2 class="tl-bank-detail__title">${escapeHtml(label)} savollari</h2>
                <p class="tl-bank-detail__count">${pool.length} ta savol</p>
            </header>
            <div class="tl-bank-grid tl-bank-grid--levels">
                ${renderBankCard({
                    icon: '😊',
                    title: 'Oson darajadagi savollar',
                    meta: `Jami: ${oson.length} ta savol`,
                    btnLabel: "Ko'rish →",
                    onclick: `showBankQuestions('${classKey}', 'oson')`,
                    modifier: 'tl-bank-card--level tl-bank-card--easy'
                })}
                ${renderBankCard({
                    icon: '🤔',
                    title: "O'rta darajadagi savollar",
                    meta: `Jami: ${orta.length} ta savol`,
                    btnLabel: "Ko'rish →",
                    onclick: `showBankQuestions('${classKey}', 'orta')`,
                    modifier: 'tl-bank-card--level tl-bank-card--medium'
                })}
                ${renderBankCard({
                    icon: '🔥',
                    title: 'Qiyin darajadagi savollar',
                    meta: `Jami: ${qiyin.length} ta savol`,
                    btnLabel: "Ko'rish →",
                    onclick: `showBankQuestions('${classKey}', 'qiyin')`,
                    modifier: 'tl-bank-card--level tl-bank-card--hard'
                })}
            </div>
            <button class="tl-bank-back" type="button" onclick="loadSavolBanki()">← Orqaga</button>
        </div>
    `;
}

function showBankQuestions(classKey, daraja) {
    const pool = filterQuestionsForBank(classKey);
    const filtered = filterQuestionsByDifficulty(pool, daraja);
    const classLabel = classKey === 'umumiy' ? 'Umumiy' : `${classKey}-sinf`;
    const label = daraja.charAt(0).toUpperCase() + daraja.slice(1);

    let html = `
        <div class="tl-bank-detail">
            <header class="tl-bank-detail__head">
                <h2 class="tl-bank-detail__title">${escapeHtml(classLabel)} — ${escapeHtml(label)} darajadagi savollar</h2>
                <p class="tl-bank-detail__count">${filtered.length} ta savol</p>
            </header>
            <div class="tl-bank-questions">
    `;

    filtered.forEach((q, index) => {
        html += `
            <div class="tl-bank-item">
                <p class="tl-bank-item__q">${index + 1}. ${escapeHtml(q.savol)}</p>
                <p class="tl-bank-item__meta"><strong>Mavzu:</strong> ${escapeHtml(q.mavzu || 'Umumiy')}</p>
                <div>
                    ${q.variantlar.map((v, i) => `
                        <p class="tl-bank-item__a ${i === q.togri ? 'is-correct' : ''}">
                            ${String.fromCharCode(65 + i)}. ${escapeHtml(v)} ${i === q.togri ? '✓' : ''}
                        </p>
                    `).join('')}
                </div>
            </div>
        `;
    });

    html += `
            </div>
            <button class="tl-bank-back" type="button" onclick="showBankLevels('${classKey}')">← Orqaga</button>
        </div>
    `;

    const bankContainer = document.getElementById('bank-container');
    bankContainer.className = 'tl-bank-detail-wrap';
    hideCustomQuestionsSection();
    bankContainer.innerHTML = html;
}

function showBankModalError(message) {
    const errorEl = document.getElementById('bank-modal-error');
    if (!errorEl) return;
    if (message) {
        errorEl.textContent = message;
        errorEl.hidden = false;
    } else {
        errorEl.textContent = '';
        errorEl.hidden = true;
    }
}

function resetBankQuestionForm() {
    const form = document.getElementById('bank-question-form');
    if (!form) return;
    form.reset();
    const sinf6 = form.querySelector('input[name="bank-sinf"][value="6"]');
    const togriA = form.querySelector('input[name="bank-togri"][value="0"]');
    const darajaOson = form.querySelector('input[name="bank-daraja"][value="oson"]');
    if (sinf6) sinf6.checked = true;
    if (togriA) togriA.checked = true;
    if (darajaOson) darajaOson.checked = true;
    showBankModalError('');
}

function openBankQuestionModal(mode, question) {
    const modal = document.getElementById('bank-add-modal');
    const titleEl = document.getElementById('bank-modal-title');
    if (!modal) return;

    editingCustomQuestionId = mode === 'edit' && question ? question.id : null;
    resetBankQuestionForm();

    if (titleEl) {
        titleEl.textContent = mode === 'edit'
            ? uiT('talimEditQuestion', 'Savolni tahrirlash')
            : uiT('talimAddQuestion', "Yangi savol qo'shish");
    }

    if (question) {
        const sinfVal = String(question.sinf);
        const sinfInput = document.querySelector(`input[name="bank-sinf"][value="${sinfVal}"]`);
        if (sinfInput) sinfInput.checked = true;

        document.getElementById('bank-savol').value = question.savol || '';
        document.getElementById('bank-opt-a').value = question.variantlar?.[0] || '';
        document.getElementById('bank-opt-b').value = question.variantlar?.[1] || '';
        document.getElementById('bank-opt-c').value = question.variantlar?.[2] || '';
        document.getElementById('bank-opt-d').value = question.variantlar?.[3] || '';

        const togriInput = document.querySelector(`input[name="bank-togri"][value="${question.togri}"]`);
        if (togriInput) togriInput.checked = true;

        const darajaVal = question.daraja === "o'rta" ? 'orta' : question.daraja;
        const darajaInput = document.querySelector(`input[name="bank-daraja"][value="${darajaVal}"]`);
        if (darajaInput) darajaInput.checked = true;
    }

    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    document.getElementById('bank-savol')?.focus();
}

function closeBankQuestionModal() {
    const modal = document.getElementById('bank-add-modal');
    if (!modal) return;
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    editingCustomQuestionId = null;
    showBankModalError('');
}

function validateBankQuestionForm() {
    const sinf = document.querySelector('input[name="bank-sinf"]:checked');
    const savol = document.getElementById('bank-savol')?.value.trim();
    const opts = [
        document.getElementById('bank-opt-a')?.value.trim(),
        document.getElementById('bank-opt-b')?.value.trim(),
        document.getElementById('bank-opt-c')?.value.trim(),
        document.getElementById('bank-opt-d')?.value.trim()
    ];
    const togri = document.querySelector('input[name="bank-togri"]:checked');
    const daraja = document.querySelector('input[name="bank-daraja"]:checked');

    if (!sinf) {
        showBankModalError('Iltimos, sinfni tanlang.');
        return null;
    }
    if (!savol) {
        showBankModalError('Iltimos, savol matnini kiriting.');
        document.getElementById('bank-savol')?.focus();
        return null;
    }
    if (opts.some(opt => !opt)) {
        showBankModalError('Iltimos, barcha 4 ta javob variantini kiriting.');
        return null;
    }
    if (!togri) {
        showBankModalError("Iltimos, to'g'ri javobni tanlang.");
        return null;
    }
    if (!daraja) {
        showBankModalError('Iltimos, qiyinlik darajasini tanlang.');
        return null;
    }

    showBankModalError('');
    const sinfVal = sinf.value === 'umumiy' ? 'umumiy' : Number(sinf.value);

    return {
        id: editingCustomQuestionId || `custom-${Date.now()}`,
        savol,
        variantlar: opts,
        togri: Number(togri.value),
        daraja: daraja.value,
        mavzu: 'custom',
        sinf: sinfVal,
        source: 'custom',
        createdAt: editingCustomQuestionId
            ? (getCustomQuestions().find(q => q.id === editingCustomQuestionId)?.createdAt || new Date().toISOString())
            : new Date().toISOString()
    };
}

function saveBankQuestionFromForm(event) {
    if (event) event.preventDefault();

    const question = validateBankQuestionForm();
    if (!question) return;

    const custom = getCustomQuestions();
    const existingIndex = custom.findIndex(q => q.id === question.id);

    if (existingIndex >= 0) {
        custom[existingIndex] = question;
    } else {
        custom.push(question);
    }

    saveCustomQuestionsToStorage(custom);
    mergeQuizData();
    renderHeroStats();
    closeBankQuestionModal();

    const bankTab = document.querySelector('.tab-content[data-tab="bank"]');
    if (bankTab?.classList.contains('active')) {
        loadSavolBanki();
    }
}

function showAddQuestionForm() {
    openBankQuestionModal('add');
}

function editCustomQuestion(id) {
    const question = getCustomQuestions().find(q => String(q.id) === String(id));
    if (!question) return;
    openBankQuestionModal('edit', question);
}

function deleteCustomQuestion(id) {
    if (!confirm('Bu savolni o\'chirishni xohlaysizmi?')) return;

    const custom = getCustomQuestions().filter(q => String(q.id) !== String(id));
    saveCustomQuestionsToStorage(custom);
    mergeQuizData();
    renderHeroStats();
    loadSavolBanki();
}

function initBankQuestionModal() {
    const modal = document.getElementById('bank-add-modal');
    const form = document.getElementById('bank-question-form');
    const closeBtn = document.getElementById('bank-modal-close');
    const cancelBtn = document.getElementById('bank-modal-cancel');

    if (form) {
        form.addEventListener('submit', saveBankQuestionFromForm);
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', closeBankQuestionModal);
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeBankQuestionModal);
    }
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeBankQuestionModal();
            }
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal?.style.display === 'flex') {
            closeBankQuestionModal();
        }
    });
}

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', async function() {
    window.PlatformI18n?.registerRefresh?.('talim', refreshTalimUI);
    renderCourseOverview();
    renderLearningPath();
    renderMaterials();
    renderAssignments();
    loadLessons();
    initTalimPdfModal();

    try {
        const response = await fetch((window.platformUrl || function (r) { return r; })('data/quiz.json'));
        const data = await response.json();
        baseQuizData = data.savollar;
        mergeQuizData();
        renderHeroStats();
    } catch (error) {
        console.error('Savollarni yuklashda xatolik:', error);
        mergeQuizData();
        renderHeroStats();
        alert('Savollar yuklanmadi. Iltimos, sahifani qayta yuklang.');
    }

    initBankQuestionModal();

    const modal = document.getElementById('cert-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeCertModal();
            }
        });
    }
});

window.TalimMarkaz = {
    loadLessons,
    loadLessonsForClass,
    switchTab,
    getProgress,
    renderHeroStats
};
