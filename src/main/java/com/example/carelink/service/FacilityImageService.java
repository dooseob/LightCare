package com.example.carelink.service;

import com.example.carelink.dao.FacilityImageMapper;
import com.example.carelink.dao.FacilityMapper;
import com.example.carelink.dto.FacilityImageDTO;
import com.example.carelink.common.Constants;
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
    private final FacilityMapper facilityMapper;
    private static final Logger log = LoggerFactory.getLogger(FacilityImageService.class);

    @Autowired
    public FacilityImageService(FacilityImageMapper facilityImageMapper, FacilityMapper facilityMapper) {
        this.facilityImageMapper = facilityImageMapper;
        this.facilityMapper = facilityMapper;
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
            
            log.info("🔄 시설 테이블 메인 이미지 정보 업데이트 시작 - facilityId: {}, imageCount: {}, mainImagePath: {}", 
                    facilityId, imageCount, mainImagePath);
            
            // 시설 테이블의 facility_image, image_count 업데이트
            int updateResult = facilityMapper.updateFacilityMainImage(facilityId, mainImagePath, imageCount);
            
            if (updateResult > 0) {
                log.info("✅ 시설 테이블 업데이트 성공 - facilityId: {}, 업데이트된 행: {}", facilityId, updateResult);
            } else {
                log.warn("⚠️ 시설 테이블 업데이트 실패 - facilityId: {}, 업데이트된 행: {}", facilityId, updateResult);
            }
            
        } catch (Exception e) {
            log.error("❌ 시설 테이블 메인 이미지 정보 업데이트 중 오류 - facilityId: {}", facilityId, e);
            throw new RuntimeException("시설 메인 이미지 정보 업데이트에 실패했습니다.", e);
        }
    }

    /**
     * 시설 이미지 파일 저장 메서드
     */
    private String saveImageFile(MultipartFile file, String facilityId, int index) {
        try {
            // 로컬 업로드 디렉토리 사용
            String uploadDir = Constants.FACILITY_UPLOAD_PATH;
            File uploadDirFile = new File(uploadDir);
            if (!uploadDirFile.exists()) {
                boolean created = uploadDirFile.mkdirs();
                log.info("업로드 디렉토리 생성: {} - {}", uploadDir, created ? "성공" : "실패");
            }
            
            // 파일명 생성 (한글 파일명 영문 변환 포함)
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            String baseName = "";
            
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                baseName = originalFilename.substring(0, originalFilename.lastIndexOf("."));
            } else if (originalFilename != null) {
                baseName = originalFilename;
            }
            
            // 한글 파일명을 영문으로 변환
            String englishBaseName = convertKoreanToEnglish(baseName);
            String cleanBaseName = sanitizeFilename(englishBaseName);
            
            // 최종 파일명 생성
            String savedFilename;
            if (!cleanBaseName.isEmpty() && !cleanBaseName.equals("facility_image")) {
                savedFilename = String.format("facility_%s_%d_%s_%s%s", 
                        facilityId, index, cleanBaseName, UUID.randomUUID().toString().substring(0, 8), extension);
            } else {
                savedFilename = String.format("facility_%s_%d_%s%s", 
                        facilityId, index, UUID.randomUUID().toString(), extension);
            }
            
            log.info("📝 파일명 변환: '{}' → '{}'", originalFilename, savedFilename);
            
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
    
    /**
     * 한글 파일명을 영문으로 변환
     */
    private String convertKoreanToEnglish(String korean) {
        if (korean == null || korean.trim().isEmpty()) {
            return "facility_image";
        }
        
        // 한글 키워드를 영문으로 매핑
        java.util.Map<String, String> koreanToEnglish = java.util.Map.ofEntries(
            // 시설 관련
            java.util.Map.entry("시설", "facility"),
            java.util.Map.entry("요양원", "nursing_home"),
            java.util.Map.entry("병원", "hospital"),
            java.util.Map.entry("의료", "medical"),
            java.util.Map.entry("건물", "building"),
            
            // 공간 관련
            java.util.Map.entry("외관", "exterior"),
            java.util.Map.entry("내부", "interior"),
            java.util.Map.entry("로비", "lobby"),
            java.util.Map.entry("복도", "corridor"),
            java.util.Map.entry("방", "room"),
            java.util.Map.entry("객실", "room"),
            java.util.Map.entry("침실", "bedroom"),
            java.util.Map.entry("식당", "dining"),
            java.util.Map.entry("주방", "kitchen"),
            java.util.Map.entry("화장실", "bathroom"),
            java.util.Map.entry("정원", "garden"),
            java.util.Map.entry("마당", "yard"),
            java.util.Map.entry("주차장", "parking"),
            java.util.Map.entry("엘리베이터", "elevator"),
            java.util.Map.entry("계단", "stairs"),
            
            // 의료 관련
            java.util.Map.entry("간호", "nursing"),
            java.util.Map.entry("의무실", "medical_room"),
            java.util.Map.entry("치료", "treatment"),
            java.util.Map.entry("재활", "rehabilitation"),
            java.util.Map.entry("물리치료", "physical_therapy"),
            
            // 기타
            java.util.Map.entry("환경", "environment"),
            java.util.Map.entry("시설물", "facilities"),
            java.util.Map.entry("부대시설", "amenities"),
            java.util.Map.entry("편의시설", "convenience"),
            java.util.Map.entry("안전", "safety"),
            java.util.Map.entry("보안", "security"),
            
            // 숫자
            java.util.Map.entry("1", "one"),
            java.util.Map.entry("2", "two"),
            java.util.Map.entry("3", "three"),
            java.util.Map.entry("4", "four"),
            java.util.Map.entry("5", "five"),
            java.util.Map.entry("첫번째", "first"),
            java.util.Map.entry("두번째", "second"),
            java.util.Map.entry("세번째", "third"),
            java.util.Map.entry("네번째", "fourth"),
            java.util.Map.entry("다섯번째", "fifth")
        );
        
        String result = korean.toLowerCase().trim();
        
        // 한글 키워드 변환
        for (java.util.Map.Entry<String, String> entry : koreanToEnglish.entrySet()) {
            result = result.replace(entry.getKey(), entry.getValue());
        }
        
        // 아직 한글이 남아있으면 일반적인 변환
        if (containsKorean(result)) {
            result = "facility_image_" + System.currentTimeMillis() % 10000;
        }
        
        return result;
    }
    
    /**
     * 파일명 정리 (특수문자 제거, 영문자와 숫자만 유지)
     */
    private String sanitizeFilename(String filename) {
        if (filename == null || filename.trim().isEmpty()) {
            return "facility_image";
        }
        
        // 영문자, 숫자, 하이픈, 언더스코어만 유지
        String sanitized = filename.replaceAll("[^a-zA-Z0-9_-]", "_")
                                  .replaceAll("_{2,}", "_")  // 연속된 언더스코어 제거
                                  .replaceAll("^_+|_+$", ""); // 앞뒤 언더스코어 제거
        
        // 너무 길면 자르기 (최대 30자)
        if (sanitized.length() > 30) {
            sanitized = sanitized.substring(0, 30);
        }
        
        // 비어있으면 기본값
        if (sanitized.isEmpty()) {
            sanitized = "facility_image";
        }
        
        return sanitized;
    }
    
    /**
     * 문자열에 한글이 포함되어 있는지 확인
     */
    private boolean containsKorean(String text) {
        if (text == null) return false;
        return text.matches(".*[ㄱ-ㅎㅏ-ㅣ가-힣]+.*");
    }
}