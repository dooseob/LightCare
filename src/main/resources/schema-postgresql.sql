-- PostgreSQL용 스키마 (Render 전용)
-- 기존 테이블 삭제 (존재할 경우)
DROP TABLE IF EXISTS job_application CASCADE;
DROP TABLE IF EXISTS review_images CASCADE;
DROP TABLE IF EXISTS review CASCADE;
DROP TABLE IF EXISTS board_images CASCADE;
DROP TABLE IF EXISTS board CASCADE;
DROP TABLE IF EXISTS job_posting CASCADE;
DROP TABLE IF EXISTS facility_images CASCADE;
DROP TABLE IF EXISTS facility CASCADE;
DROP TABLE IF EXISTS member CASCADE;

-- 회원 테이블
CREATE TABLE member (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 시설 테이블
CREATE TABLE facility (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    address VARCHAR(500) NOT NULL,
    phone VARCHAR(20),
    description TEXT,
    capacity INTEGER,
    current_residents INTEGER DEFAULT 0,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    member_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES member(id) ON DELETE CASCADE
);

-- 시설 이미지 테이블  
CREATE TABLE facility_images (
    id SERIAL PRIMARY KEY,
    facility_id INTEGER NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    image_name VARCHAR(255),
    is_main BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facility(id) ON DELETE CASCADE
);

-- 구인공고 테이블
CREATE TABLE job_posting (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    salary VARCHAR(100),
    work_schedule VARCHAR(200),
    requirements TEXT,
    facility_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facility(id) ON DELETE CASCADE
);

-- 지원 테이블
CREATE TABLE job_application (
    id SERIAL PRIMARY KEY,
    job_posting_id INTEGER NOT NULL,
    applicant_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_posting_id) REFERENCES job_posting(id) ON DELETE CASCADE,
    FOREIGN KEY (applicant_id) REFERENCES member(id) ON DELETE CASCADE
);

-- 게시판 테이블
CREATE TABLE board (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'GENERAL',
    author_id INTEGER NOT NULL,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES member(id) ON DELETE CASCADE
);

-- 게시판 이미지 테이블
CREATE TABLE board_images (
    id SERIAL PRIMARY KEY,
    board_id INTEGER NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    image_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (board_id) REFERENCES board(id) ON DELETE CASCADE
);

-- 리뷰 테이블
CREATE TABLE review (
    id SERIAL PRIMARY KEY,
    facility_id INTEGER NOT NULL,
    reviewer_id INTEGER NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    dislike_count INTEGER DEFAULT 0,
    image_count INTEGER DEFAULT 0,
    has_images BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facility(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES member(id) ON DELETE CASCADE
);

-- 리뷰 이미지 테이블
CREATE TABLE review_images (
    id SERIAL PRIMARY KEY,
    review_id INTEGER NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    image_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES review(id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX idx_facility_location ON facility(latitude, longitude);
CREATE INDEX idx_facility_member ON facility(member_id);
CREATE INDEX idx_job_posting_facility ON job_posting(facility_id);
CREATE INDEX idx_review_facility ON review(facility_id);
CREATE INDEX idx_board_author ON board(author_id);
CREATE INDEX idx_board_category ON board(category);