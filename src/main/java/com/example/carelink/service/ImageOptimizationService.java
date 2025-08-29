package com.example.carelink.service;

import net.coobird.thumbnailator.Thumbnails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

/**
 * 이미지 최적화 및 WebP 변환 서비스
 */
@Service
public class ImageOptimizationService {

    private static final Logger log = LoggerFactory.getLogger(ImageOptimizationService.class);
    
    // WebP 품질 설정
    private static final float WEBP_QUALITY = 0.85f;
    
    // 최대 이미지 크기 (픽셀)
    private static final int MAX_WIDTH = 1200;
    private static final int MAX_HEIGHT = 800;
    
    // 썸네일 사이즈 정의
    private static final Map<String, int[]> THUMBNAIL_SIZES = new HashMap<>();
    static {
        THUMBNAIL_SIZES.put("small", new int[]{300, 200});
        THUMBNAIL_SIZES.put("medium", new int[]{600, 400});
        THUMBNAIL_SIZES.put("large", new int[]{1200, 800});
    }

    /**
     * 원본 이미지를 WebP로 변환하고 여러 사이즈 생성
     * @param originalFile 원본 파일
     * @param baseFileName 기본 파일명 (확장자 제외)
     * @param uploadDir 업로드 디렉토리
     * @return 변환된 이미지 정보 Map
     */
    public ImageConversionResult processImage(MultipartFile originalFile, String baseFileName, String uploadDir) {
        ImageConversionResult result = new ImageConversionResult();
        
        try {
            // 디렉토리 생성
            ensureDirectoryExists(uploadDir);
            
            // 원본 이미지 읽기
            BufferedImage originalImage = ImageIO.read(originalFile.getInputStream());
            if (originalImage == null) {
                throw new IllegalArgumentException("지원하지 않는 이미지 형식입니다.");
            }
            
            log.info("이미지 처리 시작: {} ({}x{})", baseFileName, 
                    originalImage.getWidth(), originalImage.getHeight());
            
            // 1. 원본 크기 조정 및 WebP 변환
            String webpPath = convertToWebP(originalImage, uploadDir, baseFileName + "_original");
            result.setOriginalWebPPath(webpPath);
            
            // 2. 썸네일 생성
            Map<String, String> thumbnails = generateThumbnails(originalImage, uploadDir, baseFileName);
            result.setThumbnails(thumbnails);
            
            // 3. 이미지 메타정보 설정
            result.setOriginalWidth(originalImage.getWidth());
            result.setOriginalHeight(originalImage.getHeight());
            result.setOriginalSize(originalFile.getSize());
            
            // 4. fallback용 JPG 저장 (WebP 미지원 브라우저용)
            String jpgPath = saveAsJPG(originalImage, uploadDir, baseFileName + "_fallback");
            result.setFallbackJpgPath(jpgPath);
            
            log.info("이미지 처리 완료: {}", baseFileName);
            
        } catch (Exception e) {
            log.error("이미지 처리 중 오류 발생: {}", baseFileName, e);
            throw new RuntimeException("이미지 처리 실패", e);
        }
        
        return result;
    }
    
    /**
     * 이미지를 WebP로 변환
     */
    private String convertToWebP(BufferedImage image, String uploadDir, String fileName) throws IOException {
        // 이미지 크기 최적화
        BufferedImage optimizedImage = resizeImage(image, MAX_WIDTH, MAX_HEIGHT);
        
        String webpFileName = fileName + ".webp";
        String fullPath = uploadDir + webpFileName;
        
        try {
            // WebP로 저장
            Thumbnails.of(optimizedImage)
                    .size(optimizedImage.getWidth(), optimizedImage.getHeight())
                    .outputQuality(WEBP_QUALITY)
                    .outputFormat("webp")
                    .toFile(fullPath);
            
            log.info("WebP 변환 완료: {} ({}KB)", webpFileName, getFileSize(fullPath) / 1024);
            return webpFileName;
            
        } catch (Exception e) {
            // WebP 변환 실패 시 JPG로 대체
            log.warn("WebP 변환 실패, JPG로 대체: {}", fileName, e);
            return convertToJPG(optimizedImage, uploadDir, fileName);
        }
    }
    
    /**
     * 이미지를 JPG로 변환 (WebP 실패 시 fallback)
     */
    private String convertToJPG(BufferedImage image, String uploadDir, String fileName) throws IOException {
        String jpgFileName = fileName + ".jpg";
        String fullPath = uploadDir + jpgFileName;
        
        // JPG로 저장
        Thumbnails.of(image)
                .size(image.getWidth(), image.getHeight())
                .outputQuality(0.9f)
                .outputFormat("jpg")
                .toFile(fullPath);
        
        log.info("JPG 변환 완료: {} ({}KB)", jpgFileName, getFileSize(fullPath) / 1024);
        
        return jpgFileName;
    }
    
