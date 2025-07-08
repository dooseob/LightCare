/**
 * 시설 이미지 유틸리티 모듈 (Utils Module)
 * 공통 유틸리티, 헬퍼 함수들 전용 모듈
 * 
 * @version 1.0.0
 * @author LightCare Team
 * @requires FacilityImageCore
 */

(function() {
    'use strict';
    
    if (!window.FacilityImageCore) {
        throw new Error('FacilityImageCore 모듈이 필요합니다.');
    }
    
    const Core = window.FacilityImageCore;
    
    if (!window.FacilityImageSystem.Utils) {
        window.FacilityImageSystem.Utils = {};
    }
    
    // ================================================
    // 상수 정의
    // ================================================
    
    const UTILS_CONSTANTS = {
        MODULE_NAME: 'FacilityImageUtils',
        VERSION: '1.0.0'
    };
    
    // ================================================
    // 이미지 처리 유틸리티
    // ================================================
    
    const imageUtils = {
        /**
         * 이미지 크기 계산
         */
        calculateAspectRatio(width, height) {
            const gcd = this.getGCD(width, height);
            return {
                ratio: width / height,
                aspectRatio: `${width / gcd}:${height / gcd}`,
                width,
                height
            };
        },
        
        /**
         * 최대공약수 구하기
         */
        getGCD(a, b) {
            return b === 0 ? a : this.getGCD(b, a % b);
        },
        
        /**
         * 이미지 메타데이터 추출
         */
        async extractMetadata(file) {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    const metadata = {
                        filename: file.name,
                        size: file.size,
                        type: file.type,
                        width: img.width,
                        height: img.height,
                        aspectRatio: this.calculateAspectRatio(img.width, img.height),
                        lastModified: new Date(file.lastModified)
                    };
                    resolve(metadata);
                };
                img.onerror = () => resolve(null);
                img.src = URL.createObjectURL(file);
            });
        },
        
        /**
         * 이미지 압축 비율 계산
         */
        calculateCompressionRatio(originalSize, compressedSize) {
            return Math.round((1 - compressedSize / originalSize) * 100);
        }
    };
    
    // ================================================
    // 파일 처리 유틸리티
    // ================================================
    
    const fileUtils = {
        /**
         * 파일 크기 포맷팅
         */
        formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },
        
        /**
         * 파일 타입 체크
         */
        isImageFile(file) {
            return file.type.startsWith('image/');
        },
        
        /**
         * 파일 확장자 추출
         */
        getFileExtension(filename) {
            return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
        },
        
        /**
         * MIME 타입에서 확장자 추출
         */
        getExtensionFromMimeType(mimeType) {
            const extensions = {
                'image/jpeg': 'jpg',
                'image/png': 'png',
                'image/webp': 'webp',
                'image/avif': 'avif'
            };
            return extensions[mimeType] || 'jpg';
        },
        
        /**
         * Blob을 File로 변환
         */
        blobToFile(blob, filename) {
            return new File([blob], filename, { type: blob.type });
        }
    };
    
    // ================================================
    // 문자열 처리 유틸리티
    // ================================================
    
    const stringUtils = {
        /**
         * 문자열 슬러그화
         */
        slugify(text) {
            return text
                .toString()
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-')
                .replace(/[^\w\-]+/g, '')
                .replace(/\-\-+/g, '-')
                .replace(/^-+/, '')
                .replace(/-+$/, '');
        },
        
        /**
         * 한글을 영문으로 변환
         */
        koreanToEnglish(text) {
            const map = {
                'ㄱ': 'g', 'ㄴ': 'n', 'ㄷ': 'd', 'ㄹ': 'r', 'ㅁ': 'm',
                'ㅂ': 'b', 'ㅅ': 's', 'ㅇ': '', 'ㅈ': 'j', 'ㅊ': 'ch',
                'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 'h',
                'ㅏ': 'a', 'ㅓ': 'eo', 'ㅗ': 'o', 'ㅜ': 'u', 'ㅡ': 'eu', 'ㅣ': 'i'
            };
            
            return text.replace(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g, (char) => {
                return map[char] || '';
            });
        },
        
        /**
         * 텍스트 잘라내기
         */
        truncate(text, maxLength, suffix = '...') {
            if (text.length <= maxLength) return text;
            return text.slice(0, maxLength - suffix.length) + suffix;
        },
        
        /**
         * 카멜케이스 변환
         */
        toCamelCase(text) {
            return text.replace(/[-_\s]+(.)?/g, (_, char) => 
                char ? char.toUpperCase() : ''
            );
        }
    };
    
    // ================================================
    // 배열 처리 유틸리티
    // ================================================
    
    const arrayUtils = {
        /**
         * 배열 섞기
         */
        shuffle(array) {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        },
        
        /**
         * 배열 청크 분할
         */
        chunk(array, size) {
            const chunks = [];
            for (let i = 0; i < array.length; i += size) {
                chunks.push(array.slice(i, i + size));
            }
            return chunks;
        },
        
        /**
         * 중복 제거
         */
        unique(array, key = null) {
            if (key) {
                const seen = new Set();
                return array.filter(item => {
                    const keyValue = item[key];
                    if (seen.has(keyValue)) {
                        return false;
                    }
                    seen.add(keyValue);
                    return true;
                });
            }
            return [...new Set(array)];
        },
        
        /**
         * 배열에서 랜덤 선택
         */
        randomSelect(array, count = 1) {
            const shuffled = this.shuffle(array);
            return count === 1 ? shuffled[0] : shuffled.slice(0, count);
        }
    };
    
    // ================================================
    // 시간 처리 유틸리티
    // ================================================
    
    const timeUtils = {
        /**
         * 상대 시간 표시
         */
        timeAgo(date) {
            const now = new Date();
            const diff = now - new Date(date);
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(diff / 3600000);
            const days = Math.floor(diff / 86400000);
            
            if (minutes < 1) return '방금 전';
            if (minutes < 60) return `${minutes}분 전`;
            if (hours < 24) return `${hours}시간 전`;
            if (days < 30) return `${days}일 전`;
            return new Date(date).toLocaleDateString();
        },
        
        /**
         * 시간 포맷팅
         */
        formatTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            const seconds = String(d.getSeconds()).padStart(2, '0');
            
            return format
                .replace('YYYY', year)
                .replace('MM', month)
                .replace('DD', day)
                .replace('HH', hours)
                .replace('mm', minutes)
                .replace('ss', seconds);
        }
    };
    
    // ================================================
    // URL 처리 유틸리티
    // ================================================
    
    const urlUtils = {
        /**
         * URL 파라미터 추출
         */
        getUrlParams() {
            const params = new URLSearchParams(window.location.search);
            const result = {};
            for (const [key, value] of params) {
                result[key] = value;
            }
            return result;
        },
        
        /**
         * URL 파라미터 설정
         */
        setUrlParam(key, value) {
            const url = new URL(window.location);
            url.searchParams.set(key, value);
            window.history.pushState({}, '', url);
        },
        
        /**
         * 현재 URL에서 시설 ID 추출
         */
        extractFacilityId() {
            const pathParts = window.location.pathname.split('/');
            const lastPart = pathParts[pathParts.length - 1];
            return !isNaN(lastPart) && lastPart !== '' ? parseInt(lastPart) : null;
        }
    };
    
    // ================================================
    // 로컬 스토리지 유틸리티
    // ================================================
    
    const storageUtils = {
        /**
         * 로컬 스토리지에 저장
         */
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                Core.logger.error('로컬 스토리지 저장 실패:', error);
                return false;
            }
        },
        
        /**
         * 로컬 스토리지에서 가져오기
         */
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                Core.logger.error('로컬 스토리지 읽기 실패:', error);
                return defaultValue;
            }
        },
        
        /**
         * 로컬 스토리지에서 제거
         */
        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                Core.logger.error('로컬 스토리지 제거 실패:', error);
                return false;
            }
        },
        
        /**
         * 로컬 스토리지 전체 클리어
         */
        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                Core.logger.error('로컬 스토리지 클리어 실패:', error);
                return false;
            }
        }
    };
    
    // ================================================
    // 성능 측정 유틸리티
    // ================================================
    
    const performanceUtils = {
        timers: new Map(),
        
        /**
         * 타이머 시작
         */
        startTimer(name) {
            this.timers.set(name, performance.now());
        },
        
        /**
         * 타이머 종료 및 결과 반환
         */
        endTimer(name) {
            const startTime = this.timers.get(name);
            if (!startTime) return null;
            
            const duration = performance.now() - startTime;
            this.timers.delete(name);
            
            Core.logger.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
            return duration;
        },
        
        /**
         * 함수 실행 시간 측정
         */
        async measureFunction(fn, name = 'function') {
            this.startTimer(name);
            const result = await fn();
            this.endTimer(name);
            return result;
        }
    };
    
    // ================================================
    // 메인 유틸리티 객체
    // ================================================
    
    const utils = {
        initialize() {
            Core.logger.log('유틸리티 모듈 초기화 완료');
            return true;
        },
        
        // 각 유틸리티 그룹 접근자
        image: imageUtils,
        file: fileUtils,
        string: stringUtils,
        array: arrayUtils,
        time: timeUtils,
        url: urlUtils,
        storage: storageUtils,
        performance: performanceUtils,
        
        getInfo() {
            return {
                name: UTILS_CONSTANTS.MODULE_NAME,
                version: UTILS_CONSTANTS.VERSION,
                availableUtils: [
                    'image', 'file', 'string', 'array', 
                    'time', 'url', 'storage', 'performance'
                ]
            };
        }
    };
    
    // ================================================
    // 모듈 노출
    // ================================================
    
    window.FacilityImageSystem.Utils = {
        CONSTANTS: UTILS_CONSTANTS,
        utils,
        imageUtils,
        fileUtils,
        stringUtils,
        arrayUtils,
        timeUtils,
        urlUtils,
        storageUtils,
        performanceUtils,
        initialize: utils.initialize.bind(utils)
    };
    
    window.FacilityImageUtils = window.FacilityImageSystem.Utils;
    
    Core.logger.log('유틸리티 모듈 로드 완료');
    
})(); 