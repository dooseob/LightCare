package com.example.carelink.controller;

import com.example.carelink.dto.FacilityDTO;
import com.example.carelink.service.FacilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

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
    
    /**
     * 시설 검색 페이지
     */
    @GetMapping("/search")
    public String searchPage(Model model) {
        // 기본 검색 조건들을 모델에 추가
        model.addAttribute("searchDTO", new FacilityDTO());
        return "facility/search";
    }
    
    /**
     * 시설 검색 실행 (AJAX 요청)
     */
    @PostMapping("/search")
    @ResponseBody
    public List<FacilityDTO> search(@RequestBody FacilityDTO searchDTO) {
        // TODO: 팀원 B가 검색 로직 구현
        return facilityService.searchFacilities(searchDTO);
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
     * 지도용 시설 목록 API
     */
    @GetMapping("/api/list")
    @ResponseBody
    public List<FacilityDTO> getFacilitiesForMap(
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String facilityType) {
        // TODO: 팀원 B가 지도용 API 구현
        FacilityDTO searchDTO = new FacilityDTO();
        searchDTO.setRegion(region);
        searchDTO.setFacilityType(facilityType);
        return facilityService.searchFacilities(searchDTO);
    }
} 