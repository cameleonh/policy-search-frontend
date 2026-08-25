import type { MatchStatus } from "@policy-search/contracts";

const VERDICT: Record<
  MatchStatus,
  { label: string; symbol: string; className: string; dot: string; ariaLabel: string }
> = {
  eligible: {
    label: "지원 가능",
    symbol: "✓",
    className: "bg-eligible-bg text-eligible-text ring-eligible-border",
    dot: "bg-eligible-solid",
    ariaLabel: "판정 결과: 지원 가능 (조건 충족)",
  },
  possible: {
    label: "가능성 있음",
    symbol: "?",
    className: "bg-possible-bg text-possible-text ring-possible-border",
    dot: "bg-possible-solid",
    ariaLabel: "판정 결과: 가능성 있음 (추가 확인 필요)",
  },
  ineligible: {
    label: "지원 불가",
    symbol: "✕",
    className: "bg-ineligible-bg text-ineligible-text ring-ineligible-border",
    dot: "bg-ineligible-solid",
    ariaLabel: "판정 결과: 지원 불가 (조건 미달)",
  },
};

interface BadgeProps {
  state: MatchStatus;
  className?: string;
}

export function Badge({ state, className = "" }: BadgeProps) {
  const v = VERDICT[state] ?? VERDICT.possible;
  return (
    <span
      role="status"
      aria-label={v.ariaLabel}
      className={[
        "inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-full px-3.5 py-1 text-sm font-bold ring-1 ring-inset transition-colors",
        v.className,
        className,
      ].join(" ")}
    >
      <span
        className={[
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white",
          v.dot,
        ].join(" ")}
        aria-hidden="true"
      >
        {v.symbol}
      </span>
      <span className="whitespace-nowrap">{v.label}</span>
    </span>
  );
}
