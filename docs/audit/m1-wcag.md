# M1: WCAG 2.2 AA audit

Scope: `index.html` and `css/*.css`, light and dark theme. Date: 2026-10-14.

## Method

- Read `index.html`, `css/tokens.css`, `css/reset.css`, `css/layout.css`, `css/components.css`.
- Contrast: a throw-away Python script (not stored in the repo) computed WCAG relative-luminance ratios for every text/background and UI/background pair that the CSS produces. Hover and active colors from `color-mix()` were mixed in sRGB by hand. Where text sits on the background grid, the grid line was blended in as the worst case.
- Structure and layout: headless Chrome driven over the DevTools protocol (throw-away script, not stored). The page was served over HTTP and measured at 320, 375, 768, 1024 and 1280 px in both themes (`prefers-color-scheme` emulation). Checks: DOM queries, the accessibility tree (`Accessibility.getFullAXTree`), bounding boxes of all links, buttons and fields, real Tab and Shift+Tab runs, anchor jumps, and a screenshot of the focus ring.
- Thresholds: text 4.5:1, UI components and focus indicators 3:1, target size 24x24 px.

## Findings

| # | WCAG | Finding | Before | After | Status |
|---|------|---------|--------|-------|--------|
| 1 | 2.4.11 Focus Not Obscured | `--header-offset` (used by `scroll-padding-top`) was smaller than the sticky header. Header heights: 172 px below about 440 px wide, 136 px at 480-760 px, 107-121 px at 768-1000 px. Offsets were 144 px (base) and 96 px (from 48rem). Shift+Tab to the Email field at 375 px put it at y=144-188 under a 172 px header. Shift+Tab to the contact mail link at 1024 px put it at y=97-118 under a 121 px header (fully hidden). | 9rem / 6rem | 11.5rem / 8.5rem (`css/layout.css`). The same two cases re-run: no field or link is covered. | Fixed |
| 2 | 2.4.7 Focus Visible / 1.4.11 | `nav` has `overflow-x: auto`, which also clips vertically. The 3 px ring with 3 px offset was cut off on the top, bottom and left of each nav link. The screenshot at 375 px showed only a thin vertical bar. | Ring clipped | `nav a:focus-visible { outline-offset: -3px; }` draws the full ring inside the link (`css/components.css`). The screenshot shows a complete ring. | Fixed |

## Contrast results

All pairs pass. The two dark-theme implementations (`prefers-color-scheme` and `data-theme="dark"`) use identical token values, so the ratios are the same.

| Pair | Light | Dark | Need | Result |
|------|-------|------|------|--------|
| Body text / page background | 15.87 | 16.44 | 4.5 | Pass |
| Body text / background with grid line | 13.39 | 13.40 | 4.5 | Pass |
| Body text / card surface | 14.62 | 13.81 | 4.5 | Pass |
| Body text / elevated (header, inputs) | 17.04 | 15.08 | 4.5 | Pass |
| Muted text / page background (dt, hint, figcaption, footer, footer link) | 7.13 | 8.80 | 4.5 | Pass |
| Muted text / background with grid line | 6.01 | 7.17 | 4.5 | Pass |
| Muted text / elevated (header tagline) | 7.65 | 8.07 | 4.5 | Pass |
| Link accent / page background | 9.25 | 10.71 | 4.5 | Pass |
| Link accent / background with grid line | 7.80 | 8.73 | 4.5 | Pass |
| Link accent / elevated (nav links) | 9.93 | 9.83 | 4.5 | Pass |
| Link accent / card surface (Source code links) | 8.52 | 9.00 | 4.5 | Pass |
| On-accent text / accent (buttons, skip-link) | 9.93 | 10.57 | 4.5 | Pass |
| On-accent text / accent, hover | 10.92 | 11.08 | 4.5 | Pass |
| On-accent text / accent, active | 11.97 | 11.69 | 4.5 | Pass |
| Error text (danger) / page background | 6.03 | 8.53 | 4.5 | Pass |
| Error text / background with grid line | 5.08 | 6.96 | 4.5 | Pass |
| Success text / page background | 6.64 | 11.11 | 4.5 | Pass |
| Badge and skill pill text / surface or background | 14.62 / 15.87 | 13.81 / 16.44 | 4.5 | Pass |
| `//` heading prefix (accent-2) / background (decorative, hidden from AT) | 6.62 | 7.11 | 3 | Pass |
| Theme icon / button fill | 14.62 | 13.81 | 3 | Pass |
| Input and textarea border / elevated fill | 3.49 | 3.50 | 3 | Pass |
| Input border / page background | 3.25 | 3.81 | 3 | Pass |
| Theme button border / header | 3.49 | 3.50 | 3 | Pass |
| Invalid-field border (danger) / elevated | 6.47 | 7.83 | 3 | Pass |
| Focus ring / page background | 9.25 | 10.71 | 3 | Pass |
| Focus ring / header (elevated) | 9.93 | 9.83 | 3 | Pass |
| Focus ring / card surface | 8.52 | 9.00 | 3 | Pass |
| Hover border (accent) / card surface | 8.52 | 9.00 | 3 | Pass |
| Hover border (accent) / input fill | 9.93 | 9.83 | 3 | Pass |
| Accent button fill / page background | 9.25 | 10.71 | 3 | Pass |
| Avatar border (accent) / page background | 9.25 | 10.71 | 3 | Pass |
| Header bottom border / header | 3.49 | 3.50 | 3 | Pass |

