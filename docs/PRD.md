# PRD — SoonWiki

**Product:** SoonWiki
**Version:** MVP / v1.0
**Status:** Approved with 2026-09-01 direction addendum
**Tagline:** **From Soon, Everywhere.**

---

## Approved Direction Addendum — 1 September 2026

Bagian ini memiliki precedence atas requirement lama yang bertentangan. Detail lengkap berada di `docs/superpowers/specs/2026-09-01-soonwiki-supabase-story-first-design.md`.

- Product hierarchy berubah dari search-first directory menjadi story-first living alumni archive. Search tetap tersedia di Explore sebagai utility sekunder.
- PRD tetap menjadi functional scope MVP, tetapi bahasa dan model tidak boleh mengasumsikan semua alumni bekerja di perusahaan atau menjalani career path formal.
- Istilah UI utama berubah: `career` menjadi `perjalanan`, `role` menjadi `peran atau kegiatan`, `company` menjadi `tempat, organisasi, atau usaha` dan bersifat opsional, `expertise` menjadi `hal yang ditekuni`, serta `achievement` menjadi `hal yang dibanggakan`.
- Profile menambahkan tiga prompt naratif opsional: perubahan sejak SOON, turning point terbesar, dan apa yang sedang dibangun atau dituju sekarang.
- Backend menggunakan Supabase penuh untuk database, Google OAuth, Storage, RLS, database functions, dan Edge Functions. Express, Drizzle, Better Auth, Resend, serta S3-compatible storage tidak digunakan.
- Registrasi menggunakan reusable shared invitation link diikuti Google OAuth. Link dapat dipakai puluhan orang, satu akun hanya dapat redeem satu kali, dan admin dapat revoke atau rotate link.
- Frontend menggunakan Astro SSR + Svelte islands dan package `motion` JavaScript. Visual world tetap Lembar Kontak Redaksi dengan pengalaman mobile-first.
- Repository tidak boleh memiliki unit, integration, atau E2E test scripts maupun test code. Verification menggunakan lint, typecheck, schema lint, production build, dan manual review.

---

## 1. Product Overview

**SoonWiki** adalah living alumni archive untuk mendokumentasikan member aktif dan alumni Soon, termasuk:

* apa yang sedang mereka jalani,
* peran, kegiatan, atau hal yang mereka tekuni,
* perjalanan dan turning point mereka,
* tempat, organisasi, atau usaha jika relevan,
* serta hal yang mereka banggakan.

SoonWiki dapat diakses secara publik tanpa login.

Member/alumni yang telah login dapat membuat dan mengelola profil mereka sendiri. Admin dapat mengelola seluruh data.

SoonWiki bukan social media dan bukan pengganti LinkedIn. Fokusnya adalah menjadi **collective directory dan showcase perjalanan SoonMates setelah maupun selama berada di Soon.**

### Product statement

> **SoonWiki is a map of where Soon has gone.**

---

# 2. Background

Saat ini informasi mengenai aktivitas, pekerjaan, pencapaian, dan perjalanan alumni/member Soon tersebar di berbagai tempat:

* grup chat,
* Instagram,
* LinkedIn,
* percakapan personal,
* dokumentasi internal,
* dan postingan individual.

Contohnya, ketika seseorang mengetahui bahwa seorang alumni terlibat dalam project besar, informasi tersebut biasanya hanya dibagikan melalui grup chat dan kemudian tenggelam.

Akibatnya:

* sulit mengetahui alumni sekarang berada di mana,
* sulit menemukan member dengan expertise tertentu,
* achievement alumni tidak terdokumentasi,
* knowledge mengenai jaringan Soon hilang seiring waktu,
* member baru tidak memiliki gambaran mengenai perjalanan alumni sebelumnya.

SoonWiki dibuat sebagai tempat terpusat untuk mengarsipkan informasi tersebut.

---

# 3. Problem Statement

Saat seseorang ingin mengetahui:

> “Siapa alumni Soon yang sekarang bekerja di media?”

atau:

> “Siapa yang bekerja di Gojek?”

atau:

> “Ada alumni yang sekarang jadi filmmaker?”

atau:

> “Apa saja hal keren yang pernah dilakukan member Soon?”

Saat ini tidak ada sumber informasi terpusat yang dapat menjawab pertanyaan tersebut.

SoonWiki harus membuat informasi tersebut **mudah ditemukan, mudah diperbarui, dan mudah dibagikan.**

