# CLAUDE.md — Mitchell Camps Website

Context file for Claude Code. Read this before making changes — it captures the
design decisions, business facts, and open questions from the project so far,
so you don't have to re-derive them from the HTML.

## What this is

A single-page marketing website for **Mitchell Camps**, the remote-camp
division of Mitchell Drilling International. Audience is Tier 1 mining/
exploration procurement and ops decision-makers evaluating remote camp
providers across Sub-Saharan Africa, Chile and Australia.

Source material: `MDI_Camps_Strategy_9_10_24.pdf` (internal board strategy
deck — vision/mission, camp type specs, waste treatment engineering detail)
plus real site photography and business facts supplied directly in
conversation (see "Content sources" below).

## Current state

- **Split project structure** (as of 2026-07-29):
  ```
  index.html
  css/style.css
  js/main.js
  assets/
    hero-aerial.jpg          (2026-07-29: swapped to "Camp setup.jpg" from originals/ —
                              aerial shot of tented rows + kitchen/vehicles. No longer the
                              same photo as gallery-aerial.jpg, which kept the original bushveld
                              aerial.)
    vision-camp.jpg          (also used as gallery-field-camp.jpg — same source photo)
    fly-camp.jpg             (also used as gallery-fly-camp.jpg — same source photo)
    base-camp.jpg            (also used as gallery-camp-above.jpg — same source photo)
    foldable-building.jpg
    quikcon-transport.jpg
    quikcon-raised.jpg
    quikcon-detail.jpg
    gallery-aerial.jpg
    gallery-fly-camp.jpg
    gallery-field-camp.jpg
    gallery-camp-above.jpg
    originals/   — full-res source photography (PNG/JPG/WEBP), not web-optimized,
                   not referenced by index.html. Kept for re-encoding at higher
                   quality later; re-resize (`convert -resize '1100x>' -quality
                   ~72-78`) before swapping into assets/ if you do.
  ```
  Previously this was a single self-contained `mitchell-camps-website.html`
  (~2.6MB) with inline CSS/JS and base64-embedded images — that file has been
  removed now that the split structure is verified working.
- **No build process, no dependencies** besides a Google Fonts CDN link. Open
  `index.html` directly in a browser — nothing to compile.
- ⚠️ On Windows/OneDrive, `assets/` and `Assets/` are the same directory
  (case-insensitive filesystem) — don't create a differently-cased sibling
  folder expecting it to stay separate.

## Design system

### Colors (CSS custom properties, defined in `:root`)

```css
--ink:       #17130f;   /* primary dark background */
--ink-soft:  #241e16;   /* card bg on dark sections */
--sand:      #d8c193;   /* primary light background */
--sand-dark: #c3a875;   /* borders/dividers on light bg */
--paper:     #ede2c4;   /* secondary light background (cards on sand) */
--gold:      #e2a233;   /* brand accent, CTAs, all links-on-dark */
--rust:      #8b4530;   /* secondary accent — hot/arid, eyebrows on light */
--slate:     #3e5160;   /* cold-climate accent (Chile panel only) */
--olive:     #454f36;   /* rarely used, reserve for success/confirm states */
--white:     #f7f2e4;   /* warm white, text on dark backgrounds */
```

Do not introduce new colors without adding them here first. Everything else
in the CSS derives from these via `var()`.

### Type

| Role | Font | Notes |
|---|---|---|
| Display / headlines | Bebas Neue | Condensed, uppercase-leaning, used for all `h1`–`h3`. Never body copy. |
| Body | IBM Plex Sans | Paragraphs, buttons, form fields. |
| Mono / data | IBM Plex Mono | Eyebrows, stat labels, spec-sheet rows, manifest codes (`SVC-01`), coordinate tags, chips. |

Loaded via Google Fonts (`<link>` in `<head>`). If this becomes a real repo,
consider self-hosting the fonts instead of the CDN call.

### Signature elements — preserve these, don't genericize them

