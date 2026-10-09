# blabla hijab

Single-product hijab store: a statically rendered product page with a **tap-gated** three.js
viewer that rotates the hijab and recolours it across the store's real colours. Orders go out
as a prefilled WhatsApp message. No server, database, auth, or payments in v1.

The viewer deliberately loads only when the shopper taps **Lihat dalam 3D** — three.js is
~250 KB gzip, and loading it on arrival dominated mobile TBT (see the measurements in
`tasks/plan.md`).

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
| `DATABASE_URL` | Neon pooled Postgres connection string — orders and stock (server-only) |

## Store data (orders + stock)

Products and prices live in Sanity; orders and stock live in Neon Postgres. The cart is
**client-side** — `lib/cart-store.ts` keeps it in `localStorage`, and the server never sees it until
checkout. The checkout action re-validates every line against Sanity (price, currency,
availability), then the `create_order` SQL function writes the order and decrements stock in a
single transaction. Customers confirm via the WhatsApp handoff on `/orders/[orderNumber]`; there is
no payment provider.

Link the project, then apply the schema to the branch:

```bash
neon link --project-id <project-id> --branch production -y   # writes .neon and pulls DATABASE_URL
for f in db/migrations/*.sql; do                             # apply every migration, in order
  neon psql production --role-name neondb_owner -- -f "$f"
done
```

Stock lives in `variant_stock(product_slug, variant_key, on_hand)`, keyed the same way the cart and
orders already identify a variant — so there are no SKUs to maintain in Sanity. A variant with no
row is untracked and never blocks an order. `create_order` checks and decrements inside the order
transaction and raises on oversell, so the database is the enforcement point; Sanity's `inStock`
flag stays the coarse availability switch.

The seeded quantities are **placeholders** — set the real ones:

```sql
insert into variant_stock (product_slug, variant_key, on_hand)
values ('hijab-premium', 'dusty-rose', 25)
on conflict (product_slug, variant_key) do update set on_hand = excluded.on_hand;
```

Checkout is IDR-only, so a variant priced in another currency can never be ordered.

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

Vercel. Set `SANITY_REVALIDATE_SECRET` and `DATABASE_URL` in the project environment, then add a
Sanity webhook (publish → `https://<domain>/api/revalidate?secret=…`).

The Studio is not embedded in the Next app (Next 16 + Turbopack cannot bundle Sanity Studio's
SWR dependency) — deploy it with `pnpm studio:deploy`.
