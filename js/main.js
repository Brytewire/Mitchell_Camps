  // Nav scroll state
  const nav = document.getElementById('siteNav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });

  // Mobile menu toggle
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  menuToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.14 });
  revealEls.forEach(el => io.observe(el));

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Stats bar count-up: numbers count from 0 to their real value the first
  // time the stats bar enters view. Skipped (numbers just show as-is) for
  // prefers-reduced-motion.
  const statNums = document.querySelectorAll('.stats .num');
  if (statNums.length && !prefersReducedMotion) {
    const counters = Array.from(statNums).map((el) => {
      const raw = el.textContent.trim();
      const m = raw.match(/^(\d+)(\D*)$/);
      if (!m) return null;
      const digits = m[1].length;
      const target = parseInt(m[1], 10);
      const suffix = m[2] || '';
      el.textContent = '0'.padStart(digits, '0') + suffix;
      return { el, target, digits, suffix, raw };
    }).filter(Boolean);

    const statsSection = document.querySelector('.stats');
    const statIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        counters.forEach(({ el, target, digits, suffix, raw }) => {
          const duration = 1950;
          const start = performance.now();
          (function tick(now) {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            if (p < 1) {
              el.textContent = String(Math.round(eased * target)).padStart(digits, '0') + suffix;
              requestAnimationFrame(tick);
            } else {
              el.textContent = raw;
            }
          })(start);
        });
        statIO.unobserve(statsSection);
      });
    }, { threshold: 0.4 });
    statIO.observe(statsSection);
  }

  // Offering headline typewriter: types out the "full-service camp" line
  // the first time it enters view. Skipped for prefers-reduced-motion.
  const typeTarget = document.querySelector('.offering .section-head h2');
  if (typeTarget && !prefersReducedMotion) {
    const fullText = typeTarget.textContent.trim();
    typeTarget.textContent = '';
    typeTarget.setAttribute('aria-label', fullText);
    typeTarget.classList.add('typing');

    const typeIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        let i = 0;
        (function typeChar() {
          if (i <= fullText.length) {
            typeTarget.textContent = fullText.slice(0, i);
            i++;
            setTimeout(typeChar, 26);
          } else {
            typeTarget.classList.remove('typing');
          }
        })();
        typeIO.unobserve(typeTarget);
      });
    }, { threshold: 0.5 });
    typeIO.observe(typeTarget);
  }

  // Hero first-scroll reveal: on load the hero is a clear image with no
  // overlay/copy (see .hero-pending in style.css). The first wheel/touch/key
  // gesture is captured and replayed as a reveal animation instead of a
  // page scroll; once it finishes, scrolling behaves normally again.
  (() => {
    const hero = document.querySelector('.hero.hero-pending');
    if (!hero) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || window.scrollY > 0 || window.location.hash) {
      hero.classList.remove('hero-pending');
      return;
    }

    document.body.classList.add('hero-locked');
    let revealing = false;
    let revealed = false;

    // Any same-page anchor link (nav, CTA buttons, footer) clicked while
    // still locked should unlock immediately so the jump isn't swallowed.
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', () => {
        if (revealed) return;
        document.body.classList.remove('hero-locked');
        hero.classList.remove('hero-pending', 'hero-revealing');
        revealed = true;
      });
    });

    const opts = { passive: false };

    function revealHero(e) {
      if (revealed) return;
      if (e) e.preventDefault();
      if (revealing) return;
      revealing = true;
      hero.classList.remove('hero-pending');
      hero.classList.add('hero-revealing');
      window.setTimeout(() => {
        document.body.classList.remove('hero-locked');
        hero.classList.remove('hero-revealing');
        revealed = true;
        window.removeEventListener('wheel', revealHero, opts);
        window.removeEventListener('touchmove', revealHero, opts);
        window.removeEventListener('keydown', onKey);
      }, 1150);
    }

    function onKey(e) {
      if (['ArrowDown', 'PageDown', ' ', 'Spacebar'].includes(e.key)) revealHero(e);
    }

    window.addEventListener('wheel', revealHero, opts);
    window.addEventListener('touchmove', revealHero, opts);
    window.addEventListener('keydown', onKey);
  })();
