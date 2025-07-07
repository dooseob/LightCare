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
            
            // 확장자 먼저 추출 (프로필 이미지 방식 적용)
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            String baseName = "";
            
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                baseName = originalFilename.substring(0, originalFilename.lastIndexOf("."));
            } else if (originalFilename != null) {
                baseName = originalFilename;
                extension = ".jpg"; // 기본 확장자
            }
            
            String finalFileName;
            
            if (customFileName != null && !customFileName.trim().isEmpty()) {
                // 사용자 지정 파일명에서도 확장자 분리
                String userFileName = customFileName.trim();
                String userBaseName = userFileName;
                String userExtension = extension; // 원본 파일의 확장자 유지
                
                // 사용자 파일명에 확장자가 포함된 경우 분리
                if (userFileName.contains(".")) {
                    userBaseName = userFileName.substring(0, userFileName.lastIndexOf("."));
                    userExtension = userFileName.substring(userFileName.lastIndexOf("."));
                }
                
                // 한글 파일명을 영문으로 변환 (확장자 제외)
                String englishBaseName = convertKoreanToEnglish(userBaseName);
                String cleanBaseName = sanitizeFilename(englishBaseName);
                
                // 최종 파일명 생성 (확장자를 맨 마지막에 추가)
                finalFileName = String.format("facility_%s_%d_%s_%s%s", 
                        facilityId, index, cleanBaseName, 
                        UUID.randomUUID().toString().substring(0, 8), userExtension);
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
     * 한글 파일명을 영문으로 변환 (실제 번역 + 로마자 변환)
     */
    private String convertKoreanToEnglish(String korean) {
        if (korean == null || korean.trim().isEmpty()) {
            return "facility_image";
        }
        
        String input = korean.toLowerCase().trim();
        String result = input;
        
        // 1단계: 의미 있는 한글 키워드를 영문으로 번역
        java.util.Map<String, String> koreanToEnglish = java.util.Map.ofEntries(
            // 시설 종류
            java.util.Map.entry("시설", "facility"),
            java.util.Map.entry("요양원", "nursing_home"),
            java.util.Map.entry("요양병원", "nursing_hospital"),
            java.util.Map.entry("병원", "hospital"),
            java.util.Map.entry("의원", "clinic"),
            java.util.Map.entry("데이케어", "daycare"),
            java.util.Map.entry("센터", "center"),
            java.util.Map.entry("홈", "home"),
            java.util.Map.entry("케어", "care"),
            
            // 공간 (기본)
            java.util.Map.entry("외관", "exterior"),
            java.util.Map.entry("외부", "exterior"), 
            java.util.Map.entry("건물", "building"),
            java.util.Map.entry("입구", "entrance"),
            java.util.Map.entry("현관", "entrance"),
            java.util.Map.entry("내부", "interior"),
            java.util.Map.entry("로비", "lobby"),
            java.util.Map.entry("복도", "corridor"),
            java.util.Map.entry("홀", "hall"),
            
            // 공간 (거주)
            java.util.Map.entry("방", "room"),
            java.util.Map.entry("객실", "room"),
            java.util.Map.entry("침실", "bedroom"),
            java.util.Map.entry("생활실", "living_room"),
            java.util.Map.entry("휴게실", "rest_room"),
            
            // 공간 (생활)
            java.util.Map.entry("식당", "dining_room"),
            java.util.Map.entry("주방", "kitchen"),
            java.util.Map.entry("카페", "cafe"),
            java.util.Map.entry("화장실", "restroom"),
            java.util.Map.entry("욕실", "bathroom"),
            java.util.Map.entry("세탁실", "laundry"),
            
            // 공간 (의료)
            java.util.Map.entry("치료실", "treatment_room"),
            java.util.Map.entry("의무실", "medical_room"),
            java.util.Map.entry("상담실", "consultation_room"),
            java.util.Map.entry("간호사실", "nurses_station"),
            
            // 공간 (재활/운동)
            java.util.Map.entry("재활실", "rehabilitation_room"),
            java.util.Map.entry("물리치료실", "physical_therapy_room"),
            java.util.Map.entry("운동실", "exercise_room"),
            java.util.Map.entry("헬스장", "gym"),
            
            // 공간 (활동)
            java.util.Map.entry("프로그램실", "program_room"),
            java.util.Map.entry("강당", "auditorium"),
            java.util.Map.entry("도서실", "library"),
            java.util.Map.entry("오락실", "recreation_room"),
            
            // 공간 (외부)
            java.util.Map.entry("정원", "garden"),
            java.util.Map.entry("마당", "yard"),
            java.util.Map.entry("테라스", "terrace"),
            java.util.Map.entry("발코니", "balcony"),
            java.util.Map.entry("주차장", "parking_lot"),
            java.util.Map.entry("산책로", "walking_path"),
            
            // 공간 (기타)
            java.util.Map.entry("엘리베이터", "elevator"),
            java.util.Map.entry("계단", "stairs"),
            java.util.Map.entry("사무실", "office"),
            java.util.Map.entry("접수처", "reception"),
            
            // 서비스/의료
            java.util.Map.entry("간호", "nursing"),
            java.util.Map.entry("간병", "care"),
            java.util.Map.entry("치료", "treatment"),
            java.util.Map.entry("재활", "rehabilitation"),
            java.util.Map.entry("물리치료", "physical_therapy"),
            java.util.Map.entry("건강관리", "health_care"),
            
            // 특징/상태
            java.util.Map.entry("깨끗한", "clean"),
            java.util.Map.entry("밝은", "bright"),
            java.util.Map.entry("넓은", "spacious"),
            java.util.Map.entry("안전한", "safe"),
            java.util.Map.entry("편안한", "comfortable"),
            java.util.Map.entry("현대적", "modern"),
            java.util.Map.entry("고급", "premium"),
            
            // 시간/위치
            java.util.Map.entry("아침", "morning"),
            java.util.Map.entry("점심", "lunch"),
            java.util.Map.entry("저녁", "evening"),
            java.util.Map.entry("앞", "front"),
            java.util.Map.entry("뒤", "back"),
            java.util.Map.entry("층", "floor"),
            java.util.Map.entry("1층", "first_floor"),
            java.util.Map.entry("2층", "second_floor"),
            
            // 숫자
            java.util.Map.entry("1", "one"),
            java.util.Map.entry("2", "two"),
            java.util.Map.entry("3", "three"),
            java.util.Map.entry("4", "four"),
            java.util.Map.entry("5", "five"),
            java.util.Map.entry("첫번째", "first"),
            java.util.Map.entry("두번째", "second"),
            java.util.Map.entry("세번째", "third")
        );
        
        // 키워드 변환 적용
        for (java.util.Map.Entry<String, String> entry : koreanToEnglish.entrySet()) {
            result = result.replace(entry.getKey(), entry.getValue());
        }
        
        // 2단계: 남은 한글을 로마자로 변환
        if (containsKorean(result)) {
            result = convertKoreanToRomanization(result);
        }
        
        return result;
    }
    
    /**
     * 한글을 로마자로 변환 (간단한 로마자 변환)
     */
    private String convertKoreanToRomanization(String korean) {
        if (korean == null || korean.trim().isEmpty()) {
            return "korean_text";
        }
        
        // 기본적인 한글 자모 로마자 변환 테이블
        java.util.Map<String, String> koreanRomanization = java.util.Map.ofEntries(
            // 자음 (초성)
            java.util.Map.entry("ㄱ", "g"), java.util.Map.entry("ㄴ", "n"), java.util.Map.entry("ㄷ", "d"),
            java.util.Map.entry("ㄹ", "r"), java.util.Map.entry("ㅁ", "m"), java.util.Map.entry("ㅂ", "b"),
            java.util.Map.entry("ㅅ", "s"), java.util.Map.entry("ㅇ", ""), java.util.Map.entry("ㅈ", "j"),
            java.util.Map.entry("ㅊ", "ch"), java.util.Map.entry("ㅋ", "k"), java.util.Map.entry("ㅌ", "t"),
            java.util.Map.entry("ㅍ", "p"), java.util.Map.entry("ㅎ", "h"),
            
            // 모음
            java.util.Map.entry("ㅏ", "a"), java.util.Map.entry("ㅑ", "ya"), java.util.Map.entry("ㅓ", "eo"),
            java.util.Map.entry("ㅕ", "yeo"), java.util.Map.entry("ㅗ", "o"), java.util.Map.entry("ㅛ", "yo"),
            java.util.Map.entry("ㅜ", "u"), java.util.Map.entry("ㅠ", "yu"), java.util.Map.entry("ㅡ", "eu"),
            java.util.Map.entry("ㅣ", "i"), java.util.Map.entry("ㅐ", "ae"), java.util.Map.entry("ㅔ", "e"),
            
            // 일반적인 한글 단어 로마자 변환
            java.util.Map.entry("가", "ga"), java.util.Map.entry("나", "na"), java.util.Map.entry("다", "da"),
            java.util.Map.entry("라", "ra"), java.util.Map.entry("마", "ma"), java.util.Map.entry("바", "ba"),
            java.util.Map.entry("사", "sa"), java.util.Map.entry("자", "ja"), java.util.Map.entry("차", "cha"),
            java.util.Map.entry("카", "ka"), java.util.Map.entry("타", "ta"), java.util.Map.entry("파", "pa"),
            java.util.Map.entry("하", "ha"),
            
            // 자주 사용되는 한글 조합
            java.util.Map.entry("김", "kim"), java.util.Map.entry("이", "lee"), java.util.Map.entry("박", "park"),
            java.util.Map.entry("최", "choi"), java.util.Map.entry("정", "jung"), java.util.Map.entry("강", "kang"),
            java.util.Map.entry("조", "cho"), java.util.Map.entry("윤", "yoon"), java.util.Map.entry("장", "jang"),
            java.util.Map.entry("임", "lim"), java.util.Map.entry("한", "han"), java.util.Map.entry("오", "oh"),
            java.util.Map.entry("서", "seo"), java.util.Map.entry("신", "shin"), java.util.Map.entry("권", "kwon"),
            java.util.Map.entry("황", "hwang"), java.util.Map.entry("안", "ahn"), java.util.Map.entry("송", "song"),
            java.util.Map.entry("류", "ryu"), java.util.Map.entry("전", "jeon"), java.util.Map.entry("홍", "hong")
        );
        
        String result = korean;
        
        // 로마자 변환 적용
        for (java.util.Map.Entry<String, String> entry : koreanRomanization.entrySet()) {
            result = result.replace(entry.getKey(), entry.getValue());
        }
        
        // 변환되지 않은 한글이 있으면 안전한 기본값 사용
        if (containsKorean(result)) {
            result = "korean_" + System.currentTimeMillis() % 10000;
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
     * 시설의 모든 이미지 순서 재정렬 (중복 방지 및 데이터 정합성 보장)
     */
    @Transactional
    public boolean reorderAllFacilityImages(Long facilityId) {
        try {
            log.info("🔄 시설 이미지 순서 재정렬 시작 - facilityId: {}", facilityId);
            
            // 현재 이미지들을 순서대로 조회 (업로드 순서 기준)
            List<FacilityImageDTO> images = facilityImageMapper.getImagesByFacilityId(facilityId);
            
            if (images.isEmpty()) {
                log.info("ℹ️ 재정렬할 이미지가 없음 - facilityId: {}", facilityId);
                return true;
            }
            
            log.info("📊 재정렬할 이미지 수: {} - facilityId: {}", images.size(), facilityId);
            
            // 각 이미지의 순서를 0, 1, 2, 3, 4로 재설정
            for (int i = 0; i < images.size(); i++) {
                FacilityImageDTO image = images.get(i);
                int newOrder = i;
                
                // 기존 순서와 다른 경우에만 업데이트
                if (image.getImageOrder() == null || !image.getImageOrder().equals(newOrder)) {
                    int updateResult = facilityImageMapper.updateImageOrder(image.getImageId(), newOrder);
                    
                    if (updateResult > 0) {
                        log.debug("✅ 이미지 순서 재정렬 - imageId: {}, 기존: {} → 새로운: {}", 
                            image.getImageId(), image.getImageOrder(), newOrder);
                    } else {
                        log.warn("⚠️ 이미지 순서 재정렬 실패 - imageId: {}, 새로운 순서: {}", 
                            image.getImageId(), newOrder);
                    }
                }
            }
            
            log.info("✅ 시설 이미지 순서 재정렬 완료 - facilityId: {}", facilityId);
            return true;
            
        } catch (Exception e) {
            log.error("❌ 시설 이미지 순서 재정렬 중 오류 발생 - facilityId: {}", facilityId, e);
            return false;
        }
    }
    
    /**
     * 배치로 이미지 순서 업데이트 (프론트에서 전달받은 순서대로)
     */
    @Transactional
    public boolean updateImageOrdersBatch(Long facilityId, List<Long> imageIds) {
        try {
            log.info("🔢 배치 이미지 순서 업데이트 시작 - facilityId: {}, imageIds: {}", facilityId, imageIds);
            
            if (imageIds == null || imageIds.isEmpty()) {
                log.warn("⚠️ 업데이트할 이미지 ID 목록이 비어있음 - facilityId: {}", facilityId);
                return false;
            }
            
            // 시설의 기존 이미지 개수 확인
            int existingImageCount = facilityImageMapper.countImagesByFacilityId(facilityId);
            
            if (imageIds.size() > existingImageCount) {
                log.warn("⚠️ 전달받은 이미지 ID 수가 기존 이미지 수보다 많음 - facilityId: {}, 전달받은: {}, 기존: {}", 
                    facilityId, imageIds.size(), existingImageCount);
                return false;
            }
            
            int successCount = 0;
            
            // 각 이미지의 순서를 업데이트
            for (int i = 0; i < imageIds.size(); i++) {
                Long imageId = imageIds.get(i);
                int newOrder = i; // 0부터 시작
                
                // 해당 이미지가 실제로 해당 시설의 이미지인지 확인
                FacilityImageDTO existingImage = facilityImageMapper.getImageById(imageId);
                if (existingImage == null || !existingImage.getFacilityId().equals(facilityId)) {
                    log.warn("⚠️ 잘못된 이미지 ID 또는 시설 불일치 - imageId: {}, facilityId: {}", 
                        imageId, facilityId);
                    continue;
                }
                
                int updateResult = facilityImageMapper.updateImageOrder(imageId, newOrder);
                if (updateResult > 0) {
                    successCount++;
                    log.debug("✅ 이미지 순서 업데이트 - imageId: {}, 새로운 순서: {}", imageId, newOrder);
                } else {
                    log.warn("⚠️ 이미지 순서 업데이트 실패 - imageId: {}, 새로운 순서: {}", imageId, newOrder);
                }
            }
            
            boolean success = successCount == imageIds.size();
            
            if (success) {
                log.info("✅ 배치 이미지 순서 업데이트 완료 - facilityId: {}, 성공: {}/{}", 
                    facilityId, successCount, imageIds.size());
            } else {
                log.warn("⚠️ 배치 이미지 순서 업데이트 부분 실패 - facilityId: {}, 성공: {}/{}", 
                    facilityId, successCount, imageIds.size());
            }
            
            return success;
            
        } catch (Exception e) {
            log.error("❌ 배치 이미지 순서 업데이트 중 오류 발생 - facilityId: {}", facilityId, e);
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