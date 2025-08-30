@echo off
title LightCare 개발 환경
color 0A
echo.
echo =============================================
echo  🚀 LightCare 개발 환경을 시작합니다
echo =============================================
echo.

REM .env 파일 존재 확인
if not exist ".env" (
    echo ❌ .env 파일을 찾을 수 없습니다!
    echo    프로젝트 루트에 .env 파일을 생성해주세요.
    pause
    exit /b 1
)

echo 📋 .env 파일에서 환경변수를 로드합니다...
echo.

REM .env 파일에서 환경변수 로드
for /f "usebackq eol=# tokens=1,2 delims==" %%a in (".env") do (
    if not "%%a"=="" (
        echo   ✅ %%a 설정 완료
        set "%%a=%%b"
    )
)

echo.
echo 🔑 환경변수 확인:
echo   - KAKAO_APP_KEY: %KAKAO_APP_KEY:~0,10%...
echo   - DB_USERNAME: %DB_USERNAME%
echo   - DB_URL이 설정됨
echo.

echo 🗄️ MySQL 연결을 확인합니다...
mysql -u %DB_USERNAME% -p%DB_PASSWORD% -e "SELECT 1;" 2>nul
if errorlevel 1 (
    echo ⚠️  MySQL 연결에 실패했습니다. MySQL이 실행 중인지 확인해주세요.
    echo.
)

echo 🌱 Spring Boot 애플리케이션을 시작합니다...
echo.
echo =============================================
echo  애플리케이션이 시작되면:
echo  👉 http://localhost:8080 으로 접속하세요
echo  👉 종료하려면 Ctrl+C 를 누르세요
echo =============================================
echo.

REM Gradle 실행
call gradlew.bat bootRun

echo.
echo 📋 애플리케이션이 종료되었습니다.
pause