import type { MatchStatus } from "@policy-search/contracts";

const VERDICT: Record<
  MatchStatus,
  { label: string; className: string; dot: string }
> = {
  eligible: {
    label: "지원 가능",
    className: "bg-eligible-bg text-eligible-text ring-eligible-border",
    dot: "bg-eligible-solid",
  },
  possible: {
    label: "가능성 있음",
    className: "bg-possible-bg text-possible-text ring-possible-border",
    dot: "bg-possible-solid",
  },
  ineligible: {
    label: "지원 불가",
    className: "bg-ineligible-bg text-ineligible-text ring-ineligible-border",
    dot: "bg-ineligible-solid",
  },
};

interface BadgeProps {
  state: MatchStatus;
  className?: string;
}

export function Badge({ state, className = "" }: BadgeProps) {
  const v = VERDICT[state];
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
        v.className,
        className,
      ].join(" ")}
    >
      <span className={["h-1.5 w-1.5 rounded-full", v.dot].join(" ")} aria-hidden="true" />
      {v.label}
    </span>
  );
}
