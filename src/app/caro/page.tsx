import { GameLobby } from "@/components/GameLobby";

export default function CaroLobbyPage() {
  return (
    <GameLobby
      gameType="caro"
      title="Cờ Caro"
      say="Tạo phòng rồi gửi mã cho bạn nhé!"
      facts={["2 người", "Bàn 15×15", "5 viên liền nhau là thắng"]}
    />
  );
}
