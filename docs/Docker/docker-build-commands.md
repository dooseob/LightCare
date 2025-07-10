# Docker 빌드 및 배포 명령어

## 1. 로컬 테스트 (MySQL 컨테이너 포함)
```bash
# 전체 서비스 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 서비스 중지
docker-compose down

# 볼륨까지 삭제
docker-compose down -v
```

## 2. AWS EC2 배포용 빌드
```bash
# Docker 이미지 빌드
docker build -t carelink-app .

# AWS 환경으로 실행 (RDS 연결)
docker-compose -f docker-compose.aws.yml up -d

# 환경 변수 파일 사용
docker-compose -f docker-compose.aws.yml --env-file .env.aws up -d
```

## 3. 개별 명령어
```bash
# 이미지 빌드
docker build -t carelink-app .

# 컨테이너 실행 (환경 변수 직접 지정)
docker run -d \
  --name carelink-app \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DB_URL=jdbc:mysql://your-rds-endpoint:3306/carelink \
  -e DB_USERNAME=root \
  -e DB_PASSWORD=your-password \
  -e KAKAO_APP_KEY=your-kakao-key \
  -v carelink-uploads:/carelink-uploads \
  carelink-app
```

## 4. 이미지 관리
```bash
# 이미지 목록 확인
docker images

# 컨테이너 상태 확인
docker ps -a

# 로그 확인
docker logs carelink-app

# 컨테이너 삭제
docker rm -f carelink-app

# 이미지 삭제
docker rmi carelink-app
```

## 5. AWS ECR 배포 (선택사항)
```bash
# ECR 로그인
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin your-account.dkr.ecr.ap-northeast-2.amazonaws.com

# 이미지 태그
docker tag carelink-app:latest your-account.dkr.ecr.ap-northeast-2.amazonaws.com/carelink:latest

# 이미지 푸시
docker push your-account.dkr.ecr.ap-northeast-2.amazonaws.com/carelink:latest
```

## 6. 헬스체크 확인
```bash
# 애플리케이션 상태 확인
curl http://localhost:8080/actuator/health

# 컨테이너 헬스체크 상태
docker inspect --format='{{.State.Health.Status}}' carelink-app
```

## 트러블슈팅
- 빌드 실패 시: `docker system prune -f`로 캐시 정리
- 포트 충돌 시: `docker ps`로 실행 중인 컨테이너 확인
- 로그 확인: `docker logs -f carelink-app`