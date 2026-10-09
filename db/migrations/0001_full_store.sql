-- Orders and stock. Products stay in Sanity and the cart lives in the browser
-- (lib/cart-store.ts) — these tables only hold what an order leaves behind.
-- Apply with:
--   neon psql production --role-name neondb_owner -- -f db/migrations/0001_full_store.sql

create extension if not exists "pgcrypto";

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer jsonb not null,
  subtotal_idr integer not null check (subtotal_idr >= 0),
  shipping_idr integer not null default 0 check (shipping_idr >= 0),
  total_idr integer not null check (total_idr >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'cancelled', 'failed')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists orders_status_idx on orders (status);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_slug text not null,
  variant_key text not null,
  name text not null,
  sku text,
  qty integer not null check (qty > 0),
  price_idr integer not null check (price_idr >= 0)
);

create index if not exists order_items_order_id_idx on order_items (order_id);

-- One row per tracked SKU. A SKU with no row is treated as untracked — Sanity's `inStock`
-- stays the coarse availability switch.
create table if not exists variant_stock (
  sku text primary key,
  on_hand integer not null check (on_hand >= 0),
  updated_at timestamptz not null default now()
);

-- Only the server-side connection in lib/db.ts reaches these; there is no public HTTP data
-- API in front of them, so these policies are defence in depth.
alter table orders enable row level security;
alter table order_items enable row level security;
alter table variant_stock enable row level security;

-- Atomically decrement stock, refusing to go negative. Returns true when applied.
create or replace function decrement_variant_stock(p_sku text, p_qty integer)
returns boolean as $$
declare
  updated integer;
begin
  update variant_stock
     set on_hand = on_hand - p_qty,
         updated_at = now()
   where sku = p_sku
     and on_hand >= p_qty;
  get diagnostics updated = row_count;
  return updated > 0;
end;
$$ language plpgsql;

-- Writes an order and its items, and decrements stock, in one transaction. Prices are
-- resolved from Sanity by lib/orders.ts before the call; p_subtotal_idr is re-derived here
-- so a mismatched payload fails closed.
create or replace function create_order(
  p_customer jsonb,
  p_items jsonb,
  p_subtotal_idr integer
)
returns text as $$
declare
  v_order_number text;
  v_order_id uuid;
  v_item jsonb;
  v_total integer := 0;
begin
  if jsonb_array_length(p_items) = 0 then
    raise exception 'empty order';
  end if;

  for v_item in select item from jsonb_array_elements(p_items) as t(item) loop
    v_total := v_total + (v_item->>'price_idr')::integer * (v_item->>'qty')::integer;
  end loop;

  if v_total <> p_subtotal_idr then
    raise exception 'order total mismatch';
  end if;

  for v_item in select item from jsonb_array_elements(p_items) as t(item) loop
    if (v_item->>'sku') is not null
       and exists (select 1 from variant_stock where sku = v_item->>'sku') then
      if not decrement_variant_stock(v_item->>'sku', (v_item->>'qty')::integer) then
        raise exception 'insufficient stock for %', v_item->>'sku';
      end if;
    end if;
  end loop;

  v_order_number := 'BLB-' || to_char(now(), 'YYYYMMDD') || '-' ||
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into orders (order_number, customer, subtotal_idr, total_idr, status)
  values (v_order_number, p_customer, p_subtotal_idr, v_total, 'pending')
  returning id into v_order_id;

  insert into order_items (order_id, product_slug, variant_key, name, sku, qty, price_idr)
  select v_order_id,
         item->>'product_slug',
         item->>'variant_key',
         item->>'name',
         nullif(item->>'sku', ''),
         (item->>'qty')::integer,
         (item->>'price_idr')::integer
    from jsonb_array_elements(p_items) as t(item);

  return v_order_number;
end;
$$ language plpgsql;
