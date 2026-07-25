# 🗺️ Kế Hoạch Backend — EIU Campus App

## Tổng Quan Hệ Thống

**Frontend hiện có**: Expo + React Native + TypeScript  
**Dữ liệu hiện tại**: Hardcode trong `buildings.ts` + `streets.json` (GeoJSON)  
**Mục tiêu thêm**:
- ✅ Trang **Admin** quản lý địa điểm (tòa nhà, POI)
- ✅ Tính năng **Lưu địa điểm yêu thích** của người dùng
- ✅ Backend API phục vụ toàn bộ data

---

## 🔵 Stack Công Nghệ

```
Mobile App  →  Expo + React Native + TypeScript   (đã có)
Backend     →  Node.js + Express.js + TypeScript   (sẽ tạo)
Database    →  PostgreSQL + Prisma ORM             (sẽ tạo)
Auth        →  JWT (JSON Web Token)                (cho Admin)
Hosting     →  Supabase (DB) + Railway (Server)    (miễn phí)
```

---

## 🗄️ Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ── Tài khoản Admin ──────────────────────────────
model Admin {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  password  String   // bcrypt hash, KHÔNG lưu plain text
  createdAt DateTime @default(now())
}

// ── Tài khoản người dùng thường ──────────────────
model User {
  id            Int            @id @default(autoincrement())
  deviceId      String         @unique  // ID thiết bị (không cần đăng ký)
  createdAt     DateTime       @default(now())
  savedPlaces   SavedPlace[]
}

// ── Địa điểm trong campus ────────────────────────
model Place {
  id          Int     @id @default(autoincrement())
  placeId     String  @unique  // VD: "b11", "canteen" (giữ tương thích với data cũ)
  title       String           // VD: "B11"
  label       String           // VD: "Block 11 (IT)"
  description String?
  latitude    Float
  longitude   Float
  type        PlaceType @default(BUILDING)
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  savedBy     SavedPlace[]
}

enum PlaceType {
  BUILDING
  PARKING
  CANTEEN
  LIBRARY
  OTHER
}

// ── Địa điểm yêu thích của user ──────────────────
model SavedPlace {
  id        Int      @id @default(autoincrement())
  userId    Int
  placeId   Int
  note      String?  // Ghi chú riêng của user
  savedAt   DateTime @default(now())

  user      User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  place     Place @relation(fields: [placeId], references: [id], onDelete: Cascade)

  @@unique([userId, placeId])  // Mỗi user chỉ lưu 1 lần mỗi địa điểm
}
```

---

## 🌐 API Routes

### 🔓 Public Routes (không cần đăng nhập)

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/places` | Lấy tất cả địa điểm |
| `GET` | `/api/places/:id` | Chi tiết 1 địa điểm |
| `GET` | `/api/places?type=BUILDING` | Lọc theo loại |

### 👤 User Routes (dùng deviceId)

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/api/users/register` | Đăng ký thiết bị (lần đầu mở app) |
| `GET` | `/api/users/saved` | Lấy danh sách địa điểm đã lưu |
| `POST` | `/api/users/saved` | Lưu một địa điểm |
| `DELETE`| `/api/users/saved/:placeId` | Xóa địa điểm đã lưu |

### 🔐 Admin Routes (cần JWT token)

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/api/admin/login` | Đăng nhập admin → nhận JWT |
| `POST` | `/api/places` | Thêm địa điểm mới |
| `PUT` | `/api/places/:id` | Sửa địa điểm |
| `DELETE`| `/api/places/:id` | Xóa (soft delete) địa điểm |

---

## 🔐 Luồng Authentication

### Admin Login Flow
```
[Admin Web Panel]
    │
    │  POST /api/admin/login { username, password }
    ▼
[Express Server]
    │  → Tìm admin trong DB
    │  → bcrypt.compare(password, hash)
    │  → Tạo JWT token (hết hạn sau 8h)
    ▼
[Trả về] { token: "eyJhbGci..." }
    │
    │  Admin lưu token vào localStorage
    │
    │  Mọi request sau: Header: Authorization: Bearer <token>
    ▼
[Express middleware verifyToken]
    │  → Verify JWT → Cho phép tiếp tục
```

### User (Anonymous) Flow
```
[Lần đầu mở App]
    │
    │  Lấy Device ID (expo-device hoặc random UUID)
    │  POST /api/users/register { deviceId }
    ▼
[Server] → Tạo User mới nếu chưa có → Trả về userId
    │
    │  App lưu userId vào AsyncStorage
    │
    │  POST /api/users/saved { placeId }  → Lưu địa điểm
    │  GET  /api/users/saved              → Lấy danh sách đã lưu
```

---

## 🏗️ Cấu Trúc Thư Mục Backend

```
d:\project_CSE310\
├── MyCampusApp\          ← Frontend (đang có)
└── MyCampusServer\       ← Backend (sẽ tạo)
    ├── src\
    │   ├── index.ts              ← Entry point, khởi động server
    │   ├── routes\
    │   │   ├── places.ts         ← CRUD địa điểm
    │   │   ├── users.ts          ← Đăng ký + saved places
    │   │   └── admin.ts          ← Auth + quản trị
    │   ├── middleware\
    │   │   ├── verifyToken.ts    ← Kiểm tra JWT (bảo vệ admin routes)
    │   │   └── errorHandler.ts   ← Xử lý lỗi tập trung
    │   └── lib\
    │       └── prisma.ts         ← Prisma client singleton
    ├── prisma\
    │   ├── schema.prisma         ← Định nghĩa bảng
    │   └── seed.ts               ← Nhập data từ buildings.ts vào DB
    ├── .env                      ← DATABASE_URL, JWT_SECRET
    ├── package.json
    └── tsconfig.json
```

