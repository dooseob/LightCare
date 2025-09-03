#!/bin/bash
# ================================================
# Railway 배포 스크립트
# LightCare 프로젝트 자동 테이블 생성 포함
# ================================================

echo "🚀 Railway 배포 시작..."

# 1. 빌드
echo "📦 프로젝트 빌드 중..."
./gradlew clean build -x test

if [ $? -ne 0 ]; then
    echo "❌ 빌드 실패!"
    exit 1
fi

# 2. Railway에 배포
echo "🚀 Railway 배포 중..."
railway up

if [ $? -ne 0 ]; then
    echo "❌ Railway 배포 실패!"
    exit 1
fi

echo "✅ Railway 배포 완료!"
echo ""
echo "📋 배포 후 확인 사항:"
echo "1. Railway 대시보드에서 로그 확인"
echo "2. 데이터베이스 테이블 자동 생성 확인"
echo "3. 애플리케이션 정상 동작 확인"
echo ""
echo "🔗 Railway 로그 확인: railway logs"
echo "🔗 Railway 대시보드: https://railway.app/dashboard"