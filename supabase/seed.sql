-- Synthetic development seed data for SoonWiki
-- All profiles, journeys, and stories here are synthetic demonstrations for local development.

-- 1. Fields
insert into public.fields (name, slug)
values
  ('Software', 'software'),
  ('Jurnalisme', 'jurnalisme'),
  ('Usaha Mandiri', 'usaha-mandiri'),
  ('Pelayanan Publik', 'pelayanan-publik'),
  ('Kerja Lapangan', 'kerja-lapangan'),
  ('Karya Kreatif', 'karya-kreatif'),
  ('Pendidikan', 'pendidikan'),
  ('Desain', 'desain')
on conflict ((lower(name))) do update set slug = excluded.slug;

-- 2. Places
insert into public.places (name, slug, website_url)
values
  ('Yayasan Teknologi Terbuka Indonesia', 'yayasan-teknologi-terbuka-indonesia', 'https://example.org/tekno-terbuka'),
  ('Studio Cerita Nusantara', 'studio-cerita-nusantara', 'https://example.org/cerita-nusantara'),
  ('Kebun Kolektif Mandiri', 'kebun-kolektif-mandiri', 'https://example.org/kebun-kolektif'),
  ('Dinas Perhubungan & Tata Kota', 'dinas-perhubungan-tata-kota', 'https://example.gov.id/dishub'),
  ('Kolektif Desain Inklusif', 'kolektif-desain-inklusif', 'https://example.org/desain-inklusif'),
  ('Rumah Baca Pesisir', 'rumah-baca-pesisir', 'https://example.org/baca-pesisir')
on conflict ((lower(name))) do update set
  slug = excluded.slug,
  website_url = excluded.website_url;

