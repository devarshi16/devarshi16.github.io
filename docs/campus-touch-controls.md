Campus drag controls — 12 October 2026
======================================

Press anywhere on the map, including a building or indicator, then drag and hold
to walk. Movement snaps to northwest, northeast, southwest or southeast at the
same walking speed as the keyboard. A 12-pixel dead zone preserves taps; a small
direction margin prevents jitter near the seams. Returning to the press position
or releasing stops movement. A muted ring follows the active gesture and disappears
on release. The mobile direction pad is hidden; desktop keys and buttons remain.

The canvas and markers own touch gestures only while the world is ready. Callouts
below the map and the rest of the page retain normal scrolling. Building taps,
career annotations, doorway entry, collision boundaries and proximity descriptions
keep their existing behavior. Dragging suppresses the subsequent click, so it
cannot accidentally open a building. Pointer cancellation, lost map capture,
window blur, hidden documents, reset and navigation clear the movement state.
Implicit touch capture transferring from a marker to the map is allowed.

Verification: 21 tests pass, including screen-space direction mapping, the dead
zone and seam stability. Astro check reports no diagnostics; production generates
55 pages and passes route/content verification. Browser checks at 390 × 844 cover
all four directions, stopping on release, drags from career and building indicators,
building tap navigation, callout clearance and page scrolling outside the map.
These use native pointer input in a phone-sized desktop browser; physical-phone
touch behavior remains unmeasured.
