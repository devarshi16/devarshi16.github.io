---
layout: blog_post
title: "From a gamepad to VR: teleoperating an SO-101 in Isaac Sim"
date: 2026-10-11
updated: 2026-10-12
published: true
description: "The IK behind moving a robot with a VR controller, how my Quest connects to Isaac Sim, and what a recorded demonstration looks like before it becomes a LeRobot dataset."
thumbnail: "/assets/teleoperation/gamepad-vs-quest-poster.jpg"
tags: ["Robotics", "Teleoperation", "Isaac Sim", "Physical AI"]
---

<link rel="stylesheet" href="{{ '/assets/teleoperation/article.css' | relative_url }}">

Picking up a cube and putting it in a box sounds like a small task. With a gamepad, it also became a memory game: which stick moves the arm in which direction, which buttons move it up and down, and how do I turn the gripper without undoing the position I just reached?

I tried the same task with a Meta Quest and a simulated SO-101 arm in Isaac Sim. VR felt much more natural to me, even before I had polished every mapping. I could move the controller toward the place where I wanted the gripper to go. The remaining work was making the robot interpret that intention.

This is a walkthrough of that work: inverse kinematics, the Isaac Lab action configuration, the connection between the headset and my PC, and the demonstrations I recorded for future imitation learning experiments. The experience is personal; the recordings below are a small development collection, not a controlled study of which input device is faster.

<figure class="teleop-video">
  <video controls playsinline preload="metadata" poster="{{ '/assets/teleoperation/gamepad-vs-quest-poster.jpg' | relative_url }}" aria-label="Gamepad and Quest teleoperation of the simulated SO-101">
    <source src="{{ '/assets/teleoperation/gamepad-vs-quest.mp4' | relative_url }}" type="video/mp4">
    <a href="{{ '/assets/teleoperation/gamepad-vs-quest.mp4' | relative_url }}">Watch the teleoperation video.</a>
  </video>
  <figcaption>The video from my LinkedIn post, compressed for the web. Both interfaces control the simulated arm; the headset gives me an immersive view of the scene.</figcaption>
</figure>

## What the controller actually controls

There are two useful ways to describe an arm command. A **joint-space command** specifies the angles of individual joints. A **task-space command** specifies where the gripper should be, usually with an orientation as well.

Joint-space control makes the mechanism explicit, but it makes the operator do some of the coordination. To move the gripper straight across a table, several joints may have to change together. Task-space control lets me describe the motion I care about and delegate that coordination to an inverse kinematics solver.

My project retains joint control and relative IK modes, but the shared absolute-pose path is the one used for the Quest comparison. The gamepad integrates stick input into a target pose; the Quest supplies a retargeted controller pose. Both feed the same robot controller. Their action is:

```text
[x, y, z, qx, qy, qz, qw, jaw_closedness]
```

Position is in metres in the robot base frame. Orientation is a normalized quaternion. In this local Isaac Lab 3.0 EA checkout the quaternion order is **xyzw**; older examples may use **wxyz**, so I check the installed implementation instead of copying the ordering blindly. `jaw_closedness` runs from 0 for open to 1 for closed.

The gripper is controlled separately from the arm. The arm has five controlled joints: `Rotation`, `Pitch`, `Elbow`, `Wrist_Pitch`, and `Wrist_Roll`. `Jaw` is the sixth joint in the recorded state and joint-target vectors.

## Inverse kinematics, starting with two links

Forward kinematics answers: “Given these joint angles, where does the gripper end up?” Inverse kinematics reverses that question: “Given this desired gripper position, what angles should the joints have?”

A two-link arm in a plane makes this visible. Let the first link have length `L₁`, the second `L₂`, the shoulder angle be `θ₁`, and the elbow angle relative to the first link be `θ₂`. Its endpoint is:

```text
x = L₁ cos(θ₁) + L₂ cos(θ₁ + θ₂)
y = L₁ sin(θ₁) + L₂ sin(θ₁ + θ₂)
```

The demo below implements both a geometric solution and an iterative damped least-squares solution. Move the target, then run the solver or advance one iteration at a time. Switch to the analytic solver to see the two elbow configurations that can reach the same point.

