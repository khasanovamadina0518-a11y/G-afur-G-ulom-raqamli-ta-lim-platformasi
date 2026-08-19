/**
 * PlatformAuthUI — demo login/register modal
 * Uses PlatformAuth (auth-service.js) for validation and session logic.
 */
(function (global) {
    'use strict';

    let modalEl = null;
    let pendingRedirect = null;

    const EYE_OPEN = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
    const EYE_OFF = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>';

    function platformHref(relativePath) {
        if (typeof global.platformUrl === 'function') return global.platformUrl(relativePath);
        const path = String(relativePath || '').trim();
        if (!path) return '';
        if (/^(https?:)?\/\//i.test(path)) return path;
        const base = global.PLATFORM_BASE || '/';
        return base + path.replace(/^\/+/, '');
    }

    function ensureAssets() {
        if (!document.querySelector('link[data-auth-modal-css]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = platformHref('assets/css/auth-modal.css?v=3');
            link.setAttribute('data-auth-modal-css', '');
            document.head.appendChild(link);
        }
    }

    function passwordField(id, name, label, autocomplete, errorId) {
        return `
        <div class="auth-modal__field">
            <label class="auth-modal__label" for="${id}">${label}</label>
            <div class="auth-modal__password">
                <input class="auth-modal__input" id="${id}" name="${name}" type="password" autocomplete="${autocomplete}" aria-describedby="${errorId}" required>
                <button type="button" class="auth-modal__password-toggle" data-target="${id}" aria-label="Parolni ko'rsatish" aria-pressed="false">${EYE_OPEN}</button>
            </div>
            <span class="auth-modal__field-error" id="${errorId}" role="alert"></span>
        </div>`;
    }

    function textField(id, name, label, type, autocomplete, errorId) {
        return `
        <div class="auth-modal__field">
            <label class="auth-modal__label" for="${id}">${label}</label>
            <input class="auth-modal__input" id="${id}" name="${name}" type="${type}" autocomplete="${autocomplete}" aria-describedby="${errorId}" required>
            <span class="auth-modal__field-error" id="${errorId}" role="alert"></span>
        </div>`;
    }

    function renderModal() {
        if (document.getElementById('platform-auth-modal')) {
            modalEl = document.getElementById('platform-auth-modal');
            return;
        }

        const wrap = document.createElement('div');
        wrap.innerHTML = `
<div class="auth-modal" id="platform-auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" aria-hidden="true">
    <button type="button" class="auth-modal__backdrop" id="auth-modal-backdrop" aria-label="Yopish"></button>
    <div class="auth-modal__dialog">
        <button type="button" class="auth-modal__close" id="auth-modal-close" aria-label="Yopish">✕</button>
        <div class="auth-modal__brand">
            <h2 class="auth-modal__title" id="auth-modal-title">G'afur G'ulom platformasi</h2>
            <p class="auth-modal__subtitle" id="auth-modal-subtitle">O'quv hisobingizga kiring yoki yangi hisob yarating.</p>
        </div>

        <div class="auth-modal__success is-hidden" id="auth-modal-success" role="status" aria-live="polite">
            <p class="auth-modal__success-title">Ro'yxatdan o'tish muvaffaqiyatli yakunlandi</p>
            <p class="auth-modal__success-text">Demo rejimda hisobingiz faollashtirildi. Dashboardga yo'naltirilmoqdasiz...</p>
        </div>

        <div class="auth-modal__body" id="auth-modal-body">
            <div class="auth-modal__tabs" role="tablist" aria-label="Kirish yoki ro'yxatdan o'tish">
                <button type="button" class="auth-modal__tab is-active" data-auth-panel="login" role="tab" aria-selected="true" aria-controls="auth-panel-login" id="auth-tab-login">Kirish</button>
                <button type="button" class="auth-modal__tab" data-auth-panel="register" role="tab" aria-selected="false" aria-controls="auth-panel-register" id="auth-tab-register">Ro'yxatdan o'tish</button>
            </div>
            <p class="auth-modal__error" id="auth-modal-error" aria-live="polite"></p>

            <div class="auth-modal__panel is-active" id="auth-panel-login" role="tabpanel" aria-labelledby="auth-tab-login">
                <form class="auth-modal__form" id="auth-login-form" novalidate>
                    ${textField('auth-login-id', 'identifier', 'Email yoki login', 'text', 'username', 'auth-login-id-error')}
                    ${passwordField('auth-login-password', 'password', 'Parol', 'current-password', 'auth-login-password-error')}
                    <button type="submit" class="auth-modal__submit">Kirish</button>
                    <div class="auth-modal__links">
                        <button type="button" class="auth-modal__link" id="auth-forgot-btn">Parolni unutdingizmi?</button>
                        <button type="button" class="auth-modal__link" data-auth-switch="register">Hisobingiz yo'qmi? Ro'yxatdan o'ting</button>
                    </div>
                </form>
            </div>

            <div class="auth-modal__panel" id="auth-panel-register" role="tabpanel" aria-labelledby="auth-tab-register" hidden>
                <form class="auth-modal__form" id="auth-register-form" novalidate>
                    <div class="auth-modal__row">
                        ${textField('auth-reg-first', 'firstName', 'Ism', 'text', 'given-name', 'auth-reg-first-error')}
                        ${textField('auth-reg-last', 'lastName', 'Familiya', 'text', 'family-name', 'auth-reg-last-error')}
                    </div>
                    ${textField('auth-reg-email', 'email', 'Email', 'email', 'email', 'auth-reg-email-error')}
                    ${passwordField('auth-reg-password', 'password', 'Parol', 'new-password', 'auth-reg-password-error')}
                    ${passwordField('auth-reg-confirm', 'confirmPassword', 'Parolni tasdiqlash', 'new-password', 'auth-reg-confirm-error')}
                    <button type="submit" class="auth-modal__submit">Ro'yxatdan o'tish</button>
                    <div class="auth-modal__links">
                        <button type="button" class="auth-modal__link" data-auth-switch="login">Hisobingiz bormi? Kirish</button>
                    </div>
                </form>
            </div>

            <p class="auth-modal__demo-note">Demo autentifikatsiya: ma'lumotlar faqat brauzer localStorage'ida saqlanadi. Production uchun backend talab qilinadi.</p>
        </div>
    </div>
</div>`;

        document.body.appendChild(wrap.firstElementChild);
        modalEl = document.getElementById('platform-auth-modal');
        bindModalEvents();
    }

    function setGlobalError(message) {
        const el = document.getElementById('auth-modal-error');
        if (el) el.textContent = message || '';
    }

    function clearFieldErrors(form) {
        if (!form) return;
        form.querySelectorAll('.auth-modal__field-error').forEach(el => { el.textContent = ''; });
        form.querySelectorAll('.auth-modal__input.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    }

    function applyFieldErrors(form, fields) {
        if (!form || !fields) return;
        Object.entries(fields).forEach(([name, message]) => {
            const input = form.elements[name];
            const errorEl = document.getElementById(`${input?.id}-error`);
            if (input) input.classList.add('is-invalid');
            if (errorEl) errorEl.textContent = message;
        });
    }

    function switchPanel(panel) {
        document.querySelectorAll('.auth-modal__tab').forEach(tab => {
            const active = tab.dataset.authPanel === panel;
            tab.classList.toggle('is-active', active);
            tab.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        document.querySelectorAll('.auth-modal__panel').forEach(p => {
            const active = p.id === `auth-panel-${panel}`;
            p.classList.toggle('is-active', active);
            p.hidden = !active;
        });
        setGlobalError('');
        clearFieldErrors(document.getElementById('auth-login-form'));
        clearFieldErrors(document.getElementById('auth-register-form'));

        const subtitle = document.getElementById('auth-modal-subtitle');
        if (subtitle) {
            subtitle.textContent = panel === 'register'
                ? 'Yangi o\'quvchi hisobini yarating.'
                : 'O\'quv hisobingizga kiring yoki yangi hisob yarating.';
        }
    }

    function showSuccessState() {
        document.getElementById('auth-modal-body')?.classList.add('is-hidden');
        document.getElementById('auth-modal-success')?.classList.remove('is-hidden');
    }

    function resetSuccessState() {
        document.getElementById('auth-modal-body')?.classList.remove('is-hidden');
        document.getElementById('auth-modal-success')?.classList.add('is-hidden');
    }

    function open(panel = 'login', options = {}) {
        ensureAssets();
        renderModal();
        resetSuccessState();
        switchPanel(panel);
        pendingRedirect = options.redirect !== undefined ? options.redirect : undefined;
        modalEl.classList.add('is-open');
        modalEl.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        const focusId = panel === 'register' ? 'auth-reg-first' : 'auth-login-id';
        setTimeout(() => document.getElementById(focusId)?.focus(), 50);
    }

    function close() {
        if (!modalEl) return;
        modalEl.classList.remove('is-open');
        modalEl.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        setGlobalError('');
        resetSuccessState();
        clearFieldErrors(document.getElementById('auth-login-form'));
        clearFieldErrors(document.getElementById('auth-register-form'));
        pendingRedirect = undefined;
    }

    function afterAuthSuccess(options = {}) {
        const dashboardUrl = platformHref('pages/dashboard.html');
        const redirect = pendingRedirect !== undefined ? pendingRedirect : dashboardUrl;
        pendingRedirect = undefined;

        const finish = () => {
            close();
            updateHeaderAuthUI();
            global.PlatformAuth?.syncUserToProgress();
            if (redirect) {
                global.location.href = redirect;
                return;
            }
            global.DashboardApp?.refresh?.();
        };

        if (options.showSuccess) {
            showSuccessState();
            setTimeout(finish, 1600);
            return;
        }

        finish();
    }

    function readFormData(form) {
        const data = {};
        Array.from(form.elements).forEach(el => {
            if (el.name) data[el.name] = el.value;
        });
        return data;
    }

    async function handleLoginSubmit(e) {
        e.preventDefault();
        const form = e.target;
        clearFieldErrors(form);
        setGlobalError('');

        const data = readFormData(form);
        const clientValidation = global.PlatformAuth.validateLoginFields(data);
        if (!clientValidation.valid) {
            applyFieldErrors(form, clientValidation.fields);
            setGlobalError(clientValidation.error);
            return;
        }

        const submit = form.querySelector('[type="submit"]');
        submit.disabled = true;
        const result = await global.PlatformAuth.login(data.identifier, data.password);
        submit.disabled = false;

        if (!result.ok) {
            applyFieldErrors(form, result.fields);
            setGlobalError(result.error);
            return;
        }

        afterAuthSuccess();
    }

    async function handleRegisterSubmit(e) {
        e.preventDefault();
        const form = e.target;
        clearFieldErrors(form);
        setGlobalError('');

        const data = readFormData(form);
        const clientValidation = global.PlatformAuth.validateRegisterFields(data);
        if (!clientValidation.valid) {
            applyFieldErrors(form, clientValidation.fields);
            setGlobalError(clientValidation.error);
            return;
        }

        const submit = form.querySelector('[type="submit"]');
        submit.disabled = true;
        const result = await global.PlatformAuth.register(data);
        submit.disabled = false;

        if (!result.ok) {
            applyFieldErrors(form, result.fields);
            setGlobalError(result.error);
            return;
        }

        afterAuthSuccess({ showSuccess: true });
    }

    function togglePasswordVisibility(btn) {
        const input = document.getElementById(btn.dataset.target);
        if (!input) return;

        const visible = input.type === 'text';
        input.type = visible ? 'password' : 'text';
        btn.setAttribute('aria-pressed', visible ? 'false' : 'true');
        btn.setAttribute('aria-label', visible ? 'Parolni ko\'rsatish' : 'Parolni yashirish');
        btn.innerHTML = visible ? EYE_OPEN : EYE_OFF;
    }

    function bindModalEvents() {
        document.getElementById('auth-modal-backdrop')?.addEventListener('click', close);
        document.getElementById('auth-modal-close')?.addEventListener('click', close);

        document.querySelectorAll('.auth-modal__tab').forEach(tab => {
            tab.addEventListener('click', () => switchPanel(tab.dataset.authPanel));
        });

        document.querySelectorAll('[data-auth-switch]').forEach(btn => {
            btn.addEventListener('click', () => switchPanel(btn.dataset.authSwitch));
        });

        document.getElementById('auth-forgot-btn')?.addEventListener('click', () => {
            setGlobalError('Parolni tiklash hozircha mavjud emas. Demo rejimda yangi hisob yarating yoki administrator bilan bog\'laning.');
        });

        document.getElementById('auth-login-form')?.addEventListener('submit', handleLoginSubmit);
        document.getElementById('auth-register-form')?.addEventListener('submit', handleRegisterSubmit);

        modalEl?.addEventListener('click', (e) => {
            const toggle = e.target.closest('.auth-modal__password-toggle');
            if (toggle) togglePasswordVisibility(toggle);
        });

        ['auth-login-form', 'auth-register-form'].forEach(formId => {
            const form = document.getElementById(formId);
            form?.addEventListener('input', (e) => {
                const input = e.target;
                if (!input.classList.contains('auth-modal__input')) return;
                input.classList.remove('is-invalid');
                const errorEl = document.getElementById(`${input.id}-error`);
                if (errorEl) errorEl.textContent = '';
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalEl?.classList.contains('is-open')) close();
        });
    }

    function updateHeaderAuthUI() {
        const user = global.PlatformAuth?.getCurrentUser();
        const desktopBtn = document.getElementById('header-auth-btn');
        const drawerBtn = document.getElementById('drawer-auth-btn');

        if (desktopBtn) {
            if (user) {
                desktopBtn.textContent = 'Profil';
                desktopBtn.setAttribute('aria-label', `${user.name} — shaxsiy kabinet`);
                desktopBtn.classList.add('login-btn--authenticated');
                desktopBtn.dataset.authAction = 'dashboard';
            } else {
                desktopBtn.textContent = 'Kirish';
                desktopBtn.setAttribute('aria-label', 'Tizimga kirish');
                desktopBtn.classList.remove('login-btn--authenticated');
                desktopBtn.dataset.authAction = 'login';
            }
        }

        if (drawerBtn) {
            const label = drawerBtn.querySelector('.drawer-auth-label');
            if (user) {
                if (label) label.textContent = 'Profil';
                drawerBtn.setAttribute('aria-label', `${user.name} — shaxsiy kabinet`);
                drawerBtn.dataset.authAction = 'dashboard';
            } else {
                if (label) label.textContent = 'Kirish';
                drawerBtn.setAttribute('aria-label', 'Tizimga kirish');
                drawerBtn.dataset.authAction = 'login';
            }
        }
    }

    function bindHeaderAuthButtons() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('#header-auth-btn, #drawer-auth-btn, [data-auth-open]');
            if (!btn) return;
            e.preventDefault();

            if (btn.dataset.authAction === 'dashboard') {
                global.location.href = platformHref('pages/dashboard.html');
                return;
            }

            open(btn.dataset.authOpen || 'login');
        });
    }

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector('script[data-auth-service-js]')) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.setAttribute('data-auth-service-js', '');
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }

    async function init() {
        ensureAssets();
        await loadScript(platformHref('assets/js/auth-service.js?v=3'));
        renderModal();
        updateHeaderAuthUI();
        bindHeaderAuthButtons();

        global.addEventListener('platform:authChanged', updateHeaderAuthUI);

        if (global.PlatformAuth?.isAuthenticated()) {
            global.PlatformAuth.syncUserToProgress();
        }

        const params = new URLSearchParams(global.location.search);
        if (params.get('auth') === 'login' && !global.PlatformAuth?.isAuthenticated()) {
            open('login');
        }
    }

    global.PlatformAuthUI = { open, close, updateHeaderAuthUI, init };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window);
