"use client";

import { useState } from "react";
import type { PolicyDetail, PolicyResult } from "@policy-search/contracts";
import { Badge } from "./Badge";

const CATEGORY_LABEL: Record<string, string> = {
  individual: "청년 개인",
  business: "소상공인 사업체",
  both: "청년·사업체 통합",
};

interface PolicyCardProps {
  result: PolicyResult;
}

export function PolicyCard({ result }: PolicyCardProps) {
  const {
    policy_version_id,
    policy_title,
    category,
    status,
    agency,
    reasons,
    missing_info,
    benefits,
    application_deadline,
    announcement_url,
    evidence,
  } = result;

  const [detail, setDetail] = useState<PolicyDetail | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const deadlineImminent = isDeadlineImminent(application_deadline);

  async function toggleDetail() {
    const next = !open;
    setOpen(next);
    if (next && !detail && !loading) {
      setLoading(true);
      try {
        const res = await fetch(`/api/policies/${policy_version_id}`);
        if (res.ok) setDetail((await res.json()) as PolicyDetail);
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <article className="group overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-sm transition-all duration-200 hover:border-brand-400/50 hover:shadow-md hover:shadow-brand-500/5 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-brand-500/40">
      {/* Top Header Card Action */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-lg bg-neutral-100 px-3 py-1 text-xs sm:text-sm font-bold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                {CATEGORY_LABEL[category] ?? category}
              </span>
              {result.topic && (
                <span className="inline-flex items-center rounded-lg bg-brand-50 px-3 py-1 text-xs sm:text-sm font-bold text-brand-700 dark:bg-brand-950/70 dark:text-brand-300">
                  {result.topic}
                </span>
              )}
              {agency && (
                <span className="text-xs sm:text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  {agency}
                </span>
              )}
            </div>

            <h3 className="mt-3 text-xl font-extrabold leading-snug tracking-tight text-neutral-900 dark:text-neutral-50 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors sm:text-2xl">
              {policy_title}
            </h3>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Badge state={status} />
          </div>
        </div>

        {/* Benefits Highlight Box */}
        {benefits.length > 0 && (
          <div className="mt-4 rounded-xl border border-brand-100/90 bg-brand-50/50 px-4 py-3 text-sm sm:text-base dark:border-brand-900/50 dark:bg-brand-950/30">
            <div className="flex items-start gap-2.5">
              <span className="text-brand-600 dark:text-brand-400 font-bold text-base">🎁</span>
              <div className="font-medium text-neutral-900 dark:text-neutral-100">
                <span className="font-bold text-brand-700 dark:text-brand-300">핵심 혜택: </span>
                <span>{benefits.join(", ")}</span>
              </div>
            </div>
          </div>
        )}

        {/* Reasons & Requirements Badges */}
        {reasons.length > 0 && (
          <div className="mt-4">
            <ul className="flex flex-wrap gap-2" aria-label="판정 충족 조건">
              {compactReasons(reasons).map((reason, i) => {
                const isSatisfied = reason.includes("충족");
                return (
                  <li
                    key={i}
                    className={[
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs sm:text-sm font-medium",
                      isSatisfied
                        ? "bg-eligible-bg text-eligible-text ring-1 ring-inset ring-eligible-border"
                        : "bg-neutral-100 text-neutral-600 ring-1 ring-inset ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700",
                    ].join(" ")}
                  >
                    <span aria-hidden="true" className="font-bold">
                      {isSatisfied ? "✓" : "•"}
                    </span>
                    <span>{reason}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Missing Info Warning */}
        {missing_info.length > 0 && (
          <div className="mt-4 rounded-xl bg-possible-bg p-4 text-sm text-possible-text ring-1 ring-inset ring-possible-border">
            <p className="font-bold flex items-center gap-2 text-sm sm:text-base">
              <span aria-hidden="true">ℹ️</span>
              <span>확인 필요 항목 (미입력 정보)</span>
            </p>
            <p className="mt-1.5 text-xs sm:text-sm leading-relaxed font-medium">
              {missing_info.join(" · ")} 조건이 미입력되어 정확한 자격 검증을 위해 원문 공고 확인이 필요합니다.
            </p>
          </div>
        )}

        {/* Deadline Info */}
        {application_deadline && (
          <p
            className={[
              "mt-3.5 text-sm sm:text-base font-medium",
              deadlineImminent
                ? "text-ineligible-text font-bold"
                : "text-neutral-600 dark:text-neutral-400",
            ].join(" ")}
          >
            <span className="font-bold text-neutral-800 dark:text-neutral-200">신청 마감일: </span>
            {formatDeadline(application_deadline)}
            {deadlineDays(application_deadline) != null && (
              <span className="ml-1.5 font-bold">({deadlineDays(application_deadline)}일 남음)</span>
            )}
          </p>
        )}

        {/* Expandable Detail Section */}
        {open && (
          <div className="mt-4 rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-5 text-sm dark:border-neutral-800 dark:bg-neutral-900/60">
            <p className="mb-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
              지원 조건 상세 내역
            </p>
            {loading && <p className="text-neutral-500 text-sm">상세 조건을 불러오는 중입니다…</p>}
            {!loading && detail && <DetailGrid detail={detail} />}
            {!loading && !detail && (
              <p className="text-neutral-500 text-sm">상세 조건 정보가 없습니다.</p>
            )}
          </div>
        )}

        {/* Action Footer */}
        <footer className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-4 text-sm dark:border-neutral-800">
          <button
            type="button"
            onClick={toggleDetail}
            aria-expanded={open}
            className="inline-flex items-center gap-1.5 font-bold text-neutral-700 hover:text-brand-600 dark:text-neutral-300 dark:hover:text-brand-400"
          >
            <span>{open ? "조건 상세 접기" : "상세 조건 보기"}</span>
            <span className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}>
              ▼
            </span>
          </button>

          <div className="flex items-center gap-3">
            {evidence.length > 0 && (
              <span className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm">
                출처: {evidence.map((e) => e.evidence_id.replace("src-", "")).join(", ")}
              </span>
            )}
            {announcement_url && (
              <a
                href={announcement_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-100 px-4 py-2 text-sm font-bold text-neutral-900 transition-colors hover:bg-brand-600 hover:text-white dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-brand-500"
              >
                <span>공식 공고 확인</span>
                <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </footer>
      </div>
    </article>
  );
}

function DetailGrid({ detail }: { detail: PolicyDetail }) {
  const age =
    detail.age_min != null || detail.age_max != null
      ? `만 ${detail.age_min ?? "제한 없음"} ~ ${detail.age_max ?? "제한 없음"}세`
      : "연령 제한 없음";
  const period =
    detail.apply_start || detail.apply_end
      ? `${detail.apply_start ?? "시작일 미정"} ~ ${detail.apply_end ?? "마감일 미정"}`
      : "상시 모집 또는 공고문 참조";

  const rows: [string, string | null][] = [
    ["신청 기간", period],
    ["대상 연령", age],
    ["고용 상태", detail.employment.length > 0 ? detail.employment.join(", ") : "제한 없음 (모든 상태)"],
    ["소득 기준", detail.income_max ? `연소득 ${Number(detail.income_max).toLocaleString()}만 원 이하` : "소득 제한 없음"],
    ["대상 지역", detail.region || "전국"],
    ["학력 기준", detail.education || "학력 무관"],
  ];

  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="flex gap-2">
          <dt className="w-24 shrink-0 font-bold text-neutral-500 dark:text-neutral-400">
            {label}
          </dt>
          <dd className="min-w-0 break-words font-semibold text-neutral-900 dark:text-neutral-100">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function compactReasons(reasons: string[]): string[] {
  const minR = reasons.find((r) => /나이 조건 충족 \(만 (\d+)세 이상\)/.test(r));
  const maxR = reasons.find((r) => /나이 조건 충족 \(만 (\d+)세 이하\)/.test(r));
  if (minR && maxR) {
    const a = minR.match(/만 (\d+)세/)?.[1] ?? "?";
    const b = maxR.match(/만 (\d+)세/)?.[1] ?? "?";
    return [`나이 만 ${a}~${b}세 충족`, ...reasons.filter((r) => r !== minR && r !== maxR)];
  }
  return reasons;
}

function deadlineDays(deadline: string): number | null {
  const days = Math.ceil((Date.parse(deadline) - Date.now()) / 86_400_000);
  return Number.isNaN(days) ? null : days;
}

function formatDeadline(deadline: string): string {
  const days = deadlineDays(deadline);
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return deadline;
  const formatted = `${date.getMonth() + 1}월 ${date.getDate()}일`;
  if (days != null && days <= 7) return `${formatted} (마감 임박)`;
  return formatted;
}

function isDeadlineImminent(deadline: string | null): boolean {
  if (!deadline) return false;
  const days = (Date.parse(deadline) - Date.now()) / 86_400_000;
  return !Number.isNaN(days) && days >= 0 && days <= 7;
}
