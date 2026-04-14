@echo off
setlocal

cd /d "%~dp0web bun cha"

if exist ".mvn\wrapper\maven-wrapper.jar" (
    call mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"
) else (
    call mvn spring-boot:run "-Dspring-boot.run.profiles=local"
)
