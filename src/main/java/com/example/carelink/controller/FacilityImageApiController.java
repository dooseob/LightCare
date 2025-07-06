package com.example.carelink.controller;

import com.example.carelink.dto.FacilityDTO;
import com.example.carelink.dto.FacilityImageDTO;
import com.example.carelink.dto.MemberDTO;
import com.example.carelink.service.FacilityService;
import com.example.carelink.service.FacilityImageService;
import com.example.carelink.common.Constants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 시설 이미지 관리 전용 REST API 컨트롤러
 * Thymeleaf 인라인 자바스크립트 충돌 방지를 위해 별도 분리
 * 데이터 정합성 문제 해결을 위한 견고한 구현
 */
@RestController
@RequestMapping("/api/facility")
@RequiredArgsConstructor
@Slf4j
public class FacilityImageApiController {

    private final FacilityImageService facilityImageService;
    private final FacilityService facilityService;

    /**
     * 시설 이미지 목록 조회 API (정렬 및 데이터 정합성 확인 포함)
     */
    @GetMapping("/{facilityId}/images")
    public Map<String, Object> getFacilityImages(@PathVariable Long facilityId, HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            log.info("📋 시설 이미지 목록 API 호출 - facilityId: {}", facilityId);
            
            // 권한 확인
            if (!isAuthorized(session, facilityId, result)) {
                return result;
            }
            
            // 시설 정보 확인
            FacilityDTO facility = facilityService.getFacilityById(facilityId);
            if (facility == null) {
                result.put("success", false);
                result.put("message", "시설을 찾을 수 없습니다.");
                return result;
            }
            
            // 이미지 목록 조회 및 데이터 정합성 확인
            List<FacilityImageDTO> images = facilityImageService.getImagesByFacilityId(facilityId);
            
            // 데이터 정합성 검증 및 자동 수정
            images = validateAndFixImageData(facilityId, images);
            
            result.put("success", true);
            result.put("images", images);
            result.put("facilityName", facility.getFacilityName());
            result.put("totalCount", images.size());
            
            log.info("✅ 시설 이미지 목록 조회 성공 - facilityId: {}, 이미지 수: {}", facilityId, images.size());
            
        } catch (Exception e) {
            log.error("❌ 시설 이미지 목록 조회 중 오류 발생 - facilityId: {}", facilityId, e);
            result.put("success", false);
            result.put("message", "이미지 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
        
        return result;
    }

    /**
     * 메인 이미지 설정 API (데이터 정합성 확인 포함)
     */
    @PostMapping("/images/{imageId}/set-main")
    public Map<String, Object> setMainImage(@PathVariable Long imageId, HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            log.info("⭐ 메인 이미지 설정 API 호출 - imageId: {}", imageId);
            
            // 로그인 확인
            MemberDTO member = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
            if (member == null) {
                log.warn("⚠️ 미로그인 사용자의 메인 이미지 설정 시도");
                result.put("success", false);
                result.put("message", "로그인이 필요합니다.");
                return result;
            }
            
            log.info("👤 요청 사용자: {} (role: {})", member.getName(), member.getRole());
            
            // 이미지 존재 확인 (더 견고한 방법)
            FacilityImageDTO targetImage = facilityImageService.getImageById(imageId);
            if (targetImage == null) {
                log.warn("⚠️ 존재하지 않는 이미지 ID: {}", imageId);
                result.put("success", false);
                result.put("message", "설정할 이미지를 찾을 수 없습니다. 이미지가 삭제되었을 수 있습니다.");
                return result;
            }
            
            log.info("🖼️ 대상 이미지: facilityId={}, imagePath={}, currentMain={}", 
                    targetImage.getFacilityId(), targetImage.getImagePath(), targetImage.getIsMainImage());
            
            // 시설 권한 확인
            if (!isAuthorizedForFacility(member, targetImage.getFacilityId(), result)) {
                return result;
            }
            
            // 데이터 정합성 확인 및 메인 이미지 설정
            boolean updated = setMainImageWithValidation(targetImage.getFacilityId(), imageId);
            
            if (updated) {
                result.put("success", true);
                result.put("message", "메인 이미지로 설정되었습니다.");
                result.put("imageId", imageId);
                result.put("facilityId", targetImage.getFacilityId());
                
                log.info("✅ 메인 이미지 설정 성공 - imageId: {}, facilityId: {}, 사용자: {}", 
                        imageId, targetImage.getFacilityId(), member.getName());
            } else {
                result.put("success", false);
                result.put("message", "메인 이미지 설정에 실패했습니다. 다시 시도해주세요.");
                log.error("❌ 메인 이미지 설정 실패 - imageId: {}, facilityId: {}", 
                         imageId, targetImage.getFacilityId());
            }
            
        } catch (Exception e) {
            log.error("❌ 메인 이미지 설정 중 예외 발생 - imageId: {}", imageId, e);
            result.put("success", false);
            result.put("message", "메인 이미지 설정 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
        
        return result;
    }

    /**
     * 시설 이미지 삭제 API (데이터 정합성 확인 포함)
     */
    @DeleteMapping("/images/{imageId}")
    public Map<String, Object> deleteImage(@PathVariable Long imageId, HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            log.info("🗑️ 이미지 삭제 API 호출 - imageId: {}", imageId);
            
            // 로그인 확인
            MemberDTO member = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
            if (member == null) {
                log.warn("⚠️ 미로그인 사용자의 이미지 삭제 시도");
                result.put("success", false);
                result.put("message", "로그인이 필요합니다.");
                return result;
            }
            
            log.info("👤 요청 사용자: {} (role: {})", member.getName(), member.getRole());
            
            // 이미지 존재 확인 (더 견고한 방법)
            FacilityImageDTO imageToDelete = facilityImageService.getImageById(imageId);
            if (imageToDelete == null) {
                log.warn("⚠️ 존재하지 않는 이미지 ID: {}", imageId);
                result.put("success", false);
                result.put("message", "삭제할 이미지를 찾을 수 없습니다. 이미 삭제되었을 수 있습니다.");
                return result;
            }
            
            log.info("🖼️ 삭제 대상 이미지: facilityId={}, imagePath={}, isMain={}", 
                    imageToDelete.getFacilityId(), imageToDelete.getImagePath(), imageToDelete.getIsMainImage());
            
            // 시설 권한 확인
            if (!isAuthorizedForFacility(member, imageToDelete.getFacilityId(), result)) {
                return result;
            }
            
            // 삭제 가능 여부 확인 (마지막 이미지 방지)
            List<FacilityImageDTO> allImages = facilityImageService.getImagesByFacilityId(imageToDelete.getFacilityId());
            if (allImages.size() <= 1) {
                result.put("success", false);
                result.put("message", "마지막 이미지는 삭제할 수 없습니다. 다른 이미지를 먼저 추가해주세요.");
                return result;
            }
            
            // 메인 이미지 삭제 시 다른 이미지를 자동으로 메인으로 설정
            boolean wasMainImage = imageToDelete.getIsMainImage() != null && imageToDelete.getIsMainImage();
            
            // 이미지 삭제 실행
            log.info("🔄 이미지 삭제 실행 중...");
            boolean deleted = facilityImageService.deleteFacilityImage(imageId);
            
            if (deleted) {
                // 메인 이미지였다면 다른 이미지를 메인으로 설정
                if (wasMainImage) {
                    autoSetNewMainImage(imageToDelete.getFacilityId(), imageId);
                }
                
                result.put("success", true);
                result.put("message", "이미지가 성공적으로 삭제되었습니다.");
                result.put("imageId", imageId);
                result.put("facilityId", imageToDelete.getFacilityId());
                result.put("wasMainImage", wasMainImage);
                
                log.info("✅ 이미지 삭제 성공 - imageId: {}, facilityId: {}, 사용자: {}", 
                        imageId, imageToDelete.getFacilityId(), member.getName());
            } else {
                result.put("success", false);
                result.put("message", "이미지 삭제에 실패했습니다. 다시 시도해주세요.");
                log.error("❌ 이미지 삭제 실패 - imageId: {}, facilityId: {}", 
                         imageId, imageToDelete.getFacilityId());
            }
            
        } catch (Exception e) {
            log.error("❌ 이미지 삭제 중 예외 발생 - imageId: {}", imageId, e);
            result.put("success", false);
            result.put("message", "이미지 삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
        
        return result;
    }

    /**
     * 이미지 정보 조회 API
     */
    @GetMapping("/images/{imageId}")
    public Map<String, Object> getImageInfo(@PathVariable Long imageId, HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            log.info("🔍 이미지 정보 조회 API 호출 - imageId: {}", imageId);
            
            // 로그인 확인
            MemberDTO member = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
            if (member == null) {
                result.put("success", false);
                result.put("message", "로그인이 필요합니다.");
                return result;
            }
            
            // 이미지 정보 조회
            FacilityImageDTO image = facilityImageService.getImageById(imageId);
            if (image == null) {
                result.put("success", false);
                result.put("message", "이미지를 찾을 수 없습니다.");
                return result;
            }
            
            // 시설 권한 확인
            if (!isAuthorizedForFacility(member, image.getFacilityId(), result)) {
                return result;
            }
            
            FacilityDTO facility = facilityService.getFacilityById(image.getFacilityId());
            
            result.put("success", true);
            result.put("image", image);
            result.put("facilityName", facility != null ? facility.getFacilityName() : "알 수 없음");
            
            log.info("✅ 이미지 정보 조회 성공 - imageId: {}", imageId);
            
        } catch (Exception e) {
            log.error("❌ 이미지 정보 조회 중 오류 발생 - imageId: {}", imageId, e);
            result.put("success", false);
            result.put("message", "이미지 정보 조회 중 오류가 발생했습니다.");
        }
        
        return result;
    }

    // ===========================================
    // 프라이빗 헬퍼 메서드들 (데이터 정합성 확인)
    // ===========================================

    /**
     * 권한 확인 (세션 체크 포함)
     */
    private boolean isAuthorized(HttpSession session, Long facilityId, Map<String, Object> result) {
        MemberDTO member = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
        if (member == null) {
            result.put("success", false);
            result.put("message", "로그인이 필요합니다.");
            return false;
        }
        return isAuthorizedForFacility(member, facilityId, result);
    }

    /**
     * 시설별 권한 확인
     */
    private boolean isAuthorizedForFacility(MemberDTO member, Long facilityId, Map<String, Object> result) {
        try {
            FacilityDTO facility = facilityService.getFacilityById(facilityId);
            if (facility == null) {
                result.put("success", false);
                result.put("message", "시설을 찾을 수 없습니다.");
                return false;
            }
            
            // 권한 확인 (시설 소유자 또는 관리자)
            boolean hasPermission = facility.getRegisteredMemberId().equals(member.getMemberId()) 
                                 || Constants.MEMBER_ROLE_ADMIN.equals(member.getRole());
            
            if (!hasPermission) {
                log.warn("⚠️ 권한 없음 - 사용자: {}, 시설 소유자: {}", 
                        member.getMemberId(), facility.getRegisteredMemberId());
                result.put("success", false);
                result.put("message", "해당 시설에 대한 권한이 없습니다.");
                return false;
            }
            
            return true;
        } catch (Exception e) {
            log.error("❌ 권한 확인 중 오류 발생", e);
            result.put("success", false);
            result.put("message", "권한 확인 중 오류가 발생했습니다.");
            return false;
        }
    }

    /**
     * 이미지 데이터 정합성 검증 및 자동 수정
     */
    private List<FacilityImageDTO> validateAndFixImageData(Long facilityId, List<FacilityImageDTO> images) {
        try {
            log.info("🔍 데이터 정합성 검증 시작 - facilityId: {}, 이미지 수: {}", facilityId, images.size());
            
            if (images.isEmpty()) {
                return images;
            }
            
            // 1. 메인 이미지 검증
            long mainImageCount = images.stream()
                    .filter(img -> img.getIsMainImage() != null && img.getIsMainImage())
                    .count();
            
            log.info("📊 메인 이미지 수: {}", mainImageCount);
            
            // 메인 이미지가 없거나 여러 개인 경우 수정
            if (mainImageCount == 0) {
                log.warn("⚠️ 메인 이미지가 없음 - 첫 번째 이미지를 메인으로 설정");
                FacilityImageDTO firstImage = images.get(0);
                facilityImageService.setMainImage(facilityId, firstImage.getImageId());
                firstImage.setIsMainImage(true);
            } else if (mainImageCount > 1) {
                log.warn("⚠️ 메인 이미지가 {} 개 - 첫 번째만 유지하고 나머지 해제", mainImageCount);
                boolean firstMainFound = false;
                for (FacilityImageDTO image : images) {
                    if (image.getIsMainImage() != null && image.getIsMainImage()) {
                        if (!firstMainFound) {
                            firstMainFound = true;
                            // 첫 번째 메인 이미지는 유지
                        } else {
                            // 나머지 메인 이미지는 해제
                            facilityImageService.setMainImage(facilityId, image.getImageId());
                            // 다시 첫 번째를 메인으로 설정 (정합성 보장)
                            facilityImageService.setMainImage(facilityId, images.get(0).getImageId());
                            image.setIsMainImage(false);
                        }
                    }
                }
            }
            
            // 2. 이미지 순서 검증 및 수정
            validateAndFixImageOrder(facilityId, images);
            
            log.info("✅ 데이터 정합성 검증 완료 - facilityId: {}", facilityId);
            
        } catch (Exception e) {
            log.error("❌ 데이터 정합성 검증 중 오류 발생 - facilityId: {}", facilityId, e);
        }
        
        return images;
    }

    /**
     * 이미지 순서 검증 및 수정
     */
    private void validateAndFixImageOrder(Long facilityId, List<FacilityImageDTO> images) {
        try {
            // 이미지 순서별로 정렬
            images.sort((a, b) -> {
                int orderA = a.getImageOrder() != null ? a.getImageOrder() : 0;
                int orderB = b.getImageOrder() != null ? b.getImageOrder() : 0;
                if (orderA == orderB) {
                    // 순서가 같으면 업로드 날짜로 정렬
                    return a.getUploadDate().compareTo(b.getUploadDate());
                }
                return Integer.compare(orderA, orderB);
            });
            
            // 중복 순서 감지
            Map<Integer, Integer> orderCount = new HashMap<>();
            for (FacilityImageDTO image : images) {
                int order = image.getImageOrder() != null ? image.getImageOrder() : 0;
                orderCount.put(order, orderCount.getOrDefault(order, 0) + 1);
            }
            
            boolean hasDuplicate = orderCount.values().stream().anyMatch(count -> count > 1);
            
            if (hasDuplicate) {
                log.warn("⚠️ 이미지 순서 중복 발견 - 자동 수정 실행");
                
                // 순서 재정렬
                for (int i = 0; i < images.size(); i++) {
                    FacilityImageDTO image = images.get(i);
                    if (image.getImageOrder() == null || image.getImageOrder() != i) {
                        log.info("🔧 이미지 순서 수정: imageId={}, {} → {}", 
                                image.getImageId(), image.getImageOrder(), i);
                        // 실제 DB 업데이트 실행
                        boolean updateSuccess = facilityImageService.updateImageOrder(image.getImageId(), i);
                        if (updateSuccess) {
                            image.setImageOrder(i);
                        } else {
                            log.error("❌ 이미지 순서 DB 업데이트 실패 - imageId: {}", image.getImageId());
                        }
                    }
                }
            }
            
        } catch (Exception e) {
            log.error("❌ 이미지 순서 검증 중 오류 발생", e);
        }
    }

    /**
     * 견고한 메인 이미지 설정 (트랜잭션 보장)
     */
    private boolean setMainImageWithValidation(Long facilityId, Long imageId) {
        try {
            log.info("🔄 견고한 메인 이미지 설정 시작 - facilityId: {}, imageId: {}", facilityId, imageId);
            
            // 1. 모든 이미지의 메인 상태 해제
            List<FacilityImageDTO> allImages = facilityImageService.getImagesByFacilityId(facilityId);
            for (FacilityImageDTO image : allImages) {
                if (image.getIsMainImage() != null && image.getIsMainImage() && !image.getImageId().equals(imageId)) {
                    log.info("🔄 기존 메인 이미지 해제: imageId={}", image.getImageId());
                }
            }
            
            // 2. 지정된 이미지를 메인으로 설정
            boolean success = facilityImageService.setMainImage(facilityId, imageId);
            
            if (success) {
                // 3. 설정 검증
                FacilityImageDTO updatedImage = facilityImageService.getImageById(imageId);
                if (updatedImage != null && updatedImage.getIsMainImage() != null && updatedImage.getIsMainImage()) {
                    log.info("✅ 메인 이미지 설정 및 검증 완료");
                    return true;
                } else {
                    log.error("❌ 메인 이미지 설정 검증 실패");
                    return false;
                }
            }
            
            return false;
            
        } catch (Exception e) {
            log.error("❌ 견고한 메인 이미지 설정 중 오류 발생", e);
            return false;
        }
    }

    /**
     * 자동으로 새로운 메인 이미지 설정 (삭제 시)
     */
    private void autoSetNewMainImage(Long facilityId, Long deletedImageId) {
        try {
            log.info("🔄 자동 메인 이미지 설정 시작 - facilityId: {}", facilityId);
            
            List<FacilityImageDTO> remainingImages = facilityImageService.getImagesByFacilityId(facilityId);
            
            if (!remainingImages.isEmpty()) {
                // 가장 순서가 빠른 이미지를 메인으로 설정
                FacilityImageDTO newMainImage = remainingImages.stream()
                        .min((a, b) -> {
                            int orderA = a.getImageOrder() != null ? a.getImageOrder() : 999;
                            int orderB = b.getImageOrder() != null ? b.getImageOrder() : 999;
                            if (orderA == orderB) {
                                return a.getUploadDate().compareTo(b.getUploadDate());
                            }
                            return Integer.compare(orderA, orderB);
                        })
                        .orElse(remainingImages.get(0));
                
                boolean success = facilityImageService.setMainImage(facilityId, newMainImage.getImageId());
                if (success) {
                    log.info("✅ 자동 메인 이미지 설정 완료 - newMainImageId: {}", newMainImage.getImageId());
                } else {
                    log.error("❌ 자동 메인 이미지 설정 실패");
                }
            }
            
        } catch (Exception e) {
            log.error("❌ 자동 메인 이미지 설정 중 오류 발생", e);
        }
    }
}