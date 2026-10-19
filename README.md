Devarshi's floating robotics portfolio
=====================================

The portfolio runs an Astro static site with a direct Three.js campus. The original Jekyll Markdown directories remain the content source and rollback baseline; the new build does not require Ruby.

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

The Python tutorial checks require NumPy. The application itself requires only the Node dependencies. The production build verifies original article, book and tag routes, draft exclusion, and static entry points. `dist/` is the deployment artifact.

**Publishing uses GitHub Actions.** The [Pages workflow](.github/workflows/deploy-pages.yml) checks, tests and builds commits pushed to `gh-pages`, then publishes only `dist/` to [the portfolio](https://devarshi16.github.io/). The repository's Pages source must be set to **GitHub Actions**; the legacy Jekyll branch build cannot build this version. Merge completed feature branches into `gh-pages` and push that branch to release updates. Generated output, local QA screenshots and working notes are not included in the deployed artifact.

**The world has two navigation paths.** Select a building or move with the arrow keys immediately after load. Movement follows four isometric world axes (one direction at a time); crossing a front doorway opens the same page as its link. Fresh sessions start at Samsung, and Back restores the previous position. Wheel/touch scrolling remains available. Focused links and form controls retain their native keys. Escape clears held input and closes annotations. Career monuments and the avatar reveal offset annotations with engineering leader lines. Mobile users can use the four-direction touch pad or tap the buildings/white interaction dots.

**Journal covers use real article imagery.** Asset preparation creates 640 × 360 WebP derivatives from each article's thumbnail, preserving originals. The SO-101 teleoperation walkthrough is included as published content, with its videos, IK examples and diagrams.

**Drafts remain private to local preview.**

```sh
INCLUDE_DRAFTS=1 npm run dev
```

Stop an existing daemon before changing its environment. Draft preview is allowed only in development. The production build excludes unpublished routes and discovery surfaces even if `INCLUDE_DRAFTS=1` is present. Teleoperation media are included because that article is now marked published. Local working notes remain untracked.

**The principal contracts live in these modules.**

- `src/content.config.ts`, `src/lib/legacy-loader.ts`, `src/lib/content-policy.ts`: validated legacy content, renderer conversion, and publication rules.
- `src/data/world.ts`, `src/data/career.ts`: destinations, paths, collision footprints, career descriptions and matching timeline data.
- `src/world/movement.ts`, `src/world/runtime.ts`: constrained movement, deliberate doorway crossing, picking, focus, state restoration and lifecycle.
- `src/world/environment.ts`, `src/world/geometry.ts`, `src/world/theme.ts`: authored polygonal campus, shared materials, static batching, lighting and asset cleanup.
- `tests/contracts.test.ts`: publication, navigation, content conversion and media contracts.
- `examples/numpy_tutorials.py`, `tests/test_numpy_tutorials.py`: corrected numerical examples and regression checks.

See [the plan](docs/portfolio-world-plan.md) and [the implementation/handoff record](docs/higher-capability-implementation.md). See [the campus revision record](docs/campus-revision.md) for the latest visual/input changes, asset provenance and verification. Larger in-article archival images remain a possible follow-up; all source originals are retained.

The teleoperation article now includes both a two-link playground at `/demos/ik-2d/` and an SO-101 pose playground at `/demos/so101/`. Run the local server to use these routes. The robot's source model, solver conventions, mesh importer and validation are recorded in [the playground notes](docs/so101-playground.md).

**The site has three content areas besides the work pages.** The Technical Journal (`/blog/`) lists only technical articles from `_blogs/`. News (`/news/`) reads one Markdown file per update from `_news/`, with `title`, `date`, `kind` (for example Hackathon, Graduation, Volunteering), `summary`, optional `location`, `image` and `links`, and `published: false` for drafts. Misc (`/misc/`) collects the poems from `_blogs/` (anything tagged `POETRY`), the books from `_mybooks/` and the Steam details in `src/data/misc.ts`.
