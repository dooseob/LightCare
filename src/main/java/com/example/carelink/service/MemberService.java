package com.example.carelink.service;

import com.example.carelink.dao.MemberMapper;
import com.example.carelink.dto.LoginDTO;
import com.example.carelink.dto.MemberDTO;
import com.example.carelink.common.Constants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 회원 관리 서비스
 * 팀원 A 담당: 회원 관리 비즈니스 로직
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class MemberService {

    private final MemberMapper memberMapper;

    /**
     * 로그인 처리
     */
    public MemberDTO login(LoginDTO loginDTO) {
        try {
            // 사용자 ID로 회원 정보 조회
            MemberDTO member = memberMapper.findByUserId(loginDTO.getUserId());
            
            if (member == null) {
                log.warn("존재하지 않는 사용자 ID: {}", loginDTO.getUserId());
                return null;
            }
            
            // 계정 활성화 상태 확인
            if (!member.isActive()) {
                log.warn("비활성화된 계정: {}", loginDTO.getUserId());
                return null;
            }
            
            // 로그인 실패 횟수 확인
            if (member.getLoginFailCount() >= Constants.MAX_LOGIN_ATTEMPTS) {
                log.warn("로그인 시도 횟수 초과: {}", loginDTO.getUserId());
                return null;
            }
            
            // 비밀번호 검증 (실제로는 암호화된 비밀번호와 비교해야 함)
            if (loginDTO.getPassword().equals(member.getPassword())) {
                // 로그인 성공 시 실패 횟수 초기화 및 마지막 로그인 시간 업데이트
                memberMapper.updateLoginSuccess(member.getMemberId());
                log.info("로그인 성공: {}", loginDTO.getUserId());
                return member;
            } else {
                // 로그인 실패 시 실패 횟수 증가
                memberMapper.updateLoginFail(member.getMemberId());
                log.warn("비밀번호 불일치: {}", loginDTO.getUserId());
                return null;
            }
            
        } catch (Exception e) {
            log.error("로그인 처리 중 오류 발생: {}", loginDTO.getUserId(), e);
            throw new RuntimeException("로그인 처리 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 회원가입 처리
     */
    public void join(MemberDTO memberDTO) {
        try {
            // 사용자 ID 중복 체크
            if (isUserIdDuplicate(memberDTO.getUserId())) {
                throw new IllegalArgumentException("이미 사용중인 아이디입니다.");
            }
            
            // 기본값 설정
            memberDTO.setRole(Constants.MEMBER_ROLE_USER);
            memberDTO.setActive(true);
            memberDTO.setLoginFailCount(0);
            
            // 실제로는 비밀번호 암호화 필요
            // memberDTO.setPassword(passwordEncoder.encode(memberDTO.getPassword()));
            
            // 회원 정보 저장
            memberMapper.insertMember(memberDTO);
            log.info("회원가입 완료: {}", memberDTO.getUserId());
            
        } catch (Exception e) {
            log.error("회원가입 처리 중 오류 발생: {}", memberDTO.getUserId(), e);
            throw new RuntimeException("회원가입 처리 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 사용자 ID 중복 체크
     */
    @Transactional(readOnly = true)
    public boolean isUserIdDuplicate(String userId) {
        try {
            MemberDTO existingMember = memberMapper.findByUserId(userId);
            return existingMember != null;
        } catch (Exception e) {
            log.error("사용자 ID 중복 체크 중 오류 발생: {}", userId, e);
            throw new RuntimeException("중복 체크 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 회원 ID로 회원 정보 조회
     */
    @Transactional(readOnly = true)
    public MemberDTO findById(Long memberId) {
        try {
            return memberMapper.findById(memberId);
        } catch (Exception e) {
            log.error("회원 정보 조회 중 오류 발생: {}", memberId, e);
            throw new RuntimeException("회원 정보 조회 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 회원 정보 수정
     */
    public void updateMember(MemberDTO memberDTO) {
        try {
            memberMapper.updateMember(memberDTO);
            log.info("회원정보 수정 완료: {}", memberDTO.getUserId());
        } catch (Exception e) {
            log.error("회원정보 수정 중 오류 발생: {}", memberDTO.getUserId(), e);
            throw new RuntimeException("회원정보 수정 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 회원 탈퇴 (논리 삭제)
     */
    public void deleteMember(Long memberId) {
        try {
            memberMapper.deleteMember(memberId);
            log.info("회원 탈퇴 처리 완료: {}", memberId);
        } catch (Exception e) {
            log.error("회원 탈퇴 처리 중 오류 발생: {}", memberId, e);
            throw new RuntimeException("회원 탈퇴 처리 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 전체 회원 수 조회 (통계용)
     */
    @Transactional(readOnly = true)
    public int getMemberCount() {
        try {
            return memberMapper.getMemberCount();
        } catch (Exception e) {
            log.error("회원 수 조회 중 오류 발생", e);
            return 0; // 오류 시 0 반환
        }
    }
} 