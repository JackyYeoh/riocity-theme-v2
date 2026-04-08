/* ============================================
   AUTH MODAL FUNCTIONS
   ============================================ */

// Auth Modal Functions
function openAuthModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        document.body.classList.add('modal-open');
        modal.classList.add('active');
    }
}

function closeAuthModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        document.body.classList.remove('modal-open');
        modal.classList.remove('active');
    }
}

// Password toggle
function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const icon = btn.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Password strength checker
function checkPasswordStrength(password) {
    const fill = document.getElementById('strengthFill');
    const text = document.getElementById('strengthText');
    if (!fill || !text) return;

    let s = 0;
    if (password.length >= 8) s++;
    if (password.match(/[A-Z]/)) s++;
    if (password.match(/[0-9]/)) s++;

    fill.className = 'strength-fill';
    if (s === 1) { fill.classList.add('weak'); text.innerText = 'Weak'; }
    else if (s === 2) { fill.classList.add('fair'); text.innerText = 'Fair'; }
    else if (s === 3) { fill.classList.add('strong'); text.innerText = 'Strong'; }
    else { text.innerText = 'Min. 8 characters'; }
}

// Handle forgot password
function handleForgot() {
    const forgotModal = document.getElementById('forgotModal');
    if (forgotModal) {
        forgotModal.classList.add('active');
    }
}

function closeForgotModal() {
    const forgotModal = document.getElementById('forgotModal');
    if (forgotModal) {
        forgotModal.classList.remove('active');
    }
}

function continueForgot() {
    // Redirect to customer support or open support chat
    // Replace with your actual support URL
    window.open('https://your-support-url.com', '_blank');
    closeForgotModal();
}

// Fake Login Functions
function fakeLogin(username = 'Guest') {
    if (window.RioAuth && typeof window.RioAuth.setAuthState === 'function') {
        window.RioAuth.setAuthState({
            user: {
                id: 'mock-user',
                username: username,
                displayName: username
            },
            wallet: {
                balance: 0
            }
        });
    } else {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
    }

    // Update UI
    updateHeaderForLoggedIn(username);

    // Close modal
    closeAuthModal('loginModal');

    // Show success message (optional)
    console.log('Logged in as:', username);
}

function fakeRegister(username = 'Guest') {
    if (window.RioAuth && typeof window.RioAuth.setAuthState === 'function') {
        window.RioAuth.setAuthState({
            user: {
                id: 'mock-user',
                username: username,
                displayName: username
            },
            wallet: {
                balance: 0
            }
        });
    } else {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
    }

    // Update UI
    updateHeaderForLoggedIn(username);

    // Close modal
    closeAuthModal('registerModal');

    // Show success message (optional)
    console.log('Account created and logged in as:', username);
}

function logout() {
    if (window.RioAuth && typeof window.RioAuth.clearAuthState === 'function') {
        window.RioAuth.clearAuthState();
    } else {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
    }

    // Update UI
    updateHeaderForLoggedOut();

    console.log('Logged out');
}

/* Balance Wallet Dropdown (Main + Game Wallet) */
function toggleBalanceDropdown(e) {
    if (e) e.stopPropagation();
    const wrap = document.getElementById('balancePillWrap');
    if (wrap) wrap.classList.toggle('open');
}

window.toggleBalanceDropdown = toggleBalanceDropdown;

function refreshBalanceWallet(e) {
    if (e) e.stopPropagation();
    const btn = document.querySelector('.balance-wallet-refresh');
    if (!btn) return;
    btn.classList.add('refreshing');
    btn.disabled = true;
    // Simulate API refresh - replace with actual API call to fetch balances
    setTimeout(() => {
        btn.classList.remove('refreshing');
        btn.disabled = false;
    }, 800);
}

window.refreshBalanceWallet = refreshBalanceWallet;

function initBalanceDropdown() {
    const wrap = document.getElementById('balancePillWrap');
    if (!wrap) return;
    const toggle = document.getElementById('balanceInfoToggle');
    if (toggle) {
        var openDropdown = function (e) {
            if (e && e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            wrap.classList.toggle('open');
        };
        toggle.onclick = openDropdown;
        toggle.onkeydown = function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openDropdown(e);
            }
        };
    }
}

