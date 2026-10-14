# M2: Keyboard trap and Tab/Enter flow audit

Scope: whole page (`index.html`, `css/*.css`, `js/theme.js`, `js/contact-form.js`), light and dark theme. Date: 2026-10-14.

## Method

- Read the HTML, CSS and both scripts and wrote down the expected Tab order.
- Drove headless Chrome over the DevTools protocol with real key events (`Tab`, `Shift+Tab`, `Enter`, `Space`, typed characters). The page was served over HTTP. The scripts were throw-away and are not stored in the repo.
- For every Tab stop the run recorded: element, accessible name, whether it is inside `main`, computed `display`/`visibility`, whether it is on screen, whether it sits under the sticky header, and the computed outline.
- Runs: dark and light theme, at 1280 px and 375 px wide, forward and backward.

## Actual Tab order

Identical in both themes and at both widths. The `Shift+Tab` run visits the same elements in reverse.

| # | Element | Accessible name | Inside `main` |
|---|---------|-----------------|---------------|
| 1 | `a.skip-link` | Skip to main content | no |
| 2 | `nav a` | About | no |
| 3 | `nav a` | Skills | no |
| 4 | `nav a` | Projects | no |
| 5 | `nav a` | Contact | no |
| 6 | `button#theme-btn` | Theme | no |
| 7 | `a` (hero) | View projects | yes |
| 8 | `a` (hero) | Contact me | yes |
| 9 | `a` (card) | Source code for Chuck King | yes |
| 10 | `a` (card) | Source code for Greengrass | yes |
| 11 | `a` (card) | Source code for Recipe Data Scraper | yes |
| 12 | `a` (contact text) | vanthien1462006@gmail.com | yes |
| 13 | `input#name` | Name | yes |
| 14 | `input#email` | Email | yes |
| 15 | `textarea#message` | Message | yes |
| 16 | `button[type=submit]` | Send message | yes |
| 17 | `a` (footer) | vanthien1462006@gmail.com | no |
| 18 | browser UI (focus leaves the page; `document.body` in headless) | n/a | n/a |
| 19 | wraps to `a.skip-link` | Skip to main content | no |

The order follows the visual and DOM order. The About, Skills and skill-badge areas have no interactive elements, so there are no stops there.

## Results per condition

| Condition | Result | Evidence |
|-----------|--------|----------|
| Static scan: positive `tabindex` | Pass | The only `[tabindex]` is `main#main-content` with `-1`. |
| Static scan: fake interactive elements | Pass | 0 elements with `onclick`, `role="button"` or `role="link"`; 0 inline handlers; the page has no `div`. |
| Static scan: hidden but focusable | Pass | 0 focusable elements with `display: none`, `visibility: hidden`, `hidden` or `inert`. |
| Static scan: focusable but off screen or covered | Pass | All 17 stops were on screen with `visible` state. The skip-link is moved off screen with `transform` only while it is not focused, and shows on focus. |
| (a) No keyboard trap (WCAG 2.1.2) | Pass | Tab from stop 1 reaches stop 17 and then leaves the page; Shift+Tab goes back through all stops and leaves at the top. No component captures Tab or Shift+Tab (no key handlers except the form `submit`). The nav scroll container holds focusable links, so it is reachable and escapable. |
| (b) Skip-link target | Pass | Enter on the skip-link focuses `main#main-content` (hash `#main-content`). The next Tab lands on "View projects", which is inside `main`. Same at 375 px. `main` has `tabindex="-1"`. |
| (c) `:focus-visible` visible in both themes | Pass after fix 1 | All 17 stops get `outline: 3px solid var(--focus-ring)`: `rgb(34, 211, 238)` in dark, `rgb(55, 48, 163)` in light (9.2:1 or better against the backgrounds, see M1). Nav links draw it inside the box (`-3px` offset) because the nav clips outlines. The programmatic targets `main` and `p#form-status` had only the browser default ring; see fix 1. |
| (d) Theme button with Enter and Space | Pass | Dark start: Enter gives `light`, `aria-pressed="false"`, `localStorage.theme="light"`. Space gives `dark`, `true`. Space again gives `light`. Focus stays on the button. It is a native `button`, so both keys fire `click`. |
| (e) Form: Enter submits | Pass | Enter in the empty Name field submits and shows 3 errors. Enter on the Send button submits. Enter in the textarea inserts a newline and does not submit (native behavior). Space on the Send button with valid data shows the success status. |
| (e) Form: error focus | Pass | With all fields empty, focus goes to `#name`. With Name valid and Email invalid, focus goes to `#email`. All invalid fields get `aria-invalid="true"` and an error text linked by `aria-describedby`. After success, focus moves to `p#form-status`; the next Tab goes to the footer link. |
| (f) Sticky header does not cover focus (2.4.11) | Pass | Header offset was fixed in M1. In this run no focused element under the header in any forward or backward pass (`obscured` flag false for all 17 stops, both themes, both widths). |

## Findings

| # | Finding | Before | After | Status |
|---|---------|--------|-------|--------|
| 1 | After Enter on the skip-link, `main` receives focus but only shows the browser's thin default ring (`outline: auto 1px`, rgb(238,238,238) in dark and rgb(16,16,16) in light). The same applies to `p#form-status` after a successful submit. This ring is not controlled by the design tokens and is hard to see around a full-width block. | Default UA ring | `[tabindex="-1"]:focus-visible { outline: 3px solid var(--focus-ring); outline-offset: -3px; }` in `css/components.css`. Re-run: `main` and `#form-status` show the 3 px token ring in both themes. The ring is inside the box, so it is not hidden by the header or clipped at the viewport edge. | Fixed |

No keyboard trap and no Tab-order problem was found. The only change is the CSS fix above.

## Not findings

- At the moment of focus in the `prefers-reduced-motion: reduce` emulation, the outline color was read once as the text color (for example `rgb(4, 16, 31)` on the skip-link) and read as the focus-ring color after 500 ms. The reduced-motion reset sets `transition-duration: 0.01ms`, so the color transitions from `currentcolor` for 0.01 ms. It is not perceptible and is not counted.
- Focus leaving the document at stop 18 is the browser moving focus to its own UI (address bar); it is not a trap.

## How to repeat this by hand (keyboard only)

1. Serve the site with Live Server (`http://localhost:5500`). Click the page background once, then press `Tab` (do not use the mouse after that).
2. Press `Tab` through the page. You should see exactly the 17 stops in the table above, each with a thick outline. Take a screenshot at stops 1, 6, 13 and 16.
3. Press `Enter` on the skip-link (stop 1). The whole `main` area gets a ring. Press `Tab` once: focus is on "View projects".
4. On the theme button (stop 6) press `Enter` and then `Space`. The theme flips each time. Repeat the focus screenshots in the other theme.
5. In the Name field press `Enter` with empty fields: errors appear and focus is on Name.
6. Press `Shift+Tab` repeatedly to confirm the reverse order and that you can leave the page at both ends.
