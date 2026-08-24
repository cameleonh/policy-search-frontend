"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type {
  PolicyResult,
  SearchProfile,
  SearchResponse,
} from "@policy-search/contracts";
import { SearchProfileForm } from "@/components/SearchProfileForm";
import { PolicyCard } from "@/components/PolicyCard";

/**
 * PolicyFit — 정책핏 scrollytelling landing.
 * Layout of scroll space: 0..1 hero hold · 1..5 four phases · 4.55..5 finale
 * ("지원 가능" ignition) · then the real search form. Canvas is fixed behind.
 */
export default function PolicyFitLanding({ children }: { children?: ReactNode }) {
  const glHost = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let timeline: import("@/lib/scrolly/timeline").Timeline | null = null;
    let scene: import("@/lib/scrolly/scene").SceneBundle | null = null;
    let disposed = false;
    (async () => {
      const [{ initScene }, { Timeline }] = await Promise.all([
        import("@/lib/scrolly/scene"),
        import("@/lib/scrolly/timeline"),
      ]);
      if (disposed || !glHost.current) return;
      scene = initScene(glHost.current);
      timeline = new Timeline(scene);
      setReady(true);
    })();
    return () => {
      disposed = true;
      timeline?.dispose();
      scene?.dispose();
    };
  }, []);

  return (
    <>
      <canvas
        id="pf-gl"
        ref={glHost}
        role="img"
        aria-label="조건 조각이 모여 판정 인장이 완성되는 3D 여정: 조건, 데이터, 매칭, 판정"
      />
      <div id="pf-dof" />
      <div id="pf-vignette" />

      <header id="pf-chrome">
        <a className="pf-wordmark" href="#top">정책핏<span className="pf-wordmark-en">POLICYFIT</span></a>
        <nav className="pf-micro">
          <span id="pf-phase" aria-live="polite">00 · 시작</span>
          <a href="#pf-form-section">검색하기</a>
        </nav>
      </header>

      <section id="pf-hero" aria-label="정책핏 소개">
        <p className="pf-kicker pf-micro">청년 · 소상공인 통합 정책 검색</p>
        <div className="pf-title">
          <span className="pf-title-line">네 조건이</span>
          <span className="pf-title-line pf-title-glow">곧 정책입니다</span>
        </div>
        <h1 className="pf-sr-only">정책핏 — 나에게 맞는 정책을 한 번에 찾아보세요</h1>
        <p className="pf-sub pf-micro">조건을 맞추면, 답이 보입니다</p>
      </section>

      <aside id="pf-rail" aria-hidden={false}>
        <div className="pf-rail-num" id="pf-rail-num">01</div>
        <div className="pf-rail-copy">
          <div className="pf-rail-title pf-micro" id="pf-rail-title">조건</div>
          <div className="pf-rail-caption" id="pf-rail-caption">
            생년월일, 거주지, 고용 상태, 소득 구간 — 네 개의 조각이 당신을 이룹니다.
          </div>
          <div className="pf-spec">
            <span className="pf-micro" id="pf-stat-k">입력 조건</span>
            <span id="pf-stat-v">4</span>
          </div>
        </div>
      </aside>

      <div id="pf-hint" className="pf-micro">스크롤해서 조립하기</div>
      <button id="pf-pill" className="pf-micro">다음 — 조건 ↓</button>
      <div id="pf-legend" className="pf-micro" />

      <section id="pf-finale" aria-label="판정 완료">
        <p className="pf-finale-seal">지원 가능</p>
        <p className="pf-finale-caption">
          조건이 모두 맞물린 순간, 답이 점화됩니다.
        </p>
      </section>

      <div style={{ height: "620vh" }} aria-hidden="true" id="pf-scroll-space" />

      <div id="pf-form-section">{children ?? <SearchSection />}</div>
    </>
  );
}

/** Default: the real search experience mounts where the journey ends. */
function SearchSection() {
  const [results, setResults] = useState<PolicyResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSearch(profile: SearchProfile) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error(`검색 실패: ${res.status}`);
      const data = (await res.json()) as SearchResponse;
      setResults(data.results);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "검색 중 오류가 발생했습니다.");
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  }

  return (
    <main className="pf-app mx-auto max-w-3xl px-6 py-20">
      <header className="mb-10 space-y-4">
        <p className="text-sm font-medium uppercase tracking-wider text-brand-600 dark:text-brand-400">
          정책핏 · 통합 정책 검색
        </p>
        <h2 className="text-4xl font-bold leading-tight tracking-tight text-neutral-900 dark:text-neutral-50">
          나에게 맞는 정책을
          <br />
          한 번에 찾아보세요
        </h2>
        <p className="max-w-xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
          청년 개인 지원과 소상공인 사업체 지원을 한 화면에서 검색합니다. 모르는
          항목은 비워두셔도 괜찮습니다.
        </p>
      </header>

      <SearchProfileForm onSubmit={handleSearch} loading={loading} />

      <section className="mt-10" aria-live="polite" aria-busy={loading}>
        {error && (
          <p className="rounded-lg bg-ineligible-bg p-3 text-sm text-ineligible-text ring-1 ring-inset ring-ineligible-border">
            {error}
          </p>
        )}
        {hasSearched && !loading && results.length === 0 && !error && (
          <p className="text-neutral-500 dark:text-neutral-400">
            검색 결과가 없습니다. 다른 조건으로 다시 시도해 보세요.
          </p>
        )}
        {results.length > 0 && (
          <>
            <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
              총 <span className="font-semibold text-neutral-900 dark:text-neutral-100">{total}</span>건
            </p>
            <div className="space-y-4">
              {results.map((result) => (
                <PolicyCard key={result.result_id} result={result} />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
