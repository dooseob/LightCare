This file is a merged representation of a subset of the codebase, containing specifically included files and files not matching ignore patterns, combined into a single document by Repomix.
The content has been processed where comments have been removed, empty lines have been removed.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.
- Pay special attention to the Repository Description. These contain important context and guidelines specific to this project.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: src/main/java/**/*.java, src/main/resources/application.yml, src/main/resources/mapper/*.xml, build.gradle, README.md, CLAUDE.md
- Files matching these patterns are excluded: **/test/**, **/static/js/bootstrap*, **/static/js/jquery*, **/static/css/bootstrap*, **/*.html, **/backup/**, **/images/**, **/*.png, **/*.jpg, **/deploy-*.sh, **/facility-image-*.js, **/crop-*.html, **/edit.html
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Code comments have been removed from supported file types
- Empty lines have been removed from all files
- Files are sorted by Git change count (files with more changes are at the bottom)

# User Provided Header
LightCare Project Summary for AI Analysis

# Directory Structure
```
src/
  main/
    java/
      com/
        example/
          carelink/
            common/
              BaseDTO.java
              Constants.java
              CustomMultipartFile.java
              PageInfo.java
            config/
              DevSecurityConfig.java
              KakaoApiConfig.java
              ProdSecurityConfig.java
              SecurityConfig.java
              WebConfig.java
            controller/
              AdminController.java
              BoardController.java
              FacilityController.java
              FacilityImageApiController.java
              HomeController.java
              JobController.java
              MemberController.java
              ReviewController.java
            dao/
              BoardMapper.java
              FacilityImageMapper.java
              FacilityMapper.java
              JobApplicationMapper.java
              JobMapper.java
              MemberMapper.java
              ReviewMapper.java
            dto/
              BoardDTO.java
              FacilityDTO.java
              FacilityImageDTO.java
              JobApplicationDTO.java
              JobDTO.java
              LoginDTO.java
              MemberDTO.java
              ReviewDTO.java
            service/
              BoardService.java
              FacilityImageService.java
              FacilityService.java
              JobService.java
              MemberService.java
              ReviewService.java
            validation/
              groups/
                OnFacilityJoin.java
            CarelinkApplication.java
      Crolling.java
    resources/
      mapper/
        boardMapper.xml
        facilityImageMapper.xml
        facilityMapper.xml
        JobApplicationMapper.xml
        jobMapper.xml
        MemberMapper.xml
        reviewMapper.xml
      application.yml
build.gradle
CLAUDE.md
README.md
```

# Files

## File: src/main/java/com/example/carelink/dto/LoginDTO.java
````java
package com.example.carelink.dto;
import lombok.Data;
import javax.validation.constraints.NotBlank;
@Data
public class LoginDTO {
    @NotBlank(message = "사용자 ID를 입력해주세요")
    private String userId;
    @NotBlank(message = "비밀번호를 입력해주세요")
    private String password;
    private boolean rememberMe;
}
````

## File: src/main/java/com/example/carelink/common/CustomMultipartFile.java
````java
package com.example.carelink.common;
import org.springframework.web.multipart.MultipartFile;
import java.io.*;
public class CustomMultipartFile implements MultipartFile {
    private final String name;
    private final String originalFilename;
    private final String contentType;
    private final byte[] content;
    public CustomMultipartFile(String name, String originalFilename, String contentType, byte[] content) {
        this.name = name;
        this.originalFilename = originalFilename;
        this.contentType = contentType;
        this.content = content;
    }
    @Override
    public String getName() {
        return name;
    }
    @Override
    public String getOriginalFilename() {
        return originalFilename;
    }
    @Override
    public String getContentType() {
        return contentType;
    }
    @Override
    public boolean isEmpty() {
        return content == null || content.length == 0;
    }
    @Override
    public long getSize() {
        return content != null ? content.length : 0;
    }
    @Override
    public byte[] getBytes() throws IOException {
        return content;
    }
    @Override
    public InputStream getInputStream() throws IOException {
        return new ByteArrayInputStream(content);
    }
    @Override
    public void transferTo(File dest) throws IOException, IllegalStateException {
        try (FileOutputStream fos = new FileOutputStream(dest)) {
            fos.write(content);
        }
    }
}
````

## File: src/main/java/com/example/carelink/common/PageInfo.java
````java
package com.example.carelink.common;
import lombok.Getter;
import lombok.Setter;
import java.util.List;
@Getter
@Setter
public class PageInfo<T> {
    private List<T> list;
    private int currentPage;
    private int pageSize;
    private int totalCount;
    private int totalPages;
    private int startPage;
    private int endPage;
    private boolean hasPrevious;
    private boolean hasNext;
    private boolean firstPage;
    private boolean lastPage;
    public PageInfo(List<T> list, int currentPage, int pageSize, int totalCount) {
        this.list = list;
        this.currentPage = currentPage;
        this.pageSize = pageSize;
        this.totalCount = totalCount;
        this.totalPages = (int) Math.ceil((double) totalCount / pageSize);
        this.startPage = Math.max(1, currentPage - 4);
        this.endPage = Math.min(totalPages, currentPage + 4);
        this.hasPrevious = currentPage > 1;
        this.hasNext = currentPage < totalPages;
        this.firstPage = currentPage == 1;
        this.lastPage = currentPage == totalPages;
    }
    public int getOffset() {
        return (currentPage - 1) * pageSize;
    }
    public boolean isFirstPage() {
        return currentPage == 1;
    }
    public boolean isLastPage() {
        return currentPage == totalPages;
    }
}
````

## File: src/main/java/com/example/carelink/config/DevSecurityConfig.java
````java
package com.example.carelink.config;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
@Configuration
@EnableWebSecurity
@Profile("dev")
public class DevSecurityConfig {
    @Bean
    public SecurityFilterChain devFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
            )
            .formLogin(formLogin -> formLogin.disable())
            .httpBasic(httpBasic -> httpBasic.disable());
        return http.build();
    }
}
````

## File: src/main/java/com/example/carelink/config/KakaoApiConfig.java
````java
package com.example.carelink.config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;
@Configuration
public class KakaoApiConfig implements WebMvcConfigurer {
    @Value("${api.kakao.app-key:#{null}}")
    private String kakaoAppKey;
    private String getKakaoAppKey() {
        String key = kakaoAppKey;
        if (key == null || key.isEmpty()) {
            key = System.getenv("KAKAO_APP_KEY");
            System.out.println("환경변수에서 직접 읽은 API 키: " + (key != null ? "존재함" : "없음"));
        }
        return key;
    }
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new KakaoApiInterceptor());
    }
    public class KakaoApiInterceptor implements HandlerInterceptor {
        @Override
        public void postHandle(HttpServletRequest request, HttpServletResponse response,
                             Object handler, ModelAndView modelAndView) throws Exception {
            if (modelAndView != null && !modelAndView.getViewName().startsWith("redirect:")) {
                String apiKey = getKakaoAppKey();
                System.out.println("뷰에 전달할 API 키: " + (apiKey != null && !apiKey.isEmpty() ? "존재함" : "없음"));
                modelAndView.addObject("KAKAO_APP_KEY", apiKey);
            }
        }
    }
}
````

## File: src/main/java/com/example/carelink/config/ProdSecurityConfig.java
````java
package com.example.carelink.config;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
@Configuration
@EnableWebSecurity
@Profile("prod")
public class ProdSecurityConfig {
    @Bean
    public SecurityFilterChain prodFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf
                .csrfTokenRepository(org.springframework.security.web.csrf.CookieCsrfTokenRepository.withHttpOnlyFalse())
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    new AntPathRequestMatcher("/css/**"),
                    new AntPathRequestMatcher("/js/**"),
                    new AntPathRequestMatcher("/images/**"),
                    new AntPathRequestMatcher("/favicon.ico")
                ).permitAll()
                .requestMatchers(
                    new AntPathRequestMatcher("/"),
                    new AntPathRequestMatcher("/member/login"),
                    new AntPathRequestMatcher("/member/join"),
                    new AntPathRequestMatcher("/member/checkUserId"),
                    new AntPathRequestMatcher("/facility/**"),
                    new AntPathRequestMatcher("/board/**"),
                    new AntPathRequestMatcher("/review/**"),
                    new AntPathRequestMatcher("/job/**"),
                    new AntPathRequestMatcher("/api/**"),
                    new AntPathRequestMatcher("/error")
                ).permitAll()
                .requestMatchers(new AntPathRequestMatcher("/admin/**")).hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .formLogin(formLogin -> formLogin
                .loginPage("/member/login")
                .defaultSuccessUrl("/")
                .failureUrl("/member/login?error=true")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutRequestMatcher(new AntPathRequestMatcher("/member/logout"))
                .logoutSuccessUrl("/")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
                .permitAll()
            )
            .sessionManagement(session -> session
                .maximumSessions(1)
                .maxSessionsPreventsLogin(false)
            );
        return http.build();
    }
}
````

## File: src/main/java/com/example/carelink/controller/HomeController.java
````java
package com.example.carelink.controller;
import com.example.carelink.service.BoardService;
import com.example.carelink.service.FacilityService;
import com.example.carelink.service.JobService;
import com.example.carelink.service.MemberService;
import com.example.carelink.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
@Slf4j
@Controller
@RequiredArgsConstructor
public class HomeController {
    private final MemberService memberService;
    private final FacilityService facilityService;
    private final JobService jobService;
    private final ReviewService reviewService;
    private final BoardService boardService;
    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("pageTitle", "메인");
        try {
            int facilityCount = facilityService.getFacilityCount();
            int jobCount = jobService.getJobCount();
            int reviewCount = reviewService.getReviewCount();
            int memberCount = memberService.getMemberCount();
            int boardCount = boardService.getBoardCount();
            model.addAttribute("facilityCount", facilityCount);
            model.addAttribute("jobCount", jobCount);
            model.addAttribute("reviewCount", reviewCount);
            model.addAttribute("memberCount", memberCount);
            model.addAttribute("boardCount", boardCount);
            log.info("통계 데이터 - 시설: {}, 구인구직: {}, 리뷰: {}, 회원: {}, 게시글: {}",
                    facilityCount, jobCount, reviewCount, memberCount, boardCount);
        } catch (Exception e) {
            log.error("통계 데이터 조회 실패", e);
            model.addAttribute("facilityCount", 0);
            model.addAttribute("jobCount", 0);
            model.addAttribute("reviewCount", 0);
            model.addAttribute("memberCount", 0);
            model.addAttribute("boardCount", 0);
        }
        log.info("메인 페이지 접속");
        return "index";
    }
    @GetMapping("/about")
    public String about(Model model) {
        model.addAttribute("pageTitle", "소개");
        return "about";
    }
    @GetMapping("/error")
    public String error() {
        return "error";
    }
}
````

## File: src/main/java/com/example/carelink/dao/JobApplicationMapper.java
````java
package com.example.carelink.dao;
import com.example.carelink.dto.JobApplicationDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
@Mapper
public interface JobApplicationMapper {
    int insertJobApplication(JobApplicationDTO jobApplication);
    int countByJobIdAndApplicantMemberId(@Param("jobId") Long jobId, @Param("applicantMemberId") Long applicantMemberId);
}
````

## File: src/main/java/com/example/carelink/dto/FacilityImageDTO.java
````java
package com.example.carelink.dto;
import lombok.Data;
import java.time.LocalDateTime;
@Data
public class FacilityImageDTO {
    private Long imageId;
    private Long facilityId;
    private String imagePath;
    private String imageAltText;
    private Integer imageOrder;
    private Boolean isMainImage;
    private LocalDateTime uploadDate;
    private LocalDateTime updatedAt;
}
````

## File: src/main/java/com/example/carelink/dto/JobApplicationDTO.java
````java
package com.example.carelink.dto;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobApplicationDTO {
    private Long id;
    private Long jobId;
    private Long applicantMemberId;
    private LocalDateTime applicationDate;
    private String status;
}
````

## File: src/main/java/com/example/carelink/validation/groups/OnFacilityJoin.java
````java
package com.example.carelink.validation.groups;
public interface OnFacilityJoin {
}
````

## File: src/main/resources/mapper/JobApplicationMapper.xml
````xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.carelink.dao.JobApplicationMapper">
    <insert id="insertJobApplication" parameterType="com.example.carelink.dto.JobApplicationDTO"
            useGeneratedKeys="true" keyProperty="id">
        INSERT INTO job_application (
            job_id,
            applicant_member_id,
            application_date,
            status
        ) VALUES (
            #{jobId},
            #{applicantMemberId},
            #{applicationDate},
            #{status}
        )
    </insert>
    <select id="countByJobIdAndApplicantMemberId" resultType="int">
        SELECT COUNT(*)
        FROM job_application
        WHERE job_id = #{jobId} AND applicant_member_id = #{applicantMemberId}
    </select>
    </mapper>
````

## File: src/main/java/com/example/carelink/common/Constants.java
````java
package com.example.carelink.common;
public class Constants {
    public static final String SESSION_MEMBER = "loginMember";
    public static final int MAX_LOGIN_ATTEMPTS = 5;
    public static final String MEMBER_ROLE_USER = "USER";
    public static final String MEMBER_ROLE_FACILITY = "FACILITY";
    public static final String MEMBER_ROLE_ADMIN = "ADMIN";
    public static final int DEFAULT_PAGE_SIZE = 10;
    public static final int DEFAULT_PAGE_BLOCK = 5;
    public static final String UPLOAD_BASE_PATH = "C:/carelink-uploads/";
    public static final String FACILITY_UPLOAD_PATH = UPLOAD_BASE_PATH + "facility/";
    public static final String PROFILE_UPLOAD_PATH = UPLOAD_BASE_PATH + "profile/";
    public static final String TEMP_UPLOAD_PATH = UPLOAD_BASE_PATH + "temp/";
    public static final String TEST_IMAGES_PATH = "/test-images/";
    public static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    public static final int MAX_FACILITY_IMAGES = 5;
    public static final int MAX_PROFILE_IMAGES = 1;
    public static final String[] ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "webp"};
    public static final String JOB_TYPE_RECRUIT = "RECRUIT";
    public static final String JOB_TYPE_SEARCH = "SEARCH";
    public static final String JOB_STATUS_ACTIVE = "ACTIVE";
    public static final String JOB_STATUS_CLOSED = "CLOSED";
    public static final String FACILITY_TYPE_NURSING_HOME = "NURSING_HOME";
    public static final String FACILITY_TYPE_HOSPITAL = "HOSPITAL";
    public static final String FACILITY_TYPE_DAY_CARE = "DAY_CARE";
    public static final String SUCCESS = "success";
    public static final String ERROR = "error";
    public static final String DUPLICATE_ID = "duplicate_id";
    public static final String LOGIN_REQUIRED = "login_required";
}
````

## File: src/main/java/com/example/carelink/controller/AdminController.java
````java
package com.example.carelink.controller;
import com.example.carelink.common.Constants;
import com.example.carelink.dto.FacilityDTO;
import com.example.carelink.dto.MemberDTO;
import com.example.carelink.service.FacilityService;
import com.example.carelink.service.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import javax.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.List;
@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {
    private final FacilityService facilityService;
    private final MemberService memberService;
    private boolean isAdmin(HttpSession session) {
        MemberDTO sessionMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        return sessionMember != null && "ADMIN".equals(sessionMember.getRole());
    }
    @GetMapping("")
    public String adminDashboard(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
        if (!isAdmin(session)) {
            redirectAttributes.addFlashAttribute("errorMessage", "관리자 권한이 필요합니다.");
            return "redirect:/";
        }
        try {
            int pendingFacilities = facilityService.countPendingFacilities();
            int totalMembers = memberService.getTotalMemberCount();
            int facilityMembers = memberService.getFacilityMemberCount();
            int userMembers = totalMembers - facilityMembers;
            model.addAttribute("pendingFacilities", pendingFacilities);
            model.addAttribute("totalMembers", totalMembers);
            model.addAttribute("facilityMembers", facilityMembers);
            model.addAttribute("userMembers", userMembers);
            log.info("관리자 대시보드 접근 - 승인대기: {}, 전체회원: {}", pendingFacilities, totalMembers);
        } catch (Exception e) {
            log.error("관리자 대시보드 로딩 중 오류 발생", e);
            redirectAttributes.addFlashAttribute("errorMessage", "대시보드 정보를 불러오는 중 오류가 발생했습니다.");
        }
        return "admin/dashboard";
    }
    @GetMapping("/facilities")
    public String facilityManagement(@RequestParam(defaultValue = "PENDING") String status,
                                   HttpSession session, Model model, RedirectAttributes redirectAttributes) {
        if (!isAdmin(session)) {
            redirectAttributes.addFlashAttribute("errorMessage", "관리자 권한이 필요합니다.");
            return "redirect:/";
        }
        try {
            log.info("시설 승인 관리 페이지 접근 시도 - 상태: {}", status);
            List<FacilityDTO> facilities = facilityService.getFacilitiesByApprovalStatus(status);
            log.info("시설 목록 조회 완료 - 상태: {}, 개수: {}", status, facilities != null ? facilities.size() : "null");
            if (facilities == null) {
                facilities = new ArrayList<>();
                log.warn("시설 목록이 null이어서 빈 리스트로 초기화했습니다.");
            }
            model.addAttribute("facilities", facilities);
            model.addAttribute("currentStatus", status);
        } catch (Exception e) {
            log.error("시설 목록 조회 중 오류 발생 - 상태: {}", status, e);
            model.addAttribute("facilities", new ArrayList<>());
            model.addAttribute("currentStatus", status);
            redirectAttributes.addFlashAttribute("errorMessage", "시설 목록을 불러오는 중 오류가 발생했습니다: " + e.getMessage());
        }
        return "admin/facilities";
    }
    @PostMapping("/facilities/{facilityId}/approve")
    @ResponseBody
    public String approveFacility(@PathVariable Long facilityId,
                                @RequestParam String action,
                                @RequestParam(required = false) String reason,
                                HttpSession session) {
        if (!isAdmin(session)) {
            return "UNAUTHORIZED";
        }
        try {
            String newStatus;
            if ("approve".equals(action)) {
                newStatus = "APPROVED";
                facilityService.updateFacilityApprovalStatus(facilityId, newStatus, null);
                log.info("시설 승인 완료 - ID: {}", facilityId);
            } else if ("reject".equals(action)) {
                newStatus = "REJECTED";
                facilityService.updateFacilityApprovalStatus(facilityId, newStatus, reason);
                log.info("시설 승인 거부 - ID: {}, 사유: {}", facilityId, reason);
            } else {
                return "INVALID_ACTION";
            }
            return "SUCCESS";
        } catch (Exception e) {
            log.error("시설 승인 처리 중 오류 발생 - ID: {}", facilityId, e);
            return "ERROR";
        }
    }
    @GetMapping("/members")
    public String memberManagement(@RequestParam(defaultValue = "ALL") String role,
                                 @RequestParam(defaultValue = "1") int page,
                                 HttpSession session, Model model, RedirectAttributes redirectAttributes) {
        if (!isAdmin(session)) {
            redirectAttributes.addFlashAttribute("errorMessage", "관리자 권한이 필요합니다.");
            return "redirect:/";
        }
        try {
            List<MemberDTO> members = memberService.getMembersByRole(role, page, 20);
            int totalCount = memberService.getMemberCountByRole(role);
            int totalPages = (int) Math.ceil((double) totalCount / 20);
            model.addAttribute("members", members);
            model.addAttribute("currentRole", role);
            model.addAttribute("currentPage", page);
            model.addAttribute("totalPages", totalPages);
            model.addAttribute("totalCount", totalCount);
            log.info("회원 관리 페이지 접근 - 역할: {}, 페이지: {}, 총 개수: {}", role, page, totalCount);
        } catch (Exception e) {
            log.error("회원 목록 조회 중 오류 발생", e);
            redirectAttributes.addFlashAttribute("errorMessage", "회원 목록을 불러오는 중 오류가 발생했습니다.");
        }
        return "admin/members";
    }
    @PostMapping("/members/{memberId}/toggle-active")
    @ResponseBody
    public String toggleMemberActive(@PathVariable Long memberId, HttpSession session) {
        if (!isAdmin(session)) {
            return "UNAUTHORIZED";
        }
        try {
            boolean result = memberService.toggleMemberActive(memberId);
            log.info("회원 활성화 상태 변경 - ID: {}, 결과: {}", memberId, result);
            return result ? "SUCCESS" : "FAILED";
        } catch (Exception e) {
            log.error("회원 활성화 상태 변경 중 오류 발생 - ID: {}", memberId, e);
            return "ERROR";
        }
    }
    @GetMapping("/facilities/{facilityId}/detail")
    @ResponseBody
    public FacilityDTO getFacilityDetail(@PathVariable Long facilityId, HttpSession session) {
        if (!isAdmin(session)) {
            return null;
        }
        try {
            return facilityService.getFacilityById(facilityId);
        } catch (Exception e) {
            log.error("시설 상세 정보 조회 중 오류 발생 - ID: {}", facilityId, e);
            return null;
        }
    }
    @GetMapping("/statistics")
    public String statistics(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
        if (!isAdmin(session)) {
            redirectAttributes.addFlashAttribute("errorMessage", "관리자 권한이 필요합니다.");
            return "redirect:/";
        }
        try {
            model.addAttribute("totalMembers", memberService.getTotalMemberCount());
            model.addAttribute("facilityMembers", memberService.getFacilityMemberCount());
            model.addAttribute("approvedFacilities", facilityService.countApprovedFacilities());
            model.addAttribute("pendingFacilities", facilityService.countPendingFacilities());
            model.addAttribute("rejectedFacilities", facilityService.countRejectedFacilities());
            log.info("관리자 통계 페이지 접근");
        } catch (Exception e) {
            log.error("통계 데이터 조회 중 오류 발생", e);
            redirectAttributes.addFlashAttribute("errorMessage", "통계 데이터를 불러오는 중 오류가 발생했습니다.");
        }
        return "admin/statistics";
    }
}
````

## File: src/main/java/com/example/carelink/dto/JobDTO.java
````java
package com.example.carelink.dto;
import com.example.carelink.common.BaseDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
@Data
@EqualsAndHashCode(callSuper = true)
public class JobDTO extends BaseDTO {
    private Long jobId;
    @NotBlank(message = "제목은 필수입니다")
    private String title;
    @NotBlank(message = "내용은 필수입니다")
    private String content;
    @NotBlank(message = "구인구직 유형은 필수입니다")
    private String jobType;
    @NotBlank(message = "근무 형태는 필수입니다")
    private String workType;
    private String position;
    private Integer recruitCount;
    private String salaryType;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String salaryDescription;
    private String workLocation;
    private String workHours;
    private String experience;
    private String education;
    private String qualifications;
    private String benefits;
    private LocalDate startDate;
    private LocalDate endDate;
    private String contactName;
    private String contactPhone;
    private String contactEmail;
    @NotBlank(message = "게시글 상태는 필수입니다")
    private String status;
    private Integer viewCount;
    private Integer applyCount;
    @NotNull(message = "작성자 정보는 필수입니다")
    private Long memberId;
    private String memberName;
    private Long facilityId;
    private String facilityName;
    private String searchKeyword;
    private String searchJobType;
    private String searchWorkType;
    private String searchLocation;
    private String searchPosition;
    private String attachmentPath;
    private String attachmentName;
    private Integer priority;
    private boolean isHighlight;
}
````

## File: src/main/java/com/example/carelink/dto/ReviewDTO.java
````java
package com.example.carelink.dto;
import com.example.carelink.common.BaseDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
@Data
@EqualsAndHashCode(callSuper = true)
public class ReviewDTO extends BaseDTO {
    private Long reviewId;
    @NotNull(message = "시설 정보는 필수입니다")
    private Long facilityId;
    private String facilityName;
    @NotNull(message = "작성자 정보는 필수입니다")
    private Long memberId;
    private String memberName;
    @NotBlank(message = "리뷰 제목은 필수입니다")
    private String title;
    @NotBlank(message = "리뷰 내용은 필수입니다")
    private String content;
    @NotNull(message = "평점은 필수입니다")
    @Min(value = 1, message = "평점은 1점 이상이어야 합니다")
    @Max(value = 5, message = "평점은 5점 이하여야 합니다")
    private Integer rating;
    private Integer serviceRating;
    private Integer facilityRating;
    private Integer staffRating;
    private Integer priceRating;
    private String reviewImage1;
    private String reviewImage2;
    private String reviewImage3;
    private String reviewImage1AltText;
    private String reviewImage2AltText;
    private String reviewImage3AltText;
    private Integer likeCount;
    private Integer dislikeCount;
    private Integer viewCount;
    private boolean isVisible;
    private String status;
    private Long parentReviewId;
    private Integer replyCount;
    private Integer replyDepth;
    private String searchKeyword;
    private Integer minRating;
    private Integer maxRating;
    private String sortBy;
    private Double facilityAverageRating;
    private Integer facilityReviewCount;
}
````

## File: src/main/java/com/example/carelink/CarelinkApplication.java
````java
package com.example.carelink;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
@SpringBootApplication
@MapperScan(basePackages = {"com.example.carelink.dao"})
public class CarelinkApplication {
    public static void main(String[] args) {
        SpringApplication.run(CarelinkApplication.class, args);
        System.out.println("========================================");
        System.out.println("    요양원 구인구직 사이트 시작됨!        ");
        System.out.println("    포트: http://localhost:8080         ");
        System.out.println("========================================");
    }
}
````

