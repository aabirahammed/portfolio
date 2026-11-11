/* ============================================================
   AABIR AHAMMED — REEL page scene
   A screening room: a curved cinema screen playing a procedural
   showreel, flanked by pulsing EQ towers.
   Palette: acid lime / mint / green on deep green-black.

   The shared edit timeline IS the video scrubber:
   every frame of the "video" is drawn as a pure function of
   EDIT.time, so scrubbing cuts through the reel frame-accurately.
   Click the screen to play/pause · drag the room to orbit.
   ============================================================ */
(async function () {
  const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js');

  const A1 = '#a3e635', A2 = '#2dd4bf', BG = 0x080b07;

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
  camera.position.set(0, 0.2, 8.6);

  /* lights (screen is emissive; lights shape the towers/frame) */
  scene.add(new THREE.AmbientLight(0x2a3a22, 0.8));
  scene.add(new THREE.HemisphereLight(0xcfffbe, 0x080b07, 0.4));
  const key  = new THREE.PointLight(0xa3e635, 110, 40, 2); key.position.set(5, 3.5, 4);
  const fill = new THREE.PointLight(0x2dd4bf, 80, 40, 2);  fill.position.set(-5.5, -2.5, 3.5);
  const rim  = new THREE.DirectionalLight(0xffffff, 1.4);  rim.position.set(0, 5, -6);
  scene.add(key, fill, rim);

  /* lime glow behind the screen */
  function glowTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, 'rgba(163,230,53,0.35)');
    grd.addColorStop(0.5, 'rgba(34,197,94,0.12)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  glow.scale.setScalar(12);
  glow.position.set(0, 0, -2.6);
  scene.add(glow);

  /* ============================================================
     The "video" — procedural frames drawn on a 960×540 canvas.
     Pure function of t ⇒ frame-accurate scrubbing.
  ============================================================ */
  const DUR = 12; // must match the page's data-edit-dur
  const VW = 960, VH = 540;
  const vcan = document.createElement('canvas');
  vcan.width = VW; vcan.height = VH;
  const vg = vcan.getContext('2d');
  const videoTex = new THREE.CanvasTexture(vcan);
  videoTex.colorSpace = THREE.SRGBColorSpace;
  videoTex.anisotropy = 4;

  const ease = x => (x < 0 ? 0 : x > 1 ? 1 : 1 - Math.pow(1 - x, 3));
  const seg = (t, a, b) => Math.min(Math.max((t - a) / (b - a), 0), 1);
  function prng(seed) {
    let s = seed >>> 0;
    return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }
  function fmtTC(t) {
    const f = Math.floor((t % 1) * 24);
    const s = Math.floor(t) % 60;
    return `00:00:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
  }

  /* --- scene 1 (0–4s): kinetic identity type --- */
  function scene1(s) {
    // drifting diagonal stripes
    vg.save();
    vg.fillStyle = 'rgba(163,230,53,0.06)';
    for (let k = 0; k < 9; k++) {
      const x = ((k * 150 + s * 150) % (VW + 300)) - 150;
      vg.beginPath();
      vg.moveTo(x, VH); vg.lineTo(x + 90, VH); vg.lineTo(x + 270, 0); vg.lineTo(x + 180, 0);
      vg.closePath(); vg.fill();
    }
    vg.restore();

    const words = ['MOTION', 'CUT', 'COLOR', 'SOUND'];
    const wi = Math.min(3, Math.floor(s));
    const ws = s - wi;
    const p = ease(seg(ws, 0.05, 0.5));
    const fade = Math.min(seg(ws, 0, 0.12), 1 - seg(ws, 0.86, 1));

    vg.save();
    vg.globalAlpha = fade;
    vg.translate(VW / 2, 268 + (1 - p) * 34);
    vg.scale(0.92 + 0.08 * p, 0.92 + 0.08 * p);
    vg.textAlign = 'center'; vg.textBaseline = 'middle';
    vg.fillStyle = wi % 2 ? '#ffffff' : A1;
    vg.font = '800 150px Syne, sans-serif';
    vg.fillText(words[wi], 0, 0);
    vg.restore();

    // underline wipe
    vg.fillStyle = A1;
    const uw = 560 * ease(seg(ws, 0.15, 0.85));
    vg.fillRect(VW / 2 - uw / 2, 372, uw, 6);

    vg.fillStyle = 'rgba(245,255,235,0.6)';
    vg.font = '500 20px "JetBrains Mono", monospace';
    vg.textAlign = 'left';
    vg.fillText(`SC ${wi + 1}/4 — AABIR AHAMMED`, 48, VH - 58);
  }

  /* --- scene 2 (4–8s): color bars + grade --- */
  function scene2(s) {
    const bars = [A1, '#22c55e', A2, '#eaffde', '#8fa382', '#22c55e', A1];
    const bw = VW / bars.length;
    bars.forEach((c, i) => { vg.fillStyle = c; vg.fillRect(i * bw, 0, bw + 1, VH); });

    // circular wipe revealing dark center
    vg.fillStyle = '#0a0f08';
    vg.beginPath();
    vg.rect(0, 0, VW, VH);
    vg.arc(VW / 2, VH / 2, Math.max(ease(s) * 460, 0.01), 0, Math.PI * 2, true);
    vg.fill('evenodd');

    // grid
    vg.strokeStyle = 'rgba(255,255,255,0.06)'; vg.lineWidth = 1;
    for (let x = 0; x <= VW; x += 60) { vg.beginPath(); vg.moveTo(x, 0); vg.lineTo(x, VH); vg.stroke(); }
    for (let y = 0; y <= VH; y += 60) { vg.beginPath(); vg.moveTo(0, y); vg.lineTo(VW, y); vg.stroke(); }

    vg.textAlign = 'center';
    vg.fillStyle = '#ffffff';
    vg.font = '800 84px Syne, sans-serif';
    vg.fillText('GRADE + BARS', VW / 2, VH / 2 - 12);
    vg.fillStyle = A1;
    vg.font = '500 24px "JetBrains Mono", monospace';
    vg.fillText('4K · 24FPS · REC709', VW / 2, VH / 2 + 40);

    // sweep line
    const sx = s * VW;
    vg.fillStyle = 'rgba(163,230,53,0.85)';
    vg.fillRect(sx - 2, 0, 4, VH);
  }

  /* --- scene 3 (8–12s): end card --- */
  function scene3(s) {
    const cx = VW / 2, cy = VH / 2 - 40;

    // logo mark pops in
    const lp = ease(seg(s, 0.1, 0.7));
    vg.save();
    vg.translate(cx, cy);
    vg.rotate((1 - lp) * 0.6);
    vg.scale(0.4 + 0.6 * lp, 0.4 + 0.6 * lp);
    const S = 46;
    vg.fillStyle = A1;
    vg.beginPath(); vg.roundRect(-S, -S, S * 2, S * 2, 26); vg.fill();
    vg.fillStyle = '#0a0f08';
    vg.beginPath(); vg.moveTo(-S * 0.32, -S * 0.52); vg.lineTo(S * 0.55, 0); vg.lineTo(-S * 0.32, S * 0.52);
    vg.closePath(); vg.fill();
    vg.restore();

    const names = [
      ['200+ PROJECTS', 1.2],
      ['40M VIEWS DRIVEN', 1.7],
      ['12 AWARDS', 2.2],
    ];
    vg.textAlign = 'center';
    names.forEach(([txt, at], i) => {
      const p = ease(seg(s, at, at + 0.45));
      if (p <= 0) return;
      vg.globalAlpha = p;
      vg.fillStyle = i % 2 ? A1 : '#ffffff';
      vg.font = '600 30px "JetBrains Mono", monospace';
      vg.fillText(txt, cx, cy + 118 + i * 44);
      vg.globalAlpha = 1;
    });

    const cp = ease(seg(s, 3.0, 3.6));
    if (cp > 0) {
      vg.globalAlpha = cp;
      vg.fillStyle = '#ffffff';
      vg.font = '800 64px Syne, sans-serif';
      vg.fillText("LET'S CUT SOMETHING.", cx, VH - 96);
      vg.fillStyle = A1;
      vg.font = '500 22px "JetBrains Mono", monospace';
      vg.fillText('ahammedaabir@gmail.com', cx, VH - 48);
      vg.globalAlpha = 1;
    }
  }

  /* --- universal overlays: burn-ins, scanlines, grain, progress --- */
  function overlays(T) {
    // scanlines
    vg.fillStyle = 'rgba(0,0,0,0.13)';
    for (let y = 0; y < VH; y += 4) vg.fillRect(0, y, VW, 1);

    // seeded grain
    const r = prng(Math.floor(T * 24) * 7919);
    vg.fillStyle = 'rgba(255,255,255,0.05)';
    for (let k = 0; k < 70; k++) vg.fillRect(r() * VW, r() * VH, 2, 2);

    // vignette
    const rad = vg.createRadialGradient(VW / 2, VH / 2, VH * 0.35, VW / 2, VH / 2, VH * 0.85);
    rad.addColorStop(0, 'rgba(0,0,0,0)'); rad.addColorStop(1, 'rgba(0,0,0,0.55)');
    vg.fillStyle = rad; vg.fillRect(0, 0, VW, VH);

    // burn-ins
    vg.font = '500 18px "JetBrains Mono", monospace';
    vg.textAlign = 'left';
    vg.fillStyle = A1;
    vg.fillText('REEL_2026 · LOOP', 40, 44);
    vg.textAlign = 'right';
    vg.fillStyle = '#ffffff';
    vg.fillText('TC ' + fmtTC(T), VW - 40, 44);
    if (Math.floor(T * 2) % 2 === 0) {
      vg.fillStyle = '#ff4d4d';
      vg.beginPath(); vg.arc(VW - 178, 38, 6, 0, Math.PI * 2); vg.fill();
      vg.textAlign = 'left';
      vg.fillText('REC', VW - 164, 44);
    }

    // progress bar + chapter ticks
    vg.fillStyle = 'rgba(255,255,255,0.14)';
    vg.fillRect(40, VH - 26, VW - 80, 4);
    vg.fillStyle = A1;
    vg.fillRect(40, VH - 26, (VW - 80) * (T / DUR), 4);
    [1 / 3, 2 / 3].forEach(c => {
      vg.fillStyle = 'rgba(255,255,255,0.5)';
      vg.fillRect(40 + (VW - 80) * c, VH - 31, 2, 14);
    });
  }

  function drawVideo(t) {
    const T = t % DUR;
    vg.fillStyle = '#0a0f08';
    vg.fillRect(0, 0, VW, VH);
    if (T < 4) scene1(T); else if (T < 8) scene2(T - 4); else scene3(T - 8);
    overlays(T);
    videoTex.needsUpdate = true;
  }
  drawVideo(0);
  document.fonts.ready.then(() => drawVideo(window.EDIT.time));

  /* ============================================================
     Screening room build
  ============================================================ */
  const rig = new THREE.Group();
  scene.add(rig);

  // bend a plane into a curved screen (UVs stay correct, no mirroring)
  function bentPlane(w, h, radius) {
    const geo = new THREE.PlaneGeometry(w, h, 48, 1);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const theta = x / radius;
      pos.setX(i, Math.sin(theta) * radius);
      pos.setZ(i, (Math.cos(theta) - 1) * radius);
    }
    geo.computeVertexNormals();
    return geo;
  }

  const SW = 4.3, SH = 2.42, SR = 3.5;
  const screenMesh = new THREE.Mesh(
    bentPlane(SW, SH, SR),
    new THREE.MeshBasicMaterial({ map: videoTex, side: THREE.DoubleSide })
  );
  rig.add(screenMesh);

  // dark backing + neon edge outline
  const backing = new THREE.Mesh(
    bentPlane(SW * 1.07, SH * 1.13, SR * 0.99),
    new THREE.MeshBasicMaterial({ color: 0x0d130a, side: THREE.DoubleSide })
  );
  backing.position.z = -0.04;
  rig.add(backing);

  const edge = new THREE.LineSegments(
    new THREE.EdgesGeometry(bentPlane(SW, SH, SR), 1),
    new THREE.LineBasicMaterial({ color: 0xa3e635, transparent: true, opacity: 0.5 })
  );
  rig.add(edge);

  /* EQ towers */
  const eqBars = [];
  function eqTower(sideX, color) {
    const tower = new THREE.Group();
    tower.position.set(sideX, -1.5, -0.2);
    const trackGeo = new THREE.BoxGeometry(0.16, 1, 0.16);
    trackGeo.translate(0, 0.5, 0);
    const fillGeo = new THREE.BoxGeometry(0.16, 1, 0.16);
    fillGeo.translate(0, 0.5, 0);
    for (let i = 0; i < 9; i++) {
      const y = i * 0.34;
      const track = new THREE.Mesh(trackGeo, new THREE.MeshBasicMaterial({ color: 0x111a0d }));
      track.position.y = y;
      track.scale.set(1.15, 0.26, 1.15);
      const bar = new THREE.Mesh(fillGeo, new THREE.MeshBasicMaterial({ color }));
      bar.position.set(0, y, 0.02);
      tower.add(track, bar);
      eqBars.push({ bar, i, side: sideX < 0 ? -1 : 1 });
    }
    // speaker base
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.5, 0.7),
      new THREE.MeshStandardMaterial({ color: 0x141a10, metalness: 0.5, roughness: 0.4, emissive: 0x1a260e, emissiveIntensity: 0.6 })
    );
    base.position.y = -0.3;
    tower.add(base);
    rig.add(tower);
  }
  eqTower(-3.15, 0xa3e635);
  eqTower(3.15, 0x2dd4bf);

  /* far guide ring + particles */
  const guide = new THREE.Mesh(
    new THREE.TorusGeometry(4.9, 0.012, 8, 160),
    new THREE.MeshBasicMaterial({ color: 0xa3e635, transparent: true, opacity: 0.22 })
  );
  guide.rotation.x = Math.PI / 2.2;
  guide.position.z = -1;
  scene.add(guide);

  const pCount = 550;
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    const r = 6 + Math.random() * 10;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    pPos[i * 3 + 2] = r * Math.cos(ph);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: 0xcfffbe, size: 0.035, transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false
  }));
  scene.add(particles);

  /* ============================================================
     Caption (DOM)
  ============================================================ */
  const sceneNames = [
    ['IDENTITY', 'Kinetic type · 00:00 – 00:04'],
    ['GRADE + BARS', 'Color & test pattern · 00:04 – 00:08'],
    ['END CARD', 'Contact & credits · 00:08 – 00:12'],
  ];
  const scIdx = document.getElementById('scIdx');
  const scTitle = document.getElementById('scTitle');
  const scMeta = document.getElementById('scMeta');
  const capEl = document.querySelector('.reel-caption');
  let curScene = -1, capT = 0;
  function renderCaption(si) {
    scIdx.textContent = `SCENE ${String(si + 1).padStart(2, '0')} / 03`;
    scTitle.textContent = sceneNames[si][0];
    scMeta.textContent = sceneNames[si][1];
  }
  function setCaption(si) {
    if (si === curScene) return;
    curScene = si;
    clearTimeout(capT);
    capEl.classList.add('swap');
    capT = setTimeout(() => { renderCaption(si); capEl.classList.remove('swap'); }, 220);
  }
  renderCaption(0);

  /* ============================================================
     Interaction
  ============================================================ */
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let userRotY = 0, userRotX = 0, velY = 0, velX = 0;
  let dragging = false, moved = 0, lastX = 0, lastY = 0;
  let hoverScreen = false;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(0, 0);

  stage.addEventListener('pointerdown', e => {
    dragging = true; moved = 0;
    lastX = e.clientX; lastY = e.clientY;
    stage.classList.add('dragging');
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', e => {
    pointer.x = (e.clientX / innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / innerHeight) * 2 + 1;
    if (dragging) {
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      moved += Math.abs(dx) + Math.abs(dy);
      userRotY += dx * 0.004;
      userRotX = THREE.MathUtils.clamp(userRotX + dy * 0.0025, -0.35, 0.35);
      velY = dx * 0.004; velX = dy * 0.0025;
      lastX = e.clientX; lastY = e.clientY;
    }
  });
  addEventListener('pointerup', () => {
    if (dragging && moved < 6 && hoverScreen) window.EDIT.toggle();
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
    if (w > 1500)      { rig.position.x = 1.6;  baseScale = 1.0; }
    else if (w > 1050) { rig.position.x = 1.3;  baseScale = 0.92; }
    else if (w > 760)  { rig.position.x = 0.85; baseScale = 0.78; }
    else               { rig.position.x = 0;    baseScale = 0.5; }
    /* mobile: the cinema screen sits in the clear band, not behind the headline */
    rig.position.y = w > 760 ? 0.05 : -0.35;
  }
  layout();
  addEventListener('resize', layout);

  /* ============================================================
     Animate
  ============================================================ */
  const clock = new THREE.Clock();
  let introT = 0;
  const easeOut = x => 1 - Math.pow(1 - x, 3);

  function tick() {
    requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    /* the screen always shows the exact frame at EDIT.time */
    drawVideo(window.EDIT.time);
    setCaption(Math.min(2, Math.floor((window.EDIT.time % DUR) / 4)));

    /* intro */
    introT = Math.min(introT + dt / 1.3, 1);
    rig.scale.setScalar(Math.max(easeOut(introT) * baseScale, 0.0001));

    /* orbit inertia */
    if (!dragging) {
      userRotY += velY; userRotX = THREE.MathUtils.clamp(userRotX + velX, -0.35, 0.35);
      velY *= 0.94; velX *= 0.9;
    }
    const auto = reduced ? 0.012 : 0.045;
    rig.rotation.y = userRotY + Math.sin(t * 0.25) * 0.05 + (1 - easeOut(introT)) * 0.6;
    rig.rotation.x = userRotX + Math.sin(t * 0.3) * 0.02;
    particles.rotation.y = t * 0.01;
    guide.rotation.z = t * 0.04;

    /* hover */
    if (!dragging) {
      raycaster.setFromCamera(pointer, camera);
      hoverScreen = raycaster.intersectObject(screenMesh, false).length > 0;
      stage.style.cursor = hoverScreen ? 'pointer' : 'grab';
    }

    /* EQ bars — deterministic, scrub-safe */
    for (const { bar, i, side } of eqBars) {
      const lvl = reduced ? 0.3 : 0.12 + 0.88 * Math.pow(Math.abs(Math.sin(t * 2.1 * side + i * 0.9) * Math.sin(t * 0.7 * side + i * 0.35)), 1.4);
      bar.scale.y = lvl * (1 + Math.sin(t * 3 + i) * 0.03);
    }
    glow.material.opacity = window.EDIT.paused ? 0.55 : 0.85 + Math.sin(t * 2) * 0.12;

    /* screen float */
    screenMesh.position.y = Math.sin(t * 0.8) * 0.05;
    backing.position.y = screenMesh.position.y;
    edge.position.y = screenMesh.position.y;

    /* camera parallax */
    const px = pointer.x * 0.5, py = -pointer.y * 0.3;
    camera.position.x += (px - camera.position.x) * 0.04;
    camera.position.y += ((0.2 + py) - camera.position.y) * 0.04;
    camera.lookAt(rig.position.x * 0.5, 0.05, 0);

    renderer.render(scene, camera);
  }
  tick();
})();
