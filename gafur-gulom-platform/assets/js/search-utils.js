/**
 * Shared search utilities — normalization, snippets, in-page highlight
 */
(function (global) {
    'use strict';

    const APOSTROPHE_CLASS = "[''`ʻʼ‛\u2018\u2019\u02BC\u02BB]";

    function normalizeQuery(q) {
        return String(q || '')
            .toLowerCase()
            .replace(/[\u2018\u2019\u02BC\u02BB'`ʻʼ‛]/g, "'")
            .replace(/\s+/g, ' ')
            .trim();
    }

    function buildMatchRegex(query) {
        const tokens = normalizeQuery(query).split(' ').filter(t => t.length >= 1);
        if (!tokens.length) return null;

        const parts = tokens.map(token => {
            const chars = token.split('').map(ch => {
                if (/[a-z0-9\u0400-\u04FF]/i.test(ch)) return ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                if (ch === "'") return APOSTROPHE_CLASS;
                return ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            });
            return chars.join('');
        });

        const pattern = parts.length > 1 ? parts.join('|') : parts[0];
        try {
            return new RegExp(pattern, 'gi');
        } catch {
            return null;
        }
    }

    function findMatchRanges(text, query, maxRanges = 5) {
        if (!text) return [];
        const regex = buildMatchRegex(query);
        if (!regex) return [];

        const ranges = [];
        let match;
        regex.lastIndex = 0;
        while ((match = regex.exec(text)) !== null && ranges.length < maxRanges) {
            ranges.push({ start: match.index, end: match.index + match[0].length, match: match[0] });
            if (match[0].length === 0) regex.lastIndex++;
        }
        return ranges;
    }

    function buildSnippet(text, query, range, contextLen = 70) {
        if (!text || !range) return '';
        const start = Math.max(0, range.start - contextLen);
        const end = Math.min(text.length, range.end + contextLen);
        const sub = text.slice(start, end);
        const regex = buildMatchRegex(query);

        let html = '';
        if (regex) {
            regex.lastIndex = 0;
            let last = 0;
            let m;
            while ((m = regex.exec(sub)) !== null) {
                html += escapeHtml(sub.slice(last, m.index));
                html += `<mark class="search-snippet-mark">${escapeHtml(m[0])}</mark>`;
                last = m.index + m[0].length;
                if (m[0].length === 0) regex.lastIndex++;
            }
            html += escapeHtml(sub.slice(last));
        } else {
            html = escapeHtml(sub.replace(/\s+/g, ' ').trim());
        }

        if (start > 0) html = '… ' + html;
        if (end < text.length) html = html + ' …';
        return html;
    }

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function scoreMatch(title, fieldKey, fieldText, query, range, occurrenceIndex) {
        const q = normalizeQuery(query);
        const hayTitle = normalizeQuery(title);
        const hayField = normalizeQuery(fieldText || '');
        let score = 0;

        if (fieldKey === 'sarlavha' || fieldKey === 'atama' || fieldKey === 'nomi') score += 20;
        if (hayTitle === q) score += 30;
        else if (hayTitle.startsWith(q)) score += 18;
        else if (hayTitle.includes(q)) score += 12;

        if (range && hayField.includes(q)) score += 10;
        if (occurrenceIndex === 0) score += 3;

        const tokens = q.split(' ').filter(t => t.length > 1);
        tokens.forEach(t => {
            if (hayTitle.includes(t)) score += 4;
            if (hayField.includes(t)) score += 2;
        });

        return score;
    }

    function highlightElement(el, query, durationMs = 2800) {
        if (!el || !query) return false;

        const regex = buildMatchRegex(query);
        if (!regex) return false;

        const marks = [];
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                if (node.parentElement?.closest('script, style, mark.search-highlight-mark')) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        });

        const textNodes = [];
        while (walker.nextNode()) textNodes.push(walker.currentNode);

        let highlighted = false;
        textNodes.forEach(node => {
            const text = node.nodeValue;
            regex.lastIndex = 0;
            if (!regex.test(text)) return;

            regex.lastIndex = 0;
            const frag = document.createDocumentFragment();
            let last = 0;
            let m;
            while ((m = regex.exec(text)) !== null) {
                if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
                const mark = document.createElement('mark');
                mark.className = 'search-highlight-mark';
                mark.textContent = m[0];
                frag.appendChild(mark);
                marks.push(mark);
                last = m.index + m[0].length;
                highlighted = true;
                if (m[0].length === 0) regex.lastIndex++;
            }
            if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
            node.parentNode.replaceChild(frag, node);
        });

        if (marks.length) {
            marks[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('search-highlight-container');
            setTimeout(() => {
                marks.forEach(mark => {
                    const parent = mark.parentNode;
                    if (!parent) return;
                    parent.replaceChild(document.createTextNode(mark.textContent), mark);
                    parent.normalize();
                });
                el.classList.remove('search-highlight-container');
            }, durationMs);
        }

        return highlighted;
    }

    global.PlatformSearchUtils = {
        normalizeQuery,
        buildMatchRegex,
        findMatchRanges,
        buildSnippet,
        scoreMatch,
        highlightElement,
        escapeHtml
    };
})(typeof window !== 'undefined' ? window : globalThis);
