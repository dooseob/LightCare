# AWS EC2/RDS 배포 가이드

## 🚀 배포 개요

이 문서는 LightCare 애플리케이션을 AWS EC2와 RDS를 사용하여 배포하는 완전한 가이드입니다.

## 📋 사전 준비사항

### 1. AWS 계정 및 권한
- AWS 계정 생성 및 로그인
- IAM 사용자 생성 (EC2, RDS, VPC 권한 필요)
- AWS CLI 설치 및 구성

### 2. 로컬 환경
- Docker Desktop 설치 및 실행
- Java 11 설치
- Git 설치

## 🗄️ 1단계: AWS RDS 데이터베이스 설정

### RDS 인스턴스 생성
1. AWS Console → RDS → 데이터베이스 생성
2. 설정 옵션:
   - **엔진**: MySQL 8.0
   - **템플릿**: 프리 티어 (또는 개발/테스트)
   - **DB 인스턴스 식별자**: `lightcare-db`
   - **마스터 사용자명**: `root`
   - **마스터 암호**: 안전한 비밀번호 설정
   - **DB 이름**: `carelink`

### 보안 그룹 설정
```
인바운드 규칙:
- 유형: MySQL/Aurora
- 포트: 3306
- 소스: EC2 보안 그룹 (또는 0.0.0.0/0 임시)
```

### 데이터베이스 초기화
```bash
# RDS 엔드포인트 연결
mysql -h your-rds-endpoint.region.rds.amazonaws.com -u root -p

# 데이터베이스 생성 (이미 있다면 생략)
CREATE DATABASE carelink CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 스키마 적용
USE carelink;
SOURCE /path/to/schema.sql;
```

## 🖥️ 2단계: AWS EC2 인스턴스 설정

### EC2 인스턴스 생성
1. AWS Console → EC2 → 인스턴스 시작
2. 설정 옵션:
   - **AMI**: Ubuntu Server 22.04 LTS
   - **인스턴스 타입**: t2.micro (프리 티어) 또는 t3.small
   - **키 페어**: 새로 생성하거나 기존 키 사용
   - **보안 그룹**: 새로 생성

### 보안 그룹 설정
```
인바운드 규칙:
- SSH (22): 내 IP 또는 0.0.0.0/0
- HTTP (80): 0.0.0.0/0
- HTTPS (443): 0.0.0.0/0
- 사용자 정의 TCP (8080): 0.0.0.0/0
```

### EC2 인스턴스 연결
```bash
# SSH 연결
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip

# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Docker 설치
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

# Java 11 설치 (필요시)
sudo apt install -y openjdk-11-jdk

# 로그아웃 후 재접속 (docker 그룹 적용)
exit
```

## 🐳 3단계: 애플리케이션 배포

### 소스코드 준비
```bash
# EC2에서 실행
git clone https://github.com/dooseob/lightcare.git
cd lightcare

# 환경 변수 설정
cp .env.aws .env
```

### 환경 변수 설정 (.env 파일 편집)
```bash
nano .env

# 다음 내용으로 수정
DB_URL=jdbc:mysql://your-rds-endpoint.region.rds.amazonaws.com:3306/carelink?useSSL=true&serverTimezone=Asia/Seoul&allowPublicKeyRetrieval=true&useUnicode=true&characterEncoding=UTF-8
DB_USERNAME=root
DB_PASSWORD=your-rds-password
KAKAO_APP_KEY=your-kakao-app-key
KAKAO_REST_API_KEY=your-kakao-rest-api-key
UPLOAD_BASE_PATH=/carelink-uploads/
```

### Docker 이미지 빌드 및 실행
```bash
# 이미지 빌드
docker build -t lightcare-app .

# 컨테이너 실행 (AWS 환경)
docker-compose -f docker-compose.aws.yml --env-file .env up -d

# 또는 직접 실행
docker run -d \
  --name lightcare-app \
  -p 8080:8080 \
  --env-file .env \
  -v lightcare-uploads:/carelink-uploads \
  lightcare-app
```

## 🔧 4단계: 배포 확인 및 테스트

### 애플리케이션 상태 확인
```bash
# 컨테이너 상태 확인
docker ps

# 로그 확인
docker logs lightcare-app

# 헬스체크 확인
curl http://localhost:8080/actuator/health

# 또는 외부에서
curl http://your-ec2-public-ip:8080/actuator/health
```

### 데이터베이스 연결 테스트
```bash
# 컨테이너 내부 접속
docker exec -it lightcare-app /bin/bash

# 또는 RDS 직접 연결 테스트
mysql -h your-rds-endpoint.region.rds.amazonaws.com -u root -p carelink
```

