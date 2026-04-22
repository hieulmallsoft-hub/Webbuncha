# Bun Cha Restaurant Management

Ứng dụng quản lý bán hàng cho quán bún chả, gồm website đặt món cho khách hàng và trang quản trị cho nhân viên/admin. Backend được xây dựng bằng Spring Boot REST API, frontend dùng React và được đóng gói chung vào Spring Boot jar khi deploy.

## Chức năng chính

- Đăng ký, đăng nhập, refresh token bằng JWT.
- Phân quyền `USER` và `ADMIN` bằng Spring Security.
- Quản lý danh mục món ăn và sản phẩm.
- Khách hàng tạo đơn giao hàng hoặc đặt bàn tại quán.
- Admin xem, lọc, cập nhật trạng thái và xóa đơn hàng.
- Upload ảnh món ăn với kiểm tra content type, đuôi file và magic bytes.
- Gửi thông báo nội bộ và hỗ trợ push notification qua Firebase.
- Cache danh sách sản phẩm bằng Spring Cache, có thể dùng Redis khi chạy production.
- Tài liệu API qua Swagger UI.

## Công nghệ

- Java 25
- Spring Boot 4
- Spring Web MVC
- Spring Data JPA
- Spring Security OAuth2 Resource Server
- JWT HS256
- PostgreSQL cho production
- H2 cho local/test
- Redis cache
- React, Vite, Tailwind CSS
- Docker, Docker Compose
- JUnit 5, Mockito, MockMvc

## Kiến trúc backend

Project dùng cấu trúc theo layer:

- `controller`: nhận request, validate DTO, trả response chuẩn.
- `service`: xử lý nghiệp vụ, phân quyền theo owner/admin, transaction.
- `repository`: truy cập dữ liệu bằng Spring Data JPA.
- `model`: entity JPA và enum domain.
- `model.dto`: request/response DTO để không expose trực tiếp entity.
- `exception`: xử lý lỗi tập trung bằng `@RestControllerAdvice`.
- `config`: security, cache, static resource, OpenAPI, seeding dữ liệu.

## API nổi bật

Swagger UI:

```text
http://localhost:8080/swagger-ui.html
```

Một số endpoint chính:

```text
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/forgot-password
POST   /auth/reset-password
GET    /auth/verify-email?token=...
POST   /auth/verify-email/resend

GET    /products
GET    /products/{id}
POST   /products              ADMIN
PUT    /products/{id}         ADMIN
DELETE /products/{id}         ADMIN

GET    /categories
POST   /categories            ADMIN
PUT    /categories/{id}       ADMIN
DELETE /categories/{id}       ADMIN

GET    /orders
GET    /orders/{id}
POST   /orders
PUT    /orders/{id}
PATCH  /orders/{id}/status    ADMIN
DELETE /orders/{id}           ADMIN

POST   /uploads/images        ADMIN
```

## Chạy local

Yêu cầu:

- Java 25
- Maven
- Node.js 20 nếu muốn build frontend

Chạy backend với profile local:

```powershell
$env:SPRING_PROFILES_ACTIVE="local"
$env:APP_ADMIN_PASSWORD="ChangeThisLocalPassword123!"
mvn spring-boot:run
```

Nếu `spring-boot:run` trên máy bạn vẫn báo lỗi main class, dùng cách ổn định hơn:

```powershell
.\run-local.cmd
```

### Env local / server

- Local: copy `./.env.example` -> `./.env.local`, sau Ä‘Ã³ cháº¡y `./run-local.cmd`.
- Server/deploy: copy `./.env.server.example` -> `./.env` vÃ  cáº­p nháº­t giÃ¡ trá»‹.

Backend local dùng H2 file tại `.local-db/buncha` để dữ liệu giữ lại sau khi restart. Nếu đặt `APP_ADMIN_PASSWORD`, app sẽ seed tài khoản admin:

```text
Email: admin@bunchachinhhuong.vn
Password: giá trị APP_ADMIN_PASSWORD bạn đã đặt
```

Build frontend:

```powershell
cd frontend
npm ci
npm run build
```

Chạy test backend:

```powershell
mvn test
```

## Chạy bằng Docker Compose

Tạo file `.env` từ file mẫu:

```bash
cp .env.server.example .env
```

Sửa các biến quan trọng:

```text
POSTGRES_PASSWORD
DB_PASSWORD
JWT_SECRET
APP_ADMIN_PASSWORD
CORS_ALLOWED_ORIGINS
VNPAY_ENABLED
VNPAY_TMN_CODE
VNPAY_HASH_SECRET
VNPAY_RETURN_URL
VNPAY_IPN_URL
``` 

Khởi động:

```bash
docker compose up -d --build
```

Ứng dụng chạy tại:

```text
http://localhost:8080
```

## Test và CI

Project có unit test service và integration test cho security bằng MockMvc. GitHub Actions workflow `CI` sẽ:

- Cài Java 25.
- Cài Node.js 20.
- Build frontend bằng `npm run build`.
- Chạy backend tests bằng `mvn test`.

## Điểm có thể trình bày khi phỏng vấn

- Vì sao không trả entity trực tiếp mà dùng DTO response.
- Cách phân quyền endpoint bằng `@PreAuthorize` và JWT roles.
- Cách đảm bảo user thường chỉ xem/sửa đơn hàng của chính mình.
- Cách dùng `Pageable` và `Specification` để lọc đơn hàng.
- Cách dùng `@Transactional` khi tạo order kèm order items và notification.
- Cách xử lý lỗi tập trung để response API nhất quán.
- Cách cấu hình local/test/prod profile khác nhau.
- Cách Docker Compose kết nối app, PostgreSQL và Redis.

## Ghi chú bảo mật

- Không commit file `.env` thật.
- Không dùng password admin mặc định khi deploy.
- `JWT_SECRET` cần là chuỗi ngẫu nhiên đủ dài.
- Upload ảnh kiểm tra content type, extension và magic bytes, nhưng production vẫn nên giới hạn quyền ghi thư mục upload và cân nhắc scan file nếu hệ thống mở rộng.
