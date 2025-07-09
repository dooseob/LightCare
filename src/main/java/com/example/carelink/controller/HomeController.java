package com.example.carelink.controller;

import com.example.carelink.service.BoardService;
import com.example.carelink.service.FacilityService;
import com.example.carelink.service.JobService;
import com.example.carelink.service.MemberService;
import com.example.carelink.service.ReviewService;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class HomeController {

    private final MemberService memberService;
    private final FacilityService facilityService;
    private final JobService jobService;
    private final ReviewService reviewService;
    private final BoardService boardService;

    /**
     * 메인 홈페이지
     */
    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("pageTitle", "메인");
        
        try {
            // 실제 통계 데이터 조회
            int facilityCount = facilityService.getFacilityCount();
            int jobCount = jobService.getJobCount();
            int reviewCount = reviewService.getReviewCount();
            int memberCount = memberService.getMemberCount();
            int boardCount = boardService.getBoardCount();
            
            model.addAttribute("facilityCount", facilityCount);
            model.addAttribute("jobCount", jobCount);
            model.addAttribute("reviewCount", reviewCount);
            model.addAttribute("memberCount", memberCount);
            model.addAttribute("boardCount", boardCount);
            
            log.info("통계 데이터 - 시설: {}, 구인구직: {}, 리뷰: {}, 회원: {}, 게시글: {}", 
                    facilityCount, jobCount, reviewCount, memberCount, boardCount);
        } catch (Exception e) {
            log.error("통계 데이터 조회 실패", e);
            // 에러 발생 시 기본값 설정
            model.addAttribute("facilityCount", 0);
            model.addAttribute("jobCount", 0);
            model.addAttribute("reviewCount", 0);
            model.addAttribute("memberCount", 0);
            model.addAttribute("boardCount", 0);
        }
        
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