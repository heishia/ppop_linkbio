-- 링크 버튼 스타일 컬럼 추가 마이그레이션
-- button_style: 'default' (기본), 'outline' (하얀배경+검은외곽선), 'filled' (검은배경+하얀텍스트)

-- users 테이블에 button_style 컬럼 추가
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS button_style VARCHAR(20) DEFAULT 'default';

-- 기존 사용자들은 기본 스타일로 설정
UPDATE users 
SET button_style = 'default' 
WHERE button_style IS NULL;

-- 컬럼에 제약 조건 추가 (유효한 스타일 값만 허용)
ALTER TABLE users 
ADD CONSTRAINT check_button_style 
CHECK (button_style IN ('default', 'outline', 'filled'));


