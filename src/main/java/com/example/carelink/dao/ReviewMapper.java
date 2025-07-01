package com.example.carelink.dao;

import com.example.carelink.dto.ReviewDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 리뷰 관련 데이터 액세스 매퍼
 * 팀원 D 담당
 */
@Mapper
public interface ReviewMapper {
    
    /**
     * 리뷰 목록 조회 (기본)
     */
    List<ReviewDTO> getReviewList(ReviewDTO searchDTO);
    
    /**
     * 리뷰 목록 조회 (검색 포함) - XML에서 정의됨
     */
    List<ReviewDTO> findReviewsWithSearch(ReviewDTO searchDTO);
    
    /**
     * 리뷰 총 개수 조회 (검색 포함)
     */
    int countReviewsWithSearch(ReviewDTO searchDTO);
    
    /**
     * 리뷰 상세 정보 조회 (기본)
     */
    ReviewDTO getReviewById(@Param("reviewId") Long reviewId);
    
    /**
     * 리뷰 상세 정보 조회 - XML에서 정의됨
     */
    ReviewDTO findReviewById(@Param("reviewId") Long reviewId);
    
    /**
     * 리뷰 등록
     */
    int insertReview(ReviewDTO reviewDTO);
    
    /**
     * 리뷰 수정
     */
    int updateReview(ReviewDTO reviewDTO);
    
    /**
     * 리뷰 삭제
     */
    int deleteReview(@Param("reviewId") Long reviewId);
    
    /**
     * 조회수 증가
     */
    int incrementViewCount(@Param("reviewId") Long reviewId);
    
    /**
     * 추천수 증가
     */
    int incrementLikeCount(@Param("reviewId") Long reviewId);
    
    /**
     * 비추천수 증가
     */
    int incrementDislikeCount(@Param("reviewId") Long reviewId);
    
    /**
     * 시설별 리뷰 목록 조회 (기본)
     */
    List<ReviewDTO> getReviewsByFacilityId(@Param("facilityId") Long facilityId);
    
    /**
     * 시설별 리뷰 목록 조회 - XML에서 정의됨
     */
    List<ReviewDTO> findReviewsByFacilityId(@Param("facilityId") Long facilityId);
    
    /**
     * 회원별 리뷰 목록 조회
     */
    List<ReviewDTO> findReviewsByMemberId(@Param("memberId") Long memberId);
    
    /**
     * 시설의 평균 평점 조회
     */
    Double getAverageRating(@Param("facilityId") Long facilityId);
    
    /**
     * 최근 리뷰 목록 조회
     */
    List<ReviewDTO> getRecentReviews();
    
    /**
     * 리뷰 총 개수 조회 (검색 포함)
     */
    int getReviewCount(ReviewDTO searchDTO);

    /**
     * 전체 리뷰 수 조회 (통계용)
     */
    int getReviewCount();
} 