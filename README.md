# HW1 Portfolio

A personal portfolio for Vo Van Thien, an Information Systems student at UIT, VNU-HCM. It is a single page built with vanilla HTML, CSS and JavaScript only: no frameworks, no build step, no CDNs.

Visual direction: "cyber blueprint". A dark navy page with a faint grid, cyan and violet accents and the system monospace font. A light theme is also provided.

## Run it

Serve the folder with the **Live Server** extension in VS Code and open `http://localhost:5500`.

Do not open `index.html` through `file:///`. Module scripts and the Content-Security-Policy behave differently there, and the results will not match what is documented here.

## Project structure

```
hw1-portfolio/
├── index.html              Single page, semantic landmark tree
├── css/
│   ├── reset.css           Global box-sizing reset and base rules
│   ├── tokens.css          All colors, spacing, radii, font sizes (light and dark)
│   ├── layout.css          Grids, sticky header, responsive rules
│   └── components.css      Nav, buttons, cards, badges, form, focus states
├── js/
│   ├── theme.js            Theme engine (dark / light)
│   └── contact-form.js     Contact form validation
├── assets/
│   ├── avatar.svg          Placeholder avatar
│   └── favicon.svg
├── docs/audit/             Audit reports for M1 to M4
├── TASK_DECOMPOSITION.md   Specification and work breakdown
└── project-rules.md        Project constraints
```

## Design decisions

- **Semantic HTML, no `div`.** The page uses `header`, `nav`, `main`, `section`, `article`, `figure`, `dl`, `form` and `footer`. There is exactly one `h1` and no skipped heading levels. Every `section` is named with `aria-labelledby`. A skip-link targets `main#main-content`.
- **Design tokens.** Every color, spacing step, radius and font size is a custom property in `css/tokens.css`. No rule outside that file contains a hex or rgb value. Layout is mobile-first (375 px base, `min-width` queries), with Grid for 2D layouts and Flexbox for 1D.
- **Theme engine.** `js/theme.js` sets `data-theme` on `<html>`. The choice is kept in `localStorage` under the key `theme`. Only `"light"` and `"dark"` are accepted, and any other stored value is ignored. With nothing stored, the page follows `prefers-color-scheme`. `#theme-btn` reflects the state with `aria-pressed`. Storage errors are caught, so the page still works when storage is blocked.
- **Contact form.** Validation runs on submit. Errors appear next to each field, are linked with `aria-describedby`, set `aria-invalid`, and focus moves to the first invalid field. Messages are written with `textContent`, never `innerHTML`.
- **Content-Security-Policy.** A `<meta http-equiv="Content-Security-Policy">` sets `default-src 'none'` and allows only same-origin scripts, styles, images, fonts and connections. There are no inline scripts, inline styles or inline event handlers, and no `unsafe-inline` or `unsafe-eval`. Headers that a meta tag cannot set (`frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) are listed in `docs/audit/m3-security.md` for server configuration.
- **Accessibility.** Targets are WCAG 2.2 AA: contrast of at least 4.5:1 for text and 3:1 for UI and focus rings in both themes, visible focus rings, targets of at least 44 px, and `prefers-reduced-motion` honored for every animation.

## Lighthouse

Mobile run on Live Server, provided by the project owner (see `docs/audit/m4-lighthouse.md`).

| Category | Score |
|----------|------:|
| Performance | 100 |
| Accessibility | 100 |
| Best Practices | 92 |
| SEO | 100 |

LCP 1.1 s, CLS 0, TBT 0 ms.

Best Practices lost points for a console error and an Issues-panel entry: an inline script blocked by the CSP. The repository has no inline script, so this is most likely the auto-reload script that Live Server injects. That explanation was read from the code and has not been confirmed on another server.

## Milestones and commits

| Commit | Message | Task |
|--------|---------|------|
| `0f108e2` | `docs(spec): define component contracts & WBS table` | T-01 spec |
| `b6994e9` | `feat(html): semantic landmark tree` | T-02 HTML |
| `e07ea9e` | `feat(css): design tokens & box-sizing reset` | T-03 tokens and reset |
| `15e8acb` | `feat(css): responsive grid layout` | T-04 layout |
| `313eb96` | `feat(css): components & states` | T-05 components |
| `57ced8f` | `feat(js): dark mode engine` | T-06 theme |
| `22516e2` | `feat(js): contact form validation` | T-07 form |
| `5a43f0d` | `fix(a11y): contrast & landmarks` | M1 WCAG 2.2 AA audit (`docs/audit/m1-wcag.md`) |
| `7fc28e4` | `fix(nav): keyboard trap prevention` | M2 keyboard audit |
| `d10fadb` | `docs(audit): record M2 results` | M2 report (`docs/audit/m2-keyboard.md`) |
| `b8277fa` | `fix(security): strict CSP & zero inline handlers` | M3 CSP |
| `657756e` | `docs(audit): record M3 results` | M3 report (`docs/audit/m3-security.md`) |
| `61ef60d` | `perf: optimize assets` | M4 Lighthouse report (`docs/audit/m4-lighthouse.md`), no code change needed |

## Placeholders to replace

- **Avatar.** `assets/avatar.svg` is an abstract illustration, not a photo. Replace it with a real picture and update the `alt` text. Keep `width="400" height="400"` (or the new real size) so the layout does not shift.
- **Source code links.** The three "Source code" links in the project cards use `href="#"`. Replace each with the real GitHub repository URL. If a link opens in a new tab, add `rel="noopener noreferrer"`.
