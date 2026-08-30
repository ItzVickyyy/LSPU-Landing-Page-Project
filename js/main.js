/* LSPU Landing Page — interaction layer: nav, header, program finder, carousel */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initHeroVideo();
  initNavDropdowns();
  initSiteDirectory();
  initScrollProgress();
  initBackToTop();
  initRevealOnScroll();
  initHeaderSearch();
  initProgramFinder();
  initAboutCarousel();
  initCampusMapModal();
  initFooter();
});

function initHeroVideo() {
  const hero = document.querySelector('.hero');
  const video = document.querySelector('.hero-background-video');
  const header = document.getElementById('header');
  if (!hero || !video) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  let activated = false;
  let activationTimer = null;

  const activateVideo = () => {
    if (activated) return;
    activated = true;

    // The video source isn't attached until now, so the ~8MB file only
    // downloads once we're actually about to play it, instead of
    // competing with everything else during initial page load.
    const src = video.dataset.src;
    if (src) {
      const source = document.createElement('source');
      source.src = src;
      source.type = 'video/mp4';
      video.appendChild(source);
      video.load();
    }

    const playPromise = video.play();

    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(() => {
          hero.classList.add('is-video-active');
          // Mirrors the hero title/subtitle treatment onto the header so
          // main-nav contents (links, dropdown carets, search icon, brand
          // text) also switch to light text while the video plays.
          if (header) header.classList.add('is-hero-video-active');
        })
        .catch(() => {
          // Keep the original hero image visible if autoplay is blocked.
          activated = false;
          hero.classList.remove('is-video-active');
          if (header) header.classList.remove('is-hero-video-active');
        });
    } else {
      hero.classList.add('is-video-active');
      if (header) header.classList.add('is-hero-video-active');
    }
  };

  activationTimer = window.setTimeout(activateVideo, 2000);

  video.addEventListener('error', () => {
    if (activationTimer) window.clearTimeout(activationTimer);
    hero.classList.remove('is-video-active');
    if (header) header.classList.remove('is-hero-video-active');
  }, { once: true });

  window.addEventListener('pagehide', () => {
    if (activationTimer) window.clearTimeout(activationTimer);
  }, { once: true });
}

function initHeader() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  const header = document.getElementById('header');
  const topbar = document.getElementById('topbar');

  if (header) {
    let ticking = false;

    const updateHeaderState = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const topbarHeight = topbar ? topbar.getBoundingClientRect().height : 0;

      // Solid once scrolling starts; pinned once the top bar has scrolled out.
      header.classList.toggle('is-scrolled', scrollY > 8);
      header.classList.toggle('is-pinned', scrollY >= Math.max(1, topbarHeight));
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateHeaderState);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateHeaderState, { passive: true });
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

  // Highlight the nav link for whichever section is currently in view.
  // Includes both plain links (href="#id") and dropdown toggles that
  // represent a section via [data-section] (e.g. the "About" button,
  // which opens a dropdown instead of linking straight to #about).
  const sectionLinks = [...nav.querySelectorAll('.nav-link')]
    .map((link) => ({
      link,
      id: link.getAttribute('href')?.replace('#', '') || link.dataset.section,
    }))
    .filter(({ id }) => id && document.getElementById(id));

  // Track every top-level page section — not just the ones with a nav
  // link — so that sections with no nav entry (e.g. the stats strip or
  // the Spotlight grid) correctly CLEAR the highlight instead of letting
  // the last-matched link stay active while scrolled somewhere else.
  const trackedSections = [...document.querySelectorAll('main > section[id]')];

  const setActive = (id) => {
    sectionLinks.forEach(({ link, id: linkId }) => {
      const active = id === linkId;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    moveNavIndicator();
  };

  if ('IntersectionObserver' in window) {
    // Sections currently inside the "active band" in the middle of the
    // viewport, most recent first — so we always highlight the one
    // closest to the top of that band, even if several overlap briefly.
    let inView = [];

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        inView = inView.filter((id) => id !== entry.target.id);
        if (entry.isIntersecting) inView.unshift(entry.target.id);
      });

      const currentId = inView[0];
      const hasLink = sectionLinks.some(({ id }) => id === currentId);
      setActive(hasLink ? currentId : null);
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });

    trackedSections.forEach((section) => observer.observe(section));
  }
}

/* Sliding underline indicator beneath the active/hovered nav item;
   recalculated on hover, active-section change, and resize. */
/* Site Directory: off-canvas full-sitemap drawer (separate from the
   primary nav's mobile menu). Handles open/close, overlay click, Escape,
   a single-open accordion (each accordion scope — the top-level group
   list, and each group's own subgroup list — allows only one item open
   at a time), and a live text filter over the sd-links entries. */
