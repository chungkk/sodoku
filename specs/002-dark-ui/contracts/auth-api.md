# API Contracts: Xác thực (Authentication)

**Base Path**: `/api/auth`

---

## POST /api/auth/register

### Mô tả
Đăng ký tài khoản người dùng mới.

### Request
```typescript
// Headers
Content-Type: application/json

// Body
{
  "email": string,      // Email đăng nhập
  "password": string,   // Mật khẩu (min 6 ký tự)
  "displayName": string // Tên hiển thị (2-20 ký tự)
}
```

### Response

#### 201 Created
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
  "error": "Thiếu thông tin bắt buộc" | "Email không hợp lệ" | "Mật khẩu phải có ít nhất 6 ký tự"
}
```

#### 409 Conflict
```typescript
{
  "success": false,
  "error": "Email đã được sử dụng"
}
```

---

## POST /api/auth/login

### Mô tả
Đăng nhập vào tài khoản.

### Request
```typescript
// Headers
Content-Type: application/json

// Body
{
  "email": string,
  "password": string
}
```

### Response

#### 200 OK
```typescript
// Headers
Set-Cookie: session=<token>; HttpOnly; Secure; SameSite=Strict; Path=/

// Body
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

#### 401 Unauthorized
```typescript
{
  "success": false,
  "error": "Email hoặc mật khẩu không đúng"
}
```

---

## POST /api/auth/logout

### Mô tả
Đăng xuất khỏi tài khoản.

### Request
```typescript
// Headers
Cookie: session=<token>
```

### Response

#### 200 OK
```typescript
// Headers
Set-Cookie: session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0

// Body
{
  "success": true
}
```

---

## GET /api/auth/me

### Mô tả
Lấy thông tin người dùng hiện tại từ session.

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
      "totalGames": number
    }
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
