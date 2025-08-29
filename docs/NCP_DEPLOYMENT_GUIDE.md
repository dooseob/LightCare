# 📚 NCP(네이버 클라우드 플랫폼) 배포 가이드

## 🎯 배포 체크리스트

### 1️⃣ 로컬 준비사항
- [x] `application-prod.yml` 생성 완료
- [x] 배포 스크립트 생성 (`deploy-ncp.sh`)
- [x] 서버 시작/종료 스크립트 생성
- [ ] 프로젝트 빌드 테스트
- [ ] 환경변수 설정

### 2️⃣ NCP 서버 설정
- [ ] 서버 생성 (Ubuntu 20.04, 2vCPU/4GB)
- [ ] 공인 IP 할당
- [ ] ACG 보안 규칙 설정
- [ ] SSH 키 페어 생성

### 3️⃣ 데이터베이스 설정
- [ ] Cloud DB for MySQL 생성
- [ ] DB 사용자 및 권한 설정
- [ ] 스키마 초기화
- [ ] 백업 정책 설정

### 4️⃣ 서버 환경 구성
- [ ] Java 11 설치
- [ ] Nginx 설치 및 설정
- [ ] Systemd 서비스 등록
- [ ] 로그 로테이션 설정

### 5️⃣ 도메인 및 SSL
- [ ] 도메인 DNS 설정
- [ ] SSL 인증서 발급
- [ ] HTTPS 리다이렉션 설정

---

## 🚀 빠른 배포 명령어

### 로컬에서 실행
```bash
# 1. 실행 권한 부여
chmod +x deploy-ncp.sh

# 2. 환경변수 설정
export NCP_SERVER_IP="your-server-ip"
export NCP_SERVER_USER="root"

# 3. 배포 실행
./deploy-ncp.sh
```

### 서버에서 실행
```bash
# 1. 초기 설정 (최초 1회)
bash ncp-server-setup.sh

# 2. 서비스 시작
sudo systemctl start carelink
sudo systemctl status carelink

# 3. 로그 확인
sudo journalctl -u carelink -f
tail -f /var/log/carelink/application.log
```

---

## 📊 모니터링

### 애플리케이션 상태
```bash
# 프로세스 확인
ps aux | grep carelink

# 포트 확인
sudo netstat -tlnp | grep 8080

# 메모리 사용량
free -h

# 디스크 사용량
df -h
```

### 로그 확인
```bash
# 애플리케이션 로그
tail -f /var/log/carelink/application.log

# Nginx 액세스 로그
tail -f /var/log/nginx/access.log

# Nginx 에러 로그
tail -f /var/log/nginx/error.log
```

---

## 🔧 트러블슈팅

### 서버가 시작되지 않을 때
1. Java 버전 확인: `java -version`
2. 포트 충돌 확인: `sudo lsof -i:8080`
3. 메모리 부족 확인: `free -h`
4. 권한 문제 확인: `ls -la /home/carelink/`

### DB 연결 실패
1. DB 엔드포인트 확인
2. 보안 그룹 규칙 확인
3. DB 사용자 권한 확인
4. 네트워크 연결 테스트: `telnet [DB_HOST] 3306`

### 502 Bad Gateway
1. Spring Boot 실행 확인: `sudo systemctl status carelink`
2. Nginx 설정 확인: `sudo nginx -t`
3. 프록시 설정 확인: `/etc/nginx/sites-available/carelink`

---

## 📝 환경변수 목록

| 변수명 | 설명 | 예시값 |
|--------|------|--------|
| DB_HOST | DB 엔드포인트 | db-xxxxx.ncloud.com |
| DB_NAME | 데이터베이스명 | carelink |
| DB_USERNAME | DB 사용자명 | carelink |
| DB_PASSWORD | DB 비밀번호 | ******** |
| KAKAO_APP_KEY | 카카오맵 API 키 | b97b58672807a40c122a5deed8a98ea4 |

---

## 📞 지원 연락처

- NCP 기술 지원: 1544-5876
- NCP 콘솔: https://console.ncloud.com
- 문서: https://docs.ncloud.com