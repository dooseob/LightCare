package com.example.carelink.controller;

import com.example.carelink.dto.JobDTO;
import com.example.carelink.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

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
     * 구인구직 작성 페이지
     */
    @GetMapping("/write")
    public String writePage(Model model) {
        model.addAttribute("jobDTO", new JobDTO());
        return "job/write";
    }
    
    /**
     * 구인구직 등록 처리
     */
    @PostMapping("/write")
    public String writeJob(@ModelAttribute JobDTO jobDTO) {
        // TODO: 팀원 C가 등록 로직 구현
        jobService.insertJob(jobDTO);
        return "redirect:/job";
    }
    
    /**
     * 구인구직 상세보기
     */
    @GetMapping("/detail/{id}")
    public String detailPage(@PathVariable Long id, Model model) {
        JobDTO job = jobService.getJobById(id);
        model.addAttribute("job", job);
        return "job/detail";
    }
    
    /**
     * 구인구직 수정 페이지
     */
    @GetMapping("/edit/{id}")
    public String editPage(@PathVariable Long id, Model model) {
        JobDTO job = jobService.getJobById(id);
        model.addAttribute("jobDTO", job);
        return "job/edit";
    }
    
    /**
     * 구인구직 수정 처리
     */
    @PostMapping("/edit/{id}")
    public String editJob(@PathVariable Long id, @ModelAttribute JobDTO jobDTO) {
        jobDTO.setJobId(id);
        // TODO: 팀원 C가 수정 로직 구현
        jobService.updateJob(jobDTO);
        return "redirect:/job/detail/" + id;
    }
    
    /**
     * 구인구직 삭제
     */
    @PostMapping("/delete/{id}")
    public String deleteJob(@PathVariable Long id) {
        // TODO: 팀원 C가 삭제 로직 구현
        jobService.deleteJob(id);
        return "redirect:/job";
    }
} 