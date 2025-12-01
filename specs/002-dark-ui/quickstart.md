# Hướng dẫn Bắt đầu: Đăng nhập và Quản lý Người dùng

**Branch**: `002-dark-ui`

## Tổng quan

Tính năng này thêm:
1. Trang đăng nhập/đăng ký
2. Trang quản lý profile người dùng
3. Hệ thống điểm số (thắng +10, thua -10)
4. Thống kê chiến thắng/thua cuộc

## Yêu cầu

### Dependencies cần cài đặt
```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

## Cấu trúc Files mới

```
src/
├── models/
│   └── User.ts              # Model người dùng mới
├── lib/
│   └── auth.ts              # Helper functions cho authentication
├── app/
│   ├── login/
│   │   └── page.tsx         # Trang đăng nhập
│   ├── register/
│   │   └── page.tsx         # Trang đăng ký
│   ├── profile/
│   │   └── page.tsx         # Trang quản lý profile
│   └── api/
│       ├── auth/
│       │   ├── register/route.ts
│       │   ├── login/route.ts
│       │   ├── logout/route.ts
│       │   └── me/route.ts
│       └── user/
│           ├── profile/route.ts
│           ├── leaderboard/route.ts
│           └── points/update/route.ts
├── components/
│   ├── LoginForm.tsx        # Form đăng nhập
│   ├── RegisterForm.tsx     # Form đăng ký
│   ├── ProfileCard.tsx      # Hiển thị thông tin profile
│   └── StatsCard.tsx        # Hiển thị thống kê
└── contexts/
    └── AuthContext.tsx      # Context cho authentication state
```

## Hướng dẫn Implementation

### Bước 1: Tạo User Model
- Tạo `src/models/User.ts` với schema như trong `data-model.md`
- Hash password với bcrypt trước khi lưu

### Bước 2: Tạo Auth APIs
- Implement các endpoint trong `contracts/auth-api.md`
- Sử dụng cookie httpOnly cho session

### Bước 3: Tạo Auth Context
- Wrap app với AuthContext
- Cung cấp user state và login/logout functions

### Bước 4: Tạo UI Pages
- Trang `/login` - form đăng nhập
- Trang `/register` - form đăng ký
- Trang `/profile` - quản lý profile và xem thống kê

### Bước 5: Tích hợp điểm số
- Cập nhật game logic để gọi `/api/user/points/update` khi trận kết thúc
- Chỉ tính điểm cho người dùng đã đăng nhập

## Commands

```bash
# Cài đặt dependencies
npm install bcryptjs
npm install -D @types/bcryptjs

# Chạy dev server
npm run dev

# Build
npm run build
```

## Giao diện (UI)

### Trang Đăng nhập
- Form với email và password
- Link sang trang đăng ký
- Button "Chơi như khách" để tiếp tục không đăng nhập

### Trang Đăng ký
- Form với email, password, tên hiển thị
- Link sang trang đăng nhập

### Trang Profile
- Card hiển thị thông tin cơ bản
- Thống kê: Số trận thắng, thua, tổng trận
- Điểm số hiện tại
- Danh sách trận gần đây
- Form đổi tên hiển thị/mật khẩu

## Notes

- Giao diện sử dụng dark theme giống như spec ban đầu
- Tất cả text bằng tiếng Việt
- Mobile-responsive
