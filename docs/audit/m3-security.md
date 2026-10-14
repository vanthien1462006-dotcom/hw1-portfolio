# M3: Strict CSP and zero inline handlers

Scope: `index.html`, `css/*.css`, `js/*.js`, `assets/*.svg`. Date: 2026-10-14.

## 1. Scans run (PowerShell `Select-String`)

All scans were run on the repository before any change.

| # | Looking for | Files | Result |
|---|-------------|-------|--------|
| 1 | `onclick`, `onload`, `onerror`, `onsubmit`, `onchange`, any `on[a-z]+=` | `index.html` | 0 matches |
| 2 | `style=` attribute | `index.html`, `assets/*.svg` | 0 matches |
| 3 | `<style>` and `<script` | `index.html`, `assets/*.svg` | 2 matches, both external files: `<script src="js/theme.js">` and `<script type="module" src="js/contact-form.js">`. No inline `<script>` or `<style>`. |
| 4 | `javascript:` URLs | `index.html`, `js/*.js`, `css/*.css`, `assets/*.svg` | 0 matches |
| 5 | `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function`, string argument to `setTimeout`/`setInterval` | `js/*.js` | 0 matches |
| 6 | `target=` (needs `rel="noopener noreferrer"` for `_blank`) | `index.html` | 0 matches, so there is no `_blank` link |
| 7 | `http(s)://`, `@import`, `url(`, `//cdn` | `index.html`, `css/*.css`, `js/*.js`, `assets/*.svg` | 5 matches, none is a network request: the `xmlns="http://www.w3.org/2000/svg"` namespace on both SVG files and 3 `fill="url(#...)"` references to gradients inside `avatar.svg` |
| 8 | existing `http-equiv` / CSP | `index.html` | 0 matches (no CSP before this milestone) |

## 2. Violations fixed

None found. The page already had no inline handlers, no inline `style`, no inline scripts or styles, no unsafe DOM or eval APIs, and no `_blank` links. The only change in this milestone is the CSP meta tag.

## 3. Policy

Added to `index.html` as the first element after `<meta charset>`:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; object-src 'none'">
```

| Directive | Value | Why |
|-----------|-------|-----|
| `default-src` | `'none'` | Deny every resource type that is not listed below. New resource types (frames, media, workers, manifest) are blocked until someone allows them on purpose. |
| `script-src` | `'self'` | Only `js/theme.js` and `js/contact-form.js` from the same origin run. Inline scripts, `eval` and event-handler attributes are blocked. No `'unsafe-inline'` or `'unsafe-eval'`. |
| `style-src` | `'self'` | Only the four files in `css/`. Inline `<style>` and `style=""` are blocked. |
| `img-src` | `'self' data:` | Local images (`assets/avatar.svg`, `assets/favicon.svg`). `data:` is allowed for small embedded images, as requested. |
| `font-src` | `'self'` | The site uses the system font stack; this only allows local fonts if they are added later. |
| `connect-src` | `'self'` | Blocks `fetch`, XHR and WebSocket to other origins. The page makes no such calls today. |
| `base-uri` | `'none'` | An injected `<base>` tag cannot change how relative URLs resolve. |
| `form-action` | `'self'` | The form can only submit to the same origin. |
| `object-src` | `'none'` | No plugins (`object`, `embed`). |

Compatibility check by reading the code: both scripts and all stylesheets are same-origin files; the inline `<svg>` icons use only presentation attributes (`fill`, `stroke`), which CSP does not restrict; the contact form is handled in JavaScript with `preventDefault` and has no `action`.

## 4. Limits of a CSP delivered through `<meta>`

- The `<meta>` policy only applies to content that is parsed after the tag. That is why it is placed right after `<meta charset>`, before any `<link>` or `<script>`.
- These directives are ignored in a `<meta>` tag: `frame-ancestors`, `report-uri`, `report-to`, `sandbox`. They are not used in this policy.
- A policy in a header covers the whole response and cannot be removed by markup injected into the page. The meta tag cannot give that guarantee.
- The meta tag cannot be combined with `Content-Security-Policy-Report-Only`, so there is no reporting mode.
- A header policy is the better place for the same rules once the site is deployed. When both exist, the browser enforces both and the stricter result wins.

## 5. Headers that a `<meta>` tag cannot set (configure on the server at deployment)

| Header | Suggested value | Purpose |
|--------|-----------------|---------|
| `Content-Security-Policy` with `frame-ancestors 'none'` | `frame-ancestors 'none'` (add to the same policy as above) | Stops other sites from embedding the page in a frame (clickjacking). Not supported in `<meta>`. |
| `X-Content-Type-Options` | `nosniff` | Stops the browser from guessing a file type, so a file served as one type is not run as another. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` (or stricter) | Limits what is sent in the `Referer` header. A `<meta name="referrer">` exists, but the header also covers non-HTML responses and is the usual place. |
| `Permissions-Policy` | for example `camera=(), microphone=(), geolocation=()` | Turns off browser features the page does not use. Only available as a header. |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Forces HTTPS on the real domain. Only available as a header and only meaningful over HTTPS. |

These are recommendations for deployment. None of them is set by this repository, and none was tested here.

## 6. Verification status

The CSP was **not** run in a browser in this milestone, as requested. The scans above and a read-through of the code are the only checks. To confirm there are no CSP violations, follow the steps below.

### How to check the Console for CSP errors

1. Start Live Server and open `http://localhost:5500` (never `file:///`).
2. Open DevTools (`F12`), go to the **Console** tab, and enable the **Errors** level in the filter.
3. Hard reload (`Ctrl+Shift+R`) so the policy applies to a fresh load.
4. Expected: no message that starts with `Refused to apply inline style`, `Refused to execute inline script`, `Refused to load the ... because it violates the following Content Security Policy directive`.
5. Use the page once: toggle the theme, submit the form empty, then submit it with valid data. Check the Console again.
6. To see that the policy is active, open the **Network** tab, click the document, and check the page loads `css/*.css` and `js/*.js` with status 200. In the **Console**, run `document.querySelector('meta[http-equiv]').content` to read the policy back.
7. Optional negative test (do not commit it): in the Console run `eval('1')`. A CSP error `Refused to evaluate a string as JavaScript` proves that `unsafe-eval` is blocked.
8. Also check the **Issues** tab for CSP items. A Live Server auto-reload script that the extension injects may log a violation in development; if that is the only message, it comes from the tool, not the page.
