# 🔍 팀원D 코드 리뷰 - 리뷰 및 게시판 시스템 완전 분석

## 📋 개요
팀원D가 담당한 **리뷰 및 게시판 시스템**의 코드를 초보자도 이해할 수 있도록 상세히 분석한 리뷰입니다.

### 🎯 담당 기능
- **리뷰 시스템**: 시설에 대한 리뷰 작성, 조회, 관리
- **게시판 시스템**: 공지사항, 정보공유, Q&A, FAQ 게시판

### 📊 구현 완료도
- **진행률**: 100% 완료 ✅
- **완료 Story Points**: 39/39 SP
- **품질 수준**: 매우 높음 (상용 서비스 수준)

---

## 🏗️ 전체 구조 분석

### 📁 파일 구조
```
리뷰 시스템:
├── ReviewController.java (542줄) - 웹 요청 처리
├── ReviewService.java (338줄) - 비즈니스 로직
├── ReviewMapper.java - 데이터베이스 연결 인터페이스
├── reviewMapper.xml - SQL 쿼리 정의
├── ReviewDTO.java - 데이터 전송 객체
└── templates/review/ - 웹 페이지 템플릿

게시판 시스템:
├── BoardController.java (508줄) - 웹 요청 처리
├── BoardService.java (523줄) - 비즈니스 로직
├── BoardMapper.java - 데이터베이스 연결 인터페이스
├── boardMapper.xml - SQL 쿼리 정의
├── BoardDTO.java - 데이터 전송 객체
└── templates/board/ - 웹 페이지 템플릿
```

### 🔄 MVC 패턴 적용
```
사용자 요청 → Controller → Service → Mapper → Database
          ↓
    Template ← Model ← Controller
```

---

## 🎯 리뷰 시스템 상세 분석

### 1. ReviewController.java 분석

#### 🔑 핵심 기능들
```java
// 1. 리뷰 목록 조회 (페이징, 검색, 필터 지원)
@GetMapping
public String listPage(Model model, 
                      @RequestParam(defaultValue = "1") int page,
                      @RequestParam(defaultValue = "") String keyword,
                      @RequestParam(required = false) Integer minRating,
                      @RequestParam(required = false) Long facilityId)
```

**초보자를 위한 설명:**
- `@GetMapping`: 웹 브라우저에서 주소를 입력했을 때 실행되는 메소드
- `@RequestParam`: 웹 주소 뒤에 붙는 파라미터들 (예: ?page=1&keyword=좋은시설)
- `Model`: 웹 페이지에 보여줄 데이터를 담는 상자
- `defaultValue`: 파라미터가 없을 때 사용할 기본값

#### 🛡️ 보안 처리
```java
// 로그인 체크 예시
MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
if (loginMember == null) {
    redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
    return "redirect:/member/login";
}
```

**초보자를 위한 설명:**
- `HttpSession`: 사용자가 로그인한 정보를 저장하는 공간
- 로그인하지 않은 사용자는 리뷰 작성 불가
- 보안을 위해 모든 중요한 기능에 로그인 체크 적용

#### 🎯 에러 처리
```java
try {
    // 실제 작업 수행
} catch (Exception e) {
    log.error("리뷰 목록 조회 중 오류 발생", e);
    model.addAttribute("error", "리뷰를 불러오는 중 오류가 발생했습니다");
    return "review/list";
}
```

**초보자를 위한 설명:**
- `try-catch`: 오류가 발생할 수 있는 코드를 안전하게 처리
- 오류 발생 시 사용자에게 친절한 메시지 표시
- 시스템 로그에 자세한 오류 정보 기록

### 2. ReviewService.java 분석

#### 🔍 페이징 처리
```java
public PageInfo<ReviewDTO> getReviewList(int page, String keyword, 
                                       Integer minRating, Long facilityId) {
    // 검색 조건 설정
    ReviewDTO searchDTO = new ReviewDTO();
    searchDTO.setPage(page);
    searchDTO.setSize(DEFAULT_PAGE_SIZE); // 한 페이지에 10개씩
    
    // 전체 개수 조회
    int totalCount = reviewMapper.countReviewsWithSearch(searchDTO);
    
    // 실제 데이터 조회
    List<ReviewDTO> reviewList = reviewMapper.findReviewsWithSearch(searchDTO);
    
    // 페이징 정보 생성
    return new PageInfo<>(reviewList, page, DEFAULT_PAGE_SIZE, totalCount);
}
```

