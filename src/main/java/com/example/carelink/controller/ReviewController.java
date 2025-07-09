package com.example.carelink.controller;

import com.example.carelink.common.PageInfo;
import com.example.carelink.common.Constants;
import com.example.carelink.dto.ReviewDTO;
import com.example.carelink.dto.FacilityDTO;
import com.example.carelink.dto.MemberDTO;
import com.example.carelink.service.ReviewService;
import com.example.carelink.service.FacilityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import javax.servlet.http.HttpSession;
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
                           @RequestParam(required = false) Long facilityId,
                           HttpSession session,
                           RedirectAttributes redirectAttributes) {
        
        // 로그인 체크
        MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        if (loginMember == null) {
            log.warn("로그인하지 않은 사용자의 리뷰 작성 페이지 접속 시도");
            redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
            return "redirect:/member/login";
        }
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
                             HttpSession session,
                             RedirectAttributes redirectAttributes) {
        try {
            log.info("리뷰 등록 요청 - title: {}, facilityId: {}", reviewDTO.getTitle(), reviewDTO.getFacilityId());
            
            // 현재 로그인한 사용자 ID 설정 (세션에서 가져오기)
            MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
            if (loginMember == null) {
                log.warn("로그인하지 않은 사용자의 리뷰 작성 시도");
                redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
                return "redirect:/member/login";
            }
            
            reviewDTO.setMemberId(loginMember.getMemberId());
            log.info("리뷰 작성자 설정 - memberId: {}, userId: {}", loginMember.getMemberId(), loginMember.getUserId());
            
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
    public String detailPage(@PathVariable Long id, Model model, HttpSession session) {
        try {
            ReviewDTO review = reviewService.getReviewById(id);
            
            if (review == null) {
                model.addAttribute("error", "리뷰를 찾을 수 없습니다.");
                return "redirect:/review";
            }
            
            // 조회수 증가
            reviewService.incrementViewCount(id);
            
            // 같은 시설의 다른 리뷰들 조회 (최대 5개)
            List<ReviewDTO> otherReviews = reviewService.getReviewsByFacilityId(review.getFacilityId())
                    .stream()
                    .filter(r -> !r.getReviewId().equals(id))
                    .limit(5)
                    .collect(java.util.stream.Collectors.toList());
            
            model.addAttribute("review", review);
            model.addAttribute("otherReviews", otherReviews);
            model.addAttribute("pageTitle", review.getTitle());
            model.addAttribute("currentMemberId", getCurrentMemberId(session)); // 현재 사용자 ID 추가
            
            return "review/detail";
        } catch (Exception e) {
            log.error("리뷰 상세보기 중 오류 발생 - reviewId: {}", id, e);
            model.addAttribute("error", "리뷰를 불러올 수 없습니다: " + e.getMessage());
            return "redirect:/review";
        }
    }
    
    /**
     * 리뷰 수정 페이지
     */
    @GetMapping("/edit/{id}")
    public String editPage(@PathVariable Long id, Model model, HttpSession session, RedirectAttributes redirectAttributes) {
        try {
            ReviewDTO review = reviewService.getReviewById(id);
            
            if (review == null) {
                redirectAttributes.addFlashAttribute("error", "수정할 리뷰를 찾을 수 없습니다.");
                return "redirect:/review";
            }
            
            // 작성자 또는 관리자 권한 확인
            if (!hasEditPermission(session, review.getMemberId())) {
                redirectAttributes.addFlashAttribute("error", "작성자 또는 관리자만 수정할 수 있습니다.");
                return "redirect:/review/detail/" + id;
            }
            
            model.addAttribute("reviewDTO", review);
            model.addAttribute("pageTitle", "리뷰 수정");
            
            return "review/edit";
        } catch (Exception e) {
            log.error("리뷰 수정 페이지 로딩 중 오류 발생 - reviewId: {}", id, e);
            redirectAttributes.addFlashAttribute("error", "수정 페이지를 불러오는 중 오류가 발생했습니다: " + e.getMessage());
            return "redirect:/review";
        }
    }
    
    /**
     * 리뷰 수정 처리
     */
    @PostMapping("/update")
    public String updateReview(@ModelAttribute ReviewDTO reviewDTO, HttpSession session, RedirectAttributes redirectAttributes) {
        try {
            log.info("리뷰 수정 요청 - reviewId: {}, title: {}", reviewDTO.getReviewId(), reviewDTO.getTitle());
            
            // 기존 리뷰 조회
            ReviewDTO existingReview = reviewService.getReviewById(reviewDTO.getReviewId());
            if (existingReview == null) {
                redirectAttributes.addFlashAttribute("error", "수정할 리뷰를 찾을 수 없습니다.");
                return "redirect:/review";
            }
            
            // 작성자 또는 관리자 권한 확인
            if (!hasEditPermission(session, existingReview.getMemberId())) {
                redirectAttributes.addFlashAttribute("error", "작성자 또는 관리자만 수정할 수 있습니다.");
                return "redirect:/review/detail/" + reviewDTO.getReviewId();
            }
            
            // 제목 검증
            if (reviewDTO.getTitle() == null || reviewDTO.getTitle().trim().isEmpty()) {
                redirectAttributes.addFlashAttribute("error", "제목을 입력해주세요.");
                redirectAttributes.addFlashAttribute("reviewDTO", reviewDTO);
                return "redirect:/review/edit/" + reviewDTO.getReviewId();
            }
            
            // 내용 검증
            if (reviewDTO.getContent() == null || reviewDTO.getContent().trim().length() < 10) {
                redirectAttributes.addFlashAttribute("error", "내용을 10자 이상 입력해주세요.");
                redirectAttributes.addFlashAttribute("reviewDTO", reviewDTO);
                return "redirect:/review/edit/" + reviewDTO.getReviewId();
            }
            
            // 평점 검증
            if (reviewDTO.getRating() == null || reviewDTO.getRating() < 1 || reviewDTO.getRating() > 5) {
                redirectAttributes.addFlashAttribute("error", "평점을 선택해주세요.");
                redirectAttributes.addFlashAttribute("reviewDTO", reviewDTO);
                return "redirect:/review/edit/" + reviewDTO.getReviewId();
            }
            
            // 수정할 수 없는 필드들 기존 값 유지
            reviewDTO.setFacilityId(existingReview.getFacilityId());
            reviewDTO.setMemberId(existingReview.getMemberId());
            reviewDTO.setViewCount(existingReview.getViewCount());
            reviewDTO.setLikeCount(existingReview.getLikeCount());
            reviewDTO.setDislikeCount(existingReview.getDislikeCount());
            reviewDTO.setCreatedAt(existingReview.getCreatedAt());
            
            // 리뷰 수정
            reviewService.updateReview(reviewDTO);
            log.info("리뷰 수정 성공 - reviewId: {}", reviewDTO.getReviewId());
            
            redirectAttributes.addFlashAttribute("message", "리뷰가 성공적으로 수정되었습니다.");
            return "redirect:/review/detail/" + reviewDTO.getReviewId();
        } catch (Exception e) {
            log.error("리뷰 수정 중 오류 발생 - reviewId: {}", reviewDTO.getReviewId(), e);
            redirectAttributes.addFlashAttribute("error", "리뷰 수정 중 오류가 발생했습니다: " + e.getMessage());
            redirectAttributes.addFlashAttribute("reviewDTO", reviewDTO);
            return "redirect:/review/edit/" + reviewDTO.getReviewId();
        }
    }
    
    /**
     * 리뷰 삭제
     */
    @PostMapping("/delete/{id}")
    public String deleteReview(@PathVariable Long id, HttpSession session, RedirectAttributes redirectAttributes) {
        try {
            // 기존 리뷰 조회
            ReviewDTO existingReview = reviewService.getReviewById(id);
            if (existingReview == null) {
                redirectAttributes.addFlashAttribute("error", "삭제할 리뷰를 찾을 수 없습니다.");
                return "redirect:/review";
            }
            
            // 작성자 또는 관리자 권한 확인
            if (!hasEditPermission(session, existingReview.getMemberId())) {
                redirectAttributes.addFlashAttribute("error", "작성자 또는 관리자만 삭제할 수 있습니다.");
                return "redirect:/review/detail/" + id;
            }
            
            reviewService.deleteReview(id);
            redirectAttributes.addFlashAttribute("message", "리뷰가 성공적으로 삭제되었습니다.");
        } catch (Exception e) {
            log.error("리뷰 삭제 중 오류 발생 - reviewId: {}", id, e);
            redirectAttributes.addFlashAttribute("error", "리뷰 삭제 중 오류가 발생했습니다: " + e.getMessage());
        }
        
        return "redirect:/review";
    }
    
    /**
     * 리뷰 신고 API
     */
    @PostMapping("/report/{id}")
    @ResponseBody
    public Map<String, Object> reportReview(@PathVariable Long id, @RequestBody Map<String, String> request, HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            String reason = request.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                result.put("success", false);
                result.put("message", "신고 사유를 입력해주세요.");
                return result;
            }
            
            // 리뷰 존재 확인
            ReviewDTO review = reviewService.getReviewById(id);
            if (review == null) {
                result.put("success", false);
                result.put("message", "신고할 리뷰를 찾을 수 없습니다.");
                return result;
            }
            
            // 본인 리뷰 신고 방지
            Long currentMemberId = getCurrentMemberId(session);
            if (review.getMemberId().equals(currentMemberId)) {
                result.put("success", false);
                result.put("message", "본인이 작성한 리뷰는 신고할 수 없습니다.");
                return result;
            }
            
            // TODO: 실제 신고 처리 로직 구현
            // 현재는 로그만 남김
            log.info("리뷰 신고 접수 - reviewId: {}, reason: {}, reporter: {}", id, reason, currentMemberId);
            
            result.put("success", true);
            result.put("message", "신고가 접수되었습니다. 검토 후 적절한 조치를 취하겠습니다.");
        } catch (Exception e) {
            log.error("리뷰 신고 처리 중 오류 발생 - reviewId: {}", id, e);
            result.put("success", false);
            result.put("message", "신고 처리 중 오류가 발생했습니다.");
        }
        
        return result;
    }
    
    /**
     * 조회수 증가 API
     */
    @PostMapping("/view/{id}")
    @ResponseBody
    public Map<String, Object> incrementViewCount(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            reviewService.incrementViewCount(id);
            result.put("success", true);
        } catch (Exception e) {
            log.error("조회수 증가 중 오류 발생 - reviewId: {}", id, e);
            result.put("success", false);
            result.put("message", "조회수 업데이트 중 오류가 발생했습니다.");
        }
        
        return result;
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
     * 현재 로그인한 사용자 ID 조회 (세션 기반)
     */
    private Long getCurrentMemberId(HttpSession session) {
        return (Long) session.getAttribute("memberId");
    }
    
    /**
     * 현재 사용자가 관리자인지 확인
     */
    private boolean isAdmin(HttpSession session) {
        MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        return loginMember != null && "ADMIN".equals(loginMember.getRole());
    }
    
    /**
     * 수정/삭제 권한 확인 (작성자 또는 관리자)
     */
    private boolean hasEditPermission(HttpSession session, Long authorMemberId) {
        Long currentMemberId = getCurrentMemberId(session);
        return (currentMemberId != null && currentMemberId.equals(authorMemberId)) || isAdmin(session);
    }
} 