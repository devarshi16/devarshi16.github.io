Devarshi's floating robotics portfolio
=====================================

The feature branch runs an Astro static site with a direct Three.js campus. The original Jekyll Markdown directories remain the content source and rollback baseline; the new build does not require Ruby.

Use Node 22.12 or newer:

```sh
npm ci
npm run dev
```

Astro prints the local preview URL. This version of Astro manages its development server as a daemon; `npx astro dev status`, `npx astro dev logs`, and `npx astro dev stop` manage it.

```sh
npm run check
npm test
python3 -m unittest tests/test_numpy_tutorials.py
npm run build
```

The Python tutorial checks require NumPy. The application itself requires only the Node dependencies. The production build verifies original article, book and tag routes, draft exclusion, and static entry points. `dist/` is the deployment artifact. GitHub Pages publishing settings have not been changed and this branch has not been deployed.

**The world has two navigation paths.** Select a building or use Explore on foot and WASD/arrows. Crossing its front doorway opens the same page as its link. Escape releases keyboard controls. Career monuments reveal details in place. Pause motion freezes ambient animation; mobile users can use the direction pad or tap destinations.

**Drafts remain private to local preview.**

```sh
INCLUDE_DRAFTS=1 npm run dev
```

Stop an existing daemon before changing its environment. Draft preview is allowed only in development. The production build explicitly excludes unpublished routes, discovery surfaces and teleoperation draft media even if `INCLUDE_DRAFTS=1` is present. The existing local draft/notes/assets are not automatically added to Git. A fresh checkout works without those files; the optional integration test is skipped when the local unpublished source is absent.

**The principal contracts live in these modules.**

- `src/content.config.ts`, `src/lib/legacy-loader.ts`, `src/lib/content-policy.ts`: validated legacy content, renderer conversion, and publication rules.
- `src/data/world.ts`, `src/data/career.ts`: destinations, paths, collision footprints, career descriptions and matching timeline data.
- `src/world/movement.ts`, `src/world/runtime.ts`: constrained movement, deliberate doorway crossing, picking, focus, state restoration and lifecycle.
- `src/world/environment.ts`, `src/world/geometry.ts`, `src/world/theme.ts`: authored polygonal campus, shared materials, static batching, lighting and asset cleanup.
- `tests/contracts.test.ts`: publication, navigation, content conversion and media contracts.
- `examples/numpy_tutorials.py`, `tests/test_numpy_tutorials.py`: corrected numerical examples and regression checks.

See [the plan](docs/portfolio-world-plan.md) and [the implementation/handoff record](docs/higher-capability-implementation.md). The larger archival images and final custom asset polish remain bounded follow-up work; all source originals are retained.
