/* ============================================
   RIOCITY - Main JavaScript
   Premium Casino & Sports Betting Platform
   ============================================ */

const THEME_STORAGE_KEY = 'riocity_theme';
const DEFAULT_THEME = 'dark';
const AUTH_STORAGE_KEY = 'riocity_auth_state';
const LEGACY_LOGIN_KEY = 'isLoggedIn';
const LEGACY_USER_KEY = 'username';

const PROTECTED_PATHS = new Set([
    'account-details.html',
    'exchange.html',
    'rebate.html',
    'games.html',
    'slot-play.html',
    'live-casino-play.html',
    'poker-play.html',
    'fish-hunt-play.html',
    'sports-provider.html'
]);

function safeParseJSON(value, fallback) {
    try {
        return value ? JSON.parse(value) : fallback;
    } catch (error) {
        return fallback;
    }
}

function getCurrentPagePath() {
    const raw = window.location.pathname.split('/').pop();
    return raw || 'index.html';
}

function getAuthState() {
    const stored = safeParseJSON(localStorage.getItem(AUTH_STORAGE_KEY), null);
    if (stored && typeof stored === 'object') {
        return {
            isAuthenticated: Boolean(stored.isAuthenticated),
            user: stored.user || null,
            wallet: stored.wallet || { balance: 0 }
        };
    }

    // Compatibility with legacy fake auth keys used by auth-modals.js and old pages.
    const legacyLoggedIn = localStorage.getItem(LEGACY_LOGIN_KEY) === 'true';
    const legacyUsername = localStorage.getItem(LEGACY_USER_KEY) || '';
    if (legacyLoggedIn) {
        return {
            isAuthenticated: true,
            user: {
                id: 'mock-user',
                username: legacyUsername || 'player',
                displayName: legacyUsername || 'Player'
            },
            wallet: { balance: 0 }
        };
    }

    return {
        isAuthenticated: false,
        user: null,
        wallet: { balance: 0 }
    };
}

function persistAuthState(state) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(LEGACY_LOGIN_KEY, state.isAuthenticated ? 'true' : 'false');
    if (state.isAuthenticated && state.user) {
        localStorage.setItem(LEGACY_USER_KEY, state.user.displayName || state.user.username || 'Player');
    } else {
        localStorage.removeItem(LEGACY_USER_KEY);
    }
}

function setAuthState(payload) {
    const nextState = {
        isAuthenticated: true,
        user: {
            id: payload?.user?.id || 'mock-user',
            username: payload?.user?.username || payload?.user?.displayName || 'player',
            displayName: payload?.user?.displayName || payload?.user?.username || 'Player'
        },
        wallet: {
            balance: Number(payload?.wallet?.balance ?? 0)
        }
    };
    persistAuthState(nextState);
    document.dispatchEvent(new CustomEvent('authStateChanged', { detail: nextState }));
    return nextState;
}

function clearAuthState() {
    const nextState = { isAuthenticated: false, user: null, wallet: { balance: 0 } };
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(LEGACY_LOGIN_KEY);
    localStorage.removeItem(LEGACY_USER_KEY);
    document.dispatchEvent(new CustomEvent('authStateChanged', { detail: nextState }));
    return nextState;
}

function isAuthenticated() {
    return getAuthState().isAuthenticated;
}

function getPostLoginTarget() {
    const params = new URLSearchParams(window.location.search);
    const returnTo = params.get('returnTo');
    if (!returnTo) return null;
    // Prevent open redirect. Keep local relative targets only.
    if (returnTo.startsWith('http://') || returnTo.startsWith('https://') || returnTo.startsWith('//')) {
        return null;
    }
    return returnTo;
}

function redirectToLogin(returnToPath) {
    const target = returnToPath || (window.location.pathname.split('/').pop() || 'index.html');
    window.location.href = `login.html?returnTo=${encodeURIComponent(target)}`;
}

function requireAuth(returnToPath) {
    if (isAuthenticated()) return true;
    if (typeof window.openRioAuthModal === 'function') {
        window.openRioAuthModal('login', returnToPath);
        return false;
    }
    redirectToLogin(returnToPath);
    return false;
}

function initProtectedRouteGuard() {
    const page = getCurrentPagePath().toLowerCase();
    if (!PROTECTED_PATHS.has(page)) return;
    requireAuth(page);
}

function initProtectedActionGuards() {
    document.addEventListener('click', (event) => {
        const trigger = event.target.closest('[data-auth-required], a[href]');
        if (!trigger) return;

        // Explicit guard
        if (trigger.matches('[data-auth-required]') && !isAuthenticated()) {
            event.preventDefault();
            requireAuth();
            return;
        }

        // Implicit guard for protected pages
        if (trigger.tagName === 'A') {
            const href = trigger.getAttribute('href') || '';
            if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
            const linkPage = href.split('?')[0].split('/').pop().toLowerCase();
            if (PROTECTED_PATHS.has(linkPage) && !isAuthenticated()) {
                event.preventDefault();
                requireAuth(linkPage);
            }
        }
    });
}

function initAuthSystem() {
    initProtectedRouteGuard();
    initProtectedActionGuards();
}

window.RioAuth = {
    getAuthState,
    setAuthState,
    clearAuthState,
    isAuthenticated,
    requireAuth,
    getPostLoginTarget
};

function getStoredTheme() {
    try {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === 'dark' || savedTheme === 'light') {
            return savedTheme;
        }
    } catch (error) {
        // Ignore storage access issues and use fallback theme.
    }

    return null;
}

function getPreferredTheme() {
    const savedTheme = getStoredTheme();
    if (savedTheme) {
        return savedTheme;
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
    }

    return DEFAULT_THEME;
}

function syncThemeToggleState(theme) {
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
        const icon = button.querySelector('i');
        const label = button.querySelector('[data-theme-toggle-label]');
        const isLight = theme === 'light';
        button.setAttribute('aria-pressed', isLight ? 'true' : 'false');
        button.title = isLight ? 'Switch to dark mode' : 'Switch to light mode';

        if (icon) {
            icon.className = isLight ? 'fas fa-moon' : 'fas fa-sun';
        }

        if (label) {
            label.textContent = isLight ? 'Dark Mode' : 'Light Mode';
        }
    });
}

function applyTheme(theme, persist = false) {
    const normalizedTheme = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', normalizedTheme);
    document.documentElement.style.colorScheme = normalizedTheme;
    syncThemeToggleState(normalizedTheme);

    if (persist) {
        try {
            localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme);
        } catch (error) {
            // Ignore storage access issues.
        }
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || DEFAULT_THEME;
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme, true);
}

function createThemeToggleButton(isMobile) {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('data-theme-toggle', 'true');
    button.setAttribute('aria-label', 'Toggle theme');

    if (isMobile) {
        button.className = 'mobile-nav-link mobile-theme-toggle';
        button.innerHTML = '<i class="fas fa-sun"></i><span data-theme-toggle-label>Light Mode</span>';
    } else {
        button.className = 'theme-toggle-btn theme-toggle-btn-icon desktop-only';
        button.innerHTML = '<i class="fas fa-sun"></i>';
    }

    return button;
}

function mountThemeToggleControls() {
    const headerRight = document.querySelector('.header-right');
    if (headerRight && !headerRight.querySelector('.theme-toggle-btn')) {
        const desktopToggle = createThemeToggleButton(false);
        const languageSelector = headerRight.querySelector('.language-selector');
        if (languageSelector) {
            headerRight.insertBefore(desktopToggle, languageSelector);
        } else {
            headerRight.appendChild(desktopToggle);
        }
    }

    const mobileNav = document.querySelector('.mobile-nav');
    if (mobileNav && !mobileNav.querySelector('.mobile-theme-toggle')) {
        const mobileToggle = createThemeToggleButton(true);
        const userSection = mobileNav.querySelector('#mobileUserSection');
        if (userSection && userSection.nextSibling) {
            mobileNav.insertBefore(mobileToggle, userSection.nextSibling);
        } else {
            mobileNav.insertBefore(mobileToggle, mobileNav.firstChild);
        }
    }
}

function initThemeToggle() {
    mountThemeToggleControls();
    syncThemeToggleState(document.documentElement.getAttribute('data-theme') || DEFAULT_THEME);

    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
        button.addEventListener('click', toggleTheme);
    });
}

applyTheme(getPreferredTheme(), false);

// Loading screen management
let loadingScreen = document.getElementById('loadingScreen');
let loadingProgress = 0;

function updateLoadingProgress(progress) {
    loadingProgress = Math.min(progress, 100);
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        progressFill.style.width = `${loadingProgress}%`;
    }
}

