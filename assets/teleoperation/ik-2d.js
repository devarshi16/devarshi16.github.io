(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const L1 = 1, L2 = 0.8, SCALE = 110, TOL = 0.001;
  let q = [-0.45, 1.35], goal = [1.15, 0.75], count = 0, running = false, raf = null;
  const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
  const wrap = x => Math.atan2(Math.sin(x), Math.cos(x));
  const px = p => [250 + SCALE * p[0], 250 - SCALE * p[1]];
  function fk() {
    const elbow = [L1 * Math.cos(q[0]), L1 * Math.sin(q[0])];
    return { elbow, tip: [elbow[0] + L2 * Math.cos(q[0] + q[1]), elbow[1] + L2 * Math.sin(q[0] + q[1])] };
  }
  const reachable = () => { const r = Math.hypot(...goal); return r >= Math.abs(L1 - L2) - 1e-9 && r <= L1 + L2 + 1e-9; };
  function draw(message) {
    const pose = fk(), e = px(pose.elbow), t = px(pose.tip), g = px(goal);
    $('link-one').setAttribute('d', `M 250 250 L ${e[0]} ${e[1]}`);
    $('link-two').setAttribute('d', `M ${e[0]} ${e[1]} L ${t[0]} ${t[1]}`);
    for (const [id, p] of [['elbow', e], ['tip', t]]) { $(id).setAttribute('cx', p[0]); $(id).setAttribute('cy', p[1]); }
    $('target').setAttribute('transform', `translate(${g[0]} ${g[1]})`);
    $('error-line').setAttribute('d', `M ${t[0]} ${t[1]} L ${g[0]} ${g[1]}`);
    const error = Math.hypot(goal[0] - pose.tip[0], goal[1] - pose.tip[1]);
    $('q-one').textContent = `${(wrap(q[0]) * 180 / Math.PI).toFixed(1)}°`;
    $('q-two').textContent = `${(wrap(q[1]) * 180 / Math.PI).toFixed(1)}°`;
    $('error').textContent = `${error.toFixed(4)} units`;
    $('iterations').textContent = count;
    $('run').textContent = running ? 'Pause' : 'Run solver';
    if (message) $('status').textContent = message;
    return error;
  }
  function stop() { running = false; if (raf !== null) cancelAnimationFrame(raf); raf = null; }
  function step() {
    if ($('solver').value === 'analytic') {
      const radius = Math.hypot(...goal), r = clamp(radius, Math.abs(L1 - L2), L1 + L2);
      const heading = radius < 1e-12 ? 0 : Math.atan2(goal[1], goal[0]);
      const x = r * Math.cos(heading), y = r * Math.sin(heading);
      const c2 = clamp((x*x + y*y - L1*L1 - L2*L2)/(2*L1*L2), -1, 1);
      const q2 = Number($('branch').value) * Math.acos(c2);
      q = [Math.atan2(y, x) - Math.atan2(L2*Math.sin(q2), L1 + L2*Math.cos(q2)), q2];
      count = 1;
      draw(reachable() ? 'Solved geometrically.' : 'Unreachable request; solved the nearest boundary point.');
      return false;
    }
    const {tip} = fk(), ex = goal[0] - tip[0], ey = goal[1] - tip[1];
    if (Math.hypot(ex, ey) <= TOL) { draw('Converged within 0.001 units.'); return false; }
    // J maps small joint changes to an end-effector position change.
    const a = -L1*Math.sin(q[0]) - L2*Math.sin(q[0]+q[1]);
    const b = -L2*Math.sin(q[0]+q[1]);
    const c = L1*Math.cos(q[0]) + L2*Math.cos(q[0]+q[1]);
    const d = L2*Math.cos(q[0]+q[1]);
    const lambda = Number($('damping').value);
    // Solve (J Jᵀ + λ² I) v = error, then Δq = Jᵀ v.
    const A = a*a+b*b+lambda*lambda, B = a*c+b*d, D = c*c+d*d+lambda*lambda;
    const det = A*D-B*B, vx = (D*ex-B*ey)/det, vy = (A*ey-B*ex)/det;
    const dq = [0.7*(a*vx+c*vy), 0.7*(b*vx+d*vy)];
    const norm = Math.hypot(...dq), scale = norm > 0.14 ? 0.14/norm : 1;
    q = q.map((angle, i) => wrap(angle + scale*dq[i]));
    count++;
    const error = draw(reachable() ? 'Reducing position error…' : 'Target is outside the reachable annulus; showing best effort.');
    if (error <= TOL) { draw('Converged within 0.001 units.'); return false; }
    if (norm < 1e-8 || count >= 600) { draw(reachable() ? 'Stopped at a stationary point or iteration limit. Reset the arm to try another start.' : 'Stopped with residual error: this target is unreachable.'); return false; }
    return true;
  }
  function tick() { if (!running) return; if (!step()) { stop(); draw(); return; } raf = requestAnimationFrame(tick); }
  function setGoal(x, y) {
    stop(); goal = [clamp(x, -2.1, 2.1), clamp(y, -2.1, 2.1)]; count = 0;
    $('target-x').value = goal[0].toFixed(2); $('target-y').value = goal[1].toFixed(2);
    if ($('solver').value === 'analytic') step(); else draw(reachable() ? 'Target set. Run or step the solver.' : 'Unreachable target. Run to see the residual error.');
  }
  for (const id of ['target-x', 'target-y']) $(id).addEventListener('change', () => {
    const x = Number($('target-x').value), y = Number($('target-y').value);
    if (Number.isFinite(x) && Number.isFinite(y)) setGoal(x, y);
  });
  $('damping').addEventListener('input', () => { $('damping-value').textContent = Number($('damping').value).toFixed(2); });
  $('run').addEventListener('click', () => { if (running) { stop(); draw('Paused.'); } else if ($('solver').value === 'analytic') step(); else { running = true; draw(); tick(); } });
  $('step').addEventListener('click', () => { stop(); step(); draw(); });
  $('reset').addEventListener('click', () => { stop(); q = [-0.45, 1.35]; count = 0; if ($('solver').value === 'analytic') step(); else draw('Arm reset; target unchanged.'); });
  $('solver').addEventListener('change', () => {
    stop(); count = 0; const analytic = $('solver').value === 'analytic';
    $('dls-controls').hidden = analytic; $('analytic-controls').hidden = !analytic; $('step').disabled = analytic;
    if (analytic) step(); else draw('Iterative solver ready. Reset the arm to watch a fresh solve.');
  });
  $('branch').addEventListener('change', () => step());
  document.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => {
    stop(); q = [-0.45, 1.35];
    if (button.dataset.preset === 'outside') setGoal(2.05, 0.65);
    else if (button.dataset.preset === 'inside') setGoal(0.05, 0.03);
    else { q = [0, 0.025]; setGoal(1.4, 0.6); }
  }));
  const svg = $('arm-view'); let dragging = false;
  function pointerGoal(event) { const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(svg.getScreenCTM().inverse()); setGoal((p.x-250)/SCALE, (250-p.y)/SCALE); }
  svg.addEventListener('pointerdown', event => { if (event.button !== 0) return; dragging = true; svg.setPointerCapture(event.pointerId); pointerGoal(event); });
  svg.addEventListener('pointermove', event => { if (dragging) pointerGoal(event); });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) svg.addEventListener(type, () => { dragging = false; });
  draw('Ready. Drag the target, then run or step the solver.');
})();
