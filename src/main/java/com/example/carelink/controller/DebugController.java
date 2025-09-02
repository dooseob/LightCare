package com.example.carelink.controller;

import com.example.carelink.service.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

/**
 * Railway 배포 환경 디버깅용 컨트롤러
 */
@Slf4j
@RestController
@RequiredArgsConstructor
public class DebugController {
    
    @Autowired(required = false)
    private JdbcTemplate jdbcTemplate;
    
    @Autowired(required = false)
    private DataSource dataSource;
    
    private final MemberService memberService;
    
    /**
     * Railway 환경 체크
     */
    @GetMapping("/debug/railway")
    public Map<String, Object> checkRailwayEnvironment() {
        Map<String, Object> result = new HashMap<>();
        
        // 1. 환경변수 체크
        Map<String, String> envVars = new HashMap<>();
        envVars.put("RAILWAY_ENVIRONMENT", System.getenv("RAILWAY_ENVIRONMENT"));
        envVars.put("DB_URL", System.getenv("DB_URL") != null ? "SET (hidden)" : "NOT SET");
        envVars.put("DB_USERNAME", System.getenv("DB_USERNAME") != null ? "SET (hidden)" : "NOT SET");
        envVars.put("DB_PASSWORD", System.getenv("DB_PASSWORD") != null ? "SET (hidden)" : "NOT SET");
        envVars.put("PORT", System.getenv("PORT"));
        result.put("environment_variables", envVars);
        
        // 2. 시스템 속성
        Map<String, String> sysProps = new HashMap<>();
        sysProps.put("user.dir", System.getProperty("user.dir"));
        sysProps.put("os.name", System.getProperty("os.name"));
        sysProps.put("java.version", System.getProperty("java.version"));
        result.put("system_properties", sysProps);
        
        // 3. 데이터베이스 연결 테스트
        Map<String, Object> dbStatus = new HashMap<>();
        try {
            if (dataSource != null) {
                try (Connection conn = dataSource.getConnection()) {
                    dbStatus.put("connected", true);
                    dbStatus.put("database", conn.getCatalog());
                    dbStatus.put("url", conn.getMetaData().getURL());
                    
                    // member 테이블 존재 확인
                    if (jdbcTemplate != null) {
                        Integer count = jdbcTemplate.queryForObject(
                            "SELECT COUNT(*) FROM member", Integer.class);
                        dbStatus.put("member_count", count);
                    }
                }
            } else {
                dbStatus.put("connected", false);
                dbStatus.put("error", "DataSource is null");
            }
        } catch (Exception e) {
            dbStatus.put("connected", false);
            dbStatus.put("error", e.getMessage());
            log.error("Database connection failed", e);
        }
        result.put("database", dbStatus);
        
        // 4. 파일 시스템 체크
        Map<String, Object> fileSystem = new HashMap<>();
        String[] paths = {"/app/uploads", "/app/uploads/profile", "C:/carelink-uploads/profile"};
        for (String path : paths) {
            Map<String, Object> pathInfo = new HashMap<>();
            java.io.File file = new java.io.File(path);
            pathInfo.put("exists", file.exists());
            pathInfo.put("canWrite", file.canWrite());
            fileSystem.put(path, pathInfo);
        }
        result.put("file_system", fileSystem);
        
        return result;
    }
    
    /**
     * 데이터베이스 직접 테스트
     */
    @GetMapping("/debug/db-test")
    public Map<String, Object> testDatabase(@RequestParam(defaultValue = "admin") String userId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 1. 기본 쿼리 테스트
            if (jdbcTemplate != null) {
                String query = "SELECT user_id, password, name FROM member WHERE user_id = ?";
                Map<String, Object> user = jdbcTemplate.queryForMap(query, userId);
                result.put("user_found", true);
                result.put("user_id", user.get("user_id"));
                result.put("name", user.get("name"));
                result.put("password_length", user.get("password") != null ? 
                    user.get("password").toString().length() : 0);
            } else {
                result.put("error", "JdbcTemplate is null");
            }
        } catch (Exception e) {
            result.put("error", e.getMessage());
            result.put("user_found", false);
        }
        
        return result;
    }
}