- **Hero contour-line SVG** — animated topographic lines draw in over the
  aerial hero photo on load (`stroke-dashoffset` animation). Respects
  `prefers-reduced-motion`.
- **Hero first-scroll reveal** (added 2026-07-29) — on load the hero shows
  only the clear photo and the white header banner: no dark overlay, no
  ticker, no title/copy (`.hero-pending` in style.css, baked into the markup
  so there's no flash-of-content before JS attaches — same tradeoff as
  `.reveal` elsewhere on the page). The first wheel/touch/key gesture is
  captured (`js/main.js`, scroll-locked via `body.hero-locked`) and replayed
  as a ~1.1s animation: the overlay wipes in left-to-right via `clip-path`,
  then the ticker + hero copy slide in left-to-right ~0.45s later. Once it
  finishes, scrolling unlocks and behaves normally. Skipped entirely for
  `prefers-reduced-motion` or if the page loads already scrolled OR with a
  URL hash (content just shows immediately, no lock — fixes a bug where
  deep-linking to e.g. `#foldsystem`, or clicking a nav link before the
  first scroll, got swallowed by the lock; any same-page anchor click while
  still locked also force-unlocks immediately). This — plus the contour-line
  draw above — are the two deliberate motion "moments" on the page; the
  original design brief's restraint-elsewhere principle still applies to
  everything else.
- **Manifest / spec-sheet motif** — service and system listings use
  container-manifest-style codes (`SVC-01`, `SYSTEM 01`) and mono coordinate
  tags. This ties back to the subject matter (shipping containers, GPS-logged
  remote sites) — keep new content in this idiom rather than introducing a
  different visual language.
- **Chip components** (`.chip`, `.chip-row`) — used in Footprint (countries).
  Was also used in Rapid Deploy (sleeper pod spec, QuikCon deploy-as list)
  until the 2026-07-29 redesign below removed both chip rows from that
  section. If you add another list of short tags anywhere, reuse this
  component rather than inventing a new one.

## Page structure (current order — nav matches this exactly)

| # | Section (`id`) | In nav? | Purpose |
|---|---|---|---|
| 1 | Hero (`#top`) | — | Positioning line + credibility hook |
| 2 | Stats bar | — | 55+/15/03/08 headline numbers |
| 3 | Footprint (`#footprint`) | No (demoted) | Country list, detail behind the "08 countries" stat — ⚠️ see known issue #1 |
| 4 | Vision (`#vision`) | No | Now sourced from the brochure's own positioning copy |
| 5 | Offering (`#offering`) | Yes | Full-service manifest, SVC-01 to SVC-06 |
| 6 | Camp Types (`#camps`) | Yes | Fly / Field / Base camp cards |
| 7 | Rapid Deploy (`#foldsystem`) | Yes | Single two-up card, System 01 (Foldable Sleeper Pod) + System 02 (QuikCon) — see redesign note below |
| 8 | Climates (`#climates`) | Yes | Hot/arid (Africa+Australia) vs cold/altitude (Chile) |
| 9 | Band (positioning quote) | No | Market pain-point / Tier 1 positioning statement |
| 10 | Gallery (`#gallery`) | Yes | Real camp + QuikCon photography |
| 11 | Process (`#process`) | Yes | 5-step delivery process (Define→Configure→Mobilise→Install→Support), from the brochure |
| 12 | Contact (`#contact`) | Yes (CTA button) | Enquiry form (UI only, see below) |
| 13 | Footer | — | Secondary nav, group info |

**Nav/page order must stay in sync.** Sections without a nav link are
intentional (proof points and narrative, not offering categories) — see the
"framework review" reasoning below before adding new top-nav items.

## Content sources & business facts (so you don't have to guess)

- **Second source document:** `Mitchell_Camps_Foldable_Accommodation_Brochure.docx`
  — an official product spec sheet for the foldable accommodation building.
  Treat this as more authoritative than the original strategy deck where they
  conflict, since it's finished external-facing collateral with real
  engineering numbers.
