/* ─── auth.js — Crisis Management Auth Module ───────────────────────────────
   Handles: tab switching, inline validation, password strength,
            password toggle, API calls to /api/auth, local storage.
──────────────────────────────────────────────────────────────────────────── */
(function () {
    'use strict';

    // ── Constants ──────────────────────────────────────────────────────────────
    const API_BASE = '/api/auth';

    // ── DOM refs ───────────────────────────────────────────────────────────────
    const tabs = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.form-panel');

    const formAdmin = document.getElementById('form-admin');
    const formUserLogin = document.getElementById('form-user-login');
    const formSignup = document.getElementById('form-signup');

    const successOverlay = document.getElementById('success-overlay');
    const successTitle = document.getElementById('success-title');
    const successSub = document.getElementById('success-sub');

    const goToSignup = document.getElementById('go-to-signup');
    const goToLogin = document.getElementById('go-to-login');

    // ── Tab switching ──────────────────────────────────────────────────────────
    function switchTab(targetTab) {
        tabs.forEach(btn => {
            const isTarget = btn.dataset.tab === targetTab;
            btn.classList.toggle('active', isTarget);
            btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
        });

        panels.forEach(panel => {
            const isTarget = panel.id === `panel-${targetTab}`;
            panel.hidden = !isTarget;
            panel.classList.toggle('active', isTarget);
        });

        // Clear all form messages on switch
        document.querySelectorAll('.form-message').forEach(el => {
            el.textContent = '';
            el.className = 'form-message';
        });
        document.querySelectorAll('.field-error').forEach(el => {
            el.textContent = '';
            el.classList.remove('active');
        });
        document.querySelectorAll('.field-input').forEach(el => {
            el.classList.remove('has-error');
        });
    }

    tabs.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    goToSignup?.addEventListener('click', () => switchTab('signup'));
    goToLogin?.addEventListener('click', () => switchTab('user-login'));

    // ── Validation helpers ─────────────────────────────────────────────────────
    function showFieldError(inputEl, errorEl, message) {
        inputEl.classList.add('has-error');
        errorEl.textContent = message;
        errorEl.classList.add('active');
        // Re-trigger animation
        void errorEl.offsetWidth;
    }

    function clearFieldError(inputEl, errorEl) {
        inputEl.classList.remove('has-error');
        errorEl.textContent = '';
        errorEl.classList.remove('active');
    }

    function showFormMessage(msgEl, message, type = 'error') {
        msgEl.textContent = message;
        msgEl.className = `form-message ${type}`;
        void msgEl.offsetWidth; // re-trigger animation
    }

    function clearFormMessage(msgEl) {
        msgEl.textContent = '';
        msgEl.className = 'form-message';
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // ── Password strength ──────────────────────────────────────────────────────
    const strengthFill = document.getElementById('strength-fill');

    function calcStrength(pw) {
        let score = 0;
        if (pw.length >= 6) score++;
        if (pw.length >= 10) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        return score; // 0–5
    }

    document.getElementById('signup-password')?.addEventListener('input', function () {
        const score = calcStrength(this.value);
        const pct = (score / 5) * 100;
        const colors = ['#EDA6A3', '#EDA6A3', '#d4b975', '#c4b87d', '#F7D794'];
        if (strengthFill) {
            strengthFill.style.width = `${pct}%`;
            strengthFill.style.backgroundColor = colors[Math.max(0, score - 1)] || 'transparent';
        }
    });

    // ── Password visibility toggle ─────────────────────────────────────────────
    document.querySelectorAll('.toggle-pw').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = document.getElementById(btn.dataset.target);
            if (!target) return;
            const isText = target.type === 'text';
            target.type = isText ? 'password' : 'text';
            btn.querySelector('.eye-icon').textContent = isText ? '👁' : '🙈';
        });
    });

    // ── Real-time inline validation (on blur) ──────────────────────────────────
    function bindBlurValidation(inputId, errorId, validator) {
        const input = document.getElementById(inputId);
        const error = document.getElementById(errorId);
        if (!input || !error) return;
        input.addEventListener('blur', () => {
            const msg = validator(input.value.trim());
            if (msg) showFieldError(input, error, msg);
            else clearFieldError(input, error);
        });
        input.addEventListener('input', () => {
            if (input.classList.contains('has-error')) {
                const msg = validator(input.value.trim());
                if (!msg) clearFieldError(input, error);
            }
        });
    }

    bindBlurValidation('admin-email', 'admin-email-error', v => !v ? 'Email is required.' : !isValidEmail(v) ? 'Enter a valid email address.' : '');
    bindBlurValidation('admin-password', 'admin-password-error', v => !v ? 'Access code is required.' : v.length < 6 ? 'Minimum 6 characters.' : '');

    bindBlurValidation('user-email', 'user-email-error', v => !v ? 'Email is required.' : !isValidEmail(v) ? 'Enter a valid email address.' : '');
    bindBlurValidation('user-password', 'user-password-error', v => !v ? 'Password is required.' : v.length < 6 ? 'Minimum 6 characters.' : '');

    bindBlurValidation('signup-name', 'signup-name-error', v => !v ? 'Full name is required.' : v.length < 2 ? 'Name must be at least 2 characters.' : '');
    bindBlurValidation('signup-email', 'signup-email-error', v => !v ? 'Email is required.' : !isValidEmail(v) ? 'Enter a valid email address.' : '');
    bindBlurValidation('signup-password', 'signup-password-error', v => !v ? 'Password is required.' : v.length < 6 ? 'Minimum 6 characters.' : '');

    // ── API helpers ────────────────────────────────────────────────────────────
    async function apiPost(endpoint, body) {
        const res = await fetch(`${API_BASE}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return { ok: res.ok, status: res.status, data };
    }

    function setLoading(btn, loading) {
        btn.classList.toggle('loading', loading);
        btn.disabled = loading;
    }

    function showSuccess(title, sub, role, autoRedirect = true) {
        successTitle.textContent = title;
        successSub.textContent = sub;
        successOverlay.hidden = false;

        if (!autoRedirect) return;

        setTimeout(() => {
            if (role === 'admin') {
                window.location.href = '/admin-panel';
            } else {
                window.location.href = '/dashboard';
            }
        }, 2000);
    }

    function storeSession(token, role, name, id) {
        localStorage.setItem('crisis_token', token);
        localStorage.setItem('crisis_role', role);
        localStorage.setItem('crisis_name', name);
        localStorage.setItem('pulse_user', JSON.stringify({ id, role, name }));
    }

    // ── Admin Login ────────────────────────────────────────────────────────────
    formAdmin?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('admin-email').value.trim();
        const password = document.getElementById('admin-password').value;
        const msgEl = document.getElementById('admin-msg');
        const btn = document.getElementById('btn-admin-login');

        clearFormMessage(msgEl);

        // Client-side validation
        let hasError = false;
        if (!email || !isValidEmail(email)) {
            showFieldError(document.getElementById('admin-email'), document.getElementById('admin-email-error'), 'Enter a valid email address.');
            hasError = true;
        }
        if (!password || password.length < 6) {
            showFieldError(document.getElementById('admin-password'), document.getElementById('admin-password-error'), 'Access code is required.');
            hasError = true;
        }
        if (hasError) return;

        setLoading(btn, true);

        try {
            const { ok, data } = await apiPost('login', { email, password });
            if (!ok) {
                showFormMessage(msgEl, data.message || 'Authentication failed.');
                return;
            }
            if (data.role !== 'admin') {
                showFormMessage(msgEl, 'This portal is restricted to administrators.');
                return;
            }
            storeSession(data.token, data.role, data.name, data.id || data._id);
            showSuccess('Command Access Granted', `Welcome, ${data.name}. Routing to admin console…`, data.role);
        } catch {
            showFormMessage(msgEl, 'Connection error. Please try again.');
        } finally {
            setLoading(btn, false);
        }
    });

    // ── User Login ─────────────────────────────────────────────────────────────
    formUserLogin?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('user-email').value.trim();
        const password = document.getElementById('user-password').value;
        const msgEl = document.getElementById('user-login-msg');
        const btn = document.getElementById('btn-user-login');

        clearFormMessage(msgEl);

        let hasError = false;
        if (!email || !isValidEmail(email)) {
            showFieldError(document.getElementById('user-email'), document.getElementById('user-email-error'), 'Enter a valid email address.');
            hasError = true;
        }
        if (!password || password.length < 6) {
            showFieldError(document.getElementById('user-password'), document.getElementById('user-password-error'), 'Password is required.');
            hasError = true;
        }
        if (hasError) return;

        setLoading(btn, true);

        try {
            const { ok, data } = await apiPost('login', { email, password });
            if (!ok) {
                showFormMessage(msgEl, data.message || 'Sign in failed. Please check your credentials.');
                return;
            }
            storeSession(data.token, data.role, data.name, data.id || data._id);
            showSuccess('Access Granted', `Welcome back, ${data.name}. Routing to command center…`, data.role);
        } catch {
            showFormMessage(msgEl, 'Connection error. Please try again.');
        } finally {
            setLoading(btn, false);
        }
    });

    // ── User Signup ────────────────────────────────────────────────────────────
    formSignup?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const msgEl = document.getElementById('signup-msg');
        const btn = document.getElementById('btn-signup');

        clearFormMessage(msgEl);

        let hasError = false;
        if (!name || name.length < 2) {
            showFieldError(document.getElementById('signup-name'), document.getElementById('signup-name-error'), 'Full name is required (min 2 characters).');
            hasError = true;
        }
        if (!email || !isValidEmail(email)) {
            showFieldError(document.getElementById('signup-email'), document.getElementById('signup-email-error'), 'Enter a valid email address.');
            hasError = true;
        }
        if (!password || password.length < 6) {
            showFieldError(document.getElementById('signup-password'), document.getElementById('signup-password-error'), 'Password must be at least 6 characters.');
            hasError = true;
        }
        if (hasError) return;

        setLoading(btn, true);

        try {
            const { ok, status, data } = await apiPost('signup', { name, email, password });
            if (!ok) {
                showFormMessage(msgEl, data.message || 'Registration failed. Please try again.');
                return;
            }
            // Instead of auto-login, redirect to login with pre-filled credentials
            showSuccess('Account Created', `Welcome, ${data.name}. Redirecting to login…`, data.role, false);

            setTimeout(() => {
                successOverlay.hidden = true;
                // Store credentials temporarily for pre-fill
                sessionStorage.setItem('pending_login_email', email);
                sessionStorage.setItem('pending_login_password', password);
                switchTab('user-login');

                // Pre-fill fields
                const loginEmail = document.getElementById('user-email');
                const loginPw = document.getElementById('user-password');
                if (loginEmail) loginEmail.value = email;
                if (loginPw) loginPw.value = password;
            }, 2000);
        } catch {
            showFormMessage(msgEl, 'Connection error. Please try again.');
        } finally {
            setLoading(btn, false);
        }
    });

    // Check for pending login data on load
    window.addEventListener('DOMContentLoaded', () => {
        const email = sessionStorage.getItem('pending_login_email');
        const password = sessionStorage.getItem('pending_login_password');
        if (email && password) {
            const loginEmail = document.getElementById('user-email');
            const loginPw = document.getElementById('user-password');
            if (loginEmail) loginEmail.value = email;
            if (loginPw) loginPw.value = password;
            // Clear to prevent repeat pre-fill on refresh
            sessionStorage.removeItem('pending_login_email');
            sessionStorage.removeItem('pending_login_password');
        }
    });

})();