function initSiteDirectory() {
  const toggle = document.getElementById('siteDirectoryToggle');
  const closeBtn = document.getElementById('siteDirectoryClose');
  const panel = document.getElementById('siteDirectory');
  const overlay = document.getElementById('siteDirectoryOverlay');
  const search = document.getElementById('siteDirectorySearch');
  if (!toggle || !panel || !overlay) return;

  const openDirectory = () => {
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add('is-visible'));
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close site directory');
    document.body.classList.add('directory-open');
    if (search) search.focus({ preventScroll: true });
  };

  const closeDirectory = () => {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('is-visible');
    document.body.classList.remove('directory-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open site directory');
    // Wait for the slide-out transition (see .site-directory transition-
    // delay in CSS) before actually hiding the overlay, so closing looks
    // as smooth as opening instead of snapping away mid-animation.
    window.setTimeout(() => { overlay.hidden = true; }, 320);
  };

  toggle.addEventListener('click', () => {
    panel.classList.contains('is-open') ? closeDirectory() : openDirectory();
  });
  closeBtn?.addEventListener('click', closeDirectory);
  overlay.addEventListener('click', closeDirectory);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && panel.classList.contains('is-open')) closeDirectory();
  });

  // Single-open accordion: every [data-sd-accordion] container is its own
  // independent scope, so opening a subgroup inside "Administration"
  // doesn't affect the other top-level groups, and vice versa.
  panel.querySelectorAll('[data-sd-accordion]').forEach((scope) => {
    const items = Array.from(scope.children).filter((el) => el.matches('[data-sd-item]'));
    const summaries = items
      .map((item) => item.querySelector(':scope > .sd-group-summary, :scope > .sd-subgroup-summary'))
      .filter(Boolean);

    summaries.forEach((summary) => {
      summary.addEventListener('click', () => {
        const willOpen = summary.getAttribute('aria-expanded') !== 'true';
        summaries.forEach((s) => s.setAttribute('aria-expanded', 'false'));
        summary.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      });
    });
  });

  // Live filter: matching links stay visible; groups/subgroups containing
  // a match open automatically, everything else collapses out of view.
  if (search) {
    const groups = Array.from(panel.querySelectorAll('.sd-group'));

    search.addEventListener('input', () => {
      const query = search.value.trim().toLowerCase();

      groups.forEach((group, index) => {
        let groupHasMatch = false;
        const groupSummary = group.querySelector(':scope > .sd-group-summary');

        group.querySelectorAll('.sd-links li').forEach((item) => {
          const matches = query === '' || item.textContent.toLowerCase().includes(query);
          item.classList.toggle('is-hidden', !matches);
          if (matches) groupHasMatch = true;
        });

        group.classList.toggle('is-hidden', query !== '' && !groupHasMatch);

        if (query !== '') {
          groupSummary?.setAttribute('aria-expanded', groupHasMatch ? 'true' : 'false');
          group.querySelectorAll('.sd-subgroup').forEach((sub) => {
            const subSummary = sub.querySelector(':scope > .sd-subgroup-summary');
            const subHasMatch = Array.from(sub.querySelectorAll('.sd-links li')).some((li) => !li.classList.contains('is-hidden'));
            subSummary?.setAttribute('aria-expanded', subHasMatch ? 'true' : 'false');
          });
        } else {
          groupSummary?.setAttribute('aria-expanded', index === 0 ? 'true' : 'false');
          group.querySelectorAll('.sd-subgroup-summary').forEach((s) => s.setAttribute('aria-expanded', 'false'));
        }
      });
    });
  }
}

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

/* Nav dropdowns: hover-intent on desktop, click/Enter toggle on touch +
   keyboard. On mobile the same markup becomes an accordion. */
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

    // Hover-intent only on real-pointer devices above the mobile breakpoint.
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

/* Thin progress bar reflecting scroll position. */
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

/* Floating back-to-top button; appears past the hero, smooth-scrolls up. */
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

/* Fade/slide-up reveal on scroll; elements stay revealed once shown. */
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

/* Header search toggle — expands an input beside the search icon itself,
   growing outward from the icon's position, rather than dropping a panel
   below the nav. Click the icon (or Escape / click outside) to close. */
function initHeaderSearch() {
  const wrap = document.getElementById('headerSearchWrap');
  const toggle = document.getElementById('searchToggle');
  const panel = document.getElementById('headerSearch');
  const input = document.getElementById('headerSearchInput');
  if (!wrap || !toggle || !panel || !input) return;

  const openSearch = () => {
    panel.classList.add('is-open');
    toggle.classList.add('is-active');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close search');
    input.tabIndex = 0;
    input.focus();
  };

  const closeSearch = ({ refocusToggle = false } = {}) => {
    panel.classList.remove('is-open');
    toggle.classList.remove('is-active');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open search');
    input.tabIndex = -1;
    if (refocusToggle) toggle.focus();
  };

  toggle.addEventListener('click', () => {
    panel.classList.contains('is-open') ? closeSearch() : openSearch();
  });

  document.addEventListener('click', (event) => {
    if (!panel.classList.contains('is-open')) return;
    if (event.target.closest('.header-search')) return;
    closeSearch();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && panel.classList.contains('is-open')) closeSearch({ refocusToggle: true });
  });
}

/* -------------------------------------------------------------------------
   Program Finder — data source
   Campus -> College -> Program -> Major, expressed as a flat list of
   colleges whose programs each carry level / area-of-study / campus tags.
   Filtering (filterAcademicData) works generically off this structure, so
   adding a new campus, college, program, or major never requires new
   branching logic — only a new data entry below.
   ------------------------------------------------------------------------- */
/* Campus availability is intentionally left as `campuses: []` (no filter
   tag) for every program EXCEPT the handful where LSPU's current campus
   pages explicitly call out where a program/major is offered. An empty
   `campuses` array means "shown under All Campuses, but won't match a
   specific campus filter" — see filterAcademicData() and the campus
   note above renderCollegeList() usage. Institute of Agricultural
   Engineering (IAE, Siniloan) is intentionally omitted: it currently has
   no programs listed under it, so there is nothing to filter or show. */
