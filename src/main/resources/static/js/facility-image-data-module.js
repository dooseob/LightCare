/**
 * 시설 이미지 데이터 모듈 (Data Module)
 * 서버 통신, 데이터 관리, API 호출 전용 모듈
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
    
    if (!window.FacilityImageSystem.Data) {
        window.FacilityImageSystem.Data = {};
    }
    
    // ================================================
    // 상수 정의
    // ================================================
    
    const DATA_CONSTANTS = {
        MODULE_NAME: 'FacilityImageData',
        VERSION: '1.0.0',
        
        API_ENDPOINTS: {
            UPLOAD: '/facility/facility-images/upload',
            DELETE: '/facility/facility-images/delete',
            REORDER: '/facility/facility-images/reorder',
            GET_IMAGES: '/facility/facility-images',
            SET_MAIN: '/facility/facility-images/main'
        },
        
        REQUEST_TIMEOUT: 30000,
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000
    };
    
    // ================================================
    // 데이터 상태 관리
    // ================================================
    
    const dataState = {
        isInitialized: false,
        facilityId: null,
        existingImages: [],
        uploadQueue: [],
        isUploading: false,
        uploadProgress: { current: 0, total: 0 },
        cache: new Map()
    };
    
    // ================================================
    // HTTP 클라이언트
    // ================================================
    
    const httpClient = {
        async request(url, options = {}) {
            const defaultOptions = {
                timeout: DATA_CONSTANTS.REQUEST_TIMEOUT,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            
            const config = { ...defaultOptions, ...options };
            
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), config.timeout);
                
                const response = await fetch(url, {
                    ...config,
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return await response.json();
                } else {
                    return await response.text();
                }
                
            } catch (error) {
                Core.logger.error('HTTP 요청 실패:', error);
                throw error;
            }
        },
        
        async get(url, params = {}) {
            const urlParams = new URLSearchParams(params);
            const fullUrl = urlParams.toString() ? `${url}?${urlParams}` : url;
            return this.request(fullUrl, { method: 'GET' });
        },
        
        async post(url, data) {
            const options = {
                method: 'POST',
                body: data instanceof FormData ? data : JSON.stringify(data)
            };
            
            if (!(data instanceof FormData)) {
                options.headers = { 'Content-Type': 'application/json' };
            }
            
            return this.request(url, options);
        },
        
        async put(url, data) {
            return this.request(url, {
                method: 'PUT',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            });
        },
        
        async delete(url) {
            return this.request(url, { method: 'DELETE' });
        }
    };
    
    // ================================================
    // 이미지 데이터 관리
    // ================================================
    
    const imageDataManager = {
        async loadExistingImages(facilityId) {
            try {
                const images = await httpClient.get(`${DATA_CONSTANTS.API_ENDPOINTS.GET_IMAGES}/${facilityId}`);
                dataState.existingImages = Array.isArray(images) ? images : [];
                
                Core.logger.log('기존 이미지 로드 완료:', dataState.existingImages.length);
                return dataState.existingImages;
                
            } catch (error) {
                Core.logger.error('기존 이미지 로드 실패:', error);
                dataState.existingImages = [];
                return [];
            }
        },
        
        async uploadImages(facilityId, files) {
            if (!files || files.length === 0) {
                throw new Error('업로드할 파일이 없습니다.');
            }
            
            dataState.isUploading = true;
            dataState.uploadProgress = { current: 0, total: files.length };
            
            try {
                const formData = new FormData();
                formData.append('facilityId', facilityId);
                
                files.forEach((fileData, index) => {
                    const blob = fileData.compressedBlob || fileData.file;
                    const fileName = fileData.seoFileName || fileData.file.name;
                    formData.append('images', blob, fileName);
                    
                    if (fileData.altText) {
                        formData.append(`altText_${index}`, fileData.altText);
                    }
                });
                
                const result = await httpClient.post(DATA_CONSTANTS.API_ENDPOINTS.UPLOAD, formData);
                
                Core.emit('uploadComplete', { result, facilityId });
                Core.logger.success('이미지 업로드 완료');
                
                return result;
                
            } catch (error) {
                Core.logger.error('이미지 업로드 실패:', error);
                throw error;
            } finally {
                dataState.isUploading = false;
            }
        },
        
        async deleteImage(imageId) {
            try {
                const result = await httpClient.delete(`${DATA_CONSTANTS.API_ENDPOINTS.DELETE}/${imageId}`);
                
                // 로컬 상태 업데이트
                dataState.existingImages = dataState.existingImages.filter(img => img.id !== imageId);
                
                Core.logger.log('이미지 삭제 완료:', imageId);
                return result;
                
            } catch (error) {
                Core.logger.error('이미지 삭제 실패:', error);
                throw error;
            }
        },
        
        async reorderImages(facilityId, imageOrder) {
            try {
                const result = await httpClient.put(DATA_CONSTANTS.API_ENDPOINTS.REORDER, {
                    facilityId,
                    imageOrder
                });
                
                Core.logger.log('이미지 순서 변경 완료');
                return result;
                
            } catch (error) {
                Core.logger.error('이미지 순서 변경 실패:', error);
                throw error;
            }
        },
        
        async setMainImage(facilityId, imageId) {
            try {
                const result = await httpClient.put(DATA_CONSTANTS.API_ENDPOINTS.SET_MAIN, {
                    facilityId,
                    imageId
                });
                
                Core.logger.log('대표 이미지 설정 완료:', imageId);
                return result;
                
            } catch (error) {
                Core.logger.error('대표 이미지 설정 실패:', error);
                throw error;
            }
        }
    };
    
    // ================================================
    // 캐시 관리
    // ================================================
    
    const cacheManager = {
        set(key, data, ttl = 300000) { // 5분 기본 TTL
            const cacheData = {
                data,
                timestamp: Date.now(),
                ttl
            };
            dataState.cache.set(key, cacheData);
        },
        
        get(key) {
            const cacheData = dataState.cache.get(key);
            if (!cacheData) return null;
            
            const isExpired = Date.now() - cacheData.timestamp > cacheData.ttl;
            if (isExpired) {
                dataState.cache.delete(key);
                return null;
            }
            
            return cacheData.data;
        },
        
        clear() {
            dataState.cache.clear();
        },
        
        delete(key) {
            dataState.cache.delete(key);
        }
    };
    
    // ================================================
    // 데이터 검증
    // ================================================
    
    const dataValidator = {
        validateImageData(imageData) {
            const errors = [];
            
            if (!imageData.file && !imageData.blob) {
                errors.push('파일 또는 Blob이 필요합니다.');
            }
            
            if (imageData.altText && imageData.altText.length > 200) {
                errors.push('Alt 텍스트는 200자 이하로 입력해주세요.');
            }
            
            return {
                isValid: errors.length === 0,
                errors
            };
        },
        
        validateUploadData(facilityId, files) {
            const errors = [];
            
            if (!facilityId || isNaN(facilityId)) {
                errors.push('유효한 시설 ID가 필요합니다.');
            }
            
            if (!files || files.length === 0) {
                errors.push('업로드할 파일이 없습니다.');
            }
            
            if (files && files.length > 5) {
                errors.push('최대 5개의 파일만 업로드할 수 있습니다.');
            }
            
            return {
                isValid: errors.length === 0,
                errors
            };
        }
    };
    
    // ================================================
    // 메인 데이터 객체
    // ================================================
    
    const data = {
        async initialize(facilityId, options = {}) {
            if (dataState.isInitialized) {
                Core.logger.warn('데이터 모듈이 이미 초기화됨');
                return true;
            }
            
            Core.logger.log('데이터 모듈 초기화 시작');
            
            try {
                dataState.facilityId = facilityId;
                
                // 기존 이미지 로드
                await imageDataManager.loadExistingImages(facilityId);
                
                dataState.isInitialized = true;
                Core.logger.success('데이터 모듈 초기화 완료');
                
                return true;
            } catch (error) {
                Core.logger.error('데이터 모듈 초기화 실패:', error);
                return false;
            }
        },
        
        async uploadImages(files) {
            const validation = dataValidator.validateUploadData(dataState.facilityId, files);
            if (!validation.isValid) {
                throw new Error(validation.errors.join(', '));
            }
            
            return imageDataManager.uploadImages(dataState.facilityId, files);
        },
        
        async getImages() {
            const cacheKey = `images_${dataState.facilityId}`;
            const cached = cacheManager.get(cacheKey);
            
            if (cached) {
                return cached;
            }
            
            const images = await imageDataManager.loadExistingImages(dataState.facilityId);
            cacheManager.set(cacheKey, images);
            
            return images;
        },
        
        async deleteImage(imageId) {
            const result = await imageDataManager.deleteImage(imageId);
            
            // 캐시 무효화
            const cacheKey = `images_${dataState.facilityId}`;
            cacheManager.delete(cacheKey);
            
            return result;
        },
        
        async reorderImages(imageOrder) {
            return imageDataManager.reorderImages(dataState.facilityId, imageOrder);
        },
        
        async setMainImage(imageId) {
            return imageDataManager.setMainImage(dataState.facilityId, imageId);
        },
        
        getExistingImages() {
            return dataState.existingImages;
        },
        
        getUploadProgress() {
            return dataState.uploadProgress;
        },
        
        isUploading() {
            return dataState.isUploading;
        },
        
        clearCache() {
            cacheManager.clear();
        },
        
        destroy() {
            dataState.isInitialized = false;
            dataState.facilityId = null;
            dataState.existingImages = [];
            dataState.uploadQueue = [];
            dataState.isUploading = false;
            cacheManager.clear();
            
            Core.logger.log('데이터 모듈 제거 완료');
        },
        
        getInfo() {
            return {
                name: DATA_CONSTANTS.MODULE_NAME,
                version: DATA_CONSTANTS.VERSION,
                isInitialized: dataState.isInitialized,
                facilityId: dataState.facilityId,
                existingImagesCount: dataState.existingImages.length,
                isUploading: dataState.isUploading,
                cacheSize: dataState.cache.size
            };
        }
    };
    
    // ================================================
    // 모듈 노출
    // ================================================
    
    window.FacilityImageSystem.Data = {
        CONSTANTS: DATA_CONSTANTS,
        data,
        httpClient,
        imageDataManager,
        cacheManager,
        dataValidator,
        getState: () => ({ ...dataState }),
        initialize: data.initialize.bind(data),
        uploadImages: data.uploadImages.bind(data),
        getImages: data.getImages.bind(data),
        deleteImage: data.deleteImage.bind(data),
        reorderImages: data.reorderImages.bind(data),
        setMainImage: data.setMainImage.bind(data),
        destroy: data.destroy.bind(data)
    };
    
    window.FacilityImageData = window.FacilityImageSystem.Data;
    
    Core.logger.log('데이터 모듈 로드 완료');
    
})(); 