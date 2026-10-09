-- Stock keyed by (product_slug, variant_key) instead of SKU. Those are the identifiers the
-- cart and orders already use (lib/cart-core.ts lineKey), so the operator never has to
-- maintain SKUs in Sanity. Supersedes the sku-keyed variant_stock from 0001.
-- variant_stock was empty when this ran, so the drop loses no data.

drop table if exists variant_stock;

create table variant_stock (
  product_slug text not null,
  variant_key text not null,
  on_hand integer not null check (on_hand >= 0),
  updated_at timestamptz not null default now(),
  primary key (product_slug, variant_key)
);

alter table variant_stock enable row level security;

-- Atomically decrement stock, refusing to go negative. Returns true when applied.
create or replace function decrement_variant_stock(
  p_product_slug text,
  p_variant_key text,
  p_qty integer
)
returns boolean as $$
declare
  updated integer;
begin
  update variant_stock
     set on_hand = on_hand - p_qty,
         updated_at = now()
   where product_slug = p_product_slug
     and variant_key = p_variant_key
     and on_hand >= p_qty;
  get diagnostics updated = row_count;
  return updated > 0;
end;
$$ language plpgsql;

-- Writes an order and its items, and decrements stock, in one transaction. Prices are
-- resolved from Sanity by lib/orders.ts before the call; p_subtotal_idr is re-derived here
-- so a mismatched payload fails closed. A variant with no variant_stock row is untracked.
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
    if exists (
      select 1
        from variant_stock
       where product_slug = v_item->>'product_slug'
         and variant_key = v_item->>'variant_key'
    ) then
      if not decrement_variant_stock(
        v_item->>'product_slug',
        v_item->>'variant_key',
        (v_item->>'qty')::integer
      ) then
        raise exception 'insufficient stock for % / %',
          v_item->>'product_slug', v_item->>'variant_key';
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
