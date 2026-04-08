/* ============================================
   RIOCITY - Game Pages JavaScript
   Slots & Live Casino Page Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    // Initialize all components
    initFilterTabs();
    initSearchBar();
    initGameCards();
    initSlotGameCards();
    initFishHuntGameCards();
    initInfoBanner();
    initScrollAnimations();
    initSportsProviderModal();
    initLiveCasinoProviderModal();
    initPokerProviderModal();
    initProviderControlBar();
    initRecentGamesPage();
});

/* ============================================
   RECENT GAMES - localStorage Tracking
   ============================================ */
var RECENT_GAMES_KEY = 'recentGames';
var RECENT_GAMES_MAX = 50;

/**
 * Track a game play into localStorage.
 * Deduplicates by name, increments playCount, prunes to max 50.
 * @param {Object} gameData
 * @param {string} gameData.name
 * @param {string} gameData.image
 * @param {string} gameData.provider
 * @param {string} gameData.category - "slots" | "live-casino" | "sports"
 * @param {string} [gameData.rtp]
 * @param {string} [gameData.tag]
 * @param {string} gameData.playUrl
 */
function trackRecentGame(gameData) {
    if (!gameData || !gameData.name) return;
    try {
        var games = JSON.parse(localStorage.getItem(RECENT_GAMES_KEY) || '[]');

        // Find existing entry by name (case-insensitive)
        var existingIdx = -1;
        for (var i = 0; i < games.length; i++) {
            if (games[i].name.toLowerCase() === gameData.name.toLowerCase()) {
                existingIdx = i;
                break;
            }
        }

        if (existingIdx !== -1) {
            // Update existing: bump count, update timestamp, move to top
            var existing = games.splice(existingIdx, 1)[0];
            existing.lastPlayed = Date.now();
            existing.playCount = (existing.playCount || 1) + 1;
            // Update mutable fields in case they changed
            if (gameData.image) existing.image = gameData.image;
            if (gameData.provider) existing.provider = gameData.provider;
            if (gameData.playUrl) existing.playUrl = gameData.playUrl;
            if (gameData.rtp) existing.rtp = gameData.rtp;
            if (gameData.tag) existing.tag = gameData.tag;
            games.unshift(existing);
        } else {
            // New entry
            games.unshift({
                name: gameData.name,
                image: gameData.image || '',
                provider: gameData.provider || '',
                category: gameData.category || 'slots',
                rtp: gameData.rtp || '',
                tag: gameData.tag || '',
                playUrl: gameData.playUrl || '',
                lastPlayed: Date.now(),
                playCount: 1
            });
        }

        // Prune to max
        if (games.length > RECENT_GAMES_MAX) {
            games = games.slice(0, RECENT_GAMES_MAX);
        }

        localStorage.setItem(RECENT_GAMES_KEY, JSON.stringify(games));
    } catch (e) {
        // localStorage unavailable or full - fail silently
    }
}

/**
 * Extract game data from a .game-card DOM element for tracking.
 */
function extractGameDataFromCard(card, category, providerName) {
    var nameEl = card.querySelector('.game-info h4') || card.querySelector('.game-details h4');
    var imgEl = card.querySelector('.game-img');
    var rtpEl = card.querySelector('.rtp');
    var tagEl = card.querySelector('.game-tag') || card.querySelector('.game-badge');

    var name = nameEl ? nameEl.textContent.trim() : '';
    var image = imgEl ? imgEl.src : '';
    var rtp = '';
    if (rtpEl) {
        var rtpText = rtpEl.textContent.trim();
        var rtpMatch = rtpText.match(/([\d.]+%)/);
        if (rtpMatch) rtp = rtpMatch[1];
    }
    var tag = tagEl ? tagEl.textContent.trim() : '';

    return {
        name: name,
        image: image,
        provider: providerName || '',
        category: category || 'slots',
        rtp: rtp,
        tag: tag
    };
}

/* ============================================
   RECENT GAMES PAGE - Render & Interactions
   ============================================ */
