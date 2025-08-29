package com.example.carelink.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.sql.Timestamp;

/**
 * 게시판 이미지 DTO
 * WebP 변환 및 다중 썸네일 지원
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardImageDTO {
    
    private Long imageId;                // 이미지 ID
    private Long boardId;                // 게시글 ID
    
    // 이미지 경로
    private String imagePath;            // 원본 이미지 경로
    private String webpPath;             // WebP 변환 이미지 경로
    private String thumbnailSmall;       // 작은 썸네일 (300x200)
    private String thumbnailMedium;      // 중간 썸네일 (600x400)
    private String thumbnailLarge;       // 큰 썸네일 (1200x800)
    private String fallbackJpgPath;      // JPG fallback 경로
    
    // 파일 정보
    private String originalFilename;     // 원본 파일명
    private Long fileSize;               // 파일 크기 (bytes)
    private Long fileSizeWebp;           // WebP 파일 크기 (bytes)
    private Integer width;               // 이미지 너비
    private Integer height;              // 이미지 높이
    
    // SEO/접근성
    private String altText;              // 이미지 대체 텍스트
    private String caption;              // 이미지 설명
    
    // 순서 및 상태
    private Integer imageOrder;          // 이미지 순서 (0부터)
    private Boolean isActive;            // 활성 상태
    
    // 날짜
    private Timestamp uploadDate;        // 업로드 일시
    private Timestamp updatedAt;         // 수정 일시
    
    // ===== 추가 유틸리티 메서드 =====
    
    /**
     * 가장 적합한 이미지 경로 반환 (WebP 우선)
     */
    public String getBestImagePath() {
        if (webpPath != null && !webpPath.isEmpty()) {
            return webpPath;
        }
        if (fallbackJpgPath != null && !fallbackJpgPath.isEmpty()) {
            return fallbackJpgPath;
        }
        return imagePath;
    }
    
    /**
     * 요청된 크기의 썸네일 경로 반환
     */
    public String getThumbnailBySize(String size) {
        switch (size.toLowerCase()) {
            case "small":
                return thumbnailSmall;
            case "medium":
                return thumbnailMedium;
            case "large":
                return thumbnailLarge;
            default:
                return getBestImagePath();
        }
    }
    
    /**
     * 파일 크기를 읽기 쉬운 형식으로 반환
     */
    public String getReadableFileSize() {
        if (fileSize == null) return "0 B";
        
        long size = fileSize;
        String[] units = {"B", "KB", "MB", "GB"};
        int unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return String.format("%d %s", size, units[unitIndex]);
    }
    
    /**
     * WebP 압축률 계산 (%)
     */
    public double getCompressionRate() {
        if (fileSize == null || fileSize == 0 || fileSizeWebp == null) {
            return 0;
        }
        return ((double)(fileSize - fileSizeWebp) / fileSize) * 100;
    }
}