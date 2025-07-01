// kakaomap.js

// 맵 객체, 마커 배열, 인포윈도우를 전역적으로 접근 가능하도록 선언합니다.
// 'var'는 전역 스코프에 할당하고, 'let'은 모듈/스크립트 스코프에 할당됩니다.
// 여기서는 다른 인라인 스크립트에서도 `map`을 직접 참조할 수 있도록 var를 사용하거나
// 아니면 인라인 스크립트에서도 map을 `window.map`으로 참조하도록 합니다.
// 가장 간단하게, 'map' 변수가 다른 곳에서도 'map'이라는 이름으로 참조될 수 있도록 합니다.
let map = null;
let markers = []; // 지도에 표시된 마커들을 관리할 배열
let infoWindow = null; // 인포윈도우 객체

// 지도를 초기화하는 함수
function initKakaoMap(mapId) {
    const mapContainer = document.getElementById(mapId);
    if (!mapContainer) {
        console.error("Error: Map container not found with ID:", mapId);
        return;
    }

    const mapOption = {
        center: new kakao.maps.LatLng(37.566826, 126.9786567), // 기본 중심 (서울 시청)
        level: 3 // 기본 확대 레벨
    };

    // 지도를 생성합니다.
    map = new kakao.maps.Map(mapContainer, mapOption);

    // 인포윈도우 생성 (마커 클릭 시 정보 표시용)
    infoWindow = new kakao.maps.InfoWindow({zIndex:1});

    // 지도 확대/축소 컨트롤을 생성한다
    const zoomControl = new kakao.maps.ZoomControl();
    map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

    // 지도가 이동이 멈췄을 때 (idle 이벤트 발생) 시설을 다시 검색
    // 이 부분을 주석 해제하면 지도 이동 시 자동으로 검색하여 마커를 업데이트합니다.
    /*
    kakao.maps.event.addListener(map, 'idle', function() {
        console.log("Map idle event detected. Searching facilities in bounds...");
        searchFacilitiesInBounds(); // 지도 이동이 멈췄을 때 자동 검색
    });
    */

    console.log("Kakao Map initialized successfully on element:", mapId);
}

// 마커를 추가하고 인포윈도우를 설정하는 함수
function addMarker(lat, lng, title, content) {
    if (!map) {
        console.error("Error: Map object is not initialized. Cannot add marker for:", title);
        return null;
    }

    const position = new kakao.maps.LatLng(lat, lng);
    const marker = new kakao.maps.Marker({
        map: map,
        position: position,
        title: title // 마커의 타이틀, 마우스 오버 시 표시됩니다
    });

    markers.push(marker); // 마커 배열에 추가

    // 마커에 클릭 이벤트를 등록합니다
    kakao.maps.event.addListener(marker, 'click', function() {
        // 마커를 클릭하면 장소명이 인포윈도우에 표출됩니다
        infoWindow.setContent('<div style="padding:5px;font-size:12px;">' + content + '</div>');
        infoWindow.open(map, marker);
        // 클릭된 마커로 지도 중심 이동 (선택 사항)
        map.panTo(position);
    });

    return marker;
}

// 지도에 표시된 모든 마커를 제거하는 함수
function clearMarkers() {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null); // 지도에서 마커 제거
    }
    markers = []; // 마커 배열 초기화
    if (infoWindow) {
        infoWindow.close(); // 열려있는 인포윈도우 닫기
    }
    console.log("All markers cleared.");
}

// 현재 지도 영역 내 시설을 검색하는 함수 (AJAX 호출)
// 이 함수는 'map.addListener('idle', ...)' 이벤트 리스너에 연결하여 사용될 수 있습니다.
// 폼 검색과는 별개로 지도 이동에 따라 시설을 업데이트하는 기능입니다.
function searchFacilitiesInBounds() {
    if (!map) {
        console.error("Error: Map object is not initialized. Cannot search facilities in bounds.");
        return;
    }

    const bounds = map.getBounds(); // 현재 지도의 영역을 얻어옵니다
    const swLat = bounds.getSouthWest().getLat();
    const swLng = bounds.getSouthWest().getLng();
    const neLat = bounds.getNorthEast().getLat();
    const neLng = bounds.getNorthEast().getLng();

    // 현재 폼 필터 값들도 함께 전송하여 지도 영역과 필터가 결합된 검색을 수행할 수 있습니다.
    const facilityName = document.getElementById('facilityName')?.value || '';
    const region = document.getElementById('region')?.value || '';
    const facilityType = document.getElementById('facilityType')?.value || '';
    const gradeRating = document.getElementById('gradeRating')?.value || '';

    // 서버의 /facility/api/list API를 호출하여 해당 영역 내 시설 데이터를 가져옵니다.
    const url = `/facility/api/list?swLat=${swLat}&swLng=${swLng}&neLat=${neLat}&neLng=${neLng}` +
        `&facilityName=${encodeURIComponent(facilityName)}` +
        `&region=${encodeURIComponent(region)}` +
        `&facilityType=${encodeURIComponent(facilityType)}` +
        `&gradeRating=${encodeURIComponent(gradeRating)}`;

    console.log("Fetching facilities for map bounds and filters:", url);

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            clearMarkers(); // 기존 마커 지우기
            if (data && data.length > 0) {
                data.forEach(facility => {
                    addMarker(
                        parseFloat(facility.latitude),
                        parseFloat(facility.longitude),
                        facility.name,
                        `주소: ${facility.address}<br>전화: ${facility.phone}<br>평점: ${facility.averageRating}/5.0`
                    );
                });
                console.log(`Updated map with ${data.length} facilities from AJAX.`);
            } else {
                console.log("No facilities found in current map bounds with applied filters.");
            }
        })
        .catch(error => {
            console.error("Error fetching facilities for map API:", error);
        });
}

// searchWithFilters 함수는 더 이상 HTML 폼 제출에서 직접 호출되지 않으므로,
// 만약 이 함수가 다른 목적으로 (예: 특정 필터 버튼 클릭 시 지도 업데이트) 사용된다면
// 그에 맞는 로직으로 변경해야 합니다. 현재는 필요 없으므로 제거하거나 주석 처리합니다.
/*
function searchWithFilters(filters) {
    console.warn("searchWithFilters is called. This function is likely deprecated for main form submission.");
    // 만약 AJAX 방식으로 필터링된 검색 결과를 가져와 지도나 목록을 업데이트하려면 이곳에 로직 구현
    // 예: const queryString = new URLSearchParams(filters).toString();
    // fetch(`/facility/api/list?${queryString}`)
    // ...
}
*/