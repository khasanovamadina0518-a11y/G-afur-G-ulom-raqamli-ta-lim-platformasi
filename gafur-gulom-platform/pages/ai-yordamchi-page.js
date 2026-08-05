/**
 * AI Yordamchi — local response engine + chat UI
 * Future API: replace LocalAIProvider.sendMessage with remote provider.
 */

const AI_STORAGE_KEY = 'ai-yordamchi-conversations';
const AI_ACTIVE_KEY = 'ai-yordamchi-active-id';

const SUGGESTED_PROMPTS = [
    "G'afur G'ulom kim?",
    "Shum bola haqida ma'lumot ber.",
    "G'afur G'ulomning she'rlari.",
    "Menga test tavsiya qil.",
    "Bugun nimani o'qishni tavsiya qilasan?",
    "Eng mashhur asarlari qaysilar?"
];

const FOLLOWUP_CHIPS = [
    'Batafsilroq ayting',
    'Asar haqida qisqacha',
    'Boshqa asarlar'
];

/** @typedef {{ id: string, title: string, messages: Array<{role:'user'|'assistant', content:string}>, updatedAt: number }} Conversation */

/**
 * Pluggable provider — swap implementation when API is ready.
 * @type {{ sendMessage: (messages: Array<{role:string, content:string}>) => Promise<{content:string, followups?: string[]}> }}
 */
const LocalAIProvider = {
    async sendMessage(messages) {
        const lastUser = [...messages].reverse().find(m => m.role === 'user');
        const text = lastUser ? lastUser.content : '';
        await delay(900 + Math.random() * 500);
        return getLocalResponse(text, messages);
    }
};

let conversations = [];
let activeConversationId = null;
let isTyping = false;

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function normalizeText(text) {
    return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

function getLocalResponse(userText, messages) {
    const q = normalizeText(userText);

    if ((q.includes('kim') && q.includes('g\'afur')) || q.includes('g\'afur g\'ulom kim')) {
        return {
            content: "G'afur G'ulom (1889–1966) — o'zbek adabiyotining buyuk shoiri, yozuvchisi va dramaturg. U o'zbek she'riyati va nasrining yangi bosqichini yaratgan ijodkorlardan biri. Hayoti, ijodi va ta'limiy merosi bugungi kunda ham o'rganish va o'qitish uchun muhim manba hisoblanadi.",
            followups: FOLLOWUP_CHIPS
        };
    }

    if (q.includes('shum bola')) {
        return {
            content: "\"Shum bola\" — G'afur G'ulomning mashhur romani. Asar 1920-yillardagi ijtimoiy hayot, kambag'allik va inson qadriyatlarini ko'rsatadi. Bosh qahramonning taqdiri orqali muallif davrning murakkab muammolarini ochib beradi. Bu asar o'quvchilar uchun G'afur G'ulom ijodini chuqurroq tushunish uchun ajoyib boshlang'ich nuqta.",
            followups: FOLLOWUP_CHIPS
        };
    }

    if (q.includes('she\'r') || q.includes('sheʼr') || q.includes('sher')) {
        return {
            content: "G'afur G'ulom she'riyati xalq hayoti, vatan muhabbati, mehnat va insoniy qadriyatlarga bag'ishlangan. \"Yillar sadosi\" kabi to'plamlari o'zbek she'riyat tarixida muhim o'rin tutadi. She'rlarida sodda til, samimiy ohang va chuqur ma'no uyg'unlashgan.",
            followups: ['She\'r misollari', 'Asar haqida qisqacha', 'Boshqa asarlar']
        };
    }

    if (q.includes('test') && q.includes('tavsiya')) {
        return {
            content: "Sizga \"G'afur G'ulom hayoti\" yoki \"Yakuniy test\" bo'limlarini tavsiya qilaman. Agar asarlarni yaxshiroq bilmoqchi bo'lsangiz, \"G'afur G'ulom asarlari\" testini boshlang. Testlar sahifasida har bir mavzu bo'yicha alohida baholash mavjud.",
            followups: ['Testlar sahifasiga o\'tish', 'Asar haqida qisqacha', 'Batafsilroq ayting']
        };
    }

    if (q.includes('o\'qish') || q.includes('bugun')) {
        return {
            content: "Bugun \"Shum bola\" romani yoki G'afur G'ulom she'rlaridan bir to'plamni o'qishingizni tavsiya qilaman. Keyin qisqa test yechib bilimingizni mustahkamlang. Video darslar bo'limida hayoti va ijodi haqida qisqa materiallar ham bor.",
            followups: ['Elektron kutubxona', 'Video darslar', 'Menga test tavsiya qil']
        };
    }

    if (q.includes('mashhur') || q.includes('asarlari')) {
        return {
            content: "G'afur G'ulomning eng mashhur asarlari: \"Shum bola\" romani, \"Yillar sadosi\" she'rlar to'plami, hikoya va qissalar to'plamlari. Ushbu asarlar o'zbek adabiyotini o'rganishda asosiy manbalardan hisoblanadi.",
            followups: FOLLOWUP_CHIPS
        };
    }

    if (q.includes('batafsil')) {
        const prevAssistant = [...messages].reverse().find(m => m.role === 'assistant');
        if (prevAssistant && prevAssistant.content.includes('Shum bola')) {
            return {
                content: "Roman qahramonlari orqali muallif jamiyatdagi adolatsizlik, ta'lim va tarbiya masalalarini ko'rsatadi. Asar tilining soddaligi va voqealar dinamikasi uni maktab dasturida ham o'qitish uchun qulay qiladi.",
                followups: ['Asar haqida qisqacha', 'Boshqa asarlar']
            };
        }
        return {
            content: "Albatta. Qaysi mavzu yoki asar haqida batafsil ma'lumot kerakligini aniqlashtirsangiz, mos ravishda tushuntirib beraman.",
            followups: FOLLOWUP_CHIPS
        };
    }

    if (q.includes('qisqacha')) {
        return {
            content: "Qisqacha: G'afur G'ulom — o'zbek adabiyotining klassik muallifi; she'r, hikoya va romanlar orqali xalq hayotini aks ettirgan. Eng tanilgan asari — \"Shum bola\".",
            followups: ['Batafsilroq ayting', 'Boshqa asarlar']
        };
    }

    if (q.includes('boshqa asar')) {
        return {
            content: "G'afur G'ulom ijodida shuningdek hikoyalar, qissalar, dramatik asarlar va she'rlar to'plamlari mavjud. Elektron kutubxonada asarlarni to'liq o'qishingiz mumkin.",
            followups: ['Eng mashhur asarlari qaysilar?', 'G\'afur G\'ulomning she\'rlari.']
        };
    }

    return {
        content: "Savolingiz uchun rahmat. Hozircha men mahalliy yordamchi rejimida ishlayapman. G'afur G'ulom hayoti, asarlari, she'rlari yoki testlar haqida aniqroq savol bersangiz, yordam bera olaman.",
        followups: SUGGESTED_PROMPTS.slice(0, 3)
    };
}

function loadConversations() {
    try {
        const raw = localStorage.getItem(AI_STORAGE_KEY);
        conversations = raw ? JSON.parse(raw) : [];
    } catch (e) {
        conversations = [];
    }

    activeConversationId = localStorage.getItem(AI_ACTIVE_KEY);

    if (!conversations.length) {
        createConversation(false);
    } else if (!activeConversationId || !conversations.find(c => c.id === activeConversationId)) {
        activeConversationId = conversations[0].id;
    }
}

function saveConversations() {
    localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(conversations));
    if (activeConversationId) {
        localStorage.setItem(AI_ACTIVE_KEY, activeConversationId);
    }
}

