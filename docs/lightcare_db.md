-- ================================================
-- 요양원 구인구직 사이트 데이터베이스 스키마
-- 4인 팀 프로젝트 전용 (MySQL 문법 수정 버전)
-- ================================================

-- 데이터베이스 생성 (필요 시)
CREATE DATABASE IF NOT EXISTS carelink DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE carelink;

-- ================================================
-- 1. 회원 테이블 (팀원 A 담당)
-- ================================================
CREATE TABLE member (
    member_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '회원 ID',
    user_id VARCHAR(20) NOT NULL UNIQUE COMMENT '사용자 ID (로그인용)',
    password VARCHAR(255) NOT NULL COMMENT '비밀번호',
    name VARCHAR(50) NOT NULL COMMENT '이름',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT '이메일',
    phone VARCHAR(20) COMMENT '휴대폰 번호',
    role VARCHAR(20) NOT NULL DEFAULT 'USER' COMMENT '역할 (USER, FACILITY, ADMIN)',
    address TEXT COMMENT '주소',
    detail_address TEXT COMMENT '상세 주소',
    profile_image VARCHAR(255) COMMENT '프로필 이미지 경로',
    profile_image_alt_text VARCHAR(255) COMMENT '프로필 이미지 alt 텍스트 (SEO 최적화용)',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '계정 활성화 여부',
    login_fail_count INT NOT NULL DEFAULT 0 COMMENT '로그인 실패 횟수',
    last_login_at DATETIME COMMENT '마지막 로그인 시간',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE COMMENT '삭제 여부'
) COMMENT='회원 정보';

-- ================================================
-- 2. 시설 테이블 (팀원 B 담당)
-- ================================================
CREATE TABLE facility (
    facility_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '시설 ID',
    facility_name VARCHAR(100) NOT NULL COMMENT '시설명',
    facility_type VARCHAR(20) NOT NULL COMMENT '시설 유형 (NURSING_HOME, HOSPITAL, DAY_CARE)',
    address TEXT NOT NULL COMMENT '주소',
    detail_address TEXT COMMENT '상세 주소',
    phone VARCHAR(20) NOT NULL COMMENT '전화번호',
    latitude DECIMAL(10, 8) COMMENT '위도',
    longitude DECIMAL(11, 8) COMMENT '경도',
    description TEXT COMMENT '시설 설명',
    facility_image VARCHAR(255) COMMENT '시설 메인 이미지 경로 (레거시 호환성용)',
    facility_image_alt_text VARCHAR(255) COMMENT '시설 이미지 alt 텍스트 (SEO 최적화용)',
    homepage VARCHAR(255) COMMENT '홈페이지 URL',
    capacity INT COMMENT '수용 인원',
    current_occupancy INT COMMENT '현재 입소자 수',
    operating_hours VARCHAR(100) COMMENT '운영 시간',
    features TEXT COMMENT '시설 특징',
    average_rating FLOAT DEFAULT 0 COMMENT '평균 평점',
    review_count INT DEFAULT 0 COMMENT '리뷰 수',
    grade_rating INT COMMENT '시설 등급 (1-5등급, 1등급이 최고)',
    image_count INT DEFAULT 0 COMMENT '시설 이미지 개수 (facility_images 테이블 기준)',
    main_image_path VARCHAR(500) COMMENT '메인 이미지 경로 (다중 이미지 시스템)',
    registered_member_id BIGINT NOT NULL COMMENT '등록한 회원 ID',
    is_approved BOOLEAN NOT NULL DEFAULT FALSE COMMENT '승인 여부',
    approval_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '승인 상태 (PENDING, APPROVED, REJECTED)',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE COMMENT '삭제 여부',
    FOREIGN KEY (registered_member_id) REFERENCES member(member_id)
) COMMENT='시설 정보';

-- ================================================
-- 3. 시설 이미지 테이블 (다중 이미지 지원 - 최대 5장)
-- ================================================
CREATE TABLE facility_images (
    image_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '이미지 ID',
    facility_id BIGINT NOT NULL COMMENT '시설 ID',
    image_path VARCHAR(500) NOT NULL COMMENT '이미지 경로',
    image_alt_text VARCHAR(200) COMMENT '이미지 alt 텍스트 (SEO 최적화용)',
    image_order INT DEFAULT 0 COMMENT '이미지 순서 (0부터 시작)',
    is_main_image BOOLEAN DEFAULT FALSE COMMENT '메인 이미지 여부',
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '업로드일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    FOREIGN KEY (facility_id) REFERENCES facility(facility_id) ON DELETE CASCADE,
    INDEX idx_facility_images_facility_id (facility_id),
    INDEX idx_facility_images_main (facility_id, is_main_image),
    INDEX idx_facility_images_order (facility_id, image_order)
) COMMENT='시설 이미지 (최대 5장 지원)';

