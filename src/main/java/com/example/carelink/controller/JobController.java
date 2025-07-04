package com.example.carelink.controller;

import com.example.carelink.common.Constants;
import com.example.carelink.dto.JobDTO;
import com.example.carelink.dto.MemberDTO;
import com.example.carelink.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

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
     * 구인구직 작성 페이지 로드
     * 시설회원 또는 관리자만 접근 가능
     */
    @GetMapping("/write") // URL 경로 확인 필요 (예: /job/write)
    public String writePage(
            @RequestParam(value = "jobType", required = false) String jobTypeParam,
            Model model,
            HttpSession session) {

        MemberDTO loggedInMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        if (loggedInMember == null) {
            return "redirect:/member/login";
        }

        // 권한 체크: 시설회원 또는 관리자만 접근 허용
        if (!"FACILITY".equals(loggedInMember.getRole()) && !"ADMIN".equals(loggedInMember.getRole())) {
            session.setAttribute("errorMessage", "구인등록은 시설회원만 이용할 수 있습니다.");
            return "redirect:/job";
        }

        JobDTO jobDTO = new JobDTO();

        // 사용자의 역할 및 jobType 파라미터에 따라 jobDTO 초기값 설정
        if ("ADMIN".equals(loggedInMember.getRole())) {
            if ("RECRUIT".equalsIgnoreCase(jobTypeParam)) {
                jobDTO.setJobType("RECRUIT");
            } else if ("SEARCH".equalsIgnoreCase(jobTypeParam)) {
                jobDTO.setJobType("SEARCH");
            } else {
                jobDTO.setJobType("RECRUIT"); // 관리자 기본값
            }
        } else if ("FACILITY".equals(loggedInMember.getRole())) {
            jobDTO.setJobType("RECRUIT");
        } else if ("USER".equals(loggedInMember.getRole())) {
            jobDTO.setJobType("SEARCH");
        }

        model.addAttribute("jobDTO", jobDTO);

        // 반환할 템플릿 경로 (templates/job/write.html)
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

    /**
     * 구인공고에 지원하기 (개인 회원만 가능)
     * POST 요청으로 지원 처리를 수행합니다.
     */
    @PostMapping("/{id}/apply")
    public String applyForJob(@PathVariable Long id, HttpSession session, RedirectAttributes redirectAttributes) {
        // 1. 로그인 여부 및 회원 유형 확인 (개인 회원만 지원 가능하도록)
        MemberDTO loggedInMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        if (loggedInMember == null) {
            redirectAttributes.addFlashAttribute("errorMessage", "로그인 후 이용해주세요.");
            return "redirect:/member/login";
        }
        if (!"USER".equals(loggedInMember.getRole())) {
            redirectAttributes.addFlashAttribute("errorMessage", "개인 회원만 구인공고에 지원할 수 있습니다.");
            return "redirect:/job/detail/" + id;
        }

        try {
            // 2. JobService를 통해 지원 로직 수행
            // 이 메서드는 JobService에 추가해야 합니다. (아래 참고)
            jobService.applyForJob(id, loggedInMember.getMemberId());

            redirectAttributes.addFlashAttribute("successMessage", "구인공고 지원이 완료되었습니다!");
            return "redirect:/job/detail/" + id; // 지원 완료 후 상세 페이지로 리다이렉트
        } catch (IllegalArgumentException e) {
            // 예를 들어, 이미 지원했거나, 없는 공고에 지원 시
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            return "redirect:/job/detail/" + id;
        } catch (Exception e) {
            // 기타 예상치 못한 오류 발생 시
            redirectAttributes.addFlashAttribute("errorMessage", "구인공고 지원 중 오류가 발생했습니다. 다시 시도해주세요.");
            return "redirect:/job/detail/" + id;
        }
    }

} 