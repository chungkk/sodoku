# Tasks: Đăng nhập và Quản lý Người dùng

**Input**: Design documents từ `/specs/002-dark-ui/`
**Prerequisites**: plan.md, data-model.md, contracts/auth-api.md, contracts/user-api.md, research.md

**Tests**: KHÔNG bắt buộc (chưa cấu hình test framework)

**Tổ chức**: Tasks được nhóm theo user story để có thể implement và test độc lập.

## Format: `[ID] [P?] [Story?] Mô tả`

- **[P]**: Có thể chạy song song (files khác nhau, không có dependencies)
- **[Story]**: User story liên quan (US1, US2, US3...)
- Bao gồm đường dẫn file chính xác

## User Stories

| ID | Tên | Priority | Mô tả |
|----|-----|----------|-------|
| US1 | Đăng ký tài khoản | P1 | Người dùng có thể tạo tài khoản mới |
| US2 | Đăng nhập/Đăng xuất | P1 | Người dùng có thể đăng nhập và đăng xuất |
| US3 | Quản lý Profile | P1 | Người dùng xem và cập nhật thông tin cá nhân |
| US4 | Hệ thống điểm số | P2 | Tính điểm thắng/thua sau mỗi trận |
| US5 | Bảng xếp hạng | P2 | Hiển thị xếp hạng theo điểm số |

---

## Phase 1: Setup (Cơ sở hạ tầng)

**Mục đích**: Cài đặt dependencies và cấu trúc cơ bản

- [X] T001 Cài đặt bcryptjs: `npm install bcryptjs && npm install -D @types/bcryptjs`
- [X] T002 [P] Tạo auth helper functions trong `src/lib/auth.ts`
- [X] T003 [P] Tạo User model trong `src/models/User.ts`

---

## Phase 2: Foundational (Nền tảng bắt buộc)

**Mục đích**: Infrastructure cốt lõi PHẢI hoàn thành trước khi implement user stories

**⚠️ QUAN TRỌNG**: Không thể bắt đầu user story nào khi phase này chưa xong

- [X] T004 Tạo AuthContext provider trong `src/contexts/AuthContext.tsx`
- [X] T005 Wrap app với AuthProvider trong `src/app/layout.tsx`
- [X] T006 [P] Tạo API route GET `/api/auth/me` trong `src/app/api/auth/me/route.ts`

**Checkpoint**: Foundation ready - có thể bắt đầu implement user stories

---

## Phase 3: User Story 1 - Đăng ký tài khoản (Priority: P1) 🎯 MVP

**Goal**: Người dùng có thể tạo tài khoản mới với email, password, tên hiển thị

**Independent Test**: Truy cập `/register`, điền form, submit -> tài khoản được tạo trong DB

### Implementation cho User Story 1

- [X] T007 [US1] Tạo API route POST `/api/auth/register` trong `src/app/api/auth/register/route.ts`
- [X] T008 [US1] Tạo RegisterForm component trong `src/components/RegisterForm.tsx`
- [X] T009 [US1] Tạo trang đăng ký trong `src/app/register/page.tsx`
- [X] T010 [US1] Thêm validation cho email, password (min 6 ký tự), displayName (2-20 ký tự)
- [X] T011 [US1] Thêm error handling và hiển thị lỗi bằng tiếng Việt

**Checkpoint**: User Story 1 hoàn thành - có thể đăng ký tài khoản mới

---

## Phase 4: User Story 2 - Đăng nhập/Đăng xuất (Priority: P1) 🎯 MVP

**Goal**: Người dùng có thể đăng nhập với email/password và đăng xuất

**Independent Test**: Truy cập `/login`, điền form, submit -> session được tạo, redirect về trang chính

### Implementation cho User Story 2

- [X] T012 [P] [US2] Tạo API route POST `/api/auth/login` trong `src/app/api/auth/login/route.ts`
- [X] T013 [P] [US2] Tạo API route POST `/api/auth/logout` trong `src/app/api/auth/logout/route.ts`
- [X] T014 [US2] Tạo LoginForm component trong `src/components/LoginForm.tsx`
- [X] T015 [US2] Tạo trang đăng nhập trong `src/app/login/page.tsx`
- [X] T016 [US2] Cập nhật AuthContext với login/logout functions
- [X] T017 [US2] Thêm UI hiển thị trạng thái đăng nhập vào Header trong `src/components/Header.tsx`
- [X] T018 [US2] Thêm link "Đăng nhập"/"Đăng xuất" vào navigation

