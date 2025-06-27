-- 관리자용 테스트 계정 데이터
-- 비밀번호는 모두 BCrypt로 암호화됨

-- 관리자 계정 (admin / admin123)
INSERT INTO member (user_id, password, name, email, role, is_active, created_at, updated_at) 
VALUES ('admin', '$2a$10$K8p4JZnF1Uc0QoGFyJcH.u1R7F8YnXsL9aWgKhN3vD2cE5mH8pQ6G', '시스템관리자', 'admin@lightcare.com', 'ADMIN', true, NOW(), NOW())
ON DUPLICATE KEY UPDATE password = VALUES(password);

-- 일반 사용자 계정 (user1 / user123)
INSERT INTO member (user_id, password, name, email, role, is_active, created_at, updated_at) 
VALUES ('user1', '$2a$10$mF9qH4vN2wR8sK1pD6xL.eT3yB7cA9nM5oE8jU4iP2vX6zC0qW1sG', '테스트사용자1', 'user1@test.com', 'USER', true, NOW(), NOW())
ON DUPLICATE KEY UPDATE password = VALUES(password);

-- 시설 관리자 계정 (facility1 / facility123)
INSERT INTO member (user_id, password, name, email, role, is_active, created_at, updated_at) 
VALUES ('facility1', '$2a$10$nG8rI5wO3xS9tL2qE7yM.fU4zA8dB0oN6pF9kV5jQ3wY7zD1rX2tH', '시설관리자1', 'facility1@test.com', 'FACILITY', true, NOW(), NOW())
ON DUPLICATE KEY UPDATE password = VALUES(password);

-- 비활성화된 테스트 계정 (inactive / test123)
INSERT INTO member (user_id, password, name, email, role, is_active, created_at, updated_at) 
VALUES ('inactive', '$2a$10$oH9sJ6xP4yT0uM3rF8zN.gV5zB9eC1pO7qG0lW6kR4xZ8aE2sY3uI', '비활성사용자', 'inactive@test.com', 'USER', false, NOW(), NOW())
ON DUPLICATE KEY UPDATE password = VALUES(password); 