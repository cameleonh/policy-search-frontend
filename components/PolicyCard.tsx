import type { SearchResult, TargetType } from "@policy-search/contracts";
import { Badge } from "./Badge";

const TARGET_LABEL: Record<TargetType, string> = {
  individual: "개인 지원",
  business: "사업체 지원",
  both: "개인·사업체",
};

interface PolicyCardProps {
  result: SearchResult;
}

export function PolicyCard({ result }: PolicyCardProps) {
  const { policyVersion, triState, reasons, missingInfo, benefits, applicationDeadline, evidenceRefs } =
    result;
  const announcementUrl = result.announcementUrl || policyVersion.announcementUrl;

  const deadlineImminent = isDeadlineImminent(applicationDeadline);

  return (
    <article className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover dark:border-neutral-800 dark:bg-neutral-900">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold leading-snug text-neutral-900 dark:text-neutral-50">
            {policyVersion.title}
          </h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {TARGET_LABEL[policyVersion.targetType]}
          </p>
        </div>
        <Badge state={triState} />
      </header>

      {policyVersion.summary && (
        <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
          {policyVersion.summary}
        </p>
      )}

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

      {missingInfo.length > 0 && (
        <div className="mt-4 rounded-lg bg-possible-bg p-3 text-sm text-possible-text ring-1 ring-inset ring-possible-border">
          <p className="font-semibold">확인 필요</p>
          <p className="mt-0.5">{missingInfo.join(", ")}</p>
        </div>
      )}

      {benefits.length > 0 && (
        <p className="mt-3 text-sm text-neutral-700 dark:text-neutral-300">
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">혜택: </span>
          {benefits.join(", ")}
        </p>
      )}

      {applicationDeadline && (
        <p
          className={[
            "mt-2 text-sm font-medium",
            deadlineImminent ? "text-ineligible-text" : "text-neutral-600 dark:text-neutral-400",
          ].join(" ")}
        >
          <span className="font-semibold">신청 마감: </span>
          {applicationDeadline}
          {deadlineImminent && " (임박)"}
        </p>
      )}

      <footer className="mt-4 flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-3 text-xs dark:border-neutral-800">
        {announcementUrl && (
          <a
            href={announcementUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            공식 공고 ↗
          </a>
        )}
        {evidenceRefs.length > 0 && (
          <span className="text-neutral-400 dark:text-neutral-500">
            근거: {evidenceRefs.join(", ")}
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
