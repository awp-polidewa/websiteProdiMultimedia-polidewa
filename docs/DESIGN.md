# Google Antigravity Landing Page — Reference Design

**Purpose:** visual and interaction reference for a separate implementation. This records the public homepage as inspected on 2026-10-09; it is not Google design guidance. Findings are tagged **OBSERVED** (direct browser/DOM evidence), **ESTIMATED** (visual approximation), or **UNKNOWN** (not verified). See [interaction notes](references/interaction-notes.md) for evidence and limits.

Reference: [antigravity.google](https://antigravity.google/). Public assets and stylesheets were inspected through the rendered page's DOM/computed styles. No private source or internal design documentation was accessed. Do not copy the reference site's images, video, logo, or other proprietary assets into another project without permission.

## Visual principles

- **OBSERVED:** white, spacious surfaces; dark near-black text; sparse accents; large centered headlines; pill-shaped primary actions; rounded product media. The colorful particle field is the main decorative motion.
- **ESTIMATED:** the overall tone is editorial and product-led: high contrast in the hero, then quieter text/media sections with large vertical separation. Keep decoration secondary to the content.
- **UNKNOWN:** exact spacing scale, desktop max-width tokens, and official palette definitions. Do not treat sampled pixels or computed colors as a complete brand token system.

## Page structure and hierarchy

1. **Fixed header:** brand mark, desktop links (Products, Use Cases, Pricing, Enterprise, Resources), remote-control icon/link, Download pill. Mobile replaces the desktop links with a menu button.
2. **Hero:** centered brand mark, one large two-line desktop headline, primary Download action. On mobile the headline wraps to three lines and the download action becomes an informational desktop-download card with “Send link to desktop”.
3. **Intro media:** wide, dark, rounded looping product video with a Play intro control.
4. **Agent-first introduction:** horizontal sequence of product glyphs, followed by a centered statement and supporting copy.
5. **Product explorer:** Antigravity 2.0, CLI, SDK, and IDE descriptions with product imagery. Mobile presents these as a vertical sequence; desktop presentation may be more compact/interactive.
6. **Use cases:** heading and intro, persona cases (Full stack, Enterprise, Frontend), case media, and previous/next controls.
7. **Conversion panels:** developer download and organization information.
8. **Latest Blogs:** heading, View blog link, dated article cards and carousel controls.
9. **Download section:** platform/download information, followed by a multi-column product/resources footer.

Items 1–9 are **OBSERVED** in the accessibility tree or rendered page. Exact desktop arrangement of product and blog cards is **UNKNOWN** beyond the portions visible during inspection.

## Typography and color

- **OBSERVED:** loaded font stylesheets include Google Sans Flex, Google Sans Code, and Google Symbols. The sampled body style is `16px / 24px Google Sans Flex, Google Sans, sans-serif`; the mobile hero heading is `37.6px / 41.36px`, weight 450. See [design tokens](design-tokens.md).
- **OBSERVED:** sampled main text is `rgb(18 19 23)` (`#121317`); navigation text is `rgb(69 71 77)` (`#45474D`); primary Download is `#121317` with white text. Base page is white.
- **OBSERVED:** blue, cyan, violet, and warm particle accents appear in the hero field and product media. The reference includes video and image assets; do not infer their exact colors as CSS tokens.
- **UNKNOWN:** full font axis settings for each component, official color names/values, and complete type scale. Use the loaded font references and observed hierarchy; do not invent a broader palette.

## Layout and responsive behavior

- **OBSERVED, desktop 1280×720:** fixed header is about 52px high; logo begins about 72px from the left edge. Hero content is centered, with a large headline and compact black pill CTA. Hero particle canvas covers the viewport-sized hero area.
- **OBSERVED, mobile 390×844:** page content uses a single column, the layout viewport content width measured 375px, and the page did not exceed that width. Hero heading measured 343px wide; intro video measured 356×200px with a 24px radius. Product descriptions and images stack vertically.
- **OBSERVED:** mobile menu opens beneath the fixed header as a white full-width panel with thin separators. Product, Use Cases, and Resources expand as accordions.
- **ESTIMATED:** maintain generous desktop whitespace and roughly 16px mobile side gutters. Re-measure at target breakpoints before implementation.
- **UNKNOWN:** exact breakpoints, desktop container max-width, and all tablet transitions.

## Component states and interaction

- Header: desktop navigation and download link; mobile closed/open menu; nested accordion collapsed/expanded.
- Intro media: looping muted inline video; Play intro opens a darkened full-page dialog with a Close video button.
- Use-case and blog areas expose previous/next slide buttons. Only the presence of controls was verified; slide timing/animation was not.
- The mobile header was visible at the page top and hidden above the viewport during a downward scroll. Exact hide threshold and reverse-scroll threshold were not measured.
- Button hover/focus appearance was not systematically measured. Do not invent hover transforms or transition timings.

## Animation, accessibility, and reduced motion

The hero contains a full-area Canvas element and a moving particle field. The page also loads public scripts named `MainParticlesComponent`, `MorphingParticlesComponent`, `CustomCursor`, and `SmoothScrollLayout`; names are evidence of loaded assets, not proof of each script's exact behavior. See [motion specification](motion-spec.md).

**OBSERVED:** navigation menu and video close controls have accessible names; the page uses a single top-level hero heading and a following section heading. Product imagery includes descriptive alt text. **UNKNOWN:** complete keyboard path, focus trap/return behavior in the video dialog, contrast ratios, and `prefers-reduced-motion` behavior. These must be tested before copying interaction patterns.

## Implementation constraints for a separate project

- Keep the destination project's framework, components, routing, and design system. This brief is descriptive, not permission to migrate its stack.
- Recreate geometry and motion with project-owned code/assets. Do not copy proprietary logo, images, videos, fonts, or SVGs without permission.
- Treat measurements as snapshots, not hard-coded requirements where responsive behavior suggests fluid sizing.
- Implement reduced-motion and keyboard behavior from the destination project's accessibility requirements; the reference's reduced-motion response is not verified.

## Verification checklist

- [ ] Compare desktop hero, fixed header, product/media hierarchy, and footer at 1280px and a wider desktop viewport.
- [ ] Compare mobile header/menu, hero line wrapping, video, and stacked product content at 390px.
- [ ] Check intermediate/tablet widths for overflow and navigation transitions.
- [ ] Test menu, accordion, intro dialog close/open, carousel buttons, hover, focus, and keyboard operation.
- [ ] Test scrolling down and up; verify the fixed mobile header behavior.
- [ ] Test particle/video behavior and `prefers-reduced-motion`; do not assume unverified timing values.
- [ ] Use only licensed/project-owned assets and fonts.
