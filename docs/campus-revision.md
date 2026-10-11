Campus revision — 12 October 2026
================================

Implemented on `feature/threejs-portfolio`; no push, merge or deployment.

The homepage now centers the entire campus. The large introductory headline,
paragraph and work/CV actions have been removed from the hero. Profile text and the
CV link are available from the avatar annotation and the About page.

Six destinations have different architectural forms: a gantry hangar with a large
robot arm, a cylindrical telescope observatory, a timber workshop with pitched
roof/chimney/machine wheel, stacked books with an open-notebook roof, a triangular
research pavilion, and a two-storey profile studio. Physical building signs are
larger, and the avatar scale increases from 0.72 to 0.92. Persistent HTML labels
are replaced by small white dots with accessible destination names and larger
invisible touch targets. Clicking building geometry or its dot opens the same page.

The islands are laid out around straight world-axis avenues and have deeper
faceted bases (8–9.5 units for buildings, 6.8 for career stops), exposed ledges,
mineral clusters, roots and rock fragments. Samsung is the initial spawn. Session
restoration uses a new key because the previous layout's coordinates are obsolete.

Arrow keys work immediately when the page/scene has focus. Only one of the four
isometric directions is active at a time; the latest held key wins. Navigation
links, form controls and annotations keep normal keyboard behavior. Wheel and
touch scrolling are available. The touch direction pad uses the same movement
logic. Career and profile annotations have offset engineering leader arrows.
On mobile, annotations sit below the drawing and expand the hero instead of
covering the campus; selecting one scrolls it into view. Desktop annotations dock
at a side of the drawing. Light/dark mode retains the established palette.

The existing SO-101 teleoperation article was present locally but marked
`published: false`. It is now `published: true` in this branch, and its supplied
article, include, media and tag files are part of the change. The article's body
has not been rewritten. It appears on the homepage, journal, robotics page,
search, feed and sitemap. Working notes in `_blog_notes` remain untracked.

All 15 journal cards use source-article images, converted to 640 × 360 WebP
covers at build time. Originals remain available in articles. The covers total
424,768 bytes; the largest is 50,012 bytes. A preview/build race was fixed by
keeping the public assets directory stable and atomically replacing card files.
Removed/unpublished covers are cleaned up separately.

The static city backdrop is generated using the built-in image-generation tool.
The selected asset is `public/world/city-backdrop.webp` (31,474 bytes), encoded
from the generated PNG without changing its illustration. CSS applies low
opacity, desaturation and an alpha mask; the dark theme further attenuates it.
Original generated source:
`/home/devarshi/.codex/generated_images/01a12ba0-c81e-79a1-a727-2c66c1277ac7/exec-12e3458d-a7b7-4625-8b28-8484cca62c96.png`.

Final generation prompt:

> Use case: stylized-concept. Asset type: very faint static background for a
> Three.js floating-island robotics portfolio. Generate a wide landscape image,
> about 3:2 or 16:9. A distant polygonal futuristic city seen from an elevated
> isometric viewpoint, small clustered towers, a few soft bridges, skyline fading
> into mist. No floating islands or foreground subject (the website renders
> those). Keep center largely open and misty; buildings primarily near lower
> edges and distant horizon. Muted colors only: ivory #eef0e8, blue grey #789ca6,
> sage #9cb49a, pale lilac #a09dbb, warm stone #c5aa87. Extremely low contrast,
> diffuse overcast light, no saturated colors, no black, no hard outlines, no
> text, logos or labels. Beautiful quiet low-poly architectural diorama, soft
> atmospheric depth. Intended to sit beneath an alpha mask at low opacity so the
> interactive foreground remains the focus.

Verification:

- Astro check: zero errors/warnings/hints. Production build: 53 static pages.
- All 11 content/navigation contracts pass, including an orthogonal walk from
  Samsung to every entrance and four-direction input constraints.
- Browser: immediate arrow input, an actual Samsung-to-Robotics door walk,
  career/profile annotations, mobile pad movement, light/dark modes and journal
  imagery. Tested 1280 × 900 and 390 × 844; no horizontal overflow.
- Mobile annotation top is below the canvas bottom; its leader remains attached
  to the selected object. The cover loads with intrinsic width 640, and remains
  HTTP 200 after rebuilding while the dev server runs.
- Build checks verify source-article cover paths, the backdrop, legacy URLs and
  publication filtering. No repeated numerical tests were needed: scientific
  examples and their tests did not change.
- A clean export of the Git index (without working notes or generated assets)
  passes all 11 contracts and builds all 53 pages using the installed dependency
  tree. Production dependency audit reports zero vulnerabilities.

Snapshots are saved locally under `.local-qa/campus-revision-light.jpg`,
`campus-revision-dark.jpg` and `campus-revision-mobile.jpg` (ignored by Git).
Physical-phone GPU performance remains unmeasured.
