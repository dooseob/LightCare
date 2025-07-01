# CLAUDE.md

이 문서는 이 저장소에서 Claude Code (claude.ai/code)가 코드를 다룰 때 참고할 가이드입니다.

---

## 📌 프로젝트 개요

이 프로젝트는 한국 팀원 4명이 개발하는 \*\*요양원 구인구직 웹사이트 "라이트케어(LightCare)"\*\*입니다. 이 플랫폼은 요양 시설과 요양업계 구직자를 연결해주는 서비스입니다.

---

## 🛠 기술 스택

* **백엔드**: Spring Boot 2.7.18, MyBatis, MySQL
* **프론트엔드**: Thymeleaf 템플릿, Bootstrap 5, JavaScript
* **빌드 도구**: Gradle (Java 11 사용)
* **데이터베이스**: MySQL (문자 인코딩 utf8mb4)

---

## ⚙️ 공통 개발 명령어

### 빌드 및 실행

```bash
# 프로젝트 빌드
./gradlew build

# 애플리케이션 실행
./gradlew bootRun

# 빌드 결과물 정리
./gradlew clean

# 테스트 실행
./gradlew test

# 코드 품질 검사
./gradlew check
```

### 데이터베이스 설정

```bash
# MySQL 접속 및 DB 생성
mysql -u root -p
CREATE DATABASE carelink CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 스키마 초기화
# src/main/resources/schema.sql 파일을 MySQL에서 실행
```

### 개발 서버 정보

* 실행 주소: `http://localhost:8080`
* DB 연결 주소: `jdbc:mysql://localhost:3306/carelink`
* DevTools를 통한 핫 리로드(Hot Reload) 적용됨

---

## 🧱 아키텍처 개요

### 팀 구조 (4인 협업)

기능 중심의 분업 구조로 운영됩니다:

* **팀원 A**: 회원 관리 (로그인, 회원가입, 내 정보)
* **팀원 B**: 시설 검색 및 지도 연동 (카카오맵)
* **팀원 C**: 구인구직 게시판 (공고 작성, 지원)
* **팀원 D**: 리뷰 시스템 및 정보 게시판

### 패키지 구조

```
com.example.carelink/
├── controller/          # 컨트롤러 계층
├── service/            # 서비스 계층 (비즈니스 로직)
├── dao/               # DAO 계층 (MyBatis 매퍼)
├── dto/               # DTO 객체
└── common/            # 공통 유틸 및 상수
```

### 데이터베이스 설계

관계형 테이블 기반으로 외래키(FK)를 적절히 사용:

* **member**: 사용자 계정 및 인증 정보
* **facility**: 요양시설 정보 (위치 좌표 포함)
* **job\_posting**: 구인공고 정보
* **review**: 시설 리뷰 및 평점
* **board**: 커뮤니티/정보 게시판

### MyBatis 구성

* 설정 파일: `src/main/resources/mybatis-config.xml`
* 매퍼 XML: `src/main/resources/mapper/*.xml`
* camelCase → underscore 자동 매핑 설정
* DTO용 typeAlias 사용

---

## 🎨 프론트엔드 구조

* **Thymeleaf**: Spring Boot 연동 서버사이드 템플릿
* **레이아웃 시스템**: `templates/layout/` 폴더에 header/footer 분리
* **정적 리소스**: `src/main/resources/static/` 폴더에 CSS/JS 저장
* **Bootstrap 5**: 반응형 UI 프레임워크 적용

---

## 🧾 주요 설정 파일

### application.yml

* 서버 포트: 8080
* 데이터베이스 연결 정보
* 개발 시 Thymeleaf 캐시 비활성화
* 파일 업로드 최대 용량 10MB
* MyBatis 매퍼 위치 지정

### 기타 설정 사항

* UTF-8 한글 지원 활성화
* MyBatis 및 Spring Web 로그 출력 설정
* DB 타임존: Asia/Seoul

---

## 🔄 개발 패턴

### 컨트롤러 패턴

Spring MVC 구조를 따름:

