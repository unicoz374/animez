import Navbar from "@/components/Navbar";
import { getAnimeById } from "@/lib/jikan";
import AccessGate from "@/components/AccessGate";

export default async function AnimeDetailPage({ params }) {
  const anime = await getAnimeById(params.id);

  return (
    <main className="min-h-screen bg-void">
      <Navbar />
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-[280px_1fr]">
          <img
            src={anime.image}
            alt={anime.title}
            className="w-full rounded-lg border border-line object-cover"
          />
          <div>
            <p className="font-body text-xs uppercase tracking-widest text-cyan">
              Anime · {anime.year || "—"} · {anime.episodes || "?"} episode
            </p>
            <h1 className="mt-2 font-display text-4xl text-ink">
              {anime.title}
            </h1>
            <p className="mt-1 font-body text-sm text-muted">
              {anime.titleOriginal}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {anime.genres.map((g) => (
                <span
                  key={g}
                  className="rounded-full border border-line px-3 py-1 font-body text-xs text-muted"
                >
                  {g}
                </span>
              ))}
            </div>
            <p className="mt-6 font-body text-sm leading-relaxed text-ink/90">
              {anime.synopsis || "Sinopsis belum tersedia."}
            </p>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="mb-4 font-display text-2xl text-ink">Tonton</h2>
          <AccessGate>
            {anime.trailerEmbedUrl ? (
              <div className="aspect-video w-full overflow-hidden rounded-lg border border-line">
                <iframe
                  src={anime.trailerEmbedUrl}
                  title={`Trailer ${anime.title}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            ) : (
              <p className="rounded border border-line bg-panel p-6 font-body text-sm text-muted">
                Belum ada video resmi untuk judul ini. Admin dapat menambahkan
                tautan video lewat panel admin.
              </p>
            )}
          </AccessGate>
        </div>
      </section>
    </main>
  );
}
