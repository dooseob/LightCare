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
import java.util.ArrayList;
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
     * 다중 시설 이미지 저장 (5장 제한 적용)
     */
    @Transactional
    public void saveFacilityImages(Long facilityId, List<MultipartFile> imageFiles, List<String> altTexts) {
        try {
            log.info("📸 다중 시설 이미지 저장 시작 - facilityId: {}, 요청 이미지 수: {}", facilityId, imageFiles.size());
            
            // 기존 이미지 개수 확인
            int existingImageCount = facilityImageMapper.countImagesByFacilityId(facilityId);
            
            // 저장할 이미지 수 계산 (기존 + 새로운 이미지가 5장을 넘지 않도록)
            List<MultipartFile> validFiles = new ArrayList<>();
            for (MultipartFile file : imageFiles) {
                if (!file.isEmpty() && validFiles.size() + existingImageCount < Constants.MAX_FACILITY_IMAGES) {
                    validateImageFile(file);
                    validFiles.add(file);
                }
            }
            
            if (validFiles.isEmpty()) {
                throw new IllegalArgumentException("저장할 유효한 이미지 파일이 없습니다.");
            }
            
            if (existingImageCount + validFiles.size() > Constants.MAX_FACILITY_IMAGES) {
                log.warn("⚠️ 일부 이미지는 5장 제한으로 인해 저장되지 않습니다. 기존: {}장, 요청: {}장, 저장 가능: {}장", 
                    existingImageCount, imageFiles.size(), validFiles.size());
            }
            
            log.info("📊 이미지 저장 계획 - 기존: {}장, 새로 저장: {}장, 총: {}장", 
                existingImageCount, validFiles.size(), existingImageCount + validFiles.size());
            
            for (int i = 0; i < validFiles.size(); i++) {
                MultipartFile file = validFiles.get(i);
                String altText = (altTexts != null && i < altTexts.size()) ? altTexts.get(i) : null;
                
                // 파일 저장
                String imagePath = saveImageFile(file, facilityId.toString(), existingImageCount + i);
                
                // 데이터베이스에 저장
                FacilityImageDTO imageDTO = new FacilityImageDTO();
                imageDTO.setFacilityId(facilityId);
                imageDTO.setImagePath(imagePath);
                imageDTO.setImageAltText(altText);
                imageDTO.setImageOrder(existingImageCount + i);
                // 전체 첫 번째 이미지인 경우에만 메인으로 설정
                imageDTO.setIsMainImage(existingImageCount == 0 && i == 0);
                
                facilityImageMapper.insertFacilityImage(imageDTO);
                log.info("✅ 시설 이미지 저장 완료 - order: {}, path: {}", existingImageCount + i, imagePath);
            }
            
            // 시설 테이블의 메인 이미지 정보 업데이트
            updateFacilityMainImageInfo(facilityId);
            
            log.info("🎉 다중 시설 이미지 저장 완료 - facilityId: {}, 총 {}장 저장", facilityId, validFiles.size());
            
        } catch (Exception e) {
            log.error("❌ 시설 이미지 저장 중 오류 발생 - facilityId: {}", facilityId, e);
            throw new RuntimeException("시설 이미지 저장에 실패했습니다.", e);
        }
    }

    /**
     * 단일 시설 이미지 저장 (5장 제한 적용)
     */
    @Transactional
    public FacilityImageDTO saveSingleFacilityImage(Long facilityId, MultipartFile imageFile, String altText, Integer imageOrder) {
        return saveSingleFacilityImage(facilityId, imageFile, altText, imageOrder, null);
    }
    
    /**
     * 단일 시설 이미지 저장 (사용자 지정 파일명 지원)
     */
    @Transactional
    public FacilityImageDTO saveSingleFacilityImage(Long facilityId, MultipartFile imageFile, String altText, Integer imageOrder, String customFileName) {
        try {
            log.info("📸 단일 시설 이미지 저장 시작 - facilityId: {}, order: {}, customFileName: '{}'", facilityId, imageOrder, customFileName);
            
            if (imageFile.isEmpty()) {
                throw new IllegalArgumentException("업로드된 이미지 파일이 비어있습니다.");
            }
            
            // 기존 이미지 개수 확인 (5장 제한)
            int existingImageCount = facilityImageMapper.countImagesByFacilityId(facilityId);
            if (existingImageCount >= Constants.MAX_FACILITY_IMAGES) {
                throw new IllegalArgumentException(String.format("시설 이미지는 최대 %d장까지만 등록할 수 있습니다. 현재 %d장 등록됨", 
                    Constants.MAX_FACILITY_IMAGES, existingImageCount));
            }
            
            // 파일 확장자 검증
            validateImageFile(imageFile);
            
            // 파일 저장 (사용자 지정 파일명 적용)
            String imagePath = saveImageFileWithCustomName(imageFile, facilityId.toString(), 
                imageOrder != null ? imageOrder : existingImageCount, customFileName);
            
            // 데이터베이스에 저장
            FacilityImageDTO imageDTO = new FacilityImageDTO();
            imageDTO.setFacilityId(facilityId);
            imageDTO.setImagePath(imagePath);
            imageDTO.setImageAltText(altText);
            imageDTO.setImageOrder(imageOrder != null ? imageOrder : existingImageCount);
            // 첫 번째 이미지인 경우 자동으로 메인 이미지로 설정
            imageDTO.setIsMainImage(existingImageCount == 0);
            
            facilityImageMapper.insertFacilityImage(imageDTO);
            log.info("✅ facility_images 테이블에 저장 완료 - imageId: {}, path: {}, 현재 총 {}장", 
                imageDTO.getImageId(), imagePath, existingImageCount + 1);
            
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
     * 시설 이미지 파일 저장 메서드 (사용자 지정 파일명 지원)
     */
    private String saveImageFileWithCustomName(MultipartFile file, String facilityId, int index, String customFileName) {
        try {
            // 로컬 업로드 디렉토리 사용
            String uploadDir = Constants.FACILITY_UPLOAD_PATH;
            File uploadDirFile = new File(uploadDir);
            if (!uploadDirFile.exists()) {
                boolean created = uploadDirFile.mkdirs();
                log.info("업로드 디렉토리 생성: {} - {}", uploadDir, created ? "성공" : "실패");
            }
            
            // 파일명 생성 (사용자 지정명 우선 처리)
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            
            String finalFileName;
            
            if (customFileName != null && !customFileName.trim().isEmpty()) {
                // 사용자 지정 파일명 사용
                String englishBaseName = convertKoreanToEnglish(customFileName.trim());
                String cleanBaseName = sanitizeFilename(englishBaseName);
                finalFileName = String.format("facility_%s_%d_%s_%s%s", 
                        facilityId, index, cleanBaseName, UUID.randomUUID().toString().substring(0, 8), extension);
                log.info("📝 사용자 지정 파일명 적용: '{}' → '{}'", customFileName, finalFileName);
            } else {
                // 기본 파일명 로직 사용
                return saveImageFile(file, facilityId, index);
            }
            
            // 파일 저장
            File savedFile = new File(uploadDir + finalFileName);
            file.transferTo(savedFile);
            log.info("시설 이미지 파일 저장 완료: {}", savedFile.getAbsolutePath());
            
            // 웹 경로 반환
            return "/uploads/facility/" + finalFileName;
            
        } catch (IOException e) {
            log.error("시설 이미지 파일 저장 중 오류 발생: facilityId={}, index={}, customFileName={}", facilityId, index, customFileName, e);
            throw new RuntimeException("이미지 파일 저장에 실패했습니다.", e);
        }
    }
    
    /**
     * 시설 이미지 파일 저장 메서드 (기본)
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
     * 시설 이미지 완전 삭제 (DB + 파일 시스템)
     */
    @Transactional
    public boolean deleteFacilityImage(Long imageId) {
        try {
            log.info("🗑️ 시설 이미지 완전 삭제 시작 - imageId: {}", imageId);
            
            // 1. 먼저 이미지 정보 조회 (파일 경로 확인용)
            FacilityImageDTO imageToDelete = facilityImageMapper.getImageById(imageId);
            if (imageToDelete == null) {
                log.warn("⚠️ 삭제할 이미지를 찾을 수 없음 - imageId: {}", imageId);
                return false;
            }
            
            String imagePath = imageToDelete.getImagePath();
            log.info("📁 삭제 대상 파일: {}", imagePath);
            
            // 2. 데이터베이스에서 삭제
            int result = facilityImageMapper.deleteFacilityImage(imageId);
            boolean dbDeleteSuccess = result > 0;
            
            if (dbDeleteSuccess) {
                log.info("✅ DB에서 이미지 삭제 완료 - imageId: {}", imageId);
                
                // 3. 파일 시스템에서 실제 파일 삭제
                boolean fileDeleteSuccess = deleteImageFile(imagePath);
                
                if (fileDeleteSuccess) {
                    log.info("✅ 파일 시스템에서 이미지 삭제 완료 - path: {}", imagePath);
                } else {
                    log.warn("⚠️ 파일 삭제 실패하였지만 DB 삭제는 성공 - path: {}", imagePath);
                }
                
                return true; // DB 삭제가 성공하면 성공으로 간주
                
            } else {
                log.warn("❌ DB에서 이미지 삭제 실패 - imageId: {} (결과: {})", imageId, result);
                return false;
            }
            
        } catch (Exception e) {
            log.error("❌ 시설 이미지 삭제 중 오류 발생 - imageId: {}", imageId, e);
            return false;
        }
    }
    
    /**
     * 파일 시스템에서 이미지 파일 삭제
     */
    private boolean deleteImageFile(String imagePath) {
        try {
            if (imagePath == null || imagePath.trim().isEmpty()) {
                log.warn("⚠️ 삭제할 파일 경로가 비어있음");
                return false;
            }
            
            // 웹 경로를 실제 파일 시스템 경로로 변환
            String actualFilePath;
            if (imagePath.startsWith("/uploads/facility/")) {
                String filename = imagePath.substring("/uploads/facility/".length());
                actualFilePath = Constants.FACILITY_UPLOAD_PATH + filename;
            } else {
                log.warn("⚠️ 예상치 못한 파일 경로 형식: {}", imagePath);
                return false;
            }
            
            log.info("🔍 실제 파일 경로: {}", actualFilePath);
            
            File fileToDelete = new File(actualFilePath);
            
            if (fileToDelete.exists()) {
                boolean deleted = fileToDelete.delete();
                if (deleted) {
                    log.info("✅ 파일 삭제 성공: {}", actualFilePath);
                    return true;
                } else {
                    log.error("❌ 파일 삭제 실패: {}", actualFilePath);
                    return false;
                }
            } else {
                log.warn("⚠️ 삭제할 파일이 존재하지 않음: {}", actualFilePath);
                return true; // 파일이 없으면 삭제된 것으로 간주
            }
            
        } catch (Exception e) {
            log.error("❌ 파일 삭제 중 오류 발생 - imagePath: {}", imagePath, e);
            return false;
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
     * 메인 이미지 설정 (boolean 반환)
     */
    @Transactional
    public boolean setMainImage(Long facilityId, Long imageId) {
        try {
            log.info("메인 이미지 설정 시작 - facilityId: {}, imageId: {}", facilityId, imageId);
            
            // 기존 메인 이미지 해제
            facilityImageMapper.clearMainImages(facilityId);
            
            // 새 메인 이미지 설정
            int result = facilityImageMapper.updateMainImage(facilityId, imageId);
            boolean success = result > 0;
            
            if (success) {
                log.info("메인 이미지 설정 완료 - facilityId: {}, imageId: {}", facilityId, imageId);
            } else {
                log.warn("메인 이미지 설정 실패 - facilityId: {}, imageId: {} (결과: {})", facilityId, imageId, result);
            }
            
            return success;
            
        } catch (Exception e) {
            log.error("메인 이미지 설정 중 오류 발생 - facilityId: {}, imageId: {}", facilityId, imageId, e);
            return false;
        }
    }
    
    /**
     * 특정 이미지 ID로 이미지 조회 (권한 확인용)
     */
    @Transactional(readOnly = true)
    public FacilityImageDTO getImageById(Long imageId) {
        log.info("시설 이미지 조회 - imageId: {}", imageId);
        return facilityImageMapper.getImageById(imageId);
    }
    
    /**
     * 모든 이미지 조회 (임시 - 더 나은 방법으로 대체 예정)
     */
    @Transactional(readOnly = true)
    public List<FacilityImageDTO> getAllImages() {
        // 임시 구현: 실제로는 특정 시설의 이미지만 조회하는 것이 좋음
        log.info("모든 시설 이미지 목록 조회 (임시)");
        // 임시로 빈 리스트 반환하고 getImageById 사용
        return java.util.Collections.emptyList();
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
    
    /**
     * 이미지 파일 유효성 검증 (확장자, 크기 등)
     */
    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("이미지 파일이 비어있습니다.");
        }
        
        // 파일 크기 검증
        if (file.getSize() > Constants.MAX_FILE_SIZE) {
            throw new IllegalArgumentException(String.format("파일 크기가 너무 큽니다. 최대 %dMB까지 업로드 가능합니다.", 
                Constants.MAX_FILE_SIZE / (1024 * 1024)));
        }
        
        // 파일 확장자 검증
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.contains(".")) {
            throw new IllegalArgumentException("유효하지 않은 파일입니다.");
        }
        
        String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        boolean isValidExtension = false;
        for (String allowedExt : Constants.ALLOWED_IMAGE_EXTENSIONS) {
            if (allowedExt.equals(extension)) {
                isValidExtension = true;
                break;
            }
        }
        
        if (!isValidExtension) {
            throw new IllegalArgumentException(String.format("지원하지 않는 파일 형식입니다. 지원 형식: %s", 
                String.join(", ", Constants.ALLOWED_IMAGE_EXTENSIONS)));
        }
        
        // Content-Type 검증 (추가 보안)
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("이미지 파일만 업로드 가능합니다.");
        }
        
        log.debug("✅ 이미지 파일 검증 통과 - 파일명: {}, 크기: {}KB, 타입: {}", 
            originalFilename, file.getSize() / 1024, contentType);
    }
    
    /**
     * 이미지 순서 업데이트 (데이터 정합성 보장)
     */
    @Transactional
    public boolean updateImageOrder(Long imageId, Integer imageOrder) {
        try {
            log.info("🔢 이미지 순서 업데이트 - imageId: {}, newOrder: {}", imageId, imageOrder);
            
            int result = facilityImageMapper.updateImageOrder(imageId, imageOrder);
            boolean success = result > 0;
            
            if (success) {
                log.info("✅ 이미지 순서 업데이트 성공 - imageId: {}, newOrder: {}", imageId, imageOrder);
            } else {
                log.warn("⚠️ 이미지 순서 업데이트 실패 - imageId: {}, newOrder: {}", imageId, imageOrder);
            }
            
            return success;
            
        } catch (Exception e) {
            log.error("❌ 이미지 순서 업데이트 중 오류 발생 - imageId: {}, newOrder: {}", imageId, imageOrder, e);
            return false;
        }
    }
    
    /**
     * 시설의 모든 이미지 완전 삭제 (시설 삭제 시 사용)
     */
    @Transactional
    public boolean deleteAllFacilityImages(Long facilityId) {
        try {
            log.info("🗑️ 시설의 모든 이미지 완전 삭제 시작 - facilityId: {}", facilityId);
            
            // 1. 먼저 모든 이미지 목록 조회 (파일 경로 확인용)
            List<FacilityImageDTO> imagesToDelete = facilityImageMapper.getImagesByFacilityId(facilityId);
            
            if (imagesToDelete.isEmpty()) {
                log.info("ℹ️ 삭제할 이미지가 없음 - facilityId: {}", facilityId);
                return true;
            }
            
            log.info("📊 삭제할 이미지 수: {}", imagesToDelete.size());
            
            // 2. 각 이미지의 파일 경로 수집
            List<String> imagePaths = new ArrayList<>();
            for (FacilityImageDTO image : imagesToDelete) {
                if (image.getImagePath() != null && !image.getImagePath().trim().isEmpty()) {
                    imagePaths.add(image.getImagePath());
                }
            }
            
            // 3. 데이터베이스에서 모든 이미지 삭제
            int deletedCount = facilityImageMapper.deleteAllImagesByFacilityId(facilityId);
            log.info("✅ DB에서 {} 개 이미지 삭제 완료 - facilityId: {}", deletedCount, facilityId);
            
            // 4. 파일 시스템에서 모든 파일 삭제
            int fileDeletedCount = 0;
            for (String imagePath : imagePaths) {
                if (deleteImageFile(imagePath)) {
                    fileDeletedCount++;
                }
            }
            
            log.info("✅ 파일 시스템에서 {}/{} 개 파일 삭제 완료", fileDeletedCount, imagePaths.size());
            
            return deletedCount > 0;
            
        } catch (Exception e) {
            log.error("❌ 시설의 모든 이미지 삭제 중 오류 발생 - facilityId: {}", facilityId, e);
            return false;
        }
    }
}