import { Oswald, Space_Grotesk } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata = {
  title: "ANICINE — Bioskop Digital Anime & Manga",
  description:
    "Nonton anime dan baca manga, manhwa, manhua favoritmu di satu tempat. Daftar gratis, klaim aksesmu.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${oswald.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-void text-ink antialiased">{children}</body>
    </html>
  );
}