const ACADEMIC_DATA = [
  {
    id: "agriculture",
    code: "CA",
    name: "College of Agriculture",
    programs: [
      { name: "Bachelor of Science in Agriculture", level: "undergraduate", area: "agriculture", campuses: ["siniloan"], majors: [] },
      { name: "Bachelor of Science in Agricultural Business", level: "undergraduate", area: "agriculture", campuses: ["siniloan"], majors: [] },
      { name: "Master of Science in Agriculture", level: "graduate", area: "agriculture", campuses: ["siniloan"], majors: ["Animal Science", "Crop Science"] },
      { name: "Master of Science in Agriculture Education", level: "graduate", area: "agriculture", campuses: ["siniloan"], majors: [] },
      { name: "Doctor of Philosophy in Agriculture", level: "doctorate", area: "agriculture", campuses: ["siniloan"], majors: ["Animal Science", "Crop Science"] },
    ],
  },
  {
    id: "arts-sciences",
    code: "CAS",
    name: "College of Arts and Sciences",
    programs: [
      { name: "Bachelor of Arts in Broadcasting", level: "undergraduate", area: "arts-sciences", campuses: ["santa-cruz"], majors: [] },
      { name: "Bachelor of Science in Biology", level: "undergraduate", area: "arts-sciences", campuses: ["santa-cruz", "san-pablo-city"], majors: [] },
      { name: "Bachelor of Science in Chemistry", level: "undergraduate", area: "arts-sciences", campuses: ["santa-cruz"], majors: [] },
      { name: "Bachelor of Science in Mathematics", level: "undergraduate", area: "arts-sciences", campuses: ["santa-cruz"], majors: [] },
      { name: "Bachelor of Science in Psychology", level: "undergraduate", area: "arts-sciences", campuses: ["santa-cruz", "san-pablo-city", "los-banos", "siniloan"], majors: [] },
    ],
  },
  {
    id: "business",
    code: "CBAA",
    name: "College of Business Administration and Accountancy",
    programs: [
      {
        name: "Bachelor of Science in Office Administration",
        level: "undergraduate",
        area: "business-management",
        campuses: ["santa-cruz", "san-pablo-city", "siniloan"],
        majors: ["Legal Office Procedure", "Medical Office Procedure"],
        note: "Majors are explicitly listed by LSPU for the Siniloan Campus. The Santa Cruz and San Pablo City campuses currently list the degree without majors.",
      },
      { name: "Bachelor of Science in Business Administration", level: "undergraduate", area: "business-management", campuses: ["san-pablo-city", "siniloan", "los-banos"], majors: ["Financial Management", "Marketing Management"] },
      { name: "Bachelor of Science in Entrepreneurship", level: "undergraduate", area: "business-management", campuses: ["santa-cruz"], majors: [] },
      { name: "Bachelor of Science in Accountancy", level: "undergraduate", area: "business-management", campuses: ["santa-cruz", "san-pablo-city", "siniloan", "los-banos"], majors: [] },
      { name: "Master of Public Administration", level: "graduate", area: "business-management", campuses: ["santa-cruz"], majors: [] },
    ],
  },
  {
    id: "computer-studies",
    code: "CCS",
    name: "College of Computer Studies",
    programs: [
      {
        name: "Bachelor of Science in Information Technology",
        level: "undergraduate",
        area: "information-technology",
        campuses: ["santa-cruz", "san-pablo-city", "los-banos", "siniloan"],
        majors: ["Animation and Motion Graphics", "Service Management Program", "Web and Mobile Application Development"],
        note: "Majors are explicitly listed by LSPU for the San Pablo City Campus and are available upon Third Year Standing. Other campuses currently list the degree without majors.",
      },
      {
        name: "Bachelor of Science in Computer Science",
        level: "undergraduate",
        area: "computer-science",
        campuses: ["santa-cruz", "san-pablo-city", "los-banos", "siniloan"],
        majors: ["Graphics and Visualization"],
        note: "Major is explicitly listed by LSPU for the San Pablo City Campus and is available upon Third Year Standing. Other campuses currently list the degree without majors.",
      },
      { name: "Bachelor of Science in Information System", level: "undergraduate", area: "information-technology", campuses: ["siniloan"], majors: [] },
      { name: "Master in Information Technology", level: "graduate", area: "information-technology", campuses: ["santa-cruz", "san-pablo-city", "siniloan"], majors: [] },
    ],
  },
  {
    id: "criminal-justice",
    code: "CCJE",
    name: "College of Criminal Justice Education",
    programs: [
      { name: "Bachelor of Science in Criminology", level: "undergraduate", area: "criminal-justice", campuses: ["santa-cruz", "san-pablo-city", "los-banos", "siniloan"], majors: [] },
    ],
  },
  {
    id: "engineering",
    code: "COE",
    name: "College of Engineering",
    programs: [
      { name: "Bachelor of Science in Agricultural and Biosystems Engineering", level: "undergraduate", area: "engineering", campuses: ["siniloan"], majors: [] },
      { name: "Bachelor of Science in Civil Engineering", level: "undergraduate", area: "engineering", campuses: ["santa-cruz"], majors: [] },
      { name: "Bachelor of Science in Computer Engineering", level: "undergraduate", area: "engineering", campuses: ["santa-cruz", "san-pablo-city", "siniloan"], majors: [] },
      { name: "Bachelor of Science in Electrical Engineering", level: "undergraduate", area: "engineering", campuses: ["santa-cruz", "san-pablo-city"], majors: [] },
      { name: "Bachelor of Science in Electronics Engineering", level: "undergraduate", area: "engineering", campuses: ["santa-cruz", "san-pablo-city"], majors: [] },
      { name: "Bachelor of Science in Mechanical Engineering", level: "undergraduate", area: "engineering", campuses: ["santa-cruz", "siniloan"], majors: [] },
      {
        name: "Bachelor of Science in Industrial Technology",
        level: "undergraduate",
        area: "engineering",
        campuses: ["santa-cruz", "siniloan"],
        majors: [],
        note: "Offered as a general program (no majors) under the College of Engineering at the Santa Cruz and Siniloan campuses. The San Pablo City Campus offers this degree separately under the College of Industrial Technology (CIT) with named majors — see that entry below.",
      },
    ],
  },
  {
    id: "fisheries",
    code: "COF",
    name: "College of Fisheries",
    programs: [
      { name: "Bachelor of Science in Fisheries", level: "undergraduate", area: "fisheries", campuses: ["los-banos"], majors: [] },
      { name: "Bachelor of Science in Agri-Fisheries Business Management", level: "undergraduate", area: "fisheries", campuses: ["los-banos"], majors: [] },
      { name: "Bachelor of Science in Fishery Education", level: "undergraduate", area: "fisheries", campuses: ["los-banos"], majors: [] },
    ],
  },
  {
    id: "food-nutrition",
    code: "CFND",
    name: "College of Food, Nutrition and Dietetics",
    programs: [
      {
        name: "Bachelor of Science in Food Technology",
        level: "undergraduate",
        area: "food-nutrition",
        campuses: ["los-banos"],
        majors: [],
        note: "Currently listed under Los Baños Campus. The Siniloan college page currently shows CFND but does not display programs underneath it.",
      },
      {
        name: "Bachelor of Science in Nutrition and Dietetics",
        level: "undergraduate",
        area: "food-nutrition",
        campuses: ["los-banos"],
        majors: [],
        note: "Currently listed under Los Baños Campus. The Siniloan college page currently shows CFND but does not display programs underneath it.",
      },
    ],
  },
  {
    id: "industrial-technology",
    code: "CIT",
    name: "College of Industrial Technology",
    programs: [
      {
        name: "Bachelor of Science in Industrial Technology",
        level: "undergraduate",
        area: "industrial-technology",
        campuses: ["san-pablo-city"],
        majors: ["Automotive Technology", "Architectural Drafting", "Electrical Technology", "Electronics Technology", "Food and Beverage Preparation and Service Management Technology", "Heating, Ventilating, Air-Conditioning and Refrigeration Technology"],
        note: "Majors are explicitly listed on LSPU’s current San Pablo City program page.",
      },
    ],
  },
  {
    id: "hospitality-tourism",
    code: "CIHTM",
    name: "College of International Hospitality and Tourism Management",
    programs: [
      { name: "Bachelor of Science in Hospitality Management", level: "undergraduate", area: "hospitality-tourism", campuses: ["santa-cruz", "san-pablo-city", "siniloan"], majors: [] },
      { name: "Bachelor of Science in Tourism Management", level: "undergraduate", area: "hospitality-tourism", campuses: ["santa-cruz", "san-pablo-city", "siniloan"], majors: [] },
      {
        name: "Bachelor of Science in Hotel and Restaurant Management",
        level: "undergraduate",
        area: "hospitality-tourism",
        campuses: ["los-banos"],
        majors: [],
        note: "Distinct degree title used specifically at the Los Baños Campus, separate from Bachelor of Science in Hospitality Management offered elsewhere.",
      },
      {
        name: "Bachelor of Science in Tourism",
        level: "undergraduate",
        area: "hospitality-tourism",
        campuses: ["los-banos"],
        majors: [],
        note: "Distinct degree title used specifically at the Los Baños Campus, separate from Bachelor of Science in Tourism Management offered elsewhere.",
      },
    ],
  },
  {
    id: "law",
    code: "COL",
    name: "College of Law",
    programs: [
      { name: "Juris Doctor", level: "graduate", area: "law", campuses: ["santa-cruz"], majors: [] },
    ],
  },
  {
    id: "nursing",
    code: "CONAH",
    name: "College of Nursing and Allied Health",
    programs: [
      { name: "Bachelor of Science in Nursing", level: "undergraduate", area: "nursing-health", campuses: ["santa-cruz"], majors: [] },
    ],
  },
  {
    id: "education",
    code: "CTE",
    name: "College of Teacher Education",
    programs: [
      {
        name: "Bachelor of Secondary Education",
        level: "undergraduate",
        area: "education",
        campuses: ["santa-cruz", "san-pablo-city", "los-banos", "siniloan"],
        majors: ["English", "Filipino", "Mathematics", "Science / General Science", "Social Science", "MAPEH", "Technology and Livelihood Education", "Values Education"],
        note: "The full major list is a combination of what each campus lists individually — not every major is necessarily offered at every campus.",
      },
      {
        name: "Bachelor of Elementary Education",
        level: "undergraduate",
        area: "education",
        campuses: ["santa-cruz", "san-pablo-city", "los-banos", "siniloan"],
        majors: [],
        note: "The Los Baños Campus offers this as a Special Program with two areas of specialization: General Elementary Education and Pre-Elementary Education.",
      },
      { name: "Bachelor of Early Childhood Education", level: "undergraduate", area: "education", campuses: ["siniloan"], majors: [] },
      { name: "Bachelor of Physical Education", level: "undergraduate", area: "education", campuses: ["santa-cruz", "san-pablo-city", "siniloan"], majors: [] },
      { name: "Bachelor of Technology and Livelihood Education", level: "undergraduate", area: "education", campuses: ["santa-cruz", "san-pablo-city", "siniloan"], majors: ["Home Economics", "Industrial Arts"] },
      { name: "Bachelor of Technical Vocational Teacher Education", level: "undergraduate", area: "education", campuses: ["santa-cruz", "san-pablo-city", "siniloan"], majors: ["Electrical Technology", "Electronics Technology", "Food and Service Management", "Garments, Fashion and Design", "Agricultural Crops Production"] },
      { name: "Certificate in Teaching Proficiency", level: "certificate", area: "education", campuses: ["san-pablo-city", "los-banos"], majors: [] },
      { name: "Intensive Course in English Proficiency", level: "certificate", area: "education", campuses: ["los-banos"], majors: [] },
      { name: "Doctor of Education", level: "doctorate", area: "education", campuses: ["santa-cruz", "san-pablo-city"], majors: [] },
      { name: "Master of Arts in Teaching English", level: "graduate", area: "education", campuses: ["santa-cruz"], majors: [] },
      { name: "Master of Arts in Education", level: "graduate", area: "education", campuses: ["santa-cruz", "san-pablo-city", "siniloan"], majors: ["Educational Management", "English", "Filipino", "Guidance and Counseling", "Mathematics", "Physical Education", "Science and Technology", "Social Studies", "Technology and Livelihood Education", "Technology and Home Economics"] },
      { name: "Doctor of Philosophy in Education", level: "doctorate", area: "education", campuses: ["san-pablo-city", "siniloan"], majors: ["English Language Education", "Edukasyong Pangwika sa Filipino", "Mathematics Education", "Science Education", "Educational Management", "Educational Leadership and Management"] },
    ],
  },
];

