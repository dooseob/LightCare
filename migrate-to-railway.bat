@echo off
echo ===================================
echo Railway 데이터베이스 마이그레이션
echo ===================================
echo.

REM 로컬 데이터 백업
echo [1/3] 로컬 데이터베이스 백업 중...
mysqldump -u root -pmysql carelink > carelink_backup.sql
if %errorlevel% neq 0 (
    echo 오류: 로컬 데이터베이스 백업 실패
    pause
    exit /b 1
)
echo 백업 완료: carelink_backup.sql
echo.

echo [2/3] Railway MySQL 연결 정보를 입력하세요:
echo Railway에서 제공한 정보를 복사해주세요.
echo.
set /p RAILWAY_HOST="Host (예: containers-us-west-123.railway.app): "
set /p RAILWAY_PORT="Port (예: 5432): "
set /p RAILWAY_PASSWORD="Password: "
set /p RAILWAY_DATABASE="Database (기본: railway): "

echo.
echo [3/3] Railway 데이터베이스로 데이터 전송 중...
mysql -h %RAILWAY_HOST% -P %RAILWAY_PORT% -u root -p%RAILWAY_PASSWORD% %RAILWAY_DATABASE% < carelink_backup.sql
if %errorlevel% neq 0 (
    echo 오류: Railway 데이터베이스 전송 실패
    echo 연결 정보를 확인해주세요.
    pause
    exit /b 1
)

echo.
echo ===================================
echo ✅ 마이그레이션 완료!
echo ===================================
echo.
echo Railway 앱의 환경변수를 다음과 같이 설정하세요:
echo DB_URL=mysql://root:%RAILWAY_PASSWORD%@%RAILWAY_HOST%:%RAILWAY_PORT%/%RAILWAY_DATABASE%
echo DB_USERNAME=root
echo DB_PASSWORD=%RAILWAY_PASSWORD%
echo.
pause