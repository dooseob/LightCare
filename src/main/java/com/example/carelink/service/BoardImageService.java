package com.example.carelink.service;

import com.example.carelink.dao.BoardImageMapper;
import com.example.carelink.dto.BoardImageDTO;
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
 * 게시판 이미지 서비스
 * WebP 변환 및 다중 이미지 관리
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BoardImageService {
    
    private final BoardImageMapper boardImageMapper;
    
    @Autowired
    private ImageOptimizationService imageOptimizationService;
    
    // 게시판 이미지 최대 개수
    private static final int MAX_BOARD_IMAGES = 10;
    
    // 게시판 이미지 업로드 경로
    private static final String BOARD_UPLOAD_PATH = "C:/carelink-uploads/board/";
    
    /**
     * 게시글의 모든 이미지 조회
     */
    @Transactional(readOnly = true)
    public List<BoardImageDTO> getImagesByBoardId(Long boardId) {
        log.info("게시글 이미지 조회: boardId={}", boardId);
        return boardImageMapper.getImagesByBoardId(boardId);
    }
    
    /**
     * 다중 이미지 업로드 처리 (WebP 변환 포함)
     */
    @Transactional
    public List<BoardImageDTO> uploadImages(Long boardId, List<MultipartFile> imageFiles, 
                                           List<String> altTexts) {
        
        // 기존 이미지 개수 확인
        int existingCount = boardImageMapper.countActiveImagesByBoardId(boardId);
        
        if (existingCount + imageFiles.size() > MAX_BOARD_IMAGES) {
            throw new IllegalArgumentException(
                String.format("게시글 이미지는 최대 %d개까지 업로드 가능합니다. 현재 %d개, 추가 요청 %d개",
                    MAX_BOARD_IMAGES, existingCount, imageFiles.size())
            );
        }
        
        List<BoardImageDTO> uploadedImages = new ArrayList<>();
        
        for (int i = 0; i < imageFiles.size(); i++) {
            MultipartFile file = imageFiles.get(i);
            String altText = (altTexts != null && i < altTexts.size()) ? altTexts.get(i) : null;
            
            try {
                // 이미지 처리 (WebP 변환)
                BoardImageDTO imageDTO = processAndSaveImage(boardId, file, existingCount + i, altText);
                uploadedImages.add(imageDTO);
                
            } catch (Exception e) {
                log.error("이미지 업로드 실패: boardId={}, fileName={}", 
                         boardId, file.getOriginalFilename(), e);
                // 실패한 이미지는 건너뛰고 계속 진행
            }
        }
        
        // 데이터베이스에 일괄 저장
        if (!uploadedImages.isEmpty()) {
            boardImageMapper.insertImages(uploadedImages);
            log.info("게시글 이미지 {} 개 업로드 완료: boardId={}", uploadedImages.size(), boardId);
        }
        
        return uploadedImages;
    }
    
    /**
     * 단일 이미지 업로드 처리
     */
    @Transactional
    public BoardImageDTO uploadImage(Long boardId, MultipartFile imageFile, String altText) {
        
        // 기존 이미지 개수 확인
        int existingCount = boardImageMapper.countActiveImagesByBoardId(boardId);
        
        if (existingCount >= MAX_BOARD_IMAGES) {
            throw new IllegalArgumentException(
                String.format("게시글 이미지는 최대 %d개까지 업로드 가능합니다.", MAX_BOARD_IMAGES)
            );
        }
        
        // 이미지 처리 및 저장
        BoardImageDTO imageDTO = processAndSaveImage(boardId, imageFile, existingCount, altText);
        boardImageMapper.insertImage(imageDTO);
        
        log.info("게시글 이미지 업로드 완료: boardId={}, imageId={}", boardId, imageDTO.getImageId());
        
        return imageDTO;
    }
    
    /**
     * 이미지 파일 처리 및 DTO 생성
     */
    private BoardImageDTO processAndSaveImage(Long boardId, MultipartFile file, 
                                             int imageOrder, String altText) {
        
        // 파일 검증 강화
        if (!imageOptimizationService.isSupportedImageFormat(file.getOriginalFilename())) {
            throw new IllegalArgumentException("지원하지 않는 이미지 형식입니다. (JPG, PNG, GIF, WebP, BMP, TIFF만 가능)");
        }
        
        if (!imageOptimizationService.isValidImageMimeType(file.getContentType())) {
            throw new IllegalArgumentException("올바른 이미지 파일이 아닙니다. 파일을 다시 확인해주세요.");
        }
        
        // 빈 파일 검사
        if (file.isEmpty() || file.getSize() == 0) {
            throw new IllegalArgumentException("비어있는 파일은 업로드할 수 없습니다.");
        }
        
        // 파일명 생성
        String baseFileName = String.format("board_%d_%d_%s", 
            boardId, imageOrder, UUID.randomUUID().toString().substring(0, 8));
        
        log.info("게시판 이미지 WebP 변환 시작: boardId={}, order={}, file={}", 
                boardId, imageOrder, file.getOriginalFilename());
        
        // WebP 변환 및 최적화
        ImageOptimizationService.ImageConversionResult result = 
            imageOptimizationService.processImage(file, baseFileName, BOARD_UPLOAD_PATH);
        
        // DTO 생성 (원본 파일은 저장하지 않음 - 데이터 절감)
        BoardImageDTO imageDTO = BoardImageDTO.builder()
            .boardId(boardId)
            .imagePath(result.getOriginalWebPPath())  // WebP(현재는 JPG) 경로를 메인으로 사용
            .webpPath(result.getOriginalWebPPath())   // 동일한 경로 (WebP 변환 완료 시 사용)
            .thumbnailSmall(result.getThumbnails().get("small"))
            .thumbnailMedium(result.getThumbnails().get("medium"))
            .thumbnailLarge(result.getThumbnails().get("large"))
            .fallbackJpgPath(result.getFallbackJpgPath())
            .originalFilename(file.getOriginalFilename())  // 원본 파일명은 참고용으로만 저장
            .fileSize(result.getOriginalSize())
            .fileSizeWebp(result.getWebpSize())  // 실제 변환된 파일 크기
            .width(result.getOriginalWidth())
            .height(result.getOriginalHeight())
            .altText(altText != null ? altText : generateDefaultAltText(boardId, imageOrder))
            .imageOrder(imageOrder)
            .isActive(true)
            .build();
        
        log.info("게시판 이미지 WebP 변환 완료: boardId={}, webpPath={}", 
                boardId, imageDTO.getWebpPath());
        
        return imageDTO;
    }
    
    /**
     * 기본 대체 텍스트 생성
     */
    private String generateDefaultAltText(Long boardId, int imageOrder) {
        return String.format("게시글 #%d의 이미지 %d", boardId, imageOrder + 1);
    }
    
    /**
     * 이미지 순서 변경
     */
    @Transactional
    public void updateImageOrder(Long imageId, Integer newOrder) {
        boardImageMapper.updateImageOrder(imageId, newOrder);
        log.info("이미지 순서 변경: imageId={}, newOrder={}", imageId, newOrder);
    }
    
    /**
     * 이미지 대체 텍스트 수정
     */
    @Transactional
    public void updateImageAltText(Long imageId, String altText) {
        boardImageMapper.updateImageAltText(imageId, altText);
        log.info("이미지 대체 텍스트 수정: imageId={}", imageId);
    }
    
    /**
     * 이미지 삭제
     */
    @Transactional
    public void deleteImage(Long imageId) {
        BoardImageDTO image = boardImageMapper.getImageById(imageId);
        if (image != null) {
            // 파일 시스템에서 실제 파일 삭제 (선택적)
            // deletePhysicalFiles(image);
            
            // 데이터베이스에서 삭제
            boardImageMapper.deleteImage(imageId);
            log.info("이미지 삭제 완료: imageId={}", imageId);
        }
    }
    
    /**
     * 게시글의 모든 이미지 삭제
     */
    @Transactional
    public void deleteAllImagesByBoardId(Long boardId) {
        List<BoardImageDTO> images = boardImageMapper.getImagesByBoardId(boardId);
        
        // 파일 시스템에서 실제 파일 삭제 (선택적)
        // images.forEach(this::deletePhysicalFiles);
        
        // 데이터베이스에서 삭제
        boardImageMapper.deleteImagesByBoardId(boardId);
        log.info("게시글의 모든 이미지 삭제: boardId={}, count={}", boardId, images.size());
    }
}