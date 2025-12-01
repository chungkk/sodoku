import { Grid3X3, Github, Heart } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Grid3X3 className="w-4 h-4 text-primary" />
              </div>
              <span className="font-bold text-lg">Sudoku</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Chơi Sudoku một mình hoặc cạnh tranh với bạn bè trong thời gian thực.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Chế độ chơi</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/practice" className="hover:text-foreground transition-colors">
                  Luyện tập Solo
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Đấu trường Multiplayer
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Hướng dẫn</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Tạo phòng và chia sẻ mã với bạn bè</li>
              <li>Từ 2 người trở lên là có thể bắt đầu</li>
              <li>Ai giải nhanh hơn sẽ thắng!</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Sudoku. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for puzzle lovers
          </p>
        </div>
      </div>
    </footer>
  );
}
