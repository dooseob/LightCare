package com.example.carelink.service;

import com.example.carelink.dao.JobMapper;
import com.example.carelink.dto.JobApplicationDTO;
import com.example.carelink.dto.JobDTO;
import com.example.carelink.dao.JobApplicationMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 구인구직 관련 비즈니스 로직 서비스
 * 팀원 C 담당 - 개선 버전
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class JobService {
    
    private final JobMapper jobMapper;
    private final JobApplicationMapper jobApplicationMapper;

    /**
     * 구인구직 목록 조회
     */
    public List<JobDTO> getJobList(int currentPage, String keyword, String jobType) {
        log.info("구인구직 목록 조회 시작 - page: {}, keyword: {}, jobType: {}", currentPage, keyword, jobType);
        
        try {
            JobDTO searchDTO = new JobDTO();
            
            int pageSize = 10;
            searchDTO.setSize(pageSize);
            searchDTO.setPage((currentPage - 1) * pageSize);
            
            if (keyword != null && !keyword.trim().isEmpty()) {
                searchDTO.setSearchKeyword(keyword.trim());
            }
            
            if (jobType != null && !jobType.trim().isEmpty()) {
                searchDTO.setJobType(jobType.trim());
            }
            
            List<JobDTO> jobList = jobMapper.getJobList(searchDTO);
            log.info("구인구직 목록 조회 완료 - 조회된 건수: {}", jobList.size());
            
            return jobList;
        } catch (Exception e) {
            log.error("구인구직 목록 조회 중 오류 발생", e);
            // 임시로 빈 리스트 반환 (개발 초기 에러 방지)
            return new ArrayList<>();
        }
    }
    
    /**
     * 구인구직 상세 정보 조회
     */
    public JobDTO getJobById(Long id) {
        log.info("구인구직 상세 조회 시작 - jobId: {}", id);
        
        try {
            JobDTO job = jobMapper.findJobById(id);
            if (job == null) {
                log.warn("구인구직 정보를 찾을 수 없습니다 - jobId: {}", id);
                throw new RuntimeException("해당 구인구직 정보를 찾을 수 없습니다. ID: " + id);
            }
            
            // 조회수 증가는 별도 메서드로 처리 (현재는 주석 처리)
            // jobMapper.incrementViewCount(id);
            log.info("구인구직 상세 조회 완료 - jobId: {}, title: {}", id, job.getTitle());
            
            return job;
        } catch (Exception e) {
            log.error("구인구직 상세 조회 중 오류 발생 - jobId: {}", id, e);
            
            // 임시로 기본 구인구직 정보 반환 (개발 초기 에러 방지)
            JobDTO job = new JobDTO();
            job.setJobId(id);
            job.setTitle("구인구직 정보를 불러오는 중 오류가 발생했습니다");
            job.setContent("시스템 오류로 인해 상세 정보를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.");
            job.setJobType("RECRUIT");
            job.setWorkType("FULL_TIME");
            job.setPosition("미정");
            job.setSalaryMin(java.math.BigDecimal.ZERO);
            job.setSalaryMax(java.math.BigDecimal.ZERO);
            job.setWorkLocation("미정");
            job.setStatus("ACTIVE");
            job.setMemberId(1L);
            job.setViewCount(0);
            
            return job;
        }
    }
    
    /**
     * 구인구직 등록
     */
    public int insertJob(JobDTO jobDTO) {
        log.info("구인구직 등록 시작 - title: {}, jobType: {}", jobDTO.getTitle(), jobDTO.getJobType());
        
        try {
            // 필수 값 검증
            validateJobData(jobDTO);
            
            // 데이터 정리 및 중복 제거 (누적 방지)
            cleanAndValidateJobData(jobDTO);
            
            // 기본값 설정
            if (jobDTO.getStatus() == null) {
                jobDTO.setStatus("ACTIVE");
            }
            if (jobDTO.getPriority() == null) {
                jobDTO.setPriority(0);
            }
            
            int result = jobMapper.insertJob(jobDTO);
            log.info("구인구직 등록 완료 - jobId: {}", jobDTO.getJobId());
            
            return result;
        } catch (Exception e) {
            log.error("구인구직 등록 중 오류 발생", e);
            throw new RuntimeException("구인구직 등록 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 구인구직 수정
     */
    public int updateJob(JobDTO jobDTO) {
        log.info("구인구직 수정 시작 - jobId: {}, title: {}", jobDTO.getJobId(), jobDTO.getTitle());
        
        try {
            // 구인구직 존재 확인
            JobDTO existingJob = jobMapper.findJobById(jobDTO.getJobId());
            if (existingJob == null) {
                throw new RuntimeException("수정할 구인구직을 찾을 수 없습니다. ID: " + jobDTO.getJobId());
            }
            
            // 필수 값 검증
            validateJobData(jobDTO);
            
            // 데이터 정리 및 중복 제거 (누적 방지)
            cleanAndValidateJobData(jobDTO);

            // priority null 체크 및 기본값 설정 로직 추가
            if (jobDTO.getPriority() == null) {
                jobDTO.setPriority(0);
                log.warn("priority 값이 null이어서 0으로 자동 설정되었습니다. jobId: {}", jobDTO.getJobId());
            }

            int result = jobMapper.updateJob(jobDTO);
            log.info("구인구직 수정 완료 - jobId: {}", jobDTO.getJobId());
            
            return result;
        } catch (Exception e) {
            log.error("구인구직 수정 중 오류 발생 - jobId: {}", jobDTO.getJobId(), e);
            throw new RuntimeException("구인구직 수정 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 구인구직 삭제
     */
    public int deleteJob(Long id) {
        log.info("구인구직 삭제 시작 - jobId: {}", id);
        
        try {
            int result = jobMapper.deleteJob(id);
            log.info("구인구직 삭제 완료 - jobId: {}", id);
            
            return result;
        } catch (Exception e) {
            log.error("구인구직 삭제 중 오류 발생 - jobId: {}", id, e);
            throw new RuntimeException("구인구직 삭제 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 인기 구인구직 조회
     */
    public List<JobDTO> getPopularJobs() {
        try {
            return jobMapper.getPopularJobs();
        } catch (Exception e) {
            log.error("인기 구인구직 조회 중 오류 발생", e);
            return new ArrayList<>();
        }
    }
    
    /**
     * 전체 구인구직 수 조회 (통계용)
     */
    public int getJobCount() {
        try {
            return jobMapper.getJobCount();
        } catch (Exception e) {
            log.error("구인구직 수 조회 중 오류 발생", e);
            return 0; // 오류 시 0 반환
        }
    }
    
    /**
     * 구인구직 데이터 유효성 검증
     */
    private void validateJobData(JobDTO jobDTO) {
        if (jobDTO.getTitle() == null || jobDTO.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("제목은 필수 입력값입니다.");
        }
        if (jobDTO.getContent() == null || jobDTO.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("내용은 필수 입력값입니다.");
        }
        if (jobDTO.getJobType() == null || jobDTO.getJobType().trim().isEmpty()) {
            throw new IllegalArgumentException("구인구직 유형은 필수 입력값입니다.");
        }
        if (jobDTO.getMemberId() == null) {
            throw new IllegalArgumentException("작성자 정보가 필요합니다.");
        }
    }
    
    /**
     * 구인구직 데이터 정리 및 중복 제거 (누적 방지)
     */
    private void cleanAndValidateJobData(JobDTO jobDTO) {
        log.info("데이터 정리 시작 - jobId: {}", jobDTO.getJobId());
        
        // 제목 정리
        if (jobDTO.getTitle() != null) {
            jobDTO.setTitle(jobDTO.getTitle().trim());
        }
        
        // 내용 정리
        if (jobDTO.getContent() != null) {
            jobDTO.setContent(jobDTO.getContent().trim());
        }
        
        // 급여 설명 정리 (중복 제거)
        if (jobDTO.getSalaryDescription() != null && !jobDTO.getSalaryDescription().trim().isEmpty()) {
            String cleanSalaryDesc = cleanDuplicateValues(jobDTO.getSalaryDescription());
            jobDTO.setSalaryDescription(cleanSalaryDesc);
            log.debug("급여 설명 정리됨: {} -> {}", jobDTO.getSalaryDescription(), cleanSalaryDesc);
        }
        
        // 근무시간 정리 (중복 제거)
        if (jobDTO.getWorkHours() != null && !jobDTO.getWorkHours().trim().isEmpty()) {
            String cleanWorkHours = cleanDuplicateValues(jobDTO.getWorkHours());
            jobDTO.setWorkHours(cleanWorkHours);
            log.debug("근무시간 정리됨: {} -> {}", jobDTO.getWorkHours(), cleanWorkHours);
        }
        
        // 회사명 정리
        if (jobDTO.getFacilityName() != null) {
            jobDTO.setFacilityName(jobDTO.getFacilityName().trim());
        }
        
        // 근무지 정리
        if (jobDTO.getWorkLocation() != null) {
            jobDTO.setWorkLocation(jobDTO.getWorkLocation().trim());
        }
        
        // 연락처 정리
        if (jobDTO.getContactPhone() != null) {
            jobDTO.setContactPhone(jobDTO.getContactPhone().trim());
        }
        
        // 자격증 정리 (중복 제거)
        if (jobDTO.getQualifications() != null && !jobDTO.getQualifications().trim().isEmpty()) {
            String cleanQualifications = cleanDuplicateValues(jobDTO.getQualifications());
            jobDTO.setQualifications(cleanQualifications);
        }
        
        log.info("데이터 정리 완료 - jobId: {}", jobDTO.getJobId());
    }
    
    /**
     * 콤마로 구분된 값들의 중복 제거 유틸리티 메서드
     */
    private String cleanDuplicateValues(String input) {
        if (input == null || input.trim().isEmpty()) {
            return input;
        }
        
        try {
            // 콤마로 분리하여 중복 제거
            String[] values = input.split(",");
            return java.util.Arrays.stream(values)
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .distinct()
                    .collect(java.util.stream.Collectors.joining(", "));
        } catch (Exception e) {
            log.warn("값 정리 중 오류 발생, 원본 값 반환: {}", input, e);
            return input.trim();
        }
    }

    /**
     * 구인공고에 지원하는 로직
     * @param jobId 지원할 구인공고의 ID
     * @param applicantMemberId 지원하는 개인 회원의 ID
     * @throws IllegalArgumentException 유효성 검사 실패 시
     */
    @Transactional // 트랜잭션이 활성화되어 있는지 다시 한번 확인 (필수)
    public void applyForJob(Long jobId, Long applicantMemberId) {
        log.info("구인공고 지원 로직 시작 - jobId: {}, applicantMemberId: {}", jobId, applicantMemberId);

        JobDTO jobDTO = jobMapper.findJobById(jobId);

        if (jobDTO == null) {
            log.warn("지원할 구인공고를 찾을 수 없습니다 - jobId: {}", jobId);
            throw new IllegalArgumentException("지원할 구인공고를 찾을 수 없습니다.");
        }

        // 1. 이미 지원했는지 확인 (중복 지원 방지)
        int existingApplications = jobApplicationMapper.countByJobIdAndApplicantMemberId(jobId, applicantMemberId);
        if (existingApplications > 0) {
            log.warn("이미 지원한 구인공고입니다 - jobId: {}, applicantMemberId: {}", jobId, applicantMemberId);
            throw new IllegalArgumentException("이미 지원한 구인공고입니다.");
        }

        // 2. 지원 정보 DTO 생성 및 데이터베이스 저장
        JobApplicationDTO jobApplication = new JobApplicationDTO();
        jobApplication.setJobId(jobId);
        jobApplication.setApplicantMemberId(applicantMemberId);
        jobApplication.setApplicationDate(LocalDateTime.now()); // 현재 시간으로 설정
        jobApplication.setStatus("PENDING"); // 초기 상태를 "PENDING"으로 설정

        // JobApplicationMapper를 통해 DB에 삽입합니다.
        jobApplicationMapper.insertJobApplication(jobApplication); // 이 줄의 주석을 해제하고 사용합니다.

        // 3. apply_count 증가 (여기가 핵심적으로 추가되어야 하는 부분!)
        jobMapper.incrementApplyCount(jobId); // <-- 이 줄을 추가합니다!

        log.info("구인공고 지원 로직 완료 - jobId: {}, applicantMemberId: {}, 생성된 지원 ID: {}",
                jobId, applicantMemberId, jobApplication.getId());
    }

} 