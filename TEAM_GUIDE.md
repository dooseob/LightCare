# 🏥 라이트케어 팀 프로젝트 협업 가이드

## 📋 프로젝트 개요
요양원 구인구직 사이트 팀 프로젝트로, 4명의 팀원이 각각 다른 기능을 담당하여 개발합니다.

### 🛠 기술 스택
- **Backend**: Spring Boot 2.7.18, MyBatis, MySQL
- **Frontend**: Thymeleaf, Bootstrap 5, Font Awesome
- **Build Tool**: Gradle
- **IDE**: IntelliJ IDEA 권장

## 👥 팀원별 담당 기능

### 팀원 A: 회원 관리 (기본 틀 완료)
**담당 기능**: 로그인, 회원가입, 내정보 관리
**구현 파일들**:
- `MemberController.java` ✅
- `MemberService.java` ✅  
- `MemberMapper.java` ✅
- `memberMapper.xml` ✅
- `templates/member/login.html` ✅

### 팀원 B: 시설 검색 및 지도 (기본 틀 완료)
**담당 기능**: 시설 검색, 지도 표시, 시설 상세보기
**구현 파일들**:
- `FacilityController.java` ✅ 
- `FacilityService.java` ✅
- `FacilityMapper.java` ✅
- `facilityMapper.xml` ✅
- `templates/facility/search.html` ✅
- `templates/facility/detail.html` ✅

**주요 페이지**:
- `/facility/search` - 시설 검색 및 지도 표시
- `/facility/detail/{id}` - 시설 상세 정보

### 팀원 C: 구인구직 게시판 (기본 틀 완료)
**담당 기능**: 구인구직 목록, 등록, 상세보기, 검색
**구현 파일들**:
- `JobController.java` ✅
- `JobService.java` ✅  
- `JobMapper.java` ✅
- `jobMapper.xml` (구현 예정)
- `templates/job/list.html` ✅
- `templates/job/write.html` ✅
- `templates/job/detail.html` ✅

**주요 페이지**:
- `/job` - 구인구직 목록
- `/job/write` - 구인 등록
- `/job/detail/{id}` - 구인구직 상세보기

### 팀원 D: 리뷰 및 정보 게시판 (기본 틀 완료)
**담당 기능**: 시설 리뷰, 정보 게시판, 댓글 시스템
**구현 파일들**:
- `ReviewController.java` ✅
- `BoardController.java` ✅
- `ReviewService.java` ✅
- `BoardService.java` ✅
- `ReviewMapper.java` ✅
- `BoardMapper.java` ✅
- `reviewMapper.xml` (구현 예정)
- `boardMapper.xml` (구현 예정)
- `templates/review/list.html` ✅
- `templates/review/write.html` ✅
- `templates/board/list.html` ✅
- `templates/board/write.html` ✅
- `templates/board/detail.html` ✅

**주요 페이지**:
- `/review` - 시설 리뷰 목록
- `/review/write` - 리뷰 작성
- `/board` - 정보 게시판 목록
- `/board/write` - 게시글 작성
- `/board/detail/{id}` - 게시글 상세보기

## 🚀 개발환경 설정

### 1. Git 프로젝트 클론
```bash
# Git 프로젝트 클론
git clone https://github.com/dooseob/LightCare
cd lightcare

# 브랜치 확인 및 생성
git branch
git checkout -b feature/팀원이름-기능명
```

### 2. IntelliJ IDEA 설정
1. IntelliJ IDEA에서 `Open` → 프로젝트 폴더 선택
2. Gradle 프로젝트로 인식되면 자동으로 의존성 다운로드
3. `src/main/java/com/example/carelink/CarelinkApplication.java` 실행

### 3. 데이터베이스 설정
```sql
-- MySQL 데이터베이스 생성
CREATE DATABASE carelink CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 사용자 생성 (선택사항)
CREATE USER 'carelink'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON carelink.* TO 'carelink'@'localhost';
```

### 4. application.yml 수정
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/carelink
    username: root
    password: mysql
