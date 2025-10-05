const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
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

async function seedProjects() {
  console.log('Starting projects seeding...');
  
  try {
    // Check if projects already exist
    const { rows } = await pool.query('SELECT * FROM projects');
    
    if (rows && rows.length > 0) {
      console.log('Projects already exist, skipping seeding');
      return;
    }
    
    console.log('No projects found, seeding database...');
    
    // Insert default projects
    await pool.query(`
      INSERT INTO projects (title, type, summary, editable_text, image_url, image_alt, link, github, tags, featured, technologies, display_order) VALUES
      ('ThreeJS Quote Cloud', 'Featured Project', 'A quote made of 3D Text floating in a cloud of randomly generated geometry.', 'Innovation Meets Usability!', '/images/projects/nft-collection-website-cover-image.jpg', 'ThreeJS Quote Cloud Project', 'https://quote-cloud.vercel.app/', 'https://github.com/aessaputra/quote-cloud', '["ThreeJS", "WebGL", "JavaScript", "3D"]', true, '["Three.js", "JavaScript", "HTML", "CSS"]', 1),
      ('Star Shower', 'Project', 'Interactive star animation with particle effects.', 'Innovation Meets Usability!', '/images/projects/agency-website-cover-image.jpg', 'Star Shower Project', 'https://starshowerbkw.netlify.app/', 'https://github.com/aessaputra/Star-Shower', '["JavaScript", "Animation", "Canvas"]', false, '["JavaScript", "HTML5 Canvas", "CSS"]', 2),
      ('Sunset Racer', 'Project', 'A racing game with beautiful sunset visuals.', 'Innovation Meets Usability!', '/images/projects/portfolio-cover-image.jpg', 'Sunset Racer Project', 'https://sunsetracer.netlify.app/', 'https://github.com/aessaputra/Sunset-Racing', '["JavaScript", "Game", "Canvas"]', false, '["JavaScript", "HTML5 Canvas", "CSS"]', 3),
      ('Reflection Material ThreeJS', 'Featured Project', 'Experimenting with geometries and materials in threejs', 'Innovation Meets Usability!', '/images/projects/fashion-studio-website.jpg', 'Reflection Material ThreeJS Project', 'https://materialexp.netlify.app/', 'https://github.com/aessaputra/material-experimentation', '["ThreeJS", "WebGL", "JavaScript", "3D"]', true, '["Three.js", "JavaScript", "HTML", "CSS"]', 4),
      ('Omnifood Food Delivery', 'Project', 'A food delivery service website with modern UI.', 'Innovation Meets Usability!', '/images/projects/crypto-screener-cover-image.jpg', 'Omnifood Food Delivery Project', 'https://omnifoodbkw.netlify.app/', 'https://github.com/aessaputra/Omnifood-project', '["HTML", "CSS", "JavaScript", "Responsive"]', false, '["HTML", "CSS", "JavaScript", "Responsive Design"]', 5)
    `);
    
    console.log('Projects seeded successfully');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedProjects();