package com.example.carelink.dao;


import com.example.carelink.dto.FacilityDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 시설 관련 데이터 액세스 매퍼
 * 팀원 B 담당
 */
@Mapper
public interface FacilityMapper {

    /**
     * 시설 검색
     */
    List<FacilityDTO> searchFacilities(FacilityDTO searchDTO);

    /**
     * 시설 상세 정보 조회
     */
    FacilityDTO getFacilityById(@Param("facilityId") Long facilityId);

    /**
     * 전체 시설 목록 조회
     */
    List<FacilityDTO> getAllFacilities();

    /**
     * 활성화된 모든 시설 목록 조회 (리뷰 작성용)
     */
    List<FacilityDTO> getAllActiveFacilities();

    /**
     * 시설 등록
     */
    int insertFacility(FacilityDTO facilityDTO);

    /**
     * 시설 정보 수정
     */
    int updateFacility(FacilityDTO facilityDTO);

    /**
     * 시설 삭제
     */
    int deleteFacility(@Param("facilityId") Long facilityId);

    /**
     * 지역별 시설 개수 조회
     */
    int countFacilitiesByRegion(@Param("region") String region);

    /**
     * 전체 시설 수 조회 (통계용)
     */
    int getFacilityCount();
}
