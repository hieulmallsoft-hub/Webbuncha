FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build


FROM eclipse-temurin:25 AS backend-builder

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl unzip \
    && rm -rf /var/lib/apt/lists/*

COPY pom.xml ./
COPY .mvn/ .mvn/
COPY mvnw mvnw
COPY mvnw.cmd mvnw.cmd
COPY src/ src/
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

RUN chmod +x mvnw && ./mvnw -DskipTests package


FROM eclipse-temurin:25

WORKDIR /app

ENV SPRING_PROFILES_ACTIVE=prod

COPY --from=backend-builder /app/target/spring-rest-with-ai-0.0.1-SNAPSHOT-exec.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