function hideLoadingScreen() {
    if (loadingScreen) {
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

// Simulate loading progress
function simulateLoading() {
    const steps = [
        { progress: 20, delay: 200 },
        { progress: 40, delay: 400 },
        { progress: 60, delay: 600 },
        { progress: 80, delay: 800 },
        { progress: 100, delay: 1000 }
    ];

    steps.forEach(step => {
        setTimeout(() => {
            updateLoadingProgress(step.progress);
        }, step.delay);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Home-only: avoids console noise and work on account-details, etc.
    try {
        if (document.getElementById('homeProviderSearch') || document.getElementById('homeProviderDropdown')) {
            initHomePageGameFilters();
        }
    } catch (e) {
        console.error('Failed to initialize Home Page Filters:', e);
    }

    simulateLoading();
    initAuthSystem();

    // Initialize all modules
    initScrollReveal();
    initSmoothScroll();
    initHeaderScroll();
    initCarousel();
    initGameCards();
    initSportsCards();
    initMobileMenu();
    initDropdowns();
    initCounters();
    initLazyLoading();
    initTransactionTabs();
    initBrandTabs();
    initGameSectionCarousels();
    initMagneticEffects();
    initSearchBar();
    initDashboard();
    initGameFilters();
    initSharedGameCards();
    initFloatingSidebar();
    initLiveChat();
    initWalletDropdown();
    initThemeToggle();
});

// Hide loading screen when everything is loaded
window.addEventListener('load', () => {
    updateLoadingProgress(100);
    setTimeout(hideLoadingScreen, 500);
});

// Fallback: hide loading screen after 2.5s in case load event doesn't fire (e.g. file:// protocol)
setTimeout(() => {
    if (loadingScreen && loadingScreen.style.display !== 'none') {
        hideLoadingScreen();
    }
}, 2500);

/* ============================================
   REFERRAL CODE COPY
   ============================================ */
function copyReferralCode() {
    const input = document.querySelector('.input-with-copy input');
    if (input) {
        navigator.clipboard.writeText(input.value).then(() => {
            showToast('Referral code copied!', 'success');
        }).catch(() => {
            // Fallback for older browsers
            input.select();
            document.execCommand('copy');
            showToast('Referral code copied!', 'success');
        });
    }
}

// Make it globally available
window.copyReferralCode = copyReferralCode;

/* ============================================
   TRANSACTION TABS
   ============================================ */
function initTransactionTabs() {
    const filterBtns = document.querySelectorAll('.tx-tab');
    const container = document.querySelector('.tx-pills-container');

    if (!filterBtns.length || !container) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterType = btn.getAttribute('data-filter') || 'all';
            const items = container.querySelectorAll('.tx-pill');

            items.forEach(item => {
                const itemType = item.getAttribute('data-type');
                if (filterType === 'all' || itemType === filterType) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Start rotation simulation
    startLiveTransactionSimulation();

    // Legacy Support
    const legacyTabs = document.querySelectorAll('.transactions-tabs .tab-btn');
    if (legacyTabs.length) {
        legacyTabs.forEach(btn => {
            btn.addEventListener('click', () => {
                legacyTabs.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                updateTransactions(btn.dataset.tab);
            });
        });
    }
}

function updateTransactions(type) {
    const grid = document.querySelector('.transactions-grid');
    if (!grid) return;

    // Sample data for each type
    const data = {
        deposits: [
            { user: 'J***n', time: 'Just now', amount: '+MYR 5,000', class: 'deposit', badge: 'Deposit' },
            { user: 'S***a', time: '2 mins ago', amount: '+MYR 1,200', class: 'deposit', badge: 'Deposit' },
            { user: 'M***k', time: '3 mins ago', amount: '+MYR 8,500', class: 'deposit', badge: 'Deposit' },
            { user: 'A***i', time: '5 mins ago', amount: '+MYR 2,300', class: 'deposit', badge: 'Deposit' },
            { user: 'L***e', time: '6 mins ago', amount: '+MYR 15,000', class: 'deposit', badge: 'Deposit' }
        ],
        withdrawals: [
            { user: 'K***o', time: '8 mins ago', amount: '-MYR 5,400', class: 'withdraw', badge: 'Withdraw' },
            { user: 'R***y', time: '12 mins ago', amount: '-MYR 2,100', class: 'withdraw', badge: 'Withdraw' },
            { user: 'B***o', time: '15 mins ago', amount: '-MYR 1,000', class: 'withdraw', badge: 'Withdraw' },
            { user: 'H***i', time: '20 mins ago', amount: '-MYR 3,500', class: 'withdraw', badge: 'Withdraw' },
            { user: 'P***a', time: '25 mins ago', amount: '-MYR 700', class: 'withdraw', badge: 'Withdraw' }
        ]
    };

    const items = data[type] || data.deposits;

    grid.innerHTML = items.map(item => `
        <div class="transaction-item">
            <div class="tx-user">
                <span class="tx-type-badge ${item.class}">${item.badge}</span>
                <div class="tx-avatar">${item.user}</div>
                <span class="tx-time">${item.time}</span>
            </div>
            <div class="tx-amount ${item.class}">${item.amount}</div>
        </div>
    `).join('');
}

function startLiveTransactionSimulation() {
    const container = document.querySelector('.tx-pills-container');
    if (!container) return;

    // Helper to generate a random transaction
    const generateTx = () => {
        const types = ['deposit', 'withdraw'];
        const type = types[Math.floor(Math.random() * types.length)];
        const users = ['Alice', 'Bob', 'Charlie', 'Player777', 'GamblerX', 'ProSpins', 'LuckyJack', 'KingOfSlots'];
        const user = users[Math.floor(Math.random() * users.length)];
        const amounts = [500, 1200, 5000, 10000, 350, 2100, 8000, 15000];
        const amount = amounts[Math.floor(Math.random() * amounts.length)];
        const avatarId = Math.floor(Math.random() * 70);

        const pill = document.createElement('div');
        pill.className = 'tx-pill';
        pill.setAttribute('data-type', type);

        pill.innerHTML = `
            <div class="tx-avatar-wrapper">
                <img src="https://i.pravatar.cc/150?u=${avatarId}" class="tx-avatar" alt="User">
                <div class="tx-status-indicator"></div>
            </div>
            <div class="tx-info">
                <span class="tx-user">${user.substring(0, 1)}***${user.substring(user.length - 1)}</span>
                <span class="tx-type">${type === 'deposit' ? 'Deposit' : 'Withdrawal'}</span>
            </div>
            <div class="tx-amount-section">
                <span class="tx-amount">${type === 'deposit' ? '+' : '-'}MYR ${amount.toLocaleString()}</span>
                <span class="tx-time">Just Now</span>
            </div>
        `;
        return pill;
    };

    // Initial fill if container is empty (or few items)
    if (container.children.length < 5) {
        for (let i = 0; i < 8; i++) {
            container.appendChild(generateTx());
        }
    }

    setInterval(() => {
        const items = Array.from(container.querySelectorAll('.tx-pill'));
        if (items.length < 2) return;

        // Add a NEW random transaction
        const newTx = generateTx();
        newTx.style.opacity = '0';
        newTx.style.transform = 'translateY(10px)';
        newTx.style.marginLeft = '-232px'; // Start hidden from left

        container.prepend(newTx);

        // Slide animation
        setTimeout(() => {
            newTx.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            newTx.style.opacity = '1';
            newTx.style.transform = 'translateY(0)';
            newTx.style.marginLeft = '0';
        }, 50);

        // Remove old items if too many
        if (items.length > 20) {
            items[items.length - 1].remove();
        }
    }, 6000);
}

/* ============================================
   BRAND TABS
   ============================================ */
function initBrandTabs() {
    const brandTabs = document.querySelectorAll('.brand-tab');

    brandTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            brandTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Could load different games based on brand
            // For now just visual feedback
        });
    });
}

/* ============================================
   GAME SECTIONS - CAROUSEL
   ============================================ */
function initGameSectionCarousels() {
    const sections = document.querySelectorAll('.games-section');

    sections.forEach(section => {
        const track = section.querySelector('.game-carousel-track');
        const prevBtn = section.querySelector('.nav-arrow-unified.carousel-prev');
        const nextBtn = section.querySelector('.nav-arrow-unified.carousel-next');

        if (!track || !prevBtn || !nextBtn) {
            return;
        }

        const getScrollAmount = () => Math.max(track.clientWidth * 0.85, 220);

        const updateButtons = () => {
            const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth - 1);
            prevBtn.disabled = maxScroll === 0 || track.scrollLeft <= 0;
            nextBtn.disabled = maxScroll === 0 || track.scrollLeft >= maxScroll;
        };

        prevBtn.addEventListener('click', () => {
            track.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            track.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
        });

        track.addEventListener('scroll', updateButtons, { passive: true });
        window.addEventListener('resize', updateButtons);
        window.addEventListener('load', updateButtons);
        updateButtons();
        setTimeout(updateButtons, 200);
    });
}

/* ============================================
   SCROLL REVEAL ANIMATION
   ============================================ */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right, .scale-in, .reveal, .reveal-left, .reveal-right, .reveal-scale');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // Add staggered animations to sections
    document.querySelectorAll('.games-section, .sports-section, .testimonials-section, .providers-section').forEach((section, index) => {
        if (!section.classList.contains('fade-in-up') && !section.classList.contains('fade-in-left') && !section.classList.contains('fade-in-right')) {
            section.classList.add('fade-in-up');
            section.style.transitionDelay = `${index * 0.1}s`;
        }
        revealObserver.observe(section);
    });
}

/* ============================================
   SMOOTH SCROLL
   ============================================ */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const mainHeader = document.querySelector('.main-header');
                const headerHeight = mainHeader ? mainHeader.offsetHeight : 0;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ============================================
   HEADER SCROLL EFFECT (OPTIMIZED)
   ============================================ */
function initHeaderScroll() {
    const header = document.querySelector('.main-header');
    if (!header) return;

    let lastScroll = 0;
    let ticking = false;

    const updateHeader = () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Hide/show on scroll direction
        if (currentScroll > lastScroll && currentScroll > 500) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }

        lastScroll = currentScroll;
        ticking = false;
    };

    const requestTick = () => {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    };

    window.addEventListener('scroll', requestTick, { passive: true });

    // Add scrolled styles
    const style = document.createElement('style');
    style.textContent = `
        .main-header {
            transition: transform 0.3s ease, background 0.3s ease;
            will-change: transform;
        }
        .main-header.scrolled {
            background: rgba(10, 14, 26, 0.98);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
    `;
    document.head.appendChild(style);
}

/* ============================================
   CAROUSEL / SLIDER
   ============================================ */
