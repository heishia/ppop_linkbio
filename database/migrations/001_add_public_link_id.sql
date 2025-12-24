-- Migration: Add user_seq and public_link_id columns to users table
-- Date: 2025-12-24
-- Description: 순차 번호 기반 암호화된 공개 링크 ID 시스템 추가

-- Step 1: Add user_seq column (SERIAL for auto-increment)
-- Note: PostgreSQL에서 기존 테이블에 SERIAL 추가하려면 시퀀스를 생성해야 함
CREATE SEQUENCE IF NOT EXISTS users_user_seq_seq START WITH 1;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS user_seq INTEGER DEFAULT nextval('users_user_seq_seq');

-- 시퀀스 소유권 설정
ALTER SEQUENCE users_user_seq_seq OWNED BY users.user_seq;

-- Step 2: Add public_link_id column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS public_link_id VARCHAR(20) UNIQUE;

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_public_link_id ON users(public_link_id);
CREATE INDEX IF NOT EXISTS idx_users_user_seq ON users(user_seq);

-- Step 4: Set user_seq for existing users who don't have one yet
-- 기존 사용자들에게 순차 번호 할당 (created_at 순서로)
WITH numbered_users AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as seq_num
    FROM users
    WHERE user_seq IS NULL
)
UPDATE users
SET user_seq = numbered_users.seq_num + COALESCE((SELECT MAX(user_seq) FROM users WHERE user_seq IS NOT NULL), 0)
FROM numbered_users
WHERE users.id = numbered_users.id;

-- Step 5: Update sequence to continue from the max user_seq
SELECT setval('users_user_seq_seq', COALESCE((SELECT MAX(user_seq) FROM users), 1), true);

-- Note: public_link_id는 Python 마이그레이션 스크립트로 생성해야 함
-- (Sqids 라이브러리를 사용하기 때문에 SQL로는 생성 불가)
-- 실행: python scripts/migrate_public_link_ids.py

