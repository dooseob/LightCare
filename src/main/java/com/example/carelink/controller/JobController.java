package com.example.carelink.controller;

import com.example.carelink.common.Constants;
import com.example.carelink.common.PageInfo;
import com.example.carelink.dto.BoardDTO;
import com.example.carelink.dto.JobDTO;
import com.example.carelink.dto.MemberDTO;
import com.example.carelink.service.BoardService;
import com.example.carelink.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;
import java.util.List;

/**
 * 구인구직 게시판 컨트롤러
 * 팀원 C 담당
 */
@Controller
@RequestMapping("/job")
@RequiredArgsConstructor
public class JobController {
    
    private final JobService jobService;

    /**
     * 구인구직 목록 페이지
     */
    @GetMapping
    public String listPage(Model model,
                          @RequestParam(defaultValue = "1") int page,
                          @RequestParam(defaultValue = "") String keyword,
                          @RequestParam(defaultValue = "") String jobType) {

        List<JobDTO> jobList = jobService.getJobList(page, keyword, jobType);
        model.addAttribute("jobList", jobList);
        model.addAttribute("keyword", keyword);
        model.addAttribute("jobType", jobType);
        model.addAttribute("currentPage", page);
        
        return "job/list";
    }
    
    /**
     * 구인구직 작성 페이지 (시설회원만 접근 가능)
     */
    @GetMapping("/write")
    public String writePage(Model model, HttpSession session) {
        // 로그인 체크
        MemberDTO loggedInMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        if (loggedInMember == null) {
            return "redirect:/member/login";
        }
        
        // 시설회원 또는 관리자 권한 체크
        if (!"FACILITY".equals(loggedInMember.getRole()) && !"ADMIN".equals(loggedInMember.getRole())) {
            // 일반회원이 접근한 경우 에러 메시지와 함께 리다이렉트
            session.setAttribute("errorMessage", "구인등록은 시설회원만 이용할 수 있습니다.");
            return "redirect:/job";
        }
        
        model.addAttribute("jobDTO", new JobDTO());
        return "job/write";
    }
    
    /**
     * 구인구직 등록 처리 (시설회원만 가능)
     */
    @PostMapping("/write")
    public String writeJob(@ModelAttribute JobDTO jobDTO, HttpSession session) {
        // 로그인 체크
        MemberDTO loggedInMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        if (loggedInMember == null) {
            return "redirect:/member/login";
        }
        
        // 시설회원 또는 관리자 권한 체크
        if (!"FACILITY".equals(loggedInMember.getRole()) && !"ADMIN".equals(loggedInMember.getRole())) {
            session.setAttribute("errorMessage", "구인등록은 시설회원만 이용할 수 있습니다.");
            return "redirect:/job";
        }

        // status 기본값 설정
        if (jobDTO.getStatus() == null || jobDTO.getStatus().isEmpty()) {
            jobDTO.setStatus("ACTIVE");
        }

        // 현재 로그인된 사용자 정보 설정
        jobDTO.setMemberId(loggedInMember.getMemberId());

        // ★ 3. priority 기본값 설정 (가장 흔한 해결책) ★
        // 예: 새로 생성되는 게시글의 우선순위를 0 (가장 낮은 우선순위)으로 설정
        // JobDTO의 priority 필드 타입에 맞게 설정하세요 (int, Integer, long, Long 등).
        if (jobDTO.getPriority() == null) { // Long/Integer 타입이라면 null 체크
            jobDTO.setPriority(0); // 또는 10, 100 등 원하는 기본 우선순위 값

        }

        // 4. 서비스 호출
        jobService.insertJob(jobDTO);
        return "redirect:/job";

    }

    /*
    *//**
     * 구인구직 상세보기
     *//*
    @GetMapping("/detail/{id}")
    public String detailPage(@PathVariable Long id, Model model, HttpSession session) {
        try {
            JobDTO job = jobService.getJobById(id);
            if (job == null) {
                session.setAttribute("errorMessage", "해당 구인공고를 찾을 수 없습니다.");
                return "redirect:/job";
            }

            // 조회수 증가 (작성자 제외)
            MemberDTO loggedInMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
            if (loggedInMember == null || !job.getMemberId().equals(loggedInMember.getMemberId())) {
                // TODO: jobService.increaseViewCount(id); 를 구현해야 함
                // jobService.increaseViewCount(id);
            }

            model.addAttribute("job", job);
            return "job/detail";

        } catch (Exception e) {
            session.setAttribute("errorMessage", "구인공고 조회 중 오류가 발생했습니다.");
            return "redirect:/job";
        }
    }
    */

