-- ============================================================================
-- Store schema. Run once in Supabase → SQL Editor (safe to re-run).
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Profiles (one per auth user). `role` decides who can use /admin.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  role        text not null default 'customer' check (role in ('customer', 'admin')),
  created_at  timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  slug              text not null unique,
  description       text not null default '',
  price_cents       integer not null check (price_cents >= 0),
  compare_at_cents  integer check (compare_at_cents >= 0),
  category          text,
  color_name        text,
  color_hex         text,
  images            text[] not null default '{}',
  active            boolean not null default true,
  featured          boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists public.product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  size        text not null,
  sku         text,
  stock       integer not null default 0 check (stock >= 0),
  position    integer not null default 0,
  unique (product_id, size)
);

create index if not exists product_variants_product_id_idx on public.product_variants (product_id);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id                     uuid primary key default gen_random_uuid(),
  number                 bigint generated always as identity (start with 1001) unique,
  user_id                uuid references auth.users (id) on delete set null,
  email                  text,
  status                 text not null default 'pending'
                           check (status in ('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded')),
  currency               text not null default 'usd',
  subtotal_cents         integer not null default 0,
  shipping_cents         integer not null default 0,
  tax_cents              integer not null default 0,
  total_cents            integer not null default 0,
  stripe_session_id      text unique,
  stripe_payment_intent  text,
  shipping_name          text,
  shipping_address       jsonb,
  tracking_number        text,
  notes                  text,
  created_at             timestamptz not null default now(),
  paid_at                timestamptz
);

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);

create table if not exists public.order_items (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid not null references public.orders (id) on delete cascade,
  product_id        uuid references public.products (id) on delete set null,
  variant_id        uuid references public.product_variants (id) on delete set null,
  product_name      text not null,
  size              text,
  image             text,
  unit_price_cents  integer not null,
  quantity          integer not null check (quantity > 0)
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

-- Called by the server (service role) when Stripe confirms payment.
-- Idempotent: only the first call for a session flips it to paid and takes stock.
create or replace function public.mark_order_paid(
  p_session_id      text,
  p_payment_intent  text,
  p_email           text,
  p_name            text,
  p_address         jsonb,
  p_shipping_cents  integer,
  p_tax_cents       integer,
  p_total_cents     integer
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
begin
  update public.orders
     set status                = 'paid',
         paid_at               = now(),
         stripe_payment_intent = coalesce(p_payment_intent, stripe_payment_intent),
         email                 = coalesce(email, p_email),
         shipping_name         = p_name,
         shipping_address      = p_address,
         shipping_cents        = coalesce(p_shipping_cents, shipping_cents),
         tax_cents             = coalesce(p_tax_cents, tax_cents),
         total_cents           = coalesce(p_total_cents, total_cents)
   where stripe_session_id = p_session_id
     and status in ('pending', 'cancelled')
  returning id into v_order_id;

  if v_order_id is null then
    return null;
  end if;

  update public.product_variants v
     set stock = greatest(v.stock - oi.quantity, 0)
    from public.order_items oi
   where oi.order_id = v_order_id
     and oi.variant_id = v.id;

  return v_order_id;
end;
$$;

revoke execute on function public.mark_order_paid(text, text, text, text, jsonb, integer, integer, integer) from public, anon, authenticated;
grant execute on function public.mark_order_paid(text, text, text, text, jsonb, integer, integer, integer) to service_role;

-- ---------------------------------------------------------------------------
-- Privileges (explicit, so this works with "Automatically expose new tables"
-- turned off). RLS below still decides which rows each user can touch.
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;

grant select on public.products, public.product_variants to anon, authenticated;
grant insert, update, delete on public.products, public.product_variants to authenticated;
grant select on public.profiles to authenticated;
grant select, update on public.orders to authenticated;
grant select on public.order_items to authenticated;

grant all on public.profiles, public.products, public.product_variants, public.orders, public.order_items to service_role;
grant usage, select on all sequences in schema public to service_role;

grant execute on function public.is_admin() to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles         enable row level security;
alter table public.products         enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders           enable row level security;
alter table public.order_items      enable row level security;

-- profiles: users see/edit their own name; admins see everyone. Nobody can
-- change their own role from the client (column-level grant below).
drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

revoke update on public.profiles from authenticated, anon;
grant update (full_name) on public.profiles to authenticated;

-- products & variants: public can read active products; admins manage all.
drop policy if exists "products read" on public.products;
create policy "products read" on public.products
  for select using (active or public.is_admin());

drop policy if exists "products admin write" on public.products;
create policy "products admin write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "variants read" on public.product_variants;
create policy "variants read" on public.product_variants
  for select using (
    exists (select 1 from public.products p where p.id = product_id and (p.active or public.is_admin()))
  );

drop policy if exists "variants admin write" on public.product_variants;
create policy "variants admin write" on public.product_variants
  for all using (public.is_admin()) with check (public.is_admin());

-- orders: customers read their own; admins read/update all. Orders are created
-- only by the server with the service role key, which bypasses RLS.
drop policy if exists "orders read" on public.orders;
create policy "orders read" on public.orders
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "orders admin update" on public.orders;
create policy "orders admin update" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "order items read" on public.order_items;
create policy "order items read" on public.order_items
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
  );

-- ---------------------------------------------------------------------------
-- Storage bucket for product photos (public read, admin write)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "product images read" on storage.objects;
create policy "product images read" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "product images admin insert" on storage.objects;
create policy "product images admin insert" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product images admin update" on storage.objects;
create policy "product images admin update" on storage.objects
  for update using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product images admin delete" on storage.objects;
create policy "product images admin delete" on storage.objects
  for delete using (bucket_id = 'product-images' and public.is_admin());
