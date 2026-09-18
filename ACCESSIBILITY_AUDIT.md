# Accessibility Audit: civic-os.org

**Date**: September 18, 2026
**Standard**: WCAG 2.2 Level AA
**Tools**: IBM Equal Access (ace.js), Playwright browser automation, manual inspection
**Scope**: All 11 public pages on civic-os.org
**Stack**: WordPress 6.x + Elementor + Hello Elementor parent theme + `civic-os-child` child theme v1.2.4

---

## Executive Summary

The site has a solid accessibility foundation via the child theme (focus rings, skip link, reduced motion, some contrast fixes), but **three systemic issues** affect every page and several page-specific problems need attention.

**By the numbers:**
- 11 pages scanned
- 424 total FAIL results across all pages
- 3 rule categories account for 98% of failures
- 0 critical keyboard blockers (all pages navigable, dropdowns have fallback links in footer)

| Severity | Count | Description |
|----------|-------|-------------|
| Serious | 5 | Affect usability for assistive technology users |
| Moderate | 6 | Systemic patterns that reduce accessibility |
| Minor | 4 | Polish items and best practices |

---

## What's Done Right (Preserve)

The child theme already handles these well:

1. **Keyboard focus indicators** — 3px `:focus-visible` outline (#186C90, 5.86:1 contrast) on all interactive elements
2. **Skip link** — Properly revealed on focus with 7.82:1 contrast green background
3. **Reduced motion** — `prefers-reduced-motion: reduce` kills all animations/transitions globally via `!important`
4. **Font loading** — `font-display: swap` on all faces prevents invisible text flash
5. **Self-hosted fonts** — No external CDN dependencies, fast loading
6. **Logical CSS properties** — `padding-block`, `margin-inline` for RTL support
7. **Image alt text** — All images have descriptive, meaningful alt attributes
8. **Form labels** — Contact form inputs all have proper `<label for="">` associations with visible text
9. **Page titles** — Every page has a unique, descriptive `<title>`
10. **Single h1 per page** — All 11 pages have exactly one h1

---

## Serious Issues

### S1. No Landmark Elements (All Pages)

**Rule**: `aria_content_in_landmark` — **340+ failures across all pages**

The entire site lacks semantic landmark elements. There is no `<main>`, `<header>` (banner), or `<footer>` (contentinfo) element. Only one `<nav>` exists. Screen reader users cannot jump between page regions.

**Root cause**: Hello Elementor's container-based layout uses `<div>` elements exclusively. Elementor does not output `<main>`, `<header>`, or `<footer>` by default.

| Page | FAIL count |
|------|-----------|
| `/field-story-ffsc/` | 63 |
| `/field-story-mott-park/` | 63 |
| `/about/` | 44 |
| `/features/` | 43 |
| `/` (home) | 34 |
| `/woven/` | 25 |
| `/team/` | 23 |
| `/contact/` | 21 |
| `/pricing/` | 20 |
| `/privacy-policy/` | 18 |
| `/terms-of-service/` | 18 |

**Fix**: Add landmark roles via child theme CSS cannot do this — requires either:
- **Option A (Recommended)**: Add `role="banner"`, `role="main"`, `role="contentinfo"` via a small JavaScript snippet in the child theme that targets Elementor's header/body/footer containers
- **Option B**: Use Elementor's "HTML Tag" setting on the outermost containers (set header container to `<header>`, content to `<main>`, footer to `<footer>`)
- **Option C**: Add a `functions.php` filter to wrap Elementor output in semantic landmarks

### S2. Color Contrast Failures — Footer and Buttons (All Pages)

**Rule**: `text_contrast_sufficient` — **5–8 failures per page**

Three distinct contrast problems, all involving the unfixed **#6BC4EA** (light blue) color:

#### S2a. Footer headings: #6BC4EA on #F8F9FA = 1.86:1

Footer h3 elements ("Quick Links", "Our Values", "Get In Touch") use `rgb(107, 196, 234)` (#6BC4EA) on a near-white background `rgb(248, 249, 250)` (#F8F9FA). Contrast ratio: **1.86:1** (needs 3:1 for large text, 4.5:1 for normal).

The child theme fixed footer links and the GitHub button from #6BC4EA to #186C90, but **missed the footer headings**.

**Fix** (child theme CSS):
```css
.elementor-location-footer h3 {
  color: #186C90; /* Link Blue: 5.86:1 on #F8F9FA */
}
```

#### S2b. Footer social icon: white on #6BC4EA = 1.96:1

The GitHub icon in the footer has white text/icon on `rgb(107, 196, 234)` (#6BC4EA) background. The child theme's `.elementor-location-footer .footer-social a { background: #186C90 }` rule **is not being applied** — the computed background is still #6BC4EA. Likely an Elementor inline style or specificity issue.

**Fix** (child theme CSS — increase specificity):
```css
.elementor-location-footer .footer-social a,
.elementor-location-footer .footer-section .footer-social a {
  background: #186C90 !important;
}
```

#### S2c. Contact form submit button: white on #6BC4EA = 1.96:1

The "Send Message" button uses white text on #6BC4EA background. This is the Elementor Forms default button color that was never overridden.

**Fix** (child theme CSS):
```css
.elementor-form .elementor-button {
  background-color: #2C5B44; /* CTA Green: 7.82:1 with white */
}
```
Or change the button color in Elementor's form widget settings.

#### S2d. Body text on hero gradient: 4.49:1 (barely failing)

Paragraph text `rgb(81, 81, 81)` (#515151) on the hero section achieves only 4.49:1 — just under the 4.5:1 AA minimum.

**Fix**: Darken body text slightly to #4D4D4D (4.63:1) or #484848 (4.83:1).

### S3. Dropdown Menus — No ARIA, Mouse-Only Reveal (Header Nav)

The "About" and "Field Stories" navigation dropdowns are completely inaccessible to keyboard and screen reader users:

- **Trigger links use `href="javascript:void(0)"`** — not real links, not buttons
- **No `aria-expanded`** — screen readers can't tell if submenu is open
- **No `aria-haspopup`** — no indication a submenu exists
- **No keyboard trigger** — submenus appear on hover only (`display: none` → shown on `:hover`)
- **Submenu has no `role` or `aria-label`**

**Impact**: Keyboard users cannot access About Us, Team, Features (via About dropdown) or Mott Park, Flint Freedom Schools (via Field Stories dropdown). These pages ARE accessible via footer links, which partially mitigates the issue.

**Fix**: This requires changes in Elementor's nav menu widget settings or custom JavaScript:
1. Change trigger elements to `<button>` with `aria-expanded="false"` and `aria-haspopup="true"`
2. Toggle `aria-expanded` on click/Enter/Space
3. Add keyboard support: Enter/Space opens submenu, Escape closes, arrow keys navigate items
4. Or: switch to an accessible WordPress nav menu plugin

### S4. Heading Level Skips (4 Pages)

| Page | Skip | Issue |
|------|------|-------|
| `/about/` | h1 → h3 | "Mission over profit" is h3 immediately after h1 |
| `/contact/` | h1 → h3 | "Other Ways to Connect" is h3 after h1 |
| `/pricing/` | h1 → h3 | Only footer h3s exist, no body h2 |
| `/field-story-ffsc/` | h1 → h6 → h5 | Labels ("ORGANIZATION", "LOCATION") use h6; values use h5 |
| `/field-story-mott-park/` | (same pattern) | Same field story template |

The field story pages are the worst offenders — h6 is used as a small label, h5 as a value, and h4 for card titles. Heading levels are being used for visual styling rather than document structure.

**Fix**: Change heading levels in Elementor:
- About: "Mission over profit" → h2
- Contact: "Other Ways to Connect" → h2
- Field stories: Replace h6 labels with `<span>` or `<p>` with CSS classes; replace h5 values with `<p>`; replace h4 card titles with h3

### S5. SVG Icons — No Accessible Name (All Pages)

**Rule**: `svg_graphics_labelled` — **2 per page (22 total)**

The GitHub SVG icons in the header and footer nav have no accessible name. Screen readers expose them as unlabelled graphics.

**Fix**: Add `aria-hidden="true"` to decorative SVGs inside links that already have text labels, or add `<title>` / `aria-label` to informational SVGs:
```html
<!-- If the link already has text "GitHub": -->
<svg aria-hidden="true" ...>

<!-- If the SVG is the only content: -->
<svg role="img" aria-label="GitHub">
  <title>GitHub</title>
  ...
</svg>
```

---

## Moderate Issues

### M1. External Links — No New-Tab Indication

Three `target="_blank"` links (GitHub header, GitHub footer, AGPL footer) open in a new tab with no indication to screen reader users. All have `rel="noopener noreferrer"` (good for security) but no "opens in new tab" text.

**Fix**: Add screen-reader-only text:
```html
<a href="..." target="_blank" rel="noopener noreferrer">
  GitHub <span class="screen-reader-text">(opens in new tab)</span>
</a>
```

### M2. Contact Form — No Fieldset Grouping

The contact form has 12 fields with no `<fieldset>` or `<legend>` elements. Related fields (name pair, organization pair) should be grouped.

**Fix**: In Elementor form widget, this may not be configurable. Could add via JavaScript or accept as an Elementor limitation.

### M3. Contact Form — Redundant ARIA Attributes

Five form fields have both `required` and `aria-required="true"`. This is redundant (modern screen readers read `required` natively) but harmless. Elementor adds both by default.

**Fix**: Low priority. Elementor generates this; not easily changed without a plugin filter.

### M4. Mobile Menu Button — Missing `aria-expanded`

The hamburger menu button (`<button aria-label="Toggle menu">`) lacks `aria-expanded` to indicate open/closed state.

**Fix**: Elementor should handle this, but verify the mobile menu JavaScript toggles `aria-expanded` on click. If not, add via child theme JavaScript.

### M5. CSP Blocks Google Fonts Stylesheet

The Content Security Policy `style-src 'self' 'unsafe-inline'` blocks the Google Fonts stylesheet (`fonts.googleapis.com`). The child theme self-hosts fonts (good!), but the parent theme still tries to load Google Fonts, producing console errors. Not an accessibility issue per se, but indicates the parent theme's Google Fonts enqueue should be dequeued.

**Fix** (child theme `functions.php`):
```php
add_action('wp_enqueue_scripts', function() {
    wp_dequeue_style('hello-elementor-fonts');
}, 30);
```

### M6. Background Gradient Image — No Text Alternative

The hero section uses a CSS background gradient (`background_background: gradient`). IBM Equal Access flags this as needing a text alternative in Windows high contrast mode. Since the gradient is decorative (text content above it conveys meaning), this is low priority.

**Fix**: Add `role="presentation"` to the gradient container if purely decorative.

---

## Minor Issues

### N1. Blockquote Without `cite` Attribute (Home Page)

The testimonial blockquote lacks a `cite` attribute linking to the source. The attribution is in a separate paragraph below.

**Fix**: Add `cite` attribute or wrap attribution in `<cite>` element.

### N2. "Civic OS" Footer Logo — Text Block Heading Warning

IBM Equal Access flags "Civic OS" in the footer as potentially being a heading. Since it's a brand logo/name with an image, this is a false positive.

**Action**: No fix needed.

### N3. Copyright Year

Footer shows "© 2025" but it's 2026. Not an a11y issue.

**Fix**: Update in Elementor footer template.

### N4. Stale Blog Post

`/2024/03/08/hello-world/` (default WordPress "Hello World" post) is publicly accessible and indexed in the sitemap. Should be deleted or unpublished.

**Fix**: Delete or draft the post in WordPress admin.

---

## Page-by-Page Automated Scan Summary

| Page | FAILs | POTENTIALs | MANUALs | Top Failure |
|------|-------|------------|---------|-------------|
| `/` | 42 | 12 | 2 | Landmarks (34) |
| `/about/` | 52 | 9 | 2 | Landmarks (44) |
| `/team/` | 30 | 8 | 2 | Landmarks (23) |
| `/features/` | 51 | 6 | 2 | Landmarks (43) |
| `/pricing/` | 27 | 7 | 1 | Landmarks (20) |
| `/contact/` | 36 | 17 | 1 | Landmarks (21) |
| `/woven/` | 34 | 8 | 2 | Landmarks (25) |
| `/field-story-ffsc/` | 72 | 10 | 1 | Landmarks (63) |
| `/field-story-mott-park/` | 72 | 10 | 1 | Landmarks (63) |
| `/privacy-policy/` | 25 | 9 | 1 | Landmarks (18) |
| `/terms-of-service/` | 25 | 12 | 1 | Landmarks (18) |
| **Total** | **466** | **108** | **16** | |

### Known False Positives (Excluded)

| Rule | Why False | Pages |
|------|-----------|-------|
| `style_color_misuse` | WordPress emoji stylesheet; generic warning | All |
| `text_sensory_misuse` | Content descriptions ("small governments", "right-to-left"), not sensory instructions | Various |
| `text_block_heading` on "Civic OS" | Footer brand logo, not a heading | All |
| `html_skipnav_exists` | Skip link exists and works | Privacy, Terms |

---

## Remediation Plan

### Priority 1 — Child Theme CSS (Quick Wins)

These fixes go in `assets/css/accessibility.css`:

| Issue | Fix | Impact |
|-------|-----|--------|
| S2a. Footer heading contrast | `.elementor-location-footer h3 { color: #186C90; }` | 33 failures fixed |
| S2b. Footer social icon contrast | `.footer-social a { background: #186C90 !important; }` | 11 failures fixed |
| S2c. Submit button contrast | `.elementor-form .elementor-button { background-color: #2C5B44; }` | 1 page fixed |

### Priority 2 — Elementor Content Edits

These require editing pages in Elementor:

| Issue | Fix | Pages |
|-------|-----|-------|
| S4. Heading skips | Change heading levels in widgets | About, Contact, Pricing, Field Stories |
| S5. SVG icons | Add `aria-hidden="true"` or `aria-label` | Header/Footer templates |
| M1. External links | Add sr-only "opens in new tab" text | Header/Footer templates |
| N3. Copyright year | Update "2025" to "2025–2026" | Footer template |

### Priority 3 — Theme/Plugin Changes

| Issue | Fix | Effort |
|-------|-----|--------|
| S1. No landmarks | Add `role` attributes via JS or Elementor HTML tag settings | Medium |
| S3. Dropdown ARIA | Custom JS for `aria-expanded`/`aria-haspopup` + keyboard | Medium |
| M4. Mobile `aria-expanded` | Verify Elementor JS or add custom handler | Low |
| M5. Google Fonts dequeue | `wp_dequeue_style()` in functions.php | Low |

### Priority 4 — Low Priority / Accept

| Issue | Action |
|-------|--------|
| M2. Form fieldset grouping | Accept as Elementor limitation |
| M3. Redundant aria-required | Accept as Elementor default behavior |
| M6. Background gradient a11y | Add `role="presentation"` if desired |
| N1. Blockquote cite | Add cite attribute in content |
| N4. Stale blog post | Delete or draft |

---

## Verification Checklist

After fixes:
- [ ] Re-run IBM Equal Access on all pages — target zero FAILs (except accepted items)
- [ ] Full keyboard tab-through: Home, About, Contact, Field Story
- [ ] VoiceOver walkthrough of home page + contact form
- [ ] Lighthouse accessibility score ≥ 95 on all pages
- [ ] Verify footer heading contrast with DevTools color picker
- [ ] Verify submit button contrast on contact page
- [ ] Test dropdown keyboard behavior (if JS fix applied)
- [ ] Test mobile hamburger menu open/close announces state