```

### 5. 테이블 생성 및 샘플 데이터
- `schema.sql` 파일 실행하여 테이블 생성
- 테스트 계정: admin/admin123, user01/user123

## 📁 프로젝트 구조

```
src/main/
├── java/com/example/carelink/
│   ├── CarelinkApplication.java          # 메인 애플리케이션
│   ├── common/                           # 공통 클래스
│   │   ├── Constants.java               # 상수 정의
│   │   ├── BaseDTO.java                # 기본 DTO
│   │   └── PageInfo.java               # 페이징 정보
│   ├── controller/                      # 컨트롤러
│   │   ├── HomeController.java         # 메인 페이지
│   │   ├── MemberController.java       # 팀원 A
│   │   ├── FacilityController.java     # 팀원 B
│   │   ├── JobController.java          # 팀원 C
│   │   ├── ReviewController.java       # 팀원 D
│   │   └── BoardController.java        # 팀원 D
│   ├── service/                        # 서비스 계층
│   ├── dao/                           # 데이터 액세스 계층
│   └── dto/                           # 데이터 전송 객체
└── resources/
    ├── application.yml                 # 설정 파일
    ├── schema.sql                     # 데이터베이스 스키마
    ├── mapper/                        # MyBatis 매퍼
    ├── static/                        # 정적 리소스
    │   ├── css/common.css            # 공통 스타일
    │   └── js/common.js              # 공통 JavaScript
    └── templates/                     # Thymeleaf 템플릿
        ├── layout/                   # 공통 레이아웃
        ├── member/                   # 팀원 A
        ├── facility/                 # 팀원 B
        ├── job/                      # 팀원 C
        ├── review/                   # 팀원 D
        └── board/                    # 팀원 D
```

## 🎯 개발 진행 순서

### Phase 1: 기본 설정 및 환경 구축 ✅
- [x] 프로젝트 초기 설정
- [x] 데이터베이스 스키마 생성
- [x] 공통 클래스 및 레이아웃 구현
- [x] 모든 기본 페이지 틀 생성

### Phase 2: 각 팀원별 기능 구현 (현재 단계)
각 팀원이 담당 기능의 상세 구현을 진행합니다.

**팀원 B 구현 항목**:
- [ ] 카카오맵 API 연동
- [ ] 시설 검색 필터 기능
- [ ] 지도 마커 표시 및 클릭 이벤트
- [ ] 실제 데이터베이스 연동

**팀원 C 구현 항목**:
- [ ] `jobMapper.xml` 구현
- [ ] 구인구직 CRUD 기능
- [ ] 검색 및 필터링 기능
- [ ] 페이징 처리

**팀원 D 구현 항목**:
- [ ] `reviewMapper.xml`, `boardMapper.xml` 구현
- [ ] 리뷰 및 게시판 CRUD 기능
- [ ] 댓글 시스템 구현
- [ ] 평점 시스템 구현

### Phase 3: 통합 및 테스트
- [ ] 팀원별 기능 통합
- [ ] 전체 시스템 테스트
- [ ] UI/UX 개선
- [ ] 버그 수정

### Phase 4: 배포 및 최종 점검
- [ ] 배포 환경 구축
- [ ] 성능 최적화
- [ ] 문서화 완료

## 💻 코딩 컨벤션

### Java 코딩 스타일
```java
// 클래스명: PascalCase
public class MemberController {
    
    // 메서드명: camelCase
    public String loginPage() {
        // 로직 구현
    }
    
    // 상수: UPPER_SNAKE_CASE
    private static final String LOGIN_SUCCESS = "login_success";
}
```

### 패키지 및 파일 명명 규칙
- **Controller**: `동사 + Controller` (예: MemberController)
- **Service**: `명사 + Service` (예: MemberService)  
- **DTO**: `명사 + DTO` (예: MemberDTO)
- **Mapper**: `명사 + Mapper` (예: MemberMapper)

### 주석 작성 규칙
```java
/**
 * 회원 로그인 처리
 * @param loginDTO 로그인 정보
 * @return 로그인 결과 페이지
 */
public String login(LoginDTO loginDTO) {
    // TODO: 팀원 A가 로그인 로직 구현
    return "redirect:/";
}
```

## 🔄 Git 협업 규칙

### 브랜치 전략
```bash
# 기본 브랜치
main                    # 메인 브랜치 (배포용)

# 기능별 브랜치
feature/member-login    # 팀원 A
feature/facility-map    # 팀원 B  
feature/job-board      # 팀원 C
feature/review-system  # 팀원 D
```

### 커밋 메시지 규칙
```bash
# 형식: [타입] 제목
[feat] 회원 로그인 기능 구현
[fix] 로그인 에러 수정
[docs] README 업데이트
[style] 코드 포맷팅
[refactor] 코드 리팩토링
[test] 테스트 코드 추가
```

### 작업 흐름
```bash
# 1. 최신 코드 받기
git checkout main
git pull origin main

# 2. 브랜치 생성 및 이동
git checkout -b feature/기능명