## 🌐 5단계: 도메인 및 HTTPS 설정 (선택사항)

### Nginx 리버스 프록시 설정
```bash
# Nginx 설치
sudo apt install -y nginx

# 설정 파일 생성
sudo nano /etc/nginx/sites-available/lightcare

# 다음 내용 추가:
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 설정 활성화
sudo ln -s /etc/nginx/sites-available/lightcare /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL 인증서 설정 (Let's Encrypt)
```bash
# Certbot 설치
sudo apt install -y certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d your-domain.com

# 자동 갱신 설정
sudo crontab -e
# 다음 라인 추가:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔄 6단계: 자동화 배포 스크립트

### 배포 스크립트 생성
```bash
nano deploy.sh

#!/bin/bash
# LightCare 자동 배포 스크립트

echo "🚀 LightCare 배포 시작..."

# 소스 코드 업데이트
git pull origin main

# 기존 컨테이너 중지 및 제거
docker-compose -f docker-compose.aws.yml down

# 새 이미지 빌드
docker build -t lightcare-app .

# 컨테이너 실행
docker-compose -f docker-compose.aws.yml --env-file .env up -d

# 헬스체크 대기
echo "⏳ 애플리케이션 시작 대기 중..."
sleep 30

# 상태 확인
if curl -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo "✅ 배포 성공!"
else
    echo "❌ 배포 실패! 로그를 확인하세요."
    docker logs lightcare-app
fi

# 실행 권한 부여
chmod +x deploy.sh
```

## 🐛 트러블슈팅

### 일반적인 문제 해결

#### 1. 데이터베이스 연결 오류
```bash
# RDS 보안 그룹 확인
# EC2에서 RDS 포트 3306 테스트
telnet your-rds-endpoint.region.rds.amazonaws.com 3306

# 환경 변수 확인
docker exec lightcare-app env | grep DB_
```

#### 2. 메모리 부족 오류
```bash
# Java 힙 메모리 조정
# .env 파일에서 JAVA_OPTS 수정
JAVA_OPTS=-Xms256m -Xmx512m -XX:+UseContainerSupport -XX:MaxRAMPercentage=50.0
```

#### 3. 파일 업로드 경로 오류
```bash
# 볼륨 마운트 확인
docker inspect lightcare-app | grep -A 10 "Mounts"

# 권한 확인
docker exec lightcare-app ls -la /carelink-uploads/
```

#### 4. 로그 확인 방법
```bash
# 애플리케이션 로그
docker logs -f lightcare-app

# 시스템 로그
sudo journalctl -u docker

# Nginx 로그 (사용 시)
sudo tail -f /var/log/nginx/error.log
```

## 📊 모니터링 및 백업

### 애플리케이션 모니터링
```bash
# 리소스 사용량 모니터링
docker stats lightcare-app

# 디스크 사용량 확인
df -h

# 메모리 사용량 확인
free -h
```

### 데이터베이스 백업
```bash
# RDS 스냅샷 생성 (AWS CLI 사용)
aws rds create-db-snapshot \
  --db-instance-identifier lightcare-db \
  --db-snapshot-identifier lightcare-backup-$(date +%Y%m%d)

# 수동 백업
mysqldump -h your-rds-endpoint.region.rds.amazonaws.com -u root -p carelink > backup.sql
```

## 🚀 성능 최적화

### 1. 애플리케이션 최적화
- JVM 메모리 설정 조정
- 커넥션 풀 크기 최적화
- 정적 리소스 CDN 사용

### 2. 인프라 최적화
- EC2 인스턴스 타입 업그레이드
- RDS 성능 인사이트 활용
- CloudWatch 모니터링 설정

### 3. 보안 강화
- IAM 역할 최소 권한 적용
- 보안 그룹 세분화
- SSL/TLS 인증서 적용

## 📞 지원 및 문의

- **기술 지원**: 개발팀 Discord 채널
- **AWS 이슈**: AWS Support 센터
- **긴급 상황**: 온콜 담당자 연락

---

**⚠️ 주의사항**
- 프로덕션 환경에서는 반드시 백업을 먼저 수행하세요
- 환경 변수에 민감한 정보가 포함되어 있으니 보안에 주의하세요
- 정기적으로 보안 업데이트를 적용하세요

**🎯 배포 체크리스트**
- [ ] RDS 인스턴스 생성 및 보안 그룹 설정
- [ ] EC2 인스턴스 생성 및 Docker 설치
- [ ] 환경 변수 설정 및 보안 확인
- [ ] 애플리케이션 빌드 및 배포
- [ ] 헬스체크 및 기능 테스트
- [ ] 모니터링 및 백업 설정
- [ ] 도메인 및 SSL 설정 (선택사항)