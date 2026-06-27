import type { Metadata, Viewport } from "next";
import { Merriweather, Inter, JetBrains_Mono } from "next/font/google";
import "@/app/globals.css";
import { AppProvider } from "@/context/AppContext";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-merriweather",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "PyPocket — Educational Hub",
  description: "PyPocket: Simple Learning. Lifelong Impact. Python compiler and structured roadmap curriculum for smartphones.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PyPocket",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${merriweather.variable} ${jetbrains.variable} min-h-screen bg-background text-foreground transition-colors duration-200 antialiased font-sans`}>
        <AppProvider>
          <div className="flex min-h-screen">
            {/* Sidebar layout for larger tablet screens */}
            <Sidebar />

            <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
              {/* Apple-like status header */}
              <TopBar />

              {/* Main content viewport */}
              <main className="flex-grow flex flex-col w-full max-w-4xl mx-auto p-4 md:p-6 pb-20 md:pb-6">
                {children}
              </main>

              {/* Mobile bottom tabs */}
              <BottomNav />
            </div>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
