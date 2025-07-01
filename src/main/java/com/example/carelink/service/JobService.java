package com.example.carelink.service;

import com.example.carelink.dao.JobMapper;
import com.example.carelink.dto.JobDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

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
} 