const PF_LEVEL_LABELS = { undergraduate: 'Undergraduate', graduate: 'Graduate', doctorate: 'Doctorate', certificate: 'Certificate / Short Course' };
const PF_CAMPUS_LABELS = { 'santa-cruz': 'Santa Cruz', 'san-pablo-city': 'San Pablo City', 'los-banos': 'Los Baños', siniloan: 'Siniloan' };

/* Reads the three selects and normalizes both the empty placeholder and
   the explicit "All ..." option down to `null` (meaning "no filter"). */
function getProgramFinderSelection(level, area, campus) {
  const normalize = (value) => (!value || value === 'all' ? null : value);
  return {
    level: normalize(level.value),
    area: normalize(area.value),
    campus: normalize(campus.value),
  };
}

/* NOTE: the Program Finder results modal (#pfResultsModal) no longer has
   its own bespoke "College -> Programs -> Majors" list renderer. It reuses
   renderCollegeList() / buildCollegeProgramsList() below — the same
   directory-row design as the (now modal-only) Colleges & Programs grid —
   so the two never visually diverge. */

/* Compares the selection against ACADEMIC_DATA and returns only the
   colleges (and, within them, only the programs) that match — majors are
   carried along with their parent program. No per-combination branching:
   every filter is a single generic field comparison. */
