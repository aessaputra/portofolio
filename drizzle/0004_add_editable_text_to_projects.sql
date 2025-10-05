-- Add editable_text column to projects table
ALTER TABLE projects ADD COLUMN editable_text TEXT NOT NULL DEFAULT 'Innovation Meets Usability!';