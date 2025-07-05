package com.example.carelink.service;

import com.example.carelink.dao.FacilityMapper;
import com.example.carelink.dto.FacilityDTO;
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
public class FacilityService {

    private final FacilityMapper facilityMapper;
    private static final Logger log = LoggerFactory.getLogger(FacilityService.class);

    @Autowired
    public FacilityService(FacilityMapper facilityMapper) {
        this.facilityMapper = facilityMapper;
    }

    /**
     * 시설 검색 서비스
     */
    public List<FacilityDTO> searchFacilities(FacilityDTO searchDTO) {
        log.info("시설 검색 서비스 호출 - facilityName: {}, address: {}, facilityType: {}", 
                searchDTO.getFacilityName(), searchDTO.getAddress(), searchDTO.getFacilityType());
        
        List<FacilityDTO> results = facilityMapper.searchFacilities(searchDTO);
        log.info("시설 검색 결과 - 총 {}개 시설 발견", results.size());
        
        return results;
    }

    /**
     * 시설 상세 정보 조회 서비스
     */
    @Transactional(readOnly = true)
    public FacilityDTO getFacilityById(Long facilityId) {
        if (facilityId == null) {
            log.warn("시설 ID가 null입니다.");
            return null;
        }
        
        log.info("시설 상세 정보 조회 시작 - facilityId: {}", facilityId);
        FacilityDTO facility = facilityMapper.getFacilityById(facilityId);
        
        if (facility == null) {
            log.warn("시설을 찾을 수 없음 - facilityId: {}", facilityId);
            return null;
        }
        
        log.info("시설 상세 정보 조회 완료 - facilityName: {}, status: {}", 
                facility.getFacilityName(), facility.getStatus());
        return facility;
    }

