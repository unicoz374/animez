import Link from "next/link";
import Navbar from "@/components/Navbar";
import TitleCard from "@/components/TitleCard";
import { getTopAnime, searchAnime, getTopManga, searchManga } from "@/lib/jikan";

export default async function BrowsePage({ searchParams }) {
  const tab = searchParams?.tab === "manga" ? "manga" : "anime";
  const q = searchParams?.q || "";
  const page = Number(searchParams?.page) || 1;

  let items = [];
  let fetchFailed = false;
  try {
    if (tab === "anime") {
      items = q ? await searchAnime(q, page) : await getTopAnime(page);
    } else {
      items = q ? await searchManga(q, page) : await getTopManga("", page);
    }
  } catch (e) {
    fetchFailed = true;
  }

  return (
    <main className="min-h-screen bg-void">
      <Navbar />
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="font-display text-4xl text-ink">Jelajahi katalog</h1>
        <p className="mt-2 font-body text-sm text-muted">
          Info lengkap tiap judul gratis untuk semua member. Nonton episode
          penuh atau baca chapter khusus butuh voucher aktif.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            <TabLink tab="anime" active={tab === "anime"} q={q}>
              Anime
            </TabLink>
            <TabLink tab="manga" active={tab === "manga"} q={q}>
              Manga / Manhwa / Manhua
            </TabLink>
          </div>

          <form className="flex gap-2">
            <input type="hidden" name="tab" value={tab} />
            <input
              name="q"
              defaultValue={q}
              placeholder={`Cari ${tab === "anime" ? "anime" : "manga"}...`}
              className="rounded-full border border-line bg-panel2 px-4 py-2 font-body text-sm text-ink focus:border-cyan focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-full border border-line px-4 py-2 font-body text-sm text-ink hover:border-neon hover:text-neon"
            >
              Cari
            </button>
          </form>
        </div>

        {fetchFailed && (
          <p className="mt-10 rounded border border-line bg-panel p-4 font-body text-sm text-muted">
            Katalog sedang tidak bisa dimuat dari sumber data (Jikan API).
            Coba lagi beberapa saat lagi.
          </p>
        )}

        {!fetchFailed && items.length === 0 && (
          <p className="mt-10 font-body text-sm text-muted">
            Tidak ada hasil untuk pencarian ini.
          </p>
        )}

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {items.map((item) => (
            <TitleCard key={`${item.type}-${item.id}`} item={item} />
          ))}
        </div>

        <div className="mt-10 flex justify-center gap-4">
          {page > 1 && (
            <PageLink tab={tab} q={q} page={page - 1}>
              ← Sebelumnya
            </PageLink>
          )}
          <PageLink tab={tab} q={q} page={page + 1}>
            Selanjutnya →
          </PageLink>
        </div>
      </section>
    </main>
  );
}

function TabLink({ tab, active, q, children }) {
  const href = `/browse?tab=${tab}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
  return (
    <Link
      href={href}
      className={`rounded-full px-5 py-2 font-body text-sm transition-colors ${
        active
          ? "bg-neon text-void"
          : "border border-line text-muted hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}

function PageLink({ tab, q, page, children }) {
  const href = `/browse?tab=${tab}${q ? `&q=${encodeURIComponent(q)}` : ""}&page=${page}`;
  return (
    <Link
      href={href}
      className="rounded-full border border-line px-5 py-2 font-body text-sm text-ink hover:border-cyan hover:text-cyan"
    >
      {children}
    </Link>
  );
}
