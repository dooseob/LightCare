#!/bin/bash

echo "🚀 LightCare 배포 스크립트"
echo "=========================="

# 1. 프로젝트 빌드
echo "📦 프로젝트 빌드 중..."
./gradlew clean build -x test

# 2. JAR 파일 확인
if [ -f "build/libs/carelink-*.jar" ]; then
    echo "✅ JAR 파일 생성 완료"
else
    echo "❌ JAR 파일 생성 실패"
    exit 1
fi

# 3. 환경변수 파일 생성
echo "🔧 환경변수 설정..."
cat > application-production.yml << EOF
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/carelink?useSSL=false&serverTimezone=Asia/Seoul&allowPublicKeyRetrieval=true&useUnicode=true&characterEncoding=UTF-8
    username: \${DB_USERNAME:root}
    password: \${DB_PASSWORD:mysql}

api:
  kakao:
    app-key: \${KAKAO_APP_KEY}
EOF

echo "✅ 배포 준비 완료!"
echo "💡 다음 단계:"
echo "   1. AWS EC2 인스턴스 생성"
echo "   2. 탄력적 IP 할당" 
echo "   3. 도메인 DNS 설정"
echo "   4. 서버에 애플리케이션 업로드"