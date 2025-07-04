package com.example.carelink.service;

import com.example.carelink.dao.MemberMapper;
import com.example.carelink.dao.FacilityMapper;
import com.example.carelink.dao.BoardMapper;
import com.example.carelink.dao.ReviewMapper;
import com.example.carelink.dao.JobMapper;
import com.example.carelink.dto.LoginDTO;
import com.example.carelink.dto.MemberDTO;
import com.example.carelink.dto.FacilityDTO;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.util.UUID;
import com.example.carelink.dto.BoardDTO;
import com.example.carelink.dto.ReviewDTO;
import com.example.carelink.dto.JobDTO;
import com.example.carelink.common.Constants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List; // List 유지 (페이징, 역할별 조회)
import java.util.Map; // Map 인터페이스
import java.util.HashMap; // HashMap 클래스
import java.util.ArrayList; // ArrayList 클래스
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
    private final BoardMapper boardMapper;
    private final ReviewMapper reviewMapper;
    private final JobMapper jobMapper;
    private final PasswordEncoder passwordEncoder; // 비밀번호 암호화를 위해 주입


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
     * 회원가입 처리 (기존 메서드 - 파일 없이)
     */
    @Transactional
    public void join(MemberDTO memberDTO) {
        join(memberDTO, null);
    }

    /**
     * 회원가입 처리 (파일 포함)
     */
    @Transactional
    public void join(MemberDTO memberDTO, MultipartFile facilityImageFile) {
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
                // 위도/경도 설정 추가
                facilityDTO.setLatitude(memberDTO.getLatitude());
                facilityDTO.setLongitude(memberDTO.getLongitude());
                facilityDTO.setRegisteredMemberId(memberDTO.getMemberId());
                facilityDTO.setIsApproved(false); // 기본값: 승인 대기
                facilityDTO.setApprovalStatus("PENDING");
                
                // 시설 이미지 파일 처리
                if (facilityImageFile != null && !facilityImageFile.isEmpty()) {
                    String imagePath = saveFacilityImage(facilityImageFile, memberDTO.getUserId());
                    facilityDTO.setFacilityImage(imagePath);
                }
                
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
            // 프로필 이미지 저장 (새로운 방식 사용)
            String profileImagePath = saveProfileImage(profileImageFile, existingMember.getUserId());
            memberDTO.setProfileImage(profileImagePath);
            
            // 기존 프로필 이미지 삭제 (기존 이미지가 있고, 새 이미지가 업로드된 경우)
            if (existingMember.getProfileImage() != null && !existingMember.getProfileImage().isEmpty()) {
                try {
                    // 기존 파일 삭제
                    String projectRoot = System.getProperty("user.dir");
                    String oldImagePath = existingMember.getProfileImage();
                    if (oldImagePath.startsWith("/uploads/profile/")) {
                        String oldFileName = oldImagePath.substring("/uploads/profile/".length());
                        File oldFile = new File(projectRoot + "/src/main/resources/static" + oldImagePath);
                        if (oldFile.exists() && oldFile.delete()) {
                            log.info("기존 프로필 이미지 삭제 성공: {}", oldFile.getAbsolutePath());
                        }
                    }
                } catch (Exception e) {
                    log.warn("기존 프로필 이미지 삭제 실패: {}", e.getMessage());
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
     * 사용자가 작성한 콘텐츠 개수 조회
     */
    @Transactional(readOnly = true)
    public Map<String, Integer> getUserContentCounts(Long memberId) {
        Map<String, Integer> counts = new HashMap<>();
        try {
            // 각 매퍼에서 콘텐츠 개수 조회
            List<BoardDTO> boards = boardMapper.findBoardsByMemberId(memberId);
            List<ReviewDTO> reviews = reviewMapper.findReviewsByMemberId(memberId);
            List<JobDTO> jobs = jobMapper.findJobsByMemberId(memberId);
            
            int boardCount = boards != null ? boards.size() : 0;
            int reviewCount = reviews != null ? reviews.size() : 0;
            int jobCount = jobs != null ? jobs.size() : 0;
            
            counts.put("board", boardCount);
            counts.put("review", reviewCount);
            counts.put("job", jobCount);
            counts.put("total", boardCount + reviewCount + jobCount);
            
            log.info("사용자 콘텐츠 개수 조회: memberId={}, 결과={}", memberId, counts);
            return counts;
            
        } catch (Exception e) {
            log.error("콘텐츠 개수 조회 중 오류: memberId={}", memberId, e);
            // 오류 시 기본값 반환
            counts.put("board", 0);
            counts.put("review", 0);
            counts.put("job", 0);
            counts.put("total", 0);
            return counts;
        }
    }
    
    /**
     * 내가 쓴 글 조회 (유형별 필터링 및 페이징)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getMyPosts(Long memberId, String type, int page, int pageSize, int offset) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> posts = new ArrayList<>();
        
        try {
            // 콘텐츠 타입별 개수 조회
            Map<String, Integer> contentCounts = getUserContentCounts(memberId);
            result.put("contentCounts", contentCounts);
            
            if ("board".equals(type)) {
                // 게시글만 조회
                List<BoardDTO> boards = boardMapper.findBoardsByMemberId(memberId);
                for (BoardDTO board : boards) {
                    Map<String, Object> post = new HashMap<>();
                    post.put("id", board.getBoardId());
                    post.put("title", board.getTitle());
                    post.put("content", board.getContent());
                    post.put("createdAt", board.getCreatedAt());
                    post.put("viewCount", board.getViewCount() != null ? board.getViewCount() : 0);
                    post.put("likeCount", board.getLikeCount() != null ? board.getLikeCount() : 0);
                    post.put("rating", null); // 게시글에는 평점 없음
                    post.put("salary", null); // 게시글에는 급여 없음
                    post.put("type", "board");
                    post.put("category", board.getBoardType());
                    post.put("url", "/board/detail/" + board.getBoardId());
                    posts.add(post);
                }
            } else if ("review".equals(type)) {
                // 리뷰만 조회
                List<ReviewDTO> reviews = reviewMapper.findReviewsByMemberId(memberId);
                for (ReviewDTO review : reviews) {
                    Map<String, Object> post = new HashMap<>();
                    post.put("id", review.getReviewId());
                    post.put("title", review.getTitle());
                    post.put("content", review.getContent());
                    post.put("createdAt", review.getCreatedAt());
                    post.put("viewCount", null); // 리뷰에는 조회수 없음
                    post.put("likeCount", review.getLikeCount() != null ? review.getLikeCount() : 0);
                    post.put("rating", review.getRating());
                    post.put("salary", null); // 리뷰에는 급여 없음
                    post.put("type", "review");
                    post.put("category", "리뷰");
                    post.put("url", "/review/detail/" + review.getReviewId());
                    posts.add(post);
                }
            } else if ("job".equals(type)) {
                // 구인구직만 조회
                List<JobDTO> jobs = jobMapper.findJobsByMemberId(memberId);
                for (JobDTO job : jobs) {
                    Map<String, Object> post = new HashMap<>();
                    post.put("id", job.getJobId());
                    post.put("title", job.getTitle());
                    post.put("content", job.getContent());
                    post.put("createdAt", job.getCreatedAt());
                    post.put("viewCount", job.getViewCount() != null ? job.getViewCount() : 0);
                    post.put("likeCount", null); // 구인구직에는 추천 없음
                    post.put("rating", null); // 구인구직에는 평점 없음
                    post.put("salary", job.getSalaryDescription());
                    post.put("type", "job");
                    post.put("category", job.getJobType());
                    post.put("url", "/job/detail/" + job.getJobId());
                    posts.add(post);
                }
            } else {
                // 전체 조회
                List<BoardDTO> boards = boardMapper.findBoardsByMemberId(memberId);
                List<ReviewDTO> reviews = reviewMapper.findReviewsByMemberId(memberId);
                List<JobDTO> jobs = jobMapper.findJobsByMemberId(memberId);
                
                // 게시글 추가
                for (BoardDTO board : boards) {
                    Map<String, Object> post = new HashMap<>();
                    post.put("id", board.getBoardId());
                    post.put("title", board.getTitle());
                    post.put("content", board.getContent());
                    post.put("createdAt", board.getCreatedAt());
                    post.put("viewCount", board.getViewCount() != null ? board.getViewCount() : 0);
                    post.put("likeCount", board.getLikeCount() != null ? board.getLikeCount() : 0);
                    post.put("rating", null); // 게시글에는 평점 없음
                    post.put("salary", null); // 게시글에는 급여 없음
                    post.put("type", "board");
                    post.put("category", board.getBoardType());
                    post.put("url", "/board/detail/" + board.getBoardId());
                    posts.add(post);
                }
                
                // 리뷰 추가
                for (ReviewDTO review : reviews) {
                    Map<String, Object> post = new HashMap<>();
                    post.put("id", review.getReviewId());
                    post.put("title", review.getTitle());
                    post.put("content", review.getContent());
                    post.put("createdAt", review.getCreatedAt());
                    post.put("viewCount", null); // 리뷰에는 조회수 없음
                    post.put("likeCount", review.getLikeCount() != null ? review.getLikeCount() : 0);
                    post.put("rating", review.getRating());
                    post.put("salary", null); // 리뷰에는 급여 없음
                    post.put("type", "review");
                    post.put("category", "리뷰");
                    post.put("url", "/review/detail/" + review.getReviewId());
                    posts.add(post);
                }
                
                // 구인구직 추가
                for (JobDTO job : jobs) {
                    Map<String, Object> post = new HashMap<>();
                    post.put("id", job.getJobId());
                    post.put("title", job.getTitle());
                    post.put("content", job.getContent());
                    post.put("createdAt", job.getCreatedAt());
                    post.put("viewCount", job.getViewCount() != null ? job.getViewCount() : 0);
                    post.put("likeCount", null); // 구인구직에는 추천 없음
                    post.put("rating", null); // 구인구직에는 평점 없음
                    post.put("salary", job.getSalaryDescription());
                    post.put("type", "job");
                    post.put("category", job.getJobType());
                    post.put("url", "/job/detail/" + job.getJobId());
                    posts.add(post);
                }
            }
            
            // 날짜 순으로 정렬 (최신순)
            posts.sort((a, b) -> ((java.time.LocalDateTime) b.get("createdAt")).compareTo((java.time.LocalDateTime) a.get("createdAt")));
            
            // 페이징 처리
            int totalCount = posts.size();
            int startIndex = Math.min(offset, totalCount);
            int endIndex = Math.min(offset + pageSize, totalCount);
            
            List<Map<String, Object>> pagedPosts = posts.subList(startIndex, endIndex);
            
            result.put("posts", pagedPosts);
            result.put("totalCount", totalCount);
            
            log.info("내가 쓴 글 조회 완료: memberId={}, type={}, 총{}\uac1c, 현재페이지 {}\uac1c", 
                    memberId, type, totalCount, pagedPosts.size());
            
            return result;
            
        } catch (Exception e) {
            log.error("내가 쓴 글 조회 중 오류: memberId={}, type={}", memberId, type, e);
            result.put("posts", new ArrayList<>());
            result.put("totalCount", 0);
            result.put("contentCounts", Map.of("board", 0, "review", 0, "job", 0, "total", 0));
            return result;
        }
    }
    
    /**
     * 회원 탈퇴 (옵션에 따라 처리 방식 결정)
     */
    @Transactional
    public String deleteMemberWithOption(String userId, String deleteOption) {
        try {
            if ("anonymous".equals(deleteOption)) {
                // 익명화: 개인정보만 삭제, 콘텐츠는 "탈퇴회원"으로 표시
                int result = memberMapper.anonymizeMember(userId);
                if (result == 0) {
                    throw new RuntimeException("회원 익명화 처리 중 오류가 발생했습니다.");
                }
                log.info("회원 익명화 처리 완료: {}", userId);
                return "회원 탈퇴가 완료되었습니다. 작성하신 게시글은 '탈퇴회원'으로 표시됩니다.";
            } else if ("complete".equals(deleteOption)) {
                // 완전삭제: 모든 콘텐츠와 함께 물리 삭제
                deleteAllUserContent(userId);
                int result = memberMapper.hardDeleteMember(userId);
                if (result == 0) {
                    throw new RuntimeException("회원 완전삭제 처리 중 오류가 발생했습니다.");
                }
                log.info("회원 완전삭제 처리 완료: {}", userId);
                return "회원 탈퇴가 완료되었습니다. 모든 개인정보와 작성 콘텐츠가 완전히 삭제되었습니다.";
            } else {
                // 기본: 논리 삭제
                int result = memberMapper.softDeleteMember(userId);
                if (result == 0) {
                    throw new RuntimeException("회원 탈퇴 처리 중 오류가 발생했습니다.");
                }
                log.info("회원 논리삭제 처리 완료: {}", userId);
                return "회원 탈퇴가 완료되었습니다.";
            }
        } catch (Exception e) {
            log.error("회원 탈퇴 처리 중 오류 발생: userId={}, option={}", userId, deleteOption, e);
            throw new RuntimeException("회원 탈퇴 처리 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 사용자의 모든 콘텐츠 삭제 (시설회원인 경우 관련 시설도 삭제)
     */
    @Transactional
    private void deleteAllUserContent(String userId) {
        try {
            MemberDTO member = memberMapper.findByUserId(userId);
            if (member == null) {
                throw new RuntimeException("회원 정보를 찾을 수 없습니다.");
            }
            
            Long memberId = member.getMemberId();
            
            // 1. 시설회원인 경우 관련 시설 삭제
            if (Constants.MEMBER_ROLE_FACILITY.equals(member.getRole())) {
                // 시설의 구인공고 먼저 삭제
                jobMapper.deleteByFacilityMemberId(memberId);
                log.info("시설 구인공고 삭제 완료: memberId={}", memberId);
                
                // 시설 리뷰 삭제
                reviewMapper.deleteByFacilityMemberId(memberId);
                log.info("시설 리뷰 삭제 완료: memberId={}", memberId);
                
                // 시설 정보 삭제
                facilityMapper.deleteByMemberId(memberId);
                log.info("시설 정보 삭제 완료: memberId={}", memberId);
            }
            
            // 2. 회원이 작성한 모든 콘텐츠 삭제
            boardMapper.deleteByMemberId(memberId);
            reviewMapper.deleteByMemberId(memberId);
            jobMapper.deleteByMemberId(memberId);
            
            log.info("사용자 콘텐츠 삭제 완료: userId={}, memberId={}", userId, memberId);
        } catch (Exception e) {
            log.error("사용자 콘텐츠 삭제 중 오류: userId={}", userId, e);
            throw e;
        }
    }
    
    /**
     * 회원 탈퇴 (논리 삭제) - 이전 버전 호환성
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
     * 프로필 이미지 저장 메서드
     */
    private String saveProfileImage(MultipartFile file, String userId) {
        try {
            // 프로젝트 루트 경로 기반으로 절대 경로 설정
            String projectRoot = System.getProperty("user.dir");
            String uploadDir = projectRoot + "/src/main/resources/static/uploads/profile/";
            File uploadDirFile = new File(uploadDir);
            if (!uploadDirFile.exists()) {
                boolean created = uploadDirFile.mkdirs();
                log.info("프로필 이미지 업로드 디렉토리 생성: {} - {}", uploadDir, created ? "성공" : "실패");
            }
            
            // 파일명 생성 (userId + UUID + 원본 확장자)
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String savedFilename = "profile_" + userId + "_" + UUID.randomUUID().toString() + extension;
            
            // 파일 저장
            File savedFile = new File(uploadDir + savedFilename);
            file.transferTo(savedFile);
            log.info("프로필 이미지 저장 완료: {}", savedFile.getAbsolutePath());
            
            // 웹 경로 반환
            return "/uploads/profile/" + savedFilename;
            
        } catch (IOException e) {
            log.error("프로필 이미지 저장 중 오류 발생: userId={}", userId, e);
            throw new RuntimeException("프로필 이미지 저장에 실패했습니다.", e);
        }
    }

    /**
     * 시설 이미지 저장 메서드
     */
    private String saveFacilityImage(MultipartFile file, String userId) {
        try {
            // 프로젝트 루트 경로 기반으로 절대 경로 설정
            String projectRoot = System.getProperty("user.dir");
            String uploadDir = projectRoot + "/src/main/resources/static/uploads/facility/";
            File uploadDirFile = new File(uploadDir);
            if (!uploadDirFile.exists()) {
                boolean created = uploadDirFile.mkdirs();
                log.info("시설 이미지 업로드 디렉토리 생성: {} - {}", uploadDir, created ? "성공" : "실패");
            }
            
            // 파일명 생성 (userId + UUID + 원본 확장자)
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String savedFilename = "facility_" + userId + "_" + UUID.randomUUID().toString() + extension;
            
            // 파일 저장
            File savedFile = new File(uploadDir + savedFilename);
            file.transferTo(savedFile);
            log.info("시설 이미지 저장 완료: {}", savedFile.getAbsolutePath());
            
            // 웹 경로 반환
            return "/uploads/facility/" + savedFilename;
            
        } catch (IOException e) {
            log.error("시설 이미지 저장 중 오류 발생: userId={}", userId, e);
            throw new RuntimeException("시설 이미지 저장에 실패했습니다.", e);
        }
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

    // ================== 관리자용 추가 메서드들 ==================

    /**
     * 전체 회원 수 조회 (관리자용)
     */
    @Transactional(readOnly = true)
    public int getTotalMemberCount() {
        try {
            return memberMapper.getTotalCount();
        } catch (Exception e) {
            log.error("전체 회원 수 조회 중 오류 발생", e);
            return 0;
        }
    }

    /**
     * 시설 회원 수 조회 (관리자용)
     */
    @Transactional(readOnly = true)
    public int getFacilityMemberCount() {
        try {
            return memberMapper.getFacilityMemberCount();
        } catch (Exception e) {
            log.error("시설 회원 수 조회 중 오류 발생", e);
            return 0;
        }
    }

    /**
     * 역할별 회원 목록 조회 (페이징 포함, 관리자용)
     */
    @Transactional(readOnly = true)
    public List<MemberDTO> getMembersByRole(String role, int page, int pageSize) {
        try {
            MemberDTO searchDTO = new MemberDTO();
            searchDTO.setRole("ALL".equals(role) ? null : role);
            
            // 페이징 계산
            int offset = (page - 1) * pageSize;
            // MyBatis에서 offset, limit 처리를 위한 추가 설정이 필요할 수 있음
            
            return memberMapper.findMembersByRole("ALL".equals(role) ? null : role);
        } catch (Exception e) {
            log.error("역할별 회원 목록 조회 중 오류 발생: role={}, page={}", role, page, e);
            return new ArrayList<>();
        }
    }

    /**
     * 역할별 회원 수 조회 (관리자용)
     */
    @Transactional(readOnly = true)
    public int getMemberCountByRole(String role) {
        try {
            if ("ALL".equals(role)) {
                return memberMapper.getTotalCount();
            } else if ("FACILITY".equals(role)) {
                return memberMapper.getFacilityMemberCount();
            } else if ("USER".equals(role)) {
                return memberMapper.getUserMemberCount();
            } else {
                return memberMapper.getMemberCountByRole(role);
            }
        } catch (Exception e) {
            log.error("역할별 회원 수 조회 중 오류 발생: role={}", role, e);
            return 0;
        }
    }

    /**
     * 회원 활성화 상태 토글 (관리자용)
     */
    @Transactional
    public boolean toggleMemberActive(Long memberId) {
        try {
            MemberDTO member = memberMapper.findById(memberId);
            if (member == null) {
                throw new RuntimeException("회원을 찾을 수 없습니다.");
            }
            
            boolean newStatus = !Boolean.TRUE.equals(member.getIsActive());
            memberMapper.updateMemberStatus(memberId, newStatus);
            
            log.info("회원 활성화 상태 토글 완료: memberId={}, newStatus={}", memberId, newStatus);
            return true;
        } catch (Exception e) {
            log.error("회원 활성화 상태 토글 중 오류 발생: memberId={}", memberId, e);
            return false;
        }
    }
}
