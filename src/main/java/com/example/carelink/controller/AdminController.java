package com.example.carelink.controller;

import com.example.carelink.service.MemberService;
import com.example.carelink.util.PasswordMigrationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

/**
 * 관리자 전용 컨트롤러
 * 시스템 관리 및 데이터 마이그레이션 기능
 */
@Slf4j
@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final MemberService memberService;
    private final PasswordMigrationUtil passwordMigrationUtil;

    /**
     * 관리자 메인 페이지
     */
    @GetMapping
    public String adminMain() {
        return "admin/main";
    }

    /**
     * 비밀번호 마이그레이션 페이지
     */
    @GetMapping("/password-migration")
    public String passwordMigrationPage() {
        return "admin/password-migration";
    }

    /**
     * 비밀번호 마이그레이션 실행
     */
    @PostMapping("/migrate-passwords")
    public String migratePasswords(RedirectAttributes redirectAttributes) {
        try {
            int migratedCount = passwordMigrationUtil.migrateAllPasswords();
            redirectAttributes.addFlashAttribute("message", 
                "비밀번호 마이그레이션 완료: " + migratedCount + "개 계정 처리됨");
            log.info("비밀번호 마이그레이션 완료: {}개 계정", migratedCount);
        } catch (Exception e) {
            log.error("비밀번호 마이그레이션 실패", e);
            redirectAttributes.addFlashAttribute("error", 
                "비밀번호 마이그레이션 중 오류가 발생했습니다: " + e.getMessage());
        }
        
        return "redirect:/admin/password-migration";
    }

    /**
     * 테스트 계정 생성
     */
    @PostMapping("/create-test-accounts")
    public String createTestAccounts(RedirectAttributes redirectAttributes) {
        try {
            passwordMigrationUtil.createTestAccounts();
            redirectAttributes.addFlashAttribute("message", "테스트 계정이 생성되었습니다");
            log.info("테스트 계정 생성 완료");
        } catch (Exception e) {
            log.error("테스트 계정 생성 실패", e);
            redirectAttributes.addFlashAttribute("error", 
                "테스트 계정 생성 중 오류가 발생했습니다: " + e.getMessage());
        }
        
        return "redirect:/admin/password-migration";
    }
} 