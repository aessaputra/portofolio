const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

require('dotenv').config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, {
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
  max: 1,
});

const db = drizzle(sql);

async function debugProduction() {
  console.log('🔍 Debugging Production Database...');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  
  try {
    // Test connection
    await sql`SELECT 1`;
    console.log('✅ Database connection successful');
    
    // Check if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('home_content', 'about_content', 'articles', 'certifications', 'projects', 'user_profiles')
      ORDER BY table_name
    `;
    
    console.log('📋 Existing tables:', tables.map(t => t.table_name));
    
    // Check home_content data
    const homeData = await sql`SELECT * FROM home_content LIMIT 1`;
    console.log('🏠 Home content data:');
    if (homeData.length > 0) {
      console.log(JSON.stringify(homeData[0], null, 2));
    } else {
      console.log('❌ No home content data found');
    }
    
    // Check about_content data
    const aboutData = await sql`SELECT * FROM about_content LIMIT 1`;
    console.log('📝 About content data:');
    if (aboutData.length > 0) {
      console.log(JSON.stringify(aboutData[0], null, 2));
    } else {
      console.log('❌ No about content data found');
    }
    
    // Check projects data
    const projectsData = await sql`SELECT COUNT(*) as count FROM projects`;
    console.log('🚀 Projects count:', projectsData[0].count);
    
    // Check articles data
    const articlesData = await sql`SELECT COUNT(*) as count FROM articles`;
    console.log('📰 Articles count:', articlesData[0].count);
    
    // Check certifications data
    const certificationsData = await sql`SELECT COUNT(*) as count FROM certifications`;
    console.log('🏆 Certifications count:', certificationsData[0].count);
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await sql.end();
  }
}

debugProduction();
