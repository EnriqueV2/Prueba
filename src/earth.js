import * as THREE from 'three';

/** A decorative globe. Returns a cleanup function for clients that replace views. */
export function initEarth(container) {
  if (!container) return () => {};

  container.setAttribute('aria-hidden', 'true');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    });
  } catch {
    container.classList.add('earth-fallback');
    return () => {};
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.16;
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  container.append(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 20);
  camera.position.z = 3.3;

  scene.add(new THREE.AmbientLight(0xe3eff5, 1.6));
  const daylight = new THREE.DirectionalLight(0xfff5df, 2.25);
  daylight.position.set(-3, 4, 5);
  scene.add(daylight);

  const globeGeometry = new THREE.SphereGeometry(1, 72, 48);
  const globeMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    shininess: 6,
    specular: 0x183b4c,
  });
  const globe = new THREE.Mesh(globeGeometry, globeMaterial);
  globe.rotation.set(0.15, -Math.PI / 2 - 0.12, -0.08);
  scene.add(globe);

  // A narrow, translucent rim lets the atmosphere blend into the page.
  const atmosphereGeometry = new THREE.SphereGeometry(1.012, 64, 40);
  const atmosphereMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide,
    uniforms: { tint: { value: new THREE.Color(0x82c1da) } },
    vertexShader: `
      varying vec3 surfaceNormal;
      varying vec3 viewDirection;
      void main() {
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        surfaceNormal = normalize(normalMatrix * normal);
        viewDirection = normalize(-viewPosition.xyz);
        gl_Position = projectionMatrix * viewPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 tint;
      varying vec3 surfaceNormal;
      varying vec3 viewDirection;
      void main() {
        float rim = pow(1.0 - abs(dot(normalize(surfaceNormal), normalize(viewDirection))), 3.0);
        gl_FragColor = vec4(tint, rim * 0.24);
      }
    `,
  });
  scene.add(new THREE.Mesh(atmosphereGeometry, atmosphereMaterial));

  let disposed = false;
  let ready = false;
  let visible = false;
  let animationFrame = 0;
  let previousTime = 0;
  let texture;
  const canAnimate = () => ready && visible && !document.hidden && !motionPreference.matches;

  const render = () => {
    if (!disposed && ready && visible && !document.hidden) {
      renderer.render(scene, camera);
      container.classList.remove('earth-fallback');
    }
  };

  const animate = (time) => {
    animationFrame = 0;
    if (disposed || !canAnimate()) return;
    if (previousTime) globe.rotation.y += Math.min((time - previousTime) / 1000, 0.05) * 0.014;
    previousTime = time;
    render();
    animationFrame = window.requestAnimationFrame(animate);
  };

  const updateAnimation = () => {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    previousTime = 0;
    render();
    if (!disposed && canAnimate()) animationFrame = window.requestAnimationFrame(animate);
  };

  const resize = () => {
    if (disposed) return;
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    camera.aspect = width / height;
    // Keep the full globe inside the shorter edge, including narrow layouts.
    camera.position.z = Math.sqrt(1 + (1 / (0.87 * Math.tan(Math.PI / 9) * Math.min(1, camera.aspect))) ** 2);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    render();
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    updateAnimation();
  }, { threshold: 0 });
  intersectionObserver.observe(container);
  document.addEventListener('visibilitychange', updateAnimation);
  motionPreference.addEventListener('change', updateAnimation);

  const handleContextLoss = (event) => {
    event.preventDefault();
    ready = false;
    renderer.domElement.style.visibility = 'hidden';
    container.classList.add('earth-fallback');
    updateAnimation();
  };
  const handleContextRestore = () => {
    if (disposed || !texture) return;
    ready = true;
    renderer.domElement.style.visibility = '';
    container.classList.remove('earth-fallback');
    resize();
    updateAnimation();
  };
  renderer.domElement.addEventListener('webglcontextlost', handleContextLoss);
  renderer.domElement.addEventListener('webglcontextrestored', handleContextRestore);

  new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}images/earth.jpg`, (loadedTexture) => {
    if (disposed) {
      loadedTexture.dispose();
      return;
    }
    texture = loadedTexture;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    globeMaterial.map = texture;
    globeMaterial.needsUpdate = true;
    ready = true;
    resize();
    updateAnimation();
  }, undefined, () => {
    if (disposed) return;
    renderer.domElement.style.visibility = 'hidden';
    container.classList.add('earth-fallback');
  });
  resize();

  return () => {
    disposed = true;
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    document.removeEventListener('visibilitychange', updateAnimation);
    motionPreference.removeEventListener('change', updateAnimation);
    renderer.domElement.removeEventListener('webglcontextlost', handleContextLoss);
    renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestore);
    globeGeometry.dispose();
    globeMaterial.dispose();
    atmosphereGeometry.dispose();
    atmosphereMaterial.dispose();
    texture?.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
