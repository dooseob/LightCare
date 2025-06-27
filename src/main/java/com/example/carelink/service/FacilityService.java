package com.example.carelink.service;

import com.example.carelink.dao.FacilityMapper;
import com.example.carelink.dto.FacilityDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FacilityService {

    private final FacilityMapper facilityMapper;

    @Autowired
    public FacilityService(FacilityMapper facilityMapper) {
        this.facilityMapper = facilityMapper;
    }

    /**
     * 시설 검색 서비스
     */
    public List<FacilityDTO> searchFacilities(FacilityDTO searchDTO) {
        return facilityMapper.searchFacilities(searchDTO);
    }

    /**
     * 시설 상세 정보 조회 서비스
     */
    public FacilityDTO getFacilityById(Long facilityId) {
        return facilityMapper.getFacilityById(facilityId);
    }

    /**
     * 전체 시설 목록 조회 서비스
     */
    public List<FacilityDTO> getAllFacilities() {
        return facilityMapper.getAllFacilities();
    }

    /**
     * 시설 등록 서비스
     */
    public int insertFacility(FacilityDTO facilityDTO) {
        return facilityMapper.insertFacility(facilityDTO);
    }

    /**
     * 시설 정보 수정 서비스
     */
    public int updateFacility(FacilityDTO facilityDTO) {
        return facilityMapper.updateFacility(facilityDTO);
    }

    /**
     * 시설 삭제 서비스
     */
    public int deleteFacility(Long facilityId) {
        return facilityMapper.deleteFacility(facilityId);
    }

    /**
     * 지역별 시설 개수 조회 서비스
     */
    public int countFacilitiesByRegion(String region) {
        return facilityMapper.countFacilitiesByRegion(region);
    }
}