import * as THREE from "three";

/** Tag an object as an animatable assembly part; captures its seated pose. */
export interface PartEntry {
  obj: THREE.Object3D;
  lift: THREE.Vector3;
  scatter: THREE.Vector3;
  spin: THREE.Euler;
  seat: THREE.Vector3;
  seatRot: THREE.Euler;
}

export function part(
  obj: THREE.Object3D,
  lift: [number, number, number],
  scatter: [number, number, number],
  spin: [number, number, number] = [0, 0, 0],
): THREE.Object3D {
  (obj as any).__part = {
    obj,
    lift: new THREE.Vector3(...lift),
    scatter: new THREE.Vector3(...scatter),
    spin: new THREE.Euler(...spin),
    seat: obj.position.clone(),
    seatRot: obj.rotation.clone(),
  } satisfies PartEntry;
  return obj;
}

export interface PhaseGroup extends THREE.Group {
  userData: { parts: PartEntry[]; label: string };
}

export function collectParts(group: THREE.Group, label: string): PhaseGroup {
  const parts: PartEntry[] = [];
  group.traverse((o) => {
    if ((o as any).__part) parts.push((o as any).__part);
  });
  (group as PhaseGroup).userData = { parts, label };
  return group as PhaseGroup;
}

/** Frosted-glass condition chip with indigo edge and engraved glyph plate. */
export function conditionChip(mats: ReturnType<typeof import("./materials").buildMaterials>, label: string): THREE.Group {
  const g = new THREE.Group();
  const w = 0.52 + Math.min(0.28, label.length * 0.03);
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, 0.34), mats.chipGlass);
  const edge = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, 0.03, 0.36), mats.chipEdge);
  edge.position.y = 0.02;
  const capL = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.4, 12), mats.chipEdge);
  capL.rotation.x = Math.PI / 2;
  const capR = capL.clone();
  capR.position.x = w / 2 - 0.06;
  capL.position.x = -w / 2 + 0.06;
  g.add(body, edge, capL, capR);
  g.userData.label = label;
  return g;
}

/** A thin catalog plate (policy dataset slab). */
export function dataPlate(mats: ReturnType<typeof import("./materials").buildMaterials>, i: number): THREE.Mesh {
  const geo = new THREE.BoxGeometry(0.6, 0.02, 0.38);
  const mesh = new THREE.Mesh(geo, mats.plate);
  mesh.rotation.z = (i % 5) * 0.04;
  return mesh;
}
