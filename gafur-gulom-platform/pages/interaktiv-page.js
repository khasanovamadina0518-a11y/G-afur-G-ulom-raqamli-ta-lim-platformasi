// ===================================
// Interaktiv O'yinlar - JavaScript
// ===================================

const platformTranslate = window.PlatformI18n?.t || null;

const uiT = (key, fallback, vars) => {
    return platformTranslate ? platformTranslate(key, fallback, vars) : (fallback ?? key);
};

function getCatTitle(cat) {
    return cat.titleKey ? uiT(cat.titleKey, cat.title) : cat.title;
}

function getCatDesc(cat) {
    return cat.descKey ? uiT(cat.descKey, cat.description) : cat.description;
}

function getCatDiff(cat) {
    return cat.diffKey ? uiT(cat.diffKey, cat.difficulty) : cat.difficulty;
}

function refreshInteraktivUI() {
    updateTestCardCounts();
    if (activeTestCategory && TEST_CATEGORIES[activeTestCategory]) {
        const category = TEST_CATEGORIES[activeTestCategory];
        const pool = quizQuestionPool || filterQuestionsByCategory(activeTestCategory);
        const titleEl = document.getElementById('quiz-start-title');
        const descEl = document.getElementById('quiz-start-desc');
        if (titleEl) titleEl.textContent = getCatTitle(category);
        if (descEl && pool.length) {
            const count = Math.min(20, pool.length);
            descEl.textContent = uiT('testsMetaLine', '{count} ta savol · {duration} · {difficulty}', {
                count,
                duration: category.duration,
                difficulty: getCatDiff(category)
            });
        }
    }
    window.PlatformI18n?.apply(document);
}

// Global o'zgaruvchilar
let quizData = [];
let currentGame = null;
let playerName = '';
let quizQuestionPool = null;
let activeTestCategory = null;

const TEST_CATEGORIES = {
    hayot: {
        title: "G'afur G'ulom hayoti",
        titleKey: 'testCatHayotTitle',
        description: "Shoir hayoti, tug'ilgan yili, oilasi va ijodiy yo'li bo'yicha bilimlaringizni sinab ko'ring.",
        descKey: 'testCatHayotDesc',
        mavzu: ['hayot'],
        difficulty: 'Oson',
        diffKey: 'testDiffEasy',
        duration: '15 daqiqa'
    },
    asarlar: {
        title: "G'afur G'ulom asarlari",
        titleKey: 'testCatAsarlarTitle',
        description: "Romanlar, hikoyalar va dramatik asarlarga oid professional savollar to'plami.",
        descKey: 'testCatAsarlarDesc',
        mavzu: ['asarlar'],
        difficulty: "O'rta",
        diffKey: 'testDiffMedium',
        duration: '18 daqiqa'
    },
    sheriyat: {
        title: "She'riyati",
        titleKey: 'testCatSherTitle',
        description: "She'rlar, to'plamlar va poetik ijodga oid chuqur savollar.",
        descKey: 'testCatSherDesc',
        mavzu: ['asarlar', 'umumiy'],
        keywords: ["she'r", "She'r", "she'rlar", "She'rlar", "Yillar sadosi", "to'plam"],
        difficulty: "O'rta",
        diffKey: 'testDiffMedium',
        duration: '12 daqiqa'
    },
    hikoya: {
        title: "Hikoya va qissalari",
        titleKey: 'testCatHikoyaTitle',
        description: "Hikoya, qissa va ertaklar bo'yicha bilimlaringizni baholang.",
        descKey: 'testCatHikoyaDesc',
        mavzu: ['asarlar'],
        keywords: ['hikoya', 'qissa', 'roman', 'Shum bola', 'Ikki eshik', 'ertak'],
        difficulty: 'Qiyin',
        diffKey: 'testDiffHard',
        duration: '14 daqiqa'
    },
    ilmiy: {
        title: "Ilmiy bilimlar",
        titleKey: 'testCatIlmiyTitle',
        description: "Adabiyotshunoslik va ilmiy-ma'rifiy bilimlar bo'yicha maxsus test.",
        descKey: 'testCatIlmiyDesc',
        mavzu: ['umumiy'],
        difficulty: 'Qiyin',
        diffKey: 'testDiffHard',
        duration: '10 daqiqa'
    },
    yakuniy: {
        title: 'Yakuniy test',
        titleKey: 'testCatYakuniyTitle',
        description: "Barcha mavzularni qamrab oluvchi yakuniy baholash testi.",
        descKey: 'testCatYakuniyDesc',
        mavzu: ['hayot', 'asarlar', 'umumiy'],
        all: true,
        difficulty: 'Aralash',
        diffKey: 'testDiffMixed',
        duration: '25 daqiqa'
    }
};

function filterQuestionsByCategory(categoryId) {
    const category = TEST_CATEGORIES[categoryId];
    if (!category) return [];

    let pool = quizData.filter(q => category.mavzu.includes(q.mavzu));

    if (category.keywords && category.keywords.length) {
        const keywordPool = pool.filter(q =>
            category.keywords.some(keyword => q.savol.toLowerCase().includes(keyword.toLowerCase()))
        );
        if (keywordPool.length >= 5) {
            pool = keywordPool;
        }
    }

    return pool;
}

function startTestCategory(categoryId) {
    const category = TEST_CATEGORIES[categoryId];
    if (!category) return;

    const pool = filterQuestionsByCategory(categoryId);
    if (pool.length === 0) {
        alert(uiT('testsNoQuestions', 'Bu test uchun savollar topilmadi. Iltimos, keyinroq urinib ko\'ring.'));
        return;
    }

    activeTestCategory = categoryId;
    quizQuestionPool = pool;

    const catalog = document.getElementById('tests-catalog');
    if (catalog) catalog.style.display = 'none';

    document.querySelectorAll('.game-screen').forEach(screen => {
        screen.classList.remove('active');
    });

    const quizSection = document.getElementById('quiz-game');
    if (quizSection) quizSection.classList.add('active');

    const titleEl = document.getElementById('quiz-start-title');
    const descEl = document.getElementById('quiz-start-desc');
    if (titleEl) titleEl.textContent = getCatTitle(category);
    if (descEl) {
        const count = Math.min(20, pool.length);
        descEl.textContent = uiT('testsMetaLine', '{count} ta savol · {duration} · {difficulty}', {
            count,
            duration: category.duration,
            difficulty: getCatDiff(category)
        });
    }

    resetQuizGame();
    loadQuizLeaderboard();
    currentGame = 'quiz';
}

// Quiz game variables
let quizQuestions = [];
let currentQuizIndex = 0;
let quizScore = 0;
let quizTimer = null;
let quizTimeLeft = 20;

// Memory game variables
let selectedPoem = null;
let memoryStage = 1;
let poemLines = [];
let poemWords = [];
let userAnswers = [];
let memoryPoems = [];
let memoryPoemsLoaded = false;
let memoryPoemsLoadFailed = false;
let memoryDifficulty = 'oson';
let lastMemoryPoemId = null;
let memoryCountdownTimer = null;

const MEMORY_DIFFICULTY = {
    'oson': { interval: 5, label: 'Oson' },
    'o\'rta': { interval: 3, label: 'O\'rta' },
    'qiyin': { interval: 2, label: 'Qiyin' }
};

function parsePoemLines(matn) {
    return String(matn ?? '').split('\n');
}

function escapeMemoryHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/"/g, '&quot;');
}

function normalizeMemoryPoem(sher) {
    if (!sher || !sher.sarlavha || sher.matn == null || sher.matn === '') return null;
    const matn = String(sher.matn);
    return {
        id: sher.id,
        title: sher.sarlavha,
        matn,
        lines: parsePoemLines(matn),
        yil: sher.yil,
        mavzu: Array.isArray(sher.mavzu) ? sher.mavzu.slice() : [],
        qisqa: sher.qisqa || ''
    };
}

function buildMemoryWordList(lines) {
    const words = [];
    lines.forEach(function (line) {
        if (!line.trim()) return;
        line.split(/\s+/).filter(Boolean).forEach(function (word) {
            words.push(word);
        });
    });
    return words;
}

function clearMemoryCountdown() {
    if (memoryCountdownTimer) {
        clearInterval(memoryCountdownTimer);
        memoryCountdownTimer = null;
    }
}

function clearMemoryPoemState() {
    clearMemoryCountdown();
    selectedPoem = null;
    poemLines = [];
    poemWords = [];
    userAnswers = [];
    memoryStage = 1;
}

function prepareSelectedPoemForGame(poem) {
    selectedPoem = poem;
    poemLines = poem.lines.slice();
    poemWords = buildMemoryWordList(poemLines);
    userAnswers = [];
    memoryStage = 1;
}

function renderMemoryLineBreak() {
    return '<div class="poem-line poem-line--break" aria-hidden="true">&nbsp;</div>';
}

function renderMemoryPoemHtml(renderWord) {
    let wordIndex = 0;

    return poemLines.map(function (line) {
        if (!line.trim()) {
            return renderMemoryLineBreak();
        }

        const parts = line.split(/\s+/).filter(Boolean).map(function (word) {
            const globalIndex = wordIndex;
            wordIndex += 1;
            return renderWord(word, globalIndex);
        });

        return '<div class="poem-line">' + parts.join(' ') + '</div>';
    }).join('');
}

