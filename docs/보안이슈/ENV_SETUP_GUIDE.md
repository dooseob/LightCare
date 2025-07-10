# 🔐 환경변수 설정 가이드

## 📋 개요

라이트케어 프로젝트의 보안 강화를 위해 모든 민감한 정보(API 키, 데이터베이스 패스워드 등)를 환경변수로 관리합니다.

## 🚨 중요 공지

**새로운 카카오 API 키가 발급되었습니다!**
- 새 API 키: `새로_발급받은_키` (팀 리더에게 문의)
- 모든 팀원은 이 키를 사용해야 합니다.

## 🚀 설정 방법

### 1단계: 최신 코드 받기
```bash
git pull origin review
```

### 2단계: .env 파일 생성
프로젝트 루트 디렉토리에서 다음 명령어를 실행하세요:

#### Windows (PowerShell)
```powershell
# .env 파일 생성
@"
# 데이터베이스 설정
DB_URL=jdbc:mysql://localhost:3306/carelink?useSSL=false&serverTimezone=Asia/Seoul&allowPublicKeyRetrieval=true&useUnicode=true&characterEncoding=UTF-8
DB_USERNAME=root
DB_PASSWORD=mysql

# 카카오 API 키 (새로 발급받은 키)
KAKAO_APP_KEY=새로_발급받은_키
KAKAO_REST_API_KEY=새로_발급받은_키

# 파일 업로드 경로
UPLOAD_BASE_PATH=C:/carelink-uploads/
"@ | Out-File -FilePath .env -Encoding UTF8
```

#### macOS/Linux (Bash)
```bash
cat > .env << 'EOF'
# 데이터베이스 설정
DB_URL=jdbc:mysql://localhost:3306/carelink?useSSL=false&serverTimezone=Asia/Seoul&allowPublicKeyRetrieval=true&useUnicode=true&characterEncoding=UTF-8
DB_USERNAME=root
DB_PASSWORD=mysql

# 카카오 API 키 (새로 발급받은 키)
KAKAO_APP_KEY=새로_발급받은_키
KAKAO_REST_API_KEY=새로_발급받은_키

# 파일 업로드 경로
UPLOAD_BASE_PATH=/Users/$(whoami)/carelink-uploads/
EOF
```

### 3단계: 개인 설정 수정
생성된 `.env` 파일을 텍스트 에디터로 열어서 다음 항목을 수정하세요:

```env
# 본인의 MySQL 패스워드로 변경
DB_PASSWORD=본인의_실제_MySQL_패스워드

# Windows 사용자는 업로드 경로 확인
UPLOAD_BASE_PATH=C:/carelink-uploads/

# macOS/Linux 사용자는 업로드 경로 확인
UPLOAD_BASE_PATH=/Users/본인계정명/carelink-uploads/
```

### 4단계: 업로드 디렉토리 생성
```bash
# Windows
mkdir C:\carelink-uploads\facility
mkdir C:\carelink-uploads\profile
mkdir C:\carelink-uploads\temp

# macOS/Linux
mkdir -p ~/carelink-uploads/facility
mkdir -p ~/carelink-uploads/profile
mkdir -p ~/carelink-uploads/temp
```

### 5단계: 애플리케이션 실행 테스트
```bash
./gradlew bootRun
```

## 🔍 설정 확인

### 정상 실행 확인 방법
1. 애플리케이션이 오류 없이 시작되는지 확인
2. 브라우저에서 `http://localhost:8080` 접속 가능한지 확인
3. 데이터베이스 연결 상태 확인

### 환경변수 로딩 확인
애플리케이션 시작 로그에서 다음과 같은 메시지를 확인하세요:
```
INFO  - Database URL: jdbc:mysql://localhost:3306/carelink...
INFO  - Upload path: C:/carelink-uploads/
```

## 🐳 도커 사용시 설정

### 로컬 도커 실행
```bash
# .env 파일이 있는 상태에서 실행
docker-compose up -d
```

### AWS 배포용 도커 실행
```bash
# AWS 환경변수 설정 후 실행
docker-compose -f docker-compose.aws.yml --env-file .env up -d
```

## 🔧 트러블슈팅

### 문제 1: 애플리케이션 시작 실패
**증상**: `Could not resolve placeholder 'DB_PASSWORD'` 오류
**해결**: 
- `.env` 파일이 프로젝트 루트에 있는지 확인
- 파일 내용에 문법 오류가 없는지 확인

### 문제 2: 데이터베이스 연결 실패
**증상**: `Access denied for user 'root'` 오류
**해결**: 
- `.env` 파일의 `DB_PASSWORD` 값이 올바른지 확인
- MySQL 서버가 실행 중인지 확인

### 문제 3: 파일 업로드 실패
**증상**: 파일 업로드시 권한 오류
**해결**: 
- 업로드 디렉토리가 존재하는지 확인
- 디렉토리 쓰기 권한이 있는지 확인

### 문제 4: 카카오 API 오류
**증상**: 지도 기능 동작 안함
**해결**: 
- 새로운 API 키가 올바르게 설정되었는지 확인
- 카카오 개발자 콘솔에서 도메인 설정 확인

## 📝 환경변수 설명

| 변수명 | 설명 | 예시 값 |
|--------|------|---------|
| `DB_URL` | 데이터베이스 연결 URL | `jdbc:mysql://localhost:3306/carelink...` |
| `DB_USERNAME` | 데이터베이스 사용자명 | `root` |
| `DB_PASSWORD` | 데이터베이스 패스워드 | `mysql123` |
| `KAKAO_APP_KEY` | 카카오 JavaScript 키 | `새로_발급받은_키` |
| `KAKAO_REST_API_KEY` | 카카오 REST API 키 | `새로_발급받은_키` |
| `UPLOAD_BASE_PATH` | 파일 업로드 기본 경로 | `C:/carelink-uploads/` |

## 🛡️ 보안 주의사항

### ✅ 반드시 지켜야 할 것
- `.env` 파일은 절대 Git에 커밋하지 않기
- 패스워드는 팀원들과 공유하지 않기
- API 키는 코드에 하드코딩하지 않기

### ❌ 하지 말아야 할 것
- `.env` 파일을 공개 채널에 올리지 않기
- 환경변수를 소스코드에 직접 작성하지 않기
- 개발용 패스워드를 운영환경에서 사용하지 않기

## 🆘 도움 요청

### 문제 해결 순서
1. 이 가이드의 트러블슈팅 섹션 확인
2. 팀 슬랙/디스코드 채널에 질문
3. 팀 리더에게 직접 문의

### 문의시 포함할 정보
- 운영체제 (Windows/macOS/Linux)
- 발생한 오류 메시지
- 실행한 명령어
- `.env` 파일 존재 여부 (내용은 공유하지 마세요!)

---

## 🎉 설정 완료!

모든 설정이 완료되면 안전하고 효율적인 개발 환경에서 작업할 수 있습니다.

**중요**: 이 설정을 완료하지 않으면 애플리케이션이 정상적으로 실행되지 않습니다. 