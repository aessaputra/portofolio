-- Remove x and y positions from skills array in about_content table
-- Skills will now only contain name field, positions will be auto-generated

UPDATE about_content 
SET skills = (
  SELECT jsonb_agg(
    jsonb_build_object('name', skill->>'name')
  )
  FROM jsonb_array_elements(skills) AS skill
)
WHERE skills IS NOT NULL;
