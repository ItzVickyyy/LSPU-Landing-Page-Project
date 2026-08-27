/* ==========================================================================
   LSPU Landing Page — Stage 1: JS Skeleton
   No feature logic yet — sections/behaviors will be filled in later stages.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initHero();
  initCredibility();
  initAbout();
  initPrograms();
  initCampuses();
  initNews();
  initQuickLinks();
  initFinalCta();
  initFooter();
});

function initHeader() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');

  if (!toggle || !nav) return;

  const closeMenu = () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  };

  const openMenu = () => {
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
  };

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  });

  // Close the mobile menu after a nav link is chosen
  nav.querySelectorAll('.nav-link, .nav-cta-mobile a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // Reset to desktop state if the viewport is resized past the mobile breakpoint
  const mobileQuery = window.matchMedia('(min-width: 1024px)');
  mobileQuery.addEventListener('change', (e) => {
    if (e.matches) closeMenu();
  });
}

function initHero() {
  // TODO: hero content / interactions
}

function initCredibility() {
  // TODO: accreditation / stats strip
}

function initAbout() {
  // TODO: about section content
}

function initPrograms() {
  // TODO: academic programs listing/filtering
}

function initCampuses() {
  // TODO: campuses content, map, or carousel
}

function initNews() {
  // TODO: news/announcements feed
}

function initQuickLinks() {
  // TODO: quick links grid
}

function initFinalCta() {
  // TODO: final call-to-action interactions
}

function initFooter() {
  // TODO: footer content, dynamic year, etc.
}