async function ensureMemoryPoemsLoaded() {
    if (memoryPoemsLoaded) {
        return memoryPoems.length > 0;
    }

    if (typeof getSherlar !== 'function') {
        console.error('She\'r yodlash: getSherlar() funksiyasi topilmadi. data.js yuklanganini tekshiring.');
        memoryPoemsLoadFailed = true;
        return false;
    }

    try {
        const sherlar = await getSherlar();
        memoryPoems = (Array.isArray(sherlar) ? sherlar : [])
            .map(normalizeMemoryPoem)
            .filter(Boolean);
        memoryPoemsLoaded = true;
        memoryPoemsLoadFailed = memoryPoems.length === 0;

        if (memoryPoems.length === 0) {
            console.error('She\'r yodlash: Asarlar → She\'rlar manbasida o\'ynash uchun she\'r topilmadi.');
        } else {
            console.log(`She'r yodlash: ${memoryPoems.length} ta she'r yuklandi (Asarlar → She'rlar manbasi).`);
        }

        return memoryPoems.length > 0;
    } catch (error) {
        memoryPoemsLoadFailed = true;
        console.error('She\'r yodlash: she\'rlar yuklanmadi.', error);
        return false;
    }
}

function pickRandomMemoryPoem() {
    if (!memoryPoems.length) return null;
    if (memoryPoems.length === 1) {
        lastMemoryPoemId = memoryPoems[0].id;
        return memoryPoems[0];
    }

    let poem = null;
    let attempts = 0;
    const maxAttempts = Math.max(10, memoryPoems.length * 2);

    do {
        poem = memoryPoems[Math.floor(Math.random() * memoryPoems.length)];
        attempts++;
    } while (poem.id === lastMemoryPoemId && attempts < maxAttempts);

    lastMemoryPoemId = poem.id;
    return poem;
}

function getMemoryHideInterval() {
    return MEMORY_DIFFICULTY[memoryDifficulty]?.interval || MEMORY_DIFFICULTY['o\'rta'].interval;
}

function shouldHideMemoryWord(index) {
    const interval = getMemoryHideInterval();
    return interval > 0 && (index + 1) % interval === 0;
}

function getMemoryPoemMetaLine(poem) {
    if (!poem) return '';
    const parts = [];
    if (poem.mavzu?.length) parts.push(poem.mavzu.join(', '));
    if (poem.yil) parts.push(String(poem.yil));
    return parts.join(' · ');
}

function setMemoryStartEnabled(enabled) {
    const startBtn = document.querySelector('#memory-start .btn-primary');
    if (startBtn) startBtn.disabled = !enabled;
}

// Year match game variables (Yilni moslang — Hayoti manbasi)
let timelineAllEvents = [];
let matchRoundEvents = [];
let matchShuffledEvents = [];
let matchShuffledYears = [];
let matchPairs = {};
let matchSelectedEventId = null;
let matchSelectedYearSlotId = null;
let matchChecked = false;
let timelineEventsLoaded = false;
let timelineEventsLoadFailed = false;
let matchDragPayload = null;

const MATCH_ROUND_SIZE = 8;
const MATCH_MIN_ROUND_SIZE = 6;

// Word search variables
let wordGrid = [];
let wordsToFind = [];
let foundWords = [];
let wordSearchPool = [];
let wordSearchPoolLoaded = false;
let wordSearchScore = 0;
let wordSearchGridSize = 12;
let wordPlacements = {};
let wordSearchTimer = null;
let wordSearchTimeLeft = 300;
let wordSearchGameActive = false;
let wordSearchEnded = false;
let wordSearchSelecting = false;
let wordSearchSelectAnchor = null;
let wordSearchTapStart = null;
let wordSearchCurrentCells = [];
const WORD_SEARCH_ROUND_SIZE = 10;
const WORD_SEARCH_POINTS = 10;
const WORD_SEARCH_FILL_LETTERS = 'ABDEFGHIJKLMNOPQRSTUVXYZ';
const WORD_SEARCH_DIRECTIONS = [
    [0, 1], [0, -1], [1, 0], [-1, 0],
    [1, 1], [1, -1], [-1, 1], [-1, -1]
];

// ===================================
// MENU NAVIGATION
// ===================================

