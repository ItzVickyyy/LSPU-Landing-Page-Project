# PROJECT HANDOFF — LSPU Landing Page Redesign

**Handoff date:** August 28, 2026
**Handoff reason:** Continuing conversation on a new Claude account (context limit)
**Current phase:** Phase 3 complete (planning/decisions only) — **Phase 4 (Visual Design / implementation) has NOT started**

---

## ⚠️ READ THIS FIRST — Critical Accuracy Note

**No code has been modified in this project yet.** Phases 1–3 of this engagement were **audit, planning, and research only**. `index.html`, `css/style.css`, and `js/main.js` are still **exactly as they were in the original cloned repository** — nothing has been implemented.

What actually happened in Phases 1–3:
- Phase 1: Read and inventoried the existing repo (structure, code, assets, content).
- Phase 2: Produced a written information-architecture plan (new section order, content mapping).
- Phase 3: Researched and **verified real destination URLs** against the live `lspu.edu.ph` site and official social accounts, and made concrete UX decisions for every link, nav item, and section — but did not write any of it into the files.

**This means:** the current `index.html` still has 9 nav items, `Research & Extension` still points to `#about`, the News section still shows `[Sample]` placeholder content, the footer still has literal `[placeholder]` text, and all 35 `href="#"` links are still dead. The next Claude's job in Phase 4 is to **actually implement** the decisions documented below — not to redo the research.

---

## 1. Project Information

- **Project name:** LSPU Landing Page UX + Design Improvement
- **Repository:** https://github.com/ItzVickyyy/LSPU-Landing-Page-Project
- **Current branch:** `main` (working tree clean, no local commits, nothing pushed)
- **Current development state:** Original repository content, unmodified. Verified planning documentation exists only in this handoff and in prior conversation turns (not committed anywhere).
- **Original project goal:** Transform the existing LSPU landing page from a generic "looks like a university website" page into a cleaner, modern, student-centered landing page that prioritizes the actions and information students actually need (Apply, Admissions, Programs, Student Services, Announcements, News, Campuses) — without rebuilding the whole site or fabricating any content.

---

## 2. Completed Work

### Phase 1 — Audit (completed, findings documented)
Actually done:
- Cloned and inspected the full repo structure (`Assets/`, `css/`, `js/`, `index.html`).
- Read `index.html` in full (569 lines, 10 sections).
- Read `css/style.css` in full (~1,500 lines) — identified it has a base layer plus an appended "Visual design layer" that overrides/duplicates some rules (a cleanup target, not yet fixed).
- Read `js/main.js` in full — confirmed it's clean, minimal, and handles mobile nav toggle, Escape-to-close, active-link highlighting via IntersectionObserver, and footer year. No changes needed here architecturally.
- Inventoried all assets and confirmed they are **authentic, real LSPU photography and data**, not placeholders:
  - `Assets/Hero/Hero.jpg` — real photo of LSPU Santa Cruz main administration building.
  - `Assets/Campuses/{SC,SPCS,LBC,SCS}.png` — real campus gate photos.
  - `Assets/News/News-0{1,2,3}.jpg` — real event photos that correctly correspond to the three real news stories in `Details of News.txt`.
  - `Assets/Others/*.JPG` — 4 additional real campus building photos, currently unused, very large (5–8MB each, need compression before use).
  - `Assets/Campuses/Details.txt` — real phone/email/address per campus.
  - `Assets/Content - Data/Contents.txt` — real Vision/Mission/Quality Policy text.
  - `Assets/News/Details of News.txt` — 3 real, dated news stories (Aug 2026).
- Counted and located every `href="#"` placeholder (35 total) and all fabricated/demo content (`[Sample]` headlines, "Placeholder summary" text, visible "Demo content for layout purposes" disclaimer, footer `[placeholder]` contact spans).
- Confirmed accessibility baseline already in place: semantic HTML, `aria-label`/`aria-expanded`/`aria-controls` on nav toggle, `role="img"`/`focusable="false"` on decorative SVGs, `prefers-reduced-motion` support, `:focus-visible` states.

### Phase 2 — Information Architecture (completed, plan documented, NOT implemented)
Produced a written reorganization plan:
- New section order: Header → Hero → Student Services (moved up from position 8) → Important Announcements (new) → Academic Programs → Why LSPU (merged About + Credibility) → Campuses → News → Final CTA → Footer.
- Nav simplification plan: 9 items → `About · Academics · Admissions · Campuses · News` + distinct `Student Portal` / `Apply Now` actions.
- Decision on "Research & Extension": remove from primary nav, fold into Why LSPU section + footer with a **real** destination (resolved in Phase 3, see below) instead of the current broken `#about` link.
- Content-to-section mapping table (which existing asset/data file feeds which new section).
- Flagged open items requiring real-world verification before Phase 3 could finalize them (deadlines, portal URLs, social links, program catalog URL).

