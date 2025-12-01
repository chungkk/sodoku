# Implementation Plan: Đăng nhập và Quản lý Người dùng

**Branch**: `002-dark-ui` | **Date**: 2025-12-01 | **Spec**: [spec.md](./spec.md)
**Input**: Yêu cầu người dùng: thêm trang login, trang quản lý user profile với điểm số

## Summary

Thêm hệ thống xác thực người dùng (đăng nhập/đăng ký) và trang quản lý profile với:
- Theo dõi số trận thắng/thua
- Hệ thống điểm số (thắng +10, thua -10)
- Bảng xếp hạng người chơi

Sử dụng session cookie đơn giản với bcrypt để hash password, tích hợp vào UI dark theme hiện có.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 18+  
**Primary Dependencies**: Next.js 14+, Socket.IO, Mongoose, Tailwind CSS, shadcn/ui, bcryptjs  
**Storage**: MongoDB (qua Mongoose)  
**Testing**: Chưa cấu hình (echo test)  
**Target Platform**: Web browser (desktop + mobile)  
**Project Type**: web (Next.js full-stack)  
**Performance Goals**: Response time < 200ms cho API calls  
**Constraints**: Dark theme UI, tiếng Việt  
**Scale/Scope**: ~10 screens, hàng trăm người dùng

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Không có vi phạm. Dự án tuân thủ các nguyên tắc cơ bản.

## Project Structure

### Documentation (this feature)

```text
specs/002-dark-ui/
├── plan.md              # File này
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── auth-api.md
│   └── user-api.md
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── models/
│   ├── User.ts          # MỚI: Model người dùng
│   ├── Player.ts
│   ├── Room.ts
│   └── GameHistory.ts
├── lib/
│   ├── auth.ts          # MỚI: Authentication helpers
│   ├── mongodb.ts
│   └── utils.ts
├── components/
│   ├── LoginForm.tsx    # MỚI
│   ├── RegisterForm.tsx # MỚI
│   ├── ProfileCard.tsx  # MỚI
│   ├── StatsCard.tsx    # MỚI
│   └── ui/
├── contexts/
│   ├── AuthContext.tsx  # MỚI
│   ├── GameContext.tsx
│   └── PlayerContext.tsx
└── app/
    ├── login/page.tsx   # MỚI
    ├── register/page.tsx # MỚI
    ├── profile/page.tsx # MỚI
    └── api/
        ├── auth/        # MỚI
        │   ├── register/route.ts
        │   ├── login/route.ts
        │   ├── logout/route.ts
        │   └── me/route.ts
        └── user/        # MỚI
            ├── profile/route.ts
            ├── leaderboard/route.ts
            └── points/update/route.ts
```

**Structure Decision**: Next.js full-stack với API routes, tuân theo cấu trúc hiện có của dự án.