function showGame(gameName) {
    // Hide menu
    document.getElementById('games-menu').style.display = 'none';
    
    // Hide all game screens
    document.querySelectorAll('.game-screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show selected game
    const gameMap = {
        'quiz': 'quiz-game',
        'memory': 'memory-game',
        'timeline': 'timeline-game',
        'wordsearch': 'wordsearch-game',
        'leaderboard': 'leaderboard-section'
    };
    
    const gameId = gameMap[gameName];
    if (gameId) {
        document.getElementById(gameId).classList.add('active');
        currentGame = gameName;
        
        // Initialize game-specific content
        if (gameName === 'quiz') {
            quizQuestionPool = null;
            activeTestCategory = null;
            loadQuizLeaderboard();
        } else if (gameName === 'memory') {
            loadPoemSelector();
        } else if (gameName === 'timeline') {
            prepareTimelineGame();
        } else if (gameName === 'wordsearch') {
            prepareWordSearchGame();
        } else if (gameName === 'leaderboard') {
            loadGlobalLeaderboard();
        }
    }
}

function backToMenu() {
    // Clear any timers
    if (quizTimer) clearInterval(quizTimer);
    if (wordSearchTimer) clearInterval(wordSearchTimer);
    
    // Reset all games
    resetQuizGame();
    resetMemoryGame();
    resetTimelineGame();
    resetWordSearchGame();
    quizQuestionPool = null;
    activeTestCategory = null;
    
    // Show menu
    document.querySelectorAll('.game-screen').forEach(screen => {
        screen.classList.remove('active');
    });

    const gamesMenu = document.getElementById('games-menu');
    if (gamesMenu) gamesMenu.style.display = 'grid';

    currentGame = null;
}

function backToTests() {
    if (quizTimer) clearInterval(quizTimer);
    resetQuizGame();
    quizQuestionPool = null;
    activeTestCategory = null;

    document.querySelectorAll('.game-screen').forEach(screen => {
        screen.classList.remove('active');
    });

    const catalog = document.getElementById('tests-catalog');
    if (catalog) catalog.style.display = 'grid';

    currentGame = null;
}

// ===================================
// QUIZ GAME: "KIM KO'P BILADI?"
// ===================================

function loadQuizLeaderboard() {
    const leaderboard = getLeaderboard('quiz');
    const container = document.getElementById('quiz-leaderboard-preview');
    
    if (leaderboard.length === 0) {
        container.innerHTML = '<p class="text-light">Hali hech kim o\'ynamagan. Birinchi bo\'ling!</p>';
        return;
    }
    
    container.innerHTML = '<h3 style="margin-bottom: 1rem;">🏆 Eng yaxshi natijalar</h3>' +
        leaderboard.slice(0, 5).map((entry, index) => `
            <div class="leaderboard-entry">
                <div class="leaderboard-rank">${index + 1}</div>
                <div class="leaderboard-name">${entry.name}</div>
                <div class="leaderboard-score">${entry.score}</div>
            </div>
        `).join('');
}

function startQuizGame() {
    playerName = document.getElementById('quiz-player-name').value.trim();
    
    if (!playerName) {
        alert('Iltimos, ismingizni kiriting!');
        return;
    }
    
    const pool = quizQuestionPool || quizData;

    if (pool.length === 0) {
        alert('Savollar yuklanmadi. Iltimos, sahifani qayta yuklang.');
        return;
    }

    const questionCount = Math.min(20, pool.length);
    if (questionCount < 5) {
        alert('Bu test uchun yetarli savollar mavjud emas.');
        return;
    }
    
    // Reset
    currentQuizIndex = 0;
    quizScore = 0;
    
    // Select random questions from the active pool
    quizQuestions = shuffleArray([...pool]).slice(0, questionCount);
    
    // Show game screen
    document.getElementById('quiz-start').style.display = 'none';
    document.getElementById('quiz-playing').style.display = 'block';
    
    showQuizQuestion();
}

function showQuizQuestion() {
    if (currentQuizIndex >= quizQuestions.length) {
        showQuizResult();
        return;
    }
    
    const question = quizQuestions[currentQuizIndex];
    
    // Update counter
    document.getElementById('quiz-counter').textContent = `${currentQuizIndex + 1} / ${quizQuestions.length}`;
    document.getElementById('quiz-score').textContent = quizScore;

    const progressFill = document.getElementById('quiz-session-progress');
    if (progressFill) {
        progressFill.style.width = `${(currentQuizIndex / quizQuestions.length) * 100}%`;
    }

    const flagBtn = document.getElementById('quiz-flag-btn');
    if (flagBtn) {
        flagBtn.classList.remove('is-flagged');
        flagBtn.setAttribute('aria-pressed', 'false');
    }
    
    // Show question
    document.getElementById('quiz-question-text').textContent = question.savol;
    
    // Show answers
    const answersContainer = document.getElementById('quiz-answers');
    answersContainer.innerHTML = question.variantlar.map((variant, index) => `
        <button type="button" class="quiz-answer-card" onclick="selectQuizAnswer(${index})">
            <span class="quiz-answer-card__letter">${String.fromCharCode(65 + index)}</span>
            <span class="quiz-answer-card__text">${variant}</span>
            <span class="quiz-answer-card__check" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </span>
        </button>
    `).join('');
    
    // Start timer
    startQuizTimer();
}

function startQuizTimer() {
    quizTimeLeft = 20;
    updateQuizTimer();
    
    if (quizTimer) clearInterval(quizTimer);
    
    quizTimer = setInterval(() => {
        quizTimeLeft--;
        updateQuizTimer();
        
        if (quizTimeLeft <= 0) {
            clearInterval(quizTimer);
            quizTimeOut();
        }
    }, 1000);
}

function updateQuizTimer() {
    const fill = document.getElementById('quiz-timer-fill');
    const percentage = (quizTimeLeft / 20) * 100;
    fill.style.width = percentage + '%';
    
    const timerText = document.getElementById('quiz-timer-text');
    if (timerText) {
        const mins = String(Math.floor(quizTimeLeft / 60)).padStart(2, '0');
        const secs = String(quizTimeLeft % 60).padStart(2, '0');
        timerText.textContent = `00:${mins}:${secs}`;
    }

    const timerBadge = document.getElementById('quiz-timer-badge');
    if (timerBadge) {
        timerBadge.classList.toggle('warning', quizTimeLeft <= 5);
    }
    
    if (quizTimeLeft <= 5) {
        fill.classList.add('warning');
    } else {
        fill.classList.remove('warning');
    }
}

function quizTimeOut() {
    const question = quizQuestions[currentQuizIndex];
    const cards = document.querySelectorAll('.quiz-answer-card');
    
    // Show correct answer
    cards[question.togri].classList.add('correct');
    cards.forEach(card => card.classList.add('disabled'));
    
    // Next question after delay
    setTimeout(() => {
        currentQuizIndex++;
        showQuizQuestion();
    }, 2000);
}

function selectQuizAnswer(index) {
    clearInterval(quizTimer);
    
    const question = quizQuestions[currentQuizIndex];
    const cards = document.querySelectorAll('.quiz-answer-card');
    cards[index].classList.add('selected');
    
    // Disable all cards
    cards.forEach(card => card.classList.add('disabled'));
    
    if (index === question.togri) {
        // Correct answer
        cards[index].classList.add('correct');
        quizScore += 10;
        
        // Show "Barakalla!" message
        showCongratsMessage();
        
        document.getElementById('quiz-score').textContent = quizScore;
    } else {
        // Wrong answer
        cards[index].classList.add('wrong');
        cards[question.togri].classList.add('correct');
    }
    
    // Next question after delay
    setTimeout(() => {
        currentQuizIndex++;
        showQuizQuestion();
    }, 2000);
}

function showCongratsMessage() {
    const messages = ['Barakalla!', 'Ajoyib!', 'Zo\'r!', 'A\'lo!', 'Mukammal!'];
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    const div = document.createElement('div');
    div.className = 'congrats-message';
    div.textContent = message + ' 🎉';
    document.body.appendChild(div);
    
    setTimeout(() => {
        div.remove();
    }, 1000);
}

function showQuizResult() {
    document.getElementById('quiz-playing').style.display = 'none';
    document.getElementById('quiz-result').style.display = 'block';
    
    const percentage = (quizScore / 200) * 100;
    const stars = Math.ceil(percentage / 20);
    
    document.getElementById('quiz-result-stars').textContent = '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
    document.getElementById('quiz-final-score').textContent = quizScore;
    
    let message = '';
    if (percentage >= 90) {
        message = `Ajoyib, ${playerName}! Siz haqiqiy ustoz! 🏆`;
    } else if (percentage >= 70) {
        message = `Yaxshi, ${playerName}! Davom eting! 👍`;
    } else if (percentage >= 50) {
        message = `O'rtacha, ${playerName}. Ko'proq mashq qiling! 📚`;
    } else {
        message = `${playerName}, yanada ko'proq o'qing! 💪`;
    }
    document.getElementById('quiz-result-message').textContent = message;
    
    // Save to leaderboard
    saveToLeaderboard('quiz', playerName, quizScore);

    if (window.UserProgress) {
        const category = TEST_CATEGORIES[activeTestCategory];
        const certResult = UserProgress.recordQuizCompleted({
            category: activeTestCategory || 'quiz',
            title: category ? getCatTitle(category) : (document.getElementById('quiz-start-title')?.textContent || 'Kim ko\'p biladi?'),
            score: quizScore,
            maxScore: 200,
            percentage
        });

        let certNotice = document.getElementById('quiz-cert-notice');
        if (!certNotice) {
            certNotice = document.createElement('p');
            certNotice.id = 'quiz-cert-notice';
            certNotice.className = 'quiz-cert-notice';
            document.getElementById('quiz-result-message')?.insertAdjacentElement('afterend', certNotice);
        }
        if (percentage >= 70) {
            certNotice.textContent = certResult?.isNew
                ? '📜 Tabriklaymiz! Sertifikatingiz avtomatik berildi. Yutuqlar sahifasida ko\'ring.'
                : '📜 Sertifikatingiz Yutuqlar sahifasida mavjud.';
            certNotice.hidden = false;
        } else {
            certNotice.hidden = true;
        }
    }
    
    // Show high score comparison
    const leaderboard = getLeaderboard('quiz');
    const highScore = leaderboard[0]?.score || 0;
    
    if (quizScore >= highScore) {
        document.getElementById('quiz-high-score').innerHTML = '🏆 <strong>YANGI REKORD!</strong> Siz eng yuqori natijaga erishdingiz!';
    } else {
        document.getElementById('quiz-high-score').innerHTML = `Eng yuqori natija: <strong>${highScore}</strong> ball`;
    }
}

function restartQuizGame() {
    resetQuizGame();
    document.getElementById('quiz-start').style.display = 'block';
    loadQuizLeaderboard();
}

function resetQuizGame() {
    if (quizTimer) clearInterval(quizTimer);
    currentQuizIndex = 0;
    quizScore = 0;
    quizQuestions = [];
    document.getElementById('quiz-start').style.display = 'block';
    document.getElementById('quiz-playing').style.display = 'none';
    document.getElementById('quiz-result').style.display = 'none';
    const nameInput = document.getElementById('quiz-player-name');
    if (nameInput) nameInput.value = '';
}

function updateTestCardCounts() {
    Object.keys(TEST_CATEGORIES).forEach(categoryId => {
        const countEl = document.querySelector(`[data-test-count="${categoryId}"]`);
        if (!countEl) return;
        const pool = filterQuestionsByCategory(categoryId);
        countEl.textContent = Math.min(20, pool.length);
    });
}

// ===================================
// MEMORY GAME: SHE'R YODLASH
// ===================================

function loadPoemSelector() {
    const container = document.getElementById('poem-selector');
    if (!container) return;

    container.innerHTML = '<p class="text-light">She\'rlar yuklanmoqda...</p>';
    setMemoryStartEnabled(false);

    ensureMemoryPoemsLoaded().then(function (loaded) {
        if (!loaded) {
            container.innerHTML = `
                <p style="color: #c0392b; margin-bottom: 1rem;">
                    She'rlar yuklanmadi. Asarlar → She'rlar manbasiga ulanib bo'lmadi. Keyinroq qayta urinib ko'ring.
                </p>
            `;
            return;
        }

        setMemoryStartEnabled(true);
        container.innerHTML = `
            <h3 style="margin-bottom: 1rem;">Qiyinlik darajasini tanlang:</h3>
            ${Object.keys(MEMORY_DIFFICULTY).map(function (level, index) {
                const config = MEMORY_DIFFICULTY[level];
                return `
                    <label style="display: block; padding: 0.75rem; background: var(--bg); border-radius: 8px; margin-bottom: 0.5rem; cursor: pointer;">
                        <input type="radio" name="memory-difficulty" value="${level}" style="margin-right: 0.5rem;" ${index === 0 ? 'checked' : ''}>
                        ${config.label} — ${level === 'oson' ? 'kamroq' : level === 'qiyin' ? 'yanada ko\'proq' : 'ko\'proq'} so'z yashiriladi
                    </label>
                `;
            }).join('')}
            <p class="text-light" style="margin-top: 1rem;">
                ${memoryPoems.length} ta she'r mavjud. O'yin boshlanganda tasodifiy she'r tanlanadi.
            </p>
        `;
    });
}

function startMemoryGame() {
    const difficultyInput = document.querySelector('input[name="memory-difficulty"]:checked');

    if (!difficultyInput) {
        alert('Iltimos, qiyinlik darajasini tanlang!');
        return;
    }

    if (!memoryPoems.length) {
        alert('She\'rlar hozircha mavjud emas. Keyinroq qayta urinib ko\'ring.');
        console.error('She\'r yodlash: she\'rlar ro\'yxati bo\'sh.');
        return;
    }

    memoryDifficulty = difficultyInput.value;
    const poem = pickRandomMemoryPoem();

    if (!poem) {
        alert('She\'r tanlab bo\'lmadi. Qayta urinib ko\'ring.');
        return;
    }

    prepareSelectedPoemForGame(poem);

    document.getElementById('memory-start').style.display = 'none';
    document.getElementById('memory-playing').style.display = 'block';
    document.getElementById('memory-result').style.display = 'none';
    document.getElementById('poem-display').innerHTML = '';

    showMemoryStage();
}

function showMemoryStage() {
    if (!selectedPoem || !poemLines.length) {
        console.error('She\'r yodlash: tanlangan she\'r yoki satrlar mavjud emas.');
        return;
    }

    document.getElementById('memory-stage').textContent = memoryStage;
    const metaLine = getMemoryPoemMetaLine(selectedPoem);
    document.getElementById('memory-poem-title').innerHTML = metaLine
        ? `${escapeMemoryHtml(selectedPoem.title)}<br><span style="font-size: 0.875rem; font-weight: 400; opacity: 0.85;">${escapeMemoryHtml(metaLine)}</span>`
        : escapeMemoryHtml(selectedPoem.title);

    const display = document.getElementById('poem-display');
    clearMemoryCountdown();

    if (memoryStage === 1) {
        display.innerHTML = poemLines.map(function (line) {
            if (!line.trim()) {
                return renderMemoryLineBreak();
            }
            return '<div class="poem-line">' + escapeMemoryHtml(line) + '</div>';
        }).join('');

        document.getElementById('memory-timer').textContent = '30 soniya';
        document.getElementById('memory-next-btn').style.display = 'block';
        document.getElementById('memory-next-btn').textContent = uiT('gameNextStage', 'Keyingi bosqich →');

        let timeLeft = 30;
        memoryCountdownTimer = setInterval(function () {
            timeLeft -= 1;
            document.getElementById('memory-timer').textContent = timeLeft + ' soniya';
            if (timeLeft <= 0) {
                clearMemoryCountdown();
                document.getElementById('memory-next-btn').textContent = uiT('gameNextStageDone', 'Keyingi bosqich ✓');
            }
        }, 1000);

    } else if (memoryStage === 2) {
        display.innerHTML = renderMemoryPoemHtml(function (word, index) {
            if (shouldHideMemoryWord(index)) {
                return '<span class="poem-word hidden" data-word="' + escapeMemoryHtml(word) + '">' + escapeMemoryHtml(word) + '</span>';
            }
            return '<span class="poem-word">' + escapeMemoryHtml(word) + '</span>';
        });

        document.getElementById('memory-timer').textContent = '';
        document.getElementById('memory-next-btn').textContent = uiT('gameNextStage', 'Keyingi bosqich →');

    } else if (memoryStage === 3) {
        display.innerHTML = renderMemoryPoemHtml(function (word, index) {
            if (shouldHideMemoryWord(index)) {
                return '<span class="poem-word"><input type="text" data-correct="' + escapeMemoryHtml(word.toLowerCase()) + '" data-index="' + index + '" placeholder="___"></span>';
            }
            return '<span class="poem-word">' + escapeMemoryHtml(word) + '</span>';
        });

        document.getElementById('memory-next-btn').textContent = uiT('gameCheck', 'Tekshirish ✓');
    }
}

function memoryNextStage() {
    if (memoryStage === 3) {
        // Check answers
        checkMemoryAnswers();
    } else {
        memoryStage++;
        showMemoryStage();
    }
}

function checkMemoryAnswers() {
    const inputs = document.querySelectorAll('#poem-display input');
    let correct = 0;
    let total = inputs.length;
    
    inputs.forEach(input => {
        const userAnswer = input.value.trim().toLowerCase();
        const correctAnswer = input.dataset.correct;
        const parent = input.parentElement;
        
        if (userAnswer === correctAnswer) {
            parent.classList.add('correct');
            correct++;
        } else {
            parent.classList.add('incorrect');
            input.value = correctAnswer + ' (' + userAnswer + ')';
        }
        input.disabled = true;
    });
    
    // Show result after delay
    setTimeout(() => {
        const percentage = Math.round((correct / total) * 100);
        
        document.getElementById('memory-playing').style.display = 'none';
        document.getElementById('memory-result').style.display = 'block';
        
        document.getElementById('memory-percentage').textContent = percentage;
        
        let message = '';
        if (percentage >= 90) {
            message = 'Mukammal xotira! A\'lo natija! 🏆';
        } else if (percentage >= 70) {
            message = 'Yaxshi xotira! Davom eting! 👍';
        } else if (percentage >= 50) {
            message = 'O\'rtacha. Ko\'proq mashq qiling! 📚';
        } else {
            message = 'Xotira trenajyoridan ko\'proq foydalaning! 💪';
        }
        document.getElementById('memory-result-message').textContent = message;
        
        // Save to leaderboard
        saveToLeaderboard('memory', playerName || 'Anonim', percentage);
        window.UserProgress?.recordGameCompleted?.('She\'r yodlash o\'yini');
    }, 2000);
}

function resetMemoryGame() {
    clearMemoryPoemState();
    document.getElementById('memory-start').style.display = 'block';
    document.getElementById('memory-playing').style.display = 'none';
    document.getElementById('memory-result').style.display = 'none';
    const display = document.getElementById('poem-display');
    if (display) display.innerHTML = '';
    setMemoryStartEnabled(memoryPoems.length > 0 && !memoryPoemsLoadFailed);
}

function playAnotherMemoryPoem() {
    document.getElementById('memory-result').style.display = 'none';
    startMemoryGame();
}

// ===================================
// YEAR MATCH GAME: YILNI MOSLANG
// ===================================

function escapeMatchHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/"/g, '&quot;');
}

