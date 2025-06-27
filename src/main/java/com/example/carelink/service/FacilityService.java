package com.example.carelink.service;

import com.example.carelink.dto.FacilityDTO;
import com.example.carelink.dao.FacilityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList; // ArrayList 임포트 추가
import java.util.List;
import java.util.stream.Collectors; // Collectors 임포트 추가

/**
 * 시설 정보 비즈니스 로직 처리 서비스
 * 팀원 B 담당
 */
@Service
@RequiredArgsConstructor
public class FacilityService {

    private final FacilityMapper facilityMapper;

    /**
     * ID로 시설 정보 조회
     */
    public FacilityDTO getFacilityById(Long id) {
        // TODO: FacilityMapper를 사용하여 실제 DB에서 조회하는 로직 구현
        // 현재는 임시 데이터 반환 (DB 연동 시 제거)
        if (id == 1L) {
            FacilityDTO facility = new FacilityDTO();
            facility.setFacilityId(1L);
            // === 변경: setFacilityName -> setName ===
            facility.setName("ABC 요양원");
            // ===================================
            facility.setAddress("서울시 강남구");
            facility.setPhone("02-1234-5678");
            facility.setFacilityType("nursing_home");
            facility.setLatitude(37.566826);
            facility.setLongitude(126.9786567);
            facility.setRegion("서울");
            facility.setAverageRating(4.5);
            facility.setGradeRating(3); // 임시 데이터에 등급 추가
            return facility;
        }

        // 실제 데이터가 없을 경우 임시 DTO 반환 (개발 편의를 위해)
        // TODO: 실제 서비스에서는 null 또는 예외를 던지는 것이 일반적
        FacilityDTO facility = new FacilityDTO();
        facility.setFacilityId(id);
        // === 변경: setFacilityName -> setName ===
        facility.setName("시설 정보를 불러오는 중..."); // 예시
        // ===================================
        facility.setAddress("주소 정보 없음");
        facility.setPhone("연락처 없음");
        facility.setFacilityType("알 수 없음");
        facility.setLatitude(37.566826); // 기본 위치
        facility.setLongitude(126.9786567); // 기본 위치
        facility.setRegion("알 수 없음");
        facility.setAverageRating(0.0);
        facility.setGradeRating(0);
        return facility;
    }