function isLoggedIn() {
    if (window.RioAuth && typeof window.RioAuth.isAuthenticated === 'function') {
        return window.RioAuth.isAuthenticated();
    }
    return localStorage.getItem('isLoggedIn') === 'true';
}

function getUsername() {
    if (window.RioAuth && typeof window.RioAuth.getAuthState === 'function') {
        const state = window.RioAuth.getAuthState();
        return state.user && state.user.displayName ? state.user.displayName : 'Guest';
    }
    return localStorage.getItem('username') || 'Guest';
}


function updateHeaderForLoggedIn(username) {
    const headerRight = document.querySelector('.header-right');
    const mobileUserSection = document.getElementById('mobileUserSection');
    if (!headerRight) return;

    // Update Header
    headerRight.innerHTML = `
        <div class="user-menu">
            <!-- Balance & Deposit (Desktop Only) -->
            <div class="balance-pill-wrap desktop-only" id="balancePillWrap">
                <div class="balance-pill">
                    <button type="button" class="balance-toggle" title="Toggle Balance Visibility" tabindex="-1">
                        <i class="fas fa-eye-slash"></i>
                    </button>
                    <div class="balance-info" id="balanceInfoToggle" role="button" tabindex="0">
                        <span class="currency">MYR</span>
                        <span class="amount" id="balanceMainAmount">89.41</span>
                        <i class="fas fa-chevron-down balance-chevron" id="balanceChevron"></i>
                    </div>
                    <a href="account-details.html#financeSection" class="btn-deposit-gold">Deposit</a>
                </div>
                <div class="balance-wallet-dropdown" id="balanceWalletDropdown">
                    <div class="balance-wallet-header">
                        <span class="balance-wallet-title">Wallet</span>
                        <button type="button" class="balance-wallet-refresh" onclick="refreshBalanceWallet(event)" aria-label="Refresh balances" title="Refresh">
                            <i class="fas fa-sync-alt"></i>
                            <span>Refresh</span>
                        </button>
                    </div>
                    <div class="balance-wallet-row">
                        <span class="balance-wallet-label">Main Wallet</span>
                        <span class="balance-wallet-amount" id="balanceMainWallet">89.41</span>
                    </div>
                    <div class="balance-wallet-row">
                        <span class="balance-wallet-label">
                            Game Wallet
                            <i class="fas fa-info-circle balance-wallet-info" title="Used for placing bets. Transfer from Main Wallet to play."></i>
                        </span>
                        <span class="balance-wallet-amount balance-wallet-amount-white" id="balanceGameWallet">0.00</span>
                    </div>
                </div>
            </div>

            <!-- APK Download Button (Desktop Only) -->
            <button class="apk-download-btn desktop-only" onclick="downloadAPK()" aria-label="Download APK" title="Download APK">
                <i class="fab fa-android"></i>
            </button>

            <!-- User Profile (Desktop Only) -->
            <div class="desktop-only" style="position: relative;">
                <div class="user-profile-circle" id="profileToggle">
                    <i class="fas fa-user"></i>
                </div>
                
                <!-- Profile Dropdown -->
                <div class="profile-dropdown" id="profileDropdown">
                    <div class="profile-dropdown-header">
                        <div class="profile-avatar-wrapper">
                            <i class="fas fa-user"></i>
                            <div class="edit-avatar-btn">
                                <i class="fas fa-pencil-alt"></i>
                            </div>
                        </div>
                        <h3 class="profile-name">Hi, ${username}</h3>
                        <div class="profile-meta">
                            <span><i class="far fa-calendar-alt"></i> Joined: 12/01/2026</span>
                        </div>
                        <div class="profile-rank-badge">
                            <i class="fas fa-crown"></i>
                            <span>Iron</span>
                        </div>
                    </div>
                    
                    <div class="profile-menu-section">
                        <h4 class="profile-menu-title">MY ACCOUNT</h4>
                        <div class="profile-menu-list">
                            <a href="account-details.html#profileSection" class="profile-menu-item">
                                <i class="fas fa-user-circle"></i>
                                <span>My Profile</span>
                                <i class="fas fa-chevron-right profile-menu-arrow"></i>
                            </a>
                            <a href="account-details.html#financeSection" class="profile-menu-item">
                                <i class="fas fa-wallet"></i>
                                <span>Deposit / Withdrawal</span>
                                <i class="fas fa-chevron-right profile-menu-arrow"></i>
                            </a>
                        </div>
                    </div>
                    
                    <div class="profile-logout-row">
                        <button onclick="logout()" class="profile-logout-btn">
                            <i class="fas fa-sign-out-alt"></i>
                            <span>Log Out</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Language selector -->
            <div class="language-selector">
                <img src="images/flags/en.svg" alt="EN" class="flag-icon">
                <span>EN</span>
                <i class="fas fa-chevron-down"></i>
            </div>

            <button class="mobile-info-btn" aria-label="Information">
                <i class="fas fa-info"></i>
            </button>
        </div>
        <button class="mobile-menu-btn" aria-label="Toggle mobile menu">
            <i class="fas fa-bars"></i>
        </button>
    `;

    // Update Mobile Menu User Section
    if (mobileUserSection) {
        mobileUserSection.innerHTML = `
            <div class="mobile-profile-card">
                <div class="profile-info">
                    <div class="user-profile-circle">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="user-details">
                        <span class="user-name">Hi, ${username}</span>
                        <span class="user-id">ID: 680082</span>
                    </div>
                </div>
                <div class="mobile-balance-row">
                    <div class="balance-amount">
                        <span class="currency">MYR</span>
                        <span class="amount">0.00</span>
                    </div>
                    <button class="btn-deposit-gold" onclick="location.href='account-details.html#financeSection'">Deposit</button>
                </div>
                <a href="#" class="mobile-nav-link" onclick="downloadAPK(); return false;" style="margin-top: 12px; display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255, 255, 255, 0.03); border-radius: 8px;">
                    <i class="fab fa-android" style="font-size: 1.2rem; color: #22c55e;"></i>
                    <span>Download App</span>
                </a>
                <div class="mobile-nav-divider"></div>
            </div>
        `;
    }

    // Hide login/signup buttons in mobile menu
    const mobileAuthBtns = document.querySelectorAll('.mobile-menu .btn-login, .mobile-menu .btn-signup');
    mobileAuthBtns.forEach(btn => btn.style.display = 'none');

    // Hide mobile auth buttons below notification bar when logged in
    const mobileAuthButtons = document.querySelector('.mobile-auth-buttons');
    if (mobileAuthButtons) {
        mobileAuthButtons.classList.add('hidden');
    }

    // Hide duplicate APK download link in main menu (it's now in profile section)
    const allApkLinks = document.querySelectorAll('.mobile-nav a[onclick*="downloadAPK"]');
    allApkLinks.forEach(link => {
        // Only hide if it's not inside the mobile-profile-card (which we just added)
        if (!link.closest('.mobile-profile-card')) {
            link.style.display = 'none';
        }
    });

    // Init balance wallet dropdown
    initBalanceDropdown();

    // Set active state on profile menu item when on account-details page
    const isAccountDetails = window.location.pathname.endsWith('account-details.html');
    const hash = window.location.hash || '#profileSection';
    if (isAccountDetails) {
        document.querySelectorAll('.profile-menu-item').forEach(item => {
            const href = item.getAttribute('href') || '';
            item.classList.toggle('active', href.endsWith(hash));
        });
    }

    // Re-initialize event listeners
    const profileToggle = document.getElementById('profileToggle');
    const profileDropdown = document.getElementById('profileDropdown');

    if (profileToggle && profileDropdown) {
        profileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('active');
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!profileDropdown.contains(e.target) && e.target !== profileToggle) {
                profileDropdown.classList.remove('active');
            }
        });
    }

    if (typeof initLanguageSelector === 'function') initLanguageSelector();

    // Show page-specific logged-in sections
    document.querySelectorAll('.logged-in-only').forEach(el => el.style.display = '');
}

