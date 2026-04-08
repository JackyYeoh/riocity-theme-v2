/* ============================================
   INFORMATION CENTER LOGIC
   ============================================ */
function initInfoCenter() {
    const infoTabs = document.querySelectorAll('.info-tab-btn');
    const subTabsContainer = document.getElementById('infoSubTabs');
    const contentArea = document.getElementById('infoContentArea');

    if (!infoTabs.length || !subTabsContainer || !contentArea) return;

    // Data Structure
    const infoData = {
        rules: {
            subTabs: ['General', 'Account', 'Deposits', 'Withdrawals', 'Betting'],
            content: {
                'General': `
                    <span class="info-content-title">General Rules</span>
                    <div class="info-content-body">
                        <p>1. By registering an account with RioCity, you agree to be bound by these Terms and Conditions.</p>
                        <p>2. You must be at least 18 years of age or the legal age of majority in your jurisdiction to play.</p>
                        <p>3. One account per person, household, IP address, and device is allowed. Duplicate accounts will be closed.</p>
                    </div>`,
                'Account': `
                    <span class="info-content-title">Account Rules</span>
                     <div class="info-content-body">
                        <p>1. You are responsible for maintaining the confidentiality of your account login details.</p>
                        <p>2. We reserve the right to suspend or terminate any account that violates our terms.</p>
                     </div>`,
                'Deposits': `
                    <span class="info-content-title">Deposit Rules</span>
                     <div class="info-content-body">
                        <p>1. Minimum deposit amounts apply and may vary by payment method.</p>
                        <p>2. Deposits must be made from a payment source registered in your own name.</p>
                     </div>`,
                'Withdrawals': `
                    <span class="info-content-title">Withdrawal Rules</span>
                     <div class="info-content-body">
                        <p>1. Withdrawals are processed within 5-15 minutes typical time.</p>
                        <p>2. You may be required to verify your identity before a withdrawal is approved.</p>
                     </div>`,
                'Betting': `
                    <span class="info-content-title">Betting Rules</span>
                     <div class="info-content-body">
                        <p>1. All bets are final once confirmed.</p>
                        <p>2. We reserve the right to void bets in the event of obvious errors or technical glitches.</p>
                     </div>`
            }
        },
        faq: {
            subTabs: ['Registration', 'Games', 'Banking', 'Tech Support', 'Promotions'],
            content: {
                'Registration': `
                    <span class="info-content-title">Registration FAQ</span>
                    <div class="info-content-body">
                        <h4>How do I create an account?</h4>
                        <p>Click the "Register" button at the top right corner and fill in the required details.</p>
                        <h4>Is it free to join?</h4>
                        <p>Yes, registration is completely free.</p>
                    </div>`,
                'Games': `
                    <span class="info-content-title">Games FAQ</span>
                    <div class="info-content-body">
                        <h4>Are the games fair?</h4>
                        <p>Yes, all our games use a Random Number Generator (RNG) and are audited by independent third parties.</p>
                    </div>`,
                'Banking': `
                    <span class="info-content-title">Banking FAQ</span>
                    <div class="info-content-body">
                        <h4>What payment methods do you accept?</h4>
                        <p>We accept DuitNow, TNG, SurePay, and Bank Transfers.</p>
                    </div>`,
                'Tech Support': `
                    <span class="info-content-title">Technical Support</span>
                    <div class="info-content-body">
                        <h4>The game froze, what do I do?</h4>
                        <p>Try refreshing the page. If the issue persists, contact our 24/7 Live Support.</p>
                    </div>`,
                'Promotions': `
                    <span class="info-content-title">Promotions FAQ</span>
                    <div class="info-content-body">
                        <h4>How do I claim a bonus?</h4>
                        <p>Go to the Promotions page and click "Apply" on the bonus you wish to claim.</p>
                    </div>`
            }
        },
        video: {
            subTabs: ['Tutorials', 'Game Previews', 'Winners'],
            content: {
                'Tutorials': `
                    <span class="info-content-title">Video Tutorials</span>
                    <div class="video-grid">
                        <div class="video-card">
                            <div class="video-thumbnail">
                                <img src="https://img.youtube.com/vi/aqz-KE-bpKQ/maxresdefault.jpg" alt="How to Deposit">
                                <div class="video-play-icon"><i class="fas fa-play"></i></div>
                            </div>
                            <div class="video-info">
                                <div class="video-title">How to Deposit Fast</div>
                                <div class="video-duration">0:45</div>
                            </div>
                        </div>
                        <div class="video-card">
                            <div class="video-thumbnail">
                                <img src="https://img.youtube.com/vi/ScMzIvxBSi4/maxresdefault.jpg" alt="How to Register">
                                <div class="video-play-icon"><i class="fas fa-play"></i></div>
                            </div>
                             <div class="video-info">
                                <div class="video-title">Registration Guide</div>
                                <div class="video-duration">1:20</div>
                            </div>
                        </div>
                    </div>`,
                'Game Previews': `
                     <span class="info-content-title">Game Previews</span>
                     <p>Coming soon...</p>`,
                'Winners': `
                     <span class="info-content-title">Big Winners</span>
                     <p>See our latest jackpot winners!</p>`
            }

        }
    };

    // State
    let currentMainTab = 'rules';
    let currentSubTab = infoData.rules.subTabs[0];

    // Functions
    function renderSubTabs(mainTab) {
        if (!infoData[mainTab]) return;

        const subs = infoData[mainTab].subTabs;
        subTabsContainer.innerHTML = subs.map(sub =>
            `<button class="info-sub-btn ${sub === currentSubTab ? 'active' : ''}" data-sub="${sub}">
                ${sub}
            </button>`
        ).join('');

        // Add listeners to new sub tabs
        subTabsContainer.querySelectorAll('.info-sub-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentSubTab = btn.dataset.sub;

                // Update active state visuals
                subTabsContainer.querySelectorAll('.info-sub-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                renderContent(currentMainTab, currentSubTab);
            });
        });
    }

    function renderContent(mainTab, subTab) {
        if (!infoData[mainTab] || !infoData[mainTab].content[subTab]) {
            contentArea.innerHTML = '<p>Content not found.</p>';
            return;
        }

        // Simple fade effect
        contentArea.style.opacity = '0.5';
        setTimeout(() => {
            contentArea.innerHTML = infoData[mainTab].content[subTab];
            contentArea.style.opacity = '1';
        }, 150);
    }

    // Initialize Main Tabs
    infoTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            if (tab === currentMainTab) return;

            // Update Active State
            infoTabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update State
            currentMainTab = tab;
            currentSubTab = infoData[tab].subTabs[0]; // Reset to first sub-tab

            // Render
            renderSubTabs(currentMainTab);
            renderContent(currentMainTab, currentSubTab);
        });
    });

    // Check URL params for initial tab
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && infoData[tabParam]) {
        const targetBtn = document.querySelector(`.info-tab-btn[data-tab="${tabParam}"]`);
        if (targetBtn) targetBtn.click();
    } else {
        // Initial Render
        renderSubTabs(currentMainTab);
        renderContent(currentMainTab, currentSubTab);
    }
}

// Attach to window so it can be called from HTML
window.initInfoCenter = initInfoCenter;
