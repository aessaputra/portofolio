const { drizzle } = require('drizzle-orm/postgres-js');
const { migrate } = require('drizzle-orm/postgres-js/migrator');
const postgres = require('postgres');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function runVercelMigration() {
  console.log('🚀 Starting Vercel migration...');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set');
    console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('DATABASE')));
    process.exit(1);
  }

  console.log('📊 Database URL found:', process.env.DATABASE_URL.substring(0, 50) + '...');

  const sql = postgres(process.env.DATABASE_URL, {
    ssl: process.env.DATABASE_URL.includes('sslmode=require') ? 'require' : 'require',
    max: 1,
  });

  const db = drizzle(sql);

  try {
    // Test connection
    await sql`SELECT 1`;
    console.log('✅ Database connection successful');

    // Check if tables exist
    const existingTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('home_content', 'about_content', 'articles', 'certifications', 'projects', 'user_profiles')
    `;
    
    console.log('📋 Existing tables:', existingTables.map(t => t.table_name));

    if (existingTables.length === 6) {
      console.log('✅ All tables already exist, skipping migration');
      return;
    }

    // Run migrations
    console.log('🔄 Running migrations...');
    await migrate(db, { 
      migrationsFolder: path.join(__dirname, '..', 'drizzle') 
    });
    
    console.log('✅ Migration completed successfully!');
    
    // Wait a bit for tables to be created
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify tables were created
    const newTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('home_content', 'about_content', 'articles', 'certifications', 'projects', 'user_profiles')
    `;
    
    console.log('📋 Tables after migration:', newTables.map(t => t.table_name));
    
    if (newTables.length === 0) {
      console.log('⚠️  No tables found after migration, checking all tables...');
      const allTables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      console.log('📋 All tables in public schema:', allTables.map(t => t.table_name));
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runVercelMigration();
