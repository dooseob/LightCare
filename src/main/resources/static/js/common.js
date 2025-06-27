/**
 * CareLink 공통 JavaScript 함수
 * 4인 팀 프로젝트 전용
 */

// 페이지 로드 완료 시 실행
$(document).ready(function() {
    // 공통 기능 초기화
    initCommonFeatures();
    
    // 자동 알림 숨김
    autoHideAlerts();
    
    // 폼 유효성 검사 초기화
    initFormValidation();
    
    // 파일 업로드 기능 초기화
    initFileUpload();
    
    // 로딩 상태 관리
    initLoadingState();
    
    // 게시글 삭제 후 목록 새로고침 체크
    refreshBoardList();
});

/**
 * 공통 기능 초기화
 */
function initCommonFeatures() {
    // 툴팁 초기화
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // 팝오버 초기화
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
}

/**
 * 자동 알림 메시지 숨김
 */
function autoHideAlerts() {
    $('.alert').each(function() {
        var alert = $(this);
        if (!alert.hasClass('alert-permanent')) {
            setTimeout(function() {
                alert.fadeOut('slow');
            }, 5000); // 5초 후 자동 숨김
        }
    });
}

/**
 * 폼 유효성 검사 초기화
 */
function initFormValidation() {
    // Bootstrap 유효성 검사 클래스 추가
    $('form').each(function() {
        $(this).addClass('needs-validation');
    });
    
    // 실시간 유효성 검사
    $('.form-control').on('blur', function() {
        validateField($(this));
    });
    
    // 폼 제출 시 유효성 검사
    $('form').on('submit', function(e) {
        var form = $(this);
        var isValid = true;
        
        form.find('.form-control[required]').each(function() {
            if (!validateField($(this))) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        form.addClass('was-validated');
    });
}

/**
 * 개별 필드 유효성 검사
 */
function validateField(field) {
    var value = field.val().trim();
    var isValid = true;
    var errorMessage = '';
    
    // 필수 입력 검사
    if (field.prop('required') && value === '') {
        isValid = false;
        errorMessage = '필수 입력 항목입니다.';
    }
    
    // 이메일 형식 검사
    if (field.attr('type') === 'email' && value !== '') {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = '올바른 이메일 형식이 아닙니다.';
        }
    }
    
    // 전화번호 형식 검사
    if (field.hasClass('phone-field') && value !== '') {
        var phoneRegex = /^01[016789]-?\d{3,4}-?\d{4}$/;
        if (!phoneRegex.test(value)) {
            isValid = false;
            errorMessage = '올바른 전화번호 형식이 아닙니다.';
        }
    }
    
    // 결과 표시
    if (isValid) {
        field.removeClass('is-invalid').addClass('is-valid');
        field.siblings('.invalid-feedback').hide();
    } else {
        field.removeClass('is-valid').addClass('is-invalid');
        field.siblings('.invalid-feedback').text(errorMessage).show();
    }
    
    return isValid;
}

/**
 * 파일 업로드 기능 초기화
 */
function initFileUpload() {
    $('.file-upload-area').on('dragover', function(e) {
        e.preventDefault();
        $(this).addClass('dragover');
    });
    
    $('.file-upload-area').on('dragleave', function(e) {
        e.preventDefault();
        $(this).removeClass('dragover');
    });
    
    $('.file-upload-area').on('drop', function(e) {
        e.preventDefault();
        $(this).removeClass('dragover');
        
        var files = e.originalEvent.dataTransfer.files;
        handleFileSelect(files, $(this));
    });
    
    $('.file-upload-area input[type="file"]').on('change', function() {
        var files = this.files;
        handleFileSelect(files, $(this).closest('.file-upload-area'));
    });
}

/**
 * 파일 선택 처리
 */
function handleFileSelect(files, uploadArea) {
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        
        // 파일 크기 검사 (10MB 제한)
        if (file.size > 10 * 1024 * 1024) {
            showAlert('파일 크기는 10MB를 초과할 수 없습니다.', 'warning');
            continue;
        }
        
        // 파일 미리보기 (이미지인 경우)
        if (file.type.startsWith('image/')) {
            var reader = new FileReader();
            reader.onload = function(e) {
                var preview = $('<img>').attr('src', e.target.result)
                    .css({'max-width': '200px', 'max-height': '200px', 'margin': '10px'});
                uploadArea.find('.file-preview').html(preview);
            };
            reader.readAsDataURL(file);
        }
        
        // 파일 정보 표시
        var fileInfo = $('<div class="file-info mt-2"></div>')
            .html('<i class="fas fa-file me-2"></i>' + file.name + ' (' + formatFileSize(file.size) + ')');
        uploadArea.find('.file-list').append(fileInfo);
    }
}

/**
 * 로딩 상태 관리 초기화
 */
function initLoadingState() {
    // 폼 제출 시 로딩 상태 표시
    $('form').on('submit', function() {
        var submitBtn = $(this).find('button[type="submit"]');
        var originalText = submitBtn.html();
        
        submitBtn.prop('disabled', true)
            .html('<span class="loading-spinner me-2"></span>처리중...');
        
        // 5초 후 원래 상태로 복원 (타임아웃 방지)
        setTimeout(function() {
            submitBtn.prop('disabled', false).html(originalText);
        }, 5000);
    });
    
    // AJAX 요청 시 로딩 상태 표시
    $(document).ajaxStart(function() {
        showLoading();
    }).ajaxStop(function() {
        hideLoading();
    });
}

