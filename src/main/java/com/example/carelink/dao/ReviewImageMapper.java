package com.example.carelink.dao;

import com.example.carelink.dto.ReviewImageDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

/**
 * 리뷰 이미지 매퍼
 */
@Mapper
public interface ReviewImageMapper {
    
    // ===== 조회 =====
    
    /**
     * 리뷰의 모든 이미지 조회
     */
    List<ReviewImageDTO> getImagesByReviewId(@Param("reviewId") Long reviewId);
    
    /**
     * 특정 이미지 조회
     */
    ReviewImageDTO getImageById(@Param("imageId") Long imageId);
    
    /**
     * 리뷰의 활성 이미지 개수 조회
     */
    int countActiveImagesByReviewId(@Param("reviewId") Long reviewId);
    
    /**
     * 시설의 모든 리뷰 이미지 조회
     */
    List<ReviewImageDTO> getImagesByFacilityId(@Param("facilityId") Long facilityId);
    
    // ===== 등록 =====
    
    /**
     * 이미지 등록
     */
    int insertImage(ReviewImageDTO imageDTO);
    
    /**
     * 다중 이미지 일괄 등록
     */
    int insertImages(@Param("images") List<ReviewImageDTO> images);
    
    // ===== 수정 =====
    
    /**
     * 이미지 정보 수정
     */
    int updateImage(ReviewImageDTO imageDTO);
    
    /**
     * 이미지 순서 변경
     */
    int updateImageOrder(@Param("imageId") Long imageId, 
                        @Param("imageOrder") Integer imageOrder);
    
    /**
     * 이미지 대체 텍스트 수정
     */
    int updateImageAltText(@Param("imageId") Long imageId, 
                          @Param("altText") String altText);
    
    // ===== 삭제 =====
    
    /**
     * 이미지 삭제 (물리적)
     */
    int deleteImage(@Param("imageId") Long imageId);
    
    /**
     * 이미지 비활성화 (논리적)
     */
    int deactivateImage(@Param("imageId") Long imageId);
    
    /**
     * 리뷰의 모든 이미지 삭제
     */
    int deleteImagesByReviewId(@Param("reviewId") Long reviewId);
    
    // ===== 통계 =====
    
    /**
     * 시설별 리뷰 이미지 통계
     */
    int getTotalImageCountByFacilityId(@Param("facilityId") Long facilityId);
    
    /**
     * 전체 리뷰 이미지 용량 합계
     */
    Long getTotalImageSize();
    
    /**
     * 회원별 업로드한 리뷰 이미지 개수
     */
    int getImageCountByMemberId(@Param("memberId") Long memberId);
}