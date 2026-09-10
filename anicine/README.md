# ANICINE — Bioskop Digital Anime, Manga, Manhwa & Manhua

Website Next.js + Supabase dengan sistem daftar/login, voucher akses, kode
undangan, dan admin panel. Katalog anime & manga diambil otomatis dari
**Jikan API** (data resmi MyAnimeList, gratis, legal, tanpa API key), lengkap
dengan trailer YouTube resmi untuk anime.

## Kenapa tidak ada "streaming full episode bajakan"?

Situs streaming anime gratis yang beredar (Otakudesu, Samehadaku, dsb) semuanya
mengambil konten berlisensi tanpa izin — ini melanggar hak cipta dan saya tidak
membantu membangun atau mengintegrasikan sumber semacam itu. Yang dibangun di
sini legal sepenuhnya:

- Info lengkap + gambar + sinopsis ribuan judul dari Jikan API
- Trailer/PV resmi via embed YouTube untuk anime
- Kolom `videoUrl` / area chapter yang bisa **kamu isi manual** dari admin
  panel kalau kamu punya video/chapter sendiri yang sah (produksi sendiri,
  lisensi resmi, dsb)

## 1. Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com).
2. Buka **SQL Editor** → jalankan seluruh isi `supabase/schema.sql`.
3. Buka **Authentication → Providers** → pastikan Email/Password aktif.
4. Buka **Authentication → Settings** → matikan "Confirm email" dulu kalau mau
   testing cepat (boleh diaktifkan lagi nanti untuk produksi).
5. Ambil kredensial di **Project Settings → API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (JANGAN pernah dibagikan
     atau di-commit ke Git)

## 2. Setup environment variables

Salin `.env.local.example` menjadi `.env.local`, lalu isi semua nilainya.

```
cp .env.local.example .env.local
```

- `ADMIN_ACCESS_CODE` — kode akses rahasia buatanmu sendiri untuk masuk admin
  panel (bebas format, contoh: `RAJA-KATANA-2026`).
- `ADMIN_EMAILS` — email yang boleh jadi admin. Daftarkan akun ini seperti
  user biasa lewat `/register` terlebih dahulu, baru email itu efektif jadi
  admin.

## 3. Install & jalankan lokal

```
npm install
npm run dev
```

Buka `http://localhost:3000`.

## 4. Alur admin panel

1. Daftar akun biasa lewat `/register` pakai email yang ada di `ADMIN_EMAILS`.
2. Buka `/admin/login` → login dengan email+password akun tsb.
3. Masukkan `ADMIN_ACCESS_CODE` di langkah kedua.
4. Masuk ke `/admin/dashboard` untuk generate voucher dan memantau member.

## 5. Alur voucher

1. Member menghubungi kamu via WhatsApp (`wa.me/6281232715307`, ganti sesuai
   nomormu di `.env.local`) untuk beli accvoucher.
2. Kamu generate voucher dari admin dashboard → dapat kode unik.
3. Kamu kirim kode itu manual ke member via WhatsApp.
4. Member klaim kode di halaman **Akun Saya** → status voucher berubah jadi
   `claimed` dan terkunci ke akun itu saja, masa akses otomatis aktif sesuai
   durasi voucher. Kode yang sama tidak bisa diklaim ulang oleh siapa pun.

## 6. Alur invite code

Setiap user otomatis punya kode undangan sendiri (lihat halaman Akun Saya).
Kalau kode itu dipakai orang lain saat mendaftar (`/register?invite=KODE`),
pemilik kode otomatis dapat tambahan gratis nonton 1 hari — logikanya ada di
trigger `handle_new_user` pada `schema.sql`.

## 7. Deploy ke Vercel

1. Push project ini ke GitHub.
2. Import repo di [vercel.com](https://vercel.com).
3. Tambahkan semua environment variable yang sama seperti `.env.local` di
   pengaturan project Vercel.
4. Deploy.

## Struktur penting

```
app/
  page.js                 -> landing page
  register/ login/        -> auth
  browse/                 -> katalog anime & manga (Jikan API)
  browse/anime/[id]       -> detail + trailer (gated)
  browse/manga/[id]       -> detail + chapter (gated)
  account/                -> profil, klaim voucher, invite code, pesan
  admin/login/            -> login admin + kode akses
  admin/dashboard/        -> generate voucher, lihat member
  api/admin/*             -> route server-side (service role)
lib/
  supabaseClient.js       -> client browser (anon key)
  supabaseAdmin.js        -> client server-only (service role)
  jikan.js                -> integrasi Jikan API
supabase/schema.sql       -> semua tabel, RLS, trigger
middleware.js             -> proteksi route login & admin
```

## Batasan yang perlu kamu tahu

- Klaim voucher via WhatsApp **tidak otomatis** — kamu tetap harus generate
  dan kirim kode secara manual. Otomatisasi penuh butuh WhatsApp Business API
  resmi dari Meta, di luar cakupan proyek ini.
- Video full episode tidak tersedia otomatis — hanya trailer resmi + slot
  manual untuk kontenmu sendiri.