function normalizeHayotTimelineEvent(voqea, sortIndex) {
    if (!voqea || voqea.yil == null || !voqea.sarlavha) return null;
    const matn = voqea.qisqa ? String(voqea.qisqa).trim() : String(voqea.sarlavha).trim();
    if (!matn) return null;
    return {
        id: String(voqea.id || `${voqea.yil}-${sortIndex}`),
        yil: Number(voqea.yil),
        sarlavha: String(voqea.sarlavha).trim(),
        matn: matn,
        bosqich: voqea.bosqich || '',
        sortIndex: sortIndex
    };
}

async function ensureTimelineEventsLoaded(forceRefresh) {
    if (timelineEventsLoaded && !forceRefresh) {
        return timelineAllEvents.length > 0;
    }

    if (typeof getHayotFull !== 'function') {
        console.error('Yilni moslang: getHayotFull() topilmadi. data.js yuklanganini tekshiring.');
        timelineEventsLoadFailed = true;
        return false;
    }

    try {
        const hayot = await getHayotFull();
        const voqealar = Array.isArray(hayot?.voqealar) ? hayot.voqealar : [];
        timelineAllEvents = voqealar
            .map(function (voqea, index) { return normalizeHayotTimelineEvent(voqea, index); })
            .filter(Boolean);
        timelineEventsLoaded = true;
        timelineEventsLoadFailed = timelineAllEvents.length === 0;

        if (timelineAllEvents.length === 0) {
            console.error('Yilni moslang: «Hayoti» sahifasidagi voqealar (data/hayot.json) topilmadi.');
        } else {
            console.log(`Yilni moslang: «Hayoti» sahifasidan ${timelineAllEvents.length} ta voqea yuklandi.`);
        }

        return timelineAllEvents.length > 0;
    } catch (error) {
        timelineEventsLoadFailed = true;
        console.error('Yilni moslang: «Hayoti» ma\'lumotlari yuklanmadi.', error);
        return false;
    }
}

function pickMatchRoundEvents() {
    const pool = timelineAllEvents;
    const roundSize = Math.min(
        MATCH_ROUND_SIZE,
        Math.max(MATCH_MIN_ROUND_SIZE, pool.length)
    );

    if (pool.length <= roundSize) {
        return pool.slice();
    }

    return shuffleArray(pool.slice()).slice(0, roundSize);
}

function isMatchTouchUi() {
    return window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window;
}

function getYearSlotById(slotId) {
    return matchShuffledYears.find(function (slot) { return slot.slotId === slotId; });
}

function getEventById(eventId) {
    return matchRoundEvents.find(function (event) { return event.id === eventId; });
}

function getYearSlotForEvent(eventId) {
    const slotId = matchPairs[eventId];
    return slotId ? getYearSlotById(slotId) : null;
}

function isEventPaired(eventId) {
    return Boolean(matchPairs[eventId]);
}

function isYearSlotUsed(slotId) {
    return Object.values(matchPairs).includes(slotId);
}

function clearMatchSelection() {
    matchSelectedEventId = null;
    matchSelectedYearSlotId = null;
    document.querySelectorAll('.year-match-card.is-selected').forEach(function (el) {
        el.classList.remove('is-selected');
    });
}

function resetMatchRoundState() {
    matchPairs = {};
    matchSelectedEventId = null;
    matchSelectedYearSlotId = null;
    matchChecked = false;
    matchDragPayload = null;
}

function pairEventWithYear(eventId, yearSlotId) {
    if (matchChecked || !eventId || !yearSlotId) return;

    Object.keys(matchPairs).forEach(function (key) {
        if (matchPairs[key] === yearSlotId) {
            delete matchPairs[key];
        }
    });

    matchPairs[eventId] = yearSlotId;
    clearMatchSelection();
    renderYearMatchBoard();
}

function unpairEvent(eventId) {
    if (matchChecked) return;
    delete matchPairs[eventId];
    clearMatchSelection();
    renderYearMatchBoard();
}

