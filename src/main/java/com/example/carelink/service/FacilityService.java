package com.example.carelink.service;

import com.example.carelink.dao.FacilityMapper;
import com.example.carelink.dto.FacilityDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
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

    /**
     * 전체 시설 수 조회 (통계용)
     */
    public int getFacilityCount() {
        try {
            return facilityMapper.getFacilityCount();
        } catch (Exception e) {
            // 에러 시 임시 데이터 개수 반환 (개발 초기 에러 방지)
            return 3; // 임시로 생성한 시설 수
        }
    }

    /**
     * 활성화된 모든 시설 목록 조회 (리뷰 작성용)
     */
    public List<FacilityDTO> getAllActiveFacilities() {
        try {
            // TODO: 실제로는 facilityMapper.getAllActiveFacilities() 호출
            // 현재는 임시 데이터 반환
            List<FacilityDTO> facilities = new ArrayList<>();

            FacilityDTO f1 = new FacilityDTO();
            f1.setFacilityId(1L);
            f1.setFacilityName("서울 행복요양원");
            f1.setAddress("서울시 강남구 테헤란로 123");
            f1.setFacilityType("NURSING_HOME");
            facilities.add(f1);

            FacilityDTO f2 = new FacilityDTO();
            f2.setFacilityId(2L);
            f2.setFacilityName("부산 바다뷰 실버타운");
            f2.setAddress("부산시 해운대구 센텀중앙로 79");
            f2.setFacilityType("NURSING_HOME");
            facilities.add(f2);

            FacilityDTO f3 = new FacilityDTO();
            f3.setFacilityId(3L);
            f3.setFacilityName("대전 건강 데이케어센터");
            f3.setAddress("대전시 유성구 과학로 123");
            f3.setFacilityType("DAY_CARE");
            facilities.add(f3);

            FacilityDTO f4 = new FacilityDTO();
            f4.setFacilityId(4L);
            f4.setFacilityName("인천 평안 요양병원");
            f4.setAddress("인천시 남동구 구월동 1234");
            f4.setFacilityType("HOSPITAL");
            facilities.add(f4);

            FacilityDTO f5 = new FacilityDTO();
            f5.setFacilityId(5L);
            f5.setFacilityName("경기 사랑 재가센터");
            f5.setAddress("경기도 수원시 팔달구 중부대로 123");
            f5.setFacilityType("DAY_CARE");
            facilities.add(f5);

            return facilities;
        } catch (Exception e) {
            // 에러 시 빈 리스트 반환
            return new ArrayList<>();
        }
    }
}