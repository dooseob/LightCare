#!/bin/bash

echo "🚀 Heroku 배포 스크립트"
echo "======================"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 프로젝트 빌드
echo -e "${YELLOW}📦 프로젝트 빌드 중...${NC}"
./gradlew clean build -x test

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 빌드 성공!${NC}"
else
    echo -e "${RED}❌ 빌드 실패!${NC}"
    exit 1
fi

# 2. Heroku CLI 설치 확인
if ! command -v heroku &> /dev/null; then
    echo -e "${RED}❌ Heroku CLI가 설치되지 않았습니다.${NC}"
    echo "다음 링크에서 설치하세요: https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# 3. Heroku 로그인 확인
echo -e "${YELLOW}🔑 Heroku 로그인 확인 중...${NC}"
heroku auth:whoami &> /dev/null
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}로그인이 필요합니다. 'heroku login' 명령어를 실행하세요.${NC}"
    heroku login
fi

# 4. Heroku 앱 생성
echo -e "${YELLOW}🏗️  Heroku 앱 생성 중...${NC}"
APP_NAME="elderberry-ai"
heroku create $APP_NAME

# 5. PostgreSQL 애드온 추가
echo -e "${YELLOW}🗄️  PostgreSQL 데이터베이스 추가 중...${NC}"
heroku addons:create heroku-postgresql:hobby-dev -a $APP_NAME

# 6. 환경변수 설정
echo -e "${YELLOW}🔧 환경변수 설정 중...${NC}"
heroku config:set KAKAO_APP_KEY=b97b58672807a40c122a5deed8a98ea4 -a $APP_NAME
heroku config:set SPRING_PROFILES_ACTIVE=heroku -a $APP_NAME

# 7. Git 설정 및 배포
echo -e "${YELLOW}📡 Git 리모트 추가 및 배포 중...${NC}"
git remote add heroku https://git.heroku.com/$APP_NAME.git
git add .
git commit -m "Heroku 배포: $(date)"
git push heroku main

# 8. 데이터베이스 스키마 초기화
echo -e "${YELLOW}🗄️  데이터베이스 스키마 초기화 중...${NC}"
heroku pg:psql -a $APP_NAME < schema-postgresql.sql

# 9. 앱 열기
echo -e "${GREEN}🎉 배포 완료!${NC}"
echo -e "${GREEN}앱 URL: https://$APP_NAME.herokuapp.com${NC}"
heroku open -a $APP_NAME

echo ""
echo -e "${YELLOW}📋 다음 단계:${NC}"
echo "1. 커스텀 도메인 연결: heroku domains:add elderberry-ai.com -a $APP_NAME"
echo "2. DNS 설정: elderberry-ai.com의 CNAME을 $APP_NAME.herokuapp.com으로 설정"
echo "3. SSL 인증서: heroku certs:auto:enable -a $APP_NAME"