---

## 📅 Lộ Trình Học 5 Tuần

### ⚡ Tuần 1 — Node.js & Express Cơ Bản

**Mục tiêu cuối tuần**: Server chạy được, trả data tòa nhà từ hardcode

```
Học:
├── Node.js là gì, npm, module system
├── Express: app.get(), app.post(), middleware
├── JSON response, status codes (200, 404, 500)
└── Postman / Thunder Client để test API

Làm:
└── GET /api/places → trả về BUILDINGS array (copy từ buildings.ts)
```

**Tài nguyên**: [Express.js Official Guide](https://expressjs.com/en/guide/routing.html)

---

### 🗄️ Tuần 2 — PostgreSQL + Prisma

**Mục tiêu cuối tuần**: Data tòa nhà lưu trong DB thật, API đọc từ DB

```
Học:
├── SQL cơ bản: SELECT, INSERT, UPDATE, DELETE, WHERE
├── Prisma schema, prisma migrate dev
├── Prisma Client: findMany(), findUnique(), create(), update(), delete()
└── Kết nối DB: DATABASE_URL trong .env

Làm:
├── Tạo schema.prisma với model Place
├── Chạy prisma db seed → nhập 12 tòa nhà từ buildings.ts vào DB
└── Sửa GET /api/places → đọc từ DB thay vì hardcode
```

---

### 🔐 Tuần 3 — Authentication (JWT)

**Mục tiêu cuối tuần**: Login admin, bảo vệ route POST/PUT/DELETE

```
Học:
├── JWT là gì (header.payload.signature)
├── bcrypt: hash password khi tạo, compare khi login
├── Middleware pattern trong Express
└── Header Authorization: Bearer <token>

Làm:
├── POST /api/admin/login → trả JWT
├── Middleware verifyToken → bảo vệ admin routes
└── POST /api/places → Admin thêm địa điểm mới
```

---

### 💾 Tuần 4 — Tính Năng Saved Places + Kết Nối Frontend

**Mục tiêu cuối tuần**: App mobile lưu/xóa địa điểm yêu thích

```
Học:
├── fetch() / axios trong React Native
├── AsyncStorage để lưu userId trên máy
├── useEffect + useState để gọi API
└── Loading & Error state handling

Làm:
├── POST /api/users/register → đăng ký thiết bị
├── POST /api/users/saved → lưu địa điểm
├── GET  /api/users/saved → lấy danh sách
└── Tích hợp vào màn hình app (tab "Saved" hoặc icon bookmark)
```

---

### 🚀 Tuần 5 — Admin Panel (Web) + Deploy

**Mục tiêu cuối tuần**: Có trang web admin quản lý địa điểm, deploy lên cloud

```
Học:
├── CORS configuration
├── Environment variables (.env)
└── Deploy cơ bản

Làm:
├── Trang HTML đơn giản: login → xem/thêm/sửa/xóa địa điểm
├── Deploy DB lên Supabase (miễn phí)
├── Deploy server lên Railway (miễn phí)
└── Cập nhật API_URL trong app từ localhost → URL thật
```

---

## 🔗 Flow Hoàn Chỉnh Sau Khi Xong

```
                    ┌─────────────────┐
                    │   Admin Panel   │  (Web browser)
                    │   (HTML/JS)     │
                    └────────┬────────┘
                             │ JWT Auth
                             ▼
┌─────────────┐    ┌─────────────────┐    ┌──────────────────┐
│  Expo App   │◄──►│ Express Server  │◄──►│   PostgreSQL DB  │
│(React Native│    │  (Node.js)      │    │   (Supabase)     │
│             │    │  :3000          │    │                  │
│ - Bản đồ   │    │ - GET /places   │    │ - Place          │
│ - Tìm đường│    │ - POST /saved   │    │ - User           │
│ - Saved ❤️  │    │ - Admin routes  │    │ - SavedPlace     │
└─────────────┘    └─────────────────┘    └──────────────────┘
```

---

## 🚀 Lệnh Khởi Động (Tuần 1)

```bash
# Trong d:\project_CSE310\
mkdir MyCampusServer
cd MyCampusServer

# Khởi tạo project Node.js
npm init -y

# Cài dependencies
npm install express cors dotenv @prisma/client bcryptjs jsonwebtoken
npm install -D typescript ts-node nodemon @types/express @types/node @types/bcryptjs @types/jsonwebtoken

# Prisma
npx prisma init

# Tạo tsconfig
npx tsc --init
```

---

## ❓ Câu Hỏi Còn Lại

> Khi nào bạn muốn bắt đầu code? Mình có thể:
> - **Tạo toàn bộ boilerplate** backend ngay bây giờ (folder, file, config)
> - **Hướng dẫn từng bước** từ Tuần 1 theo dạng tutorial

Bạn muốn tiếp cận theo hướng nào?