---

# 4. Goals

MVP SoonWiki memiliki lima objective utama.

### G1 — Member Discovery

Pengunjung dapat menemukan member/alumni berdasarkan:

* nama,
* perusahaan,
* expertise,
* industry,
* batch/tahun.

### G2 — Member Profile

Setiap Soonie dapat memiliki halaman profil publik yang menunjukkan:

* siapa dirinya,
* perjalanan di Soon,
* pekerjaan sekarang,
* riwayat pekerjaan jika ingin ditambahkan,
* expertise,
* achievement.

### G3 — Achievement Documentation

SoonMates dapat mendokumentasikan berbagai hal yang mereka banggakan tanpa harus mengikuti kategori pencapaian yang terlalu ketat.

### G4 — Community Showcase

SoonWiki menunjukkan secara kolektif bagaimana member Soon tersebar ke berbagai:

* profesi,
* perusahaan,
* bidang,
* project,
* dan achievement.

### G5 — Self-maintained Directory

Member dan alumni dapat memperbarui informasi mereka sendiri tanpa membutuhkan admin sebagai bottleneck.

---

# 5. Non-Goals

MVP SoonWiki **tidak bertujuan** menjadi:

* LinkedIn clone,
* social media,
* job marketplace,
* messaging platform,
* community forum,
* portfolio builder,
* recruitment platform.

Fitur berikut **tidak termasuk MVP**:

* follow,
* like,
* comment,
* direct messaging,
* friend/connection request,
* recommendation algorithm,
* complex notification,
* endorsement,
* verification badge,
* approval workflow,
* AI search,
* job board.

---

# 6. Target Users

## 6.1 Public Visitor

Siapa pun yang mengakses SoonWiki.

Tujuan utama:

* mencari seseorang,
* melihat profil SoonMates,
* melihat alumni bekerja di mana,
* melihat expertise,
* melihat achievement.

Tidak membutuhkan login.

---

## 6.2 Soonie

Member aktif atau alumni Soon.

Memiliki seluruh akses public visitor ditambah:

* membuat profil,
* mengedit profil sendiri,
* menambahkan career history,
* menambahkan achievement,
* menghapus informasi miliknya sendiri.

Memerlukan login.

---

## 6.3 Admin

Pengelola SoonWiki.

Admin dapat:

* mengelola seluruh profil,
* membuat profil,
* mengedit profil,
* menghapus profil,
* mengelola achievement,
* mengelola expertise,
* menangani report.

---

# 7. Permission Matrix

| Capability           | Public | Soonie | Admin |
| -------------------- | -----: | -----: | ----: |
| View homepage        |      ✅ |      ✅ |     ✅ |
| Browse directory     |      ✅ |      ✅ |     ✅ |
| Search               |      ✅ |      ✅ |     ✅ |
| View profile         |      ✅ |      ✅ |     ✅ |
| View company         |      ✅ |      ✅ |     ✅ |
| View expertise       |      ✅ |      ✅ |     ✅ |
| Create own profile   |      ❌ |      ✅ |     ✅ |
| Edit own profile     |      ❌ |      ✅ |     ✅ |
| Add career           |      ❌ |      ✅ |     ✅ |
| Add achievement      |      ❌ |      ✅ |     ✅ |
| Edit other profile   |      ❌ |      ❌ |     ✅ |
| Delete other profile |      ❌ |      ❌ |     ✅ |
| Manage reports       |      ❌ |      ❌ |     ✅ |

---

# 8. Information Architecture

```text
SoonWiki
│
├── Home
│
├── People
│   └── Person Profile
│
├── Companies
│   └── Company Detail
│
├── Expertise
│   └── Expertise Detail
│
├── Login
│
├── My Profile
│   └── Edit Profile
│
└── Admin
    ├── People
    ├── Achievements
    ├── Expertise
    └── Reports
```

---

# 9. URL Structure

Recommended:

```text
/

 /people
 /people/:slug

 /company/:slug

 /expertise/:slug

 /batch/:year

 /login

 /me
 /me/edit

 /admin
 /admin/people
 /admin/achievements
 /admin/expertise
 /admin/reports
```

Contoh:

```text
/people/muhammad-faisal

/company/tempo

/expertise/video-production

/batch/2018
```

---

# 10. Core User Journey

## 10.1 Public Visitor

