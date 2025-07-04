package com.example.carelink.controller;

import com.example.carelink.dto.FacilityDTO;
import com.example.carelink.dto.ReviewDTO;
import com.example.carelink.service.FacilityService;
import com.example.carelink.service.ReviewService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import com.example.carelink.dto.MemberDTO;
import com.example.carelink.common.Constants;
import javax.servlet.http.HttpSession;

import java.util.List;
import java.util.ArrayList; // ArrayList를 사용하기 위해 추가된 import 문

@Controller
@RequestMapping("/facility")
@RequiredArgsConstructor
@Slf4j
public class FacilityController {

    private final FacilityService facilityService;
    private final ReviewService reviewService;

    /**
     * Jackson ObjectMapper에 Java 8 날짜/시간 모듈을 등록합니다.
     * 이 메서드는 Spring 컨텍스트에 ObjectMapper 빈을 등록하여
     * LocalDateTime 직렬화 문제를 해결합니다.
     */
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        return mapper;
    }

    /**
     * 시설 검색 페이지 및 검색 결과 조회
     */
    @GetMapping("/search")
    public String searchFacilities(
            @RequestParam(value = "facilityName", required = false) String facilityName,
            @RequestParam(value = "region", required = false) String region,
            @RequestParam(value = "facilityType", required = false) String facilityType,
            @RequestParam(value = "gradeRating", required = false) String gradeRating,
            Model model
    ) {
        log.info("시설 검색 페이지 접속 - facilityName: {}, region: {}, facilityType: {}, gradeRating: {}",
                facilityName, region, facilityType, gradeRating);

        // 빈 문자열을 null로 변환
        facilityName = (facilityName != null && facilityName.trim().isEmpty()) ? null : facilityName;
        region = (region != null && region.trim().isEmpty()) ? null : region;
        facilityType = (facilityType != null && facilityType.trim().isEmpty()) ? null : facilityType;

        FacilityDTO searchCondition = new FacilityDTO();
        searchCondition.setFacilityName(facilityName != null ? facilityName.trim() : null);
        searchCondition.setFacilityType(facilityType);
        searchCondition.setAddress(region); // 지역 검색용

        // gradeRating 기능은 현재 데이터베이스 스키마에 없으므로 비활성화
        // try {
        //     if (gradeRating != null && !gradeRating.isEmpty()) {
        //         searchCondition.setGradeRating(Integer.parseInt(gradeRating));
        //     }
        // } catch (NumberFormatException e) {
        //     log.warn("Invalid gradeRating format: {}", gradeRating);
        // }

        // DTO 객체를 서비스 메서드로 전달하여 검색을 수행합니다.
        List<FacilityDTO> facilityList = facilityService.searchFacilities(searchCondition);

        // 검색 결과가 null일 경우 빈 리스트로 초기화하여 Thymeleaf 오류를 방지합니다.
        if (facilityList == null) {
            facilityList = new ArrayList<>();
        }

        // 검색 결과를 모델에 추가합니다.
        model.addAttribute("facilityList", facilityList);
        model.addAttribute("facilityName", facilityName);
        model.addAttribute("region", region);
        model.addAttribute("facilityType", facilityType);
        model.addAttribute("gradeRating", gradeRating);

        log.info("검색된 시설 수: {}", facilityList.size());

        // 'search.html' 템플릿을 반환합니다.
        return "facility/search";
    }

    /**
     * 시설 상세 정보 페이지
     */
    @GetMapping("/detail/{facilityId}")
    public String getFacilityDetail(@PathVariable Long facilityId, Model model, HttpSession session) {
        log.info("시설 상세 정보 페이지 접속 - facilityId: {}", facilityId);
        
        try {
            // 시설 정보 조회
            FacilityDTO facility = facilityService.getFacilityById(facilityId);
            if (facility == null) {
                model.addAttribute("error", "해당 시설을 찾을 수 없습니다.");
                return "redirect:/facility/search";
            }
            
            // 해당 시설의 리뷰 목록 조회 (최근 5개)
            List<ReviewDTO> recentReviews = reviewService.getReviewsByFacilityId(facilityId);
            if (recentReviews.size() > 5) {
                recentReviews = recentReviews.subList(0, 5);
            }
            
            // 시설의 평균 평점 조회
            Double averageRating = reviewService.getAverageRating(facilityId);
            
            // 세션에서 사용자 정보 조회 (관리자 권한 체크용)
            MemberDTO sessionMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
            boolean isAdmin = sessionMember != null && "ADMIN".equals(sessionMember.getRole());
            boolean isOwner = sessionMember != null && facility.getRegisteredMemberId() != null && 
                             facility.getRegisteredMemberId().equals(sessionMember.getMemberId());
            
            model.addAttribute("facility", facility);
            model.addAttribute("recentReviews", recentReviews);
            model.addAttribute("averageRating", averageRating);
            model.addAttribute("reviewCount", recentReviews.size());
            model.addAttribute("pageTitle", facility.getFacilityName() + " 상세정보");
            model.addAttribute("sessionMember", sessionMember);
            model.addAttribute("isAdmin", isAdmin);
            model.addAttribute("isOwner", isOwner);
            
            log.info("시설 상세 정보 조회 완료 - facilityId: {}, 리뷰 수: {}, 관리자: {}, 소유자: {}", 
                    facilityId, recentReviews.size(), isAdmin, isOwner);
            
            return "facility/detail";
        } catch (Exception e) {
            log.error("시설 상세 정보 조회 중 오류 발생 - facilityId: {}", facilityId, e);
            model.addAttribute("error", "시설 정보를 불러오는 중 오류가 발생했습니다.");
            return "redirect:/facility/search";
        }
    }

    /**
     * 시설 관리 페이지
     */
    @GetMapping("/manage")
    public String manageFacility(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
        MemberDTO member = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        
        if (member == null) {
            redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
            return "redirect:/member/login";
        }
        
        if (!Constants.MEMBER_ROLE_FACILITY.equals(member.getRole())) {
            redirectAttributes.addFlashAttribute("error", "시설 회원만 접근할 수 있습니다.");
            return "redirect:/";
        }
        
        try {
            // 회원의 모든 시설 정보 조회
            List<FacilityDTO> facilities = facilityService.getFacilitiesByMemberId(member.getMemberId());
            
            // 각 시설별 구인공고 수 조회 (TODO: 향후 JobService에서 조회)
            // for (FacilityDTO facility : facilities) {
            //     int jobCount = jobService.getJobCountByFacilityId(facility.getFacilityId());
            //     facility.setJobCount(jobCount);
            // }
            
            model.addAttribute("facilities", facilities);
            model.addAttribute("facilityCount", facilities.size());
            log.info("시설 관리 페이지 접근: memberId={}, 시설 수={}", 
                    member.getMemberId(), facilities.size());
            
            return "facility/manage";
        } catch (Exception e) {
            log.error("시설 관리 페이지 조회 중 오류 발생: memberId={}", member.getMemberId(), e);
            redirectAttributes.addFlashAttribute("error", "시설 정보를 불러오는 중 오류가 발생했습니다.");
            return "redirect:/";
        }
    }

    /**
     * 시설 수정 페이지
     */
    @GetMapping("/edit/{facilityId}")
    public String editFacilityForm(@PathVariable Long facilityId, HttpSession session, 
                                   Model model, RedirectAttributes redirectAttributes) {
        MemberDTO member = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        
        if (member == null) {
            redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
            return "redirect:/member/login";
        }
        
        try {
            FacilityDTO facility = facilityService.getFacilityById(facilityId);
            
            if (facility == null) {
                redirectAttributes.addFlashAttribute("error", "시설을 찾을 수 없습니다.");
                return "redirect:/facility/manage";
            }
            
            // 권한 확인 (시설 소유자 또는 관리자만 수정 가능)
            if (!facility.getRegisteredMemberId().equals(member.getMemberId()) 
                && !Constants.MEMBER_ROLE_ADMIN.equals(member.getRole())) {
                redirectAttributes.addFlashAttribute("error", "해당 시설을 수정할 권한이 없습니다.");
                return "redirect:/facility/manage";
            }
            
            model.addAttribute("facility", facility);
            log.info("시설 수정 페이지 접근: facilityId={}, memberId={}", facilityId, member.getMemberId());
            
            return "facility/edit";
        } catch (Exception e) {
            log.error("시설 수정 페이지 조회 중 오류 발생: facilityId={}", facilityId, e);
            redirectAttributes.addFlashAttribute("error", "시설 정보를 불러오는 중 오류가 발생했습니다.");
            return "redirect:/facility/manage";
        }
    }

    /**
     * 시설 수정 처리
     */
    @PostMapping("/edit/{facilityId}")
    public String updateFacility(@PathVariable Long facilityId,
                                @ModelAttribute FacilityDTO facilityDTO,
                                @RequestParam(value = "facilityImageFile", required = false) MultipartFile facilityImageFile,
                                HttpSession session,
                                RedirectAttributes redirectAttributes) {
        MemberDTO member = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        
        if (member == null) {
            redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
            return "redirect:/member/login";
        }
        
        try {
            FacilityDTO existingFacility = facilityService.getFacilityById(facilityId);
            
            if (existingFacility == null) {
                redirectAttributes.addFlashAttribute("error", "시설을 찾을 수 없습니다.");
                return "redirect:/facility/manage";
            }
            
            // 권한 확인
            if (!existingFacility.getRegisteredMemberId().equals(member.getMemberId()) 
                && !Constants.MEMBER_ROLE_ADMIN.equals(member.getRole())) {
                redirectAttributes.addFlashAttribute("error", "해당 시설을 수정할 권한이 없습니다.");
                return "redirect:/facility/manage";
            }
            
            // 기본 정보 유지
            facilityDTO.setFacilityId(facilityId);
            facilityDTO.setRegisteredMemberId(existingFacility.getRegisteredMemberId());
            facilityDTO.setIsApproved(existingFacility.getIsApproved());
            
            // approval_status가 null인 경우 기본값 설정
            String approvalStatus = existingFacility.getApprovalStatus();
            if (approvalStatus == null || approvalStatus.trim().isEmpty()) {
                approvalStatus = existingFacility.getIsApproved() ? "APPROVED" : "PENDING";
            }
            facilityDTO.setApprovalStatus(approvalStatus);
            
            facilityDTO.setAverageRating(existingFacility.getAverageRating());
            facilityDTO.setReviewCount(existingFacility.getReviewCount());
            facilityDTO.setCurrentOccupancy(existingFacility.getCurrentOccupancy());
            facilityDTO.setGradeRating(existingFacility.getGradeRating());
            
            // 시설 정보 수정 (이미지 파일 포함)
            facilityService.updateFacility(facilityDTO, facilityImageFile);
            
            log.info("시설 정보 수정 완료: facilityId={}, memberId={}", facilityId, member.getMemberId());
            redirectAttributes.addFlashAttribute("message", "시설 정보가 성공적으로 수정되었습니다.");
            
            return "redirect:/facility/manage";
        } catch (Exception e) {
            log.error("시설 정보 수정 중 오류 발생: facilityId={}", facilityId, e);
            redirectAttributes.addFlashAttribute("error", "시설 정보 수정 중 오류가 발생했습니다.");
            return "redirect:/facility/edit/" + facilityId;
        }
    }

    /**
     * 시설 삭제
     */
    @PostMapping("/delete/{facilityId}")
    public String deleteFacility(@PathVariable Long facilityId,
                                HttpSession session,
                                RedirectAttributes redirectAttributes) {
        MemberDTO member = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        
        if (member == null) {
            redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
            return "redirect:/member/login";
        }
        
        try {
            FacilityDTO facility = facilityService.getFacilityById(facilityId);
            
            if (facility == null) {
                redirectAttributes.addFlashAttribute("error", "시설을 찾을 수 없습니다.");
                return "redirect:/facility/manage";
            }
            
            // 권한 확인
            if (!facility.getRegisteredMemberId().equals(member.getMemberId()) 
                && !Constants.MEMBER_ROLE_ADMIN.equals(member.getRole())) {
                redirectAttributes.addFlashAttribute("error", "해당 시설을 삭제할 권한이 없습니다.");
                return "redirect:/facility/manage";
            }
            
            // 시설 삭제
            facilityService.deleteFacility(facilityId);
            
            log.info("시설 삭제 완료: facilityId={}, memberId={}", facilityId, member.getMemberId());
            redirectAttributes.addFlashAttribute("message", "시설이 성공적으로 삭제되었습니다.");
            
            return "redirect:/facility/manage";
        } catch (Exception e) {
            log.error("시설 삭제 중 오류 발생: facilityId={}", facilityId, e);
            redirectAttributes.addFlashAttribute("error", "시설 삭제 중 오류가 발생했습니다.");
            return "redirect:/facility/manage";
        }
    }

    /**
     * 시설 API - AJAX용
     */
    @GetMapping("/api/{facilityId}")
    @ResponseBody
    public FacilityDTO getFacilityApi(@PathVariable Long facilityId, HttpSession session) {
        MemberDTO member = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        
        if (member == null) {
            throw new RuntimeException("로그인이 필요합니다.");
        }
        
        FacilityDTO facility = facilityService.getFacilityById(facilityId);
        
        if (facility == null) {
            throw new RuntimeException("시설을 찾을 수 없습니다.");
        }
        
        // 권한 확인 (시설 소유자 또는 관리자만 조회 가능)
        if (!facility.getRegisteredMemberId().equals(member.getMemberId()) 
            && !Constants.MEMBER_ROLE_ADMIN.equals(member.getRole())) {
            throw new RuntimeException("해당 시설을 조회할 권한이 없습니다.");
        }
        
        return facility;
    }
}