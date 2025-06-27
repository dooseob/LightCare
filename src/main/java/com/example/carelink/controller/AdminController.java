package com.example.carelink.controller;

import com.example.carelink.common.Constants;
import com.example.carelink.dto.MemberDTO;
import com.example.carelink.util.PasswordMigrationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import javax.servlet.http.HttpSession;

/**
 * 관리자 전용 컨트롤러
 * 시스템 관리 기능 제공
 */
@Slf4j
@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final PasswordMigrationUtil passwordMigrationUtil;

    /**
     * 관리자 페이지 메인
     */
    @GetMapping("/dashboard")
    public String dashboard(HttpSession session, RedirectAttributes redirectAttributes) {
        MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        
        // 관리자 권한 확인
        if (loginMember == null || !Constants.MEMBER_ROLE_ADMIN.equals(loginMember.getRole())) {
            redirectAttributes.addFlashAttribute("error", "관리자 권한이 필요합니다.");
            return "redirect:/";
        }
        
        return "admin/dashboard";
    }

    /**
     * 비밀번호 마이그레이션 페이지
     */
    @GetMapping("/password-migration")
    public String passwordMigrationPage(HttpSession session, RedirectAttributes redirectAttributes) {
        MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        
        // 관리자 권한 확인
        if (loginMember == null || !Constants.MEMBER_ROLE_ADMIN.equals(loginMember.getRole())) {
            redirectAttributes.addFlashAttribute("error", "관리자 권한이 필요합니다.");
            return "redirect:/";
        }
        
        return "admin/password-migration";
    }

    /**
     * 모든 회원 비밀번호 마이그레이션 실행
     */
    @PostMapping("/migrate-all-passwords")
    public String migrateAllPasswords(HttpSession session, RedirectAttributes redirectAttributes) {
        MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        
        // 관리자 권한 확인
        if (loginMember == null || !Constants.MEMBER_ROLE_ADMIN.equals(loginMember.getRole())) {
            redirectAttributes.addFlashAttribute("error", "관리자 권한이 필요합니다.");
            return "redirect:/";
        }
        
        try {
            passwordMigrationUtil.migrateAllPasswords();
            redirectAttributes.addFlashAttribute("message", "모든 회원의 비밀번호 마이그레이션이 완료되었습니다.");
            log.info("관리자 {}가 전체 비밀번호 마이그레이션을 실행했습니다.", loginMember.getUserId());
            
        } catch (Exception e) {
            log.error("비밀번호 마이그레이션 실행 중 오류 발생", e);
            redirectAttributes.addFlashAttribute("error", "비밀번호 마이그레이션 중 오류가 발생했습니다: " + e.getMessage());
        }
        
        return "redirect:/admin/password-migration";
    }

    /**
     * 특정 회원 비밀번호 마이그레이션 실행
     */
    @PostMapping("/migrate-user-password")
    public String migrateUserPassword(@RequestParam String userId,
                                    HttpSession session, 
                                    RedirectAttributes redirectAttributes) {
        MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        
        // 관리자 권한 확인
        if (loginMember == null || !Constants.MEMBER_ROLE_ADMIN.equals(loginMember.getRole())) {
            redirectAttributes.addFlashAttribute("error", "관리자 권한이 필요합니다.");
            return "redirect:/";
        }
        
        try {
            passwordMigrationUtil.migratePasswordForUser(userId);
            redirectAttributes.addFlashAttribute("message", 
                String.format("사용자 '%s'의 비밀번호 마이그레이션이 완료되었습니다.", userId));
            log.info("관리자 {}가 사용자 {}의 비밀번호 마이그레이션을 실행했습니다.", 
                loginMember.getUserId(), userId);
            
        } catch (Exception e) {
            log.error("사용자 {}의 비밀번호 마이그레이션 실행 중 오류 발생", userId, e);
            redirectAttributes.addFlashAttribute("error", 
                String.format("사용자 '%s'의 비밀번호 마이그레이션 중 오류가 발생했습니다: %s", userId, e.getMessage()));
        }
        
        return "redirect:/admin/password-migration";
    }
} 