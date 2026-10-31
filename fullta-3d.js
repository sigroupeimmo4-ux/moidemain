// Géométrie et éclairage réels, calculés localement. Three.js est livré avec le site.
import * as THREE from './assets/vendor/three.module.min.js';

export function mountRabbit(button) {
  const host = button.querySelector('.fullta-mascot-art');
  const canvas = document.createElement('canvas');
  canvas.className = 'fullta-webgl';
  canvas.setAttribute('aria-hidden', 'true');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({canvas, alpha: true, antialias: true, powerPreference: 'low-power'});
  } catch {
    return; // L’image existante conserve le bouton utilisable sans WebGL.
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 30);
  camera.position.set(0, 1.9, 8.6);
  camera.lookAt(0, 1.8, 0);
  scene.add(new THREE.HemisphereLight(0xfff4ff, 0x8e74ad, 2.8));
  const key = new THREE.DirectionalLight(0xffe9df, 3.2);
  key.position.set(-3, 5, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xc1eaff, 2.4);
  rim.position.set(4, 3, -2);
  scene.add(rim);
  const fur = new THREE.MeshStandardMaterial({color: 0xe8d8f3, roughness: 0.65});
  const pink = new THREE.MeshStandardMaterial({color: 0xf4a8cc, roughness: 0.65});
  const cream = new THREE.MeshStandardMaterial({color: 0xfff0f3, roughness: 0.8});
  const dark = new THREE.MeshStandardMaterial({color: 0x30213e, roughness: 0.24});
  const white = new THREE.MeshBasicMaterial({color: 0xffffff});
  const mint = new THREE.MeshStandardMaterial({color: 0x83ddd2, roughness: 0.55});
  const lavender = new THREE.MeshStandardMaterial({color: 0x9f83bf, roughness: 0.55});
  const gold = new THREE.MeshStandardMaterial({color: 0xffd58b, metalness: 0.15, roughness: 0.4});
  const geometry = new THREE.SphereGeometry(1, 28, 20);
  const rabbit = new THREE.Group();
  scene.add(rabbit);
  function oval(parent, material, position, scale) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.scale.set(...scale);
    parent.add(mesh);
    return mesh;
  }
  const body = new THREE.Group();
  // Réduire la hauteur du corps en conservant sa largeur et l’appui des pieds.
  body.scale.set(0.92,0.8,1);
  body.position.y=0.024;
  rabbit.add(body);
  // Anatomie de lapin assis : dos en pente, poitrine étroite et bassin plus bas.
  const profile = [[0,0.36],[0.18,0.44],[0.27,0.64],[0.32,0.86],
    [0.29,1.08],[0.25,1.32],[0.23,1.54],[0.2,1.74],[0,1.84]];
  const torso = new THREE.Mesh(new THREE.LatheGeometry(profile.map(([r,y])=>new THREE.Vector2(r,y)),48),fur);
  torso.scale.z=0.88;
  torso.position.z=-0.1;
  body.add(torso);
  // Poitrail effilé en mèches superposées, plutôt qu'un ventre ovale.
  oval(body,cream,[0,1.18,0.14],[0.17,0.43,0.075]);
  for (let row=0;row<4;row++) {
    const y=1.49-row*0.16;
    for (const side of [-1,1]) {
      const tuft=oval(body,cream,[side*(0.08-row*0.009),y,0.19],[0.037,0.11,0.023]);
      tuft.rotation.z=side*0.48;
    }
  }
  // Cuisses repliées, jarrets bas et longs pieds tournés légèrement vers l'extérieur.
  for (const side of [-1,1]) {
    const haunch=oval(body,fur,[side*0.29,0.7,-0.12],[0.22,0.39,0.28]);
    haunch.rotation.z=side*-0.18;
    oval(body,fur,[side*0.32,0.4,0.04],[0.125,0.25,0.18]);
    const foot=new THREE.Group();
    foot.position.set(side*0.3,0.26,0.29);
    foot.rotation.y=side*0.17;
    body.add(foot);
    oval(foot,fur,[0,0,0],[0.175,0.125,0.55]);
    oval(foot,cream,[0,0.035,0.3],[0.15,0.085,0.25]);
    for (const offset of [-0.065,0.065]) {
      curve(foot,lavender,[[offset,0.09,0.37],[offset,0.085,0.45],[offset,0.055,0.51]],0.008);
    }
    curve(body,lavender,[[side*0.38,0.91,0.09],[side*0.47,0.69,0.12],[side*0.37,0.48,0.16]],0.009);
  }
  // Mèches orientées sur les flancs et les cuisses, modelées en relief.
  for (const side of [-1,1]) {
    for (let row=0;row<4;row++) {
      const tuft=oval(body,fur,[side*(0.24+row*0.043),1.09-row*0.12,0.065],[0.045,0.13,0.06]);
      tuft.rotation.z=side*(0.35+row*0.09);
      curve(body,cream,[[side*(0.26+row*0.035),1.12-row*0.12,0.12],[side*(0.28+row*0.035),1.02-row*0.12,0.135]],0.006);
    }
  }
  // Queue en pompon, visible à côté de la hanche.
  oval(body,cream,[0.4,0.8,-0.31],[0.18,0.18,0.18]);
  for (const [x,y,z] of [[0.47,0.88,-0.28],[0.51,0.76,-0.28],[0.4,0.69,-0.31]]) {
    oval(body,cream,[x,y,z],[0.09,0.09,0.095]);
  }
  const leftArm=new THREE.Group();
  leftArm.position.set(-0.22,1.46,0.12);
  body.add(leftArm);
  const rightArm=new THREE.Group();
  rightArm.position.set(0.22,1.46,0.12);
  body.add(rightArm);
  // Petites pattes antérieures en fourrure, sans mains ni manches.
  for (const [arm,side] of [[leftArm,-1],[rightArm,1]]) {
    const upper=oval(arm,fur,[side*0.035,-0.18,0.025],[0.095,0.23,0.105]);
    upper.rotation.z=side*0.14;
    oval(arm,fur,[side*0.06,-0.36,0.08],[0.095,0.11,0.1]);
    const foreleg=oval(arm,fur,[side*0.045,-0.48,0.13],[0.085,0.23,0.105]);
    foreleg.rotation.x=-0.3;
    oval(arm,cream,[side*0.04,-0.67,0.2],[0.105,0.1,0.205]);
    for (let i=0;i<3;i++) {
      const tuft=oval(arm,cream,[side*0.03,-0.24-i*0.07,0.115],[0.033,0.07,0.025]);
      tuft.rotation.z=side*0.3;
    }
    for (const offset of [-0.045,0.045]) {
      curve(arm,lavender,[[side*0.04+offset,-0.62,0.35],[side*0.04+offset,-0.67,0.39]],0.007);
    }
  }
  const head = new THREE.Group();
  head.position.y = 1.82;
  rabbit.add(head);
  oval(head, fur, [0, 0, 0], [0.82, 0.71, 0.62]);
  // Une petite mèche en trois mèches douces au-dessus du front.
  for (const [x, y, angle] of [[-0.13, 0.61, -0.35], [0, 0.65, 0], [0.13, 0.6, 0.4]]) {
    const tuft = oval(head, cream, [x, y, 0.26], [0.105, 0.2, 0.1]);
    tuft.rotation.z = angle;
  }
  function curve(parent, material, points, radius = 0.012) {
    const line = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(line, 12, radius, 5, false), material);
    parent.add(mesh);
    return mesh;
  }
  const ears = [];
  for (const side of [-1, 1]) {
    const ear = new THREE.Group();
    ear.position.set(side * 0.36, 0.47, -0.04);
    ear.rotation.z = -side * 0.16;
    head.add(ear);
    oval(ear, fur, [0, 0.56, 0], [0.25, 0.74, 0.21]);
    oval(ear, pink, [0, 0.56, 0.16], [0.14, 0.55, 0.066]);
    oval(ear, cream, [-0.04, 0.64, 0.217], [0.035, 0.36, 0.015]);
    ears.push(ear);
  }
  const eyes = [];
  for (const side of [-1, 1]) {
    const eye = new THREE.Group();
    eye.position.set(side * 0.28, 0.045, 0.555);
    head.add(eye);
    oval(eye, cream, [0, 0, -0.017], [0.155, 0.195, 0.07]);
    oval(eye, lavender, [0, 0, 0], [0.135, 0.175, 0.085]);
    oval(eye, dark, [0, 0.009, 0.035], [0.104, 0.143, 0.065]);
    oval(eye, white, [-0.035, 0.057, 0.096], [0.042, 0.048, 0.03]);
    oval(eye, white, [0.039, -0.048, 0.095], [0.019, 0.022, 0.012]);
    eyes.push(eye);
    oval(head, pink, [side * 0.46, -0.17, 0.515], [0.17, 0.095, 0.045]);
    oval(head, cream, [side * 0.13, -0.24, 0.565], [0.21, 0.15, 0.1]);
    curve(head, lavender, [[side * 0.17, 0.28, 0.54], [side * 0.27, 0.315, 0.535], [side * 0.36, 0.29, 0.51]], 0.018);
    for (const row of [-1, 1]) {
      curve(head, lavender, [[side * 0.3, -0.24, 0.63], [side * 0.55, -0.23 + row * 0.045, 0.6], [side * 0.76, -0.22 + row * 0.1, 0.53]], 0.008);
    }
    for (const [x, y] of [[0.14, -0.23], [0.22, -0.25], [0.17, -0.3]]) {
      oval(head, lavender, [side * x, y, 0.661], [0.013, 0.012, 0.008]);
    }
  }
  const nose = oval(head, pink, [0, -0.15, 0.695], [0.075, 0.055, 0.05]);
  nose.rotation.z = Math.PI;
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.012, 8, 16, Math.PI), dark);
  smile.rotation.z = Math.PI;
  smile.position.set(0, -0.27, 0.675);
  head.add(smile);
  const scarfGroup=new THREE.Group();
  scarfGroup.scale.setScalar(0.72);
  scarfGroup.position.set(0,0.49,-0.04);
  body.add(scarfGroup);
  oval(scarfGroup, mint, [0, 1.61, 0.02], [0.59, 0.13, 0.48]);
  const scarf = oval(scarfGroup, mint, [0.31, 1.37, 0.45], [0.14, 0.33, 0.06]);
  scarf.rotation.z = 0.22;
  const fold = oval(scarfGroup, mint, [0.13, 1.4, 0.49], [0.11, 0.24, 0.055]);
  fold.rotation.z = -0.23;
  // Tricot en relief et franges : les détails restent de la géométrie locale.
  for (let i = 0; i < 4; i++) {
    curve(scarfGroup, cream, [[0.24, 1.18 + i * 0.075, 0.514], [0.32, 1.19 + i * 0.075, 0.522], [0.41, 1.21 + i * 0.075, 0.5]], 0.009);
  }
  for (let i = 0; i < 3; i++) {
    oval(scarfGroup, mint, [0.3 + i * 0.07, 1.07, 0.46], [0.025, 0.07, 0.03]);
  }
  const starShape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const angle = Math.PI / 2 + i * Math.PI / 5;
    const radius = i % 2 ? 0.052 : 0.11;
    const x = Math.cos(angle) * radius, y = Math.sin(angle) * radius;
    if (i === 0) starShape.moveTo(x, y); else starShape.lineTo(x, y);
  }
  starShape.closePath();
  const badge = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, {depth: 0.025, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.008, bevelSegments: 2, steps: 1}), gold);
  badge.position.set(-0.2, 1.61, 0.48);
  scarfGroup.add(badge);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.7, 32), new THREE.MeshBasicMaterial({color: 0x795291, transparent: true, opacity: 0.14, depthWrite: false}));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.22;
  scene.add(shadow);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, last = 0, disposed = false, lost = false;
  let nextBlink = 1, blinkStart = -10, targetTurn = 0, turn = 0;
  function resize() {
    const {width, height} = host.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
    draw(performance.now());
  }
  function draw(now) {
    if (disposed || lost) return;
    const time = now / 1000;
    const animate = !motion.matches;
    turn += (targetTurn - turn) * 0.12;
    rabbit.rotation.y = animate ? -0.13 + turn + Math.sin(time * 0.7) * 0.09 : -0.13;
    rabbit.position.y = animate ? Math.sin(time * 2) * 0.045 : 0;
    torso.scale.x = animate ? 1 + Math.sin(time * 2) * 0.012 : 1;
    head.rotation.z = animate ? Math.sin(time * 1.3) * 0.035 : 0;
    ears.forEach((ear, i) => { ear.rotation.z = (i ? -0.28 : 0.16) + (animate ? Math.sin(time * 2.1 + i) * 0.045 : 0); });
    if (animate && time > nextBlink) { blinkStart = time; nextBlink = time + 2.5 + Math.random() * 3; }
    const blink = animate ? Math.max(0.06, 1 - Math.sin(Math.min(1, (time - blinkStart) / 0.22) * Math.PI)) : 1;
    eyes.forEach(eye => { eye.scale.y = blink; });
    const wave = button.matches(':hover, :focus-visible') || button.classList.contains('is-reacting');
    rightArm.rotation.z = animate && wave ? 2.2 + Math.sin(time * 6) * 0.2 : -0.1;
    leftArm.rotation.z = animate && button.classList.contains('is-thinking') ? Math.sin(time * 5) * 0.15 : 0.12;
    renderer.render(scene, camera);
  }
  function tick(now) {
    frame = 0;
    if (disposed || lost || document.hidden || motion.matches) return;
    if (now - last >= 33) { draw(now); last = now; }
    frame = requestAnimationFrame(tick);
  }
  function resume() {
    cancelAnimationFrame(frame);
    frame = 0;
    if (!document.hidden) {
      draw(performance.now());
      if (!motion.matches && !lost) frame = requestAnimationFrame(tick);
    }
  }
  const move = event => { const rect = button.getBoundingClientRect(); targetTurn = ((event.clientX - rect.left) / rect.width - 0.5) * 0.9; };
  const leave = () => { targetTurn = 0; };
  const contextLost = event => { event.preventDefault(); lost = true; cancelAnimationFrame(frame); button.classList.remove('has-webgl'); };
  const contextRestored = () => { lost = false; resume(); button.classList.add('has-webgl'); };
  const observer = new ResizeObserver(resize);
  function dispose(event) {
    if (event.persisted) { cancelAnimationFrame(frame); return; }
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    motion.removeEventListener('change', resume);
    document.removeEventListener('visibilitychange', resume);
    window.removeEventListener('pageshow', resume);
    button.removeEventListener('pointermove', move);
    button.removeEventListener('pointerleave', leave);
    const geometries = new Set(), materials = new Set();
    scene.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
      if (object.material) materials.add(object.material);
    });
    geometries.forEach(item => item.dispose());
    materials.forEach(item => item.dispose());
    renderer.dispose();
  }
  canvas.addEventListener('webglcontextlost', contextLost);
  canvas.addEventListener('webglcontextrestored', contextRestored);
  host.append(canvas);
  observer.observe(host);
  button.addEventListener('pointermove', move);
  button.addEventListener('pointerleave', leave);
  document.addEventListener('visibilitychange', resume);
  motion.addEventListener('change', resume);
  window.addEventListener('pagehide', dispose);
  window.addEventListener('pageshow', resume);
  resize();
  button.classList.add('has-webgl');
  resume();
}
