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
        await delay(600 + Math.random() * 400);

        if (typeof window.AIKnowledge?.queryKnowledgeBase === 'function') {
            try {
                return await window.AIKnowledge.queryKnowledgeBase(text, messages);
            } catch (err) {
                console.warn('Knowledge base error:', err);
            }
        }

        return getFallbackResponse(text);
    }
};

let conversations = [];
let activeConversationId = null;
let isTyping = false;

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getFallbackResponse() {
    return {
        content: "Kechirasiz, bilim bazasiga hozircha ulanib bo'lmadi. " +
            "G'afur G'ulom hayoti, asarlari, she'rlari yoki testlar haqida savol bering.",
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

// Export hook for future API integration
window.AIYordamchi = {
    provider: LocalAIProvider,
    knowledge: () => window.AIKnowledge,
    setProvider(nextProvider) {
        if (nextProvider && typeof nextProvider.sendMessage === 'function') {
            LocalAIProvider.sendMessage = nextProvider.sendMessage.bind(nextProvider);
        }
    }
};