function initCarousel() {
    // Hero Carousel
    const heroSlideItems = document.querySelectorAll('.hero-slide');
    const heroPrev = document.querySelector('.hero-prev');
    const heroNext = document.querySelector('.hero-next');
    const indicators = document.querySelectorAll('.indicator');
    const progressFill = document.querySelector('.progress-fill');

    if (heroSlideItems.length === 0) return;

    let currentSlide = 0; // Start with first slide (Christmas Special)
    let isTransitioning = false;
    const totalSlides = heroSlideItems.length;
    let autoSlideInterval;
    let progressInterval;
    const autoSlideDelay = 5000; // 5 seconds per slide for better responsiveness

    function updateSlidePositions() {
        requestAnimationFrame(() => {
            heroSlideItems.forEach((slide, index) => {
                // Remove all position classes
                slide.classList.remove('active', 'slide-left', 'slide-right', 'slide-far-left', 'slide-far-right');

                // Calculate position relative to current slide
                let position = index - currentSlide;

                // Normalize position for circular carousel (3 slides)
                if (position > 1) position = position - totalSlides;
                if (position < -1) position = position + totalSlides;

                // Apply position classes for CSS to handle
                if (position === 0) {
                    // Active slide - center
                    slide.classList.add('active');
                } else if (position === -1) {
                    // Left slide (previous)
                    slide.classList.add('slide-left');
                } else if (position === 1) {
                    // Right slide (next)
                    slide.classList.add('slide-right');
                } else if (position === -2) {
                    // Far left (2 positions left)
                    slide.classList.add('slide-far-left');
                } else if (position === 2) {
                    // Far right (2 positions right)
                    slide.classList.add('slide-far-right');
                }

                // Remove inline styles to let CSS handle positioning
                slide.style.transform = '';
                slide.style.opacity = '';
                slide.style.zIndex = '';
            });

            // Update indicators with minimal DOM manipulation
            indicators.forEach((indicator, index) => {
                if (index === currentSlide) {
                    indicator.classList.add('active');
                } else {
                    indicator.classList.remove('active');
                }
            });
        });
    }

    function goToSlide(index) {
        if (isTransitioning) return;

        isTransitioning = true;
        currentSlide = (index + totalSlides) % totalSlides;

        updateSlidePositions();

        // Reset transition flag after animation completes
        setTimeout(() => {
            isTransitioning = false;
        }, 650); // Slightly longer than CSS transition
    }

    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    function prevSlide() {
        goToSlide(currentSlide - 1);
    }

    // Initialize positions
    updateSlidePositions();

    // Navigation arrows
    if (heroNext) {
        heroNext.addEventListener('click', () => {
            nextSlide();
            resetAutoSlide();
        });
    }

    if (heroPrev) {
        heroPrev.addEventListener('click', () => {
            prevSlide();
            resetAutoSlide();
        });
    }

    // Click on side slides to navigate
    heroSlideItems.forEach((slide, index) => {
        slide.addEventListener('click', () => {
            if (!slide.classList.contains('active')) {
                goToSlide(index);
                resetAutoSlide();
            }
        });
    });

    // Click on indicators to navigate
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            goToSlide(index);
            resetAutoSlide();
        });
    });

    // Progress bar and auto-advance
    function startProgressBar() {
        if (progressFill) {
            progressFill.style.width = '0%';
            let progress = 0;
            const progressStep = 100 / (autoSlideDelay / 50); // Update every 50ms for smoother animation

            progressInterval = setInterval(() => {
                progress += progressStep;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(progressInterval);
                }
                progressFill.style.width = progress + '%';
            }, 50);
        }
    }

    function resetProgressBar() {
        clearInterval(progressInterval);
        if (progressFill) {
            progressFill.style.width = '0%';
        }
    }

    // Auto-advance carousel
    function startAutoSlide() {
        startProgressBar();
        autoSlideInterval = setInterval(() => {
            nextSlide();
            resetProgressBar();
            startProgressBar();
        }, autoSlideDelay);
    }

    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        resetProgressBar();
        startAutoSlide();
    }

    // Pause on hover
    const heroCarousel = document.querySelector('.hero-carousel');
    if (heroCarousel) {
        heroCarousel.addEventListener('mouseenter', () => {
            clearInterval(autoSlideInterval);
            clearInterval(progressInterval);
        });

        heroCarousel.addEventListener('mouseleave', () => {
            startAutoSlide();
        });
    }

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    const heroCarouselElement = document.querySelector('.hero-carousel');
    if (heroCarouselElement) {
        heroCarouselElement.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        heroCarouselElement.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next slide
                nextSlide();
            } else {
                // Swipe right - previous slide
                prevSlide();
            }
            resetAutoSlide();
        }
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevSlide();
            resetAutoSlide();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
            resetAutoSlide();
        }
    });

    // Start auto-slide
    if (totalSlides > 1) {
        startAutoSlide();
    }

    // Video Banner Carousel
    const bannerDots = document.querySelectorAll('.banner-dots .dot');
    const bannerPrev = document.querySelector('.banner-nav .prev');
    const bannerNext = document.querySelector('.banner-nav .next');
    const videoSlides = document.querySelectorAll('.video-slide');
    let bannerSlide = 0;

    function updateBannerSlides() {
        // Update video slides
        videoSlides.forEach((slide, i) => {
            if (i === bannerSlide) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
                slide.classList.remove('playing');
            }
        });

        // Update dots
        bannerDots.forEach((dot, i) => {
            dot.classList.toggle('active', i === bannerSlide);
        });
    }

    // Play video on click
    videoSlides.forEach((slide) => {
        const playButton = slide.querySelector('.play-button');
        const videoThumb = slide.querySelector('.video-thumb');
        const embedWrapper = slide.querySelector('.video-embed-wrapper');
        const iframe = slide.querySelector('.youtube-embed');
        const youtubeId = slide.dataset.youtubeId;

        function playVideo(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }

            if (!slide.classList.contains('playing')) {
                slide.classList.add('playing');
                if (iframe && youtubeId && embedWrapper) {
                    // Set iframe source with autoplay
                    iframe.src = `https://www.youtube.com/embed/${youtubeId}?si=9d1lrl4rd8gATSPu&autoplay=1`;
                    embedWrapper.style.display = 'block';
                }
            }
        }

        if (playButton) {
            playButton.addEventListener('click', playVideo);
        }

        if (videoThumb) {
            videoThumb.addEventListener('click', (e) => {
                // Only trigger if clicking on the thumbnail, not the play button
                if (e.target === videoThumb || e.target.classList.contains('video-thumbnail')) {
                    playVideo(e);
                }
            });
        }
    });

    bannerDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            bannerSlide = index;
            updateBannerSlides();
        });
    });

    if (bannerPrev) {
        bannerPrev.addEventListener('click', () => {
            bannerSlide = (bannerSlide - 1 + bannerDots.length) % bannerDots.length;
            updateBannerSlides();
        });
    }

    if (bannerNext) {
        bannerNext.addEventListener('click', () => {
            bannerSlide = (bannerSlide + 1) % bannerDots.length;
            updateBannerSlides();
        });
    }

    // Initialize
    updateBannerSlides();

    // Game section navigation
    document.querySelectorAll('.section-controls .nav-arrows').forEach(navArrows => {
        const section = navArrows.closest('.games-section');
        const grid = section.querySelector('.games-grid');
        const prevBtn = navArrows.querySelector('.nav-arrow:first-child');
        const nextBtn = navArrows.querySelector('.nav-arrow:last-child');

        if (prevBtn && nextBtn && grid) {
            const cardWidth = 320;

            prevBtn.addEventListener('click', () => {
                grid.scrollBy({ left: -cardWidth, behavior: 'smooth' });
            });

            nextBtn.addEventListener('click', () => {
                grid.scrollBy({ left: cardWidth, behavior: 'smooth' });
            });
        }
    });
}

/* ============================================
   HOME PAGE GAME FILTERS (Category + Provider)
   ============================================ */
function initHomePageGameFilters() {
    const filterSection = document.querySelector('.provider-filters');
    if (!filterSection) return;

    const filterBtns = filterSection.querySelectorAll('.filter-btn');
    const gameItems = document.querySelectorAll('#homeGamesGrid .game-item');
    const panelTitle = document.getElementById('homeHotProviderTitle');
    const providerChips = Array.from(document.querySelectorAll('#homeProviderQuickFilters .hot-provider-chip'));

    const dropdown = document.getElementById('homeProviderDropdown');
    const dropdownTrigger = dropdown ? dropdown.querySelector('.dropdown-trigger') : null;
    const dropdownItems = dropdown ? Array.from(dropdown.querySelectorAll('.dropdown-item')) : [];
    const providerNameSpan = document.getElementById('currentProviderName');

    // Search input is now inside the dropdown menu (replaces the old "All Providers" option row)
    const searchInput = document.getElementById('homeProviderSearch');
    const searchClear = document.getElementById('homeProviderSearchClear');

    if (!filterBtns.length || !gameItems.length) return;
    const hasDropdown = Boolean(dropdown && dropdownTrigger && dropdownItems.length);

    const initialActiveBtn = Array.from(filterBtns).find(btn => btn.classList.contains('active'));
    let currentCategory = (initialActiveBtn?.dataset.filter || 'all').toLowerCase();
    let providerQuery = '';
    let currentProvider = 'all';

    const categoryLabels = {
        all: 'All',
        slots: 'Slots',
        casino: 'Casino',
        live: 'Live Casino',
        table: 'Table',
        sports: 'Sports',
        esports: 'E-Sports',
        poker: 'Poker',
        fishing: 'Fishing',
        lottery: 'Lottery',
        jackpot: 'Jackpot'
    };

    function getProviderTextForItem(item) {
        return (
            item.querySelector('.provider-label')?.textContent ||
            item.querySelector('.hot-provider-name')?.textContent ||
            item.querySelector('.provider-name')?.textContent ||
            item.dataset.provider ||
            ''
        ).toLowerCase().trim();
    }

    function updateFilteredGames() {
        const activeCategoryBtn = filterSection.querySelector('.filter-btn.active');
        if (activeCategoryBtn) {
            currentCategory = (activeCategoryBtn.dataset.filter || currentCategory || 'all').toLowerCase();
        }

        let visibleCount = 0;

        gameItems.forEach((item) => {
            const category = (item.dataset.category || '').toLowerCase();
            const provider = (item.dataset.provider || '').toLowerCase();

            const categoryMatch = (currentCategory === 'all' || category === currentCategory);
            const providerMatch =
                providerQuery
                    ? getProviderTextForItem(item).includes(providerQuery)
                    : (currentProvider === 'all' || provider === currentProvider);

            if (categoryMatch && providerMatch) {
                item.classList.remove('hidden');
                item.style.display = '';
                item.style.animation = 'none';
                item.offsetHeight; // force reflow
                item.style.animation = `fadeInUp 0.4s ease forwards ${visibleCount * 0.05}s`;
                visibleCount++;
            } else {
                item.classList.add('hidden');
                item.style.display = 'none';
            }
        });
    }

    function syncProviderChipState() {
        if (!providerChips.length) return;
        providerChips.forEach(chip => {
            const value = (chip.dataset.providerValue || 'all').toLowerCase();
            chip.classList.toggle('active', value === currentProvider);
        });
    }

    // Category Buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = (btn.dataset.filter || 'all').toLowerCase();
            if (panelTitle) {
                panelTitle.textContent = categoryLabels[currentCategory] || 'Providers';
            }
            updateFilteredGames();
        });
    });

    if (providerChips.length) {
        providerChips.forEach(chip => {
            chip.addEventListener('click', () => {
                currentProvider = (chip.dataset.providerValue || 'all').toLowerCase();
                providerQuery = '';

                if (searchInput) searchInput.value = '';
                if (searchClear) searchClear.style.visibility = 'hidden';
                if (providerNameSpan) {
                    providerNameSpan.textContent = currentProvider === 'all'
                        ? 'All Providers'
                        : (chip.textContent?.trim() || 'All Providers');
                }

                if (dropdownItems.length) {
                    dropdownItems.forEach(i => {
                        const itemValue = (i.dataset.value || 'all').toLowerCase();
                        i.classList.toggle('active', itemValue === currentProvider);
                    });
                }

                syncProviderChipState();
                updateFilteredGames();
            });
        });
    }

    // Provider search input (preferred)
    if (hasDropdown && searchInput) {
        const syncClearBtn = () => {
            if (!searchClear) return;
            searchClear.style.visibility = searchInput.value ? 'visible' : 'hidden';
        };

        syncClearBtn();

        searchInput.addEventListener('input', () => {
            providerQuery = (searchInput.value || '').toLowerCase().trim();
            syncClearBtn();
            // When searching, force "All Providers" mode (no specific provider selected)
            currentProvider = 'all';
            if (providerNameSpan) providerNameSpan.textContent = 'All Providers';
            dropdownItems.forEach(i => i.classList.remove('active'));
            syncProviderChipState();
            updateFilteredGames();
        });

        if (searchClear) {
            searchClear.addEventListener('click', () => {
                searchInput.value = '';
                providerQuery = '';
                syncClearBtn();
                currentProvider = 'all';
                dropdownItems.forEach(i => i.classList.remove('active'));
                if (providerNameSpan) providerNameSpan.textContent = 'All Providers';
                syncProviderChipState();
                updateFilteredGames();
                searchInput.focus();
            });
        }
    }

    // Dropdown open/close
    if (hasDropdown) {
        dropdownTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isActive = dropdown.classList.contains('active');

            document.querySelectorAll('.provider-dropdown.active').forEach(d => {
                if (d !== dropdown) d.classList.remove('active');
            });

            dropdown.classList.toggle('active', !isActive);
            if (!isActive) {
                setTimeout(() => searchInput?.focus(), 0);
            }
        });
    }

    // Clicking provider options
    if (hasDropdown) {
        dropdownItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();

                const nextValue = (item.dataset.value || 'all').toLowerCase();
                dropdownItems.forEach(i => i.classList.toggle('active', i === item));
                currentProvider = nextValue;

                // Selecting a provider clears the text-search (so behavior is unambiguous)
                providerQuery = '';
                if (searchInput) searchInput.value = '';
                if (searchClear) searchClear.style.visibility = 'hidden';

                if (providerNameSpan) {
                    providerNameSpan.textContent = item.textContent?.trim() || 'All Providers';
                }

                syncProviderChipState();
                dropdown.classList.remove('active');
                updateFilteredGames();
            });
        });
    }

    // Filter provider options list based on search query (inside dropdown)
    if (hasDropdown && searchInput) {
        searchInput.addEventListener('input', () => {
            const q = (searchInput.value || '').toLowerCase().trim();
            dropdownItems.forEach(i => {
                const label = (i.textContent || '').toLowerCase();
                i.style.display = !q || label.includes(q) ? '' : 'none';
            });
        });
    }

    // Click outside to close
    if (hasDropdown) {
        document.addEventListener('click', (e) => {
            if (dropdown.classList.contains('active') && !dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    }

    if (panelTitle) {
        panelTitle.textContent = categoryLabels[currentCategory] || 'Providers';
    }

    syncProviderChipState();
    updateFilteredGames();

    // Re-apply after downstream normalizers mutate card classes/markup.
    setTimeout(updateFilteredGames, 0);
    setTimeout(updateFilteredGames, 160);

    document.addEventListener('homeGamesGridNormalized', updateFilteredGames);
}

function id(name) { return document.getElementById(name); }

/* ============================================
   GAME CARDS INTERACTION (Generic)
   ============================================ */
function initGameCards() {
    const gameCards = document.querySelectorAll('.game-card');

    gameCards.forEach(card => {
        // Tilt effect on hover
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });

        // Play button click - navigate to game play page
        const playBtn = card.querySelector('.play-btn');
        if (playBtn) {
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const gameName = card.querySelector('.game-info h4')?.textContent || 'Game';
                // Navigate to slot play page (homepage features slot games)
                window.location.href = 'slot-play.html?game=' + encodeURIComponent(gameName);
            });
        }

        // Card click - navigate to game play page
        card.addEventListener('click', (e) => {
            // Don't interfere if clicking a link inside the card
            if (e.target.closest('a') || e.target.closest('.play-btn')) return;
            const gameName = card.querySelector('.game-info h4')?.textContent || 'Game';
            window.location.href = 'slot-play.html?game=' + encodeURIComponent(gameName);
        });
    });
}

