package com.example.carelink.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

/**
 * 운영 환경 전용 보안 설정
 * 실제 서비스 환경에 적합한 보안 강화 설정
 */
@Configuration
@EnableWebSecurity
@Profile("prod")
public class ProdSecurityConfig {

    @Bean
    public SecurityFilterChain prodFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf
                .csrfTokenRepository(org.springframework.security.web.csrf.CookieCsrfTokenRepository.withHttpOnlyFalse())
            ) // 운영 환경에서는 CSRF 보호 활성화
            .authorizeHttpRequests(auth -> auth
                // 정적 리소스 허용
                .requestMatchers(
                    new AntPathRequestMatcher("/css/**"),
                    new AntPathRequestMatcher("/js/**"),
                    new AntPathRequestMatcher("/images/**"),
                    new AntPathRequestMatcher("/favicon.ico")
                ).permitAll()
                // 인증 없이 접근을 허용할 URL 설정 (기존 SecurityConfig와 동일)
                .requestMatchers(
                    new AntPathRequestMatcher("/"),                    // 메인 페이지
                    new AntPathRequestMatcher("/member/login"),       // 로그인 폼 페이지 및 처리
                    new AntPathRequestMatcher("/member/join"),        // 회원가입 폼 페이지 및 처리
                    new AntPathRequestMatcher("/member/checkUserId"), // 아이디 중복 확인 Ajax
                    new AntPathRequestMatcher("/facility/**"),        // 시설 검색 페이지 (비회원도 접근 가능)
                    new AntPathRequestMatcher("/board/**"),           // 게시판 페이지 (비회원도 접근 가능)
                    new AntPathRequestMatcher("/review/**"),          // 리뷰 페이지 (비회원도 접근 가능)
                    new AntPathRequestMatcher("/job/**"),             // 구인구직 페이지 (비회원도 접근 가능)
                    new AntPathRequestMatcher("/api/**"),             // API 경로 (필요시)
                    new AntPathRequestMatcher("/error")               // 에러 페이지 (필요시)
                ).permitAll()
                // 관리자 페이지는 ADMIN 권한 필요
                .requestMatchers(new AntPathRequestMatcher("/admin/**")).hasRole("ADMIN")
                // 나머지는 인증 필요 (운영 환경)
                .anyRequest().authenticated()
            )
            .formLogin(formLogin -> formLogin
                .loginPage("/member/login")
                .defaultSuccessUrl("/")
                .failureUrl("/member/login?error=true")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutRequestMatcher(new AntPathRequestMatcher("/member/logout")) // 로그아웃 URL
                .logoutSuccessUrl("/") // 로그아웃 성공 시 이동 페이지
                .invalidateHttpSession(true) // 세션 무효화
                .deleteCookies("JSESSIONID") // 쿠키 삭제
                .permitAll()
            )
            .sessionManagement(session -> session
                .maximumSessions(1) // 동시 로그인 세션 1개로 제한
                .maxSessionsPreventsLogin(false) // 새 로그인 시 기존 세션 무효화
            );

        return http.build();
    }
}