function filterAcademicData(selection) {
  return ACADEMIC_DATA
    .map((college) => ({
      ...college,
      programs: college.programs.filter((program) => {
        if (selection.level && program.level !== selection.level) return false;
        if (selection.area && program.area !== selection.area) return false;
        if (selection.campus && !program.campuses.includes(selection.campus)) return false;
        return true;
      }),
    }))
    .filter((college) => college.programs.length > 0);
}

/* Icon markup for the College and Programs cards, keyed by college id.
   A generic fallback icon is used for any college id that doesn't have a
   dedicated illustration, so new colleges can be added to ACADEMIC_DATA
   without also requiring new markup here. */
const COLLEGE_ICONS = {
  engineering: `
    <svg viewBox="0 0 40 40" role="img" focusable="false">
      <circle cx="20" cy="20" r="18" fill="var(--color-blue-050)"></circle>
      <g fill="var(--color-blue-700)">
        <rect x="18" y="7" width="4" height="6" rx="1"></rect>
        <rect x="18" y="27" width="4" height="6" rx="1"></rect>
        <rect x="7" y="18" width="6" height="4" rx="1"></rect>
        <rect x="27" y="18" width="6" height="4" rx="1"></rect>
        <rect x="10.5" y="10.5" width="4" height="6" rx="1" transform="rotate(45 12.5 13.5)"></rect>
        <rect x="25.5" y="10.5" width="4" height="6" rx="1" transform="rotate(-45 27.5 13.5)"></rect>
        <rect x="10.5" y="23.5" width="4" height="6" rx="1" transform="rotate(-45 12.5 26.5)"></rect>
        <rect x="25.5" y="23.5" width="4" height="6" rx="1" transform="rotate(45 27.5 26.5)"></rect>
        <circle cx="20" cy="20" r="7"></circle>
      </g>
      <circle cx="20" cy="20" r="3" fill="var(--color-blue-050)"></circle>
    </svg>`,
  business: `
    <svg viewBox="0 0 40 40" role="img" focusable="false">
      <circle cx="20" cy="20" r="18" fill="var(--color-blue-050)"></circle>
      <rect x="10" y="17" width="20" height="13" rx="2" fill="var(--color-blue-700)"></rect>
      <rect x="16" y="12" width="8" height="6" rx="1.5" fill="none" stroke="var(--color-blue-700)" stroke-width="2.2"></rect>
      <rect x="10" y="21" width="20" height="3" fill="var(--color-gold-500)"></rect>
    </svg>`,
  education: `
    <svg viewBox="0 0 40 40" role="img" focusable="false">
      <circle cx="20" cy="20" r="18" fill="var(--color-blue-050)"></circle>
      <polygon points="20,11 33,17 20,23 7,17" fill="var(--color-blue-700)"></polygon>
      <rect x="17" y="23" width="6" height="8" fill="var(--color-blue-900)"></rect>
      <circle cx="31" cy="19.5" r="1.8" fill="var(--color-gold-500)"></circle>
      <line x1="31" y1="19.5" x2="31" y2="25" stroke="var(--color-gold-500)" stroke-width="1.6"></line>
    </svg>`,
  'computer-studies': `
    <svg viewBox="0 0 40 40" role="img" focusable="false">
      <circle cx="20" cy="20" r="18" fill="var(--color-blue-050)"></circle>
      <rect x="9" y="11" width="22" height="15" rx="1.5" fill="var(--color-blue-700)"></rect>
      <rect x="12" y="14" width="16" height="9" fill="var(--color-blue-050)"></rect>
      <rect x="16" y="27" width="8" height="2.5" fill="var(--color-blue-900)"></rect>
      <rect x="13" y="29.5" width="14" height="2.2" rx="1" fill="var(--color-blue-900)"></rect>
    </svg>`,
};

