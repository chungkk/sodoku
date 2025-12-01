import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Multiplayer Sudoku",
  description: "Play Sudoku with friends in real-time",
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
      <body className={inter.className}>
        <PlayerProvider>
          {children}
          <Toaster position="top-center" richColors />
        </PlayerProvider>
      </body>
    </html>
  );
}
