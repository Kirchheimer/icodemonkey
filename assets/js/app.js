/* ==========================================================================
   AIKennel — shared app JS
   1. htmx (loaded via CDN) — wired so future AI endpoints can drop in cleanly
   2. Scroll-reveal observer for cards (home page)
   3. Tab activation sync for hash-based deeplinks (case studies)
   ========================================================================== */

(function () {
    'use strict';

    // ----- htmx: future AI features (chat, summarization, search) will be
    // served as fragments that swap into hx-targets on these pages. The
    // library is loaded with the page so we don't need a build step. -----
    document.addEventListener('htmx:configRequest', function (evt) {
        // Add a small token so backend can distinguish AI requests later.
        evt.detail.headers['X-AIKennel-Page'] = document.body.dataset.page || '';
    });

    // ----- Scroll reveal for cards (home) ---------------------------------
    function initScrollReveal() {
        const cards = document.querySelectorAll('.card');
        if (!cards.length || !('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        cards.forEach(function (card) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            observer.observe(card);
        });
    }

    // ----- Tab deeplink (case studies) -----------------------------------
    function initTabs() {
        const tabBar = document.querySelector('[data-tabs]');
        if (!tabBar) return;

        const buttons = tabBar.querySelectorAll('.tab-btn');
        const panels  = document.querySelectorAll('.tab-panel');

        function activate(name) {
            buttons.forEach(function (b) {
                b.classList.toggle('active', b.dataset.tab === name);
            });
            panels.forEach(function (p) {
                p.classList.toggle('active', p.dataset.tab === name);
            });
        }

        buttons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                const name = btn.dataset.tab;
                activate(name);
                if (history.replaceState) history.replaceState(null, '', '#' + name);
            });
        });

        // Open tab from #hash on load, else first tab
        const initial = (location.hash || '').replace('#', '');
        const valid = Array.from(buttons).some(function (b) { return b.dataset.tab === initial; });
        activate(valid ? initial : (buttons[0] && buttons[0].dataset.tab));
    }

    // ----- Boot ----------------------------------------------------------
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            initScrollReveal();
            initTabs();
        });
    } else {
        initScrollReveal();
        initTabs();
    }
})();