const COLLEGE_ICON_FALLBACK = `
  <svg viewBox="0 0 40 40" role="img" focusable="false">
    <circle cx="20" cy="20" r="18" fill="var(--color-blue-050)"></circle>
    <path d="M20 10 34 17 20 24 6 17Z" fill="var(--color-blue-700)"></path>
    <path d="M12 20.5v6.5c0 2 3.6 3.6 8 3.6s8-1.6 8-3.6v-6.5" fill="none" stroke="var(--color-blue-700)" stroke-width="2"></path>
  </svg>`;

/* Builds the College -> Programs -> Majors list markup for a single
   college. Shared by the College Detail modal (full program list for one
   college) — kept generic on `programs` so it doesn't depend on a
   specific college object shape. */
function buildCollegeProgramsList(programs) {
  const programList = document.createElement('ul');
  programList.className = 'college-programs';

  programs.forEach((program) => {
    const item = document.createElement('li');
    item.className = 'college-program';

    const row = document.createElement('div');
    row.className = 'college-program-row';

    const programName = document.createElement('span');
    programName.className = 'college-program-name';
    programName.textContent = program.name;
    row.appendChild(programName);

    const level = document.createElement('span');
    level.className = 'college-program-level';
    level.textContent = PF_LEVEL_LABELS[program.level] || program.level;
    row.appendChild(level);

    item.appendChild(row);

    const campusLabels = (program.campuses || []).map((c) => PF_CAMPUS_LABELS[c] || c).join(', ');
    if (campusLabels) {
      const campusesEl = document.createElement('span');
      campusesEl.className = 'college-program-campuses';
      campusesEl.textContent = campusLabels;
      item.appendChild(campusesEl);
    }

    if (program.majors && program.majors.length) {
      const majorsWrap = document.createElement('div');
      majorsWrap.className = 'college-majors';

      const majorsLabel = document.createElement('span');
      majorsLabel.className = 'college-majors-label';
      majorsLabel.textContent = 'Majors';
      majorsWrap.appendChild(majorsLabel);

      program.majors.forEach((major) => {
        const majorItem = document.createElement('span');
        majorItem.className = 'college-major-item';
        majorItem.textContent = major;
        majorsWrap.appendChild(majorItem);
      });

      item.appendChild(majorsWrap);
    }

    if (program.note) {
      const noteEl = document.createElement('p');
      noteEl.className = 'college-program-note';
      noteEl.textContent = program.note;
      item.appendChild(noteEl);
    }

    programList.appendChild(item);
  });

  return programList;
}

/* Renders the simplified College and Programs grid — one card per college
   (icon, acronym, name, a short peek of program names, "View Programs")
   from the same filtered `matches` used for the Program Finder. Full
   detail for a given college is left to #collegeDetailModal, opened by
   the row's "View Programs" trigger (see initProgramFinder()), instead
   of rendering every program and major inline. Shows a "No matching
   programs found." message when nothing matches.

   Deliberately a compact single-line-per-college list rather than a card
   grid: with 13 colleges, a grid of icon+peek cards produced 3-4 full
   rows of near-identical cards (most colleges share the same fallback
   icon) and felt like information overload. A directory-style list scans
   much faster at this count — code badge, name, and program count is
   enough to decide whether to open a college; the full picture lives in
   #collegeDetailModal. */
