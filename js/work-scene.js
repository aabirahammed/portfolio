/* ============================================================
   AABIR AHAMMED — WORK page scene
   A rotating gallery of 8 project film-frames.
   Palette: amber / ember / coral on warm black.
   Drag to spin · click a frame to focus · arrows browse ·
   while the timeline plays, the reel auto-advances.
   ============================================================ */
(async function () {
  const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js');

  const A1 = '#ffb020', A2 = '#ff6a3d', A3 = '#ff3d5e', BG = 0x0c0a07;

  const stage = document.getElementById('stage');
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.FogExp2(BG, 0.035);

  const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0.15, 8.4);

  /* lights */
  scene.add(new THREE.AmbientLight(0x553311, 0.7));
  scene.add(new THREE.HemisphereLight(0xffd9a0, 0x0c0a07, 0.35));
  const key  = new THREE.PointLight(0xffb020, 130, 40, 2); key.position.set(5, 3.5, 4);
  const fill = new THREE.PointLight(0xff3d5e, 90, 40, 2);  fill.position.set(-5.5, -2.5, 3.5);
  const rim  = new THREE.DirectionalLight(0xfff2e0, 1.5);  rim.position.set(0, 5, -6);
  scene.add(key, fill, rim);

  /* warm glow backdrop */
  function glowTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, 'rgba(255,140,40,0.38)');
    grd.addColorStop(0.45, 'rgba(255,61,94,0.14)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  glow.scale.setScalar(14);
  glow.position.set(1.2, 0, -2.5);
  scene.add(glow);

  /* halo sprite (active-frame glow) */
  function haloTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(255,190,90,0.55)');
    grd.addColorStop(0.55, 'rgba(255,140,60,0.18)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }
  const haloTex = haloTexture();

  /* ============================================================
     Project data + procedural frame artwork
  ============================================================ */
  let projects = [
    { t: 'NEON DISTRICT', c: 'Title Sequence',      y: 2026, m: 'Edit + Motion',      g: [A1, A2] },
    { t: 'ECHO/ES',       c: 'Music Visual',        y: 2025, m: 'Direction + Edit',   g: [A2, A3] },
    { t: 'KYOTO DRIFT',   c: 'Brand Film',          y: 2025, m: 'Edit + Grade',       g: ['#ffcf6b', A1] },
    { t: 'PULSE 99',      c: 'Broadcast Package',   y: 2024, m: 'Design + Animation', g: [A3, '#8a1f3a'] },
    { t: 'SALT & STATIC', c: 'Short Film Edit',     y: 2024, m: 'Editor',             g: [A1, A3] },
    { t: 'ORBITAL',       c: 'Product Launch',      y: 2023, m: 'Motion + Edit',      g: ['#ff8a3d', '#ffcf6b'] },
    { t: 'AFTERGLOW',     c: 'Documentary Titles',  y: 2022, m: 'Titles + Edit',      g: [A2, A1] },
    { t: 'VELOCITY',      c: 'Sports Promo',        y: 2022, m: 'Edit + Sound',       g: [A3, A1] },
  ];
  /* live source: Supabase `projects` table (edit like a spreadsheet).
     On any failure — offline, empty table, CMS down — the built-in
     list above stays, so the page never breaks. */
  try {
    const rows = await window.CMS.projects();
    if (Array.isArray(rows) && rows.length) {
      projects = rows.map(r => ({
        t: r.title,
        c: r.client,
        y: r.year,
        m: r.meta,
        g: Array.isArray(r.colors) && r.colors.length ? r.colors : [A1, A2],
      }));
    }
  } catch (e) { /* fallback stays */ }
  const N = projects.length, STEP = Math.PI * 2 / N, R = 3.15;

  function hexA(h, a) {
    const n = parseInt(h.slice(1), 16);
    return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`;
  }

  function makeCard(i) {
    const p = projects[i];
    const W = 528, H = 320;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 4;
    tex.colorSpace = THREE.SRGBColorSpace;

    function rr(x, y, w, h, rad) {
      g.beginPath();
      g.moveTo(x + rad, y);
      g.arcTo(x + w, y, x + w, y + h, rad);
      g.arcTo(x + w, y + h, x, y + h, rad);
      g.arcTo(x, y + h, x, y, rad);
      g.arcTo(x, y, x + w, y, rad);
      g.closePath();
    }

    function draw() {
      g.clearRect(0, 0, W, H);

      /* dark warm base */
      const bg = g.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#1a1410'); bg.addColorStop(1, '#0d0a07');
      rr(3, 3, W - 6, H - 6, 26); g.fillStyle = bg; g.fill();

      g.save();
      rr(3, 3, W - 6, H - 6, 26); g.clip();

      /* accent wedge bottom-left */
      const ag = g.createLinearGradient(0, H, W * 0.6, 0);
      ag.addColorStop(0, hexA(p.g[0], 0.62));
      ag.addColorStop(1, hexA(p.g[1], 0.10));
      g.fillStyle = ag;
      g.beginPath();
      g.moveTo(0, H); g.lineTo(W * 0.62, H); g.lineTo(W * 0.30, 0); g.lineTo(0, 0);
      g.closePath(); g.fill();

      /* motif — one per card, subtle */
      g.strokeStyle = hexA(p.g[0], 0.5); g.lineWidth = 2;
      const mx = W * 0.66, my = H * 0.34;
      const motif = i % 3;
      if (motif === 0) {                       // concentric circles
        for (let k = 1; k <= 3; k++) { g.beginPath(); g.arc(mx, my, k * 22, 0, Math.PI * 2); g.stroke(); }
      } else if (motif === 1) {                // waveform bars
        g.fillStyle = hexA(p.g[0], 0.4);
        for (let k = 0; k < 9; k++) {
          const bh = 14 + Math.abs(Math.sin(i + k * 1.7)) * 46;
          g.fillRect(mx - 90 + k * 22, my - bh / 2, 6, bh);
        }
      } else {                                 // dot grid
        g.fillStyle = hexA(p.g[0], 0.45);
        for (let a2 = 0; a2 < 3; a2++) for (let b = 0; b < 6; b++)
          g.fillRect(mx - 78 + b * 30, my - 30 + a2 * 30, 4, 4);
      }

      /* ghost index number */
      g.fillStyle = 'rgba(255,255,255,0.08)';
      g.font = '800 168px Syne, sans-serif';
      g.textAlign = 'right';
      g.fillText(String(i + 1).padStart(2, '0'), W - 26, H - 26);

      /* film sprocket strips */
      g.fillStyle = 'rgba(255,255,255,0.2)';
      for (let k = 0; k < 5; k++) {
        g.beginPath(); g.roundRect(16, 30 + k * 56, 12, 16, 3); g.fill();
        g.beginPath(); g.roundRect(W - 28, 30 + k * 56, 12, 16, 3); g.fill();
      }

      /* top tag */
      g.fillStyle = hexA(p.g[0], 0.95);
      g.font = '600 15px "JetBrains Mono", monospace';
      g.textAlign = 'left';
      g.fillText(`PRJ_${String(i + 1).padStart(2, '0')} // 16:9 · 24FPS`, 46, 42);

      /* title + meta */
      g.fillStyle = '#f5efe6';
      g.font = '700 36px Syne, sans-serif';
      g.fillText(p.t, 46, H - 56);
      g.fillStyle = 'rgba(245,239,230,0.55)';
      g.font = '500 17px Inter, sans-serif';
      g.fillText(`${p.c} · ${p.y} · ${p.m}`, 46, H - 26);

      g.restore();

      /* border */
      g.strokeStyle = hexA(p.g[0], 0.55); g.lineWidth = 3;
      rr(3, 3, W - 6, H - 6, 26); g.stroke();

      tex.needsUpdate = true;
    }
    draw();

    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.35, 1.42),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide })
    );

    const halo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: haloTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.9
    }));
    halo.scale.set(3.1, 2.05, 1);
    halo.position.set(0, 0, -0.05);
    halo.visible = false;

    return { mesh, halo, redraw: draw };
  }

  /* ============================================================
     Build the carousel ring
  ============================================================ */
  const tilt = new THREE.Group();
  tilt.rotation.x = -0.09;
  scene.add(tilt);
  const ring = new THREE.Group();
  tilt.add(ring);

  const panels = [];
  for (let i = 0; i < N; i++) {
    const { mesh, halo, redraw } = makeCard(i);
    const grp = new THREE.Group();
    const a = i * STEP;
    grp.position.set(Math.sin(a) * R, 0, Math.cos(a) * R);
    grp.rotation.y = a;
    grp.add(mesh, halo);
    ring.add(grp);
    panels.push({ grp, mesh, halo, redraw, scale: 1, kick: 0, floatPhase: i * 0.8 });
  }
  document.fonts.ready.then(() => panels.forEach(p => p.redraw()));

  /* core "in focus" pivot */
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.48, 1),
    new THREE.MeshStandardMaterial({ color: 0x1a120a, metalness: 0.6, roughness: 0.35, emissive: 0xff6a3d, emissiveIntensity: 0.55 })
  );
  tilt.add(core);
  const coreWire = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.68, 1)),
    new THREE.LineBasicMaterial({ color: 0xffb020, transparent: true, opacity: 0.5 })
  );
  tilt.add(coreWire);

  /* orbit guide rings */
  function guideRing(radius, color, rx, rz) {
    const r = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.012, 8, 160),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3 })
    );
    r.rotation.set(rx, 0, rz);
    scene.add(r);
    return r;
  }
  const ringA = guideRing(4.0, 0xffb020, Math.PI / 2.1, 0.12);
  const ringB = guideRing(4.4, 0xff3d5e, Math.PI / 1.9, -0.35);

  /* warm particle field */
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
    color: 0xffd9a0, size: 0.035, transparent: true, opacity: 0.55,
    blending: THREE.AdditiveBlending, depthWrite: false
  }));
  scene.add(particles);

  /* ============================================================
     Caption (DOM)
  ============================================================ */
  const projIdx = document.getElementById('projIdx');
  const projTitle = document.getElementById('projTitle');
  const projMeta = document.getElementById('projMeta');
  const capEl = document.querySelector('.work-caption');
  let capT = 0;
  function renderCaptionText(i) {
    projIdx.textContent = `${String(i + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')}`;
    projTitle.textContent = projects[i].t;
    projMeta.textContent = `${projects[i].c} · ${projects[i].y} · ${projects[i].m}`;
  }
  function setCaption(i, instant) {
    if (instant) { renderCaptionText(i); return; }
    clearTimeout(capT);
    capEl.classList.add('swap');
    capT = setTimeout(() => { renderCaptionText(i); capEl.classList.remove('swap'); }, 220);
  }
  function applyIdx(i, instant) {
    idx = ((i % N) + N) % N;
    panels.forEach((p, k) => p.halo.visible = k === idx);
    setCaption(idx, instant);
  }

  /* ============================================================
     Interaction — drag spin, inertia, snap, click focus, arrows
  ============================================================ */
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let ringRot = -0 * STEP + 2.4;   // spin-in entry
  let rotVel = 0;
  let idx = 0;
  let manualLock = 0;
  let dragging = false, moved = 0, lastX = 0;
  let hoverIdx = -1;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(0, 0);

  applyIdx(0, true);

  stage.addEventListener('pointerdown', e => {
    dragging = true; moved = 0; rotVel = 0;
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
      ringRot += dx * 0.0042;
      rotVel = dx * 0.0042;
      lastX = e.clientX;
      manualLock = performance.now() + 5000;
    }
  });
  addEventListener('pointerup', () => {
    if (dragging && moved < 6 && hoverIdx >= 0) {   // click on a frame → focus it
      applyIdx(hoverIdx);
      manualLock = performance.now() + 5000;
      panels[hoverIdx].kick = 0.25;
    }
    dragging = false;
    stage.classList.remove('dragging');
  });
  stage.addEventListener('pointerleave', () => { pointer.set(0, 0); });

  addEventListener('keydown', e => {
    if (e.code === 'ArrowRight') { applyIdx(idx + 1); manualLock = performance.now() + 5000; }
    if (e.code === 'ArrowLeft')  { applyIdx(idx - 1); manualLock = performance.now() + 5000; }
  });

  /* ============================================================
     Responsive layout
  ============================================================ */
  let baseScale = 1;
  function layout() {
    const w = innerWidth;
    renderer.setSize(w, innerHeight);
    camera.aspect = w / innerHeight;
    camera.updateProjectionMatrix();
    if (w > 1500)      { tilt.position.x = 1.7;  baseScale = 1.02; }
    else if (w > 1050) { tilt.position.x = 1.35; baseScale = 0.94; }
    else if (w > 760)  { tilt.position.x = 0.9;  baseScale = 0.8; }
    else               { tilt.position.x = 0;    baseScale = 0.55; }
    /* mobile: drop the carousel into the clear band between CTAs and caption */
    tilt.position.y = w > 760 ? 0 : -0.35;
  }
  layout();
  addEventListener('resize', layout);

  /* ============================================================
     Animate
  ============================================================ */
  const clock = new THREE.Clock();
  let introT = 0;
  const easeOut = x => 1 - Math.pow(1 - x, 3);

  /* seamless loop — scene-local play phase integrates real time so rotation
     never snaps when EDIT.time wraps; follows the scrub head while scrubbing */
  let playPhase = 0, lastEdit = window.EDIT.time;

  function tick() {
    requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    const now = performance.now();

    if (window.EDIT.scrubbing) playPhase += window.EDIT.time - lastEdit;
    else if (!window.EDIT.paused) playPhase += dt;
    lastEdit = window.EDIT.time;

    /* intro */
    introT = Math.min(introT + dt / 1.3, 1);
    tilt.scale.setScalar(Math.max(easeOut(introT) * baseScale, 0.0001));

    /* rotation: inertia → settle → snap to focused frame */
    if (!dragging) {
      ringRot += rotVel; rotVel *= 0.93;
      if (Math.abs(rotVel) < 0.004) {
        /* timeline-driven auto advance (the reel rolls) */
        if (now > manualLock && reduced === false && (!window.EDIT.paused || window.EDIT.scrubbing)) {
          const auto = Math.floor(window.EDIT.time / (window.EDIT.dur / N)) % N;
          if (auto !== idx) applyIdx(auto);
        }
        /* smooth snap to the focused frame */
        let diff = (-idx * STEP) - ringRot;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        ringRot += diff * (1 - Math.pow(0.002, dt));
      }
    } else {
      const cur = ((Math.round(-ringRot / STEP) % N) + N) % N;
      if (cur !== idx) applyIdx(cur);
    }
    ring.rotation.y = ringRot;

    /* hover raycast */
    if (!dragging) {
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(panels.map(p => p.mesh), false)[0];
      const hIdx = hit ? panels.findIndex(p => p.mesh === hit.object) : -1;
      if (hIdx !== hoverIdx) {
        hoverIdx = hIdx;
        stage.style.cursor = hIdx >= 0 ? 'pointer' : 'grab';
      }
    }

    /* panels: scale, float, kick */
    panels.forEach((p, i) => {
      p.kick *= Math.pow(0.02, dt);
      const target = (i === idx ? 1.16 : (i === hoverIdx ? 1.07 : 1)) * (1 + p.kick);
      p.scale += (target - p.scale) * (1 - Math.pow(0.01, dt));
      p.grp.scale.setScalar(p.scale);
      const amp = reduced ? 0.02 : 0.06;
      p.grp.position.y = Math.sin(t * 1.1 + p.floatPhase) * amp;
      p.halo.material.opacity = 0.55 + Math.sin(t * 2.2 + i) * 0.15;
    });

    /* core + guides */
    core.rotation.y = t * 0.5 + playPhase * 0.3;
    core.rotation.x = Math.sin(t * 0.4) * 0.2;
    coreWire.rotation.y = -t * 0.3;
    coreWire.rotation.x = -Math.sin(t * 0.4) * 0.2;
    ringA.rotation.z = t * 0.05;
    ringB.rotation.z = -t * 0.04;
    particles.rotation.y = t * 0.012;

    /* camera parallax */
    const px = pointer.x * 0.55, py = -pointer.y * 0.35;
    camera.position.x += (px - camera.position.x) * 0.04;
    camera.position.y += ((0.15 + py) - camera.position.y) * 0.04;
    camera.lookAt(tilt.position.x * 0.55, 0, 0);

    renderer.render(scene, camera);
  }
  tick();
})();
