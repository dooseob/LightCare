package com.example.carelink.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime; // LocalDateTime 클래스 임포트

@Data // Lombok: getter, setter, equals, hashCode, toString 자동 생성
@NoArgsConstructor // Lombok: 기본 생성자 자동 생성
@AllArgsConstructor // Lombok: 모든 필드를 인자로 받는 생성자 자동 생성
public class JobApplicationDTO {

    private Long id; // 지원서의 고유 ID (데이터베이스의 기본 키)
    private Long jobId; // 지원한 구인/구직 공고의 ID (JobDTO의 jobId와 연결)
    private Long applicantMemberId; // 지원한 개인 회원의 ID (MemberDTO의 memberId와 연결)
    private LocalDateTime applicationDate; // 지원 일시 (지원 버튼 클릭 시의 시간)
    private String status; // 지원 상태 (예: "PENDING", "ACCEPTED", "REJECTED" 등)

    // TODO: (선택 사항) 필요한 경우 추가 필드
    // 예를 들어, 이력서 파일 경로, 자기소개서 내용 등을 추가할 수 있습니다.
    // private String resumePath;
    // private String coverLetter;
}