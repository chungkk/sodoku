---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/app/sudoku","src/app/caro","src/app/practice","src/components"]
---

Scope: toàn bộ app Solo Games (trang chủ, sảnh Sudoku, sảnh Caro, phòng chờ, màn chơi, luyện tập, kết quả, 404, lỗi). Mode: experience. Điện thoại là chính.
Người dùng: bạn bè, người lớn trẻ, gửi mã phòng cho nhau chơi nhanh. Giữ nguyên tính năng và logic server.

## Direction contract

THESIS: Cả app là một hộp kẹo: bàn cờ là khay nhiều ngăn, mỗi nước đi là thả một viên kẹo. Từ chối app game chuẩn gồm thẻ trắng trên nền xám và hai cột thẻ giống nhau.

OWN-WORLD: Nền bạc hà #a9ecd8 phủ cả màn, viền và chữ nâu tím #55303f của linh vật, đỏ kẹo #e8384f, trắng sữa #fffaf3, vàng #ffd24d. Khay kẹo bo tròn viền dày, kẹo cứng có vệt bóng, nút là viên kẹo gói có hai đầu giấy xoắn, mái che sọc đỏ trắng trên đầu.

STORY: Người chơi thấy tắc kè và hai khay kẹo, biết ngay có hai trò, nhập tên hoặc mã phòng rồi vào ván; thắng thua đều được mời chơi tiếp.

FIRST VIEWPORT: Điện thoại: mái che sọc sát mép trên, tên Solo Games rất lớn, tắc kè đậu cành ở giữa, hai khay Sudoku và Caro chứa kẹo thật của từng trò, nút kẹo đỏ Vào phòng trong tầm ngón cái. Desktop: cùng các phần, tắc kè lớn bên trái, khay bên phải.

FORM: Hộp kẹo sọc, candidate 5 trong danh sách. seed:686cac426b783bb2. Tương tác đặc trưng: thả kẹo vào ngăn có độ nảy, kèm mắt tắc kè nhìn theo ô đang chọn. Nâng từ thử thách: lưới và số căn tuyệt đối thẳng; đường đi cố định, mỗi màn một việc; mỗi màn đúng một câu mệnh lệnh của tắc kè.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
