package com.example.carelink.dto;

import com.example.carelink.common.BaseDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

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
    private boolean isNotice;       // 공지사항 여부
    private boolean isSecret;       // 비밀글 여부
    private boolean isActive;       // 활성 상태
    private String status;          // 상태 (ACTIVE, HIDDEN, DELETED)
    
    // 카테고리
    private String category;        // 카테고리
    private String subCategory;     // 서브 카테고리
    
    // 우선순위 (상단 고정용)
    private Integer priority;       // 우선순위
    private boolean isPinned;       // 상단 고정 여부
    
    // 답글/댓글 관련
    private Long parentBoardId;     // 부모 게시글 ID (답글인 경우)
    private Integer replyDepth;     // 답글 깊이
    private Integer replyOrder;     // 답글 순서
    
    // 검색용 필드
    private String searchKeyword;   // 검색 키워드
    private String searchType;      // 검색 유형 (TITLE, CONTENT, AUTHOR, ALL)
    private String searchCategory;  // 검색 카테고리
    
    // 정렬용
    private String sortBy;          // 정렬 기준 (LATEST, VIEW_COUNT, LIKE_COUNT)
    private String sortOrder;       // 정렬 순서 (ASC, DESC)
    
    // 태그
    private String tags;            // 태그 (콤마로 구분)
    
    // SEO 관련
    private String metaDescription; // 메타 설명
    private String metaKeywords;    // 메타 키워드
    
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
} 