function updateHeaderForLoggedOut() {
    const headerRight = document.querySelector('.header-right');
    if (!headerRight) return;

    headerRight.innerHTML = `
        <button onclick="openAuthModal('loginModal')" class="btn btn-ghost magnetic desktop-only">Log In</button>
        <button onclick="openAuthModal('registerModal')" class="btn btn-primary magnetic desktop-only">Join Now</button>
        
        <div class="language-selector">
            <img src="images/flags/en.svg" alt="EN" class="flag-icon">
            <span>EN</span>
            <i class="fas fa-chevron-down"></i>
        </div>

        <button class="mobile-info-btn" aria-label="Information">
            <i class="fas fa-info"></i>
        </button>

        <button class="mobile-menu-btn" aria-label="Toggle mobile menu">
            <i class="fas fa-bars"></i>
        </button>
    `;

    // Show mobile auth buttons below notification bar when logged out
    const mobileAuthButtons = document.querySelector('.mobile-auth-buttons');
    if (mobileAuthButtons) {
        mobileAuthButtons.classList.remove('hidden');
    }

    if (typeof initLanguageSelector === 'function') initLanguageSelector();

    // Hide page-specific logged-in sections
    document.querySelectorAll('.logged-in-only').forEach(el => el.style.display = 'none');
}

