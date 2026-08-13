// ===================================
// Ta'lim Resurslari — JavaScript (Phase 9)
// IA + functionality preserved
// ===================================

const PROGRESS_KEY = 'talim-progress';

let quizData = [];
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
    6: [
        {
            sarlavha: "G'afur G'ulomning birinchi she'rlari",
            maqsad: "Shoirning ijod yo'liga kirishi haqida ma'lumot",
            vaqt: "45 daqiqa",
            mavzular: ["Birinchi she'rlar", "Yoshlik davri", "Adabiy muhit", "Ilk ijodlar"]
        },
        {
            sarlavha: "'Ona' she'ri tahlili",
            maqsad: "Ona obrazi va ona sevgisi mavzusini o'rganish",
            vaqt: "45 daqiqa",
            mavzular: ["She'r mazmuni", "Ona obrazi", "Badiiy tasvirlar", "Yodlash"]
        }
    ],
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
    8: [
        {
            sarlavha: "'Shum bola' romani bilan tanishish",
            maqsad: "Romanning g'oyasi va qahramonlari bilan tanishish",
            vaqt: "45 daqiqa",
            mavzular: ["Roman syujeti", "Bosh qahramon", "Voqealar rivojlanishi", "Xulosa"]
        },
        {
            sarlavha: "Mehnat mavzusidagi she'rlar",
            maqsad: "Mehnat ulug'lanishi va ahamiyatini anglash",
            vaqt: "45 daqiqa",
            mavzular: ["Mehnat she'rlari", "Obrazlar", "G'oyaviy mazmun", "Muhokama"]
        }
    ],
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
    return MODULE_CLASSES.reduce((sum, cls) => sum + (darsRejalari[cls]?.length || 0), 0);
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
        { num: classCount, label: 'sinf', icon: '🎓' },
        { num: lessonCount, label: 'dars', icon: '📚' },
        { num: quizCount, label: 'viktorina savoli', icon: '✦' }
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

function renderMaterialRow(classNum, material) {
    const theme = GRADE_META[classNum]?.theme || '6';

    return `
        <article class="tl-lesson-row tl-lesson-row--${theme} tl-lesson-row--material" data-class="${escapeHtml(classNum)}" data-material="${escapeHtml(material.sarlavha)}">
            <div class="tl-lesson-row__num">PDF</div>
            <div class="tl-lesson-row__body">
                <h3 class="tl-lesson-row__title">${escapeHtml(material.sarlavha)} — ${escapeHtml(material.sinf)}</h3>
                <ul class="tl-lesson-row__meta">
                    <li><span class="tl-lesson-row__icon" aria-hidden="true">☰</span><span>${escapeHtml(material.qisqa)}</span></li>
                </ul>
            </div>
            <button class="tl-lesson-row__btn tl-pdf-btn" type="button" data-pdf="${escapeHtml(material.pdf)}" data-title="${escapeHtml(material.sarlavha)}">PDFni o'qish →</button>
        </article>
    `;
}

function renderGradeSection(classNum, progress) {
    const lessons = darsRejalari[classNum];
    const meta = GRADE_META[classNum];
    if (!lessons || !meta) return '';

    const rows = lessons.map((lesson, idx) => renderLessonRow(classNum, lesson, idx, progress)).join('');
    const materials = (oquvMateriallari[String(classNum)] || [])
        .map(m => renderMaterialRow(classNum, m))
        .join('');

    return `
        <section class="tl-grade-section" id="tl-grade-${escapeHtml(classNum)}">
            <header class="tl-grade-section__head">
                <h2 class="tl-grade-section__title tl-grade-section__title--${meta.theme}">${escapeHtml(meta.title)}</h2>
                <p class="tl-grade-section__desc">${escapeHtml(meta.desc)}</p>
            </header>
            <div class="tl-lesson-list">
                ${rows}
                ${materials}
            </div>
        </section>
    `;
}

function bindLessonRowEvents(container) {
    container.querySelectorAll('.tl-view-btn[data-action="view"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const row = btn.closest('[data-lesson]');
            if (!row) return;
            showLessonModal(row.dataset.class, row.dataset.lesson);
        });
    });
}

function loadLessons() {
    const container = document.getElementById('lessons-container');
    if (!container) return;

    const progress = getProgress();
    container.innerHTML = MODULE_CLASSES
        .map(classNum => renderGradeSection(classNum, progress))
        .join('');

    bindLessonRowEvents(container);
}

