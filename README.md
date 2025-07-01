# LightCare (라이트케어) - 요양원 구인구직 플랫폼

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-2.7.18-brightgreen.svg)
![Java](https://img.shields.io/badge/Java-11-orange.svg)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)
![MyBatis](https://img.shields.io/badge/MyBatis-2.3.1-red.svg)
![Build Status](https://img.shields.io/badge/Build-Passing-success.svg)

## 📖 프로젝트 개요

LightCare는 한국의 요양원 및 노인요양시설과 구직자를 연결하는 전문 구인구직 플랫폼입니다. 고령화 사회에 필요한 요양 서비스 인력을 효율적으로 매칭하고, 시설과 근로자 모두에게 최적화된 환경을 제공합니다.

### 🎯 주요 기능

- **👥 회원 관리**: 구직자 및 시설 관리자 회원가입/로그인
- **🏥 시설 검색**: 카카오맵 연동 시설 위치 검색 및 상세 정보
- **💼 구인구직**: 채용공고 등록/검색, 지원 시스템
- **⭐ 리뷰 시스템**: 시설 평가 및 후기 공유
- **📋 정보 게시판**: 업계 정보 및 공지사항

## 🛠 기술 스택

### Backend
- **Framework**: Spring Boot 2.7.18
- **Language**: Java 11
- **Database**: MySQL 8.0
- **ORM**: MyBatis 2.3.1
- **Build Tool**: Gradle
- **Template Engine**: Thymeleaf

### Frontend
- **Template**: Thymeleaf
- **Styling**: Bootstrap 5, CSS3
- **JavaScript**: Vanilla JS
- **Maps**: Kakao Maps API

### Development Tools
- **IDE**: IntelliJ IDEA
- **Version Control**: Git/GitHub
- **Database Tool**: MySQL Workbench

## 🚀 빠른 시작

### 사전 요구사항

- Java 11 이상
- MySQL 8.0 이상
- Git

### 설치 및 실행

1. **레포지토리 클론**
   ```bash
   git clone https://github.com/dooseob/lightcare.git
   cd lightcare
   ```

2. **데이터베이스 설정**
   ```sql
   CREATE DATABASE carelink CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. **데이터베이스 연결 설정** (`src/main/resources/application.yml`)
   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/carelink
       username: root
       password: mysql
   ```

4. **스키마 초기화**
   ```bash
   # MySQL에서 schema.sql 실행
   mysql -u root -p carelink < src/main/resources/schema.sql
   ```

5. **애플리케이션 실행**
   ```bash
   ./gradlew bootRun
   ```

6. **브라우저에서 접속**
   ```
   http://localhost:8080
   ```

## 📁 프로젝트 구조

```
src/
├── main/
│   ├── java/com/example/carelink/
│   │   ├── controller/          # 웹 요청 처리
│   │   │   ├── HomeController.java
│   │   │   ├── MemberController.java
│   │   │   ├── FacilityController.java
│   │   │   ├── JobController.java
│   │   │   ├── ReviewController.java
│   │   │   └── BoardController.java
│   │   ├── service/             # 비즈니스 로직
│   │   │   ├── MemberService.java
│   │   │   ├── FacilityService.java
│   │   │   ├── JobService.java
│   │   │   ├── ReviewService.java
│   │   │   └── BoardService.java
│   │   ├── dao/                 # 데이터 접근 계층
│   │   │   ├── MemberMapper.java
│   │   │   ├── FacilityMapper.java
│   │   │   ├── JobMapper.java
│   │   │   ├── ReviewMapper.java
│   │   │   └── BoardMapper.java
│   │   ├── dto/                 # 데이터 전송 객체
│   │   │   ├── MemberDTO.java
│   │   │   ├── FacilityDTO.java
│   │   │   ├── JobDTO.java
│   │   │   ├── ReviewDTO.java
│   │   │   └── BoardDTO.java
│   │   └── common/              # 공통 유틸리티
│   │       ├── BaseDTO.java
│   │       ├── PageInfo.java
│   │       └── Constants.java
│   └── resources/
│       ├── static/              # 정적 리소스
│       │   ├── css/
│       │   └── js/
│       ├── templates/           # Thymeleaf 템플릿
│       │   ├── layout/
│       │   ├── member/
│       │   ├── facility/
│       │   ├── job/
│       │   ├── review/
│       │   └── board/
│       ├── mapper/              # MyBatis SQL 매퍼
│       │   ├── memberMapper.xml
│       │   ├── facilityMapper.xml
│       │   ├── jobMapper.xml
│       │   ├── reviewMapper.xml
│       │   └── boardMapper.xml
│       ├── application.yml      # 애플리케이션 설정
│       ├── mybatis-config.xml   # MyBatis 설정
│       └── schema.sql          # 데이터베이스 스키마
```

## 👥 팀 구성 및 역할

| 팀원 | 담당 기능 | 주요 구현 사항 |
|------|----------|---------------|
| **팀원 A** | 회원 관리 | 로그인, 회원가입, 프로필 관리, 세션 관리 |
| **팀원 B** | 시설 검색 | 카카오맵 연동, 시설 정보 관리, 위치 기반 검색 |
| **팀원 C** | 구인구직 | 채용공고 게시판, 지원 시스템, 채용 관리 |
| **팀원 D** | 리뷰 & 게시판 | 시설 리뷰, 평점 시스템, 정보 게시판 |

## 🗄 데이터베이스 설계

### 주요 테이블

- **member**: 회원 정보 (구직자, 시설 관리자)
- **facility**: 요양시설 정보 및 위치 데이터
- **job_posting**: 채용공고 정보
- **review**: 시설 리뷰 및 평점
- **board**: 정보 게시판

### ERD
```sql
-- 주요 테이블 관계
-- member (1) ←→ (N) job_posting
-- member (1) ←→ (N) review
-- facility (1) ←→ (N) job_posting
-- facility (1) ←→ (N) review
```

## 🔧 개발 가이드

### 코딩 컨벤션

- **클래스명**: PascalCase (`MemberController`)
- **메서드명**: camelCase (`getMemberInfo`)
- **상수**: UPPER_SNAKE_CASE (`DEFAULT_PAGE_SIZE`)
- **패키지명**: 소문자 (`com.example.carelink`)

### Git 브랜치 전략

```
main                 # 메인 브랜치
├── feature/member   # 팀원 A - 회원 관리
├── feature/facility # 팀원 B - 시설 검색
├── feature/job      # 팀원 C - 구인구직
└── feature/review   # 팀원 D - 리뷰 시스템
```

### 커밋 메시지 형식

```
[feat] 새로운 기능 추가
[fix] 버그 수정
[docs] 문서 수정
[style] 코드 스타일 수정
[refactor] 코드 리팩토링
[test] 테스트 코드 추가
```

## 🧪 테스트

```bash
# 전체 테스트 실행
./gradlew test

# 빌드 및 테스트
./gradlew build

# 코드 품질 검사
./gradlew check
```

## 📝 API 문서

### 주요 엔드포인트

| Method | URL | 설명 |
|--------|-----|------|
| GET | `/` | 메인 페이지 |
| GET/POST | `/member/login` | 로그인 |
| GET/POST | `/member/join` | 회원가입 |
| GET | `/facility/search` | 시설 검색 |
| GET | `/job/list` | 채용공고 목록 |
| GET | `/review/list` | 리뷰 목록 |
| GET | `/board/list` | 게시판 목록 |

## 🐛 트러블슈팅

### 자주 발생하는 문제

1. **데이터베이스 연결 오류**
   ```
   해결: application.yml의 데이터베이스 설정 확인
   ```

2. **MyBatis 매퍼 오류**
   ```
   해결: mapper XML의 namespace와 인터페이스 경로 일치 확인
   ```

3. **Thymeleaf 템플릿 오류**
   ```
   해결: templates 폴더 경로와 컨트롤러 반환값 일치 확인
   ```

## 🔄 최근 업데이트

### v1.0.0 (2025-06-22)
- ✅ 프로젝트 기본 구조 완성
- ✅ 전체 파일 에러 디버깅 완료
- ✅ 페이징 로직 오류 수정
- ✅ Gradle 빌드 설정 개선
- ✅ 코드 품질 개선 (NPE 방지, 중복 코드 제거)

## 🚀 향후 개발 계획

- [ ] **v1.1**: 보안 강화 (비밀번호 암호화, CSRF 보호)
- [ ] **v1.2**: 카카오맵 API 연동 완성
- [ ] **v1.3**: 실시간 알림 시스템
- [ ] **v1.4**: 모바일 반응형 UI 개선
- [ ] **v2.0**: AI 기반 매칭 시스템

## 🤝 기여 방법

1. Fork 프로젝트
2. Feature 브랜치 생성 (`git checkout -b feature/새기능`)
3. 변경사항 커밋 (`git commit -m '[feat] 새기능 추가'`)
4. 브랜치에 Push (`git push origin feature/새기능`)
5. Pull Request 생성

## 📞 지원

- **팀 이메일**: lightcare-team@gmail.com
- **이슈 트래킹**: [GitHub Issues](https://github.com/dooseob/lightcare/issues)
- **위키**: [프로젝트 위키](https://github.com/dooseob/lightcare/wiki)

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

**LightCare 팀** - 요양 서비스의 미래를 밝히는 플랫폼 💡

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