/* ============================================
   SPORTS CARDS INTERACTION
   ============================================ */
function initSportsCards() {
    // Horizontal scrolling for sports cards
    const sportsCardsWrapper = document.querySelector('.sports-cards-wrapper');
    const sportsCardsScroll = document.querySelector('.sports-cards-scroll');
    const sportsPrev = document.querySelector('.sports-prev');
    const sportsNext = document.querySelector('.sports-next');

    if (sportsCardsWrapper && sportsCardsScroll) {
        const cardWidth = 340; // Match min-width from CSS
        const gap = 16; // Match gap from CSS
        const scrollAmount = cardWidth + gap;

        // Previous button
        if (sportsPrev) {
            sportsPrev.addEventListener('click', () => {
                sportsCardsWrapper.scrollBy({
                    left: -scrollAmount,
                    behavior: 'smooth'
                });
            });
        }

        // Next button
        if (sportsNext) {
            sportsNext.addEventListener('click', () => {
                sportsCardsWrapper.scrollBy({
                    left: scrollAmount,
                    behavior: 'smooth'
                });
            });
        }

        // Update arrow visibility based on scroll position
        const updateArrowVisibility = () => {
            const { scrollLeft, scrollWidth, clientWidth } = sportsCardsWrapper;

            if (sportsPrev) {
                sportsPrev.style.opacity = scrollLeft > 0 ? '1' : '0.5';
                sportsPrev.style.pointerEvents = scrollLeft > 0 ? 'auto' : 'none';
            }

            if (sportsNext) {
                sportsNext.style.opacity = scrollLeft < scrollWidth - clientWidth - 10 ? '1' : '0.5';
                sportsNext.style.pointerEvents = scrollLeft < scrollWidth - clientWidth - 10 ? 'auto' : 'none';
            }
        };

        // Initial check
        updateArrowVisibility();

        // Update on scroll
        sportsCardsWrapper.addEventListener('scroll', updateArrowVisibility);

        // Update on resize
        window.addEventListener('resize', updateArrowVisibility);
    }

    // Betting option clicks
    const bettingOptions = document.querySelectorAll('.betting-option');

    bettingOptions.forEach(option => {
        const oddsBtn = option.querySelector('.odds-btn');

        if (oddsBtn) {
            oddsBtn.addEventListener('click', (e) => {
                e.stopPropagation();

                // Remove selection from other options in the same card
                const card = option.closest('.sport-match-card');
                card.querySelectorAll('.betting-option').forEach(opt => {
                    opt.classList.remove('selected');
                });

                // Add selection to clicked option
                option.classList.add('selected');

                // Get selection info
                const teamName = option.querySelector('.team-name').textContent;
                const odds = oddsBtn.textContent;
                showToast(`Added ${teamName} (${odds}) to bet slip`, 'success');
            });
        }
    });

    // Add selected style
    const style = document.createElement('style');
    style.textContent = `
        .betting-option.selected {
            background: rgba(59, 130, 246, 0.15);
            border-color: rgba(59, 130, 246, 0.3);
        }
        .betting-option.selected .odds-btn {
            background: rgba(59, 130, 246, 0.8);
            border-color: rgba(59, 130, 246, 0.9);
            color: white;
        }
        .betting-option.selected .team-logo-placeholder {
            border-color: rgba(59, 130, 246, 0.4);
        }
    `;
    document.head.appendChild(style);
}

/* ============================================
   MOBILE MENU
   ============================================ */
// Helper function to lock/unlock body scroll
function lockBodyScroll() {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.classList.add('mobile-menu-open');
}

function unlockBodyScroll() {
    const scrollY = document.body.style.top;
    document.body.classList.remove('mobile-menu-open');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
}

function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    const loginBtn = document.querySelector('.btn-login');
    const signupBtn = document.querySelector('.btn-signup');

    if (!mobileMenuBtn || !mobileMenu) return;

    // Toggle mobile menu
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.add('active');
        lockBodyScroll();
    });

    // Close mobile menu
    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            unlockBodyScroll();
        });
    }

    // Close on link click
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            unlockBodyScroll();
        });
    });

    // Login button
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            unlockBodyScroll();
            showToast('Login functionality would open here', 'info');
        });
    }

    // Signup button
    if (signupBtn) {
        signupBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            unlockBodyScroll();
            showToast('Signup functionality would open here', 'success');
        });
    }

    // Close on outside click (but not on nav content)
    mobileMenu.addEventListener('click', (e) => {
        if (e.target === mobileMenu) {
            mobileMenu.classList.remove('active');
            unlockBodyScroll();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            unlockBodyScroll();
        }
    });
}

/* ============================================
   DROPDOWNS
   ============================================ */
function initLanguageSelector() {
    const languageSelector = document.querySelector('.language-selector');
    if (!languageSelector) return;

    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown-menu language-dropdown-menu';
    dropdown.innerHTML = `
        <div class="dropdown-item" data-lang="en"><span class="lang-code">EN</span> English</div>
        <div class="dropdown-item" data-lang="zh"><span class="lang-code">ZH</span> Chinese</div>
        <div class="dropdown-item" data-lang="ms"><span class="lang-code">MS</span> Bahasa</div>
        <div class="dropdown-item" data-lang="th"><span class="lang-code">TH</span> Thai</div>
    `;

    languageSelector.style.position = 'relative';
    languageSelector.appendChild(dropdown);
    languageSelector.dataset.langInit = 'true';

    languageSelector.addEventListener('click', (e) => {
        e.stopPropagation();
        languageSelector.classList.toggle('active');
    });

    dropdown.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const lang = item.dataset.lang;
            const span = languageSelector.querySelector('span');
            if (span && !span.classList.contains('logo-icon')) span.textContent = lang.toUpperCase();
            languageSelector.classList.remove('active');
        });
    });

    document.addEventListener('click', (e) => {
        if (!languageSelector.contains(e.target)) {
            languageSelector.classList.remove('active');
        }
    });
}

window.initLanguageSelector = initLanguageSelector;

function initDropdowns() {
    initLanguageSelector();

    // Navigation dropdown for "More Games"
    const moreGamesDropdown = document.getElementById('moreGamesDropdown');
    if (moreGamesDropdown) {
        const toggle = moreGamesDropdown.querySelector('.nav-dropdown-toggle');
        const menu = moreGamesDropdown.querySelector('.nav-dropdown-menu');
        if (toggle && menu) {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                moreGamesDropdown.classList.toggle('active');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!moreGamesDropdown.contains(e.target)) {
                    moreGamesDropdown.classList.remove('active');
                }
            });

            // Set active state for current page
            const currentPath = window.location.pathname;
            const currentPage = currentPath.split('/').pop() || 'index.html';
            menu.querySelectorAll('.nav-dropdown-item').forEach(item => {
                const href = item.getAttribute('href');
                if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                    item.classList.add('active');
                    // Also highlight the dropdown toggle if a sub-item is active
                    moreGamesDropdown.querySelector('.nav-dropdown-toggle').classList.add('active');
                }
            });
        }
    }

    // Account Dropdown
    const accountDropdown = document.getElementById('accountDropdown');
    if (accountDropdown) {
        const toggle = accountDropdown.querySelector('.account-toggle');
        const menu = accountDropdown.querySelector('.account-dropdown-menu');

        if (toggle && menu) {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                accountDropdown.classList.toggle('active');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!accountDropdown.contains(e.target)) {
                    accountDropdown.classList.remove('active');
                }
            });

            // Set active state for current page
            const currentPath = window.location.pathname;
            const currentHash = window.location.hash;
            menu.querySelectorAll('.account-nav-item').forEach(item => {
                const href = item.getAttribute('href');
                const itemPath = href.split('#')[0];
                const itemHash = href.split('#')[1] || '';

                // Check if current page matches
                if (currentPath.includes(itemPath) ||
                    (currentHash && itemHash && currentHash === '#' + itemHash)) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        }
    }
}

/* ============================================
   COUNTERS ANIMATION
   ============================================ */
function initCounters() {
    const counters = document.querySelectorAll('.counter');

    counters.forEach(counter => {
        const target = parseInt(counter.dataset.target) || parseInt(counter.textContent);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += step;
            if (current < target) {
                counter.textContent = Math.floor(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toLocaleString();
            }
        };

        // Start when visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        });

        observer.observe(counter);
    });
}

/* ============================================
   ENHANCED LAZY LOADING & PERFORMANCE
   ============================================ */
function initLazyLoading() {
    // Progressive image loading for better UX
    const progressiveImages = document.querySelectorAll('.progressive-image img');

    progressiveImages.forEach(img => {
        const wrapper = img.parentElement;

        // Create tiny placeholder
        const placeholder = document.createElement('div');
        placeholder.className = 'skeleton-shimmer';
        placeholder.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: inherit;
        `;
        wrapper.appendChild(placeholder);

        // Load image
        const newImg = new Image();
        newImg.onload = () => {
            img.classList.add('loaded');
            wrapper.classList.add('loaded');
            placeholder.remove();
        };
        newImg.src = img.src;
    });

    // Traditional lazy loading
    const lazyImages = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.dataset.src;

                if (src) {
                    img.src = src;
                    img.removeAttribute('data-src');

                    // Add loading class for better UX
                    img.classList.add('loading');
                    img.onload = () => {
                        img.classList.remove('loading');
                        img.classList.add('loaded');
                    };
                }

                imageObserver.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.01
    });

    lazyImages.forEach(img => imageObserver.observe(img));

    // Performance monitoring
    initPerformanceMonitoring();
}

/* ============================================
   PERFORMANCE MONITORING
   ============================================ */
function initPerformanceMonitoring() {
    // Monitor Core Web Vitals
    if ('web-vitals' in window) {
        import('https://unpkg.com/web-vitals@3.1.1/dist/web-vitals.es5.min.js').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
            getCLS(console.log);
            getFID(console.log);
            getFCP(console.log);
            getLCP(console.log);
            getTTFB(console.log);
        });
    }

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.duration > 50) { // Tasks longer than 50ms
                    console.warn('Long task detected:', entry);
                }
            }
        });
        observer.observe({ entryTypes: ['longtask'] });
    }

    // Resource loading performance
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page load performance:', {
                domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
                totalTime: perfData.loadEventEnd - perfData.fetchStart
            });
        }, 0);
    });
}

/* ============================================
   TOAST NOTIFICATIONS
   ============================================ */
function showToast(message, type = 'info') {
    // Create container if it doesn't exist
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: 'fa-check',
        error: 'fa-times',
        warning: 'fa-exclamation',
        info: 'fa-info'
    };

    toast.innerHTML = `
        <div class="toast-icon"><i class="fas ${icons[type]}"></i></div>
        <span class="toast-message">${message}</span>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;

    container.appendChild(toast);

    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    });

    // Auto remove
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => toast.remove(), 300);
        }
    }, 4000);
}

