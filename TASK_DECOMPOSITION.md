# TASK_DECOMPOSITION.md — HW1: Production Portfolio

This document is the specification for the portfolio. It defines the work breakdown, the component contracts and the verification gates. No HTML, CSS or JS is written until the matching task starts. Read `project-rules.md` first; it overrides anything here in case of conflict.

## 1. Overview

A personal portfolio for **Vo Van Thien**, built with vanilla HTML, CSS and JavaScript only. No frameworks, no build tools, no CDNs.

- **Mobile-first.** Base styles target a 375px viewport. Wider layouts are added with `min-width` media queries.
- **Visual direction: "cyber blueprint".** A dark navy background with a faint grid, cyan and violet accents, and the system monospace font stack. A light theme is also provided.
- **Themes.** Dark and light, switchable by the user and remembered between visits.
- **Quality bar.** WCAG 2.2 AA, strict CSP, zero inline handlers, Lighthouse 100.

## 2. Work Breakdown Structure

Tasks run in the order listed. One task is one atomic commit.

| ID | Task | Responsible file(s) | Acceptance criteria | Commit message |
|----|------|---------------------|---------------------|----------------|
| T-01 | Spec | `TASK_DECOMPOSITION.md` | WBS table, landmark, form, theme and CSS contracts and verification gates are all written in English. | `docs(spec): define component contracts & WBS table` |
| T-02 | Semantic HTML landmark tree | `index.html` | Matches the landmark contract in section 3. Zero `<div>` elements. Skip-link present. Exactly one `<h1>`. No skipped heading levels. | `feat(html): semantic landmark tree` |
| T-03 | Design tokens and reset | `css/reset.css`, `css/tokens.css` | Global `box-sizing: border-box` reset. Every color, spacing, radius and font size is a custom property in `:root`. Both themes defined. | `feat(css): design tokens & box-sizing reset` |
| T-04 | Responsive grid layout | `css/layout.css` | Works at 375px without horizontal scroll. Card grid uses `repeat(auto-fit, minmax(min(100%, 17.5rem), 1fr))`. Enhancements use `min-width` queries only. CLS = 0. | `feat(css): responsive grid layout` |
| T-05 | Components and states | `css/components.css` | Skip-link, nav, buttons, badges, cards, form fields and error states are styled. Hover, focus-visible, active and disabled states exist. Animations respect `prefers-reduced-motion`. | `feat(css): components & states` |
| T-06 | Theme engine | `js/theme.js` | Follows the theme contract in section 5. Falls back to `prefers-color-scheme` when nothing is stored. | `feat(js): dark mode engine` |
| T-07 | Contact form validation | `js/contact-form.js` | Follows the form contract in section 4. Errors are announced and shown per field. No `innerHTML`. | `feat(js): contact form validation` |
| M1 | WCAG 2.2 AA audit | files affected by findings | All text has contrast of at least 4.5:1 and UI/focus indicators at least 3:1, in both themes. Landmarks and names verified. | `fix(a11y): contrast & landmarks` |
| M2 | Focus trap / keyboard audit | files affected by findings | Every control is reachable and operable by keyboard. No keyboard trap. Focus order follows the visual order. Focus is always visible. | `fix(nav): keyboard trap prevention` |
| M3 | Strict CSP and zero inline handlers | `index.html` (CSP meta) plus any file with a violation | A strict CSP `<meta>` is present. No inline `on*=` attributes, `style=""`, inline `<script>` or inline `<style>`. The console shows no CSP violations. | `fix(security): strict CSP & zero inline handlers` |
| M4 | Lighthouse 100 | files affected by findings | Lighthouse scores 100 for Performance, Accessibility, Best Practices and SEO on mobile. | `perf: optimize assets` |

## 3. Landmark contract (DOM tree)

No `<div>` anywhere. Every `<section>` has `aria-labelledby` pointing to the `id` of its own heading.

```
body
├── a.skip-link  href="#main-content"
├── header
│   ├── h1                       "Vo Van Thien"
│   ├── p                        tagline
│   ├── nav[aria-label="Primary"]
│   │   └── ul > li > a          #about  #skills  #projects  #contact
│   └── button#theme-btn
├── main#main-content[tabindex="-1"]
│   ├── section#hero[aria-labelledby]
│   │   ├── h2
│   │   └── figure > img + figcaption   (avatar, width=400 height=400)
│   ├── section#about[aria-labelledby]
│   │   ├── h2
│   │   └── dl > dt/dd pairs     (personal info)
│   ├── section#skills[aria-labelledby]
│   │   ├── h2
│   │   └── (h3 + ul > li badge) × N groups
│   ├── section#projects[aria-labelledby]
│   │   ├── h2
│   │   └── article.project-card × 3
│   └── section#contact[aria-labelledby]
│       ├── h2
│       └── form#contact-form
└── footer
    ├── address
    └── p                        copyright
```