## File: src/main/resources/mapper/jobMapper.xml
````xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.carelink.dao.JobMapper">
    <resultMap id="jobResultMap" type="com.example.carelink.dto.JobDTO">
        <id property="jobId" column="job_id"/>
        <result property="title" column="title"/>
        <result property="content" column="content"/>
        <result property="jobType" column="job_type"/>
        <result property="workType" column="work_type"/>
        <result property="position" column="position"/>
        <result property="recruitCount" column="recruit_count"/>
        <result property="salaryType" column="salary_type"/>
        <result property="salaryMin" column="salary_min"/>
        <result property="salaryMax" column="salary_max"/>
        <result property="salaryDescription" column="salary_description"/>
        <result property="workLocation" column="work_location"/>
        <result property="workHours" column="work_hours"/>
        <result property="experience" column="experience"/>
        <result property="education" column="education"/>
        <result property="qualifications" column="qualifications"/>
        <result property="benefits" column="benefits"/>
        <result property="startDate" column="start_date"/>
        <result property="endDate" column="end_date"/>
        <result property="contactName" column="contact_name"/>
        <result property="contactPhone" column="contact_phone"/>
        <result property="contactEmail" column="contact_email"/>
        <result property="status" column="status"/>
        <result property="viewCount" column="view_count"/>
        <result property="applyCount" column="apply_count"/>
        <result property="memberId" column="member_id"/>
        <result property="memberName" column="member_name"/>
        <result property="facilityId" column="facility_id"/>
        <result property="facilityName" column="facility_name"/>
        <result property="attachmentPath" column="attachment_path"/>
        <result property="attachmentName" column="attachment_name"/>
        <result property="priority" column="priority"/>
        <result property="isHighlight" column="is_highlight"/>
        <result property="createdAt" column="created_at"/>
        <result property="updatedAt" column="updated_at"/>
        <result property="isDeleted" column="is_deleted"/>
    </resultMap>
    <select id="findJobsWithSearch" parameterType="com.example.carelink.dto.JobDTO" resultMap="jobResultMap">
        SELECT
            j.*,
            m.name as member_name,
            f.facility_name
        FROM job_posting j
        LEFT JOIN member m ON j.member_id = m.member_id
        LEFT JOIN facility f ON j.facility_id = f.facility_id
        WHERE j.is_deleted = false
        <if test="searchKeyword != null and searchKeyword != ''">
            AND (j.title LIKE CONCAT('%', #{searchKeyword}, '%')
                 OR j.content LIKE CONCAT('%', #{searchKeyword}, '%')
                 OR j.position LIKE CONCAT('%', #{searchKeyword}, '%'))
        </if>
        <if test="searchJobType != null and searchJobType != ''">
            AND j.job_type = #{searchJobType}
        </if>
        <if test="searchWorkType != null and searchWorkType != ''">
            AND j.work_type = #{searchWorkType}
        </if>
        <if test="searchLocation != null and searchLocation != ''">
            AND j.work_location LIKE CONCAT('%', #{searchLocation}, '%')
        </if>
        <if test="searchPosition != null and searchPosition != ''">
            AND j.position LIKE CONCAT('%', #{searchPosition}, '%')
        </if>
        ORDER BY j.priority DESC, j.created_at DESC
        <if test="size != null and size > 0">
            LIMIT #{size}
        </if>
        <if test="offset != null and offset >= 0">
            OFFSET #{offset}
        </if>
    </select>
    <select id="countJobsWithSearch" parameterType="com.example.carelink.dto.JobDTO" resultType="int">
        SELECT COUNT(*)
        FROM job_posting j
        WHERE j.is_deleted = false
        <if test="searchKeyword != null and searchKeyword != ''">
            AND (j.title LIKE CONCAT('%', #{searchKeyword}, '%')
                 OR j.content LIKE CONCAT('%', #{searchKeyword}, '%')
                 OR j.position LIKE CONCAT('%', #{searchKeyword}, '%'))
        </if>
        <if test="searchJobType != null and searchJobType != ''">
            AND j.job_type = #{searchJobType}
        </if>
        <if test="searchWorkType != null and searchWorkType != ''">
            AND j.work_type = #{searchWorkType}
        </if>
        <if test="searchLocation != null and searchLocation != ''">
            AND j.work_location LIKE CONCAT('%', #{searchLocation}, '%')
        </if>
        <if test="searchPosition != null and searchPosition != ''">
            AND j.position LIKE CONCAT('%', #{searchPosition}, '%')
        </if>
    </select>
    <select id="findJobById" parameterType="long" resultMap="jobResultMap">
        SELECT
            j.*,
            m.name as member_name,
            f.facility_name
        FROM job_posting j
        LEFT JOIN member m ON j.member_id = m.member_id
        LEFT JOIN facility f ON j.facility_id = f.facility_id
        WHERE j.job_id = #{jobId} AND j.is_deleted = false
    </select>
    <insert id="insertJob" parameterType="com.example.carelink.dto.JobDTO" useGeneratedKeys="true" keyProperty="jobId">
        INSERT INTO job_posting (
            title, content, job_type, work_type, position, recruit_count,
            salary_type, salary_min, salary_max, salary_description,
            work_location, work_hours, experience, education, qualifications, benefits,
            start_date, end_date, contact_name, contact_phone, contact_email,
            status, member_id, facility_id, attachment_path, attachment_name,
            priority, is_highlight, created_at
        ) VALUES (
            #{title}, #{content}, #{jobType}, #{workType}, #{position}, #{recruitCount},
            #{salaryType}, #{salaryMin}, #{salaryMax}, #{salaryDescription},
            #{workLocation}, #{workHours}, #{experience}, #{education}, #{qualifications}, #{benefits},
            #{startDate}, #{endDate}, #{contactName}, #{contactPhone}, #{contactEmail},
            #{status}, #{memberId}, #{facilityId}, #{attachmentPath}, #{attachmentName},
            #{priority}, #{isHighlight}, NOW()
        )
    </insert>
    <update id="updateJob" parameterType="com.example.carelink.dto.JobDTO">
        UPDATE job_posting SET
            title = #{title},
            content = #{content},
            job_type = #{jobType},
            work_type = #{workType},
            position = #{position},
            recruit_count = #{recruitCount},
            salary_type = #{salaryType},
            salary_min = #{salaryMin},
            salary_max = #{salaryMax},
            salary_description = #{salaryDescription},
            work_location = #{workLocation},
            work_hours = #{workHours},
            experience = #{experience},
            education = #{education},
            qualifications = #{qualifications},
            benefits = #{benefits},
            start_date = #{startDate},
            end_date = #{endDate},
            contact_name = #{contactName},
            contact_phone = #{contactPhone},
            contact_email = #{contactEmail},
            status = #{status},
            facility_id = #{facilityId},
            attachment_path = #{attachmentPath},
            attachment_name = #{attachmentName},
            priority = #{priority},
            is_highlight = #{isHighlight},
            updated_at = NOW()
        WHERE job_id = #{jobId}
    </update>
    <update id="deleteJob" parameterType="long">
        UPDATE job_posting SET
            is_deleted = true,
            updated_at = NOW()
        WHERE job_id = #{jobId}
    </update>
    <update id="incrementViewCount" parameterType="long">
        UPDATE job_posting SET
            view_count = view_count + 1,
            updated_at = NOW()
        WHERE job_id = #{jobId}
    </update>
    <update id="incrementApplyCount" parameterType="long">
        UPDATE job_posting SET
            apply_count = apply_count + 1,
            updated_at = NOW()
        WHERE job_id = #{jobId}
    </update>
    <select id="findJobsByMemberId" parameterType="long" resultMap="jobResultMap">
        SELECT
            j.*,
            m.name as member_name,
            f.facility_name
        FROM job_posting j
        LEFT JOIN member m ON j.member_id = m.member_id
        LEFT JOIN facility f ON j.facility_id = f.facility_id
        WHERE j.member_id = #{memberId} AND j.is_deleted = false
        ORDER BY j.created_at DESC
    </select>
    <select id="findJobsByFacilityId" parameterType="long" resultMap="jobResultMap">
        SELECT
            j.*,
            m.name as member_name,
            f.facility_name
        FROM job_posting j
        LEFT JOIN member m ON j.member_id = m.member_id
        LEFT JOIN facility f ON j.facility_id = f.facility_id
        WHERE j.facility_id = #{facilityId} AND j.is_deleted = false
        ORDER BY j.created_at DESC
    </select>
    <select id="getJobList" parameterType="com.example.carelink.dto.JobDTO" resultMap="jobResultMap">
        SELECT
            j.*,
            m.name as member_name,
            f.facility_name
        FROM job_posting j
        LEFT JOIN member m ON j.member_id = m.member_id
        LEFT JOIN facility f ON j.facility_id = f.facility_id
        WHERE j.is_deleted = false
        ORDER BY j.priority DESC, j.created_at DESC
        <if test="size != null and size > 0">
            LIMIT #{size}
        </if>
        <if test="page != null and page >= 0">
            OFFSET #{page}
        </if>
    </select>
    <select id="getJobById" parameterType="long" resultMap="jobResultMap">
        SELECT
            j.*,
            m.name as member_name,
            f.facility_name
        FROM job_posting j
        LEFT JOIN member m ON j.member_id = m.member_id
        LEFT JOIN facility f ON j.facility_id = f.facility_id
        WHERE j.job_id = #{jobId} AND j.is_deleted = false
    </select>
    <select id="getPopularJobs" resultMap="jobResultMap">
        SELECT
            j.*,
            m.name as member_name,
            f.facility_name
        FROM job_posting j
        LEFT JOIN member m ON j.member_id = m.member_id
        LEFT JOIN facility f ON j.facility_id = f.facility_id
        WHERE j.is_deleted = false AND j.status = 'ACTIVE'
        ORDER BY j.view_count DESC, j.apply_count DESC
        LIMIT 10
    </select>
    <select id="getJobCount" resultType="int">
        SELECT COUNT(*)
        FROM job_posting
        WHERE is_deleted = false AND status = 'ACTIVE'
    </select>
    <delete id="deleteByMemberId" parameterType="long">
        DELETE FROM job_posting WHERE member_id = #{memberId}
    </delete>
    <delete id="deleteByFacilityMemberId" parameterType="long">
        DELETE FROM job_posting
        WHERE facility_id IN (
            SELECT facility_id FROM facility WHERE registered_member_id = #{memberId}
        )
    </delete>
</mapper>
````

## File: CLAUDE.md
````markdown
# CLAUDE.md

이 문서는 이 저장소에서 Claude Code (claude.ai/code)가 코드를 다룰 때 참고할 가이드입니다.

---

## 📌 프로젝트 개요

이 프로젝트는 한국 팀원 4명이 개발하는 \*\*요양원 구인구직 웹사이트 "라이트케어(LightCare)"\*\*입니다. 이 플랫폼은 요양 시설과 요양업계 구직자를 연결해주는 서비스입니다.

---

## 🛠 기술 스택

* **백엔드**: Spring Boot 2.7.18, MyBatis, MySQL
* **프론트엔드**: Thymeleaf 템플릿, Bootstrap 5, JavaScript
* **빌드 도구**: Gradle (Java 11 사용)
* **데이터베이스**: MySQL (문자 인코딩 utf8mb4)

---

## ⚙️ 공통 개발 명령어

### 빌드 및 실행

```bash
# 프로젝트 빌드
./gradlew build

# 애플리케이션 실행
./gradlew bootRun

# 빌드 결과물 정리
./gradlew clean

# 테스트 실행
./gradlew test

# 코드 품질 검사
./gradlew check
```

### 데이터베이스 설정

```bash
# MySQL 접속 및 DB 생성
mysql -u root -p
CREATE DATABASE carelink CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 스키마 초기화
# src/main/resources/schema.sql 파일을 MySQL에서 실행
```

### 개발 서버 정보

* 실행 주소: `http://localhost:8080`
* DB 연결 주소: `jdbc:mysql://localhost:3306/carelink`
* DevTools를 통한 핫 리로드(Hot Reload) 적용됨

---

## 🧱 아키텍처 개요

### 팀 구조 (4인 협업)

기능 중심의 분업 구조로 운영됩니다:

* **팀원 A**: 회원 관리 (로그인, 회원가입, 내 정보)
* **팀원 B**: 시설 검색 및 지도 연동 (카카오맵)
* **팀원 C**: 구인구직 게시판 (공고 작성, 지원)
* **팀원 D**: 리뷰 시스템 및 정보 게시판

### 패키지 구조

```
com.example.carelink/
├── controller/          # 컨트롤러 계층
├── service/            # 서비스 계층 (비즈니스 로직)
├── dao/               # DAO 계층 (MyBatis 매퍼)
├── dto/               # DTO 객체
└── common/            # 공통 유틸 및 상수
```

### 데이터베이스 설계

관계형 테이블 기반으로 외래키(FK)를 적절히 사용:

* **member**: 사용자 계정 및 인증 정보
* **facility**: 요양시설 정보 (위치 좌표 포함)
* **job\_posting**: 구인공고 정보
* **review**: 시설 리뷰 및 평점
* **board**: 커뮤니티/정보 게시판

### MyBatis 구성

* 설정 파일: `src/main/resources/mybatis-config.xml`
* 매퍼 XML: `src/main/resources/mapper/*.xml`
* camelCase → underscore 자동 매핑 설정
* DTO용 typeAlias 사용

---

## 🎨 프론트엔드 구조

* **Thymeleaf**: Spring Boot 연동 서버사이드 템플릿
* **레이아웃 시스템**: `templates/layout/` 폴더에 header/footer 분리
* **정적 리소스**: `src/main/resources/static/` 폴더에 CSS/JS 저장
* **Bootstrap 5**: 반응형 UI 프레임워크 적용

---

## 🧾 주요 설정 파일

### application.yml

* 서버 포트: 8080
* 데이터베이스 연결 정보
* 개발 시 Thymeleaf 캐시 비활성화
* 파일 업로드 최대 용량 10MB
* MyBatis 매퍼 위치 지정

### 기타 설정 사항

* UTF-8 한글 지원 활성화
* MyBatis 및 Spring Web 로그 출력 설정
* DB 타임존: Asia/Seoul

---

## 🔄 개발 패턴

### 컨트롤러 패턴

Spring MVC 구조를 따름:

* `@Controller` 사용
* Model로 View 데이터 전달
* HTTP Method (@GetMapping, @PostMapping 등) 명확히 구분
* `@Slf4j`로 로깅

### 서비스 계층

컨트롤러와 로직 분리:

* 트랜잭션 처리
* 입력 검증
* 횡단 관심사 관리

### MyBatis 매퍼

XML 기반 SQL 정의:

* `#{}` 사용한 파라미터 바인딩
* DTO 매핑 설정
* JOIN 활용한 복합 조회 처리

---

## ✅ 테스트

### 테스트 구조

* 단위 테스트: JUnit 5
* 통합 테스트: Spring Boot Test
* 테스트 설정은 운영과 별도 구성

### 테스트 명령어

```bash
# 전체 테스트 실행
./gradlew test

# 특정 클래스만 실행
./gradlew test --tests "ClassName"
```

---

## 🤝 팀 협업 규칙

### Git 워크플로우

* 기능 브랜치 명: `feature/member-기능명`
* 커밋 메시지: `[feat] 기능 설명`
* PR을 통한 코드 리뷰 진행

### 코드 컨벤션

* 클래스명: PascalCase
* 메서드명: camelCase
* 상수명: UPPER\_SNAKE\_CASE
* 패키지명: 모두 소문자

---

## ⚠️ 특이 사항

### 한글 지원

* 모든 텍스트 콘텐츠는 한글로 작성
* UTF-8 인코딩 유지
* 주석/문서도 한글 기반

### 지도 연동

* 카카오맵 API 연동 예정
* 위도/경도 기반 시설 검색 기능 포함

### 사용자 역할

* `USER`: 일반 구직자
* `FACILITY`: 요양시설 관리자
* `ADMIN`: 시스템 관리자

---

## 🌐 환경 변수

환경 설정 시 아래 항목 필요:

* `spring.datasource.password`: MySQL 비밀번호
* DB 주소가 다를 경우 `spring.datasource.url` 수정
* 추후 지도 API 키 등록 필요 (예정)

### 🟢 팀원 D (리뷰/게시판) - 진행률: 100%

#### ✅ **완료된 작업**
**백엔드 완전 구현**:
- ✅ `ReviewService.java` (238줄) - **완전 구현**
  - 리뷰 CRUD 로직
  - 트랜잭션 처리
  - 로깅 추가
  - 유효성 검증
  - 평점 시스템
  - 추천/비추천 기능

- ✅ `BoardService.java` (253줄) - **완전 구현**
  - 게시글 CRUD 로직
  - 페이징 처리
  - 검색 및 카테고리 필터링
  - 인기 게시글 기능
  - 조회수 증가 로직

- ✅ `ReviewMapper.java` & `reviewMapper.xml` - **완전 구현**
  - 모든 필요 메서드 정의
  - XML 쿼리 매핑 완료

- ✅ `BoardMapper.java` & `boardMapper.xml` - **완전 구현**
  - 모든 필요 메서드 정의
  - XML 쿼리 매핑 완료

**프론트엔드 완성**:
- ✅ `templates/review/list.html` (108줄) - **완전 구현**
- ✅ `templates/review/write.html` (122줄) - **완전 구현**
- ✅ `templates/board/list.html` - **완전 구현**
- ✅ `templates/board/write.html` - **완전 구현**
- ✅ `templates/board/detail.html` - **완전 구현**

#### 📊 **실제 Story Point 달성률**
- **완료**: LC-010 (리뷰 작성) - 13/13 SP ✅
- **완료**: LC-011 (리뷰 목록 관리) - 13/13 SP ✅
- **완료**: LC-012 (정보 게시판) - 13/13 SP ✅

**총 달성**: 39/39 SP (100%)

#### 🚀 **다음 단계**
1. **단위 테스트 작성**
   - ReviewService 테스트
   - BoardService 테스트
   - 통합 테스트

2. **성능 최적화**
   - 쿼리 최적화
   - 캐싱 적용
   - N+1 문제 해결

3. **추가 기능 개발**
   - 댓글 시스템 고도화
   - 파일 첨부 기능
   - 에디터 기능 강화
````

## File: README.md
````markdown
# LightCare (라이트케어) - 요양원 구인구직 플랫폼

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-2.7.18-brightgreen.svg)
![Java](https://img.shields.io/badge/Java-11-orange.svg)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)
![MyBatis](https://img.shields.io/badge/MyBatis-2.3.1-red.svg)
![Build Status](https://img.shields.io/badge/Build-Passing-success.svg)

## 📖 프로젝트 개요

LightCare는 한국의 요양원 및 노인요양시설과 구직자를 연결하는 전문 구인구직 플랫폼입니다. 고령화 사회에 필요한 요양 서비스 인력을 효율적으로 매칭하고, 시설과 근로자 모두에게 최적화된 환경을 제공합니다.

### 🎯 주요 기능

- **👥 회원 관리**: 구직자 및 시설 관리자 회원가입/로그인
- **🏥 시설 검색**: 카카오맵 연동 시설 위치 검색 및 상세 정보
- **💼 구인구직**: 채용공고 등록/검색, 지원 시스템
- **⭐ 리뷰 시스템**: 시설 평가 및 후기 공유
- **📋 정보 게시판**: 업계 정보 및 공지사항

## 🛠 기술 스택

### Backend
- **Framework**: Spring Boot 2.7.18
- **Language**: Java 11
- **Database**: MySQL 8.0
- **ORM**: MyBatis 2.3.1
- **Build Tool**: Gradle
- **Template Engine**: Thymeleaf

### Frontend
- **Template**: Thymeleaf
- **Styling**: Bootstrap 5, CSS3
- **JavaScript**: Vanilla JS
- **Maps**: Kakao Maps API

### Development Tools
- **IDE**: IntelliJ IDEA
- **Version Control**: Git/GitHub
- **Database Tool**: MySQL Workbench

## 🚀 빠른 시작

### 사전 요구사항

- Java 11 이상
- MySQL 8.0 이상
- Git

### 설치 및 실행

1. **레포지토리 클론**
   ```bash
   git clone https://github.com/dooseob/lightcare.git
   cd lightcare
   ```

2. **데이터베이스 설정**
   ```sql
   CREATE DATABASE carelink CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. **데이터베이스 연결 설정** (`src/main/resources/application.yml`)
   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/carelink
       username: root
       password: mysql
   ```

4. **스키마 초기화**
   ```bash
   # MySQL에서 schema.sql 실행
   mysql -u root -p carelink < src/main/resources/schema.sql
   ```

5. **애플리케이션 실행**
   ```bash
   ./gradlew bootRun
   ```

6. **브라우저에서 접속**
   ```
   http://localhost:8080
   ```

## 📁 프로젝트 구조

```
src/
├── main/
│   ├── java/com/example/carelink/
│   │   ├── controller/          # 웹 요청 처리
│   │   │   ├── HomeController.java
│   │   │   ├── MemberController.java
│   │   │   ├── FacilityController.java
│   │   │   ├── JobController.java
│   │   │   ├── ReviewController.java
│   │   │   └── BoardController.java
│   │   ├── service/             # 비즈니스 로직
│   │   │   ├── MemberService.java
│   │   │   ├── FacilityService.java
│   │   │   ├── JobService.java
│   │   │   ├── ReviewService.java
│   │   │   └── BoardService.java
│   │   ├── dao/                 # 데이터 접근 계층
│   │   │   ├── MemberMapper.java
│   │   │   ├── FacilityMapper.java
│   │   │   ├── JobMapper.java
│   │   │   ├── ReviewMapper.java
│   │   │   └── BoardMapper.java
│   │   ├── dto/                 # 데이터 전송 객체
│   │   │   ├── MemberDTO.java
│   │   │   ├── FacilityDTO.java
│   │   │   ├── JobDTO.java
│   │   │   ├── ReviewDTO.java
│   │   │   └── BoardDTO.java
│   │   └── common/              # 공통 유틸리티
│   │       ├── BaseDTO.java
│   │       ├── PageInfo.java
│   │       └── Constants.java
│   └── resources/
│       ├── static/              # 정적 리소스
│       │   ├── css/
│       │   └── js/
│       ├── templates/           # Thymeleaf 템플릿
│       │   ├── layout/
│       │   ├── member/
│       │   ├── facility/
│       │   ├── job/
│       │   ├── review/
│       │   └── board/
│       ├── mapper/              # MyBatis SQL 매퍼
│       │   ├── memberMapper.xml
│       │   ├── facilityMapper.xml
│       │   ├── jobMapper.xml
│       │   ├── reviewMapper.xml
│       │   └── boardMapper.xml
│       ├── application.yml      # 애플리케이션 설정
│       ├── mybatis-config.xml   # MyBatis 설정
│       └── schema.sql          # 데이터베이스 스키마
```

## 👥 팀 구성 및 역할

| 팀원 | 담당 기능 | 주요 구현 사항 |
|------|----------|---------------|
| **팀원 A** | 회원 관리 | 로그인, 회원가입, 프로필 관리, 세션 관리 |
| **팀원 B** | 시설 검색 | 카카오맵 연동, 시설 정보 관리, 위치 기반 검색 |
| **팀원 C** | 구인구직 | 채용공고 게시판, 지원 시스템, 채용 관리 |
| **팀원 D** | 리뷰 & 게시판 | 시설 리뷰, 평점 시스템, 정보 게시판 |

## 🗄 데이터베이스 설계

### 주요 테이블

- **member**: 회원 정보 (구직자, 시설 관리자)
- **facility**: 요양시설 정보 및 위치 데이터
- **job_posting**: 채용공고 정보
- **review**: 시설 리뷰 및 평점
- **board**: 정보 게시판

### ERD
```sql
-- 주요 테이블 관계
-- member (1) ←→ (N) job_posting
-- member (1) ←→ (N) review
-- facility (1) ←→ (N) job_posting
-- facility (1) ←→ (N) review
```

## 🔧 개발 가이드

### 코딩 컨벤션

- **클래스명**: PascalCase (`MemberController`)
- **메서드명**: camelCase (`getMemberInfo`)
- **상수**: UPPER_SNAKE_CASE (`DEFAULT_PAGE_SIZE`)
- **패키지명**: 소문자 (`com.example.carelink`)

### Git 브랜치 전략

```
main                 # 메인 브랜치
├── feature/member   # 팀원 A - 회원 관리
├── feature/facility # 팀원 B - 시설 검색
├── feature/job      # 팀원 C - 구인구직
└── feature/review   # 팀원 D - 리뷰 시스템
```

### 커밋 메시지 형식

```
[feat] 새로운 기능 추가
[fix] 버그 수정
[docs] 문서 수정
[style] 코드 스타일 수정
[refactor] 코드 리팩토링
[test] 테스트 코드 추가
```

## 🧪 테스트

```bash
# 전체 테스트 실행
./gradlew test

# 빌드 및 테스트
./gradlew build

# 코드 품질 검사
./gradlew check
```

## 📝 API 문서

### 주요 엔드포인트

| Method | URL | 설명 |
|--------|-----|------|
| GET | `/` | 메인 페이지 |
| GET/POST | `/member/login` | 로그인 |
| GET/POST | `/member/join` | 회원가입 |
| GET | `/facility/search` | 시설 검색 |
| GET | `/job/list` | 채용공고 목록 |
| GET | `/review/list` | 리뷰 목록 |
| GET | `/board/list` | 게시판 목록 |

## 🐛 트러블슈팅

### 자주 발생하는 문제

1. **데이터베이스 연결 오류**
   ```
   해결: application.yml의 데이터베이스 설정 확인
   ```

2. **MyBatis 매퍼 오류**
   ```
   해결: mapper XML의 namespace와 인터페이스 경로 일치 확인
   ```

3. **Thymeleaf 템플릿 오류**
   ```
   해결: templates 폴더 경로와 컨트롤러 반환값 일치 확인
   ```

## 🔄 최근 업데이트

### v1.0.0 (2025-06-22)
- ✅ 프로젝트 기본 구조 완성
- ✅ 전체 파일 에러 디버깅 완료
- ✅ 페이징 로직 오류 수정
- ✅ Gradle 빌드 설정 개선
- ✅ 코드 품질 개선 (NPE 방지, 중복 코드 제거)

## 🚀 향후 개발 계획

- [ ] **v1.1**: 보안 강화 (비밀번호 암호화, CSRF 보호)
- [ ] **v1.2**: 카카오맵 API 연동 완성
- [ ] **v1.3**: 실시간 알림 시스템
- [ ] **v1.4**: 모바일 반응형 UI 개선
- [ ] **v2.0**: AI 기반 매칭 시스템

## 🤝 기여 방법

1. Fork 프로젝트
2. Feature 브랜치 생성 (`git checkout -b feature/새기능`)
3. 변경사항 커밋 (`git commit -m '[feat] 새기능 추가'`)
4. 브랜치에 Push (`git push origin feature/새기능`)
5. Pull Request 생성

## 📞 지원

- **팀 이메일**: lightcare-team@gmail.com
- **이슈 트래킹**: [GitHub Issues](https://github.com/dooseob/lightcare/issues)
- **위키**: [프로젝트 위키](https://github.com/dooseob/lightcare/wiki)

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

**LightCare 팀** - 요양 서비스의 미래를 밝히는 플랫폼 💡

### 🟢 팀원 D (리뷰/게시판) - 진행률: 100%

#### ✅ **완료된 작업**
**백엔드 완전 구현**:
- ✅ `ReviewService.java` (238줄) - **완전 구현**
  - 리뷰 CRUD 로직
  - 트랜잭션 처리
  - 로깅 추가
  - 유효성 검증
  - 평점 시스템
  - 추천/비추천 기능

- ✅ `BoardService.java` (253줄) - **완전 구현**
  - 게시글 CRUD 로직
  - 페이징 처리
  - 검색 및 카테고리 필터링
  - 인기 게시글 기능
  - 조회수 증가 로직

- ✅ `ReviewMapper.java` & `reviewMapper.xml` - **완전 구현**
  - 모든 필요 메서드 정의
  - XML 쿼리 매핑 완료

- ✅ `BoardMapper.java` & `boardMapper.xml` - **완전 구현**
  - 모든 필요 메서드 정의
  - XML 쿼리 매핑 완료

**프론트엔드 완성**:
- ✅ `templates/review/list.html` (108줄) - **완전 구현**
- ✅ `templates/review/write.html` (122줄) - **완전 구현**
- ✅ `templates/board/list.html` - **완전 구현**
- ✅ `templates/board/write.html` - **완전 구현**
- ✅ `templates/board/detail.html` - **완전 구현**

#### 📊 **실제 Story Point 달성률**
- **완료**: LC-010 (리뷰 작성) - 13/13 SP ✅
- **완료**: LC-011 (리뷰 목록 관리) - 13/13 SP ✅
- **완료**: LC-012 (정보 게시판) - 13/13 SP ✅

**총 달성**: 39/39 SP (100%)

#### 🚀 **다음 단계**
1. **단위 테스트 작성**
   - ReviewService 테스트
   - BoardService 테스트
   - 통합 테스트

2. **성능 최적화**
   - 쿼리 최적화
   - 캐싱 적용
   - N+1 문제 해결

3. **추가 기능 개발**
   - 댓글 시스템 고도화
   - 파일 첨부 기능
   - 에디터 기능 강화
````

## File: src/main/java/com/example/carelink/config/SecurityConfig.java
````java
package com.example.carelink.config;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.firewall.HttpFirewall;
import org.springframework.security.web.firewall.StrictHttpFirewall;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    @Bean
    public HttpFirewall httpFirewall() {
        StrictHttpFirewall firewall = new StrictHttpFirewall();
        firewall.setAllowUrlEncodedDoubleSlash(true);
        return firewall;
    }
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(
                                new AntPathRequestMatcher("/css/**"),
                                new AntPathRequestMatcher("/js/**"),
                                new AntPathRequestMatcher("/images/**"),
                                new AntPathRequestMatcher("/favicon.ico")
                        ).permitAll()
                        .requestMatchers(
                                new AntPathRequestMatcher("/"),
                                new AntPathRequestMatcher("/member/login"),
                                new AntPathRequestMatcher("/member/join"),
                                new AntPathRequestMatcher("/member/checkUserId"),
                                new AntPathRequestMatcher("/facility/**"),
                                new AntPathRequestMatcher("/board/**"),
                                new AntPathRequestMatcher("/review/**"),
                                new AntPathRequestMatcher("/job/**"),
                                new AntPathRequestMatcher("/api/**"),
                                new AntPathRequestMatcher("/error")
                        ).permitAll()
                        .anyRequest().permitAll()
                )
                .formLogin(formLogin -> formLogin.disable())
                .logout(logout -> logout
                        .logoutRequestMatcher(new AntPathRequestMatcher("/member/logout"))
                        .logoutSuccessUrl("/")
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                        .permitAll()
                );
        return http.build();
    }
}
````

## File: src/main/java/com/example/carelink/config/WebConfig.java
````java
package com.example.carelink.config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Value("${file.upload-dir.facility}")
    private String facilityUploadDir;
    @Value("${file.upload-dir.profile}")
    private String profileUploadDir;
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/facility/**")
                .addResourceLocations("file:" + facilityUploadDir);
        registry.addResourceHandler("/uploads/profile/**")
                .addResourceLocations("file:" + profileUploadDir);
        String projectRoot = System.getProperty("user.dir");
        registry.addResourceHandler("/test-images/facilities/**")
                .addResourceLocations("file:" + projectRoot + "/images/facilities/");
        registry.addResourceHandler("/test-images/profiles/**")
                .addResourceLocations("file:" + projectRoot + "/images/profiles/");
    }
}
````

## File: src/main/java/com/example/carelink/controller/FacilityImageApiController.java
````java
package com.example.carelink.controller;
import com.example.carelink.dto.FacilityImageDTO;
import com.example.carelink.dto.FacilityDTO;
import com.example.carelink.dto.MemberDTO;
import com.example.carelink.service.FacilityImageService;
import com.example.carelink.service.FacilityService;
import com.example.carelink.common.Constants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import javax.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/facility/facility-images")
@RequiredArgsConstructor
@Slf4j
public class FacilityImageApiController {
    private final FacilityImageService facilityImageService;
    private final FacilityService facilityService;
    @PostMapping("/reorder/{facilityId}")
    public ResponseEntity<Map<String, Object>> reorderImages(
            @PathVariable Long facilityId,
            @RequestBody List<Long> imageIds) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("🔄 시설 이미지 순서 재정렬 API 요청 - facilityId: {}, imageIds: {}", facilityId, imageIds);
            boolean success = facilityImageService.updateImageOrdersBatch(facilityId, imageIds);
            if (success) {
                response.put("success", true);
                response.put("message", "이미지 순서가 성공적으로 업데이트되었습니다.");
                List<FacilityImageDTO> updatedImages = facilityImageService.getImagesByFacilityId(facilityId);
                response.put("images", updatedImages);
                log.info("✅ 시설 이미지 순서 재정렬 API 성공 - facilityId: {}", facilityId);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "이미지 순서 업데이트에 실패했습니다.");
                log.warn("⚠️ 시설 이미지 순서 재정렬 API 실패 - facilityId: {}", facilityId);
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            log.error("❌ 시설 이미지 순서 재정렬 API 오류 - facilityId: {}", facilityId, e);
            response.put("success", false);
            response.put("message", "서버 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    @PostMapping("/auto-reorder/{facilityId}")
    public ResponseEntity<Map<String, Object>> autoReorderImages(@PathVariable Long facilityId) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("🔄 시설 이미지 자동 순서 재정렬 API 요청 - facilityId: {}", facilityId);
            boolean success = facilityImageService.reorderAllFacilityImages(facilityId);
            if (success) {
                response.put("success", true);
                response.put("message", "이미지 순서가 자동으로 재정렬되었습니다.");
                List<FacilityImageDTO> reorderedImages = facilityImageService.getImagesByFacilityId(facilityId);
                response.put("images", reorderedImages);
                response.put("imageCount", reorderedImages.size());
                log.info("✅ 시설 이미지 자동 순서 재정렬 API 성공 - facilityId: {}, 총 {}장", facilityId, reorderedImages.size());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "이미지 순서 재정렬에 실패했습니다.");
                log.warn("⚠️ 시설 이미지 자동 순서 재정렬 API 실패 - facilityId: {}", facilityId);
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            log.error("❌ 시설 이미지 자동 순서 재정렬 API 오류 - facilityId: {}", facilityId, e);
            response.put("success", false);
            response.put("message", "서버 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    @GetMapping("/{facilityId}")
    public ResponseEntity<Map<String, Object>> getFacilityImages(@PathVariable Long facilityId, HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("📋 시설 이미지 목록 조회 API 요청 - facilityId: {}", facilityId);
            MemberDTO member = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
            if (member == null) {
                response.put("success", false);
                response.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(401).body(response);
            }
            FacilityDTO facility = facilityService.getFacilityById(facilityId);
            if (facility == null) {
                response.put("success", false);
                response.put("message", "시설을 찾을 수 없습니다.");
                return ResponseEntity.badRequest().body(response);
            }
            if (!facility.getRegisteredMemberId().equals(member.getMemberId())
                && !Constants.MEMBER_ROLE_ADMIN.equals(member.getRole())) {
                response.put("success", false);
                response.put("message", "해당 시설 이미지를 조회할 권한이 없습니다.");
                return ResponseEntity.status(403).body(response);
            }
            List<FacilityImageDTO> images = facilityImageService.getImagesByFacilityId(facilityId);
            FacilityImageDTO mainImage = facilityImageService.getMainImageByFacilityId(facilityId);
            response.put("success", true);
            response.put("images", images);
            response.put("mainImage", mainImage);
            response.put("imageCount", images.size());
            response.put("maxImages", 5);
            log.info("✅ 시설 이미지 목록 조회 API 성공 - facilityId: {}, 총 {}장, memberId: {}", facilityId, images.size(), member.getMemberId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ 시설 이미지 목록 조회 API 오류 - facilityId: {}", facilityId, e);
            response.put("success", false);
            response.put("message", "서버 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    @PutMapping("/{imageId}/order")
    public ResponseEntity<Map<String, Object>> updateImageOrder(
            @PathVariable Long imageId,
            @RequestParam Integer order) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("🔢 개별 이미지 순서 업데이트 API 요청 - imageId: {}, order: {}", imageId, order);
            boolean success = facilityImageService.updateImageOrder(imageId, order);
            if (success) {
                response.put("success", true);
                response.put("message", "이미지 순서가 업데이트되었습니다.");
                log.info("✅ 개별 이미지 순서 업데이트 API 성공 - imageId: {}, order: {}", imageId, order);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "이미지 순서 업데이트에 실패했습니다.");
                log.warn("⚠️ 개별 이미지 순서 업데이트 API 실패 - imageId: {}, order: {}", imageId, order);
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            log.error("❌ 개별 이미지 순서 업데이트 API 오류 - imageId: {}, order: {}", imageId, order, e);
            response.put("success", false);
            response.put("message", "서버 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    @DeleteMapping("/{imageId}")
    public ResponseEntity<Map<String, Object>> deleteImage(@PathVariable Long imageId) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("🗑️ 이미지 삭제 API 요청 - imageId: {}", imageId);
            boolean success = facilityImageService.deleteFacilityImage(imageId);
            if (success) {
                response.put("success", true);
                response.put("message", "이미지가 삭제되었습니다.");
                log.info("✅ 이미지 삭제 API 성공 - imageId: {}", imageId);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "이미지 삭제에 실패했습니다.");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            log.error("❌ 이미지 삭제 API 오류 - imageId: {}", imageId, e);
            response.put("success", false);
            response.put("message", "서버 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    @PostMapping("/{imageId}/set-main")
    public ResponseEntity<Map<String, Object>> setMainImage(@PathVariable Long imageId) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("⭐ 메인 이미지 설정 API 요청 - imageId: {}", imageId);
            FacilityImageDTO imageInfo = facilityImageService.getImageById(imageId);
            if (imageInfo == null) {
                response.put("success", false);
                response.put("message", "이미지를 찾을 수 없습니다.");
                return ResponseEntity.badRequest().body(response);
            }
            boolean success = facilityImageService.setMainImage(imageInfo.getFacilityId(), imageId);
            if (success) {
                response.put("success", true);
                response.put("message", "메인 이미지가 설정되었습니다.");
                log.info("✅ 메인 이미지 설정 API 성공 - imageId: {}", imageId);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "메인 이미지 설정에 실패했습니다.");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            log.error("❌ 메인 이미지 설정 API 오류 - imageId: {}", imageId, e);
            response.put("success", false);
            response.put("message", "서버 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadImages(
            @RequestParam("facilityId") Long facilityId,
            @RequestParam("images") List<MultipartFile> images,
            HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("📤 시설 이미지 업로드 API 요청 - facilityId: {}, 이미지 수: {}", facilityId, images.size());
            MemberDTO member = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
            if (member == null) {
                response.put("success", false);
                response.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(401).body(response);
            }
            FacilityDTO facility = facilityService.getFacilityById(facilityId);
            if (facility == null) {
                response.put("success", false);
                response.put("message", "시설을 찾을 수 없습니다.");
                return ResponseEntity.badRequest().body(response);
            }
            if (!facility.getRegisteredMemberId().equals(member.getMemberId())
                && !Constants.MEMBER_ROLE_ADMIN.equals(member.getRole())) {
                response.put("success", false);
                response.put("message", "해당 시설 이미지를 업로드할 권한이 없습니다.");
                return ResponseEntity.status(403).body(response);
            }
            if (images == null || images.isEmpty()) {
                response.put("success", false);
                response.put("message", "업로드할 이미지가 없습니다.");
                return ResponseEntity.badRequest().body(response);
            }
            final long MAX_FILE_SIZE = 10 * 1024 * 1024;
            final int MAX_FILES = 5;
            if (images.size() > MAX_FILES) {
                response.put("success", false);
                response.put("message", "최대 " + MAX_FILES + "장까지만 업로드할 수 있습니다.");
                return ResponseEntity.badRequest().body(response);
            }
            for (MultipartFile image : images) {
                if (image.getSize() > MAX_FILE_SIZE) {
                    response.put("success", false);
                    response.put("message", "파일 크기가 10MB를 초과할 수 없습니다: " + image.getOriginalFilename());
                    return ResponseEntity.badRequest().body(response);
                }
                String contentType = image.getContentType();
                if (contentType == null || !contentType.startsWith("image/")) {
                    response.put("success", false);
                    response.put("message", "이미지 파일만 업로드할 수 있습니다: " + image.getOriginalFilename());
                    return ResponseEntity.badRequest().body(response);
                }
            }
            List<FacilityImageDTO> uploadedImages = facilityImageService.uploadMultipleImages(facilityId, images);
            response.put("success", true);
            response.put("message", images.size() + "개의 이미지가 성공적으로 업로드되었습니다.");
            response.put("uploadedImages", uploadedImages);
            response.put("uploadCount", uploadedImages.size());
            log.info("✅ 시설 이미지 업로드 API 성공 - facilityId: {}, 업로드 수: {}, memberId: {}",
                    facilityId, uploadedImages.size(), member.getMemberId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ 시설 이미지 업로드 API 오류 - facilityId: {}", facilityId, e);
            response.put("success", false);
            response.put("message", "서버 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
````

## File: src/main/java/com/example/carelink/dao/FacilityImageMapper.java
````java
package com.example.carelink.dao;
import com.example.carelink.dto.FacilityImageDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
@Mapper
public interface FacilityImageMapper {
    List<FacilityImageDTO> getImagesByFacilityId(@Param("facilityId") Long facilityId);
    FacilityImageDTO getMainImageByFacilityId(@Param("facilityId") Long facilityId);
    int insertFacilityImage(FacilityImageDTO facilityImageDTO);
    int updateFacilityImage(FacilityImageDTO facilityImageDTO);
    int deleteFacilityImage(@Param("imageId") Long imageId);
    int deleteAllImagesByFacilityId(@Param("facilityId") Long facilityId);
    int countImagesByFacilityId(@Param("facilityId") Long facilityId);
    int updateMainImage(@Param("facilityId") Long facilityId, @Param("imageId") Long imageId);
    int clearMainImages(@Param("facilityId") Long facilityId);
    FacilityImageDTO getImageById(@Param("imageId") Long imageId);
    int updateImageOrder(@Param("imageId") Long imageId, @Param("imageOrder") Integer imageOrder);
}
````

## File: src/main/java/com/example/carelink/dao/ReviewMapper.java
````java
package com.example.carelink.dao;
import com.example.carelink.dto.ReviewDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
@Mapper
public interface ReviewMapper {
    List<ReviewDTO> getReviewList(ReviewDTO searchDTO);
    List<ReviewDTO> findReviewsWithSearch(ReviewDTO searchDTO);
    int countReviewsWithSearch(ReviewDTO searchDTO);
    ReviewDTO getReviewById(@Param("reviewId") Long reviewId);
    ReviewDTO findReviewById(@Param("reviewId") Long reviewId);
    int insertReview(ReviewDTO reviewDTO);
    int updateReview(ReviewDTO reviewDTO);
    int deleteReview(@Param("reviewId") Long reviewId);
    int incrementViewCount(@Param("reviewId") Long reviewId);
    int incrementLikeCount(@Param("reviewId") Long reviewId);
    int incrementDislikeCount(@Param("reviewId") Long reviewId);
    List<ReviewDTO> getReviewsByFacilityId(@Param("facilityId") Long facilityId);
    List<ReviewDTO> findReviewsByFacilityId(@Param("facilityId") Long facilityId);
    List<ReviewDTO> findReviewsByMemberId(@Param("memberId") Long memberId);
    Double getAverageRating(@Param("facilityId") Long facilityId);
    List<ReviewDTO> getRecentReviews();
    int getReviewCount(ReviewDTO searchDTO);
    int getReviewCount();
    int deleteByMemberId(@Param("memberId") Long memberId);
    int deleteByFacilityMemberId(@Param("memberId") Long memberId);
}
````

## File: src/main/java/Crolling.java
````java
import java.io.*;
import java.util.*;
public class Crolling {
    public static void main(String[] args) {
        String rootDirectory = "D:\\cch\\project_2\\LightCare\\src\\main";
        String outputFilePath = "D:/LightCare.txt";
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(outputFilePath))) {
            List<File> files = getAllFilesWithExtensions(rootDirectory, Arrays.asList(".java", ".jsp", ".xml", ".js", ".html", ".css"));
            for (File file : files) {
                System.out.println("파일 읽기: " + file.getAbsolutePath());
                writeFileContentToFile(file, writer);
            }
            System.out.println("모든 파일을 크롤링하여 " + outputFilePath + "에 저장했습니다.");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    public static List<File> getAllFilesWithExtensions(String directoryPath, List<String> extensions) {
        List<File> matchedFiles = new ArrayList<>();
        File rootDirectory = new File(directoryPath);
        File[] files = rootDirectory.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isDirectory()) {
                    matchedFiles.addAll(getAllFilesWithExtensions(file.getAbsolutePath(), extensions));
                } else {
                    for (String ext : extensions) {
                        if (file.getName().toLowerCase().endsWith(ext)) {
                            matchedFiles.add(file);
                            break;
                        }
                    }
                }
            }
        }
        return matchedFiles;
    }
    public static void writeFileContentToFile(File file, BufferedWriter writer) throws IOException {
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            writer.write("파일명: " + file.getName() + "\n");
            writer.write("경로: " + file.getAbsolutePath() + "\n");
            writer.write("----------------------------------------------------\n");
            String line;
            while ((line = reader.readLine()) != null) {
                writer.write(line + "\n");
            }
            writer.write("\n\n");
        }
    }
}
````

## File: src/main/resources/mapper/facilityImageMapper.xml
````xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.carelink.dao.FacilityImageMapper">
    <resultMap id="FacilityImageResultMap" type="com.example.carelink.dto.FacilityImageDTO">
        <id property="imageId" column="image_id"/>
        <result property="facilityId" column="facility_id"/>
        <result property="imagePath" column="image_path"/>
        <result property="imageAltText" column="image_alt_text"/>
        <result property="imageOrder" column="image_order"/>
        <result property="isMainImage" column="is_main_image"/>
        <result property="uploadDate" column="upload_date"/>
        <result property="updatedAt" column="updated_at"/>
    </resultMap>
    <select id="getImagesByFacilityId" resultMap="FacilityImageResultMap">
        SELECT
            image_id,
            facility_id,
            image_path,
            image_alt_text,
            image_order,
            is_main_image,
            upload_date,
            updated_at
        FROM facility_images
        WHERE facility_id = #{facilityId}
        ORDER BY image_order ASC, upload_date ASC
    </select>
    <select id="getMainImageByFacilityId" resultMap="FacilityImageResultMap">
        SELECT
            image_id,
            facility_id,
            image_path,
            image_alt_text,
            image_order,
            is_main_image,
            upload_date,
            updated_at
        FROM facility_images
        WHERE facility_id = #{facilityId}
        AND is_main_image = TRUE
        LIMIT 1
    </select>
    <insert id="insertFacilityImage" useGeneratedKeys="true" keyProperty="imageId">
        INSERT INTO facility_images (
            facility_id,
            image_path,
            image_alt_text,
            image_order,
            is_main_image,
            upload_date
        ) VALUES (
            #{facilityId},
            #{imagePath},
            #{imageAltText},
            #{imageOrder},
            #{isMainImage},
            NOW()
        )
    </insert>
    <update id="updateFacilityImage">
        UPDATE facility_images
        SET
            image_path = #{imagePath},
            image_alt_text = #{imageAltText},
            image_order = #{imageOrder},
            is_main_image = #{isMainImage},
            updated_at = NOW()
        WHERE image_id = #{imageId}
    </update>
    <delete id="deleteFacilityImage">
        DELETE FROM facility_images
        WHERE image_id = #{imageId}
    </delete>
    <delete id="deleteAllImagesByFacilityId">
        DELETE FROM facility_images
        WHERE facility_id = #{facilityId}
    </delete>
    <select id="countImagesByFacilityId" resultType="int">
        SELECT COUNT(*)
        FROM facility_images
        WHERE facility_id = #{facilityId}
    </select>
    <update id="clearMainImages">
        UPDATE facility_images
        SET is_main_image = FALSE, updated_at = NOW()
        WHERE facility_id = #{facilityId}
    </update>
    <update id="updateMainImage">
        UPDATE facility_images
        SET is_main_image = TRUE, updated_at = NOW()
        WHERE facility_id = #{facilityId} AND image_id = #{imageId}
    </update>
    <select id="getImageById" resultMap="FacilityImageResultMap">
        SELECT
            image_id,
            facility_id,
            image_path,
            image_alt_text,
            image_order,
            is_main_image,
            upload_date,
            updated_at
        FROM facility_images
        WHERE image_id = #{imageId}
    </select>
    <update id="updateImageOrder">
        UPDATE facility_images
        SET image_order = #{imageOrder}, updated_at = NOW()
        WHERE image_id = #{imageId}
    </update>
</mapper>
````

## File: src/main/resources/mapper/reviewMapper.xml
````xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.carelink.dao.ReviewMapper">
    <resultMap id="reviewResultMap" type="com.example.carelink.dto.ReviewDTO">
        <id property="reviewId" column="review_id"/>
        <result property="facilityId" column="facility_id"/>
        <result property="facilityName" column="facility_name"/>
        <result property="memberId" column="member_id"/>
        <result property="memberName" column="member_name"/>
        <result property="title" column="title"/>
        <result property="content" column="content"/>
        <result property="rating" column="rating"/>
        <result property="serviceRating" column="service_rating"/>
        <result property="facilityRating" column="facility_rating"/>
        <result property="staffRating" column="staff_rating"/>
        <result property="priceRating" column="price_rating"/>
        <result property="reviewImage1" column="review_image1"/>
        <result property="reviewImage2" column="review_image2"/>
        <result property="reviewImage3" column="review_image3"/>
        <result property="likeCount" column="like_count"/>
        <result property="dislikeCount" column="dislike_count"/>
        <result property="viewCount" column="view_count"/>
        <result property="isVisible" column="is_visible"/>
        <result property="status" column="status"/>
        <result property="parentReviewId" column="parent_review_id"/>
        <result property="replyCount" column="reply_count"/>
        <result property="replyDepth" column="reply_depth"/>
        <result property="createdAt" column="created_at"/>
        <result property="updatedAt" column="updated_at"/>
        <result property="isDeleted" column="is_deleted"/>
    </resultMap>
    <select id="findReviewsWithSearch" parameterType="com.example.carelink.dto.ReviewDTO" resultMap="reviewResultMap">
        SELECT
            r.*,
            m.name as member_name,
            f.facility_name
        FROM review r
        LEFT JOIN member m ON r.member_id = m.member_id
        LEFT JOIN facility f ON r.facility_id = f.facility_id
        WHERE r.is_deleted = false AND r.is_visible = true
        <if test="facilityId != null">
            AND r.facility_id = #{facilityId}
        </if>
        <if test="searchKeyword != null and searchKeyword != ''">
            AND (r.title LIKE CONCAT('%', #{searchKeyword}, '%')
                 OR r.content LIKE CONCAT('%', #{searchKeyword}, '%'))
        </if>
        <if test="minRating != null">
            AND r.rating >= #{minRating}
        </if>
        <if test="maxRating != null">
            AND r.rating &lt;= #{maxRating}
        </if>
        <choose>
            <when test="sortBy != null and sortBy == 'RATING_HIGH'">
                ORDER BY r.rating DESC, r.created_at DESC
            </when>
            <when test="sortBy != null and sortBy == 'RATING_LOW'">
                ORDER BY r.rating ASC, r.created_at DESC
            </when>
            <when test="sortBy != null and sortBy == 'LIKE_COUNT'">
                ORDER BY r.like_count DESC, r.created_at DESC
            </when>
            <otherwise>
                ORDER BY r.created_at DESC
            </otherwise>
        </choose>
        <if test="size != null and size > 0 and offset != null and offset >= 0">
            LIMIT #{size} OFFSET #{offset}
        </if>
    </select>
    <select id="countReviewsWithSearch" parameterType="com.example.carelink.dto.ReviewDTO" resultType="int">
        SELECT COUNT(*)
        FROM review r
        WHERE r.is_deleted = false AND r.is_visible = true
        <if test="facilityId != null">
            AND r.facility_id = #{facilityId}
        </if>
        <if test="searchKeyword != null and searchKeyword != ''">
            AND (r.title LIKE CONCAT('%', #{searchKeyword}, '%')
                 OR r.content LIKE CONCAT('%', #{searchKeyword}, '%'))
        </if>
        <if test="minRating != null">
            AND r.rating >= #{minRating}
        </if>
        <if test="maxRating != null">
            AND r.rating &lt;= #{maxRating}
        </if>
    </select>
    <select id="findReviewById" parameterType="long" resultMap="reviewResultMap">
        SELECT
            r.*,
            m.name as member_name,
            f.facility_name
        FROM review r
        LEFT JOIN member m ON r.member_id = m.member_id
        LEFT JOIN facility f ON r.facility_id = f.facility_id
        WHERE r.review_id = #{reviewId} AND r.is_deleted = false
    </select>
    <insert id="insertReview" parameterType="com.example.carelink.dto.ReviewDTO" useGeneratedKeys="true" keyProperty="reviewId">
        INSERT INTO review (
            facility_id, member_id, title, content, rating,
            service_rating, facility_rating, staff_rating, price_rating,
            review_image1, review_image2, review_image3,
            is_visible, status, parent_review_id, reply_depth,
            is_deleted, created_at
        ) VALUES (
            #{facilityId}, #{memberId}, #{title}, #{content}, #{rating},
            #{serviceRating}, #{facilityRating}, #{staffRating}, #{priceRating},
            #{reviewImage1}, #{reviewImage2}, #{reviewImage3},
            #{isVisible}, #{status}, #{parentReviewId}, #{replyDepth},
            #{isDeleted}, NOW()
        )
    </insert>
    <update id="updateReview" parameterType="com.example.carelink.dto.ReviewDTO">
        UPDATE review SET
            title = #{title},
            content = #{content},
            rating = #{rating},
            service_rating = #{serviceRating},
            facility_rating = #{facilityRating},
            staff_rating = #{staffRating},
            price_rating = #{priceRating},
            review_image1 = #{reviewImage1},
            review_image2 = #{reviewImage2},
            review_image3 = #{reviewImage3},
            is_visible = #{isVisible},
            status = #{status},
            updated_at = NOW()
        WHERE review_id = #{reviewId}
    </update>
    <update id="deleteReview" parameterType="long">
        UPDATE review SET
            is_deleted = true,
            updated_at = NOW()
        WHERE review_id = #{reviewId}
    </update>
    <update id="incrementViewCount" parameterType="long">
        UPDATE review SET
            view_count = view_count + 1,
            updated_at = NOW()
        WHERE review_id = #{reviewId}
    </update>
    <update id="incrementLikeCount" parameterType="long">
        UPDATE review SET
            like_count = like_count + 1,
            updated_at = NOW()
        WHERE review_id = #{reviewId}
    </update>
    <update id="incrementDislikeCount" parameterType="long">
        UPDATE review SET
            dislike_count = dislike_count + 1,
            updated_at = NOW()
        WHERE review_id = #{reviewId}
    </update>
    <select id="findReviewsByMemberId" parameterType="long" resultMap="reviewResultMap">
        SELECT
            r.*,
            m.name as member_name,
            f.facility_name
        FROM review r
        LEFT JOIN member m ON r.member_id = m.member_id
        LEFT JOIN facility f ON r.facility_id = f.facility_id
        WHERE r.member_id = #{memberId} AND r.is_deleted = false
        ORDER BY r.created_at DESC
    </select>
    <select id="findReviewsByFacilityId" parameterType="long" resultMap="reviewResultMap">
        SELECT
            r.*,
            m.name as member_name,
            f.facility_name
        FROM review r
        LEFT JOIN member m ON r.member_id = m.member_id
        LEFT JOIN facility f ON r.facility_id = f.facility_id
        WHERE r.facility_id = #{facilityId} AND r.is_deleted = false AND r.is_visible = true
        ORDER BY r.created_at DESC
    </select>
    <select id="getAverageRatingByFacilityId" parameterType="long" resultType="float">
        SELECT ROUND(AVG(rating), 1)
        FROM review
        WHERE facility_id = #{facilityId} AND is_deleted = false AND is_visible = true
    </select>
    <select id="getReviewCountByFacilityId" parameterType="long" resultType="int">
        SELECT COUNT(*)
        FROM review
        WHERE facility_id = #{facilityId} AND is_deleted = false AND is_visible = true
    </select>
    <select id="getReviewCount" resultType="int">
        SELECT COUNT(*)
        FROM review
        WHERE is_deleted = false AND is_visible = true
    </select>
    <select id="getAverageRating" parameterType="long" resultType="double">
        SELECT AVG(rating)
        FROM review
        WHERE facility_id = #{facilityId}
          AND is_deleted = false
          AND is_visible = true
    </select>
    <delete id="deleteByMemberId" parameterType="long">
        DELETE FROM review WHERE member_id = #{memberId}
    </delete>
    <delete id="deleteByFacilityMemberId" parameterType="long">
        DELETE FROM review
        WHERE facility_id IN (
            SELECT facility_id FROM facility WHERE registered_member_id = #{memberId}
        )
    </delete>
</mapper>
````

## File: src/main/java/com/example/carelink/common/BaseDTO.java
````java
package com.example.carelink.common;
import lombok.Data;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;
@Data
public class BaseDTO {
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
    private boolean isDeleted;
    private Integer page;
    private Integer pageSize;
    private Integer offset;
    private Integer size;
    public BaseDTO() {
        this.page = 1;
        this.pageSize = Constants.DEFAULT_PAGE_SIZE;
        this.offset = (this.page - 1) * this.pageSize;
        this.size = this.pageSize;
    }
}
````

## File: src/main/java/com/example/carelink/dao/MemberMapper.java
````java
package com.example.carelink.dao;
import com.example.carelink.dto.MemberDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
@Mapper
public interface MemberMapper {
    MemberDTO findByUserId(@Param("userId") String userId);
    MemberDTO findById(@Param("memberId") Long memberId);
    MemberDTO findByEmail(@Param("email") String email);
    int insertMember(MemberDTO memberDTO);
    int updateMember(MemberDTO memberDTO);
    int softDeleteMember(@Param("userId") String userId);
    int updatePassword(MemberDTO memberDTO);
    int updateLoginSuccess(@Param("memberId") Long memberId);
    int updateLoginFail(@Param("memberId") Long memberId);
    int getTotalCount();
    List<MemberDTO> findMembersWithPaging(MemberDTO searchDTO);
    List<MemberDTO> findMembersByRole(@Param("role") String role);
    void updateMemberStatus(@Param("memberId") Long memberId, @Param("isActive") boolean isActive);
    int getMemberCount();
    boolean existsByUserId(@Param("userId") String userId);
    boolean existsByEmail(@Param("email") String email);
    int anonymizeMember(@Param("userId") String userId);
    int hardDeleteMember(@Param("userId") String userId);
    int getFacilityMemberCount();
    int getUserMemberCount();
    int getMemberCountByRole(@Param("role") String role);
}
````

## File: src/main/resources/mapper/MemberMapper.xml
````xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.carelink.dao.MemberMapper">
    <resultMap id="memberResultMap" type="com.example.carelink.dto.MemberDTO">
        <id property="memberId" column="member_id"/>
        <result property="userId" column="user_id"/>
        <result property="password" column="password"/>
        <result property="name" column="name"/>
        <result property="email" column="email"/>
        <result property="phone" column="phone"/>
        <result property="role" column="role"/>
        <result property="address" column="address"/>
        <result property="detailAddress" column="detail_address"/>
        <result property="profileImage" column="profile_image"/>
        <result property="profileImageAltText" column="profile_image_alt_text"/>
        <result property="isActive" column="is_active"/>
        <result property="loginFailCount" column="login_fail_count"/>
        <result property="lastLoginAt" column="last_login_at"/>
        <result property="createdAt" column="created_at"/>
        <result property="updatedAt" column="updated_at"/>
        <result property="isDeleted" column="is_deleted"/>
    </resultMap>
    <select id="findByUserId" resultMap="memberResultMap">
        SELECT *
        FROM member
        WHERE user_id = #{userId}
          AND is_deleted = false
    </select>
    <select id="findById" resultMap="memberResultMap">
        SELECT *
        FROM member
        WHERE member_id = #{memberId}
          AND is_deleted = false
    </select>
    <select id="findByEmail" resultMap="memberResultMap">
        SELECT *
        FROM member
        WHERE email = #{email}
          AND is_deleted = false
    </select>
    <insert id="insertMember" parameterType="com.example.carelink.dto.MemberDTO" useGeneratedKeys="true" keyProperty="memberId">
        INSERT INTO member (
        member_id,
        user_id,
        password,
        name,
        email,
        phone,
        role,
        address,
        detail_address,
        profile_image,
        is_active,
        login_fail_count,
        last_login_at,
        is_deleted
        ) VALUES (
        #{memberId},
        #{userId, jdbcType=VARCHAR},
        #{password, jdbcType=VARCHAR},
        #{name, jdbcType=VARCHAR},
        #{email, jdbcType=VARCHAR},
        #{phone, jdbcType=VARCHAR},
        #{role, jdbcType=VARCHAR},
        #{address, jdbcType=VARCHAR},
        #{detailAddress, jdbcType=VARCHAR},
        #{profileImage, jdbcType=VARCHAR},
        #{isActive, jdbcType=BOOLEAN},
        #{loginFailCount, jdbcType=INTEGER},
        #{lastLoginAt, jdbcType=TIMESTAMP},
        #{isDeleted, jdbcType=BOOLEAN}
        )
    </insert>
    <select id="existsByUserId" resultType="boolean">
        SELECT COUNT(*) > 0 FROM member WHERE user_id = #{userId}
    </select>
    <select id="existsByEmail" resultType="boolean">
        SELECT COUNT(*) > 0 FROM member WHERE email = #{email}
    </select>
    <update id="updateMember" parameterType="MemberDTO">
        UPDATE member
        SET
            name = #{name},
            email = #{email},
            phone = #{phone},
            address = #{address},
            detail_address = #{detailAddress},
            profile_image = #{profileImage},
            profile_image_alt_text = #{profileImageAltText},
            updated_at = NOW()
        WHERE member_id = #{memberId}
    </update>
    <update id="softDeleteMember">
        UPDATE member
        SET
            is_deleted = TRUE,
            is_active = FALSE,
            updated_at = NOW()
        WHERE user_id = #{userId}
    </update>
    <update id="anonymizeMember">
        UPDATE member
        SET
            name = '탈퇴회원',
            email = NULL,
            phone = NULL,
            address = NULL,
            profile_image = NULL,
            password = 'DELETED',
            is_deleted = TRUE,
            is_active = FALSE,
            updated_at = NOW()
        WHERE user_id = #{userId}
    </update>
    <delete id="hardDeleteMember">
        DELETE FROM member WHERE user_id = #{userId}
    </delete>
    <update id="updatePassword" parameterType="MemberDTO">
        UPDATE member
        SET
            password = #{password},
            updated_at = NOW()
        WHERE member_id = #{memberId}
    </update>
    <update id="updateLoginSuccess">
        UPDATE member
        SET login_fail_count = 0,
            last_login_at = NOW(),
            updated_at = NOW()
        WHERE member_id = #{memberId}
    </update>
    <update id="updateLoginFail">
        UPDATE member
        SET login_fail_count = login_fail_count + 1,
            updated_at = NOW()
        WHERE member_id = #{memberId}
    </update>
    <select id="getTotalCount" resultType="int">
        SELECT COUNT(*)
        FROM member
        WHERE is_deleted = FALSE
    </select>
    <select id="findMembersWithPaging" resultMap="memberResultMap">
        SELECT *
        FROM member
        WHERE is_deleted = FALSE
        <if test="role != null and !role.isEmpty()">
            AND role = #{role}
        </if>
        ORDER BY created_at DESC
        LIMIT #{pageSize} OFFSET #{offset}
    </select>
    <select id="findMembersByRole" resultMap="memberResultMap">
        SELECT *
        FROM member
        WHERE is_deleted = FALSE
        <if test="role != null and role != ''">
            AND role = #{role}
        </if>
        ORDER BY created_at DESC
    </select>
    <update id="updateMemberStatus">
        UPDATE member
        SET is_active = #{isActive},
            updated_at = NOW()
        WHERE member_id = #{memberId}
    </update>
    <select id="getMemberCount" resultType="int">
        SELECT COUNT(*)
        FROM member
        WHERE is_deleted = false AND is_active = true
    </select>
    <select id="getFacilityMemberCount" resultType="int">
        SELECT COUNT(*)
        FROM member
        WHERE is_deleted = false
        AND role = 'FACILITY'
    </select>
    <select id="getUserMemberCount" resultType="int">
        SELECT COUNT(*)
        FROM member
        WHERE is_deleted = false
        AND role = 'USER'
    </select>
    <select id="getMemberCountByRole" resultType="int">
        SELECT COUNT(*)
        FROM member
        WHERE is_deleted = false
        <if test="role != null and role != ''">
            AND role = #{role}
        </if>
    </select>
</mapper>
````

## File: src/main/java/com/example/carelink/dao/BoardMapper.java
````java
package com.example.carelink.dao;
import com.example.carelink.dto.BoardDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
@Mapper
public interface BoardMapper {
    List<BoardDTO> getBoardList(BoardDTO searchDTO);
    BoardDTO getBoardById(@Param("boardId") Long boardId);
    BoardDTO getBoardByIdIncludeDeleted(@Param("boardId") Long boardId);
    int insertBoard(BoardDTO boardDTO);
    int updateBoard(BoardDTO boardDTO);
    int deleteBoard(@Param("boardId") Long boardId);
    void increaseViewCount(@Param("boardId") Long boardId);
    void incrementViewCount(@Param("boardId") Long boardId);
    List<BoardDTO> getPopularBoards();
    List<BoardDTO> getBoardsByCategory(@Param("category") String category);
    int getBoardCount(BoardDTO searchDTO);
    List<BoardDTO> getPopularBoardsByCategory(@Param("category") String category);
    void incrementLikeCount(@Param("boardId") Long boardId);
    void decrementLikeCount(@Param("boardId") Long boardId);
    BoardDTO getPreviousBoard(@Param("boardId") Long boardId);
    BoardDTO getNextBoard(@Param("boardId") Long boardId);
    List<BoardDTO> findBoardsByMemberId(@Param("memberId") Long memberId);
    int deleteByMemberId(@Param("memberId") Long memberId);
}
````

## File: src/main/java/com/example/carelink/dao/FacilityMapper.java
````java
package com.example.carelink.dao;
import com.example.carelink.dto.FacilityDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
@Mapper
public interface FacilityMapper {
    List<FacilityDTO> searchFacilities(FacilityDTO searchDTO);
    FacilityDTO getFacilityById(@Param("facilityId") Long facilityId);
    List<FacilityDTO> getAllFacilities();
    List<FacilityDTO> getAllActiveFacilities();
    int insertFacility(FacilityDTO facilityDTO);
    int updateFacility(FacilityDTO facilityDTO);
    int deleteFacility(@Param("facilityId") Long facilityId);
    int countFacilitiesByRegion(@Param("region") String region);
    int getFacilityCount();
    int deleteByMemberId(@Param("memberId") Long memberId);
    List<FacilityDTO> getFacilitiesByMemberId(@Param("memberId") Long memberId);
    FacilityDTO getFacilityByMemberId(@Param("memberId") Long memberId);
    int updateFacilityMainImage(@Param("facilityId") Long facilityId,
                               @Param("mainImagePath") String mainImagePath,
                               @Param("imageCount") Integer imageCount);
    List<FacilityDTO> getFacilitiesByApprovalStatus(@Param("approvalStatus") String approvalStatus);
    int updateFacilityApprovalStatus(@Param("facilityId") Long facilityId,
                                   @Param("approvalStatus") String approvalStatus,
                                   @Param("rejectionReason") String rejectionReason);
    int countFacilitiesByStatus(@Param("approvalStatus") String approvalStatus);
}
````

## File: src/main/java/com/example/carelink/dao/JobMapper.java
````java
package com.example.carelink.dao;
import com.example.carelink.dto.JobDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
@Mapper
public interface JobMapper {
    List<JobDTO> findJobsWithSearch(JobDTO searchDTO);
    List<JobDTO> getJobList(JobDTO searchDTO);
    JobDTO findJobById(@Param("jobId") Long jobId);
    int insertJob(JobDTO jobDTO);
    int updateJob(JobDTO jobDTO);
    int deleteJob(@Param("jobId") Long jobId);
    List<JobDTO> getPopularJobs();
    List<JobDTO> searchJobs(JobDTO searchDTO);
    int countJobsWithSearch(JobDTO searchDTO);
    int getJobCount();
    void incrementApplyCount(@Param("jobId") Long jobId);
    List<JobDTO> findJobsByMemberId(@Param("memberId") Long memberId);
    int deleteByMemberId(@Param("memberId") Long memberId);
    int deleteByFacilityMemberId(@Param("memberId") Long memberId);
}
````

## File: src/main/java/com/example/carelink/dto/BoardDTO.java
````java
package com.example.carelink.dto;
import com.example.carelink.common.BaseDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;
@Data
@EqualsAndHashCode(callSuper = true)
public class BoardDTO extends BaseDTO {
    private Long boardId;
    @NotBlank(message = "게시판 유형은 필수입니다")
    private String boardType;
    @NotBlank(message = "제목은 필수입니다")
    private String title;
    @NotBlank(message = "내용은 필수입니다")
    private String content;
    @NotNull(message = "작성자 정보는 필수입니다")
    private Long memberId;
    private String memberName;
    private String author;
    private Integer viewCount;
    private Integer likeCount;
    private Integer commentCount;
    private String attachmentPath;
    private String attachmentName;
    private Long attachmentSize;
    private Boolean isNotice;
    private Boolean isSecret;
    private Boolean isActive;
    private Boolean isDeleted;
    private String status;
    private String category;
    private String subCategory;
    private Integer priority = 1;
    private Boolean isPinned;
    private Long parentBoardId;
    private Integer replyDepth;
    private Integer replyOrder;
    private String qaType;
    private Boolean isAnswered;
    private Integer answerCount;
    private String searchKeyword;
    private String searchType;
    private String searchCategory;
    private String sortBy;
    private String sortOrder;
    private String tags;
    private String metaDescription;
    private String metaKeywords;
    private Integer page = 1;
    private Integer size = 10;
    private Integer offset = 0;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    public void setAuthor(String author) {
        this.author = (this.memberName != null && !this.memberName.isEmpty()) ? this.memberName : author;
    }
    public String getAuthor() {
        return (this.memberName != null && !this.memberName.isEmpty()) ? this.memberName : this.author;
    }
    public boolean getIsNew() {
        if (this.getCreatedAt() == null) return false;
        return this.getCreatedAt().isAfter(java.time.LocalDateTime.now().minusDays(1));
    }
    public boolean getIsHot() {
        return (this.viewCount != null && this.viewCount >= 100) ||
               (this.likeCount != null && this.likeCount >= 10);
    }
    public boolean getHasComments() {
        return this.commentCount != null && this.commentCount > 0;
    }
}
````

## File: src/main/java/com/example/carelink/service/BoardService.java
````java
package com.example.carelink.service;
import com.example.carelink.common.PageInfo;
import com.example.carelink.dao.BoardMapper;
import com.example.carelink.dto.BoardDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
@Slf4j
@Service
@RequiredArgsConstructor
public class BoardService {
    private final BoardMapper boardMapper;
    private static final int DEFAULT_PAGE_SIZE = 10;
    public PageInfo<BoardDTO> getBoardList(int page, String keyword, String category) {
        log.info("게시글 목록 조회 시작 - page: {}, keyword: {}, category: {}", page, keyword, category);
        try {
            BoardDTO searchDTO = new BoardDTO();
            searchDTO.setPage(page);
            searchDTO.setSize(DEFAULT_PAGE_SIZE);
            searchDTO.setOffset((page - 1) * DEFAULT_PAGE_SIZE);
            if (keyword != null && !keyword.trim().isEmpty()) {
                searchDTO.setSearchKeyword(keyword.trim());
            }
            if (category != null && !category.trim().isEmpty() && !"all".equals(category)) {
                searchDTO.setCategory(category.trim());
            }
            log.info("검색 조건 - searchDTO: page={}, size={}, offset={}, keyword={}, category={}",
                searchDTO.getPage(), searchDTO.getSize(), searchDTO.getOffset(),
                searchDTO.getSearchKeyword(), searchDTO.getCategory());
            int totalCount = boardMapper.getBoardCount(searchDTO);
            log.info("전체 게시글 수: {}", totalCount);
            List<BoardDTO> boardList = boardMapper.getBoardList(searchDTO);
            log.info("조회된 게시글 수: {}", boardList != null ? boardList.size() : 0);
            if (boardList != null && !boardList.isEmpty()) {
                log.info("첫 번째 게시글 정보 - ID: {}, 제목: {}, 작성자: {}, is_active: {}, is_deleted: {}",
                    boardList.get(0).getBoardId(),
                    boardList.get(0).getTitle(),
                    boardList.get(0).getMemberName(),
                    boardList.get(0).getIsActive(),
                    boardList.get(0).getIsDeleted());
            } else {
                log.warn("조회된 게시글이 없습니다.");
            }
            PageInfo<BoardDTO> pageInfo = new PageInfo<>(boardList, page, DEFAULT_PAGE_SIZE, totalCount);
            log.info("페이징 정보 - 현재페이지: {}, 전체페이지: {}, 전체건수: {}",
                pageInfo.getCurrentPage(), pageInfo.getTotalPages(), pageInfo.getTotalCount());
            return pageInfo;
        } catch (Exception e) {
            log.error("게시글 목록 조회 중 오류 발생", e);
            throw new RuntimeException("게시글 목록을 불러오는 중 오류가 발생했습니다.", e);
        }
    }
    @Transactional
    public BoardDTO getBoardById(Long id) {
        log.info("게시글 상세 조회 시작 - boardId: {}", id);
        try {
            BoardDTO board = boardMapper.getBoardById(id);
            if (board == null) {
                throw new RuntimeException("해당 게시글을 찾을 수 없습니다. ID: " + id);
            }
            log.info("게시글 상세 조회 완료 - boardId: {}, title: {}", id, board.getTitle());
            return board;
        } catch (Exception e) {
            log.error("게시글 상세 조회 중 오류 발생 - boardId: {}", id, e);
            throw new RuntimeException("게시글 상세 정보를 불러오는 중 오류가 발생했습니다.", e);
        }
    }
    public BoardDTO getBoardByIdIncludeDeleted(Long id) {
        log.info("게시글 상세 조회 (삭제 포함) 시작 - boardId: {}", id);
        try {
            BoardDTO board = boardMapper.getBoardByIdIncludeDeleted(id);
            if (board != null) {
                log.info("📄 게시글 조회 성공 (삭제 포함) - boardId: {}, title: {}", id, board.getTitle());
                log.info("   🔍 DB에서 조회된 isDeleted 원본값: {}", board.getIsDeleted());
                log.info("   🔍 isDeleted null 체크: {}", board.getIsDeleted() == null ? "NULL" : "NOT NULL");
                if (board.getIsDeleted() != null) {
                    log.info("   🔍 isDeleted boolean 값: {} ({})", board.getIsDeleted(),
                        board.getIsDeleted() ? "삭제됨" : "정상");
                }
            } else {
                log.warn("존재하지 않는 게시글 조회 시도 (삭제 포함) - boardId: {}", id);
            }
            return board;
        } catch (Exception e) {
            log.error("게시글 상세 조회 (삭제 포함) 중 오류 발생 - boardId: {}", id, e);
            throw new RuntimeException("게시글을 불러오는 중 오류가 발생했습니다.", e);
        }
    }
    @Transactional
    public int insertBoard(BoardDTO boardDTO) {
        log.info("게시글 등록 시작 - title: {}, memberId: {}", boardDTO.getTitle(), boardDTO.getMemberId());
        try {
            validateBoardData(boardDTO);
            if (boardDTO.getStatus() == null) {
                boardDTO.setStatus("ACTIVE");
            }
            if (boardDTO.getPriority() == null) {
                boardDTO.setPriority(0);
            }
            if (boardDTO.getReplyDepth() == null) {
                boardDTO.setReplyDepth(0);
            }
            if (boardDTO.getReplyOrder() == null) {
                boardDTO.setReplyOrder(0);
            }
            if (boardDTO.getIsNotice() == null) {
                boardDTO.setIsNotice(false);
            }
            if (boardDTO.getIsSecret() == null) {
                boardDTO.setIsSecret(false);
            }
            if (boardDTO.getIsActive() == null) {
                boardDTO.setIsActive(true);
            }
            if (boardDTO.getIsDeleted() == null) {
                boardDTO.setIsDeleted(false);
            }
            if (boardDTO.getIsPinned() == null) {
                boardDTO.setIsPinned(false);
            }
            if (boardDTO.getCategory() != null && "NOTICE".equals(boardDTO.getCategory())) {
                boardDTO.setIsNotice(true);
            }
            if (boardDTO.getBoardType() == null) {
                String category = boardDTO.getCategory();
                if ("NOTICE".equals(category)) {
                    boardDTO.setBoardType("NOTICE");
                } else if ("INFO".equals(category)) {
                    boardDTO.setBoardType("INFO");
                } else if ("QNA".equals(category)) {
                    boardDTO.setBoardType("QNA");
                } else if ("FAQ".equals(category)) {
                    boardDTO.setBoardType("FAQ");
                } else {
                    boardDTO.setBoardType("GENERAL");
                }
            }
            log.info("📝 등록 전 상태 확인 - isDeleted: {}, isActive: {}",
                boardDTO.getIsDeleted(), boardDTO.getIsActive());
            int result = boardMapper.insertBoard(boardDTO);
            log.info("✅ 게시글 등록 완료 - boardId: {}", boardDTO.getBoardId());
            if (boardDTO.getBoardId() != null) {
                BoardDTO savedBoard = boardMapper.getBoardByIdIncludeDeleted(boardDTO.getBoardId());
                if (savedBoard != null) {
                    log.info("🔍 등록 직후 DB 상태 확인 - boardId: {}, isDeleted: {}, isActive: {}",
                        savedBoard.getBoardId(), savedBoard.getIsDeleted(), savedBoard.getIsActive());
                } else {
                    log.warn("⚠️ 등록 직후 게시글을 찾을 수 없습니다. boardId: {}", boardDTO.getBoardId());
                }
            }
            return result;
        } catch (Exception e) {
            log.error("게시글 등록 중 오류 발생", e);
            throw new RuntimeException("게시글 등록 중 오류가 발생했습니다.", e);
        }
    }
    @Transactional
    public int updateBoard(BoardDTO boardDTO) {
        log.info("게시글 수정 시작 - boardId: {}, title: {}", boardDTO.getBoardId(), boardDTO.getTitle());
        try {
            BoardDTO existingBoard = boardMapper.getBoardByIdIncludeDeleted(boardDTO.getBoardId());
            if (existingBoard == null) {
                throw new RuntimeException("수정할 게시글을 찾을 수 없습니다. ID: " + boardDTO.getBoardId());
            }
            validateBoardData(boardDTO);
            if (boardDTO.getPriority() == null) {
                boardDTO.setPriority(1);
            }
            int result = boardMapper.updateBoard(boardDTO);
            log.info("게시글 수정 완료 - boardId: {}", boardDTO.getBoardId());
            return result;
        } catch (Exception e) {
            log.error("게시글 수정 중 오류 발생 - boardId: {}", boardDTO.getBoardId(), e);
            throw new RuntimeException("게시글 수정 중 오류가 발생했습니다.", e);
        }
    }
    @Transactional
    public Map<String, Object> deleteBoard(Long id) {
        log.info("게시글 삭제 시작 - boardId: {}", id);
        Map<String, Object> result = new HashMap<>();
        try {
            BoardDTO existingBoard = boardMapper.getBoardByIdIncludeDeleted(id);
            if (existingBoard == null) {
                log.warn("삭제 요청된 게시글을 찾을 수 없습니다. ID: {}", id);
                result.put("success", false);
                result.put("code", "NOT_FOUND");
                result.put("message", "게시글을 찾을 수 없습니다.");
                return result;
            }
            log.info("🔍 게시글 상태 확인 - boardId: {}", id);
            log.info("   - title: {}", existingBoard.getTitle());
            log.info("   - isDeleted 값: {}", existingBoard.getIsDeleted());
            log.info("   - isDeleted 타입: {}", existingBoard.getIsDeleted() != null ? existingBoard.getIsDeleted().getClass().getSimpleName() : "null");
            log.info("🔍 삭제 상태 상세 분석:");
            log.info("   - isDeleted 원본값: {}", existingBoard.getIsDeleted());
            log.info("   - isDeleted == null: {}", existingBoard.getIsDeleted() == null);
            log.info("   - isDeleted != null: {}", existingBoard.getIsDeleted() != null);
            if (existingBoard.getIsDeleted() != null) {
                log.info("   - isDeleted.booleanValue(): {}", existingBoard.getIsDeleted().booleanValue());
                log.info("   - Boolean.TRUE.equals(isDeleted): {}", Boolean.TRUE.equals(existingBoard.getIsDeleted()));
            }
            boolean isAlreadyDeleted = existingBoard.getIsDeleted() != null && existingBoard.getIsDeleted();
            log.info("🔍 최종 삭제 판정: {}", isAlreadyDeleted);
            if (isAlreadyDeleted) {
                log.info("❌ 이미 삭제된 게시글입니다. boardId: {}, isDeleted: {}", id, existingBoard.getIsDeleted());
                result.put("success", false);
                result.put("code", "ALREADY_DELETED");
                result.put("message", "이미 삭제된 게시글입니다.");
                return result;
            }
            log.info("✅ 삭제 가능한 게시글입니다. boardId: {}, isDeleted: {}", id, existingBoard.getIsDeleted());
            int deleteResult = boardMapper.deleteBoard(id);
            if (deleteResult > 0) {
                log.info("게시글 삭제 완료 - boardId: {}, 영향받은 행: {}", id, deleteResult);
                result.put("success", true);
                result.put("code", "DELETED");
                result.put("message", "게시글이 삭제되었습니다.");
            } else {
                log.warn("게시글 삭제 실패 - boardId: {}, 영향받은 행: {}", id, deleteResult);
                result.put("success", false);
                result.put("code", "DELETE_FAILED");
                result.put("message", "게시글 삭제에 실패했습니다.");
            }
            return result;
        } catch (Exception e) {
            log.error("게시글 삭제 중 오류 발생 - boardId: {}", id, e);
            result.put("success", false);
            result.put("code", "ERROR");
            result.put("message", "게시글 삭제 중 오류가 발생했습니다: " + e.getMessage());
            return result;
        }
    }
    @Transactional
    public void incrementViewCount(Long id) {
        log.info("조회수 증가 시작 - boardId: {}", id);
        try {
            boardMapper.incrementViewCount(id);
            log.info("조회수 증가 완료 - boardId: {}", id);
        } catch (Exception e) {
            log.warn("조회수 증가 중 오류 발생 - boardId: {} (무시하고 진행)", id, e);
        }
    }
    public List<BoardDTO> getPopularBoards() {
        log.info("인기 게시글 목록 조회 시작");
        try {
            List<BoardDTO> popularBoards = boardMapper.getPopularBoards();
            log.info("인기 게시글 목록 조회 완료 - 조회된 건수: {}", popularBoards.size());
            return popularBoards;
        } catch (Exception e) {
            log.error("인기 게시글 목록 조회 중 오류 발생", e);
            throw new RuntimeException("인기 게시글을 불러오는 중 오류가 발생했습니다.", e);
        }
    }
    public List<BoardDTO> getBoardsByCategory(String category) {
        log.info("카테고리별 게시글 목록 조회 시작 - category: {}", category);
        try {
            List<BoardDTO> boards = boardMapper.getBoardsByCategory(category);
            log.info("카테고리별 게시글 목록 조회 완료 - category: {}, 조회된 건수: {}", category, boards.size());
            return boards;
        } catch (Exception e) {
            log.error("카테고리별 게시글 목록 조회 중 오류 발생 - category: {}", category, e);
            throw new RuntimeException("카테고리별 게시글을 불러오는 중 오류가 발생했습니다.", e);
        }
    }
    public List<BoardDTO> getNoticeBoards() {
        log.info("공지사항 목록 조회 시작");
        try {
            BoardDTO searchDTO = new BoardDTO();
            searchDTO.setCategory("NOTICE");
            searchDTO.setSize(5);
            searchDTO.setPage(1);
            List<BoardDTO> notices = boardMapper.getBoardList(searchDTO);
            log.info("공지사항 목록 조회 완료 - 조회된 건수: {}", notices.size());
            return notices;
        } catch (Exception e) {
            log.error("공지사항 목록 조회 중 오류 발생", e);
            throw new RuntimeException("공지사항을 불러오는 중 오류가 발생했습니다.", e);
        }
    }
    private void validateBoardData(BoardDTO boardDTO) {
        if (boardDTO.getMemberId() == null) {
            throw new IllegalArgumentException("작성자 ID는 필수입니다.");
        }
        if (boardDTO.getTitle() == null || boardDTO.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("게시글 제목은 필수입니다.");
        }
        if (boardDTO.getContent() == null || boardDTO.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("게시글 내용은 필수입니다.");
        }
        if (boardDTO.getTitle().length() > 200) {
            throw new IllegalArgumentException("게시글 제목은 200자를 초과할 수 없습니다.");
        }
    }
    public List<BoardDTO> getPopularBoardsByCategory(String category) {
        log.info("카테고리별 인기 게시글 목록 조회 시작 - category: {}", category);
        try {
            List<BoardDTO> popularBoards;
            if (category == null || category.trim().isEmpty()) {
                popularBoards = boardMapper.getPopularBoards();
            } else {
                popularBoards = boardMapper.getPopularBoardsByCategory(category);
            }
            log.info("카테고리별 인기 게시글 목록 조회 완료 - 조회된 건수: {}", popularBoards.size());
            return popularBoards;
        } catch (Exception e) {
            log.error("카테고리별 인기 게시글 목록 조회 중 오류 발생", e);
            throw new RuntimeException("인기 게시글을 불러오는 중 오류가 발생했습니다.", e);
        }
    }
    public BoardDTO getPreviousBoard(Long currentId) {
        log.info("이전 게시글 조회 시작 - currentId: {}", currentId);
        try {
            BoardDTO prevBoard = boardMapper.getPreviousBoard(currentId);
            log.info("이전 게시글 조회 완료 - prevBoardId: {}", prevBoard != null ? prevBoard.getBoardId() : "없음");
            return prevBoard;
        } catch (Exception e) {
            log.error("이전 게시글 조회 중 오류 발생", e);
            return null;
        }
    }
    public BoardDTO getNextBoard(Long currentId) {
        log.info("다음 게시글 조회 시작 - currentId: {}", currentId);
        try {
            BoardDTO nextBoard = boardMapper.getNextBoard(currentId);
            log.info("다음 게시글 조회 완료 - nextBoardId: {}", nextBoard != null ? nextBoard.getBoardId() : "없음");
            return nextBoard;
        } catch (Exception e) {
            log.error("다음 게시글 조회 중 오류 발생", e);
            return null;
        }
    }
    @Transactional
    public void incrementLikeCount(Long id) {
        log.info("게시글 추천수 증가 시작 - boardId: {}", id);
        try {
            boardMapper.incrementLikeCount(id);
            log.info("게시글 추천수 증가 완료 - boardId: {}", id);
        } catch (Exception e) {
            log.error("게시글 추천수 증가 중 오류 발생 - boardId: {}", id, e);
            throw new RuntimeException("추천 처리 중 오류가 발생했습니다.", e);
        }
    }
    @Transactional
    public void decrementLikeCount(Long id) {
        log.info("게시글 추천수 감소 시작 - boardId: {}", id);
        try {
            boardMapper.decrementLikeCount(id);
            log.info("게시글 추천수 감소 완료 - boardId: {}", id);
        } catch (Exception e) {
            log.error("게시글 추천수 감소 중 오류 발생 - boardId: {}", id, e);
            throw new RuntimeException("추천 취소 처리 중 오류가 발생했습니다.", e);
        }
    }
    public int getBoardCount() {
        log.info("전체 게시글 수 조회 시작");
        try {
            BoardDTO searchDTO = new BoardDTO();
            int count = boardMapper.getBoardCount(searchDTO);
            log.info("전체 게시글 수 조회 완료 - 총 {}건", count);
            return count;
        } catch (Exception e) {
            log.error("전체 게시글 수 조회 중 오류 발생", e);
            return 0;
        }
    }
}
````

## File: src/main/resources/mapper/boardMapper.xml
````xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.carelink.dao.BoardMapper">
    <resultMap id="boardResultMap" type="com.example.carelink.dto.BoardDTO">
        <id property="boardId" column="board_id"/>
        <result property="boardType" column="board_type"/>
        <result property="title" column="title"/>
        <result property="content" column="content"/>
        <result property="memberId" column="member_id"/>
        <result property="memberName" column="member_name"/>
        <result property="viewCount" column="view_count"/>
        <result property="likeCount" column="like_count"/>
        <result property="commentCount" column="comment_count"/>
        <result property="attachmentPath" column="attachment_path"/>
        <result property="attachmentName" column="attachment_name"/>
        <result property="attachmentSize" column="attachment_size"/>
        <result property="isNotice" column="is_notice"/>
        <result property="isSecret" column="is_secret"/>
        <result property="isDeleted" column="is_deleted"/>
        <result property="status" column="status"/>
        <result property="category" column="category"/>
        <result property="subCategory" column="sub_category"/>
        <result property="priority" column="priority"/>
        <result property="isPinned" column="is_pinned"/>
        <result property="parentBoardId" column="parent_board_id"/>
        <result property="replyDepth" column="reply_depth"/>
        <result property="replyOrder" column="reply_order"/>
        <result property="tags" column="tags"/>
        <result property="metaDescription" column="meta_description"/>
        <result property="metaKeywords" column="meta_keywords"/>
        <result property="createdAt" column="created_at"/>
        <result property="updatedAt" column="updated_at"/>
    </resultMap>
    <select id="getBoardList" parameterType="com.example.carelink.dto.BoardDTO" resultType="com.example.carelink.dto.BoardDTO">
        SELECT
            b.board_id,
            b.board_type,
            b.title,
            b.content,
            b.member_id,
            m.name as member_name,
            b.view_count,
            b.like_count,
            b.comment_count,
            b.is_notice,
            b.is_secret,
            COALESCE(b.is_active, true) as is_active,
            COALESCE(b.is_deleted, false) as is_deleted,
            b.status,
            b.category,
            b.sub_category,
            b.priority,
            b.is_pinned,
            b.tags,
            b.created_at,
            b.updated_at
        FROM
            board b
            LEFT JOIN member m ON b.member_id = m.member_id
        WHERE
            COALESCE(b.is_active, true) = true
            AND COALESCE(b.is_deleted, false) = false
            <if test="searchKeyword != null and searchKeyword != ''">
                AND (b.title LIKE CONCAT('%', #{searchKeyword}, '%') OR b.content LIKE CONCAT('%', #{searchKeyword}, '%'))
            </if>
            <if test="category != null and category != ''">
                AND b.category = #{category}
            </if>
        ORDER BY
            b.is_notice DESC,
            b.created_at DESC
        LIMIT #{size} OFFSET #{offset}
    </select>
    <select id="getBoardCount" parameterType="com.example.carelink.dto.BoardDTO" resultType="int">
        SELECT COUNT(*)
        FROM
            board b
            LEFT JOIN member m ON b.member_id = m.member_id
        WHERE
            COALESCE(b.is_active, true) = true
            AND COALESCE(b.is_deleted, false) = false
            <if test="searchKeyword != null and searchKeyword != ''">
                AND (b.title LIKE CONCAT('%', #{searchKeyword}, '%') OR b.content LIKE CONCAT('%', #{searchKeyword}, '%'))
            </if>
            <if test="category != null and category != ''">
                AND b.category = #{category}
            </if>
    </select>
    <select id="getBoardById" parameterType="long" resultType="com.example.carelink.dto.BoardDTO">
        SELECT
            b.board_id,
            b.board_type,
            b.title,
            b.content,
            b.member_id,
            m.name as member_name,
            b.view_count,
            b.like_count,
            b.comment_count,
            b.attachment_path,
            b.attachment_name,
            b.attachment_size,
            b.is_notice,
            b.is_secret,
            COALESCE(b.is_active, true) as is_active,
            COALESCE(b.is_deleted, false) as is_deleted,
            b.status,
            b.category,
            b.sub_category,
            b.priority,
            b.is_pinned,
            b.parent_board_id,
            b.reply_depth,
            b.reply_order,
            b.tags,
            b.meta_description,
            b.meta_keywords,
            b.created_at,
            b.updated_at
        FROM
            board b
            LEFT JOIN member m ON b.member_id = m.member_id
        WHERE
            b.board_id = #{boardId}
            AND COALESCE(b.is_active, true) = true
            AND COALESCE(b.is_deleted, false) = false
    </select>
    <select id="getBoardByIdIncludeDeleted" parameterType="long" resultType="com.example.carelink.dto.BoardDTO">
        SELECT
            b.board_id,
            b.board_type,
            b.title,
            b.content,
            b.member_id,
            m.name as member_name,
            b.view_count,
            b.like_count,
            b.comment_count,
            b.attachment_path,
            b.attachment_name,
            b.attachment_size,
            b.is_notice,
            b.is_secret,
            COALESCE(b.is_active, true) as is_active,
            COALESCE(b.is_deleted, false) as is_deleted,
            b.status,
            b.category,
            b.sub_category,
            b.priority,
            b.is_pinned,
            b.parent_board_id,
            b.reply_depth,
            b.reply_order,
            b.tags,
            b.meta_description,
            b.meta_keywords,
            b.created_at,
            b.updated_at
        FROM
            board b
            LEFT JOIN member m ON b.member_id = m.member_id
        WHERE
            b.board_id = #{boardId}
    </select>
    <insert id="insertBoard" parameterType="com.example.carelink.dto.BoardDTO" useGeneratedKeys="true" keyProperty="boardId">
        INSERT INTO board (
            board_type,
            title,
            content,
            member_id,
            attachment_path,
            attachment_name,
            attachment_size,
            is_notice,
            is_secret,
            is_active,
            is_deleted,
            category,
            sub_category,
            priority,
            is_pinned,
            parent_board_id,
            reply_depth,
            reply_order,
            tags,
            meta_description,
            meta_keywords,
            created_at,
            updated_at
        ) VALUES (
            #{boardType},
            #{title},
            #{content},
            #{memberId},
            #{attachmentPath},
            #{attachmentName},
            #{attachmentSize},
            #{isNotice},
            #{isSecret},
            #{isActive},
            #{isDeleted},
            #{category},
            #{subCategory},
            COALESCE(#{priority}, 1),
            #{isPinned},
            #{parentBoardId},
            #{replyDepth},
            #{replyOrder},
            #{tags},
            #{metaDescription},
            #{metaKeywords},
            NOW(),
            NOW()
        )
    </insert>
    <update id="updateBoard" parameterType="com.example.carelink.dto.BoardDTO">
        UPDATE board
        SET
            board_type = #{boardType},
            title = #{title},
            content = #{content},
            attachment_path = #{attachmentPath},
            attachment_name = #{attachmentName},
            attachment_size = #{attachmentSize},
            is_notice = #{isNotice},
            is_secret = #{isSecret},
            category = #{category},
            sub_category = #{subCategory},
            priority = COALESCE(#{priority}, 1),
            is_pinned = #{isPinned},
            tags = #{tags},
            meta_description = #{metaDescription},
            meta_keywords = #{metaKeywords},
            updated_at = NOW()
        WHERE
            board_id = #{boardId}
    </update>
    <update id="deleteBoard" parameterType="long">
        UPDATE board
        SET
            is_deleted = true,
            updated_at = NOW()
        WHERE
            board_id = #{boardId}
            AND COALESCE(is_deleted, false) = false
    </update>
    <update id="incrementViewCount" parameterType="long">
        UPDATE board
        SET
            view_count = view_count + 1,
            updated_at = NOW()
        WHERE
            board_id = #{boardId}
            AND COALESCE(is_active, true) = true
            AND COALESCE(is_deleted, false) = false
    </update>
    <update id="increaseViewCount" parameterType="long">
        UPDATE board
        SET
            view_count = view_count + 1,
            updated_at = NOW()
        WHERE
            board_id = #{boardId}
            AND COALESCE(is_active, true) = true
            AND COALESCE(is_deleted, false) = false
    </update>
    <select id="getPopularBoards" resultType="com.example.carelink.dto.BoardDTO">
        SELECT
            b.board_id,
            b.title,
            b.member_id,
            m.name as member_name,
            b.view_count,
            b.like_count,
            b.comment_count,
            b.category,
            b.is_notice,
            b.is_pinned,
            b.created_at
        FROM
            board b
            LEFT JOIN member m ON b.member_id = m.member_id
        WHERE
            COALESCE(b.is_active, true) = true
            AND COALESCE(b.is_deleted, false) = false
            AND b.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY
            (b.view_count * 0.4 + b.like_count * 0.4 + b.comment_count * 0.2) DESC
        LIMIT 5
    </select>
    <select id="getBoardsByCategory" parameterType="string" resultType="com.example.carelink.dto.BoardDTO">
        SELECT
            b.board_id,
            b.title,
            b.member_id,
            m.name as member_name,
            b.view_count,
            b.like_count,
            b.comment_count,
            b.category,
            b.is_notice,
            b.is_pinned,
            b.created_at
        FROM
            board b
            LEFT JOIN member m ON b.member_id = m.member_id
        WHERE
            COALESCE(b.is_active, true) = true
            AND COALESCE(b.is_deleted, false) = false
            AND b.category = #{category}
        ORDER BY
            b.created_at DESC
        LIMIT 10
    </select>
    <select id="getPopularBoardsByCategory" parameterType="string" resultType="com.example.carelink.dto.BoardDTO">
        SELECT
            b.board_id,
            b.title,
            b.member_id,
            m.name as member_name,
            b.view_count,
            b.like_count,
            b.comment_count,
            b.category,
            b.is_notice,
            b.is_pinned,
            b.created_at
        FROM
            board b
            LEFT JOIN member m ON b.member_id = m.member_id
        WHERE
            COALESCE(b.is_active, true) = true
            AND COALESCE(b.is_deleted, false) = false
            AND b.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            <if test="category != null and category != ''">
                AND b.category = #{category}
            </if>
        ORDER BY
            (b.view_count * 0.4 + b.like_count * 0.4 + b.comment_count * 0.2) DESC
        LIMIT 5
    </select>
    <select id="getPreviousBoard" parameterType="long" resultType="com.example.carelink.dto.BoardDTO">
        SELECT
            b.board_id,
            b.title
        FROM
            board b
        WHERE
            COALESCE(b.is_active, true) = true
            AND COALESCE(b.is_deleted, false) = false
            AND b.board_id &lt; #{boardId}
        ORDER BY
            b.board_id DESC
        LIMIT 1
    </select>
    <select id="getNextBoard" parameterType="long" resultType="com.example.carelink.dto.BoardDTO">
        SELECT
            b.board_id,
            b.title
        FROM
            board b
        WHERE
            COALESCE(b.is_active, true) = true
            AND COALESCE(b.is_deleted, false) = false
            AND b.board_id &gt; #{boardId}
        ORDER BY
            b.board_id ASC
        LIMIT 1
    </select>
    <update id="incrementLikeCount" parameterType="long">
        UPDATE board
        SET
            like_count = like_count + 1,
            updated_at = NOW()
        WHERE
            board_id = #{boardId}
            AND COALESCE(is_active, true) = true
            AND COALESCE(is_deleted, false) = false
    </update>
    <update id="decrementLikeCount" parameterType="long">
        UPDATE board
        SET
            like_count = GREATEST(0, like_count - 1),
            updated_at = NOW()
        WHERE
            board_id = #{boardId}
            AND COALESCE(is_active, true) = true
            AND COALESCE(is_deleted, false) = false
    </update>
    <select id="findBoardsByMemberId" resultMap="boardResultMap">
        SELECT b.*, m.name as author_name
        FROM board b
        LEFT JOIN member m ON b.member_id = m.member_id
        WHERE b.member_id = #{memberId}
          AND b.is_deleted = false
        ORDER BY b.created_at DESC
    </select>
    <delete id="deleteByMemberId" parameterType="long">
        DELETE FROM board WHERE member_id = #{memberId}
    </delete>
</mapper>
````

## File: src/main/java/com/example/carelink/controller/BoardController.java
````java
package com.example.carelink.controller;
import com.example.carelink.common.PageInfo;
import com.example.carelink.common.Constants;
import com.example.carelink.dto.BoardDTO;
import com.example.carelink.dto.MemberDTO;
import com.example.carelink.service.BoardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
@Slf4j
@Controller
@RequestMapping("/board")
@RequiredArgsConstructor
public class BoardController {
    private final BoardService boardService;
    private final Map<String, Map<String, String>> boardTypeInfo = Map.of(
        "notice", Map.of("title", "공지사항", "description", "중요한 공지사항을 확인하세요", "category", "NOTICE"),
        "info", Map.of("title", "정보공유", "description", "유용한 정보를 공유하고 함께 나누세요", "category", "INFO"),
        "qna", Map.of("title", "Q&A", "description", "궁금한 점을 질문하고 답변을 받아보세요", "category", "QNA"),
        "faq", Map.of("title", "자주묻는질문", "description", "자주 묻는 질문과 답변을 확인하세요", "category", "FAQ"),
        "all", Map.of("title", "전체 게시판", "description", "모든 게시판의 글을 한번에 확인하세요", "category", "")
    );
    /**
     * 게시판 목록 페이지 (타입별 구분 지원)
     */
    @GetMapping
    public String listPage(Model model,
                          @RequestParam(defaultValue = "1") int page,
                          @RequestParam(defaultValue = "") String keyword,
                          @RequestParam(defaultValue = "") String category,
                          @RequestParam(defaultValue = "all") String type,
                          HttpServletResponse response) {
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setDateHeader("Expires", 0);
        Map<String, String> currentBoardInfo = boardTypeInfo.getOrDefault(type, boardTypeInfo.get("all"));
        String actualCategory = currentBoardInfo.get("category");
        if (category.isEmpty() && !actualCategory.isEmpty()) {
            category = actualCategory;
        }
        try {
            PageInfo<BoardDTO> pageInfo = boardService.getBoardList(page, keyword, category);
            List<BoardDTO> popularBoards = boardService.getPopularBoardsByCategory(category);
            model.addAttribute("pageInfo", pageInfo);
            model.addAttribute("boardList", pageInfo.getList());
            model.addAttribute("popularBoards", popularBoards != null ? popularBoards : List.of());
            model.addAttribute("keyword", keyword != null ? keyword : "");
            model.addAttribute("category", category != null ? category : "");
            model.addAttribute("type", type);
            model.addAttribute("currentPage", page);
        } catch (Exception e) {
            model.addAttribute("pageInfo", new PageInfo<>(List.of(), page, 10, 0));
            model.addAttribute("boardList", List.of());
            model.addAttribute("popularBoards", List.of());
            model.addAttribute("keyword", keyword != null ? keyword : "");
            model.addAttribute("category", category != null ? category : "");
            model.addAttribute("type", type);
            model.addAttribute("currentPage", page);
            model.addAttribute("error", "게시글을 불러오는 중 오류가 발생했습니다: " + e.getMessage());
        }
        model.addAttribute("boardTitle", currentBoardInfo.get("title"));
        model.addAttribute("boardDescription", currentBoardInfo.get("description"));
        model.addAttribute("pageTitle", currentBoardInfo.get("title"));
        if ("faq".equals(type)) {
            return "board/faq-list";
        } else if ("notice".equals(type)) {
            return "board/notice-list";
        } else if ("qna".equals(type)) {
            return "board/qna-list";
        }
        return "board/list";
    }
    @GetMapping("/write")
    public String writePage(Model model,
                          @RequestParam(defaultValue = "all") String type,
                          @RequestParam(required = false) String qaType,
                          HttpSession session,
                          RedirectAttributes redirectAttributes) {
        Long memberId = (Long) session.getAttribute("memberId");
        if (memberId == null) {
            redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
            return "redirect:/member/login";
        }
        MemberDTO loginMember = (MemberDTO) session.getAttribute("loginMember");
        if (("notice".equals(type) || "faq".equals(type)) &&
            (loginMember == null || !"ADMIN".equals(loginMember.getRole()))) {
            redirectAttributes.addFlashAttribute("error", "해당 게시판에 글을 작성할 권한이 없습니다.");
            return "redirect:/board?type=" + type;
        }
        if ("qna".equals(type) && "ANSWER".equals(qaType) &&
            (loginMember == null || !"ADMIN".equals(loginMember.getRole()))) {
            redirectAttributes.addFlashAttribute("error", "답변하기는 관리자만 가능합니다.");
            return "redirect:/board?type=" + type;
        }
        BoardDTO boardDTO = new BoardDTO();
        boardDTO.setMemberId(memberId);
        Map<String, String> currentBoardInfo = boardTypeInfo.getOrDefault(type, boardTypeInfo.get("all"));
        String defaultCategory = currentBoardInfo.get("category");
        if (!defaultCategory.isEmpty()) {
            boardDTO.setCategory(defaultCategory);
        }
        if ("qna".equals(type) && qaType != null) {
            boardDTO.setQaType(qaType);
            if ("QUESTION".equals(qaType)) {
                boardDTO.setIsAnswered(false);
                boardDTO.setAnswerCount(0);
            }
        }
        model.addAttribute("boardDTO", boardDTO);
        model.addAttribute("type", type);
        model.addAttribute("qaType", qaType);
        model.addAttribute("boardTitle", currentBoardInfo.get("title"));
        String pageTitle = currentBoardInfo.get("title");
        if ("qna".equals(type) && qaType != null) {
            pageTitle += ("QUESTION".equals(qaType) ? " - 질문하기" : " - 답변하기");
        } else {
            pageTitle += " 작성";
        }
        model.addAttribute("pageTitle", pageTitle);
        if ("faq".equals(type)) {
            return "board/faq-write";
        } else if ("notice".equals(type)) {
            return "board/write";
        } else if ("qna".equals(type)) {
            return "board/write";
        } else if ("info".equals(type)) {
            return "board/write";
        }
        return "board/write";
    }
    @PostMapping("/write")
    public String writeBoard(@ModelAttribute BoardDTO boardDTO,
                           @RequestParam(defaultValue = "all") String type,
                           @RequestParam(required = false) String qaType,
                           HttpSession session,
                           RedirectAttributes redirectAttributes) {
        try {
            Long memberId = (Long) session.getAttribute("memberId");
            if (memberId == null) {
                redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
                return "redirect:/member/login";
            }
            MemberDTO loginMember = (MemberDTO) session.getAttribute("loginMember");
            if (("notice".equals(type) || "faq".equals(type)) &&
                (loginMember == null || !"ADMIN".equals(loginMember.getRole()))) {
                redirectAttributes.addFlashAttribute("error", "해당 게시판에 글을 작성할 권한이 없습니다.");
                return "redirect:/board?type=" + type;
            }
            if ("qna".equals(type) && "ANSWER".equals(qaType) &&
                (loginMember == null || !"ADMIN".equals(loginMember.getRole()))) {
                redirectAttributes.addFlashAttribute("error", "답변하기는 관리자만 가능합니다.");
                return "redirect:/board?type=" + type;
            }
            boardDTO.setMemberId(memberId);
            if ("qna".equals(type) && qaType != null) {
                boardDTO.setQaType(qaType);
                if ("QUESTION".equals(qaType)) {
                    boardDTO.setIsAnswered(false);
                    boardDTO.setAnswerCount(0);
                } else if ("ANSWER".equals(qaType)) {
                    boardDTO.setIsAnswered(null);
                    boardDTO.setAnswerCount(null);
                }
            }
            if (boardDTO.getIsNotice() == null) {
                boardDTO.setIsNotice(false);
            }
            if (boardDTO.getIsSecret() == null) {
                boardDTO.setIsSecret(false);
            }
            if (boardDTO.getIsActive() == null) {
                boardDTO.setIsActive(true);
            }
            if (boardDTO.getIsDeleted() == null) {
                boardDTO.setIsDeleted(false);
            }
            boardService.insertBoard(boardDTO);
            String successMessage = "게시글이 성공적으로 등록되었습니다.";
            if ("qna".equals(type) && qaType != null) {
                successMessage = "QUESTION".equals(qaType) ? "질문이 성공적으로 등록되었습니다." : "답변이 성공적으로 등록되었습니다.";
            }
            redirectAttributes.addFlashAttribute("message", successMessage);
            if ("all".equals(type)) {
                return "redirect:/board";
            } else {
                return "redirect:/board?type=" + type;
            }
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "게시글 등록 중 오류가 발생했습니다: " + e.getMessage());
            String redirectUrl = "redirect:/board/write?type=" + type;
            if (qaType != null) {
                redirectUrl += "&qaType=" + qaType;
            }
            return redirectUrl;
        }
    }
    @GetMapping("/detail/{id}")
    public String detailPage(@PathVariable Long id,
                           @RequestParam(defaultValue = "all") String type,
                           @RequestParam(defaultValue = "1") int page,
                           Model model,
                           RedirectAttributes redirectAttributes) {
        try {
            BoardDTO board = boardService.getBoardById(id);
            boardService.incrementViewCount(id);
            BoardDTO prevBoard = boardService.getPreviousBoard(id);
            BoardDTO nextBoard = boardService.getNextBoard(id);
            model.addAttribute("board", board);
            model.addAttribute("prevBoard", prevBoard);
            model.addAttribute("nextBoard", nextBoard);
            model.addAttribute("type", type);
            model.addAttribute("page", page);
            model.addAttribute("pageTitle", board.getTitle());
            return "board/detail";
        } catch (Exception e) {
            log.error("게시글 상세보기 오류 - boardId: {}", id, e);
            redirectAttributes.addFlashAttribute("error", "게시글을 불러올 수 없습니다: " + e.getMessage());
            return "redirect:/board?type=" + type;
        }
    }
    @GetMapping("/edit/{id}")
    public String editPage(@PathVariable Long id,
                          @RequestParam(name = "type", required = false) String type,
                         HttpSession session,
                         Model model,
                         RedirectAttributes redirectAttributes) {
        try {
            Long memberId = (Long) session.getAttribute("memberId");
            if (memberId == null) {
                redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
                return "redirect:/member/login";
            }
            BoardDTO board = boardService.getBoardByIdIncludeDeleted(id);
            if (board == null) {
                redirectAttributes.addFlashAttribute("error", "수정할 게시글을 찾을 수 없습니다.");
                return "redirect:/board?type=" + (type != null ? type : "all");
            }
            if (board.getIsDeleted() != null && board.getIsDeleted()) {
                redirectAttributes.addFlashAttribute("error", "삭제된 게시글은 수정할 수 없습니다.");
                return "redirect:/board/detail/" + id + "?type=" + (type != null ? type : "all");
            }
            log.info("수정 페이지 접근 - 게시글 ID: {}, 작성자 ID: {}, 요청자 ID: {}", id, board.getMemberId(), memberId);
            MemberDTO loginMember = (MemberDTO) session.getAttribute("loginMember");
            boolean isAdmin = loginMember != null && "ADMIN".equals(loginMember.getRole());
            boolean isAuthor = board.getMemberId().equals(memberId);
            if (("NOTICE".equals(board.getCategory()) || "FAQ".equals(board.getCategory())) && !isAdmin) {
                log.warn("권한 없는 수정 시도 - 공지사항/FAQ 수정 권한 없음. 요청자: {}", memberId);
                redirectAttributes.addFlashAttribute("error", "해당 게시글을 수정할 권한이 없습니다.");
                return "redirect:/board/detail/" + id + "?type=" + (type != null ? type : "all");
            }
            if (!isAuthor && !isAdmin) {
                log.warn("권한 없는 수정 시도 - 게시글 작성자: {}, 요청자: {}", board.getMemberId(), memberId);
                redirectAttributes.addFlashAttribute("error", "작성자만 수정할 수 있습니다.");
                return "redirect:/board/detail/" + id + "?type=" + (type != null ? type : "all");
            }
            Map<String, String> currentBoardInfo = boardTypeInfo.getOrDefault(type != null ? type : "all", boardTypeInfo.get("all"));
            model.addAttribute("boardDTO", board);
            model.addAttribute("type", type != null ? type : "all");
            model.addAttribute("boardTitle", currentBoardInfo.get("title"));
            model.addAttribute("pageTitle", currentBoardInfo.get("title") + " 수정");
            return "board/edit";
        } catch (Exception e) {
            log.error("수정 페이지 로드 중 오류 발생 - boardId: {}", id, e);
            redirectAttributes.addFlashAttribute("error", "수정 페이지를 불러오는 중 오류가 발생했습니다: " + e.getMessage());
            return "redirect:/board?type=" + (type != null ? type : "all");
        }
    }
    @PostMapping("/edit/{id}")
    public String editBoard(@PathVariable Long id,
                          @ModelAttribute BoardDTO boardDTO,
                          @RequestParam(defaultValue = "all") String type,
                          HttpSession session,
                          RedirectAttributes redirectAttributes) {
        try {
            Long memberId = (Long) session.getAttribute("memberId");
            if (memberId == null) {
                redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
                return "redirect:/member/login";
            }
            BoardDTO existingBoard = boardService.getBoardByIdIncludeDeleted(id);
            if (existingBoard == null) {
                redirectAttributes.addFlashAttribute("error", "수정할 게시글을 찾을 수 없습니다.");
                return getRedirectUrl(type);
            }
            if (existingBoard.getIsDeleted() != null && existingBoard.getIsDeleted()) {
                redirectAttributes.addFlashAttribute("error", "삭제된 게시글은 수정할 수 없습니다.");
                return getRedirectUrl(type);
            }
            log.info("수정 요청 - 게시글 ID: {}, 작성자 ID: {}, 요청자 ID: {}", id, existingBoard.getMemberId(), memberId);
            MemberDTO loginMember = (MemberDTO) session.getAttribute("loginMember");
            boolean isAdmin = loginMember != null && "ADMIN".equals(loginMember.getRole());
            boolean isAuthor = existingBoard.getMemberId().equals(memberId);
            if (("NOTICE".equals(existingBoard.getCategory()) || "FAQ".equals(existingBoard.getCategory())) && !isAdmin) {
                log.warn("권한 없는 수정 시도 - 공지사항/FAQ 수정 권한 없음. 요청자: {}", memberId);
                redirectAttributes.addFlashAttribute("error", "해당 게시글을 수정할 권한이 없습니다.");
                return "redirect:/board/detail/" + id + "?type=" + type;
            }
            if (!isAuthor && !isAdmin) {
                log.warn("권한 없는 수정 시도 - 게시글 작성자: {}, 요청자: {}", existingBoard.getMemberId(), memberId);
                redirectAttributes.addFlashAttribute("error", "작성자만 수정할 수 있습니다.");
                return "redirect:/board/detail/" + id + "?type=" + type;
            }
            boardDTO.setBoardId(id);
            boardDTO.setMemberId(memberId);
            if (boardDTO.getIsNotice() == null) {
                boardDTO.setIsNotice(false);
            }
            if (boardDTO.getIsSecret() == null) {
                boardDTO.setIsSecret(false);
            }
            if (boardDTO.getIsActive() == null) {
                boardDTO.setIsActive(true);
            }
            if (boardDTO.getIsDeleted() == null) {
                boardDTO.setIsDeleted(false);
            }
            boardService.updateBoard(boardDTO);
            log.info("수정 완료 - 게시글 ID: {}", id);
            redirectAttributes.addFlashAttribute("message", "✅ 게시글이 성공적으로 수정되었습니다.");
            return "redirect:/board/detail/" + id + "?type=" + type;
        } catch (Exception e) {
            log.error("수정 처리 중 오류 발생 - boardId: {}", id, e);
            redirectAttributes.addFlashAttribute("error", "❌ 게시글 수정 중 오류가 발생했습니다: " + e.getMessage());
            return "redirect:/board/edit/" + id + "?type=" + type;
        }
    }
    @PostMapping("/delete/{id}")
    public String deleteBoard(@PathVariable Long id,
                             @RequestParam(name = "type", required = false) String type,
                            HttpSession session,
                            RedirectAttributes redirectAttributes) {
        try {
            log.info("🚀 삭제 요청 시작 - 게시글 ID: {}", id);
            Long memberId = (Long) session.getAttribute("memberId");
            log.info("🔍 세션 확인 - memberId: {}", memberId);
            if (memberId == null) {
                log.warn("❌ 로그인 안됨 - 삭제 실패");
                redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
                return "redirect:/member/login";
            }
            BoardDTO board = boardService.getBoardByIdIncludeDeleted(id);
            log.info("🔍 게시글 조회 결과 - board: {}", board != null ? "존재함" : "없음");
            if (board == null) {
                log.warn("❌ 게시글 없음 - 삭제 실패");
                redirectAttributes.addFlashAttribute("error", "게시글을 찾을 수 없습니다.");
                return getRedirectUrl(type);
            }
            log.info("🔍 권한 체크 - 게시글 작성자: {}, 요청자: {}", board.getMemberId(), memberId);
            log.info("삭제 요청 - 게시글 ID: {}, 작성자 ID: {}, 요청자 ID: {}", id, board.getMemberId(), memberId);
            MemberDTO loginMember = (MemberDTO) session.getAttribute("loginMember");
            boolean isAdmin = loginMember != null && "ADMIN".equals(loginMember.getRole());
            boolean isAuthor = board.getMemberId().equals(memberId);
            if (("NOTICE".equals(board.getCategory()) || "FAQ".equals(board.getCategory())) && !isAdmin) {
                log.warn("❌ 권한 없는 삭제 시도 - 공지사항/FAQ 삭제 권한 없음. 요청자: {}", memberId);
                redirectAttributes.addFlashAttribute("error", "해당 게시글을 삭제할 권한이 없습니다.");
                return getRedirectUrl(type);
            }
            if (!isAuthor && !isAdmin) {
                log.warn("❌ 권한 없는 삭제 시도 - 게시글 작성자: {}, 요청자: {}", board.getMemberId(), memberId);
                redirectAttributes.addFlashAttribute("error", "작성자만 삭제할 수 있습니다.");
                return getRedirectUrl(type);
            }
            log.info("✅ 권한 체크 통과 - 삭제 진행");
            Map<String, Object> deleteResult = boardService.deleteBoard(id);
            Boolean success = (Boolean) deleteResult.get("success");
            String message = (String) deleteResult.get("message");
            log.info("삭제 결과 - 성공: {}, 메시지: {}", success, message);
            if (success) {
                redirectAttributes.addFlashAttribute("message", "✅ " + message);
            } else {
                redirectAttributes.addFlashAttribute("error", "❌ " + message);
            }
            return getRedirectUrl(type);
        } catch (Exception e) {
            log.error("게시글 삭제 처리 중 오류 발생 - boardId: {}", id, e);
            redirectAttributes.addFlashAttribute("error", "❌ 게시글 삭제 중 오류가 발생했습니다: " + e.getMessage());
            return getRedirectUrl(type);
        }
    }
    private String getRedirectUrl(String type) {
        if ("all".equals(type)) {
            return "redirect:/board";
        } else {
            return "redirect:/board?type=" + type;
        }
    }
    @PostMapping("/like/{id}")
    @ResponseBody
    public Map<String, Object> toggleLike(@PathVariable Long id,
                                        @RequestParam String action) {
        Map<String, Object> result = new HashMap<>();
        try {
            if ("like".equals(action)) {
                boardService.incrementLikeCount(id);
                result.put("success", true);
                result.put("message", "추천되었습니다.");
            } else if ("dislike".equals(action)) {
                boardService.decrementLikeCount(id);
                result.put("success", true);
                result.put("message", "추천이 취소되었습니다.");
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "처리 중 오류가 발생했습니다.");
        }
        return result;
    }
    @GetMapping("/debug/board/{id}")
    @ResponseBody
    public Map<String, Object> debugBoardStatus(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            log.info("🔧 디버그 API 호출 - boardId: {}", id);
            BoardDTO board = boardService.getBoardByIdIncludeDeleted(id);
            if (board == null) {
                result.put("error", "게시글을 찾을 수 없습니다");
                log.warn("🔧 디버그 - 게시글을 찾을 수 없음: {}", id);
                return result;
            }
            result.put("boardId", board.getBoardId());
            result.put("title", board.getTitle());
            result.put("isDeleted", board.getIsDeleted());
            result.put("isDeletedType", board.getIsDeleted() != null ? board.getIsDeleted().getClass().getSimpleName() : "null");
            result.put("isDeletedValue", board.getIsDeleted() != null ? board.getIsDeleted().toString() : "null");
            result.put("isActive", board.getIsActive());
            result.put("isActiveType", board.getIsActive() != null ? board.getIsActive().getClass().getSimpleName() : "null");
            result.put("createdAt", board.getCreatedAt());
            boolean wouldBeDeleted = board.getIsDeleted() != null && board.getIsDeleted();
            result.put("wouldBeConsideredDeleted", wouldBeDeleted);
            log.info("🔧 디버그 결과 - boardId: {}, isDeleted: {}, wouldBeDeleted: {}",
                id, board.getIsDeleted(), wouldBeDeleted);
            return result;
        } catch (Exception e) {
            log.error("🔧 디버그 API 오류 - boardId: {}", id, e);
            result.put("error", "오류 발생: " + e.getMessage());
            return result;
        }
    }
    private MemberDTO getCurrentMember(HttpSession session) {
        return (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
    }
    private Long getCurrentMemberId(HttpSession session) {
        return (Long) session.getAttribute("memberId");
    }
    private boolean isAdmin(HttpSession session) {
        MemberDTO loginMember = getCurrentMember(session);
        return loginMember != null && "ADMIN".equals(loginMember.getRole());
    }
    private boolean hasEditPermission(HttpSession session, Long authorMemberId) {
        Long currentMemberId = getCurrentMemberId(session);
        return (currentMemberId != null && currentMemberId.equals(authorMemberId)) || isAdmin(session);
    }
}
````

## File: src/main/java/com/example/carelink/controller/ReviewController.java
````java
package com.example.carelink.controller;
import com.example.carelink.common.PageInfo;
import com.example.carelink.common.Constants;
import com.example.carelink.dto.ReviewDTO;
import com.example.carelink.dto.FacilityDTO;
import com.example.carelink.dto.MemberDTO;
import com.example.carelink.service.ReviewService;
import com.example.carelink.service.FacilityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import javax.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
@Slf4j
@Controller
@RequestMapping("/review")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;
    private final FacilityService facilityService;
    @GetMapping
    public String listPage(Model model,
                          @RequestParam(defaultValue = "1") int page,
                          @RequestParam(defaultValue = "") String keyword,
                          @RequestParam(required = false) Integer minRating,
                          @RequestParam(required = false) Long facilityId) {
        try {
            log.info("리뷰 목록 페이지 접속 - page: {}, keyword: {}, minRating: {}, facilityId: {}",
                    page, keyword, minRating, facilityId);
            PageInfo<ReviewDTO> pageInfo = reviewService.getReviewList(page, keyword, minRating, facilityId);
            model.addAttribute("pageInfo", pageInfo);
            model.addAttribute("reviewList", pageInfo.getList());
            model.addAttribute("keyword", keyword != null ? keyword : "");
            model.addAttribute("minRating", minRating);
            model.addAttribute("facilityId", facilityId);
            model.addAttribute("currentPage", page);
            model.addAttribute("pageTitle", "시설 리뷰");
            if (facilityId != null) {
                try {
                    FacilityDTO facility = facilityService.getFacilityById(facilityId);
                    model.addAttribute("selectedFacility", facility);
                    model.addAttribute("pageTitle", facility.getFacilityName() + " 리뷰");
                } catch (Exception e) {
                    log.warn("시설 정보 조회 실패 - facilityId: {}", facilityId, e);
                }
            }
            return "review/list";
        } catch (Exception e) {
            log.error("리뷰 목록 조회 중 오류 발생", e);
            model.addAttribute("pageInfo", new PageInfo<>(List.of(), page, 10, 0));
            model.addAttribute("reviewList", List.of());
            model.addAttribute("keyword", keyword != null ? keyword : "");
            model.addAttribute("minRating", minRating);
            model.addAttribute("facilityId", facilityId);
            model.addAttribute("currentPage", page);
            model.addAttribute("error", "리뷰를 불러오는 중 오류가 발생했습니다: " + e.getMessage());
            return "review/list";
        }
    }
    @GetMapping("/write")
    public String writePage(Model model,
                           @RequestParam(required = false) Long facilityId,
                           HttpSession session,
                           RedirectAttributes redirectAttributes) {
        MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        if (loginMember == null) {
            log.warn("로그인하지 않은 사용자의 리뷰 작성 페이지 접속 시도");
            redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
            return "redirect:/member/login";
        }
        try {
            log.info("리뷰 작성 페이지 접속 - facilityId: {}", facilityId);
            ReviewDTO reviewDTO = new ReviewDTO();
            List<FacilityDTO> facilityList = facilityService.getAllActiveFacilities();
            log.info("활성화된 시설 목록 조회 완료 - 조회된 건수: {}", facilityList.size());
            if (facilityId != null) {
                FacilityDTO selectedFacility = facilityService.getFacilityById(facilityId);
                if (selectedFacility != null) {
                    log.info("선택된 시설 정보 조회 성공 - facilityId: {}, facilityName: {}, status: {}",
                            facilityId, selectedFacility.getFacilityName(), selectedFacility.getStatus());
                    if ("삭제됨".equals(selectedFacility.getStatus())) {
                        model.addAttribute("error", "선택하신 시설은 삭제되어 리뷰를 작성할 수 없습니다.");
                    } else if ("승인대기".equals(selectedFacility.getStatus())) {
                        model.addAttribute("error", "선택하신 시설은 아직 승인되지 않아 리뷰를 작성할 수 없습니다.");
                    } else {
                        reviewDTO.setFacilityId(facilityId);
                        model.addAttribute("selectedFacility", selectedFacility);
                    }
                } else {
                    log.warn("선택된 시설을 찾을 수 없음 - facilityId: {}", facilityId);
                    model.addAttribute("error", "선택하신 시설을 찾을 수 없습니다.");
                }
            }
            model.addAttribute("reviewDTO", reviewDTO);
            model.addAttribute("facilityList", facilityList);
            model.addAttribute("pageTitle", "리뷰 작성");
            return "review/write";
        } catch (Exception e) {
            log.error("리뷰 작성 페이지 로딩 중 오류 발생", e);
            model.addAttribute("error", "리뷰 작성 페이지를 불러오는 중 오류가 발생했습니다: " + e.getMessage());
            return "review/write";
        }
    }
    @PostMapping("/write")
    public String writeReview(@ModelAttribute ReviewDTO reviewDTO,
                             HttpSession session,
                             RedirectAttributes redirectAttributes) {
        try {
            log.info("리뷰 등록 요청 - title: {}, facilityId: {}", reviewDTO.getTitle(), reviewDTO.getFacilityId());
            MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
            if (loginMember == null) {
                log.warn("로그인하지 않은 사용자의 리뷰 작성 시도");
                redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
                return "redirect:/member/login";
            }
            reviewDTO.setMemberId(loginMember.getMemberId());
            log.info("리뷰 작성자 설정 - memberId: {}, userId: {}", loginMember.getMemberId(), loginMember.getUserId());
            if (reviewDTO.getFacilityId() == null) {
                log.warn("시설이 선택되지 않음");
                redirectAttributes.addFlashAttribute("error", "시설을 선택해주세요.");
                redirectAttributes.addFlashAttribute("reviewDTO", reviewDTO);
                return "redirect:/review/write";
            }
            FacilityDTO facility = facilityService.getFacilityById(reviewDTO.getFacilityId());
            if (facility == null) {
                log.warn("선택된 시설을 찾을 수 없음 - facilityId: {}", reviewDTO.getFacilityId());
                redirectAttributes.addFlashAttribute("error", "선택한 시설을 찾을 수 없습니다.");
                redirectAttributes.addFlashAttribute("reviewDTO", reviewDTO);
                return "redirect:/review/write";
            }
            if (!facilityService.validateFacilityStatus(facility)) {
                log.warn("유효하지 않은 시설 상태 - facilityId: {}, status: {}",
                        facility.getFacilityId(), facility.getStatus());
                redirectAttributes.addFlashAttribute("error", facility.getStatusMessage());
                redirectAttributes.addFlashAttribute("reviewDTO", reviewDTO);
                return "redirect:/review/write";
            }
            log.info("시설 정보 확인 완료 - facilityId: {}, facilityName: {}, status: {}",
                    facility.getFacilityId(), facility.getFacilityName(), facility.getStatus());
            if (reviewDTO.getTitle() == null || reviewDTO.getTitle().trim().isEmpty()) {
                log.warn("제목이 입력되지 않음");
                redirectAttributes.addFlashAttribute("error", "제목을 입력해주세요.");
                redirectAttributes.addFlashAttribute("reviewDTO", reviewDTO);
                return "redirect:/review/write?facilityId=" + reviewDTO.getFacilityId();
            }
            if (reviewDTO.getContent() == null || reviewDTO.getContent().trim().length() < 10) {
                log.warn("내용이 10자 미만임");
                redirectAttributes.addFlashAttribute("error", "내용을 10자 이상 입력해주세요.");
                redirectAttributes.addFlashAttribute("reviewDTO", reviewDTO);
                return "redirect:/review/write?facilityId=" + reviewDTO.getFacilityId();
            }
            if (reviewDTO.getRating() == null || reviewDTO.getRating() < 1 || reviewDTO.getRating() > 5) {
                log.warn("평점이 유효하지 않음 - rating: {}", reviewDTO.getRating());
                redirectAttributes.addFlashAttribute("error", "평점을 선택해주세요.");
                redirectAttributes.addFlashAttribute("reviewDTO", reviewDTO);
                return "redirect:/review/write?facilityId=" + reviewDTO.getFacilityId();
            }
            reviewService.insertReview(reviewDTO);
            log.info("리뷰 등록 성공 - reviewId: {}", reviewDTO.getReviewId());
            redirectAttributes.addFlashAttribute("message", "리뷰가 성공적으로 등록되었습니다.");
            return "redirect:/review";
        } catch (Exception e) {
            log.error("리뷰 등록 중 오류 발생", e);
            redirectAttributes.addFlashAttribute("error", "리뷰 등록 중 오류가 발생했습니다: " + e.getMessage());
            redirectAttributes.addFlashAttribute("reviewDTO", reviewDTO);
            return "redirect:/review/write?facilityId=" + reviewDTO.getFacilityId();
        }
    }
    @GetMapping("/detail/{id}")
    public String detailPage(@PathVariable Long id, Model model, HttpSession session) {
        try {
            ReviewDTO review = reviewService.getReviewById(id);
            if (review == null) {
                model.addAttribute("error", "리뷰를 찾을 수 없습니다.");
                return "redirect:/review";
            }
            reviewService.incrementViewCount(id);
            List<ReviewDTO> otherReviews = reviewService.getReviewsByFacilityId(review.getFacilityId())
                    .stream()
                    .filter(r -> !r.getReviewId().equals(id))
                    .limit(5)
                    .collect(java.util.stream.Collectors.toList());
            model.addAttribute("review", review);
            model.addAttribute("otherReviews", otherReviews);
            model.addAttribute("pageTitle", review.getTitle());
            model.addAttribute("currentMemberId", getCurrentMemberId(session));
            return "review/detail";
        } catch (Exception e) {
            log.error("리뷰 상세보기 중 오류 발생 - reviewId: {}", id, e);
            model.addAttribute("error", "리뷰를 불러올 수 없습니다: " + e.getMessage());
            return "redirect:/review";
        }
    }
    @GetMapping("/edit/{id}")
    public String editPage(@PathVariable Long id, Model model, HttpSession session, RedirectAttributes redirectAttributes) {
        try {
            ReviewDTO review = reviewService.getReviewById(id);
            if (review == null) {
                redirectAttributes.addFlashAttribute("error", "수정할 리뷰를 찾을 수 없습니다.");
                return "redirect:/review";
            }
            if (!hasEditPermission(session, review.getMemberId())) {
                redirectAttributes.addFlashAttribute("error", "작성자 또는 관리자만 수정할 수 있습니다.");
                return "redirect:/review/detail/" + id;
            }
            model.addAttribute("reviewDTO", review);
            model.addAttribute("pageTitle", "리뷰 수정");
            return "review/edit";
        } catch (Exception e) {
            log.error("리뷰 수정 페이지 로딩 중 오류 발생 - reviewId: {}", id, e);
            redirectAttributes.addFlashAttribute("error", "수정 페이지를 불러오는 중 오류가 발생했습니다: " + e.getMessage());
            return "redirect:/review";
        }
    }
    @PostMapping("/update")
    public String updateReview(@ModelAttribute ReviewDTO reviewDTO, HttpSession session, RedirectAttributes redirectAttributes) {
        try {
            log.info("리뷰 수정 요청 - reviewId: {}, title: {}", reviewDTO.getReviewId(), reviewDTO.getTitle());
            ReviewDTO existingReview = reviewService.getReviewById(reviewDTO.getReviewId());
            if (existingReview == null) {
                redirectAttributes.addFlashAttribute("error", "수정할 리뷰를 찾을 수 없습니다.");
                return "redirect:/review";
            }
            if (!hasEditPermission(session, existingReview.getMemberId())) {
                redirectAttributes.addFlashAttribute("error", "작성자 또는 관리자만 수정할 수 있습니다.");
                return "redirect:/review/detail/" + reviewDTO.getReviewId();
            }
            if (reviewDTO.getTitle() == null || reviewDTO.getTitle().trim().isEmpty()) {
                redirectAttributes.addFlashAttribute("error", "제목을 입력해주세요.");
                redirectAttributes.addFlashAttribute("reviewDTO", reviewDTO);
                return "redirect:/review/edit/" + reviewDTO.getReviewId();
            }
            if (reviewDTO.getContent() == null || reviewDTO.getContent().trim().length() < 10) {
                redirectAttributes.addFlashAttribute("error", "내용을 10자 이상 입력해주세요.");
                redirectAttributes.addFlashAttribute("reviewDTO", reviewDTO);
                return "redirect:/review/edit/" + reviewDTO.getReviewId();
            }
            if (reviewDTO.getRating() == null || reviewDTO.getRating() < 1 || reviewDTO.getRating() > 5) {
                redirectAttributes.addFlashAttribute("error", "평점을 선택해주세요.");
                redirectAttributes.addFlashAttribute("reviewDTO", reviewDTO);
                return "redirect:/review/edit/" + reviewDTO.getReviewId();
            }
            reviewDTO.setFacilityId(existingReview.getFacilityId());
            reviewDTO.setMemberId(existingReview.getMemberId());
            reviewDTO.setViewCount(existingReview.getViewCount());
            reviewDTO.setLikeCount(existingReview.getLikeCount());
            reviewDTO.setDislikeCount(existingReview.getDislikeCount());
            reviewDTO.setCreatedAt(existingReview.getCreatedAt());
            reviewService.updateReview(reviewDTO);
            log.info("리뷰 수정 성공 - reviewId: {}", reviewDTO.getReviewId());
            redirectAttributes.addFlashAttribute("message", "리뷰가 성공적으로 수정되었습니다.");
            return "redirect:/review/detail/" + reviewDTO.getReviewId();
        } catch (Exception e) {
            log.error("리뷰 수정 중 오류 발생 - reviewId: {}", reviewDTO.getReviewId(), e);
            redirectAttributes.addFlashAttribute("error", "리뷰 수정 중 오류가 발생했습니다: " + e.getMessage());
            redirectAttributes.addFlashAttribute("reviewDTO", reviewDTO);
            return "redirect:/review/edit/" + reviewDTO.getReviewId();
        }
    }
    @PostMapping("/delete/{id}")
    public String deleteReview(@PathVariable Long id, HttpSession session, RedirectAttributes redirectAttributes) {
        try {
            ReviewDTO existingReview = reviewService.getReviewById(id);
            if (existingReview == null) {
                redirectAttributes.addFlashAttribute("error", "삭제할 리뷰를 찾을 수 없습니다.");
                return "redirect:/review";
            }
            if (!hasEditPermission(session, existingReview.getMemberId())) {
                redirectAttributes.addFlashAttribute("error", "작성자 또는 관리자만 삭제할 수 있습니다.");
                return "redirect:/review/detail/" + id;
            }
            reviewService.deleteReview(id);
            redirectAttributes.addFlashAttribute("message", "리뷰가 성공적으로 삭제되었습니다.");
        } catch (Exception e) {
            log.error("리뷰 삭제 중 오류 발생 - reviewId: {}", id, e);
            redirectAttributes.addFlashAttribute("error", "리뷰 삭제 중 오류가 발생했습니다: " + e.getMessage());
        }
        return "redirect:/review";
    }
    @PostMapping("/report/{id}")
    @ResponseBody
    public Map<String, Object> reportReview(@PathVariable Long id, @RequestBody Map<String, String> request, HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        try {
            String reason = request.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                result.put("success", false);
                result.put("message", "신고 사유를 입력해주세요.");
                return result;
            }
            ReviewDTO review = reviewService.getReviewById(id);
            if (review == null) {
                result.put("success", false);
                result.put("message", "신고할 리뷰를 찾을 수 없습니다.");
                return result;
            }
            Long currentMemberId = getCurrentMemberId(session);
            if (review.getMemberId().equals(currentMemberId)) {
                result.put("success", false);
                result.put("message", "본인이 작성한 리뷰는 신고할 수 없습니다.");
                return result;
            }
            log.info("리뷰 신고 접수 - reviewId: {}, reason: {}, reporter: {}", id, reason, currentMemberId);
            result.put("success", true);
            result.put("message", "신고가 접수되었습니다. 검토 후 적절한 조치를 취하겠습니다.");
        } catch (Exception e) {
            log.error("리뷰 신고 처리 중 오류 발생 - reviewId: {}", id, e);
            result.put("success", false);
            result.put("message", "신고 처리 중 오류가 발생했습니다.");
        }
        return result;
    }
    @PostMapping("/view/{id}")
    @ResponseBody
    public Map<String, Object> incrementViewCount(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            reviewService.incrementViewCount(id);
            result.put("success", true);
        } catch (Exception e) {
            log.error("조회수 증가 중 오류 발생 - reviewId: {}", id, e);
            result.put("success", false);
            result.put("message", "조회수 업데이트 중 오류가 발생했습니다.");
        }
        return result;
    }
    @GetMapping("/api/facility/{facilityId}")
    @ResponseBody
    public Map<String, Object> getReviewsByFacility(@PathVariable Long facilityId,
                                                   @RequestParam(defaultValue = "1") int page) {
        Map<String, Object> result = new HashMap<>();
        try {
            List<ReviewDTO> reviews = reviewService.getReviewsByFacilityId(facilityId);
            Double averageRating = reviewService.getAverageRating(facilityId);
            result.put("success", true);
            result.put("reviews", reviews);
            result.put("averageRating", averageRating);
            result.put("reviewCount", reviews.size());
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "리뷰를 불러오는 중 오류가 발생했습니다.");
        }
        return result;
    }
    @PostMapping("/like/{id}")
    @ResponseBody
    public Map<String, Object> likeReview(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            reviewService.likeReview(id);
            ReviewDTO review = reviewService.getReviewById(id);
            result.put("success", true);
            result.put("likeCount", review.getLikeCount());
            result.put("message", "추천하였습니다.");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "추천 처리 중 오류가 발생했습니다.");
        }
        return result;
    }
    @PostMapping("/dislike/{id}")
    @ResponseBody
    public Map<String, Object> dislikeReview(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            reviewService.dislikeReview(id);
            ReviewDTO review = reviewService.getReviewById(id);
            result.put("success", true);
            result.put("dislikeCount", review.getDislikeCount());
            result.put("message", "비추천하였습니다.");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "비추천 처리 중 오류가 발생했습니다.");
        }
        return result;
    }
    private Long getCurrentMemberId(HttpSession session) {
        return (Long) session.getAttribute("memberId");
    }
    private boolean isAdmin(HttpSession session) {
        MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        return loginMember != null && "ADMIN".equals(loginMember.getRole());
    }
    private boolean hasEditPermission(HttpSession session, Long authorMemberId) {
        Long currentMemberId = getCurrentMemberId(session);
        return (currentMemberId != null && currentMemberId.equals(authorMemberId)) || isAdmin(session);
    }
}
````

## File: src/main/java/com/example/carelink/dto/FacilityDTO.java
````java
package com.example.carelink.dto;
import com.example.carelink.common.BaseDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class FacilityDTO extends BaseDTO {
    private Long facilityId;
    private String facilityName;
    private String facilityType;
    private String address;
    private String detailAddress;
    private String phone;
    private Double longitude;
    private Double latitude;
    private String description;
    private String facilityImage;
    private String facilityImageAltText;
    private String homepage;
    private Integer capacity;
    private Integer currentOccupancy;
    private String operatingHours;
    private String features;
    private Boolean isApproved;
    private Boolean isDeleted;
    private String approvalStatus;
    private String rejectionReason;
    private Long registeredMemberId;
    private String registeredMemberName;
    private String registeredUserName;
    private Double averageRating;
    private Integer reviewCount;
    private Integer gradeRating;
    private String region;
    private Double swLat;
    private Double swLng;
    private Double neLat;
    private Double neLng;
    private String status;
    public boolean isNormalStatus() {
        return "정상".equals(status);
    }
    public boolean isDeletedStatus() {
        return "삭제됨".equals(status);
    }
    public boolean isPendingStatus() {
        return "승인대기".equals(status);
    }
    public String getStatusMessage() {
        if (isDeletedStatus()) {
            return "삭제된 시설입니다.";
        } else if (isPendingStatus()) {
            return "승인 대기 중인 시설입니다.";
        }
        return "";
    }
}
````

## File: src/main/java/com/example/carelink/dto/MemberDTO.java
````java
package com.example.carelink.dto;
import com.example.carelink.common.BaseDTO;
import com.example.carelink.validation.groups.OnFacilityJoin;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.web.multipart.MultipartFile;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
@Data
@EqualsAndHashCode(callSuper = true)
public class MemberDTO extends BaseDTO {
    private Long memberId;
    @NotBlank(message = "사용자 ID는 필수입니다.")
    @Pattern(regexp = "^[a-zA-Z0-9]{4,20}$", message = "사용자 ID는 4-20자의 영문, 숫자만 가능합니다.")
    private String userId;
    @NotBlank(message = "비밀번호는 필수입니다.")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{8,20}$",
            message = "비밀번호는 8-20자의 영문, 숫자, 특수문자를 1개 이상 포함해야 합니다.")
    private String password;
    @NotBlank(message = "이름은 필수입니다.")
    @Size(max = 50, message = "이름은 50자를 초과할 수 없습니다.")
    private String name;
    @NotBlank(message = "이메일은 필수 입력 항목입니다.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    @Size(max = 100, message = "이메일은 100자를 초과할 수 없습니다.")
    private String email;
    @Pattern(regexp = "^$|^01(?:0|1|[6-9])-(?:\\d{3}|\\d{4})-\\d{4}$",
            message = "올바른 휴대폰 번호 형식이 아닙니다.")
    private String phone;
    private String role;
    @NotBlank(message = "시설 주소는 필수 입력 항목입니다.", groups = OnFacilityJoin.class)
    private String address;
    private String profileImage;
    private String profileImageAltText;
    private String facilityName;
    private String facilityType;
    private String facilityAddress;
    private String detailAddress;
    private String facilityPhone;
    private String description;
    private String homepage;
    private Integer capacity;
    private String operatingHours;
    private String features;
    private Double latitude;
    private Double longitude;
    private Boolean isActive;
    private Boolean isDeleted;
    private transient String passwordConfirm;
    private int loginFailCount;
    private java.time.LocalDateTime lastLoginAt;
    private transient MultipartFile profileImageFile;
}
````

## File: src/main/java/com/example/carelink/service/FacilityImageService.java
````java
package com.example.carelink.service;
import com.example.carelink.dao.FacilityImageMapper;
import com.example.carelink.dao.FacilityMapper;
import com.example.carelink.dto.FacilityImageDTO;
import com.example.carelink.common.Constants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
@Service
public class FacilityImageService {
    private final FacilityImageMapper facilityImageMapper;
    private final FacilityMapper facilityMapper;
    private static final Logger log = LoggerFactory.getLogger(FacilityImageService.class);
    @Autowired
    public FacilityImageService(FacilityImageMapper facilityImageMapper, FacilityMapper facilityMapper) {
        this.facilityImageMapper = facilityImageMapper;
        this.facilityMapper = facilityMapper;
    }
    @Transactional(readOnly = true)
    public List<FacilityImageDTO> getImagesByFacilityId(Long facilityId) {
        log.info("시설 이미지 목록 조회 시작 - facilityId: {}", facilityId);
        List<FacilityImageDTO> images = facilityImageMapper.getImagesByFacilityId(facilityId);
        log.info("시설 이미지 목록 조회 완료 - facilityId: {}, 이미지 수: {}", facilityId, images.size());
        return images;
    }
    @Transactional(readOnly = true)
    public FacilityImageDTO getMainImageByFacilityId(Long facilityId) {
        log.info("시설 메인 이미지 조회 - facilityId: {}", facilityId);
        return facilityImageMapper.getMainImageByFacilityId(facilityId);
    }
    @Transactional
    public void saveFacilityImages(Long facilityId, List<MultipartFile> imageFiles, List<String> altTexts) {
        try {
            log.info("📸 다중 시설 이미지 저장 시작 - facilityId: {}, 요청 이미지 수: {}", facilityId, imageFiles.size());
            int existingImageCount = facilityImageMapper.countImagesByFacilityId(facilityId);
            List<MultipartFile> validFiles = new ArrayList<>();
            for (MultipartFile file : imageFiles) {
                if (!file.isEmpty() && validFiles.size() + existingImageCount < Constants.MAX_FACILITY_IMAGES) {
                    validateImageFile(file);
                    validFiles.add(file);
                }
            }
            if (validFiles.isEmpty()) {
                throw new IllegalArgumentException("저장할 유효한 이미지 파일이 없습니다.");
            }
            if (existingImageCount + validFiles.size() > Constants.MAX_FACILITY_IMAGES) {
                log.warn("⚠️ 일부 이미지는 5장 제한으로 인해 저장되지 않습니다. 기존: {}장, 요청: {}장, 저장 가능: {}장",
                    existingImageCount, imageFiles.size(), validFiles.size());
            }
            log.info("📊 이미지 저장 계획 - 기존: {}장, 새로 저장: {}장, 총: {}장",
                existingImageCount, validFiles.size(), existingImageCount + validFiles.size());
            for (int i = 0; i < validFiles.size(); i++) {
                MultipartFile file = validFiles.get(i);
                String altText = (altTexts != null && i < altTexts.size()) ? altTexts.get(i) : null;
                String imagePath = saveImageFile(file, facilityId.toString(), existingImageCount + i);
                FacilityImageDTO imageDTO = new FacilityImageDTO();
                imageDTO.setFacilityId(facilityId);
                imageDTO.setImagePath(imagePath);
                imageDTO.setImageAltText(altText);
                imageDTO.setImageOrder(existingImageCount + i);
                imageDTO.setIsMainImage(existingImageCount == 0 && i == 0);
                facilityImageMapper.insertFacilityImage(imageDTO);
                log.info("✅ 시설 이미지 저장 완료 - order: {}, path: {}", existingImageCount + i, imagePath);
            }
            updateFacilityMainImageInfo(facilityId);
            log.info("🎉 다중 시설 이미지 저장 완료 - facilityId: {}, 총 {}장 저장", facilityId, validFiles.size());
        } catch (Exception e) {
            log.error("❌ 시설 이미지 저장 중 오류 발생 - facilityId: {}", facilityId, e);
            throw new RuntimeException("시설 이미지 저장에 실패했습니다.", e);
        }
    }
    @Transactional
    public FacilityImageDTO saveSingleFacilityImage(Long facilityId, MultipartFile imageFile, String altText, Integer imageOrder) {
        return saveSingleFacilityImage(facilityId, imageFile, altText, imageOrder, null);
    }
    @Transactional
    public FacilityImageDTO saveSingleFacilityImage(Long facilityId, MultipartFile imageFile, String altText, Integer imageOrder, String customFileName) {
        try {
            log.info("📸 단일 시설 이미지 저장 시작 - facilityId: {}, order: {}, customFileName: '{}'", facilityId, imageOrder, customFileName);
            if (imageFile.isEmpty()) {
                throw new IllegalArgumentException("업로드된 이미지 파일이 비어있습니다.");
            }
            int existingImageCount = facilityImageMapper.countImagesByFacilityId(facilityId);
            if (existingImageCount >= Constants.MAX_FACILITY_IMAGES) {
                throw new IllegalArgumentException(String.format("시설 이미지는 최대 %d장까지만 등록할 수 있습니다. 현재 %d장 등록됨",
                    Constants.MAX_FACILITY_IMAGES, existingImageCount));
            }
            validateImageFile(imageFile);
            String imagePath = saveImageFileWithCustomName(imageFile, facilityId.toString(),
                imageOrder != null ? imageOrder : existingImageCount, customFileName);
            FacilityImageDTO imageDTO = new FacilityImageDTO();
            imageDTO.setFacilityId(facilityId);
            imageDTO.setImagePath(imagePath);
            imageDTO.setImageAltText(altText);
            imageDTO.setImageOrder(imageOrder != null ? imageOrder : existingImageCount);
            imageDTO.setIsMainImage(existingImageCount == 0);
            facilityImageMapper.insertFacilityImage(imageDTO);
            log.info("✅ facility_images 테이블에 저장 완료 - imageId: {}, path: {}, 현재 총 {}장",
                imageDTO.getImageId(), imagePath, existingImageCount + 1);
            updateFacilityMainImageInfo(facilityId);
            return imageDTO;
        } catch (Exception e) {
            log.error("❌ 단일 시설 이미지 저장 중 오류 발생 - facilityId: {}", facilityId, e);
            throw new RuntimeException("시설 이미지 저장에 실패했습니다.", e);
        }
    }
    private void updateFacilityMainImageInfo(Long facilityId) {
        try {
            int imageCount = facilityImageMapper.countImagesByFacilityId(facilityId);
            FacilityImageDTO mainImage = facilityImageMapper.getMainImageByFacilityId(facilityId);
            String mainImagePath = mainImage != null ? mainImage.getImagePath() : null;
            log.info("🔄 시설 테이블 메인 이미지 정보 업데이트 시작 - facilityId: {}, imageCount: {}, mainImagePath: {}",
                    facilityId, imageCount, mainImagePath);
            int updateResult = facilityMapper.updateFacilityMainImage(facilityId, mainImagePath, imageCount);
            if (updateResult > 0) {
                log.info("✅ 시설 테이블 업데이트 성공 - facilityId: {}, 업데이트된 행: {}", facilityId, updateResult);
            } else {
                log.warn("⚠️ 시설 테이블 업데이트 실패 - facilityId: {}, 업데이트된 행: {}", facilityId, updateResult);
            }
        } catch (Exception e) {
            log.error("❌ 시설 테이블 메인 이미지 정보 업데이트 중 오류 - facilityId: {}", facilityId, e);
            throw new RuntimeException("시설 메인 이미지 정보 업데이트에 실패했습니다.", e);
        }
    }
    private String saveImageFileWithCustomName(MultipartFile file, String facilityId, int index, String customFileName) {
        try {
            String uploadDir = Constants.FACILITY_UPLOAD_PATH;
            File uploadDirFile = new File(uploadDir);
            if (!uploadDirFile.exists()) {
                boolean created = uploadDirFile.mkdirs();
                log.info("업로드 디렉토리 생성: {} - {}", uploadDir, created ? "성공" : "실패");
            }
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            String baseName = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                baseName = originalFilename.substring(0, originalFilename.lastIndexOf("."));
            } else if (originalFilename != null) {
                baseName = originalFilename;
                extension = ".jpg";
            }
            String finalFileName;
            if (customFileName != null && !customFileName.trim().isEmpty()) {
                String userFileName = customFileName.trim();
                String userBaseName = userFileName;
                String userExtension = extension;
                if (userFileName.contains(".")) {
                    userBaseName = userFileName.substring(0, userFileName.lastIndexOf("."));
                    userExtension = userFileName.substring(userFileName.lastIndexOf("."));
                }
                String englishBaseName = convertKoreanToEnglish(userBaseName);
                String cleanBaseName = sanitizeFilename(englishBaseName);
                finalFileName = String.format("facility_%s_%d_%s_%s%s",
                        facilityId, index, cleanBaseName,
                        UUID.randomUUID().toString().substring(0, 8), userExtension);
                log.info("📝 사용자 지정 파일명 적용: '{}' → '{}'", customFileName, finalFileName);
            } else {
                return saveImageFile(file, facilityId, index);
            }
            File savedFile = new File(uploadDir + finalFileName);
            file.transferTo(savedFile);
            log.info("시설 이미지 파일 저장 완료: {}", savedFile.getAbsolutePath());
            return "/uploads/facility/" + finalFileName;
        } catch (IOException e) {
            log.error("시설 이미지 파일 저장 중 오류 발생: facilityId={}, index={}, customFileName={}", facilityId, index, customFileName, e);
            throw new RuntimeException("이미지 파일 저장에 실패했습니다.", e);
        }
    }
    private String saveImageFile(MultipartFile file, String facilityId, int index) {
        try {
            String uploadDir = Constants.FACILITY_UPLOAD_PATH;
            File uploadDirFile = new File(uploadDir);
            if (!uploadDirFile.exists()) {
                boolean created = uploadDirFile.mkdirs();
                log.info("업로드 디렉토리 생성: {} - {}", uploadDir, created ? "성공" : "실패");
            }
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            String baseName = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                baseName = originalFilename.substring(0, originalFilename.lastIndexOf("."));
            } else if (originalFilename != null) {
                baseName = originalFilename;
            }
            // 한글 파일명을 영문으로 변환
            String englishBaseName = convertKoreanToEnglish(baseName);
            String cleanBaseName = sanitizeFilename(englishBaseName);
            // 최종 파일명 생성
            String savedFilename;
            if (!cleanBaseName.isEmpty() && !cleanBaseName.equals("facility_image")) {
                savedFilename = String.format("facility_%s_%d_%s_%s%s",
                        facilityId, index, cleanBaseName, UUID.randomUUID().toString().substring(0, 8), extension);
            } else {
                savedFilename = String.format("facility_%s_%d_%s%s",
                        facilityId, index, UUID.randomUUID().toString(), extension);
            }
            log.info("📝 파일명 변환: '{}' → '{}'", originalFilename, savedFilename);
            File savedFile = new File(uploadDir + savedFilename);
            file.transferTo(savedFile);
            log.info("시설 이미지 파일 저장 완료: {}", savedFile.getAbsolutePath());
            return "/uploads/facility/" + savedFilename;
        } catch (IOException e) {
            log.error("시설 이미지 파일 저장 중 오류 발생: facilityId={}, index={}", facilityId, index, e);
            throw new RuntimeException("이미지 파일 저장에 실패했습니다.", e);
        }
    }
    @Transactional
    public void updateMainImage(Long facilityId, Long imageId) {
        try {
            log.info("메인 이미지 변경 시작 - facilityId: {}, imageId: {}", facilityId, imageId);
            facilityImageMapper.clearMainImages(facilityId);
            int result = facilityImageMapper.updateMainImage(facilityId, imageId);
            if (result == 0) {
                throw new RuntimeException("메인 이미지 설정에 실패했습니다.");
            }
            log.info("메인 이미지 변경 완료 - facilityId: {}, imageId: {}", facilityId, imageId);
        } catch (Exception e) {
            log.error("메인 이미지 변경 중 오류 발생 - facilityId: {}, imageId: {}", facilityId, imageId, e);
            throw new RuntimeException("메인 이미지 변경에 실패했습니다.", e);
        }
    }
    @Transactional
    public boolean deleteFacilityImage(Long imageId) {
        try {
            log.info("🗑️ 시설 이미지 완전 삭제 시작 - imageId: {}", imageId);
            FacilityImageDTO imageToDelete = facilityImageMapper.getImageById(imageId);
            if (imageToDelete == null) {
                log.warn("⚠️ 삭제할 이미지를 찾을 수 없음 - imageId: {}", imageId);
                return false;
            }
            String imagePath = imageToDelete.getImagePath();
            log.info("📁 삭제 대상 파일: {}", imagePath);
            int result = facilityImageMapper.deleteFacilityImage(imageId);
            boolean dbDeleteSuccess = result > 0;
            if (dbDeleteSuccess) {
                log.info("✅ DB에서 이미지 삭제 완료 - imageId: {}", imageId);
                boolean fileDeleteSuccess = deleteImageFile(imagePath);
                if (fileDeleteSuccess) {
                    log.info("✅ 파일 시스템에서 이미지 삭제 완료 - path: {}", imagePath);
                } else {
                    log.warn("⚠️ 파일 삭제 실패하였지만 DB 삭제는 성공 - path: {}", imagePath);
                }
                return true;
            } else {
                log.warn("❌ DB에서 이미지 삭제 실패 - imageId: {} (결과: {})", imageId, result);
                return false;
            }
        } catch (Exception e) {
            log.error("❌ 시설 이미지 삭제 중 오류 발생 - imageId: {}", imageId, e);
            return false;
        }
    }
    private boolean deleteImageFile(String imagePath) {
        try {
            if (imagePath == null || imagePath.trim().isEmpty()) {
                log.warn("⚠️ 삭제할 파일 경로가 비어있음");
                return false;
            }
            String actualFilePath;
            if (imagePath.startsWith("/uploads/facility/")) {
                String filename = imagePath.substring("/uploads/facility/".length());
                actualFilePath = Constants.FACILITY_UPLOAD_PATH + filename;
            } else {
                log.warn("⚠️ 예상치 못한 파일 경로 형식: {}", imagePath);
                return false;
            }
            log.info("🔍 실제 파일 경로: {}", actualFilePath);
            File fileToDelete = new File(actualFilePath);
            if (fileToDelete.exists()) {
                boolean deleted = fileToDelete.delete();
                if (deleted) {
                    log.info("✅ 파일 삭제 성공: {}", actualFilePath);
                    return true;
                } else {
                    log.error("❌ 파일 삭제 실패: {}", actualFilePath);
                    return false;
                }
            } else {
                log.warn("⚠️ 삭제할 파일이 존재하지 않음: {}", actualFilePath);
                return true;
            }
        } catch (Exception e) {
            log.error("❌ 파일 삭제 중 오류 발생 - imagePath: {}", imagePath, e);
            return false;
        }
    }
    @Transactional(readOnly = true)
    public int getImageCountByFacilityId(Long facilityId) {
        return facilityImageMapper.countImagesByFacilityId(facilityId);
    }
    @Transactional
    public boolean setMainImage(Long facilityId, Long imageId) {
        try {
            log.info("메인 이미지 설정 시작 - facilityId: {}, imageId: {}", facilityId, imageId);
            facilityImageMapper.clearMainImages(facilityId);
            int result = facilityImageMapper.updateMainImage(facilityId, imageId);
            boolean success = result > 0;
            if (success) {
                log.info("메인 이미지 설정 완료 - facilityId: {}, imageId: {}", facilityId, imageId);
            } else {
                log.warn("메인 이미지 설정 실패 - facilityId: {}, imageId: {} (결과: {})", facilityId, imageId, result);
            }
            return success;
        } catch (Exception e) {
            log.error("메인 이미지 설정 중 오류 발생 - facilityId: {}, imageId: {}", facilityId, imageId, e);
            return false;
        }
    }
    @Transactional(readOnly = true)
    public FacilityImageDTO getImageById(Long imageId) {
        log.info("시설 이미지 조회 - imageId: {}", imageId);
        return facilityImageMapper.getImageById(imageId);
    }
    @Transactional(readOnly = true)
    public List<FacilityImageDTO> getAllImages() {
        log.info("모든 시설 이미지 목록 조회 (임시)");
        return java.util.Collections.emptyList();
    }
    private String convertKoreanToEnglish(String korean) {
        if (korean == null || korean.trim().isEmpty()) {
            return "facility_image";
        }
        String input = korean.toLowerCase().trim();
        String result = input;
        java.util.Map<String, String> koreanToEnglish = java.util.Map.ofEntries(
            java.util.Map.entry("시설", "facility"),
            java.util.Map.entry("요양원", "nursing_home"),
            java.util.Map.entry("요양병원", "nursing_hospital"),
            java.util.Map.entry("병원", "hospital"),
            java.util.Map.entry("의원", "clinic"),
            java.util.Map.entry("데이케어", "daycare"),
            java.util.Map.entry("센터", "center"),
            java.util.Map.entry("홈", "home"),
            java.util.Map.entry("케어", "care"),
            java.util.Map.entry("외관", "exterior"),
            java.util.Map.entry("외부", "exterior"),
            java.util.Map.entry("건물", "building"),
            java.util.Map.entry("입구", "entrance"),
            java.util.Map.entry("현관", "entrance"),
            java.util.Map.entry("내부", "interior"),
            java.util.Map.entry("로비", "lobby"),
            java.util.Map.entry("복도", "corridor"),
            java.util.Map.entry("홀", "hall"),
            java.util.Map.entry("방", "room"),
            java.util.Map.entry("객실", "room"),
            java.util.Map.entry("침실", "bedroom"),
            java.util.Map.entry("생활실", "living_room"),
            java.util.Map.entry("휴게실", "rest_room"),
            java.util.Map.entry("식당", "dining_room"),
            java.util.Map.entry("주방", "kitchen"),
            java.util.Map.entry("카페", "cafe"),
            java.util.Map.entry("화장실", "restroom"),
            java.util.Map.entry("욕실", "bathroom"),
            java.util.Map.entry("세탁실", "laundry"),
            java.util.Map.entry("치료실", "treatment_room"),
            java.util.Map.entry("의무실", "medical_room"),
            java.util.Map.entry("상담실", "consultation_room"),
            java.util.Map.entry("간호사실", "nurses_station"),
            java.util.Map.entry("재활실", "rehabilitation_room"),
            java.util.Map.entry("물리치료실", "physical_therapy_room"),
            java.util.Map.entry("운동실", "exercise_room"),
            java.util.Map.entry("헬스장", "gym"),
            java.util.Map.entry("프로그램실", "program_room"),
            java.util.Map.entry("강당", "auditorium"),
            java.util.Map.entry("도서실", "library"),
            java.util.Map.entry("오락실", "recreation_room"),
            java.util.Map.entry("정원", "garden"),
            java.util.Map.entry("마당", "yard"),
            java.util.Map.entry("테라스", "terrace"),
            java.util.Map.entry("발코니", "balcony"),
            java.util.Map.entry("주차장", "parking_lot"),
            java.util.Map.entry("산책로", "walking_path"),
            java.util.Map.entry("엘리베이터", "elevator"),
            java.util.Map.entry("계단", "stairs"),
            java.util.Map.entry("사무실", "office"),
            java.util.Map.entry("접수처", "reception"),
            java.util.Map.entry("간호", "nursing"),
            java.util.Map.entry("간병", "care"),
            java.util.Map.entry("치료", "treatment"),
            java.util.Map.entry("재활", "rehabilitation"),
            java.util.Map.entry("물리치료", "physical_therapy"),
            java.util.Map.entry("건강관리", "health_care"),
            java.util.Map.entry("깨끗한", "clean"),
            java.util.Map.entry("밝은", "bright"),
            java.util.Map.entry("넓은", "spacious"),
            java.util.Map.entry("안전한", "safe"),
            java.util.Map.entry("편안한", "comfortable"),
            java.util.Map.entry("현대적", "modern"),
            java.util.Map.entry("고급", "premium"),
            java.util.Map.entry("아침", "morning"),
            java.util.Map.entry("점심", "lunch"),
            java.util.Map.entry("저녁", "evening"),
            java.util.Map.entry("앞", "front"),
            java.util.Map.entry("뒤", "back"),
            java.util.Map.entry("층", "floor"),
            java.util.Map.entry("1층", "first_floor"),
            java.util.Map.entry("2층", "second_floor"),
            java.util.Map.entry("1", "one"),
            java.util.Map.entry("2", "two"),
            java.util.Map.entry("3", "three"),
            java.util.Map.entry("4", "four"),
            java.util.Map.entry("5", "five"),
            java.util.Map.entry("첫번째", "first"),
            java.util.Map.entry("두번째", "second"),
            java.util.Map.entry("세번째", "third")
        );
        for (java.util.Map.Entry<String, String> entry : koreanToEnglish.entrySet()) {
            result = result.replace(entry.getKey(), entry.getValue());
        }
        if (containsKorean(result)) {
            result = convertKoreanToRomanization(result);
        }
        return result;
    }
    private String convertKoreanToRomanization(String korean) {
        if (korean == null || korean.trim().isEmpty()) {
            return "korean_text";
        }
        java.util.Map<String, String> koreanRomanization = java.util.Map.ofEntries(
            java.util.Map.entry("ㄱ", "g"), java.util.Map.entry("ㄴ", "n"), java.util.Map.entry("ㄷ", "d"),
            java.util.Map.entry("ㄹ", "r"), java.util.Map.entry("ㅁ", "m"), java.util.Map.entry("ㅂ", "b"),
            java.util.Map.entry("ㅅ", "s"), java.util.Map.entry("ㅇ", ""), java.util.Map.entry("ㅈ", "j"),
            java.util.Map.entry("ㅊ", "ch"), java.util.Map.entry("ㅋ", "k"), java.util.Map.entry("ㅌ", "t"),
            java.util.Map.entry("ㅍ", "p"), java.util.Map.entry("ㅎ", "h"),
            java.util.Map.entry("ㅏ", "a"), java.util.Map.entry("ㅑ", "ya"), java.util.Map.entry("ㅓ", "eo"),
            java.util.Map.entry("ㅕ", "yeo"), java.util.Map.entry("ㅗ", "o"), java.util.Map.entry("ㅛ", "yo"),
            java.util.Map.entry("ㅜ", "u"), java.util.Map.entry("ㅠ", "yu"), java.util.Map.entry("ㅡ", "eu"),
            java.util.Map.entry("ㅣ", "i"), java.util.Map.entry("ㅐ", "ae"), java.util.Map.entry("ㅔ", "e"),
            java.util.Map.entry("가", "ga"), java.util.Map.entry("나", "na"), java.util.Map.entry("다", "da"),
            java.util.Map.entry("라", "ra"), java.util.Map.entry("마", "ma"), java.util.Map.entry("바", "ba"),
            java.util.Map.entry("사", "sa"), java.util.Map.entry("자", "ja"), java.util.Map.entry("차", "cha"),
            java.util.Map.entry("카", "ka"), java.util.Map.entry("타", "ta"), java.util.Map.entry("파", "pa"),
            java.util.Map.entry("하", "ha"),
            java.util.Map.entry("김", "kim"), java.util.Map.entry("이", "lee"), java.util.Map.entry("박", "park"),
            java.util.Map.entry("최", "choi"), java.util.Map.entry("정", "jung"), java.util.Map.entry("강", "kang"),
            java.util.Map.entry("조", "cho"), java.util.Map.entry("윤", "yoon"), java.util.Map.entry("장", "jang"),
            java.util.Map.entry("임", "lim"), java.util.Map.entry("한", "han"), java.util.Map.entry("오", "oh"),
            java.util.Map.entry("서", "seo"), java.util.Map.entry("신", "shin"), java.util.Map.entry("권", "kwon"),
            java.util.Map.entry("황", "hwang"), java.util.Map.entry("안", "ahn"), java.util.Map.entry("송", "song"),
            java.util.Map.entry("류", "ryu"), java.util.Map.entry("전", "jeon"), java.util.Map.entry("홍", "hong")
        );
        String result = korean;
        for (java.util.Map.Entry<String, String> entry : koreanRomanization.entrySet()) {
            result = result.replace(entry.getKey(), entry.getValue());
        }
        if (containsKorean(result)) {
            result = "korean_" + System.currentTimeMillis() % 10000;
        }
        return result;
    }
    private String sanitizeFilename(String filename) {
        if (filename == null || filename.trim().isEmpty()) {
            return "facility_image";
        }
        String sanitized = filename.replaceAll("[^a-zA-Z0-9_-]", "_")
                                  .replaceAll("_{2,}", "_")
                                  .replaceAll("^_+|_+$", ""); // 앞뒤 언더스코어 제거
        // 너무 길면 자르기 (최대 30자)
        if (sanitized.length() > 30) {
            sanitized = sanitized.substring(0, 30);
        }
        // 비어있으면 기본값
        if (sanitized.isEmpty()) {
            sanitized = "facility_image";
        }
        return sanitized;
    }
    private boolean containsKorean(String text) {
        if (text == null) return false;
        return text.matches(".*[ㄱ-ㅎㅏ-ㅣ가-힣]+.*");
    }
    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("이미지 파일이 비어있습니다.");
        }
        if (file.getSize() > Constants.MAX_FILE_SIZE) {
            throw new IllegalArgumentException(String.format("파일 크기가 너무 큽니다. 최대 %dMB까지 업로드 가능합니다.",
                Constants.MAX_FILE_SIZE / (1024 * 1024)));
        }
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.contains(".")) {
            throw new IllegalArgumentException("유효하지 않은 파일입니다.");
        }
        String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        boolean isValidExtension = false;
        for (String allowedExt : Constants.ALLOWED_IMAGE_EXTENSIONS) {
            if (allowedExt.equals(extension)) {
                isValidExtension = true;
                break;
            }
        }
        if (!isValidExtension) {
            throw new IllegalArgumentException(String.format("지원하지 않는 파일 형식입니다. 지원 형식: %s",
                String.join(", ", Constants.ALLOWED_IMAGE_EXTENSIONS)));
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("이미지 파일만 업로드 가능합니다.");
        }
        log.debug("✅ 이미지 파일 검증 통과 - 파일명: {}, 크기: {}KB, 타입: {}",
            originalFilename, file.getSize() / 1024, contentType);
    }
    @Transactional
    public boolean updateImageOrder(Long imageId, Integer imageOrder) {
        try {
            log.info("🔢 이미지 순서 업데이트 - imageId: {}, newOrder: {}", imageId, imageOrder);
            int result = facilityImageMapper.updateImageOrder(imageId, imageOrder);
            boolean success = result > 0;
            if (success) {
                log.info("✅ 이미지 순서 업데이트 성공 - imageId: {}, newOrder: {}", imageId, imageOrder);
            } else {
                log.warn("⚠️ 이미지 순서 업데이트 실패 - imageId: {}, newOrder: {}", imageId, imageOrder);
            }
            return success;
        } catch (Exception e) {
            log.error("❌ 이미지 순서 업데이트 중 오류 발생 - imageId: {}, newOrder: {}", imageId, imageOrder, e);
            return false;
        }
    }
    @Transactional
    public boolean reorderAllFacilityImages(Long facilityId) {
        try {
            log.info("🔄 시설 이미지 순서 재정렬 시작 - facilityId: {}", facilityId);
            List<FacilityImageDTO> images = facilityImageMapper.getImagesByFacilityId(facilityId);
            if (images.isEmpty()) {
                log.info("ℹ️ 재정렬할 이미지가 없음 - facilityId: {}", facilityId);
                return true;
            }
            log.info("📊 재정렬할 이미지 수: {} - facilityId: {}", images.size(), facilityId);
            for (int i = 0; i < images.size(); i++) {
                FacilityImageDTO image = images.get(i);
                int newOrder = i;
                if (image.getImageOrder() == null || !image.getImageOrder().equals(newOrder)) {
                    int updateResult = facilityImageMapper.updateImageOrder(image.getImageId(), newOrder);
                    if (updateResult > 0) {
                        log.debug("✅ 이미지 순서 재정렬 - imageId: {}, 기존: {} → 새로운: {}",
                            image.getImageId(), image.getImageOrder(), newOrder);
                    } else {
                        log.warn("⚠️ 이미지 순서 재정렬 실패 - imageId: {}, 새로운 순서: {}",
                            image.getImageId(), newOrder);
                    }
                }
            }
            log.info("✅ 시설 이미지 순서 재정렬 완료 - facilityId: {}", facilityId);
            return true;
        } catch (Exception e) {
            log.error("❌ 시설 이미지 순서 재정렬 중 오류 발생 - facilityId: {}", facilityId, e);
            return false;
        }
    }
    @Transactional
    public boolean updateImageOrdersBatch(Long facilityId, List<Long> imageIds) {
        try {
            log.info("🔢 배치 이미지 순서 업데이트 시작 - facilityId: {}, imageIds: {}", facilityId, imageIds);
            if (imageIds == null || imageIds.isEmpty()) {
                log.warn("⚠️ 업데이트할 이미지 ID 목록이 비어있음 - facilityId: {}", facilityId);
                return false;
            }
            int existingImageCount = facilityImageMapper.countImagesByFacilityId(facilityId);
            if (imageIds.size() > existingImageCount) {
                log.warn("⚠️ 전달받은 이미지 ID 수가 기존 이미지 수보다 많음 - facilityId: {}, 전달받은: {}, 기존: {}",
                    facilityId, imageIds.size(), existingImageCount);
                return false;
            }
            int successCount = 0;
            for (int i = 0; i < imageIds.size(); i++) {
                Long imageId = imageIds.get(i);
                int newOrder = i;
                FacilityImageDTO existingImage = facilityImageMapper.getImageById(imageId);
                if (existingImage == null || !existingImage.getFacilityId().equals(facilityId)) {
                    log.warn("⚠️ 잘못된 이미지 ID 또는 시설 불일치 - imageId: {}, facilityId: {}",
                        imageId, facilityId);
                    continue;
                }
                int updateResult = facilityImageMapper.updateImageOrder(imageId, newOrder);
                if (updateResult > 0) {
                    successCount++;
                    log.debug("✅ 이미지 순서 업데이트 - imageId: {}, 새로운 순서: {}", imageId, newOrder);
                } else {
                    log.warn("⚠️ 이미지 순서 업데이트 실패 - imageId: {}, 새로운 순서: {}", imageId, newOrder);
                }
            }
            boolean success = successCount == imageIds.size();
            if (success) {
                log.info("✅ 배치 이미지 순서 업데이트 완료 - facilityId: {}, 성공: {}/{}",
                    facilityId, successCount, imageIds.size());
            } else {
                log.warn("⚠️ 배치 이미지 순서 업데이트 부분 실패 - facilityId: {}, 성공: {}/{}",
                    facilityId, successCount, imageIds.size());
            }
            return success;
        } catch (Exception e) {
            log.error("❌ 배치 이미지 순서 업데이트 중 오류 발생 - facilityId: {}", facilityId, e);
            return false;
        }
    }
    @Transactional
    public boolean deleteAllFacilityImages(Long facilityId) {
        try {
            log.info("🗑️ 시설의 모든 이미지 완전 삭제 시작 - facilityId: {}", facilityId);
            List<FacilityImageDTO> imagesToDelete = facilityImageMapper.getImagesByFacilityId(facilityId);
            if (imagesToDelete.isEmpty()) {
                log.info("ℹ️ 삭제할 이미지가 없음 - facilityId: {}", facilityId);
                return true;
            }
            log.info("📊 삭제할 이미지 수: {}", imagesToDelete.size());
            List<String> imagePaths = new ArrayList<>();
            for (FacilityImageDTO image : imagesToDelete) {
                if (image.getImagePath() != null && !image.getImagePath().trim().isEmpty()) {
                    imagePaths.add(image.getImagePath());
                }
            }
            int deletedCount = facilityImageMapper.deleteAllImagesByFacilityId(facilityId);
            log.info("✅ DB에서 {} 개 이미지 삭제 완료 - facilityId: {}", deletedCount, facilityId);
            int fileDeletedCount = 0;
            for (String imagePath : imagePaths) {
                if (deleteImageFile(imagePath)) {
                    fileDeletedCount++;
                }
            }
            log.info("✅ 파일 시스템에서 {}/{} 개 파일 삭제 완료", fileDeletedCount, imagePaths.size());
            return deletedCount > 0;
        } catch (Exception e) {
            log.error("❌ 시설의 모든 이미지 삭제 중 오류 발생 - facilityId: {}", facilityId, e);
            return false;
        }
    }
    @Transactional
    public List<FacilityImageDTO> uploadMultipleImages(Long facilityId, List<MultipartFile> images) {
        List<FacilityImageDTO> uploadedImages = new ArrayList<>();
        try {
            log.info("📤 다중 이미지 업로드 시작 - facilityId: {}, 이미지 수: {}", facilityId, images.size());
            List<FacilityImageDTO> existingImages = facilityImageMapper.getImagesByFacilityId(facilityId);
            int currentCount = existingImages.size();
            int nextOrderNum = currentCount + 1;
            log.info("기존 이미지 수: {}, 시작 순서 번호: {}", currentCount, nextOrderNum);
            String uploadDir = Constants.FACILITY_UPLOAD_PATH;
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                boolean created = directory.mkdirs();
                log.info("업로드 디렉토리 생성: {} (성공: {})", uploadDir, created);
            }
            for (int i = 0; i < images.size(); i++) {
                MultipartFile image = images.get(i);
                try {
                    String originalFilename = image.getOriginalFilename();
                    String extension = "";
                    if (originalFilename != null && originalFilename.contains(".")) {
                        extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                    }
                    String uniqueFilename = UUID.randomUUID().toString() + extension;
                    String filePath = uploadDir + uniqueFilename;
                    // 파일 저장
                    File destinationFile = new File(filePath);
                    image.transferTo(destinationFile);
                    log.info("파일 저장 완료: {} -> {}", originalFilename, uniqueFilename);
                    // DTO 생성
                    FacilityImageDTO imageDTO = new FacilityImageDTO();
                    imageDTO.setFacilityId(facilityId);
                    imageDTO.setImagePath("/uploads/facility/" + uniqueFilename);
                    imageDTO.setImageAltText(originalFilename); // ALT 텍스트에 원본 파일명 저장
                    imageDTO.setImageOrder(nextOrderNum + i);
                    imageDTO.setIsMainImage(currentCount == 0 && i == 0); // 첫 번째 이미지가 메인
                    // DB 저장
                    int result = facilityImageMapper.insertFacilityImage(imageDTO);
                    if (result > 0) {
                        uploadedImages.add(imageDTO);
                        log.info("이미지 DB 저장 완료: {} (순서: {})", uniqueFilename, imageDTO.getImageOrder());
                    } else {
                        log.warn("이미지 DB 저장 실패: {}", uniqueFilename);
                        // 실패한 파일 삭제
                        destinationFile.delete();
                    }
                } catch (IOException e) {
                    log.error("이미지 파일 저장 실패: {}", image.getOriginalFilename(), e);
                } catch (Exception e) {
                    log.error("이미지 처리 중 오류: {}", image.getOriginalFilename(), e);
                }
            }
            log.info("✅ 다중 이미지 업로드 완료 - facilityId: {}, 성공: {}/{}",
                    facilityId, uploadedImages.size(), images.size());
            return uploadedImages;
        } catch (Exception e) {
            log.error("❌ 다중 이미지 업로드 중 오류 발생 - facilityId: {}", facilityId, e);
            // 실패 시 업로드된 파일들 롤백
            for (FacilityImageDTO uploadedImage : uploadedImages) {
                try {
                    if (uploadedImage.getImageId() != null) {
                        facilityImageMapper.deleteFacilityImage(uploadedImage.getImageId());
                    }
                    deleteImageFile(uploadedImage.getImagePath());
                } catch (Exception rollbackException) {
                    log.error("롤백 중 오류:", rollbackException);
                }
            }
            throw new RuntimeException("이미지 업로드 중 오류가 발생했습니다.", e);
        }
    }
}
````