-- 3. Auth Users & Members
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
)
values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'nadia.pramesti@example.com', '', now(), null, now(), '{"provider":"google","providers":["google"]}', '{"full_name":"Nadia Pramesti"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rian.mahendra@example.com', '', now(), null, now(), '{"provider":"google","providers":["google"]}', '{"full_name":"Rian Mahendra"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'siti.nurhaliza@example.com', '', now(), null, now(), '{"provider":"google","providers":["google"]}', '{"full_name":"Siti Nurhaliza"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'bima.arya@example.com', '', now(), null, now(), '{"provider":"google","providers":["google"]}', '{"full_name":"Bima Arya"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'farhan.akbar@example.com', '', now(), null, now(), '{"provider":"google","providers":["google"]}', '{"full_name":"Farhan Akbar"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'clarissa.utami@example.com', '', now(), null, now(), '{"provider":"google","providers":["google"]}', '{"full_name":"Clarissa Utami"}', now(), now(), '', '', '', '')
on conflict (id) do update set email = excluded.email;

insert into public.members (user_id, role, status, joined_at)
values
  ('00000000-0000-0000-0000-000000000001', 'admin', 'active', now() - interval '300 days'),
  ('00000000-0000-0000-0000-000000000002', 'member', 'active', now() - interval '250 days'),
  ('00000000-0000-0000-0000-000000000003', 'member', 'active', now() - interval '200 days'),
  ('00000000-0000-0000-0000-000000000004', 'member', 'active', now() - interval '150 days'),
  ('00000000-0000-0000-0000-000000000005', 'member', 'active', now() - interval '100 days'),
  ('00000000-0000-0000-0000-000000000006', 'member', 'active', now() - interval '50 days')
on conflict (user_id) do update set role = excluded.role, status = excluded.status;

-- 4. Profiles
insert into public.profiles (
  id, owner_id, name, slug, photo_path, generation_key, bio, location,
  current_activity, current_place_id, since_soon_story, turning_point_story,
  current_direction_story, linkedin_url, instagram_url, website_url, is_published, created_at, updated_at
)
values
  (
    '30000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Nadia Pramesti',
    'nadia-pramesti',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    '2-0',
    'Membangun infrastruktur perangkat lunak terbuka untuk komunitas dan inisiatif sipil.',
    'Bandung, Jawa Barat',
    'Tech Lead & Pengembang Komunitas Open Source',
    (select id from public.places where slug = 'yayasan-teknologi-terbuka-indonesia'),
    'Setelah lulus SOON, saya sempat mengejar jalur korporasi teknologi selama 3 tahun. Jalur itu mengajarkan disiplin engineering skala besar, tetapi saya merasa kode yang saya tulis jauh dari masalah nyata di sekitar.',
    'Titik balik terjadi saat saya membantu sistem pencatatan pangan di desa lereng Gunung Ciremai. Di sana saya melihat bagaimana perangkat lunak yang sederhana tapi tepat guna bisa mengubah transparansi desa secara langsung.',
    'Sekarang saya mendedikasikan waktu penuh memimpin tim relawan pengembang untuk menciptakan modul data terbuka yang mudah dirawat oleh pengurus komunitas lokal.',
    'https://linkedin.com/in/nadiapramesti',
    'https://instagram.com/nadiapramesti',
    'https://nadiapramesti.dev',
    true,
    now() - interval '300 days',
    now() - interval '2 days'
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'Rian Mahendra',
    'rian-mahendra',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    'beta',
    'Pembuat film dokumenter dan jurnalis visual yang fokus pada isu krisis iklim dan ruang hidup masyarakat pesisir.',
    'Makassar, Sulawesi Selatan',
    'Dokumenter & Jurnalis Visual Independen',
    (select id from public.places where slug = 'studio-cerita-nusantara'),
    'Sejak menyelesaikan SOON, saya bergabung dengan ruang redaksi televisi berita harian. Bekerja dengan tenggat waktu ketat membuat saya memahami bagaimana berita diproduksi dan disebarluaskan.',
    'Saya sadar ritme berita cepat sering kali menenggelamkan cerita-cerita mendalam yang butuh waktu berbulan-bulan untuk didengarkan secara utuh, bukan sekadar dipotong jadi klip 30 detik.',
    'Fokus saya saat ini adalah menggarap seri dokumenter panjang bersama nelayan tradisional mengenai abrasi pantai dan kedaulatan laut nusantara.',
    'https://linkedin.com/in/rianmahendra',
    'https://instagram.com/rianvisuals',
    'https://ceritanusantara.studio',
    true,
    now() - interval '250 days',
    now() - interval '5 days'
  ),
  (
    '30000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003',
    'Siti Nurhaliza',
    'siti-nurhaliza',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80',
    'hybrid',
    'Penggerak kedaulatan pangan perkotaan dan rantai pasok pertanian organik berkeadilan.',
    'Yogyakarta',
    'Founder Inisiatif Pangan Berkelanjutan',
    (select id from public.places where slug = 'kebun-kolektif-mandiri'),
    'Lulus dari SOON di masa pandemi membuka mata saya tentang rapuhnya ketahanan rantai pasok kebutuhan dasar di kota-kota besar.',
    'Daripada kembali ke rutinitas kantor, saya memutuskan tinggal bersama kelompok tani di Kulon Progo selama 6 bulan untuk memahami langsung struktur harga dan kendala distribusi hasil tani.',
    'Kini kami mengelola koperasi distribusi langsung yang menghubungkan 120 keluarga petani dengan konsumen rumah tangga tanpa tengkulak.',
    'https://linkedin.com/in/sitinurhaliza',
    'https://instagram.com/kebun.siti',
    'https://kebunkolektif.org',
    true,
    now() - interval '200 days',
    now() - interval '10 days'
  ),
  (
    '30000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000004',
    'Bima Arya',
    'bima-arya',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    'cov19',
    'Mendedikasikan diri dalam perencanaan tata kota ramah warga, trotoar aman, dan integrasi angkutan umum.',
    'Surabaya, Jawa Timur',
    'Analis Kebijakan Transportasi Publik',
    (select id from public.places where slug = 'dinas-perhubungan-tata-kota'),
    'Bagi saya, SOON mengajarkan cara berpikir sistemik. Saya memilih masuk ke sektor birokrasi pemerintahan karena di sanalah keputusan alokasi anggaran publik dibuat.',
    'Tantangan birokrasi memang berat, tapi ketika satu rute bus feeder berhasil diintegrasikan dengan stasiun komuter, ribuan orang merasakan manfaatnya setiap hari.',
    'Fokus ke depan adalah merancang pedoman jalur ramah sepeda dan pejalan kaki untuk 5 kawasan pusat kota sekunder di Jawa Timur.',
    'https://linkedin.com/in/bimaaryakota',
    null,
    'https://dishub.jatimprov.go.id',
    true,
    now() - interval '150 days',
    now() - interval '15 days'
  ),
  (
    '30000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000005',
    'Farhan Akbar',
    'farhan-akbar',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    'metaverse',
    'Merancang produk digital yang inklusif dan dapat diakses dengan mudah oleh semua orang tanpa terkecuali.',
    'Jakarta Selatan',
    'Desainer Produk & Fasilitator Desain Aksesibel',
    (select id from public.places where slug = 'kolektif-desain-inklusif'),
    'Awalnya saya hanya mengejar portofolio visual yang estetik di platform desain. Namun SOON menanamkan empati pada siapa sebenarnya yang menggunakan karya kita.',
    'Ketika pertama kali mendampingi teman tunanetra mencoba memesan tiket layanan kesehatan lewat aplikasi dan gagal berulang kali karena kontras warna dan ketiadaan label alt, cara pandang saya berubah total.',
    'Hari ini saya mengadvokasi standar aksesibilitas WCAG di berbagai startup dan rutin mengadakan lokakarya desain inklusif untuk generasi muda.',
    'https://linkedin.com/in/farhanakbardesign',
    'https://instagram.com/farhan.uiux',
    'https://farhandesign.co',
    true,
    now() - interval '100 days',
    now() - interval '20 days'
  ),
  (
    '30000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000006',
    'Clarissa Utami',
    'clarissa-utami',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    'reborn',
    'Membangun ruang aman belajar dan mendengarkan cerita anak-anak di pelosok kepulauan.',
    'Kepulauan Riau',
    'Penggerak Literasi & Penulis',
    (select id from public.places where slug = 'rumah-baca-pesisir'),
    'Sebagai lulusan baru SOON, saya memilih untuk tidak langsung terburu-buru mengejar tangga karier formal di ibu kota.',
    'Saya membawa dua koper penuh buku bacaan anak ke pulau kecil di Kepulauan Riau dan memulai sesi bercerita mingguan di balai desa.',
    'Saat ini kami sudah mengelola tiga rumah baca mandiri dan melatih 15 relawan pemuda setempat untuk mengajar kelas menulis kreatif.',
    'https://linkedin.com/in/clarissautami',
    'https://instagram.com/clarissa.baca',
    'https://rumahbacapesisir.org',
    true,
    now() - interval '50 days',
    now() - interval '25 days'
  )
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  photo_path = excluded.photo_path,
  generation_key = excluded.generation_key,
  bio = excluded.bio,
  location = excluded.location,
  current_activity = excluded.current_activity,
  current_place_id = excluded.current_place_id,
  since_soon_story = excluded.since_soon_story,
  turning_point_story = excluded.turning_point_story,
  current_direction_story = excluded.current_direction_story,
  linkedin_url = excluded.linkedin_url,
  instagram_url = excluded.instagram_url,
  website_url = excluded.website_url,
  is_published = excluded.is_published,
  updated_at = excluded.updated_at;

-- 5. Profile Fields Mapping
delete from public.profile_fields
where profile_id in (
  '30000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000003',
  '30000000-0000-0000-0000-000000000004',
  '30000000-0000-0000-0000-000000000005',
  '30000000-0000-0000-0000-000000000006'
);

insert into public.profile_fields (profile_id, field_id)
select p.id, f.id
from (
  values
    ('30000000-0000-0000-0000-000000000001'::uuid, 'software'),
    ('30000000-0000-0000-0000-000000000001'::uuid, 'pelayanan-publik'),
    ('30000000-0000-0000-0000-000000000002'::uuid, 'jurnalisme'),
    ('30000000-0000-0000-0000-000000000002'::uuid, 'karya-kreatif'),
    ('30000000-0000-0000-0000-000000000003'::uuid, 'usaha-mandiri'),
    ('30000000-0000-0000-0000-000000000003'::uuid, 'kerja-lapangan'),
    ('30000000-0000-0000-0000-000000000004'::uuid, 'pelayanan-publik'),
    ('30000000-0000-0000-0000-000000000005'::uuid, 'desain'),
    ('30000000-0000-0000-0000-000000000005'::uuid, 'pendidikan'),
    ('30000000-0000-0000-0000-000000000006'::uuid, 'pendidikan'),
    ('30000000-0000-0000-0000-000000000006'::uuid, 'karya-kreatif')
) as map(profile_id, field_slug)
join public.profiles p on p.id = map.profile_id
join public.fields f on f.slug = map.field_slug
on conflict do nothing;

-- 6. Journey Entries
delete from public.journey_entries
where profile_id in (
  '30000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000003',
  '30000000-0000-0000-0000-000000000004',
  '30000000-0000-0000-0000-000000000005',
  '30000000-0000-0000-0000-000000000006'
);

insert into public.journey_entries (
  id, profile_id, activity, place_id, start_year, end_year, story, sort_order
)
values
  -- Nadia
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Software Engineer', null, 2019, 2022, 'Mengembangkan platform komputasi cloud dan arsitektur backend untuk produk berskala jutaan pengguna harian.', 0),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'Tech Lead Komunitas', (select id from public.places where slug = 'yayasan-teknologi-terbuka-indonesia'), 2022, null, 'Memimpin tim perancang platform data desa terbuka dan mengorganisir puluhan lokakarya digitalisasi akar rumput.', 1),
  
  -- Rian
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', 'Jurnalis Lapangan', null, 2018, 2021, 'Meliput peristiwa harian, isu lingkungan regional, dan kebencanaan di berbagai pulau di Indonesia Timur.', 0),
  ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', 'Dokumenter Independen', (select id from public.places where slug = 'studio-cerita-nusantara'), 2021, null, 'Memproduksi film dokumenter berbasis riset komunitas dan menerbitkan esai foto lingkungan hidup.', 1),

  -- Siti
  ('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000003', 'Riset Ketahanan Pangan', null, 2021, 2022, 'Tinggal bersama komunitas tani dan memetakan pola distribusi komoditas pangan segar.', 0),
  ('40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000003', 'Founder & Pengelola Koperasi', (select id from public.places where slug = 'kebun-kolektif-mandiri'), 2022, null, 'Mengembangkan platform logistik pangan kolektif yang adil bagi petani dan terjangkau bagi konsumen.', 1),

  -- Bima
  ('40000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000004', 'Staf Perencanaan Transportasi', (select id from public.places where slug = 'dinas-perhubungan-tata-kota'), 2020, null, 'Menyusun rekomendasi rute angkutan umum massal berbasis data mobilitas warga kota.', 0),

  -- Farhan
  ('40000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000005', 'UI/UX Designer', null, 2022, 2023, 'Mendesain antarmuka sistem transaksi perbankan dan e-commerce digital.', 0),
  ('40000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000005', 'Fasilitator Desain Aksesibel', (select id from public.places where slug = 'kolektif-desain-inklusif'), 2023, null, 'Mengembangkan standarisasi desain inklusif dan membagikan panduan gratis kepada ribuan praktisi.', 1),

  -- Clarissa
  ('40000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000006', 'Penggiat Rumah Baca', (select id from public.places where slug = 'rumah-baca-pesisir'), 2023, null, 'Menginisiasi perpustakaan desa pesisir dan membina komunitas pemuda pengajar.', 0)
on conflict (id) do update set
  activity = excluded.activity,
  place_id = excluded.place_id,
  start_year = excluded.start_year,
  end_year = excluded.end_year,
  story = excluded.story,
  sort_order = excluded.sort_order;

-- 7. Proud Moments
delete from public.proud_moments
where profile_id in (
  '30000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000003',
  '30000000-0000-0000-0000-000000000004',
  '30000000-0000-0000-0000-000000000005',
  '30000000-0000-0000-0000-000000000006'
);

insert into public.proud_moments (
  id, profile_id, title, description, place_id, year, image_path, external_url
)
values
  (
    '50000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    'Peluncuran Sistem Data Terbuka Desa Mandiri',
    'Platform keterbukaan informasi publik tingkat desa yang berhasil diimplementasikan di 40 desa di Jawa Barat, mempermudah transparansi APBDes dan penyaluran bantuan sosial.',
    (select id from public.places where slug = 'yayasan-teknologi-terbuka-indonesia'),
    2023,
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    'https://example.org/tekno-terbuka/desa-mandiri'
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000002',
    'Dokumenter "Napas Terakhir Pesisir"',
    'Film dokumenter investigatif selama 14 bulan yang memotret perjuangan masyarakat adat pesisir mempertahankan ruang hidup mereka dari ancaman reklamasi tambang.',
    (select id from public.places where slug = 'studio-cerita-nusantara'),
    2022,
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    'https://example.org/cerita-nusantara/napas-pesisir'
  ),
  (
    '50000000-0000-0000-0000-000000000003',
    '30000000-0000-0000-0000-000000000003',
    'Jaringan Distribusi 120 Petani Organik Langsung',
    'Membangun sistem distribusi berbasis komunitas yang berhasil memangkas 4 rantai tengkulak dan meningkatkan margin pendapatan keluarga petani hingga 35%.',
    (select id from public.places where slug = 'kebun-kolektif-mandiri'),
    2024,
    'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1200&q=80',
    'https://example.org/kebun-kolektif/dampak'
  ),
  (
    '50000000-0000-0000-0000-000000000004',
    '30000000-0000-0000-0000-000000000005',
    'Panduan Desain Aksesibel Bahasa Indonesia',
    'Buku panduan desain digital yang membahas kontras, screen reader hierarchy, dan navigasi keyboard yang telah diunduh lebih dari 5.000 desainer di Indonesia.',
    (select id from public.places where slug = 'kolektif-desain-inklusif'),
    2023,
    'https://images.unsplash.com/photo-1581291518655-9523c932edcf?auto=format&fit=crop&w=1200&q=80',
    'https://example.org/desain-inklusif/panduan'
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  place_id = excluded.place_id,
  year = excluded.year,
  image_path = excluded.image_path,
  external_url = excluded.external_url;

-- 8. Memories (Galeri Kenangan)
insert into public.memories (
  id, author_id, title, story, generation_key, media_type, media_path, media_aspect_ratio,
  memory_year, location_tag, is_published, created_at
)
values
  (
    '60000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Malam Refleksi & Api Unggun Gathering Nasional SOON',
    'Momen di mana kami semua berkumpul melingkari api unggun di Lembang, saling berbagi keresahan, air mata, dan harapan besar setelah berbulan-bulan berproses bersama. Suasana malam itu membuktikan bahwa ikatan di SOON melampaui sekadar rekan kerja atau rekan belajar.',
    'superteam',
    'image',
    'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80',
    '16/10',
    2023,
    'Lembang, Bandung',
    true,
    now() - interval '90 days'
  ),
  (
    '60000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'Hackathon 48 Jam & Demo Karya Proyek Akhir',
    'Foto ini diambil tepat pukul 04:00 subuh saat kami menyelesaikan sprint terakhir sebelum demo day di hadapan para mentor. Secangkir kopi dingin dan layar penuh baris kode menjadi saksi lahirnya solusi yang kini bermanfaat luas.',
    'sobat-skawan',
    'image',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    '16/10',
    2024,
    'Coworking Space Jakarta',
    true,
    now() - interval '45 days'
  ),
  (
    '60000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003',
    'Wisuda Akbar & Pelukan Terakhir di Kampus',
    'Hari kelulusan yang penuh haru. Mengenakan toga bersama rekan-rekan seperjuangan setelah melewati perjalanan panjang yang penuh tantangan. Kami berjanji untuk terus saling mendukung di mana pun jalan hidup membawa kami.',
    'beta',
    'image',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    '4/3',
    2022,
    'Auditorium Utama',
    true,
    now() - interval '180 days'
  )
on conflict (id) do update set
  title = excluded.title,
  story = excluded.story,
  generation_key = excluded.generation_key,
  media_path = excluded.media_path,
  location_tag = excluded.location_tag;

-- 9. Memory Comments
insert into public.memory_comments (
  id, memory_id, author_id, content, created_at
)
values
  (
    '70000000-0000-0000-0000-000000000001',
    '60000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'Masih ingat banget waktu itu udara dingin banget tapi hati hangat karena cerita-cerita kalian semua. Kangen masa ini!',
    now() - interval '85 days'
  ),
  (
    '70000000-0000-0000-0000-000000000002',
    '60000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000003',
    'Momen terbaik sepanjang di SOON. Semoga kita bisa adakan gathering seperti ini lagi ya!',
    now() - interval '80 days'
  ),
  (
    '70000000-0000-0000-0000-000000000003',
    '60000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Perjuangan subuh yang sangat berharga! Bangga sekali bisa satu tim dengan kalian.',
    now() - interval '40 days'
  )
on conflict (id) do update set content = excluded.content;

-- 10. Memory Reactions
insert into public.memory_reactions (
  id, memory_id, user_id, reaction_type, created_at
)
values
  ('80000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'heart', now()),
  ('80000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'nostalgic', now()),
  ('80000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'sparkle', now()),
  ('80000000-0000-0000-0000-000000000004', '60000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'proud', now()),
  ('80000000-0000-0000-0000-000000000005', '60000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'heart', now())
on conflict (id) do nothing;