    /**
     * 시설 검색 (이름, 지역, 유형, 등급, 지도 경계 필터 적용)
     */
    public List<FacilityDTO> searchFacilities(FacilityDTO searchDTO) {
        // TODO: FacilityMapper를 사용하여 실제 DB에서 검색하는 로직 구현
        // 현재는 임시 데이터 필터링 (DB 연동 시 제거)
        // 맵퍼를 통해 검색을 수행하도록 로직 변경 필요

        // 임시 데이터 생성 (실제 DB 연동 시 이 부분 제거)
        List<FacilityDTO> allFacilities = new ArrayList<>();

        FacilityDTO f1 = new FacilityDTO();
        f1.setFacilityId(1L);
        // === 변경: setFacilityName -> setName ===
        f1.setName("행복 요양원");
        // ===================================
        f1.setAddress("서울시 강남구 역삼동 123");
        f1.setPhone("02-1111-2222");
        f1.setFacilityType("nursing_home");
        f1.setLatitude(37.500913); // 강남구 역삼동 근처
        f1.setLongitude(127.037149);
        f1.setRegion("서울");
        f1.setAverageRating(4.8);
        f1.setGradeRating(1);
        allFacilities.add(f1);

        FacilityDTO f2 = new FacilityDTO();
        f2.setFacilityId(2L);
        // === 변경: setFacilityName -> setName ===
        f2.setName("건강 주간보호센터");
        // ===================================
        f2.setAddress("부산시 해운대구 센텀시티");
        f2.setPhone("051-3333-4444");
        f2.setFacilityType("day_care");
        f2.setLatitude(35.169188); // 부산 해운대구
        f2.setLongitude(129.132800);
        f2.setRegion("부산");
        f2.setAverageRating(4.2);
        f2.setGradeRating(2);
        allFacilities.add(f2);

        FacilityDTO f3 = new FacilityDTO();
        f3.setFacilityId(3L);
        // === 변경: setFacilityName -> setName ===
        f3.setName("희망 재가센터");
        // ===================================
        f3.setAddress("경기도 수원시 팔달구");
        f3.setPhone("031-5555-6666");
        f3.setFacilityType("home_care");
        f3.setLatitude(37.283897); // 수원시 팔달구
        f3.setLongitude(127.009121);
        f3.setRegion("경기");
        f3.setAverageRating(3.9);
        f3.setGradeRating(3);
        allFacilities.add(f3);

        // ... (더 많은 임시 데이터를 여기에 추가할 수 있습니다)
        // 예를 들어: f4, f5 등

        // 필터링 로직 (DB 연동 시 이 로직은 Mapper로 이동)
        return allFacilities.stream()
                .filter(f -> {
                    boolean matches = true;

                    // 시설명 필터
                    if (searchDTO.getName() != null && !searchDTO.getName().isEmpty()) {
                        matches = matches && f.getName().contains(searchDTO.getName());
                    }
                    // 지역 필터
                    if (searchDTO.getRegion() != null && !searchDTO.getRegion().isEmpty()) {
                        matches = matches && f.getRegion().equals(searchDTO.getRegion());
                    }
                    // 시설 유형 필터
                    if (searchDTO.getFacilityType() != null && !searchDTO.getFacilityType().isEmpty()) {
                        matches = matches && f.getFacilityType().equals(searchDTO.getFacilityType());
                    }
                    // 등급 필터
                    if (searchDTO.getGradeRating() != null && searchDTO.getGradeRating() > 0) {
                        matches = matches && f.getGradeRating() <= searchDTO.getGradeRating();
                    }

                    // 지도 경계 필터 (latitude, longitude 포함 여부)
                    if (searchDTO.getSwLat() != null && searchDTO.getSwLng() != null &&
                            searchDTO.getNeLat() != null && searchDTO.getNeLng() != null) {

                        double facilityLat = f.getLatitude();
                        double facilityLng = f.getLongitude();

                        matches = matches &&
                                (facilityLat >= searchDTO.getSwLat() && facilityLat <= searchDTO.getNeLat()) &&
                                (facilityLng >= searchDTO.getSwLng() && facilityLng <= searchDTO.getNeLng());
                    }

                    return matches;
                })
                .collect(Collectors.toList());
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
    public List<FacilityDTO> getAllActiveFacilities() {
        try {
            // TODO: 실제로는 facilityMapper.getAllActiveFacilities() 호출
            // 현재는 임시 데이터 반환
            List<FacilityDTO> facilities = new ArrayList<>();

            FacilityDTO f1 = new FacilityDTO();
            f1.setFacilityId(1L);
            f1.setName("서울 행복요양원");
            f1.setAddress("서울시 강남구 테헤란로 123");
            f1.setFacilityType("NURSING_HOME");
            facilities.add(f1);

            FacilityDTO f2 = new FacilityDTO();
            f2.setFacilityId(2L);
            f2.setName("부산 바다뷰 실버타운");
            f2.setAddress("부산시 해운대구 센텀중앙로 79");
            f2.setFacilityType("NURSING_HOME");
            facilities.add(f2);

            FacilityDTO f3 = new FacilityDTO();
            f3.setFacilityId(3L);
            f3.setName("대전 건강 데이케어센터");
            f3.setAddress("대전시 유성구 과학로 123");
            f3.setFacilityType("DAY_CARE");
            facilities.add(f3);

            FacilityDTO f4 = new FacilityDTO();
            f4.setFacilityId(4L);
            f4.setName("인천 평안 요양병원");
            f4.setAddress("인천시 남동구 구월동 1234");
            f4.setFacilityType("HOSPITAL");
            facilities.add(f4);

            FacilityDTO f5 = new FacilityDTO();
            f5.setFacilityId(5L);
            f5.setName("경기 사랑 재가센터");
            f5.setAddress("경기도 수원시 팔달구 중부대로 123");
            f5.setFacilityType("DAY_CARE");
            facilities.add(f5);

            return facilities;
        } catch (Exception e) {
            // 에러 시 빈 리스트 반환
            return new ArrayList<>();
        }
    }
}