function loadLessonsForClass(classNum) {
    activeClass = String(classNum);
    loadLessons();
    document.getElementById(`tl-grade-${classNum}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    document.getElementById('question-number').textContent = `Savol ${currentQuestionIndex + 1} / ${currentQuiz.length}`;
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
        document.getElementById('wrong-answers').innerHTML = '<p style="color: #059669; font-size: 1.125rem;">🎉 Barcha javoblar to\'g\'ri!</p>';
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

function loadSavolBanki() {
    const container = document.getElementById('bank-container');

    if (quizData.length === 0) {
        container.innerHTML = '<p class="tl-empty">Savollar yuklanmoqda...</p>';
        return;
    }

    const count6 = filterQuestionsForBank('6').length;
    const count8 = filterQuestionsForBank('8').length;
    const countUmumiy = filterQuestionsForBank('umumiy').length;

    container.innerHTML = `
        <article class="lesson-card">
            <h3>6-sinf savollari</h3>
            <p class="lesson-card__meta">Jami: ${count6} ta savol</p>
            <div class="lesson-card__actions">
                <button class="tl-btn-primary tl-btn-navy" type="button" onclick="showBankLevels('6')">Ko'rish</button>
            </div>
        </article>
        <article class="lesson-card">
            <h3>8-sinf savollari</h3>
            <p class="lesson-card__meta">Jami: ${count8} ta savol</p>
            <div class="lesson-card__actions">
                <button class="tl-btn-primary tl-btn-navy" type="button" onclick="showBankLevels('8')">Ko'rish</button>
            </div>
        </article>
        <article class="lesson-card">
            <h3>Umumiy savollar</h3>
            <p class="lesson-card__meta">Jami: ${countUmumiy} ta savol</p>
            <div class="lesson-card__actions">
                <button class="tl-btn-primary tl-btn-navy" type="button" onclick="showBankLevels('umumiy')">Ko'rish</button>
            </div>
        </article>
        <article class="lesson-card">
            <h3>➕ O'z savolingizni qo'shing</h3>
            <p class="lesson-card__meta">O'qituvchilar uchun</p>
            <div class="lesson-card__actions">
                <button class="tl-btn-outline" type="button" onclick="showAddQuestionForm()">Savol qo'shish</button>
            </div>
        </article>
    `;
}

function showBankLevels(classKey) {
    const pool = filterQuestionsForBank(classKey);
    const label = classKey === 'umumiy' ? 'Umumiy' : `${classKey}-sinf`;
    const oson = filterQuestionsByDifficulty(pool, 'oson');
    const orta = filterQuestionsByDifficulty(pool, 'orta');
    const qiyin = filterQuestionsByDifficulty(pool, 'qiyin');

    document.getElementById('bank-container').innerHTML = `
        <div class="tl-bank-detail">
            <h2 class="tl-card__title">${escapeHtml(label)} savollari (${pool.length} ta)</h2>
            <div class="lessons-grid" style="margin-top: 1rem;">
                <article class="lesson-card">
                    <h3>😊 Oson darajadagi savollar</h3>
                    <p class="lesson-card__meta">Jami: ${oson.length} ta savol</p>
                    <div class="lesson-card__actions">
                        <button class="tl-btn-primary tl-btn-navy" type="button" onclick="showBankQuestions('${classKey}', 'oson')">Ko'rish</button>
                    </div>
                </article>
                <article class="lesson-card">
                    <h3>🤔 O'rta darajadagi savollar</h3>
                    <p class="lesson-card__meta">Jami: ${orta.length} ta savol</p>
                    <div class="lesson-card__actions">
                        <button class="tl-btn-primary tl-btn-navy" type="button" onclick="showBankQuestions('${classKey}', 'orta')">Ko'rish</button>
                    </div>
                </article>
                <article class="lesson-card">
                    <h3>🔥 Qiyin darajadagi savollar</h3>
                    <p class="lesson-card__meta">Jami: ${qiyin.length} ta savol</p>
                    <div class="lesson-card__actions">
                        <button class="tl-btn-primary tl-btn-navy" type="button" onclick="showBankQuestions('${classKey}', 'qiyin')">Ko'rish</button>
                    </div>
                </article>
            </div>
            <button class="tl-btn-outline" type="button" onclick="loadSavolBanki()" style="margin-top: 1rem;">← Orqaga</button>
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
            <h2 class="tl-card__title">${escapeHtml(classLabel)} — ${escapeHtml(label)} darajadagi savollar (${filtered.length} ta)</h2>
            <div style="margin-top: 1rem;">
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
            <button class="tl-btn-outline" type="button" onclick="showBankLevels('${classKey}')" style="margin-top: 1rem;">← Orqaga</button>
        </div>
    `;

    document.getElementById('bank-container').innerHTML = html;
}

function showAddQuestionForm() {
    alert('Bu funksiya tez orada qo\'shiladi!\n\nO\'qituvchilar o\'z savollarini qo\'shish imkoniyatiga ega bo\'ladi.');
}

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', async function() {
    renderCourseOverview();
    renderLearningPath();
    renderMaterials();
    renderAssignments();
    loadLessons();
    initTalimPdfModal();

    try {
        const response = await fetch((window.platformUrl || function (r) { return r; })('data/quiz.json'));
        const data = await response.json();
        quizData = data.savollar;
        renderHeroStats();
    } catch (error) {
        console.error('Savollarni yuklashda xatolik:', error);
        renderHeroStats();
        alert('Savollar yuklanmadi. Iltimos, sahifani qayta yuklang.');
    }

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