    /**
     * 여러 사이즈의 썸네일 생성 (WebP 지원)
     */
    private Map<String, String> generateThumbnails(BufferedImage originalImage, String uploadDir, String baseFileName) throws IOException {
        Map<String, String> thumbnails = new HashMap<>();
        
        for (Map.Entry<String, int[]> entry : THUMBNAIL_SIZES.entrySet()) {
            String sizeName = entry.getKey();
            int[] dimensions = entry.getValue();
            
            try {
                // WebP 썸네일 생성
                String thumbnailFileName = baseFileName + "_" + sizeName + ".webp";
                String fullPath = uploadDir + thumbnailFileName;
                
                Thumbnails.of(originalImage)
                        .size(dimensions[0], dimensions[1])
                        .outputQuality(WEBP_QUALITY)
                        .outputFormat("webp")
                        .toFile(fullPath);
                
                thumbnails.put(sizeName, thumbnailFileName);
                log.info("WebP 썸네일 생성 완료: {} ({}x{})", thumbnailFileName, dimensions[0], dimensions[1]);
                
            } catch (Exception e) {
                // WebP 실패 시 JPG로 대체
                log.warn("WebP 썸네일 생성 실패, JPG로 대체: {} - {}", sizeName, e.getMessage());
                
                String thumbnailFileName = baseFileName + "_" + sizeName + ".jpg";
                String fullPath = uploadDir + thumbnailFileName;
                
                Thumbnails.of(originalImage)
                        .size(dimensions[0], dimensions[1])
                        .outputQuality(0.9f)
                        .outputFormat("jpg")
                        .toFile(fullPath);
                
                thumbnails.put(sizeName, thumbnailFileName);
                log.info("JPG 썸네일 생성 완료: {} ({}x{})", thumbnailFileName, dimensions[0], dimensions[1]);
            }
        }
        
        return thumbnails;
    }
    
    /**
     * Fallback용 JPG 저장
     */
    private String saveAsJPG(BufferedImage image, String uploadDir, String fileName) throws IOException {
        BufferedImage jpgImage = resizeImage(image, MAX_WIDTH, MAX_HEIGHT);
        String jpgFileName = fileName + ".jpg";
        String fullPath = uploadDir + jpgFileName;
        
        Thumbnails.of(jpgImage)
                .size(jpgImage.getWidth(), jpgImage.getHeight())
                .outputQuality(0.9f)
                .outputFormat("jpg")
                .toFile(fullPath);
        
        log.info("JPG fallback 저장 완료: {}", jpgFileName);
        
        return jpgFileName;
    }
    
    /**
     * 이미지 크기 조정 (비율 유지)
     */
    private BufferedImage resizeImage(BufferedImage originalImage, int maxWidth, int maxHeight) throws IOException {
        int originalWidth = originalImage.getWidth();
        int originalHeight = originalImage.getHeight();
        
        // 이미지가 최대 크기보다 작으면 그대로 반환
        if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
            return originalImage;
        }
        
        // 비율 계산
        double widthRatio = (double) maxWidth / originalWidth;
        double heightRatio = (double) maxHeight / originalHeight;
        double ratio = Math.min(widthRatio, heightRatio);
        
        int newWidth = (int) (originalWidth * ratio);
        int newHeight = (int) (originalHeight * ratio);
        
        return Thumbnails.of(originalImage)
                .size(newWidth, newHeight)
                .asBufferedImage();
    }
    
    /**
     * 디렉토리 존재 확인 및 생성
     */
    private void ensureDirectoryExists(String dirPath) throws IOException {
        Path path = Paths.get(dirPath);
        if (!Files.exists(path)) {
            Files.createDirectories(path);
            log.info("디렉토리 생성: {}", dirPath);
        }
    }
    
    /**
     * 파일 크기 조회
     */
    private long getFileSize(String filePath) {
        try {
            return Files.size(Paths.get(filePath));
        } catch (IOException e) {
            return 0;
        }
    }
    
    /**
     * 지원되는 이미지 형식인지 확인
     */
    public boolean isSupportedImageFormat(String filename) {
        if (filename == null) return false;
        
        String extension = getFileExtension(filename).toLowerCase();
        return extension.equals("jpg") || extension.equals("jpeg") || 
               extension.equals("png") || extension.equals("gif");
    }
    
    /**
     * 파일 확장자 추출
     */
    private String getFileExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        return lastDot > 0 ? filename.substring(lastDot + 1) : "";
    }
    
    /**
     * 이미지 변환 결과를 담는 클래스
     */
    public static class ImageConversionResult {
        private String originalWebPPath;
        private String fallbackJpgPath;
        private Map<String, String> thumbnails;
        private int originalWidth;
        private int originalHeight;
        private long originalSize;
        
        // Getters and Setters
        public String getOriginalWebPPath() { return originalWebPPath; }
        public void setOriginalWebPPath(String originalWebPPath) { this.originalWebPPath = originalWebPPath; }
        
        public String getFallbackJpgPath() { return fallbackJpgPath; }
        public void setFallbackJpgPath(String fallbackJpgPath) { this.fallbackJpgPath = fallbackJpgPath; }
        
        public Map<String, String> getThumbnails() { return thumbnails; }
        public void setThumbnails(Map<String, String> thumbnails) { this.thumbnails = thumbnails; }
        
        public int getOriginalWidth() { return originalWidth; }
        public void setOriginalWidth(int originalWidth) { this.originalWidth = originalWidth; }
        
        public int getOriginalHeight() { return originalHeight; }
        public void setOriginalHeight(int originalHeight) { this.originalHeight = originalHeight; }
        
        public long getOriginalSize() { return originalSize; }
        public void setOriginalSize(long originalSize) { this.originalSize = originalSize; }
    }
}