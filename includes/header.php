    <!-- Loading Screen -->
    <div class="loading-screen" id="loadingScreen">
        <div class="loading-content">
            <div class="loading-logo">
                <span class="logo-icon">◆</span>
                <span class="logo-text">RIOCITY</span>
            </div>
            <div class="loading-progress">
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <span class="progress-text">Loading amazing games...</span>
            </div>
            <div class="loading-spinner">
                <div class="spinner"></div>
            </div>
        </div>
    </div>

    <!-- Header -->
    <header class="main-header">
        <div class="container">
            <div class="header-left">
                <a href="index.php" class="logo">
                    <img src="https://pksoftcdn.azureedge.net/media/image 7-202411081421034166.png" alt="RioCity Logo" class="logo-img">
                    <span class="logo-icon">◆</span>
                    <span class="logo-text">RIOCITY</span>
                </a>
                <nav class="main-nav">
                    <a href="live-casino.php" class="nav-link">Live Casino</a>
                    <a href="sports.php" class="nav-link">Sports</a>
                    <a href="slots.php" class="nav-link">Slots</a>
                    <a href="promotions.php" class="nav-link">Promotions</a>
                    <a href="vip.php" class="nav-link">VIP</a>
                    <div class="nav-dropdown" id="moreGamesDropdown">
                        <div class="nav-link nav-dropdown-toggle">
                            <span>More</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="nav-dropdown-menu">
                            <a href="#" class="nav-dropdown-item">
                                <i class="fas fa-clock"></i>
                                <span>Recent Games</span>
                            </a>
                            <a href="referral.php" class="nav-dropdown-item">
                                <i class="fas fa-users"></i>
                                <span>Referral</span>
                            </a>
                            <a href="poker.php" class="nav-dropdown-item">
                                <i class="fas fa-heart"></i>
                                <span>Poker</span>
                            </a>
                            <a href="lottery.php" class="nav-dropdown-item">
                                <i class="fas fa-ticket-alt"></i>
                                <span>Lottery</span>
                            </a>
                            <a href="fish-hunt.php" class="nav-dropdown-item">
                                <i class="fas fa-fish"></i>
                                <span>Fish Hunt</span>
                            </a>
                        </div>
                    </div>
                </nav>
            </div>
            <div class="header-right">
                <button onclick="openAuthModal('loginModal')" class="btn btn-ghost">Log In</button>
                <button onclick="openAuthModal('registerModal')" class="btn btn-primary">Join Now</button>
                
                <button class="apk-download-btn desktop-only" onclick="downloadAPK()" aria-label="Download APK" title="Download APK">
                    <i class="fab fa-android"></i>
                </button>

                <button type="button" class="btn btn-ghost theme-toggle-btn desktop-only" data-theme-toggle aria-label="Toggle theme" title="Switch to light mode">
                    <i class="fas fa-sun"></i><span data-theme-toggle-label>Light Mode</span>
                </button>
                
                <!-- Language Pill -->
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
            </div>
        </div>
    </header>

    <!-- Mobile Menu -->
    <div class="mobile-menu" id="mobileMenu">
        <div class="mobile-menu-header">
            <a href="index.php" class="logo">
                <img src="https://pksoftcdn.azureedge.net/media/small-logo-202403261635077380-202405280823396360.png" alt="RioCity Logo" class="logo-img">
                <span class="logo-icon">◆</span>
                <span class="logo-text">RIOCITY</span>
            </a>
            <button class="mobile-menu-close" aria-label="Close mobile menu">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <nav class="mobile-nav">
            <div id="mobileUserSection"></div>
            <button type="button" class="mobile-nav-link mobile-theme-toggle" data-theme-toggle aria-label="Toggle theme">
                <i class="fas fa-sun"></i><span data-theme-toggle-label>Light Mode</span>
            </button>
            <!-- Bonus Items -->
            <button class="mobile-nav-link mobile-bonus-link" onclick="openBonusModal('spinWheelModal')">
                <div class="mobile-bonus-icon">
                    <img src="https://pksoftcdn.azureedge.net/media/spin wheel button-202501021417106102.svg" alt="Spin Wheel">
                </div>
                <span>Spin Wheel Bonus</span>
            </button>
            <button class="mobile-nav-link mobile-bonus-link" onclick="openBonusModal('voucherScratchModal')">
                <div class="mobile-bonus-icon">
                    <img src="https://pksoftcdn.azureedge.net/media/voucher-scratch-202510101415238782.png" alt="Voucher Scratch">
                </div>
                <span>Voucher Scratch Bonus</span>
            </button>
            <button class="mobile-nav-link mobile-bonus-link" onclick="openBonusModal('prizeBoxModal')">
                <div class="mobile-bonus-icon">
                    <img src="https://pksoftcdn.azureedge.net/media/prize-box-202510101415447518.png" alt="Prize Box">
                </div>
                <span>Prize Box Bonus</span>
            </button>
            <div class="mobile-nav-divider"></div>
            <a href="live-casino.php" class="mobile-nav-link">
                <i class="fas fa-play-circle"></i>
                <span>Live Casino</span>
            </a>
            <a href="sports.php" class="mobile-nav-link">
                <i class="fas fa-futbol"></i>
                <span>Sports</span>
            </a>
            <a href="slots.php" class="mobile-nav-link">
                <i class="fas fa-dice"></i>
                <span>Slots</span>
            </a>
            <a href="promotions.php" class="mobile-nav-link">
                <i class="fas fa-gift"></i>
                <span>Promotions</span>
            </a>
            <a href="vip.php" class="mobile-nav-link">
                <i class="fas fa-crown"></i>
                <span>VIP</span>
            </a>
            <a href="#" class="mobile-nav-link" onclick="downloadAPK()">
                <i class="fab fa-android"></i>
                <span>Download App</span>
            </a>
            <a href="referral.php" class="mobile-nav-link">
                <i class="fas fa-users"></i>
                <span>Referral</span>
            </a>
            <div class="mobile-nav-divider"></div>
            <a href="#" class="mobile-nav-link">
                <i class="fas fa-clock"></i>
                <span>Recent Games</span>
            </a>
            <a href="poker.php" class="mobile-nav-link">
                <i class="fas fa-dice"></i>
                <span>Poker</span>
            </a>
            <a href="lottery.php" class="mobile-nav-link">
                <i class="fas fa-ticket-alt"></i>
                <span>Lottery</span>
            </a>
            <a href="fish-hunt.php" class="mobile-nav-link">
                <i class="fas fa-fish"></i>
                <span>Fish Hunt</span>
            </a>
            <div class="mobile-nav-divider"></div>
            <button class="mobile-nav-link btn-login">
                <i class="fas fa-sign-in-alt"></i>
                <span>Log In</span>
            </button>
            <button class="mobile-nav-link btn-signup">
                <i class="fas fa-user-plus"></i>
                <span>Join Now</span>
            </button>
        </nav>
    </div>
