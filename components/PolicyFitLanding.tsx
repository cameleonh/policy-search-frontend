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
  const [lastProfile, setLastProfile] = useState<SearchProfile | null>(null);

  async function handleSearch(profile: SearchProfile) {
    setLoading(true);
    setError(null);
    setLastProfile(profile);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error(`검색 서버 오류 (상태 코드: ${res.status})`);
      const data = (await res.json()) as SearchResponse;
      setResults(data.results);
      setTotal(data.total);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "정책 정보를 검색하는 도중 네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
      );
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
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          정책핏 (PolicyFit) · 통합 정책 맞춤 검색
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-neutral-900 dark:text-neutral-50">
          나에게 맞는 청년·소상공인 정책을
          <br />
          한눈에 확인하세요
        </h2>
        <p className="max-w-xl text-base sm:text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
          청년 개인 지원과 소상공인 사업체 지원을 한 번에 맞춤 검색합니다. 확인하기 어려운
          항목은 비워두셔도 지원 가능성을 함께 찾아드립니다.
        </p>
      </header>

      <SearchProfileForm onSubmit={handleSearch} loading={loading} />

      <section className="mt-12" aria-live="polite" aria-busy={loading}>
        {error && (
          <div className="rounded-xl border border-ineligible-border bg-ineligible-bg p-5 text-sm text-ineligible-text shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold flex items-center gap-1.5 text-base">
                  <span aria-hidden="true">⚠️</span>
                  <span>검색 요청을 처리하지 못했습니다</span>
                </p>
                <p className="mt-1 text-xs leading-relaxed">{error}</p>
              </div>
              {lastProfile && (
                <button
                  type="button"
                  onClick={() => handleSearch(lastProfile)}
                  className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-ineligible-text ring-1 ring-inset ring-ineligible-border hover:bg-neutral-50"
                >
                  다시 시도
                </button>
              )}
            </div>
          </div>
        )}

        {hasSearched && !loading && results.length === 0 && !error && (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-8 text-center dark:border-neutral-800 dark:bg-neutral-900/40">
            <p className="text-2xl mb-2" aria-hidden="true">🔍</p>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              조건에 딱 맞는 정책을 찾지 못했습니다
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
              거주 지역을 &apos;전국&apos;으로 변경하거나, 연소득 및 취업 상태 조건을 &apos;선택 안함&apos;으로 넓혀서 다시 검색해 보세요.
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div>
            <div className="mb-4 flex items-center justify-between border-b border-neutral-200 pb-3 dark:border-neutral-800">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                맞춤 판정 결과 총 <strong className="font-bold text-neutral-900 dark:text-neutral-100">{total}</strong>건
              </p>
              <span className="text-xs text-neutral-400">지원 가능 항목 우선 정렬</span>
            </div>
            <div className="space-y-4">
              {results.map((result) => (
                <PolicyCard key={result.result_id} result={result} />
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