function createConversation(setActive = true) {
    const conv = {
        id: 'conv_' + Date.now(),
        title: 'Yangi suhbat',
        messages: [],
        updatedAt: Date.now()
    };
    conversations.unshift(conv);
    if (setActive) {
        activeConversationId = conv.id;
    }
    saveConversations();
    return conv;
}

function getActiveConversation() {
    return conversations.find(c => c.id === activeConversationId) || conversations[0];
}

function updateConversationTitle(conv, firstMessage) {
    if (conv.title === 'Yangi suhbat' && firstMessage) {
        conv.title = firstMessage.length > 42 ? firstMessage.slice(0, 42) + '…' : firstMessage;
    }
}

function renderHistory() {
    const list = document.getElementById('ai-history');
    if (!list) return;

    if (!conversations.length) {
        list.innerHTML = '<p class="ai-history__empty">Suhbatlar tarixi bo\'sh</p>';
        return;
    }

    list.innerHTML = conversations.map(conv => `
        <button type="button" class="ai-history__item ${conv.id === activeConversationId ? 'is-active' : ''}" data-id="${conv.id}">
            ${escapeHtml(conv.title)}
        </button>
    `).join('');

    list.querySelectorAll('.ai-history__item').forEach(btn => {
        btn.addEventListener('click', () => {
            activeConversationId = btn.dataset.id;
            saveConversations();
            renderHistory();
            renderMessages();
            closeMobileSidebar();
        });
    });
}

function renderMessages() {
    const conv = getActiveConversation();
    const container = document.getElementById('ai-messages');
    const empty = document.getElementById('ai-empty');
    const followups = document.getElementById('ai-followups');

    if (!container || !empty) return;

    if (!conv.messages.length) {
        empty.classList.remove('is-hidden');
        container.innerHTML = '';
        if (followups) followups.classList.add('is-hidden');
        return;
    }

    empty.classList.add('is-hidden');
    container.innerHTML = conv.messages.map(msg => renderMessageHtml(msg)).join('');

    const lastAssistant = [...conv.messages].reverse().find(m => m.role === 'assistant');
    if (followups && lastAssistant && !isTyping) {
        followups.classList.remove('is-hidden');
        followups.innerHTML = (lastAssistant.followups || FOLLOWUP_CHIPS).map(text => `
            <button type="button" class="ai-followup-chip" data-text="${escapeAttr(text)}">${escapeHtml(text)}</button>
        `).join('');
        bindFollowupChips();
    } else if (followups) {
        followups.classList.add('is-hidden');
    }

    container.scrollTop = container.scrollHeight;
}