**초보자를 위한 설명:**
- **페이징**: 많은 데이터를 여러 페이지로 나누어 보여주는 기능
- **DEFAULT_PAGE_SIZE = 10**: 한 페이지에 10개씩 보여줌
- **totalCount**: 전체 리뷰 개수 (페이지 번호 계산에 필요)
- **PageInfo**: 현재 페이지, 전체 페이지, 이전/다음 페이지 정보를 담는 객체

#### 🔒 트랜잭션 처리
```java
@Transactional
public int insertReview(ReviewDTO reviewDTO) {
    // 데이터 검증
    validateReviewData(reviewDTO);
    
    // 기본값 설정
    reviewDTO.setStatus("ACTIVE");
    reviewDTO.setVisible(true);
    
    // 데이터베이스에 저장
    int result = reviewMapper.insertReview(reviewDTO);
    
    return result;
}
```

**초보자를 위한 설명:**
- `@Transactional`: 데이터베이스 작업을 안전하게 처리
- 만약 중간에 오류가 발생하면 모든 변경사항을 취소(롤백)
- 은행 거래처럼 "모두 성공" 또는 "모두 취소"

#### 📊 데이터 검증
```java
private void validateReviewData(ReviewDTO reviewDTO) {
    if (reviewDTO.getTitle() == null || reviewDTO.getTitle().trim().isEmpty()) {
        throw new IllegalArgumentException("제목은 필수 입력 항목입니다.");
    }
    if (reviewDTO.getContent() == null || reviewDTO.getContent().trim().isEmpty()) {
        throw new IllegalArgumentException("내용은 필수 입력 항목입니다.");
    }
    if (reviewDTO.getRating() == null || reviewDTO.getRating() < 1 || reviewDTO.getRating() > 5) {
        throw new IllegalArgumentException("평점은 1-5 사이의 값이어야 합니다.");
    }
}
```

**초보자를 위한 설명:**
- 사용자가 입력한 데이터가 올바른지 검사
- 제목, 내용이 비어있거나 평점이 잘못된 경우 오류 발생
- 데이터베이스에 잘못된 데이터가 저장되는 것을 방지

---

## 📋 게시판 시스템 상세 분석

### 1. BoardController.java 분석

#### 🎯 다양한 게시판 타입 지원
```java
// 게시판 타입별 정보 매핑
private final Map<String, Map<String, String>> boardTypeInfo = Map.of(
    "notice", Map.of("title", "공지사항", "description", "중요한 공지사항을 확인하세요"),
    "info", Map.of("title", "정보공유", "description", "유용한 정보를 공유하고 함께 나누세요"),
    "qna", Map.of("title", "Q&A", "description", "궁금한 점을 질문하고 답변을 받아보세요"),
    "faq", Map.of("title", "자주묻는질문", "description", "자주 묻는 질문과 답변을 확인하세요")
);
```

**초보자를 위한 설명:**
- `Map`: 키-값 쌍으로 데이터를 저장하는 자료구조 (사전과 같음)
- 하나의 게시판 시스템으로 여러 종류의 게시판 운영 가능
- 각 타입별로 제목과 설명이 다르게 표시됨

#### 🔄 동적 템플릿 선택
```java
// 카테고리별 전용 템플릿 사용
if ("faq".equals(type)) {
    return "board/faq-list";
} else if ("notice".equals(type)) {
    return "board/notice-list";
} else if ("qna".equals(type)) {
    return "board/qna-list";
}
return "board/list";
```

**초보자를 위한 설명:**
- 게시판 타입에 따라 다른 웹 페이지 템플릿 사용
- FAQ는 FAQ 전용 페이지, 공지사항은 공지사항 전용 페이지
- 하나의 컨트롤러로 여러 종류의 페이지 처리