## File: src/main/java/com/example/carelink/service/ReviewService.java
````java
package com.example.carelink.service;
import com.example.carelink.common.PageInfo;
import com.example.carelink.dao.ReviewMapper;
import com.example.carelink.dto.ReviewDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewMapper reviewMapper;
    private static final int DEFAULT_PAGE_SIZE = 10;
    public PageInfo<ReviewDTO> getReviewList(int page, String keyword) {
        return getReviewList(page, keyword, null, null);
    }
    public PageInfo<ReviewDTO> getReviewList(int page, String keyword, Integer minRating) {
        return getReviewList(page, keyword, minRating, null);
    }
    public PageInfo<ReviewDTO> getReviewList(int page, String keyword, Integer minRating, Long facilityId) {
        log.info("리뷰 목록 조회 시작 - page: {}, keyword: {}, minRating: {}, facilityId: {}", page, keyword, minRating, facilityId);
        try {
            ReviewDTO searchDTO = new ReviewDTO();
            searchDTO.setPage(page);
            searchDTO.setSize(DEFAULT_PAGE_SIZE);
            if (keyword != null && !keyword.trim().isEmpty()) {
                searchDTO.setSearchKeyword(keyword.trim());
            }
            if (minRating != null) {
                searchDTO.setMinRating(minRating);
            }
            if (facilityId != null) {
                searchDTO.setFacilityId(facilityId);
            }
            int totalCount = reviewMapper.countReviewsWithSearch(searchDTO);
            List<ReviewDTO> reviewList = reviewMapper.findReviewsWithSearch(searchDTO);
            log.info("리뷰 목록 조회 완료 - 조회된 건수: {}, 전체: {}", reviewList.size(), totalCount);
            return new PageInfo<>(reviewList, page, DEFAULT_PAGE_SIZE, totalCount);
        } catch (Exception e) {
            log.error("리뷰 목록 조회 중 오류 발생", e);
            throw new RuntimeException("리뷰 목록을 불러오는 중 오류가 발생했습니다.", e);
        }
    }
    @Transactional
    public ReviewDTO getReviewById(Long id) {
        log.info("리뷰 상세 조회 시작 - reviewId: {}", id);
        try {
            ReviewDTO review = reviewMapper.findReviewById(id);
            if (review == null) {
                throw new RuntimeException("해당 리뷰를 찾을 수 없습니다. ID: " + id);
            }
            reviewMapper.incrementViewCount(id);
            log.info("리뷰 상세 조회 완료 - reviewId: {}, title: {}", id, review.getTitle());
            return review;
        } catch (Exception e) {
            log.error("리뷰 상세 조회 중 오류 발생 - reviewId: {}", id, e);
            throw new RuntimeException("리뷰 상세 정보를 불러오는 중 오류가 발생했습니다.", e);
        }
    }
    @Transactional
    public int insertReview(ReviewDTO reviewDTO) {
        log.info("리뷰 등록 시작 - title: {}, facilityId: {}", reviewDTO.getTitle(), reviewDTO.getFacilityId());
        try {
            validateReviewData(reviewDTO);
            if (reviewDTO.getStatus() == null) {
                reviewDTO.setStatus("ACTIVE");
            }
            if (reviewDTO.getReplyDepth() == null) {
                reviewDTO.setReplyDepth(0);
            }
            reviewDTO.setVisible(true);
            reviewDTO.setDeleted(false);
            int result = reviewMapper.insertReview(reviewDTO);
            log.info("리뷰 등록 완료 - reviewId: {}", reviewDTO.getReviewId());
            return result;
        } catch (Exception e) {
            log.error("리뷰 등록 중 오류 발생", e);
            throw new RuntimeException("리뷰 등록 중 오류가 발생했습니다.", e);
        }
    }
    public List<ReviewDTO> getReviewsByFacilityId(Long facilityId) {
        log.info("시설별 리뷰 조회 시작 - facilityId: {}", facilityId);
        try {
            List<ReviewDTO> reviews = reviewMapper.findReviewsByFacilityId(facilityId);
            log.info("시설별 리뷰 조회 완료 - facilityId: {}, 조회된 건수: {}", facilityId, reviews.size());
            return reviews;
        } catch (Exception e) {
            log.error("시설별 리뷰 조회 중 오류 발생 - facilityId: {}", facilityId, e);
            throw new RuntimeException("시설별 리뷰를 불러오는 중 오류가 발생했습니다.", e);
        }
    }
    @Transactional
    public int deleteReview(Long id) {
        log.info("리뷰 삭제 시작 - reviewId: {}", id);
        try {
            ReviewDTO existingReview = reviewMapper.findReviewById(id);
            if (existingReview == null) {
                throw new RuntimeException("삭제할 리뷰를 찾을 수 없습니다. ID: " + id);
            }
            int result = reviewMapper.deleteReview(id);
            log.info("리뷰 삭제 완료 - reviewId: {}", id);
            return result;
        } catch (Exception e) {
            log.error("리뷰 삭제 중 오류 발생 - reviewId: {}", id, e);
            throw new RuntimeException("리뷰 삭제 중 오류가 발생했습니다.", e);
        }
    }
    public Double getAverageRating(Long facilityId) {
        log.info("평균 평점 조회 시작 - facilityId: {}", facilityId);
        try {
            Double averageRating = reviewMapper.getAverageRating(facilityId);
            if (averageRating == null) {
                averageRating = 0.0;
            }
            log.info("평균 평점 조회 완료 - facilityId: {}, 평균 평점: {}", facilityId, averageRating);
            return averageRating;
        } catch (Exception e) {
            log.error("평균 평점 조회 중 오류 발생 - facilityId: {}", facilityId, e);
            return 0.0;
        }
    }
    @Transactional
    public int likeReview(Long reviewId) {
        log.info("리뷰 추천 시작 - reviewId: {}", reviewId);
        try {
            int result = reviewMapper.incrementLikeCount(reviewId);
            log.info("리뷰 추천 완료 - reviewId: {}", reviewId);
            return result;
        } catch (Exception e) {
            log.error("리뷰 추천 중 오류 발생 - reviewId: {}", reviewId, e);
            throw new RuntimeException("리뷰 추천 중 오류가 발생했습니다.", e);
        }
    }
    @Transactional
    public int dislikeReview(Long reviewId) {
        log.info("리뷰 비추천 시작 - reviewId: {}", reviewId);
        try {
            int result = reviewMapper.incrementDislikeCount(reviewId);
            log.info("리뷰 비추천 완료 - reviewId: {}", reviewId);
            return result;
        } catch (Exception e) {
            log.error("리뷰 비추천 중 오류 발생 - reviewId: {}", reviewId, e);
            throw new RuntimeException("리뷰 비추천 중 오류가 발생했습니다.", e);
        }
    }
    public List<ReviewDTO> getReviewsByMemberId(Long memberId) {
        log.info("회원별 리뷰 조회 시작 - memberId: {}", memberId);
        try {
            List<ReviewDTO> reviews = reviewMapper.findReviewsByMemberId(memberId);
            log.info("회원별 리뷰 조회 완료 - memberId: {}, 조회된 건수: {}", memberId, reviews.size());
            return reviews;
        } catch (Exception e) {
            log.error("회원별 리뷰 조회 중 오류 발생 - memberId: {}", memberId, e);
            throw new RuntimeException("회원별 리뷰를 불러오는 중 오류가 발생했습니다.", e);
        }
    }
    private void validateReviewData(ReviewDTO reviewDTO) {
        if (reviewDTO.getFacilityId() == null) {
            throw new IllegalArgumentException("시설 ID는 필수입니다.");
        }
        if (reviewDTO.getMemberId() == null) {
            throw new IllegalArgumentException("회원 ID는 필수입니다.");
        }
        if (reviewDTO.getTitle() == null || reviewDTO.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("리뷰 제목은 필수입니다.");
        }
        if (reviewDTO.getContent() == null || reviewDTO.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("리뷰 내용은 필수입니다.");
        }
        if (reviewDTO.getRating() == null || reviewDTO.getRating() < 1 || reviewDTO.getRating() > 5) {
            throw new IllegalArgumentException("평점은 1~5 사이의 값이어야 합니다.");
        }
    }
    @Transactional(readOnly = true)
    public int getReviewCount() {
        try {
            return reviewMapper.getReviewCount();
        } catch (Exception e) {
            log.error("리뷰 수 조회 중 오류 발생", e);
            return 0;
        }
    }
    @Transactional
    public int updateReview(ReviewDTO reviewDTO) {
        log.info("리뷰 수정 시작 - reviewId: {}, title: {}", reviewDTO.getReviewId(), reviewDTO.getTitle());
        try {
            ReviewDTO existingReview = reviewMapper.findReviewById(reviewDTO.getReviewId());
            if (existingReview == null) {
                throw new RuntimeException("수정할 리뷰를 찾을 수 없습니다. ID: " + reviewDTO.getReviewId());
            }
            validateReviewData(reviewDTO);
            if (reviewDTO.getStatus() == null || reviewDTO.getStatus().isEmpty()) {
                reviewDTO.setStatus("ACTIVE");
            }
            int result = reviewMapper.updateReview(reviewDTO);
            log.info("리뷰 수정 완료 - reviewId: {}", reviewDTO.getReviewId());
            return result;
        } catch (Exception e) {
            log.error("리뷰 수정 중 오류 발생 - reviewId: {}", reviewDTO.getReviewId(), e);
            throw new RuntimeException("리뷰 수정 중 오류가 발생했습니다.", e);
        }
    }
    @Transactional
    public int incrementViewCount(Long id) {
        log.info("조회수 증가 시작 - reviewId: {}", id);
        try {
            int result = reviewMapper.incrementViewCount(id);
            log.info("조회수 증가 완료 - reviewId: {}", id);
            return result;
        } catch (Exception e) {
            log.error("조회수 증가 중 오류 발생 - reviewId: {}", id, e);
            return 0;
        }
    }
}
````

