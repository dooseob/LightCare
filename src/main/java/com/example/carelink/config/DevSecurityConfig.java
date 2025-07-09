package com.example.carelink.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * 개발 환경 전용 보안 설정
 * 개발 편의성을 위해 보안을 완화한 설정
 */
@Configuration
@EnableWebSecurity
@Profile("dev")
public class DevSecurityConfig {

    @Bean
    public SecurityFilterChain devFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // 개발 환경에서는 CSRF 비활성화
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll() // 개발 환경에서는 모든 요청 허용
            )
            .formLogin(formLogin -> formLogin.disable()) // 개발 환경에서는 기본 폼 로그인 비활성화
            .httpBasic(httpBasic -> httpBasic.disable()); // 개발 환경에서는 Basic 인증 비활성화

        return http.build();
    }
}