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
    private String facilityImageAltText; // DB: facility_image_alt_text (SEO 최적화용)
    private String homepage;
    private Integer capacity;
    private Integer currentOccupancy;
    private String operatingHours;
    private String features;
    private Boolean isApproved; // DB: is_approved
    private Boolean isDeleted; // DB: is_deleted
    private String approvalStatus; // DB: approval_status
    private String rejectionReason; // DB: rejection_reason (관리자용)
    private Long registeredMemberId; // DB: registered_member_id
    private String registeredMemberName; // DB: registered_member_name
    private String registeredUserName; // DB: registered_user_name (관리자용 - 로그인 ID)
    private Double averageRating; // DB: average_rating (스키마에 존재)
    private Integer reviewCount; // DB: review_count (스키마에 존재)
    private Integer gradeRating; // DB: grade_rating (스키마에 존재)

    // 검색 조건으로 사용되는 필드 (DB 컬럼과 직접 매핑되지 않음)
    private String region;
    private Double swLat;
    private Double swLng;
    private Double neLat;
    private Double neLng;

    // 상태 정보 (UI 표시용)
    private String status; // 시설 상태 (정상, 삭제됨, 승인대기)

    // 시설 상태 확인 메서드
    public boolean isNormalStatus() {
        return "정상".equals(status);
    }

    public boolean isDeletedStatus() {
        return "삭제됨".equals(status);
    }

    public boolean isPendingStatus() {
        return "승인대기".equals(status);
    }

    // 시설 상태 메시지 반환
    public String getStatusMessage() {
        if (isDeletedStatus()) {
            return "삭제된 시설입니다.";
        } else if (isPendingStatus()) {
            return "승인 대기 중인 시설입니다.";
        }
        return "";
    }
}