// Add slideOut animation
const toastStyle = document.createElement('style');
toastStyle.textContent = `
    @keyframes slideOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100%); }
    }
`;
document.head.appendChild(toastStyle);

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Format currency
function formatCurrency(amount, currency = 'MYR') {
    return new Intl.NumberFormat('en-MY', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/* ============================================
   MAGNETIC CURSOR EFFECTS
   ============================================ */
function initMagneticEffects() {
    const magneticElements = document.querySelectorAll('.magnetic');

    magneticElements.forEach(element => {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            const distance = Math.sqrt(x * x + y * y);
            const maxDistance = Math.max(rect.width, rect.height) / 2;

            if (distance < maxDistance) {
                const strength = (maxDistance - distance) / maxDistance;
                const moveX = x * strength * 0.3;
                const moveY = y * strength * 0.3;

                element.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
            }
        });

        element.addEventListener('mouseleave', () => {
            element.style.transform = 'translate(0, 0) scale(1)';
        });
    });
}

/* ============================================
   SEARCH BAR FUNCTIONALITY
   ============================================ */
function initSearchBar() {
    const searchBar = document.querySelector('.search-bar');
    const searchInput = document.querySelector('.search-input');
    const searchClose = document.querySelector('.search-close');

    if (!searchBar || !searchInput) return;

    // Show/hide close button
    searchInput.addEventListener('input', (e) => {
        const hasValue = e.target.value.length > 0;
        searchClose.style.display = hasValue ? 'block' : 'none';

        // Simple search functionality (you can expand this)
        if (hasValue) {
            performSearch(e.target.value);
        }
    });

    // Clear search
    searchClose.addEventListener('click', () => {
        searchInput.value = '';
        searchClose.style.display = 'none';
        searchInput.focus();
    });

    // Search on Enter
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            performSearch(searchInput.value);
        }
    });
}

function performSearch(query) {
    if (query.length < 2) return;

    // Simple search - highlight matching games (you can expand this)
    const gameCards = document.querySelectorAll('.game-card');
    const lowerQuery = query.toLowerCase();

    gameCards.forEach(card => {
        const gameName = card.querySelector('.game-info h4')?.textContent.toLowerCase() || '';
        const isMatch = gameName.includes(lowerQuery);

        card.style.opacity = isMatch || query === '' ? '1' : '0.3';
        card.style.transform = isMatch ? 'scale(1.02)' : 'scale(1)';
    });
}

/* ============================================
   DASHBOARD FUNCTIONALITY
   ============================================ */
function initDashboard() {
    const dashboard = document.querySelector('.quick-dashboard');
    const toggle = document.querySelector('.dashboard-toggle');

    if (!dashboard || !toggle) return;

    // Toggle dashboard
    toggle.addEventListener('click', () => {
        dashboard.classList.toggle('active');
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!dashboard.contains(e.target)) {
            dashboard.classList.remove('active');
        }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            dashboard.classList.remove('active');
        }
    });
}

/* ============================================
   GAME FILTERS FUNCTIONALITY
   ============================================ */
function initGameFilters() {
    // If we're on the home page with the combined filter, skip the generic one
    if (document.getElementById('homeGamesGrid')) return;

    const filterTabs = document.querySelectorAll('.filter-btn');
    const viewBtns = document.querySelectorAll('.view-btn');
    const providerSelect = document.querySelector('.provider-select');

    // Filter tabs
    filterTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            // Remove active class from all tabs
            filterTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');

            const filter = tab.getAttribute('data-filter') || 'all';
            filterGames(filter);
        });
    });

    // Provider select (Div-based dropdown)
    if (providerSelect) {
        providerSelect.addEventListener('click', () => {
            if (typeof showToast === 'function') {
                showToast('Provider selection coming soon!', 'info');
            }
        });
    }

    // View toggle
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const view = btn.dataset.view;
            toggleGameView(view);
        });
    });
}

function filterGames(filter) {
    // Support both .game-card (new) and .game-item (legacy)
    const gameCards = document.querySelectorAll('.game-card, .game-item, .rio-card');

    gameCards.forEach(card => {
        if (!filter || filter === 'all') {
            card.style.display = '';
            card.style.opacity = '1';
            return;
        }

        const cardCategory = card.dataset.category || '';
        // If categories aren't set in data-attributes, we might need a fallback check
        // For now, let's assume 'all' shows everything and other filters try to match
        if (cardCategory === filter) {
            card.style.display = '';
            card.style.opacity = '1';
        } else {
            card.style.display = 'none';
        }
    });
}

function toggleGameView(view) {
    const gamesGrid = document.querySelector('.games-grid');
    if (!gamesGrid) return;

    if (view === 'list') {
        gamesGrid.classList.add('list-view');
    } else {
        gamesGrid.classList.remove('list-view');
    }
}

function sortGames(sortBy) {
    const gamesGrid = document.querySelector('.games-grid');
    if (!gamesGrid) return;

    const gameCards = Array.from(document.querySelectorAll('.game-card'));

    gameCards.sort((a, b) => {
        switch (sortBy) {
            case 'rtp':
                // You'd need to add data-rtp attributes to cards
                return (b.dataset.rtp || 95) - (a.dataset.rtp || 95);
            case 'newest':
                // Sort by data-new attribute
                return new Date(b.dataset.new || '2024-01-01') - new Date(a.dataset.new || '2024-01-01');
            case 'alphabetical':
                const nameA = a.querySelector('.game-info h4')?.textContent || '';
                const nameB = b.querySelector('.game-info h4')?.textContent || '';
                return nameA.localeCompare(nameB);
            default:
                return 0;
        }
    });

    // Re-append sorted cards
    gameCards.forEach(card => gamesGrid.appendChild(card));
}

/* ============================================
   SHARED GAME CARD NORMALIZER
   ============================================ */
function initSharedGameCards() {
    normalizeLegacyGameGrids();
    normalizeContinueCards();
}

const RIO_BADGE_CYCLE = ['hot', 'new', 'jackpot'];
const RIO_MULTIPLIER_CYCLE = ['1000X', '500X', '400X', '2500X', '39000X', '51000X'];

function legacyThumbToRioHtml(card, idx) {
    const thumb = card.querySelector('.game-thumb');
    const thumbStyle = thumb?.getAttribute('style') || '';
    const imgMatch = thumbStyle.match(/url\((['"]?)(.*?)\1\)/i);
    const imageUrl = imgMatch?.[2] || '';

    const titleEl = card.querySelector('.game-details h4, .game-info h4');
    const title = titleEl?.textContent?.trim() || 'Game';
    const providerEl = card.querySelector('.provider-label, .provider-name');
    const provider = providerEl?.textContent?.trim() || 'Provider';
    const rtpRaw = card.querySelector('.rtp-badge')?.textContent?.replace(/^RTP\s*/i, '').trim() || '';
    const rtpText = rtpRaw || '96.00%';

    const badgeType = RIO_BADGE_CYCLE[idx % RIO_BADGE_CYCLE.length];
    const badgeLabel = badgeType === 'hot' ? 'HOT' : badgeType === 'new' ? 'NEW' : 'JACKPOT';
    const multiplier = RIO_MULTIPLIER_CYCLE[idx % RIO_MULTIPLIER_CYCLE.length];

    return {
        imageUrl,
        title,
        provider,
        rtpText,
        badgeType,
        badgeLabel,
        multiplier
    };
}

function rioCardMarkupFromLegacy(data) {
    const { imageUrl, title, provider, rtpText, badgeType, badgeLabel, multiplier } = data;
    return `
                <img src="${imageUrl}" alt="${title}" class="rio-card-bg" loading="lazy">
                <div class="rio-card-overlay"></div>
                <div class="rio-card-top">
                    <span class="rio-badge ${badgeType}">${badgeLabel}</span>
                    <span class="rio-multiplier"><i class="fa-solid fa-bolt"></i> ${multiplier}</span>
                </div>
                <div class="rio-play-btn-center">
                    <i class="fa-solid fa-play"></i>
                </div>
                <div class="rio-card-content">
                    <span class="rio-card-title">${title}</span>
                    <div class="rio-card-meta">
                        <span>${provider}</span>
                        <span class="rio-rtp-tag"><i class="fa-solid fa-arrow-up"></i> ${rtpText}</span>
                    </div>
                </div>
            `;
}

function normalizeLegacyGameGrids() {
    const grids = document.querySelectorAll('.game-cards-grid');
    if (!grids.length) return;

    grids.forEach(grid => {
        // Keep Hot Providers provider-card layout untouched.
        if (grid.id === 'homeGamesGrid' && grid.closest('.hot-providers-mobile-look')) {
            return;
        }

        grid.classList.add('rio-game-grid');
        const legacyCards = Array.from(grid.querySelectorAll('.game-item'));

        legacyCards.forEach((card, idx) => {
            if (card.classList.contains('rio-card') || card.dataset.rioNormalized === '1') return;

            const data = legacyThumbToRioHtml(card, idx);
            card.className = 'rio-card';
            card.dataset.rioNormalized = '1';
            card.innerHTML = rioCardMarkupFromLegacy(data);
        });

        if (grid.id === 'homeGamesGrid') {
            document.dispatchEvent(new CustomEvent('homeGamesGridNormalized'));
        }
    });
}

function normalizeContinueCards() {
    const continueCards = document.querySelectorAll('.continue-carousel .continue-card');
    if (!continueCards.length) return;

    continueCards.forEach((card, idx) => {
        if (card.querySelector('.rio-card-bg') || card.dataset.rioNormalized === '1') return;

        const data = legacyThumbToRioHtml(card, idx);
        card.className = 'continue-card rio-card';
        card.dataset.rioNormalized = '1';
        card.innerHTML = rioCardMarkupFromLegacy(data);
    });
}

/* ============================================
   EXPORT FOR MODULES
   ============================================ */
// APK Download Function
function downloadAPK() {
    // Replace with your actual APK download URL
    const apkUrl = 'https://your-domain.com/downloads/riocity.apk';

    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = apkUrl;
    link.download = 'RioCity.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Optional: Show toast notification
    if (typeof showToast === 'function') {
        showToast('Downloading APK...', 'success');
    }
}

function closeFloatingIcon(iconId, event) {
    if (event) {
        event.stopPropagation();
    }
    const icon = document.querySelector(`.floating-icon[data-icon-id="${iconId}"]`);
    if (icon) {
        icon.classList.add('hidden');
    }
}

function initFloatingSidebar() {
    // Icons will show by default after refresh (no localStorage persistence)
    // This function is kept for potential future use
}

function closeLiveChat(event) {
    if (event) {
        event.stopPropagation();
    }
    const chatWrapper = document.getElementById('liveChatWrapper');
    if (chatWrapper) {
        chatWrapper.classList.add('hidden');
    }
    // Also close the panel if open
    const chatPanel = document.getElementById('liveChatPanel');
    if (chatPanel) {
        chatPanel.classList.remove('active');
    }
}

function toggleChatIcons() {
    const chatIcons = document.getElementById('chatFloatingIcons');
    if (chatIcons) {
        chatIcons.classList.toggle('active');
    }
}

function closeChatIcon(iconType, event) {
    if (event) {
        event.stopPropagation();
    }
    const icon = document.querySelector(`.chat-floating-icon.${iconType}-icon`);
    if (icon) {
        icon.classList.add('hidden');
    }
}


function openChatSupport(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    // Check if LiveChat is available
    if (window.openLiveChatModal) {
        window.openLiveChatModal();
        toggleChatIcons(); // Close the floating menu
    } else {
        // Fallback or lazy load
        const script = document.createElement('script');
        script.src = 'js/live-chat.js';
        script.onload = () => {
            if (window.openLiveChatModal) window.openLiveChatModal();
        };
        document.body.appendChild(script);
        toggleChatIcons();
    }
}

function openFacebookSupport(event) {
    event.preventDefault();
    event.stopPropagation();
    // Add your Facebook page URL here
    window.open('https://www.facebook.com/your-page', '_blank');
    toggleChatIcons();
}

function openInstagramSupport(event) {
    event.preventDefault();
    event.stopPropagation();
    // Add your Instagram profile URL here
    window.open('https://www.instagram.com/your-profile', '_blank');
    toggleChatIcons();
}

function initLiveChat() {
    // Chat button will show by default after refresh (no localStorage persistence)

    // Close floating icons when clicking outside
    document.addEventListener('click', (e) => {
        const chatIcons = document.getElementById('chatFloatingIcons');
        const chatBtn = document.querySelector('.live-chat-btn');
        const iconClose = document.querySelector('.live-chat-icon-close');

        if (chatIcons && chatIcons.classList.contains('active')) {
            // Check if click is outside the icons and not on the button
            const outsideIcons = !chatIcons.contains(e.target);
            const notOnChatBtn = !chatBtn || (e.target !== chatBtn && !chatBtn.contains(e.target));
            const notOnIconClose = !iconClose || (e.target !== iconClose && !iconClose.contains(e.target));
            if (outsideIcons && notOnChatBtn && notOnIconClose) {
                chatIcons.classList.remove('active');
            }
        }
    });
}

/* ============================================
   WALLET DROPDOWN - Main & Game Wallet
   ============================================ */
function toggleWalletDropdown() {
    const section = document.getElementById('headerWalletSection');
    if (section) {
        section.classList.toggle('open');
    }
}

function closeWalletDropdown() {
    const section = document.getElementById('headerWalletSection');
    if (section) {
        section.classList.remove('open');
    }
}

function refreshWalletBalances(e) {
    if (e) e.stopPropagation();
    const btn = document.querySelector('.header-wallet-refresh');
    if (!btn) return;
    btn.classList.add('refreshing');
    // Simulate API refresh - replace with actual API call
    setTimeout(() => {
        btn.classList.remove('refreshing');
    }, 800);
}

function initWalletDropdown() {
    const section = document.getElementById('headerWalletSection');
    const toggle = document.querySelector('.header-wallet-toggle');
    if (!section || !toggle) return;

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        section.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (section.classList.contains('open') && !section.contains(e.target)) {
            closeWalletDropdown();
        }
    });
}

window.toggleWalletDropdown = toggleWalletDropdown;
window.refreshWalletBalances = refreshWalletBalances;

window.RioCity = {
    showToast,
    formatCurrency,
    formatNumber,
    downloadAPK,
    closeFloatingIcon,
    closeLiveChat,
    toggleChatIcons,
    closeChatIcon,
    openChatSupport,
    openFacebookSupport,
    openInstagramSupport
};

// Ensure mobile header buttons always work (Delegated listeners)
document.addEventListener('click', (e) => {
    // Mobile Menu Toggle
    if (e.target.closest('.mobile-menu-btn')) {
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu) {
            mobileMenu.classList.add('active');
            if (typeof lockBodyScroll === 'function') {
                lockBodyScroll();
            } else {
                document.body.style.overflow = 'hidden';
            }
        }
    }

    // Info Button (Example: open promotions or show alert)
    if (e.target.closest('.mobile-info-btn')) {
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu) {
            mobileMenu.classList.add('active'); // Fallback: open menu
            if (typeof lockBodyScroll === 'function') {
                lockBodyScroll();
            } else {
                document.body.style.overflow = 'hidden';
            }
        }
    }
});