Script results that are not findings:

- Light input border against the page background including a grid line: 2.74. The input has its own opaque fill, so the border's inner neighbor is the fill (3.49) and its outer neighbor is the background (3.25). Grid lines are 1 px and only touch the outer edge at crossings. Not counted as a failure.
- Focus ring against the accent button fill: 1.00. The ring sits outside the button with a 3 px gap, so it is judged against the page background (9.25 / 10.71). Not a failure.
- Disabled buttons (`opacity: 0.6`) are exempt from contrast rules.
- No placeholders are used anywhere (`[placeholder]` count = 0).

## Passed items, with evidence

| Item | Evidence |
|------|----------|
| `lang="en"` | `document.documentElement.lang === "en"` |
| Exactly one `h1`; no skipped levels | Outline: H1 H2 H2 H2 H3 H3 H3 H2 H3 H3 H3 H2 |
| Landmarks | Accessibility tree: one `banner`, `navigation` named "Primary", `main`, `contentinfo`. The `header` and `footer` inside `article` are exposed as `group`, not as extra banner/contentinfo. |
| Skip-link | `href="#main-content"`; the target exists; `main` has `tabindex="-1"`. First Tab stop. |
| Section names | All 5 sections have `aria-labelledby` resolving to their `h2` (Full-Stack Developer in the making, About, Skills, Projects, Contact). Exposed as `region`. |
| Form labels | `input#name`, `input#email` and `textarea#message` each have 1 visible `label`; accessible names are Name, Email, Message. All `aria-describedby` ids exist. No duplicate ids. |
| Images | One `img`: descriptive `alt`, `width="400" height="400"`, loads. No `div` elements in the page (count = 0). |
| Link and button names | Nav links, "View projects", "Contact me", "Send message", "Theme" (visually hidden text), and "Source code for ..." (the visible text "Source code" is contained in the name, so 2.5.3 holds). |
| 2.5.8 Target Size (Minimum) | Every link, button and field is at least 44 px high. Two mail links measure 209x21 px: one is inline in a sentence (exempt) and the footer one has no other target within 24 px (spacing exception). |
| 2.4.11 Focus Not Obscured | After fix 1: Tab and Shift+Tab runs at 375, 768, 1024 and 1280 px found no focused element under the header. The only hits are the skip-link, which sits on top of the header by design. |
| Anchor jumps | After fix 1, the h2 of each target section lands below the header at 375, 768 and 1024 px (for example h2 top 232 vs header bottom 172 at 375 px). |
| 3.2.6 Consistent Help | Not applicable: the single page has no help mechanism that repeats across pages. |
| 3.3.7 Redundant Entry | Pass: one single-step form; `autocomplete="name"` and `autocomplete="email"` are set; nothing is asked twice. |
| Reduced motion | Cursor blink, card lift and smooth scroll are all gated by `prefers-reduced-motion`. |
| Reflow at 320 px | `documentElement.scrollWidth <= innerWidth` at 320, 375, 768, 1024 and 1280 px. |

## Observations (not fixed: outside the M1 scope, or not a measured failure)

- The three "Source code" links use `href="#"`. They are placeholders and jump to the top of the page. Replace them with real repository URLs (content task).
- Below about 440 px the nav scrolls horizontally inside the header (scroll width 356 px vs client width 213-268 px). All links stay reachable by touch scroll and by keyboard, so this was not counted as a failure, but the last link is off-screen at 375 px until scrolled.
- `--header-offset` is in `rem`, so it follows the root font size, but behavior at browser zoom above 100% was not measured.
