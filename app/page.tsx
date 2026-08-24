"use client";

import { useState } from "react";
import type {
  PolicyResult,
  SearchProfile,
  SearchResponse,
} from "@policy-search/contracts";
import { SearchProfileForm } from "@/components/SearchProfileForm";
import { PolicyCard } from "@/components/PolicyCard";

export default function HomePage() {
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
    <main className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-10 space-y-4">
        <p className="text-sm font-medium uppercase tracking-wider text-brand-600 dark:text-brand-400">
          통합 정책 검색
        </p>
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-5xl dark:text-neutral-50">
          나에게 맞는 정책을
          <br />
          한 번에 찾아보세요
        </h1>
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