/* ============================================
   INFORMATION CENTER LOGIC
   ============================================ */
function initInfoCenter() {
    const infoTabs = document.querySelectorAll('.info-nav-pill');
    const subTabsContainer = document.getElementById('infoSubTabs');
    const contentArea = document.getElementById('infoContentArea');

    if (!infoTabs.length || !subTabsContainer || !contentArea) return;

    // Data Structure
    const infoData = {
        rules: {
            subTabs: ['General', 'Account', 'Deposits', 'Withdrawals', 'Betting'],
            content: {
                'General': `
                    <div class="info-text-block">
                        <p>Welcome to RioCity. By accessing or using our platform, you agree to be bound by the following terms and conditions. These rules are in place to ensure a fair and secure gaming environment for all our members.</p>
                        <ul class="info-clean-list">
                            <li>You must be at least 18 years of age or the legal age of majority in your jurisdiction.</li>
                            <li>Only one account per person, household, IP address, and device is permitted.</li>
                            <li>We reserve the right to request identity verification documents (KYC) at any time.</li>
                            <li>RioCity reserves the right to amend these terms without prior notice.</li>
                        </ul>
                    </div>`,
                'Account': `
                    <div class="info-text-block">
                        <p>Your account security is our top priority. Please adhere to the following guidelines to keep your account safe.</p>
                        <ul class="info-clean-list">
                            <li>Keep your login credentials (username and password) confidential at all times.</li>
                            <li>Do not share your account with anyone else. You are solely responsible for all activity on your account.</li>
                            <li>If you suspect unauthorized access, contact Customer Support immediately.</li>
                            <li>ensure your registered email and phone number are always up to date.</li>
                        </ul>
                    </div>`,
                'Deposits': `
                    <div class="info-text-block">
                        <p>We offer a variety of secure deposit methods. Please note the following rules regarding funding your account.</p>
                        <ul class="info-clean-list">
                            <li>Deposits must be made from a payment source (bank account, e-wallet) registered in your own name.</li>
                            <li>Third-party deposits are strictly prohibited and may result in the confiscation of funds.</li>
                            <li>Minimum deposit amounts apply and vary by payment method (typically MYR 30).</li>
                            <li>All deposits are subject to a standard 1x turnover requirement before withdrawal.</li>
                        </ul>
                    </div>`,
                'Withdrawals': `
                    <div class="info-text-block">
                        <p>Enjoy fast and hassle-free withdrawals. To ensure smooth processing, please review our withdrawal policies.</p>
                        <ul class="info-clean-list">
                            <li>Withdrawals are processed 24/7, typically within 5-15 minutes.</li>
                            <li>Maximum daily withdrawal limits are determined by your VIP level.</li>
                            <li>You cannot withdraw from a bonus balance until the wagering requirement is met.</li>
                            <li>We reserve the right to audit gameplay before approving large withdrawals.</li>
                        </ul>
                    </div>`,
                'Betting': `
                    <div class="info-text-block">
                        <p>Fair play is the cornerstone of our platform. Understanding our betting rules ensures a better experience.</p>
                        <ul class="info-clean-list">
                            <li>All bets are final once confirmed and cannot be cancelled or changed.</li>
                            <li>In the event of a technical malfunction, all pays and plays are void.</li>
                            <li>Betting on opposite outcomes (e.g., Banker and Player) to meet turnover is prohibited.</li>
                            <li>Maximum payout limits may apply to certain games or progressive jackpots.</li>
                        </ul>
                    </div>`
            }
        },
        faq: {
            subTabs: ['Registration', 'Games', 'Banking', 'Tech Support', 'Promotions'],
            content: {
                'Registration': `
                    <div class="info-accordion-group">
                        <div class="info-accordion-item">
                            <div class="info-accordion-header">
                                <span>How do I create an account?</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="info-accordion-content">
                                Click the "Register" button at the top right corner of the page. Fill in your username, password, and mobile number. It takes less than 1 minute to join!
                            </div>
                        </div>
                        <div class="info-accordion-item">
                            <div class="info-accordion-header">
                                <span>Is it free to join?</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="info-accordion-content">
                                Yes, registration is 100% free. You are not required to deposit to create an account and explore our platform.
                            </div>
                        </div>
                         <div class="info-accordion-item">
                            <div class="info-accordion-header">
                                <span>Can I have more than one account?</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="info-accordion-content">
                                No, creating multiple accounts is a violation of our terms. If you have forgotten your login details, please use the "Forgot Password" feature or contact support.
                            </div>
                        </div>
                    </div>`,
                'Games': `
                    <div class="info-accordion-group">
                         <div class="info-accordion-item">
                            <div class="info-accordion-header">
                                <span>Are the game outcomes fair?</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="info-accordion-content">
                                Absolutely. All our games use a certified Random Number Generator (RNG) to ensure that every spin or hand is completely random and fair.
                            </div>
                        </div>
                        <div class="info-accordion-item">
                            <div class="info-accordion-header">
                                <span>Can I play for free?</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="info-accordion-content">
                                Yes! Most of our slot games offer a "Demo" mode. Hover over a game card and select "Demo" to play with virtual credits.
                            </div>
                        </div>
                    </div>`,
                'Banking': `
                    <div class="info-accordion-group">
                        <div class="info-accordion-item">
                            <div class="info-accordion-header">
                                <span>What payment methods do you accept?</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="info-accordion-content">
                                We support instant local bank transfers (DuitNow) and major E-Wallets (Touch 'n Go, GrabPay, Boost) via our secure payment gateway (SurePay).
                            </div>
                        </div>
                        <div class="info-accordion-item">
                            <div class="info-accordion-header">
                                <span>How long do withdrawals take?</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="info-accordion-content">
                                We pride ourselves on speed. Most withdrawals are processed within 5 to 15 minutes, 24 hours a day.
                            </div>
                        </div>
                    </div>`,
                'Tech Support': `
                    <div class="info-accordion-group">
                        <div class="info-accordion-item">
                            <div class="info-accordion-header">
                                <span>The game froze while I was playing. What happens to my bet?</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="info-accordion-content">
                                Don't worry, your bet is recorded on the game server. If the round was completed, your balance will update accordingly. If it wasn't, the bet amount will be refunded.
                            </div>
                        </div>
                         <div class="info-accordion-item">
                            <div class="info-accordion-header">
                                <span>Is my personal information secure?</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="info-accordion-content">
                                Yes. We utilize advanced SSL encryption technology and strict data protection protocols to ensure your personal and financial information is never compromised.
                            </div>
                        </div>
                    </div>`,
                'Promotions': `
                    <div class="info-accordion-group">
                        <div class="info-accordion-item">
                            <div class="info-accordion-header">
                                <span>How do I claim a Welcome Bonus?</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="info-accordion-content">
                                Go to the Promotions page, select the Welcome Bonus, and click "Apply". Then, proceed to make your deposit. The bonus will be credited automatically.
                            </div>
                        </div>
                        <div class="info-accordion-item">
                            <div class="info-accordion-header">
                                <span>What is "Turnover" or "Wagering Requirement"?</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="info-accordion-content">
                                Turnover is the total amount you need to bet before you can withdraw your bonus funds. For example, a MYR 100 bonus with 5x turnover requires MYR 500 in total bets.
                            </div>
                        </div>
                    </div>`
            }
        },
        video: {
            subTabs: ['Tutorials', 'Game Previews'],
            content: {
                'Tutorials': `
                     <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px;">
                        <div class="video-card">
                            <div class="video-thumbnail">
                                <img src="https://img.youtube.com/vi/aqz-KE-bpKQ/maxresdefault.jpg" alt="Deposit Tutorial">
                                <div class="video-play-icon"><i class="fas fa-play"></i></div>
                            </div>
                            <div class="video-info">
                                <div class="video-title">How to Deposit Fast using DuitNow</div>
                                <div class="video-duration">0:45 • Tutorial</div>
                            </div>
                        </div>
                        <div class="video-card">
                            <div class="video-thumbnail">
                                <img src="https://img.youtube.com/vi/ScMzIvxBSi4/maxresdefault.jpg" alt="Registration Tutorial">
                                <div class="video-play-icon"><i class="fas fa-play"></i></div>
                            </div>
                             <div class="video-info">
                                <div class="video-title">Step-by-Step Registration Guide</div>
                                <div class="video-duration">1:10 • Tutorial</div>
                            </div>
                        </div>
                    </div>`,
                'Game Previews': `
                     <div class="info-text-block" style="text-align: center; padding: 40px;">
                        <i class="fas fa-film" style="font-size: 3rem; color: var(--info-text-muted); margin-bottom: 20px;"></i>
                        <h3 style="color: #fff; margin-bottom: 10px;">Coming Soon</h3>
                        <p>We are currently producing exclusive previews of our hottest new games. Stay tuned!</p>
                     </div>`
            }
        },
        security: {
            subTabs: ['Data Protection', 'Fair Gaming', 'Terms of Service'],
            content: {
                'Data Protection': `
                    <div class="info-text-block">
                        <h3>Your Privacy is Our Priority</h3>
                        <p>At RioCity, we take your security seriously. We use state-of-the-art 256-bit SSL encryption to protect every transaction and piece of data you share with us.</p>
                        <ul>
                            <li><strong>Encrypted Connections:</strong> All data transmitted between your browser and our servers is fully encrypted.</li>
                            <li><strong>Secure Payments:</strong> We only partner with reputable, certified payment gateways.</li>
                            <li><strong>Privacy Policy:</strong> We never sell or share your personal information with third parties.</li>
                        </ul>
                    </div>`,
                'Fair Gaming': `
                    <div class="info-text-block">
                        <h3>Guaranteed Fair Play</h3>
                        <p>Transparency and fairness are the foundation of our platform. All our games use certified Random Number Generators (RNG) to ensure unpredictable and unbiased results.</p>
                        <p>Our providers are internationally recognized and regularly audited by independent testing agencies like eCOGRA and iTech Labs.</p>
                    </div>`,
                'Terms of Service': `
                    <div class="info-text-block">
                        <h3>Responsible Gaming</h3>
                        <p>RioCity is committed to providing a safe and enjoyable environment for our players. We encourage responsible gambling and provide tools to help you manage your play.</p>
                        <p>By using our services, you agree to comply with our full Terms of Service and local gambling regulations.</p>
                    </div>`
            }
        }
    };

    const mainTitle = document.getElementById('infoMainTitle');
    const mainSubtitle = document.getElementById('infoMainSubtitle');

    // TAB META DATA
    const tabMeta = {
        rules: { title: 'Rules & Regulations', subtitle: 'General Platform Guidelines' },
        faq: { title: 'Frequently Asked Questions', subtitle: 'Find Quick Answers' },
        video: { title: 'Video Guides', subtitle: 'Visual Tutorials & Previews' },
        security: { title: 'Security & Privacy', subtitle: 'Our Commitment to Your Safety' }
    };

    // STATE
    let currentMainTab = 'rules';
    let currentSubTab = infoData.rules.subTabs[0];

    // RENDER SUB TABS
    function renderSubTabs(mainTab) {
        if (!infoData[mainTab]) return;

        const subs = infoData[mainTab].subTabs;
        subTabsContainer.innerHTML = subs.map(sub =>
            `<button class="tab-pill ${sub === currentSubTab ? 'active' : ''}" onclick="switchInfoSubTab(this, '${sub}')">
                ${sub}
            </button>`
        ).join('');
    }

    // RENDER CONTENT
    function renderContent(mainTab, subTab) {
        if (!infoData[mainTab] || !infoData[mainTab].content[subTab]) {
            contentArea.innerHTML = '<p>Content not found.</p>';
            return;
        }

        // Fade Effect
        contentArea.style.opacity = '0';
        setTimeout(() => {
            contentArea.innerHTML = infoData[mainTab].content[subTab];
            contentArea.style.opacity = '1';

            // Initialize Accordions if present
            const accordions = contentArea.querySelectorAll('.info-accordion-item');
            accordions.forEach(item => {
                item.querySelector('.info-accordion-header').addEventListener('click', () => {
                    // Close others
                    accordions.forEach(a => {
                        if (a !== item) a.classList.remove('active');
                    });
                    item.classList.toggle('active');
                });
            });

        }, 200);
    }

    // EXPOSE SUBTAB SWITCHER
    window.switchInfoSubTab = (btn, sub) => {
        currentSubTab = sub;
        document.querySelectorAll('#infoSubTabs .tab-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update Badge Text
        if (mainSubtitle) {
            mainSubtitle.textContent = sub;
        }

        renderContent(currentMainTab, currentSubTab);
    };

    // INITIALIZE MAIN TABS
    infoTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            if (tab === currentMainTab) return;

            // Visual Update
            infoTabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Title Update
            if (mainTitle && tabMeta[tab]) {
                mainTitle.textContent = tabMeta[tab].title;
                mainSubtitle.textContent = tabMeta[tab].subtitle;
                // Update badge color or text if needed
                mainSubtitle.className = 'info-category-badge';
            }

            // State Update
            currentMainTab = tab;
            currentSubTab = infoData[tab].subTabs[0];

            // Render
            renderSubTabs(currentMainTab);
            renderContent(currentMainTab, currentSubTab);
        });
    });

    // Initial render: defer so DOM is fully ready (fixes spinner stuck on refresh)
    function doInitialRender() {
        var urlParams = new URLSearchParams(window.location.search);
        var tabParam = urlParams.get('tab');
        if (tabParam && infoData[tabParam]) {
            var targetBtn = document.querySelector('.info-nav-pill[data-tab="' + tabParam + '"]');
            if (targetBtn) targetBtn.click();
        } else {
            renderSubTabs(currentMainTab);
            renderContent(currentMainTab, currentSubTab);
        }
    }
    if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(doInitialRender);
    } else {
        setTimeout(doInitialRender, 0);
    }
}

