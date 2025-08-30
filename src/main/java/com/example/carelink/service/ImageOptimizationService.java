package com.example.carelink.service;

import net.coobird.thumbnailator.Thumbnails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageInputStream;
import javax.imageio.stream.ImageOutputStream;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import javax.annotation.PostConstruct;

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
     * WebP 지원 라이브러리 초기화
     */
    @PostConstruct
    public void initWebPSupport() {
        try {
            // WebP ImageIO 플러그인 등록 확인
            String[] readerFormats = ImageIO.getReaderFormatNames();
            String[] writerFormats = ImageIO.getWriterFormatNames();
            
            boolean webpReadSupport = false;
            boolean webpWriteSupport = false;
            
            for (String format : readerFormats) {
                if ("webp".equalsIgnoreCase(format) || "WEBP".equals(format)) {
                    webpReadSupport = true;
                    break;
                }
            }
            
            for (String format : writerFormats) {
                if ("webp".equalsIgnoreCase(format) || "WEBP".equals(format)) {
                    webpWriteSupport = true;
                    break;
                }
            }
            
            log.info("🖼️ ImageIO WebP 지원 상태 - 읽기: {}, 쓰기: {}", webpReadSupport, webpWriteSupport);
            
            if (webpReadSupport && webpWriteSupport) {
                log.info("✅ WebP 형식이 완전히 지원됩니다.");
            } else {
                log.warn("⚠️ WebP 지원이 불완전합니다. 라이브러리 설정을 확인해주세요.");
                log.info("📚 지원 가능한 읽기 형식: {}", String.join(", ", readerFormats));
                log.info("📝 지원 가능한 쓰기 형식: {}", String.join(", ", writerFormats));
            }
            
        } catch (Exception e) {
            log.error("❌ WebP 초기화 중 오류 발생", e);
        }
    }

    /**
     * 원본 이미지를 WebP로 변환하고 여러 사이즈 생성
     * 주의: 원본 파일은 저장하지 않고 변환된 파일만 저장 (스토리지 절감)
     * @param originalFile 원본 파일
     * @param baseFileName 기본 파일명 (확장자 제외)
     * @param uploadDir 업로드 디렉토리
     * @return 변환된 이미지 정보 Map
     */
    public ImageConversionResult processImage(MultipartFile originalFile, String baseFileName, String uploadDir) {
        ImageConversionResult result = new ImageConversionResult();
        
        try {
            // 1. MIME 타입 검증 (보안 강화)
            if (!isValidImageMimeType(originalFile.getContentType())) {
                log.error("지원하지 않는 MIME 타입: {}", originalFile.getContentType());
                throw new IllegalArgumentException("지원하지 않는 이미지 형식입니다. (JPG, PNG, GIF, WebP만 가능)");
            }
            
            // 2. 파일 크기 검증 (최대 10MB)
            long maxSize = 10 * 1024 * 1024; // 10MB
            if (originalFile.getSize() > maxSize) {
                throw new IllegalArgumentException("파일 크기가 너무 큽니다. (최대 10MB)");
            }
            
            // 디렉토리 생성
            ensureDirectoryExists(uploadDir);
            
            // 원본 이미지를 메모리에서만 읽기 (파일로 저장하지 않음)
            BufferedImage originalImage = null;
            try {
                log.info("🔍 ImageIO로 이미지 읽기 시작: {}, MIME: {}", 
                        originalFile.getOriginalFilename(), originalFile.getContentType());
                
                originalImage = ImageIO.read(originalFile.getInputStream());
                
                if (originalImage != null) {
                    log.info("✅ ImageIO 읽기 성공: {}x{}", originalImage.getWidth(), originalImage.getHeight());
                } else {
                    log.error("❌ ImageIO 읽기 결과 null - WebP 지원 확인 필요");
                }
                
            } catch (Exception e) {
                log.error("❌ 이미지 읽기 중 예외 발생: {}", originalFile.getOriginalFilename(), e);
                throw new IllegalArgumentException("손상된 이미지 파일이거나 읽을 수 없는 형식입니다.");
            }
            
            if (originalImage == null) {
                log.error("💥 BufferedImage가 null입니다. 지원되지 않는 형식일 가능성: {}", 
                         originalFile.getContentType());
                throw new IllegalArgumentException("이미지를 처리할 수 없습니다. 다른 파일을 선택해주세요.");
            }
            
            log.info("이미지 처리 시작 (원본 저장 X): {} ({}x{})", baseFileName, 
                    originalImage.getWidth(), originalImage.getHeight());
            
            // 1. 파일 형식별 스마트 처리
            String optimizedPath = processImageByFormat(originalFile, originalImage, uploadDir, baseFileName + "_optimized");
            result.setOriginalWebPPath(optimizedPath);
            
            // 2. 썸네일 생성 (원본 형식에 따라 WebP 또는 JPG)
            String thumbnailFormat = "image/webp".equals(originalFile.getContentType()) ? "webp" : "jpg";
            Map<String, String> thumbnails = generateThumbnails(originalImage, uploadDir, baseFileName, thumbnailFormat);
            result.setThumbnails(thumbnails);
            
            // 3. 이미지 메타정보 설정
            result.setOriginalWidth(originalImage.getWidth());
            result.setOriginalHeight(originalImage.getHeight());
            result.setOriginalSize(originalFile.getSize());
            
            // 4. WebP(현재는 JPG) 파일 크기 계산
            String fullPath = uploadDir + optimizedPath;
            result.setWebpSize(getFileSize(fullPath));
            
            // 5. fallback용 JPG는 최적화된 파일과 동일 (중복 저장 방지)
            result.setFallbackJpgPath(optimizedPath);
            
            log.info("이미지 처리 완료 - 원본 크기: {}KB, 변환 크기: {}KB ({}% 절감)", 
                    originalFile.getSize() / 1024, 
                    result.getWebpSize() / 1024,
                    (int)((1 - (double)result.getWebpSize() / originalFile.getSize()) * 100));
            
        } catch (Exception e) {
            log.error("이미지 처리 중 오류 발생: {}", baseFileName, e);
            throw new RuntimeException("이미지 처리 실패", e);
        }
        
        return result;
    }
    
    /**
     * 파일 형식별 스마트 이미지 처리
     * - WebP: 그대로 저장 (이미 최적화됨)
     * - JPG/JPEG: 압축률 체크 후 재압축 여부 결정  
     * - PNG/GIF/BMP/TIFF: JPG로 변환
     */
    private String processImageByFormat(MultipartFile originalFile, BufferedImage image, 
                                      String uploadDir, String fileName) throws IOException {
        String contentType = originalFile.getContentType();
        String originalFileName = originalFile.getOriginalFilename();
        
        if ("image/webp".equals(contentType)) {
            // WebP는 그대로 저장 (이미 최적화된 형식)
            return saveWebPDirectly(originalFile, uploadDir, fileName);
            
        } else if ("image/jpeg".equals(contentType) || "image/jpg".equals(contentType)) {
            // JPG는 크기 체크 후 재압축 여부 결정
            return optimizeJPG(originalFile, image, uploadDir, fileName);
            
        } else {
            // PNG, GIF, BMP, TIFF 등은 JPG로 변환
            log.info("PNG/GIF/BMP/TIFF를 JPG로 변환: {}", originalFileName);
            return convertToJPG(resizeImage(image, MAX_WIDTH, MAX_HEIGHT), uploadDir, fileName);
        }
    }
    
    /**
     * WebP 파일을 그대로 저장 (크기 조정만 적용)
     */
    private String saveWebPDirectly(MultipartFile originalFile, String uploadDir, String fileName) throws IOException {
        try {
            // WebP를 BufferedImage로 읽어서 크기 조정 후 다시 WebP로 저장
            BufferedImage image = ImageIO.read(originalFile.getInputStream());
            BufferedImage resizedImage = resizeImage(image, MAX_WIDTH, MAX_HEIGHT);
            
            String webpFileName = fileName + ".webp";
            String fullPath = uploadDir + webpFileName;
            
            // WebP로 저장 시도 (ImageIO가 WebP를 지원하는 경우)
            if (ImageIO.write(resizedImage, "webp", new File(fullPath))) {
                log.info("WebP 직접 저장 성공: {} ({}KB)", webpFileName, 
                        getFileSize(fullPath) / 1024);
                return webpFileName;
            } else {
                // WebP 저장 실패 시 JPG로 변환
                log.warn("WebP 저장 실패, JPG로 변환: {}", fileName);
                return convertToJPG(resizedImage, uploadDir, fileName);
            }
            
        } catch (Exception e) {
            log.error("WebP 처리 실패, JPG로 변환: {}", fileName, e);
            BufferedImage image = ImageIO.read(originalFile.getInputStream());
            return convertToJPG(resizeImage(image, MAX_WIDTH, MAX_HEIGHT), uploadDir, fileName);
        }
    }
    
    /**
     * JPG 파일 최적화 (필요시에만 재압축)
     */
    private String optimizeJPG(MultipartFile originalFile, BufferedImage image, 
                              String uploadDir, String fileName) throws IOException {
        // 파일 크기가 적절하면 그대로 저장, 크면 재압축
        long originalSize = originalFile.getSize();
        long sizeThreshold = 2 * 1024 * 1024; // 2MB
        
        if (originalSize <= sizeThreshold) {
            // 2MB 이하면 그대로 저장 (크기 조정만)
            BufferedImage resizedImage = resizeImage(image, MAX_WIDTH, MAX_HEIGHT);
            String jpgFileName = fileName + ".jpg";
            String fullPath = uploadDir + jpgFileName;
            
            Thumbnails.of(resizedImage)
                    .size(resizedImage.getWidth(), resizedImage.getHeight())
                    .outputQuality(1.0f) // 원본 품질 유지
                    .outputFormat("jpg")
                    .toFile(fullPath);
                    
            log.info("JPG 원본 품질 유지: {} ({}KB)", jpgFileName, getFileSize(fullPath) / 1024);
            return jpgFileName;
        } else {
            // 2MB 초과시 재압축
            log.info("JPG 재압축 수행: {} (원본: {}KB)", fileName, originalSize / 1024);
            return convertToJPG(resizeImage(image, MAX_WIDTH, MAX_HEIGHT), uploadDir, fileName);
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
     * 여러 사이즈의 썸네일 생성 (형식별 최적화)
     */
    private Map<String, String> generateThumbnails(BufferedImage originalImage, String uploadDir, 
                                                  String baseFileName, String format) throws IOException {
        Map<String, String> thumbnails = new HashMap<>();
        
        for (Map.Entry<String, int[]> entry : THUMBNAIL_SIZES.entrySet()) {
            String sizeName = entry.getKey();
            int[] dimensions = entry.getValue();
            
            String thumbnailFileName = baseFileName + "_" + sizeName + "." + format;
            String fullPath = uploadDir + thumbnailFileName;
            
            try {
                if ("webp".equals(format)) {
                    // WebP 썸네일 생성 시도
                    if (ImageIO.write(
                        Thumbnails.of(originalImage)
                                .size(dimensions[0], dimensions[1])
                                .asBufferedImage(), 
                        "webp", 
                        new File(fullPath))) {
                        
                        thumbnails.put(sizeName, thumbnailFileName);
                        log.info("WebP 썸네일 생성 완료: {} ({}x{})", thumbnailFileName, dimensions[0], dimensions[1]);
                        continue;
                    } else {
                        // WebP 생성 실패시 JPG로 대체
                        thumbnailFileName = baseFileName + "_" + sizeName + ".jpg";
                        fullPath = uploadDir + thumbnailFileName;
                        format = "jpg";
                    }
                }
                
                // JPG 썸네일 생성
                Thumbnails.of(originalImage)
                        .size(dimensions[0], dimensions[1])
                        .outputQuality(0.9f)
                        .outputFormat("jpg")
                        .toFile(fullPath);
                
                thumbnails.put(sizeName, thumbnailFileName);
                log.info("JPG 썸네일 생성 완료: {} ({}x{})", thumbnailFileName, dimensions[0], dimensions[1]);
                
            } catch (Exception e) {
                log.error("썸네일 생성 실패: {} - {}", sizeName, e.getMessage());
                // 썸네일 생성 실패시 해당 사이즈는 건너뛰기
            }
        }
        
        return thumbnails;
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
     * WebP도 입력으로 받되, 다시 최적화하여 저장
     */
    public boolean isSupportedImageFormat(String filename) {
        if (filename == null) return false;
        
        String extension = getFileExtension(filename).toLowerCase();
        // WebP, BMP, TIFF 등도 입력으로 허용
        return extension.equals("jpg") || extension.equals("jpeg") || 
               extension.equals("png") || extension.equals("gif") ||
               extension.equals("webp") || extension.equals("bmp") ||
               extension.equals("tiff") || extension.equals("tif");
    }
    
    /**
     * MIME 타입으로 이미지 형식 검증 (보안 강화)
     */
    public boolean isValidImageMimeType(String mimeType) {
        if (mimeType == null) return false;
        
        return mimeType.startsWith("image/") && (
            mimeType.equals("image/jpeg") ||
            mimeType.equals("image/jpg") ||
            mimeType.equals("image/png") ||
            mimeType.equals("image/gif") ||
            mimeType.equals("image/webp") ||
            mimeType.equals("image/bmp") ||
            mimeType.equals("image/tiff")
        );
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
        private long webpSize;  // WebP(또는 변환된) 파일 크기
        
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
        
        public long getWebpSize() { return webpSize; }
        public void setWebpSize(long webpSize) { this.webpSize = webpSize; }
    }
}