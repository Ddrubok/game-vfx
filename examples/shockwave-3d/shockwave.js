import * as THREE from 'three';

// Example units are world units and seconds. No collision, damage or game clock is owned here.
const ringGeometry = new THREE.TorusGeometry(1, 0.012, 8, 144);
const domeGeometry = new THREE.SphereGeometry(1, 64, 28, 0, Math.PI * 2, 0, Math.PI / 2);
const shardGeometry = new THREE.OctahedronGeometry(1);
const markerGeometry = new THREE.TorusGeometry(0.5, 0.022, 8, 64);
const particleCount = 64;
const transform = new THREE.Object3D();

function randomSource(seed) {
  let value = seed >>> 0;
  return () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296; };
}

export function createShockwave({ color = '#69e5cd', seed = 23, duration = 1.6, radius = 3.8, reducedMotion = false } = {}) {
  const group = new THREE.Group();
  group.name = 'shockwave';
  const ringMaterial = new THREE.MeshBasicMaterial({ color, transparent: true, depthWrite: false });
  const echoMaterial = ringMaterial.clone();
  const markerMaterial = ringMaterial.clone();
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  const echo = new THREE.Mesh(ringGeometry, echoMaterial);
  const marker = new THREE.Mesh(markerGeometry, markerMaterial);
  for (const [mesh, y] of [[ring, 0.08], [echo, 0.06], [marker, 0.06]]) {
    mesh.rotation.x = Math.PI / 2; mesh.position.y = y;
  }
  const domeMaterial = new THREE.ShaderMaterial({
    uniforms: { tint: { value: new THREE.Color(color) }, intensity: { value: 0 }, age: { value: 0 } },
    transparent: true, depthTest: true, depthWrite: false, side: THREE.FrontSide,
    vertexShader: `
      varying vec3 viewNormal;
      varying vec3 viewPosition;
      varying vec3 localPosition;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        viewNormal = normalize(normalMatrix * normal);
        viewPosition = mv.xyz;
        localPosition = position;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 tint;
      uniform float intensity;
      uniform float age;
      varying vec3 viewNormal;
      varying vec3 viewPosition;
      varying vec3 localPosition;
      void main() {
        float rim = pow(1.0 - abs(dot(normalize(viewNormal), normalize(-viewPosition))), 2.4);
        float band = pow(0.5 + 0.5 * sin(localPosition.y * 28.0 - age * 7.0), 10.0);
        float alpha = intensity * (0.035 + rim * 0.62 + band * 0.055);
        gl_FragColor = vec4(tint * (1.0 + rim * 0.7), alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  });
  const dome = new THREE.Mesh(domeGeometry, domeMaterial);
  dome.position.y = 0.08;
  const particleMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).lerp(new THREE.Color('#fff2ce'), 0.55), transparent: true, depthWrite: false });
  const particles = new THREE.InstancedMesh(shardGeometry, particleMaterial, particleCount);
  particles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  // The analytic particles move within the known radius; no stale initial instance bounds.
  particles.frustumCulled = false;
  const random = randomSource(seed);
  const seeds = Array.from({ length: particleCount }, (_, i) => ({
    angle: (i + random() * 0.7) / particleCount * Math.PI * 2,
    reach: 0.45 + random() * 0.5,
    height: 0.3 + random() * 1.7,
    size: 0.022 + random() * 0.025,
    rotation: random() * Math.PI
  }));
  group.add(dome, ring, echo, particles, marker);
  let disposed = false, lastTime = 0;
  function update(seconds) {
    if (disposed) return;
    lastTime = seconds;
    const p = THREE.MathUtils.clamp(seconds / duration, 0, 1);
    group.visible = seconds > 0 && seconds < duration;
    if (!group.visible) return;
    const strength = Math.min(1, p / 0.065) * Math.pow(1 - p, 1.35);
    marker.visible = reducedMotion;
    dome.visible = ring.visible = echo.visible = particles.visible = !reducedMotion;
    markerMaterial.opacity = strength;
    if (reducedMotion) return;
    const spread = 0.08 + 0.92 * (1 - Math.pow(1 - p, 2.6));
    const r = radius * spread;
    ring.scale.setScalar(r);
    ringMaterial.opacity = strength;
    echo.scale.setScalar(r * 0.82);
    echoMaterial.opacity = strength * 0.36;
    dome.scale.set(r, r * 0.54, r);
    domeMaterial.uniforms.intensity.value = strength;
    domeMaterial.uniforms.age.value = seconds;
    particleMaterial.opacity = strength;
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i], distance = radius * s.reach * Math.pow(p, 0.7);
      transform.position.set(Math.cos(s.angle) * distance, 0.09 + s.height * Math.sin(p * Math.PI), Math.sin(s.angle) * distance);
      transform.rotation.set(s.rotation + p * 3, s.angle, p * 2);
      const size = s.size * (0.5 + 0.5 * (1 - p));
      transform.scale.set(size, size * 3.5, size);
      transform.updateMatrix(); particles.setMatrixAt(i, transform.matrix);
    }
    particles.instanceMatrix.needsUpdate = true;
  }
  function dispose() {
    if (disposed) return;
    disposed = true; group.removeFromParent(); particles.dispose();
    for (const material of [ringMaterial, echoMaterial, markerMaterial, domeMaterial, particleMaterial]) material.dispose();
  }
  update(0);
  return { group, update, dispose, state: () => ({ visible: group.visible, disposed, lastTime, duration, seed, reducedMotion, particleCount: reducedMotion ? 0 : particleCount }) };
}

export function disposeSharedGeometry() {
  for (const geometry of [ringGeometry, domeGeometry, shardGeometry, markerGeometry]) geometry.dispose();
}