function renderCollegeList(container, emptyMessage, matches) {
  if (!container) return;
  container.innerHTML = '';

  if (!matches.length) {
    container.hidden = true;
    if (emptyMessage) emptyMessage.hidden = false;
    return;
  }

  container.hidden = false;
  if (emptyMessage) emptyMessage.hidden = true;

  matches.forEach((college) => {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'college-row';
    row.setAttribute('data-college', college.id);
    row.setAttribute('data-view-college', college.id);
    row.setAttribute('aria-haspopup', 'dialog');
    row.setAttribute('aria-label', `View programs for ${college.name}`);

    if (college.code) {
      const code = document.createElement('span');
      code.className = 'college-row-code';
      code.textContent = college.code;
      code.setAttribute('aria-hidden', 'true');
      row.appendChild(code);
    }

    const text = document.createElement('span');
    text.className = 'college-row-text';

    const name = document.createElement('span');
    name.className = 'college-row-name';
    name.textContent = college.name;
    text.appendChild(name);

    const count = document.createElement('span');
    count.className = 'college-row-count';
    const programCount = college.programs.length;
    count.textContent = `${programCount} Program${programCount === 1 ? '' : 's'}`;
    text.appendChild(count);

    row.appendChild(text);

    const chevron = document.createElement('span');
    chevron.className = 'college-row-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    chevron.innerHTML = '<svg viewBox="0 0 20 20" focusable="false"><path d="M7.5 4.5 13 10l-5.5 5.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
    row.appendChild(chevron);

    container.appendChild(row);
  });
}

/* Minimal modal controller shared by the Program Finder results modal and
   the College Detail modal below — overlay click, close button, Escape,
   a basic focus trap, and returning focus to whatever triggered the open.
   (#campusMapModal has its own copy of this in initCampusMapModal()
   above since it also has to swap an iframe src on open/close.) */
function createSiteModal(modal, overlay, closeBtn) {
  if (!modal || !overlay || !closeBtn) return null;
  let lastTrigger = null;

  const open = (trigger) => {
    lastTrigger = trigger || null;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    closeBtn.focus();
  };

  const close = () => {
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastTrigger) lastTrigger.focus();
  };

  overlay.addEventListener('click', close);
  closeBtn.addEventListener('click', close);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) close();
  });

  modal.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab' || modal.hidden) return;
    const focusable = modal.querySelectorAll('button, [href], select, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  return { open, close };
}

/* Program Finder — dependent dropdowns (Level unlocks Area unlocks
   Campus), plus live, no-reload filtering. Every change to any field
   re-filters ACADEMIC_DATA once; the filtered list drives the college
   directory list rendered into the Program Finder results modal (opened
   by "Find Your Program") and, from there, the per-college detail modal,
   so everything stays synchronized from a single source of truth. The
   Colleges & Programs section no longer shows this list inline on the
   page — it only ever appears inside the results modal. */
function initProgramFinder() {
  const level = document.getElementById('pfLevel');
  const area = document.getElementById('pfArea');
  const campus = document.getElementById('pfCampus');
  const findBtn = document.getElementById('pfFindBtn');
  const resetBtn = document.getElementById('pfResetBtn');
  const collegeGrid = document.getElementById('programsGrid');
  const collegeEmptyMessage = document.getElementById('programsEmptyMessage');
  if (!level || !area || !campus) return;

  const resultsModal = createSiteModal(
    document.getElementById('pfResultsModal'),
    document.getElementById('pfResultsModalOverlay'),
    document.getElementById('pfResultsModalClose'),
  );
  const resultsModalSubtitle = document.getElementById('pfResultsModalSubtitle');
  const resultsResetLink = document.getElementById('pfResultsResetLink');

  const collegeModal = createSiteModal(
    document.getElementById('collegeDetailModal'),
    document.getElementById('collegeDetailModalOverlay'),
    document.getElementById('collegeDetailModalClose'),
  );
  const collegeModalBody = document.getElementById('collegeDetailModalBody');
  const collegeModalTitle = document.getElementById('collegeDetailModalTitle');
  const collegeModalIcon = document.getElementById('collegeDetailModalIcon');

  const AREA_LOCKED_LABEL = 'Select a Program Level first';
  const AREA_UNLOCKED_LABEL = 'All Areas of Study';
  const CAMPUS_LOCKED_LABEL = 'Select an Area of Study first';
  const CAMPUS_UNLOCKED_LABEL = 'All Campuses';

  const setPlaceholder = (select, text) => {
    const placeholder = select.querySelector('option[value=""]');
    if (placeholder) placeholder.textContent = text;
  };

  const lockField = (select, placeholderText) => {
    select.disabled = true;
    select.setAttribute('aria-disabled', 'true');
    select.value = '';
    setPlaceholder(select, placeholderText);
  };

  const unlockField = (select, placeholderText) => {
    select.disabled = false;
    select.removeAttribute('aria-disabled');
    setPlaceholder(select, placeholderText);
  };

  // Kept in sync by refresh() below so the "View More" click handler
  // (delegated on collegeGrid) always looks up the college a user is
  // currently seeing, not a stale unfiltered copy.
  let currentMatches = [];

  const describeSelection = (selection) => {
    const parts = [];
    if (selection.level) parts.push(PF_LEVEL_LABELS[selection.level] || selection.level);
    if (selection.area) parts.push(document.querySelector(`#pfArea option[value="${selection.area}"]`)?.textContent || selection.area);
    if (selection.campus) parts.push(PF_CAMPUS_LABELS[selection.campus] || selection.campus);
    return parts.length ? parts.join(' \u00b7 ') : 'All programs across LSPU campuses';
  };

  const refresh = () => {
    const selection = getProgramFinderSelection(level, area, campus);
    currentMatches = filterAcademicData(selection);
    if (resultsModalSubtitle) resultsModalSubtitle.textContent = describeSelection(selection);
    // Same renderer, same markup, whether it's building the results modal's
    // college list or (formerly) the on-page grid — the two never diverge.
    renderCollegeList(collegeGrid, collegeEmptyMessage, currentMatches);
  };

  const resetFilters = () => {
    level.value = '';
    lockField(area, AREA_LOCKED_LABEL);
    lockField(campus, CAMPUS_LOCKED_LABEL);
    refresh();
  };

  level.addEventListener('change', () => {
    if (level.value) {
      unlockField(area, AREA_UNLOCKED_LABEL);
    } else {
      lockField(area, AREA_LOCKED_LABEL);
    }
    lockField(campus, CAMPUS_LOCKED_LABEL);
    refresh();
  });

  area.addEventListener('change', () => {
    if (area.value) {
      unlockField(campus, CAMPUS_UNLOCKED_LABEL);
    } else {
      lockField(campus, CAMPUS_LOCKED_LABEL);
    }
    refresh();
  });

  campus.addEventListener('change', refresh);

  // Results now live in a modal — the same college-directory design used
  // by the (modal-only) Colleges & Programs list — so the panel itself
  // never grows the page, and nothing appears until the user actually
  // asks for it.
  findBtn?.addEventListener('click', () => {
    refresh();
    resultsModal?.open(findBtn);
  });

  resetBtn?.addEventListener('click', () => {
    resetFilters();
    level.focus();
  });

  // "Reset the Program Finder" inside the empty-results state: clears the
  // filters and drops the user back on the panel instead of leaving them
  // in a modal that (now) has nothing to show.
  resultsResetLink?.addEventListener('click', () => {
    resetFilters();
    resultsModal?.close();
    level.focus();
  });

  // "View More" on any college row opens the College Detail modal with
  // that one college's full program/major list, instead of expanding
  // everything inline. Delegated so it keeps working after every
  // renderCollegeList() re-render.
  collegeGrid?.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-view-college]');
    if (!trigger) return;

    const collegeId = trigger.getAttribute('data-view-college');
    const college = currentMatches.find((c) => c.id === collegeId);
    if (!college || !collegeModal) return;

    if (collegeModalTitle) collegeModalTitle.textContent = college.name;
    if (collegeModalIcon) collegeModalIcon.innerHTML = COLLEGE_ICONS[college.id] || COLLEGE_ICON_FALLBACK;
    if (collegeModalBody) {
      collegeModalBody.innerHTML = '';
      collegeModalBody.appendChild(buildCollegeProgramsList(college.programs));
    }

    collegeModal.open(trigger);
  });

  // Initial render: no selections yet, so every college/program is
  // available and ready inside the results modal the moment it's opened
  // (the modal itself only appears once the user clicks "Find Your
  // Program").
  refresh();
}

