# 📋 내일 Oracle Cloud 배포 체크리스트

## 1. Oracle Cloud 가입 재시도
- [ ] 24시간 후 재시도
- [ ] 시크릿 모드 브라우저 사용
- [ ] 다른 카드 준비 (필요시)

## 2. 가입 성공 후 순서

### Step 1: VM 인스턴스 생성
```
이름: lightcare-server
Shape: VM.Standard.E2.1.Micro (Always Free)
OS: Ubuntu 20.04
Region: Korea Central (춘천)
```

### Step 2: SSH 키 다운로드
- Private Key 안전한 곳에 저장
- 권한 설정: chmod 400 ssh-key.key

### Step 3: Security List 설정
```
포트 22, 80, 443, 8080 오픈
```

### Step 4: 서버 접속 후 실행
```bash
# 1. 서버 접속
ssh -i ssh-key.key ubuntu@<public-ip>

# 2. 기본 패키지 업데이트
sudo apt update && sudo apt upgrade -y

# 3. Java 11 설치
sudo apt install openjdk-11-jdk -y

# 4. MySQL 설치
sudo apt install mysql-server -y

# 5. 프로젝트 디렉토리 생성
mkdir /home/ubuntu/lightcare
```

## 3. 로컬에서 준비할 것

### JAR 파일 빌드
```bash
# Windows 환경
./gradlew.bat clean build -x test

# 빌드된 파일 위치
build/libs/carelink-0.0.1-SNAPSHOT.jar
```

### 환경변수 준비
```
DB_PASSWORD=설정할비밀번호
KAKAO_APP_KEY=b97b58672807a40c122a5deed8a98ea4
```

## 4. 배포 명령어

### JAR 파일 업로드
```bash
scp -i ssh-key.key build/libs/*.jar ubuntu@<ip>:/home/ubuntu/lightcare/
```

### 애플리케이션 실행
```bash
# 테스트 실행
java -jar carelink-0.0.1-SNAPSHOT.jar

# 백그라운드 실행
nohup java -jar carelink-0.0.1-SNAPSHOT.jar &
```

## 5. 확인사항
- [ ] http://<public-ip>:8080 접속 테스트
- [ ] 데이터베이스 연결 확인
- [ ] 로그 파일 확인

## 💡 Tips
- Oracle Cloud는 한번 설정하면 영구 무료
- 주기적으로 접속해서 계정 활성 유지
- 문제 발생시 다시 연락주세요!