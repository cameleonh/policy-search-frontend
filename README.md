# policy-search-frontend

Next.js + Tailwind frontend for the Policy Search platform (청년 · 소상공인 정책 검색).

Separate from the backend monorepo at `../policy-search-backend`. Consumes the
shared TypeScript contracts via a local workspace link (`@policy-search/contracts`).

## Design system

Built around a three-state eligibility semantic — the product's core mental model:

| State | Meaning | Tailwind token |
| ----- | ------- | -------------- |
| eligible | 지원 가능 | `eligible` (green) |
| possible | 가능성 있음 | `possible` (amber) |
| ineligible | 지원 불가 | `ineligible` (red) |

See `app/globals.css` and `tailwind.config.ts` for token definitions.

## Develop

```bash
pnpm install
pnpm dev
```

The frontend proxies search requests through its own `/api/search` route to the
FastAPI backend (`POST /v1/search`). Set `API_URL` to override the backend origin
(default `http://localhost:8000`).
