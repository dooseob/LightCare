package com.example.carelink.dto;

import lombok.Data;
import javax.validation.constraints.NotBlank;

/**
 * 로그인 요청 DTO
 * 팀원 A 담당: 로그인 기능에서 사용
 */
@Data
public class LoginDTO {
    
    @NotBlank(message = "사용자 ID를 입력해주세요")
    private String userId;        // 사용자 ID
    
    @NotBlank(message = "비밀번호를 입력해주세요")
    private String password;      // 비밀번호
    
    private boolean rememberMe;   // 로그인 상태 유지
} 