    /**
     * 전체 시설 목록 조회 서비스
     */
    public List<FacilityDTO> getAllFacilities() {
        try {
            log.info("전체 시설 목록 조회 시작");
            List<FacilityDTO> facilities = facilityMapper.getAllFacilities();
            log.info("전체 시설 목록 조회 완료 - 조회된 건수: {}", facilities.size());
            return facilities;
        } catch (Exception e) {
            log.error("전체 시설 목록 조회 중 오류 발생", e);
            throw new RuntimeException("시설 목록을 불러오는 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 시설 등록 서비스
     */
    public int insertFacility(FacilityDTO facilityDTO) {
        return facilityMapper.insertFacility(facilityDTO);
    }

    /**
     * 시설 정보 수정 서비스
     */
    public int updateFacility(FacilityDTO facilityDTO) {
        return facilityMapper.updateFacility(facilityDTO);
    }

    /**
     * 시설 삭제 서비스
     */
    public int deleteFacility(Long facilityId) {
        return facilityMapper.deleteFacility(facilityId);
    }

    /**
     * 지역별 시설 개수 조회 서비스
     */
    public int countFacilitiesByRegion(String region) {
        return facilityMapper.countFacilitiesByRegion(region);
    }

    /**
     * 전체 시설 수 조회 (통계용)
     */
    public int getFacilityCount() {
        try {
            return facilityMapper.getFacilityCount();
        } catch (Exception e) {
            // 에러 시 임시 데이터 개수 반환 (개발 초기 에러 방지)
            return 3; // 임시로 생성한 시설 수
        }
    }

    /**
     * 활성화된 모든 시설 목록 조회 (리뷰 작성용)
     */
    @Transactional(readOnly = true)
    public List<FacilityDTO> getAllActiveFacilities() {
        log.info("활성화된 시설 목록 조회 시작");
        List<FacilityDTO> facilities = facilityMapper.getAllActiveFacilities();
        
        if (!facilities.isEmpty()) {
            FacilityDTO firstFacility = facilities.get(0);
            log.info("첫 번째 시설 정보 - ID: {}, 이름: {}, 승인상태: {}", 
                    firstFacility.getFacilityId(), 
                    firstFacility.getFacilityName(),
                    firstFacility.getStatus());
        }
        
        log.info("활성화된 시설 목록 조회 완료 - 조회된 건수: {}", facilities.size());
        return facilities;
    }

    /**
     * 시설 상태 검증
     */
    public boolean validateFacilityStatus(FacilityDTO facility) {
        if (facility == null) {
            log.warn("시설 정보가 null입니다.");
            return false;
        }
        
        if (facility.isDeletedStatus()) {
            log.warn("삭제된 시설입니다 - facilityId: {}", facility.getFacilityId());
            return false;
        }
        
        if (facility.isPendingStatus()) {
            log.warn("승인되지 않은 시설입니다 - facilityId: {}", facility.getFacilityId());
            return false;
        }
        
        return true;
    }

    /**
     * 회원 ID로 시설 목록 조회
     */
    public List<FacilityDTO> getFacilitiesByMemberId(Long memberId) {
        try {
            log.info("회원의 시설 목록 조회 시작 - memberId: {}", memberId);
            List<FacilityDTO> facilities = facilityMapper.getFacilitiesByMemberId(memberId);
            
            if (!facilities.isEmpty()) {
                log.info("회원의 시설 목록 조회 완료 - memberId: {}, 시설 수: {}", 
                        memberId, facilities.size());
            } else {
                log.info("회원의 시설 정보 없음 - memberId: {}", memberId);
            }
            
            return facilities;
        } catch (Exception e) {
            log.error("회원의 시설 목록 조회 중 오류 발생 - memberId: {}", memberId, e);
            throw new RuntimeException("시설 정보 조회에 실패했습니다.", e);
        }
    }

    /**
     * 회원 ID로 시설 조회 (첫 번째 시설 반환)
     */
    public FacilityDTO getFacilityByMemberId(Long memberId) {
        try {
            log.info("회원의 첫 번째 시설 정보 조회 시작 - memberId: {}", memberId);
            List<FacilityDTO> facilities = facilityMapper.getFacilitiesByMemberId(memberId);
            
            if (!facilities.isEmpty()) {
                FacilityDTO facility = facilities.get(0);
                log.info("회원의 첫 번째 시설 정보 조회 완료 - memberId: {}, facilityId: {}, facilityName: {}", 
                        memberId, facility.getFacilityId(), facility.getFacilityName());
                return facility;
            } else {
                log.info("회원의 시설 정보 없음 - memberId: {}", memberId);
                return null;
            }
        } catch (Exception e) {
            log.error("회원의 시설 정보 조회 중 오류 발생 - memberId: {}", memberId, e);
            throw new RuntimeException("시설 정보 조회에 실패했습니다.", e);
        }
    }

    /**
     * 시설 정보 수정 (파일 업로드 포함)
     */
    @Transactional
    public void updateFacility(FacilityDTO facilityDTO, MultipartFile facilityImageFile) {
        try {
            log.info("시설 정보 수정 시작 - facilityId: {}, facilityName: {}", 
                    facilityDTO.getFacilityId(), facilityDTO.getFacilityName());
            
            // 시설 이미지 파일 처리
            if (facilityImageFile != null && !facilityImageFile.isEmpty()) {
                String imagePath = saveFacilityImage(facilityImageFile, facilityDTO.getFacilityId().toString());
                facilityDTO.setFacilityImage(imagePath);
                log.info("시설 이미지 업데이트 - facilityId: {}, imagePath: {}", 
                        facilityDTO.getFacilityId(), imagePath);
            }
            
            // 시설 정보 업데이트
            int result = facilityMapper.updateFacility(facilityDTO);
            if (result == 0) {
                throw new RuntimeException("시설 정보 수정에 실패했습니다.");
            }
            
            log.info("시설 정보 수정 완료 - facilityId: {}", facilityDTO.getFacilityId());
        } catch (Exception e) {
            log.error("시설 정보 수정 중 오류 발생 - facilityId: {}", facilityDTO.getFacilityId(), e);
            throw new RuntimeException("시설 정보 수정에 실패했습니다.", e);
        }
    }

    /**
     * 시설 이미지 저장 메서드
     */
    private String saveFacilityImage(MultipartFile file, String facilityId) {
        try {
            // 로컬 업로드 디렉토리 사용
            String uploadDir = Constants.FACILITY_UPLOAD_PATH;
            File uploadDirFile = new File(uploadDir);
            if (!uploadDirFile.exists()) {
                boolean created = uploadDirFile.mkdirs();
                log.info("업로드 디렉토리 생성: {} - {}", uploadDir, created ? "성공" : "실패");
            }
            
            // 파일명 생성 (facilityId + UUID + 원본 확장자)
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String savedFilename = "facility_" + facilityId + "_" + UUID.randomUUID().toString() + extension;
            
            // 파일 저장
            File savedFile = new File(uploadDir + savedFilename);
            file.transferTo(savedFile);
            log.info("시설 이미지 저장 완료: {}", savedFile.getAbsolutePath());
            
            // 웹 경로 반환
            return "/uploads/facility/" + savedFilename;
            
        } catch (IOException e) {
            log.error("시설 이미지 저장 중 오류 발생: facilityId={}", facilityId, e);
            throw new RuntimeException("이미지 파일 저장에 실패했습니다.", e);
        }
    }

    // ================== 관리자용 메서드들 ==================

    /**
     * 승인 상태별 시설 목록 조회 (관리자용)
     */
    @Transactional(readOnly = true)
    public List<FacilityDTO> getFacilitiesByApprovalStatus(String status) {
        try {
            log.info("승인 상태별 시설 목록 조회 - status: {}", status);
            List<FacilityDTO> facilities = facilityMapper.getFacilitiesByApprovalStatus(status);
            log.info("승인 상태별 시설 목록 조회 완료 - status: {}, count: {}", status, facilities.size());
            return facilities;
        } catch (Exception e) {
            log.error("승인 상태별 시설 목록 조회 중 오류 발생 - status: {}", status, e);
            throw new RuntimeException("시설 목록 조회에 실패했습니다.", e);
        }
    }

    /**
     * 시설 승인 상태 업데이트 (관리자용)
     */
    @Transactional
    public void updateFacilityApprovalStatus(Long facilityId, String newStatus, String reason) {
        try {
            log.info("시설 승인 상태 업데이트 - facilityId: {}, newStatus: {}, reason: {}", 
                    facilityId, newStatus, reason);
            
            int result = facilityMapper.updateFacilityApprovalStatus(facilityId, newStatus, reason);
            if (result == 0) {
                throw new RuntimeException("시설 승인 상태 업데이트에 실패했습니다.");
            }
            
            log.info("시설 승인 상태 업데이트 완료 - facilityId: {}, newStatus: {}", facilityId, newStatus);
        } catch (Exception e) {
            log.error("시설 승인 상태 업데이트 중 오류 발생 - facilityId: {}", facilityId, e);
            throw new RuntimeException("시설 승인 상태 업데이트에 실패했습니다.", e);
        }
    }

    /**
     * 승인 대기 중인 시설 수 조회
     */
    @Transactional(readOnly = true)
    public int countPendingFacilities() {
        try {
            int count = facilityMapper.countFacilitiesByStatus("PENDING");
            log.info("승인 대기 시설 수 조회 완료 - count: {}", count);
            return count;
        } catch (Exception e) {
            log.error("승인 대기 시설 수 조회 중 오류 발생", e);
            return 0;
        }
    }

    /**
     * 승인된 시설 수 조회
     */
    @Transactional(readOnly = true)
    public int countApprovedFacilities() {
        try {
            int count = facilityMapper.countFacilitiesByStatus("APPROVED");
            log.info("승인된 시설 수 조회 완료 - count: {}", count);
            return count;
        } catch (Exception e) {
            log.error("승인된 시설 수 조회 중 오류 발생", e);
            return 0;
        }
    }

    /**
     * 거부된 시설 수 조회
     */
    @Transactional(readOnly = true)
    public int countRejectedFacilities() {
        try {
            int count = facilityMapper.countFacilitiesByStatus("REJECTED");
            log.info("거부된 시설 수 조회 완료 - count: {}", count);
            return count;
        } catch (Exception e) {
            log.error("거부된 시설 수 조회 중 오류 발생", e);
            return 0;
        }
    }
}