package com.example.carelink.service;

import com.example.carelink.common.PageInfo;
import com.example.carelink.dao.ReviewMapper;
import com.example.carelink.dto.ReviewDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 리뷰 관련 비즈니스 로직 서비스
 * 팀원 D 담당
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {
    
    private final ReviewMapper reviewMapper;
    
    private static final int DEFAULT_PAGE_SIZE = 10;
    
    /**
     * 리뷰 목록 조회 (페이징 및 검색 포함)
     */
    public PageInfo<ReviewDTO> getReviewList(int page, String keyword) {
        return getReviewList(page, keyword, null, null);
    }
    
    /**
     * 리뷰 목록 조회 (페이징, 검색, 평점 필터 포함)
     */
    public PageInfo<ReviewDTO> getReviewList(int page, String keyword, Integer minRating) {
        return getReviewList(page, keyword, minRating, null);
    }
    
    /**
     * 리뷰 목록 조회 (페이징, 검색, 평점 필터, 시설 필터 포함)
     */
    public PageInfo<ReviewDTO> getReviewList(int page, String keyword, Integer minRating, Long facilityId) {
        log.info("리뷰 목록 조회 시작 - page: {}, keyword: {}, minRating: {}, facilityId: {}", page, keyword, minRating, facilityId);
        
        try {
            // 검색 조건 설정
            ReviewDTO searchDTO = new ReviewDTO();
            // BaseDTO의 setPage() 메서드가 자동으로 offset을 계산해줌
            searchDTO.setPage(page);
            searchDTO.setSize(DEFAULT_PAGE_SIZE);
            
            if (keyword != null && !keyword.trim().isEmpty()) {
                searchDTO.setSearchKeyword(keyword.trim());
            }
            
            if (minRating != null) {
                searchDTO.setMinRating(minRating);
            }
            
            if (facilityId != null) {
                searchDTO.setFacilityId(facilityId);
            }
            
            // 전체 리뷰 수 조회
            int totalCount = reviewMapper.countReviewsWithSearch(searchDTO);
            
            // 리뷰 목록 조회
            List<ReviewDTO> reviewList = reviewMapper.findReviewsWithSearch(searchDTO);
            
            log.info("리뷰 목록 조회 완료 - 조회된 건수: {}, 전체: {}", reviewList.size(), totalCount);
            
            // 페이징 정보 생성
            return new PageInfo<>(reviewList, page, DEFAULT_PAGE_SIZE, totalCount);
            
        } catch (Exception e) {
            log.error("리뷰 목록 조회 중 오류 발생", e);
            throw new RuntimeException("리뷰 목록을 불러오는 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 리뷰 상세 정보 조회
     */
    @Transactional
    public ReviewDTO getReviewById(Long id) {
        log.info("리뷰 상세 조회 시작 - reviewId: {}", id);
        
        try {
            ReviewDTO review = reviewMapper.findReviewById(id);
            if (review == null) {
                throw new RuntimeException("해당 리뷰를 찾을 수 없습니다. ID: " + id);
            }
            
            // 조회수 증가
            reviewMapper.incrementViewCount(id);
            log.info("리뷰 상세 조회 완료 - reviewId: {}, title: {}", id, review.getTitle());
            
            return review;
        } catch (Exception e) {
            log.error("리뷰 상세 조회 중 오류 발생 - reviewId: {}", id, e);
            throw new RuntimeException("리뷰 상세 정보를 불러오는 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 리뷰 등록
     */
    @Transactional
    public int insertReview(ReviewDTO reviewDTO) {
        log.info("리뷰 등록 시작 - title: {}, facilityId: {}", reviewDTO.getTitle(), reviewDTO.getFacilityId());
        
        try {
            // 필수 값 검증
            validateReviewData(reviewDTO);
            
            // 기본값 설정 (필요한 경우에만)
            if (reviewDTO.getStatus() == null) {
                reviewDTO.setStatus("ACTIVE");
            }
            if (reviewDTO.getReplyDepth() == null) {
                reviewDTO.setReplyDepth(0);
            }
            // isVisible은 기본적으로 true로 설정 (boolean 타입)
            reviewDTO.setVisible(true);
            // isDeleted는 false로 설정 (논리적 삭제를 위해)
            reviewDTO.setDeleted(false);
            
            int result = reviewMapper.insertReview(reviewDTO);
            log.info("리뷰 등록 완료 - reviewId: {}", reviewDTO.getReviewId());
            
            return result;
        } catch (Exception e) {
            log.error("리뷰 등록 중 오류 발생", e);
            throw new RuntimeException("리뷰 등록 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 시설별 리뷰 목록 조회
     */
    public List<ReviewDTO> getReviewsByFacilityId(Long facilityId) {
        log.info("시설별 리뷰 조회 시작 - facilityId: {}", facilityId);
        
        try {
            List<ReviewDTO> reviews = reviewMapper.findReviewsByFacilityId(facilityId);
            log.info("시설별 리뷰 조회 완료 - facilityId: {}, 조회된 건수: {}", facilityId, reviews.size());
            
            return reviews;
        } catch (Exception e) {
            log.error("시설별 리뷰 조회 중 오류 발생 - facilityId: {}", facilityId, e);
            throw new RuntimeException("시설별 리뷰를 불러오는 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 리뷰 삭제 (논리 삭제)
     */
    @Transactional
    public int deleteReview(Long id) {
        log.info("리뷰 삭제 시작 - reviewId: {}", id);
        
        try {
            // 리뷰 존재 확인
            ReviewDTO existingReview = reviewMapper.findReviewById(id);
            if (existingReview == null) {
                throw new RuntimeException("삭제할 리뷰를 찾을 수 없습니다. ID: " + id);
            }
            
            int result = reviewMapper.deleteReview(id);
            log.info("리뷰 삭제 완료 - reviewId: {}", id);
            
            return result;
        } catch (Exception e) {
            log.error("리뷰 삭제 중 오류 발생 - reviewId: {}", id, e);
            throw new RuntimeException("리뷰 삭제 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 시설의 평균 평점 조회
     */
    public Double getAverageRating(Long facilityId) {
        log.info("평균 평점 조회 시작 - facilityId: {}", facilityId);
        
        try {
            Double averageRating = reviewMapper.getAverageRating(facilityId);
            if (averageRating == null) {
                averageRating = 0.0;
            }
            
            log.info("평균 평점 조회 완료 - facilityId: {}, 평균 평점: {}", facilityId, averageRating);
            return averageRating;
        } catch (Exception e) {
            log.error("평균 평점 조회 중 오류 발생 - facilityId: {}", facilityId, e);
            // 평점 조회 실패 시 0.0 반환
            return 0.0;
        }
    }
    
    /**
     * 리뷰 추천
     */
    @Transactional
    public int likeReview(Long reviewId) {
        log.info("리뷰 추천 시작 - reviewId: {}", reviewId);
        
        try {
            int result = reviewMapper.incrementLikeCount(reviewId);
            log.info("리뷰 추천 완료 - reviewId: {}", reviewId);
            
            return result;
        } catch (Exception e) {
            log.error("리뷰 추천 중 오류 발생 - reviewId: {}", reviewId, e);
            throw new RuntimeException("리뷰 추천 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 리뷰 비추천
     */
    @Transactional
    public int dislikeReview(Long reviewId) {
        log.info("리뷰 비추천 시작 - reviewId: {}", reviewId);
        
        try {
            int result = reviewMapper.incrementDislikeCount(reviewId);
            log.info("리뷰 비추천 완료 - reviewId: {}", reviewId);
            
            return result;
        } catch (Exception e) {
            log.error("리뷰 비추천 중 오류 발생 - reviewId: {}", reviewId, e);
            throw new RuntimeException("리뷰 비추천 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 회원별 리뷰 목록 조회
     */
    public List<ReviewDTO> getReviewsByMemberId(Long memberId) {
        log.info("회원별 리뷰 조회 시작 - memberId: {}", memberId);
        
        try {
            List<ReviewDTO> reviews = reviewMapper.findReviewsByMemberId(memberId);
            log.info("회원별 리뷰 조회 완료 - memberId: {}, 조회된 건수: {}", memberId, reviews.size());
            
            return reviews;
        } catch (Exception e) {
            log.error("회원별 리뷰 조회 중 오류 발생 - memberId: {}", memberId, e);
            throw new RuntimeException("회원별 리뷰를 불러오는 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 리뷰 데이터 유효성 검증
     */
    private void validateReviewData(ReviewDTO reviewDTO) {
        if (reviewDTO.getFacilityId() == null) {
            throw new IllegalArgumentException("시설 ID는 필수입니다.");
        }
        if (reviewDTO.getMemberId() == null) {
            throw new IllegalArgumentException("회원 ID는 필수입니다.");
        }
        if (reviewDTO.getTitle() == null || reviewDTO.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("리뷰 제목은 필수입니다.");
        }
        if (reviewDTO.getContent() == null || reviewDTO.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("리뷰 내용은 필수입니다.");
        }
        if (reviewDTO.getRating() == null || reviewDTO.getRating() < 1 || reviewDTO.getRating() > 5) {
            throw new IllegalArgumentException("평점은 1~5 사이의 값이어야 합니다.");
        }
    }

    /**
     * 전체 리뷰 수 조회 (통계용)
     */
    @Transactional(readOnly = true)
    public int getReviewCount() {
        try {
            return reviewMapper.getReviewCount();
        } catch (Exception e) {
            log.error("리뷰 수 조회 중 오류 발생", e);
            return 0; // 오류 시 0 반환
        }
    }
} 