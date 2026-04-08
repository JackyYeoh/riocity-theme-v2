/**
 * Load shared header component and set active nav item from body[data-page].
 * Header is inlined so it works with file:// and without a server.
 * To edit the header, update components/header.html and copy the markup here (or keep in sync).
 */
(function () {
    var placeholder = document.getElementById('site-header');
    if (!placeholder) return;

    var headerHtml = '<!-- Top Header Bar -->\
<header class="top-header">\
    <div class="container top-header-inner">\
        <div class="top-left">\
            <span class="welcome-text">Welcome <strong>testvi2</strong></span>\
            <div class="notification">\
                <i class="fa-solid fa-bell"></i>\
                <span class="badge">0</span>\
            </div>\
        </div>\
        <div class="top-right">\
            <div class="balance-box">\
                <img src="https://cdn-icons-png.flaticon.com/512/2953/2953536.png" class="coin-icon" alt="Coins">\
                <span class="currency">0.00</span>\
                <i class="fa-solid fa-chevron-down"></i>\
                <i class="fa-solid fa-rotate balance-refresh"></i>\
            </div>\
            <button class="btn btn-fund">FUND MANAGEMENT</button>\
            <button class="btn btn-logout">LOGOUT</button>\
            <div class="language-selector">\
                <img src="https://flagcdn.com/w20/gb.png" alt="English">\
                <span>EN</span>\
                <i class="fa-solid fa-chevron-down"></i>\
            </div>\
        </div>\
    </div>\
</header>\
<!-- Main Navigation -->\
<nav class="main-nav">\
    <div class="container main-nav-inner">\
        <a href="index.html" class="brand-logo">\
            <img src="images/GM88.png" alt="GM88 Logo" style="height: 55px; width: auto; object-fit: contain; margin-bottom: 8px;">\
        </a>\
        <ul class="nav-links">\
            <li data-nav="index"><a href="index.html"><i class="fa-solid fa-home"></i><span>HOME</span></a></li>\
            <li data-nav="sports"><a href="sports.html"><i class="fa-solid fa-futbol"></i><span>SPORTS</span></a></li>\
            <li data-nav="hot-games"><a href="#"><i class="fa-solid fa-fire"></i><span>HOT GAMES</span></a></li>\
            <li data-nav="live-casino"><a href="live-casino.html"><i class="fa-solid fa-dice"></i><span>LIVE CASINO</span></a></li>\
            <li data-nav="slots"><a href="slots.html"><i class="fa-solid fa-table-cells"></i><span>SLOTS</span></a></li>\
            <li data-nav="crash"><a href="crash.html"><i class="fa-solid fa-rocket"></i><span>CRASH</span></a></li>\
            <li data-nav="lottery"><a href="lottery.html"><i class="fa-solid fa-ticket"></i><span>LOTTERY</span></a></li>\
            <li data-nav="number"><a href="#"><i class="fa-solid fa-hashtag"></i><span>NUMBER</span></a></li>\
            <li data-nav="cockfight"><a href="cockfight.html"><i class="fa-solid fa-kiwi-bird"></i><span>COCKFIGHT</span></a></li>\
            <li data-nav="fishing"><a href="fishing.html"><i class="fa-solid fa-fish"></i><span>FISHING</span></a></li>\
            <li data-nav="poker"><a href="#"><i class="fa-solid fa-diamond"></i><span>POKER</span></a></li>\
            <li data-nav="promotions"><a href="#"><i class="fa-solid fa-gift"></i><span>PROMOTIONS</span></a></li>\
            <li data-nav="rewards"><a href="#"><i class="fa-solid fa-gem"></i><span>REWARDS</span></a></li>\
        </ul>\
    </div>\
</nav>';

    placeholder.innerHTML = headerHtml;
    var page = (document.body.getAttribute('data-page') || 'index').toLowerCase();
    var activeNav = placeholder.querySelector('[data-nav="' + page + '"]');
    if (activeNav) activeNav.classList.add('active');
    document.dispatchEvent(new CustomEvent('headerLoaded'));
})();
