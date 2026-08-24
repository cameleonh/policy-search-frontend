import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { buildMaterials, studioEnvironment, disposeMaterialSet, type MatSet } from "./materials";
import { part, collectParts, conditionChip, dataPlate, type PhaseGroup } from "./parts";

export type { PartEntry } from "./parts";

export interface FadeTarget {
  mat: THREE.MeshStandardMaterial;
  color: THREE.Color;
  emissiveIntensity: number;
  envMapIntensity: number;
  opacity?: number;
  clearcoat?: number;
  transmission?: number;
}

export interface SceneBundle {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  composer: EffectComposer;
  bloom: UnrealBloomPass;
  mats: MatSet;
  phases: PhaseGroup[];
  particles: THREE.Points;
  particlesBase: Float32Array;
  verdictHero: THREE.Object3D | null;
  fadeTargets: FadeTarget[];
  baseBg: THREE.Color;
  lights: { key: THREE.DirectionalLight; rim: THREE.DirectionalLight; hemi: THREE.HemisphereLight };
  render: () => void;
  resize: () => void;
  dispose: () => void;
}

function buildConditions(mats: MatSet): PhaseGroup {
  const g = new THREE.Group();
  const chips: [string, [number, number]][] = [
    ["생년월일", [-0.62, 0.42]],
    ["거주지", [0.58, 0.5]],
    ["고용·학적", [-0.5, -0.48]],
    ["소득 구간", [0.54, -0.52]],
  ];
  chips.forEach(([label, [x, z]], i) => {
    const chip = conditionChip(mats, label);
    chip.position.set(x, 0.5 + i * 0.02, z);
    chip.rotation.y = (i % 2 ? -1 : 1) * 0.5;
    const th = (i / 4) * Math.PI * 2;
    part(chip, [Math.cos(th) * 1.2, 1.8, Math.sin(th) * 1.2], [Math.cos(th) * 2.2, 0.3, Math.sin(th) * 2.2], [0.4, th, 0.3]);
    g.add(chip);
  });
  return collectParts(g, "Conditions");
}

function buildData(mats: MatSet): PhaseGroup {
  const g = new THREE.Group();
  // 9 catalog plates stacking into a rotating index
  for (let i = 0; i < 9; i++) {
    const p = dataPlate(mats, i);
    const th = (i / 9) * Math.PI * 2;
    p.position.set(Math.cos(th) * 1.5, 0.35 + i * 0.055, Math.sin(th) * 1.5);
    p.rotation.y = -th;
    part(p, [Math.cos(th) * 2.0, 2.4 + i * 0.1, Math.sin(th) * 2.0], [Math.cos(th) * 3.2, 0, Math.sin(th) * 3.2], [0, th, 0]);
    g.add(p);
  }
  // central spine
  const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.7, 16), mats.chipEdge);
  spine.position.y = 0.6;
  part(spine, [0, 2.6, 0], [0, 0, 2.6]);
  g.add(spine);
  return collectParts(g, "Data");
}

function buildMatcher(mats: MatSet): PhaseGroup {
  const g = new THREE.Group();
  // three nested filter rings narrowing to the center
  const radii = [1.7, 1.25, 0.8];
  radii.forEach((r, i) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.035, 10, 72), mats.ring);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.75 + i * 0.14;
    part(ring, [0, 2.2 + i * 0.2, 0], [Math.cos(i * 2.1) * 2.6, 0.4, Math.sin(i * 2.1) * 2.6], [0, i, 0]);
    g.add(ring);
  });
  return collectParts(g, "Matcher");
}

function buildVerdict(mats: MatSet): PhaseGroup {
  const g = new THREE.Group();
  // tri-state seals — possible & ineligible land first, eligible last (hero)
  const seals: [THREE.Material, [number, number], string][] = [
    [mats.sealPossible, [-0.78, -0.3], "sealPossible"],
    [mats.sealIneligible, [0.78, 0.3], "sealIneligible"],
  ];
  for (const [mat, [x, z], name] of seals) {
    const seal = verdictSeal(mat, 0.34);
    seal.position.set(x, 1.05, z);
    seal.name = name;
    part(seal, [x * 1.6, 2.0, z * 1.6], [x * 2.6, 0.2, z * 2.6]);
    g.add(seal);
  }
  const hero = verdictSeal(mats.sealHero, 0.42);
  hero.position.set(0, 1.12, 0);
  hero.name = "sealHero";
  part(hero, [0, 2.4, 0.6], [0, 0.4, 2.8]);
  g.add(hero);
  return collectParts(g, "Verdict");
}

