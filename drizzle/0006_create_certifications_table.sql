-- Create certifications table for storing certification information
CREATE TABLE certifications (
  id serial PRIMARY KEY NOT NULL,
  title text NOT NULL,
  issuer text NOT NULL,
  issue_date text NOT NULL,
  expiry_date text,
  credential_id text,
  credential_url text NOT NULL,
  image_url text NOT NULL,
  image_alt text NOT NULL,
  description text,
  tags jsonb DEFAULT '[]' NOT NULL,
  featured boolean DEFAULT false NOT NULL,
  display_order integer DEFAULT 0 NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);