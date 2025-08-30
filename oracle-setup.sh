#!/bin/bash

echo "🔮 Oracle Cloud 서버 설정 스크립트"
echo "=================================="

# 1. 시스템 업데이트
echo "📦 시스템 패키지 업데이트..."
sudo apt update && sudo apt upgrade -y

# 2. Java 11 설치
echo "☕ Java 11 설치..."
sudo apt install openjdk-11-jdk -y
java -version

# 3. MySQL 8 설치
echo "🗄️ MySQL 8.0 설치..."
sudo apt install mysql-server -y

# 4. MySQL 보안 설정
echo "🔒 MySQL 보안 설정..."
sudo mysql << EOF
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'LightCare2024!';
CREATE DATABASE carelink CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'lightcare'@'%' IDENTIFIED BY 'LightCare2024!';
GRANT ALL PRIVILEGES ON carelink.* TO 'lightcare'@'%';
FLUSH PRIVILEGES;
EOF

# 5. 방화벽 설정
echo "🔥 방화벽 규칙 설정..."
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8080 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save

# 6. 애플리케이션 디렉토리 생성
echo "📁 애플리케이션 디렉토리 생성..."
sudo mkdir -p /opt/lightcare
sudo chown ubuntu:ubuntu /opt/lightcare

# 7. 서비스 파일 생성
echo "🎯 시스템 서비스 생성..."
sudo tee /etc/systemd/system/lightcare.service > /dev/null << 'EOF'
[Unit]
Description=LightCare Spring Boot Application
After=syslog.target

[Service]
User=ubuntu
ExecStart=/usr/bin/java -jar /opt/lightcare/carelink.jar
SuccessExitStatus=143
StandardOutput=append:/var/log/lightcare/app.log
StandardError=append:/var/log/lightcare/error.log
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 8. 로그 디렉토리 생성
sudo mkdir -p /var/log/lightcare
sudo chown ubuntu:ubuntu /var/log/lightcare

# 9. 서비스 등록
sudo systemctl daemon-reload
sudo systemctl enable lightcare

echo "✅ Oracle Cloud 서버 설정 완료!"
echo ""
echo "📌 다음 단계:"
echo "1. JAR 파일을 /opt/lightcare/carelink.jar로 업로드"
echo "2. sudo systemctl start lightcare 로 서비스 시작"
echo "3. http://서버IP:8080 으로 접속 테스트"