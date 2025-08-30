package com.example.carelink.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

/**
 * 시스템 상태 확인용 컨트롤러
 * Railway 배포 환경에서 파일 시스템 상태 확인
 */
@RestController
public class HealthController {

    @Value("${file.upload-dir.facility:C:/carelink-uploads/facility/}")
    private String facilityUploadDir;
    
    @Value("${file.upload-dir.profile:C:/carelink-uploads/profile/}")
    private String profileUploadDir;
    
    @Value("${file.upload-dir.board:C:/carelink-uploads/board/}")
    private String boardUploadDir;
    
    @Value("${file.upload-dir.review:C:/carelink-uploads/review/}")
    private String reviewUploadDir;

    /**
     * 파일 업로드 디렉터리 상태 확인
     */
    @GetMapping("/api/health/file-system")
    public ResponseEntity<Map<String, Object>> checkFileSystem() {
        Map<String, Object> result = new HashMap<>();
        Map<String, Object> directories = new HashMap<>();
        
        try {
            // 각 디렉터리 상태 확인
            directories.put("facility", checkDirectory(facilityUploadDir));
            directories.put("profile", checkDirectory(profileUploadDir));
            directories.put("board", checkDirectory(boardUploadDir));
            directories.put("review", checkDirectory(reviewUploadDir));
            
            // 전체 상태 판단
            boolean allHealthy = directories.values().stream()
                .allMatch(status -> status instanceof Map && 
                         Boolean.TRUE.equals(((Map<?, ?>) status).get("exists")));
            
            result.put("status", allHealthy ? "healthy" : "warning");
            result.put("directories", directories);
            result.put("activeProfile", System.getProperty("spring.profiles.active", "default"));
            result.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            result.put("status", "error");
            result.put("error", e.getMessage());
            return ResponseEntity.status(500).body(result);
        }
    }
    
    private Map<String, Object> checkDirectory(String dirPath) {
        Map<String, Object> status = new HashMap<>();
        
        try {
            File dir = new File(dirPath);
            status.put("path", dirPath);
            status.put("exists", dir.exists());
            status.put("isDirectory", dir.isDirectory());
            status.put("canWrite", dir.canWrite());
            status.put("canRead", dir.canRead());
            
            if (!dir.exists()) {
                boolean created = dir.mkdirs();
                status.put("autoCreated", created);
            }
            
        } catch (Exception e) {
            status.put("error", e.getMessage());
        }
        
        return status;
    }
}