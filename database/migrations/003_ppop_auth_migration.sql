-- PPOP Auth SSO Migration
-- password_hash 컬럼을 nullable로 변경 (PPOP Auth 사용자는 비밀번호 없음)

-- password_hash 컬럼을 nullable로 변경
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- 인덱스 추가 (선택적: PPOP Auth user_id로 빠른 조회를 위해)
-- PPOP Auth의 user_id를 그대로 users.id로 사용하므로 추가 컬럼 불필요

-- 마이그레이션 정보 기록을 위한 코멘트
COMMENT ON COLUMN users.password_hash IS 'Password hash for local auth users. NULL for PPOP Auth SSO users.';

