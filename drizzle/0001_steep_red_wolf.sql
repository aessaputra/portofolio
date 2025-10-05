CREATE TABLE "about_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"headline" text NOT NULL,
	"about_me_text_1" text NOT NULL,
	"about_me_text_2" text NOT NULL,
	"about_me_text_3" text NOT NULL,
	"profile_image_path" text NOT NULL,
	"satisfied_clients" text DEFAULT '8' NOT NULL,
	"projects_completed" text DEFAULT '10' NOT NULL,
	"years_of_experience" text DEFAULT '4' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
