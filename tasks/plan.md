# Implementation Plan: Hijab 3D Store (v1)

## Overview

A single-product hijab store: a statically rendered Next.js product page, one lazily-loaded
3D viewer island (three.js / react-three-fiber) that rotates and recolors via a fixed
palette of orderable colors, Sanity as the no-code catalog editor, and orders placed by a
WhatsApp deep link. No runtime server, database, auth, or payments in v1.

Spec: `docs/superpowers/specs/2026-10-07-hijab-3d-store-design.md`
Task list: `tasks/todo.md` (detailed acceptance criteria + verification per task).

**Note on slicing:** v1 is a *single vertical slice* (one product page). It's built in thin
layers, each leaving the system working, rather than as parallel feature slices.

## Commands (repo conventions — established in Task 1)

- Focused tests: `pnpm test -- <pattern>`
- Unit suite: `pnpm test` (Vitest)
- E2E: `pnpm test:e2e` (Playwright)
- Build: `pnpm build`
- Lint: `pnpm lint`

## Architecture Decisions

- **Next.js App Router, product page statically rendered (SSG) + `revalidatePath` on
  publish.** Static HTML is fast and indexable; only the viewer is client JS.
- **three.js is imported in exactly one file** (`components/HijabViewer.tsx`). Experimenting
  with lighting/materials has a blast radius of one file.
- **Sanity owns content; schema validation is the guardrail** (hex regex, ≥1 color, price>0,
  digits-only phone). The site can never receive data it can't render.
- **Recolor is `material.color.set(hex)`** on one `Fabric` material whose base is neutral
  white — no shaders, no textures.
- **Order link is a pure function**, not an endpoint.
- **No 3D fallback in v1** — deferred, recorded as a launch blocker (spec §1).

### Deviations from this plan (Phase 1, recorded)

- **Studio runs standalone, not embedded.** `pnpm studio` (→ `sanity dev`), deploy with
  `sanity deploy`. Next 16 (Turbopack + Cache Components) cannot bundle Sanity Studio's SWR
  dependency (`Export default doesn't exist in target module … swr/dist/index/react-server.mjs`);
  forcing `serverExternalPackages: ['swr']` instead broke React context at build. Going
  standalone also removed `next-sanity` and `@sanity/vision`.
- **Schema lives in `sanity/schemaTypes/`** (Sanity's convention) rather than `sanity/schema/`.
- **Added `styled-components`** — the Sanity CLI refuses to start the Studio without it.
- **Seed uses Node's native TS support** (`node --env-file=.env.local scripts/seed.mts`) —
  no `tsx`/`ts-node` dependency.
- **`typecheck` runs `next typegen` first** — Next 16 generates the `LayoutProps` global only
  via typegen, so a bare `tsc --noEmit` fails on the template's own code.
- **Project id/dataset are public constants in `sanity/env.ts`; only `SANITY_API_TOKEN` lives
  in env.** Sanity Studio runs on Vite, which never exposes Next's `NEXT_PUBLIC_*`, so an
  env-reading config throws in the browser. Shared constants kill that class of bug and mean
  Vercel needs no Sanity env for Phase 1.

## Task List

### Phase 1: Foundation
- [ ] Task 1 — Scaffold the app (Next.js + TS + Tailwind + lint, pnpm)
- [ ] Task 2 — Sanity schema + seeded product (1 product, 3 colors)
- [ ] Task 3 — Typed content layer + color normalization

#### Checkpoint: Foundation
- [ ] `pnpm build` clean, `pnpm lint` clean, `pnpm test` green
- [ ] Studio runs and rejects an invalid hex / empty color list
- [ ] `getProduct()` returns a typed `Product` from real CMS data
- [ ] **Review with human before proceeding**

### Phase 2: Core vertical slice
- [ ] Task 4 — Static product page (title, price, copy, swatches; no 3D yet)
- [ ] Task 5 — 3D viewer island (lazy, no-SSR; rotate/zoom; fixed color)
- [ ] Task 6 — Recolor + URL sync (`?color=`) + price/name update
- [ ] Task 7 — WhatsApp order button + pure `buildWhatsAppUrl` function

#### Checkpoint: Core
- [ ] End-to-end: open `/` → rotate the hijab → pick a color → order link carries that color
- [ ] Deep link `/?color=dusty-rose` opens with that color selected
- [ ] Page renders and reads fully with JS disabled
- [ ] **Review with human before proceeding**

### Phase 3: Harden, perf, ship
- [ ] Task 8 — Edge and error states (GLB fail+retry, out-of-stock, invalid color, loud build fail)
- [ ] Task 9 — Performance pass (frameloop demand, dpr clamp, preload-on-intent, images, bundle)
- [ ] Task 10 — Deploy + Sanity revalidate webhook + analytics
- [ ] Task 11 — Playwright smoke + Definition of Done pass

#### Checkpoint: Complete
- [ ] All acceptance criteria met; DoD satisfied
- [ ] Perf numbers recorded (LCP/INP, island bytes, GLB size)
- [ ] **Review with human before merge/deploy**

## Definition of Done (project)

Tailored once from `~/.agents/references/definition-of-done.md`; applied to every task.

- **Correctness:** acceptance criteria met; behavior verified at runtime, not just typed;
  new behavior covered by a test that fails without the change; no regressions; edge/error
  paths handled (not just the happy path).
- **Quality:** intent-revealing names; no duplicated business logic; no dead/debug code;
  diff scoped to the task; lint + format clean.
- **Integration:** works with the whole page (not just in isolation); config/env accounted
  for; the `Product`/`ColorVariant` contract unchanged for the full-store phase.
- **Documentation:** README documents setup + the asset contract; the 3D/asset decision is
  recorded as an ADR (see `documentation-and-adrs`).
- **Ship-readiness:** 3D asset contract enforced (one `Fabric` material, neutral-white base,
  ≤2 MB); analytics on the two PRD metrics; human approval before deploy.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| No real model yet | High | Task 5 uses a placeholder GLB behind the same `model` slot; asset brief in spec §6 |
| 3D perf on low-end | Medium | Task 9 budgets: demand rendering, dpr clamp, ≤2 MB model; fallback tracked as launch blocker |
| GLB loads blank/fails | Medium | Task 8 explicit error + retry (no blank canvas) |
| Sanity down at build | Medium | Build fails loudly (Task 4); never ship a broken page |
| WhatsApp link encoding bugs | Medium | Task 7 pure function, unit-tested |
| Scope creep into full-store | High | Non-goals fixed in spec; any DB/auth/payments is a new classification, not a task here |

## Open Questions (need human input)

- **WhatsApp number** — pending; seed a placeholder so Task 7 isn't blocked, swap the real
  number before launch.
- **Model sourcing route** (commission / stock / placeholder) — spec §6; undecided, not a
  blocker. Task 5 proceeds on the placeholder; any real model must meet the asset contract.
- ~~Brand name / currency / Vercel + Sanity accounts~~ — resolved (*blabla hijab*, IDR;
  projects already exist).
