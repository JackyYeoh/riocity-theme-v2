/**
 * Shared header renderer with before-login and after-login states.
 * Works on file:// and static hosting without backend.
 */
(function () {
    var placeholder = document.getElementById('site-header');
    if (!placeholder) return;
    var authModalReturnTo = null;

    function openMobileDrawer() {
        var mobileSideDrawer = document.getElementById('mobileSideDrawer');
        var mobileDrawerOverlay = document.getElementById('mobileDrawerOverlay');
        if (mobileSideDrawer) mobileSideDrawer.classList.add('active');
        if (mobileDrawerOverlay) mobileDrawerOverlay.classList.add('active');
        document.body.classList.add('drawer-open');
    }

    function closeMobileDrawer() {
        var mobileSideDrawer = document.getElementById('mobileSideDrawer');
        var mobileDrawerOverlay = document.getElementById('mobileDrawerOverlay');
        if (mobileSideDrawer) mobileSideDrawer.classList.remove('active');
        if (mobileDrawerOverlay) mobileDrawerOverlay.classList.remove('active');
        document.body.classList.remove('drawer-open');
    }

    /** event.target can be a Text/Comment node; those have no .closest() — was skipping the drawer open on mobile. */
    function getNearestElementFromEvent(ev) {
        var t = ev && ev.target;
        if (!t) return null;
        if (t.nodeType === 1) return t;
        if (t.parentElement) return t.parentElement;
        return null;
    }

    /**
     * Bind open on the real #mobileMenuToggle node after each renderHeader() (innerHTML replaces the button).
     * Document delegation can lose taps to stacking/capture on some mobile WebViews; direct + capture is reliable.
     */
    function bindMobileMenuToggle() {
        var btn = document.getElementById('mobileMenuToggle');
        if (!btn) return;
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            openMobileDrawer();
        }, true);
        btn.addEventListener('touchend', function (e) {
            e.preventDefault();
            e.stopPropagation();
            openMobileDrawer();
        }, { capture: true, passive: false });
    }

    /* drawer close + overlay: delegated (ids stable within a render) */
    document.addEventListener('click', function (e) {
        var el = getNearestElementFromEvent(e);
        if (!el || typeof el.closest !== 'function') return;
        if (el.closest('#mobileDrawerClose')) {
            e.preventDefault();
            closeMobileDrawer();
            return;
        }
        var overlay = document.getElementById('mobileDrawerOverlay');
        if (overlay && (e.target === overlay || el === overlay)) {
            closeMobileDrawer();
        }
    }, true);

    function getCurrentPath() {
        return window.location.pathname.split('/').pop() || 'index.html';
    }

    function getSafeReturnTo(path) {
        if (!path) return getCurrentPath();
        if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
            return getCurrentPath();
        }
        return path;
    }

    function getCurrentFileName() {
        var page = window.location.pathname.split('/').pop();
        return page || 'index.html';
    }

    function getAuthStateSafe() {
        if (window.RioAuth && typeof window.RioAuth.getAuthState === 'function') {
            return window.RioAuth.getAuthState();
        }
        var loggedIn = localStorage.getItem('isLoggedIn') === 'true';
        var username = localStorage.getItem('username') || 'Player';
        return {
            isAuthenticated: loggedIn,
            user: loggedIn ? { displayName: username } : null,
            wallet: { balance: 0 }
        };
    }

    function mountAuthPopup() {
        if (document.getElementById('siteAuthModal')) return;
        var wrapper = document.createElement('div');
        wrapper.innerHTML = `
            <div class="site-auth-modal-overlay" id="siteAuthModal" aria-hidden="true">
                <div class="site-auth-modal" role="dialog" aria-modal="true" aria-label="Authentication">
                    <div class="site-auth-brand">
                        <div class="site-auth-brand-top">
                            <div class="site-auth-logo-row">
                                <img src="images/GM88.png" alt="RioCity" class="site-auth-logo">
                                <span class="site-auth-badge"><i class="fa-solid fa-shield"></i> Trusted Platform</span>
                            </div>
                            <h3 class="site-auth-brand-title">Welcome to RioCity</h3>
                            <p class="site-auth-brand-copy">Secure login, quick registration, and instant access to your gaming wallet.</p>
                        </div>
                        <ul class="site-auth-points">
                            <li><i class="fa-solid fa-check"></i> Fast deposits and withdrawals</li>
                            <li><i class="fa-solid fa-check"></i> Protected member access</li>
                            <li><i class="fa-solid fa-check"></i> 24/7 customer support</li>
                        </ul>
                    </div>

                    <div class="site-auth-panel">
                        <div class="site-auth-panel-top">
                            <div class="site-auth-header">
                                <button type="button" class="site-auth-tab active" data-auth-tab="login">Login</button>
                                <button type="button" class="site-auth-tab" data-auth-tab="register">Register</button>
                            </div>
                            <button class="site-auth-close" type="button" aria-label="Close" id="siteAuthCloseBtn">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <div class="site-auth-content active" data-auth-panel="login">
                            <div class="site-auth-headline">
                                <h3>Log In</h3>
                                <p>Enter your credentials to continue.</p>
                            </div>
                            <form id="siteHeaderLoginForm" class="site-auth-form" autocomplete="off">
                                <label for="siteAuthUsername">Enter Username or Phone Number</label>
                                <input type="text" id="siteAuthUsername" placeholder="e.g: johndoe or 855123456789" required>
                                <span class="site-auth-hint">Phone number must include country code (855xxxxxxxxx)</span>
                                <label for="siteAuthPassword">Enter Password</label>
                                <div class="site-auth-input-wrap">
                                    <input type="password" id="siteAuthPassword" placeholder="Enter Password" required>
                                    <button type="button" class="site-auth-toggle-pass" id="siteAuthTogglePass" aria-label="Toggle password visibility"><i class="fa-solid fa-eye-slash"></i></button>
                                </div>
                                <label class="site-auth-remember">
                                    <input type="checkbox" name="remember" id="siteAuthRemember">
                                    <span>Remember Me</span>
                                </label>
                                <div class="site-auth-actions">
                                    <button type="submit" class="site-auth-submit site-auth-submit-primary">Log In</button>
                                    <button type="button" class="site-auth-submit site-auth-submit-secondary" id="siteAuthForgotBtn">Forgot Password</button>
                                </div>
                                <p class="site-auth-switch">Do not have an account yet? <button type="button" class="site-auth-link" id="siteAuthRegisterLink">Register Now!</button></p>
                            </form>
                        </div>

                        <div class="site-auth-content" data-auth-panel="register">
                            <div class="site-auth-headline">
                                <h3>Create Account</h3>
                                <p>Join RioCity in seconds.</p>
                            </div>
                            <form id="siteHeaderRegisterForm" class="site-auth-form" autocomplete="off">
                                <label for="siteRegUsername">Enter Username</label>
                                <input type="text" id="siteRegUsername" name="username" placeholder="Choose a username" required>
                                <label for="siteRegPhone">Mobile Number</label>
                                <div class="site-auth-phone-row">
                                    <select id="siteRegCountryCode" class="site-auth-country-code" required>
                                        <option value="+855" selected>+855</option>
                                        <option value="+60">+60</option>
                                        <option value="+65">+65</option>
                                        <option value="+62">+62</option>
                                    </select>
                                    <input type="tel" id="siteRegPhone" name="phone" placeholder="Enter mobile number" required>
                                </div>
                                <label for="siteRegPassword">Enter Your Password</label>
                                <div class="site-auth-input-wrap">
                                    <input type="password" id="siteRegPassword" placeholder="Enter your password" required>
                                    <button type="button" class="site-auth-toggle-pass" id="siteRegTogglePass" aria-label="Toggle password visibility"><i class="fa-solid fa-eye-slash"></i></button>
                                </div>
                                <ul class="site-auth-password-rules">
                                    <li><i class="fa-solid fa-check-circle"></i> Include at least 8 characters, containing both a letter and a number, with no symbols allowed.</li>
                                    <li><i class="fa-solid fa-check-circle"></i> Only letters (A-Z, a-z) and numbers (0-9).</li>
                                    <li><i class="fa-solid fa-check-circle"></i> No special characters / symbols.</li>
                                </ul>
                                <label for="siteRegReferral">Key In Your Referral Code (Optional)</label>
                                <input type="text" id="siteRegReferral" name="referral" placeholder="e.g: 3YPAOJTr" class="site-auth-input-optional">
                                <button type="submit" class="site-auth-submit site-auth-submit-primary">Register</button>
                                <p class="site-auth-switch">Already have an account? <button type="button" class="site-auth-link" id="siteAuthLoginLink">Log In</button></p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(wrapper.firstElementChild);
        bindAuthPopupEvents();
    }

    function setAuthTab(tab) {
        document.querySelectorAll('.site-auth-tab').forEach(function (el) {
            el.classList.toggle('active', el.getAttribute('data-auth-tab') === tab);
        });
        document.querySelectorAll('.site-auth-content').forEach(function (el) {
            el.classList.toggle('active', el.getAttribute('data-auth-panel') === tab);
        });
    }

    function closeAuthPopup() {
        var modal = document.getElementById('siteAuthModal');
        if (!modal) return;
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    }

    function handleAuthSuccess() {
        closeAuthPopup();
        var target = getSafeReturnTo(authModalReturnTo);
        authModalReturnTo = null;
        if (target && target !== getCurrentPath()) {
            window.location.href = target;
        }
    }

    function bindAuthPopupEvents() {
        var modal = document.getElementById('siteAuthModal');
        if (!modal) return;

        modal.addEventListener('click', function (event) {
            if (event.target === modal) closeAuthPopup();
        });

        var closeBtn = document.getElementById('siteAuthCloseBtn');
        if (closeBtn) closeBtn.addEventListener('click', closeAuthPopup);

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && modal.classList.contains('active')) closeAuthPopup();
        });

        document.querySelectorAll('.site-auth-tab').forEach(function (tabBtn) {
            tabBtn.addEventListener('click', function () {
                setAuthTab(tabBtn.getAttribute('data-auth-tab'));
            });
        });

        var registerLink = document.getElementById('siteAuthRegisterLink');
        if (registerLink) registerLink.addEventListener('click', function () { setAuthTab('register'); });
        var loginLink = document.getElementById('siteAuthLoginLink');
        if (loginLink) loginLink.addEventListener('click', function () { setAuthTab('login'); });

        var forgotBtn = document.getElementById('siteAuthForgotBtn');
        if (forgotBtn) forgotBtn.addEventListener('click', function () {
            alert('To reset your password, please contact Customer Support.');
        });

        function togglePasswordVisibility(inputId, toggleId) {
            var input = document.getElementById(inputId);
            var btn = document.getElementById(toggleId);
            if (!input || !btn) return;
            var icon = btn.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                if (icon) { icon.classList.remove('fa-eye-slash'); icon.classList.add('fa-eye'); }
            } else {
                input.type = 'password';
                if (icon) { icon.classList.remove('fa-eye'); icon.classList.add('fa-eye-slash'); }
            }
        }
        var toggleLogin = document.getElementById('siteAuthTogglePass');
        if (toggleLogin) toggleLogin.addEventListener('click', function () { togglePasswordVisibility('siteAuthPassword', 'siteAuthTogglePass'); });
        var toggleReg = document.getElementById('siteRegTogglePass');
        if (toggleReg) toggleReg.addEventListener('click', function () { togglePasswordVisibility('siteRegPassword', 'siteRegTogglePass'); });

        var loginForm = document.getElementById('siteHeaderLoginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', function (event) {
                event.preventDefault();
                var usernameInput = document.getElementById('siteAuthUsername');
                var username = usernameInput && usernameInput.value ? usernameInput.value.trim() : 'Player';
                if (window.RioAuth && typeof window.RioAuth.setAuthState === 'function') {
                    window.RioAuth.setAuthState({
                        user: { id: 'mock-user', username: username, displayName: username },
                        wallet: { balance: 0 }
                    });
                }
                handleAuthSuccess();
            });
        }

        var registerForm = document.getElementById('siteHeaderRegisterForm');
        if (registerForm) {
            registerForm.addEventListener('submit', function (event) {
                event.preventDefault();
                var usernameInput = document.getElementById('siteRegUsername');
                var passwordInput = document.getElementById('siteRegPassword');
                var username = usernameInput && usernameInput.value ? usernameInput.value.trim() : 'Player';
                var password = passwordInput ? passwordInput.value : '';
                if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password) || !/^[A-Za-z0-9]+$/.test(password)) {
                    alert('Password must be at least 8 characters and contain letters and numbers only (no symbols).');
                    return;
                }
                if (window.RioAuth && typeof window.RioAuth.setAuthState === 'function') {
                    window.RioAuth.setAuthState({
                        user: { id: 'mock-user', username: username, displayName: username },
                        wallet: { balance: 0 }
                    });
                }
                handleAuthSuccess();
            });
        }
    }

    window.openRioAuthModal = function (tab, returnToPath) {
        mountAuthPopup();
        authModalReturnTo = getSafeReturnTo(returnToPath);
        setAuthTab(tab === 'register' ? 'register' : 'login');
        var modal = document.getElementById('siteAuthModal');
        if (!modal) return;
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    };

    function renderHeader() {
        var auth = getAuthStateSafe();
        var username = auth.isAuthenticated ? (auth.user && auth.user.displayName ? auth.user.displayName : 'Player') : 'Guest';
        var currentFile = getCurrentFileName();

        var guestControls = `
            <div class="auth-guest-controls">
                <button class="btn btn-login" type="button" id="headerLoginBtn">LOGIN</button>
                <button class="btn btn-register" type="button" id="headerRegisterBtn">REGISTER</button>
            </div>
        `;

        var mobileGuestControls = `
            <div class="auth-guest-controls" data-auth-role="guest">
                <button class="btn btn-login btn-mobile-login" type="button" id="mobileHeaderLoginBtn">LOGIN</button>
            </div>
        `;

        var memberControls = `
            <div class="auth-member-controls">
                <div class="balance-box" id="headerBalanceTrigger" style="position: relative; cursor: pointer;">
                    <i class="fa-solid fa-wallet coin-icon" aria-hidden="true"></i>
                    <span class="currency">${Number(auth.wallet && auth.wallet.balance ? auth.wallet.balance : 0).toFixed(2)}</span>
                    <i class="fa-solid fa-chevron-down"></i>
                    <i class="fa-solid fa-rotate balance-refresh"></i>

                    <!-- Rollover Popover -->
                    <div class="rollover-popover" id="headerRolloverPopover">
                        <div class="rollover-header">
                            <span class="rollover-title">Deposit Rollover</span>
                            <span class="rollover-value">0 / 343</span>
                        </div>
                        <div class="rollover-progress-container">
                            <div class="rollover-progress-fill" style="width: 0%;"></div>
                        </div>
                        <div class="rollover-footer">
                            <span>Target: 0%</span>
                        </div>
                        <button class="btn-clear-rollover" onclick="alert('Request to clear rollover submitted.')">
                            Request to Clear
                        </button>
                    </div>
                </div>
                <a class="btn btn-fund" href="account-details.html#financeSection" data-auth-required>FUND MANAGEMENT</a>
                <button class="btn btn-logout" id="headerLogoutBtn">LOGOUT</button>
            </div>
        `;

        var sideBonusTabs = `
            <div class="premium-floating-dock">
                <a href="#" class="dock-item" data-tooltip="Spin Wheel" onclick="alert('Spin Wheel Opened!')">
                    <img src="https://pksoftcdn.azureedge.net/media/spin%20wheel%20button-202501021417106102.svg" alt="Spin Wheel">
                </a>
                <a href="#" class="dock-item" data-tooltip="Voucher Scratch" onclick="alert('Voucher Scratch Opened!')">
                    <img src="https://pksoftcdn.azureedge.net/media/voucher-scratch-202510101415238782.png" alt="Voucher Scratch">
                </a>
                <a href="#" class="dock-item" data-tooltip="Prize Box" onclick="alert('Prize Box Opened!')">
                    <img src="https://pksoftcdn.azureedge.net/media/prize-box-202510101415447518.png" alt="Prize Box">
                </a>
            </div>
        `;

        var mobileMemberControls = `
            <div class="auth-member-controls" data-auth-role="member">
                <a href="account-details.html#financeSection" class="mobile-balance-box" data-auth-required aria-label="Fund management">
                    <span class="currency">${Number(auth.wallet && auth.wallet.balance ? auth.wallet.balance : 0).toFixed(2)}</span>
                </a>
                <a href="account-details.html" class="mobile-profile-btn"><i class="fa-solid fa-user-circle"></i></a>
            </div>
        `;

        var mobileDrawerAuthHeader = auth.isAuthenticated ?
            `<i class="fa-solid fa-user-circle"></i><span class="welcome-text">Welcome <strong>${username}</strong></span>` :
            `<i class="fa-solid fa-user-circle"></i><span class="welcome-text">Welcome <strong>Guest</strong></span>`;

        var mobileDrawerFooterAuth = auth.isAuthenticated ?
            `<button class="btn btn-logout mobile-logout-btn" id="mobileDrawerLogoutBtn">LOGOUT</button>` :
            ``;

        var headerHtml = `
            <!-- Mobile Header (Visible < 1024px) -->
            <div class="mobile-header">
                <div class="mobile-header-left">
                    <button type="button" class="btn-hamburger" id="mobileMenuToggle" aria-label="Toggle menu">
                        <i class="fa-solid fa-bars"></i>
                    </button>
                </div>
                <div class="mobile-header-center">
                    <a href="index.html" class="mobile-brand-logo">
                        <img src="images/GM88.png" alt="GM88 Logo">
                    </a>
                </div>
                <div class="mobile-header-right">
                    ${auth.isAuthenticated ? mobileMemberControls : mobileGuestControls}
                </div>
            </div>

            <!-- Mobile Side Drawer -->
            <div class="mobile-drawer-overlay" id="mobileDrawerOverlay"></div>
            <aside class="mobile-side-drawer" id="mobileSideDrawer">
                <div class="mobile-drawer-header">
                    <div class="mobile-drawer-user">
                        ${mobileDrawerAuthHeader}
                    </div>
                    <button type="button" class="btn-drawer-close" id="mobileDrawerClose" aria-label="Close menu">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div class="mobile-drawer-content">
                    <ul class="mobile-nav-links">
                        <li data-nav="index"><a href="index.html"><i class="fa-solid fa-home"></i> HOME</a></li>
                        <li data-nav="live-casino"><a href="live-casino.html"><i class="fa-solid fa-dice"></i> LIVE CASINO</a></li>
                        <li data-nav="sports"><a href="sports.html"><i class="fa-solid fa-futbol"></i> SPORTS</a></li>
                        <li data-nav="slots"><a href="slots.html"><i class="fa-solid fa-table-cells"></i> SLOTS</a></li>
                        <li data-nav="promotions"><a href="promotions.html"><i class="fa-solid fa-gift"></i> PROMOTIONS</a></li>
                        <li data-nav="vip"><a href="vip.html"><i class="fa-solid fa-crown"></i> VIP</a></li>
                        <li data-nav="games"><a href="games.html"><i class="fa-solid fa-clock-rotate-left"></i> RECENT</a></li>
                        <li data-nav="poker"><a href="poker.html"><i class="fa-solid fa-diamond"></i> POKER</a></li>
                        <li data-nav="fishing"><a href="fish-hunt.html"><i class="fa-solid fa-fish"></i> FISH HUNT</a></li>
                        <li data-nav="rebate"><a href="rebate.html"><i class="fa-solid fa-percent"></i> REBATE</a></li>
                    </ul>
                    <div class="mobile-drawer-footer">
                        <div class="language-selector mobile-lang">
                            <img src="https://flagcdn.com/w20/gb.png" alt="English">
                            <span>EN</span>
                            <i class="fa-solid fa-chevron-down"></i>
                        </div>
                        ${mobileDrawerFooterAuth}
                    </div>
                </div>
            </aside>

            <!-- Top Header Bar (Desktop Only) -->
            <header class="top-header">
                <div class="container top-header-inner">
                    <div class="top-left">
                        <span class="welcome-text">Welcome <strong>${username}</strong></span>
                        <div class="notification">
                            <i class="fa-solid fa-bell"></i>
                            <span class="badge">0</span>
                        </div>
                    </div>
                    <div class="top-right">
                        ${auth.isAuthenticated ? memberControls : guestControls}
                        <div class="language-selector">
                            <img src="https://flagcdn.com/w20/gb.png" alt="English">
                            <span>EN</span>
                            <i class="fa-solid fa-chevron-down"></i>
                        </div>
                    </div>
                </div>
            </header>
            <nav class="main-nav">
                <div class="container main-nav-inner">
                    <a href="index.html" class="brand-logo">
                        <img src="images/GM88.png" alt="GM88 Logo" style="height: 55px; width: auto; object-fit: contain; margin-bottom: 8px;">
                    </a>
                    <ul class="nav-links">
                        <li data-nav="index"><a href="index.html"><i class="fa-solid fa-home"></i><span>HOME</span></a></li>
                        <li data-nav="live-casino"><a href="live-casino.html"><i class="fa-solid fa-dice"></i><span>LIVE CASINO</span></a></li>
                        <li data-nav="sports"><a href="sports.html"><i class="fa-solid fa-futbol"></i><span>SPORTS</span></a></li>
                        <li data-nav="slots"><a href="slots.html"><i class="fa-solid fa-table-cells"></i><span>SLOTS</span></a></li>
                        <li data-nav="promotions"><a href="promotions.html"><i class="fa-solid fa-gift"></i><span>PROMOTIONS</span></a></li>
                        <li data-nav="vip"><a href="vip.html"><i class="fa-solid fa-crown"></i><span>VIP</span></a></li>
                        <li data-nav="games"><a href="games.html"><i class="fa-solid fa-clock-rotate-left"></i><span>RECENT</span></a></li>
                        <li data-nav="poker"><a href="poker.html"><i class="fa-solid fa-diamond"></i><span>POKER</span></a></li>
                        <li data-nav="fishing"><a href="fish-hunt.html"><i class="fa-solid fa-fish"></i><span>FISH HUNT</span></a></li>
                        <li data-nav="rebate"><a href="rebate.html"><i class="fa-solid fa-percent"></i><span>REBATE</span></a></li>
                    </ul>
                </div>
            </nav>

            <!-- Sticky Bottom Tab Bar (Home Page & All Pages) -->
            <nav class="mobile-bottom-nav">
                <a href="index.html" class="bottom-nav-item" data-nav="index">
                    <i class="fa-solid fa-house"></i>
                    <span>Home</span>
                </a>
                <a href="promotions.html" class="bottom-nav-item" data-nav="promotions">
                    <i class="fa-solid fa-gift"></i>
                    <span>Promo</span>
                </a>
                <a href="games.html" class="bottom-nav-item bottom-nav-center" data-nav="games">
                    <div class="center-nav-circle">
                        <i class="fa-solid fa-gamepad"></i>
                    </div>
                    <span>Games</span>
                </a>
                <a href="results.html" class="bottom-nav-item" data-nav="results">
                    <i class="fa-solid fa-chart-line"></i>
                    <span>Result</span>
                </a>
                <a href="account-details.html" class="bottom-nav-item" data-nav="account-details">
                    <i class="fa-solid fa-user"></i>
                    <span>Profile</span>
                </a>
            </nav>
        `;

        placeholder.innerHTML = headerHtml + sideBonusTabs;
        var page = (document.body.getAttribute('data-page') || 'index').toLowerCase();
        var activeNavs = placeholder.querySelectorAll('[data-nav="' + page + '"]');
        activeNavs.forEach(function (nav) {
            nav.classList.add('active');
        });

        var logoutBtn = document.getElementById('headerLogoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function () {
                if (window.RioAuth && typeof window.RioAuth.clearAuthState === 'function') {
                    window.RioAuth.clearAuthState();
                } else {
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('username');
                }
                window.location.href = 'index.html';
            });
        }

        var loginBtn = document.getElementById('headerLoginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', function () {
                window.openRioAuthModal('login', currentFile);
            });
        }

        var registerBtn = document.getElementById('headerRegisterBtn');
        if (registerBtn) {
            registerBtn.addEventListener('click', function () {
                window.openRioAuthModal('register', currentFile);
            });
        }

        bindMobileMenuToggle();

        var mobileLoginBtn = document.getElementById('mobileHeaderLoginBtn');
        if (mobileLoginBtn) {
            mobileLoginBtn.addEventListener('click', function () {
                window.openRioAuthModal('login', currentFile);
            });
        }

        var mobileLogoutBtn = document.getElementById('mobileDrawerLogoutBtn');
        if (mobileLogoutBtn) {
            mobileLogoutBtn.addEventListener('click', function () {
                if (window.RioAuth && typeof window.RioAuth.clearAuthState === 'function') {
                    window.RioAuth.clearAuthState();
                } else {
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('username');
                }
                window.location.href = 'index.html';
            });
        }

        // Rollover Popover Toggle
        var balanceTrigger = document.getElementById('headerBalanceTrigger');
        var rolloverPopover = document.getElementById('headerRolloverPopover');
        
        if (balanceTrigger && rolloverPopover) {
            balanceTrigger.addEventListener('click', function(e) {
                e.stopPropagation();
                rolloverPopover.classList.toggle('active');
            });

            document.addEventListener('click', function(e) {
                if (!rolloverPopover.contains(e.target) && !balanceTrigger.contains(e.target)) {
                    rolloverPopover.classList.remove('active');
                }
            });
        }

        document.dispatchEvent(new CustomEvent('headerLoaded'));
    }

    renderHeader();
    document.addEventListener('authStateChanged', renderHeader);
})();
