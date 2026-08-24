# DESIGN.md — 청년·소상공인 정책 검색 (policy-search-frontend)

> Standalone design contract. Read in full before any UI, styling, copy, or
> motion change. Generated via `omd-init` (oh-my-design, Qwen Code port) with
> the **KRDS (Korea Republic Design System)** reference — quality
> `verified_v2`, catalog id `krds`, verified 2026-07-11. This file records
> what this product *is*, plus the KRDS-derived rules this product *adopts*.

## 1. Philosophy

This is a **public utility, not a marketing surface**. Users arrive with a
concrete question — "정책 지원을 받을 수 있는가?" — and often with incomplete
information about themselves. Every visual decision serves three goals, in
order:

1. **Trust** — the verdict shown must feel authoritative and verifiable.
2. **Clarity** — one screen, one decision. The tri-state verdict is the hero.
3. **Accessibility** — young mobile-only users and digitally less-confident
   small-business owners alike must complete the flow unaided.

Adopted from KRDS: the accent color is reserved for *actions and verdicts*, not
decoration. Area separation is done with thin borders and radius, not heavy
shadows. Marketing exclamation, decorative gradients/illustrations, and
exaggerated motion are rejected.

## 2. Core mental model — tri-state eligibility (product-owned)

Every policy result carries exactly one verdict, and it is the product's
first-class semantic scale (predates this document; unchanged):

| Verdict | Korean label | Color role | Meaning |
|---|---|---|---|
| `eligible` | 지원 가능 | positive / green | Conditions met |
| `possible` | 가능성 있음 | caution / amber | Info missing or incomplete |
| `ineligible` | 지원 불가 | negative / red | Conditions not met |

**Contract (KRDS-derived, binding):** the verdict is **never color-only**. The
Badge always pairs the color with the Korean label text (and a solid dot), so
color-blind and screen-reader users receive the same verdict. No new state may
be added to this scale without updating `MatchStatus` in
`@policy-search/contracts` and this table.

## 3. Tokens (current implementation)

Fonts: **Pretendard Variable** (`--font-sans`), Korean-first. Radius base
`--radius: 0.5rem` (8px), scale `xs…xl` as multiples. Shadow: two card shadows
only (`card`, `card-hover`).

Colors are CSS-variable-driven (light + `.dark`) consumed via Tailwind as
`rgb(var(--x) / <alpha>)`. Brand ramp `brand-50…900` is **indigo**
(`--brand-500: 99 102 241` ≈ `#6366F1`) — kept as the product's own identity
(not KRDS government blue; this is a civic service, not a government symbol
user). Tri-state pairs (bg / border / text / solid per verdict) were chosen to
clear WCAG AA against their paired surfaces — **do not change one value of a
pair without re-checking contrast** for the whole pair.

Full values live in `app/globals.css` (`:root` and `.dark`). That file is the
token source of truth; this section is the contract, not a copy.

## 4. Adopted principles (from KRDS reference)

1. **Accessibility first.** WCAG 2.1 AA contrast minimums on all text/token
   pairs; visible focus on every interactive element; keyboard-navigable
   controls (semantic `<button>`/`<a>`, never `<div>` handlers); `aria-*`
   where state is conveyed visually.
2. **Consistency.** Same verdict → same badge treatment everywhere. Same
   action → same button variant. No one-off colors or radii.
3. **Clarity.** One primary action per view. The search form's submit is the
   page's single Primary; everything else is secondary/ghost.
4. **Predictability.** No novel interactions; standard form controls, standard
   focus order matching visual order.
5. **User-centred IA.** Group by what the *applicant* answers at one time
   (personal info; optional collapsible business fieldset), not by data-source
   taxonomy.

## 5. States (binding)

| State | Treatment |
|---|---|
| **Empty (no results)** | "조건에 맞는 정책이 없습니다." + guidance to relax conditions. Never bare "데이터가 없습니다". |
| **Loading (search)** | Submit button disabled + inline "검색 중..." label (no duplicate submissions). |
| **Error (validation)** | Field-level: border + message stating 무엇이 / 왜 / 어떻게 ("올바른 생년월일 형식이 아닙니다. 예: 19990101"). |
| **Error (network/API)** | Preserve user input; message + retry; never a bare "오류가 발생했습니다". |
| **Possible verdict** | Amber badge + one-line reason ("입력하지 않은 조건이 있어 정확한 판단이 어렵습니다"류) — the missing-info state must explain *why* it is not a final verdict. |
| **Disabled** | Grey surface + `cursor-not-allowed`; reason as helper text when non-obvious. |
| **Focus (keyboard)** | Visible ring on all interactive elements, no exceptions. |

## 6. Voice & tone (KRDS public-desk register, Korean)

- Polite 합니다체 / "-해 주세요"; never commanding, never marketing ("혁신적인",
  "최고의" forbidden).
- Headlines: short noun phrases, no exclamation marks. CTAs: verb + 기
  ("검색하기", "자세히 보기").
- Form labels: noun form ("생년월일", "거주지"). Optional fields say so.
- Errors follow 무엇이/왜/어떻게 with a concrete example.
- Plain Korean per 쉬운 우리말 principles (e.g. write "취소합니다", not "취하anda"
  style administratese).

## 7. Component contracts

- **`Badge`** (`components/Badge.tsx`) — tri-state verdict chip: tinted bg +
  text color + ring border + solid dot + Korean label. Props: `state:
  MatchStatus`. This is the only sanctioned verdict surface.
- **`PolicyCard`** — one policy result: Badge (verdict) + title + category
  label (개인 지원 / 사업체 지원 / 개인·사업체) + expandable detail. Card uses
  `shadow-card` → `card-hover` on hover; separation by border/radius otherwise.
- **`Button`** — variants `primary` (brand solid, reserved for the view's main
  action), `secondary` (white/dark surface + ring), `ghost`; sizes `sm/md/lg`.
- **`SearchProfileForm`** — the single unified input: personal fields
  (birthDate, region, employmentStatus, incomeBracket) + optional collapsible
  business fieldset (businessRegion, industry, annualRevenue, employeeCount);
  unknowns may be left blank — blanks drive `possible`, never block search.

## 8. Motion

Minimal and functional only (hover shadow lift, expand/collapse). No
decorative animation, no auto-playing motion. Respect
`prefers-reduced-motion`.

## 9. Provenance & adoption

- Reference: `krds` DESIGN.md (`~/.qwen/data/references/krds/DESIGN.md`,
  oh-my-design Qwen Code port, catalog 440 refs) — voice/states/principles
  adopted as above; KRDS palette *not* copied (product keeps indigo brand and
  its own tri-state semantics).
- This contract is advisory-authoritative for all future UI work in this repo.
  Pending user corrections belong in `.omd/preferences.md` and override this
  file until folded in.