function initRecentGamesPage() {
    // Only run on games.html
    if (window.location.pathname.indexOf('games.html') === -1) return;

    var grid = document.getElementById('recentGamesGrid');
    var emptyState = document.getElementById('recentEmptyState');
    var statsBar = document.getElementById('recentStatsBar');
    var controlsBar = document.getElementById('recentControlsBar');
    var searchInput = document.getElementById('recentGamesSearch');
    var clearBtn = document.getElementById('recentClearBtn');
    var confirmOverlay = document.getElementById('recentConfirmOverlay');
    var confirmCancel = document.getElementById('recentConfirmCancel');
    var confirmDelete = document.getElementById('recentConfirmDelete');

    if (!grid) return;

    var currentFilter = 'all';
    var currentProvider = 'all';
    var currentSearch = '';

    function getGames() {
        try {
            return JSON.parse(localStorage.getItem(RECENT_GAMES_KEY) || '[]');
        } catch (e) {
            return [];
        }
    }

    function timeAgo(ts) {
        var diff = Date.now() - ts;
        var mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return mins + 'm ago';
        var hrs = Math.floor(mins / 60);
        if (hrs < 24) return hrs + 'h ago';
        var days = Math.floor(hrs / 24);
        if (days < 7) return days + 'd ago';
        var weeks = Math.floor(days / 7);
        if (weeks < 4) return weeks + 'w ago';
        return new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    function getCategoryIcon(cat) {
        switch (cat) {
            case 'slots': return 'fas fa-dice';
            case 'live-casino': return 'fas fa-play-circle';
            case 'sports': return 'fas fa-futbol';
            case 'poker': return 'fas fa-heart';
            case 'fishhunt': return 'fas fa-fish';
            default: return 'fas fa-gamepad';
        }
    }

    function getCategoryLabel(cat) {
        switch (cat) {
            case 'slots': return 'Slots';
            case 'live-casino': return 'Live Casino';
            case 'sports': return 'Sports';
            case 'poker': return 'Poker';
            case 'fishhunt': return 'Fish Hunt';
            default: return 'Game';
        }
    }

    function updateStats(games) {
        // Total games
        var totalEl = document.getElementById('statTotalGames');
        if (totalEl) totalEl.textContent = games.length;

        // Most played
        var mostEl = document.getElementById('statMostPlayed');
        if (mostEl) {
            if (games.length === 0) {
                mostEl.textContent = '--';
            } else {
                var most = games.reduce(function (a, b) { return (a.playCount || 1) >= (b.playCount || 1) ? a : b; });
                var name = most.name;
                if (name.length > 16) name = name.substring(0, 14) + '...';
                mostEl.textContent = name;
                mostEl.title = most.name + ' (' + (most.playCount || 1) + 'x)';
            }
        }

        // Last session
        var lastEl = document.getElementById('statLastSession');
        if (lastEl) {
            if (games.length === 0) {
                lastEl.textContent = '--';
            } else {
                lastEl.textContent = timeAgo(games[0].lastPlayed);
            }
        }
    }

    var currentProvider = 'all';

    function renderCards(games) {
        // Apply filter
        var filtered = games;
        if (currentFilter !== 'all') {
            filtered = games.filter(function (g) { return g.category === currentFilter; });
        }
        // Apply provider filter
        if (currentProvider !== 'all') {
            filtered = filtered.filter(function (g) { return g.provider === currentProvider; });
        }
        // Apply search
        if (currentSearch) {
            var q = currentSearch.toLowerCase();
            filtered = filtered.filter(function (g) {
                return (g.name && g.name.toLowerCase().indexOf(q) !== -1) ||
                    (g.provider && g.provider.toLowerCase().indexOf(q) !== -1);
            });
        }

        if (filtered.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'flex';
            return;
        }

        grid.style.display = '';
        emptyState.style.display = 'none';

        var html = '';
        for (var i = 0; i < filtered.length; i++) {
            var g = filtered[i];

            // Tag HTML
            var tagHtml = '';
            if (g.tag) {
                var tagClass = g.tag.toLowerCase();
                tagHtml = `<span class="game-tag ${tagClass}">${g.tag}</span>`;
            }

            // Badges
            var categoryBadge = `<span class="recent-category-badge cat-${g.category || 'slots'}"><i class="${getCategoryIcon(g.category)}"></i> ${getCategoryLabel(g.category)}</span>`;
            var playCountBadge = g.playCount && g.playCount > 1 ? `<span class="play-count-badge">${g.playCount}x</span>` : '';
            var timeBadge = `<span class="time-badge">${timeAgo(g.lastPlayed)}</span>`;

            // Random tags for demo consistency with user screenshot
            const tags = ['hot', 'new', 'jackpot', ''];
            const tagType = tags[Math.floor(Math.random() * tags.length)];
            const multiplierStr = Math.floor(Math.random() * 50000 + 100) + 'X';
            const rtpValue = (96 + Math.random() * 3).toFixed(2) + '%';

            html += `
            <div class="rio-card" data-play-url="${(g.playUrl || '#').replace(/"/g, '&quot;')}" data-category="${g.category || ''}" style="aspect-ratio: 1/1;">
                <img src="${g.image || ''}" class="rio-card-bg" loading="lazy">
                <div class="rio-card-overlay"></div>
                
                <div class="rio-card-top">
                    ${tagType ? `<span class="rio-badge ${tagType}">${tagType.toUpperCase()}</span>` : '<span></span>'}
                    <span class="rio-multiplier"><i class="fa-solid fa-bolt"></i> ${multiplierStr}</span>
                </div>

                <div class="rio-play-btn-center"><i class="fa-solid fa-play"></i></div>

                <div class="rio-card-content">
                    <span class="rio-card-title">${g.name || 'Game'}</span>
                    <div class="rio-card-meta">
                        <span class="rio-provider">${g.provider || getCategoryLabel(g.category)}</span>
                        <span class="rio-rtp-tag"><i class="fa-solid fa-arrow-up"></i> ${rtpValue}</span>
                    </div>
                </div>
                
                ${playCountBadge ? `<div style="position:absolute; top:40px; right:10px; z-index:2;">${playCountBadge}</div>` : ''}
                <div style="position:absolute; top:40px; left:10px; z-index:2;">${timeBadge}</div>
            </div>`;
        }
        grid.innerHTML = html;

        // Add click handlers
        var cards = grid.querySelectorAll('.rio-card');
        cards.forEach(function (card) {
            card.addEventListener('click', function () {
                var url = card.getAttribute('data-play-url');
                if (url && url !== '#') {
                    window.location.href = url;
                }
            });
        });
    }

    function render() {
        var games = getGames();
        updateStats(games);

        if (games.length === 0 && currentFilter === 'all' && !currentSearch) {
            grid.style.display = 'none';
            emptyState.style.display = 'flex';
            if (statsBar) statsBar.style.display = 'none';
            if (controlsBar) controlsBar.style.display = 'none';
        } else {
            if (statsBar) statsBar.style.display = '';
            if (controlsBar) controlsBar.style.display = '';
            renderCards(games);
        }
    }

    // Filter tabs (Corporate Pill Style)
    var filterTabs = document.querySelectorAll('#recentCategoryTabs .tab-pill, #recentControlsBar .filter-btn');
    filterTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            filterTabs.forEach(function (t) { t.classList.remove('active'); });
            tab.classList.add('active');
            currentFilter = tab.getAttribute('data-filter') || 'all';
            renderCards(getGames());
        });
    });

    // Custom Provider Dropdown (Premium Fix)
    var providerDropdown = document.getElementById('recentProviderDropdown');
    if (providerDropdown) {
        var trigger = providerDropdown.querySelector('.select-trigger');
        var options = providerDropdown.querySelectorAll('.select-options li');
        var triggerText = trigger.querySelector('span');

        trigger.addEventListener('click', function (e) {
            e.stopPropagation();
            providerDropdown.classList.toggle('active');
        });

        options.forEach(function (opt) {
            opt.addEventListener('click', function (e) {
                e.stopPropagation();
                var val = opt.getAttribute('data-value');
                var text = opt.textContent;
                triggerText.textContent = text;
                providerDropdown.classList.remove('active');
                
                // Update filter and re-render
                currentProvider = val;
                renderCards(getGames());
            });
        });

        document.addEventListener('click', function () {
            providerDropdown.classList.remove('active');
        });
    }

    // Search
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            currentSearch = searchInput.value.trim();
            renderCards(getGames());
        });
    }

    // Clear history
    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            if (confirmOverlay) confirmOverlay.classList.add('active');
        });
    }
    if (confirmCancel) {
        confirmCancel.addEventListener('click', function () {
            if (confirmOverlay) confirmOverlay.classList.remove('active');
        });
    }
    if (confirmDelete) {
        confirmDelete.addEventListener('click', function () {
            try { localStorage.removeItem(RECENT_GAMES_KEY); } catch (e) { }
            if (confirmOverlay) confirmOverlay.classList.remove('active');
            currentFilter = 'all';
            currentSearch = '';
            if (searchInput) searchInput.value = '';
            filterTabs.forEach(function (t) { t.classList.remove('active'); });
            if (filterTabs[0]) filterTabs[0].classList.add('active');
            render();
        });
    }
    if (confirmOverlay) {
        confirmOverlay.addEventListener('click', function (e) {
            if (e.target === confirmOverlay) confirmOverlay.classList.remove('active');
        });
    }

    // Initial render
    render();
}

