import * as THREE from "three";
import type { SceneBundle } from "./scene";
import type { PartEntry } from "./parts";

export interface PhaseMeta {
  numeral: string;
  title: string;
  caption: string;
  stat: { k: string; v: string };
  annotations: { x: number; y: number; label: string; detail: string }[];
}

export const PHASES: PhaseMeta[] = [
  {
    numeral: "01", title: "조건",
    caption: "생년월일, 거주지, 고용 상태, 소득 구간 — 네 개의 조각이 당신을 이룹니다.",
    stat: { k: "입력 조건", v: "4" },
    annotations: [{ x: 20, y: 58, label: "조건 칩", detail: "모르는 항목은 비워 두셔도 괜찮습니다" },
      { x: 66, y: 42, label: "유리 필터", detail: "누락된 조건은 '가능성 있음' 판정으로 이어집니다" }],
  },
  {
    numeral: "02", title: "데이터",
    caption: "4,348건의 청년·소상공인 정책이 하나의 색인으로 모입니다.",
    stat: { k: "수집 정책", v: "4,348" },
    annotations: [{ x: 22, y: 60, label: "정책 카탈로그", detail: "9개 출처 기관의 통합 색인" },
      { x: 64, y: 40, label: "데이터 파티클", detail: "전국 지원사업의 실시간 스냅샷" }],
  },
  {
    numeral: "03", title: "매칭",
    caption: "조건이 링을 통과할 때마다 정책의 폭이 좁아집니다.",
    stat: { k: "필터 단계", v: "3" },
    annotations: [{ x: 24, y: 58, label: "필터 링", detail: "지역 → 나이·소득 → 고용 상태" },
      { x: 66, y: 40, label: "스냅", detail: "조건 칩이 링에 맞물리는 순간" }],
  },
  {
    numeral: "04", title: "판정",
    caption: "세 가지 답이 인장처럼 찍힙니다 — 지원 가능, 가능성 있음, 지원 불가.",
    stat: { k: "판정 종류", v: "3" },
    annotations: [{ x: 24, y: 56, label: "판정 인장", detail: "색이 아니라 문구로도 읽힙니다" },
      { x: 66, y: 42, label: "완전한 답", detail: "조건이 충분하면 '지원 가능'이 점화됩니다" }],
  },
];