**Checkpoint**: User Story 2 hoàn thành - có thể đăng nhập/đăng xuất

---

## Phase 5: User Story 3 - Quản lý Profile (Priority: P1)

**Goal**: Người dùng xem thông tin cá nhân, thống kê thắng/thua, và cập nhật profile

**Independent Test**: Đăng nhập -> truy cập `/profile` -> xem thông tin và thống kê -> đổi tên hiển thị thành công

### Implementation cho User Story 3

- [X] T019 [P] [US3] Tạo API route GET `/api/user/profile` trong `src/app/api/user/profile/route.ts`
- [X] T020 [P] [US3] Tạo API route PUT `/api/user/profile` trong `src/app/api/user/profile/route.ts`
- [X] T021 [P] [US3] Tạo ProfileCard component trong `src/components/ProfileCard.tsx`
- [X] T022 [P] [US3] Tạo StatsCard component trong `src/components/StatsCard.tsx`
- [X] T023 [US3] Tạo trang profile trong `src/app/profile/page.tsx`
- [X] T024 [US3] Thêm form đổi tên hiển thị và mật khẩu
- [X] T025 [US3] Thêm danh sách trận gần đây (recent games) từ GameHistory

**Checkpoint**: User Story 3 hoàn thành - có thể xem và cập nhật profile

---

## Phase 6: User Story 4 - Hệ thống điểm số (Priority: P2)

**Goal**: Điểm được tính tự động: thắng +10, thua -10 (min 0)

**Independent Test**: Chơi và hoàn thành một trận -> kiểm tra điểm số trên profile thay đổi đúng

### Implementation cho User Story 4

- [ ] T026 [US4] Thêm trường `pointsAwarded` vào GameHistory model trong `src/models/GameHistory.ts`
- [ ] T027 [US4] Tạo API route POST `/api/user/points/update` trong `src/app/api/user/points/update/route.ts`
- [ ] T028 [US4] Tạo hàm calculatePoints trong `src/lib/auth.ts` (thắng +10, thua -10, min 0)
- [ ] T029 [US4] Tích hợp tính điểm vào game completion logic trong `src/app/api/games/[roomCode]/complete/route.ts`
- [ ] T030 [US4] Liên kết Player với User khi đăng nhập (cập nhật `userId` trong Player)

**Checkpoint**: User Story 4 hoàn thành - điểm được tính tự động sau mỗi trận

---

## Phase 7: User Story 5 - Bảng xếp hạng (Priority: P2)

**Goal**: Hiển thị top người chơi theo điểm số

**Independent Test**: Truy cập bảng xếp hạng -> thấy danh sách người chơi sắp xếp theo điểm giảm dần

### Implementation cho User Story 5

- [ ] T031 [P] [US5] Tạo API route GET `/api/user/leaderboard` trong `src/app/api/user/leaderboard/route.ts`
- [ ] T032 [P] [US5] Tạo LeaderboardCard component trong `src/components/LeaderboardCard.tsx`
- [ ] T033 [US5] Thêm bảng xếp hạng vào trang chính hoặc tạo trang riêng
- [ ] T034 [US5] Cập nhật Leaderboard component hiện có trong `src/components/Leaderboard.tsx` để hiển thị điểm

**Checkpoint**: User Story 5 hoàn thành - bảng xếp hạng hoạt động

---

## Phase 8: Polish & Cross-Cutting Concerns

**Mục đích**: Cải thiện và hoàn thiện

- [ ] T035 [P] Thêm loading states cho các form
- [ ] T036 [P] Thêm toast notifications cho actions (đăng nhập thành công, lỗi...)
- [ ] T037 Kiểm tra responsive trên mobile
- [ ] T038 Kiểm tra dark theme consistency cho các trang mới
- [ ] T039 Thêm link navigation giữa các trang (login, register, profile)
- [ ] T040 Chạy lint và fix lỗi: `npm run lint`

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup
    │
    v