window.initInfoCenter = initInfoCenter;

/* ============================================
   GLOBAL BONUS MODAL HELPERS
   Used by Spin Wheel / Voucher Scratch / Prize Box
   / Daily Check-In modals across all pages.
   ============================================ */
(function () {
    if (typeof window === 'undefined') return;

    function openBonusModal(modalId) {
        var el = document.getElementById(modalId);
        if (!el) return;
        el.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (modalId === 'dailyCheckinModal' && typeof window.renderDailyCheckin === 'function') {
            window.renderDailyCheckin();
        }
    }

    function closeBonusModal(modalId) {
        var el = document.getElementById(modalId);
        if (!el) return;
        el.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (typeof window.openBonusModal !== 'function') window.openBonusModal = openBonusModal;
    if (typeof window.closeBonusModal !== 'function') window.closeBonusModal = closeBonusModal;

    document.addEventListener('click', function (e) {
        var t = e.target;
        if (t && t.classList && t.classList.contains('bonus-modal-overlay')) {
            t.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        var openOverlays = document.querySelectorAll('.bonus-modal-overlay.active');
        if (!openOverlays.length) return;
        openOverlays.forEach(function (o) { o.classList.remove('active'); });
        document.body.style.overflow = '';
    });
})();

/* ============================================
   DAILY CHECK-IN BONUS
   Tracks: streak, last claim date, claimed days
   Persists in localStorage (key: riocity_daily_checkin)
   ============================================ */
(function () {
    var STORAGE_KEY = 'riocity_daily_checkin';
    var TOTAL_DAYS = 31;

    // Reward schedule: small everyday + milestone bumps at 7/14/21/30
    var REWARDS = (function () {
        var arr = [];
        for (var i = 1; i <= TOTAL_DAYS; i++) {
            if (i === 30) arr.push(30);
            else if (i === 21) arr.push(15);
            else if (i === 14) arr.push(8);
            else if (i === 7) arr.push(5);
            else arr.push(1);
        }
        return arr;
    })();
    var MILESTONES = { 7: true, 14: true, 21: true, 30: true };

    function todayISO() {
        var d = new Date();
        var y = d.getFullYear();
        var m = String(d.getMonth() + 1).padStart(2, '0');
        var day = String(d.getDate()).padStart(2, '0');
        return y + '-' + m + '-' + day;
    }

    function dayDiff(aIso, bIso) {
        if (!aIso || !bIso) return null;
        var a = new Date(aIso + 'T00:00:00');
        var b = new Date(bIso + 'T00:00:00');
        return Math.round((b - a) / 86400000);
    }

    function loadState() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                var parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') return parsed;
            }
        } catch (e) {}
        return { currentDay: 0, lastClaim: null, claimedDays: [] };
    }

    function saveState(state) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
    }

    // Returns the day number the user is currently ON (1..31), and
    // whether they have claimed today already.
    function computeStatus(state) {
        var today = todayISO();
        if (!state.lastClaim) {
            return { todayDay: 1, claimedToday: false };
        }
        var diff = dayDiff(state.lastClaim, today);
        if (diff === 0) {
            return { todayDay: state.currentDay, claimedToday: true };
        }
        if (diff === 1) {
            var nextDay = state.currentDay + 1;
            if (nextDay > TOTAL_DAYS) nextDay = 1;
            return { todayDay: nextDay, claimedToday: false };
        }
        // Missed a day -> streak resets
        return { todayDay: 1, claimedToday: false };
    }

    function buildDayGrid(state, status) {
        var grid = document.getElementById('dcDayGrid');
        if (!grid) return;
        var html = '';
        var claimedSet = {};
        (state.claimedDays || []).forEach(function (d) { claimedSet[d] = true; });

        for (var i = 1; i <= TOTAL_DAYS; i++) {
            var classes = ['dc-day-card'];
            var iconClass = 'fa-solid fa-ticket';

            // Reset of claimedSet view: only days BEFORE today's day in the
            // current cycle should appear claimed. status.todayDay is the
            // current cursor position.
            var isClaimed = false;
            if (status.claimedToday && i <= status.todayDay) isClaimed = true;
            else if (!status.claimedToday && i < status.todayDay) isClaimed = true;

            var isToday = (i === status.todayDay) && !status.claimedToday;
            var isLocked = (i > status.todayDay);

            if (MILESTONES[i]) classes.push('is-milestone');
            if (isClaimed) { classes.push('is-claimed'); iconClass = 'fa-solid fa-circle-check'; }
            if (isToday)   { classes.push('is-today');   iconClass = 'fa-solid fa-gift'; }
            if (isLocked)  { classes.push('is-locked');  iconClass = 'fa-solid fa-lock'; }

            html += '<div class="' + classes.join(' ') + '" role="listitem" aria-label="Day ' + i + '">' +
                        '<span class="dc-day-label">Day ' + i + '</span>' +
                        '<i class="' + iconClass + ' dc-day-icon" aria-hidden="true"></i>' +
                        '<span class="dc-day-amount">SGD ' + REWARDS[i - 1] + '</span>' +
                    '</div>';
        }
        grid.innerHTML = html;
    }

    function buildChipRail(state, status) {
        var rail = document.getElementById('dcJourneyStrip');
        if (!rail) return;

        // Compute a 7-day window that always includes "today" and gives
        // context (a few days behind for sense of progress).
        var todayDay = status.todayDay;
        var startDay = Math.max(1, todayDay - 2);
        if (startDay + 6 > TOTAL_DAYS) startDay = Math.max(1, TOTAL_DAYS - 6);

        var html = '';
        for (var i = 0; i < 7; i++) {
            var day = startDay + i;
            if (day > TOTAL_DAYS) break;

            var classes = ['dc-chip'];
            var iconClass = 'fa-solid fa-coins';

            var isClaimed = false;
            if (status.claimedToday && day <= todayDay) isClaimed = true;
            else if (!status.claimedToday && day < todayDay) isClaimed = true;

            var isToday  = (day === todayDay) && !status.claimedToday;
            var isLocked = (day > todayDay);

            if (MILESTONES[day]) classes.push('is-milestone');
            if (isClaimed) { classes.push('is-claimed'); iconClass = 'fa-solid fa-check'; }
            if (isToday)   { classes.push('is-today');   iconClass = 'fa-solid fa-gift'; }
            if (isLocked)  { classes.push('is-locked');  iconClass = 'fa-solid fa-lock'; }

            html += '<div class="' + classes.join(' ') + '" title="Day ' + day + ' • SGD ' + REWARDS[day - 1] + '">' +
                        '<span class="dc-chip-num">D' + day + '</span>' +
                        '<i class="' + iconClass + ' dc-chip-icon" aria-hidden="true"></i>' +
                        '<span class="dc-chip-amt">' + REWARDS[day - 1] + '</span>' +
                    '</div>';
        }
        rail.innerHTML = html;
    }

    function updateBanner(state, status) {
        var banner = document.getElementById('dailyCheckinBanner');
        var dayText = document.getElementById('dcBannerCurrentDay');
        var amount = document.getElementById('dcBannerTodayAmount');
        var streakText = document.getElementById('dcBannerStreak');
        if (!banner) return;

        var displayDay = status.todayDay;
        var claimedCount = status.claimedToday ? status.todayDay : (status.todayDay - 1);
        if (claimedCount < 0) claimedCount = 0;

        if (dayText) dayText.textContent = 'Day ' + displayDay;
        if (amount) amount.textContent = REWARDS[Math.max(0, displayDay - 1)];
        if (streakText) streakText.textContent = claimedCount;

        buildChipRail(state, status);

        var cta = document.getElementById('dcBannerCta');
        if (status.claimedToday) {
            banner.classList.add('is-claimed');
            if (cta) {
                var t1 = cta.querySelector('.dc-cta-text');
                var i1 = cta.querySelector('i');
                if (t1) t1.textContent = 'CHECKED IN TODAY';
                if (i1) i1.className = 'fa-solid fa-check';
            }
        } else {
            banner.classList.remove('is-claimed');
            if (cta) {
                var t2 = cta.querySelector('.dc-cta-text');
                var i2 = cta.querySelector('i');
                if (t2) t2.textContent = 'CHECK IN NOW';
                if (i2) i2.className = 'fa-solid fa-calendar-check';
            }
        }
    }

    /* ----- Live countdown to next reset (00:00 GMT+7) ----- */
    function startCountdown() {
        var el = document.getElementById('dcCountdown');
        if (!el) return;

        function tick() {
            // Compute time until next 00:00 in GMT+7 (Asia/Bangkok zone).
            var now = new Date();
            var nowUtcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
            var bangkok = new Date(nowUtcMs + (7 * 3600000));
            var nextReset = new Date(bangkok);
            nextReset.setHours(24, 0, 0, 0); // tomorrow midnight in Bangkok
            var diffMs = nextReset - bangkok;
            if (diffMs < 0) diffMs = 0;
            var totalSec = Math.floor(diffMs / 1000);
            var h = Math.floor(totalSec / 3600);
            var m = Math.floor((totalSec % 3600) / 60);
            var s = totalSec % 60;
            var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
            el.textContent = pad(h) + 'h ' + pad(m) + 'm ' + pad(s) + 's';
        }
        tick();
        setInterval(tick, 1000);
    }

    /* ----- Social proof ticker (gently increments) ----- */
    function startSocialProof() {
        var el = document.getElementById('dcSocialCount');
        if (!el) return;
        var base = 1247 + Math.floor(Math.random() * 80);
        function fmt(n) { return n.toLocaleString('en-US'); }
        el.textContent = fmt(base);
        setInterval(function () {
            base += Math.floor(Math.random() * 3) + 1;
            el.textContent = fmt(base);
        }, 4500 + Math.floor(Math.random() * 3500));
    }

    function updateModalStats(state, status) {
        var fill = document.getElementById('dcModalProgressFill');
        var label = document.getElementById('dcModalDayLabel');
        var streak = document.getElementById('dcStreakCount');
        var claimed = document.getElementById('dcClaimedCount');
        var remaining = document.getElementById('dcRemainingDays');
        var btn = document.getElementById('dcClaimBtn');

        var claimedCount = status.claimedToday ? status.todayDay : (status.todayDay - 1);
        if (claimedCount < 0) claimedCount = 0;
        var remainingDays = TOTAL_DAYS - claimedCount;
        var pct = Math.round((claimedCount / TOTAL_DAYS) * 100);

        if (fill) fill.style.width = pct + '%';
        if (label) label.textContent = 'Day ' + status.todayDay + ' of ' + TOTAL_DAYS;
        if (streak) streak.textContent = claimedCount;
        if (claimed) claimed.textContent = claimedCount;
        if (remaining) remaining.textContent = remainingDays;

        if (btn) {
            if (status.claimedToday) {
                btn.disabled = true;
                btn.classList.add('is-claimed');
                btn.innerHTML = '<i class="fa-solid fa-check-circle"></i><span>CLAIMED — COME BACK TOMORROW</span>';
            } else {
                btn.disabled = false;
                btn.classList.remove('is-claimed');
                btn.innerHTML = '<i class="fa-solid fa-gift"></i><span>CHECK IN NOW</span>';
            }
        }
    }

    function render() {
        var state = loadState();
        var status = computeStatus(state);
        buildDayGrid(state, status);
        updateBanner(state, status);
        updateModalStats(state, status);
        return { state: state, status: status };
    }

    function claim() {
        var state = loadState();
        var status = computeStatus(state);
        if (status.claimedToday) return;

        var newDay = status.todayDay;
        state.currentDay = newDay > TOTAL_DAYS ? 1 : newDay;
        state.lastClaim = todayISO();
        state.claimedDays = state.claimedDays || [];
        state.claimedDays.push(state.lastClaim + ':day' + state.currentDay);
        if (state.claimedDays.length > 200) state.claimedDays = state.claimedDays.slice(-200);
        saveState(state);
        render();

        var btn = document.getElementById('dcClaimBtn');
        if (btn) {
            btn.classList.add('is-claimed');
            btn.disabled = true;
        }
    }

    function attachClaimHandler() {
        var btn = document.getElementById('dcClaimBtn');
        if (btn && !btn._dcBound) {
            btn._dcBound = true;
            btn.addEventListener('click', claim);
        }
        var bannerCta = document.getElementById('dcBannerCta');
        if (bannerCta && !bannerCta._dcBound) {
            bannerCta._dcBound = true;
            bannerCta.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (typeof window.openBonusModal === 'function') {
                    window.openBonusModal('dailyCheckinModal');
                }
            });
        }
    }

    function init() {
        if (!document.getElementById('dailyCheckinBanner') && !document.getElementById('dailyCheckinModal')) return;
        attachClaimHandler();
        render();
        startCountdown();
        startSocialProof();
    }

    window.renderDailyCheckin = render;
    window.claimDailyCheckin = claim;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