function handleMatchEventClick(eventId) {
    if (matchChecked) return;

    if (matchSelectedEventId === eventId) {
        clearMatchSelection();
        return;
    }

    if (isEventPaired(eventId) && !matchSelectedYearSlotId) {
        unpairEvent(eventId);
        return;
    }

    if (matchSelectedYearSlotId) {
        pairEventWithYear(eventId, matchSelectedYearSlotId);
        return;
    }

    clearMatchSelection();
    matchSelectedEventId = eventId;
    const card = document.querySelector(`.year-match-card--event[data-event-id="${CSS.escape(eventId)}"]`);
    if (card) card.classList.add('is-selected');
}

function handleMatchYearClick(slotId) {
    if (matchChecked) return;

    if (matchSelectedYearSlotId === slotId) {
        clearMatchSelection();
        return;
    }

    if (matchSelectedEventId) {
        pairEventWithYear(matchSelectedEventId, slotId);
        return;
    }

    if (isYearSlotUsed(slotId)) {
        const pairedEventId = Object.keys(matchPairs).find(function (key) {
            return matchPairs[key] === slotId;
        });
        if (pairedEventId) unpairEvent(pairedEventId);
        return;
    }

    clearMatchSelection();
    matchSelectedYearSlotId = slotId;
    const card = document.querySelector(`.year-match-card--year[data-slot-id="${CSS.escape(slotId)}"]`);
    if (card) card.classList.add('is-selected');
}

function renderYearMatchBoard() {
    const eventsEl = document.getElementById('match-events');
    const yearsEl = document.getElementById('match-years');
    const pairsPanel = document.getElementById('match-pairs-panel');
    const pairsList = document.getElementById('match-pairs-list');
    const pairedCountEl = document.getElementById('match-paired-count');
    const totalCountEl = document.getElementById('match-total-count');
    const checkBtn = document.getElementById('match-check-btn');
    const touchUi = isMatchTouchUi();
    const draggable = !touchUi && !matchChecked;

    if (!eventsEl || !yearsEl) return;

    eventsEl.innerHTML = matchShuffledEvents.map(function (event) {
        const pairedSlot = getYearSlotForEvent(event.id);
        const pairedClass = pairedSlot ? ' is-paired' : '';
        const selectedClass = matchSelectedEventId === event.id ? ' is-selected' : '';
        const statusClass = matchChecked ? (pairedSlot && pairedSlot.eventId === event.id ? ' is-correct' : ' is-wrong') : '';
        const pairedYearHtml = pairedSlot
            ? `<span class="year-match-card__paired-year">${pairedSlot.yil}</span>`
            : '';
        const correctHint = matchChecked && (!pairedSlot || pairedSlot.eventId !== event.id)
            ? `<span class="year-match-card__correct-hint">To'g'ri yil: ${event.yil}</span>`
            : '';

        return `
            <button type="button"
                class="year-match-card year-match-card--event${pairedClass}${selectedClass}${statusClass}"
                data-event-id="${escapeMatchHtml(event.id)}"
                draggable="${draggable ? 'true' : 'false'}"
                aria-pressed="${matchSelectedEventId === event.id ? 'true' : 'false'}">
                <span class="year-match-card__label">${escapeMatchHtml(event.sarlavha)}</span>
                ${pairedYearHtml}
                ${correctHint}
            </button>
        `;
    }).join('');

    yearsEl.innerHTML = matchShuffledYears.map(function (slot) {
        const used = isYearSlotUsed(slot.slotId);
        const selectedClass = matchSelectedYearSlotId === slot.slotId ? ' is-selected' : '';
        const usedClass = used ? ' is-used' : '';

        let checkClass = '';
        if (matchChecked && used) {
            const eventId = Object.keys(matchPairs).find(function (key) { return matchPairs[key] === slot.slotId; });
            checkClass = eventId && eventId === slot.eventId ? ' is-correct' : ' is-wrong';
        }

        return `
            <button type="button"
                class="year-match-card year-match-card--year${usedClass}${selectedClass}${checkClass}"
                data-slot-id="${escapeMatchHtml(slot.slotId)}"
                data-year="${slot.yil}"
                draggable="${draggable && !used ? 'true' : 'false'}"
                aria-pressed="${matchSelectedYearSlotId === slot.slotId ? 'true' : 'false'}">
                <span class="year-match-card__year">${slot.yil}</span>
            </button>
        `;
    }).join('');

    bindYearMatchInteractions(eventsEl, yearsEl, draggable);

    const pairedCount = Object.keys(matchPairs).length;
    const total = matchRoundEvents.length;
    if (pairedCountEl) pairedCountEl.textContent = String(pairedCount);
    if (totalCountEl) totalCountEl.textContent = String(total);
    if (checkBtn) checkBtn.disabled = pairedCount !== total || matchChecked;

    if (pairsPanel && pairsList) {
        const entries = Object.keys(matchPairs).map(function (eventId) {
            const event = getEventById(eventId);
            const slot = getYearSlotForEvent(eventId);
            if (!event || !slot) return '';
            return `<li class="year-match-pairs__item"><span>${escapeMatchHtml(event.sarlavha)}</span><span class="year-match-pairs__arrow">→</span><span>${slot.yil}</span></li>`;
        }).filter(Boolean);

        if (entries.length > 0) {
            pairsPanel.hidden = false;
            pairsList.innerHTML = entries.join('');
        } else {
            pairsPanel.hidden = true;
            pairsList.innerHTML = '';
        }
    }
}

function bindYearMatchInteractions(eventsEl, yearsEl, draggable) {
    eventsEl.querySelectorAll('.year-match-card--event').forEach(function (card) {
        card.addEventListener('click', function () {
            handleMatchEventClick(card.dataset.eventId);
        });

        if (draggable) {
            card.addEventListener('dragstart', handleMatchDragStart);
            card.addEventListener('dragend', handleMatchDragEnd);
            card.addEventListener('dragover', handleMatchDragOver);
            card.addEventListener('dragleave', handleMatchDragLeave);
            card.addEventListener('drop', handleMatchDropOnEvent);
        }
    });

    yearsEl.querySelectorAll('.year-match-card--year').forEach(function (card) {
        card.addEventListener('click', function () {
            handleMatchYearClick(card.dataset.slotId);
        });

        if (draggable) {
            card.addEventListener('dragstart', handleMatchDragStart);
            card.addEventListener('dragend', handleMatchDragEnd);
            card.addEventListener('dragover', handleMatchDragOver);
            card.addEventListener('dragleave', handleMatchDragLeave);
            card.addEventListener('drop', handleMatchDropOnYear);
        }
    });
}

function handleMatchDragStart(e) {
    if (matchChecked) {
        e.preventDefault();
        return;
    }

    const isEvent = this.classList.contains('year-match-card--event');
    matchDragPayload = {
        type: isEvent ? 'event' : 'year',
        id: isEvent ? this.dataset.eventId : this.dataset.slotId
    };
    this.classList.add('is-dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', matchDragPayload.id || '');
}

function handleMatchDragOver(e) {
    e.preventDefault();
    if (!matchDragPayload || matchChecked) return;
    this.classList.add('is-drop-target');
    e.dataTransfer.dropEffect = 'move';
}

function handleMatchDragLeave() {
    this.classList.remove('is-drop-target');
}

function handleMatchDropOnYear(e) {
    e.preventDefault();
    this.classList.remove('is-drop-target');
    if (!matchDragPayload || matchDragPayload.type !== 'event') return;
    pairEventWithYear(matchDragPayload.id, this.dataset.slotId);
}

function handleMatchDropOnEvent(e) {
    e.preventDefault();
    this.classList.remove('is-drop-target');
    if (!matchDragPayload || matchDragPayload.type !== 'year') return;
    pairEventWithYear(this.dataset.eventId, matchDragPayload.id);
}

function handleMatchDragEnd() {
    this.classList.remove('is-dragging');
    matchDragPayload = null;
    document.querySelectorAll('.year-match-card.is-drop-target').forEach(function (el) {
        el.classList.remove('is-drop-target');
    });
}

function setYearMatchFeedback(message, type) {
    const feedback = document.getElementById('timeline-feedback');
    if (!feedback) return;
    feedback.hidden = false;
    feedback.textContent = message;
    feedback.className = 'year-match-feedback year-match-feedback--' + (type || 'info');
}

function clearYearMatchFeedback() {
    const feedback = document.getElementById('timeline-feedback');
    if (feedback) {
        feedback.hidden = true;
        feedback.textContent = '';
        feedback.className = 'year-match-feedback';
    }
}

async function prepareTimelineGame() {
    const startScreen = document.querySelector('#timeline-game .year-match-start');
    const playing = document.getElementById('timeline-playing');
    const result = document.getElementById('timeline-result');
    const startBtn = document.getElementById('timeline-start-btn');

    if (startBtn) startBtn.disabled = true;

    const loaded = await ensureTimelineEventsLoaded(true);
    if (!loaded) {
        if (startScreen) {
            startScreen.querySelector('.year-match-start__error')?.remove();
            const error = document.createElement('p');
            error.className = 'year-match-start__error';
            error.textContent = uiT('gameEventsLoadError', 'Voqealar yuklanmadi. Keyinroq qayta urinib ko\'ring.');
            startScreen.appendChild(error);
        }
        if (startBtn) startBtn.disabled = true;
        return;
    }

    if (startBtn) startBtn.disabled = false;
    if (startScreen) startScreen.style.display = 'block';
    if (playing) playing.style.display = 'none';
    if (result) result.style.display = 'none';
}