```text
Homepage
    ↓
Search / Explore
    ↓
People Directory
    ↓
Person Profile
    ↓
Career / Achievement
```

Alternative discovery:

```text
Homepage
    ↓
Company
    ↓
SoonMates working there
    ↓
Profile
```

atau:

```text
Homepage
    ↓
Expertise
    ↓
Relevant SoonMates
    ↓
Profile
```

---

# 11. Soonie Journey

```text
Login
    ↓
My Profile
    ↓
Create / Edit Profile
    ↓
Add Career
    ↓
Add Expertise
    ↓
Add Achievement
    ↓
Publish
```

Perubahan langsung live setelah disimpan.

**Tidak ada moderation/approval sebelum publish.**

---

# 12. Homepage

## Purpose

Homepage harus menjawab tiga pertanyaan dengan cepat:

1. Apa itu SoonWiki?
2. Siapa saja orang di dalamnya?
3. Apa yang dilakukan SoonMates sekarang?

---

## Hero

### Headline

**Where are SoonMates now?**

### Supporting copy

> Discover where SoonMates are now, what they're building, and the things they're proud of.

### Primary interaction

Global search:

```text
Search people, companies, expertise...
```

---

# 13. Community Statistics

Homepage menampilkan statistik sederhana.

Contoh:

```text
500+
SoonMates

120+
Companies

40+
Expertise

250+
Achievements
```

Data dihitung secara otomatis dari database.

---

# 14. Recently Updated

Menampilkan profil yang baru:

* dibuat,
* diperbarui,
* atau mendapatkan achievement baru.

Card:

```text
[Photo]

Muhammad Faisal

Video Producer @ Tempo

Soon 2018
```

Default:

maksimal **6–8 profile**.

---

# 15. What SoonMates Are Doing

Achievement feed sederhana pada homepage.

Contoh:

```text
Muhammad Faisal

Presidential Interview Production

Part of the production team for
an exclusive presidential interview.

Tempo · 2026
```

Klik card membuka profil pemilik achievement.

---

# 16. Explore by Expertise

Homepage dapat menampilkan expertise populer.

Contoh:

```text
Software Engineering
Product
Design
Video Production
Photography
Journalism
Marketing
Research
Business
Finance
```

Klik expertise membuka:

```text
/expertise/video-production
```

---

# 17. People Directory

Route:

```text
/people
```

Directory merupakan halaman utama untuk menemukan SoonMates.

---

## Person Card

Card minimal berisi:

```text
[Profile Photo]

Muhammad Faisal

Video Producer @ Tempo

Soon 2018

Video Production · Media
```

Seluruh card clickable.

---

# 18. Search

Satu search box digunakan untuk mencari berdasarkan:

* nama,
* current role,
* current company,
* expertise.

Contoh:

```text
Search SoonMates...

> tempo
```

Results dapat menampilkan semua profile yang:

* bekerja di Tempo,
* pernah bekerja di Tempo,
* atau memiliki relevant information.

---

# 19. Filters

MVP menyediakan empat filter utama.

### Company

Contoh:

```text
Tempo
Gojek
Tokopedia
Traveloka
```

### Expertise / Industry

```text
Software Engineering
Media
Product
Film
Marketing
```

### Batch

```text
2018
2019
2020
2021
...
```

### Name

via search.

Filter dapat dikombinasikan.

Contoh:

```text
Expertise:
Software Engineering

Company:
Gojek

Batch:
2020
```

---

# 20. Person Profile

Person profile adalah halaman paling penting dalam SoonWiki.

---

## 20.1 Profile Header

Menampilkan:

* profile picture,
* full name,
* current role,
* current company,
* batch,
* expertise,
* social links.

Contoh:

```text
Muhammad Faisal

Video Producer @ Tempo

Soon 2018

Video Production · Journalism · Documentary

LinkedIn
Instagram
Personal Website
```

---

# 21. About

Bio pendek.

Recommended maksimum:

**500 characters.**

Contoh:

> Video producer focusing on journalism, documentary, and editorial content.

Field bersifat optional.

---

# 22. Soon Information

Minimum:

```text
Batch / Joined Year
```

Contoh:

```text
Soon 2018
```

Future enhancement dapat memiliki:

```text
Creative Division
Head of Production
2018–2020
```

Tetapi detail organization history tidak wajib untuk MVP.

---

# 23. Career

Career bersifat fleksibel.

User tidak diwajibkan memasukkan seluruh history.

