/* ============================================================
   VIP FANCY — JS layer (drop-in, additive, easily removable)
     • Drifting gold-dust particle background
     • Hero background parallax on mouse
     • Tier-button 3D tilt on hover
     • Cards use vip-fx classes for static layout (no scroll reveal)
     • Count-up animation for big number values (re-runs on
       tier switch via MutationObserver)
   ============================================================ */
(function () {
  'use strict';
  if (document.body.dataset.page !== 'vip') return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1) Gold-dust particles ---------- */
  if (!reduceMotion) {
    const canvas = document.createElement('canvas');
    canvas.id = 'vipFancyParticles';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    const COUNT = 18;
    const particles = [];
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.2 + 0.3,
        vy: -(Math.random() * 0.3 + 0.08),
        vx: (Math.random() - 0.5) * 0.2,
        a: Math.random() * 0.35 + 0.15,
        tw: Math.random() * Math.PI * 2
      });
    }

    (function tick() {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.tw += 0.04;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        const alpha = p.a * (0.55 + 0.45 * Math.sin(p.tw));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245, 207, 60, ' + alpha + ')';
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(245, 207, 60, 0.6)';
        ctx.fill();
      }
      requestAnimationFrame(tick);
    })();

    window.addEventListener('resize', () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    });
  }

  /* ---------- 2) Hero background parallax ---------- */
  document.addEventListener('mousemove', (e) => {
    const bg = document.querySelector('.vip-hero-bg-img');
    if (!bg) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 8;
    const y = (e.clientY / window.innerHeight - 0.5) * 8;
    bg.style.transform = 'translate(' + x + 'px, ' + y + 'px) scale(1.03)';
  });

  /* ---------- 3) Tier-button 3D tilt ---------- */
  if (!reduceMotion) {
    document.querySelectorAll('.vip-level-btn').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        btn.style.transform =
          'perspective(800px) rotateY(' + (x * 4) + 'deg) rotateX(' + (-y * 4) + 'deg) scale(1.015)';
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- 4) Cards: visible immediately (no scroll reveal) ---------- */
  const revealEls = document.querySelectorAll(
    '.vip-hero-card, .vip-info-card, .vip-priority-card, .vip-faq-card'
  );
  revealEls.forEach((el) => {
    el.classList.add('vip-fx-reveal', 'vip-fx-visible');
  });

  /* ---------- 5) Count-up for big numeric values ---------- */
  // The value cells are re-rendered by inline JS on tier switch, so we
  // (a) animate any present on initial load, and
  // (b) watch each container with MutationObserver for re-renders.
  function animateNumber(el) {
    if (reduceMotion) return;
    if (el.dataset.vipFxAnimated === '1') return;
    const raw = el.textContent.trim();
    if (!/^\d{1,3}(,\d{3})+$/.test(raw)) return; // only "X,XXX" / "X,XXX,XXX" etc.
    const target = parseInt(raw.replace(/,/g, ''), 10);
    if (!target) return;

    el.dataset.vipFxAnimated = '1';
    const duration = 1100;
    const start = performance.now();
    (function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.floor(eased * target).toLocaleString();
      if (t < 1) requestAnimationFrame(step);
    })(performance.now());
  }

  function animateAllValues(root) {
    (root || document).querySelectorAll('.vip-info-value').forEach(animateNumber);
  }

  // Initial pass — give the inline JS a tick to populate
  setTimeout(() => animateAllValues(), 80);

  // Watch each list container; reset the "animated" flag whenever its
  // children get replaced, then run again.
  ['membershipBenefits', 'memberRebates', 'upgradeRequirements',
   'retentionRequirements', 'membershipRenewal'].forEach((id) => {
    const node = document.getElementById(id);
    if (!node) return;
    const mo = new MutationObserver(() => {
      // wait briefly so the row-enter animation has a beat to start
      setTimeout(() => animateAllValues(node), 60);
    });
    mo.observe(node, { childList: true });
  });

  /* ---------- 6) Mobile: scroll active tier into view ---------- */
  function scrollActiveTierIntoView() {
    if (window.innerWidth > 768) return;
    const rail = document.getElementById('vipLevelSelector');
    const active = rail && rail.querySelector('.vip-level-btn.active');
    if (!rail || !active) return;
    const railRect   = rail.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    const offset = (activeRect.left - railRect.left)
                 - (rail.clientWidth / 2)
                 + (active.offsetWidth / 2);
    rail.scrollTo({ left: rail.scrollLeft + offset, behavior: 'smooth' });
  }
  // Initial center after layout settles
  setTimeout(scrollActiveTierIntoView, 120);
  // Re-center whenever a tier button is clicked
  document.querySelectorAll('.vip-level-btn').forEach((btn) => {
    btn.addEventListener('click', () => setTimeout(scrollActiveTierIntoView, 30));
  });
})();
