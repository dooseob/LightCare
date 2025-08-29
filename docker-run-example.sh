# 로컬 테스트용 (MySQL 로컬 서버)
docker run -d \
  --name carelink-app \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DB_URL="jdbc:mysql://host.docker.internal:3306/carelink?useSSL=false&serverTimezone=Asia/Seoul&allowPublicKeyRetrieval=true&useUnicode=true&characterEncoding=UTF-8" \
  -e DB_USERNAME=root \
  -e DB_PASSWORD=mysql \
  -e KAKAO_APP_KEY=0948e3e4faa457fb6083f68e1ce10458 \
  -e UPLOAD_BASE_PATH=/carelink-uploads/ \
  -v carelink-uploads:/carelink-uploads \
  carelink-app

# AWS RDS 사용시
docker run -d \
  --name carelink-app \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DB_URL="jdbc:mysql://your-rds-endpoint.region.rds.amazonaws.com:3306/carelink?useSSL=true&serverTimezone=Asia/Seoul&allowPublicKeyRetrieval=true&useUnicode=true&characterEncoding=UTF-8" \
  -e DB_USERNAME=root \
  -e DB_PASSWORD=your-rds-password \
  -e KAKAO_APP_KEY=0948e3e4faa457fb6083f68e1ce10458 \
  -e UPLOAD_BASE_PATH=/carelink-uploads/ \
  -v carelink-uploads:/carelink-uploads \
  carelink-app