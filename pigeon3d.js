import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const container = document.getElementById('pigeon-3d');
const canvas = document.getElementById('pigeon-canvas');

if (container && canvas) {
  init();
}

function init() {
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (e) {
    console.warn('pigeon webgl failed', e);
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.set(0, 0, 3);

  scene.add(new THREE.AmbientLight(0xffffff, 1.5));
  const dir = new THREE.DirectionalLight(0xffffff, 2);
  dir.position.set(5, 5, 5);
  scene.add(dir);

  const group = new THREE.Group();
  scene.add(group);

  let mixer = null;

  new GLTFLoader().load('models/pigeon.glb', (gltf) => {
    const model = gltf.scene;
    
    // Center and scale
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    
    model.rotation.y = Math.PI / 2;
    
    const maxDim = Math.max(size.x, size.y, size.z);
    group.scale.setScalar(1.8 / maxDim);
    
    group.add(model);
    
    // Animation
    if (gltf.animations.length) {
      mixer = new THREE.AnimationMixer(model);
      const action = mixer.clipAction(gltf.animations[0]);
      action.play();
    }
    
    // Size canvas
    const rect = container.getBoundingClientRect();
    const w = rect.width || 200;
    const h = rect.height || 200;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    
    // Animate
    let time = 0;
    function animate() {
      requestAnimationFrame(animate);
      time += 0.016;
      if (mixer) mixer.update(0.016);
      renderer.render(scene, camera);
    }
    animate();
    
    // Show and drift
    container.style.opacity = '1';
    if (window.gsap && !reduceMotion) {
    const y = window.innerHeight - (rect.height || 300);
    const maxX = window.innerWidth - (rect.width || 300);
    gsap.set(container, { x: 0, y });
    gsap.to(container, { x: maxX, duration: maxX / 100, ease: 'none' });
  } else {
    container.style.left = '0px';
    container.style.top = (window.innerHeight - 300) + 'px';
  }
  }, undefined, (err) => {
    console.error('pigeon load err', err);
  });
}
