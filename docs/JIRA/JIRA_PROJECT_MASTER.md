# 🏥 라이트케어(LightCare) 프로젝트 - JIRA 마스터 문서

## 📋 프로젝트 개요

### 🎯 프로젝트 비전
요양원과 구직자를 연결하는 플랫폼을 통해 고령화 사회의 요양 서비스 접근성을 향상시키고, 요양 업계의 인력 매칭 효율성을 극대화한다.

### 🏷️ 프로젝트 기본 정보
- **프로젝트명**: 라이트케어 (LightCare)
- **프로젝트 유형**: 요양원 구인구직 사이트
- **개발 기간**: 3주 (집중 개발 기간)
- **팀 구성**: 4명 (비전공 입문자 팀)
- **개발 방식**: 애자일 스크럼 기법 적용

### 🎪 주요 기능
1. **회원 관리 시스템** - 로그인, 회원가입, 프로필 관리
2. **시설 검색 및 지도 서비스** - 요양시설 검색, 카카오맵 연동
3. **구인구직 게시판** - 채용공고 등록/검색, 지원 관리
4. **리뷰 및 정보 게시판** - 시설 리뷰, 정보 공유 커뮤니티

## 👥 팀 구성 및 역할

### 팀 구조
```
라이트케어 개발팀 (4명)
├── 팀원 A - 회원 관리 담당 (로그인/회원가입/내정보)
├── 팀원 B - 시설 검색 담당 (검색/지도/시설상세)
├── 팀원 C - 구인구직 담당 (채용공고/지원관리)
└── 팀원 D - 리뷰/게시판 담당 (리뷰시스템/커뮤니티)
```

### 협업 방식
- **기능 단위 협업**: 각 팀원이 Controller-Service-DAO-View 전체 스택 담당
- **Git 워크플로우**: Feature Branch 전략 사용
- **코드 리뷰**: Pull Request 기반 상호 검토
- **커뮤니케이션**: 데일리 스탠드업, 스프린트 회고

## 🛠 기술 스택

### Backend
- **Framework**: Spring Boot 2.7.18
- **ORM**: MyBatis 2.3.1
- **Database**: MySQL 8.0
- **Build Tool**: Gradle 7.6
- **Java Version**: Java 11

### Frontend
- **Template Engine**: Thymeleaf
- **CSS Framework**: Bootstrap 5
- **JavaScript**: Vanilla JS + jQuery
- **Icons**: Font Awesome

### Infrastructure & Tools
- **IDE**: IntelliJ IDEA
- **Version Control**: Git/GitHub
- **Database Tool**: MySQL Workbench
- **API**: Kakao Maps API

### Development Environment
- **Server Port**: 8080
- **Database**: carelink (UTF8MB4)
- **Hot Reload**: Spring Boot DevTools 적용

## 🗂 프로젝트 아키텍처

### 패키지 구조
```
com.example.carelink/
├── controller/          # 웹 요청 처리 계층
├── service/            # 비즈니스 로직 계층
├── dao/               # 데이터 접근 계층 (MyBatis)
├── dto/               # 데이터 전송 객체
└── common/            # 공통 유틸리티 및 상수
```

### 데이터베이스 설계
- **member**: 회원 정보 (20개 컬럼)
- **facility**: 시설 정보 (25개 컬럼, 위경도 포함)
- **job_posting**: 구인구직 게시글 (35개 컬럼)
- **review**: 시설 리뷰 (20개 컬럼, 평점 시스템)
- **board**: 정보 게시판 (25개 컴럼, 계층형 구조)

## 📅 개발 로드맵

### Phase 1: 기초 설정 및 환경 구축 ✅
- [x] 프로젝트 초기 설정 완료
- [x] 데이터베이스 스키마 생성 완료
- [x] 공통 클래스 및 레이아웃 구현 완료
- [x] 모든 기본 페이지 템플릿 생성 완료

### Phase 2: 핵심 기능 구현 (현재 진행 중)
- **Sprint 1** (1주차): 회원 관리 + 기본 네비게이션
- **Sprint 2** (2주차): 시설 검색 + 지도 연동
- **Sprint 3** (3주차): 구인구직 게시판 완성

### Phase 3: 고도화 및 통합 (예정)
- 리뷰 시스템 구현
- 정보 게시판 구현  
- 통합 테스트 및 버그 수정

### Phase 4: 배포 및 운영 (예정)
- 성능 최적화
- 보안 강화
- 사용자 피드백 반영

## 🎯 성공 지표 (KPI)

### 기술적 목표
- 모든 CRUD 기능 정상 동작
- 반응형 웹 디자인 적용
- API 응답 시간 3초 이내
- 동시 접속자 100명 처리 가능

### 학습 목표
- 각 팀원이 풀스택 개발 경험 습득
- 애자일 방법론 실무 적용 경험
- 팀 협업 및 코드 리뷰 문화 체험
- Git/GitHub를 활용한 버전 관리 숙련

## 🔗 관련 문서
- [팀 협업 가이드](TEAM_GUIDE.md)
- [기술 문서](CLAUDE.md)
- [애자일 활용 가이드](지라애자일활용.md)
- [프로젝트 README](README.md)

## 📞 연락처 및 리소스
- **GitHub Repository**: [라이트케어 프로젝트]
- **개발 서버**: http://localhost:8080
- **데이터베이스**: MySQL (carelink)
- **API 문서**: 개발 완료 후 Swagger 적용 예정

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

---
*이 문서는 JIRA 프로젝트 생성 및 백로그 관리를 위한 마스터 문서입니다.*
*최종 업데이트: 2024년* 