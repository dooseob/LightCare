<<<<<<< HEAD
package com.example.carelink.dto;

import com.example.carelink.common.BaseDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * 정보 게시판 DTO
 * 팀원 D 담당: 정보 게시판 기능
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class BoardDTO extends BaseDTO {
    
    private Long boardId;           // 게시글 ID (자동증가)
    
    @NotBlank(message = "게시판 유형은 필수입니다")
    private String boardType;       // 게시판 유형 (NOTICE, INFO, QNA, FAQ)
    
    @NotBlank(message = "제목은 필수입니다")
    private String title;           // 제목
    
    @NotBlank(message = "내용은 필수입니다")
    private String content;         // 내용
    
    @NotNull(message = "작성자 정보는 필수입니다")
    private Long memberId;          // 작성자 ID
    private String memberName;      // 작성자 이름
    private String author;          // 작성자 표시명 (회원명 또는 닉네임)
    
    // 조회수 및 추천
    private Integer viewCount;      // 조회수
    private Integer likeCount;      // 추천수
    private Integer commentCount;   // 댓글수
    
    // 첨부파일
    private String attachmentPath;  // 첨부파일 경로
    private String attachmentName;  // 첨부파일 원본명
    private Long attachmentSize;    // 첨부파일 크기
    
    // 상태 관리
    private Boolean isNotice;        // 공지사항 여부
    private Boolean isSecret;        // 비밀글 여부
    private Boolean isActive;        // 활성 상태 (true: 활성, false: 비활성)
    private Boolean isDeleted;       // 삭제 여부 (true: 삭제됨, false: 활성)
    private String status;           // 상태 (ACTIVE, HIDDEN, DELETED)
    
    // 카테고리
    private String category;        // 카테고리
    private String subCategory;     // 서브 카테고리
    
    // 우선순위 (상단 고정용)
    private Integer priority = 1;    // 우선순위 (기본값 설정)
    private Boolean isPinned;        // 상단 고정 여부
    
    // 답글/댓글 관련
    private Long parentBoardId;      // 부모 게시글 ID (답글인 경우)
    private Integer replyDepth;      // 답글 깊이
    private Integer replyOrder;      // 답글 순서
    
    // 검색용 필드
    private String searchKeyword;    // 검색 키워드
    private String searchType;       // 검색 유형 (TITLE, CONTENT, AUTHOR, ALL)
    private String searchCategory;   // 검색 카테고리
    
    // 정렬용
    private String sortBy;           // 정렬 기준 (LATEST, VIEW_COUNT, LIKE_COUNT)
    private String sortOrder;        // 정렬 순서 (ASC, DESC)
    
    // 태그
    private String tags;             // 태그 (콤마로 구분)
    
    // SEO 관련
    private String metaDescription;  // 메타 설명
    private String metaKeywords;     // 메타 키워드
    
    // 페이징을 위한 필드 (BaseDTO와 일치하도록 Integer 타입 사용)
    private Integer page = 1;
    private Integer size = 10;
    private Integer offset = 0;
    
    private LocalDateTime createdAt;  // 생성일시
    private LocalDateTime updatedAt;  // 수정일시
    
    /**
     * 작성자 표시명 설정
     * memberName이 있으면 memberName을, 없으면 주어진 author 값을 사용
     */
    public void setAuthor(String author) {
        this.author = (this.memberName != null && !this.memberName.isEmpty()) ? this.memberName : author;
    }
    
    /**
     * 작성자 표시명 조회
     * memberName이 있으면 memberName을, 없으면 author 값을 반환
     */
    public String getAuthor() {
        return (this.memberName != null && !this.memberName.isEmpty()) ? this.memberName : this.author;
    }
    
    /**
     * 새 글 여부 확인 (24시간 이내 작성)
     */
    public boolean getIsNew() {
        if (this.getCreatedAt() == null) return false;
        return this.getCreatedAt().isAfter(java.time.LocalDateTime.now().minusDays(1));
    }
    
    /**
     * 인기 글 여부 확인 (조회수 100 이상 또는 추천수 10 이상)
     */
    public boolean getIsHot() {
        return (this.viewCount != null && this.viewCount >= 100) || 
               (this.likeCount != null && this.likeCount >= 10);
    }
    
    /**
     * 댓글이 있는지 확인
     */
    public boolean getHasComments() {
        return this.commentCount != null && this.commentCount > 0;
    }
    
=======
package com.example.carelink.dto;

import com.example.carelink.common.BaseDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * 정보 게시판 DTO
 * 팀원 D 담당: 정보 게시판 기능
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class BoardDTO extends BaseDTO {
    
    private Long boardId;           // 게시글 ID (자동증가)
    
    @NotBlank(message = "게시판 유형은 필수입니다")
    private String boardType;       // 게시판 유형 (NOTICE, INFO, QNA, FAQ)
    
    @NotBlank(message = "제목은 필수입니다")
    private String title;           // 제목
    
    @NotBlank(message = "내용은 필수입니다")
    private String content;         // 내용
    
    @NotNull(message = "작성자 정보는 필수입니다")
    private Long memberId;          // 작성자 ID
    private String memberName;      // 작성자 이름
    private String author;          // 작성자 표시명 (회원명 또는 닉네임)
    
    // 조회수 및 추천
    private Integer viewCount;      // 조회수
    private Integer likeCount;      // 추천수
    private Integer commentCount;   // 댓글수
    
    // 첨부파일
    private String attachmentPath;  // 첨부파일 경로
    private String attachmentName;  // 첨부파일 원본명
    private Long attachmentSize;    // 첨부파일 크기
    
    // 상태 관리
    private Boolean isNotice;        // 공지사항 여부
    private Boolean isSecret;        // 비밀글 여부
    private Boolean isActive;        // 활성 상태 (true: 활성, false: 비활성)
    private Boolean isDeleted;       // 삭제 여부 (true: 삭제됨, false: 활성)
    private String status;           // 상태 (ACTIVE, HIDDEN, DELETED)
    
    // 카테고리
    private String category;        // 카테고리
    private String subCategory;     // 서브 카테고리
    
    // 우선순위 (상단 고정용)
    private Integer priority;        // 우선순위
    private Boolean isPinned;        // 상단 고정 여부
    
    // 답글/댓글 관련
    private Long parentBoardId;      // 부모 게시글 ID (답글인 경우)
    private Integer replyDepth;      // 답글 깊이
    private Integer replyOrder;      // 답글 순서
    
    // 검색용 필드
    private String searchKeyword;    // 검색 키워드
    private String searchType;       // 검색 유형 (TITLE, CONTENT, AUTHOR, ALL)
    private String searchCategory;   // 검색 카테고리
    
    // 정렬용
    private String sortBy;           // 정렬 기준 (LATEST, VIEW_COUNT, LIKE_COUNT)
    private String sortOrder;        // 정렬 순서 (ASC, DESC)
    
    // 태그
    private String tags;             // 태그 (콤마로 구분)
    
    // SEO 관련
    private String metaDescription;  // 메타 설명
    private String metaKeywords;     // 메타 키워드
    
    // 페이징을 위한 필드 (BaseDTO와 일치하도록 Integer 타입 사용)
    private Integer page = 1;
    private Integer size = 10;
    private Integer offset = 0;
    
    private LocalDateTime createdAt;  // 생성일시
    private LocalDateTime updatedAt;  // 수정일시
    
    /**
     * 작성자 표시명 설정
     * memberName이 있으면 memberName을, 없으면 주어진 author 값을 사용
     */
    public void setAuthor(String author) {
        this.author = (this.memberName != null && !this.memberName.isEmpty()) ? this.memberName : author;
    }
    
    /**
     * 작성자 표시명 조회
     * memberName이 있으면 memberName을, 없으면 author 값을 반환
     */
    public String getAuthor() {
        return (this.memberName != null && !this.memberName.isEmpty()) ? this.memberName : this.author;
    }
    
    /**
     * 새 글 여부 확인 (24시간 이내 작성)
     */
    public boolean getIsNew() {
        if (this.getCreatedAt() == null) return false;
        return this.getCreatedAt().isAfter(java.time.LocalDateTime.now().minusDays(1));
    }
    
    /**
     * 인기 글 여부 확인 (조회수 100 이상 또는 추천수 10 이상)
     */
    public boolean getIsHot() {
        return (this.viewCount != null && this.viewCount >= 100) || 
               (this.likeCount != null && this.likeCount >= 10);
    }
    
    /**
     * 댓글이 있는지 확인
     */
    public boolean getHasComments() {
        return this.commentCount != null && this.commentCount > 0;
    }
    
    /**
     * 공지사항 여부 getter (Thymeleaf 호환)
     */
    public Boolean getIsNotice() {
        return this.isNotice;
    }
    
    /**
     * 공지사항 여부 setter (Thymeleaf 호환)
     */
    public void setIsNotice(Boolean isNotice) {
        this.isNotice = isNotice;
    }
    
    /**
     * 비밀글 여부 getter (Thymeleaf 호환)
     */
    public Boolean getIsSecret() {
        return this.isSecret;
    }
    
    /**
     * 비밀글 여부 setter (Thymeleaf 호환)
     */
    public void setIsSecret(Boolean isSecret) {
        this.isSecret = isSecret;
    }
    
    /**
     * 삭제 여부 getter (Thymeleaf 호환)
     */
    public Boolean getIsDeleted() {
        return this.isDeleted;
    }
    
    /**
     * 삭제 여부 setter (Thymeleaf 호환)
     */
    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }
    
    /**
     * 상단 고정 여부 getter (Thymeleaf 호환)
     */
    public Boolean getIsPinned() {
        return this.isPinned;
    }
    
    /**
     * 상단 고정 여부 setter (Thymeleaf 호환)
     */
    public void setIsPinned(Boolean isPinned) {
        this.isPinned = isPinned;
    }
    
    /**
     * 활성 상태 getter (Thymeleaf 호환)
     */
    public Boolean getIsActive() {
        return this.isActive;
    }
    
    /**
     * 활성 상태 setter (Thymeleaf 호환)
     */
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
>>>>>>> main
} 