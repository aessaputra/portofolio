-- Optimized migration to rename about_me_text fields
-- This version is optimized for Vercel deployment to avoid timeouts

-- Step 1: Add new column with default value (faster)
ALTER TABLE about_content ADD COLUMN about_me_text TEXT DEFAULT '';

-- Step 2: Simple update without complex CASE statements
UPDATE about_content 
SET about_me_text = COALESCE(about_me_text_1, '') || 
    COALESCE(E'\n\n' || about_me_text_2, '') || 
    COALESCE(E'\n\n' || about_me_text_3, '');

-- Step 3: Make NOT NULL
ALTER TABLE about_content ALTER COLUMN about_me_text SET NOT NULL;

-- Step 4: Drop old columns in single transaction
BEGIN;
ALTER TABLE about_content DROP COLUMN about_me_text_1;
ALTER TABLE about_content DROP COLUMN about_me_text_2;
ALTER TABLE about_content DROP COLUMN about_me_text_3;
COMMIT;
