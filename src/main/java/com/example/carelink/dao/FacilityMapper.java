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

    /**
     * 회원 ID로 시설 삭제 (회원 탈퇴 시 사용)
     */
    int deleteByMemberId(@Param("memberId") Long memberId);

    /**
     * 회원 ID로 시설 목록 조회
     */
    List<FacilityDTO> getFacilitiesByMemberId(@Param("memberId") Long memberId);
    
    /**
     * 회원 ID로 시설 조회 (단일 조회 - 하위 호환성 유지)
     */
    FacilityDTO getFacilityByMemberId(@Param("memberId") Long memberId);
    
    /**
     * 시설 메인 이미지 정보 업데이트
     */
    int updateFacilityMainImage(@Param("facilityId") Long facilityId, 
                               @Param("mainImagePath") String mainImagePath, 
                               @Param("imageCount") Integer imageCount);

    // ================== 관리자용 메서드들 ==================

    /**
     * 승인 상태별 시설 목록 조회 (관리자용)
     */
    List<FacilityDTO> getFacilitiesByApprovalStatus(@Param("approvalStatus") String approvalStatus);

    /**
     * 시설 승인 상태 업데이트 (관리자용)
     */
    int updateFacilityApprovalStatus(@Param("facilityId") Long facilityId, 
                                   @Param("approvalStatus") String approvalStatus, 
                                   @Param("rejectionReason") String rejectionReason);

    /**
     * 승인 상태별 시설 수 조회 (관리자용)
     */
    int countFacilitiesByStatus(@Param("approvalStatus") String approvalStatus);
}