Mereka dapat hanya memiliki:

```text
Tempo

Video Producer

2024 — Present
```

atau:

```text
Tempo

Video Producer

2024 — Present


Narasi

Motion Designer

2021 — 2024


Studio ABC

Junior Designer

2020 — 2021
```

---

## Career Fields

Required:

```text
Company
Role
Start Year
```

Optional:

```text
End Year
Description
Company URL
```

Jika:

```text
endYear = null
```

maka UI menampilkan:

```text
Present
```

---

# 24. Current Job

Current job dapat berasal dari career item dengan:

```text
is_current = true
```

Satu user boleh memiliki lebih dari satu current role apabila diperlukan.

Contoh:

```text
Founder @ ABC Studio

+

Creative Director @ XYZ
```

---

# 25. Achievements

Achievement adalah highlight mengenai sesuatu yang dianggap membanggakan oleh user.

SoonWiki tidak menentukan standar “prestasi”.

Yang layak dimasukkan sepenuhnya diserahkan kepada user.

Contoh:

* bekerja pada project besar,
* mendapatkan award,
* mendirikan perusahaan,
* membuat produk,
* menghasilkan karya,
* menjadi speaker,
* mendapatkan scholarship,
* publishing research,
* career milestone,
* community contribution,
* personal accomplishment.

---

# 26. Achievement Structure

Required:

```text
Title
```

Recommended:

```text
Description
Year
```

Optional:

```text
Image
External URL
Organization / Company
```

Contoh:

```text
Presidential Interview Production

Part of the production team for
an exclusive presidential interview.

Tempo

2026

[Image]

View Project →
```

---

# 27. Achievement Ordering

Default:

```text
Newest → Oldest
```

Jika tahun tidak tersedia:

gunakan `created_at`.

---

# 28. Profile Editing

Route:

```text
/me/edit
```

Editor dibagi menjadi beberapa section.

```text
Profile
Career
Expertise
Achievements
Social Links
```

Tidak perlu multi-step wizard kompleks.

---

# 29. Basic Profile Fields

### Required

```text
Full Name
Batch / Joined Year
```

### Recommended

```text
Profile Photo
Current Role
Current Company
Expertise
```

### Optional

```text
Bio
Location
LinkedIn
Instagram
Personal Website
```

Email dan nomor telepon **tidak ditampilkan secara public secara default**.

---

# 30. Profile Photo

Requirements:

* JPG / PNG / WebP
* square crop recommended
* image compression dilakukan otomatis
* fallback berupa initials/avatar jika tidak ada foto

Contoh:

```text
MF
```

---

# 31. Expertise

User dapat memilih beberapa expertise.

Contoh:

```text
Video Production
Motion Design
Journalism
Documentary
Creative Direction
```

---

## Adding Expertise

User dapat:

1. memilih existing expertise,
2. menambahkan expertise baru.

Saat menambahkan:

```text
+ Add "Documentary Filmmaking"
```

Sistem membuat expertise baru secara otomatis.

---

# 32. Expertise Page

Route:

```text
/expertise/:slug
```

Contoh:

```text
Video Production

18 SoonMates
```

Kemudian menampilkan people cards.

---

# 33. Company

Company tidak perlu dibuat terlebih dahulu oleh admin.

Saat user memasukkan:

```text
Company:
Tempo
```

SoonWiki akan:

1. mencari existing company,
2. menggunakan existing company jika match,
3. membuat company baru jika belum tersedia.

---

# 34. Company Autocomplete

Input company sebaiknya autocomplete.

Contoh:

```text
Company

Tem...

Tempo
Tempo Institute
Tempo Media Group

+ Add "Tem Creative"
```

Tujuannya mengurangi duplicate seperti:

```text
Gojek
Go-Jek
GOJEK
PT Gojek
```

---

# 35. Company Page

Route:

```text
/company/:slug
```

Contoh:

# Tempo

```text
6 SoonMates
```

Menampilkan:

```text
Muhammad Faisal
Video Producer

Nadia
Journalist

Aldi
Motion Designer
```

Company page tidak membutuhkan CMS khusus untuk MVP.

---

# 36. Batch Page

Route:

```text
/batch/:year
```

Contoh:

```text
Soon 2019

42 SoonMates
```

Menampilkan seluruh member/alumni pada batch tersebut.

---

# 37. Authentication

Public browsing tidak membutuhkan authentication.

