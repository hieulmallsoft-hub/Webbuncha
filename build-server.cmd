@echo off
setlocal

set "PROJECT_DIR=%~dp0"
set "FRONTEND_DIR=%PROJECT_DIR%frontend"

pushd "%FRONTEND_DIR%" || exit /b 1
call npm.cmd ci || exit /b 1
call npm.cmd run build || exit /b 1
popd

pushd "%PROJECT_DIR%" || exit /b 1
if exist ".mvn\wrapper\maven-wrapper.jar" (
    call mvnw.cmd -DskipTests package
) else (
    call mvn -DskipTests package
)
set "EXIT_CODE=%ERRORLEVEL%"
popd

exit /b %EXIT_CODE%