### 2. BoardService.java 분석

#### 🔍 복잡한 검색 기능
```java
public PageInfo<BoardDTO> getBoardList(int page, String keyword, String category) {
    // 검색 조건 설정
    BoardDTO searchDTO = new BoardDTO();
    searchDTO.setPage(page);
    searchDTO.setSize(DEFAULT_PAGE_SIZE);
    
    // 키워드 검색
    if (keyword != null && !keyword.trim().isEmpty()) {
        searchDTO.setSearchKeyword(keyword.trim());
    }
    
    // 카테고리 필터
    if (category != null && !category.trim().isEmpty() && !"all".equals(category)) {
        searchDTO.setCategory(category.trim());
    }
    
    // 데이터베이스 조회
    int totalCount = boardMapper.getBoardCount(searchDTO);
    List<BoardDTO> boardList = boardMapper.getBoardList(searchDTO);
    
    return new PageInfo<>(boardList, page, DEFAULT_PAGE_SIZE, totalCount);
}
```

**초보자를 위한 설명:**
- **키워드 검색**: 제목이나 내용에 특정 단어가 포함된 게시글 찾기
- **카테고리 필터**: 특정 종류의 게시글만 보기 (예: 공지사항만)
- **trim()**: 문자열 앞뒤의 공백 제거
- 검색 조건이 없으면 전체 게시글 조회

#### 🎯 게시글 상태 관리
```java
@Transactional
public int insertBoard(BoardDTO boardDTO) {
    // 기본값 설정
    if (boardDTO.getIsActive() == null) {
        boardDTO.setIsActive(true);  // 활성 상태
    }
    if (boardDTO.getIsDeleted() == null) {
        boardDTO.setIsDeleted(false);  // 삭제되지 않음
    }
    if (boardDTO.getIsNotice() == null) {
        boardDTO.setIsNotice(false);  // 일반 게시글
    }
    
    // 카테고리에 따라 공지사항 여부 설정
    if ("NOTICE".equals(boardDTO.getCategory())) {
        boardDTO.setIsNotice(true);
    }
    
    return boardMapper.insertBoard(boardDTO);
}
```

**초보자를 위한 설명:**
- **isActive**: 게시글이 활성화되어 있는지 (true: 보임, false: 숨김)
- **isDeleted**: 게시글이 삭제되었는지 (true: 삭제됨, false: 정상)
- **isNotice**: 공지사항인지 (true: 공지사항, false: 일반 게시글)
- 기본값 설정으로 데이터 일관성 유지

---

## 🎯 코드 품질 분석

### ✅ 장점들

#### 1. 📝 상세한 로깅
```java
log.info("리뷰 목록 조회 시작 - page: {}, keyword: {}, minRating: {}, facilityId: {}", 
         page, keyword, minRating, facilityId);
log.info("리뷰 목록 조회 완료 - 조회된 건수: {}, 전체: {}", reviewList.size(), totalCount);
```

**초보자를 위한 설명:**
- 프로그램이 어떤 작업을 하고 있는지 기록
- 문제가 발생했을 때 원인을 찾기 쉬움
- 성능 분석이나 사용자 행동 분석에 활용

#### 2. 🛡️ 철저한 예외 처리
```java
try {
    // 실제 작업
} catch (Exception e) {
    log.error("작업 중 오류 발생", e);
    throw new RuntimeException("사용자 친화적인 오류 메시지", e);
}
```

**초보자를 위한 설명:**
- 모든 중요한 작업에 오류 처리 적용
- 시스템 오류를 사용자가 이해할 수 있는 메시지로 변환
- 원본 오류 정보는 로그에 기록하여 개발자가 디버깅 가능

#### 3. 🔒 보안 고려사항
```java
// 세션에서 사용자 ID 가져오기 (사용자가 임의로 변경 불가)
Long memberId = (Long) session.getAttribute("memberId");
boardDTO.setMemberId(memberId);
```

**초보자를 위한 설명:**
- 사용자가 다른 사람의 ID로 게시글 작성하는 것을 방지
- 세션에 저장된 정보는 서버에서 관리하므로 안전
- 클라이언트에서 전송된 사용자 ID는 신뢰하지 않음

