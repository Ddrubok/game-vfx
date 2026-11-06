import * as THREE from 'three';
import { createShockwave, disposeSharedGeometry } from './shockwave.js';

const el = id => document.getElementById(id);
const text = document.documentElement.lang === 'ko' ? {
  error: '3D 장면을 열지 못했습니다. WebGL2와 하드웨어 가속을 지원하는 브라우저인지 확인하세요. ',
  canvas: '3D 장면. 드래그 또는 방향키로 회전, 마우스 휠로 확대합니다.',
  cleared: '지워짐', before: '시작 전', ended: '종료', marker: '확인 고리', expanding: '확산', fading: '소멸',
  pngError: 'PNG를 생성하지 못했습니다.',
  pngSaved: '현재 카메라의 2D 화면을 저장합니다. 3D 모델이나 투명 이펙트 내보내기는 아닙니다.',
  contextLost: '그래픽 연결이 끊어졌습니다. 페이지를 다시 열어 주세요.'
} : {
  error: 'Could not open the 3D scene. Check that your browser supports WebGL2 and hardware acceleration. ',
  canvas: '3D scene. Drag or use arrow keys to orbit; use the mouse wheel to zoom.',
  cleared: 'Cleared', before: 'Before onset', ended: 'Finished', marker: 'Confirmation ring', expanding: 'Expanding', fading: 'Fading',
  pngError: 'Could not create the PNG.',
  pngSaved: 'Saving the current camera view as a 2D image, not a 3D model or transparent effect asset.',
  contextLost: 'Graphics context lost. Reopen the page.'
};
try { initialize(); } catch (error) {
  el('error').hidden = false;
  el('error').textContent = text.error + error.message;
  for (const button of document.querySelectorAll('button')) button.disabled = true;
  console.error(error);
}

