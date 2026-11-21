import type { Metadata, Viewport } from "next";
import { Baloo_2, Paytone_One } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const display = Paytone_One({
  weight: "400",
  subsets: ["latin", "vietnamese"],
  variable: "--font-display",
});

const body = Baloo_2({
  subsets: ["latin", "vietnamese"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Solo Games - Sudoku và Caro cùng bạn bè",
  description: "Gửi mã phòng cho bạn rồi đấu Sudoku hoặc Caro ngay, không cần tài khoản.",
  keywords: ["sudoku", "caro", "game", "chơi cùng bạn bè", "online"],
};

export const viewport: Viewport = {
  themeColor: "#a9ecd8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${display.variable} ${body.variable} flex min-h-dvh flex-col font-sans antialiased`}>
        <Providers>
          <Header />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