    @GetMapping("/detail/{id}")
    public String detailPage(@PathVariable Long id, Model model, HttpSession session) {
        try {
            JobDTO job = jobService.getJobById(id);

            if (job == null) {
                session.setAttribute("errorMessage", "해당 구인공고를 찾을 수 없습니다.");
                return "redirect:/job";
            }

            String formattedContent = "";
            if (job.getContent() != null) {
                formattedContent = job.getContent().replace(System.lineSeparator(), "<br>");
                formattedContent = formattedContent.replace("\n", "<br>");
            }
            model.addAttribute("formattedJobContent", formattedContent);

            MemberDTO loggedInMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
            if (loggedInMember == null || !job.getMemberId().equals(loggedInMember.getMemberId())) {
                // jobService.increaseViewCount(id);
            }

            model.addAttribute("job", job);

            return "job/detail";

        } catch (Exception e) {
            e.printStackTrace();
            session.setAttribute("errorMessage", "구인공고 조회 중 오류가 발생했습니다.");
            return "redirect:/job";
        }
    }

    /**
     * 구인구직 수정 페이지 (작성자만 접근 가능)
     */
    @GetMapping("/edit/{id}")
    public String editPage(@PathVariable Long id, Model model, HttpSession session) {
        // 로그인 체크
        MemberDTO loggedInMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        if (loggedInMember == null) {
            return "redirect:/member/login";
        }
        
        JobDTO job = jobService.getJobById(id);
        if (job == null) {
            session.setAttribute("errorMessage", "해당 구인공고를 찾을 수 없습니다.");
            return "redirect:/job";
        }
        
        // 작성자, 시설회원 또는 관리자 권한 체크
        boolean isOwner = job.getMemberId().equals(loggedInMember.getMemberId());
        boolean isFacilityOrAdmin = "FACILITY".equals(loggedInMember.getRole()) || "ADMIN".equals(loggedInMember.getRole());
        
        if (!isOwner && !"ADMIN".equals(loggedInMember.getRole())) {
            session.setAttribute("errorMessage", "수정 권한이 없습니다. 작성자만 수정할 수 있습니다.");
            return "redirect:/job/detail/" + id;
        }
        
        model.addAttribute("jobDTO", job);
        return "job/edit";
    }
    
    /**
     * 구인구직 수정 처리 (작성자만 가능)
     */
    @PostMapping("/edit/{id}")
    public String editJob(@PathVariable Long id, @ModelAttribute JobDTO jobDTO, HttpSession session) {
        // 로그인 체크
        MemberDTO loggedInMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        if (loggedInMember == null) {
            return "redirect:/member/login";
        }
        
        JobDTO existingJob = jobService.getJobById(id);
        if (existingJob == null) {
            session.setAttribute("errorMessage", "해당 구인공고를 찾을 수 없습니다.");
            return "redirect:/job";
        }
        
        // 작성자 또는 관리자 권한 체크
        boolean isOwner = existingJob.getMemberId().equals(loggedInMember.getMemberId());
        boolean isAdmin = "ADMIN".equals(loggedInMember.getRole());
        
        if (!isOwner && !isAdmin) {
            session.setAttribute("errorMessage", "수정 권한이 없습니다. 작성자만 수정할 수 있습니다.");
            return "redirect:/job/detail/" + id;
        }
        
        jobDTO.setJobId(id);
        jobDTO.setMemberId(loggedInMember.getMemberId()); // 작성자 정보 유지
        jobService.updateJob(jobDTO);
        return "redirect:/job/detail/" + id;
    }
    
    /**
     * 구인구직 삭제 (작성자만 가능)
     */
    @PostMapping("/delete/{id}")
    public String deleteJob(@PathVariable Long id, HttpSession session) {
        // 로그인 체크
        MemberDTO loggedInMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        if (loggedInMember == null) {
            return "redirect:/member/login";
        }
        
        JobDTO existingJob = jobService.getJobById(id);
        if (existingJob == null) {
            session.setAttribute("errorMessage", "해당 구인공고를 찾을 수 없습니다.");
            return "redirect:/job";
        }
        
        // 작성자 또는 관리자 권한 체크
        boolean isOwner = existingJob.getMemberId().equals(loggedInMember.getMemberId());
        boolean isAdmin = "ADMIN".equals(loggedInMember.getRole());
        
        if (!isOwner && !isAdmin) {
            session.setAttribute("errorMessage", "삭제 권한이 없습니다. 작성자만 삭제할 수 있습니다.");
            return "redirect:/job/detail/" + id;
        }
        
        jobService.deleteJob(id);
        session.setAttribute("successMessage", "구인공고가 삭제되었습니다.");
        return "redirect:/job";
    }
} 