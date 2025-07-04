package com.example.carelink.dao;

import com.example.carelink.dto.JobApplicationDTO; // 방금 생성한 JobApplicationDTO 임포트
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param; // @Param 어노테이션 임포트

@Mapper // 이 인터페이스가 MyBatis 매퍼임을 나타냅니다.
public interface JobApplicationMapper {

    // 새로운 지원 정보를 데이터베이스에 삽입하는 메서드
    // JobApplicationDTO 객체를 받아서 DB에 저장하고, 삽입된 레코드 수를 반환합니다.
    int insertJobApplication(JobApplicationDTO jobApplication);

    // 특정 공고에 대한 특정 회원의 지원 여부를 확인하는 메서드
    // job_id와 applicant_member_id를 받아서 해당 조건에 맞는 지원서의 수를 반환합니다.
    int countByJobIdAndApplicantMemberId(@Param("jobId") Long jobId, @Param("applicantMemberId") Long applicantMemberId);

    // TODO: (선택 사항) 필요한 경우 다른 조회/수정/삭제 메서드 추가
    // 예:
    // JobApplicationDTO findById(Long id);
    // List<JobApplicationDTO> findByJobId(Long jobId);
    // List<JobApplicationDTO> findByApplicantMemberId(Long applicantMemberId);
    // int updateStatus(@Param("id") Long id, @Param("status") String status);
}