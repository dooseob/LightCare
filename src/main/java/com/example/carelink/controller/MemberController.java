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
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import javax.servlet.http.HttpSession;
import javax.validation.Valid;
import java.util.HashMap;
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
        
        // 유효성 검증 실패 시
        if (bindingResult.hasErrors()) {
            return "member/login";
        }

        try {
            // 로그인 처리
            MemberDTO loginMember = memberService.login(loginDTO);
            
            if (loginMember != null) {
                // 세션에 로그인 정보 저장 (통일된 방식)
                session.setAttribute(Constants.SESSION_MEMBER, loginMember);
                session.setAttribute("memberId", loginMember.getMemberId());
                log.info("로그인 성공: {}", loginMember.getUserId());
                
                redirectAttributes.addFlashAttribute("message", "로그인되었습니다.");
                return "redirect:/";
            } else {
                redirectAttributes.addFlashAttribute("error", "아이디 또는 비밀번호가 잘못되었습니다.");
                return "redirect:/member/login";
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
            session.invalidate();
        }
        redirectAttributes.addFlashAttribute("message", "로그아웃되었습니다.");
        return "redirect:/";
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
        
        // 유효성 검증 실패 시
        if (bindingResult.hasErrors()) {
            log.warn("회원가입 유효성 검사 실패: {}", bindingResult.getAllErrors());
            return "member/join";
        }

        // 비밀번호와 비밀번호 확인 일치 여부 검사
        if (!memberDTO.getPassword().equals(memberDTO.getPasswordConfirm())) {
            bindingResult.rejectValue("passwordConfirm", "password.mismatch", "비밀번호 확인이 일치하지 않습니다.");
            log.warn("회원가입 실패: 비밀번호 확인 불일치");
            return "member/join";
        }

        try {
            // 회원가입 처리
            memberService.join(memberDTO);
            log.info("회원가입 성공: {}", memberDTO.getUserId());
            
            redirectAttributes.addFlashAttribute("message", "회원가입이 완료되었습니다. 로그인해주세요.");
            return "redirect:/member/login";
            
        } catch (IllegalArgumentException e) {
            // 서비스 계층에서 발생한 아이디 중복 등의 비즈니스 로직 예외 처리
            log.warn("회원가입 실패: {}", e.getMessage());
            bindingResult.rejectValue("userId", "duplicate.userId", e.getMessage());
            return "member/join";
        } catch (Exception e) {
            log.error("회원가입 처리 중 알 수 없는 오류 발생", e);
            redirectAttributes.addFlashAttribute("error", "회원가입 처리 중 오류가 발생했습니다.");
            return "member/join";
        }
    }

    /**
     * 아이디 중복 체크 (Ajax)
     */
    @PostMapping("/checkUserId")
    @ResponseBody
    public Map<String, Object> checkUserId(@RequestParam String userId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            boolean isDuplicate = memberService.isUserIdDuplicate(userId);
            result.put("available", !isDuplicate);  // 사용 가능 여부로 변경
            result.put("message", isDuplicate ? "이미 사용중인 아이디입니다." : "사용 가능한 아이디입니다.");
            
        } catch (Exception e) {
            log.error("아이디 중복 체크 중 오류 발생", e);
            result.put("available", false);
            result.put("error", "중복 체크 중 오류가 발생했습니다.");
        }
        
        return result;
    }

    /**
     * 내 정보 페이지 표시
     */
    @GetMapping("/myinfo")
    public String myInfo(HttpSession session, Model model) {
        MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        
        if (loginMember == null) {
            return "redirect:/member/login";
        }
        
        // 최신 정보 조회
        MemberDTO memberInfo = memberService.findById(loginMember.getMemberId());
        model.addAttribute("memberDTO", memberInfo);
        
        return "member/myinfo";
    }

    /**
     * 회원정보 수정 처리
     */
    @PostMapping("/update")
    public String updateMember(@Valid @ModelAttribute MemberDTO memberDTO,
                              BindingResult bindingResult,
                              HttpSession session,
                              RedirectAttributes redirectAttributes) {
        
        if (bindingResult.hasErrors()) {
            return "member/myinfo";
        }

        try {
            memberService.updateMember(memberDTO);
            
            // 세션 정보 업데이트 (통일된 방식)
            MemberDTO updatedMember = memberService.findById(memberDTO.getMemberId());
            session.setAttribute(Constants.SESSION_MEMBER, updatedMember);
            session.setAttribute("memberId", updatedMember.getMemberId());
            
            redirectAttributes.addFlashAttribute("message", "회원정보가 수정되었습니다.");
            return "redirect:/member/myinfo";
            
        } catch (Exception e) {
            log.error("회원정보 수정 중 오류 발생", e);
            redirectAttributes.addFlashAttribute("error", "회원정보 수정 중 오류가 발생했습니다.");
            return "member/myinfo";
        }
    }
} 