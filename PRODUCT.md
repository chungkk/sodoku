# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Bạn bè, người lớn trẻ. Một người tạo phòng, gửi mã phòng cho bạn rồi cùng chơi một ván nhanh, chủ yếu trên điện thoại. Không cần tài khoản: nhập tên là chơi.

## Product Purpose

Solo Games cho hai người trở lên thách đấu nhau trực tiếp bằng Sudoku và Caro, và cho một người luyện Sudoku. Thành công là từ lúc nhận mã phòng đến lúc vào ván chỉ mất vài giây, và ván đấu khiến bạn bè muốn chơi thêm ván nữa.

## Positioning

Đấu trực tiếp với bạn bè bằng mã phòng, không đăng ký, thấy tiến độ của đối thủ theo thời gian thực.

## Operating Context

Chơi trên trình duyệt điện thoại là chính, thường trong lúc rảnh ngắn. Mã phòng được gửi qua ứng dụng nhắn tin. Mất kết nối ngắn là chuyện thường và phải chơi tiếp được.

## Capabilities and Constraints

- Sudoku đối kháng tối đa 4 người: chủ phòng chọn độ khó (dễ, trung bình, khó), ai giải đúng trước thắng, có thể bỏ cuộc, tạm dừng tối đa 3 phút mỗi người mỗi ván.
- Caro 2 người, bàn 15x15, 5 quân liên tiếp thắng, mỗi lượt 5 phút, tạm dừng tối đa 3 phút mỗi người mỗi ván.
- Sudoku luyện tập một mình, 6 độ khó. Logic gợi ý có trong code nhưng chưa có nút trên giao diện.
- Chỉ có khách, không có tài khoản hay bảng xếp hạng toàn cục.
- Client đối kháng không có lời giải: giao diện không được hiển thị đúng/sai theo đáp án, chỉ báo trùng theo luật Sudoku.
- Next.js 16, React 19, Tailwind CSS 3, Framer Motion. Toàn bộ chữ giao diện tiếng Việt.

## Brand Commitments

- Tên: Solo Games.
- Linh vật: tắc kè hoa sọc đỏ trắng đeo kính tròn, đội mũ có quả bông, đậu trên cành cây, lấy từ dự án shadow-new (public/mascot.svg), bỏ tai nghe và các vạch sóng âm vì đó là chi tiết của app luyện nghe.
- Tính cách theo yêu cầu của chủ dự án: vui vẻ, dễ thương, đáng yêu.

## Evidence on Hand

Không có số người chơi, lời chứng thực hay bảng xếp hạng thật. Không được bịa các con số hay lời khen.

## Product Principles

1. Vào ván nhanh: mỗi bước trước khi chơi phải ngắn và không bắt buộc đăng ký.
2. Bàn cờ là trung tâm: trang trí không được làm chậm hay che thao tác khi đang thi đấu.
3. Đối thủ luôn hiện diện: người chơi luôn biết đối thủ đang ở đâu.
4. Thắng thua đều vui: mọi kết quả đều mời chơi ván tiếp theo.