-- ================================================
-- 4. 구인구직 게시글 테이블 (팀원 C 담당)
-- ================================================
CREATE TABLE job_posting (
    job_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '구인구직 ID',
    title VARCHAR(200) NOT NULL COMMENT '제목',
    content TEXT NOT NULL COMMENT '내용',
    job_type VARCHAR(20) NOT NULL COMMENT '구인구직 유형 (RECRUIT: 구인, SEARCH: 구직)',
    work_type VARCHAR(20) NOT NULL COMMENT '근무 형태 (FULL_TIME, PART_TIME, TEMPORARY)',
    position VARCHAR(50) COMMENT '모집 직종',
    recruit_count INT COMMENT '모집 인원',
    salary_type VARCHAR(20) COMMENT '급여 유형 (HOURLY, MONTHLY, ANNUAL)',
    salary_min DECIMAL(10, 0) COMMENT '최소 급여',
    salary_max DECIMAL(10, 0) COMMENT '최대 급여',
    salary_description TEXT COMMENT '급여 설명',
    work_location VARCHAR(100) COMMENT '근무 지역',
    work_hours VARCHAR(100) COMMENT '근무 시간',
    experience VARCHAR(50) COMMENT '경력 조건',
    education VARCHAR(50) COMMENT '학력 조건',
    qualifications TEXT COMMENT '자격 요건',
    benefits TEXT COMMENT '복리후생',
    start_date DATE COMMENT '모집 시작일',
    end_date DATE COMMENT '모집 마감일',
    contact_name VARCHAR(50) COMMENT '담당자 이름',
    contact_phone VARCHAR(20) COMMENT '담당자 연락처',
    contact_email VARCHAR(100) COMMENT '담당자 이메일',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '게시글 상태 (ACTIVE, CLOSED, DRAFT)',
    view_count INT NOT NULL DEFAULT 0 COMMENT '조회수',
    apply_count INT NOT NULL DEFAULT 0 COMMENT '지원자 수',
    member_id BIGINT NOT NULL COMMENT '작성자 ID',
    facility_id BIGINT COMMENT '관련 시설 ID',
    attachment_path VARCHAR(255) COMMENT '첨부파일 경로',
    attachment_name VARCHAR(255) COMMENT '첨부파일 원본명',
    priority INT NOT NULL DEFAULT 0 COMMENT '우선순위',
    is_highlight BOOLEAN NOT NULL DEFAULT FALSE COMMENT '강조 표시 여부',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE COMMENT '삭제 여부',
    FOREIGN KEY (member_id) REFERENCES member(member_id),
    FOREIGN KEY (facility_id) REFERENCES facility(facility_id)
) COMMENT='구인구직 게시글';

-- ================================================
-- 5. 시설 리뷰 테이블 (팀원 D 담당)
-- ================================================
CREATE TABLE review (
    review_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '리뷰 ID',
    facility_id BIGINT NOT NULL COMMENT '시설 ID',
    member_id BIGINT NOT NULL COMMENT '작성자 ID',
    title VARCHAR(200) NOT NULL COMMENT '리뷰 제목',
    content TEXT NOT NULL COMMENT '리뷰 내용',
    rating INT NOT NULL COMMENT '평점 (1-5점)',
    service_rating INT COMMENT '서비스 평점',
    facility_rating INT COMMENT '시설 평점',
    staff_rating INT COMMENT '직원 평점',
    price_rating INT COMMENT '가격 평점',
    review_image1 VARCHAR(255) COMMENT '리뷰 이미지 1',
    review_image2 VARCHAR(255) COMMENT '리뷰 이미지 2',
    review_image3 VARCHAR(255) COMMENT '리뷰 이미지 3',
    like_count INT NOT NULL DEFAULT 0 COMMENT '추천 수',
    dislike_count INT NOT NULL DEFAULT 0 COMMENT '비추천 수',
    view_count INT NOT NULL DEFAULT 0 COMMENT '조회수',
    is_visible BOOLEAN NOT NULL DEFAULT TRUE COMMENT '표시 여부',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '상태 (ACTIVE, HIDDEN, REPORTED)',
    parent_review_id BIGINT COMMENT '부모 리뷰 ID (답글인 경우)',
    reply_count INT NOT NULL DEFAULT 0 COMMENT '답글 수',
    reply_depth INT NOT NULL DEFAULT 0 COMMENT '답글 깊이',
    image_count INT DEFAULT 0 COMMENT '첨부 이미지 개수',
    has_images BOOLEAN DEFAULT FALSE COMMENT '이미지 포함 여부',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE COMMENT '삭제 여부',
    FOREIGN KEY (facility_id) REFERENCES facility(facility_id),
    FOREIGN KEY (member_id) REFERENCES member(member_id),
    FOREIGN KEY (parent_review_id) REFERENCES review(review_id)
) COMMENT='시설 리뷰';

