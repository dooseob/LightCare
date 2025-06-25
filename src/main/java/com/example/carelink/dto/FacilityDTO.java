package com.example.carelink.dto;

import com.example.carelink.common.BaseDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
public class FacilityDTO extends BaseDTO {

    private Long facilityId;          // 시설 ID
    private String name;              // 시설명
    private String address;           // 주소
    private String phone;             // 전화번호
    private String email; // 이메일
    private String facilityType;      // 시설 유형 (ex: 요양원, 주간보호센터)
    private Double latitude;          // 위도
    private Double longitude;         // 경도
    private String region;            // 지역 (시/도 단위, 검색 필터용)
    private Double averageRating;     // 평균 평점

    private Integer gradeRating;      // 등급 필터

    private String logoImageUrl; // 시설 로고 이미지 URL 필드

    private String directorName;

    private LocalDateTime established;

    private Double swLat; // South-West Latitude
    private Double swLng; // South-West Longitude
    private Double neLat; // North-East Latitude
    private Double neLng; // North-East Longitude

}