-- Create projects table for storing project information
CREATE TABLE projects (
  id serial PRIMARY KEY NOT NULL,
  title text NOT NULL,
  type text NOT NULL DEFAULT 'Project',
  summary text,
  description text,
  image_url text NOT NULL,
  image_alt text NOT NULL,
  link text NOT NULL,
  github text NOT NULL,
  tags jsonb DEFAULT '[]' NOT NULL,
  featured boolean DEFAULT false NOT NULL,
  technologies jsonb DEFAULT '[]' NOT NULL,
  display_order integer DEFAULT 0 NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);