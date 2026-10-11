Campus approach callouts — 12 October 2026
=========================================

Approaching a building entrance or career indicator now automatically shows its
brief description and engineering leader. Distances are measured on the ground
plane below the indicator: 2.2 units to enter, 2.8 units to leave. The wider exit
radius avoids flickering around the boundary. Samsung's starting point is already
within range. Transient descriptions do not clear held keys or block new movement.

Hover and keyboard focus can temporarily preview another indicator. Selecting a
career stop or avatar still opens its full annotation. Closing a proximity card
keeps it dismissed until the avatar leaves that area; returning to Samsung resets
that dismissal. Selecting a building or walking through its doorway still opens
the destination.

Brief cards show only the title and short description. Placement checks the convex
outline of all projected campus geometry, including the deep island bases, with
16 pixels of clearance. A card uses an empty side corner when one is available;
otherwise it sits 24 pixels below the canvas and reserves space in the hero. The
scene keeps its original size and center. Placement is cached between scene frames.
The leader has one bend: diagonal from the indicator, then a horizontal segment
at the card. Its arrowhead points back at the indicator.

The city illustration is more visible: light opacity increases from 0.22 to 0.48
(0.40 on narrow screens), dark opacity from 0.09 to 0.25. The radial mask now keeps
the center opaque and fades more gradually toward the edges. The source image and
existing muted scene palette are unchanged.

Verification:

- 19 tests pass, including entrance approach, proximity boundary stability, and
  silhouette clearance/interior intersection checks.
- Astro check has no errors, warnings or hints; the production build generates
  55 pages and passes route/content verification.
- Native arrow-key walking in the browser leaves Samsung, approaches it again,
  reaches Jio, and reaches the Robotics Lab without hovering any indicator.
- Dismissing a card keeps it hidden while walking within the same proximity area.
- At 1280 × 900, brief cards fit beside the campus without covering its silhouette.
  Light/dark backdrop visibility was checked.
- At 390 × 844, the Robotics card begins at y=659, below the canvas bottom y=635;
  the page has no horizontal overflow and walking leaves its scroll position at 0.

Local screenshots are saved under `.local-qa/campus-proximity-desktop.jpg` and
`.local-qa/campus-proximity-mobile.jpg` (ignored by Git).
