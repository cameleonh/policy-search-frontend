import * as THREE from "three";

/**
 * PolicyFit scrollytelling — 3D materials & textures.
 * Dark lab kept from AUBRIER; lume cyan → brand indigo + tri-state verdict glow.
 * Verdict colors mirror app/globals.css so 3D and DOM never disagree.
 */
export const TOK = {
  brand: "#6366F1",
  brandDeep: "#4F46E5",
  eligible: "#22C55E",
  possible: "#CA8A04",
  ineligible: "#EF4444",
  ink: "#EDE9E2",
};

export function studioEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const scene = new THREE.Scene();
  const room = new THREE.Mesh(
    new THREE.SphereGeometry(30, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0x3c4050, side: THREE.BackSide }),
  );
  scene.add(room);
  const softbox = new THREE.Mesh(
    new THREE.PlaneGeometry(11, 7),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
  );
  softbox.position.set(-8, 9, 6);
  softbox.lookAt(0, 0, 0);
  scene.add(softbox);
  const strip = new THREE.Mesh(
    new THREE.PlaneGeometry(1.6, 10),
    new THREE.MeshBasicMaterial({ color: 0xdde4ff }),
  );
  strip.position.set(10, 3, -2);
  strip.lookAt(0, 0, 0);
  scene.add(strip);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshBasicMaterial({ color: 0x0a0b0d }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -9;
  scene.add(floor);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(scene, 0.04).texture;
  pmrem.dispose();
  scene.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.geometry) m.geometry.dispose();
    if (m.material) (m.material as THREE.Material).dispose();
  });
  return env;
}

export type MatSet = ReturnType<typeof buildMaterials>;

export function buildMaterials() {
  return {
    // condition chips — frosted glass
    chipGlass: new THREE.MeshPhysicalMaterial({
      color: 0x1c1f2e,
      metalness: 0.1,
      roughness: 0.25,
      transmission: 0.45,
      thickness: 0.3,
      envMapIntensity: 0.9,
      clearcoat: 0.6,
    }),
    chipEdge: new THREE.MeshStandardMaterial({
      color: 0x8b8fd6,
      metalness: 0.7,
      roughness: 0.3,
      envMapIntensity: 0.9,
    }),
    // data particles + catalog plates
    dataPoint: new THREE.MeshBasicMaterial({ color: TOK.brand, transparent: true, opacity: 0.85 }),
    plate: new THREE.MeshStandardMaterial({
      color: 0x23263a,
      metalness: 0.5,
      roughness: 0.4,
      envMapIntensity: 0.7,
    }),
    // matching rings — steel
    ring: new THREE.MeshStandardMaterial({
      color: 0x9ea3c8,
      metalness: 0.9,
      roughness: 0.35,
      envMapIntensity: 0.8,
    }),
    // verdict seals
    sealEligible: new THREE.MeshStandardMaterial({
      color: 0x06281a,
      emissive: new THREE.Color(TOK.eligible),
      emissiveIntensity: 2.2,
      metalness: 0.2,
      roughness: 0.5,
    }),
    sealPossible: new THREE.MeshStandardMaterial({
      color: 0x2a2005,
      emissive: new THREE.Color(TOK.possible),
      emissiveIntensity: 1.9,
      metalness: 0.2,
      roughness: 0.5,
    }),
    sealIneligible: new THREE.MeshStandardMaterial({
      color: 0x2a0808,
      emissive: new THREE.Color(TOK.ineligible),
      emissiveIntensity: 1.9,
      metalness: 0.2,
      roughness: 0.5,
    }),
    // finale keeper — the "지원 가능" seal burns brightest
    sealHero: new THREE.MeshStandardMaterial({
      color: 0x0a2e1c,
      emissive: new THREE.Color(TOK.eligible),
      emissiveIntensity: 2.8,
      metalness: 0.15,
      roughness: 0.45,
    }),
    hologram: new THREE.MeshBasicMaterial({
      color: TOK.brand,
      transparent: true,
      opacity: 0.08,
    }),
    hologramRing: new THREE.MeshBasicMaterial({
      color: TOK.brand,
      transparent: true,
      opacity: 0.22,
    }),
    blackGlass: new THREE.MeshPhysicalMaterial({
      color: 0x0c0d12,
      metalness: 0.4,
      roughness: 0.06,
      envMapIntensity: 1.3,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    }),
  };
}

export function disposeMaterialSet(m: MatSet) {
  Object.values(m).forEach((mat) => mat.dispose());
}
