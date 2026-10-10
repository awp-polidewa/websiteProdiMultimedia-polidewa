# Browser Interaction Notes — Google Antigravity

**Source:** [https://antigravity.google/](https://antigravity.google/)  
**Observed:** 2026-10-09, public website, no login.  
**Viewports:** desktop 1280×720; mobile 390×844 (390 CSS px viewport; document content width measured 375px).

## Captured observations

### Desktop first view

- Fixed white header is about 52px high. Brand mark starts about 72px from the left; navigation is centered between logo and right-side rocket/Download controls.
- The hero uses centered branding, a large two-line headline, and a dark pill-shaped Download CTA. Tiny colored points cover the visible hero canvas.
- A media frame follows the hero. The HTML video is muted, looping, about 15.13 seconds long, and was playing during inspection.
- Sampled body font is Google Sans Flex at 16px/24px; body text is `rgb(18,19,23)`.

### Mobile first view and scroll

- Inline desktop navigation is replaced by brand, rocket link, and a dark rounded menu toggle. The header is fixed and 52px high.
- Hero headline wraps to three lines at a measured 37.6px/41.36px. The primary desktop download action becomes a pale informational card with a “Send link to desktop” action.
- Intro video is 356×200px with 24px corner radius; play control sits over the lower-right area.
- Product headings and descriptions stack vertically, followed by large square product imagery. At 390px viewport width, document content measured 375px; no horizontal overflow was measured.
- Downward scrolling moved the mobile header above the viewport. At the page top it was visible again. Exact behavior/threshold when reversing direction was not measured.

### Clicks and controls

- Clicking the mobile menu toggle opens a white full-width menu panel with thin row separators. Product, Use Cases, and Resources have accordion controls; expanding Products reveals nested product links and a “See overview” action. The menu toggle closes the panel.
- Clicking “Play intro” opens a dimmed full-page overlay with a “Close video” button. The player iframe was `about:blank` in the accessibility tree during this test; successful YouTube playback is unverified. Closing the dialog returns to the page.
- Use-case and blog sliders expose Previous/Next controls. A carousel transition was not verified; a browser click did not complete reliably, so slide content/timing remains unknown.
- A pointer drag was made over the hero. The particle canvas remained visible, but no reproducible correlation between pointer motion and particle changes was established.
- Hover styles, keyboard navigation, focus treatment, Escape-to-close, and reduced-motion preferences were not systematically tested.

## Public assets observed

The rendered document linked Google Fonts stylesheets for Google Sans Flex, Google Sans Code, and Google Symbols, plus public Astro CSS resources for the base layout, smooth scrolling, mobile/desktop journey, custom cursor, and homepage. Public script names included `MainParticlesComponent`, `MorphingParticlesComponent`, `CustomCursor`, `SmoothScrollLayout`, `MobileDesktopJourney`, `FeatureExplorerNew`, `Slider`, `UseCases`, and `YoutubeVideoSection`.

Visible image/video references included the Antigravity cursor PNG, product screenshots, use-case thumbnails, the hero video (`assets/video/hero_video.mp4`), and a feature video (`assets/video/landing/an-ai-ide-core.mp4`). These URLs are evidence only. Do not copy/download these proprietary assets into another project without permission.

The reference's CSS files were linked and computed styles were inspected in-browser. Direct navigation to a CSS asset was blocked by the browser, so non-computed style rules and source-level animation parameters remain **UNKNOWN**. No private source was accessed.

## Screenshot preservation

Desktop and mobile views were inspected in the browser during this task; no screenshot asset was added to the project. This avoids copying proprietary page imagery. The viewport measurements and observations above preserve the implementation-relevant evidence. Source page: [antigravity.google](https://antigravity.google/).
