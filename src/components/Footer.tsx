export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Links */}
          <div className="flex items-center gap-4 font-retro text-base text-muted-foreground">
            <a href="/practice" className="hover:text-primary transition-colors">
              Practice
            </a>
            <span className="text-border">•</span>
            <a href="/" className="hover:text-primary transition-colors">
              Arena
            </a>
          </div>
          
          {/* Credit */}
          <p className="font-retro text-sm text-muted-foreground">
            Classic Sudoku
          </p>
        </div>
      </div>
    </footer>
  );
}
