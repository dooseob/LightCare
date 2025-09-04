# 빌드 단계
FROM gradle:7.6-jdk11 AS builder
WORKDIR /app

# Gradle 캐시를 위한 의존성 파일 복사
COPY build.gradle ./
COPY gradle ./gradle
COPY gradlew gradlew.bat ./

# 의존성 다운로드 (캐시 활용)
RUN ./gradlew dependencies --no-daemon

# 소스 코드 복사 및 빌드
COPY src ./src
RUN ./gradlew clean build -x test --no-daemon

# 실행 단계
FROM openjdk:11-jre-slim
WORKDIR /app

# 빌드된 JAR 파일 복사
COPY --from=builder /app/build/libs/*.jar app.jar

# 업로드 디렉토리 생성
RUN mkdir -p /app/uploads/facility /app/uploads/profile /app/uploads/board /app/uploads/review /app/uploads/temp

# Railway 환경변수 사용
ENV SPRING_PROFILES_ACTIVE=production
ENV JAVA_OPTS="-Xmx300m -XX:+UseG1GC -XX:+UseStringDeduplication"

# 포트 노출
EXPOSE 8080

# 실행 명령
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8080} -jar app.jar"]