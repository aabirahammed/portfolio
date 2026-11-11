/* ============================================================
   AABIR AHAMMED — ABOUT page scene
   A floating personnel ID card (click to flip) inside a career
   constellation of connected nodes and milestone beacons.
   Palette: deep blue / ice / periwinkle on blue-black.

   Drag to orbit the constellation · click the card to flip it ·
   the timeline auto-advances through career milestones.
   ============================================================ */
(async function () {
  const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js');

  const A1 = '#5b8cff', A2 = '#7dd3fc', BG = 0x070910;

  const stage = document.getElementById('stage');
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.FogExp2(BG, 0.04);

  const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0.2, 8.8);

  /* lights */
  scene.add(new THREE.AmbientLight(0x22304d, 0.8));
  scene.add(new THREE.HemisphereLight(0xa8c4ff, 0x070910, 0.4));
  const key  = new THREE.PointLight(0x5b8cff, 120, 40, 2); key.position.set(5, 3.5, 4);
  const fill = new THREE.PointLight(0x7dd3fc, 90, 40, 2);  fill.position.set(-5.5, -2.5, 3.5);
  const rim  = new THREE.DirectionalLight(0xffffff, 1.4);  rim.position.set(0, 5, -6);
  scene.add(key, fill, rim);

  function radialTexture(stops) {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    stops.forEach(([o, col]) => grd.addColorStop(o, col));
    g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: radialTexture([[0, 'rgba(91,140,255,0.34)'], [0.5, 'rgba(129,140,248,0.12)'], [1, 'rgba(0,0,0,0)']]),
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  glow.scale.setScalar(13);
  glow.position.set(1.2, 0, -2.6);
  scene.add(glow);

  /* ============================================================
     The personnel card — front & back canvas textures
  ============================================================ */
  const CW = 512, CH = 768;
  function rr(g, x, y, w, h, rad) {
    g.beginPath();
    g.moveTo(x + rad, y);
    g.arcTo(x + w, y, x + w, y + h, rad);
    g.arcTo(x + w, y + h, x, y + h, rad);
    g.arcTo(x, y + h, x, y, rad);
    g.arcTo(x, y, x + w, y, rad);
    g.closePath();
  }
  function cardBase(g) {
    g.fillStyle = '#070910'; g.fillRect(0, 0, CW, CH);
    const bg = g.createLinearGradient(0, 0, 0, CH);
    bg.addColorStop(0, '#0e1424'); bg.addColorStop(1, '#090d18');
    rr(g, 10, 10, CW - 20, CH - 20, 30);
    g.fillStyle = bg; g.fill();
    g.strokeStyle = 'rgba(91,140,255,0.5)'; g.lineWidth = 2; g.stroke();
  }
  function frontTex() {
    const c = document.createElement('canvas'); c.width = CW; c.height = CH;
    const g = c.getContext('2d');
    cardBase(g);
    g.fillStyle = 'rgba(125,211,252,0.7)';
    g.font = '500 13px "JetBrains Mono", monospace';
    g.textAlign = 'left';  g.fillText('PERSONNEL FILE — 2026', 48, 54);
    g.textAlign = 'right'; g.fillText('ID 0093', CW - 48, 54);
    g.strokeStyle = 'rgba(91,140,255,0.25)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(48, 76); g.lineTo(CW - 48, 76); g.stroke();

    // portrait placeholder
    const pg = g.createLinearGradient(0, 150, 0, 480);
    pg.addColorStop(0, '#16213c'); pg.addColorStop(1, '#0b101e');
    rr(g, 66, 140, CW - 132, 340, 20); g.fillStyle = pg; g.fill();
    g.save(); rr(g, 66, 140, CW - 132, 340, 20); g.clip();
    g.fillStyle = '#3b4f7d';
    g.beginPath(); g.arc(256, 292, 58, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#2e3f66';
    rr(g, 186, 368, 140, 100, 48); g.fill();
    g.fillStyle = 'rgba(125,211,252,0.08)';
    for (let i = 0; i < 8; i++) g.fillRect(80 + i * 46, 150, 2, 320);
    g.restore();
    g.strokeStyle = 'rgba(91,140,255,0.45)'; g.lineWidth = 2;
    rr(g, 66, 140, CW - 132, 340, 20); g.stroke();
    g.fillStyle = 'rgba(143,168,216,0.85)';
    g.font = '500 13px "JetBrains Mono", monospace'; g.textAlign = 'center';
    g.fillText('RENDER_PENDING — PORTRAIT v0.3', 256, 462);

    // name + role
    g.fillStyle = '#ffffff';
    g.font = '800 56px Syne, sans-serif';
    g.fillText('AABIR', 256, 570);
    g.fillStyle = A2;
    g.fillText('AHAMMED', 256, 626);
    g.fillStyle = A1;
    g.font = '500 15px "JetBrains Mono", monospace';
    g.fillText('MOTION DESIGNER & VIDEO EDITOR', 256, 664);
    g.fillStyle = 'rgba(154,169,200,0.9)';
    g.font = '500 14px "JetBrains Mono", monospace';
    g.fillText('8+ YRS · TITLES · BRANDS · MUSIC', 256, 694);

    // status pill
    rr(g, 106, 714, 300, 34, 17);
    g.fillStyle = 'rgba(74,222,128,0.1)'; g.fill();
    g.strokeStyle = 'rgba(74,222,128,0.45)'; g.stroke();
    g.fillStyle = '#4ade80';
    g.font = '600 14px "JetBrains Mono", monospace';
    g.fillText('● OPEN FOR PROJECTS', 256, 737);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    return tex;
  }
  function backTex() {
    const c = document.createElement('canvas'); c.width = CW; c.height = CH;
    const g = c.getContext('2d');
    cardBase(g);
    g.fillStyle = A1;
    g.font = '500 13px "JetBrains Mono", monospace';
    g.textAlign = 'left';  g.fillText('QUICK_FACTS.TXT', 48, 54);
    g.textAlign = 'right'; g.fillStyle = 'rgba(125,211,252,0.7)'; g.fillText('v26.1', CW - 48, 54);
    g.strokeStyle = 'rgba(91,140,255,0.25)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(48, 76); g.lineTo(CW - 48, 76); g.stroke();

    const rows = [
      ['SOFTWARE',      'Premiere Pro · DaVinci Resolve'],
      ['MOTION',        'After Effects'],
      ['3D & DYNAMICS', 'Blender'],
      ['DELIVERY',      '4K · ProRes · H.265'],
      ['BASE',          'Remote — worldwide'],
    ];
    rows.forEach(([label, val], i) => {
      const y = 128 + i * 74;
      g.fillStyle = 'rgba(154,169,200,0.75)';
      g.font = '500 13px "JetBrains Mono", monospace';
      g.textAlign = 'left'; g.fillText(label, 48, y);
      g.fillStyle = '#ffffff';
      g.font = '600 21px Inter, sans-serif';
      g.fillText(val, 48, y + 32);
    });

    g.strokeStyle = 'rgba(91,140,255,0.25)';
    g.beginPath(); g.moveTo(48, 508); g.lineTo(CW - 48, 508); g.stroke();

    g.fillStyle = 'rgba(154,169,200,0.75)';
    g.font = '500 13px "JetBrains Mono", monospace';
    g.fillText('ELSEWHERE', 48, 552);
    const chips = ['Bē', 'Ig', 'Yt', 'in', 'X'];
    chips.forEach((ch, i) => {
      const x = 48 + i * 62;
      rr(g, x, 576, 48, 48, 12);
      g.fillStyle = 'rgba(91,140,255,0.12)'; g.fill();
      g.strokeStyle = 'rgba(91,140,255,0.5)'; g.stroke();
      g.fillStyle = '#ffffff';
      g.font = '700 19px Syne, sans-serif'; g.textAlign = 'center';
      g.fillText(ch, x + 24, 607);
    });

    g.fillStyle = 'rgba(154,169,200,0.75)';
    g.font = '500 13px "JetBrains Mono", monospace'; g.textAlign = 'center';
    g.fillText('TAP TO FLIP BACK', 256, 706);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    return tex;
  }

  const root = new THREE.Group();
  scene.add(root);

  const cardGroup = new THREE.Group();
  root.add(cardGroup);
  const sideMat = new THREE.MeshBasicMaterial({ color: 0x0c101c });
  const card = new THREE.Mesh(
    new THREE.BoxGeometry(2.3, 3.45, 0.07),
    [sideMat, sideMat, sideMat, sideMat,
     new THREE.MeshBasicMaterial({ map: frontTex() }),
     new THREE.MeshBasicMaterial({ map: backTex() })]
  );
  cardGroup.add(card);

  const cardHalo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: radialTexture([[0, 'rgba(91,140,255,0.4)'], [0.5, 'rgba(91,140,255,0.1)'], [1, 'rgba(0,0,0,0)']]),
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  cardHalo.scale.set(4.4, 5.4, 1);
  cardHalo.position.z = -0.35;
  cardGroup.add(cardHalo);

  /* ============================================================
     Career constellation
  ============================================================ */
  const orbit = new THREE.Group();
  root.add(orbit);

  const nodeCount = 46;
  const nodes = [];
  for (let i = 0; i < nodeCount; i++) {
    const r = 3.2 + Math.random() * 3.2;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    nodes.push(new THREE.Vector3(
      r * Math.sin(ph) * Math.cos(th),
      r * Math.sin(ph) * Math.sin(th) * 0.8,
      r * Math.cos(ph)
    ));
  }
  const nGeo = new THREE.BufferGeometry().setFromPoints(nodes);
  orbit.add(new THREE.Points(nGeo, new THREE.PointsMaterial({
    color: 0x7dd3fc, size: 0.05, transparent: true, opacity: 0.75,
    blending: THREE.AdditiveBlending, depthWrite: false
  })));
  // connect each node to its 2 nearest neighbours
  const linePts = [];
  nodes.forEach((p, i) => {
    const dists = nodes.map((q, j) => ({ j, d: p.distanceTo(q) })).filter(o => o.j !== i).sort((a, b) => a.d - b.d);
    for (let k = 0; k < 2; k++) {
      if (dists[k].d < 2.6) { linePts.push(p, nodes[dists[k].j]); }
    }
  });
  orbit.add(new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(linePts),
    new THREE.LineBasicMaterial({ color: 0x5b8cff, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false })
  ));

  /* sparks */
  const sparks = [];
  const sparkGeo = new THREE.OctahedronGeometry(0.09);
  for (let i = 0; i < 10; i++) {
    const s = new THREE.Mesh(sparkGeo, new THREE.MeshBasicMaterial({
      color: 0x7dd3fc, transparent: true, opacity: 0.8
    }));
    const a = Math.random() * Math.PI * 2, r = 2.2 + Math.random() * 2.5;
    s.position.set(Math.cos(a) * r, Math.sin(a * 1.4) * 1.4, Math.sin(a) * r);
    s.userData = { phase: Math.random() * 6.28 };
    orbit.add(s); sparks.push(s);
  }

  /* milestone beacons */
  const milestones = [
    { t: '2018 — FIRST CUT',    d: 'Pirated Premiere, a laptop that sounded like a jet engine, and one very patient friend.' },
    { t: '2020 — STUDIO YEARS', d: 'Two years cutting ads and broadcast promos — where deadlines stopped being scary and started being fun.' },
    { t: '2023 — FREELANCE',    d: 'Went solo. Titles, brand films and music visuals for studios and artists worldwide.' },
    { t: '2026 — YOUR PROJECT', d: 'The next frame is still empty. This slot is reserved — let\'s fill it together.' },
  ];
  const M = milestones.length;
  const beacons = [];
  const beaconGeo = new THREE.OctahedronGeometry(0.2);
  const beaconHalo = radialTexture([[0, 'rgba(125,211,252,0.55)'], [0.55, 'rgba(91,140,255,0.16)'], [1, 'rgba(0,0,0,0)']]);
  for (let i = 0; i < M; i++) {
    const b = new THREE.Mesh(beaconGeo, new THREE.MeshStandardMaterial({
      color: 0x101a30, emissive: 0x5b8cff, emissiveIntensity: 1.0, metalness: 0.4, roughness: 0.3
    }));
    const a = (i / M) * Math.PI * 2 + 0.7;
    b.position.set(Math.cos(a) * 2.7, Math.sin(a * 2) * 0.75, Math.sin(a) * 2.7);
    const h = new THREE.Sprite(new THREE.SpriteMaterial({
      map: beaconHalo, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.8
    }));
    h.scale.setScalar(1.6); h.visible = false;
    b.add(h);
    orbit.add(b);
    beacons.push({ mesh: b, halo: h, scale: 1, kick: 0 });
  }

  /* ============================================================
     Caption (DOM)
  ============================================================ */
  const msIdx = document.getElementById('msIdx');
  const msTitle = document.getElementById('msTitle');
  const msText = document.getElementById('msText');
  const capEl = document.querySelector('.about-caption');
  let idx = 0, capT = 0;
  function renderCaption(i) {
    msIdx.textContent = `${String(i + 1).padStart(2, '0')} / ${String(M).padStart(2, '0')}`;
    msTitle.textContent = milestones[i].t;
    msText.textContent = milestones[i].d;
  }
  function setCaption(i, instant) {
    idx = ((i % M) + M) % M;
    beacons.forEach((b, k) => b.halo.visible = k === idx);
    if (instant) { renderCaption(idx); return; }
    clearTimeout(capT);
    capEl.classList.add('swap');
    capT = setTimeout(() => { renderCaption(idx); capEl.classList.remove('swap'); }, 220);
  }
  setCaption(0, true);

  /* ============================================================
     Interaction
  ============================================================ */
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let userRotY = 0, velY = 0;
  let dragging = false, moved = 0, lastX = 0;
  let flipTarget = 0, flipT = 0;
  let hoverCard = false, hoverBeacon = -1;
  let manualLock = 0;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(0, 0);

  stage.addEventListener('pointerdown', e => {
    dragging = true; moved = 0;
    lastX = e.clientX;
    stage.classList.add('dragging');
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', e => {
    pointer.x = (e.clientX / innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / innerHeight) * 2 + 1;
    if (dragging) {
      const dx = e.clientX - lastX;
      moved += Math.abs(dx);
      userRotY += dx * 0.004;
      velY = dx * 0.004;
      lastX = e.clientX;
      manualLock = performance.now() + 5000;
    }
  });
  addEventListener('pointerup', () => {
    if (dragging && moved < 6) {
      if (hoverCard) flipTarget = flipTarget ? 0 : 1;
      else if (hoverBeacon >= 0) { setCaption(hoverBeacon); manualLock = performance.now() + 5000; beacons[hoverBeacon].kick = 0.3; }
    }
    dragging = false;
    stage.classList.remove('dragging');
  });
  stage.addEventListener('pointerleave', () => { pointer.set(0, 0); });

  /* ============================================================
     Responsive layout
  ============================================================ */
  let baseScale = 1;
  function layout() {
    const w = innerWidth;
    renderer.setSize(w, innerHeight);
    camera.aspect = w / innerHeight;
    camera.updateProjectionMatrix();
    if (w > 1500)      { root.position.x = 1.7;  baseScale = 1.0; }
    else if (w > 1050) { root.position.x = 1.35; baseScale = 0.92; }
    else if (w > 760)  { root.position.x = 0.9;  baseScale = 0.78; }
    else               { root.position.x = 0;    baseScale = 0.5; }
    /* mobile: card + constellation sit in the clear band below the CTAs */
    root.position.y = w > 760 ? 0 : -0.35;
  }
  layout();
  addEventListener('resize', layout);

  /* ============================================================
     Animate
  ============================================================ */
  const clock = new THREE.Clock();
  let introT = 0;
  const easeOut = x => 1 - Math.pow(1 - x, 3);
  const easeInOut = x => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;

  /* seamless loop — scene-local play phase integrates real time so rotation
     never snaps when EDIT.time wraps; follows the scrub head while scrubbing */
  let playPhase = 0, lastEdit = window.EDIT.time;

  function tick() {
    requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);
    if (window.EDIT.scrubbing) playPhase += window.EDIT.time - lastEdit;
    else if (!window.EDIT.paused) playPhase += dt;
    lastEdit = window.EDIT.time;
    const t = clock.elapsedTime;
    const now = performance.now();

    /* intro */
    introT = Math.min(introT + dt / 1.3, 1);
    root.scale.setScalar(Math.max(easeOut(introT) * baseScale, 0.0001));

    /* constellation rotation */
    if (!dragging) { userRotY += velY; velY *= 0.94; }
    orbit.rotation.y = userRotY + t * 0.05 + playPhase * 0.02;
    orbit.rotation.x = Math.sin(t * 0.2) * 0.06;

    /* timeline auto-advance through milestones */
    if (now > manualLock && !reduced && (!window.EDIT.paused || window.EDIT.scrubbing)) {
      const auto = Math.floor(window.EDIT.time / (window.EDIT.dur / M)) % M;
      if (auto !== idx) setCaption(auto);
    }

    /* card flip + pointer tilt */
    flipT += (flipTarget - flipT) * (1 - Math.pow(0.002, dt));
    cardGroup.rotation.y = pointer.x * 0.28 + easeInOut(flipT) * Math.PI;
    cardGroup.rotation.x = -pointer.y * 0.2 + Math.sin(t * 0.8) * 0.03;
    cardGroup.position.y = Math.sin(t * 0.7) * 0.08;
    cardHalo.material.opacity = 0.7 + Math.sin(t * 1.6) * 0.15;

    /* hover raycast */
    if (!dragging) {
      raycaster.setFromCamera(pointer, camera);
      const cardHit = raycaster.intersectObject(card, false).length > 0;
      const bHit = raycaster.intersectObjects(beacons.map(b => b.mesh), false)[0];
      hoverCard = cardHit;
      hoverBeacon = bHit ? beacons.findIndex(b => b.mesh === bHit.object) : -1;
      stage.style.cursor = (cardHit || hoverBeacon >= 0) ? 'pointer' : 'grab';
    }

    /* beacons pulse */
    beacons.forEach((b, i) => {
      b.kick *= Math.pow(0.02, dt);
      const target = (i === idx ? 1.55 : 1) * (1 + b.kick);
      b.scale += (target - b.scale) * (1 - Math.pow(0.01, dt));
      b.mesh.scale.setScalar(b.scale);
      b.mesh.rotation.y = t * 0.6 + i;
      b.halo.material.opacity = i === idx ? 0.7 + Math.sin(t * 2.4) * 0.2 : 0;
    });
    sparks.forEach(s => {
      const p = 0.5 + 0.5 * Math.sin(t * 2 + s.userData.phase);
      s.scale.setScalar(0.6 + p * 0.9);
      s.material.opacity = 0.35 + p * 0.55;
      s.rotation.y = t + s.userData.phase;
    });

    /* camera parallax */
    const px = pointer.x * 0.5, py = -pointer.y * 0.3;
    camera.position.x += (px - camera.position.x) * 0.04;
    camera.position.y += ((0.2 + py) - camera.position.y) * 0.04;
    camera.lookAt(root.position.x * 0.55, 0, 0);

    renderer.render(scene, camera);
  }
  tick();
})();
