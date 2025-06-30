package com.example.carelink.controller;

import com.example.carelink.common.PageInfo;
import com.example.carelink.dto.ReviewDTO;
import com.example.carelink.dto.FacilityDTO;
import com.example.carelink.service.ReviewService;
import com.example.carelink.service.FacilityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
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
                          @RequestParam(required = false) Integer minRating,
                          @RequestParam(required = false) Long facilityId) {
        
        try {
            log.info("리뷰 목록 페이지 접속 - page: {}, keyword: {}, minRating: {}, facilityId: {}", 
                    page, keyword, minRating, facilityId);
            
            PageInfo<ReviewDTO> pageInfo = reviewService.getReviewList(page, keyword, minRating, facilityId);
            model.addAttribute("pageInfo", pageInfo);
            model.addAttribute("reviewList", pageInfo.getList());
            model.addAttribute("keyword", keyword != null ? keyword : "");
            model.addAttribute("minRating", minRating);
            model.addAttribute("facilityId", facilityId);
            model.addAttribute("currentPage", page);
            model.addAttribute("pageTitle", "시설 리뷰");
            
            // 시설별 필터링인 경우 시설 정보도 함께 조회
            if (facilityId != null) {
                try {
                    FacilityDTO facility = facilityService.getFacilityById(facilityId);
                    model.addAttribute("selectedFacility", facility);
                    model.addAttribute("pageTitle", facility.getFacilityName() + " 리뷰");
                } catch (Exception e) {
                    log.warn("시설 정보 조회 실패 - facilityId: {}", facilityId, e);
                }
            }
            
            return "review/list";
        } catch (Exception e) {
            log.error("리뷰 목록 조회 중 오류 발생", e);
            // 에러 발생 시 빈 페이지 정보 전달
            model.addAttribute("pageInfo", new PageInfo<>(List.of(), page, 10, 0));
            model.addAttribute("reviewList", List.of());
            model.addAttribute("keyword", keyword != null ? keyword : "");
            model.addAttribute("minRating", minRating);
            model.addAttribute("facilityId", facilityId);
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
            log.info("리뷰 작성 페이지 접속 - facilityId: {}", facilityId);
            
            ReviewDTO reviewDTO = new ReviewDTO();
            
            // 시설 목록 조회 (시설 선택을 위해)
            List<FacilityDTO> facilityList = facilityService.getAllActiveFacilities();
            log.info("활성화된 시설 목록 조회 완료 - 조회된 건수: {}", facilityList.size());
            
            if (facilityId != null) {
                FacilityDTO selectedFacility = facilityService.getFacilityById(facilityId);
                if (selectedFacility != null) {
                    log.info("선택된 시설 정보 조회 성공 - facilityId: {}, facilityName: {}, status: {}", 
                            facilityId, selectedFacility.getFacilityName(), selectedFacility.getStatus());
                    
                    // 시설 상태 체크
                    if ("삭제됨".equals(selectedFacility.getStatus())) {
                        model.addAttribute("error", "선택하신 시설은 삭제되어 리뷰를 작성할 수 없습니다.");
                    } else if ("승인대기".equals(selectedFacility.getStatus())) {
                        model.addAttribute("error", "선택하신 시설은 아직 승인되지 않아 리뷰를 작성할 수 없습니다.");
                    } else {
                        reviewDTO.setFacilityId(facilityId);
                        model.addAttribute("selectedFacility", selectedFacility);
                    }
                } else {
                    log.warn("선택된 시설을 찾을 수 없음 - facilityId: {}", facilityId);
                    model.addAttribute("error", "선택하신 시설을 찾을 수 없습니다.");
                }
            }
            
            model.addAttribute("reviewDTO", reviewDTO);
            model.addAttribute("facilityList", facilityList);
            model.addAttribute("pageTitle", "리뷰 작성");
            
            return "review/write";
        } catch (Exception e) {
            log.error("리뷰 작성 페이지 로딩 중 오류 발생", e);
            model.addAttribute("error", "리뷰 작성 페이지를 불러오는 중 오류가 발생했습니다: " + e.getMessage());
            return "review/write";
        }
    }
    
    /**
     * 리뷰 등록 처리
     */
    @PostMapping("/write")
    public String writeReview(@ModelAttribute ReviewDTO reviewDTO,
                             RedirectAttributes redirectAttributes) {
        try {
            log.info("리뷰 등록 요청 - title: {}, facilityId: {}", reviewDTO.getTitle(), reviewDTO.getFacilityId());
            
            // 현재 로그인한 사용자 ID 설정 (실제로는 세션에서 가져와야 함)
            // TODO: 실제 서비스에서는 HttpSession에서 로그인 사용자 정보를 가져와야 함
            reviewDTO.setMemberId(2L); // 임시로 2번 사용자로 설정
            
            // 필수 값 검증
            if (reviewDTO.getFacilityId() == null) {
                log.warn("시설이 선택되지 않음");
                redirectAttributes.addFlashAttribute("error", "시설을 선택해주세요.");
                redirectAttributes.addFlashAttribute("reviewDTO", reviewDTO);
                return "redirect:/review/write";
            }
            
            // 시설 존재 여부 및 상태 확인
            FacilityDTO facility = facilityService.getFacilityById(reviewDTO.getFacilityId());
            if (facility == null) {
                log.warn("선택된 시설을 찾을 수 없음 - facilityId: {}", reviewDTO.getFacilityId());
                redirectAttributes.addFlashAttribute("error", "선택한 시설을 찾을 수 없습니다.");
                redirectAttributes.addFlashAttribute("reviewDTO", reviewDTO);
                return "redirect:/review/write";
            }
            
            // 시설 상태 검증
            if (!facilityService.validateFacilityStatus(facility)) {
                log.warn("유효하지 않은 시설 상태 - facilityId: {}, status: {}", 
                        facility.getFacilityId(), facility.getStatus());
                redirectAttributes.addFlashAttribute("error", facility.getStatusMessage());
                redirectAttributes.addFlashAttribute("reviewDTO", reviewDTO);
                return "redirect:/review/write";
            }
            
            log.info("시설 정보 확인 완료 - facilityId: {}, facilityName: {}, status: {}", 
                    facility.getFacilityId(), facility.getFacilityName(), facility.getStatus());
            
            // 제목 검증
            if (reviewDTO.getTitle() == null || reviewDTO.getTitle().trim().isEmpty()) {
                log.warn("제목이 입력되지 않음");
                redirectAttributes.addFlashAttribute("error", "제목을 입력해주세요.");
                redirectAttributes.addFlashAttribute("reviewDTO", reviewDTO);
                return "redirect:/review/write?facilityId=" + reviewDTO.getFacilityId();
            }
            
            // 내용 검증
            if (reviewDTO.getContent() == null || reviewDTO.getContent().trim().length() < 10) {
                log.warn("내용이 10자 미만임");
                redirectAttributes.addFlashAttribute("error", "내용을 10자 이상 입력해주세요.");
                redirectAttributes.addFlashAttribute("reviewDTO", reviewDTO);
                return "redirect:/review/write?facilityId=" + reviewDTO.getFacilityId();
            }
            
            // 평점 검증
            if (reviewDTO.getRating() == null || reviewDTO.getRating() < 1 || reviewDTO.getRating() > 5) {
                log.warn("평점이 유효하지 않음 - rating: {}", reviewDTO.getRating());
                redirectAttributes.addFlashAttribute("error", "평점을 선택해주세요.");
                redirectAttributes.addFlashAttribute("reviewDTO", reviewDTO);
                return "redirect:/review/write?facilityId=" + reviewDTO.getFacilityId();
            }
            
            // 리뷰 등록
            reviewService.insertReview(reviewDTO);
            log.info("리뷰 등록 성공 - reviewId: {}", reviewDTO.getReviewId());
            redirectAttributes.addFlashAttribute("message", "리뷰가 성공적으로 등록되었습니다.");
            
            return "redirect:/review";
        } catch (Exception e) {
            log.error("리뷰 등록 중 오류 발생", e);
            redirectAttributes.addFlashAttribute("error", "리뷰 등록 중 오류가 발생했습니다: " + e.getMessage());
            redirectAttributes.addFlashAttribute("reviewDTO", reviewDTO);
            return "redirect:/review/write?facilityId=" + reviewDTO.getFacilityId();
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