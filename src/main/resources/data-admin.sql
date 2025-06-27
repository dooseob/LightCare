-- 테스트용 관리자 계정 생성
-- 비밀번호: admin123 (평문, 나중에 마이그레이션으로 암호화)

INSERT INTO member (
    user_id, 
    password, 
    name, 
    email, 
    phone, 
    role, 
    address, 
    is_active, 
    is_deleted, 
    login_fail_count,
    created_at,
    updated_at
) VALUES (
    'admin',
    'admin123',  -- 평문 비밀번호 (나중에 BCrypt로 암호화)
    '시스템 관리자',
    'admin@lightcare.com',
    '010-0000-0000',
    'ADMIN',
    '시스템 관리자 주소',
    true,
    false,
    0,
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE
    password = 'admin123',
    name = '시스템 관리자',
    email = 'admin@lightcare.com',
    role = 'ADMIN',
    is_active = true,
    is_deleted = false,
    updated_at = NOW();

-- 테스트용 일반 사용자 계정
INSERT INTO member (
    user_id, 
    password, 
    name, 
    email, 
    phone, 
    role, 
    address, 
    is_active, 
    is_deleted, 
    login_fail_count,
    created_at,
    updated_at
) VALUES (
    'testuser',
    'test123',  -- 평문 비밀번호
    '테스트 사용자',
    'test@lightcare.com',
    '010-1111-1111',
    'USER',
    '테스트 사용자 주소',
    true,
    false,
    0,
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE
    password = 'test123',
    name = '테스트 사용자',
    role = 'USER',
    is_active = true,
    is_deleted = false,
    updated_at = NOW();

-- 테스트용 시설 관리자 계정
INSERT INTO member (
    user_id, 
    password, 
    name, 
    email, 
    phone, 
    role, 
    address, 
    is_active, 
    is_deleted, 
    login_fail_count,
    created_at,
    updated_at
) VALUES (
    'facility1',
    'facility123',  -- 평문 비밀번호
    '시설 관리자',
    'facility@lightcare.com',
    '010-2222-2222',
    'FACILITY',
    '시설 관리자 주소',
    true,
    false,
    0,
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE
    password = 'facility123',
    name = '시설 관리자',
    role = 'FACILITY',
    is_active = true,
    is_deleted = false,
    updated_at = NOW(); 