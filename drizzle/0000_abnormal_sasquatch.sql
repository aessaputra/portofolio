CREATE TABLE "home_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"headline" text NOT NULL,
	"subheadline" text NOT NULL,
	"resume_url" text NOT NULL,
	"contact_email" text NOT NULL,
	"profile_image_path" text NOT NULL,
	"github_url" text NOT NULL,
	"linkedin_url" text NOT NULL,
	"x_url" text NOT NULL,
	"show_hire_me" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