/* ============================================
   SLOTS PROVIDER CONTROL BAR
   ============================================ */
function initProviderControlBar() {
    const isFishHuntPage = window.location.pathname.indexOf('fish-hunt.html') !== -1;

    const scrollLeftBtn = document.getElementById('providerScrollLeft');
    const scrollRightBtn = document.getElementById('providerScrollRight');
    const scrollView = document.getElementById('providerScrollView');
    const gridToggleBtn = document.getElementById('providerGridToggle');
    const progressBar = document.getElementById('providerScrollProgressBar');
    const progressContainer = progressBar ? progressBar.closest('.provider-scroll-progress') : null;

    if (!scrollView) return;

    // Scroll Progress Tracking
    function updateScrollProgress() {
        if (!progressBar || scrollView.classList.contains('expanded')) return;
        const maxScroll = scrollView.scrollWidth - scrollView.clientWidth;
        if (maxScroll <= 0) {
            progressBar.style.width = '100%';
            progressBar.style.left = '0';
            return;
        }
        const scrollRatio = scrollView.scrollLeft / maxScroll;
        const trackWidth = Math.max(20, (scrollView.clientWidth / scrollView.scrollWidth) * 100);
        const leftPos = scrollRatio * (100 - trackWidth);
        progressBar.style.width = trackWidth + '%';
        progressBar.style.left = leftPos + '%';
    }

    scrollView.addEventListener('scroll', updateScrollProgress);
    window.addEventListener('resize', updateScrollProgress);
    setTimeout(updateScrollProgress, 100);

    // Scroll Arrows
    if (scrollLeftBtn) {
        scrollLeftBtn.addEventListener('click', () => {
            scrollView.scrollBy({ left: -300, behavior: 'smooth' });
        });
    }

    if (scrollRightBtn) {
        scrollRightBtn.addEventListener('click', () => {
            scrollView.scrollBy({ left: 300, behavior: 'smooth' });
        });
    }

    // Provider Chip Click - filter games on slots page (no separate provider page)
    // On fish hunt page, filter games by provider; on slots, visual only
    function applyFishHuntProviderFilter(provider) {
        const grid = document.getElementById('fishHuntGamesGrid');
        if (!grid) return;
        const cards = grid.querySelectorAll('.game-card');
        cards.forEach(card => {
            const cardProvider = card.dataset.provider || '';
            if (cardProvider === provider) {
                card.style.display = '';
                card.style.opacity = '1';
            } else {
                card.style.opacity = '0';
                card.style.display = 'none';
            }
        });
    }

    const chips = scrollView.querySelectorAll('.provider-chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            if (isFishHuntPage) {
                applyFishHuntProviderFilter(chip.dataset.provider || '');
            }
        });
    });

    // Fish Hunt: apply default filter on load
    if (isFishHuntPage) {
        const activeChip = scrollView.querySelector('.provider-chip.active');
        if (activeChip) {
            applyFishHuntProviderFilter(activeChip.dataset.provider || '');
        }
    }

    // Grid Toggle Logic
    if (gridToggleBtn) {
        gridToggleBtn.addEventListener('click', () => {
            const isExpanded = scrollView.classList.toggle('expanded');
            gridToggleBtn.classList.toggle('active');

            // Update toggle text and icon
            const icon = gridToggleBtn.querySelector('i');
            const toggleText = gridToggleBtn.querySelector('.provider-bar-toggle-text');
            const barContent = scrollView.closest('.provider-bar-content');

            if (isExpanded) {
                if (icon) icon.className = 'fas fa-chevron-up';
                if (toggleText) toggleText.textContent = 'Collapse';
                if (barContent) barContent.classList.add('grid-mode');
                if (progressContainer) progressContainer.classList.add('hidden');
            } else {
                if (icon) icon.className = 'fas fa-th';
                if (toggleText) toggleText.textContent = 'View All';
                if (barContent) barContent.classList.remove('grid-mode');
                if (progressContainer) progressContainer.classList.remove('hidden');
                scrollView.scrollLeft = 0;
                setTimeout(updateScrollProgress, 50);
            }
        });
    }
}