## File: src/main/java/com/example/carelink/controller/JobController.java
````java
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
@Controller
@RequestMapping("/job")
@RequiredArgsConstructor
public class JobController {
    private final JobService jobService;
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
    @GetMapping("/write")
    public String writePage(@RequestParam(defaultValue = "RECRUIT") String type, Model model, HttpSession session) {
        MemberDTO loggedInMember = getCurrentMember(session);
        if (loggedInMember == null) {
            session.setAttribute("errorMessage", "로그인 후 이용해주세요.");
            return "redirect:/member/login";
        }
        String defaultType = type;
        if ("FACILITY".equals(loggedInMember.getRole())) {
            defaultType = "RECRUIT";
        } else if ("USER".equals(loggedInMember.getRole())) {
            defaultType = "SEARCH";
        }
        JobDTO jobDTO = new JobDTO();
        jobDTO.setJobType(defaultType);
        model.addAttribute("jobDTO", jobDTO);
        model.addAttribute("selectedType", defaultType);
        model.addAttribute("currentMember", loggedInMember);
        return "job/write";
    }
    @PostMapping("/write")
    public String writeJob(@ModelAttribute JobDTO jobDTO, HttpSession session) {
        MemberDTO loggedInMember = getCurrentMember(session);
        if (loggedInMember == null) {
            session.setAttribute("errorMessage", "로그인 후 이용해주세요.");
            return "redirect:/member/login";
        }
        String jobType = jobDTO.getJobType();
        String userRole = loggedInMember.getRole();
        if ("FACILITY".equals(userRole) && "SEARCH".equals(jobType)) {
            session.setAttribute("errorMessage", "시설회원은 구인공고만 작성할 수 있습니다.");
            return "redirect:/job/write?type=RECRUIT";
        }
        if ("USER".equals(userRole) && "RECRUIT".equals(jobType)) {
            session.setAttribute("errorMessage", "일반회원은 구직공고만 작성할 수 있습니다.");
            return "redirect:/job/write?type=SEARCH";
        }
        if (jobDTO.getStatus() == null || jobDTO.getStatus().isEmpty()) {
            jobDTO.setStatus("ACTIVE");
        }
        jobDTO.setMemberId(loggedInMember.getMemberId());
        if (jobDTO.getPriority() == null) {
            jobDTO.setPriority(0);
        }
        try {
            jobService.insertJob(jobDTO);
            session.setAttribute("successMessage", "공고가 성공적으로 등록되었습니다.");
            return "redirect:/job";
        } catch (Exception e) {
            session.setAttribute("errorMessage", "공고 등록 중 오류가 발생했습니다. 다시 시도해주세요.");
            return "redirect:/job/write?type=" + jobType;
        }
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
            }
            model.addAttribute("job", job);
            return "job/detail";
        } catch (Exception e) {
            e.printStackTrace();
            session.setAttribute("errorMessage", "구인공고 조회 중 오류가 발생했습니다.");
            return "redirect:/job";
        }
    }
    @GetMapping("/edit/{id}")
    public String editPage(@PathVariable Long id, Model model, HttpSession session) {
        MemberDTO loggedInMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        if (loggedInMember == null) {
            return "redirect:/member/login";
        }
        JobDTO job = jobService.getJobById(id);
        if (job == null) {
            session.setAttribute("errorMessage", "해당 구인공고를 찾을 수 없습니다.");
            return "redirect:/job";
        }
        if (!canEditJob(loggedInMember, job.getMemberId())) {
            session.setAttribute("errorMessage", "수정 권한이 없습니다. 작성자 또는 관리자만 수정할 수 있습니다.");
            return "redirect:/job/detail/" + id;
        }
        model.addAttribute("jobDTO", job);
        return "job/edit";
    }
    @PostMapping("/edit/{id}")
    public String editJob(@PathVariable Long id, @ModelAttribute JobDTO jobDTO, HttpSession session) {
        MemberDTO loggedInMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        if (loggedInMember == null) {
            return "redirect:/member/login";
        }
        JobDTO existingJob = jobService.getJobById(id);
        if (existingJob == null) {
            session.setAttribute("errorMessage", "해당 구인공고를 찾을 수 없습니다.");
            return "redirect:/job";
        }
        if (!canEditJob(loggedInMember, existingJob.getMemberId())) {
            session.setAttribute("errorMessage", "수정 권한이 없습니다. 작성자 또는 관리자만 수정할 수 있습니다.");
            return "redirect:/job/detail/" + id;
        }
        jobDTO.setJobId(id);
        jobDTO.setMemberId(loggedInMember.getMemberId());
        jobService.updateJob(jobDTO);
        return "redirect:/job/detail/" + id;
    }
    @PostMapping("/delete/{id}")
    public String deleteJob(@PathVariable Long id, HttpSession session) {
        MemberDTO loggedInMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        if (loggedInMember == null) {
            return "redirect:/member/login";
        }
        JobDTO existingJob = jobService.getJobById(id);
        if (existingJob == null) {
            session.setAttribute("errorMessage", "해당 구인공고를 찾을 수 없습니다.");
            return "redirect:/job";
        }
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
    @PostMapping("/{id}/apply")
    public String applyForJob(@PathVariable Long id, HttpSession session, RedirectAttributes redirectAttributes) {
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
            jobService.applyForJob(id, loggedInMember.getMemberId());
            redirectAttributes.addFlashAttribute("successMessage", "구인공고 지원이 완료되었습니다!");
            return "redirect:/job/detail/" + id;
        } catch (IllegalArgumentException e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            return "redirect:/job/detail/" + id;
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "구인공고 지원 중 오류가 발생했습니다. 다시 시도해주세요.");
            return "redirect:/job/detail/" + id;
        }
    }
    private MemberDTO getCurrentMember(HttpSession session) {
        return (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
    }
    private boolean canWriteRecruit(MemberDTO member) {
        return member != null && ("FACILITY".equals(member.getRole()) || "ADMIN".equals(member.getRole()));
    }
    private boolean canWriteSearch(MemberDTO member) {
        return member != null && ("USER".equals(member.getRole()) || "ADMIN".equals(member.getRole()));
    }
    private boolean canEditJob(MemberDTO member, Long authorId) {
        return member != null && (member.getMemberId().equals(authorId) || "ADMIN".equals(member.getRole()));
    }
    private boolean canApplyOrContact(MemberDTO member, Long authorId) {
        return member != null && !member.getMemberId().equals(authorId);
    }
    private boolean isAdmin(MemberDTO member) {
        return member != null && "ADMIN".equals(member.getRole());
    }
}
````

