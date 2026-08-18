/**
 * PlatformAuth — DEMO / LOCAL DEVELOPMENT ONLY
 *
 * Frontend-only authentication for prototyping the login/register UX.
 * NOT suitable for production — replace with server-side auth + secure sessions
 * before deploying with real user data.
 *
 * Passwords are stored as SHA-256 hashes with a fixed demo salt (see hashPasswordDemo).
 * This prevents casual plain-text storage but is NOT real security.
 */
(function (global) {
    'use strict';

    const USERS_KEY = 'platform-auth-users';
    const SESSION_KEY = 'platform-auth-session';
    const DEMO_SALT = 'gafur-gulom-demo-local-v1';

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function deriveUsername(email, firstName, lastName) {
        const local = (email.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9._-]/g, '');
        const base = local || `${(firstName || 'user').toLowerCase()}${(lastName || '').charAt(0)}`.replace(/[^a-z0-9._-]/g, '') || 'user';
        let candidate = base.slice(0, 24);
        const users = loadUsers();
        let i = 0;
        while (users.some(u => u.username.toLowerCase() === candidate.toLowerCase())) {
            i += 1;
            candidate = `${base.slice(0, 20)}${i}`;
        }
        return candidate;
    }

    function validateLoginFields(payload) {
        const fields = {};
        const identifier = (payload.identifier || '').trim();
        const password = payload.password || '';

        if (!identifier) fields.identifier = 'Email yoki loginni kiriting.';
        if (!password) fields.password = 'Parolni kiriting.';

        return {
            valid: !Object.keys(fields).length,
            fields,
            error: Object.values(fields)[0] || ''
        };
    }

    function validateRegisterFields(payload) {
        const fields = {};
        const firstName = (payload.firstName || '').trim();
        const lastName = (payload.lastName || '').trim();
        const email = (payload.email || '').trim().toLowerCase();
        const password = payload.password || '';
        const confirm = payload.confirmPassword || '';

        if (!firstName) fields.firstName = 'Ismni kiriting.';
        if (!lastName) fields.lastName = 'Familiyani kiriting.';
        if (!email) fields.email = 'Email manzilini kiriting.';
        else if (!EMAIL_RE.test(email)) fields.email = 'Email manzili noto\'g\'ri formatda.';
        if (!password) fields.password = 'Parolni kiriting.';
        else if (password.length < 8) fields.password = 'Parol kamida 8 belgidan iborat bo\'lishi kerak.';
        if (!confirm) fields.confirmPassword = 'Parolni tasdiqlang.';
        else if (password && password !== confirm) fields.confirmPassword = 'Parollar mos kelmadi.';

        return {
            valid: !Object.keys(fields).length,
            fields,
            error: Object.values(fields)[0] || ''
        };
    }

    function loadUsers() {
        try {
            const raw = global.localStorage.getItem(USERS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function saveUsers(users) {
        global.localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    function loadSession() {
        try {
            const raw = global.localStorage.getItem(SESSION_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function saveSession(session) {
        if (session) {
            global.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        } else {
            global.localStorage.removeItem(SESSION_KEY);
        }
    }

    async function hashPasswordDemo(password) {
        const data = new TextEncoder().encode(DEMO_SALT + ':' + password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    function getInitials(firstName, lastName) {
        const a = (firstName || '').trim().charAt(0);
        const b = (lastName || '').trim().charAt(0);
        const initials = (a + b).toUpperCase();
        return initials || 'F';
    }

    function formatMemberSince(iso) {
        if (!iso) return '';
        try {
            return new Date(iso).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long' });
        } catch (e) {
            return '';
        }
    }

    function toPublicUser(record) {
        return {
            id: record.id,
            firstName: record.firstName,
            lastName: record.lastName,
            username: record.username,
            email: record.email,
            name: `${record.firstName} ${record.lastName}`.trim(),
            initials: getInitials(record.firstName, record.lastName),
            memberSince: formatMemberSince(record.createdAt)
        };
    }

    function findUserByIdentifier(users, identifier) {
        const value = identifier.trim().toLowerCase();
        return users.find(u =>
            u.email.toLowerCase() === value ||
            u.username.toLowerCase() === value
        );
    }

    function emitAuthChange() {
        global.dispatchEvent(new CustomEvent('platform:authChanged', {
            detail: { user: getCurrentUser() }
        }));
    }

    function syncUserToProgress() {
        const user = getCurrentUser();
        if (global.UserProgress?.switchAccount) {
            global.UserProgress.switchAccount(user?.id || null);
        }
        if (!user || !global.UserProgress?.updateProfile) return;
        global.UserProgress.updateProfile({
            name: user.name,
            initials: user.initials,
            email: user.email,
            memberSince: user.memberSince
        });
    }

    function getCurrentUser() {
        const session = loadSession();
        if (!session?.userId) return null;
        const user = loadUsers().find(u => u.id === session.userId);
        return user ? toPublicUser(user) : null;
    }

    function isAuthenticated() {
        return !!getCurrentUser();
    }

    async function register(payload) {
        const validation = validateRegisterFields(payload);
        if (!validation.valid) {
            return { ok: false, error: validation.error, fields: validation.fields };
        }

        const firstName = payload.firstName.trim();
        const lastName = payload.lastName.trim();
        const email = payload.email.trim().toLowerCase();
        const password = payload.password;
        const username = deriveUsername(email, firstName, lastName);

        const users = loadUsers();
        if (users.some(u => u.email === email)) {
            return { ok: false, error: 'Bu email allaqachon ro\'yxatdan o\'tgan.', fields: { email: 'Bu email allaqachon ro\'yxatdan o\'tgan.' } };
        }

        const record = {
            id: 'user_' + Date.now(),
            firstName,
            lastName,
            username,
            email,
            passwordHash: await hashPasswordDemo(password),
            createdAt: new Date().toISOString()
        };

        users.push(record);
        saveUsers(users);
        saveSession({ userId: record.id, loggedInAt: Date.now() });
        syncUserToProgress();
        emitAuthChange();

        return { ok: true, user: toPublicUser(record) };
    }

    async function login(identifier, password) {
        const validation = validateLoginFields({ identifier, password });
        if (!validation.valid) {
            return { ok: false, error: validation.error, fields: validation.fields };
        }

        const idValue = identifier.trim();
        const pass = password;

        const users = loadUsers();
        const user = findUserByIdentifier(users, idValue);
        if (!user) return { ok: false, error: 'Foydalanuvchi topilmadi.', fields: { identifier: 'Foydalanuvchi topilmadi.' } };

        const hash = await hashPasswordDemo(pass);
        if (hash !== user.passwordHash) {
            return { ok: false, error: 'Parol noto\'g\'ri.', fields: { password: 'Parol noto\'g\'ri.' } };
        }

        saveSession({ userId: user.id, loggedInAt: Date.now() });
        syncUserToProgress();
        emitAuthChange();

        return { ok: true, user: toPublicUser(user) };
    }

    function logout() {
        saveSession(null);
        if (global.UserProgress?.switchAccount) {
            global.UserProgress.switchAccount(null);
        }
        emitAuthChange();
    }

    function requireAuth(options = {}) {
        if (isAuthenticated()) return true;
        if (options.openModal !== false && global.PlatformAuthUI?.open) {
            global.PlatformAuthUI.open('login');
        }
        return false;
    }

    global.PlatformAuth = {
        register,
        login,
        logout,
        getCurrentUser,
        isAuthenticated,
        requireAuth,
        syncUserToProgress,
        validateLoginFields,
        validateRegisterFields,
        DEMO_MODE: true
    };
})(window);
