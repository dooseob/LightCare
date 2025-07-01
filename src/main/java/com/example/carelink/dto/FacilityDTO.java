package com.example.carelink.dto;

import com.example.carelink.common.BaseDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 시설 정보를 담는 데이터 전송 객체 (DTO)
 * DB 스키마 및 Mapper의 property 이름에 맞춰 필드명을 설정합니다.
 */
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class FacilityDTO extends BaseDTO {

    // DB 컬럼과 일치하는 필드 (snake_case는 camelCase로 변환)
    private Long facilityId; // DB: facility_id
    private String facilityName; // DB: facility_name
    private String facilityType; // DB: facility_type
    private String address; // DB: address
    private String detailAddress; // DB: detail_address
    private String phone; // DB: phone_number (DB 스키마에 맞춰 'phone'으로 통일)
    private Double longitude; // DB: longitude
    private Double latitude; // DB: latitude
    private String description;
    private String facilityImage; // DB: facility_image
    private String homepage;
    private Integer capacity;
    private Integer currentOccupancy;
    private String operatingHours;
    private String features;
    private Boolean isApproved; // DB: is_approved
    private String approvalStatus; // DB: approval_status
    private Long registeredMemberId; // DB: registered_member_id
    private String registeredMemberName; // DB: registered_member_name
    private Double averageRating; // DB: average_rating (스키마에 존재)
    private Integer reviewCount; // DB: review_count (스키마에 존재)
    private Integer gradeRating; // DB: grade_rating (스키마에 존재)

    // 검색 조건으로 사용되는 필드 (DB 컬럼과 직접 매핑되지 않음)
    private String region;
    private Double swLat;
    private Double swLng;
    private Double neLat;
    private Double neLng;
}