**None of this reorganization has been written into `index.html` yet.**

### Phase 3 — UX Decisions & Link Verification (completed, decisions documented, NOT implemented)
This phase did real research against the live official site and produced **verified, ready-to-use destinations**. This is the most valuable output to preserve — it prevents the next Claude from having to re-research URLs.

**Verified real URLs (confirmed via direct fetch/search against lspu.edu.ph and official social accounts):**

| Purpose | URL |
|---|---|
| Homepage | `https://lspu.edu.ph/` |
| Admissions (new students) | `https://lspu.edu.ph/page/admission-of-new-students` |
| Admission Requirements | `https://lspu.edu.ph/page/admission-requirements` |
| Academic programs (Santa Cruz/main campus courses) | `https://lspu.edu.ph/courses/scc` |
| Vision / Mission / Mandate | `https://lspu.edu.ph/page/mission-vision-and-mandate` |
| Quality Policy | `https://lspu.edu.ph/page/quality-policy` |
| Research, Development & Extension office | `https://lspu.edu.ph/office/1/vprde` |
| Library Services | `https://lspu.edu.ph/office/1/library` |
| Student e-Services hub | `https://lspu.edu.ph/page/e-service-for-students` |
| Student login / online system | `https://lspu.edu.ph/login` |
| Official Facebook | `https://www.facebook.com/LSPUOfficial/` |
| Official YouTube | `https://www.youtube.com/@LSPUOfficial` |

**Explicitly NOT found / NOT to be used (do not invent these):**
- No verified official Instagram or X/Twitter account for LSPU as a whole.
- No single university-wide "all programs" catalog page — programs are listed per campus (`/courses/scc`, `/courses/lbc`, etc.). Decision: use the main/Santa Cruz campus page as the "View All Programs" destination.
- No dedicated public "Student Handbook" page found. Decision: drop this as a standalone Quick Action item rather than fake a link; "Student e-Services" covers the underlying need.
- No dedicated public "Downloads" page found. Same decision as above — dropped rather than faked.
- No verified specific/current admissions deadline or time-sensitive dated announcement beyond the 3 general news stories already in the repo. Decision: the "Important Announcements" section should state that admissions are open and link to the real admissions page, **without inventing a specific deadline date**.
- No individual public campus landing pages beyond course-listing pages. Decision: campus card actions should show enriched info from `Details.txt` (address/phone) rather than link to a fabricated per-campus page.

**Finalized per-section decisions (documented, not yet coded):**
- **Nav:** final 5 items + Student Portal/Apply Now as described above.
- **Hero:** Apply to LSPU → real admissions URL; Explore Programs → `#programs` anchor (legitimate same-page scroll).
- **Student Services:** Admissions, Student Portal, Library, Student e-Services — each with real URLs above; Downloads/Handbook removed as standalone items.
- **Important Announcements:** real, non-fabricated framing pointing to the real admissions page.
- **Academic Programs:** keep existing 4 real program cards (Engineering, Business, Education, Computer Studies); "View All Programs" → `/courses/scc`.
- **Campuses:** keep 4 existing cards/photos, enrich with real Details.txt data; no fake "View Campus" links.
- **News:** replace all 3 `[Sample]` cards with the 3 real dated stories from `Details of News.txt`, correctly matched to News-01/02/03.jpg; remove demo disclaimer; "View All News" → homepage.
- **Footer:** simplify to Explore / Services / Connect columns; drop Governance & Transparency column; remove `[placeholder]` spans entirely; social links limited to the 2 verified accounts (Facebook, YouTube) — no fabricated Instagram/X links.

---

## 3. Current Website Structure (as it exists on disk RIGHT NOW)

This is the **unmodified, original** order — the Phase 2 reorganization has not been applied:

1. Header / Navigation
2. Hero
3. Credibility strip (SUC Level III, ISO 9001:2015, 15 Colleges & Departments, 4 Campuses)
4. About (thin, single paragraph)
5. Academic Programs (4 college cards)
6. Campuses (4 cards)
7. News (3 `[Sample]` demo cards)
8. Quick Links (LSPU Online, Library Services, Student Handbook, Downloads)
9. Final CTA
10. Footer

---

