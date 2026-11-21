import { GameLobby } from "@/components/GameLobby";

export default function SudokuLobbyPage() {
  return (
    <GameLobby
      gameType="sudoku"
      title="Sudoku"
      say="Tạo phòng rồi gửi mã cho bạn nhé!"
      facts={["2–4 người", "3 độ khó", "Ai giải xong trước thắng"]}
    />
  );
}