Login hanya diperlukan untuk:

* create profile,
* edit profile,
* submit achievement,
* manage data.

---

# 38. Account ↔ Profile Relationship

Setiap account normal hanya dapat memiliki:

```text
1 Person Profile
```

Relationship:

```text
User
 ↓
Person
```

Admin tidak dibatasi oleh ownership tersebut.

---

# 39. Profile Ownership

Saat member membuat profil:

```text
person.owner_id = current_user.id
```

User hanya dapat:

```text
UPDATE person
WHERE owner_id = current_user.id
```

Admin dapat mengubah seluruh profile.

---

# 40. Publishing Model

SoonWiki menggunakan:

# Instant Publishing

Ketika member menekan:

```text
Save
```

perubahan langsung public.

Tidak ada:

```text
Draft → Submit → Admin Review → Publish
```

---

# 41. Safety Guardrails

Karena publishing dilakukan langsung, MVP membutuhkan tiga perlindungan dasar.

### Authentication

Hanya account SoonMates yang dapat melakukan write.

### Ownership

User tidak dapat mengedit profil orang lain.

### Report

Public atau member dapat melaporkan informasi yang salah.

---

# 42. Report Feature

Person profile memiliki action:

```text
Report incorrect information
```

Form sederhana:

```text
Reason

[ Incorrect information ]
[ Inappropriate content ]
[ Impersonation ]
[ Other ]

Additional details
```

Report masuk ke admin.

---

# 43. Admin Dashboard

Admin dashboard sederhana.

```text
/admin
```

Menampilkan:

```text
Total People

Total Companies

Total Achievements

Open Reports
```

---

# 44. Admin — People

Admin dapat:

* search profile,
* create profile,
* edit profile,
* delete profile,
* change ownership.

---

# 45. Admin — Achievements

Admin dapat:

* melihat semua achievements,
* edit,
* delete.

Tidak membutuhkan approval queue.

---

# 46. Admin — Expertise

Admin dapat:

* create expertise,
* rename expertise,
* merge duplicate expertise,
* delete unused expertise.

Merge penting untuk kasus:

```text
UI UX

UI/UX

UX Design
```

---

# 47. Admin — Reports

Admin dapat melihat:

```text
Reporter
Target
Reason
Description
Created At
Status
```

Status:

```text
Open
Resolved
Dismissed
```

---

# 48. Data Model

## User

```text
id
email
role
created_at
updated_at
```

Role:

```text
member
admin
```

---

# 49. Person

```text
id
owner_id

name
slug
photo_url

generation_key

bio
location

current_role

linkedin_url
instagram_url
website_url

created_at
updated_at
```

---

# 50. Career

```text
id

person_id
company_id

role

start_year
end_year

is_current

description

created_at
updated_at
```

---

# 51. Company

```text
id

name
slug

website_url

created_at
updated_at
```

---

# 52. Expertise

```text
id

name
slug

created_at
updated_at
```

---

# 53. Person Expertise

Many-to-many relationship:

```text
person_id
expertise_id
```

---

# 54. Achievement

```text
id

person_id

title
description

organization

year

image_url
external_url

created_at
updated_at
```

---

# 55. Report

```text
id

reporter_id

person_id
achievement_id

reason
description

status

created_at
resolved_at
```

Target dapat berupa:

* person,
* achievement.

---

# 56. Search Requirements

MVP search harus dapat menemukan Person berdasarkan:

```text
Person.name
Person.current_role
Company.name
Expertise.name
```

Nice-to-have:

```text
Career.role
Achievement.title
```

Tidak membutuhkan semantic/vector search pada MVP.

Normal database full-text search sudah cukup.

---

# 57. Search Result Ranking

Prioritas hasil:

```text
1. Exact name match
2. Partial name match
3. Company match
4. Role match
5. Expertise match
```

---

# 58. Empty State

Jika search tidak menemukan hasil:

```text
No SoonMates found.

Try searching another name,
company, or expertise.
```

Untuk authenticated member:

```text
Can't find yourself?

Create your profile →
```

---

# 59. Duplicate Profiles

MVP harus mengurangi kemungkinan seseorang membuat profil dua kali.

Saat create profile:

sistem melakukan approximate check berdasarkan:

```text
name
batch
```

Jika ada kandidat:

```text
We found profiles with similar names.

Is one of these you?

Muhammad Faisal — Soon 2018
Muhammad Faisal — Soon 2020
```

