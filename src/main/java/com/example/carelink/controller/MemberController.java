package com.example.carelink.controller;

import com.example.carelink.dto.LoginDTO;
import com.example.carelink.dto.MemberDTO;
import com.example.carelink.service.MemberService;
import com.example.carelink.common.Constants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile; // MultipartFile 유지
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import javax.servlet.http.HttpSession; // 세션 관리를 위해 필요
import javax.validation.Valid; // @Valid 어노테이션을 위해 필요
// import java.security.Principal; // Principal 제거
import java.util.HashMap;
import java.util.List; // List 유지
import java.util.Map;

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
            return "member/login"; // 에러가 있으면 로그인 폼으로 다시 이동
        }

        try {
            // MemberService를 통해 로그인 시도
            MemberDTO loginMember = memberService.login(loginDTO);

            if (loginMember != null) {
                // 로그인 성공 시 세션에 회원 정보 저장
                session.setAttribute(Constants.SESSION_MEMBER, loginMember);
                log.info("로그인 성공: {}", loginMember.getUserId());

                redirectAttributes.addFlashAttribute("message", "로그인되었습니다.");
                return "redirect:/"; // 홈 페이지로 리다이렉트
            } else {
                // 로그인 실패 시 에러 메시지 추가
                redirectAttributes.addFlashAttribute("error", "아이디 또는 비밀번호가 잘못되었습니다.");
                return "redirect:/member/login"; // 로그인 페이지로 리다이렉트
            }

        } catch (Exception e) {
            log.error("로그인 처리 중 오류 발생", e);
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

    /**
     * 회원가입 처리
     */
    @PostMapping("/join")
    public String join(@Valid @ModelAttribute MemberDTO memberDTO,
                       BindingResult bindingResult,
                       RedirectAttributes redirectAttributes) {

        // DTO 유효성 검증 실패 시
        if (bindingResult.hasErrors()) {
            log.warn("회원가입 유효성 검사 실패: {}", bindingResult.getAllErrors());
            return "member/join"; // 에러가 있으면 회원가입 폼으로 다시 이동
        }

        // 비밀번호와 비밀번호 확인 일치 여부 검사
        if (!memberDTO.getPassword().equals(memberDTO.getPasswordConfirm())) {
            bindingResult.rejectValue("passwordConfirm", "password.mismatch", "비밀번호 확인이 일치하지 않습니다.");
            log.warn("회원가입 실패: 비밀번호 확인 불일치");
            return "member/join";
        }

        try {
            // MemberService를 통해 회원가입 처리
            memberService.join(memberDTO);
            log.info("회원가입 성공: {}", memberDTO.getUserId());

            redirectAttributes.addFlashAttribute("message", "회원가입이 완료되었습니다. 로그인해주세요.");
            return "redirect:/member/login"; // 회원가입 성공 시 로그인 페이지로 리다이렉트

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
     * 내 정보 페이지 표시 (HttpSession 사용으로 복원)
     */
    @GetMapping("/myinfo")
    public String myInfo(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
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

            model.addAttribute("memberDTO", memberInfo);
            return "member/myinfo";

        } catch (Exception e) {
            log.error("마이페이지 정보 조회 중 오류 발생: {}", loginMember.getUserId(), e);
            redirectAttributes.addFlashAttribute("error", "회원 정보를 불러오는 중 오류가 발생했습니다.");
            return "redirect:/"; // 오류 발생 시 홈으로 리다이렉트
        }
    }

    /**
     * 회원정보 수정 처리 (HttpSession 사용으로 복원)
     */
    @PostMapping("/myinfo/update")
    public String updateMember(@Valid @ModelAttribute MemberDTO memberDTO,
                               BindingResult bindingResult,
                               @RequestParam(value = "profileImageFile", required = false) MultipartFile profileImageFile,
                               HttpSession session,
                               RedirectAttributes redirectAttributes) {

        MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        if (loginMember == null || !loginMember.getMemberId().equals(memberDTO.getMemberId())) {
            redirectAttributes.addFlashAttribute("error", "권한이 없거나 로그인 정보가 유효하지 않습니다.");
            return "redirect:/member/myinfo";
        }

        if (bindingResult.hasErrors()) {
            log.warn("회원정보 수정 유효성 검사 실패: {}", bindingResult.getAllErrors());
            // 에러가 있을 경우, 기존의 myinfo 폼으로 다시 데이터를 채워서 보내줘야 함
            return "member/myinfo";
        }

        try {
            memberService.updateMember(memberDTO, profileImageFile);

            // 세션 정보 업데이트 (수정된 최신 정보로 갱신)
            MemberDTO updatedMember = memberService.findById(memberDTO.getMemberId());
            session.setAttribute(Constants.SESSION_MEMBER, updatedMember);

            redirectAttributes.addFlashAttribute("message", "회원정보가 성공적으로 수정되었습니다.");
            return "redirect:/member/myinfo";

        } catch (Exception e) {
            log.error("회원정보 수정 중 오류 발생: {}", memberDTO.getUserId(), e);
            redirectAttributes.addFlashAttribute("error", "회원정보 수정 중 오류가 발생했습니다.");
            return "redirect:/member/myinfo";
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
                                 @RequestParam("confirmNewPassword") String confirmNewPassword,
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
            return "redirect:/member/myinfo"; // 비밀번호 변경 후 내 정보 페이지로
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
     * 회원 탈퇴 처리 (논리 삭제) (HttpSession 사용으로 복원)
     */
    @GetMapping("/mypage/delete")
    public String deleteMember(HttpSession session, RedirectAttributes redirectAttributes) {
        MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        if (loginMember == null) {
            redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
            return "redirect:/member/login";
        }

        String userId = loginMember.getUserId(); // 세션에서 userId 가져오기
        try {
            memberService.deleteMember(userId);
            session.invalidate(); // 탈퇴 후 세션 무효화
            redirectAttributes.addFlashAttribute("message", "회원 탈퇴가 완료되었습니다.");
            return "redirect:/"; // 홈페이지로 리다이렉트
        } catch (Exception e) {
            log.error("회원 탈퇴 처리 중 오류 발생: {}", userId, e);
            redirectAttributes.addFlashAttribute("error", "회원 탈퇴 처리 중 오류가 발생했습니다.");
            return "redirect:/member/myinfo";
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
}