## File: src/main/java/com/example/carelink/service/JobService.java
````java
package com.example.carelink.service;
import com.example.carelink.dao.JobMapper;
import com.example.carelink.dto.JobApplicationDTO;
import com.example.carelink.dto.JobDTO;
import com.example.carelink.dao.JobApplicationMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
@Slf4j
@Service
@RequiredArgsConstructor
public class JobService {
    private final JobMapper jobMapper;
    private final JobApplicationMapper jobApplicationMapper;
    public List<JobDTO> getJobList(int currentPage, String keyword, String jobType) {
        log.info("구인구직 목록 조회 시작 - page: {}, keyword: {}, jobType: {}", currentPage, keyword, jobType);
        try {
            JobDTO searchDTO = new JobDTO();
            int pageSize = 10;
            searchDTO.setSize(pageSize);
            searchDTO.setPage((currentPage - 1) * pageSize);
            if (keyword != null && !keyword.trim().isEmpty()) {
                searchDTO.setSearchKeyword(keyword.trim());
            }
            if (jobType != null && !jobType.trim().isEmpty()) {
                searchDTO.setJobType(jobType.trim());
            }
            List<JobDTO> jobList = jobMapper.getJobList(searchDTO);
            log.info("구인구직 목록 조회 완료 - 조회된 건수: {}", jobList.size());
            return jobList;
        } catch (Exception e) {
            log.error("구인구직 목록 조회 중 오류 발생", e);
            return new ArrayList<>();
        }
    }
    public JobDTO getJobById(Long id) {
        log.info("구인구직 상세 조회 시작 - jobId: {}", id);
        try {
            JobDTO job = jobMapper.findJobById(id);
            if (job == null) {
                log.warn("구인구직 정보를 찾을 수 없습니다 - jobId: {}", id);
                throw new RuntimeException("해당 구인구직 정보를 찾을 수 없습니다. ID: " + id);
            }
            log.info("구인구직 상세 조회 완료 - jobId: {}, title: {}", id, job.getTitle());
            return job;
        } catch (Exception e) {
            log.error("구인구직 상세 조회 중 오류 발생 - jobId: {}", id, e);
            JobDTO job = new JobDTO();
            job.setJobId(id);
            job.setTitle("구인구직 정보를 불러오는 중 오류가 발생했습니다");
            job.setContent("시스템 오류로 인해 상세 정보를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.");
            job.setJobType("RECRUIT");
            job.setWorkType("FULL_TIME");
            job.setPosition("미정");
            job.setSalaryMin(java.math.BigDecimal.ZERO);
            job.setSalaryMax(java.math.BigDecimal.ZERO);
            job.setWorkLocation("미정");
            job.setStatus("ACTIVE");
            job.setMemberId(1L);
            job.setViewCount(0);
            return job;
        }
    }
    public int insertJob(JobDTO jobDTO) {
        log.info("구인구직 등록 시작 - title: {}, jobType: {}", jobDTO.getTitle(), jobDTO.getJobType());
        try {
            validateJobData(jobDTO);
            cleanAndValidateJobData(jobDTO);
            if (jobDTO.getStatus() == null) {
                jobDTO.setStatus("ACTIVE");
            }
            if (jobDTO.getPriority() == null) {
                jobDTO.setPriority(0);
            }
            int result = jobMapper.insertJob(jobDTO);
            log.info("구인구직 등록 완료 - jobId: {}", jobDTO.getJobId());
            return result;
        } catch (Exception e) {
            log.error("구인구직 등록 중 오류 발생", e);
            throw new RuntimeException("구인구직 등록 중 오류가 발생했습니다.", e);
        }
    }
    public int updateJob(JobDTO jobDTO) {
        log.info("구인구직 수정 시작 - jobId: {}, title: {}", jobDTO.getJobId(), jobDTO.getTitle());
        try {
            JobDTO existingJob = jobMapper.findJobById(jobDTO.getJobId());
            if (existingJob == null) {
                throw new RuntimeException("수정할 구인구직을 찾을 수 없습니다. ID: " + jobDTO.getJobId());
            }
            validateJobData(jobDTO);
            cleanAndValidateJobData(jobDTO);
            if (jobDTO.getPriority() == null) {
                jobDTO.setPriority(0);
                log.warn("priority 값이 null이어서 0으로 자동 설정되었습니다. jobId: {}", jobDTO.getJobId());
            }
            int result = jobMapper.updateJob(jobDTO);
            log.info("구인구직 수정 완료 - jobId: {}", jobDTO.getJobId());
            return result;
        } catch (Exception e) {
            log.error("구인구직 수정 중 오류 발생 - jobId: {}", jobDTO.getJobId(), e);
            throw new RuntimeException("구인구직 수정 중 오류가 발생했습니다.", e);
        }
    }
    public int deleteJob(Long id) {
        log.info("구인구직 삭제 시작 - jobId: {}", id);
        try {
            int result = jobMapper.deleteJob(id);
            log.info("구인구직 삭제 완료 - jobId: {}", id);
            return result;
        } catch (Exception e) {
            log.error("구인구직 삭제 중 오류 발생 - jobId: {}", id, e);
            throw new RuntimeException("구인구직 삭제 중 오류가 발생했습니다.", e);
        }
    }
    public List<JobDTO> getPopularJobs() {
        try {
            return jobMapper.getPopularJobs();
        } catch (Exception e) {
            log.error("인기 구인구직 조회 중 오류 발생", e);
            return new ArrayList<>();
        }
    }
    public int getJobCount() {
        try {
            return jobMapper.getJobCount();
        } catch (Exception e) {
            log.error("구인구직 수 조회 중 오류 발생", e);
            return 0;
        }
    }
    private void validateJobData(JobDTO jobDTO) {
        if (jobDTO.getTitle() == null || jobDTO.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("제목은 필수 입력값입니다.");
        }
        if (jobDTO.getContent() == null || jobDTO.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("내용은 필수 입력값입니다.");
        }
        if (jobDTO.getJobType() == null || jobDTO.getJobType().trim().isEmpty()) {
            throw new IllegalArgumentException("구인구직 유형은 필수 입력값입니다.");
        }
        if (jobDTO.getMemberId() == null) {
            throw new IllegalArgumentException("작성자 정보가 필요합니다.");
        }
    }
    private void cleanAndValidateJobData(JobDTO jobDTO) {
        log.info("데이터 정리 시작 - jobId: {}", jobDTO.getJobId());
        if (jobDTO.getTitle() != null) {
            jobDTO.setTitle(jobDTO.getTitle().trim());
        }
        if (jobDTO.getContent() != null) {
            jobDTO.setContent(jobDTO.getContent().trim());
        }
        if (jobDTO.getSalaryDescription() != null && !jobDTO.getSalaryDescription().trim().isEmpty()) {
            String cleanSalaryDesc = cleanDuplicateValues(jobDTO.getSalaryDescription());
            jobDTO.setSalaryDescription(cleanSalaryDesc);
            log.debug("급여 설명 정리됨: {} -> {}", jobDTO.getSalaryDescription(), cleanSalaryDesc);
        }
        if (jobDTO.getWorkHours() != null && !jobDTO.getWorkHours().trim().isEmpty()) {
            String cleanWorkHours = cleanDuplicateValues(jobDTO.getWorkHours());
            jobDTO.setWorkHours(cleanWorkHours);
            log.debug("근무시간 정리됨: {} -> {}", jobDTO.getWorkHours(), cleanWorkHours);
        }
        if (jobDTO.getFacilityName() != null) {
            jobDTO.setFacilityName(jobDTO.getFacilityName().trim());
        }
        if (jobDTO.getWorkLocation() != null) {
            jobDTO.setWorkLocation(jobDTO.getWorkLocation().trim());
        }
        if (jobDTO.getContactPhone() != null) {
            jobDTO.setContactPhone(jobDTO.getContactPhone().trim());
        }
        if (jobDTO.getQualifications() != null && !jobDTO.getQualifications().trim().isEmpty()) {
            String cleanQualifications = cleanDuplicateValues(jobDTO.getQualifications());
            jobDTO.setQualifications(cleanQualifications);
        }
        log.info("데이터 정리 완료 - jobId: {}", jobDTO.getJobId());
    }
    private String cleanDuplicateValues(String input) {
        if (input == null || input.trim().isEmpty()) {
            return input;
        }
        try {
            String[] values = input.split(",");
            return java.util.Arrays.stream(values)
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .distinct()
                    .collect(java.util.stream.Collectors.joining(", "));
        } catch (Exception e) {
            log.warn("값 정리 중 오류 발생, 원본 값 반환: {}", input, e);
            return input.trim();
        }
    }
    @Transactional
    public void applyForJob(Long jobId, Long applicantMemberId) {
        log.info("구인공고 지원 로직 시작 - jobId: {}, applicantMemberId: {}", jobId, applicantMemberId);
        JobDTO jobDTO = jobMapper.findJobById(jobId);
        if (jobDTO == null) {
            log.warn("지원할 구인공고를 찾을 수 없습니다 - jobId: {}", jobId);
            throw new IllegalArgumentException("지원할 구인공고를 찾을 수 없습니다.");
        }
        int existingApplications = jobApplicationMapper.countByJobIdAndApplicantMemberId(jobId, applicantMemberId);
        if (existingApplications > 0) {
            log.warn("이미 지원한 구인공고입니다 - jobId: {}, applicantMemberId: {}", jobId, applicantMemberId);
            throw new IllegalArgumentException("이미 지원한 구인공고입니다.");
        }
        JobApplicationDTO jobApplication = new JobApplicationDTO();
        jobApplication.setJobId(jobId);
        jobApplication.setApplicantMemberId(applicantMemberId);
        jobApplication.setApplicationDate(LocalDateTime.now());
        jobApplication.setStatus("PENDING");
        jobApplicationMapper.insertJobApplication(jobApplication);
        jobMapper.incrementApplyCount(jobId);
        log.info("구인공고 지원 로직 완료 - jobId: {}, applicantMemberId: {}, 생성된 지원 ID: {}",
                jobId, applicantMemberId, jobApplication.getId());
    }
}
````

