// ===================================
// Interaktiv O'yinlar - JavaScript
// ===================================

// Global o'zgaruvchilar
let quizData = [];
let currentGame = null;
let playerName = '';
let quizQuestionPool = null;
let activeTestCategory = null;

const TEST_CATEGORIES = {
    hayot: {
        title: "G'afur G'ulom hayoti",
        description: "Shoir hayoti, tug'ilgan yili, oilasi va ijodiy yo'li bo'yicha bilimlaringizni sinab ko'ring.",
        mavzu: ['hayot'],
        difficulty: 'Oson',
        duration: '15 daqiqa'
    },
    asarlar: {
        title: "G'afur G'ulom asarlari",
        description: "Romanlar, hikoyalar va dramatik asarlarga oid professional savollar to'plami.",
        mavzu: ['asarlar'],
        difficulty: "O'rta",
        duration: '18 daqiqa'
    },
    sheriyat: {
        title: "She'riyati",
        description: "She'rlar, to'plamlar va poetik ijodga oid chuqur savollar.",
        mavzu: ['asarlar', 'umumiy'],
        keywords: ["she'r", "She'r", "she'rlar", "She'rlar", "Yillar sadosi", "to'plam"],
        difficulty: "O'rta",
        duration: '12 daqiqa'
    },
    hikoya: {
        title: "Hikoya va qissalari",
        description: "Hikoya, qissa va ertaklar bo'yicha bilimlaringizni baholang.",
        mavzu: ['asarlar'],
        keywords: ['hikoya', 'qissa', 'roman', 'Shum bola', 'Ikki eshik', 'ertak'],
        difficulty: 'Qiyin',
        duration: '14 daqiqa'
    },
    ilmiy: {
        title: "Ilmiy bilimlar",
        description: "Adabiyotshunoslik va ilmiy-ma'rifiy bilimlar bo'yicha maxsus test.",
        mavzu: ['umumiy'],
        difficulty: 'Qiyin',
        duration: '10 daqiqa'
    },
    yakuniy: {
        title: 'Yakuniy test',
        description: "Barcha mavzularni qamrab oluvchi yakuniy baholash testi.",
        mavzu: ['hayot', 'asarlar', 'umumiy'],
        all: true,
        difficulty: 'Aralash',
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
        alert('Bu test uchun savollar topilmadi. Iltimos, keyinroq urinib ko\'ring.');
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
    if (titleEl) titleEl.textContent = category.title;
    if (descEl) {
        const count = Math.min(20, pool.length);
        descEl.textContent = `${count} ta savol · ${category.duration} · ${category.difficulty} daraja`;
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
let poemWords = [];
let userAnswers = [];

// Timeline game variables
let timelineEvents = [];
let draggedElement = null;

// Word search variables
let wordGrid = [];
let wordsToFind = [];
let foundWords = [];
let selectedCells = [];
let wordSearchTimer = null;
let wordSearchTimeLeft = 300;

// Poems data
const poems = [
    {
        id: 1,
        title: "O'zbekiston",
        level: "oson",
        text: "O'zbekiston mening Vatanım, Sen beqiyos go'zal yurtsan. Jonimdan ham aziz ekan, Seni sevib qolgan qalbim."
    },
    {
        id: 2,
        title: "Ona",
        level: "oson",
        text: "Onam mening g'azalim, Onam mening o'g'lim. Onam mening havolam, Onam mening to'g'rim."
    },
    {
        id: 3,
        title: "Bahor",
        level: "o'rta",
        text: "Bahor keldi, gulshan ochildi, Ko'klamning sofi havosi keldi. Bulbullar sayrab, gul-gulzor, Tabiat uyg'ondi, quvonch bor."
    },
    {
        id: 4,
        title: "Mehnat",
        level: "o'rta",
        text: "Mehnat qilsang topiladi, Ishla, tinma, dod yoqiladi. Oltin qo'llar, ishchi xalq, Baxtga etadi mehnat orqali."
    },
    {
        id: 5,
        title: "Kitob",
        level: "qiyin",
        text: "Kitob - bilim dengizi, cheksiz, Kitob - ma'rifat yo'li, beamal. O'qishga odatlaning har kecha, Kitobsiz umr o'tar besamar."
    }
];

// Timeline events
const timelineEventsData = [
    { year: 1889, text: "G'afur G'ulom Toshkentda tug'ilgan" },
    { year: 1908, text: "Birinchi she'rini yozgan" },
    { year: 1915, text: "Jadid maktabini tamomla gan" },
    { year: 1920, text: "Birinchi she'rlar to'plami nashr etilgan" },
    { year: 1925, text: "'Yillar sadosi' to'plami chiqdi" },
    { year: 1930, text: "O'zbekiston Yozuvchilar uyushmasiga a'zo bo'ldi" },
    { year: 1939, text: "'Shum bola' romani yozilgan" },
    { year: 1945, text: "O'zbekiston Xalq shoiri unvoni berildi" },
    { year: 1950, text: "Davlat mukofotiga sazovor bo'ldi" },
    { year: 1966, text: "Vafot etdi" }
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
        } else if (gameName === 'wordsearch') {
            startWordSearchGame();
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
        UserProgress.recordQuizCompleted({
            category: activeTestCategory || 'quiz',
            title: category?.title || document.getElementById('quiz-start-title')?.textContent || 'Test',
            score: quizScore,
            maxScore: 200,
            percentage
        });
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
    
    const grouped = {
        'oson': poems.filter(p => p.level === 'oson'),
        'o\'rta': poems.filter(p => p.level === 'o\'rta'),
        'qiyin': poems.filter(p => p.level === 'qiyin')
    };
    
    container.innerHTML = '<h3 style="margin-bottom: 1rem;">She\'r tanlang:</h3>' +
        Object.keys(grouped).map(level => `
            <div style="margin-bottom: 1.5rem;">
                <h4 style="color: var(--secondary); margin-bottom: 0.5rem;">${level.charAt(0).toUpperCase() + level.slice(1)} daraja</h4>
                ${grouped[level].map(poem => `
                    <label style="display: block; padding: 0.75rem; background: var(--bg); border-radius: 8px; margin-bottom: 0.5rem; cursor: pointer;">
                        <input type="radio" name="poem" value="${poem.id}" style="margin-right: 0.5rem;">
                        ${poem.title}
                    </label>
                `).join('')}
            </div>
        `).join('');
}

function startMemoryGame() {
    const selected = document.querySelector('input[name="poem"]:checked');
    
    if (!selected) {
        alert('Iltimos, she\'r tanlang!');
        return;
    }
    
    selectedPoem = poems.find(p => p.id == selected.value);
    memoryStage = 1;
    poemWords = selectedPoem.text.split(/\s+/);
    userAnswers = [];
    
    document.getElementById('memory-start').style.display = 'none';
    document.getElementById('memory-playing').style.display = 'block';
    
    showMemoryStage();
}

function showMemoryStage() {
    document.getElementById('memory-stage').textContent = memoryStage;
    document.getElementById('memory-poem-title').textContent = selectedPoem.title;
    
    const display = document.getElementById('poem-display');
    
    if (memoryStage === 1) {
        // Stage 1: Show full poem
        display.innerHTML = '<p style="font-style: italic;">' + poemWords.join(' ') + '</p>';
        document.getElementById('memory-timer').textContent = '30 soniya';
        document.getElementById('memory-next-btn').style.display = 'block';
        
        // Start 30 second countdown
        let timeLeft = 30;
        const timer = setInterval(() => {
            timeLeft--;
            document.getElementById('memory-timer').textContent = timeLeft + ' soniya';
            if (timeLeft <= 0) {
                clearInterval(timer);
                document.getElementById('memory-next-btn').textContent = 'Keyingi bosqich ✓';
            }
        }, 1000);
        
    } else if (memoryStage === 2) {
        // Stage 2: Hide every 3rd word
        display.innerHTML = poemWords.map((word, index) => {
            if ((index + 1) % 3 === 0) {
                return '<span class="poem-word hidden" data-word="' + word + '">' + word + '</span>';
            }
            return '<span class="poem-word">' + word + '</span>';
        }).join(' ');
        
        document.getElementById('memory-timer').textContent = '';
        document.getElementById('memory-next-btn').textContent = 'Keyingi bosqich →';
        
    } else if (memoryStage === 3) {
        // Stage 3: Input fields for hidden words
        display.innerHTML = poemWords.map((word, index) => {
            if ((index + 1) % 3 === 0) {
                return '<span class="poem-word"><input type="text" data-correct="' + word.toLowerCase() + '" data-index="' + index + '" placeholder="___"></span>';
            }
            return '<span class="poem-word">' + word + '</span>';
        }).join(' ');
        
        document.getElementById('memory-next-btn').textContent = 'Tekshirish ✓';
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
    }, 2000);
}

function resetMemoryGame() {
    memoryStage = 1;
    selectedPoem = null;
    poemWords = [];
    userAnswers = [];
    document.getElementById('memory-start').style.display = 'block';
    document.getElementById('memory-playing').style.display = 'none';
    document.getElementById('memory-result').style.display = 'none';
}

// ===================================
// TIMELINE GAME: XRONOLOGIYA
// ===================================

function startTimelineGame() {
    // Shuffle events
    timelineEvents = shuffleArray([...timelineEventsData]);
    
    const container = document.getElementById('timeline-items');
    container.innerHTML = timelineEvents.map((event, index) => `
        <div class="timeline-item" draggable="true" data-year="${event.year}" data-index="${index}">
            <strong>${event.year}</strong> — ${event.text}
        </div>
    `).join('');
    
    // Add drag and drop listeners
    const items = container.querySelectorAll('.timeline-item');
    items.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragend', handleDragEnd);
    });
    
    document.querySelector('#timeline-game .start-screen').style.display = 'none';
    document.getElementById('timeline-playing').style.display = 'block';
}