- **55+ years** — Mitchell Group's total operating history. The earlier "50
  years" figure used in the Rapid Deploy section has been **corrected to 55**
  — the brochure states 55 years twice and never mentions 50. This is
  resolved, not still open.
- **15 years** — specifically Mitchell Camps deploying camps across Africa.
- **30+ rigs internationally** — new Group-level stat from the brochure, now
  used in the Vision section's "Group backing" focus item.
- **Foldable building — real spec (from the brochure, now on-site):**
  deployed 5,800 × 2,500 × 2,390mm, folds to 360mm (under 1/6 of deployed
  height), 1,100kg total mass, **two independent lockable private rooms**
  (not a shared 2-person room — each occupant gets their own room), air-con
  per room, Class A non-combustible construction (rock wool + MGO board,
  explicitly positioned against cheaper polystyrene-panel competitors), 2
  steel security doors, double-glazed insect-screened windows. Full technical
  tables (frame materials, wind/seismic ratings, electrical spec) are in the
  source docx if more detail is ever needed on-site.
- **8 countries / 3 continents** — Rwanda, Botswana, Zambia, Angola, DRC,
  Namibia (Sub-Saharan Africa), Chile (South America), Australia. ⚠️ **Still
  unresolved** — see "Known issues" below, this now conflicts with the
  brochure's country list too.
