CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"issuer" text NOT NULL,
	"issue_date" text NOT NULL,
	"expiry_date" text,
	"credential_id" text,
	"credential_url" text NOT NULL,
	"image_url" text NOT NULL,
	"image_alt" text NOT NULL,
	"description" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"type" text DEFAULT 'Project' NOT NULL,
	"summary" text,
	"description" text,
	"editable_text" text DEFAULT 'Innovation Meets Usability!' NOT NULL,
	"image_url" text NOT NULL,
	"image_alt" text NOT NULL,
	"link" text NOT NULL,
	"github" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"technologies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"profile_image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "about_content" ADD COLUMN "about_profile_image_path" text DEFAULT '/images/profile/developer-pic-2.jpg' NOT NULL;--> statement-breakpoint
ALTER TABLE "about_content" ADD COLUMN "skills" jsonb DEFAULT '[{"name":"HTML","x":"-21vw","y":"2vw"},{"name":"CSS","x":"-6vw","y":"-9vw"},{"name":"JavaScript","x":"19vw","y":"6vw"},{"name":"React","x":"0vw","y":"10vw"},{"name":"D3.js","x":"-21vw","y":"-15vw"},{"name":"THREEJS","x":"19vw","y":"-12vw"},{"name":"NextJS","x":"31vw","y":"-5vw"},{"name":"Python","x":"19vw","y":"-20vw"},{"name":"Tailwind CSS","x":"0vw","y":"-20vw"},{"name":"Figma","x":"-24vw","y":"18vw"},{"name":"Blender","x":"17vw","y":"17vw"}]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "about_content" ADD COLUMN "experiences" jsonb DEFAULT '[{"position":"Lorem Ipsum","company":"Lorem Ipsum","companyLink":"/","time":"2022-Present","address":"Lorem, Ipsum","work":["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."]},{"position":"Lorem Ipsum","company":"Lorem Ipsum","companyLink":"/","time":"2022-Present","address":"Lorem, Ipsum","work":["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."]},{"position":"Lorem Ipsum","company":"Lorem Ipsum","companyLink":"/","time":"2022-Present","address":"Lorem, Ipsum","work":["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."]}]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "about_content" ADD COLUMN "education" jsonb DEFAULT '[{"type":"Lorem Ipsum","time":"2022-2026","place":"Lorem Ipsum Dolor Sit Amet","info":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."},{"type":"Lorem Ipsum","time":"2022-2026","place":"Lorem Ipsum Dolor Sit Amet","info":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."},{"type":"Lorem Ipsum","time":"2022-2026","place":"Lorem Ipsum Dolor Sit Amet","info":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}]'::jsonb NOT NULL;