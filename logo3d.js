import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const MODEL_URL = 'models/ecoslay-logo.glb';
const container = document.getElementById('logo-3d');
const canvas = document.getElementById('logo-canvas');

if (container && canvas) {
  init();
}

function init() {
  canvas.setAttribute('data-loading', 'true');

  const showFallback = () => container.classList.add('is-fallback');
  const reduceMotion = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      premultipliedAlpha: true
    });
  } catch (error) {
    console.warn('3D logo unavailable:', error);
    showFallback();
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 20);
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);

  const bloomCamera = camera.clone();
  bloomCamera.layers.set(1);

  const pointLight = new THREE.PointLight(0xffffff, 26);
  pointLight.position.set(-3.2, 1.8, 2.0);
  scene.add(pointLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
  keyLight.position.set(-3.5, 2.5, 3.5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.25);
  fillLight.position.set(2.5, 1, 2);
  scene.add(fillLight);

  const pinkLight = new THREE.PointLight(0xffb6d9, 1.2);
  pinkLight.position.set(2.8, 1.4, 2.4);
  scene.add(pinkLight);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x909090, 0.32));

  const group = new THREE.Group();
  scene.add(group);

  const EDGE_COLOR = 0xff8fc4;
  const GLOW_COLOR = 0xffb0da;
  const HIGHLIGHT_COLOR = 0xffffff;
  const SHADOW_COLOR = 0xd94f93;
  const SETTLE_PITCH = THREE.MathUtils.degToRad(4);
  const SETTLE_YAW = THREE.MathUtils.degToRad(-12);
  const scanBounds = new THREE.Vector2(-0.2635, 0.2635);

  const hologramUniforms = {
    uTime: { value: 0 },
    uEdgeColor: { value: new THREE.Color(EDGE_COLOR) },
    uHighlightColor: { value: new THREE.Color(HIGHLIGHT_COLOR) },
    uRimStrength: { value: 0.28 },
    uScanIntensity: { value: 0.008 },
    uShimmerIntensity: { value: 0.04 },
    uBandIntensity: { value: 0.08 },
    uScanBounds: { value: scanBounds },
    uShadowColor: { value: new THREE.Color(SHADOW_COLOR) },
    uShadowStrength: { value: 0.55 }
  };

  const glowUniforms = {
    uTime: { value: 0 },
    uGlowColor: { value: new THREE.Color(GLOW_COLOR) },
    uEdgeColor: { value: new THREE.Color(EDGE_COLOR) },
    uIntensity: { value: 1.0 },
    uBandIntensity: { value: 0.9 },
    uScanBounds: { value: scanBounds }
  };

  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.55,
    metalness: 0,
    side: THREE.DoubleSide,
    toneMapped: false
  });

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = hologramUniforms.uTime;
    shader.uniforms.uEdgeColor = hologramUniforms.uEdgeColor;
    shader.uniforms.uHighlightColor = hologramUniforms.uHighlightColor;
    shader.uniforms.uRimStrength = hologramUniforms.uRimStrength;
    shader.uniforms.uScanIntensity = hologramUniforms.uScanIntensity;
    shader.uniforms.uShimmerIntensity = hologramUniforms.uShimmerIntensity;
    shader.uniforms.uBandIntensity = hologramUniforms.uBandIntensity;
    shader.uniforms.uScanBounds = hologramUniforms.uScanBounds;
    shader.uniforms.uShadowColor = hologramUniforms.uShadowColor;
    shader.uniforms.uShadowStrength = hologramUniforms.uShadowStrength;

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vHoloLocal;'
      )
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvHoloLocal = transformed;'
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uTime;
        uniform vec3 uEdgeColor;
        uniform vec3 uHighlightColor;
        uniform float uRimStrength;
        uniform float uScanIntensity;
        uniform float uShimmerIntensity;
        uniform float uBandIntensity;
        uniform vec2 uScanBounds;
        uniform vec3 uShadowColor;
        uniform float uShadowStrength;
        varying vec3 vHoloLocal;`
      )
      .replace(
        '#include <tonemapping_fragment>',
        `float holoFresnel = pow(
          1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0),
          2.2
        );
        float holoScan = 0.5 + 0.5 * sin(vHoloLocal.y * 165.0 - uTime * 1.15);
        float holoShimmer = 0.5 + 0.5 * sin(
          vHoloLocal.x * 16.0 + vHoloLocal.y * 27.0 + uTime * 1.7
        );
        float scanCycle = fract(uTime * 0.16);
        float scanFade = smoothstep(0.0, 0.08, scanCycle)
          * smoothstep(1.0, 0.92, scanCycle);
        float scanY = mix(uScanBounds.x, uScanBounds.y, scanCycle);
        float scanBand = smoothstep(0.03, 0.0, abs(vHoloLocal.y - scanY)) * scanFade;

        gl_FragColor.rgb = mix(gl_FragColor.rgb, uEdgeColor, holoFresnel * uRimStrength);
        gl_FragColor.rgb += uHighlightColor * pow(holoFresnel, 3.0) * 0.18;
        gl_FragColor.rgb += uEdgeColor * holoScan * uScanIntensity;
        gl_FragColor.rgb += uEdgeColor * holoFresnel * holoShimmer * uShimmerIntensity;
        gl_FragColor.rgb += uEdgeColor * scanBand * uBandIntensity;
        gl_FragColor.rgb += uHighlightColor * scanBand * 0.025;

        float holoLight = clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0);
        float shadow = (1.0 - holoLight) * uShadowStrength;
        gl_FragColor.rgb = mix(gl_FragColor.rgb, uShadowColor, shadow);

        #include <tonemapping_fragment>`
      );

    material.userData.shader = shader;
  };

  material.customProgramCacheKey = () => 'ecoslay-hologram-v1';

  const glowMaterial = new THREE.ShaderMaterial({
    uniforms: glowUniforms,
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vHoloLocal;

      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vViewPosition = -mvPosition.xyz;
        vHoloLocal = position;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uGlowColor;
      uniform vec3 uEdgeColor;
      uniform float uTime;
      uniform float uIntensity;
      uniform float uBandIntensity;
      uniform vec2 uScanBounds;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vHoloLocal;

      void main() {
        float fresnel = pow(
          1.0 - abs(dot(normalize(vNormal), normalize(vViewPosition))),
          2.0
        );
        float shimmer = 0.85 + 0.15 * sin(
          vViewPosition.x * 9.0 + vViewPosition.y * 13.0 + uTime * 1.5
        );
        float scanCycle = fract(uTime * 0.16);
        float scanFade = smoothstep(0.0, 0.08, scanCycle)
          * smoothstep(1.0, 0.92, scanCycle);
        float scanY = mix(uScanBounds.x, uScanBounds.y, scanCycle);
        float scanBand = smoothstep(0.03, 0.0, abs(vHoloLocal.y - scanY)) * scanFade;

        vec3 color =
          uGlowColor * 0.008 +
          uEdgeColor * fresnel * uIntensity * shimmer +
          uEdgeColor * scanBand * uBandIntensity;

        gl_FragColor = vec4(color, 1.0);
      }
    `,
    side: THREE.DoubleSide,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false,
    toneMapped: false
  });

  const edgeColor = new THREE.Color(EDGE_COLOR);
  const glowColor = new THREE.Color(GLOW_COLOR);
  const bloomTint = (color) => new THREE.Vector3(color.r, color.g, color.b);
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(1, 1),
    0.35,
    0.15,
    0.25
  );

  bloomPass.bloomTintColors = [
    bloomTint(edgeColor),
    bloomTint(glowColor),
    bloomTint(glowColor),
    bloomTint(glowColor),
    bloomTint(glowColor)
  ];

  const bloomComposer = new EffectComposer(renderer);
  bloomComposer.renderToScreen = false;
  bloomComposer.addPass(new RenderPass(scene, bloomCamera));
  bloomComposer.addPass(bloomPass);

  const mixPass = new ShaderPass({
    uniforms: {
      baseTexture: { value: null },
      bloomTexture: { value: null },
      bloomStrength: { value: 1.0 }
    },
    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D baseTexture;
      uniform sampler2D bloomTexture;
      uniform float bloomStrength;
      varying vec2 vUv;

      void main() {
        vec4 base = texture2D(baseTexture, vUv);
        vec3 bloom = texture2D(bloomTexture, vUv).rgb * bloomStrength;

        gl_FragColor = vec4(base.rgb * base.a + bloom, base.a);
      }
    `
  }, 'baseTexture');

  const composerTarget = new THREE.WebGLRenderTarget(1, 1, {
    type: THREE.HalfFloatType,
    samples: 4
  });
  const composer = new EffectComposer(renderer, composerTarget);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(mixPass);
  composer.addPass(new OutputPass());

  let model = null;
  let resizeObserver = null;
  let fitHalfWidth = 1;
  let fitHalfHeight = 1;
  let ticking = false;
  let spinActive = false;
  let isVisible = true;
  let lastFrame = -1;

  function fitCamera() {
    if (!model) return;

    const rect = container.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const aspect = width / height;
    const halfHeight = Math.max(fitHalfHeight, fitHalfWidth / aspect);
    const halfWidth = halfHeight * aspect;

    camera.left = -halfWidth;
    camera.right = halfWidth;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();

    bloomCamera.left = camera.left;
    bloomCamera.right = camera.right;
    bloomCamera.top = camera.top;
    bloomCamera.bottom = camera.bottom;
    bloomCamera.updateProjectionMatrix();
  }

  function draw() {
    if (!model) return;

    bloomComposer.render();
    mixPass.uniforms.bloomTexture.value = bloomComposer.readBuffer.texture;
    composer.render();
  }

  function render() {
    if (!model) return;

    const rect = container.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));

    renderer.setSize(width, height, false);
    composer.setSize(width, height);
    bloomComposer.setSize(width, height);
    fitCamera();
    draw();
  }

  function tick(time) {
    if (!model || document.hidden) return;

    const interval = spinActive ? 1 / 60 : 1 / 30;
    if (time - lastFrame < interval) return;
    lastFrame = time;

    hologramUniforms.uTime.value = time;
    glowUniforms.uTime.value = time;
    draw();
  }

  function startTicker() {
    if (reduceMotion || !window.gsap || ticking) return;
    window.gsap.ticker.add(tick);
    ticking = true;
  }

  function stopTicker() {
    if (!ticking) return;
    window.gsap.ticker.remove(tick);
    ticking = false;
  }

  function animateIntro() {
    if (!window.gsap || reduceMotion) {
      group.rotation.set(SETTLE_PITCH, SETTLE_YAW, 0);
      draw();
      return;
    }

    group.rotation.set(0, 0, 0);
    startTicker();
    draw();

    spinActive = true;

    window.gsap.to(group.rotation, {
      x: SETTLE_PITCH,
      y: SETTLE_YAW - Math.PI * 2,
      duration: 3.5,
      delay: 0.4,
      ease: 'power2.inOut',
      onComplete: () => {
        spinActive = false;
        draw();
      }
    });

  }

  let logoRevealed = false;
  let pendingReveal = false;

  window.revealHeroLogo = function () {
    if (logoRevealed) return;
    if (!model) {
      pendingReveal = true;
      container.classList.add('is-revealed');
      return;
    }
    logoRevealed = true;
    container.classList.add('is-revealed');
    animateIntro();
  };

  new GLTFLoader().load(
    MODEL_URL,
    (gltf) => {
      model = gltf.scene;

      let localMinY = Infinity;
      let localMaxY = -Infinity;

      model.traverse((child) => {
        if (child.isMesh) {
          child.material = material;

          if (child.geometry) {
            child.geometry.computeBoundingBox();
            localMinY = Math.min(localMinY, child.geometry.boundingBox.min.y);
            localMaxY = Math.max(localMaxY, child.geometry.boundingBox.max.y);
          }
        }
      });

      if (Number.isFinite(localMinY)) {
        scanBounds.set(localMinY, localMaxY);
      }

      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);

      const halfWidth = size.x / 2;
      const halfHeight = size.y / 2;
      const halfDepth = size.z / 2;
      const maxHalfWidth =
        halfWidth * Math.abs(Math.cos(SETTLE_YAW))
        + halfDepth * Math.abs(Math.sin(SETTLE_YAW));
      const maxHalfHeight =
        halfHeight * Math.abs(Math.cos(SETTLE_PITCH))
        + maxHalfWidth * Math.abs(Math.sin(SETTLE_PITCH));
      const fitMargin = 1.05;
      fitHalfWidth = maxHalfWidth * fitMargin;
      fitHalfHeight = maxHalfHeight * fitMargin;

      group.add(model);

      const glowModel = model.clone(true);

      glowModel.layers.set(1);
      glowModel.traverse((child) => {
        if (child.isMesh) {
          child.material = glowMaterial;
        }
        child.layers.set(1);
      });

      const glowGroup = new THREE.Group();
      glowGroup.layers.set(1);
      glowGroup.add(glowModel);
      glowGroup.scale.setScalar(1.015);
      group.add(glowGroup);

      if ('ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(render);
        resizeObserver.observe(container);
      } else {
        window.addEventListener('resize', render);
      }

      render();
      container.classList.remove('is-fallback');
      canvas.classList.add('is-ready');

      if (pendingReveal && !logoRevealed) {
        window.revealHeroLogo();
      }

      if ('IntersectionObserver' in window) {
        const visibilityObserver = new IntersectionObserver((entries) => {
          isVisible = entries[0].isIntersecting;

          if (isVisible) {
            startTicker();
            draw();
          } else {
            stopTicker();
          }
        });

        visibilityObserver.observe(container);
      }

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          stopTicker();
        } else if (isVisible) {
          startTicker();
        }
      });

      if (pendingReveal && !logoRevealed) {
        window.revealHeroLogo();
      }
    },
    undefined,
    (error) => {
      console.warn('Could not load 3D logo:', error);
      showFallback();
    }
  );
}
