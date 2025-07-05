// facility-edit.js

// 시설 주소 검색 함수
function searchFacilityAddress() {
    new daum.Postcode({
        oncomplete: function(data) {
            let fullAddr = data.roadAddress || data.jibunAddress;
            
            // 주소 필드 업데이트
            document.getElementById('facilityAddress').value = fullAddr;
            
            // 지도에 위치 표시
            updateMapAndCoordinates(fullAddr);
        }
    }).open();
}

// 지도 업데이트 및 좌표 설정 함수
function updateMapAndCoordinates(address) {
    const geocoder = new kakao.maps.services.Geocoder();
    
    geocoder.addressSearch(address, function(result, status) {
        if (status === kakao.maps.services.Status.OK) {
            const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
            
            // 좌표를 히든 필드에 저장
            document.getElementById('latitude').value = result[0].y;
            document.getElementById('longitude').value = result[0].x;
            
            // 지도 컨테이너 표시
            const mapContainer = document.getElementById('mapPreviewContainer');
            mapContainer.style.display = 'block';
            
            // 지도 초기화
            const mapOption = {
                center: coords,
                level: 3
            };
            
            const map = new kakao.maps.Map(document.getElementById('previewMap'), mapOption);
            
            // 마커 추가
            const marker = new kakao.maps.Marker({
                position: coords
            });
            marker.setMap(map);
            
            // 인포윈도우 추가
            const infowindow = new kakao.maps.InfoWindow({
                content: '<div style="width:150px;text-align:center;padding:6px 0;">선택된 위치</div>'
            });
            infowindow.open(map, marker);
        }
    });
}

// 운영시간 라디오 버튼 처리
function handleOperatingHours() {
    const radio24 = document.getElementById('operating24');
    const radioCustom = document.getElementById('operatingCustom');
    const customInput = document.getElementById('customOperatingHours');
    const hiddenInput = document.getElementById('operatingHours');
    
    function updateOperatingHours() {
        if (radio24.checked) {
            customInput.style.display = 'none';
            hiddenInput.value = '24시간';
        } else if (radioCustom.checked) {
            customInput.style.display = 'block';
            hiddenInput.value = customInput.value || '';
        }
    }
    
    radio24.addEventListener('change', updateOperatingHours);
    radioCustom.addEventListener('change', updateOperatingHours);
    customInput.addEventListener('input', function() {
        if (radioCustom.checked) {
            hiddenInput.value = this.value;
        }
    });
    
    // 초기 상태 설정
    updateOperatingHours();
}

// 전화번호 포맷팅
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    let formattedValue = '';
    
    if (value.startsWith('02')) {
        // 서울 지역번호
        if (value.length <= 2) {
            formattedValue = value;
        } else if (value.length <= 6) {
            formattedValue = value.slice(0, 2) + '-' + value.slice(2);
        } else if (value.length <= 10) {
            formattedValue = value.slice(0, 2) + '-' + value.slice(2, 6) + '-' + value.slice(6);
        } else {
            formattedValue = value.slice(0, 2) + '-' + value.slice(2, 6) + '-' + value.slice(6, 10);
        }
    } else if (value.startsWith('01')) {
        // 휴대폰 번호
        if (value.length <= 3) {
            formattedValue = value;
        } else if (value.length <= 7) {
            formattedValue = value.slice(0, 3) + '-' + value.slice(3);
        } else if (value.length <= 11) {
            formattedValue = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7);
        } else {
            formattedValue = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
        }
    } else if (value.length >= 3) {
        // 기타 지역번호
        if (value.length <= 3) {
            formattedValue = value;
        } else if (value.length <= 7) {
            formattedValue = value.slice(0, 3) + '-' + value.slice(3);
        } else if (value.length <= 11) {
            formattedValue = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7);
        } else {
            formattedValue = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
        }
    } else {
        formattedValue = value;
    }
    
    input.value = formattedValue;
}

// 폼 유효성 검사
function validateForm() {
    const requiredFields = [
        { id: 'facilityName', name: '시설명' },
        { id: 'facilityType', name: '시설 유형' },
        { id: 'facilityAddress', name: '주소' },
        { id: 'phone', name: '전화번호' }
    ];
    
    for (let field of requiredFields) {
        const element = document.getElementById(field.id);
        if (!element.value.trim()) {
            alert(`${field.name}을(를) 입력해주세요.`);
            element.focus();
            return false;
        }
    }
    
    // 전화번호 패턴 검사
    const phonePattern = /^(02-\d{3,4}-\d{4}|0(3[1-3]|4[1-3]|5[1-5]|6[1-4]|70)-\d{3,4}-\d{4}|01[016-9]-\d{3,4}-\d{4})$/;
    const phone = document.getElementById('phone').value;
    if (!phonePattern.test(phone)) {
        alert('올바른 전화번호 형식이 아닙니다.');
        document.getElementById('phone').focus();
        return false;
    }
    
    return true;
}

// 페이지 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // 운영시간 처리 초기화
    handleOperatingHours();
    
    // 전화번호 입력 포맷팅
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            formatPhoneNumber(this);
        });
    }
    
    // 기존 주소가 있는 경우 지도 표시
    const existingAddress = document.getElementById('facilityAddress').value;
    if (existingAddress) {
        updateMapAndCoordinates(existingAddress);
    }
    
    // 폼 제출 시 유효성 검사
    const form = document.getElementById('facilityEditForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            if (!validateForm()) {
                e.preventDefault();
            }
        });
    }
});