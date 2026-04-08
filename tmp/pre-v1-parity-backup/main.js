document.addEventListener('DOMContentLoaded', () => {
    const cardSports = document.getElementById('card-sports');
    const cardCasino = document.getElementById('card-casino');
    const cardSlots = document.getElementById('card-slots');
    // Hero Carousel Logic
    const track = document.querySelector('.hero-track');
    if (track) {
        const slides = Array.from(document.querySelectorAll('.hero-slide'));
        const dots = Array.from(document.querySelectorAll('.dot'));
        const nextBtn = document.querySelector('.hero-next');
        const prevBtn = document.querySelector('.hero-prev');

        let currentIndex = 1;

        const updateCarousel = () => {
            // Reset all slides
            slides.forEach((slide) => {
                slide.className = 'hero-slide';
            });

            // Calculate active, prev, and next indices
            const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
            const nextIndex = (currentIndex + 1) % slides.length;

            slides[currentIndex].classList.add('active');
            slides[prevIndex].classList.add('prev');
            slides[nextIndex].classList.add('next');

            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        };

        nextBtn?.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % slides.length;
            updateCarousel();
        });

        prevBtn?.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateCarousel();
        });

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentIndex = index;
                updateCarousel();
            });
        });

        updateCarousel();

        // Auto Slide
        setInterval(() => {
            currentIndex = (currentIndex + 1) % slides.length;
            updateCarousel();
        }, 5000);
    }

    // Using the hero banner variation for other sections too
    if (cardSports) cardSports.style.backgroundImage = 'url(images/hero_banner_messi_1772600305612.png)';
    if (cardCasino) cardCasino.style.backgroundImage = 'url(images/casino_card_1772600334349.png)';
    if (cardSlots) cardSlots.style.backgroundImage = 'url(images/slots_card_1772600320817.png)';

    // Balance Refresh Spin Animation (runs when header component has loaded)
    function initBalanceRefresh() {
        const refreshBtn = document.querySelector('.balance-refresh');
        const currencySpan = document.querySelector('.currency');
        if (!refreshBtn || !currencySpan) return;
        refreshBtn.addEventListener('click', function () {
            this.style.transition = 'none';
            this.style.transform = 'rotate(0deg)';

            setTimeout(() => {
                this.style.transition = 'transform 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                this.style.transform = 'rotate(360deg)';

                // Simulate balance fetch
                currencySpan.style.opacity = '0.5';
                setTimeout(() => {
                    const newBal = (Math.random() * 1000).toFixed(2);
                    currencySpan.textContent = newBal;
                    currencySpan.style.color = '#fff';
                    currencySpan.style.opacity = '1';

                    setTimeout(() => {
                        currencySpan.style.color = '#ffd700';
                    }, 300);
                }, 800);
            }, 50);
        });
    }
    document.addEventListener('DOMContentLoaded', initBalanceRefresh);
    document.addEventListener('headerLoaded', initBalanceRefresh);

    // Interactive button hover effects (parallax-ish)
    const btns = document.querySelectorAll('.btn-primary');
    btns.forEach(btn => {
        btn.addEventListener('mousemove', function (e) {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            btn.style.setProperty('--x', `${x}px`);
            btn.style.setProperty('--y', `${y}px`);
        });
    });

    // Shared game card component: normalize legacy grids to slots-style cards.
    function normalizeGameCardGrids() {
        const grids = document.querySelectorAll('.game-cards-grid');
        if (!grids.length) return;

        const badgeCycle = ['hot', 'new', 'jackpot'];
        const multiplierCycle = ['1000X', '500X', '400X', '2500X', '39000X', '51000X'];

        grids.forEach((grid) => {
            grid.classList.add('rio-game-grid');

            const cards = Array.from(grid.querySelectorAll('.game-item'));
            cards.forEach((card, idx) => {
                // Skip if this card has already been converted.
                if (card.classList.contains('rio-card')) return;

                const thumb = card.querySelector('.game-thumb');
                const thumbStyle = thumb?.getAttribute('style') || '';
                const imgMatch = thumbStyle.match(/url\((['"]?)(.*?)\1\)/i);
                const imageUrl = imgMatch?.[2] || '';

                const title = card.querySelector('.game-details h4')?.textContent?.trim() || 'Game';
                const provider = card.querySelector('.provider-label')?.textContent?.trim() || 'Provider';
                const rtpText = card.querySelector('.rtp-badge')?.textContent?.replace(/^RTP\s*/i, '').trim() || '96.00%';

                const badgeType = badgeCycle[idx % badgeCycle.length];
                const badgeLabel = badgeType === 'hot' ? 'HOT' : badgeType === 'new' ? 'NEW' : 'JACKPOT';
                const multiplier = multiplierCycle[idx % multiplierCycle.length];

                card.className = 'rio-card';
                card.innerHTML = `
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
            });
        });
    }

    normalizeGameCardGrids();
});
