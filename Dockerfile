# 빌드 스테이지: Gradle로 애플리케이션 빌드
FROM gradle:7.6.1-jdk11 AS builder

# 작업 디렉토리 설정
WORKDIR /app

# Gradle 파일 복사 (레이어 캐싱을 위해)
COPY build.gradle settings.gradle ./
COPY gradle ./gradle

# 의존성 다운로드
RUN gradle dependencies --no-daemon

# 소스 코드 복사
COPY src ./src

# 애플리케이션 빌드
RUN gradle build --no-daemon -x test

# 실행 스테이지: JRE만 포함하는 가벼운 이미지
FROM eclipse-temurin:11-jre

# 작업 디렉토리 설정
WORKDIR /app

# 타임존 설정
ENV TZ=Asia/Seoul

# 필요한 패키지 설치
RUN apt-get update && \
    apt-get install -y tzdata && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

# 빌드 스테이지에서 생성된 JAR 파일 복사
COPY --from=builder /app/build/libs/*.jar app.jar

# 파일 업로드 디렉토리 생성
RUN mkdir -p /carelink-uploads/facility \
    /carelink-uploads/profile \
    /carelink-uploads/temp

# 실행 유저 설정
RUN useradd -r -u 1001 -g root carelink
USER 1001

# 컨테이너 실행 시 사용할 포트
EXPOSE 8080

# 애플리케이션 실행
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", \
    "app.jar"] 