# Deploy Tren VPS

Can toi thieu:
- Docker
- Docker Compose

Cach de nhat:

```bash
cd "web bun cha"
cp .env.server.example .env
# sua lai POSTGRES_PASSWORD, DB_PASSWORD, JWT_SECRET, APP_ADMIN_PASSWORD
docker compose up -d --build
```

Kiem tra:

```bash
docker compose ps
docker compose logs -f app
```

Mo trinh duyet:

```text
http://IP_SERVER:8080
```

Neu muon chay khong dung compose:

```bash
./build-server.sh
java -jar target/spring-rest-with-ai-0.0.1-SNAPSHOT.jar
```

Ghi chu:
- Frontend React duoc build vao jar Spring Boot.
- File `.env` cho Docker phai dung dang `KEY=VALUE`.
- `DB_URL` trong compose dang tro toi service `postgres`, khong phai `localhost`.
- Neu frontend va backend dung cung domain/IP thi co the de `CORS_ALLOWED_ORIGINS=` rong.
