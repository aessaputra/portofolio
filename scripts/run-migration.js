const { drizzle } = require('drizzle-orm/postgres-js');
const { migrate } = require('drizzle-orm/postgres-js/migrator');
const postgres = require('postgres');
const path = require('path');

// Load environment variables from .env.local or from Vercel environment
require('dotenv').config({ path: '.env.local' });

// In production, Vercel provides DATABASE_URL directly
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  console.error('Available environment variables:', Object.keys(process.env).filter(key => key.includes('DATABASE')));
  process.exit(1);
}

console.log('Database URL found, connecting to database...');

const sql = postgres(process.env.DATABASE_URL, {
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
  max: 1, // Use only one connection for migration
});

const db = drizzle(sql);

async function runMigration() {
  console.log('Starting database migration...');
  console.log('Environment:', process.env.NODE_ENV);
  
  try {
    // Test database connection first
    await sql`SELECT 1`;
    console.log('Database connection successful');
    
    // Check if tables already exist
    const existingTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('home_content', 'about_content', 'articles', 'certifications', 'projects', 'user_profiles')
    `;
    
    console.log('Existing tables:', existingTables.map(t => t.table_name));
    
    if (existingTables.length === 6) {
      console.log('All required tables already exist, skipping migration');
      return;
    }
    
    // Run all migrations using Drizzle migrator
    await migrate(db, { migrationsFolder: path.join(__dirname, '..', 'drizzle') });
    console.log('Database migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    
    // If it's a table already exists error, that's okay
    if (error.cause && error.cause.code === '42P07') {
      console.log('Some tables already exist, this is normal for subsequent runs');
      return;
    }
    
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();