package com.example.carelink.dto;

import com.example.carelink.common.BaseDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 구인구직 게시글 DTO
 * 팀원 C 담당: 구인구직 게시판 기능
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class JobDTO extends BaseDTO {
    
    private Long jobId;             // 구인구직 ID (자동증가)
    
    @NotBlank(message = "제목은 필수입니다")
    private String title;           // 제목
    
    @NotBlank(message = "내용은 필수입니다")
    private String content;         // 내용
    
    @NotBlank(message = "구인구직 유형은 필수입니다")
    private String jobType;         // 구인구직 유형 (RECRUIT: 구인, SEARCH: 구직)
    
    @NotBlank(message = "근무 형태는 필수입니다")
    private String workType;        // 근무 형태 (FULL_TIME, PART_TIME, TEMPORARY)
    
    private String position;        // 모집 직종
    private Integer recruitCount;   // 모집 인원
    
    // 급여 정보
    private String salaryType;      // 급여 유형 (HOURLY, MONTHLY, ANNUAL)
    private BigDecimal salaryMin;   // 최소 급여
    private BigDecimal salaryMax;   // 최대 급여
    private String salaryDescription; // 급여 설명
    
    // 근무 조건
    private String workLocation;    // 근무 지역
    private String workHours;       // 근무 시간
    private String experience;      // 경력 조건
    private String education;       // 학력 조건
    private String qualifications;  // 자격 요건
    private String benefits;        // 복리후생
    
    // 모집 기간
    private LocalDate startDate;    // 모집 시작일
    private LocalDate endDate;      // 모집 마감일
    
    // 연락처 정보
    private String contactName;     // 담당자 이름
    private String contactPhone;    // 담당자 연락처
    private String contactEmail;    // 담당자 이메일
    
    // 상태 관리
    @NotBlank(message = "게시글 상태는 필수입니다")
    private String status;          // 게시글 상태 (ACTIVE, CLOSED, DRAFT)

    private Integer viewCount;      // 조회수
    private Integer applyCount;     // 지원자 수
    
    // 작성자 정보
    @NotNull(message = "작성자 정보는 필수입니다")
    private Long memberId;          // 작성자 ID
    private String memberName;      // 작성자 이름
    
    // 시설 정보 (구인글인 경우)
    private Long facilityId;        // 관련 시설 ID
    private String facilityName;    // 시설 이름
    
    // 검색용 필드
    private String searchKeyword;   // 검색 키워드
    private String searchJobType;   // 검색 구인구직 유형
    private String searchWorkType;  // 검색 근무 형태
    private String searchLocation;  // 검색 지역
    private String searchPosition;  // 검색 직종
    
    // 첨부파일
    private String attachmentPath;  // 첨부파일 경로
    private String attachmentName;  // 첨부파일 원본명
    
    // 우선순위 (상단 고정용)
    private Integer priority;       // 우선순위 (숫자가 높을수록 우선)

    private boolean isHighlight;    // 강조 표시 여부

}
