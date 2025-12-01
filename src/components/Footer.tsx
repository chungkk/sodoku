export function Footer() {
  return (
    <footer className="bg-card border-t-4 border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Links */}
          <div className="flex items-center gap-4 font-retro text-sm text-muted-foreground">
            <a href="/practice" className="hover:text-primary transition-colors">
              PRACTICE
            </a>
            <span className="text-border">•</span>
            <a href="/" className="hover:text-primary transition-colors">
              ARENA
            </a>
          </div>
          
          {/* Credit */}
          <p className="font-retro text-xs text-muted-foreground">
            &lt;3 PUZZLE LOVERS
          </p>
        </div>
      </div>
    </footer>
  );
}
