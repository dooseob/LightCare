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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

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

        FacilityDTO searchCondition = new FacilityDTO();
        searchCondition.setFacilityName(facilityName);
        searchCondition.setAddress(region);
        searchCondition.setFacilityType(facilityType);

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
    public String getFacilityDetail(@PathVariable Long facilityId, Model model) {
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
            
            model.addAttribute("facility", facility);
            model.addAttribute("recentReviews", recentReviews);
            model.addAttribute("averageRating", averageRating);
            model.addAttribute("reviewCount", recentReviews.size());
            model.addAttribute("pageTitle", facility.getFacilityName() + " 상세정보");
            
            log.info("시설 상세 정보 조회 완료 - facilityId: {}, 리뷰 수: {}", facilityId, recentReviews.size());
            
            return "facility/detail";
        } catch (Exception e) {
            log.error("시설 상세 정보 조회 중 오류 발생 - facilityId: {}", facilityId, e);
            model.addAttribute("error", "시설 정보를 불러오는 중 오류가 발생했습니다.");
            return "redirect:/facility/search";
        }
    }
}