package com.example.carelink.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * 비밀번호 암호화 설정
 * BCryptPasswordEncoder를 빈으로 등록
 */
@Configuration
public class PasswordConfig {

    /**
     * BCrypt 암호화 인코더 빈 등록
     * - 강력한 해시 함수 사용
     * - Salt 자동 생성
     * - 동일한 비밀번호도 매번 다른 해시값 생성
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
} 