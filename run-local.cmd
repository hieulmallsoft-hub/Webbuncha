@echo off
setlocal EnableExtensions EnableDelayedExpansion

cd /d "%~dp0"

REM Optional: load local environment variables from .env.local (do not commit secrets).
REM Default is OFF to prefer application-*.properties.
REM To enable: set LOAD_ENV_LOCAL=true before running this script.
REM Format: KEY=VALUE, comments start with #, blank lines ignored.
if /i "%LOAD_ENV_LOCAL%"=="true" (
    if exist ".env.local" (
        call :load_env ".env.local"
        echo Loaded .env.local into process environment.
    ) else (
        echo LOAD_ENV_LOCAL=true but .env.local not found - skipping.
    )
)

REM Prefer running the repackaged jar (more reliable on Windows paths with Unicode).
set "JAR=target\spring-rest-with-ai-0.0.1-SNAPSHOT-exec.jar"

if "%SKIP_BUILD%"=="" (
    echo Building jar - skip tests...
    if exist ".mvn\wrapper\maven-wrapper.jar" (
        call mvnw.cmd -DskipTests package
        if errorlevel 1 exit /b 1
    ) else (
        call mvn -DskipTests package
        if errorlevel 1 exit /b 1
    )
) else (
    echo SKIP_BUILD is set - skipping build.
)

if not exist "%JAR%" (
    echo ERROR: Jar not found at "%JAR%"
    exit /b 1
)

echo Starting app - profile: local...
java -jar "%JAR%" --spring.profiles.active=local
exit /b %errorlevel%

:load_env
set "ENV_FILE=%~1"
for /f "usebackq eol=# tokens=1* delims==" %%A in ("%ENV_FILE%") do (
    set "K=%%A"
    set "V=%%B"
    if not "!K!"=="" (
        REM Trim leading spaces around key/value (common when editing .env files).
        for /f "tokens=* delims= " %%K in ("!K!") do set "K=%%K"
        for /f "tokens=* delims= " %%V in ("!V!") do set "V=%%V"

        REM Trim surrounding quotes if present.
        if "!V:~0,1!"=="\"" if "!V:~-1!"=="\"" set "V=!V:~1,-1!"

        REM Strip inline comments (e.g. KEY=value # comment). This avoids accidentally signing with extra text.
        for /f "tokens=1 delims=#" %%C in ("!V!") do set "V=%%C"
        for /f "tokens=* delims= " %%V in ("!V!") do set "V=%%V"

        set "!K!=!V!"
    )
)
exit /b 0
