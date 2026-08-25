"use client";

import { useState, useMemo, useRef } from "react";
import type {
  PolicyResult,
  SearchProfile,
  SearchResponse,
} from "@policy-search/contracts";
import { SearchProfileForm } from "@/components/SearchProfileForm";
import { PolicyCard } from "@/components/PolicyCard";
import { Badge } from "@/components/Badge";
import { evaluatePolicies } from "@/lib/matcher";

// 전 연령대(20대 ~ 50대) 빠른 프로필 프리셋
const PRESETS: {
  label: string;
  ageTag: string;
  icon: string;
  profile: SearchProfile;
  desc: string;
}[] = [
  {
    label: "대학생 · 취준생",
    ageTag: "20대 청년",
    icon: "🎓",
    desc: "만 23세 서울 거주 대학생",
    profile: {
      birth_date: "2003-03-15",
      region: "서울특별시",
      employment_status: "대학생",
      income_bracket: "3000만원 이하",
      is_business_owner: false,
    },
  },
  {
    label: "사회초년생 직장인",
    ageTag: "20대 청년",
    icon: "💼",
    desc: "만 28세 경기 거주 재직자",
    profile: {
      birth_date: "1998-07-20",
      region: "경기도",
      employment_status: "재직중",
      income_bracket: "5000만원 이하",
      is_business_owner: false,
    },
  },
  {
    label: "청년 소상공인 · 대표",
    ageTag: "30대 청년",
    icon: "🏢",
    desc: "만 31세 음식점업 개인사업자",
    profile: {
      birth_date: "1995-11-05",
      region: "서울특별시",
      employment_status: "자영업",
      income_bracket: "5000만원 이하",
      is_business_owner: true,
      business_region: "서울특별시 마포구",
      industry: "음식점업",
      annual_revenue: 6500,
      employee_count: 2,
    },
  },
  {
    label: "초기 창업 준비자",
    ageTag: "20대 청년",
    icon: "🚀",
    desc: "만 26세 IT 예비창업자",
    profile: {
      birth_date: "2000-01-10",
      region: "대전광역시",
      employment_status: "미취업",
      income_bracket: "3000만원 이하",
      is_business_owner: true,
      business_region: "대전광역시 유성구",
      industry: "IT 소프트웨어 개발",
      annual_revenue: 0,
      employee_count: 0,
    },
  },
  {
    label: "40대 직장인 · 경력전환",
    ageTag: "40대 중장년",
    icon: "👔",
    desc: "만 44세 서울 거주 재직자",
    profile: {
      birth_date: "1982-05-12",
      region: "서울특별시",
      employment_status: "재직중",
      income_bracket: "5000만원 이하",
      is_business_owner: false,
    },
  },
  {
    label: "4050 중장년 소상공인",
    ageTag: "40~50대 소상공인",
    icon: "🏪",
    desc: "만 49세 경기 소매업 자영업자",
    profile: {
      birth_date: "1977-09-28",
      region: "경기도",
      employment_status: "자영업",
      income_bracket: "5000만원 이하",
      is_business_owner: true,
      business_region: "경기도 수원시",
      industry: "소매업",
      annual_revenue: 12000,
      employee_count: 3,
    },
  },
  {
    label: "50대 신중년 재취업",
    ageTag: "50대 신중년",
    icon: "🔄",
    desc: "만 54세 부산 거주 구직자",
    profile: {
      birth_date: "1972-04-18",
      region: "부산광역시",
      employment_status: "미취업",
      income_bracket: "3000만원 이하",
      is_business_owner: false,
    },
  },
  {
    label: "시니어 인생 2막 창업",
    ageTag: "50대 기술창업",
    icon: "💡",
    desc: "만 52세 인천 제조업 창업자",
    profile: {
      birth_date: "1974-12-03",
      region: "인천광역시",
      employment_status: "자영업",
      income_bracket: "5000만원 이하",
      is_business_owner: true,
      business_region: "인천광역시 남동구",
      industry: "제조업",
      annual_revenue: 0,
      employee_count: 1,
    },
  },
];

