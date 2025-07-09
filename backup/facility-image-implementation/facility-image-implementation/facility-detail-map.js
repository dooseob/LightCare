/**
 * 시설 상세보기 페이지 지도 기능 전용 JavaScript
 * - 카카오맵 API를 사용한 시설 위치 표시
 * - 인포윈도우 및 길찾기 기능
 * - 지도 컨트롤 및 에러 처리
 */

// 전역 변수
let detailMap = null;
let detailMarker = null;
let detailInfoWindow = null;
let facilityMapData = {};

/**
 * 시설 지도 데이터 초기화
 * @param {Object} data - Thymeleaf에서 전달받은 시설 데이터
 */
function initializeFacilityMapData(data) {
    facilityMapData = data;
    console.log('🗺️ 시설 지도 데이터 초기화:', facilityMapData);
}

/**
 * 시설 상세보기 지도 초기화
 */
function initializeFacilityDetailMap() {
    console.log('🗺️ 시설 상세보기 지도 초기화 시작');
    
    const mapContainer = document.getElementById('facilityMap');
    if (!mapContainer) {
        console.error('❌ 지도 컨테이너를 찾을 수 없습니다.');
        return;
    }
    
    let mapCenter = new kakao.maps.LatLng(37.566826, 126.9786567); // 기본값: 서울 시청
    
    // 시설 위치가 있다면 해당 위치를 중심으로 설정
    if (facilityMapData.latitude && facilityMapData.longitude) {
        mapCenter = new kakao.maps.LatLng(facilityMapData.latitude, facilityMapData.longitude);
        console.log('📍 시설 위치:', facilityMapData.latitude, facilityMapData.longitude);
    } else {
        console.warn('⚠️ 시설 위치 정보가 없습니다.');
    }
    
    const mapOption = {
        center: mapCenter,
        level: 3 // 상세 페이지이므로 더 확대해서 보여줌
    };
    
    try {
        detailMap = new kakao.maps.Map(mapContainer, mapOption);
        console.log('✅ 지도 인스턴스 생성 완료');
        
        // 시설 위치에 마커 추가
        if (facilityMapData.latitude && facilityMapData.longitude) {
            addFacilityMarker();
            addMapControls();
            console.log('✅ 시설 상세보기 지도 초기화 완료');
        } else {
            showNoLocationMessage(mapContainer);
        }
    } catch (error) {
        console.error('❌ 지도 초기화 중 오류:', error);
        showMapErrorMessage(mapContainer);
    }
}

/**
 * 시설 마커 추가
 */
function addFacilityMarker() {
    const position = new kakao.maps.LatLng(facilityMapData.latitude, facilityMapData.longitude);
    
    // 마커 생성
    detailMarker = new kakao.maps.Marker({
        position: position,
        map: detailMap
    });
    
    // 인포윈도우 생성 (개선된 디자인)
    const infoWindowContent = createInfoWindowContent();
    
    detailInfoWindow = new kakao.maps.InfoWindow({
        content: infoWindowContent,
        removable: true
    });
    
    // 마커 클릭 이벤트
    kakao.maps.event.addListener(detailMarker, 'click', function() {
        detailInfoWindow.open(detailMap, detailMarker);
    });
    
    // 초기에 인포윈도우 열기 (1초 후)
    setTimeout(() => {
        detailInfoWindow.open(detailMap, detailMarker);
    }, 1000);
    
    console.log('📍 시설 마커 및 인포윈도우 생성 완료');
}

/**
 * 인포윈도우 컨텐츠 생성
 * @returns {string} HTML 컨텐츠
 */
