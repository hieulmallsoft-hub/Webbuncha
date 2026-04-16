@echo off
setlocal

cd /d "%~dp0web bun cha"

powershell -NoProfile -Command "try { $client = New-Object System.Net.Sockets.TcpClient; $client.Connect('127.0.0.1', 6379); $client.Close(); exit 0 } catch { exit 1 }"
if errorlevel 1 (
    echo Redis was not detected on localhost:6379.
    echo Start it with "..\run-local-redis.cmd" or your local Redis service before using cached endpoints.
)

if exist ".mvn\wrapper\maven-wrapper.jar" (
    call mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"
) else (
    call mvn spring-boot:run "-Dspring-boot.run.profiles=local"
)
