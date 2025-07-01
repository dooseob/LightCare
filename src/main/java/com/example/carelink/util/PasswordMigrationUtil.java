package com.example.carelink.util;

import com.example.carelink.dao.MemberMapper;
import com.example.carelink.dto.MemberDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 비밀번호 마이그레이션 유틸리티
 * 기존 평문 비밀번호를 BCrypt로 암호화하는 기능
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PasswordMigrationUtil {

    private final MemberMapper memberMapper;
    private final PasswordEncoder passwordEncoder;

    /**
     * 모든 회원의 비밀번호를 BCrypt로 마이그레이션
     * @return 마이그레이션된 계정 수
     */
    public int migrateAllPasswords() {
        log.info("비밀번호 마이그레이션 시작");
        
        // 기존 메서드를 사용하여 모든 회원 조회 (역할별로 조회하여 합치기)
        List<MemberDTO> allMembers = memberMapper.findMembersByRole("USER");
        allMembers.addAll(memberMapper.findMembersByRole("FACILITY"));
        allMembers.addAll(memberMapper.findMembersByRole("ADMIN"));
        
        int migratedCount = 0;

        for (MemberDTO member : allMembers) {
            try {
                // 이미 BCrypt로 암호화된 비밀번호인지 확인
                if (!member.getPassword().startsWith("$2a$")) {
                    // 평문 비밀번호를 BCrypt로 암호화
                    String encryptedPassword = passwordEncoder.encode(member.getPassword());
                    
                    // 비밀번호 업데이트 (기존 updateMember 사용)
                    member.setPassword(encryptedPassword);
                    member.setUpdatedAt(LocalDateTime.now());
                    
                    memberMapper.updateMember(member);
                    migratedCount++;
                    
                    log.debug("비밀번호 마이그레이션 완료: {}", member.getUserId());
                }
            } catch (Exception e) {
                log.error("회원 {} 비밀번호 마이그레이션 실패", member.getUserId(), e);
            }
        }

        log.info("비밀번호 마이그레이션 완료: {}개 계정 처리됨", migratedCount);
        return migratedCount;
    }

    /**
     * 테스트 계정 생성
     */
    public void createTestAccounts() {
        log.info("테스트 계정 생성 시작");
        
        try {
            // 관리자 계정
            createTestAccount("admin", "admin123", "관리자", "admin@lightcare.com", "ADMIN");
            
            // 일반 사용자 계정
            createTestAccount("user1", "user123", "테스트사용자1", "user1@test.com", "USER");
            
            // 시설 관리자 계정
            createTestAccount("facility1", "facility123", "시설관리자1", "facility1@test.com", "FACILITY");
            
            log.info("테스트 계정 생성 완료");
            
        } catch (Exception e) {
            log.error("테스트 계정 생성 실패", e);
            throw e;
        }
    }

    /**
     * 개별 테스트 계정 생성
     */
    private void createTestAccount(String userId, String password, String name, String email, String role) {
        try {
            // 이미 존재하는 계정인지 확인
            MemberDTO existingMember = memberMapper.findByUserId(userId);
            if (existingMember != null) {
                log.warn("테스트 계정 {} 이미 존재함", userId);
                return;
            }

            MemberDTO testMember = new MemberDTO();
            testMember.setUserId(userId);
            testMember.setPassword(passwordEncoder.encode(password)); // BCrypt 암호화
            testMember.setName(name);
            testMember.setEmail(email);
            testMember.setRole(role);
            testMember.setActive(true);
            testMember.setCreatedAt(LocalDateTime.now());
            testMember.setUpdatedAt(LocalDateTime.now());

            memberMapper.insertMember(testMember);
            log.info("테스트 계정 생성 완료: {} ({})", userId, role);
            
        } catch (Exception e) {
            log.error("테스트 계정 {} 생성 실패", userId, e);
            throw e;
        }
    }
} 