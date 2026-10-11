Higher-capability implementation and handoff
==========================================

**The higher-capability pass implements the architecture and an integrated working world on `feature/threejs-portfolio`.** Astro 7.3.8, TypeScript and Three.js 0.186.1 are pinned through the package manifest/lockfile. The site remains a local feature-branch candidate; publishing has not been changed. Jekyll files remain as source/rollback context, while the new build uses Astro.

**The visual system is implemented in both themes.** Six distinct building destinations connect around a floating campus: Robotics, Vision, Maker, Journal, Research and Profile/Contact. The scene has modular rock islands, walkable bridges, equipment, trees, lamps, a polygonal avatar and ambient drones. Light mode uses muted stone/sage/slate; dark mode changes scene lighting/materials and warm window emission together with the page. Both variants use the same site typography, components and semantic colour tokens.

Three career monuments use artwork from the organizations' public websites. IIT Bombay and Jio marks retain aspect ratio on modeled signs; Samsung's official SVG is extruded into shallow relief. Full organization names and career context are supplied by ordinary HTML labels/panels. These are modeled monuments, with more detailed custom sculpting available as a later asset-polish task.

**Interaction is implemented and verified.** The avatar uses camera-relative normalized movement, designed walkable regions, wall rejection/sliding and front-door crossing tests. Building geometry picking and HTML links share the same registry destinations. Career stops expand a panel without leaving the world. Escape clears held input and returns focus; blur/visibility changes clear input. Session storage restores position, and the theme persists independently. Offscreen/hidden rendering is suspended, ambient motion can be paused, reduced-motion preferences suppress nonessential motion, and WebGL failure leaves the directory/navigation usable.

The browser test walked the avatar through the Robotics doorway and observed `/projects/robotics/`, then returned to the homepage and observed the restored position and dark theme. Career panel opening/closing and the mobile layout were also inspected. Static page navigation keeps the scene lifecycle isolated; a client router is intentionally absent.

**The content/publication contract is implemented.** A typed loader reads the original `_blogs` and `_mybooks` files without moving them. It converts the known Liquid URLs/include, preserves Markdown with raw HTML, normalizes the legacy multiline YAML book description, and generates stable heading IDs/TOC metadata. Active imported scripts are excluded; supported video/iframe content remains. Production routes, cards, tags, search, RSS and sitemap use centralized publication filtering. Production asset preparation excludes the unpublished teleoperation media. Existing article/book/tag routes, `/blog.html`, `/404.html` and CV links are verified by the build script.

The newer supplied robotics CV and its preview replace the previous CV download assets. Degree wording on the web page remains the neutral "postgraduate study" because the supplied CV has inconsistent M.Tech/M.E. wording. No degree title was guessed.

**The scientific corrections are implemented with executable checks.** The regression tutorial now splits before scaling, uses the validation ratio correctly, handles constant features, calculates F1 with the factor of two, thresholds logistic probabilities and uses the appropriate objective. The one-hot tutorial uses an explicit/reusable vocabulary, handles negative/noncontiguous labels, corrects the seven-class example, and illustrates repeated timings and dense memory cost. Original dates and plots remain, with a clear historical-result label and October 2026 revision metadata. The new helpers do not claim a rerun of the old dataset benchmark.

**Performance was improved at the architecture level.** Static environment geometry is batched by material while animated props, avatar and picking proxies remain separate. In the desktop preview, the instrumented renderer's draw-call count fell from 1,240 to 177 and reported approximately 60 fps after loading. A mobile viewport uses a lower pixel-ratio cap and disables shadows. This is desktop-browser evidence at the tested viewports, not a physical-phone benchmark. The Three.js bundle loads separately from the content UI; article pages do not load the world runtime.

The dev-stage DOM exposes read-only diagnostic attributes for state, coordinates, frame count, draw calls, triangles, initialization duration and sampled FPS. These diagnostics remain local and do not transmit telemetry. Main-thread responsiveness under throttled loading and performance on an actual midrange phone remain required before production release.

**Validation combines numerical/domain checks with browser inspection.**

- Astro/TypeScript check and static production build.
- Original published article, book, tag, alias, 404 and CV path coverage.
- Explicit checks for unpublished content on homepage/blog/search/feed/sitemap.
- Movement, doorway direction, boundaries, input normalization and stable slugs.
- Raw HTML heading targets, active-script exclusion, relative iframe/video retention, Hindi text and the actual multiline book fixture.
- Numerical tests for F1, logistic thresholds, extreme sigmoid inputs, split/scaler semantics, training loss, class vocabulary and empty encoding.
- Local browser checks for themes, navigation, career panels, state restoration and responsive overflow.

**The remaining lower-capability tasks have bounded contracts.**

| Task | Fixed input/contract | Required evidence |
| --- | --- | --- |
| Archival image derivatives | Original `assets/images` files; retain old URLs and use truthful width descriptors | Before/after bytes, dimensions, and representative visual comparisons |
| Article thumbnail replacement | Use actual hardware/simulation images with the existing card component | Light/dark desktop/mobile screenshots; no oversized original in card markup |
| Asset polish from the approved kit | Preserve world positions, door coordinates, material roles and picking proxies | Silhouette/material review and unchanged interaction tests |
| Metadata and copy refinement | Career facts from the supplied CV; publication flags and original slugs remain fixed | Schema/build/link checks and factual diff |
| Additional case-study media | Only supplied/shareable artifacts; draft-derived exhibits remain filtered | Working media URLs and an explicit provenance record |
| Source formatting/documentation | Existing module boundaries and public API contracts | Type check, relevant tests and no behavior changes |

Further changes to navigation, publication policy, renderer lifecycle, scientific conclusions or the coherent visual system require stronger review. Publication and physical-device verification are separate release work. The local unpublished article, notes, assets and four tag files are preserved without staging them into the implementation commit.
