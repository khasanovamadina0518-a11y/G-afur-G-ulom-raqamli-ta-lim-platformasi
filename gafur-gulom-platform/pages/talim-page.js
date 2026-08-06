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
let userName = '';
let activeClass = '5';

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

function getTotalLessons() {
    return Object.values(darsRejalari).reduce((sum, lessons) => sum + lessons.length, 0);
}

function getProgress() {
    try {
        return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {
            completedLessons: [],
            lastClass: '5',
            lastLesson: '',
            quizBest: 0
        };
    } catch {
        return { completedLessons: [], lastClass: '5', lastLesson: '', quizBest: 0 };
    }
}

function saveProgress(data) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
    renderProgressCard();
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

    const classCount = Object.keys(darsRejalari).length;
    const lessonCount = getTotalLessons();
    const quizCount = quizData.length || '—';

    el.innerHTML = `
        <div class="tl-hero__stat"><span class="tl-hero__stat-num">${classCount}</span> sinf</div>
        <div class="tl-hero__stat"><span class="tl-hero__stat-num">${lessonCount}</span> dars</div>
        <div class="tl-hero__stat"><span class="tl-hero__stat-num">${quizCount}</span> viktorina savoli</div>
    `;
}

function renderCourseOverview() {
    const el = document.getElementById('tl-course-overview');
    if (!el) return;

    el.innerHTML = `
        <p class="tl-overview__text">
            Ushbu kurs G'afur G'ulom ijodini 5–11-sinflar uchun bosqichma-bosqich o'rgatadi.
            Dars rejalar, viktorina va savol banki o'qituvchi hamda o'quvchi uchun tayyorlangan.
        </p>
        <div class="tl-overview__meta">
            <span><strong>7</strong> sinf darajasi</span>
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

function renderProgressCard() {
    const progress = getProgress();
    const total = getTotalLessons();
    const done = progress.completedLessons.length;
    const pct = total ? Math.round((done / total) * 100) : 0;

    const pctEl = document.getElementById('tl-progress-pct');
    const fillEl = document.getElementById('tl-progress-fill');
    const labelEl = document.getElementById('tl-progress-label');
    const barEl = fillEl?.closest('[role="progressbar"]');

    if (pctEl) pctEl.textContent = `${pct}%`;
    if (fillEl) fillEl.style.width = `${pct}%`;
    if (barEl) barEl.setAttribute('aria-valuenow', String(pct));

    if (labelEl) {
        if (progress.lastLesson) {
            labelEl.textContent = `Oxirgi: ${progress.lastClass}-sinf — ${progress.lastLesson}`;
        } else if (progress.quizBest >= 70) {
            labelEl.textContent = `Viktorina eng yaxshi natija: ${progress.quizBest}%`;
        } else {
            labelEl.textContent = 'Hali dars boshlanmagan';
        }
    }
}

function switchTab(tabName) {
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

document.getElementById('tl-go-quiz-btn')?.addEventListener('click', () => switchTab('quiz'));

document.getElementById('tl-continue-btn')?.addEventListener('click', () => {
    const progress = getProgress();
    if (progress.lastClass && progress.lastLesson) {
        activeClass = progress.lastClass;
        document.querySelectorAll('.class-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.class === activeClass);
        });
        loadLessons(activeClass);
        showLessonModal(activeClass, progress.lastLesson);
        return;
    }
    switchTab('quiz');
});

// ===================================
// CLASS SELECTOR
// ===================================

document.querySelectorAll('.class-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.class-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        activeClass = this.dataset.class;
        loadLessons(activeClass);
    });
});

function loadLessons(classNum) {
    const container = document.getElementById('lessons-container');
    const lessons = darsRejalari[classNum];
    const progress = getProgress();

    if (!container) return;

    if (!lessons) {
        container.innerHTML = '<p class="tl-empty">Ushbu sinf uchun dars rejalari hali qo\'shilmagan.</p>';
        return;
    }

    container.innerHTML = lessons.map((lesson, idx) => {
        const key = lessonKey(classNum, lesson.sarlavha);
        const isDone = progress.completedLessons.includes(key);

        return `
            <article class="lesson-card" data-class="${escapeHtml(classNum)}" data-lesson="${escapeHtml(lesson.sarlavha)}">
                <h3>${escapeHtml(lesson.sarlavha)}${isDone ? ' <span style="font-size:0.75rem;color:#059669;">✓</span>' : ''}</h3>
                <p class="lesson-card__meta"><strong>Maqsad:</strong> ${escapeHtml(lesson.maqsad)}</p>
                <p class="lesson-card__meta"><strong>Vaqt:</strong> ${escapeHtml(lesson.vaqt)}</p>
                <div class="lesson-card__meta"><strong>Mavzular:</strong></div>
                <ul class="lesson-card__topics">
                    ${lesson.mavzular.map(m => `<li>${escapeHtml(m)}</li>`).join('')}
                </ul>
                <div class="lesson-card__actions">
                    <button class="tl-btn-outline tl-download-btn" type="button" data-action="download">Yuklab olish</button>
                    <button class="tl-btn-primary tl-view-btn" type="button" data-action="view">Ko'rish</button>
                </div>
            </article>
        `;
    }).join('');

    container.querySelectorAll('.lesson-card').forEach(card => {
        const cls = card.dataset.class;
        const title = card.dataset.lesson;

        card.querySelector('[data-action="download"]')?.addEventListener('click', () => {
            alert('Tez orada qo\'shiladi');
        });

        card.querySelector('[data-action="view"]')?.addEventListener('click', () => {
            showLessonModal(cls, title);
        });
    });
}

function showLessonModal(classNum, sarlavha) {
    const progress = getProgress();
    const key = lessonKey(classNum, sarlavha);

    if (!progress.completedLessons.includes(key)) {
        progress.completedLessons.push(key);
    }
    progress.lastClass = classNum;
    progress.lastLesson = sarlavha;
    saveProgress(progress);

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

    const filtered = quizData.filter(q => q.daraja === selectedDifficulty || (selectedDifficulty === 'orta' && q.daraja === 'o\'rta'));

    if (filtered.length < 10) {
        alert('Tanlangan daraja uchun yetarli savollar yo\'q!');
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

    const oson = quizData.filter(q => q.daraja === 'oson');
    const orta = quizData.filter(q => q.daraja === 'orta' || q.daraja === 'o\'rta');
    const qiyin = quizData.filter(q => q.daraja === 'qiyin');

    container.innerHTML = `
        <article class="lesson-card">
            <h3>😊 Oson darajadagi savollar</h3>
            <p class="lesson-card__meta">Jami: ${oson.length} ta savol</p>
            <div class="lesson-card__actions">
                <button class="tl-btn-primary tl-btn-navy" type="button" onclick="showBankQuestions('oson')">Ko'rish</button>
            </div>
        </article>
        <article class="lesson-card">
            <h3>🤔 O'rta darajadagi savollar</h3>
            <p class="lesson-card__meta">Jami: ${orta.length} ta savol</p>
            <div class="lesson-card__actions">
                <button class="tl-btn-primary tl-btn-navy" type="button" onclick="showBankQuestions('orta')">Ko'rish</button>
            </div>
        </article>
        <article class="lesson-card">
            <h3>🔥 Qiyin darajadagi savollar</h3>
            <p class="lesson-card__meta">Jami: ${qiyin.length} ta savol</p>
            <div class="lesson-card__actions">
                <button class="tl-btn-primary tl-btn-navy" type="button" onclick="showBankQuestions('qiyin')">Ko'rish</button>
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

function showBankQuestions(daraja) {
    const filtered = quizData.filter(q => q.daraja === daraja || (daraja === 'orta' && q.daraja === 'o\'rta'));
    const label = daraja.charAt(0).toUpperCase() + daraja.slice(1);

    let html = `
        <div class="tl-bank-detail">
            <h2 class="tl-card__title">${escapeHtml(label)} darajadagi savollar (${filtered.length} ta)</h2>
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
            <button class="tl-btn-outline" type="button" onclick="loadSavolBanki()" style="margin-top: 1rem;">← Orqaga</button>
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
    renderProgressCard();

    const progress = getProgress();
    if (progress.lastClass) {
        activeClass = progress.lastClass;
        document.querySelectorAll('.class-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.class === activeClass);
        });
    }

    loadLessons(activeClass);

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
    switchTab,
    getProgress,
    renderHeroStats
};
