# Observed Design Tokens — Google Antigravity Reference

Snapshot of the public homepage at [antigravity.google](https://antigravity.google/), inspected 2026-10-09. These are sampled render values, not an official Google token set. **OBSERVED** means measured in the browser; **ESTIMATED** means visual approximation; **UNKNOWN** means not verified.

## Typography

| Token | Value | Status / evidence |
|---|---|---|
| Body family | `"Google Sans Flex", "Google Sans", sans-serif` | **OBSERVED** computed body stack |
| Body size/line-height | `16px / 24px` | **OBSERVED** sampled body |
| Mobile hero heading | `37.6px / 41.36px`, weight `450`, centered | **OBSERVED** computed at 390×844 |
| Desktop hero heading | Large, centered, light/regular appearance; wraps to two lines at 1280px | **OBSERVED** screenshot; exact computed size **UNKNOWN** |
| Code family | Google Sans Code | **OBSERVED** public Google Fonts stylesheet linked |
| Symbols family | Google Symbols | **OBSERVED** public Google Fonts stylesheet linked |
| Complete type scale / font axes per component | — | **UNKNOWN** |

## Color and surfaces

| Token | Value | Status / evidence |
|---|---|---|
| Page surface | `#FFFFFF` | **OBSERVED** rendered page background |
| Main text | `rgb(18, 19, 23)` / `#121317` | **OBSERVED** computed body text |
| Navigation text | `rgb(69, 71, 77)` / `#45474D` | **OBSERVED** computed desktop navigation |
| Primary action | `#121317` background, white text, pill radius | **OBSERVED** computed desktop Download link |
| Light panel | Very pale blue-gray, approximately `#F7F8FC` | **ESTIMATED** from mobile desktop-download panel screenshot; not a sampled official token |
| Particle accents | Blue, cyan, lavender/violet, warm pink/orange | **OBSERVED** visual field; exact palette values **UNKNOWN** |
| Borders/shadows | Header has no visible shadow in sampled state; mobile menu rows use subtle separators | **OBSERVED** screenshot/computed style |
| Official color names, complete palette, gradients | — | **UNKNOWN**; do not add unsupported colors/effects |

## Geometry and spacing

| Token | Value | Status / evidence |
|---|---|---|
| Desktop header height | `52px` | **OBSERVED** computed at 1280×720 |
| Desktop brand left offset | About `72px` | **OBSERVED** computed logo-link bounds |
| Mobile header height | `52px` | **OBSERVED** computed at 390×844 |
| Mobile content width | `375px` CSS layout width in 390px viewport | **OBSERVED**; no horizontal page overflow measured |
| Mobile hero heading width | `343px` | **OBSERVED** computed bound |
| Mobile intro video | `356×200px`, `24px` radius | **OBSERVED** computed bound and radius |
| Mobile side gutter | About `16px` | **ESTIMATED** from rendered layout |
| Desktop max content width / spacing scale | — | **UNKNOWN** |

Do not use these sampled values as a complete design system. Keep unknown tokens fluid and validate against the reference at the exact target viewport.
