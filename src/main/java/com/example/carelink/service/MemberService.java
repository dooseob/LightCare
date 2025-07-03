package com.example.carelink.service;

import com.example.carelink.dao.MemberMapper;
import com.example.carelink.dao.FacilityMapper;
import com.example.carelink.dto.LoginDTO;
import com.example.carelink.dto.MemberDTO;
import com.example.carelink.dto.FacilityDTO;
import com.example.carelink.common.Constants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value; // @Value를 사용한다면 유지
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final FacilityMapper facilityMapper;
    private final PasswordEncoder passwordEncoder; // 비밀번호 암호화를 위해 주입

    // @Value 설정과 관련 변수 유지 (프로필 이미지 업로드 기능이 DTO에 있으므로)
    @Value("${file.upload-dir.profile}")
    private String uploadDir;

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

            // 비밀번호 검증 (개발용: 평문 비교)
            log.info("=== 비밀번호 검증 디버그 ===");
            log.info("DB 저장된 비밀번호: {}", member.getPassword());
            log.info("입력된 비밀번호: {}", loginDTO.getPassword());
            
            // 개발용: 평문 비밀번호 비교
            boolean passwordMatches = loginDTO.getPassword().equals(member.getPassword());
            log.info("비밀번호 매칭 결과: {}", passwordMatches);
            
            if (passwordMatches) {
                memberMapper.updateLoginSuccess(member.getMemberId());
                log.info("로그인 성공: {}", loginDTO.getUserId());
                return member;
            } else {
                memberMapper.updateLoginFail(member.getMemberId());
                log.warn("로그인 실패: 비밀번호 불일치. ID: {}, DB 비밀번호 시작: {}", 
                    loginDTO.getUserId(), member.getPassword().substring(0, Math.min(10, member.getPassword().length())));
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
            // 1. 아이디 중복 확인
            if (isUserIdDuplicate(memberDTO.getUserId())) {
                throw new IllegalArgumentException("이미 사용중인 아이디입니다.");
            }

            // 2. 이메일 중복 확인 (이메일이 제공된 경우에만)
            if (memberDTO.getEmail() != null && !memberDTO.getEmail().trim().isEmpty()) {
                if (memberMapper.existsByEmail(memberDTO.getEmail())) {
                    throw new IllegalArgumentException("이미 사용중인 이메일입니다.");
                }
            }

            // 3. 비밀번호 처리 (개발용: 평문 저장)
            // 나중에 배포할 때 passwordEncoder.encode() 사용
            // String encodedPassword = passwordEncoder.encode(memberDTO.getPassword());
            // memberDTO.setPassword(encodedPassword);

            // 4. 기타 필드 기본값 설정 (DDL의 DEFAULT 값과 일치하도록 명시적 설정)
            // memberId는 AUTO_INCREMENT이므로 null로 설정하여 DB가 자동 생성하도록 합니다.
            memberDTO.setMemberId(null); // 이 라인을 추가하여 memberId가 null로 시작하도록 합니다.

            if (memberDTO.getRole() == null || memberDTO.getRole().isEmpty()) {
                memberDTO.setRole(Constants.MEMBER_ROLE_USER); // Constants.MEMBER_ROLE_USER는 "USER" 문자열을 반환한다고 가정
            }
            memberDTO.setIsActive(true); // SQL DEFAULT TRUE
            memberDTO.setLoginFailCount(0); // SQL DEFAULT 0
            memberDTO.setIsDeleted(false); // SQL DEFAULT FALSE

            // DDL에 따라 NULL을 허용하는 필드에 값이 없으면 명시적으로 null 설정
            if (memberDTO.getPhone() != null && memberDTO.getPhone().isEmpty()) {
                memberDTO.setPhone(null);
            }
            if (memberDTO.getAddress() != null && memberDTO.getAddress().isEmpty()) {
                memberDTO.setAddress(null);
            }
            memberDTO.setProfileImage(null); // 프로필 이미지는 폼에서 직접 받지 않는다면 null로 설정

            // lastLoginAt은 회원가입 시에는 null로 설정
            memberDTO.setLastLoginAt(null);

            // created_at, updated_at은 DB DEFAULT CURRENT_TIMESTAMP이므로 DTO에 설정해도 DB가 우선합니다.
            // 명시적으로 설정해도 무방하나, DB의 자동 생성 기능을 신뢰하는 것이 일반적입니다.
            // memberDTO.setCreatedAt(LocalDateTime.now());
            // memberDTO.setUpdatedAt(LocalDateTime.now());


            // 5. Mapper를 통해 데이터베이스에 저장
            int result = memberMapper.insertMember(memberDTO);
            if (result == 0) { // insert 쿼리의 반환값(영향받은 행 수)이 0이면 실패
                throw new RuntimeException("회원가입 데이터 저장에 실패했습니다. (영향받은 행 없음)");
            }
            
            // 6. 시설회원인 경우 시설 정보도 저장
            if (Constants.MEMBER_ROLE_FACILITY.equals(memberDTO.getRole()) && memberDTO.getFacilityName() != null) {
                FacilityDTO facilityDTO = new FacilityDTO();
                facilityDTO.setFacilityName(memberDTO.getFacilityName());
                facilityDTO.setFacilityType(memberDTO.getFacilityType());
                facilityDTO.setAddress(memberDTO.getAddress());
                facilityDTO.setDetailAddress(memberDTO.getDetailAddress());
                facilityDTO.setPhone(memberDTO.getFacilityPhone());
                facilityDTO.setDescription(memberDTO.getDescription());
                facilityDTO.setHomepage(memberDTO.getHomepage());
                facilityDTO.setCapacity(memberDTO.getCapacity());
                facilityDTO.setOperatingHours(memberDTO.getOperatingHours());
                facilityDTO.setFeatures(memberDTO.getFeatures());
                facilityDTO.setRegisteredMemberId(memberDTO.getMemberId());
                facilityDTO.setIsApproved(false); // 기본값: 승인 대기
                facilityDTO.setApprovalStatus("PENDING");
                
                int facilityResult = facilityMapper.insertFacility(facilityDTO);
                if (facilityResult == 0) {
                    throw new RuntimeException("시설 정보 저장에 실패했습니다.");
                }
                log.info("시설 정보 저장 성공: {}", facilityDTO.getFacilityName());
            }
            
            log.info("회원가입 성공: {}", memberDTO.getUserId());

        } catch (IllegalArgumentException e) { // 아이디/이메일 중복 등 비즈니스 로직 예외
            log.warn("회원가입 실패 (비즈니스 로직): {}", e.getMessage());
            throw e; // 호출한 곳으로 예외를 다시 던짐
        } catch (Exception e) { // 그 외 예상치 못한 모든 예외
            log.error("회원가입 처리 중 알 수 없는 오류 발생: {}", memberDTO.getUserId(), e);
            // 더 구체적인 오류 메시지를 사용자에게 전달하기 위해 예외를 래핑할 수 있습니다.
            throw new RuntimeException("회원가입 처리 중 알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", e);
        }
    }

    /**
     * 사용자 ID 중복 체크
     */
    @Transactional(readOnly = true)
    public boolean isUserIdDuplicate(String userId) {
        try {
            // existsByUserId 메서드 사용으로 변경
            return memberMapper.existsByUserId(userId);
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
        log.info("회원정보 수정 요청: memberId={}, name={}, email={}", 
                memberDTO.getMemberId(), memberDTO.getName(), memberDTO.getEmail());
        
        MemberDTO existingMember = memberMapper.findById(memberDTO.getMemberId());
        if (existingMember == null) {
            throw new IllegalArgumentException("존재하지 않는 회원입니다.");
        }
        
        log.info("기존 회원 정보: memberId={}, name={}, email={}", 
                existingMember.getMemberId(), existingMember.getName(), existingMember.getEmail());

        // 비밀번호는 이 메서드에서 변경하지 않음 (기존 비밀번호 유지)
        memberDTO.setPassword(existingMember.getPassword());
        
        // 권한과 기타 중요 정보는 기존 값 유지
        memberDTO.setRole(existingMember.getRole());
        memberDTO.setIsActive(existingMember.getIsActive());
        memberDTO.setIsDeleted(existingMember.getIsDeleted());
        memberDTO.setLoginFailCount(existingMember.getLoginFailCount());
        memberDTO.setLastLoginAt(existingMember.getLastLoginAt());
        memberDTO.setCreatedAt(existingMember.getCreatedAt());

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
        
        log.info("업데이트할 회원 정보: memberId={}, name={}, email={}, phone={}, address={}", 
                memberDTO.getMemberId(), memberDTO.getName(), memberDTO.getEmail(), 
                memberDTO.getPhone(), memberDTO.getAddress());

        int result = memberMapper.updateMember(memberDTO);
        log.info("회원정보 업데이트 쿼리 실행 결과: {} 행이 영향받음", result);
        
        if (result == 0) {
            throw new RuntimeException("회원 정보 수정에 실패했습니다. 영향받은 행: 0");
        }
        log.info("회원정보 수정 완료: userId={}, memberId={}", memberDTO.getUserId(), memberDTO.getMemberId());
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

        // 현재 비밀번호 확인 (개발 환경에서는 평문 비교)
        if (!currentPassword.equals(member.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }

        if (!newPassword.equals(confirmNewPassword)) {
            throw new IllegalArgumentException("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
        }

        if (newPassword.length() < 8) {
            throw new IllegalArgumentException("새 비밀번호는 최소 8자 이상이어야 합니다.");
        }

        // 개발 환경에서는 평문으로 저장
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
