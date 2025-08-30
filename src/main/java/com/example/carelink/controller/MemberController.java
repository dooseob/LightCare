package com.example.carelink.controller;

import com.example.carelink.dto.LoginDTO;
import com.example.carelink.dto.MemberDTO;
import com.example.carelink.service.MemberService;
import com.example.carelink.common.Constants;
import com.example.carelink.validation.groups.OnFacilityJoin;
import com.example.carelink.common.CustomMultipartFile;
import org.springframework.web.multipart.MultipartFile;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile; // MultipartFile 유지
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.http.ResponseEntity;

import javax.servlet.http.HttpSession; // 세션 관리를 위해 필요
import javax.validation.ConstraintViolation;
import javax.validation.Valid; // @Valid 어노테이션을 위해 필요
// import java.security.Principal; // Principal 제거
import javax.validation.Validator;

import java.util.HashMap;
import java.util.List; // List 유지
import java.util.Map;
import java.util.Set;

/**
 * 회원 관리 컨트롤러
 * 팀원 A 담당: 로그인, 회원가입, 회원정보 관리
 */
@Slf4j
@Controller
@RequestMapping("/member")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @Autowired
    private Validator validator;

    /**
     * 로그인 페이지 표시
     */
    @GetMapping("/login")
    public String loginForm(Model model) {
        model.addAttribute("loginDTO", new LoginDTO());
        return "member/login";
    }

    /**
     * 로그인 처리
     */
    @PostMapping("/login")
    public String login(@Valid @ModelAttribute LoginDTO loginDTO,
                        BindingResult bindingResult,
                        HttpSession session,
                        RedirectAttributes redirectAttributes) {

        // DTO 유효성 검증 실패 시
        if (bindingResult.hasErrors()) {
            log.warn("로그인 폼 유효성 검사 실패: {}", bindingResult.getAllErrors());
            return "member/login"; // 에러가 있으면 로그인 폼으로 다시 이동
        }

        log.info("로그인 시도: userId={}, 비밀번호 길이={}", loginDTO.getUserId(), loginDTO.getPassword().length());

        try {
            // MemberService를 통해 로그인 시도
            MemberDTO loginMember = memberService.login(loginDTO);

            if (loginMember != null) {
                // 로그인 성공 시 세션에 회원 정보 저장
                session.setAttribute(Constants.SESSION_MEMBER, loginMember);
                session.setAttribute("memberId", loginMember.getMemberId());
                log.info("컨트롤러 로그인 성공: userId={}, role={}", loginMember.getUserId(), loginMember.getRole());

                redirectAttributes.addFlashAttribute("message", "로그인되었습니다.");
                return "redirect:/"; // 홈 페이지로 리다이렉트
            } else {
                // 로그인 실패 시 에러 메시지 추가
                log.warn("컨트롤러 로그인 실패: userId={}", loginDTO.getUserId());
                redirectAttributes.addFlashAttribute("error", "아이디 또는 비밀번호가 잘못되었습니다.");
                return "redirect:/member/login"; // 로그인 페이지로 리다이렉트
            }

        } catch (Exception e) {
            log.error("로그인 처리 중 오류 발생: userId={}", loginDTO.getUserId(), e);
            redirectAttributes.addFlashAttribute("error", "로그인 처리 중 오류가 발생했습니다.");
            return "redirect:/member/login";
        }
    }

    /**
     * 로그아웃 처리
     */
    @GetMapping("/logout")
    public String logout(HttpSession session, RedirectAttributes redirectAttributes) {
        if (session != null) {
            session.invalidate(); // 현재 세션 무효화
        }
        redirectAttributes.addFlashAttribute("message", "로그아웃되었습니다.");
        return "redirect:/"; // 홈 페이지로 리다이렉트
    }

    /**
     * 회원가입 페이지 표시
     */
    @GetMapping("/join")
    public String joinForm(Model model) {
        model.addAttribute("memberDTO", new MemberDTO());
        return "member/join";
    }

    @PostMapping("/join")
    public String join(
            // @Validated에서 OnFacilityJoin 그룹을 제거합니다.
            // 이제 Default 그룹에 속한 유효성만 자동 검사됩니다 (ex: email, role 등)
            @Validated(value = {javax.validation.groups.Default.class})
            @ModelAttribute MemberDTO memberDTO,
            BindingResult bindingResult,
            @RequestParam(value = "facilityImageFile", required = false) MultipartFile facilityImageFile,
            HttpSession session,
            RedirectAttributes redirectAttributes,
            Model model) {

        // 1. 비밀번호 확인 검사 (기존과 동일)
        if (!memberDTO.getPassword().equals(memberDTO.getPasswordConfirm())) {
            bindingResult.rejectValue("passwordConfirm", "password.mismatch", "비밀번호 확인이 일치하지 않습니다.");
            log.warn("회원가입 실패: 비밀번호 확인 불일치");
            model.addAttribute("memberDTO", memberDTO);
            return "member/join";
        }

        // 2. 시설 회원일 경우에만 address 필드에 대한 추가 유효성 검사 수행
        // 일반 회원('USER')일 때는 이 블록이 실행되지 않으므로 address 검사가 일어나지 않습니다.
        if ("FACILITY".equalsIgnoreCase(memberDTO.getRole())) {
            // Validator를 사용하여 MemberDTO에 대해 OnFacilityJoin 그룹에 속하는 제약 조건만 수동으로 검사
            Set<ConstraintViolation<MemberDTO>> violations = validator.validate(memberDTO, OnFacilityJoin.class);
            for (ConstraintViolation<MemberDTO> violation : violations) {
                // 발생한 위반 사항을 bindingResult에 추가
                bindingResult.rejectValue(violation.getPropertyPath().toString(), "", violation.getMessage());
            }
        }

        // 3. 최종 유효성 검사 결과 확인 (기본 유효성 + 수동 추가된 유효성)
        if (bindingResult.hasErrors()) {
            log.warn("회원가입 유효성 검사 실패: {}", bindingResult.getAllErrors());
            model.addAttribute("memberDTO", memberDTO);
            return "member/join";
        }

        try {
            // MemberService를 통해 회원가입 처리 (시설 이미지 파일 포함)
            memberService.join(memberDTO, facilityImageFile);
            log.info("회원가입 성공: {}", memberDTO.getUserId());

            // 회원가입 후 자동 로그인 처리
            LoginDTO loginDTO = new LoginDTO();
            loginDTO.setUserId(memberDTO.getUserId());
            loginDTO.setPassword(memberDTO.getPassword());
            
            MemberDTO loginMember = memberService.login(loginDTO);
            if (loginMember != null) {
                // 자동 로그인 성공 시 세션에 회원 정보 저장
                session.setAttribute(Constants.SESSION_MEMBER, loginMember);
                session.setAttribute("memberId", loginMember.getMemberId());
                log.info("회원가입 후 자동 로그인 성공: userId={}", loginMember.getUserId());
                
                redirectAttributes.addFlashAttribute("message", "회원가입이 완료되었습니다. 환영합니다!");
                return "redirect:/"; // 홈 페이지로 리다이렉트
            } else {
                // 자동 로그인 실패 시 로그인 페이지로
                log.warn("회원가입은 성공했으나 자동 로그인 실패: {}", memberDTO.getUserId());
                redirectAttributes.addFlashAttribute("message", "회원가입이 완료되었습니다. 로그인해주세요.");
                return "redirect:/member/login";
            }

        } catch (IllegalArgumentException e) {
            // 서비스 계층에서 발생한 아이디 중복 등의 비즈니스 로직 예외 처리
            log.warn("회원가입 실패: {}", e.getMessage());
            bindingResult.rejectValue("userId", "duplicate.userId", e.getMessage()); // userId 필드에 에러 추가
            return "member/join";
        } catch (Exception e) {
            log.error("회원가입 처리 중 알 수 없는 오류 발생", e);
            redirectAttributes.addFlashAttribute("error", "회원가입 처리 중 오류가 발생했습니다.");
            return "member/join";
        }

    }

    /**
     * 아이디 중복 체크 (Ajax 요청 처리)
     */
    @PostMapping("/checkUserId")
    @ResponseBody // JSON 응답을 위해 사용
    public Map<String, Object> checkUserId(@RequestParam String userId) {
        Map<String, Object> result = new HashMap<>();

        try {
            // boolean isDuplicate = memberService.isUserIdDuplicate(userId);
            boolean isDuplicate = memberService.isUserIdDuplicate(userId);
            result.put("isDuplicate", isDuplicate);
            result.put("message", isDuplicate ? "이미 사용중인 아이디입니다." : "사용 가능한 아이디입니다.");

        } catch (Exception e) {
            log.error("아이디 중복 체크 중 오류 발생", e);
            result.put("error", "중복 체크 중 오류가 발생했습니다.");
        }

        return result;
    }

    /**
     * 디버깅용 비밀번호 테스트 엔드포인트
     */
    @GetMapping("/debug/password-test")
    @ResponseBody
    public Map<String, Object> debugPasswordTest(@RequestParam(defaultValue = "admin") String userId,
                                                 @RequestParam(defaultValue = "admin123") String password) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 1. 사용자 정보 조회
            MemberDTO member = memberService.getMemberByUserId(userId);
            if (member == null) {
                result.put("error", "사용자를 찾을 수 없습니다: " + userId);
                return result;
            }
            
            // 2. 기본 정보 표시
            result.put("userId", member.getUserId());
            result.put("dbPasswordHash", member.getPassword());
            result.put("dbPasswordLength", member.getPassword().length());
            result.put("inputPassword", password);
            result.put("inputPasswordLength", password.length());
            
            // 3. BCrypt 해시 형식 검증
            boolean isValidBcryptFormat = member.getPassword().startsWith("$2a$") || 
                                        member.getPassword().startsWith("$2b$") || 
                                        member.getPassword().startsWith("$2y$");
            result.put("isValidBcryptFormat", isValidBcryptFormat);
            
            // 4. 직접 비밀번호 매칭 테스트
            LoginDTO loginDTO = new LoginDTO();
            loginDTO.setUserId(userId);
            loginDTO.setPassword(password);
            
            MemberDTO loginResult = memberService.login(loginDTO);
            result.put("loginSuccess", loginResult != null);
            
            // 5. 회원 상태 정보
            result.put("isActive", member.getIsActive());
            result.put("isDeleted", member.getIsDeleted());
            result.put("loginFailCount", member.getLoginFailCount());
            result.put("role", member.getRole());
            
            log.info("디버깅 테스트 결과: {}", result);
            
        } catch (Exception e) {
            log.error("디버깅 테스트 중 오류 발생", e);
            result.put("error", "테스트 중 오류 발생: " + e.getMessage());
        }
        
        return result;
    }

    /**
     * 비밀번호 확인 페이지 (내 정보 수정 전)
     */
    @GetMapping("/myinfo")
    public String verifyPasswordForm(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
        MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);

        if (loginMember == null) {
            redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
            return "redirect:/member/login";
        }

        return "member/verifyPassword";
    }
    
    /**
     * 비밀번호 확인 처리
     */
    @PostMapping("/myinfo/verify")
    public String verifyPassword(@RequestParam("password") String password,
                                HttpSession session,
                                RedirectAttributes redirectAttributes) {
        MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);

        if (loginMember == null) {
            redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
            return "redirect:/member/login";
        }

        try {
            // 비밀번호 확인
            if (!password.equals(loginMember.getPassword())) {
                redirectAttributes.addFlashAttribute("error", "비밀번호가 일치하지 않습니다.");
                return "redirect:/member/myinfo";
            }
            
            // 비밀번호 확인 성공 시 실제 내정보 페이지로 이동
            return "redirect:/member/myinfo/edit";
            
        } catch (Exception e) {
            log.error("비밀번호 확인 중 오류 발생: {}", loginMember.getUserId(), e);
            redirectAttributes.addFlashAttribute("error", "비밀번호 확인 중 오류가 발생했습니다.");
            return "redirect:/member/myinfo";
        }
    }

    /**
     * 내 정보 수정 페이지 표시 (비밀번호 확인 후)
     */
    @GetMapping("/myinfo/edit")
    public String myInfoEdit(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
        MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);

        if (loginMember == null) {
            redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
            return "redirect:/member/login";
        }

        try {
            // memberId로 회원 정보 조회
            MemberDTO memberInfo = memberService.findById(loginMember.getMemberId());

            if (memberInfo == null) {
                redirectAttributes.addFlashAttribute("error", "사용자 정보를 찾을 수 없습니다.");
                // 세션 정보가 유효하지 않을 수 있으므로, 로그인 페이지로 리다이렉트하거나 세션을 무효화할 수 있음
                session.invalidate();
                return "redirect:/member/login";
            }

            // 크롭 페이지 접근 권한 플래그 설정 (보안용)
            session.setAttribute("myinfo_verified", true);
            
            model.addAttribute("memberDTO", memberInfo);
            return "member/myinfo";

        } catch (Exception e) {
            log.error("마이페이지 정보 조회 중 오류 발생: {}", loginMember.getUserId(), e);
            redirectAttributes.addFlashAttribute("error", "회원 정보를 불러오는 중 오류가 발생했습니다.");
            return "redirect:/"; // 오류 발생 시 홈으로 리다이렉트
        }
    }

    /**
     * 프로필 이미지 크롭 페이지
     */
    @GetMapping("/myinfo/crop-image")
    public String cropImagePage(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
        MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        if (loginMember == null) {
            redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
            return "redirect:/member/login";
        }
        
        // 마이페이지에서 온 사용자인지 확인 (보안)
        Boolean myinfoVerified = (Boolean) session.getAttribute("myinfo_verified");
        if (myinfoVerified == null || !myinfoVerified) {
            redirectAttributes.addFlashAttribute("error", "올바른 경로로 접근해주세요.");
            return "redirect:/member/myinfo";
        }
        
        model.addAttribute("memberDTO", loginMember);
        return "member/crop-image";
    }

    /**
     * 일반 프로필 이미지 업로드 API
     */
    @PostMapping("/api/upload-profile")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> uploadProfileImage(@RequestParam("file") MultipartFile file,
                                                                  HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
            if (loginMember == null) {
                result.put("success", false);
                result.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(401).body(result);
            }
            
            if (file.isEmpty()) {
                result.put("success", false);
                result.put("message", "이미지 파일이 없습니다.");
                return ResponseEntity.badRequest().body(result);
            }
            
            // 파일 크기 검증 (5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                result.put("success", false);
                result.put("message", "파일 크기는 5MB 이하여야 합니다.");
                return ResponseEntity.badRequest().body(result);
            }
            
            // 파일 타입 검증
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                result.put("success", false);
                result.put("message", "이미지 파일만 업로드 가능합니다.");
                return ResponseEntity.badRequest().body(result);
            }
            
            // MemberService를 통해 이미지 저장 및 회원 정보 업데이트
            String savedImagePath = memberService.updateMemberProfileImage(loginMember.getMemberId(), file);
            
            // 세션 정보 업데이트
            loginMember.setProfileImage(savedImagePath);
            session.setAttribute(Constants.SESSION_MEMBER, loginMember);
            
            result.put("success", true);
            result.put("message", "프로필 이미지가 성공적으로 업데이트되었습니다.");
            result.put("fileName", savedImagePath);
            result.put("imageUrl", savedImagePath);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("프로필 이미지 업로드 중 오류 발생", e);
            result.put("success", false);
            result.put("message", "이미지 저장 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(500).body(result);
        }
    }

    /**
     * 프로필 이미지 크롭 처리 (임시 저장)
     */
    @PostMapping("/myinfo/crop-image/upload")
    @ResponseBody
    public Map<String, Object> uploadTempImage(@RequestParam("imageFile") MultipartFile imageFile,
                                               HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
            if (loginMember == null) {
                result.put("success", false);
                result.put("message", "로그인이 필요합니다.");
                return result;
            }
            
            if (imageFile.isEmpty()) {
                result.put("success", false);
                result.put("message", "이미지 파일이 없습니다.");
                return result;
            }
            
            // 파일 크기 검증 (5MB)
            if (imageFile.getSize() > 5 * 1024 * 1024) {
                result.put("success", false);
                result.put("message", "파일 크기는 5MB 이하여야 합니다.");
                return result;
            }
            
            // 파일 타입 검증
            String contentType = imageFile.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                result.put("success", false);
                result.put("message", "이미지 파일만 업로드 가능합니다.");
                return result;
            }
            
            // Base64로 인코딩하여 임시 저장
            byte[] imageBytes = imageFile.getBytes();
            String base64Image = "data:" + contentType + ";base64," + 
                                java.util.Base64.getEncoder().encodeToString(imageBytes);
            
            // 세션에 임시 저장
            session.setAttribute("tempImageData", base64Image);
            session.setAttribute("tempImageName", imageFile.getOriginalFilename());
            
            result.put("success", true);
            result.put("imageData", base64Image);
            result.put("message", "이미지가 업로드되었습니다.");
            
        } catch (Exception e) {
            log.error("임시 이미지 업로드 중 오류 발생", e);
            result.put("success", false);
            result.put("message", "이미지 업로드 중 오류가 발생했습니다.");
        }
        
        return result;
    }

    /**
     * 크롭된 이미지 저장 처리
     */
    @PostMapping("/myinfo/crop-image/save")
    @ResponseBody
    public Map<String, Object> saveCroppedImage(@RequestParam("croppedImage") MultipartFile croppedImageFile,
                                                @RequestParam(value = "altText", required = false) String altText,
                                                @RequestParam(value = "format", required = false) String format,
                                                @RequestParam(value = "quality", required = false) String quality,
                                                HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
            if (loginMember == null) {
                result.put("success", false);
                result.put("message", "로그인이 필요합니다.");
                return result;
            }
            
            log.info("🖼️ 크롭된 이미지 저장 요청 - 형식: {}, 품질: {}, 크기: {} bytes", 
                    format, quality, croppedImageFile.getSize());
            log.info("📁 파일 정보 - 이름: {}, 컨텐츠 타입: {}", 
                    croppedImageFile.getOriginalFilename(), croppedImageFile.getContentType());
            
            // 업로드된 파일이 유효한지 확인
            if (croppedImageFile.isEmpty()) {
                result.put("success", false);
                result.put("message", "업로드된 이미지 파일이 비어있습니다.");
                return result;
            }
            
            // 기존 회원정보 조회
            MemberDTO memberDTO = memberService.findById(loginMember.getMemberId());
            if (memberDTO == null) {
                result.put("success", false);
                result.put("message", "회원 정보를 찾을 수 없습니다.");
                return result;
            }
            
            // Alt 텍스트 설정 (SEO 최적화용)
            log.info("📋 받은 파라미터 - altText: '{}', format: '{}', quality: '{}'", altText, format, quality);
            if (altText != null && !altText.trim().isEmpty()) {
                memberDTO.setProfileImageAltText(altText.trim());
                log.info("🏷️ 프로필 이미지 Alt 텍스트 설정: {}", altText.trim());
            } else {
                // 기본값 설정
                memberDTO.setProfileImageAltText("사용자 프로필 사진");
                log.info("🏷️ 프로필 이미지 Alt 텍스트 기본값 설정: 사용자 프로필 사진");
            }
            
            // 이미지 형식 정보 로깅
            String contentType = croppedImageFile.getContentType();
            if (contentType != null) {
                log.info("📷 업로드된 이미지 형식: {}", contentType);
                if (contentType.contains("avif")) {
                    log.info("✨ AVIF 형식 감지 - 최적 압축 적용됨");
                } else if (contentType.contains("webp")) {
                    log.info("🚀 WebP 형식 감지 - 효율적 압축 적용됨");
                } else if (contentType.contains("jpeg")) {
                    log.info("📸 JPEG 형식 감지 - 호환성 우선 적용됨");
                }
            }
            
            // 프로필 이미지 업데이트 (원본 형식 유지)
            memberService.updateMember(memberDTO, croppedImageFile);
            
            // 세션 정보 업데이트
            MemberDTO updatedMember = memberService.findById(loginMember.getMemberId());
            if (updatedMember != null) {
                session.setAttribute(Constants.SESSION_MEMBER, updatedMember);
            }
            
            // 임시 데이터 삭제
            session.removeAttribute("tempImageData");
            session.removeAttribute("tempImageName");
            
            result.put("success", true);
            result.put("message", "프로필 이미지가 성공적으로 저장되었습니다.");
            result.put("profileImageUrl", updatedMember.getProfileImage());
            
        } catch (Exception e) {
            log.error("크롭된 이미지 저장 중 오류 발생", e);
            result.put("success", false);
            result.put("message", "이미지 저장 중 오류가 발생했습니다.");
        }
        
        return result;
    }

    /**
     * 회원정보 수정 처리 (HttpSession 사용으로 복원)
     */
    @PostMapping("/myinfo/update")
    public String updateMember(@ModelAttribute MemberDTO memberDTO,
                               BindingResult bindingResult,
                               @RequestParam(value = "profileImageFile", required = false) MultipartFile profileImageFile,
                               HttpSession session,
                               Model model,
                               RedirectAttributes redirectAttributes) {

        log.info("회원정보 수정 요청: memberId={}, name={}, email={}", 
                memberDTO.getMemberId(), memberDTO.getName(), memberDTO.getEmail());
        
        MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        log.info("세션 로그인 멤버: {}", loginMember != null ? loginMember.getMemberId() : "null");
        
        if (loginMember == null) {
            log.warn("세션에 로그인 정보가 없음");
            redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
            return "redirect:/member/login";
        }
        
        if (!loginMember.getMemberId().equals(memberDTO.getMemberId())) {
            log.warn("권한 없음: 세션 memberId={}, 요청 memberId={}", 
                    loginMember.getMemberId(), memberDTO.getMemberId());
            redirectAttributes.addFlashAttribute("error", "권한이 없거나 로그인 정보가 유효하지 않습니다.");
            return "redirect:/member/myinfo";
        }

        // 수동 유효성 검사 (정보수정에 필요한 필드만)
        if (memberDTO.getName() == null || memberDTO.getName().trim().isEmpty()) {
            bindingResult.rejectValue("name", "NotBlank", "이름은 필수입니다.");
        }
        if (memberDTO.getEmail() != null && !memberDTO.getEmail().trim().isEmpty()) {
            if (!memberDTO.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                bindingResult.rejectValue("email", "Email", "올바른 이메일 형식이 아닙니다.");
            }
        }
        if (memberDTO.getPhone() != null && !memberDTO.getPhone().trim().isEmpty()) {
            if (!memberDTO.getPhone().matches("^01(?:0|1|[6-9])-(?:\\d{3}|\\d{4})-\\d{4}$")) {
                bindingResult.rejectValue("phone", "Pattern", "올바른 휴대폰 번호 형식이 아닙니다.");
            }
        }
        
        if (bindingResult.hasErrors()) {
            log.warn("회원정보 수정 유효성 검사 실패: {}", bindingResult.getAllErrors());
            model.addAttribute("memberDTO", memberDTO);
            return "member/myinfo";
        }

        try {
            log.info("회원정보 수정 서비스 호출 시작");
            memberService.updateMember(memberDTO, profileImageFile);
            log.info("회원정보 수정 서비스 호출 완료");

            // 세션 정보 업데이트 (수정된 최신 정보로 갱신)
            MemberDTO updatedMember = memberService.findById(memberDTO.getMemberId());
            if (updatedMember != null) {
                session.setAttribute(Constants.SESSION_MEMBER, updatedMember);
                log.info("세션 정보 업데이트 완료: {}", updatedMember.getName());
            } else {
                log.warn("업데이트된 회원 정보 조회 실패");
            }

            redirectAttributes.addFlashAttribute("message", "회원정보가 성공적으로 수정되었습니다.");
            return "redirect:/member/myinfo/edit";

        } catch (Exception e) {
            log.error("회원정보 수정 중 오류 발생: memberId={}, userId={}", 
                    memberDTO.getMemberId(), memberDTO.getUserId(), e);
            redirectAttributes.addFlashAttribute("error", "회원정보 수정 중 오류가 발생했습니다: " + e.getMessage());
            return "redirect:/member/myinfo/edit";
        }
    }

    /**
     * 비밀번호 변경 페이지 표시 (HttpSession 사용으로 복원)
     */
    @GetMapping("/mypage/change-password")
    public String changePasswordForm(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
        MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        if (loginMember == null) {
            redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
            return "redirect:/member/login";
        }
        return "member/changePassword";
    }

    /**
     * 비밀번호 변경 처리 (HttpSession 사용으로 복원)
     */
    @PostMapping("/mypage/change-password")
    public String changePassword(@RequestParam("currentPassword") String currentPassword,
                                 @RequestParam("newPassword") String newPassword,
                                 @RequestParam("confirmPassword") String confirmNewPassword,
                                 HttpSession session,
                                 RedirectAttributes redirectAttributes) {
        MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        if (loginMember == null) {
            redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
            return "redirect:/member/login";
        }

        String userId = loginMember.getUserId(); // 세션에서 userId 가져오기
        try {
            memberService.changePassword(userId, currentPassword, newPassword, confirmNewPassword);
            redirectAttributes.addFlashAttribute("message", "비밀번호가 성공적으로 변경되었습니다.");
            return "redirect:/member/myinfo/edit"; // 비밀번호 변경 후 내 정보 페이지로
        } catch (IllegalArgumentException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/member/mypage/change-password";
        } catch (Exception e) {
            log.error("비밀번호 변경 중 오류 발생: {}", userId, e);
            redirectAttributes.addFlashAttribute("error", "비밀번호 변경 중 오류가 발생했습니다.");
            return "redirect:/member/mypage/change-password";
        }
    }

    /**
     * 회원 탈퇴 페이지 표시
     */
    @GetMapping("/mypage/delete")
    public String deleteMemberForm(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
        MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        if (loginMember == null) {
            redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
            return "redirect:/member/login";
        }

        try {
            // 작성한 콘텐츠 개수 조회
            Map<String, Integer> contentCounts = memberService.getUserContentCounts(loginMember.getMemberId());
            
            model.addAttribute("member", loginMember);
            model.addAttribute("contentCounts", contentCounts);
            
            log.info("회원탈퇴 페이지 접근: userId={}, 작성 콘텐츠={}", 
                    loginMember.getUserId(), contentCounts);
                    
            return "member/deleteMember";
            
        } catch (Exception e) {
            log.error("회원탈퇴 페이지 로드 중 오류: {}", loginMember.getUserId(), e);
            model.addAttribute("member", loginMember);
            model.addAttribute("contentCounts", Map.of("board", 0, "review", 0, "job", 0));
            return "member/deleteMember";
        }
    }

    /**
     * 회원 탈퇴 처리 (논리 삭제)
     */
    @PostMapping("/mypage/delete")
    public String deleteMember(@RequestParam("password") String password,
                              @RequestParam("confirmName") String confirmName,
                              @RequestParam("deleteOption") String deleteOption,
                              HttpSession session, 
                              RedirectAttributes redirectAttributes) {
        MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        if (loginMember == null) {
            redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
            return "redirect:/member/login";
        }

        String userId = loginMember.getUserId();
        log.info("회원탈퇴 요청: userId={}, 입력된 비밀번호 길이={}, 입력된 이름={}, 삭제옵션={}", 
                userId, password.length(), confirmName, deleteOption);
        
        try {
            // DB에서 최신 비밀번호 정보 조회
            MemberDTO currentMember = memberService.findById(loginMember.getMemberId());
            if (currentMember == null) {
                log.warn("회원탈퇴: 회원 정보를 찾을 수 없음: memberId={}", loginMember.getMemberId());
                redirectAttributes.addFlashAttribute("error", "회원 정보를 찾을 수 없습니다.");
                return "redirect:/member/mypage/delete";
            }
            
            // 현재 비밀번호 확인 (개발용: 평문 비교)
            log.info("비밀번호 비교: DB 비밀번호={}, 입력 비밀번호={}", 
                    currentMember.getPassword(), password);
            
            if (!password.equals(currentMember.getPassword())) {
                log.warn("회원탈퇴: 비밀번호 불일치: userId={}", userId);
                redirectAttributes.addFlashAttribute("error", "현재 비밀번호가 일치하지 않습니다.");
                return "redirect:/member/mypage/delete";
            }
            
            log.info("비밀번호 확인 성공: userId={}", userId);
            
            // 이름 확인 검증
            if (!confirmName.trim().equals(currentMember.getName().trim())) {
                log.warn("회원탈퇴: 이름 불일치: userId={}, 입력된 이름={}, 등록된 이름={}", 
                        userId, confirmName, currentMember.getName());
                redirectAttributes.addFlashAttribute("error", 
                        String.format("이름이 일치하지 않습니다. 등록된 이름 '%s'를 정확히 입력해주세요.", currentMember.getName()));
                return "redirect:/member/mypage/delete";
            }
            
            log.info("이름 확인 성공: userId={}, 이름={}", userId, confirmName);
            
            // 회원 탈퇴 처리 (옵션에 따라 처리 방식 결정)
            String resultMessage = memberService.deleteMemberWithOption(userId, deleteOption);
            log.info("회원탈퇴 완료: userId={}, 옵션={}", userId, deleteOption);
            
            // 세션 무효화
            session.invalidate();
            
            redirectAttributes.addFlashAttribute("message", resultMessage + " 그동안 이용해 주셔서 감사합니다.");
            return "redirect:/";
        } catch (Exception e) {
            log.error("회원 탈퇴 처리 중 오류 발생: {}", userId, e);
            redirectAttributes.addFlashAttribute("error", "회원 탈퇴 처리 중 오류가 발생했습니다.");
            return "redirect:/member/mypage/delete";
        }
    }

    /**
     * 관리자: 회원 목록 조회 (페이징, 역할 필터링 등)
     */
    @GetMapping("/admin/members")
    public String listMembers(@RequestParam(defaultValue = "1") int page,
                              @RequestParam(defaultValue = "10") int pageSize,
                              @RequestParam(required = false) String role,
                              Model model, HttpSession session, RedirectAttributes redirectAttributes) {
        MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);

        // 관리자 권한 확인 (역할이 ADMIN이 아니면 접근 불허)
        if (loginMember == null || !Constants.MEMBER_ROLE_ADMIN.equals(loginMember.getRole())) {
            redirectAttributes.addFlashAttribute("error", "관리자 권한이 필요합니다.");
            return "redirect:/"; // 홈으로 리다이렉트 또는 다른 에러 페이지
        }

        try {
            MemberDTO searchDTO = new MemberDTO();
            searchDTO.setPageSize(pageSize);
            searchDTO.setOffset((page - 1) * pageSize);
            searchDTO.setRole(role); // 역할 필터링을 위해 DTO에 role 설정

            List<MemberDTO> members = memberService.getMembersWithPaging(searchDTO);
            int totalMembers = memberService.getTotalMembersCount(); // 전체 회원 수

            int totalPages = (int) Math.ceil((double) totalMembers / pageSize);

            model.addAttribute("members", members);
            model.addAttribute("currentPage", page);
            model.addAttribute("totalPages", totalPages);
            model.addAttribute("pageSize", pageSize);
            model.addAttribute("currentRole", role); // 현재 필터링된 역할

            return "member/memberList"; // 관리자 회원 목록을 보여주는 Thymeleaf 템플릿
        } catch (Exception e) {
            log.error("관리자 회원 목록 조회 중 오류 발생", e);
            redirectAttributes.addFlashAttribute("error", "회원 목록 조회 중 오류가 발생했습니다.");
            return "redirect:/";
        }
    }

    /**
     * 관리자: 회원 상태 변경 (활성화/비활성화)
     */
    @PostMapping("/admin/members/status")
    public String updateMemberStatus(@RequestParam Long memberId,
                                     @RequestParam boolean isActive,
                                     HttpSession session, RedirectAttributes redirectAttributes) {
        MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);

        // 관리자 권한 확인
        if (loginMember == null || !Constants.MEMBER_ROLE_ADMIN.equals(loginMember.getRole())) {
            redirectAttributes.addFlashAttribute("error", "관리자 권한이 없습니다.");
            return "redirect:/member/admin/members";
        }

        try {
            memberService.updateMemberStatus(memberId, isActive);
            redirectAttributes.addFlashAttribute("message", "회원 상태가 성공적으로 변경되었습니다.");
        } catch (Exception e) {
            log.error("회원 상태 변경 중 오류 발생: memberId={}", memberId, e);
            redirectAttributes.addFlashAttribute("error", "회원 상태 변경 중 오류가 발생했습니다.");
        }
        return "redirect:/member/admin/members"; // 변경 후 회원 목록 페이지로 리다이렉트
    }
    
    /**
     * 내가 쓴 글 페이지 표시
     */
    @GetMapping("/mypost")
    public String myPosts(@RequestParam(defaultValue = "all") String type,
                         @RequestParam(defaultValue = "1") int page,
                         @RequestParam(defaultValue = "10") int pageSize,
                         HttpSession session, Model model, RedirectAttributes redirectAttributes) {
        
        MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        if (loginMember == null) {
            redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
            return "redirect:/member/login";
        }
        
        try {
            Long memberId = loginMember.getMemberId();
            log.info("내가 쓴 글 페이지 요청: memberId={}, type={}, page={}", memberId, type, page);
            
            // 페이징 설정
            int offset = (page - 1) * pageSize;
            
            // 작성한 콘텐츠 조회
            Map<String, Object> result = memberService.getMyPosts(memberId, type, page, pageSize, offset);
            
            // 모델에 데이터 추가
            model.addAttribute("member", loginMember);
            model.addAttribute("posts", result.get("posts"));
            model.addAttribute("totalCount", result.get("totalCount"));
            model.addAttribute("currentType", type);
            model.addAttribute("currentPage", page);
            model.addAttribute("pageSize", pageSize);
            model.addAttribute("totalPages", (int) Math.ceil((double) (Integer) result.get("totalCount") / pageSize));
            
            // 콘텐츠 타입별 개수
            Map<String, Integer> contentCounts = (Map<String, Integer>) result.get("contentCounts");
            model.addAttribute("contentCounts", contentCounts);
            
            log.info("내가 쓴 글 조회 완료: 총 {}개", result.get("totalCount"));
            
            return "member/myPosts";
            
        } catch (Exception e) {
            log.error("내가 쓴 글 페이지 로드 중 오류: memberId={}", loginMember.getMemberId(), e);
            redirectAttributes.addFlashAttribute("error", "내가 쓴 글을 불러오는 중 오류가 발생했습니다.");
            return "redirect:/member/myinfo/edit";
        }
    }
}