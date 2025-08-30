package com.example.carelink.service;

import com.example.carelink.dao.ReviewImageMapper;
import com.example.carelink.dto.ReviewImageDTO;
import com.example.carelink.common.Constants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * 리뷰 이미지 서비스
 * WebP 변환 및 다중 이미지 관리
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewImageService {
    
    private final ReviewImageMapper reviewImageMapper;
    
    @Autowired
    private ImageOptimizationService imageOptimizationService;
    
    // 리뷰 이미지 최대 개수
    private static final int MAX_REVIEW_IMAGES = 5;
    
    // 리뷰 이미지 업로드 경로 (환경별 자동 설정) 
    private static final String REVIEW_UPLOAD_PATH = getUploadPath();
    
    /**
     * 환경별 업로드 경로 반환
     */
    private static String getUploadPath() {
        String os = System.getProperty("os.name", "").toLowerCase();
        String railwayEnv = System.getenv("RAILWAY_ENVIRONMENT");
        String userDir = System.getProperty("user.dir", "");
        
        if (railwayEnv != null || userDir.startsWith("/app") || !os.contains("win")) {
            return "/app/uploads/review/";
        } else {
            return "C:/carelink-uploads/review/";
        }
    }
    
    /**
     * 리뷰의 모든 이미지 조회
     */
    @Transactional(readOnly = true)
    public List<ReviewImageDTO> getImagesByReviewId(Long reviewId) {
        log.info("리뷰 이미지 조회: reviewId={}", reviewId);
        return reviewImageMapper.getImagesByReviewId(reviewId);
    }
    
    /**
     * 시설의 모든 리뷰 이미지 조회 (갤러리용)
     */
    @Transactional(readOnly = true)
    public List<ReviewImageDTO> getImagesByFacilityId(Long facilityId) {
        log.info("시설 리뷰 이미지 조회: facilityId={}", facilityId);
        return reviewImageMapper.getImagesByFacilityId(facilityId);
    }
    
    /**
     * 다중 이미지 업로드 처리 (WebP 변환 포함)
     */
    @Transactional
    public List<ReviewImageDTO> uploadImages(Long reviewId, List<MultipartFile> imageFiles, 
                                            List<String> altTexts) {
        
        // 기존 이미지 개수 확인
        int existingCount = reviewImageMapper.countActiveImagesByReviewId(reviewId);
        
        if (existingCount + imageFiles.size() > MAX_REVIEW_IMAGES) {
            throw new IllegalArgumentException(
                String.format("리뷰 이미지는 최대 %d개까지 업로드 가능합니다. 현재 %d개, 추가 요청 %d개",
                    MAX_REVIEW_IMAGES, existingCount, imageFiles.size())
            );
        }
        
        List<ReviewImageDTO> uploadedImages = new ArrayList<>();
        
        for (int i = 0; i < imageFiles.size(); i++) {
            MultipartFile file = imageFiles.get(i);
            String altText = (altTexts != null && i < altTexts.size()) ? altTexts.get(i) : null;
            
            try {
                // 이미지 처리 (WebP 변환)
                ReviewImageDTO imageDTO = processAndSaveImage(reviewId, file, existingCount + i, altText);
                uploadedImages.add(imageDTO);
                
            } catch (Exception e) {
                log.error("리뷰 이미지 업로드 실패: reviewId={}, fileName={}", 
                         reviewId, file.getOriginalFilename(), e);
                // 실패한 이미지는 건너뛰고 계속 진행
            }
        }
        
        // 데이터베이스에 일괄 저장
        if (!uploadedImages.isEmpty()) {
            reviewImageMapper.insertImages(uploadedImages);
            log.info("리뷰 이미지 {} 개 업로드 완료: reviewId={}", uploadedImages.size(), reviewId);
        }
        
        return uploadedImages;
    }
    
    /**
     * 단일 이미지 업로드 처리
     */
    @Transactional
    public ReviewImageDTO uploadImage(Long reviewId, MultipartFile imageFile, String altText) {
        
        // 기존 이미지 개수 확인
        int existingCount = reviewImageMapper.countActiveImagesByReviewId(reviewId);
        
        if (existingCount >= MAX_REVIEW_IMAGES) {
            throw new IllegalArgumentException(
                String.format("리뷰 이미지는 최대 %d개까지 업로드 가능합니다.", MAX_REVIEW_IMAGES)
            );
        }
        
        // 이미지 처리 및 저장
        ReviewImageDTO imageDTO = processAndSaveImage(reviewId, imageFile, existingCount, altText);
        reviewImageMapper.insertImage(imageDTO);
        
        log.info("리뷰 이미지 업로드 완료: reviewId={}, imageId={}", reviewId, imageDTO.getImageId());
        
        return imageDTO;
    }
    
    /**
     * 이미지 파일 처리 및 DTO 생성
     */
    private ReviewImageDTO processAndSaveImage(Long reviewId, MultipartFile file, 
                                              int imageOrder, String altText) {
        
        // 파일 검증 (확장자 및 MIME 타입 모두 확인)
        if (!imageOptimizationService.isSupportedImageFormat(file.getOriginalFilename()) ||
            !imageOptimizationService.isValidImageMimeType(file.getContentType())) {
            log.warn("지원하지 않는 이미지 형식: 파일명={}, MIME타입={}", 
                    file.getOriginalFilename(), file.getContentType());
            throw new IllegalArgumentException("지원하지 않는 이미지 형식입니다. JPG, PNG, GIF, WebP, BMP, TIFF 형식만 지원됩니다.");
        }
        
        // 파일명 생성
        String baseFileName = String.format("review_%d_%d_%s", 
            reviewId, imageOrder, UUID.randomUUID().toString().substring(0, 8));
        
        log.info("리뷰 이미지 WebP 변환 시작: reviewId={}, order={}, file={}", 
                reviewId, imageOrder, file.getOriginalFilename());
        
        // WebP 변환 및 최적화
        ImageOptimizationService.ImageConversionResult result = 
            imageOptimizationService.processImage(file, baseFileName, REVIEW_UPLOAD_PATH);
        
        // DTO 생성
        ReviewImageDTO imageDTO = ReviewImageDTO.builder()
            .reviewId(reviewId)
            .imagePath("/uploads/review/" + baseFileName + "_original.jpg")
            .webpPath("/uploads/review/" + result.getOriginalWebPPath())
            .thumbnailSmall("/uploads/review/" + result.getThumbnails().get("small"))
            .thumbnailMedium("/uploads/review/" + result.getThumbnails().get("medium"))
            .thumbnailLarge("/uploads/review/" + result.getThumbnails().get("large"))
            .fallbackJpgPath("/uploads/review/" + result.getFallbackJpgPath())
            .originalFilename(file.getOriginalFilename())
            .fileSize(file.getSize())
            .fileSizeWebp((long)(file.getSize() * 0.3)) // 예상 크기
            .width(result.getOriginalWidth())
            .height(result.getOriginalHeight())
            .altText(altText != null ? altText : generateDefaultAltText(reviewId, imageOrder))
            .imageOrder(imageOrder)
            .isActive(true)
            .build();
        
        log.info("리뷰 이미지 WebP 변환 완료: reviewId={}, webpPath={}", 
                reviewId, imageDTO.getWebpPath());
        
        return imageDTO;
    }
    
    /**
     * 기본 대체 텍스트 생성
     */
    private String generateDefaultAltText(Long reviewId, int imageOrder) {
        return String.format("리뷰 #%d의 이미지 %d", reviewId, imageOrder + 1);
    }
    
    /**
     * 이미지 순서 변경
     */
    @Transactional
    public void updateImageOrder(Long imageId, Integer newOrder) {
        reviewImageMapper.updateImageOrder(imageId, newOrder);
        log.info("리뷰 이미지 순서 변경: imageId={}, newOrder={}", imageId, newOrder);
    }
    
    /**
     * 이미지 대체 텍스트 수정
     */
    @Transactional
    public void updateImageAltText(Long imageId, String altText) {
        reviewImageMapper.updateImageAltText(imageId, altText);
        log.info("리뷰 이미지 대체 텍스트 수정: imageId={}", imageId);
    }
    
    /**
     * 이미지 삭제
     */
    @Transactional
    public void deleteImage(Long imageId) {
        ReviewImageDTO image = reviewImageMapper.getImageById(imageId);
        if (image != null) {
            // 파일 시스템에서 실제 파일 삭제 (선택적)
            // deletePhysicalFiles(image);
            
            // 데이터베이스에서 삭제
            reviewImageMapper.deleteImage(imageId);
            log.info("리뷰 이미지 삭제 완료: imageId={}", imageId);
        }
    }
    
    /**
     * 리뷰의 모든 이미지 삭제
     */
    @Transactional
    public void deleteAllImagesByReviewId(Long reviewId) {
        List<ReviewImageDTO> images = reviewImageMapper.getImagesByReviewId(reviewId);
        
        // 파일 시스템에서 실제 파일 삭제 (선택적)
        // images.forEach(this::deletePhysicalFiles);
        
        // 데이터베이스에서 삭제
        reviewImageMapper.deleteImagesByReviewId(reviewId);
        log.info("리뷰의 모든 이미지 삭제: reviewId={}, count={}", reviewId, images.size());
    }
    
    /**
     * 시설별 리뷰 이미지 통계
     */
    @Transactional(readOnly = true)
    public int getTotalImageCountByFacilityId(Long facilityId) {
        return reviewImageMapper.getTotalImageCountByFacilityId(facilityId);
    }
    
    /**
     * 회원별 업로드한 리뷰 이미지 개수
     */
    @Transactional(readOnly = true)
    public int getImageCountByMemberId(Long memberId) {
        return reviewImageMapper.getImageCountByMemberId(memberId);
    }
}