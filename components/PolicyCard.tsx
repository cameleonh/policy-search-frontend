"use client";

import type { PolicyResult } from "@policy-search/contracts";
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

  const deadlineImminent = isDeadlineImminent(application_deadline);

  return (
    <article className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover dark:border-neutral-800 dark:bg-neutral-900">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold leading-snug text-neutral-900 dark:text-neutral-50">
            {policy_title}
          </h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {CATEGORY_LABEL[category] ?? category}
            {agency && ` · ${agency}`}
          </p>
        </div>
        <Badge state={status} />
      </header>

      {reasons.length > 0 && (
        <ul className="mt-4 space-y-1.5 text-sm text-neutral-700 dark:text-neutral-300">
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
            deadlineImminent ? "text-ineligible-text" : "text-neutral-600 dark:text-neutral-400",
          ].join(" ")}
        >
          <span className="font-semibold">신청 마감: </span>
          {application_deadline}
          {deadlineImminent && " (임박)"}
        </p>
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
    </article>
  );
}

function isDeadlineImminent(deadline: string | null): boolean {
  if (!deadline) return false;
  const days = (Date.parse(deadline) - Date.now()) / 86_400_000;
  return !Number.isNaN(days) && days >= 0 && days <= 7;
}
