package com.example.carelink.dto;

import com.example.carelink.common.BaseDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;

/**
 * 시설 정보 DTO
 * 팀원 B 담당: 시설 검색 및 지도 표시 기능
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class FacilityDTO extends BaseDTO {
    
    private Long facilityId;        // 시설 ID (자동증가)
    
    @NotBlank(message = "시설명은 필수입니다")
    private String facilityName;    // 시설명
    
    @NotBlank(message = "시설 유형은 필수입니다")
    private String facilityType;    // 시설 유형 (NURSING_HOME, HOSPITAL, DAY_CARE)
    
    @NotBlank(message = "주소는 필수입니다")
    private String address;         // 주소
    
    private String detailAddress;   // 상세 주소
    
    @NotBlank(message = "전화번호는 필수입니다")
    private String phone;           // 전화번호
    
    // 지도 표시를 위한 좌표 정보
    private BigDecimal latitude;    // 위도
    private BigDecimal longitude;   // 경도
    
    private String description;     // 시설 설명
    private String facilityImage;   // 시설 이미지 경로
    private String homepage;        // 홈페이지 URL
    
    // 시설 정보
    private Integer capacity;       // 수용 인원
    private Integer currentOccupancy; // 현재 입소자 수
    private String operatingHours;  // 운영 시간
    private String features;        // 시설 특징
    
    // 평점 관련
    private Float averageRating;    // 평균 평점
    private Integer reviewCount;    // 리뷰 수
    
    // 등록한 회원 정보
    @NotNull(message = "등록 회원 정보는 필수입니다")
    private Long registeredMemberId; // 등록한 회원 ID
    private String registeredMemberName; // 등록한 회원 이름
    
    // 승인 관련
    private boolean isApproved;     // 승인 여부
    private String approvalStatus;  // 승인 상태 (PENDING, APPROVED, REJECTED)
    
    // 검색용 필드
    private String searchKeyword;   // 검색 키워드
    private String searchRegion;    // 검색 지역
    private String region;          // 지역 필터링용
    private Double searchRadius;    // 검색 반경 (km)
    private BigDecimal searchLat;   // 검색 기준 위도
    private BigDecimal searchLng;   // 검색 기준 경도
    
    /**
     * 지역 설정 메서드 (컨트롤러에서 사용)
     */
    public void setRegion(String region) {
        this.region = region;
        this.searchRegion = region;  // 검색 지역도 함께 설정
    }
} 