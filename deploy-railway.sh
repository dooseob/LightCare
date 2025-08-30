#!/bin/bash

echo "🚂 Railway 배포 스크립트"
echo "========================"

# 1. Git 상태 확인
echo "📋 Git 상태 확인..."
git status

# 2. 변경사항 커밋
echo "💾 변경사항 커밋..."
git add .
git commit -m "Railway 배포 설정 추가"

# 3. Railway CLI 설치 확인
if ! command -v railway &> /dev/null
then
    echo "⚠️ Railway CLI가 설치되어 있지 않습니다."
    echo "설치 명령어: npm install -g @railway/cli"
    exit 1
fi

# 4. Railway 로그인
echo "🔐 Railway 로그인..."
railway login

# 5. 프로젝트 생성 또는 연결
echo "🎯 Railway 프로젝트 설정..."
railway link

# 6. 배포
echo "🚀 배포 시작..."
railway up

echo "✅ 배포 완료!"
echo "📌 Railway 대시보드에서 환경변수를 설정해주세요:"
echo "   - DB_URL"
echo "   - DB_USERNAME" 
echo "   - DB_PASSWORD"
echo "   - KAKAO_APP_KEY"