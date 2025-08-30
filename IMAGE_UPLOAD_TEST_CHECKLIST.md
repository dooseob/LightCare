# 🧪 이미지 업로드 기능 테스트 체크리스트

## 📋 테스트 준비사항

### ✅ 사전 준비
- [ ] Java 11+ 설치 확인 (`java -version`)
- [ ] MySQL 서버 실행 상태 확인
- [ ] 데이터베이스 스키마 적용 (`schema-image-attachments.sql`)
- [ ] 업로드 디렉토리 생성 (`setup-directories.bat` 실행)
- [ ] Spring Boot 애플리케이션 실행 (`quick-test.bat` 또는 `gradlew.bat bootRun`)

---

## 🎯 게시글 이미지 업로드 테스트

### URL: `http://localhost:8080/board/write`

#### 기본 업로드 기능
- [ ] **드래그 앤 드롭**: 이미지 파일을 드래그해서 업로드 영역에 드롭
- [ ] **파일 선택**: 업로드 영역 클릭 → 파일 선택 대화상자 → 이미지 선택
- [ ] **다중 선택**: Ctrl 키를 누르고 여러 이미지 동시 선택
- [ ] **실시간 미리보기**: 선택한 이미지가 즉시 미리보기로 표시됨

#### 제한사항 테스트
- [ ] **파일 개수 제한**: 10개 초과 선택 시 경고 메시지 표시
- [ ] **파일 크기 제한**: 5MB 초과 파일 업로드 시 경고 메시지 표시
- [ ] **파일 형식 제한**: JPG, PNG, GIF, WebP 외 형식 업로드 시 거부

#### UI/UX 테스트
- [ ] **호버 효과**: 업로드 영역에 마우스 올릴 때 색상 변화
- [ ] **드래그오버 효과**: 파일 드래그 중 영역 강조 표시
- [ ] **이미지 카운터**: 우하단에 "현재개수/10개" 표시
- [ ] **개별 삭제**: 각 이미지의 X 버튼으로 개별 삭제 가능
- [ ] **alt text 입력**: 각 이미지마다 설명 텍스트 입력 가능

#### 백엔드 연동 테스트
- [ ] **게시글 작성**: 이미지와 함께 게시글 정상 등록
- [ ] **데이터베이스 저장**: `board_images` 테이블에 이미지 정보 저장 확인
- [ ] **파일 시스템**: `C:/carelink-uploads/board/` 폴더에 파일 저장 확인

---

## ⭐ 리뷰 이미지 업로드 테스트

### URL: `http://localhost:8080/review/write`

#### 기본 업로드 기능
- [ ] **드래그 앤 드롭**: 이미지 파일을 드래그해서 업로드 영역에 드롭
- [ ] **파일 선택**: 업로드 영역 클릭 → 파일 선택 대화상자 → 이미지 선택
- [ ] **다중 선택**: 최대 5개까지 이미지 동시 선택
- [ ] **실시간 미리보기**: 선택한 이미지가 즉시 미리보기로 표시됨

#### 제한사항 테스트
- [ ] **파일 개수 제한**: 5개 초과 선택 시 경고 메시지 표시
- [ ] **파일 크기 제한**: 5MB 초과 파일 업로드 시 경고 메시지 표시
- [ ] **파일 형식 제한**: 이미지 파일만 허용

#### WebP 변환 테스트
- [ ] **자동 변환**: JPG/PNG → WebP 자동 변환
- [ ] **썸네일 생성**: Small(300x200), Medium(600x400), Large(1200x800) 썸네일 생성
- [ ] **폴백 JPG**: 브라우저 호환성을 위한 JPG 폴백 파일 생성
- [ ] **파일 크기 절약**: WebP 변환으로 50-70% 용량 절약 확인

#### 백엔드 연동 테스트
- [ ] **리뷰 작성**: 이미지와 함께 리뷰 정상 등록
- [ ] **데이터베이스 저장**: `review_images` 테이블에 이미지 정보 저장 확인
- [ ] **파일 시스템**: `C:/carelink-uploads/review/` 폴더에 파일 저장 확인

---

