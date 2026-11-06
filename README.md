# C.H.ILL — streetwear store

Live at **https://chill.thexdigital.com**.

Full e-commerce site built with **Next.js 16**, **Supabase** (database, auth, image storage) and **Stripe Checkout**, deployed to **Cloudflare Workers** with [OpenNext](https://opennext.js.org/cloudflare).

- Storefront: full-screen hero, shop grid with filter/sort, product pages with sizes & stock, search, slide-out bag
- Stripe Checkout with shipping address collection, flat/free shipping, webhook-confirmed orders and stock decrement
- Accounts: sign up, sign in, password reset, order history
- Admin panel (`/admin`): dashboard, products (with photo upload), orders (status + tracking), customers

Brand name, shipping rates, nav and links live in [`src/lib/site.ts`](src/lib/site.ts). Page copy (About, FAQs, Shipping, Returns…) lives in [`src/content/pages.ts`](src/content/pages.ts).

---

## 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor** → paste and run [`supabase/schema.sql`](supabase/schema.sql). (Optional: run [`supabase/seed.sql`](supabase/seed.sql) for demo products.)
3. **Authentication → URL Configuration**: set *Site URL* to `https://chill.thexdigital.com` and add `http://localhost:3000/**` and `https://chill.thexdigital.com/**` to *Redirect URLs*.
4. **Project Settings → API**: copy the URL, publishable (anon) key and secret (service role) key.

## 2. Stripe

1. **Developers → API keys**: copy the secret key (`sk_test_…` while testing).
2. **Developers → Webhooks → Add endpoint**: `https://chill.thexdigital.com/api/stripe/webhook` with events
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.refunded`.
   Copy the signing secret (`whsec_…`).

## 3. Run locally

```bash
cp .env.example .env.local   # fill in your keys
npm install
npm run dev                  # http://localhost:3000
```

To receive webhooks locally: `stripe listen --forward-to localhost:3000/api/stripe/webhook` and use the `whsec_…` it prints. (Orders are also confirmed on the success page, so checkout works even without the webhook.)

Test card: `4242 4242 4242 4242`, any future date, any CVC.

## 4. Make yourself admin

Create an account on the site, then in Supabase SQL Editor:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

Open `/admin` (or **Account → Admin panel**).

## 5. Deploy to Cloudflare Workers

```bash
npx wrangler login
# NEXT_PUBLIC_* values are baked into the build from .env.local, with
# .env.production.local (NEXT_PUBLIC_SITE_URL=https://chill.thexdigital.com) taking priority.
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npm run deploy
```

Deploying from Cloudflare's Git integration (Workers Builds) instead: build command `npx opennextjs-cloudflare build`, deploy command `npx opennextjs-cloudflare deploy`, preview command (if Preview builds are on) `npx opennextjs-cloudflare upload`, and add the three `NEXT_PUBLIC_*` values as **build** variables; the secrets above go under **Variables and Secrets**.

**Domain:** [`wrangler.jsonc`](wrangler.jsonc) attaches the worker to `chill.thexdigital.com` as a Custom Domain, which only works if `thexdigital.com` uses Cloudflare DNS in the same account. If your DNS is elsewhere, delete the `routes` block, deploy, and add a `CNAME chill → chill.<your-subdomain>.workers.dev` at your DNS provider (or move the zone to Cloudflare).

`npm run preview` builds and runs the Workers bundle locally (put server secrets in `.dev.vars`, see `.dev.vars.example`).

---

## How it fits together

| Piece | Where |
| --- | --- |
| Database schema, RLS, storage bucket | `supabase/schema.sql` |
| Supabase clients (server / browser / service role) | `src/lib/supabase/` |
| Checkout (prices & stock read from DB, never the browser) | `src/app/(site)/checkout/actions.ts` |
| Payment confirmation (idempotent) | `src/lib/orders.ts`, `mark_order_paid()` in SQL |
| Stripe webhook | `src/app/api/stripe/webhook/route.ts` |
| Auth actions | `src/app/(site)/auth-actions.ts`, `src/app/auth/callback/route.ts` |
| Admin panel | `src/app/admin/` |
| Bag (persisted in localStorage) | `src/store/cart.ts` |

**Security notes**
- Row Level Security is on for every table. Customers can only read their own orders; only admins can write products. Users can't change their own `role`.
- The service-role key is only used on the server (`src/lib/supabase/admin.ts` is `server-only`).
- Stock is checked when checkout starts and decremented when payment succeeds.

**Images:** upload product photos in the admin panel. For a hero photo or a logo image, drop the files in `public/` and set `heroImage` / `logo` in `src/lib/site.ts`.
