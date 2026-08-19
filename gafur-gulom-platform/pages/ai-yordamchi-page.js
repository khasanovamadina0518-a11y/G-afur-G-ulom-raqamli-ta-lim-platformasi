/**
 * AI Yordamchi — local response engine + chat UI
 * Future API: replace LocalAIProvider.sendMessage with remote provider.
 */

const AI_STORAGE_KEY = 'ai-yordamchi-conversations';
const AI_ACTIVE_KEY = 'ai-yordamchi-active-id';

const SUGGESTED_PROMPTS = [
    "G'afur G'ulom kim?",
    "Shoirning bolalik davri haqida ma'lumot ber.",
    "«Shum bola» asarining asosiy mavzusi nima?",
    "G'afur G'ulom she'riyatining xususiyatlari qanday?",
    "Testga tayyorlanishimga yordam ber."
];

const FOLLOWUP_CHIPS = [
    'Batafsilroq ayting',
    'Asar haqida qisqacha',
    'Boshqa asarlar'
];

const PLATFORM_SECTIONS = [
    { label: 'Hayoti', href: 'pages/hayot.html' },
    { label: 'Asarlari', href: 'pages/asarlar.html' },
    { label: 'Testlar', href: 'pages/interaktiv.html' },
    { label: 'Interaktiv', href: 'pages/interaktiv-oyinlar.html' },
    { label: 'Ilmiy', href: 'pages/ilmiy.html' },
    { label: 'Videolar', href: 'pages/multimedia.html' }
];

const TEXTAREA_MAX_HEIGHT = 128;

function aiHref(path) {
    return (window.platformUrl || function (relativePath) { return relativePath; })(path);
}

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
        <button type="button" class="ai-history__item ${conv.id === activeConversationId ? 'is-active' : ''}" data-id="${escapeAttr(conv.id)}">
            ${escapeHtml(conv.title)}
        </button>
    `).join('');
}

function scrollMessagesToBottom(force = false) {
    const container = document.getElementById('ai-messages');
    if (!container) return;

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    if (!force && distanceFromBottom > 100) return;

    requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
    });
}

function renderMessages(options = {}) {
    const { scrollToBottom = true, forceScroll = false } = options;
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
    } else if (followups) {
        followups.classList.add('is-hidden');
        followups.innerHTML = '';
    }

    if (scrollToBottom) {
        scrollMessagesToBottom(forceScroll);
    }
}

function renderMessageHtml(msg) {
    const isUser = msg.role === 'user';
    const avatar = isUser
        ? '<span class="ai-message__avatar" aria-hidden="true">Siz</span>'
        : `<span class="ai-message__avatar" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="12" rx="2"></rect><path d="M12 2v4"></path><circle cx="8" cy="14" r="1"></circle><circle cx="16" cy="14" r="1"></circle></svg>
           </span>`;

    const linksHtml = !isUser && Array.isArray(msg.links) && msg.links.length
        ? `<div class="ai-message__links">${msg.links.map(link => `
            <a class="ai-message__link" href="${escapeAttr(aiHref(link.href))}">${escapeHtml(link.label)}</a>
        `).join('')}</div>`
        : '';

    return `
        <div class="ai-message ai-message--${isUser ? 'user' : 'assistant'}">
            ${avatar}
            <div class="ai-message__bubble">${escapeHtml(msg.content)}${linksHtml}</div>
        </div>
    `;
}

function setTyping(visible) {
    isTyping = visible;
    const el = document.getElementById('ai-typing');
    if (el) el.classList.toggle('is-hidden', !visible);

    const followups = document.getElementById('ai-followups');
    if (followups && visible) {
        followups.classList.add('is-hidden');
    }
}

function resetTextarea(input) {
    if (!input) return;
    input.value = '';
    input.style.height = 'auto';
}

function autoResizeTextarea(input) {
    if (!input) return;
    input.style.height = 'auto';
    const nextHeight = Math.min(input.scrollHeight, TEXTAREA_MAX_HEIGHT);
    input.style.height = nextHeight + 'px';
}

async function sendUserMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const conv = getActiveConversation();
    const isFirstUserMessage = !conv.messages.some(m => m.role === 'user');
    conv.messages.push({ role: 'user', content: trimmed });
    updateConversationTitle(conv, trimmed);
    conv.updatedAt = Date.now();
    saveConversations();
    if (isFirstUserMessage) {
        window.UserProgress?.recordAiChat?.();
    }
    renderHistory();
    renderMessages({ forceScroll: true });

    const input = document.getElementById('ai-input');
    resetTextarea(input);

    setTyping(true);

    try {
        const response = await LocalAIProvider.sendMessage(conv.messages);
        conv.messages.push({
            role: 'assistant',
            content: response.content,
            followups: response.followups || FOLLOWUP_CHIPS,
            links: response.links || []
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
    renderMessages({ forceScroll: true });
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

function openMobileSidebar() {
    const sidebar = document.getElementById('ai-sidebar');
    const overlay = document.getElementById('ai-sidebar-overlay');
    const toggle = document.getElementById('ai-history-toggle');
    if (sidebar) sidebar.classList.add('is-open');
    if (overlay) {
        overlay.hidden = false;
        overlay.classList.add('is-visible');
        overlay.setAttribute('aria-hidden', 'false');
    }
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
}

function closeMobileSidebar() {
    const sidebar = document.getElementById('ai-sidebar');
    const overlay = document.getElementById('ai-sidebar-overlay');
    const toggle = document.getElementById('ai-history-toggle');
    if (sidebar) sidebar.classList.remove('is-open');
    if (overlay) {
        overlay.classList.remove('is-visible');
        overlay.setAttribute('aria-hidden', 'true');
        overlay.hidden = true;
    }
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
}

function toggleMobileSidebar() {
    const sidebar = document.getElementById('ai-sidebar');
    if (sidebar?.classList.contains('is-open')) {
        closeMobileSidebar();
    } else {
        openMobileSidebar();
    }
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

function getContextualPrompts() {
    const prompts = [...SUGGESTED_PROMPTS];
    const state = window.UserProgress?.getState?.();
    const lastBook = state?.booksOpened?.[0];

    if (lastBook?.title) {
        prompts.unshift(`"${lastBook.title}" asari haqida qisqacha ma'lumot ber.`);
    }

    return prompts.slice(0, 5);
}