type FilterTab = "all" | "eligible" | "possible" | "individual" | "business";

export default function MainSearchApp() {
  const [results, setResults] = useState<PolicyResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<SearchProfile | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | null>(null);

  // Drag-to-Scroll & Navigation Ref
  const presetsScrollRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  function scrollPresets(direction: "left" | "right") {
    if (presetsScrollRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      presetsScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!presetsScrollRef.current) return;
    setIsMouseDown(true);
    setIsDragging(false);
    startXRef.current = e.pageX - presetsScrollRef.current.offsetLeft;
    scrollLeftRef.current = presetsScrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !presetsScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - presetsScrollRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    if (Math.abs(walk) > 6) {
      setIsDragging(true);
    }
    presetsScrollRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsMouseDown(false);
    setTimeout(() => setIsDragging(false), 50);
  };

  async function handleSearch(profile: SearchProfile) {
    setLoading(true);
    setError(null);
    setCurrentProfile(profile);

    // 1. Instant deterministic local evaluation (0ms latency, zero-fail guarantee)
    const localData = evaluatePolicies(profile);
    setResults(localData.results);
    setTotal(localData.total);
    setHasSearched(true);

    // 2. Seamlessly sync with backend API if online
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        const serverData = (await res.json()) as SearchResponse;
        if (serverData.results && serverData.results.length > 0) {
          setResults(serverData.results);
          setTotal(serverData.total);
        }
      }
    } catch {
      // Backend is offline — local evaluation results remain active
    } finally {
      setLoading(false);
    }
  }

  function applyPreset(preset: (typeof PRESETS)[number], index: number) {
    setSelectedPresetIndex(index);
    setCurrentProfile({ ...preset.profile });
    handleSearch(preset.profile);
  }

  // Filtered results based on Filter Tabs
  const filteredResults = useMemo(() => {
    if (activeTab === "all") return results;
    if (activeTab === "eligible") return results.filter((r) => r.status === "eligible");
    if (activeTab === "possible") return results.filter((r) => r.status === "possible");
    if (activeTab === "individual") return results.filter((r) => r.category === "individual" || r.category === "both");
    if (activeTab === "business") return results.filter((r) => r.category === "business" || r.category === "both");
    return results;
  }, [results, activeTab]);

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 dark:bg-[#0c0d0e] dark:text-neutral-100 selection:bg-brand-500/20">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/90 backdrop-blur-xl dark:border-neutral-800/80 dark:bg-neutral-900/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-md shadow-brand-500/25 font-black text-base">
              핏
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
                정책핏
              </span>
              <span className="ml-1.5 text-xs font-bold text-neutral-400">
                POLICYFIT
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        {/* Hero Banner — 100% Single Line Title & Legend */}
        <section className="mb-8">
          <div className="mb-2.5 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3.5 py-1 text-xs sm:text-sm font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
            <span>✨ 20대 청년부터 4050 중장년·소상공인 맞춤 지원</span>
          </div>

          <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
            {/* Main Title strictly on ONE single line */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-neutral-950 dark:text-white whitespace-nowrap">
              나에게 맞는 청년 · 소상공인 맞춤 정책 찾기
            </h1>

            {/* Tri-state Legend strictly on ONE single line */}
            <div className="flex items-center gap-2 text-sm whitespace-nowrap shrink-0">
              <span className="text-neutral-500 dark:text-neutral-400 font-bold mr-0.5 shrink-0">
                판정 기준:
              </span>
              <Badge state="eligible" />
              <Badge state="possible" />
              <Badge state="ineligible" />
            </div>
          </div>

          <p className="mt-2.5 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
            온통청년, 소상공인24, 기업마당 등 정부와 지자체 지원 정책을 한 번에 확인하고 내 자격 충족 여부를 안내해 드립니다.
          </p>

          {/* Quick Presets Carousel Slider (잡고 넘기기 + 우측 화살표 넘기기) */}
          <div className="mt-7 rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <span className="text-sm sm:text-base font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
                  원클릭 빠른 예시로 바로 확인하기
                </span>
                <span className="hidden sm:inline-block text-xs font-semibold text-neutral-400">
                  (카드를 잡고 드래그하거나 화살표를 눌러 넘기세요)
                </span>
              </div>

              {/* Slider Header Navigation Buttons */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 hidden md:inline">
                  오른쪽으로 넘겨서 40·50대 예시 보기 ➔
                </span>
                <button
                  type="button"
                  onClick={() => scrollPresets("left")}
                  aria-label="이전 예시 보기"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 font-bold transition-colors shadow-sm"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => scrollPresets("right")}
                  aria-label="다음 예시 보기"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300 dark:hover:bg-brand-900 font-extrabold transition-colors shadow-sm"
                >
                  ›
                </button>
              </div>
            </div>

            {/* Slider Container with Floating Side Arrow Buttons */}
            <div className="relative group/slider">
              {/* Left Floating Arrow Button */}
              <button
                type="button"
                onClick={() => scrollPresets("left")}
                aria-label="왼쪽으로 스크롤"
                className="absolute -left-3 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-neutral-800 shadow-md backdrop-blur transition-all hover:scale-110 hover:bg-white hover:text-brand-600 dark:border-neutral-700 dark:bg-neutral-800/95 dark:text-neutral-100 dark:hover:bg-neutral-800 hidden sm:flex"
              >
                <span className="text-xl font-black">‹</span>
              </button>

              {/* Right Floating Arrow Button */}
              <button
                type="button"
                onClick={() => scrollPresets("right")}
                aria-label="오른쪽으로 스크롤"
                className="absolute -right-3 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-neutral-800 shadow-md backdrop-blur transition-all hover:scale-110 hover:bg-white hover:text-brand-600 dark:border-neutral-700 dark:bg-neutral-800/95 dark:text-neutral-100 dark:hover:bg-neutral-800 hidden sm:flex"
              >
                <span className="text-xl font-black">›</span>
              </button>

              {/* Horizontal Drag-to-Scroll Area */}
              <div
                ref={presetsScrollRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                className={`flex gap-3.5 overflow-x-auto pb-2 pt-1 select-none scroll-smooth snap-x snap-mandatory focus:outline-none ${
                  isMouseDown ? "cursor-grabbing" : "cursor-grab"
                }`}
                tabIndex={0}
                role="region"
                aria-label="연령별 프로필 예시 슬라이더"
              >
                {PRESETS.map((p, idx) => {
                  const isSelected = selectedPresetIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (!isDragging) applyPreset(p, idx);
                      }}
                      className={[
                        "group relative flex min-w-[250px] sm:min-w-[270px] shrink-0 snap-start flex-col items-start rounded-xl border p-4 text-left transition-all duration-200",
                        isSelected
                          ? "border-brand-500 bg-brand-50/40 shadow-md ring-2 ring-brand-500/20 dark:border-brand-400 dark:bg-brand-950/30"
                          : "border-neutral-200 bg-neutral-50/60 hover:border-brand-400 hover:bg-white hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/60 dark:hover:border-brand-400 dark:hover:bg-neutral-900",
                      ].join(" ")}
                    >
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{p.icon}</span>
                          <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-extrabold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                            {p.ageTag}
                          </span>
                        </div>
                        <span
                          className={[
                            "text-xs font-extrabold transition-opacity",
                            isSelected
                              ? "text-brand-700 dark:text-brand-300"
                              : "text-brand-600 opacity-80 group-hover:opacity-100 dark:text-brand-400",
                          ].join(" ")}
                        >
                          {isSelected ? "선택됨 ✓" : "적용 ↗"}
                        </span>
                      </div>
                      <span className="mt-2 text-base font-extrabold text-neutral-900 dark:text-neutral-100">
                        {p.label}
                      </span>
                      <span className="mt-1 text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        {p.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Profile Input & Results */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left: Input Form Card (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-20 rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
              <SearchProfileForm
                initialProfile={currentProfile}
                onSubmit={handleSearch}
                loading={loading}
              />
            </div>
          </div>

          {/* Right: Results Canvas & Filters (7 cols) */}
          <div className="lg:col-span-7">
            {/* Filter Tabs Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200/80 pb-4 dark:border-neutral-800">
              <div className="flex flex-wrap items-center gap-2">
                <TabButton
                  active={activeTab === "all"}
                  onClick={() => setActiveTab("all")}
                  label={`전체 (${total})`}
                />
                <TabButton
                  active={activeTab === "eligible"}
                  onClick={() => setActiveTab("eligible")}
                  label="✓ 지원 가능"
                />
                <TabButton
                  active={activeTab === "possible"}
                  onClick={() => setActiveTab("possible")}
                  label="? 가능성 있음"
                />
                <TabButton
                  active={activeTab === "individual"}
                  onClick={() => setActiveTab("individual")}
                  label="개인 복지·일자리"
                />
                <TabButton
                  active={activeTab === "business"}
                  onClick={() => setActiveTab("business")}
                  label="소상공인·사업체"
                />
              </div>

              {hasSearched && (
                <span className="text-sm font-bold text-neutral-600 dark:text-neutral-400">
                  {filteredResults.length}건 표시 중
                </span>
              )}
            </div>

            {/* Content Results */}
            <div className="mt-6 space-y-4" aria-live="polite" aria-busy={loading}>
              {error && (
                <div className="rounded-2xl border border-ineligible-border bg-ineligible-bg p-6 text-sm sm:text-base text-ineligible-text shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold flex items-center gap-2 text-lg">
                        <span>⚠️</span>
                        <span>검색 요청을 처리하지 못했습니다</span>
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed">{error}</p>
                    </div>
                    {currentProfile && (
                      <button
                        type="button"
                        onClick={() => handleSearch(currentProfile)}
                        className="shrink-0 rounded-xl bg-white px-4 py-2 text-sm font-bold text-ineligible-text ring-1 ring-inset ring-ineligible-border hover:bg-neutral-50"
                      >
                        다시 시도
                      </button>
                    )}
                  </div>
                </div>
              )}

              {!hasSearched && !loading && (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-white/70 p-12 text-center dark:border-neutral-700 dark:bg-neutral-900/50">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-3xl text-brand-600 dark:bg-brand-950 dark:text-brand-300">
                    💡
                  </div>
                  <h3 className="mt-4 text-lg font-extrabold text-neutral-900 dark:text-neutral-100">
                    조건을 입력하거나 상단의 빠른 예시를 눌러보세요
                  </h3>
                  <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
                    생년월일과 거주지를 바탕으로 20대 청년부터 4050 중장년까지 지원 가능 여부와 혜택을 실시간으로 확인해 드립니다.
                  </p>
                </div>
              )}

              {hasSearched && !loading && filteredResults.length === 0 && !error && (
                <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
                  <p className="text-4xl mb-3" aria-hidden="true">🔍</p>
                  <h3 className="text-lg font-extrabold text-neutral-900 dark:text-neutral-100">
                    해당 조건에 부합하는 정책이 없습니다
                  </h3>
                  <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
                    상단 탭을 &apos;전체&apos;로 변경하거나 조건을 넓혀서 다시 검색해 보세요.
                  </p>
                </div>
              )}

              {filteredResults.length > 0 && (
                <div className="space-y-4">
                  {filteredResults.map((result) => (
                    <PolicyCard key={result.result_id} result={result} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-neutral-200/80 bg-white py-8 text-center text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-bold text-neutral-800 dark:text-neutral-200 text-base">
            <span>정책핏 (PolicyFit)</span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium">
            온통청년 · 소상공인24 · 기업마당 공공 정책 데이터 연동
          </p>
        </div>
      </footer>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-xl px-4 py-2 text-sm font-bold transition-all whitespace-nowrap",
        active
          ? "bg-brand-600 text-white shadow-sm shadow-brand-500/25"
          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200/80 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
