// Jikan API (https://docs.api.jikan.moe) adalah REST API tidak resmi tapi legal
// di atas data MyAnimeList: gratis, tanpa API key, dan sumbernya sah (bukan situs bajakan).
// Dipakai untuk mengisi katalog anime & manga/manhwa/manhua secara otomatis dan banyak,
// lengkap dengan gambar sampul dan trailer YouTube resmi (untuk anime).

const BASE = "https://api.jikan.moe/v4";

async function jikanFetch(path) {
  const res = await fetch(`${BASE}${path}`, {
    // Jikan punya rate limit ~3req/detik, cache singkat membantu saat traffic ramai
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`Jikan API error ${res.status} at ${path}`);
  }
  return res.json();
}

export async function getTopAnime(page = 1) {
  const data = await jikanFetch(`/top/anime?page=${page}&filter=bypopularity`);
  return normalizeAnimeList(data.data);
}

export async function searchAnime(query, page = 1) {
  const data = await jikanFetch(
    `/anime?q=${encodeURIComponent(query)}&page=${page}&order_by=popularity&sort=asc`
  );
  return normalizeAnimeList(data.data);
}

export async function getAnimeById(id) {
  const data = await jikanFetch(`/anime/${id}/full`);
  return normalizeAnimeDetail(data.data);
}

// type: "manga" | "manhwa" | "manhua" | "" (semua)
export async function getTopManga(type = "", page = 1) {
  const typeParam = type ? `&type=${type}` : "";
  const data = await jikanFetch(`/top/manga?page=${page}${typeParam}`);
  return normalizeMangaList(data.data);
}

export async function searchManga(query, page = 1) {
  const data = await jikanFetch(
    `/manga?q=${encodeURIComponent(query)}&page=${page}&order_by=popularity&sort=asc`
  );
  return normalizeMangaList(data.data);
}

export async function getMangaById(id) {
  const data = await jikanFetch(`/manga/${id}/full`);
  return normalizeMangaDetail(data.data);
}

function normalizeAnimeList(list = []) {
  return list.map((a) => ({
    id: a.mal_id,
    type: "anime",
    title: a.title_english || a.title,
    titleOriginal: a.title_japanese || a.title,
    synopsis: a.synopsis,
    image: a.images?.webp?.large_image_url || a.images?.jpg?.large_image_url,
    score: a.score,
    episodes: a.episodes,
    year: a.year || a.aired?.prop?.from?.year,
    genres: (a.genres || []).map((g) => g.name),
    status: a.status,
    trailerYoutubeId: a.trailer?.youtube_id || null,
  }));
}

function normalizeAnimeDetail(a) {
  return {
    ...normalizeAnimeList([a])[0],
    background: a.background,
    studios: (a.studios || []).map((s) => s.name),
    duration: a.duration,
    rating: a.rating,
    trailerEmbedUrl: a.trailer?.embed_url || null,
  };
}

function normalizeMangaList(list = []) {
  return list.map((m) => ({
    id: m.mal_id,
    type: "manga",
    subtype: (m.type || "manga").toLowerCase(), // manga | manhwa | manhua | light novel
    title: m.title_english || m.title,
    titleOriginal: m.title_japanese || m.title,
    synopsis: m.synopsis,
    image: m.images?.webp?.large_image_url || m.images?.jpg?.large_image_url,
    score: m.score,
    chapters: m.chapters,
    volumes: m.volumes,
    year: m.published?.prop?.from?.year,
    genres: (m.genres || []).map((g) => g.name),
    status: m.status,
  }));
}

function normalizeMangaDetail(m) {
  return {
    ...normalizeMangaList([m])[0],
    background: m.background,
    authors: (m.authors || []).map((a) => a.name),
  };
}