- **Camp classes** — Fly (10–30 pers., tents, 4–6hr setup), Field (30–60
  pers., folding container sleeper pods, 1–2 day setup), Base (60+ pers.,
  modular containers, 21 day setup — updated 2026-07-29, was originally
  7–10 days, briefly 30–45 days). Specs sourced directly from the deck's
  waste-treatment and camp-design slides. Note: the brochure describes the
  small-scale end differently ("1–10 buildings deployed against existing site
  services," no tents/kitchen trailer mentioned) — likely an accommodation-
  only add-on to an existing site rather than the full Fly Camp package, but
  hasn't been reconciled with the deck's Fly Camp definition.
- **Foldable Sleeper Pod** — proprietary, in-house engineered. Key claim: 10
  folding units nest onto 1 truckload vs. 20 truckloads for the rigid-
  container equivalent (both configurations sleep 20 — confirmed consistent
  with the brochure's "2 rooms per building" spec).
- **QuikCon** — proprietary self-jacking, self-unloading container subframe.
  In use 15+ years. Loads/unloads via 4 hydraulic legs, no crane required.
  Deploys as: ablutions, kitchen, accommodation, mobile workshop, hybrid
  power, water treatment, container dome.
- **Rapid Deploy redesign (2026-07-29)** — `#foldsystem` was rebuilt from the
  original two-`.rapid-sub` layout (comparison box, 7-chip building spec,
  QuikCon 3-photo sequence, 7-chip deploys-as list) down to one `.rapid-card`
  containing two `.rapid-item`s side by side (System 01 / System 02), each
  with one photo, one sentence, and one stat line. Removed entirely: the
  1-vs-20-truckload comparison block, both chip lists, and the QuikCon photo
  sequence (down to a single `assets/quikcon-raised.jpg`). The "deploys as"
  list survives only as one footnote sentence below the card (reuses
  `.fold-note`, same component as the old logistics callout). No new image
  assets were introduced — reuses `assets/foldable-building.jpg` and
  `assets/quikcon-raised.jpg`, both already in the repo. Heading changed to
  "Rapid Deployment to remote locations."
- **"How We Deliver" process** — Define → Configure → Mobilise → Install →
  Support, taken directly from the brochure. Own section (`#process`),
  between Gallery and Contact.
- **Tier 1 positioning** — deck references Rio Tinto and Anglo American as
  the *tier* of client targeted ("Tier 1 external clients like..."), not
  confirmed named clients. Site copy mirrors that same non-committal framing
  deliberately — don't tighten this into a client-logo claim without sign-off.
- **Vision section copy** — now pulls close to verbatim from the brochure's
  own positioning language ("Camps built by people who live in them," the
  border-crossing/wet-season paragraph, the four "why us" pillars). This is
  the client's own marketing copy, reused directly — deliberate, not a
  placeholder to rewrite.
- Two logo files exist in the brochure (likely Mitchell Camps and Mitchell
  Drilling International marks). **Not yet used on-site** — the header still
  uses a text wordmark. Client hasn't confirmed they want it swapped in.

## Known issues / flagged for client review — do not "fix" silently

These were called out during the build and are still open:

1. **Footprint country list conflict — now with two disagreeing sources.**
   Chat-stated list: Rwanda, Botswana, Zambia, Angola, DRC, Namibia (+ Chile,
   Australia). Brochure's "in-country presence" list: Botswana, Zambia, DRC,
   Angola, **Tanzania, Mozambique** (supported from Australia; Chile not
   named, though "South America" appears in the brochure's general
   positioning line). Overlap is Botswana/Zambia/Angola/DRC. Everything else
   differs. **Do not edit the Footprint section until the client confirms the
   correct list** — could be a stale brochure, a stale chat answer, or a
   genuine "established presence" vs. "delivered a project" distinction.
2. **Contact form is UI only** — `onsubmit` just swaps button text, no
   backend. Needs a real endpoint or form service before launch.
3. **Welfare, security, workforce-logistics and compliance copy** in the
   Offering section (SVC-03, SVC-05, SVC-06) was drafted from general
   industry benchmarking, not from either source document — ops should
   confirm it matches what's actually delivered today vs. what's aspirational.
4. ~~"20 truckloads" conventional-camp comparison~~ — **removed 2026-07-29**,
   see Rapid Deploy redesign note below. No longer on the page.
5. ~~QuikCon mechanical sequence captions~~ — **removed 2026-07-29**, the
   3-photo sequence (transport → self-jacked → drive clear) was dropped in
   the Rapid Deploy redesign. No longer on the page.
6. **Container domes, hybrid power, mobile workshops** — still text-only,
   now a single footnote sentence in Rapid Deploy (was a chip list before
   2026-07-29) plus the Offering mentions. No photos/renders exist yet (the
   brochure is accommodation-specific and doesn't cover these). If these
   become bigger parts of the offering, they may deserve dedicated treatment
   rather than staying as a passing mention.
7. **Real logos available but not used** — see above. Ask before swapping
   the text wordmark.
8. **Placeholder contact details** — the brochure itself ships with
   `[Name, title] | [Email] | [Phone]` placeholders, and the site's own
   `camps@mitchelldrilling.com` was invented for the mockup, not confirmed.
   Neither source has real contact info yet.

## Recommended next steps

- ~~Split the single file into a real project structure~~ — done 2026-07-29,
  see "Current state" above.
- **Add meta tags** — title/description are set, but there's no Open Graph
  image, favicon, or `<meta name="description">` yet.
- **Accessibility pass** — focus states and `prefers-reduced-motion` are
  handled; still worth a manual pass with a screen reader, especially the
  mobile nav and the enquiry form.
- **Wire up the enquiry form** — pick a form backend (Formspree, a serverless
  function, etc.) and replace the placeholder `onsubmit` handler.
- **Decide on Rapid Deploy's prominence** — open question from the last
  review: is the fold-pod/QuikCon tech the actual reason clients choose
  Mitchell over a generic modular-camp supplier, or does "full-service
  operation for Tier 1 clients" close the deal with the tech as supporting
  proof? That answer would determine whether Rapid Deploy eventually earns a
  mention in the hero itself rather than living as section 7 of 11.

## Build notes (how the images got into the HTML)

Images were resized (`convert -resize '1100x>' -quality ~72-78`) then
base64-encoded and substituted into a template via a small Python script —
not hand-typed. If you regenerate images at higher resolution, resize before
encoding; the current sizes were chosen to keep the single-file artifact
manageable, not for visual quality reasons. Once you split into a real
`/assets` folder (see above), this step goes away entirely — just reference
the files normally.
