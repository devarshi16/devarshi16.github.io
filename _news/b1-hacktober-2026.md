---
title: "B1S Hacktober Physical AI 2026: teaching an SO101 to sort candy"
date: 2026-10-18
kind: Hackathon
summary: "At B1S Hacktober Physical AI our team taught an SO101 arm to pick blue candies out of a mixed pile, training ACT, SmolVLA and an RL policy on real teleoperated demos and an Isaac Sim digital twin."
image: /assets/news/b1-hacktober-2026/card.jpg
links:
  - label: Full results log
    url: https://claude.ai/artifact/XKQKGYizXrw1yjZ3Crb7gZ
  - label: SmolVLA grid model
    url: https://huggingface.co/MadmanMischief/smolvla_candy_grid
  - label: ACT model (127 real demos)
    url: https://huggingface.co/MadmanMischief/act_candy_sort_real128
  - label: Grid dataset
    url: https://huggingface.co/datasets/MadmanMischief/so101_candy_grid
---

The task: teach an SO101 arm, through leader/follower teleoperation, to pick the blue candies out of a mixed blue and green pile and drop them on a towel. Policies were trained on real demos, scripted Isaac Sim demos, or a mix of both, and checked on the real arm and in a digital twin.

<figure>
<video controls muted playsinline preload="metadata" poster="/assets/news/b1-hacktober-2026/act-real-blue-on-towel-poster.jpg"><source src="/assets/news/b1-hacktober-2026/act-real-blue-on-towel.mp4" type="video/mp4"></video>
<figcaption>On the real arm: ACT trained on 127 real demos (50k steps) picks a blue candy out of the pile and drops it on the towel. Phone camera on the left, wrist camera on the right.</figcaption>
</figure>

<figure>
<video controls muted playsinline preload="metadata" poster="/assets/news/b1-hacktober-2026/act-sim-blue-on-towel-poster.jpg"><source src="/assets/news/b1-hacktober-2026/act-sim-blue-on-towel.mp4" type="video/mp4"></video>
<figcaption>In the Isaac Sim digital twin: the same ACT policy at 70k steps carries a blue candy to the towel. It succeeded in 3 of 5 simulated rollouts.</figcaption>
</figure>

## What we built

- **Six datasets on Hugging Face**, from 30 full-resolution real demos up to 127 half-resolution ones, 55 scripted Isaac Sim demos, a 182-episode real + sim mix, and 71 demos with the candies spread on a taped grid.
- **ACT and SmolVLA policies** trained on an L40S and run on the arm from a laptop RTX 4060 at about 30 Hz.
- **An Isaac Sim / Isaac Lab digital twin** for scoring policies over fixed candy layouts, plus an RL policy trained from scratch in Isaac Lab and deployed on the real arm.
- **A custom phone camera app** after DroidCam over Wi-Fi turned out to be the weakest link in the setup.

## Results

- ACT trained on 127 real demos placed a blue candy on the towel on the real arm at 50k steps, and scored 3 of 5 in the simulated twin at 70k steps, up from 0 of 5 at 30k and 40k.
- SmolVLA trained on the grid data reached for and grasped blue candies on the real arm, but most runs did not end with a candy on the towel.
- The RL policy reaches over the detected candy on the real arm but has not learned to close the gripper yet.

## What we learned

- **One pick per demo means one pick per run.** Almost every demo picks a single candy, so after the first placement the arm is in a state training rarely continued from.
- **Grasps drift to the average spot.** ACT's grasps landed near the mean demo grasp pose rather than on a particular candy, which is why we recorded the grid dataset.
- **The gripper can't tell a hit from a miss.** A thin candy wrapper barely changes the gripper reading, so only the wrist camera shows whether a grasp worked.
- **Half resolution makes 30 Hz possible.** One ACT forward pass took 40 ms at full resolution and 12 ms at half.
