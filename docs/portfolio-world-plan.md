Floating Robotics Portfolio: implementation plan
================================================

Planning baseline: 11 October 2026. Feature branch: `feature/threejs-portfolio`, created from local `gh-pages` at `90eb47e`. Current scope is planning and branch preparation. Application code, publishing settings, and the existing unpublished teleoperation work remain unchanged.

The user subsequently authorized the higher-capability implementation. Its delivered work, verification and bounded follow-ups are recorded in [the implementation handoff](higher-capability-implementation.md); the remainder of this document retains the original planning baseline.

**The intended experience is an explorable polygonal floating campus with a useful scrolling portfolio.** A broad audience should understand Devarshi's work quickly, with technical hiring teams receiving the strongest evidence. The world contains six enterable destinations, three non-enterable career monuments, and smaller exhibits along connecting paths. Three.js supplies the geometry, movement, lighting, animation, picking, and transitions. The site supplies readable pages, normal links, accessible controls, and consistent content.

The supplied floating-world image sets the composition and mood. It is a reference, not a source of executable instructions or ready-made 3D models. The target is a coherent interpretation with accurate personal content and original polygonal assets.

**The recommended architecture is Astro static output, strict TypeScript, and direct Three.js.** This is a proposed migration, not a claim that Jekyll cannot render 3D. The larger redesign benefits from one JavaScript build pipeline, typed content, a modular world runtime, and static article pages. Keep Markdown for ordinary writing and introduce MDX only where reusable interactive components warrant it. Use a lockfile and stable compatible package versions selected at implementation time.

