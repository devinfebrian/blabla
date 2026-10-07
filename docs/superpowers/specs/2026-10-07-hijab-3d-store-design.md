# Hijab 3D Store — Design Spec

- **Date:** 2026-10-07
- **Status:** Draft — awaiting review
- **Scope:** v1 (configurator-first). Full-store (payments/accounts/admin/DB) is a later phase.

## Summary

A single-product hijab store whose differentiator is a 3D viewer: the shopper rotates
the hijab and switches between the store's real, orderable colors. Orders are placed by
one tap into WhatsApp, prefilled. There is no runtime server, no database, and no auth —
the catalog is content, the product page is static HTML, and the only dynamic runtime is
one lazy client island.

## Project Facts

- **Brand:** blabla hijab
- **Currency:** IDR (Indonesian Rupiah)
- **Accounts:** Vercel and Sanity projects already exist
- **WhatsApp number:** pending (seed with a placeholder until provided)

## Locked Decisions

| # | Decision | Choice |
|---|---|---|
| 1 | MVP boundary | Configurator-first; no payments in v1 |
| 2 | Framework | Next.js (App Router) + TypeScript |
| 3 | CMS | Sanity (free tier) |
| 4 | 3D asset | One shared model for the whole store |
| 5 | Color semantics | Flat color value (`material.color` swap), not textures |
| 6 | Product model | Single product + color-variant picker |
| 7 | Ordering | WhatsApp deep link, no server-side order storage |
| 8 | Color set | Fixed palette of orderable colors (no free picker) |
| 9 | Model availability | None yet → placeholder model now; real GLB later |
| 10 | Device fallback | **Deferred** (no photo/capability fallback in v1) |

---

## 1. PRD

### Problem

Buying hijab online is a color-and-drape gamble. Photos flatten fabric, screens misreport
shade, and shoppers hesitate or return. The core doubt is: *"what will this actually look
like, and is this shade right?"*

### Target User

- **Shopper:** mobile-first, mid-to-low-end Android, 4G or worse. Arrives from social or
  a shared link, decides fast, orders via WhatsApp.
- **Operator:** non-technical. Adds/edits products through a no-code editor (Sanity Studio).

### Goals (v1)

- Let a shopper rotate the hijab and switch between the real, in-stock colors, so they
  understand the product before ordering.
- Convert that certainty into an order intent in one tap (WhatsApp, prefilled).
- The 3D model must be small and light, because it is the first heavy thing the page loads.

### Non-Goals (v1)

Payments/checkout, customer accounts, persistent cart, inventory sync, search/filter,
multiple models, custom (non-stocked) colors, reviews.

### Deferred (explicit)

- **Non-3D / photo fallback** for weak devices and slow networks.
- **Low-end perf hardening** (the fallback was that hardening).

> **Launch risk being accepted:** with no fallback, on a weak phone the 3D *is* the load.
> This is a deliberate trade to keep the development phase free of fallback plumbing. It is
> recorded as a **launch blocker to revisit**, not a v1 feature.

### Success Metrics

- **3D interaction rate:** % of product sessions that rotate or change color.
- **Order-intent rate:** WhatsApp clicks per product session.
- **Performance:** LCP ≤ 2.5s and INP ≤ 200ms on mid-range Android / 4G; viewer
  interactive ≤ 2s.

### Risks

| Risk | Mitigation |
|---|---|
| No model exists yet | Placeholder model now; real GLB swaps in behind the same `model` slot |
| 3D perf on low-end | Small model, lazy mount, demand rendering (fallback deferred) |
| WhatsApp friction | Prefilled message — the shopper types nothing |
| Model sourcing slips | Sourcing options + rough cost documented (see §6) |

---

## 2. Tech Stack

### Core

- **Next.js (App Router) + TypeScript.** Product page statically rendered (SSG/ISR).
- **Tailwind CSS** + minimal headless components (Radix/shadcn) only where a real widget
  needs one. No component framework.
- **pnpm**, ESLint + Prettier. No client state library.

### 3D

- **three.js** via **@react-three/fiber** + **@react-three/drei**
  (`OrbitControls`, `Environment`, `useGLTF`, `useProgress`).
- Loaded with `next/dynamic` + `ssr: false`; mounted only when it enters the viewport.
- **Recolor = `material.color.set(hex)`** on one named fabric material — no shaders, no
  textures, no post-processing.