<iframe class="teleop-ik" data-portfolio-demo src="{{ '/demos/ik-2d/' | relative_url }}" title="Interactive two-link inverse kinematics solver" loading="lazy"></iframe>

[Open the IK playground on its own]({{ '/demos/ik-2d/' | relative_url }}).

### Solving it with geometry

The base, elbow, and target form a triangle. Applying the cosine rule gives:

```text
c₂ = (x² + y² − L₁² − L₂²) / (2 L₁ L₂)
θ₂ = ± acos(c₂)
θ₁ = atan2(y, x) − atan2(L₂ sin(θ₂), L₁ + L₂ cos(θ₂))
```

The plus and minus choices describe the two elbow branches. This is already a useful lesson: IK can have more than one solution. A controller also has to choose a configuration that is comfortable, continuous with the previous one, and compatible with the mechanism.

IK can also have no solution. With freely rotating joints, this endpoint can reach only the annulus:

```text
|L₁ − L₂| ≤ sqrt(x² + y²) ≤ L₁ + L₂
```

There is an inner gap when the links have different lengths, as well as an outer reach limit. The analytic demo projects an impossible request to the nearest boundary and keeps displaying the error to the **original** target. Projection is a choice in this teaching example, not a claim that every IK solver handles unreachable targets that way.

### Solving it a little at a time

For a more general robot, I can work from the current configuration. The **Jacobian** describes how a small change in each joint affects the endpoint. For this arm:

```text
J = [ −L₁ sin(θ₁) − L₂ sin(θ₁+θ₂)   −L₂ sin(θ₁+θ₂) ]
    [  L₁ cos(θ₁) + L₂ cos(θ₁+θ₂)    L₂ cos(θ₁+θ₂) ]

endpoint_change ≈ J × joint_angle_change
error = target_position − current_endpoint
```

Differential IK turns that error into a joint update, recomputes the endpoint and Jacobian, and repeats. A common update is **damped least squares**:

```text
Δθ = Jᵀ (J Jᵀ + λ² I)⁻¹ error
θ_next = θ_current + α Δθ
```

`λ` is damping and `α` scales the update. The demo uses `α = 0.7` and caps the joint-update norm at `0.14` radians per iteration so that the steps remain small. It solves the little linear system directly, which avoids explicitly constructing its inverse.

Why damping? Near a fully extended arm, some Cartesian motions are hard to produce with a small joint change. An undamped inversion can amplify those directions into very large updates. Damping regularizes the solve; it improves behavior near singular configurations but does not manufacture missing degrees of freedom or guarantee convergence from every starting pose.

Try an unreachable target and a nearly straight arm. The iterative solver keeps the requested target, so residual error remains when the arm cannot reach it. At an exact singularity, an iterative method can also get stuck: resetting to a slightly bent configuration may give it a useful direction to move.

