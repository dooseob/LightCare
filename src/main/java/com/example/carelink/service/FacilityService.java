package com.example.carelink.service;

import com.example.carelink.dao.FacilityMapper;
import com.example.carelink.dto.FacilityDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * 시설 관련 비즈니스 로직 서비스
 * 팀원 B 담당
 */
@Service
@RequiredArgsConstructor
public class FacilityService {
    
    private final FacilityMapper facilityMapper;
    
    /**
     * 시설 검색
     */
    public List<FacilityDTO> searchFacilities(FacilityDTO searchDTO) {
        try {
            // TODO: 팀원 B가 실제 검색 로직 구현
            return facilityMapper.searchFacilities(searchDTO);
        } catch (Exception e) {
            // 임시로 빈 리스트 반환 (개발 초기 에러 방지)
            return new ArrayList<>();
        }
    }
    
    /**
     * 시설 상세 정보 조회
     */
    public FacilityDTO getFacilityById(Long id) {
        try {
            // TODO: 팀원 B가 상세 조회 로직 구현
            return facilityMapper.getFacilityById(id);
        } catch (Exception e) {
            // 임시로 기본 시설 정보 반환 (개발 초기 에러 방지)
            FacilityDTO facility = new FacilityDTO();
            facility.setFacilityId(id);
            facility.setFacilityName("시설 정보를 불러오는 중...");
            facility.setDescription("팀원 B가 구현 예정");
            return facility;
        }
    }
    
    /**
     * 전체 시설 목록 조회
     */
    public List<FacilityDTO> getAllFacilities() {
        try {
            // TODO: 팀원 B가 전체 목록 조회 로직 구현
            return facilityMapper.getAllFacilities();
        } catch (Exception e) {
            // 임시로 빈 리스트 반환 (개발 초기 에러 방지)
            return new ArrayList<>();
        }
    }
} 