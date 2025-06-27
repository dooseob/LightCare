package com.example.carelink.util;

import com.example.carelink.dao.MemberMapper;
import com.example.carelink.dto.MemberDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 비밀번호 마이그레이션 유틸리티
 * 기존 평문 비밀번호를 BCrypt로 암호화
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PasswordMigrationUtil {

    private final MemberMapper memberMapper;
    private final PasswordEncoder passwordEncoder;

    /**
     * 모든 회원의 평문 비밀번호를 BCrypt로 암호화
     * 주의: 이 메서드는 한 번만 실행해야 합니다!
     */
    public void migrateAllPasswords() {
        log.info("비밀번호 마이그레이션 시작...");
        
        try {
            // 모든 회원 조회 (간단한 구현을 위해 페이징 없이)
            List<MemberDTO> allMembers = memberMapper.findMembersWithPaging(new MemberDTO());
            
            int migratedCount = 0;
            for (MemberDTO member : allMembers) {
                // 이미 BCrypt로 암호화된 비밀번호인지 확인
                // BCrypt 해시는 $2a$, $2b$, $2y$ 등으로 시작함
                if (!member.getPassword().startsWith("$2")) {
                    // 평문 비밀번호를 BCrypt로 암호화
                    String encodedPassword = passwordEncoder.encode(member.getPassword());
                    member.setPassword(encodedPassword);
                    
                    // 데이터베이스 업데이트
                    memberMapper.updatePassword(member);
                    migratedCount++;
                    
                    log.debug("비밀번호 마이그레이션 완료: {}", member.getUserId());
                }
            }
            
            log.info("비밀번호 마이그레이션 완료. 총 {}명의 비밀번호가 암호화되었습니다.", migratedCount);
            
        } catch (Exception e) {
            log.error("비밀번호 마이그레이션 중 오류 발생", e);
            throw new RuntimeException("비밀번호 마이그레이션 실패", e);
        }
    }

    /**
     * 특정 회원의 비밀번호만 마이그레이션
     */
    public void migratePasswordForUser(String userId) {
        log.info("사용자 {}의 비밀번호 마이그레이션 시작", userId);
        
        try {
            MemberDTO member = memberMapper.findByUserId(userId);
            if (member == null) {
                throw new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId);
            }
            
            // 이미 암호화된 비밀번호인지 확인
            if (!member.getPassword().startsWith("$2")) {
                String encodedPassword = passwordEncoder.encode(member.getPassword());
                member.setPassword(encodedPassword);
                memberMapper.updatePassword(member);
                
                log.info("사용자 {}의 비밀번호 마이그레이션 완료", userId);
            } else {
                log.info("사용자 {}의 비밀번호는 이미 암호화되어 있습니다", userId);
            }
            
        } catch (Exception e) {
            log.error("사용자 {}의 비밀번호 마이그레이션 중 오류 발생", userId, e);
            throw new RuntimeException("비밀번호 마이그레이션 실패: " + userId, e);
        }
    }
} 