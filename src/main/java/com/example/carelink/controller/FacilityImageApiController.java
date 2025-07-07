package com.example.carelink.controller;

import com.example.carelink.dto.FacilityImageDTO;
import com.example.carelink.dto.FacilityDTO;
import com.example.carelink.dto.MemberDTO;
import com.example.carelink.service.FacilityImageService;
import com.example.carelink.service.FacilityService;
import com.example.carelink.common.Constants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 시설 이미지 API 전용 컨트롤러
 * Ajax 요청 처리 및 JSON 응답 전용
 */
@RestController
@RequestMapping("/facility/facility-images")
@RequiredArgsConstructor
@Slf4j
public class FacilityImageApiController {

    private final FacilityImageService facilityImageService;
    private final FacilityService facilityService;

    /**
     * 시설 이미지 순서 일괄 업데이트 API
     */
    @PostMapping("/reorder/{facilityId}")
    public ResponseEntity<Map<String, Object>> reorderImages(
            @PathVariable Long facilityId,
            @RequestBody List<Long> imageIds) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("🔄 시설 이미지 순서 재정렬 API 요청 - facilityId: {}, imageIds: {}", facilityId, imageIds);
            
            // 배치로 이미지 순서 업데이트
            boolean success = facilityImageService.updateImageOrdersBatch(facilityId, imageIds);
            
            if (success) {
                response.put("success", true);
                response.put("message", "이미지 순서가 성공적으로 업데이트되었습니다.");
                
                // 업데이트된 이미지 목록 반환
                List<FacilityImageDTO> updatedImages = facilityImageService.getImagesByFacilityId(facilityId);
                response.put("images", updatedImages);
                
                log.info("✅ 시설 이미지 순서 재정렬 API 성공 - facilityId: {}", facilityId);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "이미지 순서 업데이트에 실패했습니다.");
                
                log.warn("⚠️ 시설 이미지 순서 재정렬 API 실패 - facilityId: {}", facilityId);
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            log.error("❌ 시설 이미지 순서 재정렬 API 오류 - facilityId: {}", facilityId, e);
            
