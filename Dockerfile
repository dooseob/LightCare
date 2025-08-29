FROM openjdk:11-jre-slim

WORKDIR /app

# 애플리케이션 JAR 파일 복사
COPY build/libs/*.jar app.jar

# 포트 노출
EXPOSE 8080

# 환경변수 설정
ENV SPRING_PROFILES_ACTIVE=production

# 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"]