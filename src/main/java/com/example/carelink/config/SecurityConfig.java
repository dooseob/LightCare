package com.example.carelink.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
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
                                new AntPathRequestMatcher("/"),             // 메인 페이지
                                new AntPathRequestMatcher("/member/login"), // 로그인 폼 페이지
                                new AntPathRequestMatcher("/member/join"),  // 회원가입 폼 페이지
                                new AntPathRequestMatcher("/member/checkUserId"), // 아이디 중복 확인 Ajax
                                new AntPathRequestMatcher("/api/**"),       // API 경로 (필요시)
                                new AntPathRequestMatcher("/error")         // 에러 페이지 (필요시)
                        ).permitAll()
                        .anyRequest().authenticated() // 그 외 모든 요청은 인증 필요
                )
                .formLogin(formLogin -> formLogin // 기본 폼 로그인 사용 설정
                        .loginPage("/member/login") // 로그인 페이지 URL (GET 요청)
                        .loginProcessingUrl("/member/login") // 로그인 처리 URL (POST 요청)
                        .defaultSuccessUrl("/", true) // 로그인 성공 시 기본 이동 페이지
                        .failureUrl("/member/login?error=true") // 로그인 실패 시 이동 페이지
                        .usernameParameter("userId") // 로그인 폼에서 사용자 ID 필드 이름
                        .passwordParameter("password") // 로그인 폼에서 비밀번호 필드 이름
                        .permitAll() // 로그인 관련 페이지는 모든 사용자에게 허용
                )
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