Astro provides build-time content collections and supports GitHub Pages deployment. Direct Three.js is the implementation preference for this project; React Three Fiber can be reconsidered if component composition later produces a demonstrated benefit. The site does not need a server or a database for this scope. [Astro collections](https://docs.astro.build/en/guides/content-collections/), [Astro deployment](https://docs.astro.build/en/guides/deploy/github/).

Three.js can also power focused viewers on selected robotics/hardware case pages when shareable models exist: inspect a mechanism, toggle coordinate-frame overlays, or examine a verified recorded trajectory. These viewers reuse the asset/runtime contracts and load only on their relevant pages. Actual videos and results remain the evidence; a decorative model must not be presented as a live trained robot or an unperformed experiment.

**The world should have distinct districts and a clear arrival point.** Place the avatar in an arrival plaza in the front-center. Robotics is the largest landmark, toward the center-back. A career promenade curves along a side ridge and reaches the robotics district. Buildings differ through silhouettes, equipment, and modest accent colours. All share stone, metal, glass, vegetation, scale, and lighting rules.

| Enterable destination | Scene identity and placement | Planned page or content |
| --- | --- | --- |
| Robotics Lab | Largest building; articulated arms, simulation table and VR-controller exhibit; center-back | `/projects/robotics/`: manipulation, robot learning, simulation and teleoperation cases |
| Vision Observatory | Lens-shaped tower with a restrained point-cloud display; left district | `/projects/vision/`: perception, tracking and deployment cases |
| Maker Workshop | Open workbench, PCB, printed parts and tools; front-left | `/projects/hardware/`: personal hardware, Arduino gamepad, CAD and fabrication |
| Engineering Journal | Warm reading/workshop building with diagram panels; front-right | Technical blog index; preserve `/blog.html` and existing article URLs |
| Research Pavilion | Glass canopy, rice exhibit and graph sculpture; back-right | `/research/`: publications, research interests and clearly labelled experiments |
| Profile & Contact Studio | Welcoming small studio with portrait display; beside arrival plaza | `/about/`: biography, experience, applied skills, current study, CV and contact |

The proposed new paths are design targets, not existing pages. Final routing is fixed in a route manifest before implementation. Existing routes take priority wherever a new organization would change a published URL.

Provide short bridges between related districts: Robotics to Journal for "build and explain", Maker to Robotics for input devices and mechanisms, Vision to Research for experiments and evidence. Include plants, paths, lamps, small drones and water features sparingly so the scene feels inhabited. Avoid uniform buildings distinguished only by labels.

**The career promenade contains three 3D logo monuments with brief achievement cards.** These stops remain in the scene rather than acting as enterable buildings. Approaching or focusing a stop reveals its role, dates, and a compact description. Clicking, tapping or keyboard activation expands a readable HTML panel with related work and a link to the career detail. The same structured data supplies the timeline below the hero.

| Stop | Accurate role and dates | Draft short description | Visual treatment |
| --- | --- | --- | --- |
| IIT Bombay | Machine Learning Intern, July 2019-May 2020; Computer Vision Intern, August 2021-March 2022 | Built OCR and annotation tools for document extraction, then applied computer vision to rice phenotyping and improved annotation workflows. | Raised institute emblem on a stone medallion; document and rice exhibits nearby |
| Jio | Deep Learning Engineer, April 2022-December 2024 | Developed production vision systems for license-plate recognition, person analytics and access control, with scalable real-time deployment using DeepStream. | Extruded recognizable logo on a plinth; small camera/server installation |
| Samsung Electro-Mechanics | Robotics Engineer / Deep Learning Engineer, December 2024-Present | Builds simulation-based manipulation pipelines with Isaac Sim and Isaac Lab, including RL/IL evaluation, VR teleoperation and demonstration data workflows. | Accurate corporate wordmark/sign as shallow 3D relief; dual-arm sculpture nearby |

Use official vector artwork where available. Convert suitable paths to shallow extrusions and simplify hidden geometry while retaining recognizable shapes. For a very detailed emblem, use a modeled relief medallion with a crisp surface treatment. Preserve corporate identity on the signs while surrounding materials follow the muted palette. Asset sourcing must identify Samsung Electro-Mechanics specifically. The artwork sources and final geometry are deliverables of the asset stage; none have been acquired in this planning commit. [Three.js SVGLoader](https://threejs.org/docs/pages/SVGLoader.html).

Career copy is grounded in the newer robotics CV and the existing homepage. IIT Bombay denotes internships, not a degree. Quantitative achievements belong beside their task, baseline, hardware or dataset, and evaluation conditions. Values such as 8 to 108 camera streams per GPU or 0% to 99% simulated task success must not become universal speed or reliability claims.

An optional academic courtyard beside Research can show BITS Pilani postgraduate AI/ML study since July 2025 and IIITDM Kancheepuram undergraduate Computer Science, 2015-2019. The CV uses both M.Tech and Masters of Engineering; normalize the exact degree title before publication. A quiet reading garden can connect to books and poetry through Profile, keeping personal writing secondary.

**Small exhibits add depth without creating unnecessary destination pages.** A two-link IK sculpture can open the existing playground, a VR dock can preview a teleoperation demonstration, and a dataset station can explain observation/action recording. Exhibit content appears in readable panels or existing pages. Draft-derived exhibits remain excluded from public output until their associated content is published.

**Navigation has one shared destination contract.** Each world item declares an ID, kind (`page`, `career`, or `demo`), label, content reference, asset key, position, and activation behavior. Building clicks, doorway crossings, and ordinary links use the same route target.

1. Walking near a building highlights its entrance and label. Deliberately crossing the doorway opens the page; wall contact and proximity alone do not navigate.
2. Clicking or tapping an enterable building opens that page immediately or after a short optional transition. A walking animation must not delay access.
3. Career stops reveal information in place. They never teleport visitors into an unrelated page.
4. Browser Back and the Home link restore the last useful avatar position and camera framing when practical. Rapid repeated activation must not duplicate transitions.
5. Normal HTML navigation remains visible: Projects, Blog, Research, About, CV and Contact. All scene destinations have equivalent links.

Use a designed path network and simple walkable boundaries for avatar movement. Begin with idle/walk/turn animations, basic obstacle handling, and camera-relative direction. A general physics engine is not required by this scope. Camera framing should preserve orientation through gentle following and limited pan; scrolling the document should not zoom the world.

WASD/arrows operate only while the scene is explicitly focused. Clearing focus clears held input. Escape returns focus to an ordinary control. On touch devices, tapping buildings is primary, with optional directional controls inside an explicit explore mode. Maintain normal vertical scrolling outside those controls. Never depend on hover for labels or information. [Keyboard access](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html).

**Light and dark mode are two authored versions of one visual system.** Use shared semantic tokens for both interface surfaces and scene materials. Default to the system preference, expose a visible toggle, remember the override, and apply it before initial paint. A theme change updates the page, scene sky/fog, lighting and emissive windows together.

| Token or material | Light treatment | Dark treatment |
| --- | --- | --- |
| Page background | Warm off-white `#F2F3F0` | Charcoal blue `#171D23` |
| Content surfaces | White `#FFFFFF` | Slate `#222B33` |
| Main text | Deep slate `#25313A` | Soft white `#E2E6E5` |
| Secondary text | Slate `#596771` | Grey-blue `#A7B2B8` |
| Primary accent | Muted teal `#4E6867` | Pale sage `#9BBDB5` |
| World stone and foliage | Limestone, sage and dusty blue | Blue-grey stone, subdued sage and soft fill light |
| Small secondary accents | Muted lavender and warm amber | Desaturated lavender and warm window light |

These sampled text/accent pairs have calculated contrast above 4.5:1 against the listed backgrounds and surfaces. Final UI states, photography, scene labels and transparency still require visual and contrast checks. Keep accents sparse; retain readable terrain at night instead of relying on bright neon. Use faceted geometry, soft shadows, restrained glass and crisp labels.

**The scrolling homepage supplies the same evidence without exploration.** Start with the portrait, role, a short introduction and immediate project/CV actions beside the world. Continue into selected projects, featured technical articles, career highlights, research and contact. Each section should add substance. Show applied skills alongside the projects that demonstrate them; the full inventory belongs in About/CV.

Each case study explains the problem, Devarshi's role, an actual demonstration, architecture, decisions, evidence, limitations, source availability, and related writing. Clearly distinguish personal projects from employer work. Use shareable artifacts and accurate contribution language. Public project cards should not advertise inaccessible implementation details as downloadable source.

**The technical blog becomes an engineering journal.** Feature the recent teleoperation walkthrough once published, with two supporting articles. Use real photographs, simulation frames and diagrams as consistent thumbnail crops. Provide Robotics, Vision & ML, Hardware and Computing filters. Cards use short promises, dates and reading times; long articles get a table of contents, clear code blocks, figure captions, reproduction details and related work. Match both theme modes and avoid scene animation competing with article reading.

Prioritize the existing SO-101 article, then coordinate-frame debugging, demonstration quality, and HDF5-to-LeRobot data semantics. An imitation-learning baseline article follows actual training and evaluation. Link each article to its corresponding case. Refresh the existing NumPy tutorials before featuring them: correct F1, splitting/scaling, logistic prediction and benchmark issues; retain original dates and add updated dates.

**The migration must preserve content and publishing behavior.** The source has 15 blog entries (7 published technical, 7 poetry, 1 unpublished robotics draft), 4 book entries, and 24 tag destinations including the poetry page. Current assets total roughly 63 MiB; several old hardware images are multiple megabytes. That is stored content, not a proposed homepage download budget.

1. Capture a baseline route and link manifest from the existing build, including `/blog.html`, `/blog/<name>/`, `/tags/<slug>/`, `/books/`, book detail pages, `/404.html`, assets and CV links. Check generated RSS/sitemap behavior rather than assuming the collections appear in feeds.
2. Define content schemas with explicit original slugs/URLs, publication status, dates, tags, categories, media and featured selection. Normalize duplicate tag spellings while retaining old aliases.
3. Load the existing Markdown first where useful; moving every source file is not a prerequisite. Preserve original source provenance during conversion.
4. Convert Liquid URL expressions and includes deliberately. Templates are rebuilt as Astro layouts/components. Do not blanket-convert imported raw HTML to MDX; JSX syntax has different requirements.
5. Preserve `/assets/...` public paths, especially the teleoperation videos, posters, dataset snapshot and standalone IK HTML/CSS/JS. Keep the standalone playground and its iframe working.
6. Explicitly exclude `published: false` entries from production page generation, world exhibits, featured lists, tags, search, RSS and sitemap. Local draft preview must be a separate mode.
7. Replace large listing thumbnails with optimized responsive derivatives. Preserve downloadable originals where useful; repair imported `srcset` metadata rather than labeling one full-size file as many resolutions.
8. Build and compare content/routes before retiring Jekyll files. Configure static deployment only after checking actual GitHub Pages settings. GitHub Pages redirects must be implemented as static compatibility pages where needed, not assumed to be server rules.

The imported articles need specific rendering checks: raw HTML headings may be missed by an automatic Markdown table of contents; the gamepad article retains a VideoPress iframe and companion script; books include Hindi text and multiline YAML; poetry relies on explicit line breaks. Preserve or deliberately replace those behaviors after inspection. Rebuild canonical links, Open Graph metadata, feed/sitemap output and the 404 page because the existing Jekyll SEO/feed plugins do not transfer automatically. Turn the current book-card collection outputs into useful detail pages while retaining their URLs. Preserve the legacy `/tags/algorithms-comparision/` spelling as an alias even when its visible label is corrected.

Astro's Jekyll migration guidance identifies Liquid/template conversion as part of the migration. Publication filtering is a specific contract for this repository and must be tested explicitly. [Jekyll migration](https://docs.astro.build/en/guides/migrate-to-astro/from-jekyll/).

**The implementation should isolate the runtime from content pages.** Proposed modules make each responsibility reviewable:

| Module area | Responsibility |
| --- | --- |
| Content config and route manifest | Schemas, original URLs, draft filtering and generated discovery surfaces |
| World registry and career data | Shared destinations, positions, entrance triggers, career descriptions and timeline copy |
| World hero component | Canvas, poster, focus controls, progress, accessible links and fallback |
| Runtime and asset manager | Initialization, resize, loading/cache, frame scheduling, teardown and GPU disposal |
| Terrain/building/prop modules | Modular islands, bridges, instanced vegetation, architecture and exhibits |
| Avatar and movement modules | Polygonal avatar, animation, facing, walkable bounds and path network |
| Interaction/navigation modules | Raycast picking, focus, proximity, doorway crossings and one route handler |
| Theme/quality modules | Light/dark materials, motion setting, resolution cap and device quality tiers |
| Page layouts | Homepage, case studies, journal, research, About, books and legacy routes |

Initial page navigation should be ordinary static navigation. Add client-side page transitions only after proving scene teardown and initialization are reliable. Avoid duplicate animation loops, leaked listeners and GPU resources.

**The asset stage is a substantial part of the work.** Start with a polished representative island, one building, one career logo and one avatar. Primitive geometry is useful for blocking out the map; final hero fidelity requires consistent modeled assets, material choices and animation.

| Asset group | Required deliverable |
| --- | --- |
| Terrain kit | Floating rock modules, plaza, bridges, path pieces and simple walkable/collision proxies |
| Six destinations | Distinct building silhouettes, entrance markers, equipment and reusable material palette |
| Three career logos | Accurate artwork, shallow 3D treatments, full-name labels and source records |
| Avatar | Polygonal character with idle/walk/turn animation and lightweight rig or equivalent procedural motion |
| Environment props | Instanced trees, lamps, selected plants, limited water/cloud effects and small exhibits |
| Theme profiles | Day/night light and material settings with a consistent exposure/color treatment |
| Delivery assets | Optimized GLB/texture exports, lower-detail mobile variants, and light/dark poster renders |

**Performance budgets are targets to validate on a prototype.** Aim for initial HTML/UI plus poster below 1 MiB compressed, first usable mobile world below 4 MiB, and desktop world below 8 MiB before optional detail. Aim for approximately 60 fps on a suitable desktop and a stable 30 fps on an agreed midrange phone. Report the tested device and actual asset weights; revise the budgets from measurements before producing the entire campus.

Lazy-load scene assets without blocking introduction or navigation. Reuse geometry/materials, instance repeated props, cap pixel ratio and shadow cost, reduce distant detail, and suspend work when the hero is offscreen or the tab is hidden. Rendering on demand suits idle states; animated states need an appropriately bounded loop. Select texture/geometry compression after inspecting exported assets. [Three.js frame scheduling](https://threejs.org/manual/pages/rendering-on-demand.html), [responsive rendering](https://threejs.org/manual/pages/responsive.html).

Reduced-motion mode removes camera travel and decorative transitions, freezes nonessential drone/cloud/water and avatar-idle motion, and keeps destinations immediately usable. Provide a visible pause/resume control for ambient animation in either motion mode. Necessary user-controlled avatar movement can remain direct and unembellished. A static fallback and ordinary links remain available after loading failures or context loss. Support explicit recovery without recreating endless render loops. [Reduced-motion guidance](https://www.w3.org/WAI/WCAG22/Techniques/css/C39.html).

Test a throttled mobile load as well as the fully loaded scene. Record time to usable introduction/navigation and main-thread stalls during model/texture decoding, alongside FPS and transferred bytes. Decoding must not prevent visitors from using normal links or scrolling while the world prepares.

**Model allocation follows uncertainty and integration risk.** OpenAI describes Astra as suited to ambitious/ambiguous work, Sol as a balanced option for complex projects, and Luna for scoped work. The task assignments below are project-specific recommendations, not claims that a task can only be completed by one model. Availability is determined by the app's current model picker. [Official model selection](https://developers.openai.com/api/docs/guides/model-selection).

| Work package | Recommended model/effort | Reason and handoff contract |
| --- | --- | --- |
| World composition, visual system, light/dark art direction | Higher capability: Astra high/xhigh, or Sol xhigh | Requires coherent taste across camera, buildings, logos, avatar and page UI; deliver a map, material rules and desktop/mobile compositions |
| Architecture, content migration and publication contract | Higher capability: Astra high or Sol high/xhigh | Interacting route, content, draft and hosting requirements; deliver schemas, invariants and parity checks before imports |
| Avatar movement, camera, doorway/picking navigation | Higher capability: Astra high or Sol high | Spatial interaction and focus/lifecycle edge cases; prove one complete interaction slice |
| Performance debugging and final integration/visual review | Higher capability: Astra high/xhigh or Sol high/xhigh | Cross-device tradeoffs and emergent failures; measured evidence and prioritized fixes |
| Astro page templates and ordinary content components | Balanced: Sol medium/high; Luna only after design/spec is fixed | Implement the specified system, with screenshots and schema-driven examples |
| Career/metadata entry, article dates, categories and related links | Lower capability: Luna low/medium | Exact supplied copy and schema; no invented achievements or changed publication status |
| Asset inventory, deterministic compression and derivative generation | Lower capability: Luna medium | Fixed file list and output budgets; compare dimensions, bytes and visual fidelity |
| Existing content migration and straightforward Liquid replacements | Lower capability: Luna medium under a fixed migration contract | Produce a diff and route/link report; escalate unexpected markup or renderer behavior |
| Repeated props/buildings from an approved asset kit | Lower capability: Luna medium | Fixed geometry/material recipe; stronger model reviews silhouettes and composition |
| Link audits, alt text, formatting and specified QA scripts | Lower capability: Luna low/medium | Bounded checks and factual descriptions; report failures rather than silently changing scope |
| Research accuracy and substantive tutorial corrections | Higher capability: Astra high or Sol high | Code/math and evidence need reasoning and runnable verification |

Use a stronger model to define the contracts and representative implementation. Delegate routine batches with explicit files, inputs, outputs and acceptance conditions. Return architecture changes, factual uncertainty, visual inconsistencies and interaction failures for stronger review. Do not spend the strongest model on every repetitive card or asset conversion. Artistic assets still require visual inspection; model capability alone does not supply production-quality geometry.

**Implementation proceeds through six measurable milestones.**

1. Content and design contract: finalized map, route registry, desktop/mobile wireframes, career plaques, palettes and asset brief. Stronger model owns the coherent direction; routine source inventory can run in parallel.
2. Content foundation: Astro/static build, original route parity, draft filtering, article/media rendering and legacy links. Stronger model owns migration policy; routine imports/templates follow it. Retire Jekyll only after parity is demonstrated.
3. Vertical interaction slice: avatar, two buildings, one career logo stop, doorway and click navigation, normal scrolling, light/dark mode and accessible equivalents. Stronger model owns interactions and review.
4. Performance and asset proof: measure the slice on desktop and a real midrange phone, settle budgets, and approve representative final geometry before modeling the entire world.
5. Campus and editorial finish: expand to six buildings/three career stops, add restrained exhibits, implement the scrolling homepage and journal/case templates, and refresh priority articles. Routine batches parallelize within approved contracts.
6. Release verification: check deep links, route manifest, unpublished exclusions, videos/IK, all interaction paths, Back/return behavior, keyboard/touch, both themes, reduced motion, loading failures and runtime cleanup. Publish only in a subsequent implementation/release scope.

Acceptance means visitors can understand the role and reach Projects, Blog, CV and Contact immediately; exploration works through both avatar entry and building activation; every career stop is readable through touch/keyboard and has a matching timeline entry; page scrolling remains reliable; the theme is coherent across UI and world; legacy content/media work; and production output excludes drafts. Verification should include meaningful interaction/publication tests and screenshots, rather than tests that merely mirror a component's markup.

**The current evidence and unresolved details are recorded explicitly.** Reviewed the local Jekyll source, the live homepage/blog, the reference PNG, and `/home/devarshi/Downloads/Devarshi Aggarwal CV Robotics Profile.pdf`. Existing untracked teleoperation files are intentionally retained and not staged with this plan. Resolve the CV degree-title inconsistency, actual Pages publishing settings, final logo artwork, and measured device budgets during the relevant milestone. The `devarshi.dev` address in the reference is an illustration; the observed portfolio uses `devarshi16.github.io`.