## 4. Current Navigation (as it exists on disk RIGHT NOW)

- **Nav items (9):** Home, About, Admissions (→ `#final-cta`), Academics (→ `#programs`), Campuses, **Research & Extension (→ `#about`, broken/mismatched)**, News, Contact (→ `#footer`), Student/Online Services (→ `#quick-links`)
- **CTA buttons:** "Apply Now" appears in header (desktop + mobile), and again in Final CTA — both currently point to `#final-cta` (self-referential loop, not a real destination)
- **Mobile navigation:** Functional. Hamburger toggle with proper `aria-expanded`/`aria-controls`/`aria-label` state changes, slide-in panel, Escape-to-close, auto-close on viewport resize to desktop, active-link highlighting via IntersectionObserver. This JS/ARIA implementation is solid and should be preserved as-is.
- **Important destinations:** None of the nav items currently point to real external LSPU pages — all are internal anchors, several to the wrong section (Research & Extension → About) or to a dead-end CTA loop.
- **Navigation decisions already made (not yet coded):** See Phase 3 section above — 5-item nav, Research & Extension resolved with a real URL, Apply Now resolved with a real URL.

---

## 5. Current UX (as it exists on disk RIGHT NOW — only real, existing sections described)

- **Hero:** Headline "Empowering Minds. Transforming Futures." Subtitle is generic ASEAN-polytechnic marketing copy. Actions: "Apply Now" → `#final-cta` (loop), "Explore Programs" → `#programs` (valid anchor). Hero image is real (`Hero.jpg`) but has `alt=""` (treated as decorative, should be descriptive).
- **Student Services / Quick Actions:** Currently exists as "Quick Links" at position 8 (near bottom), not position 3. Contains 4 items (LSPU Online, Library Services, Student Handbook, Downloads), all icon + single-word label, all `href="#"`.
- **Important Announcements:** **Does not exist yet.** No section by this name or purpose is currently in the page.
- **Academic Programs:** Exists at position 5. 4 college-framed cards (Engineering, Business, Education, Computer Studies) with custom inline SVG icons, short descriptions, "View Programs →" links — all `href="#"`. "View All Programs" CTA also `href="#"`.
- **Why LSPU / About:** Does not exist under this name. Current "About" section (position 4) is a single centered paragraph in a card with one "Learn More" `href="#"` button. Credibility strip (position 3) is currently separate, not merged with About.
- **Campuses:** Exists at position 6. 4 cards with real photos and short descriptions, "View Campus" → `href="#"` on all.
- **News:** Exists at position 7. **Explicitly demo content** — visible disclaimer text ("Demo content for layout purposes — replace with official LSPU announcements before publishing"), 3 cards with `[Sample]` headlines, "Placeholder summary" body text, inline SVG mock thumbnails (not real photos, even though real photos exist in `Assets/News/`), all links `href="#"`.
- **Final CTA:** Exists. "Ready to join LSPU?" heading, one paragraph, "Apply Now" → `#final-cta` (self-referential).
- **Footer:** Exists, 5 columns (About, Governance & Transparency, Academics, Campuses, Connect). Contains literal visible text `Email: [placeholder]` and `Phone: [placeholder]`. Social icons (Facebook, X, Instagram, YouTube) all `href="#"`. Bottom links (Privacy Policy, Terms of Use, Site Map) all `href="#"`.

---

## 6. Design System (as it exists on disk RIGHT NOW)

- **Colors:** CSS custom properties in `:root` — `--color-blue-900/700/500/100/050` (deep to near-white blue), `--color-gold-600/500/100` (gold accent), `--color-ink-900/600/300` (text scale), `--color-white`, `--color-border`. Semantic aliases (`--color-bg`, `--color-text`, `--color-accent`, `--color-primary`) map onto these. This system is well-structured and should be **preserved, not replaced**.
- **Typography:** Two-font system — `"Sora"` (display/headings, weights 500–800) + `"Inter"` (body, weights 400–600), loaded via Google Fonts with `preconnect`. Type scale via `--fs-xs` through `--fs-3xl` custom properties.
- **Buttons:** `.btn`, `.btn-primary`, `.btn-secondary` classes; primary uses gold shadow accent, secondary is outlined white. Both have `:hover`/`:focus-visible` states with a subtle `translateY` lift.
- **Cards:** Multiple card types (`.program-card`, `.campus-card`, `.news-card`) share a similar visual language (white background, border, shadow, border-radius) — this is the "everything looks like a rounded card" pattern the improvement brief wants varied in Phase 4.
- **Spacing:** Custom property scale `--space-2xs` through `--space-3xl` (0.25rem to 6rem).
- **Section layouts:** All sections currently use the same `.section` scaffold with `clamp()`-based vertical padding — visually consistent but undifferentiated (no editorial/list/featured-panel variation yet, as called for in the improvement brief).
- **Icons:** Hand-authored inline SVG icons throughout (credibility badges, program icons, campus/quick-link icons) using `var(--color-...)` fills — consistent, no icon library dependency. This is good, reusable work.
- **Responsive behavior:** Mobile-first with breakpoints at 600px, 1024px, 1440px via custom properties (`--container-padding`, `--container-width`). Mobile nav collapses to a full-panel overlay below 1024px.
- **Important note:** `css/style.css` contains **two layers** — an original base ruleset, followed by an appended "Visual design layer" comment block that redefines/overrides many of the same selectors (`--container-width`, `--radius-*`, `.hero`, `.site-header`, `.btn`, etc.). This works today but is duplicated, not merged — a legitimate cleanup target for Phase 4, not a bug to "fix" by deleting content blindly.

