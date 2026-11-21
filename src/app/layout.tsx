import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Đọc header để Next.js render động và tự gắn CSP nonce từ src/proxy.ts vào script hydrate
  await headers();
  return (
    <html lang="vi">
      <body className={`${display.variable} ${body.variable} flex min-h-dvh flex-col font-sans antialiased`}>
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:border-4 focus:border-ink focus:bg-lemon focus:px-4 focus:py-2 focus:font-bold focus:text-ink"
          >
            Bỏ qua tới nội dung chính
          </a>
          <Header />
          <main id="main-content" className="flex flex-1 flex-col">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