Notes:

- The skip-link is the first focusable element and targets `#main-content`. The `tabindex="-1"` on `main` lets it receive focus from the link.
- The `h1` is the only top-level heading. Section headings are `h2`; skill group headings and project card titles are `h3`.
- The avatar `img` has a descriptive `alt` and explicit `width="400"` and `height="400"`.

## 4. Form contract

`form#contact-form` has three fields. `x` below stands for the field name: `name`, `email` or `message`.

| Field | Control | `id` |
|-------|---------|------|
| name | `input` | `name` |
| email | `input type="email"` | `email` |
| message | `textarea` | `message` |

Each field consists of, in this order:

1. `label for="x"` with visible text.
2. The control with `id="x"` and `aria-describedby="x-hint x-error"`.
3. `p.field-hint#x-hint` with the expected format.
4. `p.field-error#x-error`, empty until validation fails.

The form also contains a submit button and `p#form-status` with `role="status"` for the overall result message.

Behavior: validation runs on submit and on `blur`. A failing field gets `aria-invalid="true"` and its error text is set with `textContent`. A passing field has `aria-invalid` removed and its error text cleared. Placeholders are never used as labels.

## 5. Theme contract

- **Storage.** `localStorage` key `theme`, value `"light"` or `"dark"`. Any other stored value is ignored (it is untrusted input).
- **Attribute.** The active theme is set as `data-theme` on `<html>`.
- **Button.** `#theme-btn` has `aria-pressed="true"` when the theme is dark and `"false"` when it is light.
- **Default.** With no valid stored value, use `prefers-color-scheme`; dark if there is no preference.
- **Safety.** Reads and writes of `localStorage` are wrapped so the page still works when storage is blocked.

## 6. CSS contract

- Every color, spacing, radius and font size is a custom property declared in `:root` in `css/tokens.css`. The light theme overrides the color tokens under `[data-theme="light"]`.
- No hard-coded hex or rgb values in any rule outside `tokens.css`.
- Mobile-first with `min-width` media queries. Flexbox for 1D layout, Grid for 2D layout, `gap` instead of child margins.
- Performance budget: **CLS = 0**, **LCP < 2.0 s on Fast 3G**.
- Contrast: text at least **4.5:1**, UI components and focus indicators at least **3:1**, in both themes.
- Every animation is disabled or reduced under `prefers-reduced-motion`.

## 7. Verification gates

| ID | Gate |
|----|------|
| T-01 | File exists and covers all eight required sections. `git show --stat` lists only the named files. |
| T-02 | HTML validator reports no errors. Search finds 0 `<div>` and exactly 1 `<h1>`. Heading outline has no gaps. Tab key reaches the skip-link first. |
| T-03 | Search finds no hex or rgb values outside `tokens.css`. Computed `box-sizing` is `border-box` on all elements. |
| T-04 | At 375px there is no horizontal scroll. Cards reflow without overflow at 768px and 1280px. Layout shift is 0. |
| T-05 | Each interactive element shows visible hover and focus states. Reduced motion is honored in DevTools emulation. |
| T-06 | Toggling changes `data-theme` and `aria-pressed`. The choice survives a reload. A corrupted `theme` value is ignored. |
| T-07 | Empty and invalid input show the right error and set `aria-invalid`. Valid input clears errors and sets `#form-status`. No `innerHTML` in the file. |
| M1 | Contrast checker passes in both themes. Accessibility tooling reports no violations. |
| M2 | Complete keyboard-only pass over the page, including the theme button and form. No trap, no lost focus. |
| M3 | Console shows no CSP violations. Search finds no `on*=`, `style=` or inline `<script>`/`<style>`. |
| M4 | Lighthouse mobile run shows 100 in all four categories. |

## 8. Rules

- **No one-shot prompts.** The site is built task by task, in the order of the WBS. Each task is prompted, implemented and verified on its own. The next task is not started until the current one is committed.
- **One atomic commit per task**, using the exact message from the WBS, with only the files named by that task staged by explicit path.
- No HTML and CSS in the same commit, and no CSS and JS in the same commit.
- No `git push`, `--amend`, `rebase` or `reset --hard`.
- Anything outside the current task's scope is reported, not changed.
