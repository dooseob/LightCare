package com.example.carelink.dao;

import com.example.carelink.dto.JobDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 구인구직 관련 데이터 액세스 매퍼
 * 팀원 C 담당
 */
@Mapper
public interface JobMapper {
    
    /**
     * 구인구직 목록 조회 (검색 포함) - 메인 검색 메서드
     */
    List<JobDTO> findJobsWithSearch(JobDTO searchDTO);
    
    /**
     * 기본 구인구직 목록 조회 (기존 호환성 유지)
     */
    List<JobDTO> getJobList(JobDTO searchDTO);
    
    /**
     * 구인구직 상세 정보 조회
     */
    JobDTO findJobById(@Param("jobId") Long jobId);
    
    /**
     * 구인구직 등록
     */
    int insertJob(JobDTO jobDTO);
    
    /**
     * 구인구직 수정
     */
    int updateJob(JobDTO jobDTO);
    
    /**
     * 구인구직 삭제
     */
    int deleteJob(@Param("jobId") Long jobId);
    
    /**
     * 인기 구인구직 목록 조회
     */
    List<JobDTO> getPopularJobs();
    
    /**
     * 구인구직 검색 (별칭)
     */
    List<JobDTO> searchJobs(JobDTO searchDTO);
    
    /**
     * 검색 조건에 따른 구인구직 총 개수 조회
     */
    int countJobsWithSearch(JobDTO searchDTO);

    /**
     * 전체 구인구직 수 조회 (통계용 - 검색 조건 없음)
     */
    int getJobCount();
} 