function createInfoWindowContent() {
    return `
        <div class="info-window p-3" style="width:320px; border-radius: 8px; font-family: 'Noto Sans KR', sans-serif;">
            <h6 class="mb-2 text-primary fw-bold">
                <i class="fas fa-building me-1"></i>${facilityMapData.name || '시설명'}
            </h6>
            <p class="mb-2 small text-dark">
                <i class="fas fa-map-marker-alt text-danger me-1"></i>
                ${facilityMapData.address || '주소 정보 없음'}
            </p>
            <div class="d-flex justify-content-between align-items-center">
                <p class="mb-0 small">
                    <i class="fas fa-phone text-success me-1"></i>
                    <a href="tel:${facilityMapData.phone || ''}" class="text-decoration-none text-success fw-medium">
                        ${facilityMapData.phone || '전화번호 없음'}
                    </a>
                </p>
                <button class="btn btn-sm btn-outline-primary" onclick="openKakaoMapRoute()">
                    <i class="fas fa-route me-1"></i>길찾기
                </button>
            </div>
            <div class="mt-2 text-center">
                <small class="text-muted">
                    <i class="fas fa-info-circle me-1"></i>
                    정확한 위치를 확인하세요
                </small>
            </div>
        </div>
    `;
}

/**
 * 지도 컨트롤 추가
 */
function addMapControls() {
    // 지도 타입 컨트롤 추가
    const mapTypeControl = new kakao.maps.MapTypeControl();
    detailMap.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);
    
    // 줌 컨트롤 추가
    const zoomControl = new kakao.maps.ZoomControl();
    detailMap.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
    
    console.log('🎛️ 지도 컨트롤 추가 완료');
}

/**
 * 카카오맵 길찾기 열기
 */
function openKakaoMapRoute() {
    if (facilityMapData.latitude && facilityMapData.longitude && facilityMapData.name) {
        const url = `https://map.kakao.com/link/to/${encodeURIComponent(facilityMapData.name)},${facilityMapData.latitude},${facilityMapData.longitude}`;
        window.open(url, '_blank');
        console.log('🛣️ 카카오맵 길찾기 열기:', url);
    } else {
        alert('길찾기 정보가 부족합니다.');
    }
}

/**
 * 위치 정보 없음 메시지 표시
 * @param {HTMLElement} container - 지도 컨테이너
 */
function showNoLocationMessage(container) {
    container.innerHTML = `
        <div class="d-flex align-items-center justify-content-center h-100 text-muted bg-light rounded" style="height: 400px;">
            <div class="text-center">
                <i class="fas fa-exclamation-triangle fa-3x mb-3 text-warning"></i>
                <h5 class="mb-2">위치 정보 없음</h5>
                <p class="mb-0">이 시설의 위치 정보가 등록되지 않았습니다.</p>
                <small class="text-muted mt-2 d-block">시설 관리자에게 문의하시기 바랍니다.</small>
            </div>
        </div>
    `;
    console.log('⚠️ 위치 정보 없음 메시지 표시');
}

/**
 * 지도 로드 실패 메시지 표시
 * @param {HTMLElement} container - 지도 컨테이너
 */
function showMapErrorMessage(container) {
    container.innerHTML = `
        <div class="d-flex align-items-center justify-content-center h-100 text-muted bg-light rounded" style="height: 400px;">
            <div class="text-center">
                <i class="fas fa-exclamation-triangle fa-3x mb-3 text-danger"></i>
                <h5 class="mb-2">지도 로드 실패</h5>
                <p class="mb-0">지도를 불러올 수 없습니다.</p>
                <button class="btn btn-outline-primary btn-sm mt-2" onclick="location.reload()">
                    <i class="fas fa-refresh me-1"></i>새로고침
                </button>
            </div>
        </div>
    `;
    console.log('❌ 지도 로드 실패 메시지 표시');
}

/**
 * 지도 크기 조정 (창 크기 변경 시)
 */
function resizeFacilityMap() {
    if (detailMap) {
        detailMap.relayout();
        console.log('📐 지도 크기 조정 완료');
    }
}

// 창 크기 변경 시 지도 크기 조정
window.addEventListener('resize', resizeFacilityMap);