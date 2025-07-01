package com.example.carelink.dto;

import com.example.carelink.common.BaseDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;

/**
 * 회원 정보 DTO
 * 팀원 A 담당: 회원 관리 기능 (로그인, 회원가입)
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MemberDTO extends BaseDTO {
    
    private Long memberId;        // 회원 ID (자동증가)
    
    @NotBlank(message = "사용자 ID는 필수입니다")
    @Pattern(regexp = "^[a-zA-Z0-9]{4,20}$", message = "사용자 ID는 4-20자의 영문, 숫자만 가능합니다")
    private String userId;        // 사용자 ID (로그인용)
    
    @NotBlank(message = "비밀번호는 필수입니다")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{8,20}$", 
             message = "비밀번호는 8-20자의 영문, 숫자를 포함해야 합니다")
    private String password;      // 비밀번호
    
    @NotBlank(message = "이름은 필수입니다")
    private String name;          // 이름
    
    @NotBlank(message = "이메일은 필수입니다")
    @Email(message = "올바른 이메일 형식이 아닙니다")
    private String email;         // 이메일
    
    @Pattern(regexp = "^01[016789]-\\d{3,4}-\\d{4}$", message = "올바른 휴대폰 번호 형식이 아닙니다")
    private String phone;         // 휴대폰 번호
    
    private String role;          // 회원 역할 (USER, FACILITY, ADMIN)
    private String address;       // 주소
    private String profileImage;  // 프로필 이미지 경로
    private boolean isActive;     // 계정 활성화 여부
    
    // 시설 관리자 전용 필드들
    private String facilityName;     // 시설명
    private String facilityType;     // 시설 유형 (NURSING_HOME, HOSPITAL, DAY_CARE)
    private String businessNumber;   // 사업자등록번호
    private String facilityAddress;  // 시설 주소
    private String facilityPhone;    // 시설 전화번호
    private String directorName;     // 시설장 이름
    private String description;      // 시설 소개
    
    // 비밀번호 확인용 (저장되지 않는 필드)
    private transient String passwordConfirm;
    
    // 로그인 실패 횟수 (보안용)
    private int loginFailCount;
    
    // 마지막 로그인 시간
    private java.time.LocalDateTime lastLoginAt;
} 