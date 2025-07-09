# 빌드 스테이지: Gradle로 애플리케이션 빌드
FROM gradle:7.6.1-jdk11 AS builder

# 작업 디렉토리 설정
WORKDIR /app

# Gradle 파일 복사 (레이어 캐싱을 위해)
COPY build.gradle ./
COPY gradle ./gradle
COPY gradlew ./
COPY gradlew.bat ./

# 의존성 다운로드 (캐싱 최적화)
RUN gradle dependencies --no-daemon

# 소스 코드 복사
COPY src ./src

# 애플리케이션 빌드 (테스트 제외, 프로덕션 최적화)
RUN gradle clean build --no-daemon -x test --build-cache

# 실행 스테이지: JRE만 포함하는 가벼운 이미지
FROM eclipse-temurin:11-jre

# 작업 디렉토리 설정
WORKDIR /app

# 타임존 설정
ENV TZ=Asia/Seoul

# 필요한 패키지 설치 및 정리
RUN apt-get update && \
    apt-get install -y tzdata curl && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 빌드 스테이지에서 생성된 JAR 파일 복사
COPY --from=builder /app/build/libs/*.jar app.jar

# 파일 업로드 디렉토리 생성
RUN mkdir -p /carelink-uploads/facility \
    /carelink-uploads/profile \
    /carelink-uploads/temp

# 실행 유저 설정
RUN useradd -r -u 1001 -g root carelink && \
    chown -R 1001:root /carelink-uploads && \
    chmod -R 755 /carelink-uploads

# 컨테이너 실행 시 사용할 포트
EXPOSE 8080

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# 실행 유저로 변경
USER 1001

# 환경변수 설정
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"
ENV SPRING_PROFILES_ACTIVE=prod

# 애플리케이션 실행
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"] 