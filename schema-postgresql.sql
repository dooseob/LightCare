-- PostgreSQL용 스키마 (Heroku 배포용)

-- 회원 테이블
CREATE TABLE IF NOT EXISTS member (
    member_id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(15),
    role VARCHAR(20) DEFAULT 'USER',
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 시설 테이블
CREATE TABLE IF NOT EXISTS facility (
    facility_id SERIAL PRIMARY KEY,
    facility_name VARCHAR(100) NOT NULL,
    address VARCHAR(200) NOT NULL,
    detail_address VARCHAR(100),
    phone VARCHAR(15),
    facility_type VARCHAR(50),
    description TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_approved BOOLEAN DEFAULT false,
    registered_member_id INTEGER REFERENCES member(member_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 시설 이미지 테이블
CREATE TABLE IF NOT EXISTS facility_image (
    image_id SERIAL PRIMARY KEY,
    facility_id INTEGER REFERENCES facility(facility_id) ON DELETE CASCADE,
    image_path VARCHAR(500) NOT NULL,
    is_main BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 리뷰 테이블
CREATE TABLE IF NOT EXISTS review (
    review_id SERIAL PRIMARY KEY,
    facility_id INTEGER REFERENCES facility(facility_id) ON DELETE CASCADE,
    member_id INTEGER REFERENCES member(member_id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 게시판 테이블
CREATE TABLE IF NOT EXISTS board (
    board_id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    board_type VARCHAR(50) DEFAULT 'info',
    member_id INTEGER REFERENCES member(member_id) ON DELETE CASCADE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 구인공고 테이블
CREATE TABLE IF NOT EXISTS job_posting (
    job_id SERIAL PRIMARY KEY,
    facility_id INTEGER REFERENCES facility(facility_id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    job_type VARCHAR(50),
    salary VARCHAR(100),
    working_hours VARCHAR(100),
    requirements TEXT,
    benefits TEXT,
    is_active BOOLEAN DEFAULT true,
    deadline TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 구직 지원 테이블
CREATE TABLE IF NOT EXISTS job_application (
    application_id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES job_posting(job_id) ON DELETE CASCADE,
    member_id INTEGER REFERENCES member(member_id) ON DELETE CASCADE,
    cover_letter TEXT,
    resume_path VARCHAR(500),
    status VARCHAR(20) DEFAULT 'PENDING',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_facility_location ON facility(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_facility_type ON facility(facility_type);
CREATE INDEX IF NOT EXISTS idx_review_facility ON review(facility_id);
CREATE INDEX IF NOT EXISTS idx_board_type ON board(board_type);
CREATE INDEX IF NOT EXISTS idx_job_active ON job_posting(is_active);