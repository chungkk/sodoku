import Link from "next/link";
import { CenterScreen } from "@/components/room";

export default function NotFound() {
  return (
    <CenterScreen mood="sad" title="Không có trang này rồi">
      <p className="mb-4 text-lg font-semibold">Trang bạn tìm không tồn tại hoặc đã bị xóa.</p>
      <Link href="/" className="candy-gloss inline-flex min-h-12 items-center rounded-full border-4 border-ink bg-cherry px-6 font-display text-lg text-milk">
        Về trang chủ
      </Link>
    </CenterScreen>
  );
}