#### 4. 📊 데이터 검증
```java
private void validateBoardData(BoardDTO boardDTO) {
    if (boardDTO.getTitle() == null || boardDTO.getTitle().trim().isEmpty()) {
        throw new IllegalArgumentException("제목은 필수 입력 항목입니다.");
    }
    if (boardDTO.getContent() == null || boardDTO.getContent().trim().isEmpty()) {
        throw new IllegalArgumentException("내용은 필수 입력 항목입니다.");
    }
}
```

**초보자를 위한 설명:**
- 필수 입력 항목이 비어있는지 검사
- 잘못된 데이터가 데이터베이스에 저장되는 것을 방지
- 사용자에게 명확한 오류 메시지 제공

### ⚠️ 개선 가능한 부분들

#### 1. 🔄 중복 코드 정리
```java
// 현재: 각 메소드마다 반복되는 로그인 체크
MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
if (loginMember == null) {
    redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
    return "redirect:/member/login";
}

// 개선안: 공통 메소드로 분리
private boolean checkLogin(HttpSession session, RedirectAttributes redirectAttributes) {
    MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
    if (loginMember == null) {
        redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
        return false;
    }
    return true;
}
```

#### 2. 📝 상수 정의
```java
// 현재: 하드코딩된 값들
private static final int DEFAULT_PAGE_SIZE = 10;

// 개선안: 설정 파일에서 관리
@Value("${app.page.size:10}")
private int defaultPageSize;
```

---

## 🎯 핵심 기능별 동작 원리

### 1. 📄 리뷰 목록 조회 과정

```
1. 사용자가 "/review" 주소 접속
   ↓
2. ReviewController.listPage() 메소드 실행
   ↓
3. 파라미터 처리 (페이지 번호, 검색어, 필터 등)
   ↓
4. ReviewService.getReviewList() 호출
   ↓
5. 데이터베이스에서 리뷰 목록 조회
   ↓
6. 페이징 정보 계산
   ↓
7. Model에 데이터 담기
   ↓
8. review/list.html 템플릿으로 화면 출력
```

### 2. ✏️ 리뷰 작성 과정

```
1. 사용자가 "리뷰 작성" 버튼 클릭
   ↓
2. 로그인 체크 (로그인 안 되어 있으면 로그인 페이지로 이동)
   ↓
3. 리뷰 작성 폼 표시
   ↓
4. 사용자가 제목, 내용, 평점 입력 후 "등록" 클릭
   ↓
5. 입력 데이터 검증 (필수 항목, 평점 범위 등)
   ↓
6. 데이터베이스에 저장
   ↓
7. 리뷰 목록 페이지로 이동
```

### 3. 🔍 게시판 검색 과정

```
1. 사용자가 검색어 입력 후 "검색" 클릭
   ↓
2. BoardController.listPage() 메소드 실행
   ↓
3. 검색 조건 설정 (키워드, 카테고리)
   ↓
4. 데이터베이스에서 조건에 맞는 게시글 조회
   ↓
5. 검색 결과와 페이징 정보 계산
   ↓
6. 검색 결과 화면 출력
```

---

## 🎯 데이터베이스 연동 방식

### MyBatis 사용법
```java
// 1. Mapper 인터페이스 정의
public interface ReviewMapper {
    List<ReviewDTO> findReviewsWithSearch(ReviewDTO searchDTO);
    int countReviewsWithSearch(ReviewDTO searchDTO);
    int insertReview(ReviewDTO reviewDTO);
}

// 2. XML에서 SQL 정의
<select id="findReviewsWithSearch" resultType="ReviewDTO">
    SELECT * FROM reviews 
    WHERE 1=1
    <if test="searchKeyword != null and searchKeyword != ''">
        AND (title LIKE CONCAT('%', #{searchKeyword}, '%') 
             OR content LIKE CONCAT('%', #{searchKeyword}, '%'))
    </if>
    <if test="minRating != null">
        AND rating >= #{minRating}
    </if>
    ORDER BY created_at DESC
    LIMIT #{offset}, #{size}
</select>

// 3. Service에서 호출
List<ReviewDTO> reviewList = reviewMapper.findReviewsWithSearch(searchDTO);
```

