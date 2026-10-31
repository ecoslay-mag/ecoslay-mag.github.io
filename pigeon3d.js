import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const container = document.getElementById('pigeon-3d');
const canvas = document.getElementById('pigeon-canvas');
const TRAVEL_DURATION = 8;

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

    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);

    model.rotation.y = Math.PI / 2;

    const maxDim = Math.max(size.x, size.y, size.z);
    group.scale.setScalar(1.8 / maxDim);

    group.add(model);

    if (gltf.animations.length) {
      mixer = new THREE.AnimationMixer(model);
      const action = mixer.clipAction(gltf.animations[0]);
      action.play();
    }

    function resizeRenderer() {
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    }

    resizeRenderer();

    const resizeObserver = new ResizeObserver(resizeRenderer);
    resizeObserver.observe(container);
    window.addEventListener('resize', resizeRenderer);

    let time = 0;
    function animate() {
      requestAnimationFrame(animate);
      time += 0.016;
      if (mixer) mixer.update(0.016);
      renderer.render(scene, camera);
    }
    animate();

    const startDrift = () => {
      if (mixer) mixer.setTime(0);
      container.style.opacity = '1';

      if (window.gsap && !reduceMotion) {
        const travel = { value: 0 };
        gsap.to(travel, {
          value: 1,
          duration: TRAVEL_DURATION,
          ease: 'none',
          onUpdate: () => container.style.setProperty('--travel', String(travel.value)),
        });
      } else {
        container.style.setProperty('--travel', '1');
      }
    };

    if (window.scheduleWalkerStart) {
      window.scheduleWalkerStart(startDrift);
    } else {
      startDrift();
    }
  }, undefined, (err) => {
    console.error('pigeon load err', err);
  });
}
