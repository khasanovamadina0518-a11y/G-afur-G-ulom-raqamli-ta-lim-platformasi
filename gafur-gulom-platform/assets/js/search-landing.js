/**
 * Post-navigation scroll + highlight for search results
 */
(function (global) {
    'use strict';

    const HIGHLIGHT_MS = 2800;
    const MAX_ATTEMPTS = 25;
    const RETRY_MS = 280;

    function getHighlightTerm() {
        return new URLSearchParams(global.location.search).get('highlight') || '';
    }

    function highlightInPage(term, attempt = 0) {
        if (!term) return;

        const utils = global.PlatformSearchUtils;
        if (!utils) return;

        const params = new URLSearchParams(global.location.search);
        const selectors = [];

        if (params.get('article')) selectors.push(`#ilm-article-${params.get('article')}`);
        if (params.get('term')) selectors.push(`#ilm-term-${params.get('term')}`);
        if (params.get('dissertation')) selectors.push(`#ilm-dissertation-${params.get('dissertation')}`);
        if (params.get('research')) selectors.push(`#ilm-research-${params.get('research')}`);
        if (params.get('biblio')) selectors.push(`#ilm-biblio-${params.get('biblio')}`);
        if (params.get('event')) selectors.push(`#hy-event-${params.get('event')}`);
        if (params.get('xotira')) selectors.push(`#hy-xotira-${params.get('xotira')}`);
        if (params.get('video')) selectors.push(`[data-video-id="${params.get('video')}"]`);

        const poemId = params.get('id') || params.get('poem');
        const qissaId = params.get('qissa');
        const dostonId = params.get('doston');
        const tarjimaId = params.get('tarjima');
        const tanlanganId = params.get('tanlangan');

        if (poemId) selectors.push(`#poem-card-${poemId}`, '.modal.active #modal-text');
        if (qissaId) selectors.push(`#qissa-card-${qissaId}`, '.modal.active #modal-text');
        if (dostonId) selectors.push(`#doston-card-${dostonId}`, '.modal.active #modal-text');
        if (tarjimaId) selectors.push(`#tarjima-card-${tarjimaId}`, '.modal.active #modal-text');
        if (tanlanganId) selectors.push(`#tanlangan-card-${tanlanganId}`, '.modal.active #modal-text');

        selectors.push(
            '.modal.active #modal-text',
            '#modal-text',
            '.ilm-paper',
            '.hy-event.is-open',
            '.hy-event',
            '.library-item'
        );

        for (const sel of selectors) {
            const nodes = document.querySelectorAll(sel);
            for (const el of nodes) {
                if (!el || !el.textContent?.trim()) continue;
                if (utils.highlightElement(el, term, HIGHLIGHT_MS)) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    return;
                }
            }
        }

        if (attempt < MAX_ATTEMPTS) {
            setTimeout(() => highlightInPage(term, attempt + 1), RETRY_MS);
        }
    }

    function openHayotEvent(eventId) {
        const eventEl = document.getElementById(`hy-event-${eventId}`);
        if (!eventEl) return;
        eventEl.classList.remove('is-hidden');
        eventEl.classList.add('is-open');
        const head = eventEl.querySelector('.hy-event__head');
        if (head) head.setAttribute('aria-expanded', 'true');
        eventEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    let landingInitialized = false;

    function initSearchLanding() {
        if (landingInitialized) return;
        landingInitialized = true;

        const term = getHighlightTerm();
        if (!term) return;

        const params = new URLSearchParams(global.location.search);
        const eventId = params.get('event');
        if (eventId) {
            setTimeout(() => openHayotEvent(eventId), 400);
        }

        setTimeout(() => highlightInPage(term), 700);
    }

    global.PlatformSearchLanding = {
        init: initSearchLanding,
        highlight: highlightInPage,
        getHighlightTerm,
        openHayotEvent
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSearchLanding);
    } else {
        initSearchLanding();
    }
})(typeof window !== 'undefined' ? window : globalThis);
