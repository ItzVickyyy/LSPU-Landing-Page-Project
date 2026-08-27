/* LSPU Landing Page — interaction and visual enhancement layer */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initVisualAssets();
  initSectionLabels();
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

  nav.querySelectorAll('.nav-link, .nav-cta-mobile a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  const mobileQuery = window.matchMedia('(min-width: 1024px)');
  mobileQuery.addEventListener('change', (event) => {
    if (event.matches) closeMenu();
  });

  // Highlight the section currently in view without changing the existing navigation structure.
  const sectionLinks = [...nav.querySelectorAll('.nav-link')]
    .map((link) => ({ link, id: link.getAttribute('href')?.replace('#', '') }))
    .filter(({ id }) => id && document.getElementById(id));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      sectionLinks.forEach(({ link, id }) => {
        const active = id === entry.target.id;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });

  sectionLinks.forEach(({ id }) => observer.observe(document.getElementById(id)));
}

function initVisualAssets() {
  const heroMedia = document.querySelector('.hero-media');
  if (heroMedia) {
    const heroImage = document.createElement('img');
    heroImage.src = 'Assets/Hero/Hero.jpg';
    heroImage.alt = 'LSPU campus placeholder image';
    heroImage.loading = 'eager';
    heroMedia.prepend(heroImage);
  }

  const campusImages = {
    'Santa Cruz': 'Assets/Campuses/SC.png',
    'San Pablo City': 'Assets/Campuses/SPCS.png',
    'Los Baños': 'Assets/Campuses/LBC.png',
    'Siniloan': 'Assets/Campuses/SCS.png'
  };

  document.querySelectorAll('.campus-card').forEach((card) => {
    const name = card.querySelector('.campus-name')?.textContent.trim();
    const path = campusImages[name];
    const media = card.querySelector('.campus-media');
    if (!path || !media) return;

    const image = document.createElement('img');
    image.src = path;
    image.alt = `${name} campus placeholder image`;
    image.loading = 'lazy';
    media.prepend(image);
  });

  // Use the existing seal asset where a real brand mark is available.
  document.querySelectorAll('.brand-mark, .footer-brand-mark').forEach((mark) => {
    const image = document.createElement('img');
    image.src = 'Assets/Branding/LSPU-Seal.png';
    image.alt = 'LSPU seal';
    image.loading = 'lazy';
    mark.replaceChildren(image);
  });
}

function initSectionLabels() {
  // The data-label values were development scaffolding. Hide them once the page has real content.
  document.querySelectorAll('[data-label]').forEach((element) => {
    element.removeAttribute('data-label');
  });
}

function initFooter() {
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}
