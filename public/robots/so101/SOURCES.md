SO-101 model from TheRobotStudio/SO-ARM100, revision `a758567c3978dfeefe282ede0500085a48fe8f78`.
Source: https://github.com/TheRobotStudio/SO-ARM100/tree/a758567c3978dfeefe282ede0500085a48fe8f78/Simulation/SO101
Apache-2.0 license retained in LICENSE. Original URDF retained with trailing whitespace normalized.
Visual STL meshes clustered at 1 mm for a faceted browser rendering; kinematic transforms,
axes, tool frame and limits remain the original URDF values. Printed parts are recolored
to the portfolio's sage/stone palette. Binary .mesh: little-endian uint32 magic 0x534f3130,
vertex count, index count, followed by float32 XYZ positions and uint32 triangle indices.
Reproduce with scripts/robot/import_so101.py with --source pointing to the pinned SO101 directory and its assets/. This demo implements kinematic IK, without physics or collision.
