-- ============================================================
-- SKEMA DATABASE ANICINE (Supabase / Postgres)
-- Jalankan di: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- 1) PROFIL PENGGUNA
-- Setiap user yang daftar via Supabase Auth otomatis dapat baris di sini (lewat trigger).
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  whatsapp text,
  invite_code text unique not null,          -- kode undangan MILIK user ini, dibagikan ke orang lain
  invited_by uuid references profiles (id),  -- diisi kalau user ini daftar pakai kode undangan orang lain
  is_admin boolean not null default false,
  free_access_until timestamptz,             -- akses gratis (reward invite / voucher aktif) sampai kapan
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profil bisa dibaca semua user login"
  on profiles for select
  using (auth.role() = 'authenticated');

create policy "user hanya bisa update profil sendiri"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
-- Catatan: policy ini mengizinkan user memperbarui baris profilnya sendiri,
-- termasuk kolom free_access_until saat mereka berhasil klaim voucher yang valid.
-- Validitas voucher itu sendiri tetap dijaga oleh policy tabel "vouchers" di bawah
-- (hanya bisa update voucher berstatus 'pending' menjadi 'claimed' milik dirinya).

-- 2) VOUCHER
-- Voucher dibuat manual oleh admin (lewat admin panel / API route dengan service role).
-- Kode unik digenerate otomatis, status berubah saat diklaim, dan hanya terikat 1 akun.
create table if not exists vouchers (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  duration_days int not null default 30,
  status text not null default 'pending' check (status in ('pending', 'claimed', 'revoked')),
  claimed_by uuid references profiles (id),
  claimed_at timestamptz,
  created_by_admin text,                     -- catatan admin siapa yang generate (email admin)
  note text,                                 -- misal: nomor WA pembeli, biar mudah dicocokkan
  created_at timestamptz not null default now()
);

alter table vouchers enable row level security;

create policy "user bisa lihat voucher miliknya sendiri"
  on vouchers for select
  using (auth.uid() = claimed_by);

-- Insert/generate voucher HANYA lewat service role (admin API), jadi tidak ada policy insert untuk user biasa.

create policy "user bisa klaim voucher yg statusnya pending"
  on vouchers for update
  using (status = 'pending')
  with check (auth.uid() = claimed_by and status = 'claimed');

-- 3) RIWAYAT PESAN / NOTIFIKASI (voucher masuk ke "riwayat pesan" user)
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete cascade,
  title text not null,
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table messages enable row level security;

create policy "user hanya baca pesan miliknya"
  on messages for select
  using (auth.uid() = user_id);

create policy "user bisa update status baca pesannya"
  on messages for update
  using (auth.uid() = user_id);

-- 4) FUNGSI: generate kode invite unik otomatis saat profil dibuat
create or replace function generate_invite_code()
returns text
language plpgsql
as $$
declare
  new_code text;
  exists_already boolean;
begin
  loop
    new_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    select exists(select 1 from profiles where invite_code = new_code) into exists_already;
    exit when not exists_already;
  end loop;
  return new_code;
end;
$$;

-- 5) TRIGGER: setiap kali ada user baru daftar di auth.users, buat baris profiles otomatis
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  ref_code text;
  ref_profile profiles;
begin
  ref_code := new.raw_user_meta_data ->> 'invited_by_code';

  insert into profiles (id, username, whatsapp, invite_code)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'whatsapp',
    generate_invite_code()
  );

  -- kalau daftar pakai kode undangan valid, beri reward gratis nonton 1 hari ke PEMILIK kode
  if ref_code is not null and ref_code <> '' then
    select * into ref_profile from profiles where invite_code = upper(ref_code) limit 1;
    if found then
      update profiles
        set invited_by = ref_profile.id,
            free_access_until = null
        where id = new.id;

      update profiles
        set free_access_until = greatest(coalesce(free_access_until, now()), now()) + interval '1 day'
        where id = ref_profile.id;

      insert into messages (user_id, title, body)
      values (
        ref_profile.id,
        'Invite code kamu dipakai!',
        'Selamat, kode undanganmu baru saja dipakai oleh member baru. Kamu dapat bonus gratis nonton 1 hari.'
      );
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- CATATAN SETUP:
-- 1. Jalankan seluruh file ini sekali di SQL Editor Supabase.
-- 2. Di Authentication > Providers, pastikan Email/Password aktif.
-- 3. Tambahkan email admin kamu ke ADMIN_EMAILS di .env.local, lalu daftar akun
--    itu seperti user biasa lewat halaman /register.
-- 4. Set ADMIN_ACCESS_CODE di .env.local sebagai kode akses tambahan masuk /admin.
-- ============================================================
