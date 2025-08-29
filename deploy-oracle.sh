#!/bin/bash

# Oracle Cloud 배포 스크립트
# 로컬에서 실행하여 Oracle Cloud VM에 배포

echo "🔮 Oracle Cloud 배포 스크립트"
echo "============================="

# 변수 설정 (수정 필요)
SERVER_IP="your-oracle-server-ip"
SSH_KEY="~/.ssh/oracle-key"

# 1. 프로젝트 빌드
echo "🔨 프로젝트 빌드..."
./gradlew clean build -x test

# 2. JAR 파일 확인
if [ ! -f "build/libs/carelink-0.0.1-SNAPSHOT.jar" ]; then
    echo "❌ JAR 파일을 찾을 수 없습니다!"
    exit 1
fi

# 3. JAR 파일 업로드
echo "📤 JAR 파일 업로드..."
scp -i $SSH_KEY build/libs/carelink-0.0.1-SNAPSHOT.jar ubuntu@$SERVER_IP:/opt/lightcare/carelink.jar

# 4. 서비스 재시작
echo "🔄 서비스 재시작..."
ssh -i $SSH_KEY ubuntu@$SERVER_IP "sudo systemctl restart lightcare"

# 5. 서비스 상태 확인
echo "✅ 서비스 상태 확인..."
ssh -i $SSH_KEY ubuntu@$SERVER_IP "sudo systemctl status lightcare"

echo "🎉 배포 완료!"
echo "📌 접속 주소: http://$SERVER_IP:8080"