* `@Controller` 사용
* Model로 View 데이터 전달
* HTTP Method (@GetMapping, @PostMapping 등) 명확히 구분
* `@Slf4j`로 로깅

### 서비스 계층

컨트롤러와 로직 분리:

* 트랜잭션 처리
* 입력 검증
* 횡단 관심사 관리

### MyBatis 매퍼

XML 기반 SQL 정의:

* `#{}` 사용한 파라미터 바인딩
* DTO 매핑 설정
* JOIN 활용한 복합 조회 처리

---

## ✅ 테스트

### 테스트 구조

* 단위 테스트: JUnit 5
* 통합 테스트: Spring Boot Test
* 테스트 설정은 운영과 별도 구성

### 테스트 명령어

```bash
# 전체 테스트 실행
./gradlew test

# 특정 클래스만 실행
./gradlew test --tests "ClassName"
```

---

## 🤝 팀 협업 규칙

### Git 워크플로우

* 기능 브랜치 명: `feature/member-기능명`
* 커밋 메시지: `[feat] 기능 설명`
* PR을 통한 코드 리뷰 진행

### 코드 컨벤션

* 클래스명: PascalCase
* 메서드명: camelCase
* 상수명: UPPER\_SNAKE\_CASE
* 패키지명: 모두 소문자

---

## ⚠️ 특이 사항

### 한글 지원

* 모든 텍스트 콘텐츠는 한글로 작성
* UTF-8 인코딩 유지
* 주석/문서도 한글 기반

### 지도 연동

* 카카오맵 API 연동 예정
* 위도/경도 기반 시설 검색 기능 포함

### 사용자 역할

* `USER`: 일반 구직자
* `FACILITY`: 요양시설 관리자
* `ADMIN`: 시스템 관리자

---

## 🌐 환경 변수

환경 설정 시 아래 항목 필요:

* `spring.datasource.password`: MySQL 비밀번호
* DB 주소가 다를 경우 `spring.datasource.url` 수정
* 추후 지도 API 키 등록 필요 (예정)

### 🟢 팀원 D (리뷰/게시판) - 진행률: 100%

#### ✅ **완료된 작업**
**백엔드 완전 구현**:
- ✅ `ReviewService.java` (238줄) - **완전 구현**
  - 리뷰 CRUD 로직
  - 트랜잭션 처리
  - 로깅 추가
  - 유효성 검증
  - 평점 시스템
  - 추천/비추천 기능

- ✅ `BoardService.java` (253줄) - **완전 구현**
  - 게시글 CRUD 로직
  - 페이징 처리
  - 검색 및 카테고리 필터링
  - 인기 게시글 기능
  - 조회수 증가 로직

- ✅ `ReviewMapper.java` & `reviewMapper.xml` - **완전 구현**
  - 모든 필요 메서드 정의
  - XML 쿼리 매핑 완료

- ✅ `BoardMapper.java` & `boardMapper.xml` - **완전 구현**
  - 모든 필요 메서드 정의
  - XML 쿼리 매핑 완료

**프론트엔드 완성**:
- ✅ `templates/review/list.html` (108줄) - **완전 구현**
- ✅ `templates/review/write.html` (122줄) - **완전 구현**
- ✅ `templates/board/list.html` - **완전 구현**
- ✅ `templates/board/write.html` - **완전 구현**
- ✅ `templates/board/detail.html` - **완전 구현**

#### 📊 **실제 Story Point 달성률**
- **완료**: LC-010 (리뷰 작성) - 13/13 SP ✅
- **완료**: LC-011 (리뷰 목록 관리) - 13/13 SP ✅
- **완료**: LC-012 (정보 게시판) - 13/13 SP ✅

**총 달성**: 39/39 SP (100%)

#### 🚀 **다음 단계**
1. **단위 테스트 작성**
   - ReviewService 테스트
   - BoardService 테스트
   - 통합 테스트

2. **성능 최적화**
   - 쿼리 최적화
   - 캐싱 적용
   - N+1 문제 해결

3. **추가 기능 개발**
   - 댓글 시스템 고도화
   - 파일 첨부 기능
   - 에디터 기능 강화
