-- Synthetic local-development labels only. These are not alumni facts or claims.
insert into public.fields (name, slug)
values
  ('Software', 'software'),
  ('Jurnalisme', 'jurnalisme'),
  ('Usaha Mandiri', 'usaha-mandiri'),
  ('Pelayanan Publik', 'pelayanan-publik'),
  ('Kerja Lapangan', 'kerja-lapangan')
on conflict ((lower(name))) do nothing;

insert into public.places (name, slug)
values
  ('Usaha Mandiri', 'usaha-mandiri'),
  ('Instansi Pemerintahan', 'instansi-pemerintahan'),
  ('Komunitas Lokal', 'komunitas-lokal')
on conflict ((lower(name))) do nothing;