// Check login state on page load
function checkLoginState() {
    if (isLoggedIn()) {
        updateHeaderForLoggedIn(getUsername());
    } else {
        // Hide Balance + Deposit when not logged in (only show after login)
        const headerWalletSection = document.getElementById('headerWalletSection');
        if (headerWalletSection) {
            headerWalletSection.style.display = 'none';
        }
        // Ensure mobile auth buttons are visible when logged out
        const mobileAuthButtons = document.querySelector('.mobile-auth-buttons');
        if (mobileAuthButtons) {
            mobileAuthButtons.classList.remove('hidden');
        }
        // Hide page-specific logged-in sections
        document.querySelectorAll('.logged-in-only').forEach(el => el.style.display = 'none');
    }
}

// Initialize auth modals
function initAuthModals() {
    // Check login state on load
    checkLoginState();

    // Close on overlay click
    document.querySelectorAll('.auth-modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function (e) {
            if (e.target === this) {
                closeAuthModal(this.id);
            }
        });
    });

    // Close forgot modal on overlay click
    const forgotModal = document.getElementById('forgotModal');
    if (forgotModal) {
        forgotModal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeForgotModal();
            }
        });
    }

    // Close balance dropdown on outside click (delegated, works for dynamic content)
    document.addEventListener('click', function (e) {
        const wrap = document.getElementById('balancePillWrap');
        if (wrap && wrap.classList.contains('open') && !wrap.contains(e.target)) {
            wrap.classList.remove('open');
        }
    });

    // Close on ESC key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.auth-modal-overlay.active').forEach(modal => {
                closeAuthModal(modal.id);
            });
            // Also close forgot modal if open
            if (forgotModal && forgotModal.classList.contains('active')) {
                closeForgotModal();
            }
        }
    });

    // Login form submission - No validation needed, just click to login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const btn = this.querySelector('.auth-submit-btn');
            const usernameInput = document.getElementById('username');
            const username = usernameInput && usernameInput.value ? usernameInput.value : 'Guest';

            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
            btn.disabled = true;

            // Fake login - no validation, just wait a bit for effect
            setTimeout(() => {
                fakeLogin(username);
                btn.innerHTML = '<span>Sign In</span><i class="fas fa-arrow-right"></i>';
                btn.disabled = false;
            }, 800);
        });
    }

    // Register form submission - Auto login after registration
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const btn = this.querySelector('.auth-submit-btn');
            const usernameInput = registerForm.querySelector('input[name="username"]');
            const username = usernameInput && usernameInput.value ? usernameInput.value : 'Guest';

            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
            btn.disabled = true;

            // Fake register and auto login
            setTimeout(() => {
                fakeRegister(username);
                btn.innerHTML = '<span>Join Now</span><i class="fas fa-user-plus"></i>';
                btn.disabled = false;
            }, 1200);
        });
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthModals);
} else {
    initAuthModals();
}

