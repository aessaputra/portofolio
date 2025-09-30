import { boolean, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const homeContent = pgTable("home_content", {
  id: serial("id").primaryKey(),
  headline: text("headline").notNull(),
  subheadline: text("subheadline").notNull(),
  resumeUrl: text("resume_url").notNull(),
  contactEmail: text("contact_email").notNull(),
  profileImagePath: text("profile_image_path").notNull(),
  githubUrl: text("github_url").notNull(),
  linkedinUrl: text("linkedin_url").notNull(),
  xUrl: text("x_url").notNull(),
  showHireMe: boolean("show_hire_me").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
