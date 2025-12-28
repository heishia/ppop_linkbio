-- Migration: Update plan_type from FREE to BASIC
-- Date: 2025-01-XX
-- Description: Update all existing FREE plan types to BASIC to align with PPOP Auth subscription system

-- Update user_plans table
UPDATE user_plans
SET plan_type = 'basic'
WHERE plan_type = 'free';

-- Verify the update
-- SELECT plan_type, COUNT(*) FROM user_plans GROUP BY plan_type;

