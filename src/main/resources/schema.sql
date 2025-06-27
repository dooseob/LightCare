-- ================================================
-- 요양원 구인구직 사이트 데이터베이스 스키마
-- 4인 팀 프로젝트 전용
-- ================================================

-- ================================================
-- 1. 회원 테이블 (팀원 A 담당)
-- ================================================
CREATE TABLE IF NOT EXISTS member (
    member_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '회원 ID',
    user_id VARCHAR(20) NOT NULL UNIQUE COMMENT '사용자 ID (로그인용)',
    password VARCHAR(255) NOT NULL COMMENT '비밀번호',
    name VARCHAR(50) NOT NULL COMMENT '이름',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT '이메일',
    phone VARCHAR(20) COMMENT '휴대폰 번호',
    role VARCHAR(20) NOT NULL DEFAULT 'USER' COMMENT '역할 (USER, FACILITY, ADMIN)',
    address TEXT COMMENT '주소',
    profile_image VARCHAR(255) COMMENT '프로필 이미지 경로',
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
CREATE TABLE IF NOT EXISTS facility (
    facility_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '시설 ID',
    facility_name VARCHAR(100) NOT NULL COMMENT '시설명',
    facility_type VARCHAR(20) NOT NULL COMMENT '시설 유형 (NURSING_HOME, HOSPITAL, DAY_CARE)',
    address TEXT NOT NULL COMMENT '주소',
    detail_address TEXT COMMENT '상세 주소',
    phone VARCHAR(20) NOT NULL COMMENT '전화번호',
    latitude DECIMAL(10, 8) COMMENT '위도',
    longitude DECIMAL(11, 8) COMMENT '경도',
    description TEXT COMMENT '시설 설명',
    facility_image VARCHAR(255) COMMENT '시설 이미지 경로',
    homepage VARCHAR(255) COMMENT '홈페이지 URL',
    capacity INT COMMENT '수용 인원',
    current_occupancy INT COMMENT '현재 입소자 수',
    operating_hours VARCHAR(100) COMMENT '운영 시간',
    features TEXT COMMENT '시설 특징',
    average_rating FLOAT DEFAULT 0 COMMENT '평균 평점',
    review_count INT DEFAULT 0 COMMENT '리뷰 수',
    registered_member_id BIGINT NOT NULL COMMENT '등록한 회원 ID',
    is_approved BOOLEAN NOT NULL DEFAULT FALSE COMMENT '승인 여부',
    approval_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '승인 상태 (PENDING, APPROVED, REJECTED)',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE COMMENT '삭제 여부',
    FOREIGN KEY (registered_member_id) REFERENCES member(member_id)
) COMMENT='시설 정보';

-- ================================================
-- 3. 구인구직 게시글 테이블 (팀원 C 담당)
-- ================================================
CREATE TABLE IF NOT EXISTS job_posting (
    job_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    job_type VARCHAR(20) NOT NULL,
    work_type VARCHAR(20) NOT NULL,
    position VARCHAR(50),
    recruit_count INT,
    salary_type VARCHAR(20),
    salary_min DECIMAL(10, 0),
    salary_max DECIMAL(10, 0),
    salary_description TEXT,
    work_location VARCHAR(100),
    work_hours VARCHAR(100),
    experience VARCHAR(50),
    education VARCHAR(50),
    qualifications TEXT,
    benefits TEXT,
    start_date DATE,
    end_date DATE,
    contact_name VARCHAR(50),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    company_name VARCHAR(100),
    member_id BIGINT NOT NULL,
    facility_id BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    view_count INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (member_id) REFERENCES member(member_id),
    FOREIGN KEY (facility_id) REFERENCES facility(facility_id)
);

-- ================================================
-- 4. 리뷰 테이블 (팀원 D 담당)
-- ================================================
CREATE TABLE IF NOT EXISTS review (
    review_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    facility_id BIGINT NOT NULL,
    member_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    rating INT NOT NULL,
    service_rating INT,
    facility_rating INT,
    staff_rating INT,
    price_rating INT,
    review_image1 VARCHAR(255),
    review_image2 VARCHAR(255),
    review_image3 VARCHAR(255),
    like_count INT DEFAULT 0,
    dislike_count INT DEFAULT 0,
    is_recommended BOOLEAN DEFAULT FALSE,
    visit_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (facility_id) REFERENCES facility(facility_id),
    FOREIGN KEY (member_id) REFERENCES member(member_id)
);

-- ================================================
-- 5. 게시판 테이블 (팀원 D 담당)
-- ================================================
CREATE TABLE IF NOT EXISTS board (
    board_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id BIGINT NOT NULL,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    is_notice BOOLEAN DEFAULT FALSE,
    is_secret BOOLEAN DEFAULT FALSE,
    attached_file VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (member_id) REFERENCES member(member_id)
);

-- ================================================
-- 인덱스 생성
-- ================================================
CREATE INDEX IF NOT EXISTS idx_member_user_id ON member(user_id);
CREATE INDEX IF NOT EXISTS idx_member_email ON member(email);
CREATE INDEX IF NOT EXISTS idx_member_role ON member(role);

CREATE INDEX IF NOT EXISTS idx_facility_type ON facility(facility_type);
CREATE INDEX IF NOT EXISTS idx_facility_registered_member ON facility(registered_member_id);

CREATE INDEX IF NOT EXISTS idx_job_type ON job_posting(job_type);
CREATE INDEX IF NOT EXISTS idx_job_member_id ON job_posting(member_id);
CREATE INDEX IF NOT EXISTS idx_job_facility_id ON job_posting(facility_id);

CREATE INDEX IF NOT EXISTS idx_review_facility_id ON review(facility_id);
CREATE INDEX IF NOT EXISTS idx_review_member_id ON review(member_id);

CREATE INDEX IF NOT EXISTS idx_board_member_id ON board(member_id);
CREATE INDEX IF NOT EXISTS idx_board_category ON board(category);

-- ================================================
-- 기본 데이터 삽입 (테스트용)
-- ================================================

-- 관리자 계정 생성
INSERT INTO member (user_id, password, name, email, role, is_active) VALUES
('admin', 'admin123', '관리자', 'admin@carelink.com', 'ADMIN', TRUE);

-- 샘플 시설 유형별 데이터
INSERT INTO member (user_id, password, name, email, phone, role, address, is_active) VALUES
('facility01', 'facility123', '수원요양원', 'suwon@example.com', '031-123-4567', 'FACILITY', '경기도 수원시', TRUE),
('user01', 'user123', '김철수', 'user01@example.com', '010-1234-5678', 'USER', '서울시 강남구', TRUE),
('user02', 'user123', '이영희', 'user02@example.com', '010-2345-6789', 'USER', '서울시 서초구', TRUE);

-- 샘플 시설 데이터
INSERT INTO facility (facility_name, facility_type, address, phone, latitude, longitude, description, registered_member_id, is_approved, approval_status) VALUES
('수원요양원', 'NURSING_HOME', '경기도 수원시 영통구', '031-123-4567', 37.2636, 127.0286, '쾌적하고 안전한 요양 환경을 제공합니다.', 2, TRUE, 'APPROVED');

-- 샘플 구인구직 데이터
INSERT INTO job_posting (title, content, job_type, work_type, position, member_id, facility_id, status) VALUES
('요양보호사 모집', '경력 요양보호사를 모집합니다.', 'RECRUIT', 'FULL_TIME', '요양보호사', 2, 1, 'ACTIVE'),
('간병인 구직', '성실한 간병인입니다.', 'SEARCH', 'PART_TIME', '간병인', 3, NULL, 'ACTIVE'); 