@echo off
title LightCare 이미지 업로드 디렉토리 설정
color 0E
echo.
echo =============================================
echo  📁 이미지 업로드 디렉토리를 생성합니다
echo =============================================
echo.

REM 이미지 업로드 기본 디렉토리 생성
set UPLOAD_BASE=C:\carelink-uploads
echo 🔧 기본 업로드 디렉토리 생성: %UPLOAD_BASE%
if not exist "%UPLOAD_BASE%" (
    mkdir "%UPLOAD_BASE%"
    echo   ✅ %UPLOAD_BASE% 생성 완료
) else (
    echo   ℹ️  %UPLOAD_BASE% 이미 존재함
)

REM 게시판 이미지 디렉토리 생성
set BOARD_DIR=%UPLOAD_BASE%\board
echo 🔧 게시판 이미지 디렉토리 생성: %BOARD_DIR%
if not exist "%BOARD_DIR%" (
    mkdir "%BOARD_DIR%"
    echo   ✅ %BOARD_DIR% 생성 완료
) else (
    echo   ℹ️  %BOARD_DIR% 이미 존재함
)

REM 리뷰 이미지 디렉토리 생성
set REVIEW_DIR=%UPLOAD_BASE%\review
echo 🔧 리뷰 이미지 디렉토리 생성: %REVIEW_DIR%
if not exist "%REVIEW_DIR%" (
    mkdir "%REVIEW_DIR%"
    echo   ✅ %REVIEW_DIR% 생성 완료
) else (
    echo   ℹ️  %REVIEW_DIR% 이미 존재함
)

REM 프로필 이미지 디렉토리 생성 (기존 기능용)
set PROFILE_DIR=%UPLOAD_BASE%\profile
echo 🔧 프로필 이미지 디렉토리 생성: %PROFILE_DIR%
if not exist "%PROFILE_DIR%" (
    mkdir "%PROFILE_DIR%"
    echo   ✅ %PROFILE_DIR% 생성 완료
) else (
    echo   ℹ️  %PROFILE_DIR% 이미 존재함
)

REM 시설 이미지 디렉토리 생성 (기존 기능용)
set FACILITY_DIR=%UPLOAD_BASE%\facility
echo 🔧 시설 이미지 디렉토리 생성: %FACILITY_DIR%
if not exist "%FACILITY_DIR%" (
    mkdir "%FACILITY_DIR%"
    echo   ✅ %FACILITY_DIR% 생성 완료
) else (
    echo   ℹ️  %FACILITY_DIR% 이미 존재함
)

REM 임시 파일 디렉토리 생성
set TEMP_DIR=%UPLOAD_BASE%\temp
echo 🔧 임시 파일 디렉토리 생성: %TEMP_DIR%
if not exist "%TEMP_DIR%" (
    mkdir "%TEMP_DIR%"
    echo   ✅ %TEMP_DIR% 생성 완료
) else (
    echo   ℹ️  %TEMP_DIR% 이미 존재함
)

echo.
echo =============================================
echo  ✅ 모든 디렉토리 설정이 완료되었습니다!
echo =============================================
echo.
echo 📁 생성된 디렉토리 구조:
echo   %UPLOAD_BASE%\
echo   ├── board\      (게시글 이미지)
echo   ├── review\     (리뷰 이미지)
echo   ├── profile\    (프로필 이미지)
echo   ├── facility\   (시설 이미지)
echo   └── temp\       (임시 파일)
echo.
echo 🚀 이제 다음 명령으로 애플리케이션을 실행할 수 있습니다:
echo   .\gradlew.bat bootRun
echo.

pause