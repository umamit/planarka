import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PLANARKA — Smart BOS & Pre-ARKAS Planner",
  description: "Aplikasi perencanaan BOS, simulasi pengadaan buku Kurikulum Merdeka HET, dan validator pergeseran anggaran pra-ARKAS. By IBRA Digital Engineering.",
  manifest: "/manifest.json",
  themeColor: "#18181b",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PLANARKA",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased font-sans text-zinc-900 bg-white selection:bg-zinc-900 selection:text-white">
        {children}
      </body>
    </html>
  );
}
