import { boolean, integer, pgTable, serial, text, timestamp, jsonb } from "drizzle-orm/pg-core";

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

export const aboutContent = pgTable("about_content", {
  id: serial("id").primaryKey(),
  headline: text("headline").notNull(),
  aboutMeText1: text("about_me_text_1").notNull(),
  aboutMeText2: text("about_me_text_2").notNull(),
  aboutMeText3: text("about_me_text_3").notNull(),
  profileImagePath: text("profile_image_path").notNull(),
  aboutProfileImagePath: text("about_profile_image_path").notNull().default("/images/profile/developer-pic-2.jpg"),
  satisfiedClients: text("satisfied_clients").notNull().default("8"),
  projectsCompleted: text("projects_completed").notNull().default("10"),
  yearsOfExperience: text("years_of_experience").notNull().default("4"),
  // Skills data - array of skill objects with name, x, y positions
  skills: jsonb("skills").notNull().default([
    { name: "HTML", x: "-21vw", y: "2vw" },
    { name: "CSS", x: "-6vw", y: "-9vw" },
    { name: "JavaScript", x: "19vw", y: "6vw" },
    { name: "React", x: "0vw", y: "10vw" },
    { name: "D3.js", x: "-21vw", y: "-15vw" },
    { name: "THREEJS", x: "19vw", y: "-12vw" },
    { name: "NextJS", x: "31vw", y: "-5vw" },
    { name: "Python", x: "19vw", y: "-20vw" },
    { name: "Tailwind CSS", x: "0vw", y: "-20vw" },
    { name: "Figma", x: "-24vw", y: "18vw" },
    { name: "Blender", x: "17vw", y: "17vw" },
  ]),
  // Experience data - array of experience objects
  experiences: jsonb("experiences").notNull().default([
    {
      position: "Lorem Ipsum",
      company: "Lorem Ipsum",
      companyLink: "/",
      time: "2022-Present",
      address: "Lorem, Ipsum",
      work: [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      ]
    },
    {
      position: "Lorem Ipsum",
      company: "Lorem Ipsum",
      companyLink: "/",
      time: "2022-Present",
      address: "Lorem, Ipsum",
      work: [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      ]
    },
    {
      position: "Lorem Ipsum",
      company: "Lorem Ipsum",
      companyLink: "/",
      time: "2022-Present",
      address: "Lorem, Ipsum",
      work: [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      ]
    }
  ]),
  // Education data - array of education objects
  education: jsonb("education").notNull().default([
    {
      type: "Lorem Ipsum",
      time: "2022-2026",
      place: "Lorem Ipsum Dolor Sit Amet",
      info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
      type: "Lorem Ipsum",
      time: "2022-2026",
      place: "Lorem Ipsum Dolor Sit Amet",
      info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
      type: "Lorem Ipsum",
      time: "2022-2026",
      place: "Lorem Ipsum Dolor Sit Amet",
      info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    }
  ]),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Projects table for storing project information
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull().default("Project"),
  summary: text("summary"),
  description: text("description"),
  editableText: text("editable_text").default("Innovation Meets Usability!").notNull(),
  imageUrl: text("image_url").notNull(),
  imageAlt: text("image_alt").notNull(),
  link: text("link").notNull(),
  github: text("github").notNull(),
  tags: jsonb("tags").default([]).notNull(),
  featured: boolean("featured").default(false).notNull(),
  technologies: jsonb("technologies").default([]).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Articles table for storing WordPress article URLs
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Certifications table for storing certification information
export const certifications = pgTable("certifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  issuer: text("issuer").notNull(),
  issueDate: text("issue_date").notNull(),
  expiryDate: text("expiry_date"),
  credentialId: text("credential_id"),
  credentialUrl: text("credential_url").notNull(),
  imageUrl: text("image_url").notNull(),
  imageAlt: text("image_alt").notNull(),
  description: text("description"),
  tags: jsonb("tags").default([]).notNull(),
  featured: boolean("featured").default(false).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User profiles table for storing admin user profile information
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

