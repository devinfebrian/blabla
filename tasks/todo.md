# Hijab 3D Store — Task List (v1)

Detail for each task in `tasks/plan.md`. One task = one focused session, implemented,
tested, and verified. Check a task only when its acceptance criteria **and** the project
Definition of Done (plan.md) are met.

---

## Phase 1: Foundation

### [x] Task 1 — Scaffold the app

**Description:** Bootstrap the Next.js (App Router) + TypeScript + Tailwind project with
pnpm, ESLint/Prettier, and the test toolchains (Vitest + Playwright) wired to the repo
commands. No product features.

**Acceptance criteria:**
- [ ] `pnpm dev` serves a page; `pnpm build` succeeds; `pnpm lint` clean
- [ ] Vitest runs one trivial passing test; Playwright is configured (may start empty)
- [ ] Tailwind utility classes apply

**Verification:**
- [ ] Build succeeds: `pnpm build`
- [ ] Tests pass: `pnpm test`
- [ ] Manual check: page renders with a Tailwind style

**Dependencies:** None
**Files likely touched:** `package.json`, `next.config.ts`, `tsconfig.json`, `app/layout.tsx`, `app/page.tsx`
**Estimated scope:** S

---

### [x] Task 2 — Sanity schema + seeded product

**Description:** Create the Sanity project and define the `product`, `colorVariant`, and
`site` documents with validation. Seed one product with three color variants and the site's
WhatsApp number/brand/currency (placeholders acceptable).

**Acceptance criteria:**
- [ ] Studio runs locally and shows the seeded product with 3 colors
- [ ] Invalid `hex` (not `^#[0-9a-fA-F]{6}$`), empty colors, `price <= 0`, or non-digit phone are rejected
- [ ] Fetching the product via the Sanity API returns all fields

**Verification:**
- [ ] Manual check: try to save an invalid hex → rejected
- [ ] Tests pass: `pnpm test`
- [ ] Manual check: API query returns the seeded product

**Dependencies:** Task 1
**Files likely touched:** `sanity.config.ts`, `sanity/schema/product.ts`, `sanity/schema/colorVariant.ts`, `sanity/schema/site.ts`, `scripts/seed.ts`
**Estimated scope:** M

---

### [x] Task 3 — Typed content layer + color normalization

**Description:** A `getProduct()` that runs the GROQ query and returns a typed `Product`.
A pure `resolveColor(colors, key)` helper that returns the matching variant or the first
in-stock color, and reports whether normalization happened.

**Acceptance criteria:**
- [ ] `getProduct()` returns `Product` (types compiled from the schema)
- [ ] `resolveColor` returns the match for a valid key; first in-stock for unknown/missing
- [ ] Unit tests cover: valid key, unknown key, empty key, all-out-of-stock

**Verification:**
- [ ] Tests pass: `pnpm test -- resolveColor`
- [ ] Build succeeds: `pnpm build`

**Dependencies:** Task 2
**Files likely touched:** `lib/sanity.ts`, `lib/content.ts`, `lib/types.ts`, `lib/color.test.ts`
**Estimated scope:** S

---

#### Checkpoint: Foundation
- [x] `pnpm build` clean, `pnpm lint` clean, `pnpm test` green
- [x] Studio rejects invalid data; `getProduct()` works against real CMS data
- [ ] Human review before Phase 2

---

## Phase 2: Core vertical slice

### [x] Task 4 — Static product page

**Description:** A server component at `/` that renders the product (title, price, fabric
copy, and swatches as links) from `getProduct()`. No 3D and no client JS yet. Unknown
`?color=` normalizes to the default.

**Acceptance criteria:**
- [ ] `/` renders real CMS content and is statically generated at build
- [ ] No client JS ships for this route (catalog page)
- [ ] `/?color=<unknown>` renders the default color without erroring

**Verification:**
- [ ] Build succeeds and route is marked static: `pnpm build`
- [ ] Manual check: view-source / network shows no client bundle
- [ ] Manual check: `/?color=bogus` renders normally

**Dependencies:** Task 3
**Files likely touched:** `app/page.tsx`, `components/ProductInfo.tsx`, `app/globals.css`
**Estimated scope:** M

---

### [x] Task 5 — 3D viewer island

**Description:** `components/HijabViewer.tsx`, dynamically imported with `ssr: false`,
mounted only when it enters the viewport. Loads a placeholder GLB, shows OrbitControls, and
renders one `Fabric` material at a fixed color. A skeleton shows until the model is ready.

**Acceptance criteria:**
- [ ] Viewer mounts on viewport entry (not on first paint) and unmounts when scrolled away
- [ ] Model renders and orbits/zooms; skeleton shown while loading
- [ ] `three` is imported **only** in `HijabViewer.tsx` (grep confirms)
- [ ] Placeholder GLB is ≤ 2 MB with exactly one `Fabric` material, neutral-white base

**Verification:**
- [ ] Manual check: rotate/zoom works; skeleton appears on throttled network
- [ ] Manual check: `grep -r "from 'three'" --exclude-dir=node_modules` returns only HijabViewer
- [ ] Build succeeds: `pnpm build`

**Dependencies:** Task 4
**Files likely touched:** `components/HijabViewer.tsx`, `public/models/hijab.glb`, `components/useInView.ts`
**Estimated scope:** M

---

### [x] Task 6 — Recolor + URL sync

**Description:** A client wrapper (`ProductView`) holds the selected color. `ColorPicker`
renders swatches; selecting one calls `material.color.set(hex)`, updates the visible colour
name/price, and syncs the URL via `replaceState`. Initial color comes from `?color=`.

