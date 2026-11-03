/**
 * Cầu nối để API route phát sự kiện Socket.IO. Route được Next bundle riêng nên không dùng chung
 * module với socket server, chỉ chung process — vì vậy trao đổi qua globalThis.
 */
export interface Realtime {
  emit(socketRoom: string, event: string, data: unknown): void;
  caroTurnStarted(roomCode: string): void;
  caroTurnEnded(roomCode: string): void;
}

const store = globalThis as typeof globalThis & { __soloRealtime?: Realtime };

export function setRealtime(realtime: Realtime): void {
  store.__soloRealtime = realtime;
}

export const sudokuSocketRoom = (code: string) => `sudoku:${code}`;
export const caroSocketRoom = (code: string) => `caro:${code}`;

export function broadcast(socketRoom: string, event: string, data: unknown): void {
  store.__soloRealtime?.emit(socketRoom, event, data);
}

export function caroTurnStarted(roomCode: string): void {
  store.__soloRealtime?.caroTurnStarted(roomCode);
}

export function caroTurnEnded(roomCode: string): void {
  store.__soloRealtime?.caroTurnEnded(roomCode);
}
