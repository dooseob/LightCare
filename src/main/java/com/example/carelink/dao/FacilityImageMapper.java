package com.example.carelink.dao;

import com.example.carelink.dto.FacilityImageDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 시설 이미지 관련 데이터 액세스 매퍼
 */
@Mapper
public interface FacilityImageMapper {

    /**
     * 시설의 모든 이미지 조회 (순서대로)
     */
    List<FacilityImageDTO> getImagesByFacilityId(@Param("facilityId") Long facilityId);

    /**
     * 시설의 메인 이미지 조회
     */
    FacilityImageDTO getMainImageByFacilityId(@Param("facilityId") Long facilityId);

    /**
     * 시설 이미지 추가
     */
    int insertFacilityImage(FacilityImageDTO facilityImageDTO);

    /**
     * 시설 이미지 수정
     */
    int updateFacilityImage(FacilityImageDTO facilityImageDTO);

    /**
     * 시설 이미지 삭제
     */
    int deleteFacilityImage(@Param("imageId") Long imageId);

    /**
     * 시설의 모든 이미지 삭제
     */
    int deleteAllImagesByFacilityId(@Param("facilityId") Long facilityId);

    /**
     * 시설의 이미지 개수 조회
     */
    int countImagesByFacilityId(@Param("facilityId") Long facilityId);

    /**
     * 메인 이미지 설정 (기존 메인 이미지 해제 후 새로 설정)
     */
    int updateMainImage(@Param("facilityId") Long facilityId, @Param("imageId") Long imageId);

    /**
     * 기존 메인 이미지 해제
     */
    int clearMainImages(@Param("facilityId") Long facilityId);
    
    /**
     * 특정 이미지 ID로 이미지 조회
     */
    FacilityImageDTO getImageById(@Param("imageId") Long imageId);
    
    /**
     * 이미지 순서 업데이트 (데이터 정합성 보장)
     */
    int updateImageOrder(@Param("imageId") Long imageId, @Param("imageOrder") Integer imageOrder);
}