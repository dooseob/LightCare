# 🚀 LightCare 개발 환경 설정 가이드

## 📌 현재 상황
이미지 첨부 기능이 완전히 구현되었으나, WSL 환경에 Java와 MySQL이 설치되어 있지 않아 테스트를 진행할 수 없는 상황입니다.

## 🔧 해결 방법 (권장 순서)

### **방법 1: Windows 환경에서 실행 (가장 빠름)**

1. **Windows PowerShell 또는 CMD 열기**
   ```cmd
   cd C:\Users\human-07\LightCare
   ```

2. **MySQL 서비스 실행 확인**
   - Windows 서비스에서 MySQL80 실행 상태 확인
   - 또는 XAMPP 제어판에서 MySQL 시작

3. **애플리케이션 실행**
   ```cmd
   .\gradlew.bat bootRun
   ```

4. **브라우저에서 테스트**
   - http://localhost:8080 접속
   - http://localhost:8080/board/write (게시글 이미지 업로드)
   - http://localhost:8080/review/write (리뷰 이미지 업로드)

### **방법 2: WSL에 개발 환경 구축**

1. **Java 11 설치**
   ```bash
   sudo apt update
   sudo apt install openjdk-11-jdk
   export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
   export PATH=$PATH:$JAVA_HOME/bin
   ```

2. **MySQL 클라이언트 설치**
   ```bash
   sudo apt install mysql-client-core-8.0
   ```

3. **환경변수 영구 설정**
   ```bash
   echo 'export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64' >> ~/.bashrc
   echo 'export PATH=$PATH:$JAVA_HOME/bin' >> ~/.bashrc
   source ~/.bashrc
   ```

## 🗄️ 데이터베이스 스키마 적용

### **MySQL Workbench 또는 phpMyAdmin 사용**

1. **스키마 파일 위치**
   ```
   src/main/resources/schema-image-attachments.sql
   ```

2. **실행해야 할 SQL**
   - 게시판 이미지 테이블: `board_images`
   - 리뷰 이미지 테이블: `review_images`
   - 기존 테이블 컬럼 추가: `image_count`, `has_images`
   - 자동 카운트 업데이트 트리거

### **명령줄에서 직접 실행**
```bash
mysql -u root -p carelink < src/main/resources/schema-image-attachments.sql
```

## 🎯 테스트해야 할 기능들

### **1. 게시글 이미지 업로드**
- 드래그 앤 드롭으로 이미지 업로드
- 최대 10개 이미지 제한 확인
- 파일 크기 검증 (5MB 제한)
- 실시간 미리보기
- alt text 입력
- 개별 이미지 삭제

### **2. 리뷰 이미지 업로드**
- 드래그 앤 드롭으로 이미지 업로드
- 최대 5개 이미지 제한 확인
- WebP 자동 변환 확인
- 썸네일 생성 확인

### **3. 백엔드 API 테스트**
- POST `/board/api/upload-images/{boardId}`
- DELETE `/board/api/delete-image/{imageId}`
- POST `/review/api/upload-images/{reviewId}`
- DELETE `/review/api/delete-image/{imageId}`

## 🐛 문제 해결

### **Java 관련 오류**
- `JAVA_HOME is not set`: Java 환경변수 설정 필요
- `java: command not found`: Java 설치 또는 PATH 설정 필요

### **MySQL 관련 오류**
- `Access denied`: MySQL 사용자 권한 확인
- `Unknown database`: carelink 데이터베이스 생성 확인
- `Table doesn't exist`: schema-image-attachments.sql 실행 필요

### **이미지 업로드 오류**
- `업로드 디렉토리 없음`: C:/carelink-uploads/ 디렉토리 생성
- `WebP 변환 실패`: thumbnailator, imageio-webp 라이브러리 확인
- `파일 크기 초과`: 5MB 제한 확인

## 📞 추가 지원이 필요한 경우

1. **환경 설정 관련**: SETUP_GUIDE.md 참조
2. **데이터베이스 설정**: schema-image-attachments.sql 실행
3. **기능 테스트**: 위 테스트 항목들 순차적 확인

## 🎉 성공적으로 실행되면 확인할 수 있는 것들

- ✅ 드래그 앤 드롭 이미지 업로드 UI
- ✅ 실시간 이미지 미리보기
- ✅ WebP 자동 변환 및 용량 절약
- ✅ 다중 썸네일 생성
- ✅ SEO 최적화를 위한 alt text
- ✅ 반응형 업로드 인터페이스

---

**💡 팁**: Windows 환경에서 먼저 테스트한 후, 필요시 WSL 환경 구축을 진행하는 것을 권장합니다.