**Acceptance criteria:**
- [ ] Tapping a swatch recolors the model immediately and updates name/price
- [ ] URL reflects the selection; reload / shared deep link opens the same color
- [ ] Selected swatch is visually marked; picking is keyboard-accessible

**Verification:**
- [ ] Tests pass: `pnpm test -- ColorPicker`
- [ ] Manual check: change color → copy URL → open in new tab → same color
- [ ] Manual check: Tab to swatches, select with keyboard

**Dependencies:** Task 5
**Files likely touched:** `components/ProductView.tsx`, `components/ColorPicker.tsx`, `components/HijabViewer.tsx`
**Estimated scope:** M

---

### [x] Task 7 — WhatsApp order button

**Description:** A pure `buildWhatsAppUrl({ site, product, color, qty, pageUrl })` producing
the documented message and `wa.me` link, plus an `OrderButton` that uses it with the current
selection.

**Acceptance criteria:**
- [ ] Unit tests cover: message format, `encodeURIComponent`, digits-only number, color key in URL, qty change
- [ ] Button href equals the function output for the selected color/qty
- [ ] No network request is made when ordering

**Verification:**
- [ ] Tests pass: `pnpm test -- whatsapp`
- [ ] Manual check: click opens WhatsApp with the prefilled message and correct color URL

**Dependencies:** Task 6
**Files likely touched:** `lib/whatsapp.ts`, `lib/whatsapp.test.ts`, `components/OrderButton.tsx`
**Estimated scope:** S

---

#### Checkpoint: Core
- [x] Order link in the served HTML carries the selected color + formatted price (headless verified)
- [x] Product page prerenders static; GLB serves as `model/gltf-binary`; `three` confined to HijabViewer
- [x] Browser check: rotate + click-to-recolor + deep-link applied after hydration (Playwright, 4 tests)
- [ ] Human review before Phase 3

---

## Phase 3: Harden, perf, ship

### [x] Task 8 — Edge and error states

**Description:** Handle the non-happy paths: GLB load failure shows an explicit error with
retry (never a blank canvas); out-of-stock swatches and the order button are disabled;
unknown `?color=` normalizes silently; a Sanity failure at build fails loudly.

**Acceptance criteria:**
- [ ] Simulated GLB 404 shows an error + working retry; the page text stays readable
- [ ] Out-of-stock color renders disabled and cannot be ordered
- [ ] Build fails loudly if Sanity is unreachable

**Verification:**
- [ ] Tests pass: `pnpm test`
- [ ] Manual check: block/rename the GLB → error + retry
- [ ] Manual check: mark a color out of stock → disabled in UI

**Dependencies:** Task 7
**Files likely touched:** `components/HijabViewer.tsx`, `components/ColorPicker.tsx`, `components/ProductView.tsx`
**Estimated scope:** S

---

### [ ] Task 9 — Performance pass

**Description:** Enforce the perf budget: `frameloop="demand"`, clamped `dpr`, preload the
GLB on hover/tap intent, `next/image` for any photos, and confirm the catalog route ships
no client JS. Record the numbers.

**Acceptance criteria:**
- [ ] No idle render loop (frameloop demand verified)
- [ ] `dpr` clamped; GLB ≤ 2 MB; preload triggers on intent
- [ ] Recorded: LCP/INP on mid-range Android/4G, island bytes, GLB size

**Verification:**
- [ ] Build succeeds: `pnpm build`
- [ ] Manual check: Lighthouse mobile run; numbers written into `tasks/plan.md` or README
- [ ] Manual check: catalog route client JS ≈ 0

**Dependencies:** Task 8
**Files likely touched:** `components/HijabViewer.tsx`, `app/layout.tsx`, `next.config.ts`
**Estimated scope:** M

---

### [ ] Task 10 — Deploy + revalidate webhook + analytics

**Description:** Deploy to Vercel, add `/api/revalidate` called by a Sanity publish webhook
to `revalidatePath('/')`, and enable analytics for the two PRD metrics.

**Acceptance criteria:**
- [ ] Production URL serves the product page
- [ ] Publishing an edit in Sanity updates the live page within ~1 minute without a redeploy
- [ ] Analytics records 3D interaction and WhatsApp clicks

**Verification:**
- [ ] Manual check: publish a color change → live page updates
- [ ] Manual check: analytics dashboard shows both events

**Dependencies:** Task 9
**Files likely touched:** `app/api/revalidate/route.ts`, `vercel.json`, `app/layout.tsx`
**Estimated scope:** S

---

### [ ] Task 11 — E2E smoke + Definition of Done

**Description:** One Playwright test (load → change color → assert the WhatsApp `href`) and
a final pass over the project Definition of Done.

**Acceptance criteria:**
- [ ] E2E test passes on the built app
- [ ] Every DoD item confirmed (correctness, quality, integration, docs, ship-readiness)
- [ ] README documents setup + the asset contract; the 3D/asset decision recorded as an ADR

**Verification:**
- [ ] Tests pass: `pnpm test:e2e`
- [ ] Build succeeds: `pnpm build`
- [ ] Manual check: work through the plan.md DoD checklist

**Dependencies:** Task 10
**Files likely touched:** `e2e/product.spec.ts`, `playwright.config.ts`, `README.md`, `docs/adr/0001-3d-asset-contract.md`
**Estimated scope:** S

---

#### Checkpoint: Complete
- [ ] All acceptance criteria met; DoD satisfied
- [ ] Perf numbers recorded
- [ ] Human review before merge/deploy