## File: build.gradle
````
plugins {
    id 'org.springframework.boot' version '2.7.18'
    id 'io.spring.dependency-management' version '1.0.15.RELEASE'
    id 'java'
}

group = 'com.example'
version = '0.0.1-SNAPSHOT'

java {
    sourceCompatibility = JavaVersion.VERSION_11
    targetCompatibility = JavaVersion.VERSION_11
}

repositories {
    mavenCentral()
}

dependencies {
    // Spring Boot 기본 의존성
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-actuator'
    developmentOnly 'org.springframework.boot:spring-boot-devtools'

    // Thymeleaf 템플릿 엔진
    implementation 'org.springframework.boot:spring-boot-starter-thymeleaf'

    // MySQL 데이터베이스 연결 (로컬 개발용)
    runtimeOnly 'com.mysql:mysql-connector-j'
    
    // PostgreSQL 데이터베이스 연결 (Heroku용)
    runtimeOnly 'org.postgresql:postgresql'

    // MyBatis 연동
    implementation 'org.mybatis.spring.boot:mybatis-spring-boot-starter:2.3.1'

    // Lombok (코드 자동 생성)
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'

    // 유효성 검증
    implementation 'org.springframework.boot:spring-boot-starter-validation'

    // JSON 처리
    implementation 'com.fasterxml.jackson.core:jackson-databind'
    implementation 'com.fasterxml.jackson.datatype:jackson-datatype-jsr310'

    // 테스트 의존성
    testImplementation 'org.springframework.boot:spring-boot-starter-test'

    // Spring Security
    implementation 'org.springframework.boot:spring-boot-starter-security'

    // Thymeleaf와 Spring Security 연동을 위한 확장 라이브러리
    implementation 'org.thymeleaf.extras:thymeleaf-extras-springsecurity5'

    // SpringDoc OpenAPI 의존성 추가 (임시 비활성화 - 기능 구현 완료 후 활성화 예정)
    // implementation 'org.springdoc:springdoc-openapi-ui:1.7.0'
    // implementation 'org.springdoc:springdoc-openapi-security:1.7.0'

}

