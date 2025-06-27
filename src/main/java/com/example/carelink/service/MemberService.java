package com.example.carelink.service;

import com.example.carelink.dao.MemberMapper;
import com.example.carelink.dto.LoginDTO;
import com.example.carelink.dto.MemberDTO;
import com.example.carelink.common.Constants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final PasswordEncoder passwordEncoder;

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
            
            // 비밀번호 검증 (BCrypt 암호화 지원)
            boolean passwordMatches = false;
            if (member.getPassword().startsWith("$2a$")) {
                // BCrypt로 암호화된 비밀번호
                passwordMatches = passwordEncoder.matches(loginDTO.getPassword(), member.getPassword());
            } else {
                // 기존 평문 비밀번호 (마이그레이션 전)
                passwordMatches = loginDTO.getPassword().equals(member.getPassword());
            }
            
            if (passwordMatches) {
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
            
            // 역할 유효성 검증
            if (!Constants.MEMBER_ROLE_USER.equals(memberDTO.getRole()) && 
                !Constants.MEMBER_ROLE_FACILITY.equals(memberDTO.getRole())) {
                throw new IllegalArgumentException("올바르지 않은 역할입니다.");
            }
            
            // 시설 관리자인 경우 필수 필드 검증
            if (Constants.MEMBER_ROLE_FACILITY.equals(memberDTO.getRole())) {
                validateFacilityFields(memberDTO);
            }
            
            // 기본값 설정
            memberDTO.setActive(true);
            memberDTO.setLoginFailCount(0);
            
            // 비밀번호 BCrypt 암호화
            memberDTO.setPassword(passwordEncoder.encode(memberDTO.getPassword()));
            
            // 회원 정보 저장
            memberMapper.insertMember(memberDTO);
            log.info("회원가입 완료: {} (역할: {})", memberDTO.getUserId(), memberDTO.getRole());
            
        } catch (IllegalArgumentException e) {
            // 비즈니스 로직 예외는 그대로 전파
            throw e;
        } catch (Exception e) {
            log.error("회원가입 처리 중 오류 발생: {}", memberDTO.getUserId(), e);
            throw new RuntimeException("회원가입 처리 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 시설 관리자 필수 필드 검증
     */
    private void validateFacilityFields(MemberDTO memberDTO) {
        if (memberDTO.getFacilityName() == null || memberDTO.getFacilityName().trim().isEmpty()) {
            throw new IllegalArgumentException("시설명은 필수입니다.");
        }
        if (memberDTO.getFacilityType() == null || memberDTO.getFacilityType().trim().isEmpty()) {
            throw new IllegalArgumentException("시설 유형은 필수입니다.");
        }
        if (memberDTO.getBusinessNumber() == null || memberDTO.getBusinessNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("사업자등록번호는 필수입니다.");
        }
        if (memberDTO.getFacilityAddress() == null || memberDTO.getFacilityAddress().trim().isEmpty()) {
            throw new IllegalArgumentException("시설 주소는 필수입니다.");
        }
        if (memberDTO.getFacilityPhone() == null || memberDTO.getFacilityPhone().trim().isEmpty()) {
            throw new IllegalArgumentException("시설 전화번호는 필수입니다.");
        }
        if (memberDTO.getDirectorName() == null || memberDTO.getDirectorName().trim().isEmpty()) {
            throw new IllegalArgumentException("시설장 이름은 필수입니다.");
        }
        
        // 사업자등록번호 형식 검증
        if (!memberDTO.getBusinessNumber().matches("^\\d{3}-\\d{2}-\\d{5}$")) {
            throw new IllegalArgumentException("사업자등록번호 형식이 올바르지 않습니다.");
        }
        
        // 시설 전화번호 형식 검증
        if (!memberDTO.getFacilityPhone().matches("^0\\d{1,2}-\\d{3,4}-\\d{4}$")) {
            throw new IllegalArgumentException("시설 전화번호 형식이 올바르지 않습니다.");
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