---

## 7. Files and Assets

```
index.html                              — Single-page site, 569 lines, 10 sections (see §3)
css/style.css                           — ~1,500 lines, all styles (tokens, layout, components, responsive)
js/main.js                              — 74 lines: mobile nav toggle, active-link highlighting, footer year
Assets/
  Branding/LSPU-Seal.png                — University seal, used in header + footer brand mark
  Hero/Hero.jpg                         — Real hero photo (2800×778), main administration building
  Campuses/SC.png                       — Santa Cruz campus gate photo (345×310)
  Campuses/SPCS.png                     — San Pablo City campus gate photo
  Campuses/LBC.png                      — Los Baños campus gate photo
  Campuses/SCS.png                      — Siniloan campus gate photo
  Campuses/Details.txt                  — Real phone/email/address per campus (NOT yet used in HTML)
  News/News-01.jpg                      — Real photo, PQA Executive Briefing story (6000×4000, large)
  News/News-02.jpg                      — Real photo, Midyear Review story
  News/News-03.jpg                      — Real photo, employee oath-taking story
  News/Details of News.txt              — 3 real dated news stories (NOT yet used in HTML — HTML has [Sample] instead)
  Content - Data/Contents.txt           — Real Vision/Mission/Quality Policy text (NOT yet used in HTML)
  Others/*.JPG (4 files)                — Additional real building photos, unused, need compression (5–8MB each)
PROJECT_HANDOFF.md                      — This document
```

---

## 8. Functionality (as it exists on disk RIGHT NOW)