tasks.named('test') {
    useJUnitPlatform()
}
````

## File: src/main/java/com/example/carelink/service/FacilityService.java
````java
package com.example.carelink.service;
import com.example.carelink.dao.FacilityMapper;
import com.example.carelink.dto.FacilityDTO;
import com.example.carelink.dto.FacilityImageDTO;
import com.example.carelink.common.Constants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
@Service
public class FacilityService {
    private final FacilityMapper facilityMapper;
    private final FacilityImageService facilityImageService;
    private static final Logger log = LoggerFactory.getLogger(FacilityService.class);
    @Autowired
    public FacilityService(FacilityMapper facilityMapper, FacilityImageService facilityImageService) {
        this.facilityMapper = facilityMapper;
        this.facilityImageService = facilityImageService;
    }
    public List<FacilityDTO> searchFacilities(FacilityDTO searchDTO) {
        log.info("시설 검색 서비스 호출 - facilityName: {}, address: {}, facilityType: {}",
                searchDTO.getFacilityName(), searchDTO.getAddress(), searchDTO.getFacilityType());
        List<FacilityDTO> results = facilityMapper.searchFacilities(searchDTO);
        log.info("시설 검색 결과 - 총 {}개 시설 발견", results.size());
        for (FacilityDTO facility : results) {
            try {
                FacilityImageDTO mainImage = facilityImageService.getMainImageByFacilityId(facility.getFacilityId());
                if (mainImage != null && mainImage.getImagePath() != null) {
                    facility.setFacilityImage(mainImage.getImagePath());
                }
            } catch (Exception e) {
                log.warn("시설 검색 중 메인 이미지 조회 실패 - facilityId: {}", facility.getFacilityId(), e);
                facility.setFacilityImage(null);
            }
        }
        return results;
    }
    @Transactional(readOnly = true)
    public FacilityDTO getFacilityById(Long facilityId) {
        if (facilityId == null) {
            log.warn("시설 ID가 null입니다.");
            return null;
        }
        log.info("시설 상세 정보 조회 시작 - facilityId: {}", facilityId);
        FacilityDTO facility = facilityMapper.getFacilityById(facilityId);
        if (facility == null) {
            log.warn("시설을 찾을 수 없음 - facilityId: {}", facilityId);
            return null;
        }
        try {
            FacilityImageDTO mainImage = facilityImageService.getMainImageByFacilityId(facilityId);
            if (mainImage != null && mainImage.getImagePath() != null) {
                facility.setFacilityImage(mainImage.getImagePath());
                log.info("✅ 시설 메인 이미지 설정 완료 - imagePath: {}", mainImage.getImagePath());
            } else {
                log.info("⚠️ 시설 메인 이미지 없음 - facilityId: {}", facilityId);
                facility.setFacilityImage(null);
            }
        } catch (Exception e) {
            log.error("❌ 시설 메인 이미지 조회 중 오류 발생 - facilityId: {}", facilityId, e);
            facility.setFacilityImage(null);
        }
        log.info("시설 상세 정보 조회 완료 - facilityName: {}, status: {}, mainImage: {}",
                facility.getFacilityName(), facility.getStatus(), facility.getFacilityImage());
        return facility;
    }
    public List<FacilityDTO> getAllFacilities() {
        try {
            log.info("전체 시설 목록 조회 시작");
            List<FacilityDTO> facilities = facilityMapper.getAllFacilities();
            log.info("전체 시설 목록 조회 완료 - 조회된 건수: {}", facilities.size());
            return facilities;
        } catch (Exception e) {
            log.error("전체 시설 목록 조회 중 오류 발생", e);
            throw new RuntimeException("시설 목록을 불러오는 중 오류가 발생했습니다.", e);
        }
    }
    public int insertFacility(FacilityDTO facilityDTO) {
        return facilityMapper.insertFacility(facilityDTO);
    }
    public int updateFacility(FacilityDTO facilityDTO) {
        return facilityMapper.updateFacility(facilityDTO);
    }
    public int deleteFacility(Long facilityId) {
        return facilityMapper.deleteFacility(facilityId);
    }
    public int countFacilitiesByRegion(String region) {
        return facilityMapper.countFacilitiesByRegion(region);
    }
    public int getFacilityCount() {
        try {
            return facilityMapper.getFacilityCount();
        } catch (Exception e) {
            return 3;
        }
    }
    @Transactional(readOnly = true)
    public List<FacilityDTO> getAllActiveFacilities() {
        log.info("활성화된 시설 목록 조회 시작");
        List<FacilityDTO> facilities = facilityMapper.getAllActiveFacilities();
        if (!facilities.isEmpty()) {
            FacilityDTO firstFacility = facilities.get(0);
            log.info("첫 번째 시설 정보 - ID: {}, 이름: {}, 승인상태: {}",
                    firstFacility.getFacilityId(),
                    firstFacility.getFacilityName(),
                    firstFacility.getStatus());
        }
        log.info("활성화된 시설 목록 조회 완료 - 조회된 건수: {}", facilities.size());
        return facilities;
    }
    public boolean validateFacilityStatus(FacilityDTO facility) {
        if (facility == null) {
            log.warn("시설 정보가 null입니다.");
            return false;
        }
        if (facility.isDeletedStatus()) {
            log.warn("삭제된 시설입니다 - facilityId: {}", facility.getFacilityId());
            return false;
        }
        if (facility.isPendingStatus()) {
            log.warn("승인되지 않은 시설입니다 - facilityId: {}", facility.getFacilityId());
            return false;
        }
        return true;
    }
    public List<FacilityDTO> getFacilitiesByMemberId(Long memberId) {
        try {
            log.info("회원의 시설 목록 조회 시작 - memberId: {}", memberId);
            List<FacilityDTO> facilities = facilityMapper.getFacilitiesByMemberId(memberId);
            if (!facilities.isEmpty()) {
                log.info("회원의 시설 목록 조회 완료 - memberId: {}, 시설 수: {}",
                        memberId, facilities.size());
            } else {
                log.info("회원의 시설 정보 없음 - memberId: {}", memberId);
            }
            return facilities;
        } catch (Exception e) {
            log.error("회원의 시설 목록 조회 중 오류 발생 - memberId: {}", memberId, e);
            throw new RuntimeException("시설 정보 조회에 실패했습니다.", e);
        }
    }
    public FacilityDTO getFacilityByMemberId(Long memberId) {
        try {
            log.info("회원의 첫 번째 시설 정보 조회 시작 - memberId: {}", memberId);
            List<FacilityDTO> facilities = facilityMapper.getFacilitiesByMemberId(memberId);
            if (!facilities.isEmpty()) {
                FacilityDTO facility = facilities.get(0);
                log.info("회원의 첫 번째 시설 정보 조회 완료 - memberId: {}, facilityId: {}, facilityName: {}",
                        memberId, facility.getFacilityId(), facility.getFacilityName());
                return facility;
            } else {
                log.info("회원의 시설 정보 없음 - memberId: {}", memberId);
                return null;
            }
        } catch (Exception e) {
            log.error("회원의 시설 정보 조회 중 오류 발생 - memberId: {}", memberId, e);
            throw new RuntimeException("시설 정보 조회에 실패했습니다.", e);
        }
    }
    @Transactional
    public void updateFacility(FacilityDTO facilityDTO, MultipartFile facilityImageFile) {
        try {
            log.info("시설 정보 수정 시작 - facilityId: {}, facilityName: {}",
                    facilityDTO.getFacilityId(), facilityDTO.getFacilityName());
            if (facilityImageFile != null && !facilityImageFile.isEmpty()) {
                String imagePath = saveFacilityImage(facilityImageFile, facilityDTO.getFacilityId().toString());
                facilityDTO.setFacilityImage(imagePath);
                log.info("시설 이미지 업데이트 - facilityId: {}, imagePath: {}",
                        facilityDTO.getFacilityId(), imagePath);
            }
            int result = facilityMapper.updateFacility(facilityDTO);
            if (result == 0) {
                throw new RuntimeException("시설 정보 수정에 실패했습니다.");
            }
            log.info("시설 정보 수정 완료 - facilityId: {}", facilityDTO.getFacilityId());
        } catch (Exception e) {
            log.error("시설 정보 수정 중 오류 발생 - facilityId: {}", facilityDTO.getFacilityId(), e);
            throw new RuntimeException("시설 정보 수정에 실패했습니다.", e);
        }
    }
    private String saveFacilityImage(MultipartFile file, String facilityId) {
        try {
            String uploadDir = Constants.FACILITY_UPLOAD_PATH;
            File uploadDirFile = new File(uploadDir);
            if (!uploadDirFile.exists()) {
                boolean created = uploadDirFile.mkdirs();
                log.info("업로드 디렉토리 생성: {} - {}", uploadDir, created ? "성공" : "실패");
            }
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String savedFilename = "facility_" + facilityId + "_" + UUID.randomUUID().toString() + extension;
            File savedFile = new File(uploadDir + savedFilename);
            file.transferTo(savedFile);
            log.info("시설 이미지 저장 완료: {}", savedFile.getAbsolutePath());
            return "/uploads/facility/" + savedFilename;
        } catch (IOException e) {
            log.error("시설 이미지 저장 중 오류 발생: facilityId={}", facilityId, e);
            throw new RuntimeException("이미지 파일 저장에 실패했습니다.", e);
        }
    }
    @Transactional(readOnly = true)
    public List<FacilityDTO> getFacilitiesByApprovalStatus(String status) {
        try {
            log.info("승인 상태별 시설 목록 조회 - status: {}", status);
            List<FacilityDTO> facilities = facilityMapper.getFacilitiesByApprovalStatus(status);
            log.info("승인 상태별 시설 목록 조회 완료 - status: {}, count: {}", status, facilities.size());
            return facilities;
        } catch (Exception e) {
            log.error("승인 상태별 시설 목록 조회 중 오류 발생 - status: {}", status, e);
            throw new RuntimeException("시설 목록 조회에 실패했습니다.", e);
        }
    }
    @Transactional
    public void updateFacilityApprovalStatus(Long facilityId, String newStatus, String reason) {
        try {
            log.info("시설 승인 상태 업데이트 - facilityId: {}, newStatus: {}, reason: {}",
                    facilityId, newStatus, reason);
            int result = facilityMapper.updateFacilityApprovalStatus(facilityId, newStatus, reason);
            if (result == 0) {
                throw new RuntimeException("시설 승인 상태 업데이트에 실패했습니다.");
            }
            log.info("시설 승인 상태 업데이트 완료 - facilityId: {}, newStatus: {}", facilityId, newStatus);
        } catch (Exception e) {
            log.error("시설 승인 상태 업데이트 중 오류 발생 - facilityId: {}", facilityId, e);
            throw new RuntimeException("시설 승인 상태 업데이트에 실패했습니다.", e);
        }
    }
    @Transactional(readOnly = true)
    public int countPendingFacilities() {
        try {
            int count = facilityMapper.countFacilitiesByStatus("PENDING");
            log.info("승인 대기 시설 수 조회 완료 - count: {}", count);
            return count;
        } catch (Exception e) {
            log.error("승인 대기 시설 수 조회 중 오류 발생", e);
            return 0;
        }
    }
    @Transactional(readOnly = true)
    public int countApprovedFacilities() {
        try {
            int count = facilityMapper.countFacilitiesByStatus("APPROVED");
            log.info("승인된 시설 수 조회 완료 - count: {}", count);
            return count;
        } catch (Exception e) {
            log.error("승인된 시설 수 조회 중 오류 발생", e);
            return 0;
        }
    }
    @Transactional(readOnly = true)
    public int countRejectedFacilities() {
        try {
            int count = facilityMapper.countFacilitiesByStatus("REJECTED");
            log.info("거부된 시설 수 조회 완료 - count: {}", count);
            return count;
        } catch (Exception e) {
            log.error("거부된 시설 수 조회 중 오류 발생", e);
            return 0;
        }
    }
}
````

