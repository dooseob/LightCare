@echo off
chcp 65001
echo ==========================================
echo 프로필 이미지 업로드 테스트 시작
echo ==========================================
echo.

echo 1. 애플리케이션 빌드 및 실행...
start /B cmd /c "gradlew bootRun > logs\app-output.log 2>&1"

echo.
echo 2. 10초 후 브라우저에서 테스트 페이지를 열겠습니다...
timeout /t 10 /nobreak

echo.
echo 3. 테스트 페이지 열기...
start http://localhost:8080/member/myinfo/crop-image

echo.
echo ==========================================
echo 테스트 준비 완료!
echo ==========================================
echo.
echo [테스트 절차]
echo 1. 브라우저에서 이미지 업로드
echo 2. 크롭 및 압축 설정
echo 3. 저장 버튼 클릭
echo 4. 개발자 도구 콘솔에서 로그 확인
echo.
echo [콘솔 로그 확인 포인트]
echo - "📄 서버 응답 데이터 (전체):" 로그
echo - "📄 success 값:" 로그  
echo - "✅ 성공 조건 충족됨" 또는 "❌ 실패 조건" 로그
echo.
echo [서버 로그 확인]
echo - logs\app-output.log 파일 확인
echo - "🎉 크롭된 이미지 저장 성공" 로그 찾기
echo - "❌ 크롭된 이미지 저장 중 오류 발생" 로그 찾기
echo.
echo 테스트 완료 후 Ctrl+C로 애플리케이션을 종료하세요.
pause