function renderMessageHtml(msg) {
    const isUser = msg.role === 'user';
    const avatar = isUser
        ? '<span class="ai-message__avatar" aria-hidden="true">Siz</span>'
        : `<span class="ai-message__avatar" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="12" rx="2"></rect><path d="M12 2v4"></path><circle cx="8" cy="14" r="1"></circle><circle cx="16" cy="14" r="1"></circle></svg>
           </span>`;

    return `
        <div class="ai-message ai-message--${isUser ? 'user' : 'assistant'}">
            ${avatar}
            <div class="ai-message__bubble">${escapeHtml(msg.content)}</div>
        </div>
    `;
}

function setTyping(visible) {
    isTyping = visible;
    const el = document.getElementById('ai-typing');
    if (el) el.classList.toggle('is-hidden', !visible);
}

async function sendUserMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const conv = getActiveConversation();
    conv.messages.push({ role: 'user', content: trimmed });
    updateConversationTitle(conv, trimmed);
    conv.updatedAt = Date.now();
    saveConversations();
    renderHistory();
    renderMessages();

    const input = document.getElementById('ai-input');
    if (input) input.value = '';

    setTyping(true);
    renderMessages();

    try {
        const response = await LocalAIProvider.sendMessage(conv.messages);
        conv.messages.push({
            role: 'assistant',
            content: response.content,
            followups: response.followups || FOLLOWUP_CHIPS
        });
        conv.updatedAt = Date.now();
        saveConversations();
    } catch (error) {
        conv.messages.push({
            role: 'assistant',
            content: 'Kechirasiz, javob berishda xatolik yuz berdi. Qaytadan urinib ko\'ring.',
            followups: SUGGESTED_PROMPTS.slice(0, 2)
        });
    }

    setTyping(false);
    renderHistory();
    renderMessages();
}

function clearActiveConversation() {
    const conv = getActiveConversation();
    conv.messages = [];
    conv.title = 'Yangi suhbat';
    conv.updatedAt = Date.now();
    saveConversations();
    renderHistory();
    renderMessages();
}

function bindPromptChips() {
    document.querySelectorAll('.ai-prompt-chip').forEach(chip => {
        chip.addEventListener('click', () => sendUserMessage(chip.dataset.text || chip.textContent));
    });
}

function bindFollowupChips() {
    document.querySelectorAll('.ai-followup-chip').forEach(chip => {
        chip.addEventListener('click', () => sendUserMessage(chip.dataset.text || chip.textContent));
    });
}

function closeMobileSidebar() {
    const sidebar = document.getElementById('ai-sidebar');
    if (sidebar) sidebar.classList.remove('is-open');
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
    return escapeHtml(str).replace(/'/g, '&#39;');
}

function initSuggestedPrompts() {
    const wrap = document.getElementById('ai-prompts');
    if (!wrap) return;
    wrap.innerHTML = SUGGESTED_PROMPTS.map(text => `
        <button type="button" class="ai-prompt-chip" data-text="${escapeAttr(text)}">${escapeHtml(text)}</button>
    `).join('');
    bindPromptChips();
}

document.addEventListener('DOMContentLoaded', function() {
    loadConversations();
    initSuggestedPrompts();
    renderHistory();
    renderMessages();

    document.getElementById('ai-send-btn')?.addEventListener('click', () => {
        const input = document.getElementById('ai-input');
        if (input) sendUserMessage(input.value);
    });

    document.getElementById('ai-input')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendUserMessage(e.target.value);
        }
    });

    document.getElementById('ai-clear-btn')?.addEventListener('click', () => {
        if (confirm('Joriy suhbatni tozalashni xohlaysizmi?')) {
            clearActiveConversation();
        }
    });

    document.getElementById('ai-new-chat')?.addEventListener('click', () => {
        createConversation(true);
        renderHistory();
        renderMessages();
        closeMobileSidebar();
    });

    document.getElementById('ai-history-toggle')?.addEventListener('click', () => {
        document.getElementById('ai-sidebar')?.classList.toggle('is-open');
    });
});

// Export hook for future API integration (no external usage yet)
window.AIYordamchi = {
    provider: LocalAIProvider,
    setProvider(nextProvider) {
        if (nextProvider && typeof nextProvider.sendMessage === 'function') {
            LocalAIProvider.sendMessage = nextProvider.sendMessage.bind(nextProvider);
        }
    }
};