## File: src/main/java/com/example/carelink/service/MemberService.java
````java
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
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.UUID;
@Slf4j
@Service
@RequiredArgsConstructor
public class MemberService {
    private final MemberMapper memberMapper;
    private final FacilityMapper facilityMapper;
    private final BoardMapper boardMapper;
    private final ReviewMapper reviewMapper;
    private final JobMapper jobMapper;
    private final PasswordEncoder passwordEncoder;
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
            log.info("=== 비밀번호 검증 디버그 ===");
            log.info("DB 저장된 비밀번호: {}", member.getPassword());
            log.info("입력된 비밀번호: {}", loginDTO.getPassword());
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
    @Transactional
    public void join(MemberDTO memberDTO) {
        join(memberDTO, null);
    }
    @Transactional
    public void join(MemberDTO memberDTO, MultipartFile facilityImageFile) {
        try {
            log.info("회원가입 처리 시작 - userId: {}, address: {}, detailAddress: {}",
                    memberDTO.getUserId(), memberDTO.getAddress(), memberDTO.getDetailAddress());
            if (isUserIdDuplicate(memberDTO.getUserId())) {
                throw new IllegalArgumentException("이미 사용중인 아이디입니다.");
            }
            if (memberDTO.getEmail() != null && !memberDTO.getEmail().trim().isEmpty()) {
                if (memberMapper.existsByEmail(memberDTO.getEmail())) {
                    throw new IllegalArgumentException("이미 사용중인 이메일입니다.");
                }
            }
            memberDTO.setMemberId(null);
            if (memberDTO.getRole() == null || memberDTO.getRole().isEmpty()) {
                memberDTO.setRole(Constants.MEMBER_ROLE_USER);
            }
            memberDTO.setIsActive(true);
            memberDTO.setLoginFailCount(0);
            memberDTO.setIsDeleted(false);
            if (memberDTO.getPhone() != null && memberDTO.getPhone().isEmpty()) {
                memberDTO.setPhone(null);
            }
            if (memberDTO.getAddress() != null && memberDTO.getAddress().isEmpty()) {
                memberDTO.setAddress(null);
            }
            if (memberDTO.getDetailAddress() != null && memberDTO.getDetailAddress().isEmpty()) {
                memberDTO.setDetailAddress(null);
            }
            memberDTO.setProfileImage(null);
            memberDTO.setLastLoginAt(null);
            log.info("DB 저장 전 memberDTO - address: {}, detailAddress: {}",
                    memberDTO.getAddress(), memberDTO.getDetailAddress());
            int result = memberMapper.insertMember(memberDTO);
            if (result == 0) {
                throw new RuntimeException("회원가입 데이터 저장에 실패했습니다. (영향받은 행 없음)");
            }
            log.info("회원가입 DB 저장 성공 - memberId: {}", memberDTO.getMemberId());
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
                facilityDTO.setLatitude(memberDTO.getLatitude());
                facilityDTO.setLongitude(memberDTO.getLongitude());
                facilityDTO.setRegisteredMemberId(memberDTO.getMemberId());
                facilityDTO.setIsApproved(false);
                facilityDTO.setApprovalStatus("PENDING");
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
        } catch (IllegalArgumentException e) {
            log.warn("회원가입 실패 (비즈니스 로직): {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("회원가입 처리 중 알 수 없는 오류 발생: {}", memberDTO.getUserId(), e);
            throw new RuntimeException("회원가입 처리 중 알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", e);
        }
    }
    @Transactional(readOnly = true)
    public boolean isUserIdDuplicate(String userId) {
        try {
            return memberMapper.existsByUserId(userId);
        } catch (Exception e) {
            log.error("사용자 ID 중복 체크 중 오류 발생: {}", userId, e);
            throw new RuntimeException("중복 체크 중 오류가 발생했습니다.", e);
        }
    }
    @Transactional(readOnly = true)
    public MemberDTO findById(Long memberId) {
        try {
            return memberMapper.findById(memberId);
        } catch (Exception e) {
            log.error("회원 정보 조회 중 오류 발생: {}", memberId, e);
            throw new RuntimeException("회원 정보 조회 중 오류가 발생했습니다.", e);
        }
    }
    @Transactional(readOnly = true)
    public MemberDTO getMemberByUserId(String userId) {
        try {
            return memberMapper.findByUserId(userId);
        } catch (Exception e) {
            log.error("사용자 ID로 회원 정보 조회 중 오류 발생: {}", userId, e);
            throw new RuntimeException("회원 정보 조회 중 오류가 발생했습니다.", e);
        }
    }
    public void updateMember(MemberDTO memberDTO, MultipartFile profileImageFile) throws Exception {
        log.info("회원정보 수정 요청: memberId={}, name={}, email={}",
                memberDTO.getMemberId(), memberDTO.getName(), memberDTO.getEmail());
        MemberDTO existingMember = memberMapper.findById(memberDTO.getMemberId());
        if (existingMember == null) {
            throw new IllegalArgumentException("존재하지 않는 회원입니다.");
        }
        log.info("기존 회원 정보: memberId={}, name={}, email={}",
                existingMember.getMemberId(), existingMember.getName(), existingMember.getEmail());
        memberDTO.setPassword(existingMember.getPassword());
        memberDTO.setRole(existingMember.getRole());
        memberDTO.setIsActive(existingMember.getIsActive());
        memberDTO.setIsDeleted(existingMember.getIsDeleted());
        memberDTO.setLoginFailCount(existingMember.getLoginFailCount());
        memberDTO.setLastLoginAt(existingMember.getLastLoginAt());
        memberDTO.setCreatedAt(existingMember.getCreatedAt());
        if (profileImageFile != null && !profileImageFile.isEmpty()) {
            String profileImagePath = saveProfileImage(profileImageFile, existingMember.getUserId());
            memberDTO.setProfileImage(profileImagePath);
            if (existingMember.getProfileImage() != null && !existingMember.getProfileImage().isEmpty()) {
                try {
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
    @Transactional
    public void changePassword(String userId, String currentPassword, String newPassword, String confirmNewPassword) {
        MemberDTO member = memberMapper.findByUserId(userId);
        if (member == null) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
        }
        if (!currentPassword.equals(member.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }
        if (!newPassword.equals(confirmNewPassword)) {
            throw new IllegalArgumentException("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
        }
        if (newPassword.length() < 8) {
            throw new IllegalArgumentException("새 비밀번호는 최소 8자 이상이어야 합니다.");
        }
        member.setPassword(newPassword);
        int result = memberMapper.updatePassword(member);
        if (result == 0) {
            throw new RuntimeException("비밀번호 변경에 실패했습니다.");
        }
        log.info("비밀번호 변경 서비스: {} 사용자의 비밀번호가 성공적으로 변경됨.", userId);
    }
    @Transactional(readOnly = true)
    public Map<String, Integer> getUserContentCounts(Long memberId) {
        Map<String, Integer> counts = new HashMap<>();
        try {
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
            counts.put("board", 0);
            counts.put("review", 0);
            counts.put("job", 0);
            counts.put("total", 0);
            return counts;
        }
    }
    @Transactional(readOnly = true)
    public Map<String, Object> getMyPosts(Long memberId, String type, int page, int pageSize, int offset) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> posts = new ArrayList<>();
        try {
            Map<String, Integer> contentCounts = getUserContentCounts(memberId);
            result.put("contentCounts", contentCounts);
            if ("board".equals(type)) {
                List<BoardDTO> boards = boardMapper.findBoardsByMemberId(memberId);
                for (BoardDTO board : boards) {
                    Map<String, Object> post = new HashMap<>();
                    post.put("id", board.getBoardId());
                    post.put("title", board.getTitle());
                    post.put("content", board.getContent());
                    post.put("createdAt", board.getCreatedAt());
                    post.put("viewCount", board.getViewCount() != null ? board.getViewCount() : 0);
                    post.put("likeCount", board.getLikeCount() != null ? board.getLikeCount() : 0);
                    post.put("rating", null);
                    post.put("salary", null);
                    post.put("type", "board");
                    post.put("category", board.getBoardType());
                    post.put("url", "/board/detail/" + board.getBoardId());
                    posts.add(post);
                }
            } else if ("review".equals(type)) {
                List<ReviewDTO> reviews = reviewMapper.findReviewsByMemberId(memberId);
                for (ReviewDTO review : reviews) {
                    Map<String, Object> post = new HashMap<>();
                    post.put("id", review.getReviewId());
                    post.put("title", review.getTitle());
                    post.put("content", review.getContent());
                    post.put("createdAt", review.getCreatedAt());
                    post.put("viewCount", null);
                    post.put("likeCount", review.getLikeCount() != null ? review.getLikeCount() : 0);
                    post.put("rating", review.getRating());
                    post.put("salary", null);
                    post.put("type", "review");
                    post.put("category", "리뷰");
                    post.put("url", "/review/detail/" + review.getReviewId());
                    posts.add(post);
                }
            } else if ("job".equals(type)) {
                List<JobDTO> jobs = jobMapper.findJobsByMemberId(memberId);
                for (JobDTO job : jobs) {
                    Map<String, Object> post = new HashMap<>();
                    post.put("id", job.getJobId());
                    post.put("title", job.getTitle());
                    post.put("content", job.getContent());
                    post.put("createdAt", job.getCreatedAt());
                    post.put("viewCount", job.getViewCount() != null ? job.getViewCount() : 0);
                    post.put("likeCount", null);
                    post.put("rating", null);
                    post.put("salary", job.getSalaryDescription());
                    post.put("type", "job");
                    post.put("category", job.getJobType());
                    post.put("url", "/job/detail/" + job.getJobId());
                    posts.add(post);
                }
            } else {
                List<BoardDTO> boards = boardMapper.findBoardsByMemberId(memberId);
                List<ReviewDTO> reviews = reviewMapper.findReviewsByMemberId(memberId);
                List<JobDTO> jobs = jobMapper.findJobsByMemberId(memberId);
                for (BoardDTO board : boards) {
                    Map<String, Object> post = new HashMap<>();
                    post.put("id", board.getBoardId());
                    post.put("title", board.getTitle());
                    post.put("content", board.getContent());
                    post.put("createdAt", board.getCreatedAt());
                    post.put("viewCount", board.getViewCount() != null ? board.getViewCount() : 0);
                    post.put("likeCount", board.getLikeCount() != null ? board.getLikeCount() : 0);
                    post.put("rating", null);
                    post.put("salary", null);
                    post.put("type", "board");
                    post.put("category", board.getBoardType());
                    post.put("url", "/board/detail/" + board.getBoardId());
                    posts.add(post);
                }
                for (ReviewDTO review : reviews) {
                    Map<String, Object> post = new HashMap<>();
                    post.put("id", review.getReviewId());
                    post.put("title", review.getTitle());
                    post.put("content", review.getContent());
                    post.put("createdAt", review.getCreatedAt());
                    post.put("viewCount", null);
                    post.put("likeCount", review.getLikeCount() != null ? review.getLikeCount() : 0);
                    post.put("rating", review.getRating());
                    post.put("salary", null);
                    post.put("type", "review");
                    post.put("category", "리뷰");
                    post.put("url", "/review/detail/" + review.getReviewId());
                    posts.add(post);
                }
                for (JobDTO job : jobs) {
                    Map<String, Object> post = new HashMap<>();
                    post.put("id", job.getJobId());
                    post.put("title", job.getTitle());
                    post.put("content", job.getContent());
                    post.put("createdAt", job.getCreatedAt());
                    post.put("viewCount", job.getViewCount() != null ? job.getViewCount() : 0);
                    post.put("likeCount", null);
                    post.put("rating", null);
                    post.put("salary", job.getSalaryDescription());
                    post.put("type", "job");
                    post.put("category", job.getJobType());
                    post.put("url", "/job/detail/" + job.getJobId());
                    posts.add(post);
                }
            }
            posts.sort((a, b) -> ((java.time.LocalDateTime) b.get("createdAt")).compareTo((java.time.LocalDateTime) a.get("createdAt")));
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
    @Transactional
    public String deleteMemberWithOption(String userId, String deleteOption) {
        try {
            if ("anonymous".equals(deleteOption)) {
                int result = memberMapper.anonymizeMember(userId);
                if (result == 0) {
                    throw new RuntimeException("회원 익명화 처리 중 오류가 발생했습니다.");
                }
                log.info("회원 익명화 처리 완료: {}", userId);
                return "회원 탈퇴가 완료되었습니다. 작성하신 게시글은 '탈퇴회원'으로 표시됩니다.";
            } else if ("complete".equals(deleteOption)) {
                deleteAllUserContent(userId);
                int result = memberMapper.hardDeleteMember(userId);
                if (result == 0) {
                    throw new RuntimeException("회원 완전삭제 처리 중 오류가 발생했습니다.");
                }
                log.info("회원 완전삭제 처리 완료: {}", userId);
                return "회원 탈퇴가 완료되었습니다. 모든 개인정보와 작성 콘텐츠가 완전히 삭제되었습니다.";
            } else {
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
    @Transactional
    public void deleteAllUserContent(String userId) {
        try {
            MemberDTO member = memberMapper.findByUserId(userId);
            if (member == null) {
                throw new RuntimeException("회원 정보를 찾을 수 없습니다.");
            }
            Long memberId = member.getMemberId();
            if (Constants.MEMBER_ROLE_FACILITY.equals(member.getRole())) {
                jobMapper.deleteByFacilityMemberId(memberId);
                log.info("시설 구인공고 삭제 완료: memberId={}", memberId);
                reviewMapper.deleteByFacilityMemberId(memberId);
                log.info("시설 리뷰 삭제 완료: memberId={}", memberId);
                facilityMapper.deleteByMemberId(memberId);
                log.info("시설 정보 삭제 완료: memberId={}", memberId);
            }
            boardMapper.deleteByMemberId(memberId);
            reviewMapper.deleteByMemberId(memberId);
            jobMapper.deleteByMemberId(memberId);
            log.info("사용자 콘텐츠 삭제 완료: userId={}, memberId={}", userId, memberId);
        } catch (Exception e) {
            log.error("사용자 콘텐츠 삭제 중 오류: userId={}", userId, e);
            throw e;
        }
    }
    @Transactional
    public void deleteMember(String userId) {
        int result = memberMapper.softDeleteMember(userId);
        if (result == 0) {
            throw new RuntimeException("회원 탈퇴 처리 중 오류가 발생했습니다.");
        }
        log.info("회원 탈퇴 처리 완료: {}", userId);
    }
    private String saveProfileImage(MultipartFile file, String userId) {
        try {
            String uploadDir = Constants.PROFILE_UPLOAD_PATH;
            File uploadDirFile = new File(uploadDir);
            if (!uploadDirFile.exists()) {
                boolean created = uploadDirFile.mkdirs();
                log.info("프로필 이미지 업로드 디렉토리 생성: {} - {}", uploadDir, created ? "성공" : "실패");
            }
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String savedFilename = "profile_" + userId + "_" + UUID.randomUUID().toString() + extension;
            File savedFile = new File(uploadDir + savedFilename);
            file.transferTo(savedFile);
            log.info("프로필 이미지 저장 완료: {}", savedFile.getAbsolutePath());
            return "/uploads/profile/" + savedFilename;
        } catch (IOException e) {
            log.error("프로필 이미지 저장 중 오류 발생: userId={}", userId, e);
            throw new RuntimeException("프로필 이미지 저장에 실패했습니다.", e);
        }
    }
    private String saveFacilityImage(MultipartFile file, String userId) {
        try {
            String uploadDir = Constants.FACILITY_UPLOAD_PATH;
            File uploadDirFile = new File(uploadDir);
            if (!uploadDirFile.exists()) {
                boolean created = uploadDirFile.mkdirs();
                log.info("시설 이미지 업로드 디렉토리 생성: {} - {}", uploadDir, created ? "성공" : "실패");
            }
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String savedFilename = "facility_" + userId + "_" + UUID.randomUUID().toString() + extension;
            File savedFile = new File(uploadDir + savedFilename);
            file.transferTo(savedFile);
            log.info("시설 이미지 저장 완료: {}", savedFile.getAbsolutePath());
            return "/uploads/facility/" + savedFilename;
        } catch (IOException e) {
            log.error("시설 이미지 저장 중 오류 발생: userId={}", userId, e);
            throw new RuntimeException("시설 이미지 저장에 실패했습니다.", e);
        }
    }
    @Transactional(readOnly = true)
    public int getTotalMembersCount() {
        try {
            return memberMapper.getTotalCount();
        } catch (Exception e) {
            log.error("전체 회원 수 조회 중 오류 발생", e);
            throw new RuntimeException("회원 수 조회 중 오류가 발생했습니다.", e);
        }
    }
    @Transactional(readOnly = true)
    public int getMemberCount() {
        try {
            return memberMapper.getMemberCount();
        } catch (Exception e) {
            log.error("회원 수 조회 중 오류 발생", e);
            return 0;
        }
    }
    @Transactional(readOnly = true)
    public List<MemberDTO> getMembersWithPaging(MemberDTO searchDTO) {
        try {
            return memberMapper.findMembersWithPaging(searchDTO);
        } catch (Exception e) {
            log.error("페이징된 회원 목록 조회 중 오류 발생", e);
            throw new RuntimeException("회원 목록 조회 중 오류가 발생했습니다.", e);
        }
    }
    @Transactional(readOnly = true)
    public List<MemberDTO> getMembersByRole(String role) {
        try {
            return memberMapper.findMembersByRole(role);
        } catch (Exception e) {
            log.error("역할별 회원 목록 조회 중 오류 발생: {}", role, e);
            throw new RuntimeException("역할별 회원 목록 조회 중 오류가 발생했습니다.", e);
        }
    }
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
    @Transactional(readOnly = true)
    public int getTotalMemberCount() {
        try {
            return memberMapper.getTotalCount();
        } catch (Exception e) {
            log.error("전체 회원 수 조회 중 오류 발생", e);
            return 0;
        }
    }
    @Transactional(readOnly = true)
    public int getFacilityMemberCount() {
        try {
            return memberMapper.getFacilityMemberCount();
        } catch (Exception e) {
            log.error("시설 회원 수 조회 중 오류 발생", e);
            return 0;
        }
    }
    @Transactional(readOnly = true)
    public List<MemberDTO> getMembersByRole(String role, int page, int pageSize) {
        try {
            log.info("역할별 회원 목록 조회 시작: role={}, page={}, pageSize={}", role, page, pageSize);
            String searchRole = "ALL".equals(role) ? null : role;
            List<MemberDTO> members = memberMapper.findMembersByRole(searchRole);
            log.info("역할별 회원 조회 완료: role={}, count={} 명", role, members.size());
            return members;
        } catch (Exception e) {
            log.error("역할별 회원 목록 조회 중 오류 발생: role={}, page={}", role, page, e);
            return new ArrayList<>();
        }
    }
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
````

## File: src/main/resources/application.yml
````yaml
server:
  port: 8080
  servlet:
    context-path: /
    encoding:
      charset: UTF-8
      enabled: true
      force: true
spring:
  jackson:
    serialization:
      write-dates-as-timestamps: false
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: ${DB_URL:jdbc:mysql://localhost:3306/carelink?useSSL=false&serverTimezone=Asia/Seoul&allowPublicKeyRetrieval=true&useUnicode=true&characterEncoding=UTF-8}
    username: ${DB_USERNAME:root}
    password: ${DB_PASSWORD:mysql}
    hikari:
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
      maximum-pool-size: 10
      minimum-idle: 5
      pool-name: CareLink-HikariCP
      auto-commit: false
      transaction-isolation: TRANSACTION_READ_COMMITTED
  thymeleaf:
    prefix: classpath:/templates/
    suffix: .html
    mode: HTML
    encoding: UTF-8
    cache: false
  servlet:
    multipart:
      max-file-size: 50MB
      max-request-size: 50MB
mybatis:
  type-aliases-package: com.example.carelink.dto
  mapper-locations: classpath:mapper/*.xml
  configuration:
    map-underscore-to-camel-case: true
    jdbc-type-for-null: varchar
    default-fetch-size: 100
    default-statement-timeout: 30
logging:
  level:
    root: INFO
    com.example.carelink: DEBUG
    com.example.carelink.dao: DEBUG
    org.springframework.web: DEBUG
    org.springframework.jdbc: DEBUG
    org.mybatis: DEBUG
    org.apache.ibatis: DEBUG
    org.springframework.transaction: DEBUG
    java.sql: DEBUG
    jdbc.sqltiming: INFO
    com.zaxxer.hikari: DEBUG
file:
  upload-dir:
    facility: C:/carelink-uploads/facility/
    profile: C:/carelink-uploads/profile/
    temp: C:/carelink-uploads/temp/
springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui.html
    tags-sorter: alpha
    operations-sorter: method
  show-actuator: true
  default-consumes-media-type: application/json
  default-produces-media-type: application/json
  paths-to-match:
    - /api/**
  packages-to-scan:
    - com.lightcare.controller
api:
  kakao:
    app-key: ${KAKAO_APP_KEY:b97b58672807a40c122a5deed8a98ea4}
````

## File: src/main/resources/mapper/facilityMapper.xml
````xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.carelink.dao.FacilityMapper">
    <resultMap id="facilityResultMap" type="com.example.carelink.dto.FacilityDTO">
        <id property="facilityId" column="facility_id"/>
        <result property="facilityName" column="facility_name"/>
        <result property="facilityType" column="facility_type"/>
        <result property="address" column="address"/>
        <result property="detailAddress" column="detail_address"/>
        <result property="phone" column="phone"/>
        <result property="latitude" column="latitude"/>
        <result property="longitude" column="longitude"/>
        <result property="description" column="description"/>
        <result property="facilityImage" column="facility_image"/>
        <result property="facilityImageAltText" column="facility_image_alt_text"/>
        <result property="homepage" column="homepage"/>
        <result property="capacity" column="capacity"/>
        <result property="currentOccupancy" column="current_occupancy"/>
        <result property="operatingHours" column="operating_hours"/>
        <result property="features" column="features"/>
        <result property="averageRating" column="average_rating"/>
        <result property="reviewCount" column="review_count"/>
        <result property="gradeRating" column="grade_rating"/>
        <result property="registeredMemberId" column="registered_member_id"/>
        <result property="registeredMemberName" column="registered_member_name"/>
        <result property="isApproved" column="is_approved"/>
        <result property="approvalStatus" column="approval_status"/>
    </resultMap>
    <select id="searchFacilities" resultMap="facilityResultMap">
        SELECT f.*, m.name as registered_member_name
        FROM facility f
        LEFT JOIN member m ON f.registered_member_id = m.member_id
        <where>
            f.is_deleted = false
            AND f.is_approved = true
            <if test="facilityName != null and facilityName != ''">
                AND f.facility_name LIKE CONCAT('%', #{facilityName}, '%')
            </if>
            <if test="facilityType != null and facilityType != ''">
                AND f.facility_type = #{facilityType}
            </if>
            <if test="address != null and address != ''">
                AND f.address LIKE CONCAT(#{address}, '%')
            </if>
            <if test="swLat != null and swLng != null and neLat != null and neLng != null">
                AND (f.latitude BETWEEN #{swLat} AND #{neLat})
                AND (f.longitude BETWEEN #{swLng} AND #{neLng})
            </if>
        </where>
        ORDER BY f.created_at DESC
    </select>
    <select id="getFacilityById" resultType="com.example.carelink.dto.FacilityDTO">
        SELECT
            f.facility_id,
            f.facility_name,
            f.facility_type,
            f.address,
            f.phone,
            f.latitude,
            f.longitude,
            f.description,
            f.facility_image,
            f.homepage,
            f.capacity,
            f.current_occupancy,
            f.operating_hours,
            f.features,
            f.average_rating,
            f.review_count,
            f.grade_rating,
            f.registered_member_id,
            m.name as registered_member_name,
            f.is_deleted,
            f.is_approved,
            CASE
                WHEN f.is_deleted = true THEN '삭제됨'
                WHEN f.is_approved = false THEN '승인대기'
                ELSE '정상'
            END as status
        FROM facility f
        LEFT JOIN member m ON f.registered_member_id = m.member_id
        WHERE f.facility_id = #{facilityId}
    </select>
    <select id="getAllFacilities" resultMap="facilityResultMap">
        SELECT f.*, m.name as registered_member_name
        FROM facility f
        LEFT JOIN member m ON f.registered_member_id = m.member_id
        WHERE f.is_deleted = false
        AND f.is_approved = true
        ORDER BY f.created_at DESC
    </select>
    <insert id="insertFacility" parameterType="com.example.carelink.dto.FacilityDTO" useGeneratedKeys="true" keyProperty="facilityId">
        INSERT INTO facility (
            facility_name, facility_type, address, detail_address, phone,
            latitude, longitude, description, facility_image, facility_image_alt_text, homepage,
            capacity, current_occupancy, operating_hours, features,
            average_rating, review_count, registered_member_id,
            is_approved, approval_status
        ) VALUES (
                     #{facilityName}, #{facilityType}, #{address}, #{detailAddress}, #{phone},
                     #{latitude}, #{longitude}, #{description}, #{facilityImage}, #{facilityImageAltText}, #{homepage},
                     #{capacity}, #{currentOccupancy}, #{operatingHours}, #{features},
                     #{averageRating}, #{reviewCount}, #{registeredMemberId},
                     #{isApproved}, #{approvalStatus}
                 )
    </insert>
    <update id="updateFacility" parameterType="com.example.carelink.dto.FacilityDTO">
        UPDATE facility
        SET
            facility_name = #{facilityName},
            facility_type = #{facilityType},
            address = #{address},
            detail_address = #{detailAddress},
            phone = #{phone},
            latitude = #{latitude},
            longitude = #{longitude},
            description = #{description},
            facility_image = #{facilityImage},
            facility_image_alt_text = #{facilityImageAltText},
            homepage = #{homepage},
            capacity = #{capacity},
            current_occupancy = #{currentOccupancy},
            operating_hours = #{operatingHours},
            features = #{features},
            average_rating = #{averageRating},
            review_count = #{reviewCount},
            registered_member_id = #{registeredMemberId},
            is_approved = #{isApproved},
            approval_status = #{approvalStatus},
            updated_at = NOW()
        WHERE facility_id = #{facilityId}
    </update>
    <delete id="deleteFacility">
        DELETE FROM facility WHERE facility_id = #{facilityId}
    </delete>
    <select id="countFacilitiesByRegion" resultType="int">
        SELECT COUNT(*)
        FROM facility
        WHERE address LIKE CONCAT(#{region}, '%')
    </select>
    <select id="getFacilityCount" resultType="int">
        SELECT COUNT(*)
        FROM facility
        WHERE is_deleted = false
        AND is_approved = true
    </select>
    <select id="getAllActiveFacilities" resultType="com.example.carelink.dto.FacilityDTO">
        SELECT
            f.facility_id,
            f.facility_name,
            f.facility_type,
            f.address,
            f.phone,
            f.average_rating,
            f.review_count,
            f.registered_member_id,
            m.name as registered_member_name,
            f.is_deleted,
            f.is_approved,
            CASE
                WHEN f.is_deleted = true THEN '삭제됨'
                WHEN f.is_approved = false THEN '승인대기'
                ELSE '정상'
            END as status
        FROM facility f
        LEFT JOIN member m ON f.registered_member_id = m.member_id
        WHERE f.is_deleted = false
        AND f.is_approved = true
        ORDER BY f.facility_name ASC
    </select>
    <delete id="deleteByMemberId" parameterType="long">
        DELETE FROM facility WHERE registered_member_id = #{memberId}
    </delete>
    <select id="getFacilitiesByMemberId" parameterType="long" resultType="FacilityDTO">
        SELECT
            facility_id as facilityId,
            facility_name as facilityName,
            facility_type as facilityType,
            address,
            detail_address as detailAddress,
            phone,
            latitude,
            longitude,
            description,
            facility_image as facilityImage,
            homepage,
            capacity,
            current_occupancy as currentOccupancy,
            operating_hours as operatingHours,
            features,
            average_rating as averageRating,
            review_count as reviewCount,
            grade_rating as gradeRating,
            registered_member_id as registeredMemberId,
            is_approved as isApproved,
            approval_status as approvalStatus,
            created_at as createdAt,
            updated_at as updatedAt,
            is_deleted as isDeleted
        FROM facility
        WHERE registered_member_id = #{memberId} AND is_deleted = false
        ORDER BY created_at DESC
    </select>
    <select id="getFacilityByMemberId" parameterType="long" resultType="FacilityDTO">
        SELECT
            facility_id as facilityId,
            facility_name as facilityName,
            facility_type as facilityType,
            address,
            detail_address as detailAddress,
            phone,
            latitude,
            longitude,
            description,
            facility_image as facilityImage,
            homepage,
            capacity,
            current_occupancy as currentOccupancy,
            operating_hours as operatingHours,
            features,
            average_rating as averageRating,
            review_count as reviewCount,
            grade_rating as gradeRating,
            registered_member_id as registeredMemberId,
            is_approved as isApproved,
            approval_status as approvalStatus,
            created_at as createdAt,
            updated_at as updatedAt,
            is_deleted as isDeleted
        FROM facility
        WHERE registered_member_id = #{memberId} AND is_deleted = false
        ORDER BY created_at DESC
        LIMIT 1
    </select>
    <select id="getFacilitiesByApprovalStatus" parameterType="string" resultType="FacilityDTO">
        SELECT
            f.facility_id,
            f.facility_name,
            f.facility_type,
            f.address,
            f.detail_address,
            f.phone,
            f.description,
            f.homepage,
            f.capacity,
            f.operating_hours,
            f.features,
            f.facility_image,
            f.latitude,
            f.longitude,
            f.approval_status,
            f.registered_member_id,
            f.created_at,
            f.updated_at,
            m.user_id as registeredUserName,
            m.name as registeredMemberName
        FROM facility f
        LEFT JOIN member m ON f.registered_member_id = m.member_id
        WHERE f.is_deleted = false
        <if test="approvalStatus != null and approvalStatus != ''">
            AND f.approval_status = #{approvalStatus}
        </if>
        ORDER BY f.created_at DESC
    </select>
    <update id="updateFacilityApprovalStatus">
        UPDATE facility
        SET
            approval_status = #{approvalStatus},
            is_approved = (#{approvalStatus} = 'APPROVED'),
            <if test="rejectionReason != null">
            description = CONCAT(COALESCE(description, ''), CHAR(10), '거부사유: ', #{rejectionReason}),
            </if>
            updated_at = NOW()
        WHERE facility_id = #{facilityId}
    </update>
    <select id="countFacilitiesByStatus" parameterType="string" resultType="int">
        SELECT COUNT(*)
        FROM facility
        WHERE is_deleted = false
        AND approval_status = #{approvalStatus}
    </select>
    <update id="updateFacilityMainImage">
        UPDATE facility
        SET
            facility_image = #{mainImagePath},
            image_count = #{imageCount},
            updated_at = NOW()
        WHERE facility_id = #{facilityId}
    </update>
</mapper>
````

## File: src/main/java/com/example/carelink/controller/FacilityController.java
````java
package com.example.carelink.controller;
import com.example.carelink.dto.FacilityDTO;
import com.example.carelink.dto.FacilityImageDTO;
import com.example.carelink.dto.ReviewDTO;
import com.example.carelink.service.FacilityService;
import com.example.carelink.service.ReviewService;
import com.example.carelink.service.FacilityImageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import com.example.carelink.dto.MemberDTO;
import com.example.carelink.common.Constants;
import org.springframework.beans.factory.annotation.Value;
import javax.servlet.http.HttpSession;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
@Controller
@RequestMapping("/facility")
@RequiredArgsConstructor
@Slf4j
public class FacilityController {
    private final FacilityService facilityService;
    private final ReviewService reviewService;
    private final FacilityImageService facilityImageService;
    @Value("${api.kakao.app-key}")
    private String kakaoAppKey;
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        return mapper;
    }
    @GetMapping("/facility-info/{facilityId}")
    @ResponseBody
    public Map<String, Object> getFacilityInfo(@PathVariable Long facilityId, HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        try {
            MemberDTO member = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
            if (member == null) {
                result.put("success", false);
                result.put("message", "로그인이 필요합니다.");
                return result;
            }
            FacilityDTO facility = facilityService.getFacilityById(facilityId);
            if (facility == null) {
                result.put("success", false);
                result.put("message", "시설을 찾을 수 없습니다.");
                return result;
            }
            if (!facility.getRegisteredMemberId().equals(member.getMemberId())
                && !Constants.MEMBER_ROLE_ADMIN.equals(member.getRole())) {
                result.put("success", false);
                result.put("message", "해당 시설 정보를 조회할 권한이 없습니다.");
                return result;
            }
            result.put("success", true);
            result.put("facility", facility);
            log.info("시설 상세 정보 API 조회 완료: facilityId={}, memberId={}", facilityId, member.getMemberId());
        } catch (Exception e) {
            log.error("시설 상세 정보 API 조회 중 오류: facilityId={}", facilityId, e);
            result.put("success", false);
            result.put("message", "시설 정보 조회 중 오류가 발생했습니다.");
        }
        return result;
    }
    @GetMapping("/manage/{facilityId}/edit")
    public String redirectToEdit(@PathVariable Long facilityId) {
        log.info("내 시설에서 시설 수정으로 리다이렉트: facilityId={}", facilityId);
        return "redirect:/facility/edit/" + facilityId;
    }
    @GetMapping("/search")
    public String searchFacilities(
            @RequestParam(value = "facilityName", required = false) String facilityName,
            @RequestParam(value = "region", required = false) String region,
            @RequestParam(value = "facilityType", required = false) String facilityType,
            @RequestParam(value = "gradeRating", required = false) String gradeRating,
            Model model
    ) {
        log.info("시설 검색 페이지 접속 - facilityName: {}, region: {}, facilityType: {}, gradeRating: {}",
                facilityName, region, facilityType, gradeRating);
        List<FacilityDTO> facilityList = new ArrayList<>();
        try {
            facilityName = (facilityName != null && facilityName.trim().isEmpty()) ? null : facilityName;
            region = (region != null && region.trim().isEmpty()) ? null : region;
            facilityType = (facilityType != null && facilityType.trim().isEmpty()) ? null : facilityType;
            FacilityDTO searchCondition = new FacilityDTO();
            searchCondition.setFacilityName(facilityName != null ? facilityName.trim() : null);
            searchCondition.setFacilityType(facilityType);
            searchCondition.setAddress(region);
            facilityList = facilityService.searchFacilities(searchCondition);
            if (facilityList == null) {
                facilityList = new ArrayList<>();
            }
        } catch (Exception e) {
            log.error("시설 검색 중 오류 발생", e);
            facilityList = new ArrayList<>();
        }
        model.addAttribute("facilityList", facilityList);
        model.addAttribute("facilityName", facilityName);
        model.addAttribute("region", region);
        model.addAttribute("facilityType", facilityType);
        model.addAttribute("gradeRating", gradeRating);
        model.addAttribute("KAKAO_APP_KEY", kakaoAppKey);
        log.info("검색된 시설 수: {}", facilityList.size());
        return "facility/search";
    }
    @GetMapping("/detail/{facilityId}")
    public String getFacilityDetail(@PathVariable Long facilityId, Model model, HttpSession session) {
        log.info("시설 상세 정보 페이지 접속 - facilityId: {}", facilityId);
        try {
            FacilityDTO facility = facilityService.getFacilityById(facilityId);
            if (facility == null) {
                model.addAttribute("error", "해당 시설을 찾을 수 없습니다.");
                return "redirect:/facility/search";
            }
            List<ReviewDTO> recentReviews = reviewService.getReviewsByFacilityId(facilityId);
            if (recentReviews.size() > 5) {
                recentReviews = recentReviews.subList(0, 5);
            }
            Double averageRating = reviewService.getAverageRating(facilityId);
            MemberDTO sessionMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
            boolean isAdmin = sessionMember != null && "ADMIN".equals(sessionMember.getRole());
            boolean isOwner = sessionMember != null && facility.getRegisteredMemberId() != null &&
                             facility.getRegisteredMemberId().equals(sessionMember.getMemberId());
            model.addAttribute("facility", facility);
            model.addAttribute("recentReviews", recentReviews);
            model.addAttribute("averageRating", averageRating);
            model.addAttribute("reviewCount", recentReviews.size());
            model.addAttribute("pageTitle", facility.getFacilityName() + " 상세정보");
            model.addAttribute("sessionMember", sessionMember);
            model.addAttribute("isAdmin", isAdmin);
            model.addAttribute("isOwner", isOwner);
            log.info("시설 상세 정보 조회 완료 - facilityId: {}, 리뷰 수: {}, 관리자: {}, 소유자: {}",
                    facilityId, recentReviews.size(), isAdmin, isOwner);
            return "facility/detail";
        } catch (Exception e) {
            log.error("시설 상세 정보 조회 중 오류 발생 - facilityId: {}", facilityId, e);
            model.addAttribute("error", "시설 정보를 불러오는 중 오류가 발생했습니다.");
            return "redirect:/facility/search";
        }
    }
    @GetMapping("/manage")
    public String manageFacility(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
        MemberDTO member = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        if (member == null) {
            redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
            return "redirect:/member/login";
        }
        if (!Constants.MEMBER_ROLE_FACILITY.equals(member.getRole())) {
            redirectAttributes.addFlashAttribute("error", "시설 회원만 접근할 수 있습니다.");
            return "redirect:/";
        }
        try {
            List<FacilityDTO> facilities = facilityService.getFacilitiesByMemberId(member.getMemberId());
            model.addAttribute("facilities", facilities);
            model.addAttribute("facilityCount", facilities.size());
            log.info("시설 관리 페이지 접근: memberId={}, 시설 수={}",
                    member.getMemberId(), facilities.size());
            return "facility/manage";
        } catch (Exception e) {
            log.error("시설 관리 페이지 조회 중 오류 발생: memberId={}", member.getMemberId(), e);
            redirectAttributes.addFlashAttribute("error", "시설 정보를 불러오는 중 오류가 발생했습니다.");
            return "redirect:/";
        }
    }
    @GetMapping("/edit/{facilityId}")
    public String editFacilityForm(@PathVariable Long facilityId, HttpSession session,
                                   Model model, RedirectAttributes redirectAttributes) {
        MemberDTO member = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        if (member == null) {
            redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
            return "redirect:/member/login";
        }
        try {
            FacilityDTO facility = facilityService.getFacilityById(facilityId);
            if (facility == null) {
                redirectAttributes.addFlashAttribute("error", "시설을 찾을 수 없습니다.");
                return "redirect:/facility/manage";
            }
            if (!facility.getRegisteredMemberId().equals(member.getMemberId())
                && !Constants.MEMBER_ROLE_ADMIN.equals(member.getRole())) {
                redirectAttributes.addFlashAttribute("error", "해당 시설을 수정할 권한이 없습니다.");
                return "redirect:/facility/manage";
            }
            model.addAttribute("facility", facility);
            log.info("시설 수정 페이지 접근: facilityId={}, memberId={}", facilityId, member.getMemberId());
            return "facility/edit";
        } catch (Exception e) {
            log.error("시설 수정 페이지 조회 중 오류 발생: facilityId={}", facilityId, e);
            redirectAttributes.addFlashAttribute("error", "시설 정보를 불러오는 중 오류가 발생했습니다.");
            return "redirect:/facility/manage";
        }
    }
    @PostMapping("/edit/{facilityId}")
    public String updateFacility(@PathVariable Long facilityId,
                                @ModelAttribute FacilityDTO facilityDTO,
                                @RequestParam(value = "facilityImageFile", required = false) MultipartFile facilityImageFile,
                                HttpSession session,
                                RedirectAttributes redirectAttributes) {
        MemberDTO member = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        if (member == null) {
            redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
            return "redirect:/member/login";
        }
        try {
            FacilityDTO existingFacility = facilityService.getFacilityById(facilityId);
            if (existingFacility == null) {
                redirectAttributes.addFlashAttribute("error", "시설을 찾을 수 없습니다.");
                return "redirect:/facility/manage";
            }
            if (!existingFacility.getRegisteredMemberId().equals(member.getMemberId())
                && !Constants.MEMBER_ROLE_ADMIN.equals(member.getRole())) {
                redirectAttributes.addFlashAttribute("error", "해당 시설을 수정할 권한이 없습니다.");
                return "redirect:/facility/manage";
            }
            facilityDTO.setFacilityId(facilityId);
            facilityDTO.setRegisteredMemberId(existingFacility.getRegisteredMemberId());
            facilityDTO.setIsApproved(existingFacility.getIsApproved());
            String approvalStatus = existingFacility.getApprovalStatus();
            if (approvalStatus == null || approvalStatus.trim().isEmpty()) {
                if (existingFacility.getIsApproved() != null && existingFacility.getIsApproved()) {
                    approvalStatus = "APPROVED";
                    log.info("🔧 approval_status NULL 방지 - 승인된 시설: APPROVED");
                } else {
                    approvalStatus = "PENDING";
                    log.info("🔧 approval_status NULL 방지 - 미승인 시설: PENDING");
                }
            }
            facilityDTO.setApprovalStatus(approvalStatus);
            facilityDTO.setAverageRating(existingFacility.getAverageRating());
            facilityDTO.setReviewCount(existingFacility.getReviewCount());
            facilityDTO.setCurrentOccupancy(existingFacility.getCurrentOccupancy());
            facilityDTO.setGradeRating(existingFacility.getGradeRating());
            facilityService.updateFacility(facilityDTO, facilityImageFile);
            log.info("시설 정보 수정 완료: facilityId={}, memberId={}", facilityId, member.getMemberId());
            redirectAttributes.addFlashAttribute("message", "시설 정보가 성공적으로 수정되었습니다.");
            return "redirect:/facility/manage";
        } catch (Exception e) {
            log.error("시설 정보 수정 중 오류 발생: facilityId={}", facilityId, e);
            redirectAttributes.addFlashAttribute("error", "시설 정보 수정 중 오류가 발생했습니다.");
            return "redirect:/facility/edit/" + facilityId;
        }
    }
    @PostMapping("/delete/{facilityId}")
    public String deleteFacility(@PathVariable Long facilityId,
                                HttpSession session,
                                RedirectAttributes redirectAttributes) {
        MemberDTO member = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        if (member == null) {
            redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
            return "redirect:/member/login";
        }
        try {
            FacilityDTO facility = facilityService.getFacilityById(facilityId);
            if (facility == null) {
                redirectAttributes.addFlashAttribute("error", "시설을 찾을 수 없습니다.");
                return "redirect:/facility/manage";
            }
            if (!facility.getRegisteredMemberId().equals(member.getMemberId())
                && !Constants.MEMBER_ROLE_ADMIN.equals(member.getRole())) {
                redirectAttributes.addFlashAttribute("error", "해당 시설을 삭제할 권한이 없습니다.");
                return "redirect:/facility/manage";
            }
            facilityService.deleteFacility(facilityId);
            log.info("시설 삭제 완료: facilityId={}, memberId={}", facilityId, member.getMemberId());
            redirectAttributes.addFlashAttribute("message", "시설이 성공적으로 삭제되었습니다.");
            return "redirect:/facility/manage";
        } catch (Exception e) {
            log.error("시설 삭제 중 오류 발생: facilityId={}", facilityId, e);
            redirectAttributes.addFlashAttribute("error", "시설 삭제 중 오류가 발생했습니다.");
            return "redirect:/facility/manage";
        }
    }
    @GetMapping("/api/{facilityId}")
    @ResponseBody
    public FacilityDTO getFacilityApi(@PathVariable Long facilityId, HttpSession session) {
        MemberDTO member = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        if (member == null) {
            throw new RuntimeException("로그인이 필요합니다.");
        }
        FacilityDTO facility = facilityService.getFacilityById(facilityId);
        if (facility == null) {
            throw new RuntimeException("시설을 찾을 수 없습니다.");
        }
        if (!facility.getRegisteredMemberId().equals(member.getMemberId())
            && !Constants.MEMBER_ROLE_ADMIN.equals(member.getRole())) {
            throw new RuntimeException("해당 시설을 조회할 권한이 없습니다.");
        }
        return facility;
    }
    @GetMapping("/crop-images/{facilityId}")
    public String cropImagePage(@PathVariable Long facilityId,
                                HttpSession session,
                                Model model,
                                RedirectAttributes redirectAttributes) {
        try {
            MemberDTO member = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
            if (member == null) {
                redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
                return "redirect:/member/login";
            }
            FacilityDTO facility = facilityService.getFacilityById(facilityId);
            if (facility == null) {
                redirectAttributes.addFlashAttribute("error", "시설을 찾을 수 없습니다.");
                return "redirect:/facility/manage";
            }
            if (!facility.getRegisteredMemberId().equals(member.getMemberId())
                && !Constants.MEMBER_ROLE_ADMIN.equals(member.getRole())) {
                redirectAttributes.addFlashAttribute("error", "해당 시설의 이미지를 관리할 권한이 없습니다.");
                return "redirect:/facility/manage";
            }
            model.addAttribute("facility", facility);
            log.info("시설 이미지 크롭 페이지 접속: facilityId={}, memberId={}", facilityId, member.getMemberId());
            return "facility/crop-images";
        } catch (Exception e) {
            log.error("시설 이미지 크롭 페이지 오류: facilityId={}", facilityId, e);
            redirectAttributes.addFlashAttribute("error", "페이지 로드 중 오류가 발생했습니다.");
            return "redirect:/facility/manage";
        }
    }
    @PostMapping("/crop-images/save/{facilityId}")
    @ResponseBody
    public Map<String, Object> saveFacilityImage(@PathVariable Long facilityId,
                                                @RequestParam("facilityImage") MultipartFile facilityImageFile,
                                                @RequestParam(value = "altText", required = false) String altText,
                                                @RequestParam(value = "format", required = false) String format,
                                                @RequestParam(value = "imageIndex", required = false) String imageIndex,
                                                @RequestParam(value = "customFileName", required = false) String customFileName,
                                                HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        try {
            log.info("🔥 시설 이미지 저장 시작 - facilityId: {}, 받은 파라미터들 확인", facilityId);
            log.info("📋 altText: '{}', format: '{}', imageIndex: '{}', customFileName: '{}'", altText, format, imageIndex, customFileName);
            log.info("📁 파일 정보 - 이름: '{}', 크기: {}bytes, 타입: '{}'",
                    facilityImageFile.getOriginalFilename(), facilityImageFile.getSize(), facilityImageFile.getContentType());
            MemberDTO member = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
            if (member == null) {
                log.error("❌ 로그인된 사용자가 없음");
                result.put("success", false);
                result.put("message", "로그인이 필요합니다.");
                return result;
            }
            log.info("👤 로그인 사용자: {} (role: {})", member.getUserId(), member.getRole());
            FacilityDTO facility = facilityService.getFacilityById(facilityId);
            if (facility == null) {
                result.put("success", false);
                result.put("message", "시설을 찾을 수 없습니다.");
                return result;
            }
            if (!facility.getRegisteredMemberId().equals(member.getMemberId())
                && !Constants.MEMBER_ROLE_ADMIN.equals(member.getRole())) {
                result.put("success", false);
                result.put("message", "해당 시설의 이미지를 관리할 권한이 없습니다.");
                return result;
            }
            log.info("🖼️ 시설 이미지 저장 요청 - facilityId: {}, 형식: {}, 인덱스: {}, 크기: {} bytes",
                    facilityId, format, imageIndex, facilityImageFile.getSize());
            if (facilityImageFile.isEmpty()) {
                result.put("success", false);
                result.put("message", "업로드된 이미지 파일이 비어있습니다.");
                return result;
            }
            String finalAltText;
            if (altText != null && !altText.trim().isEmpty()) {
                finalAltText = altText.trim();
                log.info("🏷️ 시설 이미지 Alt 텍스트 설정: {}", finalAltText);
            } else {
                finalAltText = facility.getFacilityName() + " 시설 이미지";
                if (imageIndex != null && !imageIndex.isEmpty()) {
                    finalAltText += " " + (Integer.parseInt(imageIndex) + 1);
                }
                log.info("🏷️ 시설 이미지 Alt 텍스트 기본값 설정: {}", finalAltText);
            }
            String contentType = facilityImageFile.getContentType();
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
            Integer orderIndex = imageIndex != null ? Integer.parseInt(imageIndex) : null;
            log.info("🔧 서비스 호출 전 - facilityId: {}, orderIndex: {}, altText: '{}', customFileName: '{}'",
                facilityId, orderIndex, finalAltText, customFileName);
            FacilityImageDTO savedImage = facilityImageService.saveSingleFacilityImage(
                facilityId, facilityImageFile, finalAltText, orderIndex, customFileName);
            log.info("✅ 서비스 호출 완료 - 저장된 이미지ID: {}, 경로: {}", savedImage.getImageId(), savedImage.getImagePath());
            result.put("success", true);
            result.put("message", "시설 이미지가 성공적으로 저장되었습니다.");
            result.put("facilityId", facilityId);
            result.put("imageIndex", imageIndex);
            result.put("imageId", savedImage.getImageId());
            result.put("imagePath", savedImage.getImagePath());
            log.info("✅ 시설 이미지 저장 성공: facilityId={}, imageId={}", facilityId, savedImage.getImageId());
        } catch (Exception e) {
            log.error("❌ 시설 이미지 저장 중 오류 발생: facilityId={}", facilityId, e);
            result.put("success", false);
            result.put("message", "이미지 저장 중 오류가 발생했습니다: " + e.getMessage());
        }
        return result;
    }
}
````

## File: src/main/java/com/example/carelink/controller/MemberController.java
````java
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
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import javax.servlet.http.HttpSession;
import javax.validation.ConstraintViolation;
import javax.validation.Valid;
import javax.validation.Validator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
@Slf4j
@Controller
@RequestMapping("/member")
@RequiredArgsConstructor
public class MemberController {
    private final MemberService memberService;
    @Autowired
    private Validator validator;
    @GetMapping("/login")
    public String loginForm(Model model) {
        model.addAttribute("loginDTO", new LoginDTO());
        return "member/login";
    }
    @PostMapping("/login")
    public String login(@Valid @ModelAttribute LoginDTO loginDTO,
                        BindingResult bindingResult,
                        HttpSession session,
                        RedirectAttributes redirectAttributes) {
        if (bindingResult.hasErrors()) {
            log.warn("로그인 폼 유효성 검사 실패: {}", bindingResult.getAllErrors());
            return "member/login";
        }
        log.info("로그인 시도: userId={}, 비밀번호 길이={}", loginDTO.getUserId(), loginDTO.getPassword().length());
        try {
            MemberDTO loginMember = memberService.login(loginDTO);
            if (loginMember != null) {
                session.setAttribute(Constants.SESSION_MEMBER, loginMember);
                session.setAttribute("memberId", loginMember.getMemberId());
                log.info("컨트롤러 로그인 성공: userId={}, role={}", loginMember.getUserId(), loginMember.getRole());
                redirectAttributes.addFlashAttribute("message", "로그인되었습니다.");
                return "redirect:/";
            } else {
                log.warn("컨트롤러 로그인 실패: userId={}", loginDTO.getUserId());
                redirectAttributes.addFlashAttribute("error", "아이디 또는 비밀번호가 잘못되었습니다.");
                return "redirect:/member/login";
            }
        } catch (Exception e) {
            log.error("로그인 처리 중 오류 발생: userId={}", loginDTO.getUserId(), e);
            redirectAttributes.addFlashAttribute("error", "로그인 처리 중 오류가 발생했습니다.");
            return "redirect:/member/login";
        }
    }
    @GetMapping("/logout")
    public String logout(HttpSession session, RedirectAttributes redirectAttributes) {
        if (session != null) {
            session.invalidate();
        }
        redirectAttributes.addFlashAttribute("message", "로그아웃되었습니다.");
        return "redirect:/";
    }
    @GetMapping("/join")
    public String joinForm(Model model) {
        model.addAttribute("memberDTO", new MemberDTO());
        return "member/join";
    }
    @PostMapping("/join")
    public String join(
            @Validated(value = {javax.validation.groups.Default.class})
            @ModelAttribute MemberDTO memberDTO,
            BindingResult bindingResult,
            @RequestParam(value = "facilityImageFile", required = false) MultipartFile facilityImageFile,
            HttpSession session,
            RedirectAttributes redirectAttributes,
            Model model) {
        if (!memberDTO.getPassword().equals(memberDTO.getPasswordConfirm())) {
            bindingResult.rejectValue("passwordConfirm", "password.mismatch", "비밀번호 확인이 일치하지 않습니다.");
            log.warn("회원가입 실패: 비밀번호 확인 불일치");
            model.addAttribute("memberDTO", memberDTO);
            return "member/join";
        }
        if ("FACILITY".equalsIgnoreCase(memberDTO.getRole())) {
            Set<ConstraintViolation<MemberDTO>> violations = validator.validate(memberDTO, OnFacilityJoin.class);
            for (ConstraintViolation<MemberDTO> violation : violations) {
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
            memberService.join(memberDTO, facilityImageFile);
            log.info("회원가입 성공: {}", memberDTO.getUserId());
            LoginDTO loginDTO = new LoginDTO();
            loginDTO.setUserId(memberDTO.getUserId());
            loginDTO.setPassword(memberDTO.getPassword());
            MemberDTO loginMember = memberService.login(loginDTO);
            if (loginMember != null) {
                session.setAttribute(Constants.SESSION_MEMBER, loginMember);
                session.setAttribute("memberId", loginMember.getMemberId());
                log.info("회원가입 후 자동 로그인 성공: userId={}", loginMember.getUserId());
                redirectAttributes.addFlashAttribute("message", "회원가입이 완료되었습니다. 환영합니다!");
                return "redirect:/";
            } else {
                log.warn("회원가입은 성공했으나 자동 로그인 실패: {}", memberDTO.getUserId());
                redirectAttributes.addFlashAttribute("message", "회원가입이 완료되었습니다. 로그인해주세요.");
                return "redirect:/member/login";
            }
        } catch (IllegalArgumentException e) {
            log.warn("회원가입 실패: {}", e.getMessage());
            bindingResult.rejectValue("userId", "duplicate.userId", e.getMessage());
            return "member/join";
        } catch (Exception e) {
            log.error("회원가입 처리 중 알 수 없는 오류 발생", e);
            redirectAttributes.addFlashAttribute("error", "회원가입 처리 중 오류가 발생했습니다.");
            return "member/join";
        }
    }
    @PostMapping("/checkUserId")
    @ResponseBody
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
    @GetMapping("/debug/password-test")
    @ResponseBody
    public Map<String, Object> debugPasswordTest(@RequestParam(defaultValue = "admin") String userId,
                                                 @RequestParam(defaultValue = "admin123") String password) {
        Map<String, Object> result = new HashMap<>();
        try {
            MemberDTO member = memberService.getMemberByUserId(userId);
            if (member == null) {
                result.put("error", "사용자를 찾을 수 없습니다: " + userId);
                return result;
            }
            result.put("userId", member.getUserId());
            result.put("dbPasswordHash", member.getPassword());
            result.put("dbPasswordLength", member.getPassword().length());
            result.put("inputPassword", password);
            result.put("inputPasswordLength", password.length());
            boolean isValidBcryptFormat = member.getPassword().startsWith("$2a$") ||
                                        member.getPassword().startsWith("$2b$") ||
                                        member.getPassword().startsWith("$2y$");
            result.put("isValidBcryptFormat", isValidBcryptFormat);
            LoginDTO loginDTO = new LoginDTO();
            loginDTO.setUserId(userId);
            loginDTO.setPassword(password);
            MemberDTO loginResult = memberService.login(loginDTO);
            result.put("loginSuccess", loginResult != null);
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
    @GetMapping("/myinfo")
    public String verifyPasswordForm(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
        MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        if (loginMember == null) {
            redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
            return "redirect:/member/login";
        }
        return "member/verifyPassword";
    }
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
            if (!password.equals(loginMember.getPassword())) {
                redirectAttributes.addFlashAttribute("error", "비밀번호가 일치하지 않습니다.");
                return "redirect:/member/myinfo";
            }
            return "redirect:/member/myinfo/edit";
        } catch (Exception e) {
            log.error("비밀번호 확인 중 오류 발생: {}", loginMember.getUserId(), e);
            redirectAttributes.addFlashAttribute("error", "비밀번호 확인 중 오류가 발생했습니다.");
            return "redirect:/member/myinfo";
        }
    }
    @GetMapping("/myinfo/edit")
    public String myInfoEdit(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
        MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        if (loginMember == null) {
            redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
            return "redirect:/member/login";
        }
        try {
            MemberDTO memberInfo = memberService.findById(loginMember.getMemberId());
            if (memberInfo == null) {
                redirectAttributes.addFlashAttribute("error", "사용자 정보를 찾을 수 없습니다.");
                session.invalidate();
                return "redirect:/member/login";
            }
            session.setAttribute("myinfo_verified", true);
            model.addAttribute("memberDTO", memberInfo);
            return "member/myinfo";
        } catch (Exception e) {
            log.error("마이페이지 정보 조회 중 오류 발생: {}", loginMember.getUserId(), e);
            redirectAttributes.addFlashAttribute("error", "회원 정보를 불러오는 중 오류가 발생했습니다.");
            return "redirect:/";
        }
    }
    @GetMapping("/myinfo/crop-image")
    public String cropImagePage(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
        MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        if (loginMember == null) {
            redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
            return "redirect:/member/login";
        }
        Boolean myinfoVerified = (Boolean) session.getAttribute("myinfo_verified");
        if (myinfoVerified == null || !myinfoVerified) {
            redirectAttributes.addFlashAttribute("error", "올바른 경로로 접근해주세요.");
            return "redirect:/member/myinfo";
        }
        model.addAttribute("memberDTO", loginMember);
        return "member/crop-image";
    }
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
            if (imageFile.getSize() > 5 * 1024 * 1024) {
                result.put("success", false);
                result.put("message", "파일 크기는 5MB 이하여야 합니다.");
                return result;
            }
            String contentType = imageFile.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                result.put("success", false);
                result.put("message", "이미지 파일만 업로드 가능합니다.");
                return result;
            }
            byte[] imageBytes = imageFile.getBytes();
            String base64Image = "data:" + contentType + ";base64," +
                                java.util.Base64.getEncoder().encodeToString(imageBytes);
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
            if (croppedImageFile.isEmpty()) {
                result.put("success", false);
                result.put("message", "업로드된 이미지 파일이 비어있습니다.");
                return result;
            }
            MemberDTO memberDTO = memberService.findById(loginMember.getMemberId());
            if (memberDTO == null) {
                result.put("success", false);
                result.put("message", "회원 정보를 찾을 수 없습니다.");
                return result;
            }
            log.info("📋 받은 파라미터 - altText: '{}', format: '{}', quality: '{}'", altText, format, quality);
            if (altText != null && !altText.trim().isEmpty()) {
                memberDTO.setProfileImageAltText(altText.trim());
                log.info("🏷️ 프로필 이미지 Alt 텍스트 설정: {}", altText.trim());
            } else {
                memberDTO.setProfileImageAltText("사용자 프로필 사진");
                log.info("🏷️ 프로필 이미지 Alt 텍스트 기본값 설정: 사용자 프로필 사진");
            }
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
            memberService.updateMember(memberDTO, croppedImageFile);
            MemberDTO updatedMember = memberService.findById(loginMember.getMemberId());
            if (updatedMember != null) {
                session.setAttribute(Constants.SESSION_MEMBER, updatedMember);
            }
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
    @GetMapping("/mypage/change-password")
    public String changePasswordForm(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
        MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        if (loginMember == null) {
            redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
            return "redirect:/member/login";
        }
        return "member/changePassword";
    }
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
        String userId = loginMember.getUserId();
        try {
            memberService.changePassword(userId, currentPassword, newPassword, confirmNewPassword);
            redirectAttributes.addFlashAttribute("message", "비밀번호가 성공적으로 변경되었습니다.");
            return "redirect:/member/myinfo/edit";
        } catch (IllegalArgumentException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/member/mypage/change-password";
        } catch (Exception e) {
            log.error("비밀번호 변경 중 오류 발생: {}", userId, e);
            redirectAttributes.addFlashAttribute("error", "비밀번호 변경 중 오류가 발생했습니다.");
            return "redirect:/member/mypage/change-password";
        }
    }
    @GetMapping("/mypage/delete")
    public String deleteMemberForm(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
        MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        if (loginMember == null) {
            redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
            return "redirect:/member/login";
        }
        try {
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
            MemberDTO currentMember = memberService.findById(loginMember.getMemberId());
            if (currentMember == null) {
                log.warn("회원탈퇴: 회원 정보를 찾을 수 없음: memberId={}", loginMember.getMemberId());
                redirectAttributes.addFlashAttribute("error", "회원 정보를 찾을 수 없습니다.");
                return "redirect:/member/mypage/delete";
            }
            log.info("비밀번호 비교: DB 비밀번호={}, 입력 비밀번호={}",
                    currentMember.getPassword(), password);
            if (!password.equals(currentMember.getPassword())) {
                log.warn("회원탈퇴: 비밀번호 불일치: userId={}", userId);
                redirectAttributes.addFlashAttribute("error", "현재 비밀번호가 일치하지 않습니다.");
                return "redirect:/member/mypage/delete";
            }
            log.info("비밀번호 확인 성공: userId={}", userId);
            if (!confirmName.trim().equals(currentMember.getName().trim())) {
                log.warn("회원탈퇴: 이름 불일치: userId={}, 입력된 이름={}, 등록된 이름={}",
                        userId, confirmName, currentMember.getName());
                redirectAttributes.addFlashAttribute("error",
                        String.format("이름이 일치하지 않습니다. 등록된 이름 '%s'를 정확히 입력해주세요.", currentMember.getName()));
                return "redirect:/member/mypage/delete";
            }
            log.info("이름 확인 성공: userId={}, 이름={}", userId, confirmName);
            String resultMessage = memberService.deleteMemberWithOption(userId, deleteOption);
            log.info("회원탈퇴 완료: userId={}, 옵션={}", userId, deleteOption);
            session.invalidate();
            redirectAttributes.addFlashAttribute("message", resultMessage + " 그동안 이용해 주셔서 감사합니다.");
            return "redirect:/";
        } catch (Exception e) {
            log.error("회원 탈퇴 처리 중 오류 발생: {}", userId, e);
            redirectAttributes.addFlashAttribute("error", "회원 탈퇴 처리 중 오류가 발생했습니다.");
            return "redirect:/member/mypage/delete";
        }
    }
    @GetMapping("/admin/members")
    public String listMembers(@RequestParam(defaultValue = "1") int page,
                              @RequestParam(defaultValue = "10") int pageSize,
                              @RequestParam(required = false) String role,
                              Model model, HttpSession session, RedirectAttributes redirectAttributes) {
        MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        if (loginMember == null || !Constants.MEMBER_ROLE_ADMIN.equals(loginMember.getRole())) {
            redirectAttributes.addFlashAttribute("error", "관리자 권한이 필요합니다.");
            return "redirect:/";
        }
        try {
            MemberDTO searchDTO = new MemberDTO();
            searchDTO.setPageSize(pageSize);
            searchDTO.setOffset((page - 1) * pageSize);
            searchDTO.setRole(role);
            List<MemberDTO> members = memberService.getMembersWithPaging(searchDTO);
            int totalMembers = memberService.getTotalMembersCount();
            int totalPages = (int) Math.ceil((double) totalMembers / pageSize);
            model.addAttribute("members", members);
            model.addAttribute("currentPage", page);
            model.addAttribute("totalPages", totalPages);
            model.addAttribute("pageSize", pageSize);
            model.addAttribute("currentRole", role);
            return "member/memberList";
        } catch (Exception e) {
            log.error("관리자 회원 목록 조회 중 오류 발생", e);
            redirectAttributes.addFlashAttribute("error", "회원 목록 조회 중 오류가 발생했습니다.");
            return "redirect:/";
        }
    }
    @PostMapping("/admin/members/status")
    public String updateMemberStatus(@RequestParam Long memberId,
                                     @RequestParam boolean isActive,
                                     HttpSession session, RedirectAttributes redirectAttributes) {
        MemberDTO loginMember = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
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
        return "redirect:/member/admin/members";
    }
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
            int offset = (page - 1) * pageSize;
            Map<String, Object> result = memberService.getMyPosts(memberId, type, page, pageSize, offset);
            model.addAttribute("member", loginMember);
            model.addAttribute("posts", result.get("posts"));
            model.addAttribute("totalCount", result.get("totalCount"));
            model.addAttribute("currentType", type);
            model.addAttribute("currentPage", page);
            model.addAttribute("pageSize", pageSize);
            model.addAttribute("totalPages", (int) Math.ceil((double) (Integer) result.get("totalCount") / pageSize));
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
````
