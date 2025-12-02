export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <a href="/practice" className="text-muted-foreground hover:text-foreground transition-colors">
              Luyện tập
            </a>
            <a href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Đấu trường
            </a>
          </div>
          
          {/* Credit */}
          <p className="text-sm text-muted-foreground">
            Sudoku Game
          </p>
        </div>
      </div>
    </footer>
  );
}
