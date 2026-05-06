/**
 * GM88 Game Lobby Shell
 *
 * Auto-wraps existing `.glc-page` pages with the redesigned hero banner
 * and (where relevant) a provider sidebar — without touching individual HTML files.
 *
 *  - Slots / Live Casino / Fish Hunt -> two-column shell with provider sidebar.
 *  - Sports / Poker -> full-width grid, no sidebar.
 *  - 'Featured Providers' duplicate sections are removed.
 *  - Clicking a provider in the sidebar swaps the right column to an inline
 *    game-thumbnail grid for that provider, with a Back button.
 */
(function () {
    if (window.__glpShellMounted) return;

    var page = (document.body.getAttribute('data-page') || '').toLowerCase();
    var glcPage = document.querySelector('.glc-page');
    if (!glcPage) return;

    /* Pages that should NOT show the provider sidebar */
    var NO_SIDEBAR_PAGES = ['sports', 'poker'];
    var hasSidebar = NO_SIDEBAR_PAGES.indexOf(page) === -1;

    var pageMeta = {
        slots: {
            tagline: 'Endless Thrills, Massive Wins',
            title: 'SLOTS',
            cta: 'Play Now',
            ctaHref: '#allProviders',
            bgImage: 'https://pksoftcdn.azureedge.net/media/slots%20(1)-202603041451104842.png',
            fallbackBg: 'linear-gradient(120deg, #2A1B5C 0%, #4B2A9E 45%, #7C3FE0 100%)'
        },
        'live-casino': {
            tagline: 'Real Dealers, Real Wins',
            title: 'LIVE CASINO',
            cta: 'Play Now',
            ctaHref: '#allProviders',
            bgImage: 'images/game page/live casino.jpg',
            fallbackBg: 'linear-gradient(120deg, #1B0A36 0%, #5A1747 45%, #C12B5C 100%)'
        },
        sports: {
            tagline: 'Bet Smart, Win Big',
            title: 'SPORTS',
            cta: 'Bet Now',
            ctaHref: '#allProviders',
            bgImage: 'images/game page/sports.jpg',
            fallbackBg: 'linear-gradient(120deg, #061633 0%, #0A3F73 45%, #1077C9 100%)'
        },
        poker: {
            tagline: 'Skill Meets Fortune',
            title: 'POKER',
            cta: 'Play Now',
            ctaHref: '#allProviders',
            bgImage: '',
            fallbackBg: 'linear-gradient(120deg, #160B2C 0%, #3B1B6A 45%, #6B2DB0 100%)'
        },
        fishing: {
            tagline: 'Catch Big Wins Daily',
            title: 'FISH HUNT',
            cta: 'Play Now',
            ctaHref: '#allProviders',
            bgImage: '',
            fallbackBg: 'linear-gradient(120deg, #062537 0%, #0B5375 45%, #14A0BD 100%)'
        }
    };

    var meta = pageMeta[page] || pageMeta.slots;

    /* Per-title thumbnails — same paths as index.html / slot-play.html so each
     * card matches its game name (no rotating generic/ranking art). */
    var SLOT_THUMB_BY_NAME = {
        'Sweet Bonanza': 'images/game/sweet-bonanza.png',
        'Gate of Olympus': 'images/game/gate-of-olympus.jpg',
        'The Dog House': 'images/game/dog-house.jpg',
        'Big Bass Bonanza': 'images/game/big bass.webp',
        'Madame Destiny': 'images/game/madame-destiny.jpg',
        'Wild West Gold': 'images/game/wild-west.jpg',
        'Starlight Princess': 'images/game/starlight.jpg',
        'Sugar Rush': 'images/game/rush.jpg',
        'Buffalo Gold Canyon': 'images/game/Buffalo Gold Canyon.jpg',
        'Coin Craze Jackpot': 'images/game/Coin Craze Jackpot.webp',
        'Le Bandit': 'images/game/Le_Bandit_Slot_Review_6608bfcebe.avif',
        'Mega Mammoth': 'images/game/Mega Mammoth Multiplier.webp',
        'Red Dragon Ways': 'images/game/Red Dragon Ways.jpg',
        'Circle of Life': 'images/game/circle-of-life-resized-to-large-1.jpeg',
        'Chicken Pirates': 'images/game/chicken-pirate-logo.webp',
        /* No dedicated asset in repo; swap when you add images/game/fortune-tiger.* */
        'Fortune Tiger': 'images/cat-banner/slot-cat.png'
    };

    var LIVE_THUMB_BY_NAME = {
        'Always 9 Baccarat': 'images/game/Always 9 Baccarat.jpg',
        'Baccarat Control Squeeze': 'images/game/Baccarat Control Squeeze.webp',
        'BlackJack Atrium': 'images/game/BlackJack Atrium C.webp',
        'Dragon Tiger': 'images/game/DragonTiger_Pragmatic.webp',
        'Mahjong Self-Drawn': 'images/game/Mahjong Self-Drawn Win 3.webp',
        'No Commission Baccarat': 'images/game/No Commission Baccarat A.png',
        'Shangri La Baccarat 6': 'images/game/Shangri La Baccarat 6.jpg',
        'Tao Yuan Baccarat 8': 'images/game/Tao Yuan Baccarat 8.jpg',
        'Speed Roulette': 'images/game/BlackJack Atrium C.webp',
        'Lightning Roulette': 'images/game/Always 9 Baccarat.jpg',
        'Crazy Time': 'images/game/Baccarat Control Squeeze.webp',
        'Monopoly Live': 'images/game/DragonTiger_Pragmatic.webp'
    };

    var FISH_THUMB_BY_NAME = {
        'Fishing God': 'images/cat-banner/slot-cat.png',
        'Fishing War': 'images/cat-banner/casino-cat.png',
        'Royal Fishing': 'images/cat-banner/poker-cat.png',
        'Mega Fishing': 'images/cat-banner/sport-cat.png',
        'Boom Legend': 'images/cat-banner/lottery-cat.png',
        'Fishing Master': 'images/game page/ranking_1.png',
        'Fish Hunting': 'images/game page/ranking_2.png',
        'Ocean Paradise': 'images/game page/ranking_3.png'
    };

    var DEFAULT_SLOT_THUMB = 'images/cat-banner/slot-cat.png';

    function thumbPathForGame(gameName) {
        var name = String(gameName || '').trim();
        var map;
        switch (page) {
            case 'live-casino': map = LIVE_THUMB_BY_NAME; break;
            case 'fishing':     map = FISH_THUMB_BY_NAME; break;
            default:            map = SLOT_THUMB_BY_NAME; break;
        }
        if (map[name]) return map[name];
        var lower = name.toLowerCase();
        for (var k in map) {
            if (k.toLowerCase() === lower) return map[k];
        }
        if (page === 'live-casino') return 'images/game/Always 9 Baccarat.jpg';
        if (page === 'fishing') return 'images/game page/ranking_1.png';
        return DEFAULT_SLOT_THUMB;
    }

    function encodePathSegments(relPath) {
        return relPath.split('/').map(function (seg) { return encodeURIComponent(seg); }).join('/');
    }

    var GAME_NAMES_SLOT = [
        'Sweet Bonanza', 'Gate of Olympus', 'The Dog House', 'Big Bass Bonanza',
        'Madame Destiny', 'Wild West Gold', 'Starlight Princess', 'Sugar Rush',
        'Buffalo Gold Canyon', 'Coin Craze Jackpot', 'Le Bandit', 'Mega Mammoth',
        'Red Dragon Ways', 'Circle of Life', 'Chicken Pirates', 'Fortune Tiger'
    ];
    var GAME_NAMES_LIVE = [
        'Always 9 Baccarat', 'Baccarat Control Squeeze', 'BlackJack Atrium',
        'Dragon Tiger', 'Mahjong Self-Drawn', 'No Commission Baccarat',
        'Shangri La Baccarat 6', 'Tao Yuan Baccarat 8', 'Speed Roulette',
        'Lightning Roulette', 'Crazy Time', 'Monopoly Live'
    ];
    var GAME_NAMES_FISH = [
        'Fishing God', 'Fishing War', 'Royal Fishing', 'Mega Fishing',
        'Boom Legend', 'Fishing Master', 'Fish Hunting', 'Ocean Paradise'
    ];

    function pickGameNames() {
        switch (page) {
            case 'live-casino': return GAME_NAMES_LIVE;
            case 'fishing':     return GAME_NAMES_FISH;
            default:            return GAME_NAMES_SLOT;
        }
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, function (ch) {
            return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[ch];
        });
    }

    /* -------------------- 1. Replace top hero banner -------------------- */
    var oldHero = document.querySelector('.promo-hero-banner');
    var bgStyle = meta.bgImage ? "background-image: url('" + meta.bgImage + "');" : '';
    var heroHtml =
        '<section class="glp-hero">' +
            '<div class="container">' +
                '<div class="glp-hero-inner" style="background:' + meta.fallbackBg + ';">' +
                    '<div class="glp-hero-bg" style="' + bgStyle + '"></div>' +
                '</div>' +
            '</div>' +
        '</section>';

    if (oldHero) {
        oldHero.outerHTML = heroHtml;
    } else {
        glcPage.insertAdjacentHTML('beforebegin', heroHtml);
    }

    /* -------------------- 2. Strip duplicate "Featured Providers" sections -------- */
    var sections = glcPage.querySelectorAll('.glc-section');
    sections.forEach(function (sec) {
        var titleEl = sec.querySelector('.glc-section-title');
        if (!titleEl) return;
        var text = (titleEl.textContent || '').trim().toLowerCase();
        if (text.indexOf('featured provider') !== -1) {
            sec.remove();
        }
    });
    var divider = glcPage.querySelector('.glc-divider');
    if (divider) divider.remove();

    /* -------------------- 3. Build the shell ----------------------------- */
    var container = glcPage.querySelector(':scope > .container');
    if (!container) return;

    var shell = document.createElement('div');
    shell.className = 'glp-shell' + (hasSidebar ? '' : ' glp-shell-full');

    if (hasSidebar) {
        var seen = Object.create(null);
        var providers = [];
        container.querySelectorAll('.glc-card').forEach(function (card) {
            var nameEl = card.querySelector('.glc-card-name');
            var rawName = card.dataset.name || (nameEl ? nameEl.textContent : '') || '';
            var name = rawName.trim();
            if (!name || seen[name]) return;
            var img = card.querySelector('.glc-card-thumb img');
            seen[name] = true;
            providers.push({
                name: name,
                iconSrc: img ? img.getAttribute('src') : ''
            });
        });

        var listHtml = providers.map(function (p) {
            var initials = p.name.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase();
            var iconInner = p.iconSrc
                ? '<img src="' + p.iconSrc + '" alt="" loading="lazy">'
                : initials;
            return (
                '<li>' +
                    '<button type="button" class="glp-provider-item" data-provider="' + escapeHtml(p.name) + '">' +
                        '<span class="glp-provider-icon">' + iconInner + '</span>' +
                        '<span class="glp-provider-name">' + escapeHtml(p.name) + '</span>' +
                        '<span class="glp-provider-status" aria-hidden="true"></span>' +
                    '</button>' +
                '</li>'
            );
        }).join('');

        var sidebarHtml =
            '<aside class="glp-sidebar" aria-label="Providers">' +
                '<h3 class="glp-sidebar-title">Providers</h3>' +
                '<div class="glp-sidebar-search">' +
                    '<i class="fa-solid fa-magnifying-glass"></i>' +
                    '<input type="search" id="glpSidebarSearch" placeholder="Search providers..." autocomplete="off">' +
                '</div>' +
                '<ul class="glp-provider-list" id="glpProviderList">' +
                    listHtml +
                '</ul>' +
                '<button type="button" class="glp-view-all-btn" id="glpViewAllBtn">View All Providers</button>' +
            '</aside>';
        shell.innerHTML = sidebarHtml + '<div class="glp-main"></div>';
    } else {
        shell.innerHTML = '<div class="glp-main"></div>';
    }

    var main = shell.querySelector('.glp-main');
    while (container.firstChild) {
        main.appendChild(container.firstChild);
    }
    container.appendChild(shell);

    /* -------------------- 4. Inline game grid ---------------------------- */
    var gamesView = null;

    function buildGamesViewFor(providerName, iconSrc) {
        var pool = pickGameNames();
        var count = 12;
        var initials = providerName.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase();
        var cardsHtml = '';
        var MULTIPLIERS = ['100X', '200X', '500X', '1000X', '2500X', '5000X', '39000X', '51000X'];
        for (var i = 0; i < count; i++) {
            var gameName = pool[i % pool.length];
            var thumbSrc = encodePathSegments(thumbPathForGame(gameName));
            var badge = '';
            if (i % 5 === 0) badge = '<span class="glp-game-badge glp-badge-hot">Hot</span>';
            else if (i % 5 === 1) badge = '<span class="glp-game-badge glp-badge-new">New</span>';
            else if (i % 5 === 2) badge = '<span class="glp-game-badge glp-badge-jackpot">Jackpot</span>';

            var mult = MULTIPLIERS[(i * 7 + providerName.length) % MULTIPLIERS.length];
            var rtp = (95 + ((i * 13 + providerName.length * 3) % 500) / 100).toFixed(2);

            cardsHtml +=
                '<a class="glp-game-card" href="slot-play.html?game=' + encodeURIComponent(gameName) +
                    '&provider=' + encodeURIComponent(providerName) + '">' +
                    '<div class="glp-game-thumb">' +
                        '<div class="glp-game-fallback">' + escapeHtml(gameName) + '</div>' +
                        '<img src="' + thumbSrc + '" alt="' + escapeHtml(gameName) + '" loading="eager" decoding="async" ' +
                        'onerror="this.style.display=\'none\'">' +
                        badge +
                        '<span class="glp-game-mult"><i class="fa-solid fa-bolt"></i> ' + mult + '</span>' +
                        '<div class="glp-game-overlay">' +
                            '<span class="glp-play-btn">Play Now</span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="glp-game-body">' +
                        '<div class="glp-game-name">' + escapeHtml(gameName) + '</div>' +
                        '<div class="glp-game-meta">' +
                            '<span class="glp-game-provider-name">' + escapeHtml(providerName) + '</span>' +
                            '<span class="glp-game-rtp"><i class="fa-solid fa-arrow-trend-up"></i> ' + rtp + '%</span>' +
                        '</div>' +
                    '</div>' +
                '</a>';
        }

        var logoInner = iconSrc
            ? '<img src="' + iconSrc + '" alt="">'
            : '<span style="font-weight:800;color:#7C5CFF;">' + initials + '</span>';

        return (
            '<section class="glp-games-view" id="glpGamesView">' +
                '<div class="glp-games-header">' +
                    '<button type="button" class="glp-back-btn" id="glpBackBtn">' +
                        '<i class="fa-solid fa-arrow-left"></i> Back' +
                    '</button>' +
                    '<div class="glp-games-provider">' +
                        '<span class="glp-games-provider-logo">' + logoInner + '</span>' +
                        '<div class="glp-games-provider-text">' +
                            '<h2>' + escapeHtml(providerName) + '</h2>' +
                            '<span>' + count + ' games available</span>' +
                        '</div>' +
                    '</div>' +
                    '<span class="glp-games-count">' + count + ' Games</span>' +
                '</div>' +
                '<div class="glp-games-grid">' + cardsHtml + '</div>' +
            '</section>'
        );
    }

    function showGamesView(providerName, iconSrc) {
        Array.prototype.forEach.call(main.children, function (child) {
            child.dataset._glpHidden = '1';
            child.style.display = 'none';
        });
        if (gamesView) gamesView.remove();
        main.insertAdjacentHTML('beforeend', buildGamesViewFor(providerName, iconSrc));
        gamesView = document.getElementById('glpGamesView');
        var backBtn = document.getElementById('glpBackBtn');
        if (backBtn) backBtn.addEventListener('click', hideGamesView);
        try {
            shell.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (e) {}
    }

    function hideGamesView() {
        if (gamesView) {
            gamesView.remove();
            gamesView = null;
        }
        Array.prototype.forEach.call(main.children, function (child) {
            if (child.dataset && child.dataset._glpHidden) {
                child.style.display = '';
                delete child.dataset._glpHidden;
            }
        });
        document.querySelectorAll('#glpProviderList .glp-provider-item').forEach(function (b) {
            b.classList.remove('active');
        });
    }

    /* -------------------- 5. Wire up sidebar interactions ---------------- */
    if (hasSidebar) {
        var sidebarSearch = document.getElementById('glpSidebarSearch');
        var providerItems = document.querySelectorAll('#glpProviderList .glp-provider-item');
        var viewAllBtn = document.getElementById('glpViewAllBtn');

        if (sidebarSearch) {
            sidebarSearch.addEventListener('input', function () {
                var q = sidebarSearch.value.trim().toLowerCase();
                providerItems.forEach(function (btn) {
                    var name = (btn.dataset.provider || '').toLowerCase();
                    btn.parentElement.style.display = (!q || name.indexOf(q) !== -1) ? '' : 'none';
                });
            });
        }

        providerItems.forEach(function (btn) {
            btn.addEventListener('click', function () {
                providerItems.forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                var iconImg = btn.querySelector('.glp-provider-icon img');
                showGamesView(btn.dataset.provider || '', iconImg ? iconImg.getAttribute('src') : '');
            });
        });

        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', function (e) {
                e.preventDefault();
                hideGamesView();
            });
        }

        /* Slots: land on a specific provider’s game grid instead of the full list */
        if (page === 'slots') {
            var defaultProv = 'VPower';
            var defaultBtn = null;
            providerItems.forEach(function (btn) {
                var p = btn.dataset.provider || '';
                if (p === defaultProv) defaultBtn = btn;
            });
            if (!defaultBtn) {
                providerItems.forEach(function (btn) {
                    var p = (btn.dataset.provider || '').toLowerCase();
                    if (p === 'vpower') defaultBtn = btn;
                });
            }
            if (defaultBtn) {
                providerItems.forEach(function (b) { b.classList.remove('active'); });
                defaultBtn.classList.add('active');
                var defIcon = defaultBtn.querySelector('.glp-provider-icon img');
                showGamesView(defaultBtn.dataset.provider || defaultProv, defIcon ? defIcon.getAttribute('src') : '');
            }
        }
    }

    /* -------------------- 6. No-sidebar pages: card click -> inline games ---- */
    if (!hasSidebar) {
        main.addEventListener('click', function (e) {
            var card = e.target.closest ? e.target.closest('.glc-card') : null;
            if (!card) return;
            e.preventDefault();
            var nameEl = card.querySelector('.glc-card-name');
            var rawName = card.dataset.name || (nameEl ? nameEl.textContent : '') || '';
            var providerName = rawName.trim();
            var img = card.querySelector('.glc-card-thumb img');
            var iconSrc = img ? img.getAttribute('src') : '';
            if (providerName) showGamesView(providerName, iconSrc);
        });
    }

    window.__glpShellMounted = true;
})();
