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

// ===============================
// 주소 검색 관련 함수들
// ===============================

/**
 * 카카오 우편번호 서비스를 이용한 주소 검색 팝업을 띄우는 함수
 * @param {string} addressInputId - 주소를 입력받을 input 요소의 ID
 * @param {string} detailAddressInputId - 상세주소를 입력받을 input 요소의 ID (선택사항)
 * @param {function} callback - 주소 선택 완료 후 실행될 콜백 함수 (선택사항)
 */
function openAddressSearch(addressInputId, detailAddressInputId = null, callback = null) {
    new daum.Postcode({
        oncomplete: function(data) {
            // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분.
            
            // 각 주소의 노출 규칙에 따라 주소를 조합한다.
            let addr = ''; // 주소 변수
            let extraAddr = ''; // 참고항목 변수

            // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
            if (data.userSelectedType === 'R') { // 사용자가 도로명 주소를 선택했을 경우
                addr = data.roadAddress;
            } else { // 사용자가 지번 주소를 선택했을 경우(J)
                addr = data.jibunAddress;
            }

            // 사용자가 선택한 주소가 도로명 타입일때 참고항목을 조합한다.
            if(data.userSelectedType === 'R'){
                // 법정동명이 있을 경우 추가한다. (법정리는 제외)
                // 법정동의 경우 마지막 문자가 "동/로/가"로 끝난다.
                if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
                    extraAddr += data.bname;
                }
                // 건물명이 있고, 공동주택일 경우 추가한다.
                if(data.buildingName !== '' && data.apartment === 'Y'){
                    extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
                }
                // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
                if(extraAddr !== ''){
                    extraAddr = ' (' + extraAddr + ')';
                }
            }

            // 우편번호와 주소 정보를 해당 필드에 넣는다.
            const addressInput = document.getElementById(addressInputId);
            if (addressInput) {
                addressInput.value = addr + extraAddr;
            }

            // 상세주소 입력란이 있으면 포커스를 이동한다.
            if (detailAddressInputId) {
                const detailAddressInput = document.getElementById(detailAddressInputId);
                if (detailAddressInput) {
                    detailAddressInput.focus();
                }
            }

            // 주소로부터 위도/경도를 가져와서 콜백 함수 실행
            if (callback && typeof callback === 'function') {
                getCoordinatesFromAddress(addr, callback);
            }

            console.log('주소 검색 완료:', {
                zonecode: data.zonecode,
                address: addr + extraAddr,
                roadAddress: data.roadAddress,
                jibunAddress: data.jibunAddress
            });
        }
    }).open();
}

/**
 * 주소를 이용해서 위도/경도를 가져오는 함수
 * @param {string} address - 검색할 주소
 * @param {function} callback - 좌표를 받을 콜백 함수 (latitude, longitude를 매개변수로 받음)
 */
function getCoordinatesFromAddress(address, callback) {
    // 주소-좌표 변환 객체를 생성합니다
    const geocoder = new kakao.maps.services.Geocoder();

    // 주소로 좌표를 검색합니다
    geocoder.addressSearch(address, function(result, status) {
        // 정상적으로 검색이 완료됐으면
        if (status === kakao.maps.services.Status.OK) {
            const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
            
            console.log('주소로부터 좌표 변환 성공:', {
                address: address,
                latitude: result[0].y,
                longitude: result[0].x
            });

            // 콜백 함수에 위도/경도 전달
            if (callback && typeof callback === 'function') {
                callback(parseFloat(result[0].y), parseFloat(result[0].x));
            }
        } else {
            console.error('주소로부터 좌표 변환 실패:', status);
            alert('주소로부터 좌표를 가져올 수 없습니다.');
        }
    });
}

/**
 * 회원가입 페이지에서 시설 주소 검색에 사용되는 함수
 * 주소 선택 시 자동으로 위도/경도를 히든 필드에 설정
 */
function searchFacilityAddress() {
    openAddressSearch('facilityAddress', 'detailAddress', function(latitude, longitude) {
        // 위도/경도를 히든 필드에 설정
        const latitudeInput = document.getElementById('latitude');
        const longitudeInput = document.getElementById('longitude');
        
        if (latitudeInput) {
            latitudeInput.value = latitude;
        }
        if (longitudeInput) {
            longitudeInput.value = longitude;
        }
        
        console.log('시설 위치 좌표 설정:', { latitude, longitude });
        
        // 미리보기 지도 컨테이너 표시
        const mapPreviewContainer = document.getElementById('mapPreviewContainer');
        if (mapPreviewContainer) {
            mapPreviewContainer.style.display = 'block';
        }
        
        // 미리보기 지도가 있다면 해당 위치로 이동
        updatePreviewMap(latitude, longitude);
    });
}

/**
 * 주소 검색 결과를 미리보기 지도에 표시하는 함수
 * @param {number} latitude - 위도
 * @param {number} longitude - 경도
 */
function updatePreviewMap(latitude, longitude) {
    const previewMapContainer = document.getElementById('previewMap');
    if (!previewMapContainer) return;

    // 미리보기 지도 생성 또는 업데이트
    const coords = new kakao.maps.LatLng(latitude, longitude);
    
    if (!window.previewMap) {
        // 지도가 없으면 새로 생성
        const mapOption = {
            center: coords,
            level: 3
        };
        window.previewMap = new kakao.maps.Map(previewMapContainer, mapOption);
    } else {
        // 기존 지도가 있으면 중심 이동
        window.previewMap.setCenter(coords);
    }

    // 기존 마커 제거
    if (window.previewMarker) {
        window.previewMarker.setMap(null);
    }

    // 새 마커 추가
    window.previewMarker = new kakao.maps.Marker({
        position: coords,
        map: window.previewMap
    });

    console.log('미리보기 지도 업데이트 완료');
}