function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    this.classList.add('dragover');
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    if (draggedElement !== this) {
        const container = this.parentNode;
        const allItems = [...container.children];
        const draggedIndex = allItems.indexOf(draggedElement);
        const targetIndex = allItems.indexOf(this);
        
        if (draggedIndex < targetIndex) {
            container.insertBefore(draggedElement, this.nextSibling);
        } else {
            container.insertBefore(draggedElement, this);
        }
    }
    
    this.classList.remove('dragover');
    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.timeline-item').forEach(item => {
        item.classList.remove('dragover');
    });
}

function checkTimeline() {
    const items = document.querySelectorAll('.timeline-item');
    let score = 0;
    const sortedYears = [...timelineEventsData].sort((a, b) => a.year - b.year);
    
    items.forEach((item, index) => {
        const year = parseInt(item.dataset.year);
        const correctYear = sortedYears[index].year;
        
        if (year === correctYear) {
            item.classList.add('correct-position');
            score += 10;
        } else {
            item.classList.add('wrong-position');
        }
    });
    
    // Show result after delay
    setTimeout(() => {
        document.getElementById('timeline-playing').style.display = 'none';
        document.getElementById('timeline-result').style.display = 'block';
        
        document.getElementById('timeline-score').textContent = score;
        
        let message = '';
        if (score === 100) {
            message = 'Mukammal! Barcha voqealar to\'g\'ri joylashtirildi! 🏆';
        } else if (score >= 70) {
            message = 'Yaxshi natija! Tarixni yaxshi bilasiz! 👍';
        } else if (score >= 50) {
            message = 'O\'rtacha. Ko\'proq o\'rganing! 📚';
        } else {
            message = 'Tarixni chuqurroq o\'rganishingiz kerak! 💪';
        }
        document.getElementById('timeline-result-message').textContent = message;
        
        // Save to leaderboard
        saveToLeaderboard('timeline', playerName || 'Anonim', score);
    }, 2000);
}

