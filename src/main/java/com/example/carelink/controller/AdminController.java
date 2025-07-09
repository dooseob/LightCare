package com.example.carelink.controller;

import com.example.carelink.common.Constants;
import com.example.carelink.dto.FacilityDTO;
import com.example.carelink.dto.MemberDTO;
import com.example.carelink.service.FacilityService;
import com.example.carelink.service.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import javax.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.List;

/**
 * 관리자 전용 컨트롤러
 * 시설 승인, 회원 관리, 전체 시스템 관리 기능
 */
@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final FacilityService facilityService;
    private final MemberService memberService;

    /**
     * 관리자 권한 확인 메서드
     */
    private boolean isAdmin(HttpSession session) {
        MemberDTO sessionMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        return sessionMember != null && "ADMIN".equals(sessionMember.getRole());
    }

    /**
     * 관리자 대시보드 메인 페이지
     */
    @GetMapping("")
    public String adminDashboard(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
        if (!isAdmin(session)) {
            redirectAttributes.addFlashAttribute("errorMessage", "관리자 권한이 필요합니다.");
            return "redirect:/";
        }

        try {
            // 승인 대기 중인 시설 수
            int pendingFacilities = facilityService.countPendingFacilities();
            
            // 전체 회원 수
            int totalMembers = memberService.getTotalMemberCount();
            
            // 시설 회원 수
            int facilityMembers = memberService.getFacilityMemberCount();
            
            // 일반 회원 수
            int userMembers = totalMembers - facilityMembers;

            model.addAttribute("pendingFacilities", pendingFacilities);
            model.addAttribute("totalMembers", totalMembers);
            model.addAttribute("facilityMembers", facilityMembers);
            model.addAttribute("userMembers", userMembers);

            log.info("관리자 대시보드 접근 - 승인대기: {}, 전체회원: {}", pendingFacilities, totalMembers);

        } catch (Exception e) {
            log.error("관리자 대시보드 로딩 중 오류 발생", e);
            redirectAttributes.addFlashAttribute("errorMessage", "대시보드 정보를 불러오는 중 오류가 발생했습니다.");
        }

        return "admin/dashboard";
    }

    /**
     * 시설 승인 관리 페이지
     */
    @GetMapping("/facilities")
    public String facilityManagement(@RequestParam(defaultValue = "PENDING") String status,
                                   HttpSession session, Model model, RedirectAttributes redirectAttributes) {
        if (!isAdmin(session)) {
            redirectAttributes.addFlashAttribute("errorMessage", "관리자 권한이 필요합니다.");
            return "redirect:/";
        }

        try {
            log.info("시설 승인 관리 페이지 접근 시도 - 상태: {}", status);
            
            List<FacilityDTO> facilities = facilityService.getFacilitiesByApprovalStatus(status);
            log.info("시설 목록 조회 완료 - 상태: {}, 개수: {}", status, facilities != null ? facilities.size() : "null");
            
            // null 체크 및 빈 리스트 기본값 설정
            if (facilities == null) {
                facilities = new ArrayList<>();
                log.warn("시설 목록이 null이어서 빈 리스트로 초기화했습니다.");
            }
            
            model.addAttribute("facilities", facilities);
            model.addAttribute("currentStatus", status);

        } catch (Exception e) {
            log.error("시설 목록 조회 중 오류 발생 - 상태: {}", status, e);
            model.addAttribute("facilities", new ArrayList<>());
            model.addAttribute("currentStatus", status);
            redirectAttributes.addFlashAttribute("errorMessage", "시설 목록을 불러오는 중 오류가 발생했습니다: " + e.getMessage());
        }

        return "admin/facilities";
    }

    /**
     * 시설 승인 처리
     */
    @PostMapping("/facilities/{facilityId}/approve")
    @ResponseBody
    public String approveFacility(@PathVariable Long facilityId, 
                                @RequestParam String action,
                                @RequestParam(required = false) String reason,
                                HttpSession session) {
        if (!isAdmin(session)) {
            return "UNAUTHORIZED";
        }

        try {
            String newStatus;
            if ("approve".equals(action)) {
                newStatus = "APPROVED";
                facilityService.updateFacilityApprovalStatus(facilityId, newStatus, null);
                log.info("시설 승인 완료 - ID: {}", facilityId);
            } else if ("reject".equals(action)) {
                newStatus = "REJECTED";
                facilityService.updateFacilityApprovalStatus(facilityId, newStatus, reason);
                log.info("시설 승인 거부 - ID: {}, 사유: {}", facilityId, reason);
            } else {
                return "INVALID_ACTION";
            }

            return "SUCCESS";

        } catch (Exception e) {
            log.error("시설 승인 처리 중 오류 발생 - ID: {}", facilityId, e);
            return "ERROR";
        }
    }

    /**
     * 회원 관리 페이지
     */
    @GetMapping("/members")
    public String memberManagement(@RequestParam(defaultValue = "ALL") String role,
                                 @RequestParam(defaultValue = "1") int page,
                                 HttpSession session, Model model, RedirectAttributes redirectAttributes) {
        if (!isAdmin(session)) {
            redirectAttributes.addFlashAttribute("errorMessage", "관리자 권한이 필요합니다.");
            return "redirect:/";
        }

        try {
            List<MemberDTO> members = memberService.getMembersByRole(role, page, 20);
            int totalCount = memberService.getMemberCountByRole(role);
            int totalPages = (int) Math.ceil((double) totalCount / 20);

            model.addAttribute("members", members);
            model.addAttribute("currentRole", role);
            model.addAttribute("currentPage", page);
            model.addAttribute("totalPages", totalPages);
            model.addAttribute("totalCount", totalCount);

            log.info("회원 관리 페이지 접근 - 역할: {}, 페이지: {}, 총 개수: {}", role, page, totalCount);

        } catch (Exception e) {
            log.error("회원 목록 조회 중 오류 발생", e);
            redirectAttributes.addFlashAttribute("errorMessage", "회원 목록을 불러오는 중 오류가 발생했습니다.");
        }

        return "admin/members";
    }

    /**
     * 회원 활성화/비활성화 토글
     */
    @PostMapping("/members/{memberId}/toggle-active")
    @ResponseBody
    public String toggleMemberActive(@PathVariable Long memberId, HttpSession session) {
        if (!isAdmin(session)) {
            return "UNAUTHORIZED";
        }

        try {
            boolean result = memberService.toggleMemberActive(memberId);
            log.info("회원 활성화 상태 변경 - ID: {}, 결과: {}", memberId, result);
            return result ? "SUCCESS" : "FAILED";

        } catch (Exception e) {
            log.error("회원 활성화 상태 변경 중 오류 발생 - ID: {}", memberId, e);
            return "ERROR";
        }
    }

    /**
     * 시설 상세 정보 조회 (모달용)
     */
    @GetMapping("/facilities/{facilityId}/detail")
    @ResponseBody
    public FacilityDTO getFacilityDetail(@PathVariable Long facilityId, HttpSession session) {
        if (!isAdmin(session)) {
            return null;
        }

        try {
            return facilityService.getFacilityById(facilityId);
        } catch (Exception e) {
            log.error("시설 상세 정보 조회 중 오류 발생 - ID: {}", facilityId, e);
            return null;
        }
    }

    /**
     * 전체 통계 페이지
     */
    @GetMapping("/statistics")
    public String statistics(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
        if (!isAdmin(session)) {
            redirectAttributes.addFlashAttribute("errorMessage", "관리자 권한이 필요합니다.");
            return "redirect:/";
        }

        try {
            // 각종 통계 데이터 수집
            model.addAttribute("totalMembers", memberService.getTotalMemberCount());
            model.addAttribute("facilityMembers", memberService.getFacilityMemberCount());
            model.addAttribute("approvedFacilities", facilityService.countApprovedFacilities());
            model.addAttribute("pendingFacilities", facilityService.countPendingFacilities());
            model.addAttribute("rejectedFacilities", facilityService.countRejectedFacilities());

            log.info("관리자 통계 페이지 접근");

        } catch (Exception e) {
            log.error("통계 데이터 조회 중 오류 발생", e);
            redirectAttributes.addFlashAttribute("errorMessage", "통계 데이터를 불러오는 중 오류가 발생했습니다.");
        }

        return "admin/statistics";
    }
}