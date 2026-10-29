-- Optional demo catalog. Run after schema.sql. Upload real photos from /admin.
insert into public.products (name, slug, description, price_cents, category, color_name, color_hex, featured)
values
  ('Heavyweight Pullover Hoodie', 'heavyweight-pullover-hoodie-black',
   '480gsm brushed-back cotton fleece. Boxy fit, dropped shoulders, double-lined hood.',
   11000, 'Hoodies', 'Black', '#000000', true),
  ('Essential Crewneck', 'essential-crewneck-black',
   'Midweight loopback cotton with ribbed cuffs and hem. Relaxed fit.',
   9500, 'Crewnecks', 'Black', '#000000', true),
  ('Relaxed Sweatpant', 'relaxed-sweatpant-heather',
   'Matching fleece sweatpant with elastic waist, side pockets and a tapered leg.',
   9000, 'Bottoms', 'Heather Grey', '#9a9a9a', true),
  ('Boxy Logo Tee', 'boxy-logo-tee-white',
   '260gsm combed cotton jersey. Boxy cut with a tonal embroidered mark.',
   5000, 'Tees', 'White', '#f5f5f5', true),
  ('Zip Hoodie', 'zip-hoodie-charcoal',
   'Full-zip heavyweight hoodie with metal hardware and kangaroo pockets.',
   12500, 'Hoodies', 'Charcoal', '#36393b', false),
  ('Six-Panel Cap', 'six-panel-cap-black',
   'Washed cotton twill cap with an adjustable brass buckle.',
   4000, 'Accessories', 'Black', '#000000', false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, size, stock, position)
select p.id, s.size, 20, s.pos
  from public.products p
  cross join (values ('S', 1), ('M', 2), ('L', 3), ('XL', 4)) as s(size, pos)
 where p.slug <> 'six-panel-cap-black'
on conflict (product_id, size) do nothing;

insert into public.product_variants (product_id, size, stock, position)
select id, 'One Size', 30, 1 from public.products where slug = 'six-panel-cap-black'
on conflict (product_id, size) do nothing;

-- Demo photos (free Unsplash images, hotlinked). Replace them from /admin.
update public.products set images = array[
    'https://images.unsplash.com/photo-1647797819874-f51a8a8fc5c0?w=1200&h=1200&fit=crop&q=80',
    'https://images.unsplash.com/photo-1615320876716-0fc796a5010f?w=1200&h=1200&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513789181297-6f2ec112c0bc?w=1200&h=1200&fit=crop&q=80'
  ] where slug = 'heavyweight-pullover-hoodie-black';
update public.products set images = array[
    'https://images.unsplash.com/photo-1499971856191-1a420a42b498?w=1200&h=1200&fit=crop&q=80',
    'https://images.unsplash.com/photo-1614975059251-992f11792b9f?w=1200&h=1200&fit=crop&q=80'
  ] where slug = 'essential-crewneck-black';
update public.products set images = array[
    'https://images.unsplash.com/photo-1789110520164-2389992e5d0f?w=1200&h=1200&fit=crop&q=80',
    'https://images.unsplash.com/photo-1588117260148-b47818741c74?w=1200&h=1200&fit=crop&q=80',
    'https://images.unsplash.com/photo-1602573991155-21f0143bb45c?w=1200&h=1200&fit=crop&q=80'
  ] where slug = 'relaxed-sweatpant-heather';
update public.products set images = array[
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&h=1200&fit=crop&q=80',
    'https://images.unsplash.com/photo-1778671394516-8270eac13c42?w=1200&h=1200&fit=crop&q=80',
    'https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=1200&h=1200&fit=crop&q=80'
  ] where slug = 'boxy-logo-tee-white';
update public.products set images = array[
    'https://images.unsplash.com/photo-1564858775545-e2d21c3ceee0?w=1200&h=1200&fit=crop&q=80',
    'https://images.unsplash.com/photo-1622444971167-cf7a0c4e4028?w=1200&h=1200&fit=crop&q=80'
  ] where slug = 'zip-hoodie-charcoal';
update public.products set images = array[
    'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=1200&h=1200&fit=crop&q=80',
    'https://images.unsplash.com/photo-1523380744952-b7e00e6e2ffa?w=1200&h=1200&fit=crop&q=80'
  ] where slug = 'six-panel-cap-black';
