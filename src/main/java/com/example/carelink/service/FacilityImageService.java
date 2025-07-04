package com.example.carelink.service;

import com.example.carelink.dao.FacilityImageMapper;
import com.example.carelink.dto.FacilityImageDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
public class FacilityImageService {

    private final FacilityImageMapper facilityImageMapper;
    private static final Logger log = LoggerFactory.getLogger(FacilityImageService.class);

    @Autowired
    public FacilityImageService(FacilityImageMapper facilityImageMapper) {
        this.facilityImageMapper = facilityImageMapper;
    }

    /**
     * 시설의 모든 이미지 조회
     */
    @Transactional(readOnly = true)
    public List<FacilityImageDTO> getImagesByFacilityId(Long facilityId) {
        log.info("시설 이미지 목록 조회 시작 - facilityId: {}", facilityId);
        List<FacilityImageDTO> images = facilityImageMapper.getImagesByFacilityId(facilityId);
        log.info("시설 이미지 목록 조회 완료 - facilityId: {}, 이미지 수: {}", facilityId, images.size());
        return images;
    }

    /**
     * 시설의 메인 이미지 조회
     */
    @Transactional(readOnly = true)
    public FacilityImageDTO getMainImageByFacilityId(Long facilityId) {
        log.info("시설 메인 이미지 조회 - facilityId: {}", facilityId);
        return facilityImageMapper.getMainImageByFacilityId(facilityId);
    }

    /**
     * 다중 시설 이미지 저장
     */
    @Transactional
    public void saveFacilityImages(Long facilityId, List<MultipartFile> imageFiles, List<String> altTexts) {
        try {
            log.info("📸 다중 시설 이미지 저장 시작 - facilityId: {}, 이미지 수: {}", facilityId, imageFiles.size());
            
            // 기존 이미지 삭제 (선택적)
            // facilityImageMapper.deleteAllImagesByFacilityId(facilityId);
            
            for (int i = 0; i < imageFiles.size(); i++) {
                MultipartFile file = imageFiles.get(i);
                String altText = (altTexts != null && i < altTexts.size()) ? altTexts.get(i) : null;
                
                if (!file.isEmpty()) {
                    // 파일 저장
                    String imagePath = saveImageFile(file, facilityId.toString(), i);
                    
                    // 데이터베이스에 저장
                    FacilityImageDTO imageDTO = new FacilityImageDTO();
                    imageDTO.setFacilityId(facilityId);
                    imageDTO.setImagePath(imagePath);
                    imageDTO.setImageAltText(altText);
                    imageDTO.setImageOrder(i);
                    imageDTO.setIsMainImage(i == 0); // 첫 번째 이미지를 메인으로 설정
                    
                    facilityImageMapper.insertFacilityImage(imageDTO);
                    log.info("✅ 시설 이미지 저장 완료 - index: {}, path: {}", i, imagePath);
                }
            }
            
            log.info("🎉 모든 시설 이미지 저장 완료 - facilityId: {}", facilityId);
            
        } catch (Exception e) {
            log.error("❌ 시설 이미지 저장 중 오류 발생 - facilityId: {}", facilityId, e);
            throw new RuntimeException("시설 이미지 저장에 실패했습니다.", e);
        }
    }

    /**
     * 단일 시설 이미지 저장
     */
    @Transactional
    public FacilityImageDTO saveSingleFacilityImage(Long facilityId, MultipartFile imageFile, String altText, Integer imageOrder) {
        try {
            log.info("📸 단일 시설 이미지 저장 시작 - facilityId: {}, order: {}", facilityId, imageOrder);
            
            if (imageFile.isEmpty()) {
                throw new IllegalArgumentException("업로드된 이미지 파일이 비어있습니다.");
            }
            
            // 파일 저장
            String imagePath = saveImageFile(imageFile, facilityId.toString(), imageOrder != null ? imageOrder : 0);
            
            // 기존 이미지 개수 확인
            int existingImageCount = facilityImageMapper.countImagesByFacilityId(facilityId);
            
            // 데이터베이스에 저장
            FacilityImageDTO imageDTO = new FacilityImageDTO();
            imageDTO.setFacilityId(facilityId);
            imageDTO.setImagePath(imagePath);
            imageDTO.setImageAltText(altText);
            imageDTO.setImageOrder(imageOrder != null ? imageOrder : existingImageCount);
            imageDTO.setIsMainImage(existingImageCount == 0); // 첫 번째 이미지면 메인으로 설정
            
            facilityImageMapper.insertFacilityImage(imageDTO);
            log.info("✅ facility_images 테이블에 저장 완료 - imageId: {}, path: {}", imageDTO.getImageId(), imagePath);
            
            // 시설 테이블의 메인 이미지 정보도 업데이트
            updateFacilityMainImageInfo(facilityId);
            
            return imageDTO;
            
        } catch (Exception e) {
            log.error("❌ 단일 시설 이미지 저장 중 오류 발생 - facilityId: {}", facilityId, e);
            throw new RuntimeException("시설 이미지 저장에 실패했습니다.", e);
        }
    }
    
