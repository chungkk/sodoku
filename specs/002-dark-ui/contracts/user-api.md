# API Contracts: Quản lý Người dùng (User Management)

**Base Path**: `/api/user`

---

## GET /api/user/profile

### Mô tả
Lấy thông tin profile chi tiết của người dùng đang đăng nhập.

### Request
```typescript
// Headers
Cookie: session=<token>
```

### Response

#### 200 OK
```typescript
{
  "success": true,
  "data": {
    "id": string,
    "email": string,
    "displayName": string,
    "points": number,
    "stats": {
      "wins": number,
      "losses": number,
      "totalGames": number,
      "winRate": number  // Tính toán: wins / totalGames * 100
    },
    "recentGames": [
      {
        "roomCode": string,
        "difficulty": string,
        "rank": number,
        "completionTime": number | null,
        "status": "completed" | "gave_up",
        "pointsChange": number,  // +10 hoặc -10
        "playedAt": string       // ISO date
      }
    ],
    "createdAt": string
  }
}
```

#### 401 Unauthorized
```typescript
{
  "success": false,
  "error": "Chưa đăng nhập"
}
```

---

## PUT /api/user/profile

### Mô tả
Cập nhật thông tin profile.

### Request
```typescript
// Headers
Content-Type: application/json
Cookie: session=<token>

// Body
{
  "displayName"?: string,  // Optional, 2-20 ký tự
  "password"?: string      // Optional, min 6 ký tự (mật khẩu mới)
}
```

### Response

#### 200 OK
```typescript
{
  "success": true,
  "data": {
    "id": string,
    "email": string,
    "displayName": string,
    "points": number,
    "stats": {
      "wins": number,
      "losses": number,
      "totalGames": number
    }
  }
}
```

#### 400 Bad Request
```typescript
{
  "success": false,
  "error": "Tên hiển thị phải từ 2-20 ký tự" | "Mật khẩu phải có ít nhất 6 ký tự"
}
```

#### 401 Unauthorized
```typescript
{
  "success": false,
  "error": "Chưa đăng nhập"
}
```

---

## GET /api/user/leaderboard

### Mô tả
Lấy bảng xếp hạng người chơi theo điểm số.

### Request
```typescript
// Query Parameters
?limit=10  // Số lượng người chơi (default: 10, max: 100)
```

### Response

#### 200 OK
```typescript
{
  "success": true,
  "data": [
    {
      "rank": number,
      "displayName": string,
      "points": number,
      "stats": {
        "wins": number,
        "totalGames": number
      }
    }
  ]
}
```

---

## POST /api/user/points/update

### Mô tả
Cập nhật điểm số sau khi kết thúc trận (internal API, gọi từ game logic).

### Request
```typescript
// Headers
Content-Type: application/json

// Body
{
  "gameHistoryId": string,
  "results": [
    {
      "userId": string,
      "isWinner": boolean
    }
  ]
}
```

### Response

#### 200 OK
```typescript
{
  "success": true,
  "data": {
    "updated": [
      {
        "userId": string,
        "pointsChange": number,
        "newPoints": number
      }
    ]
  }
}
```

#### 400 Bad Request
```typescript
{
  "success": false,
  "error": "Điểm đã được tính cho trận này"
}
```
