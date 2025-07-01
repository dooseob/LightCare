package com.example.carelink.dto;

import com.example.carelink.common.BaseDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

/**
 * 시설 리뷰 DTO
 * 팀원 D 담당: 시설 리뷰 기능
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ReviewDTO extends BaseDTO {
    
    private Long reviewId;          // 리뷰 ID (자동증가)
    
    @NotNull(message = "시설 정보는 필수입니다")
    private Long facilityId;        // 시설 ID
    private String facilityName;    // 시설 이름
    
    @NotNull(message = "작성자 정보는 필수입니다")
    private Long memberId;          // 작성자 ID
    private String memberName;      // 작성자 이름
    
    @NotBlank(message = "리뷰 제목은 필수입니다")
    private String title;           // 리뷰 제목
    
    @NotBlank(message = "리뷰 내용은 필수입니다")
    private String content;         // 리뷰 내용
    
    @NotNull(message = "평점은 필수입니다")
    @Min(value = 1, message = "평점은 1점 이상이어야 합니다")
    @Max(value = 5, message = "평점은 5점 이하여야 합니다")
    private Integer rating;         // 평점 (1-5점)
    
    // 세부 평점 (선택사항)
    private Integer serviceRating;  // 서비스 평점
    private Integer facilityRating; // 시설 평점
    private Integer staffRating;    // 직원 평점
    private Integer priceRating;    // 가격 평점
    
    // 리뷰 이미지
    private String reviewImage1;    // 리뷰 이미지 1
    private String reviewImage2;    // 리뷰 이미지 2
    private String reviewImage3;    // 리뷰 이미지 3
    
    // 추천/비추천
    private Integer likeCount;      // 추천 수
    private Integer dislikeCount;   // 비추천 수
    
    // 조회수
    private Integer viewCount;      // 조회수
    
    // 상태
    private boolean isVisible;      // 표시 여부
    private String status;          // 상태 (ACTIVE, HIDDEN, REPORTED)
    
    // 답글 관련
    private Long parentReviewId;    // 부모 리뷰 ID (답글인 경우)
    private Integer replyCount;     // 답글 수
    private Integer replyDepth;     // 답글 깊이
    
    // 검색용
    private String searchKeyword;   // 검색 키워드
    private Integer minRating;      // 최소 평점
    private Integer maxRating;      // 최대 평점
    
    // 정렬용
    private String sortBy;          // 정렬 기준 (LATEST, RATING_HIGH, RATING_LOW, LIKE_COUNT)
    
    // 시설 평균 평점 (조회용)
    private Double facilityAverageRating;    // 시설의 평균 평점
    private Integer facilityReviewCount;     // 시설의 전체 리뷰 수
} 