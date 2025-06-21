package com.example.carelink.controller;

import com.example.carelink.dto.ReviewDTO;
import com.example.carelink.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 시설 리뷰 컨트롤러
 * 팀원 D 담당
 */
@Controller
@RequestMapping("/review")
@RequiredArgsConstructor
public class ReviewController {
    
    private final ReviewService reviewService;
    
    /**
     * 리뷰 목록 페이지
     */
    @GetMapping
    public String listPage(Model model,
                          @RequestParam(defaultValue = "1") int page,
                          @RequestParam(defaultValue = "") String keyword) {
        
        List<ReviewDTO> reviewList = reviewService.getReviewList(page, keyword);
        model.addAttribute("reviewList", reviewList);
        model.addAttribute("keyword", keyword);
        model.addAttribute("currentPage", page);
        
        return "review/list";
    }
    
    /**
     * 리뷰 작성 페이지
     */
    @GetMapping("/write")
    public String writePage(Model model,
                           @RequestParam(required = false) Long facilityId) {
        ReviewDTO reviewDTO = new ReviewDTO();
        if (facilityId != null) {
            reviewDTO.setFacilityId(facilityId);
        }
        model.addAttribute("reviewDTO", reviewDTO);
        return "review/write";
    }
    
    /**
     * 리뷰 등록 처리
     */
    @PostMapping("/write")
    public String writeReview(@ModelAttribute ReviewDTO reviewDTO) {
        // TODO: 팀원 D가 리뷰 등록 로직 구현
        reviewService.insertReview(reviewDTO);
        return "redirect:/review";
    }
    
    /**
     * 리뷰 상세보기
     */
    @GetMapping("/detail/{id}")
    public String detailPage(@PathVariable Long id, Model model) {
        ReviewDTO review = reviewService.getReviewById(id);
        model.addAttribute("review", review);
        return "review/detail";
    }
    
    /**
     * 시설별 리뷰 목록 API
     */
    @GetMapping("/api/facility/{facilityId}")
    @ResponseBody
    public List<ReviewDTO> getReviewsByFacility(@PathVariable Long facilityId) {
        // TODO: 팀원 D가 시설별 리뷰 조회 로직 구현
        return reviewService.getReviewsByFacilityId(facilityId);
    }
    
    /**
     * 리뷰 삭제
     */
    @PostMapping("/delete/{id}")
    public String deleteReview(@PathVariable Long id) {
        // TODO: 팀원 D가 리뷰 삭제 로직 구현
        reviewService.deleteReview(id);
        return "redirect:/review";
    }
} 