function resetTimelineGame() {
    timelineEvents = [];
    draggedElement = null;
    document.querySelector('#timeline-game .start-screen').style.display = 'block';
    document.getElementById('timeline-playing').style.display = 'none';
    document.getElementById('timeline-result').style.display = 'none';
}


// ===================================
// WORD SEARCH GAME: SO'Z TOPISH
// ===================================

const wordSearchWords = [
    'SHUMBOLA', 'YODGOR', 'BAHOR', 'VATAN', 'MEHNAT',
    'KITOB', 'DOSTON', 'SHOIR', 'TOSHKENT', 'OZBEK'
];

function startWordSearchGame() {
    foundWords = [];
    selectedCells = [];
    wordsToFind = [...wordSearchWords];
    
    // Generate grid
    generateWordSearchGrid();
    
    // Display words to find
    displayWordsToFind();
    
    // Start timer
    wordSearchTimeLeft = 300; // 5 minutes
    updateWordSearchTimer();
    
    if (wordSearchTimer) clearInterval(wordSearchTimer);
    wordSearchTimer = setInterval(() => {
        wordSearchTimeLeft--;
        updateWordSearchTimer();
        
        if (wordSearchTimeLeft <= 0) {
            clearInterval(wordSearchTimer);
            endWordSearchGame();
        }
    }, 1000);
    
    document.getElementById('wordsearch-playing').style.display = 'block';
    document.getElementById('wordsearch-result').style.display = 'none';
}

function generateWordSearchGrid() {
    const gridSize = 8;
    wordGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
    
    // Place words in grid
    wordsToFind.forEach(word => {
        let placed = false;
        let attempts = 0;
        
        while (!placed && attempts < 100) {
            const direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
            const row = Math.floor(Math.random() * gridSize);
            const col = Math.floor(Math.random() * gridSize);
            
            if (canPlaceWord(word, row, col, direction, gridSize)) {
                placeWord(word, row, col, direction);
                placed = true;
            }
            attempts++;
        }
    });
    
    // Fill empty cells with random letters
    const letters = 'ABDEFGHIKLMNOPQRSTUVXYZ';
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (wordGrid[i][j] === '') {
                wordGrid[i][j] = letters[Math.floor(Math.random() * letters.length)];
            }
        }
    }
    
    // Render grid
    const container = document.getElementById('word-grid');
    container.innerHTML = wordGrid.map((row, i) => `
        <div class="word-grid-row">
            ${row.map((cell, j) => `
                <div class="word-cell" data-row="${i}" data-col="${j}" onclick="selectCell(${i}, ${j})">
                    ${cell}
                </div>
            `).join('')}
        </div>
    `).join('');
}

