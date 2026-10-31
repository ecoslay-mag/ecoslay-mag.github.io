import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const container = document.getElementById('paris-3d');
const canvas = document.getElementById('paris-canvas');
const MODEL_URL = 'models/paris-walking.glb';
const DECODER_PATH = 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/libs/draco/';
const MODEL_HEIGHT = 2.1;
const WALK_TIME_SCALE = 0.6;
const TRAVEL_DURATION = 8;
const GROUND_GAP = 0.03;

if (container && canvas) init();

function neutralizeRootMotion(clip) {
  const hips = clip.tracks.find((track) => track.name.endsWith('Hips.position'));
  if (!hips) return;

  const originX = hips.values[0];
  const originZ = hips.values[2];

  for (let i = 0; i < hips.values.length; i += 3) {
    hips.values[i] = originX;
    hips.values[i + 2] = originZ;
  }
}

function init() {
  const reduceMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (error) {
    console.warn('paris webgl failed', error);
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 3);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x9a8f99, 1.4));

  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(-3, 6, 4);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xffd9ea, 0.7);
  fill.position.set(4, 2, 3);
  scene.add(fill);

  const group = new THREE.Group();
  scene.add(group);

  const draco = new DRACOLoader();
  draco.setDecoderPath(DECODER_PATH);

  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);

  let mixer = null;

  loader.load(
    MODEL_URL,
    (gltf) => {
      const model = gltf.scene;
      model.rotation.y = -Math.PI / 2;

      model.traverse((child) => {
        if (child.isMesh) child.frustumCulled = false;
      });

      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      model.scale.setScalar(MODEL_HEIGHT / size.y);

      box.setFromObject(model);
      const viewHalfHeight =
        Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      model.position.y = -viewHalfHeight + GROUND_GAP - box.min.y;
      group.add(model);

      if (!reduceMotion && gltf.animations.length) {
        const clip = gltf.animations[0];
        neutralizeRootMotion(clip);
        mixer = new THREE.AnimationMixer(model);
        mixer.timeScale = WALK_TIME_SCALE;
        mixer.clipAction(clip).play();
      }

      function resizeRenderer() {
        const rect = container.getBoundingClientRect();
        const width = Math.max(1, Math.round(rect.width));
        const height = Math.max(1, Math.round(rect.height));
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
      }

      resizeRenderer();

      const resizeObserver = new ResizeObserver(resizeRenderer);
      resizeObserver.observe(container);
      window.addEventListener('resize', resizeRenderer);

      const startWalk = () => {
        if (mixer) mixer.setTime(0);
        container.style.opacity = '1';

        if (!reduceMotion && window.gsap) {
          const travel = { value: 1 };
          gsap.to(travel, {
            value: 0,
            duration: TRAVEL_DURATION,
            ease: 'none',
            onUpdate: () => container.style.setProperty('--travel', String(travel.value)),
          });
        } else if (window.gsap) {
          container.style.setProperty('--travel', '0');
        }
      };

      if (window.scheduleWalkerStart) {
        window.scheduleWalkerStart(startWalk);
      } else {
        startWalk();
      }

      let previous = performance.now();

      function animate(now) {
        requestAnimationFrame(animate);
        const delta = Math.min((now - previous) / 1000, 0.05);
        previous = now;
        if (mixer) mixer.update(delta);
        renderer.render(scene, camera);
      }

      requestAnimationFrame(animate);
    },
    undefined,
    (error) => console.error('paris load err', error)
  );
}