function verdictSeal(mat: THREE.Material, r: number): THREE.Group {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r, r * 0.16, 12, 48), mat);
  const inner = new THREE.Mesh(new THREE.CircleGeometry(r * 0.8, 32), mat);
  inner.position.z = 0.01;
  g.add(ring, inner);
  return g;
}

export function initScene(canvas: HTMLCanvasElement): SceneBundle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0b12);
  scene.fog = new THREE.Fog(0x0b0b12, 14, 34);

  const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 6.2, 7.4);
  camera.lookAt(0, 0, 0);

  scene.environment = studioEnvironment(renderer);

  const key = new THREE.DirectionalLight(0xffeeda, 2.0);
  key.position.set(-5, 8, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x818cf8, 1.4);
  rim.position.set(3, 3, -6);
  scene.add(rim);
  const hemi = new THREE.HemisphereLight(0x2a3040, 0x090a0c, 0.5);
  scene.add(hemi);

  const mats = buildMaterials();

  // bench — black glass + indigo holographic pad
  const bench = new THREE.Mesh(new THREE.BoxGeometry(9, 0.35, 6), mats.blackGlass);
  bench.position.y = -0.6;
  bench.receiveShadow = true;
  scene.add(bench);
  const pad = new THREE.Mesh(new THREE.CircleGeometry(2.15, 64), mats.hologram);
  pad.rotation.x = -Math.PI / 2;
  pad.position.y = -0.415;
  scene.add(pad);
  for (let i = 0; i < 4; i++) {
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.55 + i * 0.42, 0.565 + i * 0.42, 90), mats.hologramRing);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.412;
    scene.add(ring);
  }

  // ambient data particles (4,348 policies) — always present, stream inward in phase 2
  const N = 900;
  const positions = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const th = Math.random() * Math.PI * 2;
    const r = 2.2 + Math.random() * 4.5;
    positions[i * 3] = Math.cos(th) * r;
    positions[i * 3 + 1] = Math.random() * 3.2 - 0.4;
    positions[i * 3 + 2] = Math.sin(th) * r;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(pGeo, mats.dataPoint);
  scene.add(particles);

  const phases: PhaseGroup[] = [buildConditions(mats), buildData(mats), buildMatcher(mats), buildVerdict(mats)];
  for (const p of phases) {
    scene.add(p);
    p.visible = false;
  }
  const verdictHero = phases[3]!.getObjectByName("sealHero") ?? null;

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.4, 0.6, 0.85);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // finale dissolve targets
  const keepers = new Set<THREE.Material>([mats.sealHero]);
  const fadeTargets: FadeTarget[] = [];
  const seen = new Set<THREE.Material>();
  scene.traverse((o) => {
    const mesh = o as THREE.Mesh;
    const mat = mesh.material as THREE.MeshStandardMaterial | undefined;
    if (!mat || seen.has(mat) || keepers.has(mat)) return;
    seen.add(mat);
    const phys = mat as unknown as THREE.MeshPhysicalMaterial;
    fadeTargets.push({
      mat,
      color: mat.color.clone(),
      emissiveIntensity: mat.emissiveIntensity ?? 1,
      envMapIntensity: mat.envMapIntensity ?? 1,
      opacity: (mat as unknown as THREE.MeshBasicMaterial).opacity,
      clearcoat: phys.clearcoat,
      transmission: phys.transmission,
    });
  });
  const baseBg = (scene.background as THREE.Color).clone();

  const render = () => composer.render();
  const resize = () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    composer.setSize(innerWidth, innerHeight);
  };
  const dispose = () => {
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
    });
    disposeMaterialSet(mats);
    pGeo.dispose();
    scene.environment?.dispose();
    composer.dispose();
    renderer.dispose();
  };

  return {
    scene, camera, renderer, composer, bloom, mats, phases,
    particles, particlesBase: positions, verdictHero,
    fadeTargets, baseBg, lights: { key, rim, hemi }, render, resize, dispose,
  };
}