**Working:**
- Mobile hamburger menu: opens/closes correctly, `aria-expanded` toggles, Escape key closes it, auto-closes on resize to desktop, closes on link click.
- Active nav-link highlighting on scroll via IntersectionObserver.
- Footer copyright year auto-updates via JS.
- Smooth scroll on anchor links (CSS `scroll-behavior: smooth`, with `prefers-reduced-motion` override).
- Responsive layout collapses correctly across the defined breakpoints (visually — not yet stress-tested against the *new* IA since that hasn't been implemented).

**Not working / not functional:**
- All 35 `href="#"` links do nothing.
- Apply Now buttons (header, hero, final CTA) loop back into the page instead of reaching admissions.
- Research & Extension nav item leads to the wrong section.
- No JavaScript errors observed, but no console testing has been performed against a running server in this session.

---

## 9. Remaining Issues (as of end of Phase 3)

- **35 `href="#"` placeholder links** throughout — nav (partially), About, Programs (all cards + CTA), Campuses (all cards), News (all cards + CTA), Quick Links (all 4 items), Final CTA, footer (most links + all 4 social icons + all 3 bottom links).
- **Demo/placeholder content still visible:** `[Sample]` news headlines (×3), "Placeholder summary" text (×3), visible "Demo content for layout purposes" disclaimer, footer `Email: [placeholder]` and `Phone: [placeholder]`.
- **Research & Extension nav item** points to `#about` — mismatched, not yet fixed.
- **Apply Now buttons** point to `#final-cta` — self-referential, not yet fixed.
- **Information architecture not reorganized** — Quick Links is still at position 8, not position 3; no Important Announcements section exists yet; About and Credibility are still separate, not merged into "Why LSPU."
- **Meaningful images still using `alt=""`** — Hero.jpg, campus gate photos, and (once added) news photos are content, not decoration, and need descriptive alt text.
- **No `width`/`height` attributes on `<img>` tags** — potential layout shift, not yet addressed.
- **`Assets/Others/*.JPG` are unused and very large** (5–8MB each) — need compression/resizing if used, or can remain unused.
- **CSS has a duplicated/overridden "Visual design layer"** appended after the base layer rather than a single merged pass — works but is not clean; a Phase 4 cleanup candidate.
- **All sections currently share the same card-based visual treatment** — the brief calls for visual rhythm variation (editorial layout for News/About, image-focused for Campuses, compact icon cards for Student Services, prominent panel for Announcements) which has not been implemented.
- **Footer still has 5 columns including "Governance & Transparency"** — not yet simplified per the Phase 3 decision.
- **Social icons still include Facebook, X, Instagram, YouTube** — but only Facebook and YouTube have verified official accounts; X and Instagram links need to be removed, not just re-pointed.
- **No verified specific admissions deadline exists** — the Important Announcements section (once built) must not state a fabricated date.
- **No accessibility audit has been run against a live/rendered page** (e.g., automated contrast or screen-reader testing) — only static code review has been done.

---

## 10. Recommended Next Steps (Phase 4 and later)

**Phase 4 — Implement Information Architecture + Visual Design (start here):**
1. Reorder sections in `index.html` per the Phase 2 plan: Hero → Student Services → Important Announcements → Academic Programs → Why LSPU (merged) → Campuses → News → Final CTA.
2. Simplify nav markup to the 5 finalized items + Student Portal/Apply Now, using the verified URLs from §2 (Phase 3) of this document.
3. Fix Research & Extension: remove from primary nav, add as a real link (`/office/1/vprde`) inside Why LSPU + footer.
4. Replace all 35 `href="#"` links using the verified URL table in §2 — do not re-research these, they're already confirmed.
5. Replace News section content with the real stories from `Details of News.txt`, matched to News-01/02/03.jpg; remove the demo disclaimer.
6. Remove footer `[placeholder]` spans; simplify footer to Explore/Services/Connect; limit social icons to verified Facebook + YouTube only.
7. Merge Credibility stats into a rewritten "Why LSPU" section alongside real Vision/Mission/Quality Policy text from `Contents.txt`.
8. Enrich campus cards with real address/phone from `Details.txt`.
9. Build the Important Announcements section using real, non-fabricated framing (admissions open → real admissions URL, no invented deadline).
10. Add descriptive `alt` text to Hero.jpg, campus photos, and news photos.
11. Vary visual treatment per section per the brief (editorial for News/Why LSPU, image-focused for Campuses, compact for Student Services, prominent panel for Announcements) rather than uniform card grids.

**Phase 5 — Responsive + Accessibility QA:**
- Test the reorganized page across mobile/tablet/laptop/desktop.
- Add `width`/`height` to `<img>` tags where practical.
- Verify contrast and focus states after visual changes.

**Phase 6 — Cleanup:**
- Merge/deduplicate the two CSS layers in `style.css` into a single coherent pass.
- Compress or drop the unused `Assets/Others/*.JPG` files if not used.
- Remove any unused CSS selectors left over from the reorder.

**Phase 7 — Final QA:**
- Re-run the checklist from the original brief (no `href="#"`, no `[Sample]`/`[placeholder]`, nav items all lead somewhere correct, Apply/Admissions/Programs/Services findable, mobile works, visual hierarchy feels intentional).

---

## 11. Important Preservation Rules — DO NOT undo or rebuild unnecessarily

- **Do not rebuild `js/main.js`.** It is clean, minimal, accessible, and functionally correct. Only extend it if a new interactive component genuinely requires it.
- **Do not replace the CSS custom-property design token system** (colors, spacing, type scale). It's a solid foundation — extend it, don't discard it.
- **Do not discard the existing inline SVG icon set.** It's hand-authored, consistent, and uses the token colors correctly — reuse and extend this pattern rather than introducing an icon library.
- **Do not re-fetch or re-verify the URLs already confirmed in §2 of this document** — they were checked against the live official site and social accounts in this session; re-verify only if a URL fails or this handoff is more than a few weeks old.
- **Do not fabricate any admissions deadline, statistic, program, or contact detail** not already present in `Assets/Content - Data/`, `Assets/Campuses/Details.txt`, `Assets/News/Details of News.txt`, or the verified URL table above.
- **Do not delete the real photos in `Assets/News/` or `Assets/Campuses/`** — they are authentic and correctly correspond to the real content that should replace the current demo content.
- **Do not commit or push anything** unless explicitly instructed — this handoff package is a local snapshot only; the GitHub repository has not been touched.
