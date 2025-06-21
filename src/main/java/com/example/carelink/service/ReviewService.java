package com.example.carelink.service;

import com.example.carelink.dao.ReviewMapper;
import com.example.carelink.dto.ReviewDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * 리뷰 관련 비즈니스 로직 서비스
 * 팀원 D 담당
 */
@Service
@RequiredArgsConstructor
public class ReviewService {
    
    private final ReviewMapper reviewMapper;
    
    /**
     * 리뷰 목록 조회
     */
    public List<ReviewDTO> getReviewList(int page, String keyword) {
        try {
            // TODO: 팀원 D가 페이징 및 검색 로직 구현
            ReviewDTO searchDTO = new ReviewDTO();
            searchDTO.setPage((page - 1) * 10);
            searchDTO.setSize(10);
            return reviewMapper.getReviewList(searchDTO);
        } catch (Exception e) {
            // 임시로 빈 리스트 반환 (개발 초기 에러 방지)
            return new ArrayList<>();
        }
    }
    
    /**
     * 리뷰 상세 정보 조회
     */
    public ReviewDTO getReviewById(Long id) {
        try {
            // TODO: 팀원 D가 상세 조회 로직 구현
            return reviewMapper.getReviewById(id);
        } catch (Exception e) {
            // 임시로 기본 리뷰 정보 반환 (개발 초기 에러 방지)
            ReviewDTO review = new ReviewDTO();
            review.setReviewId(id);
            review.setTitle("리뷰 정보를 불러오는 중...");
            review.setContent("팀원 D가 구현 예정");
            review.setRating(5);
            return review;
        }
    }
    
    /**
     * 리뷰 등록
     */
    public int insertReview(ReviewDTO reviewDTO) {
        try {
            // TODO: 팀원 D가 등록 로직 구현
            return reviewMapper.insertReview(reviewDTO);
        } catch (Exception e) {
            // 임시로 성공 반환 (개발 초기 에러 방지)
            return 1;
        }
    }
    
    /**
     * 시설별 리뷰 목록 조회
     */
    public List<ReviewDTO> getReviewsByFacilityId(Long facilityId) {
        try {
            // TODO: 팀원 D가 시설별 리뷰 조회 로직 구현
            return reviewMapper.getReviewsByFacilityId(facilityId);
        } catch (Exception e) {
            // 임시로 빈 리스트 반환 (개발 초기 에러 방지)
            return new ArrayList<>();
        }
    }
    
    /**
     * 리뷰 삭제
     */
    public int deleteReview(Long id) {
        try {
            // TODO: 팀원 D가 삭제 로직 구현
            return reviewMapper.deleteReview(id);
        } catch (Exception e) {
            // 임시로 성공 반환 (개발 초기 에러 방지)
            return 1;
        }
    }
    
    /**
     * 시설의 평균 평점 조회
     */
    public Double getAverageRating(Long facilityId) {
        try {
            // TODO: 팀원 D가 평균 평점 계산 로직 구현
            return reviewMapper.getAverageRating(facilityId);
        } catch (Exception e) {
            // 임시로 기본값 반환 (개발 초기 에러 방지)
            return 0.0;
        }
    }
} 