-- ================================================
-- 6. 정보 게시판 테이블 (팀원 D 담당)
-- ================================================
CREATE TABLE board (
    board_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '게시글 ID',
    board_type VARCHAR(20) NOT NULL COMMENT '게시판 유형 (NOTICE, INFO, QNA, FAQ)',
    title VARCHAR(200) NOT NULL COMMENT '제목',
    content TEXT NOT NULL COMMENT '내용',
    member_id BIGINT NOT NULL COMMENT '작성자 ID',
    view_count INT NOT NULL DEFAULT 0 COMMENT '조회수',
    like_count INT NOT NULL DEFAULT 0 COMMENT '추천수',
    comment_count INT NOT NULL DEFAULT 0 COMMENT '댓글수',
    attachment_path VARCHAR(255) COMMENT '첨부파일 경로',
    attachment_name VARCHAR(255) COMMENT '첨부파일 원본명',
    attachment_size BIGINT COMMENT '첨부파일 크기',
    is_notice BOOLEAN NOT NULL DEFAULT FALSE COMMENT '공지사항 여부',
    is_secret BOOLEAN NOT NULL DEFAULT FALSE COMMENT '비밀글 여부',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '활성 상태',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '상태 (ACTIVE, HIDDEN, DELETED)',
    category VARCHAR(50) COMMENT '카테고리',
    sub_category VARCHAR(50) COMMENT '서브 카테고리',
    priority INT NOT NULL DEFAULT 0 COMMENT '우선순위',
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE COMMENT '상단 고정 여부',
    parent_board_id BIGINT COMMENT '부모 게시글 ID (답글인 경우)',
    reply_depth INT NOT NULL DEFAULT 0 COMMENT '답글 깊이',
    reply_order INT NOT NULL DEFAULT 0 COMMENT '답글 순서',
    tags VARCHAR(500) COMMENT '태그 (콤마로 구분)',
    meta_description TEXT COMMENT '메타 설명',
    meta_keywords VARCHAR(500) COMMENT '메타 키워드',
    image_count INT DEFAULT 0 COMMENT '첨부 이미지 개수',
    has_images BOOLEAN DEFAULT FALSE COMMENT '이미지 포함 여부',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE COMMENT '삭제 여부',
    FOREIGN KEY (member_id) REFERENCES member(member_id),
    FOREIGN KEY (parent_board_id) REFERENCES board(board_id)
) COMMENT='정보 게시판';

