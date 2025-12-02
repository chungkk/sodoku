export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="hidden md:block bg-gray-50 border-t border-gray-100 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-xl">🧩</span>
            <span className="font-medium">Sudoku Game</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span>Chơi một mình hoặc cùng bạn bè</span>
          </div>

          <p className="text-sm text-gray-400">
            &copy; {currentYear} Sudoku. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
