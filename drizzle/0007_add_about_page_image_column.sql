-- Add a separate column for the about page profile image
ALTER TABLE about_content ADD COLUMN aboutProfileImagePath TEXT NOT NULL DEFAULT '/images/profile/developer-pic-2.jpg';

-- Update existing records to set the aboutProfileImagePath to the current profileImagePath
UPDATE about_content SET aboutProfileImagePath = profileImagePath WHERE aboutProfileImagePath = '/images/profile/developer-pic-2.jpg';