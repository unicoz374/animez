import Link from "next/link";
import Image from "next/image";

export default function TitleCard({ item }) {
  const href = `/browse/${item.type}/${item.id}`;
  const meta =
    item.type === "anime"
      ? [item.year, item.episodes ? `${item.episodes} eps` : null]
      : [item.subtype?.toUpperCase(), item.year];

  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-line bg-panel transition-transform hover:-translate-y-1 hover:border-neon"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-panel2">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 45vw, 200px"
            className="object-cover transition-opacity group-hover:opacity-80"
          />
        ) : null}
        {item.score ? (
          <span className="absolute right-2 top-2 rounded bg-void/80 px-2 py-0.5 font-body text-xs text-gold">
            ★ {item.score}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="font-display text-sm leading-tight text-ink line-clamp-2">
          {item.title}
        </h3>
        <p className="font-body text-xs text-muted">
          {meta.filter(Boolean).join(" · ")}
        </p>
      </div>
    </Link>
  );
}
