package com.example.carelink.controller;

import com.example.carelink.common.PageInfo;
import com.example.carelink.dto.ReviewDTO;
import com.example.carelink.dto.FacilityDTO;
import com.example.carelink.service.ReviewService;
import com.example.carelink.service.FacilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

/**
 * 시설 리뷰 컨트롤러
 * 팀원 D 담당 - 완전 개선 버전
 */
@Controller
@RequestMapping("/review")
@RequiredArgsConstructor
public class ReviewController {
    
    private final ReviewService reviewService;
    private final FacilityService facilityService;
    
    /**
     * 리뷰 목록 페이지
     */
    @GetMapping
    public String listPage(Model model,
                          @RequestParam(defaultValue = "1") int page,
                          @RequestParam(defaultValue = "") String keyword,
                          @RequestParam(required = false) Integer minRating) {
        
        try {
            PageInfo<ReviewDTO> pageInfo = reviewService.getReviewList(page, keyword, minRating);
            model.addAttribute("pageInfo", pageInfo);
            model.addAttribute("reviewList", pageInfo.getList());
            model.addAttribute("keyword", keyword != null ? keyword : "");
            model.addAttribute("minRating", minRating);
            model.addAttribute("currentPage", page);
            model.addAttribute("pageTitle", "시설 리뷰");
            
            return "review/list";
        } catch (Exception e) {
            // 에러 발생 시 빈 페이지 정보 전달
            model.addAttribute("pageInfo", new PageInfo<>(List.of(), page, 10, 0));
            model.addAttribute("reviewList", List.of());
            model.addAttribute("keyword", keyword != null ? keyword : "");
            model.addAttribute("minRating", minRating);
            model.addAttribute("currentPage", page);
            model.addAttribute("error", "리뷰를 불러오는 중 오류가 발생했습니다: " + e.getMessage());
            
            return "review/list";
        }
    }
    
    /**
     * 리뷰 작성 페이지
     */
    @GetMapping("/write")
    public String writePage(Model model,
                           @RequestParam(required = false) Long facilityId) {
        try {
            ReviewDTO reviewDTO = new ReviewDTO();
            if (facilityId != null) {
                reviewDTO.setFacilityId(facilityId);
            }
            
            // 시설 목록 조회 (시설 선택을 위해)
            List<FacilityDTO> facilityList = facilityService.getAllActiveFacilities();
            
            model.addAttribute("reviewDTO", reviewDTO);
            model.addAttribute("facilityList", facilityList);
            model.addAttribute("pageTitle", "리뷰 작성");
            
            return "review/write";
        } catch (Exception e) {
            model.addAttribute("error", "리뷰 작성 페이지를 불러오는 중 오류가 발생했습니다: " + e.getMessage());
            return "redirect:/review";
        }
    }
    
    /**
     * 리뷰 등록 처리
     */
    @PostMapping("/write")
    public String writeReview(@ModelAttribute ReviewDTO reviewDTO,
                             RedirectAttributes redirectAttributes) {
        try {
            // 현재 로그인한 사용자 ID 설정 (실제로는 세션에서 가져와야 함)
            reviewDTO.setMemberId(2L); // 임시로 2번 사용자로 설정
            
            // 필수 값 검증
            if (reviewDTO.getFacilityId() == null) {
                redirectAttributes.addFlashAttribute("error", "시설을 선택해주세요.");
                return "redirect:/review/write";
            }
            
            if (reviewDTO.getTitle() == null || reviewDTO.getTitle().trim().isEmpty()) {
                redirectAttributes.addFlashAttribute("error", "제목을 입력해주세요.");
                return "redirect:/review/write";
            }
            
            if (reviewDTO.getContent() == null || reviewDTO.getContent().trim().length() < 10) {
                redirectAttributes.addFlashAttribute("error", "내용을 10자 이상 입력해주세요.");
                return "redirect:/review/write";
            }
            
            if (reviewDTO.getRating() == null || reviewDTO.getRating() < 1 || reviewDTO.getRating() > 5) {
                redirectAttributes.addFlashAttribute("error", "평점을 선택해주세요.");
                return "redirect:/review/write";
            }
            
            reviewService.insertReview(reviewDTO);
            redirectAttributes.addFlashAttribute("message", "리뷰가 성공적으로 등록되었습니다.");
            
            return "redirect:/review";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "리뷰 등록 중 오류가 발생했습니다: " + e.getMessage());
            return "redirect:/review/write";
        }
    }
    
    /**
     * 리뷰 상세보기
     */
    @GetMapping("/detail/{id}")
    public String detailPage(@PathVariable Long id, Model model) {
        try {
            ReviewDTO review = reviewService.getReviewById(id);
            
            model.addAttribute("review", review);
            model.addAttribute("pageTitle", review.getTitle());
            
            return "review/detail";
        } catch (Exception e) {
            model.addAttribute("error", "리뷰를 불러올 수 없습니다: " + e.getMessage());
            return "redirect:/review";
        }
    }
    
    /**
     * 시설별 리뷰 목록 API
     */
    @GetMapping("/api/facility/{facilityId}")
    @ResponseBody
    public Map<String, Object> getReviewsByFacility(@PathVariable Long facilityId,
                                                   @RequestParam(defaultValue = "1") int page) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            List<ReviewDTO> reviews = reviewService.getReviewsByFacilityId(facilityId);
            Double averageRating = reviewService.getAverageRating(facilityId);
            
            result.put("success", true);
            result.put("reviews", reviews);
            result.put("averageRating", averageRating);
            result.put("reviewCount", reviews.size());
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "리뷰를 불러오는 중 오류가 발생했습니다.");
        }
        
        return result;
    }
    
    /**
     * 리뷰 추천 API
     */
    @PostMapping("/like/{id}")
    @ResponseBody
    public Map<String, Object> likeReview(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            reviewService.likeReview(id);
            
            // 업데이트된 리뷰 정보 조회
            ReviewDTO review = reviewService.getReviewById(id);
            
            result.put("success", true);
            result.put("likeCount", review.getLikeCount());
            result.put("message", "추천하였습니다.");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "추천 처리 중 오류가 발생했습니다.");
        }
        
        return result;
    }
    
    /**
     * 리뷰 비추천 API
     */
    @PostMapping("/dislike/{id}")
    @ResponseBody
    public Map<String, Object> dislikeReview(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            reviewService.dislikeReview(id);
            
            // 업데이트된 리뷰 정보 조회
            ReviewDTO review = reviewService.getReviewById(id);
            
            result.put("success", true);
            result.put("dislikeCount", review.getDislikeCount());
            result.put("message", "비추천하였습니다.");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "비추천 처리 중 오류가 발생했습니다.");
        }
        
        return result;
    }
    
    /**
     * 리뷰 삭제
     */
    @PostMapping("/delete/{id}")
    public String deleteReview(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            reviewService.deleteReview(id);
            redirectAttributes.addFlashAttribute("message", "리뷰가 성공적으로 삭제되었습니다.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "리뷰 삭제 중 오류가 발생했습니다: " + e.getMessage());
        }
        
        return "redirect:/review";
    }
} 