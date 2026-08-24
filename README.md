# policy-search-frontend

Next.js + Tailwind frontend for the Policy Search platform (청년 · 소상공인 정책 검색).

Standalone repo, sibling of the backend monorepo at `../policy-search-backend`.
Consumes the shared TypeScript contracts via a local workspace link
(`@policy-search/contracts`) — those types mirror the backend's Python wire
contracts (`apps/api/contracts/search.py`), which are the source of truth.

## Design system

Built around a three-state eligibility semantic — the product's core mental model:

| State | Meaning | Tailwind token |
| ----- | ------- | -------------- |
| eligible | 지원 가능 | `eligible` (green) |
| possible | 가능성 있음 | `possible` (amber) |
| ineligible | 지원 불가 | `ineligible` (red) |

See `app/globals.css` and `tailwind.config.ts` for token definitions, and
`DESIGN.md` (KRDS-referenced design contract) before any UI change.

## Features

- Single-page search: profile form (시도 dropdown, employment, optional
  business fieldset) → tri-state result cards ranked by relevance
- Result cards render compact condition chips (e.g. `만 19~34세 충족`)
- Cards expand into a detail panel (`GET /api/policies/{id}` proxy → backend
  `/v1/policies/{id}`): 신청 기간, 나이, 고용 상태, 소득 기준, 지역, 학력
- Display controls (top-right): 3-step font sizing + dark-mode toggle,
  persisted in localStorage; dark mode honors `prefers-color-scheme`

## Develop

```bash
pnpm install
pnpm dev        # :3000; use --port 3001 if occupied
```

Quality gates: `pnpm typecheck && pnpm lint && pnpm build && pnpm test`.

The backend must be running (default `API_URL=http://localhost:8000`, or
`docker compose up` in the backend repo for the full stack incl. this web
tier on :3000).
