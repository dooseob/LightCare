#!/bin/bash

# NCP 서버 배포 스크립트
# 사용법: ./deploy-ncp.sh

echo "🚀 LightCare NCP 배포 시작..."

# 1. 프로젝트 빌드
echo "📦 프로젝트 빌드 중..."
./gradlew clean build -x test

if [ $? -ne 0 ]; then
    echo "❌ 빌드 실패!"
    exit 1
fi

echo "✅ 빌드 완료!"

# 2. JAR 파일 확인
JAR_FILE="build/libs/carelink-0.0.1-SNAPSHOT.jar"
if [ ! -f "$JAR_FILE" ]; then
    echo "❌ JAR 파일을 찾을 수 없습니다: $JAR_FILE"
    exit 1
fi

# 3. 서버 정보 설정 (환경변수로 관리)
SERVER_IP=${NCP_SERVER_IP:-"your-server-ip"}
SERVER_USER=${NCP_SERVER_USER:-"root"}
DEPLOY_PATH="/home/carelink"

echo "📤 서버로 파일 전송 중..."
echo "   서버: $SERVER_USER@$SERVER_IP"
echo "   경로: $DEPLOY_PATH"

# 4. 서버로 JAR 파일 전송
scp $JAR_FILE $SERVER_USER@$SERVER_IP:$DEPLOY_PATH/carelink.jar

if [ $? -ne 0 ]; then
    echo "❌ 파일 전송 실패!"
    exit 1
fi

# 5. 서버 스크립트 전송
scp start-server.sh $SERVER_USER@$SERVER_IP:$DEPLOY_PATH/
scp stop-server.sh $SERVER_USER@$SERVER_IP:$DEPLOY_PATH/

# 6. 서버에서 애플리케이션 재시작
echo "🔄 서버 애플리케이션 재시작 중..."
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
cd /home/carelink
chmod +x start-server.sh stop-server.sh

# 기존 프로세스 종료
./stop-server.sh

# 새 버전 시작
./start-server.sh

# 상태 확인
sleep 5
if pgrep -f "carelink.jar" > /dev/null; then
    echo "✅ 애플리케이션이 성공적으로 시작되었습니다!"
    echo "📊 프로세스 정보:"
    ps aux | grep carelink.jar | grep -v grep
else
    echo "❌ 애플리케이션 시작 실패!"
    echo "로그 확인: tail -f /var/log/carelink/application.log"
fi
ENDSSH

echo "🎉 배포 완료!"
echo "🌐 접속 주소: http://$SERVER_IP:8080"