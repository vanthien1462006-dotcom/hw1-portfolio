# M4: Lighthouse and asset optimization

Date: 2026-10-14. Result: **no code change needed.**

## 1. Lighthouse run (provided by the project owner)

Mobile, run on Live Server in an Incognito window. These numbers were not produced by this audit.

| Metric | Value |
|--------|-------|
| Performance | 100 |
| Accessibility | 100 |
| Best Practices | 92 |
| SEO | 100 |
| LCP | 1.1 s |
| CLS | 0 |
| TBT | 0 ms |

Two audits failed, both in Best Practices:

1. "Browser errors were logged to the console": `Executing inline script violates the following Content Security Policy directive 'script-src 'self''` with hash `sha256-vvt4KWwuNr51XfE5m+hzeNEGhiOfZzG97ccfqGsPwvE=`.
2. "Issues logged to the Issues panel".

## 2. Cause of Best Practices 92

Hypothesis from the project owner: both failures come from the script that the Live Server extension injects into the page at serve time, and the strict CSP (added in M3) blocks it. It is not project code.

Evidence from reading the code (no browser was run in this audit):

| Check | Result |
|-------|--------|
| `<script>` tags in `index.html` | 2, lines 14 and 15, both with `src`: `js/theme.js` and `js/contact-form.js` (module). 0 inline scripts. A regex for `<script` without `src` found 0 matches. |
| `<style>`, `style=`, `on*=` attributes in `index.html` | 0 matches |
| End of `index.html` | Ends with `</footer></body></html>`. No script before `</body>`. |
| Unsafe APIs in `js/*.js` (`eval`, `new Function`, `innerHTML`, `document.write`, ...) | 0 matches (M3 scan) |
| Inline scripts in `assets/*.svg` | 0 (no `<script>` in either file) |

Conclusion: the repository contains no inline script, so the blocked inline script cannot come from the project files. This is consistent with the Live Server hypothesis: that extension inserts an inline script near the end of `<body>` for auto-reload, and an inline script is exactly what `script-src 'self'` refuses. I could not confirm the hash belongs to that script, because it is not in the repository and I did not run the page.

**Not verified:** the run was not repeated on another server (for example a plain static server or the deployed site), where the audit should pass. Until that is done, the cause is the most likely explanation, not a proven one.

Per the instruction, the CSP was not loosened and `'unsafe-inline'` was not added. Doing so would remove the protection in order to hide a development-tool message.

How to confirm (optional): serve the folder with any static server that does not inject scripts, open it in Incognito, run Lighthouse (mobile), and check that Console and Issues are empty and Best Practices is 100. Alternatively, in the Live Server tab, use View Source and look for an inline `<script>` before `</body>` that is not in `index.html` on disk.

## 3. Asset sizes

Measured with `Get-ChildItem` (bytes on disk). Gzip sizes use level 9, to estimate transfer size with compression.

| File | Bytes | Gzip bytes |
|------|------:|-----------:|
| `index.html` | 6,778 | 2,392 |
| `css/components.css` | 6,207 | 1,682 |
| `css/layout.css` | 4,293 | 1,332 |
| `css/reset.css` | 941 | 469 |
| `css/tokens.css` | 2,588 | 935 |
| `js/contact-form.js` | 2,403 | 898 |
| `js/theme.js` | 1,835 | 668 |
| `assets/avatar.svg` | 1,275 | 496 |
| `assets/favicon.svg` | 322 | 224 |
| **Total** | **26,642** | **9,096** |

Before and after are the same, because no file was changed in this milestone. Total is about 26 KB raw and about 9 KB compressed, with 9 requests.

## 4. Items reviewed

| Item | Finding |
|------|---------|
| Meta description, `lang`, viewport, title | Present (SEO scored 100). |
| Image size and CLS | The only `img` has `width="400" height="400"`; CLS = 0 in the run. |
| Render-blocking resources | 4 small CSS files and `js/theme.js` in `<head>`. `theme.js` is intentionally synchronous (1.8 KB): it sets `data-theme` before first paint, which prevents a flash of the wrong theme. TBT is 0 ms, so the cost is not measurable. `contact-form.js` is a module, which is deferred by default. |
| `fetchpriority="high"` on the image | Not added. The measured LCP is 1.1 s and the image is a 1.3 KB SVG. The LCP element was not identified in this audit, so there is no evidence that the hint would help. |
| SVG minification | `avatar.svg` is 1,275 bytes (496 gzipped). Removing whitespace would save a few hundred bytes raw and almost nothing after compression. Not worth the churn. |
| Unused CSS or JS | No dead code found while reading the files for M1 to M3. |
| External resources | None (no CDN, no web fonts, system font stack). |
| `theme-color` meta tag | Not added. It is not required for the 100 scores and was not part of any failing audit. |

## 5. Changes

None. No HTML, CSS, JS or SVG file was modified, because no failing audit has a cause in the project code and the other scores are already 100.

## 6. Budgets

| Metric | Budget | Status |
|--------|--------|--------|
| LCP | under 2.0 s on Fast 3G (from `TASK_DECOMPOSITION.md`) | Measured 1.1 s in the Lighthouse mobile run (Live Server, local). The Fast 3G budget was not measured separately. |
| CLS | 0 | Measured 0. |
| TBT | no budget set in the spec | Measured 0 ms. |
| INP | no budget in the spec. Proposed: 200 ms or less (the common "good" threshold). | Not measured. Lighthouse does not report INP, and the page has little JavaScript (one click handler and one submit handler). |
| Page weight | no budget in the spec | About 26 KB raw, about 9 KB gzip. |

## 7. Re-measurement

The "after" scores were not measured again, because no code changed. The Best Practices score of 92 is expected to rise to 100 on a server that does not inject scripts; this has not been tested.