**초보자를 위한 설명:**
- **MyBatis**: 자바 코드와 SQL을 분리해서 관리하는 도구
- **동적 SQL**: 조건에 따라 SQL 쿼리가 달라짐
- **LIKE 검색**: 부분 일치 검색 (제목이나 내용에 검색어 포함)
- **LIMIT**: 페이징을 위한 결과 개수 제한

---

## 🎯 웹 페이지 연동 방식

### Thymeleaf 템플릿 사용법
```html
<!-- 리뷰 목록 표시 -->
<div th:each="review : ${reviewList}">
    <h3 th:text="${review.title}">제목</h3>
    <p th:text="${review.content}">내용</p>
    <span th:text="${review.rating}">평점</span>
    <small th:text="${review.createdAt}">작성일</small>
</div>

<!-- 페이징 버튼 -->
<div th:if="${pageInfo.totalPages > 1}">
    <a th:href="@{/review(page=${pageInfo.currentPage - 1})}" 
       th:if="${pageInfo.currentPage > 1}">이전</a>
    
    <span th:each="pageNum : ${#numbers.sequence(1, pageInfo.totalPages)}">
        <a th:href="@{/review(page=${pageNum})}" 
           th:text="${pageNum}"
           th:class="${pageNum == pageInfo.currentPage} ? 'active' : ''">1</a>
    </span>
    
    <a th:href="@{/review(page=${pageInfo.currentPage + 1})}" 
       th:if="${pageInfo.currentPage < pageInfo.totalPages}">다음</a>
</div>
```

**초보자를 위한 설명:**
- **th:each**: 목록 데이터를 반복해서 표시
- **th:text**: 텍스트 내용 출력
- **th:href**: 링크 주소 생성
- **th:if**: 조건에 따라 표시/숨김
- **${변수명}**: 서버에서 전달받은 데이터 사용

---

## 🎯 성능 최적화 방안

### 1. 📊 페이징 처리
```java
// 전체 데이터를 한 번에 가져오지 않고 필요한 만큼만 조회
searchDTO.setOffset((page - 1) * DEFAULT_PAGE_SIZE);
searchDTO.setSize(DEFAULT_PAGE_SIZE);
```

### 2. 🔍 인덱스 활용
```sql
-- 검색 성능 향상을 위한 인덱스 생성
CREATE INDEX idx_reviews_title ON reviews(title);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);
CREATE INDEX idx_boards_category ON boards(category);
```

### 3. 💾 조회수 최적화
```java
// 조회수 증가를 별도 트랜잭션으로 처리
@Transactional
public int incrementViewCount(Long id) {
    return reviewMapper.incrementViewCount(id);
}
```

---

## 🎯 보안 고려사항

### 1. 🔒 인증 및 권한 체크
```java
// 모든 중요한 작업에 로그인 체크
private boolean isLoggedIn(HttpSession session) {
    return session.getAttribute("memberId") != null;
}

// 본인 게시글만 수정/삭제 가능하도록 체크
private boolean isAuthor(Long boardId, Long memberId) {
    BoardDTO board = boardMapper.getBoardById(boardId);
    return board != null && board.getMemberId().equals(memberId);
}
```

### 2. 🛡️ 입력 데이터 검증
```java
// XSS 공격 방지를 위한 HTML 태그 제거
private String sanitizeInput(String input) {
    if (input == null) return null;
    return input.replaceAll("<[^>]*>", "").trim();
}
```

### 3. 🔐 SQL 인젝션 방지
```xml
<!-- MyBatis의 #{} 사용으로 SQL 인젝션 방지 -->
<select id="findReviewsWithSearch">
    SELECT * FROM reviews 
    WHERE title LIKE CONCAT('%', #{searchKeyword}, '%')
    <!-- ${} 대신 #{} 사용 -->
</select>
```

---

## 🎯 팀원들을 위한 학습 가이드

### 1. 📚 기본 개념 이해하기

