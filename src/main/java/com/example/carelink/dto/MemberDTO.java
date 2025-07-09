package com.example.carelink.dto;

import com.example.carelink.common.BaseDTO;
import com.example.carelink.validation.groups.OnFacilityJoin;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.web.multipart.MultipartFile; // MultipartFile import 유지

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size; // Size 어노테이션 추가 (제공해주신 내용에 포함됨)

/**
 * 회원 정보 DTO
 * 팀원 A 담당: 회원 관리 기능 (로그인, 회원가입)
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MemberDTO extends BaseDTO {

    private Long memberId;        // 회원 ID (자동증가)

    @NotBlank(message = "사용자 ID는 필수입니다.")
    @Pattern(regexp = "^[a-zA-Z0-9]{4,20}$", message = "사용자 ID는 4-20자의 영문, 숫자만 가능합니다.")
    private String userId;        // 사용자 ID (로그인용)

    // 비밀번호는 회원가입 시에만 @NotBlank를 적용하고, 회원 정보 수정 시에는 적용하지 않도록
    // 별도의 DTO를 만들거나 @Validated 그룹을 사용하는 것이 더 유연합니다.
    // 여기서는 일단 기본 설정만 유지하며, 필요 시 컨트롤러나 서비스에서 조건부 유효성 검사를 수행합니다.
    @NotBlank(message = "비밀번호는 필수입니다.")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{8,20}$",
            message = "비밀번호는 8-20자의 영문, 숫자, 특수문자를 1개 이상 포함해야 합니다.")
    private String password;      // 비밀번호

    @NotBlank(message = "이름은 필수입니다.")
    @Size(max = 50, message = "이름은 50자를 초과할 수 없습니다.") // 예시: 이름 길이 제한 추가
    private String name;          // 이름

    @NotBlank(message = "이메일은 필수 입력 항목입니다.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    @Size(max = 100, message = "이메일은 100자를 초과할 수 없습니다.") // 예시: 이메일 길이 제한 추가
    private String email;         // 이메일 (필수사항)

    // 휴대폰 번호 패턴 수정: 빈 문자열("")도 허용하도록 ^$| 를 추가합니다.
    @Pattern(regexp = "^$|^01(?:0|1|[6-9])-(?:\\d{3}|\\d{4})-\\d{4}$",
            message = "올바른 휴대폰 번호 형식이 아닙니다.")
    private String phone;

    private String role;          // 회원 역할 (USER, FACILITY, ADMIN)

    // 시설회원 가입 시에만 address가 필수임을 지정 (OnFacilityJoin 그룹에 속할 때만 검사)
    @NotBlank(message = "시설 주소는 필수 입력 항목입니다.", groups = OnFacilityJoin.class)
    private String address;       // 주소 (DDL에 따라 VARCHAR 길이 제한 추가 고려)

    private String profileImage;  // 프로필 이미지 경로 (DB에 저장될 URL)
    private String profileImageAltText;  // 프로필 이미지 alt 텍스트 (SEO 최적화용)
    
    // 시설회원 추가 정보 (facility 테이블에 저장될 정보)
    private String facilityName;     // 시설명
    private String facilityType;     // 시설 유형 (NURSING_HOME, HOSPITAL, DAY_CARE)
    private String facilityAddress;  // 시설 주소 (카카오 주소 검색으로 입력)
    private String detailAddress;    // 상세 주소
    private String facilityPhone;    // 시설 전화번호
    private String description;      // 시설 설명
    private String homepage;         // 홈페이지 URL
    private Integer capacity;        // 수용 인원
    private String operatingHours;   // 운영 시간
    private String features;         // 시설 특징
    private Double latitude;         // 위도 (카카오 주소 검색으로 자동 설정)
    private Double longitude;        // 경도 (카카오 주소 검색으로 자동 설정)

    // DB 테이블의 is_active 컬럼과 매핑
    private Boolean isActive;     // 계정 활성화 여부 (Boolean으로 변경하여 null 허용, 기본값은 DB에서 설정)

    // 논리적 삭제 여부 (DDL의 is_deleted 컬럼과 매핑)
    private Boolean isDeleted;    // 계정 삭제 여부 (true: 삭제됨, false: 유지됨)

    // 비밀번호 확인용 (DB에 저장되지 않음, 회원가입/비밀번호 변경 폼에서만 사용)
    private transient String passwordConfirm;
    // 로그인 실패 횟수
    private int loginFailCount;

    // 마지막 로그인 시간
    private java.time.LocalDateTime lastLoginAt;

    // 프로필 이미지 파일 업로드용 (DB에 저장되지 않는 필드, DTO가 폼 데이터를 받을 때 사용)
    // myinfo.html의 <input type="file" name="profileImageFile"> 와 매핑됩니다.
    private transient MultipartFile profileImageFile; // 파일 자체를 받기 위한 필드
}