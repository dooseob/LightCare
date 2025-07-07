package com.example.carelink.dao;

import com.example.carelink.dto.MemberDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 회원 관리 매퍼 인터페이스
 * 팀원 A 담당: 회원 관리 데이터 액세스
 */
@Mapper
public interface MemberMapper {

    /**
     * 사용자 ID로 회원 정보 조회
     * is_deleted = FALSE 인 활성화된 회원만 조회하도록 XML 쿼리 수정 필요
     */
    MemberDTO findByUserId(@Param("userId") String userId);

    /**
     * 회원 ID로 회원 정보 조회
     * is_deleted = FALSE 인 활성화된 회원만 조회하도록 XML 쿼리 수정 필요
     */
    MemberDTO findById(@Param("memberId") Long memberId);

    /**
     * 이메일로 회원 정보 조회
     * is_deleted = FALSE 인 활성화된 회원만 조회하도록 XML 쿼리 수정 필요
     */
    MemberDTO findByEmail(@Param("email") String email);

    /**
     * 회원 정보 저장
     */
    int insertMember(MemberDTO memberDTO); // insert는 보통 int(영향받은 행 수) 반환

    /**
     * 회원 정보 수정
     */
    int updateMember(MemberDTO memberDTO); // update는 보통 int(영향받은 행 수) 반환

    /**
     * 회원 탈퇴 (논리 삭제) - 메서드 이름을 좀 더 명확하게 변경
     * 기존의 deleteMember를 softDeleteMember로 변경하고 파라미터도 userId로 변경
     */
    int softDeleteMember(@Param("userId") String userId); // deleteMember -> softDeleteMember로 변경, memberId -> userId

    /**
     * 비밀번호 변경
     * MemberDTO를 받아 password만 업데이트하는 용도
     */
    int updatePassword(MemberDTO memberDTO); // 새로 추가

    /**
     * 로그인 성공 시 정보 업데이트 (실패 횟수 초기화, 마지막 로그인 시간 업데이트)
     */
    int updateLoginSuccess(@Param("memberId") Long memberId); // update는 보통 int(영향받은 행 수) 반환

    /**
     * 로그인 실패 시 실패 횟수 증가
     */
    int updateLoginFail(@Param("memberId") Long memberId); // update는 보통 int(영향받은 행 수) 반환

    /**
     * 전체 회원 수 조회
     */
    int getTotalCount();

    /**
     * 페이징된 회원 목록 조회 (관리자용)
     */
    List<MemberDTO> findMembersWithPaging(MemberDTO searchDTO);

    /**
     * 특정 역할의 회원 목록 조회
     */
    List<MemberDTO> findMembersByRole(@Param("role") String role);

    /**
     * 회원 상태 변경 (활성화/비활성화)
     */
    void updateMemberStatus(@Param("memberId") Long memberId, @Param("isActive") boolean isActive);

    /**
     * 전체 회원 수 조회 (통계용)
     */
    int getMemberCount();

    /**
     * 특정 사용자 ID가 존재하는지 확인
     * (활성/비활성 여부, 삭제 여부와 상관없이 ID 자체의 중복 확인)
     */
    boolean existsByUserId(@Param("userId") String userId);

    /**
     * 특정 이메일이 존재하는지 확인
     * (활성/비활성 여부, 삭제 여부와 상관없이 이메일 자체의 중복 확인)
     */
    boolean existsByEmail(@Param("email") String email);
    
    /**
     * 회원 익명화 (개인정보만 삭제, 콘텐츠는 유지)
     */
    int anonymizeMember(@Param("userId") String userId);
    
    /**
     * 회원 물리 삭제 (완전 삭제)
     */
    int hardDeleteMember(@Param("userId") String userId);

    // ================== 관리자용 메서드들 ==================

    /**
     * 시설 회원 수 조회 (관리자용)
     */
    int getFacilityMemberCount();

    /**
     * 일반 회원 수 조회 (관리자용)
     */
    int getUserMemberCount();

    /**
     * 역할별 회원 수 조회 (관리자용)
     */
    int getMemberCountByRole(@Param("role") String role);

}
