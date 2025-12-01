# Nghiên cứu: Tính năng Đăng nhập và Quản lý Người dùng

**Ngày**: 2025-12-01  
**Branch**: `002-dark-ui`

## 1. Xác thực người dùng (Authentication)

### Quyết định
Sử dụng xác thực đơn giản với email/password, lưu session trong cookie httpOnly.

### Lý do
- Dự án sử dụng Next.js 14+ với API Routes
- Không cần OAuth phức tạp cho game đơn giản
- Mongoose đã được cài đặt, có thể lưu User trực tiếp vào MongoDB
- Player model đã có trường `userId` reference đến User

### Các phương án đã xem xét
1. **NextAuth.js** - Quá phức tạp cho nhu cầu hiện tại
2. **JWT tokens** - Cần quản lý refresh token
3. **Session cookie (đã chọn)** - Đơn giản, bảo mật với httpOnly

## 2. Hệ thống điểm số (Points System)

### Quyết định
- Thắng trận: +10 điểm
- Thua trận: -10 điểm
- Điểm tối thiểu: 0 (không âm)

### Lý do
- Yêu cầu trực tiếp từ người dùng
- Đơn giản, dễ hiểu
- Điểm không âm để tránh tâm lý tiêu cực

### Cách tính thắng/thua
- **Thắng**: Người hoàn thành đầu tiên (rank === 1) trong trận multiplayer
- **Thua**: Người không hoàn thành đầu tiên hoặc bỏ cuộc

## 3. Quản lý Profile

### Quyết định
Trang profile sẽ hiển thị:
- Thông tin cơ bản (tên hiển thị, email)
- Thống kê: số trận thắng, số trận thua, tổng số trận
- Điểm số hiện tại
- Lịch sử các trận gần đây

### Lý do
- Người dùng muốn theo dõi tiến trình
- Tạo động lực cạnh tranh

## 4. Cấu trúc dữ liệu

### User Model mới
```typescript
interface IUser {
  email: string;
  password: string; // hashed với bcrypt
  displayName: string;
  points: number;
  stats: {
    wins: number;
    losses: number;
    totalGames: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Cập nhật Player Model
- Liên kết `userId` với User đã đăng ký
- Guest players không có `userId`

## 5. API Endpoints cần thiết

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/api/auth/register` | POST | Đăng ký tài khoản mới |
| `/api/auth/login` | POST | Đăng nhập |
| `/api/auth/logout` | POST | Đăng xuất |
| `/api/auth/me` | GET | Lấy thông tin user hiện tại |
| `/api/user/profile` | GET | Lấy thông tin profile chi tiết |
| `/api/user/profile` | PUT | Cập nhật profile |

## 6. Thư viện cần thiết

### Đã có
- `mongoose` - ODM cho MongoDB
- `next` - Framework
- `tailwindcss` + `shadcn/ui` - UI components

### Cần thêm
- `bcryptjs` - Hash password
- Không cần thêm thư viện khác

## 7. Bảo mật

### Các biện pháp
- Password hash với bcrypt (cost factor 10)
- Session cookie httpOnly, secure, sameSite: strict
- Validate input ở cả client và server
- Rate limiting cho login endpoint (tương lai)