/* ============================================
   REWARD TOKEN MODALS
   Spin Wheel / Voucher Scratch / Prize Box
   Handles: main <-> record view, quick date ranges.
   ============================================ */
(function () {
    function formatDate(d) {
        var y = d.getFullYear();
        var m = String(d.getMonth() + 1).padStart(2, '0');
        var day = String(d.getDate()).padStart(2, '0');
        return y + '-' + m + '-' + day;
    }

    function startOfWeek(d) {
        var nd = new Date(d);
        var diff = (nd.getDay() + 6) % 7; // Monday = 0
        nd.setDate(nd.getDate() - diff);
        nd.setHours(0, 0, 0, 0);
        return nd;
    }

    function getRange(preset) {
        var now = new Date();
        var start = new Date(now);
        var end = new Date(now);
        switch (preset) {
            case 'today':
                break;
            case 'yesterday':
                start.setDate(start.getDate() - 1);
                end.setDate(end.getDate() - 1);
                break;
            case 'this-week':
                start = startOfWeek(now);
                break;
            case 'last-week':
                start = startOfWeek(now);
                start.setDate(start.getDate() - 7);
                end = new Date(start);
                end.setDate(end.getDate() + 6);
                break;
            case 'this-month':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'last-month':
                start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                end = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            default:
                start = startOfWeek(now);
        }
        return { start: formatDate(start), end: formatDate(end) };
    }

    function applyRange(modal, preset) {
        var range = getRange(preset);
        var startInput = modal.querySelector('[data-rt-start]');
        var endInput = modal.querySelector('[data-rt-end]');
        if (startInput) startInput.value = range.start;
        if (endInput) endInput.value = range.end;

        modal.querySelectorAll('[data-rt-range]').forEach(function (btn) {
            btn.classList.toggle('is-active', btn.getAttribute('data-rt-range') === preset);
        });
    }

    function showRecordView(modal) {
        modal.classList.add('is-record-view');
        var activeBtn = modal.querySelector('[data-rt-range].is-active');
        applyRange(modal, activeBtn ? activeBtn.getAttribute('data-rt-range') : 'this-week');

        var typeSelect = modal.querySelector('[data-rt-type-select]');
        if (typeSelect) {
            var defaultType = modal.getAttribute('data-rt-type');
            if (defaultType) typeSelect.value = defaultType;
        }
    }

    function showMainView(modal) {
        modal.classList.remove('is-record-view');
    }

    function initRewardTokenModals() {
        var modals = document.querySelectorAll('.reward-token-modal');
        if (!modals.length) return;

        modals.forEach(function (modal) {
            modal.querySelectorAll('[data-rt-open-record]').forEach(function (btn) {
                btn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    showRecordView(modal);
                });
            });

            modal.querySelectorAll('[data-rt-back]').forEach(function (btn) {
                btn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    showMainView(modal);
                });
            });

            modal.querySelectorAll('[data-rt-range]').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    applyRange(modal, btn.getAttribute('data-rt-range'));
                });
            });

            // Typing a custom date clears quick-range highlight.
            modal.querySelectorAll('[data-rt-start], [data-rt-end]').forEach(function (input) {
                input.addEventListener('input', function () {
                    modal.querySelectorAll('[data-rt-range]').forEach(function (b) {
                        b.classList.remove('is-active');
                    });
                });
            });
        });

        // Reset to main view whenever a reward-token modal is closed.
        document.addEventListener('click', function (e) {
            var t = e.target;
            if (t && t.classList && t.classList.contains('bonus-modal-overlay') && t.classList.contains('reward-token-modal')) {
                t.classList.remove('is-record-view');
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key !== 'Escape') return;
            document.querySelectorAll('.reward-token-modal.active').forEach(function (m) {
                m.classList.remove('is-record-view');
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRewardTokenModals);
    } else {
        initRewardTokenModals();
    }
})();
