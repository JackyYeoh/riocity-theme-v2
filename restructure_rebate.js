const fs = require('fs');

let html = fs.readFileSync('rebate.html', 'utf8');

const containerStartToken = '<div class="container page-top">';
const mainEndToken = '        </div>\n</main>';

const containerStartIndex = html.indexOf(containerStartToken) + containerStartToken.length;
const mainEndIndex = html.lastIndexOf(mainEndToken);

const topHtml = html.substring(0, containerStartIndex);
const bottomHtml = html.substring(mainEndIndex);

const newRebateContent = `

        <!-- 1. Massive 3D Hero Claim Center -->
        <div class="rebate-hero-dashboard">
            <div class="hero-decorative">
                <!-- Using assets the user requested previously, or similar energetic 3D assets -->
                <img src="https://pksoftcdn.azureedge.net/media/prize-box-202510101415447518.png" class="hero-decor decor-top-right" alt="">
                <img src="https://pksoftcdn.azureedge.net/media/voucher-scratch-202510101415238782.png" class="hero-decor decor-bottom-left" alt="">
            </div>
            <div class="rebate-hero-main">
                <div class="hero-titles">
                    <h1 class="hero-title">Claim Your <span class="text-gradient">Rewards</span></h1>
                    <p class="hero-subtitle">Automatic daily cashback based on your VIP level.</p>
                </div>
                
                <div class="hero-claim-card">
                    <div class="claim-stats">
                        <div class="stat-group">
                            <span class="stat-label">Claimable Rebate</span>
                            <span class="stat-value text-blue">PKR 0.128</span>
                        </div>
                        <div class="stat-divider"></div>
                        <div class="stat-group">
                            <span class="stat-label">Lifetime Total</span>
                            <span class="stat-value">PKR 0.000</span>
                        </div>
                    </div>
                    <button class="btn btn-primary hero-btn" onclick="this.innerHTML='<i class=\\'fa-solid fa-spinner fa-spin\\'></i> Claiming...'">
                        <i class="fa-solid fa-gift"></i> Claim Now
                    </button>
                </div>
            </div>
        </div>

        <!-- 2. App-Like Horizontal Tabs -->
        <div class="rebate-tabs-container">
            <button class="rebate-tab active" data-target="tab-rates">Membership Rates</button>
            <button class="rebate-tab" data-target="tab-providers">Provider Rebates</button>
            <button class="rebate-tab" data-target="tab-history">My History</button>
        </div>

        <!-- 3. Tab Contents -->
        <div class="rebate-tab-contents">
            
            <!-- Tab 1: The Membership Grid -->
            <div class="tab-pane active" id="tab-rates">
                <div class="table-wrap">
                    <table class="rebate-table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>IRON</th>
                                <th>BRONZE</th>
                                <th>SILVER</th>
                                <th>GOLD</th>
                                <th>PLATINUM</th>
                                <th>DIAMOND</th>
                                <th>RUBY</th>
                                <th>TITANIUM</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><i class="fas fa-dice cat-icon"></i> <strong>Slots</strong></td>
                                <td>0.40%</td>
                                <td>0.50%</td>
                                <td>0.60%</td>
                                <td>0.70%</td>
                                <td>0.80%</td>
                                <td>0.90%</td>
                                <td>1.00%</td>
                                <td class="top-val">1.10%</td>
                            </tr>
                            <tr>
                                <td><i class="fas fa-video cat-icon"></i> <strong>Live Casino</strong></td>
                                <td>0.30%</td>
                                <td>0.40%</td>
                                <td>0.50%</td>
                                <td>0.60%</td>
                                <td>0.70%</td>
                                <td>0.80%</td>
                                <td>0.90%</td>
                                <td class="top-val">1.00%</td>
                            </tr>
                            <tr>
                                <td><i class="fas fa-futbol cat-icon"></i> <strong>Sports</strong></td>
                                <td>0.30%</td>
                                <td>0.40%</td>
                                <td>0.50%</td>
                                <td>0.60%</td>
                                <td>0.70%</td>
                                <td>0.80%</td>
                                <td>0.90%</td>
                                <td class="top-val">1.00%</td>
                            </tr>
                            <tr>
                                <td><i class="fas fa-fish cat-icon"></i> <strong>Fish Hunt</strong></td>
                                <td>0.20%</td>
                                <td>0.25%</td>
                                <td>0.30%</td>
                                <td>0.35%</td>
                                <td>0.40%</td>
                                <td>0.45%</td>
                                <td>0.50%</td>
                                <td class="top-val">0.60%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Tab 2: Provider Visual Grid -->
            <div class="tab-pane" id="tab-providers">
                
                <h3 class="provider-category-title"><i class="fas fa-dice text-blue"></i> Slots</h3>
                <div class="provider-cards-grid">
                    <!-- Card 1 -->
                    <div class="provider-rate-card">
                        <img src="images/provider logo/pragmaticplay_bk.png" alt="Pragmatic" class="provider-logo">
                        <div class="rate-badge">1.0%</div>
                    </div>
                    <!-- Card 2 -->
                    <div class="provider-rate-card">
                        <img src="images/provider logo/pgsoft.png" alt="PG Soft" class="provider-logo">
                        <div class="rate-badge">1.0%</div>
                    </div>
                    <!-- Card 3 -->
                    <div class="provider-rate-card">
                        <img src="images/provider logo/JILI.png" alt="JILI" class="provider-logo">
                        <div class="rate-badge">1.0%</div>
                    </div>
                    <!-- Card 4 -->
                    <div class="provider-rate-card">
                        <img src="images/provider logo/spadegaming-202412121054336747.png" alt="Spade" class="provider-logo">
                        <div class="rate-badge">0.8%</div>
                    </div>
                    <!-- Card 5 -->
                    <div class="provider-rate-card">
                        <img src="images/provider logo/playtech-202406041113250508.png" alt="Playtech" class="provider-logo">
                        <div class="rate-badge">0.8%</div>
                    </div>
                    <!-- Card 6 -->
                    <div class="provider-rate-card">
                        <img src="images/provider logo/netent-202410220745331179.png" alt="NetEnt" class="provider-logo">
                        <div class="rate-badge">0.9%</div>
                    </div>
                </div>

                <h3 class="provider-category-title mt-4"><i class="fas fa-video text-blue"></i> Live Casino</h3>
                <div class="provider-cards-grid">
                    <div class="provider-rate-card">
                        <img src="images/provider logo/enlogo2-202504210819440598.png" alt="Evolution" class="provider-logo">
                        <div class="rate-badge">0.5%</div>
                    </div>
                    <div class="provider-rate-card">
                        <img src="images/provider logo/sexybaccarat (1)-202411061155483524.png" alt="Sexy Baccarat" class="provider-logo">
                        <div class="rate-badge">0.5%</div>
                    </div>
                </div>

                <h3 class="provider-category-title mt-4"><i class="fas fa-futbol text-blue"></i> Sports</h3>
                <div class="provider-cards-grid">
                    <div class="provider-rate-card">
                        <img src="images/provider logo/sbobet (1)-202411061312086718.png" alt="Sbobet" class="provider-logo">
                        <div class="rate-badge">0.5%</div>
                    </div>
                </div>

            </div>

            <!-- Tab 3: History (App feel) -->
            <div class="tab-pane" id="tab-history">
                <div class="empty-history-state">
                    <div class="empty-icon-circle">
                        <i class="fa-solid fa-file-invoice-dollar"></i>
                    </div>
                    <h3>No Recent Claims</h3>
                    <p>Play your favorite games to earn automatic cashback rewards.</p>
                </div>
            </div>

        </div>

    <script>
        // Tab switching logic for the new app structure
        document.querySelectorAll('.rebate-tab').forEach(button => {
            button.addEventListener('click', () => {
                // Remove active from all tabs
                document.querySelectorAll('.rebate-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
                
                // Add active to clicked tab and its content
                button.classList.add('active');
                document.getElementById(button.dataset.target).classList.add('active');
            });
        });
    </script>
`;

fs.writeFileSync('rebate.html', topHtml + newRebateContent + bottomHtml);
console.log('Restructured rebate HTML successfully.');
