"use client";

import { useState } from "react";
import type { PolicyDetail, PolicyResult } from "@policy-search/contracts";
import { Badge } from "./Badge";

const CATEGORY_LABEL: Record<string, string> = {
  individual: "개인 지원",
  business: "사업체 지원",
  both: "개인·사업체",
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
    <article className="rounded-xl border border-neutral-200 bg-white shadow-card transition-shadow hover:shadow-card-hover dark:border-neutral-800 dark:bg-neutral-900">
      <button
        type="button"
        onClick={toggleDetail}
        aria-expanded={open}
        className="flex w-full flex-wrap items-start justify-between gap-3 p-5 text-left"
      >
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold leading-snug text-neutral-900 dark:text-neutral-50">
            {policy_title}
          </h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {CATEGORY_LABEL[category] ?? category}
            {agency && ` · ${agency}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={[
              "text-neutral-400 transition-transform dark:text-neutral-500",
              open ? "rotate-180" : "",
            ].join(" ")}
            aria-hidden="true"
          >
            ▾
          </span>
          <Badge state={status} />
        </div>
      </button>

      <div className="px-5 pb-5">
        {reasons.length > 0 && (
          <ul className="space-y-1.5 text-sm text-neutral-700 dark:text-neutral-300">
            {reasons.map((reason, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1 text-eligible-solid" aria-hidden="true">✓</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        )}

        {missing_info.length > 0 && (
          <div className="mt-4 rounded-lg bg-possible-bg p-3 text-sm text-possible-text ring-1 ring-inset ring-possible-border">
            <p className="font-semibold">확인 필요</p>
            <p className="mt-0.5">{missing_info.join(", ")}</p>
          </div>
        )}

        {benefits.length > 0 && (
          <p className="mt-3 text-sm text-neutral-700 dark:text-neutral-300">
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">혜택: </span>
            {benefits.join(", ")}
          </p>
        )}

        {application_deadline && (
          <p
            className={[
              "mt-2 text-sm font-medium",
              deadlineImminent
                ? "text-ineligible-text"
                : "text-neutral-600 dark:text-neutral-400",
            ].join(" ")}
          >
            <span className="font-semibold">신청 마감: </span>
            {application_deadline}
            {deadlineImminent && " (임박)"}
          </p>
        )}

        {open && (
          <div className="mt-4 rounded-lg border border-neutral-200 p-4 text-sm dark:border-neutral-700">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              지원 조건 상세
            </p>
            {loading && <p className="text-neutral-500">불러오는 중…</p>}
            {!loading && detail && <DetailGrid detail={detail} />}
            {!loading && !detail && (
              <p className="text-neutral-500">상세 조건 정보가 없습니다.</p>
            )}
          </div>
        )}

        <footer className="mt-4 flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-3 text-xs dark:border-neutral-800">
          {announcement_url && (
            <a
              href={announcement_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand-600 hover:underline dark:text-brand-400"
            >
              공식 공고 ↗
            </a>
          )}
          {evidence.length > 0 && (
            <span className="text-neutral-400 dark:text-neutral-500">
              근거: {evidence.map((e) => e.evidence_id).join(", ")}
            </span>
          )}
        </footer>
      </div>
    </article>
  );
}

function DetailGrid({ detail }: { detail: PolicyDetail }) {
  const age =
    detail.age_min != null || detail.age_max != null
      ? `만 ${detail.age_min ?? "?"}~${detail.age_max ?? "?"}세`
      : null;
  const period =
    detail.apply_start || detail.apply_end
      ? `${detail.apply_start ?? "?"} ~ ${detail.apply_end ?? "?"}`
      : null;

  const rows: [string, string | null][] = [
    ["신청 기간", period],
    ["나이", age],
    ["고용 상태", detail.employment.length > 0 ? detail.employment.join(", ") : null],
    ["소득 기준", detail.income_max ? `연소득 ${Number(detail.income_max).toLocaleString()}원 이하` : null],
    ["지역", detail.region],
    ["학력", detail.education],
  ];
  const present = rows.filter(([, v]) => v != null && v !== "");

  if (present.length === 0) return <p className="text-neutral-500">상세 조건 정보가 없습니다.</p>;

  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
      {present.map(([label, value]) => (
        <div key={label} className="flex gap-2">
          <dt className="w-20 shrink-0 font-medium text-neutral-500 dark:text-neutral-400">
            {label}
          </dt>
          <dd className="min-w-0 break-words text-neutral-800 dark:text-neutral-200">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function isDeadlineImminent(deadline: string | null): boolean {
  if (!deadline) return false;
  const days = (Date.parse(deadline) - Date.now()) / 86_400_000;
  return !Number.isNaN(days) && days >= 0 && days <= 7;
}
