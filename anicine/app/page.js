import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getTopAnime, getTopManga } from "@/lib/jikan";
import TitleCard from "@/components/TitleCard";

export default async function HomePage() {
  let previewAnime = [];
  let previewManga = [];
  try {
    [previewAnime, previewManga] = await Promise.all([
      getTopAnime(1),
      getTopManga("", 1),
    ]);
  } catch (e) {
    // Kalau Jikan API sedang sibuk, halaman tetap tampil tanpa preview
  }

  return (
    <main className="min-h-screen bg-void">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0 bg-grain" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-6 py-24 md:py-32">
          <p className="font-body text-sm uppercase tracking-widest text-cyan">
            Layar kecil, cerita besar
          </p>
          <h1 className="marquee-text max-w-3xl font-display text-5xl text-ink md:text-7xl">
            Bioskop digital untuk anime, manga, manhwa, dan manhua favoritmu.
          </h1>
          <p className="max-w-xl font-body text-lg text-muted">
            ANICINE adalah ruang tonton dan baca pribadi — katalog yang terus
            bertambah, akses personal lewat voucher, dan komunitas yang saling
            mengundang. Satu akun, semua cerita.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/register"
              className="rounded-full bg-neon px-8 py-4 font-display text-lg text-void transition-colors hover:bg-ink"
            >
              Mari join dan lakukan pendaftaran
            </Link>
            <Link
              href="/browse"
              className="rounded-full border border-line px-8 py-4 font-display text-lg text-ink transition-colors hover:border-cyan hover:text-cyan"
            >
              Lihat katalog dulu
            </Link>
          </div>
        </div>
      </section>

      {/* CARA KERJA */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-10 font-display text-3xl text-ink">
          Bagaimana akses penuh bekerja
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <StepCard
            title="Daftar & masuk"
            body="Buat akun dengan username, email, dan password. Login kapan saja untuk membuka riwayat pesan dan status vouchermu."
          />
          <StepCard
            title="Ambil accvoucher"
            body="Hubungi admin lewat WhatsApp untuk membeli accvoucher. Setelah disetujui, voucher unikmu otomatis masuk ke riwayat pesan akunmu."
          />
          <StepCard
            title="Redeem sekali, akses penuh"
            body="Klaim voucher dari akunmu sendiri. Setiap kode hanya berlaku untuk 1 akun dan tidak bisa dipakai ulang setelah redeem."
          />
        </div>
        <p className="mt-8 font-body text-sm text-muted">
          Punya teman? Bagikan kode undanganmu — begitu dipakai untuk daftar,
          kamu otomatis dapat bonus gratis nonton 1 hari.
        </p>
      </section>

      {/* PREVIEW ANIME */}
      {previewAnime.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-display text-3xl text-ink">Anime populer</h2>
            <Link href="/browse?tab=anime" className="font-body text-sm text-cyan hover:text-ink">
              Lihat semua →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {previewAnime.slice(0, 10).map((item) => (
              <TitleCard key={`a-${item.id}`} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* PREVIEW MANGA */}
      {previewManga.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-display text-3xl text-ink">
              Manga, manhwa & manhua pilihan
            </h2>
            <Link href="/browse?tab=manga" className="font-body text-sm text-cyan hover:text-ink">
              Lihat semua →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {previewManga.slice(0, 10).map((item) => (
              <TitleCard key={`m-${item.id}`} item={item} />
            ))}
          </div>
        </section>
      )}

      <footer className="border-t border-line px-6 py-10 text-center font-body text-xs text-muted">
        ANICINE — dibuat untuk komunitas kecil pecinta anime & manga.
      </footer>
    </main>
  );
}

function StepCard({ title, body }) {
  return (
    <div className="ticket-edge rounded-lg border border-dashed border-line bg-panel p-6">
      <h3 className="mb-2 font-display text-xl text-neon">{title}</h3>
      <p className="font-body text-sm text-muted">{body}</p>
    </div>
  );
}
