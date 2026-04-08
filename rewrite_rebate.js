const fs = require('fs');

let html = fs.readFileSync('rebate.html', 'utf8');

// 1. Strip the <style> block
html = html.replace(/<style>[\s\S]*?<\/style>/i, '');

// 2. Strip from <body ...> to <main...> and replace with site-header
html = html.replace(/<body[^>]*>[\s\S]*?<main[^>]*>/i, 
`<body class="light-theme" data-page="rebate">
    <div id="site-header"></div>
    <main class="rebate-page">`
);

// 3. Strip everything from <footer ...> to </html> and replace it
const footerReplacement = `
    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-top">
                <!-- Info Links -->
                <div class="footer-col">
                    <h4>SITE MAPS</h4>
                    <ul>
                        <li><a href="#">About Us</a></li>
                        <li><a href="#">Responsible Gaming</a></li>
                        <li><a href="#">Banking</a></li>
                        <li><a href="#">Privacy Policy</a></li>
                        <li><a href="#">Terms & Condition</a></li>
                    </ul>
                    <!-- Branding at Bottom Left -->
                    <div class="footer-logo-main">
                        <img src="images/GM88.png" alt="GM88 Logo">
                    </div>
                </div>

                <!-- Licences -->
                <div class="footer-col">
                    <h4 class="footer-title">LICENCE</h4>
                    <div class="footer-license-grid">
                        <div class="footer-license-item"><span>EGBA</span></div>
                        <div class="footer-license-item"><span>18+</span></div>
                        <div class="footer-license-item"><span>eCOGRA</span></div>
                        <div class="footer-license-item"><span>MGA</span></div>
                        <div class="footer-license-item"><span>GAMCARE</span></div>
                        <div class="footer-license-item"><span>RGA</span></div>
                    </div>
                </div>

                <!-- Providers Section (4x3 Side-Slider) -->
                <div class="footer-col footer-providers-full">
                    <h4 class="footer-title">PROVIDERS</h4>
                    <div class="footer-slider-wrapper">
                        <div class="logos-slider-track" style="animation: pageSlide 16s infinite cubic-bezier(0.85, 0, 0.15, 1);">
                            <!-- Page 1 (4x3 Grid) -->
                            <div class="logos-slider-page">
                                <img src="images/provider logo/sbobet (1)-202411061312086718.png" alt="SBOBET">
                                <img src="images/provider logo/pragmaticplay_bk.png" alt="PRAGMATIC">
                                <img src="images/provider logo/enlogo2-202504210819440598.png" alt="EVOLUTION">
                                <img src="images/provider logo/pgsoft.png" alt="PG SOFT">
                                <img src="images/provider logo/JILI.png" alt="JILI">
                                <img src="images/provider logo/spadegaming-202412121054336747.png" alt="SPADE">
                                <img src="images/provider logo/sexybaccarat (1)-202411061155483524.png" alt="SEXY">
                                <img src="images/provider logo/nextspin (3)-202508071057105641.png" alt="NEXTSPIN">
                                <img src="images/provider logo/mega888-202504251105386724.png" alt="MEGA888">
                                <img src="images/provider logo/pussy888-202505161346066923.png" alt="PUSSY888">
                                <img src="images/provider logo/redtiger-202402021533126156.png" alt="RED TIGER">
                                <img src="images/provider logo/netent-202410220745331179.png" alt="NETENT">
                            </div>
                            <!-- Page 2 (4x3 Grid) -->
                            <div class="logos-slider-page">
                                <img src="images/provider logo/allbet-202503131406399821.png" alt="ALLBET">
                                <img src="images/provider logo/cq9-202411271059545342.png" alt="CQ9">
                                <img src="images/provider logo/fachai-202411061132262463.png" alt="FACHAI">
                                <img src="images/provider logo/microgaming-202503200856328105.png" alt="MICROGAMING">
                                <img src="images/provider logo/playtech-202406041113250508.png" alt="PLAYTECH">
                                <img src="images/provider logo/wmcasino-202503190825567381.png" alt="WMCASINO">
                                <img src="images/provider logo/yblive-202503071029391162.png" alt="YBLIVE">
                                <img src="images/provider logo/jdb-202411281450014263.png" alt="JDB">
                                <img src="images/provider logo/hacksawgaming-202411121150277106.png" alt="HACKSAW">
                                <img src="images/provider logo/play\\'n go-202410220759136600.png" alt="PLAYNGO">
                                <img src="images/provider logo/sbobet (1)-202411061312086718.png" alt="SBOBET">
                                <img src="images/provider logo/pragmaticplay_bk.png" alt="PRAGMATIC">
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <div class="copyright">
            <div class="container">
                <p>COPYRIGHT &copy; GM88 2026. ALL RIGHTS RESERVED.</p>
            </div>
        </div>
    </footer>

    <!-- Mobile Bottom Navigation (App Experience) -->
    <nav class="mobile-bottom-nav">
        <div class="mobile-nav-container">
            <a href="index.html" class="mobile-nav-item active">
                <i class="fa-solid fa-house"></i>
                <span>Home</span>
            </a>
            <a href="promotion.html" class="mobile-nav-item">
                <i class="fa-solid fa-tags"></i>
                <span>Promo</span>
            </a>
            <div class="mobile-nav-fab-wrapper">
                <a href="deposit.html" class="mobile-nav-item fab">
                    <div class="fab-circle">
                        <i class="fa-solid fa-wallet"></i>
                    </div>
                </div>
            </div>
            <a href="#" class="mobile-nav-item" onclick="openLiveChat()">
                <i class="fa-solid fa-headset"></i>
                <span>Support</span>
            </a>
            <a href="account.html" class="mobile-nav-item">
                <i class="fa-solid fa-user"></i>
                <span>Profile</span>
            </a>
        </div>
    </nav>

    <script src="js/header.js?v=1.0.1"></script>
    <script src="js/main.js?v=1.0.1"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            document.querySelectorAll('.accordion-header').forEach(function (header) {
                header.addEventListener('click', function () {
                    this.closest('.accordion-item').classList.toggle('open');
                });
            });
        });
    </script>
</body>
</html>`;

html = html.replace(/<footer class="main-footer">[\s\S]*<\/html>/i, footerReplacement);

fs.writeFileSync('rebate.html', html);
console.log('Rebate structured updated successfully!');