function startTimelineGame() {
    if (!timelineAllEvents.length) {
        alert('Voqealar hozircha mavjud emas. Keyinroq qayta urinib ko\'ring.');
        return;
    }

    resetMatchRoundState();
    clearYearMatchFeedback();

    matchRoundEvents = pickMatchRoundEvents();
    matchShuffledEvents = shuffleArray(matchRoundEvents.slice());
    matchShuffledYears = shuffleArray(matchRoundEvents.map(function (event) {
        return {
            slotId: 'ys-' + event.id,
            yil: event.yil,
            eventId: event.id
        };
    }));

    renderYearMatchBoard();

    document.querySelector('#timeline-game .year-match-start').style.display = 'none';
    document.getElementById('timeline-playing').style.display = 'block';
    document.getElementById('timeline-result').style.display = 'none';
}

function checkYearMatch() {
    const total = matchRoundEvents.length;
    if (!total || Object.keys(matchPairs).length !== total) return;

    matchChecked = true;
    let correctCount = 0;

    matchRoundEvents.forEach(function (event) {
        const slot = getYearSlotForEvent(event.id);
        if (slot && slot.eventId === event.id) {
            correctCount += 1;
        }
    });

    renderYearMatchBoard();

    const checkBtn = document.getElementById('match-check-btn');
    if (checkBtn) checkBtn.disabled = true;

    if (correctCount === total) {
        setYearMatchFeedback('Ajoyib! Barcha voqealarni to\'g\'ri yillar bilan moslashtirdingiz.', 'success');
    } else {
        setYearMatchFeedback(
            `${total - correctCount} ta juftlik noto\'g\'ri. Qizil belgilangan voqealar uchun to\'g\'ri yil ko\'rsatildi.`,
            'warning'
        );
    }

    const scorePercent = Math.round((correctCount / total) * 100);
    document.getElementById('timeline-final-score').textContent = String(correctCount);
    document.getElementById('timeline-final-total').textContent = String(total);
    document.getElementById('timeline-result-message').textContent =
        `${total} ta voqeadan ${correctCount} tasini to'g'ri moslashtirdingiz.`;

    setTimeout(function () {
        document.getElementById('timeline-playing').style.display = 'none';
        document.getElementById('timeline-result').style.display = 'block';
        saveToLeaderboard('timeline', playerName || 'Anonim', scorePercent);
        window.UserProgress?.recordGameCompleted?.('Xronologiya o\'yini');
    }, correctCount === total ? 900 : 1800);
}

function restartTimelineGame() {
    startTimelineGame();
}

function resetTimelineGame() {
    resetMatchRoundState();
    matchRoundEvents = [];
    matchShuffledEvents = [];
    matchShuffledYears = [];

    const playing = document.getElementById('timeline-playing');
    const result = document.getElementById('timeline-result');
    const startScreen = document.querySelector('#timeline-game .year-match-start');
    const eventsEl = document.getElementById('match-events');
    const yearsEl = document.getElementById('match-years');
    const pairsPanel = document.getElementById('match-pairs-panel');

    if (startScreen) startScreen.style.display = 'block';
    if (playing) playing.style.display = 'none';
    if (result) result.style.display = 'none';
    if (eventsEl) eventsEl.innerHTML = '';
    if (yearsEl) yearsEl.innerHTML = '';
    if (pairsPanel) pairsPanel.hidden = true;
    clearYearMatchFeedback();
}


// ===================================
// WORD SEARCH GAME: SO'Z TOPISH
// ===================================

