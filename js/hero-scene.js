/* ============================================================
   AABIR AHAMMED — HOME / HERO scene (upgraded)
   Interactive chrome torus-knot cluster with environment
   reflections, an orbiting mini-reel ring, click shockwaves and
   a cursor-following accent light.
   Palette: magenta / violet / cyan.
   Drag to orbit (with inertia) · click to pulse · space play/pause ·
   scrubbing the shared timeline re-angles the knot.
   ============================================================ */
(async function () {
  const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js');

  const stage = document.getElementById('stage');
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07070c);
  scene.fog = new THREE.FogExp2(0x07070c, 0.045);

  const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0.25, 8.2);

  /* environment reflections — gives the chrome knot its shine */
  function envCanvas() {
    const c = document.createElement('canvas'); c.width = 512; c.height = 256;
    const g = c.getContext('2d');
    const grd = g.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0, '#2a0f26'); grd.addColorStop(0.42, '#0b0b14');
    grd.addColorStop(0.75, '#0a1420'); grd.addColorStop(1, '#07222a');
    g.fillStyle = grd; g.fillRect(0, 0, 512, 256);
    g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillRect(0, 118, 512, 6);
    g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(0, 112, 512, 18);
    const blob = (x, y, r, col) => {
      const rg = g.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = rg; g.fillRect(x - r, y - r, r * 2, r * 2);
    };
    blob(120, 80, 110, 'rgba(255,61,129,0.55)');
    blob(400, 180, 130, 'rgba(34,211,238,0.45)');
    blob(290, 40, 90, 'rgba(139,92,246,0.5)');
    return c;
  }
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envSrc = new THREE.CanvasTexture(envCanvas());
  envSrc.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = pmrem.fromEquirectangular(envSrc).texture;
  envSrc.dispose(); pmrem.dispose();

  /* lights */
  scene.add(new THREE.AmbientLight(0x334466, 0.4));
  scene.add(new THREE.HemisphereLight(0x8888ff, 0x0a0a12, 0.25));
  const key  = new THREE.PointLight(0xff3d81, 100, 40, 2); key.position.set(5, 3.5, 4);
  const fill = new THREE.PointLight(0x22d3ee, 75, 40, 2);  fill.position.set(-5.5, -2.5, 3.5);
  const rim  = new THREE.DirectionalLight(0xffffff, 1.2);  rim.position.set(0, 5, -6);
  scene.add(key, fill, rim);

  /* cursor-following accent light */
  const cursorLight = new THREE.PointLight(0xff9ad2, 24, 10, 2);
  cursorLight.position.set(0, 0, 3);
  scene.add(cursorLight);

  /* glow backdrop sprite */
  function glowTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, 'rgba(139,92,246,0.42)');
    grd.addColorStop(0.45, 'rgba(255,61,129,0.16)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  glow.scale.setScalar(13);
  glow.position.set(1.2, 0, -2);
  scene.add(glow);

  /* ============================================================
     Hero rig — the interactive object cluster
  ============================================================ */
  const rig = new THREE.Group();
  scene.add(rig);
  const interactive = [];

  const knotGeo = new THREE.TorusKnotGeometry(1.02, 0.3, 240, 36);
  const knotMat = new THREE.MeshStandardMaterial({
    color: 0x14141f, metalness: 0.85, roughness: 0.2,
    emissive: 0x2a0a1e, emissiveIntensity: 0.35
  });
  const knot = new THREE.Mesh(knotGeo, knotMat);
  rig.add(knot);
  interactive.push(knot);

  const knotWire = new THREE.Mesh(knotGeo, new THREE.MeshBasicMaterial({
    color: 0xff3d81, wireframe: true, transparent: true, opacity: 0.1
  }));
  knotWire.scale.setScalar(1.045);
  rig.add(knotWire);

  const cage = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.45, 1),
    new THREE.MeshBasicMaterial({ color: 0x22d3ee, wireframe: true, transparent: true, opacity: 0.07 })
  );
  rig.add(cage);

  function guideRing(radius, color, rx, ry, rz) {
    const r = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.012, 8, 160),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35 })
    );
    r.rotation.set(rx, ry, rz);
    rig.add(r);
    return r;
  }
  const ring1 = guideRing(2.85, 0x22d3ee, Math.PI / 2.15, 0.35, 0);
  const ring2 = guideRing(3.25, 0xff3d81, Math.PI / 1.75, -0.5, 0.4);

  const keyRing = new THREE.Group();
  keyRing.rotation.set(0.35, 0, 0.55);
  rig.add(keyRing);
  const octaGeo = new THREE.OctahedronGeometry(0.16);
  for (let i = 0; i < 7; i++) {
    const d = new THREE.Mesh(octaGeo, new THREE.MeshStandardMaterial({
      color: 0x20101a, emissive: 0xff3d81, emissiveIntensity: 1.1,
      metalness: 0.4, roughness: 0.35
    }));
    const a = (i / 7) * Math.PI * 2;
    d.position.set(Math.cos(a) * 2.0, Math.sin(a) * 2.0, (i % 2 ? .25 : -.25));
    d.userData = { floatAmp: 0.1, floatSpeed: 1.6, phase: a, kick: 0, base: d.position.clone() };
    keyRing.add(d);
    interactive.push(d);
  }

  const shape = new THREE.Shape();
  shape.moveTo(-0.34, 0.48); shape.lineTo(-0.34, -0.48); shape.lineTo(0.52, 0); shape.lineTo(-0.34, 0.48);
  const playBtn = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3 }),
    new THREE.MeshStandardMaterial({ color: 0x0a2a30, emissive: 0x22d3ee, emissiveIntensity: 0.75, metalness: 0.3, roughness: 0.3 })
  );
  playBtn.position.set(-2.75, -0.7, 0.9);
  playBtn.rotation.y = 0.5;
  playBtn.userData = { floatAmp: 0.28, floatSpeed: 1.1, phase: 2.2, kick: 0, base: playBtn.position.clone() };
  rig.add(playBtn);
  interactive.push(playBtn);

  /* ============================================================
     Themed satellites — real film & motion-design symbols
     (camera, clapperboard, film strip, EQ bars, scissors, color wheel)
     ============================================================ */
  function darkMat(extra = {}) {
    return new THREE.MeshStandardMaterial({
      color: 0x14141f, metalness: 0.8, roughness: 0.3,
      emissive: 0x12001a, emissiveIntensity: 0.55, ...extra
    });
  }
  const clapperTops = [];
  const waveBars = [];

  function makeCamera() {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.46, 0.3), darkMat()));
    const lensBody = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.26, 24), darkMat({ emissive: 0x0a2a30 }));
    lensBody.rotation.x = Math.PI / 2; lensBody.position.z = 0.26;
    const lensGlass = new THREE.Mesh(
      new THREE.CircleGeometry(0.14, 24),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee })
    );
    lensGlass.position.z = 0.4;
    g.add(lensBody, lensGlass);
    const reelGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.05, 20);
    const reelMat = darkMat({ emissive: 0xff3d81, emissiveIntensity: 0.9 });
    const reelA = new THREE.Mesh(reelGeo, reelMat);
    reelA.rotation.x = Math.PI / 2; reelA.position.set(-0.18, 0.29, 0);
    const reelB = new THREE.Mesh(reelGeo, reelMat);
    reelB.rotation.x = Math.PI / 2; reelB.position.set(0.18, 0.29, 0);
    const rec = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff3d5e })
    );
    rec.position.set(0.27, 0.15, 0.16);
    g.add(reelA, reelB, rec);
    return g;
  }

  function stripeTexture() {
    const c = document.createElement('canvas'); c.width = 128; c.height = 32;
    const g = c.getContext('2d');
    g.fillStyle = '#e8e8f0'; g.fillRect(0, 0, 128, 32);
    g.fillStyle = '#0b0b12';
    for (let x = -32; x < 160; x += 32) {
      g.beginPath();
      g.moveTo(x, 32); g.lineTo(x + 16, 0); g.lineTo(x + 32, 0); g.lineTo(x + 16, 32);
      g.closePath(); g.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  function makeClapper() {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.07), darkMat()));
    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(0.52, 0.32),
      new THREE.MeshBasicMaterial({ color: 0x1c1c28 })
    );
    face.position.z = 0.04;
    g.add(face);
    const stripeMat = new THREE.MeshStandardMaterial({ map: stripeTexture(), metalness: 0.4, roughness: 0.5 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.1, 0.07), stripeMat);
    base.position.set(0, 0.16, 0);
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.11, 0.07), stripeMat);
    top.position.set(-0.03, 0.26, 0);
    const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.09, 12), darkMat({ emissive: 0x22d3ee, emissiveIntensity: 0.6 }));
    hinge.rotation.z = Math.PI / 2; hinge.position.set(-0.3, 0.21, 0);
    g.add(base, top, hinge);
    clapperTops.push(top);
    return g;
  }

  function filmTexture() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 112;
    const g = c.getContext('2d');
    g.fillStyle = '#101018'; g.fillRect(0, 0, 256, 112);
    g.fillStyle = 'rgba(255,255,255,0.85)';
    for (let x = 8; x < 256; x += 24) {
      g.fillRect(x, 4, 10, 8);
      g.fillRect(x, 100, 10, 8);
    }
    const hues = ['rgba(255,61,129,0.8)', 'rgba(139,92,246,0.8)', 'rgba(34,211,238,0.8)', 'rgba(255,106,61,0.8)'];
    for (let i = 0; i < 4; i++) {
      g.fillStyle = hues[i];
      g.fillRect(10 + i * 61, 22, 51, 68);
      g.fillStyle = 'rgba(0,0,0,0.35)';
      g.fillRect(10 + i * 61, 22, 51, 22);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  function makeFilmStrip() {
    const geo = new THREE.PlaneGeometry(0.85, 0.37, 24, 1);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pos.setZ(i, Math.sin((pos.getX(i) / 0.85 + 0.5) * Math.PI) * 0.12);
    }
    geo.computeVertexNormals();
    return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
      map: filmTexture(), side: THREE.DoubleSide,
      metalness: 0.4, roughness: 0.6, emissive: 0x221133, emissiveIntensity: 0.4
    }));
  }

  function makeWaveform() {
    const g = new THREE.Group();
    const heights = [0.18, 0.34, 0.5, 0.28, 0.44, 0.22, 0.36];
    const cols = [0x22d3ee, 0xff3d81, 0x8b5cf6, 0x22d3ee, 0xff3d81, 0x8b5cf6, 0x22d3ee];
    heights.forEach((h, i) => {
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(0.055, h, 0.055),
        new THREE.MeshStandardMaterial({
          color: 0x0e0e16, emissive: cols[i], emissiveIntensity: 0.9, metalness: 0.3, roughness: 0.4
        })
      );
      bar.position.x = (i - 3) * 0.09;
      bar.userData.eq = i;
      g.add(bar);
      waveBars.push(bar);
    });
    return g;
  }

  function makeScissors() {
    const g = new THREE.Group();
    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0xbfc6d6, metalness: 0.95, roughness: 0.15, emissive: 0x111122, emissiveIntensity: 0.4
    });
    const handleMat = darkMat({ emissive: 0xff3d81, emissiveIntensity: 0.8 });
    for (const side of [-1, 1]) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.5, 0.02), bladeMat);
      blade.position.set(side * 0.06, 0.28, 0);
      blade.rotation.z = side * 0.14;
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.3, 0.02), bladeMat);
      arm.position.set(side * 0.09, -0.06, 0);
      arm.rotation.z = side * 0.28;
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.028, 10, 24), handleMat);
      handle.position.set(side * 0.13, -0.22, 0);
      handle.rotation.z = side * 0.5;
      g.add(blade, arm, handle);
    }
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 10), darkMat({ emissive: 0x22d3ee, emissiveIntensity: 0.8 })));
    return g;
  }

  function wheelTexture() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256;
    const g = c.getContext('2d');
    const grd = g.createConicGradient(0, 128, 128);
    const stops = ['#ff3d81', '#ff6a3d', '#ffd23d', '#4ade80', '#22d3ee', '#5b8cff', '#8b5cf6', '#f0abfc', '#ff3d81'];
    stops.forEach((col, i) => grd.addColorStop(i / (stops.length - 1), col));
    g.fillStyle = grd;
    g.beginPath(); g.arc(128, 128, 126, 0, Math.PI * 2); g.fill();
    g.globalCompositeOperation = 'destination-out';
    g.beginPath(); g.arc(128, 128, 60, 0, Math.PI * 2); g.fill();
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = '#0b0b12';
    g.beginPath(); g.arc(128, 128, 60, 0, Math.PI * 2); g.fill();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  function makeColorWheel() {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(
      new THREE.CircleGeometry(0.42, 48),
      new THREE.MeshBasicMaterial({ map: wheelTexture(), transparent: true })
    ));
    return g;
  }

  function addProp(obj, pos, scale, phase, floatAmp = 0.3, floatSpeed = 1.25) {
    obj.position.set(...pos);
    obj.scale.setScalar(scale);
    obj.userData = { floatAmp, floatSpeed, phase, kick: 0, base: obj.position.clone() };
    rig.add(obj);
    interactive.push(obj);
  }

  addProp(makeCamera(),     [ 2.7,  1.5, -0.2], 1.0, 0.0);
  addProp(makeClapper(),    [-2.2,  1.9,  0.8], 0.9, 1.7);
  addProp(makeFilmStrip(),  [ 2.0, -2.0,  1.0], 1.0, 3.4);
  addProp(makeWaveform(),   [-1.6, -2.2, -0.6], 0.95, 4.9);
  addProp(makeScissors(),   [ 2.9, -0.7,  1.3], 1.0, 5.6);
  addProp(makeColorWheel(), [-3.0,  0.9, -0.6], 1.0, 6.3);

  /* ============================================================
     Orbiting mini-reel frames — ties the hub to the work
  ============================================================ */
  function miniTexture(i) {
    const c = document.createElement('canvas'); c.width = 256; c.height = 160;
    const g = c.getContext('2d');
    const pal = [['255,61,129','139,92,246'], ['139,92,246','34,211,238'], ['34,211,238','255,61,129']][i % 3];
    g.fillStyle = '#0e0e16'; g.fillRect(0, 0, 256, 160);
    const wg = g.createLinearGradient(0, 160, 180, 0);
    wg.addColorStop(0, `rgba(${pal[0]},0.6)`); wg.addColorStop(1, `rgba(${pal[1]},0.12)`);
    g.fillStyle = wg;
    g.beginPath(); g.moveTo(0, 160); g.lineTo(158, 160); g.lineTo(58, 0); g.lineTo(0, 0);
    g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.9)';
    g.font = '600 24px "JetBrains Mono", monospace';
    g.fillText('0' + (i + 1), 18, 42);
    g.fillStyle = `rgba(${pal[0]},0.85)`;
    g.font = '500 12px "JetBrains Mono", monospace';
    g.fillText('REEL_0' + (i + 1) + '.MP4', 18, 62);
    g.strokeStyle = `rgba(${pal[0]},0.55)`; g.lineWidth = 3;
    g.beginPath(); g.roundRect(2, 2, 252, 156, 14); g.stroke();
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }
  const frameRing = new THREE.Group();
  frameRing.rotation.set(1.25, 0, -0.3);
  rig.add(frameRing);
  for (let i = 0; i < 6; i++) {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(0.72, 0.45),
      new THREE.MeshBasicMaterial({ map: miniTexture(i), transparent: true, side: THREE.DoubleSide })
    );
    const a = (i / 6) * Math.PI * 2;
    m.position.set(Math.sin(a) * 2.3, 0, Math.cos(a) * 2.3);
    m.rotation.y = a;
    frameRing.add(m);
  }

  /* click shockwave rings */
  const shocks = [];
  const shockGeo = new THREE.TorusGeometry(1, 0.02, 8, 64);
  for (let i = 0; i < 3; i++) {
    const m = new THREE.Mesh(shockGeo, new THREE.MeshBasicMaterial({
      color: 0xff3d81, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    m.visible = false; m.rotation.x = 1.2;
    scene.add(m);
    shocks.push({ m, life: 1 });
  }
  let shockI = 0;

  /* particle field */
  const pCount = 700;
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    const r = 6 + Math.random() * 10;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pPos[i * 3]     = r * Math.sin(ph) * Math.cos(th);
    pPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    pPos[i * 3 + 2] = r * Math.cos(ph);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: 0x99aaff, size: 0.035, transparent: true, opacity: 0.65,
    blending: THREE.AdditiveBlending, depthWrite: false
  }));
  scene.add(particles);

  /* ============================================================
     Interaction — drag orbit + inertia + hover + click burst
  ============================================================ */
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let userRotY = 0, userRotX = 0;
  let velY = 0, velX = 0;
  let dragging = false, moved = 0, lastX = 0, lastY = 0;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(0, 0);
  let hovered = null;

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
      userRotY += dx * 0.0052;
      userRotX = THREE.MathUtils.clamp(userRotX + dy * 0.0035, -0.6, 0.6);
      velY = dx * 0.0052; velX = dy * 0.0035;
      lastX = e.clientX; lastY = e.clientY;
    }
  });
  addEventListener('pointerup', () => {
    if (dragging && moved < 6) burst();
    dragging = false;
    stage.classList.remove('dragging');
  });
  stage.addEventListener('pointerleave', () => { pointer.set(0, 0); });

  let glowBoost = 0;
  function burst() {
    /* faster clicking = bigger kick, bigger flash, hotter ring colour */
    const h = rpmHeat;
    for (const o of interactive) o.userData.kick = 0.35 + h * 0.5;
    glowBoost = 1 + h * 1.6;
    const s = shocks[shockI++ % 3];
    /* shockwave rides the same heat ramp: magenta → violet → cyan → white */
    const c = heatColor(h);
    s.m.material.color.setRGB(c[0] / 255, c[1] / 255, c[2] / 255);
    s.life = 0; s.m.visible = true;
    s.m.position.set(rig.position.x, rig.position.y, 0.4);
  }

  /* ============================================================
     DOM garnish — stat count-up + rotating role
  ============================================================ */
  if (window.CMS_CONTENT_READY) await window.CMS_CONTENT_READY;
  const C = window.CMS_CONTENT || {};
  function stat(s, dv, ds) {
    const m = String(s ?? '').trim().match(/^([\d.,]+)\s*(.*)$/);
    return m ? [parseFloat(m[1].replace(/,/g, '')) || dv, m[2] || ds] : [dv, ds];
  }
  const counters = [
    ['n1', ...stat(C['home.s1n'], 200, '+')],
    ['n2', ...stat(C['home.s2n'], 40, 'M')],
    ['n3', ...stat(C['home.s3n'], 12, '')],
  ];
  setTimeout(() => {
    const t0 = performance.now();
    (function step() {
      const p = Math.min((performance.now() - t0) / 1400, 1);
      const e = 1 - Math.pow(1 - p, 3);
      for (const [id, v, suf] of counters) {
        const el = document.getElementById(id);
        if (el) el.textContent = Math.round(v * e) + suf;
      }
      if (p < 1) requestAnimationFrame(step);
    })();
  }, 900);

  const roles = String(C['home.roles'] || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!roles.length) roles.push('motion designer', 'video editor', 'kinetic storyteller', 'colorist');
  const spin0 = document.getElementById('roleSpin');
  if (spin0) spin0.textContent = roles[0];
  let ri = 0;
  setInterval(() => {
    const el = document.getElementById('roleSpin');
    if (!el) return;
    el.classList.add('out');
    setTimeout(() => { ri = (ri + 1) % roles.length; el.textContent = roles[ri]; el.classList.remove('out'); }, 300);
  }, 3000);

  /* ============================================================
     Responsive layout of the 3D cluster
  ============================================================ */
  let baseScale = 1;
  function layout() {
    const w = innerWidth;
    renderer.setSize(w, innerHeight);
    camera.aspect = w / innerHeight;
    camera.updateProjectionMatrix();
    if (w > 1500)      { rig.position.x = 1.7;  baseScale = 1.05; }
    else if (w > 1050) { rig.position.x = 1.35; baseScale = 0.95; }
    else if (w > 760)  { rig.position.x = 0.9;  baseScale = 0.8; }
    else               { rig.position.x = 0;    baseScale = 0.5; }
    /* mobile: sit the cluster lower-center, in the clear band between CTAs
       and the stats strip, so the type stops suffocating the artwork */
    rig.position.y = w > 760 ? 0 : -0.4;
  }
  layout();
  addEventListener('resize', layout);

  /* ============================================================
     Animate
  ============================================================ */
  const clock = new THREE.Clock();
  let introT = 0;
  const easeOut = x => 1 - Math.pow(1 - x, 3);

  /* seamless loop — a scene-local play phase that integrates real time, so
     rotations driven by the playhead never snap when EDIT.time wraps 12 → 0.
     While scrubbing it follows the scrub head exactly (that cut is intended);
     otherwise it free-runs straight across the wrap. */
  let playPhase = 0, lastEdit = window.EDIT.time;

  /* click RPM — rolling 8-second window of click/tap timestamps.
     Drives both the on-screen counter and the burst "heat" (0 → 1).
     Runs on a 100ms interval so the counter stays live even if the
     render loop stalls (rAF freezes when the tab is backgrounded). */
  const rpmStamps = [];
  let rpmShown = 0, rpmHeat = 0;
  const rpmVals  = Array.from(document.querySelectorAll('.rpm-val'));
  const rpmLamps = Array.from(document.querySelectorAll('.rpm-lamp'));
  const rpmPills = Array.from(document.querySelectorAll('.rpm-pill'));
  function stampRpm() {
    rpmStamps.push(performance.now());
    if (rpmStamps.length > 240) rpmStamps.shift();
  }
  addEventListener('pointerup', stampRpm, true);
  addEventListener('keydown', e => { if (e.key === ' ' && !e.repeat) stampRpm(); });

  /* heat colour ramp — the "more colour" journey:
     0 magenta → ⅓ violet → ⅔ cyan → 1 white */
  const HEAT_STOPS = [
    [255, 61, 94],    // magenta
    [139, 92, 246],   // violet
    [34, 211, 238],   // cyan
    [255, 255, 255],  // white
  ];
  function heatColor(h) {
    const x = Math.max(0, Math.min(0.999, h)) * (HEAT_STOPS.length - 1);
    const seg = Math.floor(x), f = x - seg;
    const a = HEAT_STOPS[seg], b = HEAT_STOPS[seg + 1];
    return a.map((v, i) => Math.round(v + (b[i] - v) * f));
  }

  function rpmStep() {
    const cut = performance.now() - 8000;
    while (rpmStamps.length && rpmStamps[0] < cut) rpmStamps.shift();
    const target = rpmStamps.length * 7.5;
    /* envelope follower: attack fast (feels instant), decay slow (glows down) */
    rpmShown += (target - rpmShown) * (target > rpmShown ? 0.38 : 0.03);
    /* exponential ramp — a quick mash gets you most of the way, sustained
       machine-gun clicking pins it at 1. ~90rpm ≈ halfway. */
    rpmHeat = 1 - Math.exp(-rpmShown / 120);
    if (window.SFX) SFX.setHeat(rpmHeat);
    const n = Math.round(rpmShown);
    if (n === rpmStep.last) return;
    rpmStep.last = n;
    /* lamp rides the colour ramp and brightens as the rate climbs */
    const c = heatColor(rpmHeat);
    const rgb = `${c[0]},${c[1]},${c[2]}`;
    for (const v of rpmVals) v.textContent = n;
    for (const l of rpmLamps) {
      l.style.background = `rgb(${rgb})`;
      l.style.boxShadow = `0 0 ${Math.round(6 + rpmHeat * 18)}px rgba(${rgb},.95)`;
    }
    for (const p of rpmPills) {
      p.style.borderColor = rpmHeat > 0.4 ? 'rgba(255,255,255,.5)' : '';
    }
  }
  setInterval(rpmStep, 100);
  /* QA probe (harmless in production): window.__rpm.state() */
  window.__rpm = {
    push: stampRpm,
    step: rpmStep,
    state: () => ({
      stamps: rpmStamps.length,
      shown: Math.round(rpmShown),
      heat: +rpmHeat.toFixed(3),
      display: rpmVals.length ? rpmVals[0].textContent : null,
      lamp: rpmLamps.length ? rpmLamps[0].style.background : null
    })
  };

  function tick() {
    requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    /* play phase: follow scrub head exactly, free-run across the 12→0 wrap */
    const et = window.EDIT.time;
    if (window.EDIT.scrubbing) playPhase += et - lastEdit;
    else if (!window.EDIT.paused) playPhase += dt;
    lastEdit = et;
    const playT = playPhase;

    /* intro scale-in */
    introT = Math.min(introT + dt / 1.4, 1);
    const s = easeOut(introT) * baseScale;
    rig.scale.setScalar(Math.max(s, 0.0001));
    glowBoost *= Math.pow(0.05, dt);
    glow.material.opacity = Math.min(1 + glowBoost * 0.8, 1.8);
    /* the knot's inner glow breathes AND shifts hue with the clicking rate */
    knotMat.emissiveIntensity = 0.35 + rpmHeat * 1.5;
    {
      const hc = heatColor(rpmHeat);
      knotMat.emissive.setRGB(
        (42 + (hc[0] - 42) * rpmHeat) / 255,
        (10 + (hc[1] - 10) * rpmHeat) / 255,
        (30 + (hc[2] - 30) * rpmHeat) / 255
      );
    }

    /* inertia + auto rotation */
    if (!dragging) {
      userRotY += velY; userRotX = THREE.MathUtils.clamp(userRotX + velX, -0.6, 0.6);
      velY *= 0.94; velX *= 0.9;
    }
    const auto = reduced ? 0.02 : 0.07;
    rig.rotation.y = userRotY + t * auto + playT * 0.16;
    rig.rotation.x = userRotX + Math.sin(t * 0.3) * 0.04;

    /* knot self-spin driven partly by playhead */
    knot.rotation.x = playT * 0.55;
    knot.rotation.y = playT * 0.35 + t * 0.1;
    knotWire.rotation.copy(knot.rotation);
    cage.rotation.y = -t * 0.05 - playT * 0.1;
    cage.rotation.x = t * 0.03;
    ring1.rotation.z = t * 0.08;
    ring2.rotation.z = -t * 0.06;
    keyRing.rotation.z = t * (reduced ? 0.05 : 0.18);
    frameRing.rotation.y = t * 0.2 + playT * 0.08;
    particles.rotation.y = t * 0.012;

    /* shockwaves */
    for (const sh of shocks) {
      if (sh.life >= 1) continue;
      sh.life = Math.min(sh.life + dt / 0.9, 1);
      const e = 1 - Math.pow(1 - sh.life, 2);
      sh.m.scale.setScalar((0.5 + e * 3.6) * (1 + rpmHeat * 0.3));
      sh.m.material.opacity = (1 - sh.life) * (0.65 + rpmHeat * 0.35);
      if (sh.life >= 1) sh.m.visible = false;
    }

    /* cursor light follows pointer */
    cursorLight.position.x += (pointer.x * 4.2 - cursorLight.position.x) * 0.07;
    cursorLight.position.y += (pointer.y * 2.8 - cursorLight.position.y) * 0.07;

    /* hover raycast (only when not dragging) — props are groups, so walk
       the hit's ancestors to find the registered interactive object */
    if (!dragging) {
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(interactive, true)[0];
      let h = null;
      if (hit) {
        let o = hit.object;
        while (o && !interactive.includes(o)) o = o.parent;
        h = o;
      }
      if (h !== hovered) {
        hovered = h;
        stage.style.cursor = h ? 'pointer' : 'grab';
      }
    }

    /* float + kick for satellites */
    for (const o of interactive) {
      const u = o.userData;
      if (u.base) {
        const amp = reduced ? u.floatAmp * 0.4 : u.floatAmp;
        o.position.y = u.base.y + Math.sin(t * u.floatSpeed + u.phase) * amp;
        o.position.x = u.base.x + Math.cos(t * u.floatSpeed * 0.7 + u.phase) * amp * 0.4;
      }
      u.kick *= Math.pow(0.02, dt);
      const target = (o === hovered ? 1.3 : 1) * (1 + u.kick);
      const cur = o.scale.x / (o === knot ? baseScale : 1);
      const ns = THREE.MathUtils.lerp(cur, target, 1 - Math.pow(0.001, dt));
      o.scale.setScalar(o === knot ? baseScale * ns : ns);
      if (o.rotation.z !== undefined && o !== knot) o.rotation.z += dt * 0.4;
    }
    playBtn.rotation.z = Math.sin(t) * 0.12;

    /* clapperboard "action!" clap + EQ bars dance */
    for (const ct of clapperTops) {
      ct.rotation.z = 0.3 + Math.abs(Math.sin(t * 2.4)) * 0.45;
    }
    for (const bar of waveBars) {
      bar.scale.y = 1 + Math.sin(t * 6 + bar.userData.eq * 1.1) * 0.35;
    }

    /* camera parallax */
    const px = pointer.x * 0.55, py = -pointer.y * 0.35;
    camera.position.x += (px - camera.position.x) * 0.04;
    camera.position.y += ((0.25 + py) - camera.position.y) * 0.04;
    camera.lookAt(rig.position.x * 0.55, 0, 0);

    renderer.render(scene, camera);
  }
  tick();
})();