User tetap dapat melanjutkan apabila bukan dirinya.

---

# 60. Homepage Data

Homepage menggunakan data real dari database.

Stat cards dihitung berdasarkan:

```text
Total Published People
Unique Companies
Unique Expertise
Total Achievements
```

---

# 61. Recent Profiles

Ranking:

```text
ORDER BY updated_at DESC
```

Maksimal:

```text
8 people
```

---

# 62. Recent Achievements

Ranking:

```text
achievement.year DESC

fallback:
created_at DESC
```

Maksimal:

```text
6–10 achievements
```

---

# 63. SEO

Karena directory bersifat public, person page harus dapat di-index search engine.

Page title:

```text
Muhammad Faisal — SoonWiki
```

Description:

```text
Muhammad Faisal is a Video Producer at Tempo
and a Soon 2018 member.
```

Company:

```text
Tempo — SoonWiki
```

---

# 64. Social Sharing

Setiap person profile harus memiliki metadata untuk preview.

Ketika link dibagikan:

```text
[PHOTO]

Muhammad Faisal

Video Producer @ Tempo
Soon 2018

SoonWiki
```

OpenGraph implementation termasuk MVP.

---

# 65. Responsive Requirements

Prioritas:

1. Mobile
2. Desktop

Profile card harus nyaman digunakan pada mobile karena kemungkinan link SoonWiki banyak dibuka dari:

* WhatsApp,
* Instagram,
* group chat.

---

# 66. Performance Requirements

Target umum:

* initial page cepat,
* image lazy loading,
* image compression,
* pagination/infinite loading pada directory,
* server-side rendered public profile jika memungkinkan.

Tidak perlu optimasi ekstrem untuk MVP.

---

# 67. Privacy

Public information:

* name,
* photo,
* batch,
* bio,
* career,
* expertise,
* achievement,
* social links yang sengaja dimasukkan user.

Tidak public secara default:

* login email,
* phone number,
* authentication information,
* internal account metadata.

---

# 68. Analytics

Minimal event tracking:

```text
homepage_view

people_search

filter_used

profile_view

company_view

expertise_view

profile_created

profile_updated

achievement_created
```

---

# 69. Success Metrics

Karena SoonWiki adalah internal/community project, metric tidak perlu terlalu corporate.

Tiga indikator utama:

### Profile Coverage

```text
Active profile / estimated total SoonMates
```

### Profile Freshness

Jumlah profile yang diperbarui dalam:

```text
last 6 months
```

### Discovery Usage

Jumlah:

```text
search
profile view
company page view
expertise page view
```

---

# 70. MVP Acceptance Criteria

MVP dianggap selesai ketika:

### Public

* [ ] Visitor dapat membuka SoonWiki tanpa login.
* [ ] Visitor dapat melihat homepage.
* [ ] Visitor dapat browse member/alumni.
* [ ] Visitor dapat search berdasarkan nama.
* [ ] Visitor dapat filter company.
* [ ] Visitor dapat filter expertise.
* [ ] Visitor dapat filter batch.
* [ ] Visitor dapat membuka profile.
* [ ] Visitor dapat melihat career.
* [ ] Visitor dapat melihat achievements.
* [ ] Visitor dapat membuka company page.
* [ ] Visitor dapat membuka expertise page.

### Member

* [ ] Member dapat login.
* [ ] Member dapat membuat profile.
* [ ] Member dapat upload profile picture.
* [ ] Member dapat mengedit profile.
* [ ] Member dapat menambahkan career.
* [ ] Member dapat mengedit career.
* [ ] Member dapat menghapus career.
* [ ] Member dapat memilih expertise.
* [ ] Member dapat membuat expertise baru.
* [ ] Member dapat menambahkan achievement.
* [ ] Member dapat mengedit achievement.
* [ ] Member dapat menghapus achievement.
* [ ] Perubahan langsung muncul secara public.
* [ ] Member tidak dapat mengedit profile milik user lain.

### Admin

* [ ] Admin dapat melihat semua profile.
* [ ] Admin dapat membuat profile.
* [ ] Admin dapat mengedit semua profile.
* [ ] Admin dapat menghapus profile.
* [ ] Admin dapat mengelola achievements.
* [ ] Admin dapat mengelola expertise.
* [ ] Admin dapat melihat reports.
* [ ] Admin dapat resolve/dismiss report.

---