const easeOutBack = (t: number) => {
  const c1 = 1.24, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const CAM: { pos: THREE.Vector3; look: THREE.Vector3 }[] = [
  { pos: new THREE.Vector3(0, 6.2, 7.4), look: new THREE.Vector3(0, 0, 0) },
  { pos: new THREE.Vector3(2.2, 4.4, 4.6), look: new THREE.Vector3(0, 0.4, 0) },
  { pos: new THREE.Vector3(-1.8, 4.4, 3.8), look: new THREE.Vector3(0, 0.6, 0) },
  { pos: new THREE.Vector3(-1.0, 3.6, 2.8), look: new THREE.Vector3(0, 0.75, 0) },
  { pos: new THREE.Vector3(0.0, 3.2, 4.4), look: new THREE.Vector3(0, 0.95, 0) },
  { pos: new THREE.Vector3(0.0, 4.6, 4.2), look: new THREE.Vector3(0, 1.0, 0) },
];

const BLACK = new THREE.Color(0x000000);

export class Timeline {
  private scene: SceneBundle;
  private progress = 0; // 0..5 (4 phases + finale)
  private raf = 0;
  private lastT = performance.now();
  private spinPhase = 0;
  private heroEl: HTMLElement;
  private finaleEl: HTMLElement;
  private indicatorEl: HTMLElement;
  private railNum: HTMLElement;
  private railTitle: HTMLElement;
  private railCaption: HTMLElement;
  private statK: HTMLElement;
  private statV: HTMLElement;
  private pillEl: HTMLElement;
  private hintEl: HTMLElement;
  private legendEl: HTMLElement;
  private annoLayer: HTMLElement;
  private annos: HTMLElement[] = [];
  private disposed = false;
  private reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  private mobile = matchMedia("(max-width: 860px)").matches;
  private pointers: { x: number; y: number } = { x: 0, y: 0 };
  private parallax = new THREE.Vector2(0, 0);
  private paused = false;
  private past = false;

  constructor(scene: SceneBundle) {
    this.scene = scene;
    const el = (id: string) => document.getElementById(id)!;
    this.heroEl = el("pf-hero");
    this.finaleEl = el("pf-finale");
    this.indicatorEl = el("pf-phase");
    this.railNum = el("pf-rail-num");
    this.railTitle = el("pf-rail-title");
    this.railCaption = el("pf-rail-caption");
    this.statK = el("pf-stat-k");
    this.statV = el("pf-stat-v");
    this.pillEl = el("pf-pill");
    this.hintEl = el("pf-hint");
    this.legendEl = el("pf-legend");
    this.annoLayer = document.createElement("div");
    document.body.appendChild(this.annoLayer);

    this.buildAnnotations();
    if (this.mobile) this.scene.scene.scale.setScalar(0.8);
    this.pillEl.addEventListener("click", this.jumpNext);
    addEventListener("scroll", this.onScroll, { passive: true });
    addEventListener("resize", this.onResize);
    addEventListener("pointermove", this.onPointerMove, { passive: true });
    this.onScroll();
    this.loop();
    this.exposeApi();
  }

  private journeyEnd(): number {
    const formTop = (document.getElementById("pf-form-section") as HTMLElement).offsetTop;
    return Math.max(1, formTop - innerHeight);
  }

  private onScroll = () => {
    this.progress = clamp01(scrollY / this.journeyEnd()) * 5;
    // past the journey, the app section owns the viewport — hide all fixed chrome
    this.past = scrollY > this.journeyEnd() + innerHeight * 0.25;
    for (const id of ["pf-chrome", "pf-rail", "pf-pill", "pf-hint", "pf-hero"]) {
      const elx = document.getElementById(id);
      if (!elx) continue;
      if (this.past) {
        elx.style.opacity = "0";
        elx.style.pointerEvents = "none";
      } else if (id !== "pf-hero" && id !== "pf-hint") {
        // hero/hint opacity is owned by the per-frame update(); restore the rest
        elx.style.opacity = "";
        elx.style.pointerEvents = "";
      }
    }
  };

  private onResize = () => {
    this.scene.resize();
    this.mobile = matchMedia("(max-width: 860px)").matches;
    this.onScroll();
  };

  private onPointerMove = (e: PointerEvent) => {
    this.pointers.x = (e.clientX / innerWidth) * 2 - 1;
    this.pointers.y = (e.clientY / innerHeight) * 2 - 1;
  };

  private jumpNext = () => {
    const s = this.progress;
    const next = Math.min(5, Math.floor(s + 0.999) + 1);
    const target = next >= 5 ? document.getElementById("pf-form-section")!.offsetTop - innerHeight * 0.4 : (next / 5) * this.journeyEnd();
    scrollTo({ top: target, behavior: this.reduced ? "auto" : "smooth" });
  };

  private buildAnnotations() {
    for (const p of PHASES) {
      for (const a of p.annotations) {
        const btn = document.createElement("button");
        btn.className = "pf-anno";
        btn.innerHTML = `${a.label}<span class="pf-anno-sub">&nbsp;— ${a.detail}</span>`;
        btn.style.left = `${a.x}%`;
        btn.style.top = `${a.y}%`;
        btn.style.display = "none";
        btn.setAttribute("aria-label", `${a.label}: ${a.detail}`);
        this.annoLayer.appendChild(btn);
        this.annos.push(btn);

        const chip = document.createElement("span");
        chip.className = "pf-chip";
        chip.textContent = a.label;
        this.legendEl.appendChild(chip);
      }
    }
  }

  private loop = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.lastT) / 1000);
    this.lastT = now;
    if (this.paused) return;
    this.update(dt);
    this.scene.render();
  };

  private seatPart(p: PartEntry, t: number) {
    const e = this.reduced ? t : easeOutBack(t);
    p.obj.position.set(
      lerp(p.seat.x + p.scatter.x + p.lift.x, p.seat.x, e),
      lerp(p.seat.y + p.scatter.y + p.lift.y, p.seat.y, e),
      lerp(p.seat.z + p.scatter.z + p.lift.z, p.seat.z, e),
    );
    const so = 1 - t;
    p.obj.rotation.set(p.seatRot.x + p.spin.x * so, p.seatRot.y + p.spin.y * so, p.seatRot.z + p.spin.z * so);
  }

  private update(dt: number) {
    const s = this.progress;

    // phases
    this.scene.phases.forEach((phase, i) => {
      const local = clamp01(s - i - 0.45);
      phase.visible = s > i + 0.25 && s < 5.4;
      const parts = phase.userData.parts;
      parts.forEach((p, idx) => {
        const t0 = (idx / Math.max(1, parts.length)) * 0.5;
        const t = this.reduced ? (local > t0 + 0.3 ? 1 : 0) : clamp01((local - t0) / 0.3);
        this.seatPart(p, t);
        p.obj.visible = t > 0.001;
      });
      // gentle idle rotation of seated assemblies
      if (local >= 1 && !this.reduced) {
        phase.rotation.y = Math.sin(this.spinPhase * 0.4 + i) * 0.04;
      }
    });
    this.spinPhase += dt;

    // particles stream inward during phase 2 (data)
    const pull = clamp01((s - 1.4) / 1.0) * (1 - clamp01((s - 2.8) / 0.6));
    const pos = this.scene.particles.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    const base = this.scene.particlesBase;
    for (let i = 0; i < arr.length; i += 3) {
      const bx = base[i]!, by = base[i + 1]!, bz = base[i + 2]!;
      const cx = bx * 0.45, cz = bz * 0.45, cy = 0.6 + (by + 0.4) * 0.3;
      arr[i] = lerp(bx, cx, pull);
      arr[i + 1] = lerp(by, cy, pull);
      arr[i + 2] = lerp(bz, cz, pull);
    }
    pos.needsUpdate = true;
    (this.scene.particles.material as THREE.PointsMaterial).opacity = 0.85 * (1 - clamp01((s - 4.4) / 0.5));

    // finale (≈4.55..5): everything dissolves; the eligible seal stays lit
    const fin = clamp01((s - 4.55) / 0.42);
    for (const ft of this.scene.fadeTargets) {
      ft.mat.color.copy(ft.color).lerp(BLACK, fin);
      ft.mat.emissiveIntensity = ft.emissiveIntensity * (1 - fin);
      ft.mat.envMapIntensity = ft.envMapIntensity * (1 - fin * 0.97);
      if (ft.opacity !== undefined && ft.mat.transparent) {
        ft.mat.opacity = ft.opacity * (1 - fin);
      }
      if (ft.clearcoat !== undefined) {
        (ft.mat as unknown as THREE.MeshPhysicalMaterial).clearcoat = ft.clearcoat * (1 - fin);
      }
      if (ft.transmission !== undefined && ft.transmission > 0) {
        (ft.mat as unknown as THREE.MeshPhysicalMaterial).transmission = ft.transmission * (1 - fin);
      }
    }
    const bg = this.scene.scene.background as THREE.Color;
    bg.copy(this.scene.baseBg).lerp(BLACK, fin);
    if (this.scene.scene.fog) (this.scene.scene.fog as THREE.Fog).color.copy(bg);
    this.scene.lights.key.intensity = 2.0 * (1 - fin);
    this.scene.lights.rim.intensity = 1.4 * (1 - fin);
    this.scene.lights.hemi.intensity = 0.5 * (1 - fin);
    this.scene.bloom.strength = lerp(0.4, 0.9, fin);
    // the assembled machine fills the frame in late phases — pull exposure down there
    const closeup = clamp01((s - 3.3) / 0.7);
    this.scene.renderer.toneMappingExposure = lerp(1.04, 0.86, closeup);
    if (this.scene.verdictHero) {
      // slow sovereign rotation once lit
      if (!this.reduced) this.scene.verdictHero.rotation.z += dt * 0.12 * fin;
    }

    // camera
    const i = Math.min(4, Math.floor(s));
    const f = s - i;
    const a = CAM[i]!, b = CAM[Math.min(5, i + 1)]!;
    const posV = a.pos.clone().lerp(b.pos, easeInOut(f));
    const look = a.look.clone().lerp(b.look, easeInOut(f));
    const par = 1 - fin;
    this.parallax.lerp(new THREE.Vector2(this.pointers.x * 0.5 * par, this.pointers.y * 0.3 * par), 0.04);
    posV.x += this.parallax.x;
    posV.y -= this.parallax.y;
    this.scene.camera.position.copy(posV);
    this.scene.camera.lookAt(look);

    // DOM
    const phaseIdx = Math.min(3, Math.max(0, Math.round(s) - 1));
    const meta = PHASES[phaseIdx]!;

    if (s < 0.55) {
      this.heroEl.style.opacity = "1";
      this.indicatorEl.textContent = "00 · 시작";
      this.hintEl.style.opacity = "1";
    } else {
      this.heroEl.style.opacity = String(Math.max(0, 1 - (s - 0.55) * 2.2));
      this.hintEl.style.opacity = String(Math.max(0, 1 - (s - 0.4) * 3));
    }

    if (this.past) {
      this.finaleEl.style.opacity = "0";
    } else if (s >= 4.55) {
      this.finaleEl.style.opacity = String(clamp01((s - 4.72) / 0.26));
      this.indicatorEl.textContent = "05 · 판정 완료";
      this.railNum.textContent = "05";
      this.railTitle.textContent = "지원 가능";
      this.railCaption.textContent = "조건이 모두 맞물린 순간, 답이 점화됩니다.";
    } else if (s >= 1) {
      this.finaleEl.style.opacity = "0";
      this.indicatorEl.textContent = `${meta.numeral} · ${meta.title}`;
      this.railNum.textContent = meta.numeral;
      this.railTitle.textContent = meta.title;
      this.railCaption.textContent = meta.caption;
    }

    if (s >= 1 && s < 4.55) {
      this.statK.textContent = meta.stat.k;
      this.statV.textContent = meta.stat.v;
    } else if (s >= 4.55) {
      this.statK.textContent = "남은 것";
      this.statV.textContent = "하나의 답";
    }

    this.annos.forEach((el, idx) => {
      const owner = Math.floor(idx / 2);
      const active = phaseIdx === owner && s >= 1 && s < 4.5;
      el.style.display = active && !this.mobile ? "flex" : "none";
    });
    this.legendEl.style.display = this.mobile && s >= 1 && s < 4.5 ? "flex" : "none";

    if (s < 3.5) {
      this.pillEl.textContent = `다음 — ${PHASES[Math.min(3, Math.floor(s + 0.999))]!.title} ↓`;
    } else if (s < 4.6) {
      this.pillEl.textContent = "다음 — 판정 ↓";
    } else {
      this.pillEl.textContent = "다음 — 검색하기 ↓";
    }
  }

  private exposeApi() {
    (window as any).__pf = {
      step: (p: number) => {
        this.progress = Math.max(0, Math.min(5, p));
        this.update(1 / 60);
        this.scene.render();
        return this.progress;
      },
      setProgress: (p: number) => { this.progress = Math.max(0, Math.min(5, p)); },
      pause: () => { this.paused = true; },
      resume: () => { this.paused = false; },
      sample: () => {
        const gl = this.scene.renderer.getContext();
        const w = gl.drawingBufferWidth, h = gl.drawingBufferHeight;
        const px = new Uint8Array(w * h * 4);
        gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
        return { width: w, height: h, pixels: px };
      },
      meta: () => ({ progress: this.progress, phases: PHASES.length }),
    };
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    removeEventListener("scroll", this.onScroll);
    removeEventListener("resize", this.onResize);
    removeEventListener("pointermove", this.onPointerMove);
    this.pillEl.removeEventListener("click", this.jumpNext);
    this.annoLayer.remove();
    delete (window as any).__pf;
  }
}
