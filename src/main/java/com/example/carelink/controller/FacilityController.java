package com.example.carelink.controller;

import com.example.carelink.dto.FacilityDTO;
import com.example.carelink.service.FacilityService;
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

        try {
            if (gradeRating != null && !gradeRating.isEmpty()) {
                searchCondition.setGradeRating(Integer.parseInt(gradeRating));
            }
        } catch (NumberFormatException e) {
            log.warn("Invalid gradeRating format: {}", gradeRating);
        }

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
// FacilityController.java 파일 내 getFacilityDetail 메서드 수정
    @GetMapping("/detail/{facilityId}")
    public String getFacilityDetail(@PathVariable("facilityId") Long facilityId, Model model) {
        log.info("시설 상세 정보 페이지 접속 - facilityId: {}", facilityId);

        // 서비스에서 ID를 통해 시설 상세 정보를 조회합니다.
        FacilityDTO facility = facilityService.getFacilityById(facilityId);

        if (facility == null) {
            log.warn("ID {} 에 해당하는 시설 정보를 찾을 수 없습니다.", facilityId);
            // 시설 정보가 없을 경우 에러 메시지를 추가하고 리다이렉트
            model.addAttribute("error", "해당 시설 정보를 찾을 수 없습니다.");
            return "redirect:/facility/search";
        }

        // 시설 정보를 모델에 추가합니다.
        model.addAttribute("facility", facility);

        // ⭐ ⭐ ⭐ 추가: 페이지 제목을 모델에 추가 ⭐ ⭐ ⭐
        model.addAttribute("pageTitle", facility.getFacilityName() + " 상세보기");

        return "facility/detail";
    }
}