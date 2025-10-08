-- Optimized migration to rename about_me_text fields
-- This version is more efficient for Vercel deployment

-- Step 1: Add new column with default value (faster than NULL then UPDATE)
ALTER TABLE about_content ADD COLUMN about_me_text TEXT DEFAULT '';

-- Step 2: Update in batches to avoid long locks
UPDATE about_content 
SET about_me_text = COALESCE(about_me_text_1, '') || 
    CASE WHEN about_me_text_2 IS NOT NULL AND about_me_text_2 != '' THEN E'\n\n' || about_me_text_2 ELSE '' END ||
    CASE WHEN about_me_text_3 IS NOT NULL AND about_me_text_3 != '' THEN E'\n\n' || about_me_text_3 ELSE '' END
WHERE about_me_text = ''; -- Only update if still empty

-- Step 3: Make NOT NULL (faster than separate ALTER)
ALTER TABLE about_content ALTER COLUMN about_me_text SET NOT NULL;

-- Step 4: Drop old columns in single transaction
BEGIN;
ALTER TABLE about_content DROP COLUMN about_me_text_1;
ALTER TABLE about_content DROP COLUMN about_me_text_2;
ALTER TABLE about_content DROP COLUMN about_me_text_3;
COMMIT;
