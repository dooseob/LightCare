package com.example.carelink.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * 홈페이지 컨트롤러
 * 메인 페이지 및 공통 페이지 처리
 */
@Slf4j
@Controller
public class HomeController {

    /**
     * 메인 홈페이지
     */
    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("pageTitle", "메인");
        
        // 임시 통계 데이터 (추후 실제 데이터로 교체)
        model.addAttribute("facilityCount", 150);
        model.addAttribute("jobCount", 89);
        model.addAttribute("reviewCount", 234);
        model.addAttribute("memberCount", 512);
        
        log.info("메인 페이지 접속");
        return "index";
    }

    /**
     * 소개 페이지
     */
    @GetMapping("/about")
    public String about(Model model) {
        model.addAttribute("pageTitle", "소개");
        return "about";
    }

    /**
     * 오류 페이지
     */
    @GetMapping("/error")
    public String error() {
        return "error";
    }
} 