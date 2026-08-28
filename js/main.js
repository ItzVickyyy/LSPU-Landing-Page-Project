/* LSPU Landing Page — interaction layer
   Handles the mobile nav menu, active-link highlighting on scroll,
   nav dropdowns + sliding indicator, scroll progress bar, back-to-top,
   reveal-on-scroll animations, and the footer's copyright year. */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initNavDropdowns();
  initScrollProgress();
  initBackToTop();
  initRevealOnScroll();
  initFooter();
});

function initHeader() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  const header = document.getElementById('header');

  // Transparent-over-hero header that gains a solid background + shadow
  // once the user scrolls past the hero (DLSU-style). The CSS for
  // `.is-scrolled` already existed but nothing was ever toggling it —
  // this was the "no background at all" bug.
  if (header) {
    let ticking = false;
    const SCROLL_THRESHOLD = 40;

    const updateHeaderState = () => {
      header.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateHeaderState);
    }, { passive: true });

    updateHeaderState();
  }

  if (!toggle || !nav) return;

  const closeMenu = () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('menu-open');
  };

  const openMenu = () => {
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    document.body.classList.add('menu-open');
  };

  toggle.addEventListener('click', () => {
    nav.classList.contains('is-open') ? closeMenu() : openMenu();
  });

  nav.querySelectorAll('.nav-link:not(.nav-dropdown-toggle), .nav-dropdown-link, .nav-cta-mobile a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  // Close the mobile menu automatically if the viewport grows into desktop size
  const desktopQuery = window.matchMedia('(min-width: 1024px)');
  desktopQuery.addEventListener('change', (event) => {
    if (event.matches) closeMenu();
  });

  // Highlight the nav link for whichever section is currently in view
  const sectionLinks = [...nav.querySelectorAll('.nav-link')]
    .map((link) => ({ link, id: link.getAttribute('href')?.replace('#', '') }))
    .filter(({ id }) => id && document.getElementById(id));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        sectionLinks.forEach(({ link, id }) => {
          const active = id === entry.target.id;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'page');
          else link.removeAttribute('aria-current');
        });
        moveNavIndicator();
      });
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });

    sectionLinks.forEach(({ id }) => observer.observe(document.getElementById(id)));
  }
}

/* Sliding underline indicator beneath the active/hovered top-level nav
   item, DLSU-style. Recalculates on hover, on active-section change,
   and on resize so it stays aligned with the right link. */
function moveNavIndicator(targetLink) {
  const nav = document.getElementById('mainNav');
  const indicator = document.getElementById('navIndicator');
  if (!nav || !indicator) return;

  const link = targetLink || nav.querySelector('.nav-link.is-active') || nav.querySelector('.nav-item.has-dropdown.is-open .nav-dropdown-toggle');
  if (!link || window.matchMedia('(max-width: 1023px)').matches) {
    indicator.classList.remove('is-visible');
    return;
  }

  const navRect = nav.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();
  indicator.style.width = `${linkRect.width}px`;
  indicator.style.transform = `translateX(${linkRect.left - navRect.left}px)`;
  indicator.classList.add('is-visible');
}

function initNavIndicatorEvents() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;

  nav.querySelectorAll('.nav-link, .nav-dropdown-toggle').forEach((el) => {
    el.addEventListener('mouseenter', () => moveNavIndicator(el));
  });

  nav.addEventListener('mouseleave', () => moveNavIndicator());

  window.addEventListener('resize', () => moveNavIndicator());
}

/* Nav dropdowns ("About" / "Admissions"): hover-intent open on desktop
   pointers, click/Enter toggle for touch + keyboard, closes on outside
   click, Escape, or when another dropdown opens. On mobile the same
   markup becomes an in-place accordion inside the off-canvas menu. */
function initNavDropdowns() {
  const items = document.querySelectorAll('.nav-item.has-dropdown');
  if (!items.length) return;

  let hoverTimer = null;

  const closeAll = (except) => {
    items.forEach((item) => {
      if (item === except) return;
      item.classList.remove('is-open');
      item.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
    });
    if (!except) moveNavIndicator();
  };

  const openItem = (item) => {
    closeAll(item);
    item.classList.add('is-open');
    item.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'true');
    moveNavIndicator(item.querySelector('.nav-dropdown-toggle'));
  };

  items.forEach((item) => {
    const toggle = item.querySelector('.nav-dropdown-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      isOpen ? closeAll() : openItem(item);
    });

    // Hover-intent: only on devices with a real pointer (skip touch), and
    // only above the mobile off-canvas breakpoint.
    item.addEventListener('mouseenter', () => {
      if (!window.matchMedia('(hover: hover) and (min-width: 1024px)').matches) return;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => openItem(item), 80);
    });

    item.addEventListener('mouseleave', () => {
      if (!window.matchMedia('(hover: hover) and (min-width: 1024px)').matches) return;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => closeAll(), 150);
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.nav-item.has-dropdown')) closeAll();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAll();
  });

  initNavIndicatorEvents();
}

/* Thin progress bar across the top of the viewport reflecting how far
   down the page the user has scrolled. */
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;

  let ticking = false;

  const update = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });

  update();
}

/* Floating back-to-top button that appears after scrolling past the
   hero and smooth-scrolls the page back up on click. */
function initBackToTop() {
  const button = document.getElementById('backToTop');
  if (!button) return;

  const toggleVisibility = () => {
    button.classList.toggle('is-visible', window.scrollY > 600);
  };

  window.addEventListener('scroll', toggleVisibility, { passive: true });
  toggleVisibility();

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* Fade/slide-up reveal for content blocks as they enter the viewport.
   Elements keep their revealed state once shown (no re-hiding on scroll
   back up) to avoid distracting flicker while reading. */
function initRevealOnScroll() {
  const targets = document.querySelectorAll('.reveal, .reveal-stagger');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  targets.forEach((el) => observer.observe(el));
}

function initFooter() {
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}