Phase 2: Foundational (BLOCKS tất cả user stories)
    │
    ├──> Phase 3: US1 Đăng ký (P1) ──┐
    │                                 │
    ├──> Phase 4: US2 Đăng nhập (P1) ─┼──> Phase 6: US4 Điểm số (P2)
    │                                 │         │
    └──> Phase 5: US3 Profile (P1) ───┘         v
                                          Phase 7: US5 Bảng xếp hạng (P2)
                                                │
                                                v
                                          Phase 8: Polish
```

### User Story Dependencies

| User Story | Phụ thuộc vào | Có thể chạy song song với |
|------------|---------------|---------------------------|
| US1 (Đăng ký) | Foundation | US2 |
| US2 (Đăng nhập) | Foundation | US1 |
| US3 (Profile) | US2 (cần đăng nhập) | - |
| US4 (Điểm số) | US2, US3 | - |
| US5 (Bảng xếp hạng) | US4 | - |

### Parallel Opportunities

**Trong Phase 1:**
```bash
# Có thể chạy song song:
T002: Tạo auth helper functions trong src/lib/auth.ts
T003: Tạo User model trong src/models/User.ts
```

**Trong Phase 3 (US1):**
```bash
# Sau khi T007 (API register) xong:
T008: Tạo RegisterForm component
T009: Tạo trang đăng ký
# Có thể song song vì khác files
```

**Trong Phase 4 (US2):**
```bash
# Có thể chạy song song:
T012: API login
T013: API logout
```

**Trong Phase 5 (US3):**
```bash
# Có thể chạy song song:
T019: API GET profile
T020: API PUT profile
T021: ProfileCard component
T022: StatsCard component
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 (Đăng ký)
4. Complete Phase 4: US2 (Đăng nhập)
5. **STOP và VALIDATE**: Test đăng ký + đăng nhập hoạt động
6. Deploy/demo nếu ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (Đăng ký) → Test → Deploy (có thể đăng ký)
3. US2 (Đăng nhập) → Test → Deploy (có thể đăng nhập)
4. US3 (Profile) → Test → Deploy (xem thông tin)
5. US4 (Điểm số) → Test → Deploy (tính điểm)
6. US5 (Bảng xếp hạng) → Test → Deploy (full feature)

---

## File Paths Summary

### Models
- `src/models/User.ts` (MỚI)
- `src/models/GameHistory.ts` (CẬP NHẬT)
- `src/models/Player.ts` (CẬP NHẬT - liên kết userId)

### Lib
- `src/lib/auth.ts` (MỚI)

### Components
- `src/components/LoginForm.tsx` (MỚI)
- `src/components/RegisterForm.tsx` (MỚI)
- `src/components/ProfileCard.tsx` (MỚI)
- `src/components/StatsCard.tsx` (MỚI)
- `src/components/LeaderboardCard.tsx` (MỚI)
- `src/components/Header.tsx` (CẬP NHẬT)
- `src/components/Leaderboard.tsx` (CẬP NHẬT)

### Contexts
- `src/contexts/AuthContext.tsx` (MỚI)

### Pages
- `src/app/login/page.tsx` (MỚI)
- `src/app/register/page.tsx` (MỚI)
- `src/app/profile/page.tsx` (MỚI)
- `src/app/layout.tsx` (CẬP NHẬT)

### API Routes
- `src/app/api/auth/register/route.ts` (MỚI)
- `src/app/api/auth/login/route.ts` (MỚI)
- `src/app/api/auth/logout/route.ts` (MỚI)
- `src/app/api/auth/me/route.ts` (MỚI)
- `src/app/api/user/profile/route.ts` (MỚI)
- `src/app/api/user/leaderboard/route.ts` (MỚI)
- `src/app/api/user/points/update/route.ts` (MỚI)
- `src/app/api/games/[roomCode]/complete/route.ts` (CẬP NHẬT)

---

## Notes

- Tất cả text UI bằng tiếng Việt
- Tuân thủ dark theme hiện có
- Password hash với bcrypt (cost factor 10)
- Session cookie: httpOnly, secure, sameSite: strict
- Điểm số: thắng +10, thua -10, min 0
