package com.example.carelink.controller;

import com.example.carelink.dto.FacilityDTO; // FacilityDTO를 사용하기 위한 임포트
import com.example.carelink.service.FacilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper; // ObjectMapper 임포트

import java.util.List;

/**
 * 시설 검색 및 지도 기능 컨트롤러
 * 팀원 B 담당
 */
@Controller
@RequestMapping("/facility")
@RequiredArgsConstructor
public class FacilityController {

    private final FacilityService facilityService;
    private final ObjectMapper objectMapper = new ObjectMapper(); // ObjectMapper 인스턴스 생성

    /**
     * 시설 검색 페이지 및 검색 실행
     * (HTML 폼의 GET 요청 처리)
     */
    @GetMapping("/search")
    public String searchPage(
            @RequestParam(value = "facilityName", required = false) String facilityName,
            @RequestParam(value = "region", required = false) String region,
            @RequestParam(value = "facilityType", required = false) String facilityType,
            @RequestParam(value = "gradeRating", required = false) String gradeRating, // HTML의 select name과 일치
            Model model) {

        // FacilityDTO 객체를 생성하여 검색 조건들을 담습니다.
        FacilityDTO searchDTO = new FacilityDTO();
        // === 이 라인이 변경되었습니다 ===
        searchDTO.setName(facilityName); // setFacilityName -> setName 으로 변경
        // ============================
        searchDTO.setRegion(region);
        searchDTO.setFacilityType(facilityType);

        // gradeRating은 String으로 넘어오므로, int로 변환하여 DTO에 설정합니다.
        if (gradeRating != null && !gradeRating.isEmpty()) {
            try {
                searchDTO.setGradeRating(Integer.parseInt(gradeRating));
            } catch (NumberFormatException e) {
                System.err.println("경고: 유효하지 않은 등급 필터 값: " + gradeRating + " (오류: " + e.getMessage() + ")");
            }
        }

        // 검색 서비스 호출
        List<FacilityDTO> facilityList = facilityService.searchFacilities(searchDTO);

        // 모델에 검색 결과를 추가합니다.
        model.addAttribute("facilityList", facilityList);

        // 폼 필드에 현재 검색 조건을 유지하기 위해 모델에 다시 추가합니다.
        model.addAttribute("facilityName", facilityName);
        model.addAttribute("region", region);
        model.addAttribute("facilityType", facilityType);
        model.addAttribute("gradeRating", gradeRating);

        // JavaScript에서 사용할 수 있도록 facilityList를 JSON 문자열로 변환하여 모델에 추가합니다.
        try {
            String facilityListJson = objectMapper.writeValueAsString(facilityList);
            model.addAttribute("facilityListJson", facilityListJson);
        } catch (Exception e) {
            System.err.println("Error converting facilityList to JSON for HTML: " + e.getMessage());
            model.addAttribute("facilityListJson", "[]"); // 오류 발생 시 빈 배열 전달
        }

        return "facility/search"; // 시설 검색 페이지 템플릿 반환
    }

    /**
     * 시설 상세 정보 페이지
     */
    @GetMapping("/detail/{id}")
    public String detailPage(@PathVariable Long id, Model model) {
        FacilityDTO facility = facilityService.getFacilityById(id);
        model.addAttribute("facility", facility);
        return "facility/detail";
    }

    /**
     * 지도용 시설 목록 API (AJAX 요청)
     */
    @GetMapping("/api/list")
    @ResponseBody // JSON 또는 XML 등 데이터 형식으로 응답
    public List<FacilityDTO> getFacilitiesForMap(
            @RequestParam(value = "region", required = false) String region,
            @RequestParam(value = "facilityType", required = false) String facilityType,
            @RequestParam(value = "facilityName", required = false) String facilityName,
            @RequestParam(value = "gradeRating", required = false) String gradeRating,
            @RequestParam(value = "swLat", required = false) Double swLat,
            @RequestParam(value = "swLng", required = false) Double swLng,
            @RequestParam(value = "neLat", required = false) Double neLat,
            @RequestParam(value = "neLng", required = false) Double neLng
    ) {
        FacilityDTO searchDTO = new FacilityDTO();
        // === 이 라인도 변경되었습니다 ===
        searchDTO.setName(facilityName); // setFacilityName -> setName 으로 변경
        // ============================
        searchDTO.setRegion(region);
        searchDTO.setFacilityType(facilityType);

        if (gradeRating != null && !gradeRating.isEmpty()) {
            try {
                searchDTO.setGradeRating(Integer.parseInt(gradeRating));
            } catch (NumberFormatException e) {
                System.err.println("경고: 지도 API 유효하지 않은 등급 필터 값: " + gradeRating);
            }
        }

        searchDTO.setSwLat(swLat);
        searchDTO.setSwLng(swLng);
        searchDTO.setNeLat(neLat);
        searchDTO.setNeLng(neLng);

        return facilityService.searchFacilities(searchDTO);
    }
}