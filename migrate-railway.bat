@echo off
echo ===================================
echo Railway 데이터베이스 마이그레이션
echo ===================================
echo.

REM Railway MySQL 정보 (Public Network - 외부 접속용)
set RAILWAY_HOST=ballast.proxy.rlwy.net
set RAILWAY_PORT=44449
set RAILWAY_PASSWORD=FaTohMaVzOHSKWDMBpUzONmHWFlSqiSv
set RAILWAY_DATABASE=railway

echo [1/2] 로컬 데이터베이스 백업 중...
mysqldump -u root -pmysql carelink > carelink_backup.sql
if %errorlevel% neq 0 (
    echo 오류: 로컬 데이터베이스 백업 실패
    pause
    exit /b 1
)
echo 백업 완료: carelink_backup.sql
echo.

echo [2/2] Railway 데이터베이스로 전송 중...
echo Host: %RAILWAY_HOST%:%RAILWAY_PORT%
mysql -h %RAILWAY_HOST% -P %RAILWAY_PORT% -u root -p%RAILWAY_PASSWORD% %RAILWAY_DATABASE% < carelink_backup.sql
if %errorlevel% neq 0 (
    echo 오류: Railway 데이터베이스 전송 실패
    pause
    exit /b 1
)

echo.
echo ===================================
echo ✅ 마이그레이션 완료!
echo ===================================
echo.
echo Railway Variables에 다음을 설정하세요:
echo DB_URL=${{ MySQL.MYSQL_PRIVATE_URL }}
echo (또는 수동으로)
echo DB_URL=mysql://root:%RAILWAY_PASSWORD%@mysql.railway.internal:3306/railway
echo.
pause