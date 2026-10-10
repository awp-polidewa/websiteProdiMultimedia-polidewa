# Particle Motion Specification — Antigravity Reference

## Scope and evidence labels

This document records the publicly observable particle behavior on the [Google Antigravity homepage](https://antigravity.google/) and separates it from the existing TRM implementation. It is an observation record, not a claim about Google's private source or an official design specification.

**Reference observation date:** 2026-10-09. **Viewports:** desktop 1280×720 and mobile 390×844. Findings use:

- **OBSERVED** — seen directly in the rendered site or browser interaction.
- **MEASURED** — directly read from viewport/DOM geometry or browser media state.
- **ESTIMATED** — visual approximation from the captures; not a source value.
- **UNKNOWN** — not reliably observable in this session. Do not treat as an implementation requirement.

Confidence describes confidence in the observation, not access to the reference source code.

## What is observable

### Shape and distribution

- **OBSERVED — high confidence:** a particle field is visible over the hero's white background, including open regions around and behind the headline. Most marks are small and low-contrast; a subset is more visible and colored.
- **OBSERVED — medium confidence:** marks read as tiny dots or short irregular dashes in the captures. Their apparent angle and size vary. The samples do not establish that they are all ellipses or that their long axes follow a radial direction.
- **ESTIMATED — medium confidence:** distribution looks irregular and clustered, rather than like an obvious evenly spaced grid. It is not uniformly dense; some areas are nearly empty while others show groups of colored marks.
- **UNKNOWN:** particle count, spacing, sampling method, exact shape, dimensions, clustering rule, whether marks are all one particle layer, and any viewport-dependent density rule.

### Basic movement while idle

- **OBSERVED — high confidence:** the visible pattern changes while the page remains open, including after pointer movement has stopped. Consecutive captures show particles in different positions and a changing color distribution.
- **ESTIMATED — low confidence:** motion appears slow and ambient rather than a fast, uniform drift. This is only a visual impression from separated screenshots.
- **UNKNOWN:** direction field, velocity, acceleration, periodicity, lifespan, exact cadence, physics, and whether the changes result from deterministic animation, randomness, or multiple layers. The observation interval was not a calibrated recording.

### Pointer response

- **OBSERVED — high confidence:** pointer drags were made over desktop and mobile hero areas; the particle field remained visible and changed across the captures.
- **UNKNOWN — high confidence that this remains unresolved:** no stable localized response could be distinguished from the field's ongoing idle animation. The observations do not establish a cursor-centered halo, radial wave, trail, repulsion, attraction, or direct size/color response. They also do not establish pointer speed sensitivity or a settle/reverse curve.
- **Mobile limitation:** mobile checks used browser pointer-drag input, not a physical touchscreen/touch event. Touch and coarse-pointer behavior remain **UNKNOWN**.

Do not translate “the field changed after a drag” into “the pointer caused the change”; the idle field was already moving.

### Size, deformation, color, and opacity

- **OBSERVED — medium confidence:** most marks remain visually subtle against white. Blue and cyan are prominent; violet and warm pink/orange accents also appear. A few marks are darker or more saturated than their neighbors.
- **ESTIMATED — low confidence:** marks are only a few screen pixels in the captured browser images. Screenshot scaling and anti-aliasing make this unsuitable as a source measurement.
- **UNKNOWN:** source-pixel particle dimensions, per-particle alpha, color values, color interpolation, blending mode, enlargement, elongation, rotation rules, displacement, and whether any deformation is tied to the pointer.

### Relationship with scroll

- **MEASURED — high confidence:** at desktop 1280×720 the first hero canvas measured about 1265×720px (the content width is narrower than the viewport because of the vertical scrollbar). At mobile 390×844 it measured 375×511px.
- **MEASURED — high confidence:** after mobile scroll reached `scrollY=844`, the hero canvas top was approximately `-844px`; scrolling back to `scrollY=0` returned its top to `0px`. The hero particle surface therefore moves with the document/hero in the tested mobile case; it was not fixed to the viewport during this observation.
- **OBSERVED — medium confidence:** no particle parallax, pinned particle canvas, scroll-progress deformation, or scroll-triggered particle transition was visible in the tested down/up movement.
- **UNKNOWN:** whether the particle field changes speed, opacity, or direction at intermediate scroll positions, and whether other canvases elsewhere on the page are related effects. The page contains additional canvases, so only the first hero canvas is described here.

The separate mobile header hide/reveal behavior is navigation behavior, not evidence of scroll-linked particle animation.

### Desktop and mobile comparison

| Item | Desktop 1280×720 | Mobile 390×844 | Confidence |
|---|---|---|---|
| First hero canvas bounds | about 1265×720px | about 375×511px | **MEASURED** |
| Particle visibility | Visible across white hero | Visible, subtle behind hero content | **OBSERVED** |
| Responsive density/shape change | Not isolated | Not isolated | **UNKNOWN** |
| Pointer interaction | Mouse drags sampled; causal response unclear | Browser mouse drags sampled; touch not tested | **UNKNOWN** |
| Scroll attachment | No pinned behavior established | Canvas scrolled with hero | Desktop scroll relationship not separately measured |

## Performance and reduced motion

- **OBSERVED — high confidence:** the public document contains Canvas elements. This confirms a canvas surface, but not its rendering context, particle data structure, or frame loop.
- **UNKNOWN:** frame rate, device-pixel-ratio handling, visibility pause behavior, draw-call count, CPU/GPU use, and reduced-motion response in the reference.
- No source-level CSS/JS values or private implementation were verified. Public script names and a Canvas element are not sufficient evidence for the algorithm.
- For a new implementation, reduced-motion behavior is a product/accessibility decision until the reference is directly verified. Do not claim it matches the reference.

## Existing TRM implementation — keep separate from reference facts

The current TRM homepage uses [`OvalDotsBackground.svelte`](../frontend/src/lib/OvalDotsBackground.svelte), imported/rendered only when the route is `/` in [`+layout.svelte`](../frontend/src/routes/+layout.svelte). It is an existing implementation, not a source of Antigravity measurements.

Its observable code structure is:

- Svelte `onMount` obtains a Canvas 2D context; one `requestAnimationFrame` loop draws ellipses with `context.ellipse`.
- `resize()` rebuilds a staggered deterministic grid; `ResizeObserver` and window resize update canvas dimensions. Device-pixel ratio is capped at 2.
- Global `pointermove` updates a target; the frame interpolates the smoothed center and each point. When no pointer has been seen, the target follows a sinusoidal path.
- Up to three age-based radial pulses are spawned from pointer travel or automatic movement. Each point checks pulses and receives a Gaussian band influence; influence affects tilt, alpha, size, radial offset, and palette position.
- The page visibility handler stops/restarts the RAF loop. Unmount cancels it and removes listeners.
- The component canvas is absolutely positioned to fill its parent. The home wrapper owns the Canvas placement; scroll updates the canvas bounds and pointer coordinates. This differs from the measured reference hero canvas bounds and should not be treated as evidence about the reference.

Current TRM constants include **GAP 32px desktop / 38px at widths up to 700px**, pulse speed **490px/s**, Gaussian width **76px**, lifetime **1.65s**, max **3** pulses, pointer spawn threshold/interval **42px / 140ms**, auto threshold/interval **72px / 380ms**, point-center smoothing coefficients **4.2 / 7.3**, and local RGB palette stops. These are **MEASURED IN TRM SOURCE ONLY**—they are design choices in this project and are **not** observed Antigravity values. The TRM implementation also gates pulse spawning under `prefers-reduced-motion`; its continuous RAF/time phase is not fully stopped. Review that separately if the next implementation changes reduced-motion behavior.

Do not create a second particle component or duplicate loop. Any later implementation should first decide whether to retune this component, change its parent/canvas extent, or deliberately preserve the current TRM design.

## New design decisions required before implementation

The reference does not provide enough evidence to resolve these product choices. Obtain approval or record a clearly labeled TRM design choice for each:

1. **Scope/extent:** retain the current whole-homepage background or limit particles to the hero as observed on the reference.
2. **Idle motion:** keep TRM's existing sinusoidal/pulse motion, replace it with a less structured ambient drift, or use another project-owned behavior.
3. **Pointer interaction:** whether to implement any pointer response at all. If yes, choose a direction (radial ripple, displacement, trail, or another effect); none was verified on the reference.
4. **Particle form and density:** dots versus short dashes/ellipses; visual density on desktop and mobile; any permitted size/deformation envelope.
5. **Color and opacity:** whether to retain TRM's current palette or choose a new project-owned palette. Exact Antigravity particle colors/alpha were not measured.
6. **Scroll behavior:** normal document attachment is evidenced for the mobile hero; decide whether TRM should remain full-page or adopt hero-only attachment. No scroll-linked particle transformation is supported by this evidence.
7. **Mobile input:** whether touch movement should affect particles, or whether mobile uses ambient motion only.
8. **Reduced motion:** define the target behavior (for example, freeze, simplify, or hide the field) as an accessibility decision; reference behavior is unknown.

## Evidence log and confidence

- **Desktop idle:** at 1280×720, first hero canvas measured 1265×720; sparse colored marks were visible. **High confidence** for viewport/bounds and presence, **medium/low** for visual descriptors.
- **Desktop short drags:** several short successive drags over the upper hero, followed by a 900ms pause. The field's appearance changed between captures, but no repeatable cursor-local effect was isolated. **High confidence** about the action and ambiguity; **low** about causal response.
- **Desktop long drag:** one long drag across the upper hero, followed by a 900ms pause. Colored marks remained in motion and their arrangement changed; no consistent trail or wave could be measured. **High confidence** for visible change; **low** for any pointer-specific interpretation.
- **Mobile idle and drags:** at 390×844, first hero canvas measured 375×511. Short and long mouse drags did not reveal a distinguishable local effect. This does not test real touch input. **High confidence** for bounds and capture; **low** for pointer response.
- **Mobile down/up:** after scroll to 844, header top was `-52px` and hero canvas top `-844px`; returning to scroll 0 restored header and canvas to top 0. **High confidence** for these positions; no intermediate scroll-linked particle animation was identified.
- **Source access:** DOM, visible rendering, canvas geometry, and public linked resource names were available. Direct CSS asset navigation was blocked in the prior observation session; no private source was inspected. Exact draw algorithm remains **UNKNOWN**.

Reference: [Google Antigravity homepage](https://antigravity.google/). No code or reference media assets are copied by this specification.
