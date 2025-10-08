-- Migration to rename about_me_text fields to single about_me_text field
-- This migration combines about_me_text_1, about_me_text_2, and about_me_text_3 into a single about_me_text field

-- First, add the new about_me_text column
ALTER TABLE about_content ADD COLUMN about_me_text TEXT;

-- Copy data from about_me_text_1 to about_me_text (combining all three fields with line breaks)
UPDATE about_content 
SET about_me_text = CONCAT(
  COALESCE(about_me_text_1, ''),
  CASE WHEN about_me_text_2 IS NOT NULL AND about_me_text_2 != '' THEN E'\n\n' || about_me_text_2 ELSE '' END,
  CASE WHEN about_me_text_3 IS NOT NULL AND about_me_text_3 != '' THEN E'\n\n' || about_me_text_3 ELSE '' END
);

-- Make the new column NOT NULL
ALTER TABLE about_content ALTER COLUMN about_me_text SET NOT NULL;

-- Drop the old columns
ALTER TABLE about_content DROP COLUMN about_me_text_1;
ALTER TABLE about_content DROP COLUMN about_me_text_2;
ALTER TABLE about_content DROP COLUMN about_me_text_3;