            response.put("success", false);
            response.put("message", "서버 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * 시설 이미지 자동 순서 재정렬 API (중복 제거)
     */
    @PostMapping("/auto-reorder/{facilityId}")
    public ResponseEntity<Map<String, Object>> autoReorderImages(@PathVariable Long facilityId) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("🔄 시설 이미지 자동 순서 재정렬 API 요청 - facilityId: {}", facilityId);
            
            // 모든 이미지 순서 자동 재정렬
            boolean success = facilityImageService.reorderAllFacilityImages(facilityId);
            
            if (success) {
                response.put("success", true);
                response.put("message", "이미지 순서가 자동으로 재정렬되었습니다.");
                
                // 재정렬된 이미지 목록 반환
                List<FacilityImageDTO> reorderedImages = facilityImageService.getImagesByFacilityId(facilityId);
                response.put("images", reorderedImages);
                response.put("imageCount", reorderedImages.size());
                
                log.info("✅ 시설 이미지 자동 순서 재정렬 API 성공 - facilityId: {}, 총 {}장", facilityId, reorderedImages.size());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "이미지 순서 재정렬에 실패했습니다.");
                
                log.warn("⚠️ 시설 이미지 자동 순서 재정렬 API 실패 - facilityId: {}", facilityId);
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            log.error("❌ 시설 이미지 자동 순서 재정렬 API 오류 - facilityId: {}", facilityId, e);
            
            response.put("success", false);
            response.put("message", "서버 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * 시설 이미지 목록 조회 API (권한 확인 포함)
     */
    @GetMapping("/{facilityId}")
    public ResponseEntity<Map<String, Object>> getFacilityImages(@PathVariable Long facilityId, HttpSession session) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("📋 시설 이미지 목록 조회 API 요청 - facilityId: {}", facilityId);
            
            // 권한 확인
            MemberDTO member = (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
            if (member == null) {
                response.put("success", false);
                response.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(401).body(response);
            }
            
            FacilityDTO facility = facilityService.getFacilityById(facilityId);
            if (facility == null) {
                response.put("success", false);
                response.put("message", "시설을 찾을 수 없습니다.");
                return ResponseEntity.badRequest().body(response);
            }
            
            // 시설 소유자 또는 관리자만 접근 가능
            if (!facility.getRegisteredMemberId().equals(member.getMemberId()) 
                && !Constants.MEMBER_ROLE_ADMIN.equals(member.getRole())) {
                response.put("success", false);
                response.put("message", "해당 시설 이미지를 조회할 권한이 없습니다.");
                return ResponseEntity.status(403).body(response);
            }
            
            List<FacilityImageDTO> images = facilityImageService.getImagesByFacilityId(facilityId);
            FacilityImageDTO mainImage = facilityImageService.getMainImageByFacilityId(facilityId);
            
            response.put("success", true);
            response.put("images", images);
            response.put("mainImage", mainImage);
            response.put("imageCount", images.size());
            response.put("maxImages", 5); // 최대 이미지 수
            
            log.info("✅ 시설 이미지 목록 조회 API 성공 - facilityId: {}, 총 {}장, memberId: {}", facilityId, images.size(), member.getMemberId());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ 시설 이미지 목록 조회 API 오류 - facilityId: {}", facilityId, e);
            
            response.put("success", false);
            response.put("message", "서버 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * 개별 이미지 순서 업데이트 API
     */
    @PutMapping("/{imageId}/order")
    public ResponseEntity<Map<String, Object>> updateImageOrder(
            @PathVariable Long imageId,
            @RequestParam Integer order) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("🔢 개별 이미지 순서 업데이트 API 요청 - imageId: {}, order: {}", imageId, order);
            
            boolean success = facilityImageService.updateImageOrder(imageId, order);
            
            if (success) {
                response.put("success", true);
                response.put("message", "이미지 순서가 업데이트되었습니다.");
                
                log.info("✅ 개별 이미지 순서 업데이트 API 성공 - imageId: {}, order: {}", imageId, order);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "이미지 순서 업데이트에 실패했습니다.");
                
                log.warn("⚠️ 개별 이미지 순서 업데이트 API 실패 - imageId: {}, order: {}", imageId, order);
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            log.error("❌ 개별 이미지 순서 업데이트 API 오류 - imageId: {}, order: {}", imageId, order, e);
            
            response.put("success", false);
            response.put("message", "서버 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * 이미지 삭제 API
     */
    @DeleteMapping("/{imageId}")
    public ResponseEntity<Map<String, Object>> deleteImage(@PathVariable Long imageId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("🗑️ 이미지 삭제 API 요청 - imageId: {}", imageId);
            
            boolean success = facilityImageService.deleteFacilityImage(imageId);
            
            if (success) {
                response.put("success", true);
                response.put("message", "이미지가 삭제되었습니다.");
                log.info("✅ 이미지 삭제 API 성공 - imageId: {}", imageId);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "이미지 삭제에 실패했습니다.");
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            log.error("❌ 이미지 삭제 API 오류 - imageId: {}", imageId, e);
            response.put("success", false);
            response.put("message", "서버 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * 메인 이미지 설정 API
     */
    @PostMapping("/{imageId}/set-main")
    public ResponseEntity<Map<String, Object>> setMainImage(@PathVariable Long imageId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("⭐ 메인 이미지 설정 API 요청 - imageId: {}", imageId);
            
            // 이미지 정보를 먼저 조회하여 facilityId를 얻음
            FacilityImageDTO imageInfo = facilityImageService.getImageById(imageId);
            if (imageInfo == null) {
                response.put("success", false);
                response.put("message", "이미지를 찾을 수 없습니다.");
                return ResponseEntity.badRequest().body(response);
            }
            
            boolean success = facilityImageService.setMainImage(imageInfo.getFacilityId(), imageId);
            
            if (success) {
                response.put("success", true);
                response.put("message", "메인 이미지가 설정되었습니다.");
                log.info("✅ 메인 이미지 설정 API 성공 - imageId: {}", imageId);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "메인 이미지 설정에 실패했습니다.");
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            log.error("❌ 메인 이미지 설정 API 오류 - imageId: {}", imageId, e);
            response.put("success", false);
            response.put("message", "서버 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}