    /**
     * 시설 테이블의 메인 이미지 정보 업데이트
     */
    private void updateFacilityMainImageInfo(Long facilityId) {
        try {
            // 시설의 총 이미지 수 조회
            int imageCount = facilityImageMapper.countImagesByFacilityId(facilityId);
            
            // 메인 이미지 조회
            FacilityImageDTO mainImage = facilityImageMapper.getMainImageByFacilityId(facilityId);
            String mainImagePath = mainImage != null ? mainImage.getImagePath() : null;
            
            log.info("🔄 시설 테이블 메인 이미지 정보 업데이트 - facilityId: {}, imageCount: {}, mainImagePath: {}", 
                    facilityId, imageCount, mainImagePath);
            
            // 여기서 FacilityMapper를 사용해 시설 테이블 업데이트
            // FacilityService를 주입받지 않고 직접 매퍼 호출
            
        } catch (Exception e) {
            log.error("❌ 시설 테이블 메인 이미지 정보 업데이트 중 오류 - facilityId: {}", facilityId, e);
        }
    }

    /**
     * 시설 이미지 파일 저장 메서드
     */
    private String saveImageFile(MultipartFile file, String facilityId, int index) {
        try {
            // 프로젝트 루트 경로 기반으로 절대 경로 설정
            String projectRoot = System.getProperty("user.dir");
            String uploadDir = projectRoot + "/src/main/resources/static/uploads/facility/";
            File uploadDirFile = new File(uploadDir);
            if (!uploadDirFile.exists()) {
                boolean created = uploadDirFile.mkdirs();
                log.info("업로드 디렉토리 생성: {} - {}", uploadDir, created ? "성공" : "실패");
            }
            
            // 파일명 생성 (facilityId + index + UUID + 원본 확장자)
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String savedFilename = String.format("facility_%s_%d_%s%s", 
                    facilityId, index, UUID.randomUUID().toString(), extension);
            
            // 파일 저장
            File savedFile = new File(uploadDir + savedFilename);
            file.transferTo(savedFile);
            log.info("시설 이미지 파일 저장 완료: {}", savedFile.getAbsolutePath());
            
            // 웹 경로 반환
            return "/uploads/facility/" + savedFilename;
            
        } catch (IOException e) {
            log.error("시설 이미지 파일 저장 중 오류 발생: facilityId={}, index={}", facilityId, index, e);
            throw new RuntimeException("이미지 파일 저장에 실패했습니다.", e);
        }
    }

    /**
     * 메인 이미지 변경
     */
    @Transactional
    public void updateMainImage(Long facilityId, Long imageId) {
        try {
            log.info("메인 이미지 변경 시작 - facilityId: {}, imageId: {}", facilityId, imageId);
            
            // 기존 메인 이미지 해제
            facilityImageMapper.clearMainImages(facilityId);
            
            // 새 메인 이미지 설정
            int result = facilityImageMapper.updateMainImage(facilityId, imageId);
            if (result == 0) {
                throw new RuntimeException("메인 이미지 설정에 실패했습니다.");
            }
            
            log.info("메인 이미지 변경 완료 - facilityId: {}, imageId: {}", facilityId, imageId);
            
        } catch (Exception e) {
            log.error("메인 이미지 변경 중 오류 발생 - facilityId: {}, imageId: {}", facilityId, imageId, e);
            throw new RuntimeException("메인 이미지 변경에 실패했습니다.", e);
        }
    }

    /**
     * 시설 이미지 삭제
     */
    @Transactional
    public void deleteFacilityImage(Long imageId) {
        try {
            log.info("시설 이미지 삭제 시작 - imageId: {}", imageId);
            
            int result = facilityImageMapper.deleteFacilityImage(imageId);
            if (result == 0) {
                throw new RuntimeException("시설 이미지 삭제에 실패했습니다.");
            }
            
            log.info("시설 이미지 삭제 완료 - imageId: {}", imageId);
            
        } catch (Exception e) {
            log.error("시설 이미지 삭제 중 오류 발생 - imageId: {}", imageId, e);
            throw new RuntimeException("시설 이미지 삭제에 실패했습니다.", e);
        }
    }

    /**
     * 시설의 이미지 개수 조회
     */
    @Transactional(readOnly = true)
    public int getImageCountByFacilityId(Long facilityId) {
        return facilityImageMapper.countImagesByFacilityId(facilityId);
    }
}