#### MVC 패턴
- **Model**: 데이터 (DTO, 데이터베이스)
- **View**: 화면 (HTML 템플릿)
- **Controller**: 요청 처리 (사용자 입력 → 비즈니스 로직 → 화면 출력)

#### 레이어 구조
- **Controller**: 웹 요청 받기
- **Service**: 비즈니스 로직 처리
- **Mapper**: 데이터베이스 연동
- **DTO**: 데이터 전송

### 2. 🔧 실습해볼 수 있는 것들

#### 간단한 수정 작업
```java
// 1. 페이지 크기 변경
private static final int DEFAULT_PAGE_SIZE = 15; // 10 → 15로 변경

// 2. 검색 조건 추가
if (authorName != null && !authorName.trim().isEmpty()) {
    searchDTO.setAuthorName(authorName.trim());
}

// 3. 정렬 순서 변경
// ORDER BY created_at DESC → ORDER BY title ASC
```

#### 새로운 기능 추가
```java
// 1. 인기 게시글 조회 (조회수 기준)
public List<BoardDTO> getPopularBoards() {
    return boardMapper.findPopularBoards();
}

// 2. 내가 작성한 게시글 조회
public List<BoardDTO> getMyBoards(Long memberId) {
    return boardMapper.findBoardsByMemberId(memberId);
}
```

### 3. 🎯 디버깅 방법

#### 로그 확인하기
```java
// 중요한 지점에 로그 추가
log.info("현재 페이지: {}, 검색어: {}", page, keyword);
log.info("조회된 게시글 수: {}", boardList.size());
```

#### 데이터 확인하기
```java
// 디버깅용 메소드 추가
@GetMapping("/debug/board/{id}")
@ResponseBody
public Map<String, Object> debugBoardStatus(@PathVariable Long id) {
    BoardDTO board = boardService.getBoardByIdIncludeDeleted(id);
    Map<String, Object> result = new HashMap<>();
    result.put("board", board);
    result.put("isDeleted", board != null ? board.getIsDeleted() : null);
    return result;
}
```

---

## 🎯 결론 및 추천사항

### ✅ 팀원D의 성과
1. **완성도**: 상용 서비스 수준의 완성도
2. **코드 품질**: 매우 높음 (로깅, 예외처리, 보안)
3. **기능 완성도**: 모든 기능이 완전히 구현됨
4. **확장성**: 새로운 기능 추가가 용이한 구조

### 🎯 팀원들이 배울 점
1. **체계적인 예외 처리**: 모든 메소드에 try-catch 적용
2. **상세한 로깅**: 디버깅과 모니터링에 필수
3. **보안 고려**: 로그인 체크, 데이터 검증
4. **사용자 경험**: 친절한 오류 메시지

### 📋 다음 단계 제안
1. **단위 테스트 작성**: 각 메소드의 정상 동작 확인
2. **성능 최적화**: 데이터베이스 쿼리 최적화
3. **추가 기능**: 댓글 시스템, 파일 업로드
4. **문서화**: API 문서 작성

### 🎓 학습 순서 추천
1. **1단계**: MVC 패턴 이해
2. **2단계**: 데이터베이스 연동 방식 학습
3. **3단계**: 예외 처리와 로깅 방법 학습
4. **4단계**: 보안 처리 방법 학습
5. **5단계**: 성능 최적화 방법 학습

---

## 🎯 마무리

팀원D가 작성한 코드는 **초보자가 만들었다고 보기 어려울 정도로 완성도가 높습니다**. 

### 🌟 특히 인상적인 부분들:
- 체계적인 예외 처리
- 상세한 로깅 시스템
- 보안을 고려한 구현
- 사용자 친화적인 오류 메시지
- 확장 가능한 구조 설계

### 💡 팀원들을 위한 조언:
이 코드를 **교과서**로 삼아서 다른 기능들도 이와 같은 수준으로 구현해보세요. 
특히 **예외 처리**, **로깅**, **보안 체크** 부분은 모든 기능에 필수적으로 적용되어야 합니다.

**팀원D의 코드 수준을 목표로 하여 전체 프로젝트의 품질을 높여나가시기 바랍니다!** 🚀
