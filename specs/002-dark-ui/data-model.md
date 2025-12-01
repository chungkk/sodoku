# Mô hình dữ liệu: Đăng nhập và Quản lý Người dùng

**Branch**: `002-dark-ui`  
**Ngày**: 2025-12-01

## Entity: User

### Mô tả
Lưu trữ thông tin người dùng đã đăng ký, bao gồm xác thực và thống kê chơi game.

### Fields

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `_id` | ObjectId | Tự động | ID duy nhất | MongoDB tự tạo |
| `email` | String | Có | Email đăng nhập | Email hợp lệ, unique, lowercase |
| `password` | String | Có | Mật khẩu đã hash | Min 6 ký tự (trước khi hash) |
| `displayName` | String | Có | Tên hiển thị | 2-20 ký tự |
| `points` | Number | Không | Điểm số tích lũy | Default: 0, Min: 0 |
| `stats.wins` | Number | Không | Số trận thắng | Default: 0 |
| `stats.losses` | Number | Không | Số trận thua | Default: 0 |
| `stats.totalGames` | Number | Không | Tổng số trận | Default: 0 |
| `createdAt` | Date | Tự động | Ngày tạo | Timestamps |
| `updatedAt` | Date | Tự động | Ngày cập nhật | Timestamps |

### Indexes
- `email`: unique index
- `points`: descending (cho bảng xếp hạng)

### Relationships
- User `1 --- 0..*` Player: Một user có thể có nhiều session (Player)
- User `1 --- 0..*` GameHistory: Thông qua Player

## Entity: Player (Cập nhật)

### Thay đổi
Liên kết chặt hơn với User model:

| Field | Thay đổi |
|-------|----------|
| `userId` | Optional ObjectId ref User - liên kết với tài khoản đã đăng ký |
| `isGuest` | true nếu không có userId |

## Entity: GameHistory (Cập nhật)

### Thay đổi
Thêm trường để theo dõi điểm số:

| Field | Type | Description |
|-------|------|-------------|
| `pointsAwarded` | Boolean | Đã tính điểm cho trận này chưa |

## State Transitions

### User Points

```
Trạng thái: Điểm số người dùng

[Game Started]
    │
    v
[Game Ended]
    │
    ├── Rank 1 (Thắng) ──> points += 10
    │
    └── Rank > 1 hoặc Gave Up (Thua) ──> points = max(0, points - 10)
```

### Quy tắc tính điểm
1. Chỉ tính điểm cho người dùng đã đăng nhập (có userId)
2. Guest players không được tính điểm
3. Điểm chỉ được tính một lần mỗi trận (check `pointsAwarded`)
4. Điểm không thể âm (minimum 0)

## Validation Rules

### User Registration
```
- email: required, valid email format, unique
- password: required, min 6 characters
- displayName: required, 2-20 characters, alphanumeric + spaces
```

### User Login
```
- email: required, exists in database
- password: required, matches hashed password
```

### Profile Update
```
- displayName: optional, 2-20 characters if provided
- password: optional, min 6 characters if provided
```

## Schema TypeScript

```typescript
// src/models/User.ts
export interface IUserStats {
  wins: number;
  losses: number;
  totalGames: number;
}

export interface IUser extends Document {
  email: string;
  password: string;
  displayName: string;
  points: number;
  stats: IUserStats;
  createdAt: Date;
  updatedAt: Date;
}
```