## 🔧 AJAX API 테스트 (고급)

### 개발자 도구(F12) 네트워크 탭에서 확인

#### 게시글 이미지 API
- [ ] **POST** `/board/api/upload-images/{boardId}`: 이미지 업로드 API
- [ ] **DELETE** `/board/api/delete-image/{imageId}`: 이미지 삭제 API
- [ ] **응답 상태**: 200 OK (성공), 400/401/403 (오류)
- [ ] **응답 데이터**: JSON 형태로 업로드된 이미지 정보 반환

#### 리뷰 이미지 API
- [ ] **POST** `/review/api/upload-images/{reviewId}`: 이미지 업로드 API
- [ ] **DELETE** `/review/api/delete-image/{imageId}`: 이미지 삭제 API
- [ ] **응답 처리**: 성공/실패 메시지 적절히 표시

---

## 🗄️ 데이터베이스 검증

### `board_images` 테이블 확인
```sql
SELECT * FROM board_images WHERE board_id = [게시글ID];
```
- [ ] `webp_path`: WebP 변환 파일 경로
- [ ] `thumbnail_small/medium/large`: 썸네일 경로들
- [ ] `fallback_jpg_path`: JPG 폴백 경로
- [ ] `alt_text`: 사용자 입력 설명 텍스트
- [ ] `file_size_webp < file_size`: WebP 압축 효과 확인

### `review_images` 테이블 확인
```sql
SELECT * FROM review_images WHERE review_id = [리뷰ID];
```
- [ ] 동일한 구조로 데이터 저장 확인

### 카운트 업데이트 확인
```sql
SELECT board_id, image_count, has_images FROM board WHERE image_count > 0;
SELECT review_id, image_count, has_images FROM review WHERE image_count > 0;
```
- [ ] 트리거로 자동 업데이트되는 카운트 확인

---

## 📱 반응형 테스트

### 다양한 화면 크기에서 테스트
- [ ] **데스크톱** (1920x1080): 정상 표시
- [ ] **태블릿** (768x1024): 레이아웃 조정 확인
- [ ] **모바일** (375x667): 터치 인터페이스 동작 확인

---

## 🐛 오류 상황 테스트

### 예상 오류 상황들
- [ ] **네트워크 오류**: 인터넷 연결 끊김 시 적절한 오류 메시지
- [ ] **서버 오류**: 서버 다운 시 사용자 친화적 오류 처리
- [ ] **권한 오류**: 디렉토리 쓰기 권한 없을 때 오류 처리
- [ ] **디스크 용량 부족**: 충분한 저장 공간이 없을 때 처리

---

## ✅ 테스트 완료 후 확인사항

### 파일 시스템 확인
```
C:/carelink-uploads/
├── board/
│   ├── board_1_0_a1b2c3d4_original.jpg
│   ├── board_1_0_a1b2c3d4.webp
│   ├── board_1_0_a1b2c3d4_small.webp
│   ├── board_1_0_a1b2c3d4_medium.webp
│   └── board_1_0_a1b2c3d4_large.webp
└── review/
    ├── review_1_0_e5f6g7h8_original.jpg
    ├── review_1_0_e5f6g7h8.webp
    ├── review_1_0_e5f6g7h8_small.webp
    ├── review_1_0_e5f6g7h8_medium.webp
    └── review_1_0_e5f6g7h8_large.webp
```

### 성능 확인
- [ ] **페이지 로딩 속도**: WebP 이미지로 빠른 로딩 확인
- [ ] **업로드 속도**: 대용량 이미지의 원활한 업로드
- [ ] **메모리 사용량**: 다중 이미지 처리 시 메모리 누수 없음

---

## 🎉 테스트 성공 기준

모든 체크박스가 ✅로 완료되면 이미지 업로드 기능이 완전히 구현된 것입니다!

### 🚀 추가 개선 아이디어
- [ ] 이미지 순서 변경 (드래그 앤 드롭)
- [ ] 이미지 편집 기능 (크롭, 회전)
- [ ] 진행률 표시 바
- [ ] 이미지 압축 옵션
- [ ] 워터마크 추가
- [ ] 이미지 메타데이터 표시