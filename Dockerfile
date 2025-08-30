FROM openjdk:11-jre-slim

# 타임존 설정
ENV TZ=Asia/Seoul
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app

# 업로드 디렉터리 생성
RUN mkdir -p /app/uploads/facility /app/uploads/profile /app/uploads/board /app/uploads/review /app/uploads/temp

# 애플리케이션 JAR 파일 복사
COPY build/libs/*.jar app.jar

# 포트 노출
EXPOSE 8080

# Railway 환경변수 설정
ENV SPRING_PROFILES_ACTIVE=railway
ENV UPLOAD_BASE_PATH=/app/uploads

# JVM 메모리 최적화 (Railway 무료 티어용)
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

# 헬스체크
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# 애플리케이션 실행
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]