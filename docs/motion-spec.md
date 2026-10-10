# Motion Specification — Google Antigravity Reference

Reference: [antigravity.google](https://antigravity.google/), browser observations captured 2026-10-09. Exact timing and easing were not available for most animations; estimates are explicitly labeled. See [interaction notes](references/interaction-notes.md).

## Hero particle field

| Property | Specification |
|---|---|
| Target | Full-area Canvas in the hero; measured `1265×720px` at desktop 1280×720. |
| Initial state | White field with many tiny, sparse colored particles. **OBSERVED** on first load. |
| Trigger | Field is already animated while the page is open. Public page loads `MainParticlesComponent` and `CustomCursor` scripts. Pointer-to-particle trigger relationship is **UNKNOWN**; one pointer drag did not establish a reproducible response. |
| Visual behavior | Small low-contrast blue/cyan/violet/warm points drift across the open white field. **OBSERVED** across page captures; exact movement algorithm is **UNKNOWN**. |
| Transform / opacity | Individual particle displacement, size, opacity, and color are not measured. **UNKNOWN**. |
| Duration / easing | Continuous; timing/easing **UNKNOWN**. |
| Reverse | No discrete reverse transition observed. |
| Mobile | Particle field remains visible behind the mobile hero. **OBSERVED**. Exact mobile density/algorithm **UNKNOWN**. |
| Reduced motion | **UNKNOWN**; must be tested independently. |
| Evidence / confidence | Rendered desktop/mobile screenshots, DOM Canvas (`1265×720` desktop), public script name. High confidence for presence/coverage; low confidence for pointer response/timing. |

## Hero video

| Property | Specification |
|---|---|
| Target | Rounded video in the intro media section (`.landing-video`). |
| Initial state | Visible media frame inside a dark rounded rectangle. **OBSERVED**. |
| Trigger | Starts playing while the homepage is open; browser video state showed `paused=false`, `muted=true`, `loop=true`, `duration≈15.13s`. `autoplay` attribute is false, so the precise start mechanism is **UNKNOWN**. |
| Transform / opacity | No transition measured; the video frames change as playback continues. |
| Duration / easing | Loop duration about 15.13s (**OBSERVED** from media metadata); easing not applicable/unknown. |
| Reverse | Loops; no reverse playback observed. |
| Mobile | Visible, scaled to about `356×200px`, radius `24px`. **OBSERVED**. |
| Evidence / confidence | Browser `HTMLVideoElement` state and screenshots. High confidence. |

## Intro video dialog

| Property | Specification |
|---|---|
| Target | Full-page overlay and YouTube player dialog, opened by “Play intro”. |
| Initial state | Closed; trigger button shown beside/below hero media. |
| Trigger | Click “Play intro”. **OBSERVED**. |
| Final state | Dark translucent page overlay, video-player region, and a labeled “Close video” button. **OBSERVED**. The embedded frame reported `about:blank` during this observation, so successful media loading is **UNKNOWN**. |
| Transform / opacity | Overlay dims the page; exact opacity/transform **UNKNOWN**. |
| Duration / easing | Open/close timing **UNKNOWN**. |
| Reverse | Click “Close video” returns to the homepage. **OBSERVED**. Focus restoration and Escape-key handling **UNKNOWN**. |
| Mobile | Dialog opened at mobile width and covered/dimmed the viewport. **OBSERVED**. |
| Evidence / confidence | Direct click and browser accessibility tree. High confidence for state/content, unknown for transition details. |

## Mobile navigation

| Property | Specification |
|---|---|
| Target | Fixed 52px header menu toggle and full-width navigation panel. |
| Initial state | Header visible at top; menu closed. **OBSERVED**. |
| Trigger | Click “Toggle navigation menu”; click Products/Use Cases/Resources to expand. **OBSERVED**. |
| Final state | White menu panel with separated rows; accordion reveals nested links and an overview action. **OBSERVED**. |
| Transform / opacity | No exact transition measured. **UNKNOWN**. |
| Duration / easing | **UNKNOWN**. |
| Reverse | Click menu toggle to close; accordion collapse control exposed. **OBSERVED**. |
| Scroll behavior | Header was above viewport during downward scroll and visible again at the top after returning upward. Thresholds and direction logic **UNKNOWN**. |
| Desktop | Desktop navigation is visible inline at 1280px; dropdown hover/click state was not fully verified. |
| Evidence / confidence | Direct mobile menu/accordion clicks and screenshots. High confidence for states; low for motion details. |

## Smooth page scrolling

| Property | Specification |
|---|---|
| Target | Main page content (`smooth-content` wrapper). |
| Initial state | Current scroll position. |
| Trigger | User scroll gesture. **OBSERVED**; the page loads a public `SmoothScrollLayout` script. |
| Final state | Content reaches the requested scroll location. **OBSERVED**. |
| Transform / opacity | Any smoothing transform/interpolation is **UNKNOWN**; no section fade/translate was confirmed. |
| Duration / easing | **UNKNOWN**. |
| Reverse | Scrolling upward returns toward earlier sections. **OBSERVED**; exact interpolation **UNKNOWN**. |
| Mobile | Scrolling works; the mobile header is hidden above the viewport on downward movement. **OBSERVED**. |
| Evidence / confidence | Scroll interactions, `smooth-content` DOM wrapper, public script name. High confidence for scroll behavior, low for easing details. |

## Use-case and blog carousels

| Property | Specification |
|---|---|
| Target | Use-case persona area and latest-blog cards. |
| Initial state | A first slide/card set and Previous/Next controls; Previous is disabled on the first use-case slide. **OBSERVED**. |
| Trigger | Previous/Next button click. Controls are present and accessible by name. **OBSERVED**; a click did not complete reliably in the browser session. |
| Final state | **UNKNOWN**; subsequent slide content was not verified. |
| Transform / opacity | **UNKNOWN**. |
| Duration / easing | **UNKNOWN**. |
| Reverse | Previous/Next controls imply reverse/forward navigation, but behavior was not verified. |
| Mobile | Controls exist in the page accessibility tree; touch/swipe behavior **UNKNOWN**. |
| Evidence / confidence | Rendered accessibility tree. High confidence for controls, low/unknown for transition behavior. |

## Page scrolling and other motion

- Button hover, link hover, focus transitions, and section reveal effects were not measured. Do not invent transforms, durations, or easing curves.

## Reduced motion and implementation notes

No `prefers-reduced-motion` behavior was verified. A separate implementation should honor reduced motion by disabling or simplifying nonessential particle drift, smooth scrolling, and autoplaying media where practical, but treat that as an accessibility requirement for the new project—not an observed property of the reference.
