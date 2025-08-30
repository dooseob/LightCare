# Oracle Cloud 배포 가이드

## 1. 사전 준비사항

### 1.1 Oracle Cloud 계정
- [cloud.oracle.com](https://cloud.oracle.com) 에서 무료 계정 생성
- 신용카드 등록 필요 (검증용, 과금 없음)
- Region: Korea Central (Chuncheon) 선택

### 1.2 필요 도구
- SSH 클라이언트 (Windows: PuTTY 또는 PowerShell)
- FTP 클라이언트 (FileZilla) 또는 SCP
- Git

## 2. VM 인스턴스 생성

### 2.1 인스턴스 설정
```
Name: lightcare-server
Shape: VM.Standard.E2.1.Micro (Always Free)
OS: Ubuntu 20.04
Network: 공용 서브넷, 공용 IP 할당
Boot Volume: 50GB
```

### 2.2 SSH 키 관리
- 생성 시 새 SSH 키 쌍 생성
- Private Key (.key) 다운로드 및 안전한 곳에 보관
- Windows: PuTTYgen으로 .ppk 변환 가능

## 3. 네트워크 설정

### 3.1 Security List 규칙
| 포트 | 프로토콜 | 소스 | 용도 |
|------|---------|------|------|
| 22 | TCP | 0.0.0.0/0 | SSH |
| 80 | TCP | 0.0.0.0/0 | HTTP |
| 443 | TCP | 0.0.0.0/0 | HTTPS |
| 8080 | TCP | 0.0.0.0/0 | Spring Boot |

### 3.2 방화벽 설정 (서버 내부)
```bash
sudo iptables -I INPUT -p tcp --dport 8080 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

## 4. 서버 환경 구성

### 4.1 Java 11 설치
```bash
sudo apt update
sudo apt install openjdk-11-jdk -y
java -version
```

### 4.2 MySQL 8.0 설치
```bash
sudo apt install mysql-server -y
sudo mysql_secure_installation
```

### 4.3 데이터베이스 생성
```sql
CREATE DATABASE carelink CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'lightcare'@'localhost' IDENTIFIED BY 'your-password';
GRANT ALL PRIVILEGES ON carelink.* TO 'lightcare'@'localhost';
FLUSH PRIVILEGES;
```

## 5. 애플리케이션 배포

### 5.1 빌드 (로컬)
```bash
./gradlew clean build -x test
```

### 5.2 업로드
```bash
scp -i ssh-key.key build/libs/*.jar ubuntu@<ip>:/home/ubuntu/
```

### 5.3 실행
```bash
# 직접 실행
java -jar carelink-0.0.1-SNAPSHOT.jar

# 백그라운드 실행
nohup java -jar carelink-0.0.1-SNAPSHOT.jar &

# systemd 서비스로 실행 (권장)
sudo systemctl start lightcare
```

## 6. 서비스 등록

### 6.1 systemd 서비스 파일
`/etc/systemd/system/lightcare.service`:
```ini
[Unit]
Description=LightCare Spring Boot
After=network.target

[Service]
Type=simple
User=ubuntu
ExecStart=/usr/bin/java -jar /home/ubuntu/carelink.jar
Restart=always
Environment="DB_PASSWORD=your-password"
Environment="KAKAO_APP_KEY=your-key"

[Install]
WantedBy=multi-user.target
```

### 6.2 서비스 관리
```bash
sudo systemctl daemon-reload
sudo systemctl enable lightcare
sudo systemctl start lightcare
sudo systemctl status lightcare
```

## 7. 도메인 연결 (선택사항)

### 7.1 도메인 DNS 설정
- A 레코드: Oracle VM Public IP
- CNAME: www → 도메인

### 7.2 Nginx 리버스 프록시
```bash
sudo apt install nginx -y
```

`/etc/nginx/sites-available/lightcare`:
```nginx
server {
    listen 80;
    server_name lightcare.co.kr www.lightcare.co.kr;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 7.3 SSL 인증서 (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d lightcare.co.kr -d www.lightcare.co.kr
```

## 8. 모니터링 및 유지보수

### 8.1 로그 확인
```bash
# 애플리케이션 로그
tail -f /var/log/lightcare/app.log

# 시스템 로그
sudo journalctl -u lightcare -f
```

### 8.2 백업
```bash
# 데이터베이스 백업
mysqldump -u root -p carelink > backup.sql

# 정기 백업 (crontab)
0 2 * * * mysqldump carelink > /backup/carelink_$(date +\%Y\%m\%d).sql
```

### 8.3 모니터링 도구
- htop: 시스템 리소스
- netstat: 네트워크 연결
- df -h: 디스크 사용량

## 9. 문제 해결

### 9.1 포트 확인
```bash
sudo netstat -tlnp | grep 8080
```

### 9.2 방화벽 확인
```bash
sudo iptables -L -n
```

### 9.3 서비스 재시작
```bash
sudo systemctl restart lightcare
```

## 10. 주의사항

- Oracle Cloud Always Free 티어는 영구 무료
- 리소스 제한: 1GB RAM, 1 OCPU
- 3개월 미사용시 인스턴스 정지 가능 (주기적 접속 필요)
- 백업은 주기적으로 수행