This demo ignores joint limits, collisions, orientation, and actuator dynamics. In a robot controller, those concerns matter too. IK provides a target configuration; the simulator's actuators and physics determine how the arm moves toward it. NVIDIA's [task-space controller tutorial](https://isaac-sim.github.io/IsaacLab/main/source/tutorials/05_controllers/run_diff_ik.html) shows that controller-to-joint-target loop in Isaac Lab.

## Try pose IK on the SO-101

The two-link example isolates position. This next playground uses the SO-101's actual published joint transforms, tool frame and limits, with a polygonal rendering in this site's palette. Move or rotate the translucent target cube, orbit the scene, or enter its position and roll/pitch/yaw directly. The end effector tries to match the requested pose using damped least squares.

<iframe class="teleop-ik3d" data-portfolio-demo src="{{ '/demos/so101/' | relative_url }}" title="Interactive SO-101 position and orientation IK playground" loading="lazy"></iframe>

[Open the 3D SO-101 playground]({{ '/demos/so101/' | relative_url }}).

The five arm joints do not provide six independently controllable pose dimensions. Some position-and-rotation requests are incompatible, even when the position alone is reachable. The demo shows both residuals and offers position-only solving. The target cube has no collision hitbox, and this is a kinematic illustration rather than an Isaac Sim physics rollout. Visual meshes are simplified; the solver uses the original kinematic values from [TheRobotStudio's SO-101 model](https://github.com/TheRobotStudio/SO-ARM100/tree/a758567c3978dfeefe282ede0500085a48fe8f78/Simulation/SO101).

## Adding IK to the Isaac Sim task

My simulation uses **Isaac Lab running on Isaac Sim**. In its manager-based environment, the action configuration contains action-term configuration objects. The action manager constructs those terms and routes each portion of the action tensor to the appropriate controller.

The basic relative-IK configuration in my `cube_box_env_cfg.py` looks like this; I have shortened the surrounding task configuration:

```python
from isaaclab.controllers.differential_ik_cfg import DifferentialIKControllerCfg
from isaaclab.envs.mdp.actions.actions_cfg import (
    DifferentialInverseKinematicsActionCfg,
    JointPositionActionCfg,
)
from isaaclab.utils import configclass

@configclass
class CubeBoxIKActionsCfg:
    arm_action = DifferentialInverseKinematicsActionCfg(
        asset_name="robot",
        joint_names=["Rotation", "Pitch", "Elbow", "Wrist_Pitch", "Wrist_Roll"],
        body_name="gripper",
        controller=DifferentialIKControllerCfg(
            command_type="pose",
            use_relative_mode=True,
            ik_method="dls",
            ik_params={"lambda_val": 0.05},
        ),
        scale=1.0,
    )
    gripper_action = JointPositionActionCfg(
        asset_name="robot",
        joint_names=["Jaw"],
        scale=1.0,
        use_default_offset=False,
    )
```

The environment assigns an instance to `actions`:

```python
@configclass
class SO101CubeBoxIKTeleopEnvCfg(SO101CubeBoxTeleopEnvCfg):
    actions: CubeBoxIKActionsCfg = CubeBoxIKActionsCfg()
```

`asset_name` selects the robot articulation in the scene. `joint_names` selects the joints that IK may move, and `body_name` selects the body whose pose it controls. Here that body is `gripper`; a different robot might need a tool-center offset so the controlled frame is actually the contact point I care about.

In this **relative pose** mode, the arm action has six components: three translation increments and three small rotation increments. The jaw adds one more. The input is therefore seven-dimensional, not the eight-dimensional absolute pose shown earlier.

The gamepad relative-IK path multiplies its translation and rotation commands by their respective rates and the environment step duration before calling `env.step(action)`. Multiplying by time is important: a requested velocity should not become twice as fast just because I step the simulation twice as often.

This configuration belongs to the Isaac Lab environment; it is not a generic setting to paste into any standalone Isaac Sim script. A standalone simulation needs to obtain the articulation state and Jacobian, call a controller, and apply its joint targets itself.

### The absolute-pose path used for Quest

A headset controller naturally supplies an absolute pose after coordinate conversion. For that path, my `cube_box_teleop.py` uses the SO-101 action and controller classes from the local Isaac Lab checkout:

```python
arm_action = SO101PoseIKActionCfg(
    asset_name="robot",
    joint_names=["Rotation", "Pitch", "Elbow", "Wrist_Pitch", "Wrist_Roll"],
    body_name="gripper",
    scale=1.0,
    controller=SO101PoseIKControllerCfg(
        command_type="pose",
        use_relative_mode=False,
        ik_method="adaptive_dls",
        ik_params={
            "lambda_min": 0.05,
            "lambda_max": 0.2,
            "sigma_thresh": 0.02,
        },
        orientation_weight=0.5,
        orientation_joint_names=("Wrist_Pitch", "Wrist_Roll"),
        joint_limit_avoidance_gain=0.5,
        joint_limit_avoidance_margin=0.3,
    ),
)
```

These classes are imported from `isaaclab_tasks.contrib.stack.config.so101.pose_ik_action` and `pose_ik_controller`. This is the configuration of my checked-out stack, including its local SO-101 implementation. It is not a promise that every Isaac Lab release exposes these parameters or import paths.

The arm has **five arm joints**, while an arbitrary 3D position and orientation contain six task degrees of freedom. The solver cannot satisfy every possible controller pose exactly. My controller soft-weights orientation and masks its Jacobian columns so that only the wrist joints serve the orientation rows; all five arm joints still serve position. Position gets more emphasis, but this weighted solve is not a strict guarantee of exact position priority.

Adaptive damping increases regularization near poorly conditioned configurations. Joint-limit avoidance adds a bias away from limits. Neither replaces a collision-aware planner. A pose that looks reasonable in my hand can still be unreachable, awkward, or obstructed for the robot.

The jaw action maps the trigger's normalized value into the simulated joint range:

```text
Jaw target [rad] = −0.1465 + jaw_closedness × (1.3 − (−0.1465))
```

Keeping the jaw out of the pose solve makes its behavior explicit: hand motion commands the arm pose; the trigger commands the grip.

## Connecting the Meta Quest to my PC

The Quest does tracking and displays the immersive scene. My PC runs the robot simulation, physics, rendering, retargeting, and IK. The connection has two directions: pose and button data travel toward the simulator, while rendered views travel back to the headset.

{% include teleoperation-connection.html %}

The client on the Quest is the **Isaac web client built on CloudXR.js**, running in Quest Browser with WebXR. On the PC, the **CloudXR OpenXR runtime** exposes the remote XR device to the application. Isaac Sim's Kit XR bridge shares the XR session handles with Isaac Teleop. The [Isaac Teleop documentation](https://isaac-sim.github.io/IsaacLab/v3.0.0-EA/source/features/isaac_teleop.html) describes this client/runtime integration.

Calling OpenXR a “layer” is a useful first sketch, but the concrete component here is a runtime implementing that API. OpenXR is not itself a video transport. CloudXR and the browser client provide the streaming connection around it.

### My local USB launcher

I use a local helper called `isaac-quest-usb`. It downloads the versioned release-1.4 client assets if they are missing, serves them locally, and starts:

```bash
python -m isaacteleop.cloudxr --setup-oob --usb-local
```

The helper sets the client address to `https://localhost:8080/?immersiveMode=vr` and sets `USB_TURN_PORT=3480`. The installed launcher sets up ADB reverse forwarding, a secure WebSocket proxy, the CloudXR backend, an HTTPS server for the client, and a coturn relay for the WebRTC connection. Because these services are forwarded, `localhost` in the headset browser can reach the host services. Wi-Fi remains enabled: the local implementation still needs a non-loopback headset interface for WebRTC ICE.

This helper and its USB mode are details of my installed setup. They should not be assumed to exist in an unmodified installation. For reproducing the general connection, start with NVIDIA's [CloudXR setup guide](https://isaac-sim.github.io/IsaacLab/main/source/how-to/cloudxr_teleoperation.html) and use the client and launcher versions that match the installed teleoperation package.

My launch sequence is:

1. Connect the Quest over USB, enable developer/USB debugging access, and authorize the PC in the headset. The helper expects one authorized headset and `adb` and `coturn` on the PC.
2. Run `isaac-quest-usb` and leave that terminal running.
3. In the Isaac Lab environment, source the generated runtime environment and start the task.
4. Connect the browser client and start XR in Isaac Sim if it is not active yet. Press `B` in the simulator window to start control and recording; `P` pauses and `R` discards the current trajectory and resets.

From the teleoperation repository, my collection command is:

```bash
source ~/.cloudxr/run/cloudxr.env

controller_agent --input_device quest \
  --episodes 20 --seed 101 --timeout_s 120 \
  --participant operator \
  --dataset_file outputs/comparison/quest/episodes.hdf5 \
  --record_rgb --camera_size 256 --visualizer kit
```

The script chooses absolute `pose` mode for Quest. It attaches to the existing runtime with `auto_launch_cloudxr=False` and `use_kit_xr_bridge=True`, rather than starting a second competing runtime. The matching gamepad command uses `--input_device gamepad --control_mode pose` and its own dataset path.

### The coordinate conversion is as important as the connection

Receiving a controller pose is not enough. The tracking frame, simulated world, and robot base are different coordinate systems. Isaac Teleop's anchor transform maps tracking into the scene, and the task identifies `/World/envs/env_0/Robot/base` as the target frame.

My retargeting pipeline takes the right controller, transforms it through the anchor, and passes it to `Se3AbsRetargeter`. It uses a 90-degree target roll offset, combines the pose with `SO101GripperRetargeter`'s trigger command, then orders the output into the eight-dimensional action.

This explains a common failure mode: the stream works and IK works, yet the robot moves in a surprising direction. A frame or orientation mismatch can be responsible. I check the axis directions, pose ordering, and gripper frame before tuning IK gains.

I also found headset recentering useful for adjusting my viewpoint. With an absolute-pose mapping, changing the tracking origin can change target coordinates, so I recenter while paused or between trials. This mapping does not add a custom clutch that lets me reposition my hand while keeping the robot target fixed.

## Turning teleoperation into demonstrations

A video is useful for showing the behavior, but a policy needs synchronized observations and actions. My collector saves successful trajectories to an Isaac Lab/robomimic-style **HDF5** file and trial summaries to a neighboring **CSV**. That HDF5 file is the source recording; it is not already a native LeRobot dataset.

Each stored trajectory includes the initial scene state, pre-action observations, the Cartesian teleoperation action, executed joint-position targets, post-action state and `next_obs`, timestamps, and termination information. With `--record_rgb`, it also stores fixed overhead and wrist-camera RGB. These recording views do not depend on where I look in VR.

The distinction between pre- and post-action observations matters. The training pair is the observation available **before** the command and the command applied to that state. Pairing an action with its resulting image would shift the supervision by a step.

### What I have collected so far

Inspecting the local comparison files on October 11, 2026 gave the following snapshot of the October 4 collection:

| Input | Saved successful episodes | Recorded frames | Recorded simulation time |
| --- | ---: | ---: | ---: |
| Gamepad | 2 | 5,554 | 92.57 s |
| Quest | 4 | 2,225 | 37.08 s |
| Total | 6 | 7,779 | 129.65 s |

Each camera produces `256 × 256 × 3` uint8 images. Physics runs at `1/120` seconds per step, with action decimation of 2, so recorded control steps represent **60 Hz of simulation time**. Rendering and processing make wall time longer; nominal 60 Hz does not mean the headset or collector ran at 60 real-time frames per second.

For example, Quest `demo_0` contains 564 frames: 9.4 seconds of simulation time and about 27.34 seconds of wall time. The video below combines that episode's **recorded camera arrays**, without rerunning the simulator. It plays at the nominal simulation rate; the footer displays both clocks. The stored image frames are observations before each action, so the final post-action observation is stored separately as `next_obs`.

<figure class="teleop-video">
  <video controls playsinline preload="metadata" poster="{{ '/assets/teleoperation/quest-recorded-cameras-poster.jpg' | relative_url }}" aria-label="Overhead and wrist-camera observations from a recorded Quest demonstration">
    <source src="{{ '/assets/teleoperation/quest-recorded-cameras.mp4' | relative_url }}" type="video/mp4">
    <a href="{{ '/assets/teleoperation/quest-recorded-cameras.mp4' | relative_url }}">Watch the recorded camera example.</a>
  </video>
  <figcaption>Quest demo_0: overhead camera on the left and wrist camera on the right. Playback follows simulation time, so this is not a wall-time speed comparison.</figcaption>
</figure>

The collector's success rule checks whether the cube center stays inside the configured box region with linear speed below 5 cm/s for 20 consecutive control steps, after warmup. That is a geometric stability heuristic. It does not prove the gripper has released the cube; a cube held still in the region can satisfy it.

Only successful trajectories go into the current HDF5 files. Failures, manual resets, and interruptions retain CSV summaries, so a training collection and a performance analysis have different denominators. The current CSVs contain 8 gamepad rows and 32 Quest rows, including many manual resets. The seeds and attempt order are not a clean matched cohort. I would not turn the successful-episode durations or these counts into a speed or success-rate claim about VR.

[Download the inspected data snapshot]({{ '/assets/teleoperation/dataset-snapshot.json' | relative_url }}), including episode lengths, timing, software metadata, and one actual state/action sample.

## Exporting to LeRobot format

My export script turns the successful HDF5 demonstrations into a local LeRobot dataset:

```bash
export_comparison_lerobot \
  --dataset_file outputs/comparison/quest/episodes.hdf5 \
  --output outputs/comparison/quest/lerobot \
  --repo_id local/so101-quest-pickplace
```

This creates a new output directory and performs no upload. It defaults to embedded image frames. `--image_storage video` selects MP4 storage, which also needs a compatible decoder stack. The embedded-image path avoids the TorchCodec compatibility issue noted in my project guide.

The exported feature schema is explicit:

| Feature | Meaning in this exporter |
| --- | --- |
| `observation.state` | Six measured joint positions, in radians |
| `action` | Six executed joint-position **targets**, in radians |
| `observation.images.overhead` | RGB observation before the action |
| `observation.images.wrist` | RGB observation before the action |
| `observation.wall_time_s` | Recorded elapsed wall time |
| `next.done` | True on the final exported transition |
| `next.success` | True on the final transition of a successful episode |
| `task_index` | Index of the task instruction supplied during export |

Both joint vectors use this order:

```text
[Rotation, Pitch, Elbow, Wrist_Pitch, Wrist_Roll, Jaw]
```

There are two different things called an “action” in this pipeline. The collector's eight-dimensional action is the **desired Cartesian pose plus grip**. The exporter trains on the six-dimensional **joint targets actually sent to the simulated robot** after IK. Neither is the same as the six measured joint positions.

This exporter identifies the robot as `so101_sim_radians`. Hardware SO-101 datasets may use different normalization conventions. Sharing a robot name or a vector length does not make action scales interchangeable; a policy and its deployment adapter must agree about units and joint order.

LeRobot v3 organizes numerical rows in Parquet and describes schema, statistics, tasks, and episode boundaries with metadata. For video storage, multiple episodes can share MP4 shards; readers recover boundaries from metadata. It is not necessarily “one MP4 and one Parquet file per episode.” See the [LeRobot v3 format guide](https://huggingface.co/docs/lerobot/lerobot-dataset-v3).

For the installed exporter, the layout is approximately:

```text
lerobot/
├── data/chunk-000/file-000.parquet
├── meta/
│   ├── info.json
│   ├── stats.json
│   ├── tasks.parquet
│   ├── episodes/chunk-000/file-000.parquet
│   └── teleop_trials.json
└── videos/                         # only with video image storage
    ├── observation.images.overhead/chunk-000/file-000.mp4
    └── observation.images.wrist/chunk-000/file-000.mp4
```

Paths are determined by the installed version and its `meta/info.json` templates. My installed library uses `tasks.parquet`; some documentation examples show `tasks.jsonl`. With the default embedded-image export, the camera images are stored with the tabular data and the `videos` directory is absent. At loading time, image tensors are generally channel-first, even though the stored camera arrays used here are height-width-channel.

After export, I can inspect a sample with the dataset API:

```python
from lerobot.datasets.lerobot_dataset import LeRobotDataset

dataset = LeRobotDataset(
    "local/so101-quest-pickplace",
    root="outputs/comparison/quest/lerobot",
)
sample = dataset[100]
print(sample["observation.state"])
print(sample["action"])
print(sample["observation.images.overhead"].shape)
```

The exporter also writes `meta/teleop_trials.json`, preserving source-episode provenance and the action-unit convention. I want that context to travel with the data rather than relying on what I happen to remember when I train a model later.

## What I want to try next

The next step is collecting more varied, carefully reviewed demonstrations: different object placements, clean releases, and consistent task instructions. I want to inspect observation/action alignment and verify the success labels before treating the recordings as training data.

Then I can establish an imitation-learning baseline and explore task-conditioned VLA models. The choice of action representation will be part of that work: a policy predicting joint targets needs a different deployment interface from one predicting Cartesian motion. A dataset format alone does not resolve that choice or demonstrate policy performance.

For me, VR made the operator side of the problem easier to think about. The interesting engineering is everything between that intuitive hand motion and a useful training example: frames, reachable poses, gripper semantics, clocks, episode boundaries, and enough metadata to know what the numbers actually mean.

The implementation is in my [SO-101 teleoperation repository](https://github.com/devarshi16/so101-teleoperation). This article is grounded in the local collection's Isaac Sim `6.1.0.0`, Isaac Teleop `1.4.98rc1`, and Isaac Lab 3.0 EA setup. The earlier leader-arm workflow in the repository README uses a different tested stack; I keep those versions separate when reproducing results.