/* About-section carousel; autoplay pauses on hover/focus and respects
   prefers-reduced-motion. */
function initAboutCarousel() {
  const root = document.querySelector('.about-carousel');
  const track = document.getElementById('aboutCarouselTrack');
  const prevBtn = document.getElementById('aboutCarouselPrev');
  const nextBtn = document.getElementById('aboutCarouselNext');
  const dotsWrap = document.getElementById('aboutCarouselDots');
  if (!root || !track || !prevBtn || !nextBtn || !dotsWrap) return;

  const slides = [...track.children];
  const dots = [...dotsWrap.children];
  if (!slides.length) return;

  let index = 0;
  let autoplayTimer = null;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const render = () => {
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === index);
      dot.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
  };

  const goTo = (next) => {
    index = (next + slides.length) % slides.length;
    render();
  };

  const startAutoplay = () => {
    if (reduceMotion) return;
    stopAutoplay();
    autoplayTimer = setInterval(() => goTo(index + 1), 5000);
  };

  const stopAutoplay = () => {
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = null;
  };

  prevBtn.addEventListener('click', () => { goTo(index - 1); startAutoplay(); });
  nextBtn.addEventListener('click', () => { goTo(index + 1); startAutoplay(); });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); startAutoplay(); });
  });

  root.addEventListener('mouseenter', stopAutoplay);
  root.addEventListener('mouseleave', startAutoplay);
  root.addEventListener('focusin', stopAutoplay);
  root.addEventListener('focusout', startAutoplay);

  render();
  startAutoplay();
}

function initFooter() {
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* Campus location modal — triggered by each campus card's map-pin icon.
   Builds a keyless Google Maps embed URL from the trigger's data-map-query
   and swaps it into the iframe each time the modal opens. Handles overlay
   click, close button, Escape, and returns focus to the trigger on close. */
function initCampusMapModal() {
  const modal = document.getElementById('campusMapModal');
  const overlay = document.getElementById('campusMapModalOverlay');
  const closeBtn = document.getElementById('campusMapModalClose');
  const frame = document.getElementById('campusMapModalFrame');
  const titleEl = document.getElementById('campusMapModalTitle');
  const triggers = document.querySelectorAll('[data-campus-map]');
  if (!modal || !overlay || !closeBtn || !frame || !titleEl || !triggers.length) return;

  let lastTrigger = null;

  const openModal = (trigger) => {
    lastTrigger = trigger;
    const query = trigger.getAttribute('data-map-query') || '';
    const name = trigger.getAttribute('data-campus-name') || 'Campus Location';

    titleEl.textContent = name;
    frame.src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

    modal.hidden = false;
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };

  const closeModal = () => {
    if (modal.hidden) return;
    modal.hidden = true;
    frame.src = '';
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    if (lastTrigger) lastTrigger.focus();
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => openModal(trigger));
  });

  overlay.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) closeModal();
  });

  // Basic focus trap while the modal is open.
  modal.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab' || modal.hidden) return;
    const focusable = modal.querySelectorAll('button, [href], iframe');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}