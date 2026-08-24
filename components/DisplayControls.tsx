"use client";

import { useEffect, useState } from "react";

const FONT_STEPS = [
  { key: "sm", label: "가-", htmlClass: "text-sm", desc: "작게" },
  { key: "base", label: "가", htmlClass: "text-base", desc: "보통" },
  { key: "lg", label: "가+", htmlClass: "text-lg", desc: "크게" },
] as const;

type FontKey = (typeof FONT_STEPS)[number]["key"];
const DEFAULT_FONT: FontKey = "base";

function applyFont(key: FontKey) {
  const html = document.documentElement;
  html.classList.remove(...FONT_STEPS.map((s) => s.htmlClass));
  const step = FONT_STEPS.find((s) => s.key === key) ?? FONT_STEPS[1];
  html.classList.add(step.htmlClass);
}

export function DisplayControls() {
  const [font, setFont] = useState<FontKey>(DEFAULT_FONT);
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedFont = localStorage.getItem("ps-font") as FontKey | null;
    if (savedFont && FONT_STEPS.some((s) => s.key === savedFont)) {
      setFont(savedFont);
      applyFont(savedFont);
    }
    const savedTheme = localStorage.getItem("ps-theme");
    const prefersDark =
      savedTheme === "dark" ||
      (savedTheme === null && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
    setMounted(true);
  }, []);

  function changeFont(key: FontKey) {
    setFont(key);
    localStorage.setItem("ps-font", key);
    applyFont(key);
  }

  function toggleDark() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("ps-theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  }

  return (
    <div
      className="fixed right-4 top-4 z-50 flex items-center gap-1 rounded-full border border-neutral-200 bg-white/90 p-1 shadow-card backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/90"
      role="group"
      aria-label="화면 설정"
    >
      {FONT_STEPS.map((step) => (
        <button
          key={step.key}
          type="button"
          onClick={() => changeFont(step.key)}
          aria-pressed={mounted && font === step.key}
          title={`글자 크기: ${step.desc}`}
          className={[
            "min-w-9 rounded-full px-2 py-1 text-xs font-semibold transition-colors",
            mounted && font === step.key
              ? "bg-brand-600 text-white"
              : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800",
          ].join(" ")}
        >
          {step.label}
        </button>
      ))}
      <span className="mx-0.5 h-4 w-px bg-neutral-200 dark:bg-neutral-700" aria-hidden="true" />
      <button
        type="button"
        onClick={toggleDark}
        aria-pressed={mounted && dark}
        title={dark ? "라이트 모드로 전환" : "다크 모드로 전환"}
        aria-label={dark ? "라이트 모드로 전환" : "다크 모드로 전환"}
        className="min-w-9 rounded-full px-2 py-1 text-xs transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
      >
        {mounted && dark ? "☀️" : "🌙"}
      </button>
    </div>
  );
}