function initialize() {
  const viewport = el('viewport');
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute('aria-label', text.canvas);
  viewport.append(canvas);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#18242b');
  scene.fog = new THREE.Fog('#18242b', 22, 45);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  const target = new THREE.Vector3(0, 0.3, 0);
  let theta = 0.7, phi = 0.94, distance = 15;
  const ambient = new THREE.HemisphereLight('#d5edec', '#344242', 2.1);
  const sun = new THREE.DirectionalLight('#ffecd3', 3.3); sun.position.set(-4, 9, 3);
  scene.add(ambient, sun);
  const platformMaterial = new THREE.MeshStandardMaterial({ color: '#283a42', roughness: 0.8, metalness: 0.2 });
  const platform = new THREE.Mesh(new THREE.CylinderGeometry(7.4, 7.6, 0.34, 96), platformMaterial);
  platform.position.y = -0.2; scene.add(platform);
  const grid = new THREE.GridHelper(14, 28, '#53726f', '#314c52'); grid.position.y = -0.02;
  grid.material.transparent = true; grid.material.opacity = 0.38; scene.add(grid);
  const centerMaterial = new THREE.MeshStandardMaterial({ color: '#829791', roughness: 0.65, metalness: 0.4 });
  const center = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.29, 0.13, 48), centerMaterial);
  center.position.y = 0.02; scene.add(center);

  const obstacles = new THREE.Group(); obstacles.name = 'depth-occluders';
  const blockMaterial = new THREE.MeshStandardMaterial({ color: '#647b82', roughness: 0.62, metalness: 0.28 });
  const blockGeometry = new THREE.BoxGeometry(0.85, 2.2, 0.85);
  const locations = [[0, 3.5], [-3.4, -0.6], [2.7, -2.7]];
  for (const [x, z] of locations) {
    const block = new THREE.Mesh(blockGeometry, blockMaterial); block.position.set(x, 1.08, z);
    obstacles.add(block);
    const outline = new THREE.LineSegments(new THREE.EdgesGeometry(blockGeometry), new THREE.LineBasicMaterial({ color: '#94a8aa', transparent: true, opacity: 0.35 }));
    outline.position.copy(block.position); obstacles.add(outline);
  }
  scene.add(obstacles);
  const effectRoot = new THREE.Group(); scene.add(effectRoot);
  let effects = [], time = 0.42, running = false, raf = 0, startTime = 0, startSeconds = 0;
  let destroyed = false, enabled = true;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  el('reduced').checked = preference.matches;
  function options() {
    return { color: el('color').value, radius: Number(el('radius').value), duration: Number(el('duration').value), count: Number(el('count').value), reducedMotion: el('reduced').checked };
  }
  function clearEffects() {
    for (const effect of effects) effect.dispose();
    effects = [];
  }
  function rebuild() {
    clearEffects();
    const o = options();
    for (let i = 0; i < o.count; i++) {
      const effect = createShockwave({ ...o, seed: 23 + i * 47 });
      if (o.count > 1) {
        const angle = i / o.count * Math.PI * 2;
        effect.group.position.set(Math.cos(angle) * 2.1, 0, Math.sin(angle) * 2.1);
      }
      effects.push(effect); effectRoot.add(effect.group);
    }
    enabled = true;
    el('time').max = o.duration;
    time = Math.min(time, o.duration);
    el('radiusValue').textContent = o.radius.toFixed(1);
    el('durationValue').textContent = o.duration.toFixed(2) + ' s';
    render();
  }
  function positionCamera() {
    camera.position.set(distance * Math.sin(phi) * Math.sin(theta), distance * Math.cos(phi), distance * Math.sin(phi) * Math.cos(theta)).add(target);
    camera.lookAt(target); camera.updateMatrixWorld();
  }
  function render() {
    if (destroyed) return;
    for (const effect of effects) effect.update(time);
    effectRoot.visible = enabled;
    renderer.render(scene, camera);
    const o = options();
    el('time').value = time;
    el('timeValue').textContent = `${time.toFixed(3)} / ${o.duration.toFixed(2)} s`;
    el('activeCount').textContent = enabled ? effects.filter(effect => effect.group.visible).length : 0;
    el('stateLabel').textContent = !effects.length ? text.cleared : time <= 0 ? text.before : time >= o.duration ? text.ended : o.reducedMotion ? text.marker : time / o.duration < 0.55 ? text.expanding : text.fading;
  }
  function stop() { running = false; cancelAnimationFrame(raf); raf = 0; }
  function seek(seconds) { stop(); time = THREE.MathUtils.clamp(Number(seconds) || 0, 0, options().duration); render(); }
  function play() {
    stop();
    if (!effects.length) rebuild();
    time = 0; running = true; startTime = performance.now(); startSeconds = 0; render();
    const tick = now => {
      if (!running || destroyed) return;
      time = Math.min(options().duration, startSeconds + (now - startTime) / 1000);
      render();
      if (time < options().duration) raf = requestAnimationFrame(tick); else stop();
    };
    raf = requestAnimationFrame(tick);
  }
  function view(name) {
    if (name === 'top') { theta = 0; phi = 0.035; distance = 17; }
    else if (name === 'side') { theta = 0; phi = 1.26; distance = 14; }
    else { theta = 0.7; phi = 0.94; distance = 15; }
    positionCamera(); render();
  }
  function resize() {
    if (destroyed) return;
    const width = viewport.clientWidth, height = viewport.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height; camera.updateProjectionMatrix(); render();
  }
  const resizer = new ResizeObserver(resize); resizer.observe(viewport);
  let drag = null;
  canvas.addEventListener('pointerdown', event => {
    if (event.button !== 0 || destroyed) return;
    drag = { x: event.clientX, y: event.clientY, id: event.pointerId };
    canvas.setPointerCapture(event.pointerId); canvas.focus();
  });
  canvas.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    theta -= (event.clientX - drag.x) * 0.008;
    phi = THREE.MathUtils.clamp(phi + (event.clientY - drag.y) * 0.006, 0.035, 1.49);
    drag.x = event.clientX; drag.y = event.clientY;
    positionCamera(); render();
  });
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(event, () => { drag = null; });
  canvas.addEventListener('wheel', event => {
    event.preventDefault(); distance = THREE.MathUtils.clamp(distance * Math.exp(event.deltaY * 0.001), 7, 25); positionCamera(); render();
  }, { passive: false });
  canvas.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    theta += event.key === 'ArrowLeft' ? 0.12 : event.key === 'ArrowRight' ? -0.12 : 0;
    phi = THREE.MathUtils.clamp(phi + (event.key === 'ArrowUp' ? -0.1 : event.key === 'ArrowDown' ? 0.1 : 0), 0.035, 1.49);
    positionCamera(); render();
  });
  el('play').addEventListener('click', play);
  el('pause').addEventListener('click', stop);
  el('clear').addEventListener('click', () => { stop(); clearEffects(); render(); });
  el('time').addEventListener('input', event => seek(event.target.value));
  for (const id of ['radius', 'duration', 'color', 'count', 'reduced']) el(id).addEventListener('input', () => { stop(); rebuild(); });
  el('obstacles').addEventListener('change', () => { obstacles.visible = el('obstacles').checked; render(); });
  for (const name of ['iso', 'top', 'side']) el('view-' + name).addEventListener('click', () => view(name));
  el('capture').addEventListener('click', () => {
    render();
    canvas.toBlob(blob => {
      if (!blob) { el('notice').textContent = text.pngError; return; }
      const url = URL.createObjectURL(blob), link = document.createElement('a');
      link.href = url; link.download = `shockwave-3d-${Math.round(time * 1000)}ms.png`;
      document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
      el('notice').textContent = text.pngSaved;
    }, 'image/png');
  });
  const onVisibility = () => { if (document.hidden) stop(); };
  document.addEventListener('visibilitychange', onVisibility);
  function destroy() {
    if (destroyed) return;
    stop(); clearEffects(); resizer.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    const geometries = new Set(), materials = new Set();
    scene.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
      if (object.material) for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
    });
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
    disposeSharedGeometry(); renderer.dispose(); destroyed = true;
  }
  window.addEventListener('pagehide', event => { stop(); if (!event.persisted) destroy(); });
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); stop(); el('notice').textContent = text.contextLost; });
  positionCamera(); rebuild(); resize();
  const gl = renderer.getContext(), debug = gl.getExtension('WEBGL_debug_renderer_info');
  window.vfx3d = {
    ready: true, seek, play, stop, view, rebuild, destroy,
    clear: () => { stop(); clearEffects(); render(); },
    render, canvas,
    setVisible: value => { enabled = value; render(); },
    setObstacles: value => { el('obstacles').checked = value; obstacles.visible = value; render(); },
    setOptions: changes => {
      stop();
      for (const [key, value] of Object.entries(changes)) {
        const element = el(key === 'reducedMotion' ? 'reduced' : key);
        if (!element) throw new Error('Unknown option: ' + key);
        if (element.type === 'checkbox') element.checked = value; else element.value = value;
      }
      rebuild();
    },
    snapshot: () => ({
      threeRevision: THREE.REVISION, time, running, destroyed, options: options(),
      instances: effects.length, children: effectRoot.children.length,
      states: effects.map(effect => effect.state()),
      memory: { ...renderer.info.memory }, programs: renderer.info.programs?.length,
      render: { ...renderer.info.render }, camera: camera.position.toArray(),
      gpu: debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)
    }),
    // Render an opaque mask of the FRONT pillar only, with the same camera/projection.
    // The test compares effect-on/off at interior mask pixels where all FX are behind it.
    frontMask: () => {
      const maskScene = new THREE.Scene(); maskScene.background = new THREE.Color(0x000000);
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
      const mesh = new THREE.Mesh(blockGeometry, material); mesh.position.copy(obstacles.children[0].position);
      maskScene.add(mesh); renderer.render(maskScene, camera);
      const data = canvas.toDataURL(); material.dispose(); render(); return data;
    }
  };
}