/* ============================================
   SPORTS PROVIDER MODAL
   ============================================ */
function initSportsProviderModal() {
    const overlay = document.getElementById('sportsProviderModal');
    if (!overlay) return;

    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeSportsProviderModal();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeSportsProviderModal();
        }
    });
}

function openSportsProviderModal(cardEl) {
    if (!cardEl || cardEl.classList.contains('maintenance')) return;

    const modal = document.getElementById('sportsProviderModal');
    const titleEl = document.getElementById('sportsProviderModalTitle');
    const bannerEl = document.getElementById('sportsProviderModalBanner');

    if (modal && titleEl && bannerEl) {
        const name = cardEl.dataset.provider || 'Sports Provider';
        const bannerUrl = cardEl.dataset.banner || '';
        var cardImg = cardEl.querySelector('.sports-provider-card-inner img');
        modal.dataset.currentProviderImage = cardImg ? cardImg.src : '';

        titleEl.textContent = name;
        modal.dataset.currentProvider = name;
        const bannerImg = bannerEl.querySelector('img');
        if (bannerImg && bannerUrl) bannerImg.src = bannerUrl;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function startSportsProviderGame() {
    const modal = document.getElementById('sportsProviderModal');
    const provider = modal?.dataset?.currentProvider || 'FB Sport';
    const providerImage = modal?.dataset?.currentProviderImage || '';
    closeSportsProviderModal();
    var url = 'sports-provider.html?provider=' + encodeURIComponent(provider);
    if (providerImage) {
        url += '&image=' + encodeURIComponent(providerImage);
    }
    window.location.href = url;
}

function closeSportsProviderModal() {
    const modal = document.getElementById('sportsProviderModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/* ============================================
   LIVE CASINO PROVIDER MODAL
   ============================================ */
function initLiveCasinoProviderModal() {
    const overlay = document.getElementById('liveCasinoProviderModal');
    if (!overlay) return;

    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeLiveCasinoProviderModal();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeLiveCasinoProviderModal();
        }
    });
}

function openLiveCasinoProviderModal(cardEl) {
    if (!cardEl || cardEl.classList.contains('maintenance')) return;

    const modal = document.getElementById('liveCasinoProviderModal');
    const titleEl = document.getElementById('liveCasinoProviderModalTitle');
    const bannerEl = document.getElementById('liveCasinoProviderModalBanner');

    if (modal && titleEl && bannerEl) {
        const name = cardEl.dataset.provider || 'Live Casino';
        const bannerUrl = cardEl.dataset.banner || '';

        titleEl.textContent = name;
        modal.dataset.currentProvider = name;
        const bannerImg = bannerEl.querySelector('img');
        if (bannerImg && bannerUrl) bannerImg.src = bannerUrl;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function startLiveCasinoProviderGame() {
    const modal = document.getElementById('liveCasinoProviderModal');
    const provider = modal?.dataset?.currentProvider || '';
    closeLiveCasinoProviderModal();
    const url = provider ? 'live-casino-play.html?provider=' + encodeURIComponent(provider) : 'live-casino-play.html';
    window.location.href = url;
}

function closeLiveCasinoProviderModal() {
    const modal = document.getElementById('liveCasinoProviderModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/* ============================================
   POKER PROVIDER MODAL
   ============================================ */
function initPokerProviderModal() {
    const overlay = document.getElementById('pokerProviderModal');
    if (!overlay) return;

    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closePokerProviderModal();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closePokerProviderModal();
        }
    });
}

function openPokerProviderModal(cardEl) {
    if (!cardEl || cardEl.classList.contains('maintenance')) return;

    const modal = document.getElementById('pokerProviderModal');
    const titleEl = document.getElementById('pokerProviderModalTitle');
    const bannerEl = document.getElementById('pokerProviderModalBanner');

    if (modal && titleEl && bannerEl) {
        const name = cardEl.dataset.provider || 'Poker';
        const bannerUrl = cardEl.dataset.banner || '';
        var cardImg = cardEl.querySelector('.sports-provider-card-inner img');
        modal.dataset.currentProviderImage = cardImg ? cardImg.src : '';

        titleEl.textContent = name;
        modal.dataset.currentProvider = name;
        const bannerImg = bannerEl.querySelector('img');
        if (bannerImg && bannerUrl) bannerImg.src = bannerUrl;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function startPokerProviderGame() {
    const modal = document.getElementById('pokerProviderModal');
    const provider = modal?.dataset?.currentProvider || 'Poker';
    const providerImage = modal?.dataset?.currentProviderImage || '';
    closePokerProviderModal();
    var url = 'poker-play.html?provider=' + encodeURIComponent(provider);
    if (providerImage) {
        url += '&image=' + encodeURIComponent(providerImage);
    }
    window.location.href = url;
}

function closePokerProviderModal() {
    const modal = document.getElementById('pokerProviderModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/* ============================================
   FILTER TABS
   ============================================ */
function initFilterTabs() {
    const filterChips = document.querySelectorAll('.filter-chip');

    filterChips.forEach(chip => {
        chip.addEventListener('click', function () {
            // Remove active class from all chips
            filterChips.forEach(c => c.classList.remove('active'));

            // Add active class to clicked chip
            this.classList.add('active');

            // Get filter value
            const filter = this.dataset.filter;

            // Filter games (you can extend this to actually filter games)
            filterGames(filter);

            // Add ripple effect
            createRipple(this, event);
        });
    });
}

function filterGames(filter) {
    const gameCards = document.querySelectorAll('.game-card-compact');

    gameCards.forEach((card, index) => {
        // Reset animation
        card.style.animation = 'none';
        card.offsetHeight; // Trigger reflow
        card.style.animation = `fadeInUp 0.5s ease forwards`;
        card.style.animationDelay = `${index * 0.03}s`;
    });

    // In a real implementation, you would filter based on game categories
    console.log(`Filtering games by: ${filter}`);
}

function createRipple(element, event) {
    const rect = element.getBoundingClientRect();
    const ripple = document.createElement('span');

    ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: rippleEffect 0.6s linear;
        pointer-events: none;
    `;

    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
}

// Add ripple keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes rippleEffect {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

/* ============================================
   SEARCH BAR
   ============================================ */
function initSearchBar() {
    const searchInput = document.querySelector('.game-search-input');
    const clearBtn = document.querySelector('.search-clear-btn');

    if (!searchInput) return;

    searchInput.addEventListener('input', function () {
        const value = this.value.trim();

        // Show/hide clear button
        if (clearBtn) {
            clearBtn.style.display = value.length > 0 ? 'block' : 'none';
        }

        // Search games
        searchGames(value);
    });

    searchInput.addEventListener('focus', function () {
        this.parentElement.classList.add('focused');
    });

    searchInput.addEventListener('blur', function () {
        this.parentElement.classList.remove('focused');
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            searchInput.value = '';
            this.style.display = 'none';
            searchGames('');
            searchInput.focus();
        });
    }
}

function searchGames(query) {
    const gameCards = document.querySelectorAll('.game-card-compact');
    const lowerQuery = query.toLowerCase();

    gameCards.forEach(card => {
        const gameName = card.querySelector('.game-details h4')?.textContent.toLowerCase() || '';
        const provider = card.querySelector('.game-provider')?.textContent.toLowerCase() || '';

        const matches = gameName.includes(lowerQuery) || provider.includes(lowerQuery);

        if (query === '' || matches) {
            card.style.display = 'block';
            card.style.opacity = '1';
        } else {
            card.style.opacity = '0';
            setTimeout(() => {
                if (card.style.opacity === '0') {
                    card.style.display = 'none';
                }
            }, 200);
        }
    });

    // Show "no results" message if needed
    updateNoResultsMessage(query);
}

function updateNoResultsMessage(query) {
    const sections = document.querySelectorAll('.provider-games-section');

    sections.forEach(section => {
        const visibleCards = section.querySelectorAll('.game-card-compact[style*="display: block"], .game-card-compact:not([style*="display: none"])');
        const grid = section.querySelector('.provider-games-grid');

        // Check if any cards are visible
        let hasVisible = false;
        section.querySelectorAll('.game-card-compact').forEach(card => {
            if (card.style.display !== 'none') {
                hasVisible = true;
            }
        });

        // Show/hide section based on visible cards
        section.style.display = hasVisible || query === '' ? 'block' : 'none';
    });
}

/* ============================================
   GAME CARDS
   ============================================ */
function initGameCards() {
    const gameCards = document.querySelectorAll('.game-card-compact');

    gameCards.forEach(card => {
        // Play button click
        const playBtn = card.querySelector('.play-btn-circle');
        if (playBtn) {
            playBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                const gameName = card.querySelector('.game-details h4')?.textContent || 'Game';
                // Track live casino game
                var imgEl = card.querySelector('.game-img') || card.querySelector('img');
                trackRecentGame({
                    name: gameName,
                    image: imgEl ? imgEl.src : '',
                    provider: '',
                    category: 'live-casino',
                    rtp: '',
                    tag: '',
                    playUrl: 'live-casino-play.html'
                });
                launchGame(gameName);
            });
        }

        // Card click
        card.addEventListener('click', function () {
            const gameName = this.querySelector('.game-details h4')?.textContent || 'Game';
            // Track live casino game
            var imgEl = this.querySelector('.game-img') || this.querySelector('img');
            trackRecentGame({
                name: gameName,
                image: imgEl ? imgEl.src : '',
                provider: '',
                category: 'live-casino',
                rtp: '',
                tag: '',
                playUrl: 'live-casino-play.html'
            });
            launchGame(gameName);
        });

        // Touch hover effect for mobile
        card.addEventListener('touchstart', function () {
            this.classList.add('touch-active');
        });

        card.addEventListener('touchend', function () {
            this.classList.remove('touch-active');
        });
    });
}

/* ============================================
   SLOT GAME CARDS - Click to play
   ============================================ */
function initSlotGameCards() {
    // Only activate on slots page
    var isSlotPage = window.location.pathname.indexOf('slots.html') !== -1;
    if (!isSlotPage) return;

    var providerParam = '';
    var urlParams = new URLSearchParams(window.location.search);
    providerParam = urlParams.get('provider') || '';

    // Add click handlers to all .game-card elements in the games grid
    var gameCards = document.querySelectorAll('.all-games-grid .game-card');
    gameCards.forEach(function (card) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function (e) {
            // Don't interfere if clicking a link inside the card
            if (e.target.closest('a')) return;

            var gameName = card.querySelector('.game-info h4');
            var name = gameName ? gameName.textContent.trim() : 'Slot Game';
            var url = 'slot-play.html?game=' + encodeURIComponent(name);
            if (providerParam) {
                url += '&provider=' + encodeURIComponent(providerParam);
            }

            // Track to recent games
            var gd = extractGameDataFromCard(card, 'slots', providerParam);
            gd.playUrl = url;
            trackRecentGame(gd);

            window.location.href = url;
        });

        // Play button inside the card
        var playBtn = card.querySelector('.play-btn');
        if (playBtn) {
            playBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                var gameName = card.querySelector('.game-info h4');
                var name = gameName ? gameName.textContent.trim() : 'Slot Game';
                var url = 'slot-play.html?game=' + encodeURIComponent(name);
                if (providerParam) {
                    url += '&provider=' + encodeURIComponent(providerParam);
                }

                // Track to recent games
                var gd = extractGameDataFromCard(card, 'slots', providerParam);
                gd.playUrl = url;
                trackRecentGame(gd);

                window.location.href = url;
            });
        }
    });
}

/* ============================================
   FISH HUNT GAME CARDS - Click to play
   ============================================ */
function initFishHuntGameCards() {
    var isFishHuntPage = window.location.pathname.indexOf('fish-hunt.html') !== -1;
    if (!isFishHuntPage) return;

    var urlParams = new URLSearchParams(window.location.search);
    var providerParam = urlParams.get('provider') || '';

    var gameCards = document.querySelectorAll('#fishHuntGamesGrid .game-card');
    gameCards.forEach(function (card) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function (e) {
            if (e.target.closest('a')) return;

            var gameName = card.querySelector('.game-info h4');
            var name = gameName ? gameName.textContent.trim() : 'Fish Hunt Game';
            var imgEl = card.querySelector('.game-img');
            var imgSrc = imgEl ? imgEl.src : '';
            var cardProvider = card.dataset.provider || providerParam;

            var url = 'fish-hunt-play.html?game=' + encodeURIComponent(name);
            if (cardProvider) url += '&provider=' + encodeURIComponent(cardProvider);
            if (imgSrc) url += '&image=' + encodeURIComponent(imgSrc);

            var gd = extractGameDataFromCard(card, 'fishhunt', cardProvider);
            gd.playUrl = url;
            trackRecentGame(gd);

            window.location.href = url;
        });

        var playBtn = card.querySelector('.play-btn');
        if (playBtn) {
            playBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                var gameName = card.querySelector('.game-info h4');
                var name = gameName ? gameName.textContent.trim() : 'Fish Hunt Game';
                var imgEl = card.querySelector('.game-img');
                var imgSrc = imgEl ? imgEl.src : '';
                var cardProvider = card.dataset.provider || providerParam;

                var url = 'fish-hunt-play.html?game=' + encodeURIComponent(name);
                if (cardProvider) url += '&provider=' + encodeURIComponent(cardProvider);
                if (imgSrc) url += '&image=' + encodeURIComponent(imgSrc);

                var gd = extractGameDataFromCard(card, 'fishhunt', cardProvider);
                gd.playUrl = url;
                trackRecentGame(gd);

                window.location.href = url;
            });
        }
    });
}

function launchGame(gameName) {
    // Live Casino listing: redirect to in-game page
    if (document.body.classList.contains('live-casino-listing-page')) {
        // Track to recent games
        trackRecentGame({
            name: gameName,
            image: '',
            provider: '',
            category: 'live-casino',
            rtp: '',
            tag: '',
            playUrl: 'live-casino-play.html'
        });
        window.location.href = 'live-casino-play.html';
        return;
    }

    // Add launching animation
    const overlay = document.createElement('div');
    overlay.className = 'game-launch-overlay';
    overlay.innerHTML = `
        <div class="launch-content">
            <div class="launch-spinner"></div>
            <p>Loading ${gameName}...</p>
        </div>
    `;
    document.body.appendChild(overlay);

    // Fade in
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
    });

    // Simulate loading and redirect (replace with actual game URL)
    setTimeout(() => {
        // Remove overlay
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 300);

        // In production, redirect to game
        console.log(`Launching game: ${gameName}`);
        // window.location.href = `/games/${encodeURIComponent(gameName)}`;
    }, 1500);
}

// Add launch overlay styles
const launchStyles = document.createElement('style');
launchStyles.textContent = `
    .game-launch-overlay {
        position: fixed;
        inset: 0;
        background: rgba(10, 14, 26, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .launch-content {
        text-align: center;
        color: #fff;
    }
    
    .launch-spinner {
        width: 50px;
        height: 50px;
        border: 3px solid rgba(244, 197, 66, 0.2);
        border-top-color: #f4c542;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
    }
    
    .launch-content p {
        font-size: 1rem;
        color: var(--color-text-secondary);
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    .game-card-compact.touch-active {
        transform: scale(0.98);
    }
    
    .game-card-compact.touch-active .game-overlay {
        opacity: 1;
    }
`;
document.head.appendChild(launchStyles);

/* ============================================
   INFO BANNER
   ============================================ */
function initInfoBanner() {
    const expandBtn = document.querySelector('.info-expand-btn');
    const infoBanner = document.querySelector('.game-info-banner');
    const infoText = document.querySelector('.info-text');

    if (!expandBtn || !infoBanner) return;

    // Check if we have the new structure with .info-expand-content
    const expandContent = infoBanner.querySelector('.info-expand-content');

    expandBtn.addEventListener('click', function () {
        const isExpanded = infoBanner.classList.toggle('expanded');
        this.querySelector('span').textContent = isExpanded ? 'Show Less' : 'Show More';

        // Handle legacy hardcoded text for slots if structure is missing
        if (!expandContent && window.location.pathname.includes('slots.html')) {
            const fullText = `
                <h3>Discover Online Slots at RioCity</h3>
                <p>Your ultimate guide to exciting slots! Explore hundreds of games from top providers with amazing bonuses and jackpots.</p>
                <p style="margin-top: 1rem;">At RioCity, we partner with the world's leading game providers including Pragmatic Play, PG Soft, Hacksaw Gaming, JILI, and many more. Our collection features classic fruit slots, modern video slots with stunning graphics, progressive jackpots worth millions, and innovative Megaways mechanics.</p>
                <p style="margin-top: 0.75rem;">All our games are provably fair and tested by independent auditors to ensure random outcomes. Whether you're a casual player or a high roller, we have the perfect games for you.</p>
            `;
            const shortText = `
                <h3>Experience the best Slots at RioCity</h3>
                <p>Enjoy amazing games with high RTP and big jackpots!</p>
            `;
            if (infoText) {
                infoText.innerHTML = isExpanded ? fullText : shortText;
            }
        }
    });
}

/* ============================================
   SCROLL ANIMATIONS
   ============================================ */
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe sections
    document.querySelectorAll('.provider-games-section').forEach(section => {
        section.classList.add('animate-target');
        observer.observe(section);
    });
}

// Add scroll animation styles
const scrollStyles = document.createElement('style');
scrollStyles.textContent = `
    .animate-target {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .animate-target.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(scrollStyles);

/* ============================================
   KEYBOARD NAVIGATION
   ============================================ */
document.addEventListener('keydown', function (e) {
    // Escape to close any overlays
    if (e.key === 'Escape') {
        const overlay = document.querySelector('.game-launch-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 300);
        }
    }

    // Focus search on Ctrl+K or /
    if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && document.activeElement.tagName !== 'INPUT')) {
        e.preventDefault();
        document.querySelector('.game-search-input')?.focus();
    }
});

/* ============================================
   PAGE INITIALIZATION
   ============================================ */
document.addEventListener('DOMContentLoaded', function () {
    // Initialize specific pages
    if (document.getElementById('liveCasinoPlayPage')) {
        // initWCasinoPage(); // Assuming this function exists elsewhere
    }
    if (document.querySelector('body.game-page')) {
        // Check if we are on the Slots page
        if (window.location.href.includes('slots.html')) {
            // initProviderControlBar(); // Assuming this function exists elsewhere
        }
        // Check if we are on the Sports page
        if (window.location.href.includes('sports.html')) {
            initSportsPage();
        }
    }
});

// ==========================================
// SPORTS PAGE LOGIC
// ==========================================
function initSportsPage() {
    initMatchTicker();
    // initSportCategories(); // Removed from UI
    // initFeaturedMatches(); // Replaced with static HTML from Homepage
}

function initMatchTicker() {
    const track = document.getElementById('matchTickerTrack');
    if (!track) return;

    // Simulated Live Scores
    const matches = [
        { league: 'EPL', match: 'Man City vs Liverpool', score: '2 - 1', time: '74\'' },
        { league: 'NBA', match: 'Lakers vs Warriors', score: '110 - 108', time: 'Q4' },
        { league: 'La Liga', match: 'Real Madrid vs Barcelona', score: '0 - 0', time: '12\'' },
        { league: 'Tennis', match: 'Alcaraz vs Djokovic', score: '6-4, 2-1', time: 'Set 2' },
        { league: 'Serie A', match: 'Juventus vs Milan', score: '1 - 0', time: 'HT' },
        { league: 'Esports', match: 'T1 vs Gen.G', score: '1 - 0', time: 'Game 2' }
    ];

    // Create ticker items (duplicated for infinite loop)
    const createItems = () => {
        return matches.map(m => `
            <div class="ticker-item">
                <span class="ticker-live-badge">LIVE</span>
                <span style="font-weight:600; color:#fff;">${m.league}</span>: 
                ${m.match} 
                <span class="ticker-score">${m.score}</span>
                <span style="color:#ef4444; font-size:0.8rem;">${m.time}</span>
            </div>
        `).join('');
    };

    track.innerHTML = createItems() + createItems() + createItems();
}

function initSportCategories() {
    const navItems = document.querySelectorAll('.sport-nav-item');
    const providers = document.querySelectorAll('.sports-provider-card');

    if (!navItems.length) return;

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Active State
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            const category = item.dataset.category;

            // Simple Filter Logic (Simulated mapping)
            // In a real app, providers would have data-categories="football,basketball" etc.
            // Here we randomly show/hide for demo effect, or show all if 'all'

            providers.forEach(card => {
                if (category === 'all') {
                    card.style.display = 'block';
                    setTimeout(() => card.style.opacity = '1', 50);
                } else {
                    // Simulation: Randomly filter to show "relevant" providers
                    // Ideally we should add data-sport="football" to HTML
                    const randomBool = Math.random() > 0.5;
                    if (randomBool) {
                        card.style.display = 'block';
                        setTimeout(() => card.style.opacity = '1', 50);
                    } else {
                        card.style.opacity = '0';
                        setTimeout(() => card.style.display = 'none', 300);
                    }
                }
            });
        });
    });
}

function initFeaturedMatches() {
    const grid = document.getElementById('featuredMatchesGrid');
    if (!grid) return;

    const matches = [
        {
            league: 'Premier League',
            home: 'Man City',
            away: 'Liverpool',
            homeLogo: 'https://seeklogo.com/images/M/manchester-city-fc-logo-C0F4A0A101-seeklogo.com.png',
            awayLogo: 'https://seeklogo.com/images/L/liverpool-fc-logo-F1179040D4-seeklogo.com.png',
            odds: { home: '1.95', draw: '3.50', away: '4.20' }
        },
        {
            league: 'NBA',
            home: 'Lakers',
            away: 'Warriors',
            homeLogo: 'https://seeklogo.com/images/L/los-angeles-lakers-logo-1DD2F5712E-seeklogo.com.png',
            awayLogo: 'https://seeklogo.com/images/G/golden-state-warriors-logo-AB197022C8-seeklogo.com.png',
            odds: { home: '1.80', draw: '-', away: '2.05' }
        },
        {
            league: 'Champions League',
            home: 'Real Madrid',
            away: 'Bayern',
            homeLogo: 'https://seeklogo.com/images/R/real-madrid-cf-logo-F4723049F8-seeklogo.com.png',
            awayLogo: 'https://seeklogo.com/images/F/fc-bayern-munchen-logo-3054E910B9-seeklogo.com.png',
            odds: { home: '2.10', draw: '3.40', away: '3.10' }
        }
    ];

    grid.innerHTML = matches.map(m => `
        <div class="match-card">
            <div class="match-header">
                <span class="ticker-live-badge">LIVE</span>
                <span class="match-league"><i class="fas fa-trophy"></i> ${m.league}</span>
            </div>
            <div class="match-teams">
                <div class="team">
                    <img src="${m.homeLogo}" alt="${m.home}" class="team-logo">
                    <span class="team-name">${m.home}</span>
                </div>
                <span class="match-vs">VS</span>
                <div class="team">
                    <img src="${m.awayLogo}" alt="${m.away}" class="team-logo">
                    <span class="team-name">${m.away}</span>
                </div>
            </div>
            <div class="match-odds">
                <div class="odd-btn">
                    <span class="odd-label">1</span>
                    <span class="odd-value">${m.odds.home}</span>
                </div>
                <div class="odd-btn">
                    <span class="odd-label">X</span>
                    <span class="odd-value">${m.odds.draw}</span>
                </div>
                <div class="odd-btn">
                    <span class="odd-label">2</span>
                    <span class="odd-value">${m.odds.away}</span>
                </div>
            </div>
        </div>
    `).join('');
}

/* ============================================
   LAZY LOADING ENHANCEMENT
   ============================================ */
if ('loading' in HTMLImageElement.prototype) {
    // Native lazy loading is supported
    console.log('Native lazy loading supported');
} else {
    // Fallback for browsers that don't support native lazy loading
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                imageObserver.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
}

/* ============================================
   SMOOTH SCROLL TO TOP
   ============================================ */
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show scroll-to-top button when scrolled down
window.addEventListener('scroll', function () {
    let scrollBtn = document.querySelector('.scroll-to-top');

    if (window.scrollY > 500) {
        if (!scrollBtn) {
            scrollBtn = document.createElement('button');
            scrollBtn.className = 'scroll-to-top';
            scrollBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
            scrollBtn.onclick = scrollToTop;
            document.body.appendChild(scrollBtn);

            // Add styles
            const scrollStyles = document.createElement('style');
            scrollStyles.textContent = `
                .scroll-to-top {
                    position: fixed;
                    bottom: 2rem;
                    right: 2rem;
                    width: 48px;
                    height: 48px;
                    background: linear-gradient(135deg, #f4c542 0%, #d4a52a 100%);
                    border: none;
                    border-radius: 50%;
                    color: #0a0e1a;
                    font-size: 1rem;
                    cursor: pointer;
                    opacity: 0;
                    transform: translateY(20px);
                    transition: all 0.3s ease;
                    z-index: 100;
                    box-shadow: 0 4px 20px rgba(244, 197, 66, 0.3);
                }
                
                .scroll-to-top.visible {
                    opacity: 1;
                    transform: translateY(0);
                }
                
                .scroll-to-top:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 6px 25px rgba(244, 197, 66, 0.4);
                }
            `;
            document.head.appendChild(scrollStyles);

            // Animate in
            setTimeout(() => scrollBtn.classList.add('visible'), 10);
        } else {
            scrollBtn.classList.add('visible');
        }
    } else if (scrollBtn) {
        scrollBtn.classList.remove('visible');
    }
});