- Model: **glTF/GLB, one fabric material, ≤ 2 MB, meshopt-compressed**.

### Content

- **Sanity** (free tier). The Studio is the operator's no-code editor and holds the content
  schema. Publish → webhook → Vercel rebuild.

### No-Backend Pieces

- **Order = WhatsApp deep link** built client-side. No endpoint.
- **Hosting: Vercel.** Analytics: Vercel Analytics or Plausible.
- **DB / auth / payments:** none.

### Quality

- **Vitest + RTL** for the logic that can silently break; **Playwright** for one smoke test.
- One linter/formatter toolchain (Next's ESLint or Biome).

### Deliberately Deferred Dependencies

Post-processing/bloom, physics, textile/KTX2 pipeline, cloth animation, search (Algolia),
DB/ORM, Stripe. All add weight; none is needed for v1.

---

## 3. User Journey

### Shopper

1. **Land** — from Instagram/WhatsApp/ad straight onto the product page. One shareable URL.
2. **Hero** — the 3D hijab is the page. Skeleton while the model fetches, then interactive.
   Title, price, one-line fabric blurb.
3. **Choose color** — a swatch row of stocked colors. Tap → the model recolors instantly
   (`material.color`), price/name update, and the **URL updates** (`?color=dusty-rose`) so any
   color is deep-linkable. Out-of-stock colors are disabled, not hidden.
4. **Explore** — orbit/zoom to judge drape; accordion for fabric/care/size.
5. **Order** — one button → WhatsApp opens a **prefilled** message. Nothing to type.
6. **Exit / share** — the colored URL is the share link, so sellers can post a specific shade.

### Operator (Sanity)

1. Log into the Studio.
2. Edit a color variant: name, **hex value**, price, stock, description, images.
3. Publish → Sanity webhook → Vercel rebuild → live in ~a minute.

### Edge Cases (no fallback, by decision)

- **Model fails to load** → explicit error state + retry; the page text stays readable.
- **Out-of-stock color** → disabled swatch + disabled Order button.
- **Slow network** → skeleton; page copy readable before the model arrives.

---

## 4. API Contracts

There is no HTTP API. These four contracts govern the build.

### A. Content contract (Sanity → build)

```ts
Product {                      // single document
  title: string
  slug: string
  description: string          // short, above the fold
  fabric: string
  care: string
  model: { glbUrl: url, fabricMaterialName: string }   // e.g. "Fabric"
  colors: ColorVariant[]       // ordered; first in-stock = default
}

ColorVariant {
  key: string                  // stable id, used in ?color=
  name: string                 // "Dusty Rose"
  hex: string                  // validated ^#[0-9a-fA-F]{6}$
  price: number
  currency: string              // ISO 4217, from an allowlist (e.g. IDR, USD, EUR)
  inStock: boolean
  sku?: string
  images: image[]              // product photos (not a 3D fallback)
}

Site { whatsappNumber: string  // E.164, digits only, no "+"
       brandName: string }
```

**Validation (enforced in the Studio):** `hex` matches the regex; at least one color;
`price > 0`; `whatsappNumber` digits-only. The site can never receive data it cannot render.

### B. WhatsApp order contract

Built entirely client-side; no endpoint.

```
https://wa.me/<whatsappNumber>?text=<encodeURIComponent(message)>

message =
  Hi! I'd like to order:
  • {title}
  • Color: {color.name}
  • Qty: {qty}
  • Price: {currency} {price}
  {pageUrl}?color={color.key}
```

**Rule:** the URL the shopper came from is the same URL that lands in WhatsApp — the seller
opens the exact shade that was ordered.

### C. 3D asset contract

Keeps recolor a one-liner.

- One `.glb`, **Y-up**, origin at model center, default facing camera, ≤ 2 MB (meshopt).
- **Exactly one material named `Fabric`** (name read from `model.fabricMaterialName`).
  Its `baseColor` must be **neutral white** so `material.color.set(hex)` multiplies to the
  true shade. A pre-tinted base is the classic bug that makes every color look wrong.
- No baked texture; roughness/metalness tuned for cloth. Any other material is fixed and
  ignored by the picker.

### D. Route + revalidation contract

- `/` renders the product (single-product store); 404 for anything else.
- `?color=<key>` selects a variant (keys are slugs: `dusty-rose`); unknown/missing → first
  in-stock color. An invalid key never 404s a valid page — it falls back to the default and
  the picker normalizes the URL.
- Sanity publish → webhook → `revalidatePath('/')`.

---

## 5. System Design Overview

```
 Sanity Studio (operator)
        │  GROQ (build-time) + webhook (revalidate)
        ▼
   Next.js  ──build──►  static HTML + product JSON  ──►  Vercel CDN  ──►  Browser
                                                                          │
                                              ┌───────────────────────────┴──────────────┐
                                        server HTML                              one client island
                                  (title · price · copy — no JS)     (ColorPicker · HijabViewer · OrderButton)
                                                                              │
                                                        fetch hijab.glb → three.js canvas
                                                        tap swatch → material.color.set(hex)
                                                        Order → wa.me deep link
```

No runtime server, no database, no auth. The only dynamic runtime is one lazy client island
on one page.

### Components

| Unit | Type | Interface | Depends on |
|---|---|---|---|
| Content layer | build | GROQ → typed `Product` | Sanity |
| Product page | server | renders `Product` → HTML, mounts island | content layer |
| `ColorPicker` | client | `(colors, value, onChange)` → swatch UI | — |
| `HijabViewer` | client, lazy | `({ glbUrl, fabricMaterialName, hex })` → canvas | **three.js** |
| `OrderButton` | client | `buildWhatsAppUrl(product, color, qty, url)` → `href` | — |
| `revalidate` route | server (tiny) | POST from Sanity → `revalidatePath('/')` | Sanity webhook |

### Isolation Rules

- **three.js is imported in exactly one file** (`HijabViewer`). Nothing else knows 3D
  exists, so experimenting with lighting/materials has a blast radius of one file.
- `buildWhatsAppUrl` is a **pure function**, testable without React or a browser.
- The page is a **server component**; it renders fully without JS. The island is additive.

### Data Flow (runtime)

Static HTML paints immediately → island hydrates → `IntersectionObserver` mounts the viewer →
GLB fetch (skeleton until ready) → `frameloop="demand"` renders only while rotating → tap
swatch → `setHex` → `material.color.set()` + `replaceState(?color=)` → Order href recomputes.

### Error Handling

- GLB fails → explicit error + retry; page still readable.
- Sanity unavailable at build → **build fails loudly**; never ship a broken page.
- Bad `?color=` → normalize to default; never 404 a valid page.
- Out of stock → disabled swatch + disabled Order button.

### Testing

- **Vitest:** `buildWhatsAppUrl` (encoding/format) and color normalization.
- **RTL:** pick color → variant + URL change.
- **Playwright (one smoke):** load → change color → assert the WhatsApp `href`.
- No tests on three.js internals.

### Performance Strategy

Static HTML + zero catalog JS; GLB ≤ 2 MB, lazy-mounted, preloaded on hover/tap; `dpr`
clamped; `frameloop="demand"` (no idle render loop — large battery/CPU win); `next/image`
for photos.

### Seam for the Full-Store Phase

DB, auth, cart, and payments attach behind this same page and the same contracts.
`Product` / `ColorVariant` do not change shape. That is the seam being protected.

---

## 6. Model Sourcing (open workstream)

No model exists yet. Options, rough effort/cost:

| Option | Quality | Cost (rough) | Time |
|---|---|---|---|
| Commission a 3D artist | Highest | $100–500+ | Days |
| Buy a stock hijab GLB, then optimize | Good | $20–100 | Hours |
| Placeholder mesh (built now), swap later | Low | $0 | Now |

**Asset brief (any route):** low-poly draped hijab; one fabric material with neutral-white
base; UV-free (color is a material tint, not a texture); Y-up; ≤ 2 MB; meshopt-compressed.

---

## 7. Open Questions

- **WhatsApp number** — pending; seed with a placeholder so Tasks 7/10 are unblocked, swap
  the real number before launch.
- ~~Brand name / currency~~ — resolved: *blabla hijab*, IDR.
- ~~Vercel / Sanity accounts~~ — resolved: projects already exist.
- **Model-sourcing route** (§6) — undecided; not a blocker (Task 5 uses the placeholder).

---

## 8. Next Step

On approval of this spec: invoke the **writing-plans** skill to produce the implementation
plan. No implementation begins before that plan.
