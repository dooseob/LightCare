package com.example.carelink.service;

import com.example.carelink.dao.JobMapper;
import com.example.carelink.dto.JobDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * 구인구직 관련 비즈니스 로직 서비스
 * 팀원 C 담당
 */
@Service
@RequiredArgsConstructor
public class JobService {
    
    private final JobMapper jobMapper;
    
    /**
     * 구인구직 목록 조회
     */
    public List<JobDTO> getJobList(int currentPage, String keyword, String jobType) {
        try {
            // TODO: 팀원 C가 페이징 및 검색 로직 구현
            JobDTO searchDTO = new JobDTO();

            /*
            searchDTO.setPage(page);
            searchDTO.setSize(10);
            */

            int pageSize = 10;
            searchDTO.setSize(pageSize); // int -> Integer (Autoboxing)
            searchDTO.setPage((currentPage - 1) * pageSize); // int -> Integer (Autoboxing)

            return jobMapper.getJobList(searchDTO);
        } catch (Exception e) {
            // 임시로 빈 리스트 반환 (개발 초기 에러 방지)
            return new ArrayList<>();
        }
    }
    
    /**
     * 구인구직 상세 정보 조회
     */
    public JobDTO getJobById(Long id) {
        try {

            // TODO: 팀원 C가 상세 조회 로직 구현
            JobDTO jobFromMapper = jobMapper.findJobById(id); // 여기에 변수로 받아서 출력
            return jobFromMapper;

        }
        catch (Exception e) {

            System.out.println("catch 블록 실행됨 - 에러: " + e.getMessage());

            // 임시로 기본 구인구직 정보 반환 (개발 초기 에러 방지)
            JobDTO job = new JobDTO();
            job.setJobId(id);
            job.setTitle("구인구직 정보를 불러오는 중...");
            job.setContent("팀원 C가 구현 예정");
            job.setFacilityName("Sample Company");
            job.setSalaryDescription("300");
            return job;

        }
    }
    
    /**
     * 구인구직 등록
     */
    public int insertJob(JobDTO jobDTO) {
        try {

            /*
            // TODO: 팀원 C가 등록 로직 구현
            return jobMapper.insertJob(jobDTO);
            */

            int result = jobMapper.insertJob(jobDTO);
            return result;

        }
        catch (Exception e) {

            e.printStackTrace(); // 예외의 전체 스택 트레이스를 출력하여 상세 오류 파악

            return 0; // 실패를 나타내는 값으로 변경 (이전 1 반환은 성공처럼 보였습니다)

        }
    }
    
    /**
     * 구인구직 수정
     */
    public int updateJob(JobDTO jobDTO) {
        try {
            // TODO: 팀원 C가 수정 로직 구현
            return jobMapper.updateJob(jobDTO);
        } catch (Exception e) {
            // 임시로 성공 반환 (개발 초기 에러 방지)
            return 1;
        }
    }
    
    /**
     * 구인구직 삭제
     */
    public int deleteJob(Long id) {
        try {
            // TODO: 팀원 C가 삭제 로직 구현
            return jobMapper.deleteJob(id);
        } catch (Exception e) {
            // 임시로 성공 반환 (개발 초기 에러 방지)
            return 1;
        }
    }
    
    /**
     * 인기 구인구직 목록 조회
     */
    public List<JobDTO> getPopularJobs() {
        try {
            // TODO: 팀원 C가 인기 구인구직 로직 구현
            return jobMapper.getPopularJobs();
        } catch (Exception e) {
            // 임시로 빈 리스트 반환 (개발 초기 에러 방지)
            return new ArrayList<>();
        }
    }
} 