function canPlaceWord(word, row, col, direction, gridSize) {
    if (direction === 'horizontal') {
        if (col + word.length > gridSize) return false;
        for (let i = 0; i < word.length; i++) {
            if (wordGrid[row][col + i] !== '' && wordGrid[row][col + i] !== word[i]) {
                return false;
            }
        }
    } else {
        if (row + word.length > gridSize) return false;
        for (let i = 0; i < word.length; i++) {
            if (wordGrid[row + i][col] !== '' && wordGrid[row + i][col] !== word[i]) {
                return false;
            }
        }
    }
    return true;
}

function placeWord(word, row, col, direction) {
    if (direction === 'horizontal') {
        for (let i = 0; i < word.length; i++) {
            wordGrid[row][col + i] = word[i];
        }
    } else {
        for (let i = 0; i < word.length; i++) {
            wordGrid[row + i][col] = word[i];
        }
    }
}

function displayWordsToFind() {
    const container = document.getElementById('words-to-find');
    container.innerHTML = wordsToFind.map(word => `
        <div class="word-item" data-word="${word}">${word}</div>
    `).join('');
    
    document.getElementById('words-found').textContent = foundWords.length;
}

function selectCell(row, col) {
    const cell = document.querySelector(`.word-cell[data-row="${row}"][data-col="${col}"]`);
    
    if (cell.classList.contains('found')) return;
    
    if (cell.classList.contains('selected')) {
        // Deselect
        cell.classList.remove('selected');
        selectedCells = selectedCells.filter(c => !(c.row === row && c.col === col));
    } else {
        // Select
        cell.classList.add('selected');
        selectedCells.push({ row, col, letter: wordGrid[row][col] });
        
        // Check if we found a word
        checkForWord();
    }
}

function checkForWord() {
    if (selectedCells.length < 3) return;
    
    const selectedWord = selectedCells.map(c => c.letter).join('');
    
    // Check if selected word matches any word in the list
    const foundWord = wordsToFind.find(word => 
        word === selectedWord || word === selectedWord.split('').reverse().join('')
    );
    
    if (foundWord) {
        // Mark cells as found
        selectedCells.forEach(cell => {
            const cellElement = document.querySelector(`.word-cell[data-row="${cell.row}"][data-col="${cell.col}"]`);
            cellElement.classList.remove('selected');
            cellElement.classList.add('found');
        });
        
        // Mark word as found
        const wordElement = document.querySelector(`.word-item[data-word="${foundWord}"]`);
        if (wordElement) {
            wordElement.classList.add('found');
        }
        
        // Add to found words
        foundWords.push(foundWord);
        wordsToFind = wordsToFind.filter(w => w !== foundWord);
        
        document.getElementById('words-found').textContent = foundWords.length;
        
        // Clear selection
        selectedCells = [];
        
        // Check if all words found
        if (foundWords.length === wordSearchWords.length) {
            clearInterval(wordSearchTimer);
            setTimeout(() => endWordSearchGame(), 1000);
        }
    }
}

function updateWordSearchTimer() {
    const minutes = Math.floor(wordSearchTimeLeft / 60);
    const seconds = wordSearchTimeLeft % 60;
    document.getElementById('wordsearch-timer').textContent = 
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function endWordSearchGame() {
    document.getElementById('wordsearch-playing').style.display = 'none';
    document.getElementById('wordsearch-result').style.display = 'block';
    
    document.getElementById('wordsearch-score').textContent = foundWords.length;
    
    let message = '';
    if (foundWords.length === 10) {
        message = 'Mukammal! Barcha so\'zlarni topdingiz! 🏆';
    } else if (foundWords.length >= 7) {
        message = 'Yaxshi natija! Ko\'p so\'z topdingiz! 👍';
    } else if (foundWords.length >= 5) {
        message = 'O\'rtacha. Ko\'proq mashq qiling! 📚';
    } else {
        message = 'Ko\'proq diqqat qiling! 💪';
    }
    document.getElementById('wordsearch-result-message').textContent = message;
    
    // Save to leaderboard
    saveToLeaderboard('wordsearch', playerName || 'Anonim', foundWords.length * 10);
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
        { key: 'timeline', name: '⏱ Xronologiya', maxScore: 100 },
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