function normalizeWordSearchToken(value) {
    return String(value || '')
        .toUpperCase()
        .replace(/O[''`ʻʼ]/g, 'O')
        .replace(/G[''`ʻʼ]/g, 'G')
        .replace(/[''`ʻʼ]/g, '')
        .replace(/[^A-Z]/g, '');
}

function addWordSearchCandidates(set, value) {
    const word = normalizeWordSearchToken(value);
    if (word.length >= 4 && word.length <= 12) {
        set.add(word);
    }
}

async function loadWordSearchPool(forceRefresh) {
    if (wordSearchPoolLoaded && !forceRefresh && wordSearchPool.length) {
        return wordSearchPool.length > 0;
    }

    const pool = new Set();

    try {
        if (typeof getSherlar === 'function') {
            const sherlar = await getSherlar();
            (Array.isArray(sherlar) ? sherlar : []).forEach(function (sher) {
                addWordSearchCandidates(pool, sher.sarlavha);
                (sher.mavzu || []).forEach(function (m) { addWordSearchCandidates(pool, m); });
            });
        }

        if (typeof getAsarlarList === 'function') {
            const asarlar = await getAsarlarList();
            (Array.isArray(asarlar) ? asarlar : []).forEach(function (asar) {
                addWordSearchCandidates(pool, asar.nomi);
                (asar.kalitSozlar || []).forEach(function (k) { addWordSearchCandidates(pool, k); });
            });
        }

        if (typeof getHayotFull === 'function') {
            const hayot = await getHayotFull();
            (hayot?.voqealar || []).forEach(function (v) { addWordSearchCandidates(pool, v.sarlavha); });
            Object.values(hayot?.bosqichlar || {}).forEach(function (b) {
                addWordSearchCandidates(pool, b.sarlavha);
            });
            (hayot?.overview || []).forEach(function (item) {
                addWordSearchCandidates(pool, item.title);
                addWordSearchCandidates(pool, item.label);
            });
        }

        if (typeof getDostonlar === 'function') {
            const dostonlar = await getDostonlar();
            (Array.isArray(dostonlar) ? dostonlar : []).forEach(function (d) {
                addWordSearchCandidates(pool, d.sarlavha);
            });
        }
    } catch (error) {
        console.error('So\'z topish: ma\'lumotlar yuklanmadi.', error);
    }

    wordSearchPool = Array.from(pool);
    wordSearchPoolLoaded = wordSearchPool.length > 0;

    if (!wordSearchPoolLoaded) {
        console.error('So\'z topish: platforma ma\'lumotlaridan so\'zlar topilmadi.');
    }

    return wordSearchPoolLoaded;
}

function pickWordSearchRoundWords() {
    const shuffled = shuffleArray(wordSearchPool.slice());
    const size = Math.min(WORD_SEARCH_ROUND_SIZE, shuffled.length);
    return shuffled.slice(0, size);
}

function calculateWordSearchGridSize(words) {
    const maxLen = words.reduce(function (max, word) {
        return Math.max(max, word.length);
    }, 4);
    const base = Math.max(10, maxLen + 3);
    return Math.min(14, base);
}

function canPlaceWordInGrid(word, row, col, dir, gridSize) {
    const dRow = dir[0];
    const dCol = dir[1];
    const endRow = row + dRow * (word.length - 1);
    const endCol = col + dCol * (word.length - 1);

    if (endRow < 0 || endCol < 0 || endRow >= gridSize || endCol >= gridSize) {
        return false;
    }

    for (let i = 0; i < word.length; i += 1) {
        const r = row + dRow * i;
        const c = col + dCol * i;
        const existing = wordGrid[r][c];
        if (existing !== '' && existing !== word[i]) {
            return false;
        }
    }

    return true;
}

function placeWordInGrid(word, row, col, dir) {
    const cells = [];
    const dRow = dir[0];
    const dCol = dir[1];

    for (let i = 0; i < word.length; i += 1) {
        const r = row + dRow * i;
        const c = col + dCol * i;
        wordGrid[r][c] = word[i];
        cells.push({ row: r, col: c });
    }

    wordPlacements[word] = cells;
}

function buildWordSearchGrid(words) {
    let gridSize = calculateWordSearchGridSize(words);
    let placedWords = [];
    let attempt = 0;

    while (attempt < 6) {
        wordSearchGridSize = gridSize;
        wordGrid = Array(gridSize).fill(null).map(function () {
            return Array(gridSize).fill('');
        });
        wordPlacements = {};
        placedWords = [];

        const sortedWords = words.slice().sort(function (a, b) { return b.length - a.length; });

        sortedWords.forEach(function (word) {
            let placed = false;
            for (let tries = 0; tries < 250 && !placed; tries += 1) {
                const dir = WORD_SEARCH_DIRECTIONS[Math.floor(Math.random() * WORD_SEARCH_DIRECTIONS.length)];
                const row = Math.floor(Math.random() * gridSize);
                const col = Math.floor(Math.random() * gridSize);
                if (canPlaceWordInGrid(word, row, col, dir, gridSize)) {
                    placeWordInGrid(word, row, col, dir);
                    placedWords.push(word);
                    placed = true;
                }
            }
        });

        if (placedWords.length === words.length) {
            break;
        }

        gridSize += 1;
        attempt += 1;
    }

    wordsToFind = placedWords.slice();

    for (let r = 0; r < wordSearchGridSize; r += 1) {
        for (let c = 0; c < wordSearchGridSize; c += 1) {
            if (wordGrid[r][c] === '') {
                wordGrid[r][c] = WORD_SEARCH_FILL_LETTERS[
                    Math.floor(Math.random() * WORD_SEARCH_FILL_LETTERS.length)
                ];
            }
        }
    }
}

function renderWordSearchGrid() {
    const container = document.getElementById('word-grid');
    if (!container) return;

    container.style.setProperty('--ws-cols', String(wordSearchGridSize));
    container.innerHTML = '';

    for (let r = 0; r < wordSearchGridSize; r += 1) {
        for (let c = 0; c < wordSearchGridSize; c += 1) {
            const cell = document.createElement('button');
            cell.type = 'button';
            cell.className = 'word-cell';
            cell.dataset.row = String(r);
            cell.dataset.col = String(c);
            cell.setAttribute('role', 'gridcell');
            cell.setAttribute('aria-label', wordGrid[r][c]);
            cell.textContent = wordGrid[r][c];
            container.appendChild(cell);
        }
    }

    bindWordSearchGridEvents(container);
}

function bindWordSearchGridEvents(container) {
    container.onmousedown = handleWordSearchMouseDown;
    container.onmousemove = handleWordSearchMouseMove;
    container.onmouseup = handleWordSearchMouseUp;

    container.ontouchstart = handleWordSearchTouchStart;
    container.ontouchmove = handleWordSearchTouchMove;
    container.ontouchend = handleWordSearchTouchEnd;
    container.ontouchcancel = handleWordSearchTouchEnd;

    if (!window.__wordSearchDocMouseUpBound) {
        document.addEventListener('mouseup', handleWordSearchMouseUp);
        window.__wordSearchDocMouseUpBound = true;
    }
}

function getWordSearchCellFromPoint(clientX, clientY) {
    const element = document.elementFromPoint(clientX, clientY);
    if (!element || !element.classList.contains('word-cell')) return null;
    return {
        row: Number(element.dataset.row),
        col: Number(element.dataset.col),
        element: element
    };
}

function getWordSearchCellElement(row, col) {
    return document.querySelector(`.word-cell[data-row="${row}"][data-col="${col}"]`);
}

function getCellsOnWordSearchLine(start, end) {
    if (!start || !end) return null;

    const dr = end.row - start.row;
    const dc = end.col - start.col;
    const steps = Math.max(Math.abs(dr), Math.abs(dc));

    if (steps === 0) {
        return [{ row: start.row, col: start.col }];
    }

    if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) {
        return null;
    }

    const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
    const stepC = dc === 0 ? 0 : dc / Math.abs(dc);
    const cells = [];

    for (let i = 0; i <= steps; i += 1) {
        cells.push({
            row: start.row + stepR * i,
            col: start.col + stepC * i
        });
    }

    return cells;
}

function clearWordSearchSelectionHighlight() {
    document.querySelectorAll('.word-cell.is-selecting').forEach(function (cell) {
        cell.classList.remove('is-selecting');
    });
    wordSearchCurrentCells = [];
}

function highlightWordSearchCells(cells) {
    clearWordSearchSelectionHighlight();
    if (!cells) return;

    wordSearchCurrentCells = cells;
    cells.forEach(function (cell) {
        const element = getWordSearchCellElement(cell.row, cell.col);
        if (element && !element.classList.contains('found')) {
            element.classList.add('is-selecting');
        }
    });
}

function getSelectedWordFromCells(cells) {
    if (!cells || !cells.length) return '';
    return cells.map(function (cell) {
        return wordGrid[cell.row][cell.col];
    }).join('');
}

function markWordSearchWordFound(word, cells) {
    if (foundWords.includes(word)) return;

    foundWords.push(word);
    wordSearchScore += WORD_SEARCH_POINTS;

    cells.forEach(function (cell) {
        const element = getWordSearchCellElement(cell.row, cell.col);
        if (element) {
            element.classList.remove('is-selecting');
            element.classList.add('found');
        }
    });

    updateWordSearchUi();

    if (foundWords.length === wordsToFind.length) {
        endWordSearchGame(true);
    }
}

function validateWordSearchSelection(cells) {
    if (!cells || cells.length < 4) return;

    const selectedWord = getSelectedWordFromCells(cells);
    const reversedWord = selectedWord.split('').reverse().join('');

    let matchedWord = wordsToFind.find(function (word) {
        return !foundWords.includes(word) && (word === selectedWord || word === reversedWord);
    });

    if (!matchedWord) return;

    markWordSearchWordFound(matchedWord, cells);
}

function finishWordSearchSelection(endCell) {
    if (!wordSearchSelectAnchor || !endCell) return;

    const cells = getCellsOnWordSearchLine(wordSearchSelectAnchor, endCell);
    highlightWordSearchCells(cells);
    validateWordSearchSelection(cells);
    clearWordSearchSelectionHighlight();
}

function handleWordSearchMouseDown(event) {
    if (!wordSearchGameActive || wordSearchEnded) return;
    if (event.button !== 0) return;

    const cell = getWordSearchCellFromPoint(event.clientX, event.clientY);
    if (!cell || cell.element.classList.contains('found')) return;

    event.preventDefault();
    wordSearchSelecting = true;
    wordSearchSelectAnchor = { row: cell.row, col: cell.col };
    highlightWordSearchCells([wordSearchSelectAnchor]);
}

function handleWordSearchMouseMove(event) {
    if (!wordSearchSelecting || !wordSearchSelectAnchor) return;

    const cell = getWordSearchCellFromPoint(event.clientX, event.clientY);
    if (!cell) return;

    const cells = getCellsOnWordSearchLine(wordSearchSelectAnchor, cell);
    highlightWordSearchCells(cells);
}

function handleWordSearchMouseUp(event) {
    if (!wordSearchSelecting) return;

    const cell = getWordSearchCellFromPoint(event.clientX, event.clientY);
    if (cell) {
        finishWordSearchSelection({ row: cell.row, col: cell.col });
    } else {
        clearWordSearchSelectionHighlight();
    }

    wordSearchSelecting = false;
    wordSearchSelectAnchor = null;
}

function handleWordSearchTouchStart(event) {
    if (!wordSearchGameActive || wordSearchEnded) return;

    const touch = event.changedTouches[0];
    const cell = getWordSearchCellFromPoint(touch.clientX, touch.clientY);
    if (!cell || cell.element.classList.contains('found')) return;

    if (wordSearchTapStart &&
        wordSearchTapStart.row === cell.row &&
        wordSearchTapStart.col === cell.col) {
        wordSearchTapStart = null;
        clearWordSearchSelectionHighlight();
        return;
    }

    if (wordSearchTapStart) {
        event.preventDefault();
        finishWordSearchSelection({ row: cell.row, col: cell.col });
        wordSearchTapStart = null;
        wordSearchSelecting = false;
        wordSearchSelectAnchor = null;
        return;
    }

    event.preventDefault();
    wordSearchSelecting = true;
    wordSearchSelectAnchor = { row: cell.row, col: cell.col };
    wordSearchTapStart = { row: cell.row, col: cell.col };
    highlightWordSearchCells([wordSearchSelectAnchor]);
}

function handleWordSearchTouchMove(event) {
    if (!wordSearchSelecting || !wordSearchSelectAnchor) return;

    event.preventDefault();
    const touch = event.changedTouches[0];
    const cell = getWordSearchCellFromPoint(touch.clientX, touch.clientY);
    if (!cell) return;

    wordSearchTapStart = null;
    const cells = getCellsOnWordSearchLine(wordSearchSelectAnchor, cell);
    highlightWordSearchCells(cells);
}

function handleWordSearchTouchEnd(event) {
    if (!wordSearchSelecting) return;

    const touch = event.changedTouches[0];
    const cell = getWordSearchCellFromPoint(touch.clientX, touch.clientY);

    if (cell && !wordSearchTapStart) {
        finishWordSearchSelection({ row: cell.row, col: cell.col });
    }

    wordSearchSelecting = false;
    wordSearchSelectAnchor = null;
}

function displayWordsToFind() {
    const container = document.getElementById('words-to-find');
    if (!container) return;

    container.innerHTML = wordsToFind.map(function (word) {
        const isFound = foundWords.includes(word);
        return `
            <li class="word-item${isFound ? ' found' : ''}" data-word="${word}">
                <span class="word-item__mark" aria-hidden="true">${isFound ? '✓' : '○'}</span>
                <span class="word-item__text">${word}</span>
            </li>
        `;
    }).join('');
}

function updateWordSearchUi() {
    const foundEl = document.getElementById('words-found');
    const totalEl = document.getElementById('words-total');
    const scoreEl = document.getElementById('wordsearch-score-live');

    if (foundEl) foundEl.textContent = String(foundWords.length);
    if (totalEl) totalEl.textContent = String(wordsToFind.length);
    if (scoreEl) scoreEl.textContent = String(wordSearchScore);

    displayWordsToFind();
}

function updateWordSearchTimer() {
    const timerEl = document.getElementById('wordsearch-timer');
    if (!timerEl) return;

    const minutes = Math.floor(wordSearchTimeLeft / 60);
    const seconds = wordSearchTimeLeft % 60;
    timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function stopWordSearchTimer() {
    if (wordSearchTimer) {
        clearInterval(wordSearchTimer);
        wordSearchTimer = null;
    }
}

async function prepareWordSearchGame() {
    const startScreen = document.querySelector('#wordsearch-game .wordsearch-start');
    const playing = document.getElementById('wordsearch-playing');
    const result = document.getElementById('wordsearch-result');
    const startBtn = document.getElementById('wordsearch-start-btn');

    if (startBtn) startBtn.disabled = true;

    const loaded = await loadWordSearchPool(true);
    if (!loaded) {
        if (startScreen) {
            startScreen.querySelector('.wordsearch-start__error')?.remove();
            const error = document.createElement('p');
            error.className = 'wordsearch-start__error';
            error.textContent = uiT('gameWordsLoadError', 'So\'zlar yuklanmadi. Keyinroq qayta urinib ko\'ring.');
            startScreen.appendChild(error);
        }
        if (startBtn) startBtn.disabled = true;
        return;
    }

    if (startBtn) startBtn.disabled = false;
    if (startScreen) startScreen.style.display = 'block';
    if (playing) playing.style.display = 'none';
    if (result) result.style.display = 'none';
}

function startWordSearchGame() {
    if (!wordSearchPool.length) {
        alert('So\'zlar hozircha mavjud emas. Keyinroq qayta urinib ko\'ring.');
        return;
    }

    stopWordSearchTimer();
    wordSearchGameActive = true;
    wordSearchEnded = false;
    foundWords = [];
    wordSearchScore = 0;
    wordSearchSelecting = false;
    wordSearchSelectAnchor = null;
    wordSearchTapStart = null;

    const roundWords = pickWordSearchRoundWords();
    buildWordSearchGrid(roundWords);
    renderWordSearchGrid();
    updateWordSearchUi();

    wordSearchTimeLeft = 300;
    updateWordSearchTimer();
    wordSearchTimer = setInterval(function () {
        wordSearchTimeLeft -= 1;
        updateWordSearchTimer();
        if (wordSearchTimeLeft <= 0) {
            stopWordSearchTimer();
            endWordSearchGame(false);
        }
    }, 1000);

    document.querySelector('#wordsearch-game .wordsearch-start').style.display = 'none';
    document.getElementById('wordsearch-playing').style.display = 'block';
    document.getElementById('wordsearch-result').style.display = 'none';
}

function endWordSearchGame(completed) {
    if (wordSearchEnded) return;

    wordSearchEnded = true;
    wordSearchGameActive = false;
    stopWordSearchTimer();
    clearWordSearchSelectionHighlight();

    const total = wordsToFind.length;
    const found = foundWords.length;
    const allFound = completed || found === total;

    document.getElementById('wordsearch-playing').style.display = 'none';
    document.getElementById('wordsearch-result').style.display = 'block';

    document.getElementById('wordsearch-result-title').textContent = allFound
        ? `🎉 ${uiT('gameCongratulations', 'Tabriklaymiz!')}`
        : `⏱ ${uiT('gameTimeUp', 'Vaqt tugadi!')}`;
    document.getElementById('wordsearch-score').textContent = String(found);
    document.getElementById('wordsearch-score-total').textContent = String(total);
    document.getElementById('wordsearch-final-ball').textContent = String(wordSearchScore);

    const messageEl = document.getElementById('wordsearch-result-message');
    const missedList = document.getElementById('wordsearch-missed-list');

    if (allFound) {
        messageEl.textContent = uiT('gameAllWordsFound', 'Barcha so\'zlarni topdingiz.');
        window.UserProgress?.recordGameCompleted?.('So\'z topish o\'yini');
    } else {
        messageEl.textContent = `${total} ta so'zdan ${found} tasini topdingiz.`;
    }

    const missed = wordsToFind.filter(function (word) {
        return !foundWords.includes(word);
    });

    if (missedList) {
        if (missed.length > 0 && !allFound) {
            missedList.hidden = false;
            missedList.innerHTML = missed.map(function (word) {
                return `<li>${word}</li>`;
            }).join('');
        } else {
            missedList.hidden = true;
            missedList.innerHTML = '';
        }
    }

    saveToLeaderboard('wordsearch', playerName || 'Anonim', wordSearchScore);
}

function resetWordSearchGame() {
    stopWordSearchTimer();
    wordSearchGameActive = false;
    wordSearchEnded = false;
    foundWords = [];
    wordsToFind = [];
    wordSearchScore = 0;
    wordSearchSelecting = false;
    wordSearchSelectAnchor = null;
    wordSearchTapStart = null;
    wordPlacements = {};
    wordGrid = [];

    const startScreen = document.querySelector('#wordsearch-game .wordsearch-start');
    const playing = document.getElementById('wordsearch-playing');
    const result = document.getElementById('wordsearch-result');
    const grid = document.getElementById('word-grid');

    if (startScreen) startScreen.style.display = 'block';
    if (playing) playing.style.display = 'none';
    if (result) result.style.display = 'none';
    if (grid) grid.innerHTML = '';
}

// ===================================
// LEADERBOARD SYSTEM
// ===================================

function getLeaderboard(game) {
    const key = `leaderboard_${game}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

function saveToLeaderboard(game, name, score) {
    const key = `leaderboard_${game}`;
    let leaderboard = getLeaderboard(game);
    
    // Add new entry
    leaderboard.push({
        name: name,
        score: score,
        date: new Date().toISOString()
    });
    
    // Sort by score (descending)
    leaderboard.sort((a, b) => b.score - a.score);
    
    // Keep top 10
    leaderboard = leaderboard.slice(0, 10);
    
    // Save
    localStorage.setItem(key, JSON.stringify(leaderboard));
}

function loadGlobalLeaderboard() {
    const container = document.getElementById('global-leaderboard');
    
    const games = [
        { key: 'quiz', name: '🎯 Kim ko\'p biladi?', maxScore: 200 },
        { key: 'memory', name: '📝 She\'r yodlash', maxScore: 100 },
        { key: 'timeline', name: '📅 Yilni moslang', maxScore: 100 },
        { key: 'wordsearch', name: '🔍 So\'z topish', maxScore: 100 }
    ];
    
    let html = '';
    
    games.forEach(game => {
        const leaderboard = getLeaderboard(game.key);
        
        html += `
            <div style="margin-bottom: 2rem;">
                <h3 style="color: var(--secondary); margin-bottom: 1rem;">${game.name}</h3>
        `;
        
        if (leaderboard.length === 0) {
            html += '<p class="text-light">Hali hech kim o\'ynamagan</p>';
        } else {
            html += leaderboard.slice(0, 5).map((entry, index) => `
                <div class="leaderboard-entry">
                    <div class="leaderboard-rank">${index + 1}</div>
                    <div class="leaderboard-name">${entry.name}</div>
                    <div class="leaderboard-score">${entry.score}</div>
                </div>
            `).join('');
        }
        
        html += '</div>';
    });
    
    // Calculate total score
    const totalScore = games.reduce((sum, game) => {
        const leaderboard = getLeaderboard(game.key);
        const userScores = leaderboard.filter(e => e.name === playerName);
        const bestScore = userScores.length > 0 ? Math.max(...userScores.map(e => e.score)) : 0;
        return sum + bestScore;
    }, 0);
    
    html = `
        <div style="background: var(--secondary); color: white; padding: 2rem; border-radius: var(--radius); margin-bottom: 2rem; text-align: center;">
            <h3 style="color: white; margin-bottom: 1rem;">Sizning umumiy ballingiz</h3>
            <div style="font-size: 3rem; font-weight: 700;">${totalScore}</div>
        </div>
    ` + html;
    
    container.innerHTML = html;
}

function clearLeaderboard() {
    if (confirm('Haqiqatan ham barcha natijalarni o\'chirmoqchimisiz?')) {
        ['quiz', 'memory', 'timeline', 'wordsearch'].forEach(game => {
            localStorage.removeItem(`leaderboard_${game}`);
        });
        loadGlobalLeaderboard();
        alert('Reyting tozalandi!');
    }
}

// ===================================
// HELPER FUNCTIONS
// ===================================

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', async function() {
    window.PlatformI18n?.registerRefresh?.('interaktiv', refreshInteraktivUI);
    console.log('Interaktiv o\'yinlar sahifasi yuklandi');
    
    // Load quiz data
    try {
        const response = await fetch((window.platformUrl || function (r) { return r; })('data/quiz.json'));
        const data = await response.json();
        quizData = data.savollar;
        console.log(`${quizData.length} ta savol yuklandi`);
        updateTestCardCounts();
    } catch (error) {
        console.error('Savollarni yuklashda xatolik:', error);
        alert('Savollar yuklanmadi. Iltimos, sahifani qayta yuklang.');
    }
    
    // Load saved player name
    const savedName = localStorage.getItem('playerName');
    if (savedName) {
        playerName = savedName;
        const nameInput = document.getElementById('quiz-player-name');
        if (nameInput) nameInput.value = savedName;
    }
    
    // Save player name on input
    document.getElementById('quiz-player-name')?.addEventListener('change', function() {
        localStorage.setItem('playerName', this.value);
    });

    const flagBtn = document.getElementById('quiz-flag-btn');
    if (flagBtn) {
        flagBtn.addEventListener('click', function() {
            this.classList.toggle('is-flagged');
            this.setAttribute('aria-pressed', this.classList.contains('is-flagged') ? 'true' : 'false');
        });
    }
});
