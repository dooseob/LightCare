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
                .csrf(csrf -> csrf.disable()) // CSRF 보호 비활성화 (개발 시 편의, 실제 서비스에서는 활성화 권장)
                .authorizeHttpRequests(authorize -> authorize
                        // 정적 리소스에 대한 접근 허용 설정
                        .requestMatchers(
                                new AntPathRequestMatcher("/css/**"),
                                new AntPathRequestMatcher("/js/**"),
                                new AntPathRequestMatcher("/images/**"),
                                new AntPathRequestMatcher("/favicon.ico")
                        ).permitAll()
                        // 인증 없이 접근을 허용할 URL 설정
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
                        .anyRequest().permitAll() // 개발 편의상 모든 요청 허용 (운영 시에는 authenticated()로 변경)
                )
                .formLogin(formLogin -> formLogin.disable()) // 기본 폼 로그인 비활성화 (커스텀 로그인 사용)
                .logout(logout -> logout
                        .logoutRequestMatcher(new AntPathRequestMatcher("/member/logout")) // 로그아웃 URL
                        .logoutSuccessUrl("/") // 로그아웃 성공 시 이동 페이지
                        .invalidateHttpSession(true) // 세션 무효화
                        .deleteCookies("JSESSIONID") // 쿠키 삭제
                        .permitAll()
                );

        return http.build();
    }

}
