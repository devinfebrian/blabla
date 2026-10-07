# blabla hijab

Single-product hijab store: a statically rendered product page with one lazily-loaded
three.js viewer that rotates the hijab and recolours it across the store's real colours.
Orders go out as a prefilled WhatsApp message. No server, database, auth, or payments in v1.

- Design: `docs/superpowers/specs/2026-10-07-hijab-3d-store-design.md`
- Plan: `tasks/plan.md` · Task list: `tasks/todo.md`
- Decisions: `docs/adr/`

## Quickstart

```bash
pnpm install
cp .env.example .env.local   # then fill in the values
pnpm seed                    # write the placeholder product + site into Sanity
pnpm dev                     # http://localhost:3000
```

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Next dev server |
| `pnpm build` / `pnpm start` | production build / serve |
| `pnpm lint` / `pnpm typecheck` | ESLint / `tsc` (typegen + noEmit) |
| `pnpm test` / `pnpm test:watch` | Vitest unit + component tests |
| `pnpm test:e2e` | Playwright (builds and serves the app itself) |
| `pnpm seed` | write the placeholder product + site into Sanity (idempotent) |
| `pnpm studio` | Sanity Studio (the editor) at http://localhost:3333 |
| `pnpm studio:deploy` | publish the Studio to `<project>.sanity.studio` |
| `node scripts/make-placeholder-model.mts` | regenerate `public/models/hijab.glb` |

## Environment

The project id and dataset are **public constants** in `sanity/env.ts` — they appear in every
Studio URL, and Sanity Studio runs on Vite, which never exposes Next's `NEXT_PUBLIC_*`. Only
secrets live in env:

| Variable | Purpose |
| --- | --- |
| `SANITY_API_TOKEN` | Sanity write access, used by `pnpm seed` (local only) |
| `SANITY_REVALIDATE_SECRET` | shared secret for the Sanity publish webhook → `POST /api/revalidate` |

## The 3D asset contract

Any model placed behind `product.model.glbUrl` must satisfy:

- one `.glb`, Y-up, origin at centre, **≤ 2 MB**
- **exactly one material named `Fabric`** (the name comes from `product.model.fabricMaterialName`)
- its base colour must be **neutral white** — recolouring is `material.color.set(hex)` at
  runtime, so a pre-tinted base makes every colour wrong
- no baked texture (colour is a material tint, not a material map)

`public/models/hijab.glb` (9,896 bytes) is a placeholder that satisfies this. Regenerate it with
`node scripts/make-placeholder-model.mts`. See `docs/adr/0001-3d-asset-contract.md`.

## Publishing changes

Editing in the Studio does not touch the live page until the Sanity webhook calls
`POST /api/revalidate?secret=…`. Without the webhook, `/` refreshes on its own 15-minute
revalidation window.

## Deployment

Vercel. Set `SANITY_REVALIDATE_SECRET` in the project environment, then add a Sanity webhook
(publish → `https://<domain>/api/revalidate?secret=…`).

The Studio is not embedded in the Next app (Next 16 + Turbopack cannot bundle Sanity Studio's
SWR dependency) — deploy it with `pnpm studio:deploy`.