# 3. 작업 후 커밋
git add .
git commit -m "[feat] 기능 구현"

# 4. 원격 저장소에 푸시
git push origin feature/기능명

# 5. Pull Request 생성
# GitHub에서 PR 생성 후 팀원들 리뷰 요청
```

## 🔧 각 팀원별 세부 구현 가이드

### 팀원 B: 시설 검색 및 지도
**주요 작업**:
1. **카카오맵 API 연동**
   ```javascript
   // 지도 초기화 코드 예시
   const mapContainer = document.getElementById('map');
   const mapOption = {
       center: new kakao.maps.LatLng(37.566826, 126.9786567),
       level: 3
   };
   const map = new kakao.maps.Map(mapContainer, mapOption);
   ```

2. **시설 검색 기능 구현**
   - `FacilityService.searchFacilities()` 메서드 완성
   - 검색 조건에 따른 필터링 로직
   - 페이징 처리

### 팀원 C: 구인구직 게시판
**주요 작업**:
1. **MyBatis 매퍼 구현**
   ```xml
   <!-- jobMapper.xml 예시 -->
   <select id="getJobList" resultMap="JobResultMap">
       SELECT * FROM job_posting 
       WHERE is_deleted = 0
       <if test="keyword != null and keyword != ''">
           AND (title LIKE CONCAT('%', #{keyword}, '%') 
           OR company_name LIKE CONCAT('%', #{keyword}, '%'))
       </if>
       ORDER BY created_at DESC
   </select>
   ```

2. **검색 및 필터링 기능**
   - 키워드 검색
   - 직종별 필터링
   - 지역별 필터링

### 팀원 D: 리뷰 및 게시판
**주요 작업**:
1. **리뷰 시스템 구현**
   - 평점 기능 (1-5점)
   - 시설별 평균 평점 계산
   - 리뷰 추천 기능

2. **댓글 시스템 구현**
   - 댓글 CRUD 기능
   - 대댓글 기능 (선택사항)
   - 댓글 좋아요 기능

## 🔍 디버깅 및 문제 해결

### 자주 발생하는 문제들

1. **포트 충돌 에러**
   ```bash
   # 해결방법: application.yml에서 포트 변경
   server:
     port: 8081
   ```

2. **데이터베이스 연결 에러**
   ```bash
   # MySQL 서비스 확인
   sudo service mysql status
   sudo service mysql start
   ```

3. **Thymeleaf 템플릿 에러**
   ```html
   <!-- 올바른 문법 사용 -->
   <div th:text="${member.name}">이름</div>
   <div th:if="${member != null}">내용</div>
   ```

### 개발 도구 및 팁

1. **IntelliJ IDEA 유용한 플러그인**
   - MyBatis Tools
   - Thymeleaf Support
   - GitToolBox

2. **브라우저 개발자 도구 활용**
   - Console에서 JavaScript 에러 확인
   - Network 탭에서 API 호출 확인
   - Elements 탭에서 CSS 수정 테스트

## 📞 소통 및 협업

### 정기 미팅
- **매주 월요일 오후 2시**: 진행상황 공유 및 이슈 논의
- **매주 금요일 오후 4시**: 주간 결과물 리뷰

### 소통 채널
- **카카오톡 단체방**: 일상적인 소통
- **GitHub Issues**: 기술적 이슈 및 버그 리포트
- **GitHub Discussions**: 기능 개선 아이디어 논의

### 코드 리뷰 원칙
1. **리뷰 요청**: PR 생성 후 24시간 내 리뷰
2. **건설적 피드백**: 개선점 제시 시 대안도 함께 제안
3. **빠른 수정**: 리뷰 의견 반영 후 즉시 업데이트

## 📚 참고 자료

### 기술 문서
- [Spring Boot 공식 문서](https://spring.io/projects/spring-boot)
- [MyBatis 공식 문서](https://mybatis.org/mybatis-3/)
- [Thymeleaf 공식 문서](https://www.thymeleaf.org/)
- [Bootstrap 5 문서](https://getbootstrap.com/)

### API 문서
- [카카오맵 API](https://apis.map.kakao.com/)
- [Font Awesome 아이콘](https://fontawesome.com/)

---

**🎯 목표**: 실무에서 사용할 수 있는 수준의 완성도 높은 웹 애플리케이션 개발
**⏰ 일정**: 4주 개발 기간
**🏆 성과**: 포트폴리오 수준의 프로젝트 완성

---
*본 가이드는 팀 프로젝트 진행 상황에 따라 지속적으로 업데이트됩니다.* 