package com.example.carelink.service;

import com.example.carelink.dao.MemberMapper;
import com.example.carelink.dto.LoginDTO;
import com.example.carelink.dto.MemberDTO;
import com.example.carelink.common.Constants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value; // @Value를 사용한다면 유지
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile; // MultipartFile 유지

import java.io.File; // 파일 처리 관련 클래스 유지
import java.nio.file.Files; // 파일 처리 관련 클래스 유지
import java.nio.file.Path; // 파일 처리 관련 클래스 유지
import java.nio.file.Paths; // 파일 처리 관련 클래스 유지
import java.util.List; // List 유지 (페이징, 역할별 조회)
import java.util.UUID; // UUID 유지 (파일 이름 생성)

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

    // @Value 설정과 관련 변수 유지 (프로필 이미지 업로드 기능이 DTO에 있으므로)
    @Value("${file.upload-dir.profile}")
    private String uploadDir;

    // 비밀번호 암호화 메서드 (BCryptPasswordEncoder 또는 SHA-256)는 제거합니다.

    /**
     * 로그인 처리
     */
    public MemberDTO login(LoginDTO loginDTO) {
        try {
            MemberDTO member = memberMapper.findByUserId(loginDTO.getUserId());

            if (member == null) {
                log.warn("로그인 실패: 존재하지 않는 사용자 ID: {}", loginDTO.getUserId());
                return null;
            }

            if (member.getIsDeleted() != null && member.getIsDeleted()) {
                log.warn("로그인 실패: 삭제 처리된 계정입니다. ID: {}", loginDTO.getUserId());
                return null;
            }

            if (member.getIsActive() != null && !member.getIsActive()) {
                log.warn("로그인 실패: 비활성화된 계정: {}", loginDTO.getUserId());
                return null;
            }

            if (member.getLoginFailCount() >= Constants.MAX_LOGIN_ATTEMPTS) {
                log.warn("로그인 실패: 로그인 시도 횟수 초과. ID: {}", loginDTO.getUserId());
                return null;
            }

            // 비밀번호 검증 (평문 비교) - 보안 취약
            if (loginDTO.getPassword().equals(member.getPassword())) {
                memberMapper.updateLoginSuccess(member.getMemberId());
                log.info("로그인 성공: {}", loginDTO.getUserId());
                return member;
            } else {
                memberMapper.updateLoginFail(member.getMemberId());
                log.warn("로그인 실패: 비밀번호 불일치. ID: {}", loginDTO.getUserId());
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
    @Transactional
    public void join(MemberDTO memberDTO) {
        try {
            if (memberMapper.findByUserId(memberDTO.getUserId()) != null) {
                throw new IllegalArgumentException("이미 사용중인 아이디입니다.");
            }

            // 비밀번호는 평문으로 저장됩니다 (암호화 없음 - 보안 취약)
            // memberDTO.setPassword(memberDTO.getPassword()); // 이 라인은 불필요, 이미 DTO에 값이 있음

            if (memberDTO.getRole() == null || memberDTO.getRole().isEmpty()) {
                memberDTO.setRole(Constants.MEMBER_ROLE_USER);
            }
            memberDTO.setIsActive(true);
            memberDTO.setLoginFailCount(0);
            memberDTO.setIsDeleted(false);

            int result = memberMapper.insertMember(memberDTO);
            if (result == 0) {
                throw new RuntimeException("회원가입 데이터 저장에 실패했습니다.");
            }
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
     * 회원 ID로 회원 정보 조회 (유지)
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
     * 사용자 ID로 회원 정보 조회 (컨트롤러에서 Principal 사용 시 호출 - Principal 사용 안 하면 DTO 그대로 반환)
     * Principal을 사용하지 않더라도, userId로 정보를 조회하는 로직이 필요할 수 있으므로 유지
     */
    @Transactional(readOnly = true)
    public MemberDTO getMemberByUserId(String userId) {
        try {
            return memberMapper.findByUserId(userId);
        } catch (Exception e) {
            log.error("사용자 ID로 회원 정보 조회 중 오류 발생: {}", userId, e);
            throw new RuntimeException("회원 정보 조회 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 회원 정보 수정 (프로필 이미지 파일 처리 로직 포함) (유지)
     */
    public void updateMember(MemberDTO memberDTO, MultipartFile profileImageFile) throws Exception {
        MemberDTO existingMember = memberMapper.findById(memberDTO.getMemberId());
        if (existingMember == null) {
            throw new IllegalArgumentException("존재하지 않는 회원입니다.");
        }

        // 비밀번호는 이 메서드에서 변경하지 않음 (기존 비밀번호 유지)
        memberDTO.setPassword(existingMember.getPassword());

        if (profileImageFile != null && !profileImageFile.isEmpty()) {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                log.info("프로필 이미지 업로드 디렉토리 생성: {}", uploadPath.toAbsolutePath());
            }

            String originalFilename = profileImageFile.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String savedFileName = UUID.randomUUID().toString() + fileExtension;
            Path filePath = uploadPath.resolve(savedFileName);

            Files.copy(profileImageFile.getInputStream(), filePath);
            log.info("새 프로필 이미지 저장: {}", filePath.toAbsolutePath());

            memberDTO.setProfileImage("/profile_images/" + savedFileName); // 웹 접근 경로

            // 기존 프로필 이미지 삭제 (기존 이미지가 있고, 새 이미지가 업로드된 경우)
            if (existingMember.getProfileImage() != null && !existingMember.getProfileImage().isEmpty()) {
                // 저장된 파일명을 추출 (예: /profile_images/abc-123.jpg 에서 abc-123.jpg)
                String oldProfileImagePath = existingMember.getProfileImage();
                String oldFileName = oldProfileImagePath.substring(oldProfileImagePath.lastIndexOf("/") + 1);
                Path oldFilePath = Paths.get(uploadDir + oldFileName);
                try {
                    Files.deleteIfExists(oldFilePath);
                    log.info("기존 프로필 이미지 삭제: {}", oldFilePath.toAbsolutePath());
                } catch (Exception e) {
                    log.warn("기존 프로필 이미지 삭제 실패 (파일이 없거나 권한 문제일 수 있음): {}", oldFilePath.toAbsolutePath(), e);
                }
            }
        } else {
            // 새 이미지가 없으면 기존 이미지 경로 유지
            memberDTO.setProfileImage(existingMember.getProfileImage());
            log.debug("새로운 프로필 이미지가 없어 기존 이미지 유지: {}", existingMember.getProfileImage());
        }

        int result = memberMapper.updateMember(memberDTO);
        if (result == 0) {
            throw new RuntimeException("회원 정보 수정에 실패했습니다.");
        }
        log.info("회원정보 수정 완료: {}", memberDTO.getUserId());
    }

    /**
     * 비밀번호 변경 처리 (유지)
     */
    @Transactional
    public void changePassword(String userId, String currentPassword, String newPassword, String confirmNewPassword) {
        MemberDTO member = memberMapper.findByUserId(userId);
        if (member == null) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
        }

        // 현재 비밀번호 확인 (평문 비교) - 보안 취약
        if (!currentPassword.equals(member.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }

        if (!newPassword.equals(confirmNewPassword)) {
            throw new IllegalArgumentException("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
        }

        if (newPassword.length() < 8) {
            throw new IllegalArgumentException("새 비밀번호는 최소 8자 이상이어야 합니다.");
        }

        // 새 비밀번호 업데이트 (평문 저장) - 보안 취약
        member.setPassword(newPassword);
        int result = memberMapper.updatePassword(member);
        if (result == 0) {
            throw new RuntimeException("비밀번호 변경에 실패했습니다.");
        }
        log.info("비밀번호 변경 서비스: {} 사용자의 비밀번호가 성공적으로 변경됨.", userId);
    }

    /**
     * 회원 탈퇴 (논리 삭제) (유지)
     */
    @Transactional
    public void deleteMember(String userId) {
        int result = memberMapper.softDeleteMember(userId);
        if (result == 0) {
            throw new RuntimeException("회원 탈퇴 처리 중 오류가 발생했습니다.");
        }
        log.info("회원 탈퇴 처리 완료: {}", userId);
    }

    /**
     * 전체 회원 수 조회 (유지)
     */
    @Transactional(readOnly = true)
    public int getTotalMembersCount() {
        try {
            return memberMapper.getTotalCount();
        } catch (Exception e) {
            log.error("전체 회원 수 조회 중 오류 발생", e);
            throw new RuntimeException("회원 수 조회 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 페이징된 회원 목록 조회 (관리자용) (유지)
     */
    @Transactional(readOnly = true)
    public List<MemberDTO> getMembersWithPaging(MemberDTO searchDTO) {
        try {
            return memberMapper.findMembersWithPaging(searchDTO);
        } catch (Exception e) {
            log.error("페이징된 회원 목록 조회 중 오류 발생", e);
            throw new RuntimeException("회원 목록 조회 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 특정 역할의 회원 목록 조회 (유지)
     */
    @Transactional(readOnly = true)
    public List<MemberDTO> getMembersByRole(String role) {
        try {
            return memberMapper.findMembersByRole(role);
        } catch (Exception e) {
            log.error("역할별 회원 목록 조회 중 오류 발생: {}", role, e);
            throw new RuntimeException("역할별 회원 목록 조회 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 회원 상태 변경 (활성화/비활성화) (유지)
     */
    @Transactional
    public void updateMemberStatus(Long memberId, boolean isActive) {
        try {
            memberMapper.updateMemberStatus(memberId, isActive);
            log.info("회원 상태 변경 완료: memberId={}, isActive={}", memberId, isActive);
        } catch (Exception e) {
            log.error("회원 상태 변경 중 오류 발생: memberId={}", memberId, e);
            throw new RuntimeException("회원 상태 변경 중 오류가 발생했습니다.", e);
        }
    }
}