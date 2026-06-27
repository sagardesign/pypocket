import "@/apps/admin/app/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PyPocket Admin Control Console",
  description: "PyPocket platform management, lesson builders, and performance analytics logs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-50 antialiased p-6">
        <header className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight text-purple-500">PyPocket</span>
            <span className="text-xs bg-zinc-800 text-zinc-400 font-bold px-2 py-0.5 rounded-full">Admin Panel</span>
          </div>
          <span className="text-xs text-zinc-500 font-semibold">Port 3001</span>
        </header>
        <main className="max-w-6xl mx-auto">{children}</main>
      </body>
    </html>
  );
}