-- ================================================
-- 7. 게시판 이미지 테이블 (이미지 첨부 기능)
-- ================================================
CREATE TABLE board_images (
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
-- 8. 리뷰 이미지 테이블 (이미지 첨부 기능 개선)
-- ================================================
CREATE TABLE review_images (
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
-- 9. 통계 업데이트 트리거 (이미지 카운트 자동 업데이트)
-- ================================================
-- 기존 트리거 삭제 후 재생성
DROP TRIGGER IF EXISTS update_board_image_count;
DROP TRIGGER IF EXISTS update_board_image_count_delete;
DROP TRIGGER IF EXISTS update_review_image_count;
DROP TRIGGER IF EXISTS update_review_image_count_delete;

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

-- 게시판 이미지 삭제 시 카운트 업데이트
DELIMITER $$
CREATE TRIGGER update_board_image_count_delete
AFTER DELETE ON board_images
FOR EACH ROW
BEGIN
    UPDATE board 
    SET image_count = (
        SELECT COUNT(*) FROM board_images 
        WHERE board_id = OLD.board_id AND is_active = TRUE
    ),
    has_images = (
        SELECT COUNT(*) FROM board_images 
        WHERE board_id = OLD.board_id AND is_active = TRUE
    ) > 0
    WHERE board_id = OLD.board_id;
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

-- 리뷰 이미지 삭제 시 카운트 업데이트
DELIMITER $$
CREATE TRIGGER update_review_image_count_delete
AFTER DELETE ON review_images
FOR EACH ROW
BEGIN
    UPDATE review 
    SET image_count = (
        SELECT COUNT(*) FROM review_images 
        WHERE review_id = OLD.review_id AND is_active = TRUE
    ),
    has_images = (
        SELECT COUNT(*) FROM review_images 
        WHERE review_id = OLD.review_id AND is_active = TRUE
    ) > 0
    WHERE review_id = OLD.review_id;
END$$
DELIMITER ;

-- ================================================
-- 인덱스 생성 (성능 최적화)
-- ================================================

-- 회원 테이블 인덱스
CREATE INDEX idx_member_user_id ON member(user_id);
CREATE INDEX idx_member_email ON member(email);
CREATE INDEX idx_member_role ON member(role);
CREATE INDEX idx_member_created_at ON member(created_at);
CREATE INDEX idx_member_is_deleted ON member(is_deleted);

-- 시설 테이블 인덱스
CREATE INDEX idx_facility_type ON facility(facility_type);
CREATE INDEX idx_facility_location ON facility(latitude, longitude);
CREATE INDEX idx_facility_member_id ON facility(registered_member_id);
CREATE INDEX idx_facility_created_at ON facility(created_at);
CREATE INDEX idx_facility_approval ON facility(is_approved, approval_status);
CREATE INDEX idx_facility_rating ON facility(average_rating);
CREATE INDEX idx_facility_is_deleted ON facility(is_deleted);

-- 시설 이미지 테이블 추가 인덱스
CREATE INDEX idx_facility_images_upload_date ON facility_images(upload_date);
CREATE INDEX idx_facility_images_alt_text ON facility_images(image_alt_text);

-- 구인구직 테이블 인덱스
CREATE INDEX idx_job_type ON job_posting(job_type);
CREATE INDEX idx_job_work_type ON job_posting(work_type);
CREATE INDEX idx_job_member_id ON job_posting(member_id);
CREATE INDEX idx_job_facility_id ON job_posting(facility_id);
CREATE INDEX idx_job_created_at ON job_posting(created_at);
CREATE INDEX idx_job_status ON job_posting(status);
CREATE INDEX idx_job_location ON job_posting(work_location);
CREATE INDEX idx_job_is_deleted ON job_posting(is_deleted);

-- 리뷰 테이블 인덱스
CREATE INDEX idx_review_facility_id ON review(facility_id);
CREATE INDEX idx_review_member_id ON review(member_id);
CREATE INDEX idx_review_created_at ON review(created_at);
CREATE INDEX idx_review_rating ON review(rating);
CREATE INDEX idx_review_status ON review(status);
CREATE INDEX idx_review_is_deleted ON review(is_deleted);

-- 게시판 테이블 인덱스
CREATE INDEX idx_board_type ON board(board_type);
CREATE INDEX idx_board_member_id ON board(member_id);
CREATE INDEX idx_board_created_at ON board(created_at);
CREATE INDEX idx_board_category ON board(category);
CREATE INDEX idx_board_status ON board(status);
CREATE INDEX idx_board_priority ON board(priority);
CREATE INDEX idx_board_is_deleted ON board(is_deleted);

-- 게시판 이미지 테이블 인덱스
CREATE INDEX idx_board_images_upload_date ON board_images(upload_date);
CREATE INDEX idx_board_images_active ON board_images(is_active);
CREATE INDEX idx_board_images_filename ON board_images(original_filename);

-- 리뷰 이미지 테이블 인덱스
CREATE INDEX idx_review_images_upload_date ON review_images(upload_date);
CREATE INDEX idx_review_images_active ON review_images(is_active);
CREATE INDEX idx_review_images_filename ON review_images(original_filename);

-- ================================================
-- 기본 데이터 삽입 (테스트용)
-- ================================================
INSERT INTO member (user_id, password, name, email, phone, role, address, is_active, login_fail_count, created_at, updated_at, is_deleted) VALUES
    ('admin', 'admin123', '관리자', 'admin@carelink.com', '02-1234-5678', 'ADMIN', '서울시 종로구 세종대로 1', TRUE, 0, NOW(), NOW(), FALSE),
    ('user01', 'user123', '김철수', 'kim.cs@example.com', '010-1111-2222', 'USER', '서울시 강남구 테헤란로 123', TRUE, 0, NOW(), NOW(), FALSE),
    ('user02', 'user123', '이영희', 'lee.yh@example.com', '010-2222-3333', 'USER', '부산시 해운대구 센텀중앙로 79', TRUE, 0, NOW(), NOW(), FALSE),
    ('user03', 'user123', '박민수', 'park.ms@example.com', '010-3333-4444', 'USER', '대구시 중구 동성로 1', TRUE, 0, NOW(), NOW(), FALSE),
    ('user04', 'user123', '최지은', 'choi.je@example.com', '010-4444-5555', 'USER', '인천시 남동구 구월동 1234', TRUE, 0, NOW(), NOW(), FALSE),
    ('facility01', 'facility123', '서울요양원장', 'seoul.admin@example.com', '02-5555-6666', 'FACILITY', '서울시 서초구 서초대로 123', TRUE, 0, NOW(), NOW(), FALSE),
    ('facility02', 'facility123', '부산실버타운장', 'busan.admin@example.com', '051-7777-8888', 'FACILITY', '부산시 부산진구 서면로 456', TRUE, 0, NOW(), NOW(), FALSE);

-- 시설 데이터
INSERT INTO facility (facility_name, facility_type, address, detail_address, phone, latitude, longitude, description, capacity, current_occupancy, operating_hours, features, average_rating, review_count, grade_rating, image_count, main_image_path, registered_member_id, is_approved, approval_status, created_at, updated_at, is_deleted) VALUES
    ('서울 행복요양원', 'NURSING_HOME', '서울시 강남구 테헤란로 123', '2층 201호', '02-1111-2222', 37.500913, 127.037149, '24시간 전문 간병 서비스를 제공하는 프리미엄 요양원입니다.', 50, 35, '24시간 운영', '24시간 간병서비스, 물리치료실, 인지치료 프로그램', 4.5, 8, 1, 0, NULL, 6, TRUE, 'APPROVED', NOW(), NOW(), FALSE),
    ('부산 바다뷰 실버타운', 'NURSING_HOME', '부산시 해운대구 센텀중앙로 79', '1층', '051-3333-4444', 35.169188, 129.132800, '바다가 보이는 아름다운 환경의 실버타운입니다.', 80, 60, '08:00-22:00', '바다뷰, 실버카페, 도서관, 수영장', 4.2, 12, 2, 0, NULL, 7, TRUE, 'APPROVED', NOW(), NOW(), FALSE),
    ('대전 건강 데이케어센터', 'DAY_CARE', '대전시 유성구 과학로 123', 'B1층', '042-5555-6666', 36.350411, 127.384548, '주간보호 전문 센터로 다양한 프로그램을 운영합니다.', 30, 20, '09:00-18:00', '송영버스, 급식서비스, 건강관리 프로그램', 4.0, 6, 3, 0, NULL, 6, TRUE, 'APPROVED', NOW(), NOW(), FALSE),
    ('인천 평안 요양병원', 'HOSPITAL', '인천시 남동구 구월동 1234', '3-5층', '032-7777-8888', 37.456256, 126.731536, '의료진이 상주하는 전문 요양병원입니다.', 100, 75, '24시간 운영', '의료진 상주, 응급실, 재활치료실, 검사실', 4.3, 15, 1, 0, NULL, 6, TRUE, 'APPROVED', NOW(), NOW(), FALSE),
    ('경기 사랑 재가센터', 'DAY_CARE', '경기도 수원시 팔달구 중부대로 123', '1층', '031-9999-0000', 37.283897, 127.009121, '재가 요양 서비스 전문 센터입니다.', 25, 18, '08:00-20:00', '재가방문, 목욕서비스, 간병서비스', 3.8, 4, 4, 0, NULL, 6, TRUE, 'APPROVED', NOW(), NOW(), FALSE);

-- ================================================
-- 완료 메시지
-- ================================================
SELECT '라이트케어 데이터베이스 초기화가 완료되었습니다!' as message;