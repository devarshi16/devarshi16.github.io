SO-101 playground and signboard update — 12 October 2026
=======================================================

The campus now uses circular Jio and IIT Bombay plaques. IITB's seal is selected
from the retained official header artwork with a native SVG circle mask; the
original PNG is unchanged. Samsung's full Electro-Mechanics SVG is displayed
through the browser image renderer, preserving the mask/clip paths that the
previous SVG geometry conversion lost. Building names use larger bold two-line
lettering on dark unlit boards, with standoffs beyond the roof overhangs. White
interaction dots show brief engineering annotations on mouse hover or keyboard
focus. Their click/door destinations remain the same. The DA favicon is shared
by the main site and both demos.

The 2D embed was observed displaying a cached Astro 404 even though its raw asset
URL returned HTTP 200. The article now embeds `/demos/ik-2d/`, a generated site
route backed by the same standalone HTML source. Stylesheet/script URLs are
absolute. Both demos exchange validated same-origin theme/height messages with
the article, so embeds inherit the site palette and resize to their actual
content, including on mobile. Arbitrary external frames cannot trigger those
handlers.

The new `/demos/so101/` playground is embedded in the article. It provides orbit,
pan, zoom, translation/rotation gizmos, six numeric pose inputs, auto follow,
single-step solving, arm/camera reset, three target examples, position-only mode,
and joint-angle/limit readouts. The 45 mm translucent cube (opacity 0.42) is a
non-colliding target marker. The frame is robot-local XYZ with Z upward, positions
in metres and displayed roll/pitch/yaw in degrees (URDF ZYX convention).

The robot uses TheRobotStudio/SO-ARM100's original SO-101 model at commit
`a758567c3978dfeefe282ede0500085a48fe8f78`. The original URDF and Apache-2.0
license are retained under `public/robots/so101`. Thirteen STL meshes are clustered
at 1 mm to produce faceted browser geometry; the exact joint origins, axes,
limits and gripper tool frame remain in `src/robot/so101-model.json`. Printed
parts are recolored to sage; motors use slate. Source and binary-format provenance
are recorded in `public/robots/so101/SOURCES.md`. Normal site builds use the
committed derivatives and do not require NumPy or downloads.

`src/robot/kinematics.ts` implements forward kinematics and a world-frame
geometric Jacobian for the five arm joints. Its weighted damped least-squares
step solves the five-dimensional normal equations, caps updates, clips joint
limits and backtracks against the actual pose objective. Rotation error uses
the shortest quaternion log. Default orientation weight is 0.075 m/rad, damping
0.012, step-norm cap 0.12 rad. A result is matched below 1 mm and 2 degrees;
position-only mode ignores orientation in the objective. Stationary/iteration
limits retain residuals and do not claim global optimality. The jaw is displayed
at a fixed open angle and is independent of the pose solve. This is a teaching
kinematic implementation, without collision detection or physics, rather than a
reproduction of the article's Isaac Lab controller.

`src/robot/runtime.ts` draws the URDF visual transforms, original tool frame and
requested pose with Three.js. OrbitControls and TransformControls share the
canvas. Solver and rendering visibility are separated so mobile users can edit
controls below the drawing; hidden canvases do not render. Geometry, materials,
controls and observers are cleaned up on non-cached navigation. Rendering stops
when idle and uses a lower pixel ratio/no shadows on narrow screens.

Validation:

- Sixteen contracts pass: legacy content/navigation plus numerical Jacobian
  agreement, several realizable pose solves, bounded finite unreachable solves,
  quaternion sign invariance, position-only solving, and every packed mesh's
  index/position integrity. A mesh-header count mismatch found during browser QA
  was corrected and is covered by the integrity check.
- Browser verified both embeds inside the article. The 2D run reached 0.0006
  units; the initial 3D example reached 0.6 mm / 0.2 degrees. Numeric rotation,
  single IK steps, scene orbit and a real target-handle drag all update correctly.
  Dragging Z from 0.249 to 0.311 m reached 0.4 mm / 0.2 degrees in that trial.
- Campus hover shows its annotation/leader, and logos/signs/favicon were inspected.
  The 3D iframe inherits dark mode. Desktop and 390 px phone layouts were checked.
- Production build generates 55 pages. Demos, favicon, model license and original
  content URLs are verified. Physical-phone GPU performance remains unmeasured.

No push, merge or deployment is part of this pass. `_blog_notes` remains untracked.