/**
 * 페이지 로딩 표시
 */
function showLoading() {
    if ($('#loadingOverlay').length === 0) {
        var overlay = $('<div id="loadingOverlay" class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style="background-color: rgba(0,0,0,0.5); z-index: 9999;"></div>');
        var spinner = $('<div class="text-center text-white"></div>')
            .html('<div class="spinner-border mb-3" role="status"></div><br>로딩중...');
        overlay.append(spinner);
        $('body').append(overlay);
    }
}

/**
 * 페이지 로딩 숨김
 */
function hideLoading() {
    $('#loadingOverlay').remove();
}

/**
 * 커스텀 알림 표시
 */
function showAlert(message, type = 'info', autoHide = true) {
    var alertClass = 'alert-' + type;
    var iconClass = {
        'success': 'fa-check-circle',
        'danger': 'fa-exclamation-triangle',
        'warning': 'fa-exclamation-circle',
        'info': 'fa-info-circle'
    }[type] || 'fa-info-circle';
    
    var alert = $('<div class="alert alert-dismissible fade show" role="alert"></div>')
        .addClass(alertClass)
        .html('<i class="fas ' + iconClass + ' me-2"></i>' + message + 
              '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>');
    
    $('.container').first().prepend(alert);
    
    if (autoHide) {
        setTimeout(function() {
            alert.fadeOut('slow', function() {
                $(this).remove();
            });
        }, 5000);
    }
}

/**
 * 확인 다이얼로그 표시
 */
function showConfirm(message, callback) {
    if (confirm(message)) {
        if (typeof callback === 'function') {
            callback();
        }
        return true;
    }
    return false;
}

/**
 * AJAX 요청 공통 함수
 */
function ajaxRequest(url, method, data, successCallback, errorCallback) {
    $.ajax({
        url: url,
        method: method || 'GET',
        data: data,
        dataType: 'json',
        success: function(response) {
            if (typeof successCallback === 'function') {
                successCallback(response);
            }
        },
        error: function(xhr, status, error) {
            console.error('AJAX 요청 실패:', error);
            showAlert('요청 처리 중 오류가 발생했습니다.', 'danger');
            
            if (typeof errorCallback === 'function') {
                errorCallback(xhr, status, error);
            }
        }
    });
}

/**
 * 페이지네이션 처리
 */
function handlePagination(currentPage, totalPages, baseUrl) {
    var pagination = $('.pagination');
    pagination.empty();
    
    // 이전 버튼
    if (currentPage > 1) {
        pagination.append('<li class="page-item"><a class="page-link" href="' + baseUrl + '?page=' + (currentPage - 1) + '">&laquo;</a></li>');
    }
    
    // 페이지 번호
    var startPage = Math.max(1, currentPage - 2);
    var endPage = Math.min(totalPages, currentPage + 2);
    
    for (var i = startPage; i <= endPage; i++) {
        var activeClass = i === currentPage ? ' active' : '';
        pagination.append('<li class="page-item' + activeClass + '"><a class="page-link" href="' + baseUrl + '?page=' + i + '">' + i + '</a></li>');
    }
    
    // 다음 버튼
    if (currentPage < totalPages) {
        pagination.append('<li class="page-item"><a class="page-link" href="' + baseUrl + '?page=' + (currentPage + 1) + '">&raquo;</a></li>');
    }
}

/**
 * 파일 크기 포맷팅
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    var k = 1024;
    var sizes = ['Bytes', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 날짜 포맷팅
 */
function formatDate(date, format = 'YYYY-MM-DD') {
    if (!date) return '';
    
    var d = new Date(date);
    var year = d.getFullYear();
    var month = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    var hour = String(d.getHours()).padStart(2, '0');
    var minute = String(d.getMinutes()).padStart(2, '0');
    
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hour)
        .replace('mm', minute);
}

/**
 * 문자열 길이 제한
 */
function truncateString(str, length) {
    if (!str) return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
}

/**
 * 숫자 포맷팅 (콤마 추가)
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * URL 파라미터 가져오기
 */
function getUrlParameter(name) {
    var url = new URL(window.location.href);
    return url.searchParams.get(name);
}

/**
 * 페이지 새로고침 강제 (캐시 무효화)
 */
function forceRefresh() {
    // 브라우저 캐시를 무시하고 강제 새로고침
    window.location.reload(true);
}

/**
 * 게시글 삭제 후 목록 새로고침
 */
function refreshBoardList() {
    // refresh 파라미터가 있으면 캐시 무효화 후 URL에서 제거
    var refreshParam = getUrlParameter('refresh');
    if (refreshParam) {
        // URL에서 refresh 파라미터 제거
        var url = new URL(window.location.href);
        url.searchParams.delete('refresh');
        window.history.replaceState({}, document.title, url.pathname + url.search);
        
        // 페이지 강제 새로고침
        setTimeout(function() {
            forceRefresh();
        }, 100);
    }
}

/**
 * 로컬 스토리지 관리
 */
var Storage = {
    set: function(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    get: function(key) {
        var item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    },
    remove: function(key) {
        localStorage.removeItem(key);
    },
    clear: function() {
        localStorage.clear();
    }
}; 