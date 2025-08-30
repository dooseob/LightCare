#!/bin/bash

# NCP 서버 초기 설정 스크립트
# 서버에 SSH 접속 후 실행

echo "🔧 NCP 서버 초기 설정 시작..."

# 1. 시스템 업데이트
echo "📦 시스템 패키지 업데이트..."
sudo apt-get update
sudo apt-get upgrade -y

# 2. Java 11 설치
echo "☕ Java 11 설치..."
sudo apt-get install openjdk-11-jdk -y
java -version

# 3. MySQL 클라이언트 설치
echo "🐬 MySQL 클라이언트 설치..."
sudo apt-get install mysql-client -y

# 4. Nginx 설치 (리버스 프록시용)
echo "🌐 Nginx 설치..."
sudo apt-get install nginx -y

# 5. 방화벽 설정
echo "🔒 방화벽 설정..."
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 8080/tcp  # Spring Boot
sudo ufw --force enable

# 6. 애플리케이션 디렉토리 생성
echo "📁 디렉토리 생성..."
sudo mkdir -p /home/carelink
sudo mkdir -p /home/carelink/uploads/{facility,profile,temp}
sudo mkdir -p /var/log/carelink

# 7. 사용자 생성 (보안)
echo "👤 carelink 사용자 생성..."
sudo useradd -m -s /bin/bash carelink
sudo chown -R carelink:carelink /home/carelink
sudo chown -R carelink:carelink /var/log/carelink

# 8. Nginx 설정
echo "⚙️ Nginx 리버스 프록시 설정..."
sudo tee /etc/nginx/sites-available/carelink << 'EOF'
server {
    listen 80;
    server_name your-domain.com;
    
    client_max_body_size 50M;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 타임아웃 설정
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 정적 파일 직접 서빙 (성능 향상)
    location /css/ {
        alias /home/carelink/static/css/;
        expires 30d;
    }
    
    location /js/ {
        alias /home/carelink/static/js/;
        expires 30d;
    }
    
    location /images/ {
        alias /home/carelink/static/images/;
        expires 30d;
    }
}
EOF

# Nginx 사이트 활성화
sudo ln -sf /etc/nginx/sites-available/carelink /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 9. Systemd 서비스 생성
echo "🚀 Systemd 서비스 생성..."
sudo tee /etc/systemd/system/carelink.service << 'EOF'
[Unit]
Description=LightCare Spring Boot Application
After=syslog.target network.target

[Service]
Type=simple
User=carelink
Group=carelink
WorkingDirectory=/home/carelink

Environment="SPRING_PROFILES_ACTIVE=prod"
Environment="DB_HOST=your-db-endpoint"
Environment="DB_NAME=carelink"
Environment="DB_USERNAME=carelink"
Environment="DB_PASSWORD=your-db-password"
Environment="KAKAO_APP_KEY=b97b58672807a40c122a5deed8a98ea4"

ExecStart=/usr/bin/java -Xms512m -Xmx1024m -jar /home/carelink/carelink.jar
ExecStop=/bin/kill -TERM $MAINPID

Restart=on-failure
RestartSec=10

StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable carelink.service

# 10. 로그 로테이션 설정
echo "📝 로그 로테이션 설정..."
sudo tee /etc/logrotate.d/carelink << 'EOF'
/var/log/carelink/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 carelink carelink
    sharedscripts
    postrotate
        systemctl reload carelink
    endscript
}
EOF

echo "✅ 서버 초기 설정 완료!"
echo ""
echo "📌 다음 단계:"
echo "1. DB 엔드포인트 및 비밀번호 설정"
echo "2. 도메인 설정 (/etc/nginx/sites-available/carelink)"
echo "3. JAR 파일 업로드 후 서비스 시작:"
echo "   sudo systemctl start carelink"
echo "   sudo systemctl status carelink"
echo "   sudo journalctl -u carelink -f"