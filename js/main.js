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
