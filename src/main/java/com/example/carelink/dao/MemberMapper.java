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
     */
    MemberDTO findByUserId(@Param("userId") String userId);

    /**
     * 회원 ID로 회원 정보 조회
     */
    MemberDTO findById(@Param("memberId") Long memberId);

    /**
     * 이메일로 회원 정보 조회
     */
    MemberDTO findByEmail(@Param("email") String email);

    /**
     * 회원 정보 저장
     */
    void insertMember(MemberDTO memberDTO);

    /**
     * 회원 정보 수정
     */
    void updateMember(MemberDTO memberDTO);

    /**
     * 회원 탈퇴 (논리 삭제)
     */
    void deleteMember(@Param("memberId") Long memberId);

    /**
     * 로그인 성공 시 정보 업데이트 (실패 횟수 초기화, 마지막 로그인 시간 업데이트)
     */
    void updateLoginSuccess(@Param("memberId") Long memberId);

    /**
     * 로그인 실패 시 실패 횟수 증가
     */
    void updateLoginFail(@Param("memberId") Long memberId);

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
} 