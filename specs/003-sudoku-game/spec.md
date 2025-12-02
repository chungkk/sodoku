# Feature Specification: Trang Chơi Sudoku

**Feature Branch**: `003-sudoku-game`  
**Created**: 2025-12-02  
**Status**: Draft  
**Input**: Tạo trang chơi Sudoku với 2 chế độ: tập luyện và solo multiplayer, giao diện sáng, hoạt hình, responsive

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Chơi chế độ Tập Luyện (Priority: P1)

Người chơi muốn luyện tập Sudoku một mình để cải thiện kỹ năng mà không cần tạo phòng hay chờ người khác.

**Why this priority**: Đây là chế độ cơ bản nhất, cho phép người dùng trải nghiệm game ngay lập tức mà không cần setup phức tạp. Là MVP cốt lõi.

**Independent Test**: Có thể test đầy đủ bằng cách truy cập trang, chọn chế độ Tập Luyện, và hoàn thành một bàn Sudoku.

**Acceptance Scenarios**:

1. **Given** người dùng ở trang chủ, **When** click vào nút "Tập Luyện", **Then** hiển thị bàn Sudoku mới với timer bắt đầu đếm
2. **Given** người dùng đang chơi, **When** chọn một ô trống và nhập số, **Then** số được hiển thị trong ô đó
3. **Given** người dùng đang chơi, **When** bật chế độ "Nháp", **Then** số nhập vào hiển thị nhỏ hơn và có thể nhập nhiều số vào một ô
4. **Given** người dùng đang chơi, **When** click nút "Tạm dừng", **Then** bàn cờ bị ẩn/mờ và timer dừng lại
5. **Given** người dùng hoàn thành đúng tất cả các ô, **When** hệ thống kiểm tra, **Then** hiển thị thông báo chiến thắng với thời gian hoàn thành

---

### User Story 2 - Tạo phòng Solo làm Host (Priority: P2)

Người chơi muốn tạo một phòng chơi Solo để mời bạn bè cùng thi đấu.

**Why this priority**: Cho phép trải nghiệm multiplayer - tính năng phân biệt với các game Sudoku thông thường.

**Independent Test**: Có thể test bằng cách tạo phòng, nhận mã phòng, và xác nhận phòng hiển thị trạng thái chờ người chơi.

**Acceptance Scenarios**:

1. **Given** người dùng ở trang chủ, **When** click "Tạo phòng Solo", **Then** hệ thống tạo phòng mới và hiển thị mã phòng
2. **Given** host đã tạo phòng, **When** có người khác tham gia và nhấn "Sẵn sàng", **Then** host thấy trạng thái "Sẵn sàng" của người đó
3. **Given** phòng có ít nhất 1 người khác đã sẵn sàng, **When** host click "Bắt đầu", **Then** game bắt đầu cho tất cả người chơi trong phòng
4. **Given** phòng đã có 4 người chơi, **When** người thứ 5 cố gắng tham gia, **Then** hiển thị thông báo phòng đã đầy

---

### User Story 3 - Tham gia phòng Solo (Priority: P2)

Người chơi muốn tham gia phòng Solo của bạn bè để thi đấu.

**Why this priority**: Hoàn thiện trải nghiệm multiplayer, cần thiết để chế độ Solo hoạt động đầy đủ.

**Independent Test**: Có thể test bằng cách nhập mã phòng, xác nhận vào được phòng và thấy danh sách người chơi khác.

**Acceptance Scenarios**:

1. **Given** người dùng ở trang chủ, **When** nhập mã phòng và click "Tham gia", **Then** vào được phòng chờ và thấy danh sách người chơi
2. **Given** người dùng đã vào phòng, **When** click "Sẵn sàng", **Then** trạng thái của mình chuyển thành "Sẵn sàng" và host thấy được
3. **Given** host nhấn "Bắt đầu", **When** game khởi động, **Then** tất cả người chơi thấy cùng một bàn Sudoku và timer đồng bộ

---

### User Story 4 - Thi đấu trong phòng Solo (Priority: P3)

Người chơi muốn hoàn thành Sudoku nhanh hơn đối thủ để giành chiến thắng.

**Why this priority**: Là mục tiêu cuối cùng của chế độ Solo, nhưng phụ thuộc vào các story khác.

**Independent Test**: Có thể test bằng cách chạy một game với nhiều người chơi và xác nhận người hoàn thành trước được công nhận thắng.

**Acceptance Scenarios**:

1. **Given** game đang diễn ra, **When** một người chơi hoàn thành đúng bàn Sudoku, **Then** thông báo người thắng hiển thị cho tất cả
2. **Given** game đang diễn ra, **When** theo dõi tiến độ, **Then** hiển thị tiến độ (%) của tất cả người chơi real-time
3. **Given** người chơi bỏ cuộc hoặc thoát, **When** cập nhật trạng thái, **Then** các người chơi khác thấy trạng thái "Đã thoát"

---

### User Story 5 - Trải nghiệm giao diện (Priority: P1)

Người chơi muốn có giao diện dễ nhìn, vui tươi trên cả desktop và mobile.

**Why this priority**: Trải nghiệm người dùng tốt là yếu tố quyết định để người chơi quay lại.

**Independent Test**: Có thể test bằng cách mở trang trên các thiết bị khác nhau và đánh giá độ thân thiện.

**Acceptance Scenarios**:

1. **Given** người dùng truy cập trên desktop, **When** trang load xong, **Then** hiển thị header, bàn cờ ở giữa, các controls rõ ràng, footer
2. **Given** người dùng truy cập trên mobile, **When** trang load xong, **Then** giao diện responsive, số pad dễ bấm, bàn cờ vừa màn hình
3. **Given** trang đang hiển thị, **When** quan sát giao diện, **Then** màu sắc tươi sáng, có yếu tố hoạt hình nhẹ, phân chia khu vực rõ ràng

---

### Edge Cases

- Người chơi mất kết nối giữa game Solo - hệ thống xử lý timeout và thông báo cho người chơi khác
- Host rời phòng khi chưa bắt đầu - hệ thống chỉ định host mới hoặc đóng phòng
- Người chơi cố nhập số không hợp lệ (chữ, ký tự đặc biệt) - chỉ chấp nhận số 1-9
- Người chơi điền số vào ô đã có số gốc - không cho phép sửa ô gốc
- Mất điện/refresh trang giữa game - lưu trạng thái và cho phép tiếp tục (với chế độ Tập Luyện)

## Requirements *(mandatory)*

### Functional Requirements

**Chung:**
- **FR-001**: Hệ thống PHẢI hiển thị Header với logo/tên game và menu điều hướng
- **FR-002**: Hệ thống PHẢI hiển thị Footer với thông tin bản quyền/liên hệ
- **FR-003**: Hệ thống PHẢI responsive trên desktop (>1024px) và mobile (<768px)
- **FR-004**: Giao diện PHẢI sử dụng tone màu sáng, thân thiện với yếu tố hoạt hình

**Bàn chơi Sudoku:**
- **FR-005**: Hệ thống PHẢI hiển thị bàn Sudoku 9x9 với các ô 3x3 được phân biệt rõ ràng
- **FR-006**: Người chơi PHẢI có thể chọn ô trống và nhập số từ 1-9
- **FR-007**: Hệ thống PHẢI có chế độ "Điền số" (số chính thức) và "Nháp" (ghi chú nhiều số)
- **FR-008**: Số pad PHẢI hiển thị các số 1-9 để người chơi click chọn
- **FR-009**: Ô gốc của puzzle PHẢI được hiển thị khác biệt và không cho sửa
- **FR-010**: Hệ thống PHẢI highlight ô đang chọn và các ô liên quan (cùng hàng, cột, block)

**Chế độ Tập Luyện:**
- **FR-011**: Người chơi PHẢI có thể bắt đầu game Tập Luyện ngay từ trang chủ
- **FR-012**: Hệ thống PHẢI hiển thị timer đếm thời gian chơi
- **FR-013**: Người chơi PHẢI có thể Tạm dừng (pause) game, timer dừng và bàn cờ bị ẩn
- **FR-014**: Hệ thống PHẢI thông báo khi người chơi hoàn thành đúng puzzle

**Chế độ Solo (Multiplayer):**
- **FR-015**: Host PHẢI có thể tạo phòng và nhận mã phòng duy nhất
- **FR-016**: Người chơi PHẢI có thể tham gia phòng bằng mã phòng
- **FR-017**: Phòng PHẢI giới hạn tối đa 4 người chơi
- **FR-018**: Người chơi (không phải host) PHẢI nhấn "Sẵn sàng" trước khi game bắt đầu
- **FR-019**: Host PHẢI thấy trạng thái sẵn sàng của tất cả người chơi
- **FR-020**: Host PHẢI có thể nhấn "Bắt đầu" khi có ít nhất 1 người khác sẵn sàng
- **FR-021**: Tất cả người chơi trong phòng PHẢI nhận cùng một puzzle khi game bắt đầu
- **FR-022**: Hệ thống PHẢI hiển thị tiến độ (%) của tất cả người chơi real-time
- **FR-023**: Hệ thống PHẢI xác định và thông báo người thắng (hoàn thành đúng đầu tiên)

### Key Entities

- **Puzzle**: Bàn Sudoku 9x9, các ô gốc, lời giải đúng
- **Game Session**: Trạng thái game hiện tại, thời gian, tiến độ, chế độ chơi
- **Room (Solo)**: Mã phòng, danh sách người chơi, host, trạng thái (chờ/đang chơi/kết thúc)
- **Player**: Tên/định danh, trạng thái sẵn sàng, tiến độ hoàn thành, thời gian

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Người dùng có thể bắt đầu game Tập Luyện trong vòng 3 giây từ trang chủ
- **SC-002**: Người dùng có thể tạo/tham gia phòng Solo trong vòng 10 giây
- **SC-003**: Tiến độ của người chơi trong phòng Solo cập nhật trong vòng 1 giây
- **SC-004**: Giao diện hiển thị đúng và dễ sử dụng trên màn hình từ 320px đến 1920px
- **SC-005**: 90% người dùng có thể hoàn thành thao tác nhập số mà không cần hướng dẫn
- **SC-006**: Hệ thống hỗ trợ ít nhất 10 phòng Solo hoạt động đồng thời
- **SC-007**: Người dùng đánh giá giao diện "thân thiện" và "dễ nhìn" qua khảo sát

## Assumptions

- Người dùng có kết nối internet ổn định cho chế độ Solo
- Browser hỗ trợ WebSocket hoặc tương đương cho real-time updates
- Không cần đăng nhập/đăng ký để chơi (chơi với tên tạm thời)
- Puzzle Sudoku được generate có độ khó trung bình (một level duy nhất ban đầu)
- Không cần lưu lịch sử game trong phase đầu
