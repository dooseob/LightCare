-- ================================================
-- 게시판/리뷰 이미지 첨부 기능 확장 스키마
-- WebP 지원 및 다중 이미지 관리
-- ================================================

-- ================================================
-- 1. 게시판 이미지 테이블 (새로 생성)
-- ================================================
CREATE TABLE IF NOT EXISTS board_images (
    image_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '이미지 ID',
    board_id BIGINT NOT NULL COMMENT '게시글 ID',
    image_path VARCHAR(500) NOT NULL COMMENT '원본 이미지 경로',
    webp_path VARCHAR(500) COMMENT 'WebP 변환 이미지 경로',
    thumbnail_small VARCHAR(500) COMMENT '작은 썸네일 경로 (300x200)',
    thumbnail_medium VARCHAR(500) COMMENT '중간 썸네일 경로 (600x400)',
    thumbnail_large VARCHAR(500) COMMENT '큰 썸네일 경로 (1200x800)',
    fallback_jpg_path VARCHAR(500) COMMENT 'JPG fallback 경로',
    original_filename VARCHAR(255) COMMENT '원본 파일명',
    file_size BIGINT COMMENT '파일 크기 (bytes)',
    file_size_webp BIGINT COMMENT 'WebP 파일 크기 (bytes)',
    width INT COMMENT '이미지 너비',
    height INT COMMENT '이미지 높이',
    alt_text VARCHAR(255) COMMENT '이미지 대체 텍스트 (SEO/접근성)',
    caption VARCHAR(500) COMMENT '이미지 설명',
    image_order INT DEFAULT 0 COMMENT '이미지 순서',
    is_active BOOLEAN DEFAULT TRUE COMMENT '활성 상태',
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '업로드 일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',
    FOREIGN KEY (board_id) REFERENCES board(board_id) ON DELETE CASCADE,
    INDEX idx_board_images_board_id (board_id),
    INDEX idx_board_images_order (board_id, image_order)
) COMMENT='게시판 이미지 첨부파일 (WebP 지원)';

-- ================================================
-- 2. 리뷰 이미지 테이블 개선 (새로 생성)
-- ================================================
CREATE TABLE IF NOT EXISTS review_images (
    image_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '이미지 ID',
    review_id BIGINT NOT NULL COMMENT '리뷰 ID',
    image_path VARCHAR(500) NOT NULL COMMENT '원본 이미지 경로',
    webp_path VARCHAR(500) COMMENT 'WebP 변환 이미지 경로',
    thumbnail_small VARCHAR(500) COMMENT '작은 썸네일 경로 (300x200)',
    thumbnail_medium VARCHAR(500) COMMENT '중간 썸네일 경로 (600x400)',
    thumbnail_large VARCHAR(500) COMMENT '큰 썸네일 경로 (1200x800)',
    fallback_jpg_path VARCHAR(500) COMMENT 'JPG fallback 경로',
    original_filename VARCHAR(255) COMMENT '원본 파일명',
    file_size BIGINT COMMENT '파일 크기 (bytes)',
    file_size_webp BIGINT COMMENT 'WebP 파일 크기 (bytes)',
    width INT COMMENT '이미지 너비',
    height INT COMMENT '이미지 높이',
    alt_text VARCHAR(255) COMMENT '이미지 대체 텍스트 (SEO/접근성)',
    caption VARCHAR(500) COMMENT '이미지 설명',
    image_order INT DEFAULT 0 COMMENT '이미지 순서',
    is_active BOOLEAN DEFAULT TRUE COMMENT '활성 상태',
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '업로드 일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',
    FOREIGN KEY (review_id) REFERENCES review(review_id) ON DELETE CASCADE,
    INDEX idx_review_images_review_id (review_id),
    INDEX idx_review_images_order (review_id, image_order)
) COMMENT='리뷰 이미지 첨부파일 (WebP 지원)';

-- ================================================
-- 3. 기존 테이블 업데이트
-- ================================================

-- board 테이블에 이미지 카운트 추가
ALTER TABLE board 
ADD COLUMN IF NOT EXISTS image_count INT DEFAULT 0 COMMENT '첨부 이미지 개수',
ADD COLUMN IF NOT EXISTS has_images BOOLEAN DEFAULT FALSE COMMENT '이미지 포함 여부';

-- review 테이블에 이미지 카운트 추가
ALTER TABLE review 
ADD COLUMN IF NOT EXISTS image_count INT DEFAULT 0 COMMENT '첨부 이미지 개수',
ADD COLUMN IF NOT EXISTS has_images BOOLEAN DEFAULT FALSE COMMENT '이미지 포함 여부';

-- ================================================
-- 4. 기존 리뷰 이미지 마이그레이션 (선택적)
-- ================================================
-- 기존 review 테이블의 review_image1, review_image2, review_image3을
-- 새로운 review_images 테이블로 마이그레이션하는 스크립트

-- INSERT INTO review_images (review_id, image_path, image_order, alt_text)
-- SELECT review_id, review_image1, 0, CONCAT('리뷰 이미지 1 - ', title)
-- FROM review 
-- WHERE review_image1 IS NOT NULL AND review_image1 != '';

-- INSERT INTO review_images (review_id, image_path, image_order, alt_text)
-- SELECT review_id, review_image2, 1, CONCAT('리뷰 이미지 2 - ', title)
-- FROM review 
-- WHERE review_image2 IS NOT NULL AND review_image2 != '';

-- INSERT INTO review_images (review_id, image_path, image_order, alt_text)
-- SELECT review_id, review_image3, 2, CONCAT('리뷰 이미지 3 - ', title)
-- FROM review 
-- WHERE review_image3 IS NOT NULL AND review_image3 != '';

-- ================================================
-- 5. 통계 업데이트 트리거 (선택적)
-- ================================================

-- 게시판 이미지 추가 시 카운트 업데이트
DELIMITER $$
CREATE TRIGGER update_board_image_count
AFTER INSERT ON board_images
FOR EACH ROW
BEGIN
    UPDATE board 
    SET image_count = (
        SELECT COUNT(*) FROM board_images 
        WHERE board_id = NEW.board_id AND is_active = TRUE
    ),
    has_images = TRUE
    WHERE board_id = NEW.board_id;
END$$
DELIMITER ;

-- 리뷰 이미지 추가 시 카운트 업데이트
DELIMITER $$
CREATE TRIGGER update_review_image_count
AFTER INSERT ON review_images
FOR EACH ROW
BEGIN
    UPDATE review 
    SET image_count = (
        SELECT COUNT(*) FROM review_images 
        WHERE review_id = NEW.review_id AND is_active = TRUE
    ),
    has_images = TRUE
    WHERE review_id = NEW.review_id;
END$$
DELIMITER ;