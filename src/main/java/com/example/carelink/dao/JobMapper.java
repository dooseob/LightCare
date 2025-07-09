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

    // --- applyCount 증가를 위한 메서드 추가 ---
    /**
     * 특정 구인구직 공고의 지원자 수 (applyCount)를 1 증가시킵니다.
     */
    void incrementApplyCount(@Param("jobId") Long jobId);
    
    /**
     * 특정 회원이 작성한 구인구직 게시글 목록 조회
     */
    List<JobDTO> findJobsByMemberId(@Param("memberId") Long memberId);

    /**
     * 회원 ID로 구인구직 게시글 삭제 (회원 탈퇴 시 사용)
     */
    int deleteByMemberId(@Param("memberId") Long memberId);

    /**
     * 시설 회원 ID로 구인구직 게시글 삭제 (시설 삭제 시 사용)
     */
    int deleteByFacilityMemberId(@Param("memberId") Long memberId);
} 