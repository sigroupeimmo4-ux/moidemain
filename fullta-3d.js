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
  oval(rabbit, fur, [0, 1.13, 0], [0.59, 0.78, 0.46]);
  oval(rabbit, cream, [0, 1.05, 0.4], [0.39, 0.5, 0.1]);
  oval(rabbit, fur, [-0.37, 0.47, 0.23], [0.33, 0.22, 0.43]);
  oval(rabbit, fur, [0.37, 0.47, 0.23], [0.33, 0.22, 0.43]);
  oval(rabbit, cream, [0.53, 0.92, -0.34], [0.27, 0.27, 0.27]);
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.54, 1.5, 0);
  rabbit.add(leftArm);
  oval(leftArm, fur, [-0.04, -0.28, 0.08], [0.21, 0.41, 0.22]);
  const rightArm = new THREE.Group();
  rightArm.position.set(0.54, 1.52, 0);
  rabbit.add(rightArm);
  oval(rightArm, fur, [0.09, -0.24, 0.08], [0.21, 0.4, 0.22]);
  const head = new THREE.Group();
  head.position.y = 2.08;
  rabbit.add(head);
  oval(head, fur, [0, 0, 0], [0.75, 0.66, 0.57]);
  const ears = [];
  for (const side of [-1, 1]) {
    const ear = new THREE.Group();
    ear.position.set(side * 0.36, 0.47, -0.04);
    ear.rotation.z = -side * 0.16;
    head.add(ear);
    oval(ear, fur, [0, 0.56, 0], [0.23, 0.79, 0.2]);
    oval(ear, pink, [0, 0.59, 0.15], [0.128, 0.59, 0.066]);
    ears.push(ear);
  }
  const eyes = [];
  for (const side of [-1, 1]) {
    const eye = new THREE.Group();
    eye.position.set(side * 0.265, 0.065, 0.51);
    head.add(eye);
    oval(eye, dark, [0, 0, 0], [0.105, 0.145, 0.07]);
    oval(eye, white, [-0.026, 0.047, 0.058], [0.032, 0.037, 0.018]);
    eyes.push(eye);
    oval(head, pink, [side * 0.43, -0.15, 0.47], [0.14, 0.075, 0.04]);
    oval(head, cream, [side * 0.13, -0.23, 0.51], [0.2, 0.14, 0.1]);
  }
  const nose = oval(head, pink, [0, -0.14, 0.635], [0.095, 0.065, 0.06]);
  nose.rotation.z = Math.PI;
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.012, 8, 16, Math.PI), dark);
  smile.rotation.z = Math.PI;
  smile.position.set(0, -0.25, 0.61);
  head.add(smile);
  oval(rabbit, mint, [0, 1.61, 0.02], [0.59, 0.13, 0.48]);
  const scarf = oval(rabbit, mint, [0.31, 1.37, 0.45], [0.14, 0.33, 0.06]);
  scarf.rotation.z = 0.22;
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
    head.rotation.z = animate ? Math.sin(time * 1.3) * 0.035 : 0;
    ears.forEach((ear, i) => { ear.rotation.z = (i ? -1 : 1) * 0.16 + (animate ? Math.sin(time * 2.1 + i) * 0.045 : 0); });
    if (animate && time > nextBlink) { blinkStart = time; nextBlink = time + 2.5 + Math.random() * 3; }
    const blink = animate ? Math.max(0.06, 1 - Math.sin(Math.min(1, (time - blinkStart) / 0.22) * Math.PI)) : 1;
    eyes.forEach(eye => { eye.scale.y = blink; });
    const wave = button.matches(':hover, :focus-visible') || button.classList.contains('is-reacting');
    rightArm.rotation.z = animate && wave ? 2.2 + Math.sin(time * 8) * 0.25 : -0.1;
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
    geometry.dispose();
    smile.geometry.dispose(); shadow.geometry.dispose(); shadow.material.dispose();
    for (const material of [fur, pink, cream, dark, white, mint]) material.dispose();
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
