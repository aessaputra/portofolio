const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const { eq } = require('drizzle-orm');
require('dotenv').config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set in .env.local');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const db = drizzle(pool);

// Define the aboutContent table schema directly in this script
const aboutContent = {
  id: 'id',
  headline: 'headline',
  aboutMeText1: 'about_me_text_1',
  aboutMeText2: 'about_me_text_2',
  aboutMeText3: 'about_me_text_3',
  profileImagePath: 'profile_image_path',
  satisfiedClients: 'satisfied_clients',
  projectsCompleted: 'projects_completed',
  yearsOfExperience: 'years_of_experience',
  skills: 'skills',
  experiences: 'experiences',
  education: 'education',
  updatedAt: 'updated_at',
};

async function seedDatabase() {
  console.log('Starting database seeding...');
  
  try {
    // Check if content already exists
    const existingContent = await db.select().from('about_content').where(eq('id', 1));
    
    if (existingContent && existingContent.length > 0) {
      console.log('Content already exists, skipping seeding');
      return;
    }
    
    console.log('No content found, seeding database...');
    
    // Insert default content
    await db.insert('about_content').values({
      id: 1,
      headline: "Lorem Ipsum Dolor Sit Amet!",
      about_me_text_1: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      about_me_text_2: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      about_me_text_3: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      profile_image_path: "/images/profile/developer-pic-2.jpg",
      satisfied_clients: "8",
      projects_completed: "10",
      years_of_experience: "4",
      skills: [
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
      ],
      experiences: [
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
      ],
      education: [
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
      ],
    });
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDatabase();