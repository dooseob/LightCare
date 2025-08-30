#!/bin/bash

# 서버 시작 스크립트
echo "🚀 LightCare 서버 시작..."

# 로그 디렉토리 생성
mkdir -p /var/log/carelink
mkdir -p /home/carelink/uploads/{facility,profile,temp}

# 환경변수 설정
export SPRING_PROFILES_ACTIVE=prod
export DB_HOST=${DB_HOST:-"localhost"}
export DB_NAME=${DB_NAME:-"carelink"}
export DB_USERNAME=${DB_USERNAME:-"carelink"}
export DB_PASSWORD=${DB_PASSWORD:-"your-db-password"}
export KAKAO_APP_KEY=${KAKAO_APP_KEY:-"b97b58672807a40c122a5deed8a98ea4"}

# Java 옵션 설정
JAVA_OPTS="-Xms512m -Xmx1024m"
JAVA_OPTS="$JAVA_OPTS -Dspring.profiles.active=prod"
JAVA_OPTS="$JAVA_OPTS -Dfile.encoding=UTF-8"
JAVA_OPTS="$JAVA_OPTS -Djava.net.preferIPv4Stack=true"

# 애플리케이션 실행 (백그라운드)
nohup java $JAVA_OPTS -jar /home/carelink/carelink.jar > /var/log/carelink/console.log 2>&1 &

echo "✅ PID: $!"
echo $! > /home/carelink/carelink.pid

echo "📝 로그 확인:"
echo "   tail -f /var/log/carelink/application.log"
echo "   tail -f /var/log/carelink/console.log"