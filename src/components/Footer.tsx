export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="hidden md:block bg-[#0a0a1a]/95 backdrop-blur-md border-t-2 border-cyan-400/30 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">🎮</span>
            <span
              className="font-mono font-bold uppercase tracking-wider text-transparent bg-clip-text"
              style={{
                backgroundImage: 'linear-gradient(180deg, #fff 0%, #00ffff 100%)',
                textShadow: '0 0 20px rgba(0, 255, 255, 0.5)'
              }}
            >
              Solo Games
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-cyan-400/70 font-mono">
            <span className="tracking-wider">[ Chơi một mình hoặc cùng bạn bè ]</span>
          </div>

          <p className="text-sm text-cyan-400/50 font-mono tracking-wide">
            &copy; {currentYear} SOLO GAMES
          </p>
        </div>
      </div>
    </footer>
  );
}
