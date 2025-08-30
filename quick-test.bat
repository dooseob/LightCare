@echo off
title LightCare 이미지 업로드 기능 테스트
color 0A
echo.
echo =============================================
echo  🧪 이미지 업로드 기능 테스트를 시작합니다
echo =============================================
echo.

REM 1단계: 디렉토리 설정
echo 📁 1단계: 업로드 디렉토리 확인 및 생성...
call setup-directories.bat

echo.
echo 📋 2단계: 환경 확인...

REM Java 설치 확인
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Java가 설치되어 있지 않습니다!
    echo    Java 11 이상을 설치해주세요.
    echo    https://adoptium.net/temurin/releases/
    pause
    exit /b 1
) else (
    echo ✅ Java 설치 확인됨
)

REM Gradle 래퍼 확인
if exist "gradlew.bat" (
    echo ✅ Gradle 래퍼 확인됨
) else (
    echo ❌ gradlew.bat 파일을 찾을 수 없습니다!
    pause
    exit /b 1
)

REM .env 파일 확인
if exist ".env" (
    echo ✅ 환경변수 파일 확인됨
) else (
    echo ⚠️  .env 파일이 없습니다. 기본 설정으로 진행합니다.
)

echo.
echo 🗄️ 3단계: MySQL 데이터베이스 스키마 확인...
echo   다음 SQL 파일을 MySQL에 실행해주세요:
echo   📄 src\main\resources\schema-image-attachments.sql
echo.
echo   MySQL Workbench, phpMyAdmin, 또는 명령줄에서:
echo   mysql -u root -p carelink ^< src\main\resources\schema-image-attachments.sql
echo.

set /p continue="데이터베이스 스키마를 적용했습니까? (y/n): "
if /i not "%continue%"=="y" (
    echo.
    echo ⏸️  데이터베이스 스키마를 먼저 적용해주세요.
    echo    스키마 파일: src\main\resources\schema-image-attachments.sql
    pause
    exit /b 0
)

echo.
echo 🚀 4단계: Spring Boot 애플리케이션 실행...
echo.
echo =============================================
echo  애플리케이션 시작 중...
echo  브라우저에서 다음 URL로 접속하여 테스트하세요:
echo.
echo  📝 게시글 이미지 업로드 테스트:
echo    http://localhost:8080/board/write
echo.
echo  ⭐ 리뷰 이미지 업로드 테스트:
echo    http://localhost:8080/review/write
echo.
echo  🏠 메인 페이지:
echo    http://localhost:8080
echo.
echo  종료하려면 Ctrl+C 를 누르세요.
echo =============================================
echo.

REM Spring Boot 실행
call gradlew.bat bootRun

echo.
echo 📋 애플리케이션이 종료되었습니다.
pause