function initSuggestedPrompts() {
    const wrap = document.getElementById('ai-prompts');
    if (!wrap) return;
    wrap.innerHTML = getContextualPrompts().map(text => `
        <button type="button" class="ai-prompt-chip" data-text="${escapeAttr(text)}">${escapeHtml(text)}</button>
    `).join('');
}

function initPlatformLinks() {
    const wrap = document.getElementById('ai-platform-links');
    if (!wrap) return;
    wrap.innerHTML = PLATFORM_SECTIONS.map(section => `
        <a class="ai-platform-links__chip" href="${escapeAttr(aiHref(section.href))}">${escapeHtml(section.label)}</a>
    `).join('');
}

function applyUrlContext() {
    const params = new URLSearchParams(window.location.search);
    const input = document.getElementById('ai-input');
    const query = params.get('q') || params.get('prompt');
    if (!query || !input) return;

    input.value = query;
    autoResizeTextarea(input);

    if (params.get('send') === '1') {
        window.setTimeout(() => sendUserMessage(query), 350);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadConversations();
    initSuggestedPrompts();
    initPlatformLinks();
    renderHistory();
    renderMessages({ forceScroll: true });
    applyUrlContext();

    const input = document.getElementById('ai-input');
    const layout = document.querySelector('.ai-layout');

    document.getElementById('ai-send-btn')?.addEventListener('click', () => {
        if (input) sendUserMessage(input.value);
    });

    input?.addEventListener('input', () => autoResizeTextarea(input));

    input?.addEventListener('keydown', (e) => {
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

    document.getElementById('ai-history-toggle')?.addEventListener('click', toggleMobileSidebar);

    document.getElementById('ai-sidebar-overlay')?.addEventListener('click', closeMobileSidebar);

    layout?.addEventListener('click', (e) => {
        const target = e.target.closest('[data-id], .ai-prompt-chip, .ai-followup-chip');
        if (!target) return;

        if (target.classList.contains('ai-history__item')) {
            activeConversationId = target.dataset.id;
            saveConversations();
            renderHistory();
            renderMessages({ forceScroll: true });
            closeMobileSidebar();
            return;
        }

        if (target.classList.contains('ai-prompt-chip') || target.classList.contains('ai-followup-chip')) {
            sendUserMessage(target.dataset.text || target.textContent);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMobileSidebar();
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
