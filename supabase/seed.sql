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
