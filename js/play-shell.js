/**
 * GM88 play shell — activity tabs (Ranking / Latest bets / More games on mobile)
 */
(function () {
    function initPlayShellTabs() {
        var inner = document.querySelector('.play-shell-inner');
        if (!inner) return;

        var tabs = inner.querySelectorAll('.play-activity-tabs [data-play-tab]');
        if (!tabs.length) return;

        var panelRanking = inner.querySelector('#play-panel-ranking');
        var panelBets = inner.querySelector('#play-panel-bets');

        function setTab(id) {
            tabs.forEach(function (t) {
                var on = t.getAttribute('data-play-tab') === id;
                t.setAttribute('aria-selected', on ? 'true' : 'false');
            });

            document.body.classList.toggle('play-aside-active', id === 'recommended');

            if (panelRanking) {
                panelRanking.classList.toggle('is-active', id === 'ranking');
            }
            if (panelBets) {
                panelBets.classList.toggle('is-active', id === 'bets');
            }
            if (id === 'recommended') {
                if (panelRanking) panelRanking.classList.remove('is-active');
                if (panelBets) panelBets.classList.remove('is-active');
            }
        }

        tabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                setTab(tab.getAttribute('data-play-tab') || 'ranking');
            });
        });

        setTab('ranking');
    }

    function initPlayShellWalletSync() {
        var bal = document.getElementById('playWalletBalanceDisplay');
        if (!bal) return;
        function sync() {
            var headerBal = document.getElementById('headerWalletBalance');
            if (headerBal && headerBal.textContent.trim()) {
                var t = headerBal.textContent.trim();
                bal.textContent = (t.charAt(0) === '$' || t.indexOf('RM') === 0) ? t : '$ ' + t;
            }
        }
        sync();
        window.addEventListener('load', sync);
        setTimeout(sync, 600);
        setTimeout(sync, 1500);
    }

    function initPlayShellShared() {
        initPlayShellTabs();
        initPlayShellWalletSync();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPlayShellShared);
    } else {
        initPlayShellShared();
    }
})();
