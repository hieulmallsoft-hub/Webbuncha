@echo off
setlocal

set "CONTAINER_NAME=buncha-local-redis"

for /f %%i in ('docker ps -a --filter "name=^/%CONTAINER_NAME%$" --format "{{.Names}}"') do set "EXISTING_CONTAINER=%%i"

if /I "%EXISTING_CONTAINER%"=="%CONTAINER_NAME%" (
    echo Starting existing Redis container %CONTAINER_NAME%...
    docker start %CONTAINER_NAME%
) else (
    echo Creating Redis container %CONTAINER_NAME% on localhost:6379...
    docker run -d --name %CONTAINER_NAME% -p 6379:6379 redis:7-alpine redis-server --save 60 1 --loglevel warning
)
