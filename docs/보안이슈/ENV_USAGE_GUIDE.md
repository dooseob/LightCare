# 🔧 환경변수 사용 가이드

## 📋 개요

이제 라이트케어 프로젝트는 **`.env` 파일 하나만 수정하면 모든 곳에 자동으로 적용**됩니다!

## ✅ 환경변수 적용 범위

### 1. Spring Boot 애플리케이션 ✅
- **설정 파일**: `src/main/resources/application.yml`
- **적용 방식**: `${환경변수명:기본값}` 형태
- **적용 항목**:
  ```yaml
  spring:
    datasource:
      url: ${DB_URL:기본값}
      username: ${DB_USERNAME:}
      password: ${DB_PASSWORD:}
  ```

### 2. 도커 컨테이너 ✅
- **로컬 개발용**: `docker-compose.yml`
- **AWS 배포용**: `docker-compose.aws.yml`
- **직접 실행용**: `docker-run-example.sh`
- **적용 방식**: `${환경변수명:-기본값}` 형태

### 3. 카카오 API 연동 ✅
- **JavaScript 키**: `KAKAO_APP_KEY`
- **REST API 키**: `KAKAO_REST_API_KEY`
- **사용 위치**: 프론트엔드 지도 기능

## 🚀 사용 방법

### 1단계: .env 파일 생성
```bash
# 프로젝트 루트에서 실행
cp .env.example .env  # 또는 직접 생성
```

### 2단계: 개인 설정 입력
```env
# .env 파일 내용
DB_URL=jdbc:mysql://localhost:3306/carelink?useSSL=false&serverTimezone=Asia/Seoul&allowPublicKeyRetrieval=true&useUnicode=true&characterEncoding=UTF-8
DB_USERNAME=root
DB_PASSWORD=본인의_MySQL_패스워드  # 여기만 수정!

KAKAO_APP_KEY=
KAKAO_REST_API_KEY=

UPLOAD_BASE_PATH=C:/carelink-uploads/
```

### 3단계: 애플리케이션 실행
```bash
# 일반 실행
./gradlew bootRun

# 도커 실행
docker-compose up -d

# AWS 배포
docker-compose -f docker-compose.aws.yml up -d
```

## 🔄 자동 적용 메커니즘

### Spring Boot 환경변수 읽기
```yaml
# application.yml
spring:
  datasource:
    # 1. .env 파일에서 DB_PASSWORD 읽기
    # 2. 없으면 기본값 'mysql' 사용
    password: ${DB_PASSWORD:}
```

### Docker 환경변수 전달
```yaml
# docker-compose.yml
services:
  app:
    environment:
      # 1. 호스트의 .env 파일에서 읽기
      # 2. 컨테이너 내부로 전달
      - DB_PASSWORD=${DB_PASSWORD:}
```

## 📊 환경변수 우선순위

1. **`.env` 파일 값** (최우선)
2. **시스템 환경변수**
3. **기본값** (설정 파일에 정의된 값)

### 예시
```env
# .env 파일에 DB_PASSWORD=mypassword123 설정
DB_PASSWORD=mypassword123
```

↓ 자동 적용 ↓

```yaml
# application.yml에서 자동으로 사용
spring:
  datasource:
    password: mypassword123  # .env에서 읽어온 값
```

## 🎯 주요 환경변수 설명

| 변수명 | 용도 | 수정 필요 여부 |
|--------|------|----------------|
| `DB_PASSWORD` | MySQL 패스워드 | ✅ **필수 수정** |
| `DB_USERNAME` | MySQL 사용자명 | 선택 (기본: root) |
| `DB_URL` | 데이터베이스 URL | 선택 (기본값 사용) |
| `KAKAO_APP_KEY` | 카카오 API 키 | 이미 설정됨 |
| `KAKAO_REST_API_KEY` | 카카오 REST API | 이미 설정됨 |
| `UPLOAD_BASE_PATH` | 파일 업로드 경로 | 선택 (기본값 사용) |

## 🔧 환경별 설정 방법

### 개발 환경
```env
# 개발용 설정
DB_PASSWORD=dev123
UPLOAD_BASE_PATH=C:/dev-uploads/
```

### 운영 환경
```env
# 운영용 설정
DB_PASSWORD=강력한_운영_패스워드
UPLOAD_BASE_PATH=/var/uploads/carelink/
```

### 팀 협업 환경
```env
# 각자 다른 DB 패스워드 사용 가능
DB_PASSWORD=team_member_1_password
```

## 🚨 주의사항

### ✅ 해야 할 것
- `.env` 파일은 각자 개인별로 관리
- 패스워드는 강력하게 설정
- 파일 경로는 본인 환경에 맞게 설정

### ❌ 하지 말아야 할 것
- `.env` 파일을 Git에 커밋하지 않기
- 팀원들과 패스워드 공유하지 않기
- 소스코드에 직접 값 입력하지 않기

## 🔍 확인 방법

### 1. 애플리케이션 로그 확인
```bash
# 실행 시 로그에서 확인
./gradlew bootRun

# 다음과 같은 로그가 나오면 성공
INFO - Database URL: jdbc:mysql://localhost:3306/carelink...
```

### 2. 데이터베이스 연결 테스트
```bash
# 브라우저에서 접속
http://localhost:8080

# 오류 없이 접속되면 성공
```

### 3. 환경변수 로딩 확인
```bash
# 애플리케이션 시작 시 환경변수 로딩 로그 확인
INFO - Loading environment variables from .env file
```

## 🆘 문제 해결

### 문제 1: 환경변수가 적용되지 않음
**해결책**: 
- `.env` 파일이 프로젝트 루트에 있는지 확인
- 파일 이름이 정확한지 확인 (`.env`, 확장자 없음)
- 애플리케이션 재시작

### 문제 2: 데이터베이스 연결 실패
**해결책**:
- `.env` 파일의 `DB_PASSWORD` 값 확인
- MySQL 서버 실행 상태 확인
- 패스워드 특수문자 이스케이프 처리

### 문제 3: 도커에서 환경변수 인식 안됨
**해결책**:
- `docker-compose down` 후 `docker-compose up -d` 재실행
- `.env` 파일 위치 확인 (docker-compose.yml과 같은 폴더)

## 🎉 결론

**이제 `.env` 파일 하나만 수정하면 모든 곳에 자동으로 적용됩니다!**

- ✅ Spring Boot 애플리케이션
- ✅ 도커 컨테이너 
- ✅ AWS 배포 환경
- ✅ 카카오 API 연동

**더 이상 여러 파일을 수정할 필요가 없습니다!** 