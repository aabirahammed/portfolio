/* ============================================================
   AABIR AHAMMED — SERVICES page scene
   A vertical helix of four service cards winding around a spine.
   Palette: rose / red / pink on wine-black.

   Drag to spin the helix (inertia + snap) · click a card to
   focus it · arrows browse · the timeline auto-advances.
   ============================================================ */
(async function () {
  const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js');

  const A1 = '#fb7185', A2 = '#ff4d6d', BG = 0x0c0709;

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
  scene.add(new THREE.AmbientLight(0x3a2030, 0.8));
  scene.add(new THREE.HemisphereLight(0xffd0da, 0x0c0709, 0.35));
  const key  = new THREE.PointLight(0xfb7185, 120, 40, 2); key.position.set(5, 3.5, 4);
  const fill = new THREE.PointLight(0xf0abfc, 80, 40, 2);  fill.position.set(-5.5, -2.5, 3.5);
  const rim  = new THREE.DirectionalLight(0xffffff, 1.5);  rim.position.set(0, 5, -6);
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
    map: radialTexture([[0, 'rgba(251,113,133,0.34)'], [0.5, 'rgba(240,171,252,0.12)'], [1, 'rgba(0,0,0,0)']]),
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  glow.scale.setScalar(13);
  glow.position.set(1.2, 0, -2.6);
  scene.add(glow);

  /* ============================================================
     Services + card artwork
  ============================================================ */
  /* services — CMS values when present (js/content.js); deliverables
     are comma-separated in the CMS, joined with · on the page */
  if (window.CMS_CONTENT_READY) await window.CMS_CONTENT_READY;
  const C = window.CMS_CONTENT || {};
  const pick = (k, d) => (C[k] ? String(C[k]) : d);
  const dels = (k, d) => pick(k, d).split(',').map(s => s.trim()).filter(Boolean);
  const services = [
    { t: pick('sv.1t', 'MOTION DESIGN'), dels: dels('sv.1d', 'Logo animation, Explainers, Lower thirds, Title sequences'), meta: pick('sv.1m', 'From storyboard to final render') },
    { t: pick('sv.2t', 'VIDEO EDITING'), dels: dels('sv.2d', 'Story assembly, Pacing & rhythm, Multi-cam, Subtitles & captions'), meta: pick('sv.2m', 'Narrative-first cuts') },
    { t: pick('sv.3t', 'COLOR GRADE'),   dels: dels('sv.3d', 'Look development, Shot matching, Skin tones, Delivery masters'),   meta: pick('sv.3m', 'REC709 to HDR') },
    { t: pick('sv.4t', 'SOUND DESIGN'),  dels: dels('sv.4d', 'SFX & foley, Music selection, Mix & loudness, Final mastering'),    meta: pick('sv.4m', 'The half you feel') },
  ];
  const N = services.length, STEP = Math.PI / 2; // helix: cards opposite each other
  const R = 2.15, HELIX_Y = 0.85;

  function makeCard(i) {
    const s = services[i];
    const W = 480, H = 300;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;

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
      const bg = g.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#170d13'); bg.addColorStop(1, '#0c0709');
      rr(3, 3, W - 6, H - 6, 24); g.fillStyle = bg; g.fill();

      g.save(); rr(3, 3, W - 6, H - 6, 24); g.clip();
      // left accent bar
      const ag = g.createLinearGradient(0, 0, 0, H);
      ag.addColorStop(0, A1); ag.addColorStop(1, A2);
      g.fillStyle = ag; g.fillRect(0, 0, 10, H);
      // ghost number
      g.fillStyle = 'rgba(255,255,255,0.07)';
      g.font = '800 150px Syne, sans-serif';
      g.textAlign = 'right';
      g.fillText('0' + (i + 1), W - 20, H - 24);
      g.restore();

      g.textAlign = 'left';
      g.fillStyle = A1;
      g.font = '500 13px "JetBrains Mono", monospace';
      g.fillText(`SVC_0${i + 1} // DELIVERABLES`, 34, 42);

      g.fillStyle = '#ffffff';
      g.font = '700 34px Syne, sans-serif';
      g.fillText(s.t, 34, 92);
      g.strokeStyle = 'rgba(251,113,133,0.4)'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(34, 112); g.lineTo(W - 34, 112); g.stroke();

      s.dels.forEach((d, k) => {
        const y = 146 + k * 30;
        g.fillStyle = A1;
        g.fillRect(34, y - 9, 8, 8);
        g.fillStyle = 'rgba(255,255,255,0.85)';
        g.font = '500 16px Inter, sans-serif';
        g.fillText(d, 52, y);
      });

      g.fillStyle = 'rgba(255,255,255,0.45)';
      g.font = '500 13px "JetBrains Mono", monospace';
      g.fillText(s.meta.toUpperCase(), 34, H - 20);

      g.strokeStyle = 'rgba(251,113,133,0.5)'; g.lineWidth = 3;
      rr(3, 3, W - 6, H - 6, 24); g.stroke();
      tex.needsUpdate = true;
    }
    draw();

    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.5, 1.56),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide })
    );
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: radialTexture([[0, 'rgba(251,113,133,0.5)'], [0.55, 'rgba(251,113,133,0.14)'], [1, 'rgba(0,0,0,0)']]),
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.9
    }));
    halo.scale.set(3.2, 2.1, 1);
    halo.position.z = -0.05;
    halo.visible = false;
    return { mesh, halo, redraw: draw };
  }

  /* ============================================================
     Helix build
  ============================================================ */
  const tilt = new THREE.Group();
  tilt.rotation.x = 0.06;
  scene.add(tilt);
  const helix = new THREE.Group();
  tilt.add(helix);

  const cards = [];
  for (let i = 0; i < N; i++) {
    const { mesh, halo, redraw } = makeCard(i);
    const grp = new THREE.Group();
    const a = i * STEP;
    grp.position.set(Math.sin(a) * R, (i - (N - 1) / 2) * -HELIX_Y, Math.cos(a) * R);
    grp.rotation.y = a;
    grp.add(mesh, halo);
    helix.add(grp);
    cards.push({ grp, mesh, halo, redraw, scale: 1, kick: 0, floatPhase: i * 1.3 });
  }
  document.fonts.ready.then(() => cards.forEach(c => c.redraw()));

  // central spine
  const spine = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, N * HELIX_Y + 0.6, 8),
    new THREE.MeshBasicMaterial({ color: 0xfb7185, transparent: true, opacity: 0.35 })
  );
  tilt.add(spine);
  const pivot = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.26),
    new THREE.MeshStandardMaterial({ color: 0x1a0d12, emissive: 0xff4d6d, emissiveIntensity: 0.8, metalness: 0.5, roughness: 0.3 })
  );
  tilt.add(pivot);

  // guide ring
  const guide = new THREE.Mesh(
    new THREE.TorusGeometry(2.9, 0.012, 8, 160),
    new THREE.MeshBasicMaterial({ color: 0xfb7185, transparent: true, opacity: 0.25 })
  );
  guide.rotation.x = Math.PI / 2;
  tilt.add(guide);

  /* particles */
  const pCount = 500;
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
    color: 0xffd0da, size: 0.035, transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false
  }));
  scene.add(particles);

  /* ============================================================
     Caption (DOM)
  ============================================================ */
  const svIdx = document.getElementById('svIdx');
  const svTitle = document.getElementById('svTitle');
  const svDels = document.getElementById('svDels');
  const svMeta = document.getElementById('svMeta');
  const capEl = document.querySelector('.svc-caption');
  let capT = 0;
  function renderCaptionText(i) {
    svIdx.textContent = `${String(i + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')}`;
    svTitle.textContent = services[i].t;
    svDels.textContent = services[i].dels.join('  ·  ');
    svMeta.textContent = services[i].meta;
  }
  function setCaption(i, instant) {
    if (instant) { renderCaptionText(i); return; }
    clearTimeout(capT);
    capEl.classList.add('swap');
    capT = setTimeout(() => { renderCaptionText(i); capEl.classList.remove('swap'); }, 220);
  }
  function applyIdx(i, instant) {
    idx = ((i % N) + N) % N;
    cards.forEach((c, k) => c.halo.visible = k === idx);
    setCaption(idx, instant);
  }

  /* ============================================================
     Interaction — same snap-spin grammar as the Work gallery
  ============================================================ */
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let helixRot = 0 * STEP + 2.1;  // spin-in entry
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
      helixRot += dx * 0.0042;
      rotVel = dx * 0.0042;
      lastX = e.clientX;
      manualLock = performance.now() + 5000;
    }
  });
  addEventListener('pointerup', () => {
    if (dragging && moved < 6 && hoverIdx >= 0) {
      applyIdx(hoverIdx);
      manualLock = performance.now() + 5000;
      cards[hoverIdx].kick = 0.25;
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
    if (w > 1500)      { tilt.position.x = 1.7;  baseScale = 1.0; }
    else if (w > 1050) { tilt.position.x = 1.35; baseScale = 0.92; }
    else if (w > 760)  { tilt.position.x = 0.9;  baseScale = 0.78; }
    else               { tilt.position.x = 0;    baseScale = 0.5; }
    /* mobile: helix drops into the clear band between CTAs and caption */
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
    if (window.EDIT.scrubbing) playPhase += window.EDIT.time - lastEdit;
    else if (!window.EDIT.paused) playPhase += dt;
    lastEdit = window.EDIT.time;
    const now = performance.now();

    /* intro */
    introT = Math.min(introT + dt / 1.3, 1);
    tilt.scale.setScalar(Math.max(easeOut(introT) * baseScale, 0.0001));

    /* spin: inertia → settle → snap to focused card */
    if (!dragging) {
      helixRot += rotVel; rotVel *= 0.93;
      if (Math.abs(rotVel) < 0.004) {
        if (now > manualLock && !reduced && (!window.EDIT.paused || window.EDIT.scrubbing)) {
          const auto = Math.floor(window.EDIT.time / (window.EDIT.dur / N)) % N;
          if (auto !== idx) applyIdx(auto);
        }
        let diff = (-idx * STEP) - helixRot;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        helixRot += diff * (1 - Math.pow(0.002, dt));
      }
    } else {
      const cur = ((Math.round(-helixRot / STEP) % N) + N) % N;
      if (cur !== idx) applyIdx(cur);
    }
    helix.rotation.y = helixRot;

    /* hover */
    if (!dragging) {
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(cards.map(c => c.mesh), false)[0];
      const h = hit ? cards.findIndex(c => c.mesh === hit.object) : -1;
      if (h !== hoverIdx) {
        hoverIdx = h;
        stage.style.cursor = h >= 0 ? 'pointer' : 'grab';
      }
    }

    /* cards */
    cards.forEach((c, i) => {
      c.kick *= Math.pow(0.02, dt);
      const target = (i === idx ? 1.22 : (i === hoverIdx ? 1.08 : 1)) * (1 + c.kick);
      c.scale += (target - c.scale) * (1 - Math.pow(0.01, dt));
      c.grp.scale.setScalar(c.scale);
      const amp = reduced ? 0.02 : 0.05;
      if (c.baseY === undefined) c.baseY = c.grp.position.y;
      c.grp.position.y = c.baseY + Math.sin(t * 1.1 + c.floatPhase) * amp;
      c.halo.material.opacity = 0.5 + Math.sin(t * 2.2 + i) * 0.15;
    });

    pivot.rotation.y = t * 0.7 + playPhase * 0.25;
    pivot.position.y = Math.sin(t * 1.3) * 0.3;
    guide.rotation.z = t * 0.05;
    particles.rotation.y = t * 0.012;
    glow.material.opacity = window.EDIT.paused ? 0.6 : 0.85 + Math.sin(t * 2) * 0.12;

    /* camera parallax */
    const px = pointer.x * 0.55, py = -pointer.y * 0.35;
    camera.position.x += (px - camera.position.x) * 0.04;
    camera.position.y += ((0.15 + py) - camera.position.y) * 0.04;
    camera.lookAt(tilt.position.x * 0.55, 0, 0);

    renderer.render(scene, camera);
  }
  tick();
})();