# 71. Recommended MVP Screens

Secara UI, project ini sebenarnya cukup sekitar **10 screen utama**:

```text
01 — Homepage

02 — People Directory

03 — Person Profile

04 — Company Detail

05 — Expertise Detail

06 — Login

07 — My Profile

08 — Edit Profile

09 — Add/Edit Achievement

10 — Admin Dashboard
```

Beberapa admin view lain dapat reuse layout/table yang sama.

---

# 72. Design Principles

## People First

Foto dan identitas orang harus menjadi elemen visual utama.

SoonWiki berbicara tentang manusia, bukan database.

---

## Proud, Not Corporate

Achievement harus terasa seperti:

> “Look what our people are doing.”

bukan:

> “Professional employment database.”

---

## Easy to Explore

User harus dapat berpindah dari:

```text
Person
 ↓
Company
 ↓
Another Person
 ↓
Expertise
 ↓
Another Person
```

tanpa terasa seperti melakukan advanced search.

---

## Low Friction Contribution

Updating profile harus sangat mudah.

Idealnya seseorang bisa:

```text
Login → Edit → Save
```

dalam beberapa menit.

---

## Collective Memory

SoonWiki harus terasa sebagai arsip perjalanan komunitas.

Bukan sekadar directory kontak.

---

# 73. Visual Direction

Recommended visual personality:

```text
Modern
Warm
Community-driven
Editorial
Slightly nostalgic
```

Referensi rasa produk:

```text
Wikipedia
×
LinkedIn directory
×
modern editorial website
×
community yearbook
```

Bukan berarti UI-nya harus menyerupai platform tersebut secara langsung.

---

# 74. Recommended Homepage Hierarchy

```text
NAVBAR

SoonWiki
People
Explore
Login


HERO

Where are SoonMates now?

Discover where SoonMates are now,
what they're building,
and the things they're proud of.

[ Search people, companies, expertise... ]


COMMUNITY NUMBERS

500+ SoonMates
120+ Companies
250+ Achievements


RECENT SoonMates

[person]
[person]
[person]
[person]


WHAT SoonMates ARE DOING

[achievement]

[achievement]

[achievement]


EXPLORE BY EXPERTISE

Software
Design
Media
Business
Research


COMPANIES WITH SoonMates

Gojek
Tempo
Tokopedia
etc.


FOOTER

From Soon, Everywhere.
```

---

# 75. Suggested Technical Shape

Tanpa menentukan stack dulu, secara arsitektur MVP cukup membutuhkan:

```text
Frontend
+
Backend/API
+
Relational Database
+
Authentication
+
Image Storage
```

Relational DB cocok karena relationship utamanya sederhana:

```text
Person
 ↕
Career
 ↕
Company

Person
 ↕
Expertise

Person
 ↕
Achievement
```

Tidak perlu:

* graph database,
* vector database,
* microservice,
* event architecture,
* dedicated search engine

untuk versi pertama.

---

# 76. Scope Boundary

Untuk menjaga project tetap kecil, setiap request baru sebaiknya diuji menggunakan pertanyaan:

> **Apakah fitur ini membantu menemukan SoonMates atau mendokumentasikan perjalanan mereka?**

Jika jawabannya tidak, kemungkinan fitur tersebut **bukan bagian dari MVP**.

---

# 77. Definition of Done — MVP

SoonWiki v1 dapat dianggap launch-ready ketika seseorang yang tidak mengenal seluruh alumni Soon dapat:

> membuka website → mencari bidang/perusahaan → menemukan seorang Soonie → mengetahui siapa dia → melihat perjalanan karier dan achievement-nya.

Dan seorang alumni dapat:

> login → membuat atau memperbarui profil → menambahkan achievement → langsung melihatnya tampil di SoonWiki.

Itulah keseluruhan value loop dari MVP.

---

## Final Product Definition

> **SoonWiki adalah public directory dan collective archive untuk member dan alumni Soon, yang memungkinkan siapa pun menemukan SoonMates berdasarkan orang, perusahaan, expertise, dan batch, sekaligus melihat perjalanan karier serta achievement yang mereka banggakan.**

### **SoonWiki**

## **From Soon, Everywhere.**

PRD ini sudah cukup dikunci sebagai **MVP v1**. Tahapan paling masuk akal setelah ini adalah **wireframe/UX flow per screen → database schema teknis → backlog user stories**, bukan menambah fitur baru dulu.
