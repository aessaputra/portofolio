const { drizzle } = require('drizzle-orm/node-postgres');
const { migrate } = require('drizzle-orm/postgres-js/migrator');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

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

async function runMigration() {
  console.log('Starting database migration...');
  
  try {
    // Check if migration table exists
    const migrationTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'drizzle_migrations'
      );
    `);
    
    const migrationTableExists = migrationTableCheck.rows[0].exists;
    console.log('Migration table exists:', migrationTableExists);
    
    // Check if about_content table exists
    const aboutContentTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'about_content'
      );
    `);
    
    const aboutContentTableExists = aboutContentTableCheck.rows[0].exists;
    console.log('About content table exists:', aboutContentTableExists);
    
    // Check current columns in about_content table
    if (aboutContentTableExists) {
      const columnsQuery = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'about_content'
        ORDER BY ordinal_position
      `);
      
      const columns = columnsQuery.rows.map(row => row.column_name);
      console.log('Current columns:', columns);
      
      // Check if new columns exist
      const hasSkills = columns.includes('skills');
      const hasExperiences = columns.includes('experiences');
      const hasEducation = columns.includes('education');
      
      console.log('Has skills column:', hasSkills);
      console.log('Has experiences column:', hasExperiences);
      console.log('Has education column:', hasEducation);
      
      // If new columns don't exist, run the migration
      if (!hasSkills || !hasExperiences || !hasEducation) {
        console.log('New columns missing, running migration...');
        
        // Read the migration file
        const migrationPath = path.join(__dirname, '..', 'drizzle', '0002_extend_about_content_schema.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        // Execute the migration
        await pool.query(migrationSQL);
        console.log('Migration completed successfully');
      } else {
        console.log('All required columns already exist');
      }
    } else {
      console.log('About content table does not exist, creating it...');
      
      // Read the first migration file
      const firstMigrationPath = path.join(__dirname, '..', 'drizzle', '0001_courageous_panda.sql');
      const firstMigrationSQL = fs.readFileSync(firstMigrationPath, 'utf8');
      
      // Execute the first migration
      await pool.query(firstMigrationSQL);
      console.log('First migration completed successfully');
      
      // Read the second migration file
      const secondMigrationPath = path.join(__dirname, '..', 'drizzle', '0002_extend_about_content_schema.sql');
      const secondMigrationSQL = fs.readFileSync(secondMigrationPath, 'utf8');
      
      // Execute the second migration
      await pool.query(secondMigrationSQL);
      console.log('Second migration completed successfully');
    }
    
    // Check if projects table exists
    const projectsTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'projects'
      );
    `);
    
    const projectsTableExists = projectsTableCheck.rows[0].exists;
    console.log('Projects table exists:', projectsTableExists);
    
    // If projects table doesn't exist, create it
    if (!projectsTableExists) {
      console.log('Projects table does not exist, creating it...');
      
      // Read the projects migration file
      const projectsMigrationPath = path.join(__dirname, '..', 'drizzle', '0003_create_projects_table.sql');
      const projectsMigrationSQL = fs.readFileSync(projectsMigrationPath, 'utf8');
      
      // Execute the projects migration
      await pool.query(projectsMigrationSQL);
      console.log('Projects table created successfully');
    } else {
      console.log('Projects table already exists');
    }
    
    // Check if editable_text column exists in projects table
    const editableTextColumnCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'projects'
        AND column_name = 'editable_text'
      );
    `);
    
    const editableTextColumnExists = editableTextColumnCheck.rows[0].exists;
    console.log('Editable text column exists:', editableTextColumnExists);
    
    // If editable_text column doesn't exist, add it
    if (!editableTextColumnExists) {
      console.log('Editable text column does not exist, adding it...');
      
      // Read the editable text migration file
      const editableTextMigrationPath = path.join(__dirname, '..', 'drizzle', '0004_add_editable_text_to_projects.sql');
      const editableTextMigrationSQL = fs.readFileSync(editableTextMigrationPath, 'utf8');
      
      // Execute the editable text migration
      await pool.query(editableTextMigrationSQL);
      console.log('Editable text column added successfully');
    } else {
      console.log('Editable text column already exists');
    }
    
    // Check if articles table exists
    const articlesTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'articles'
      );
    `);
    
    const articlesTableExists = articlesTableCheck.rows[0].exists;
    console.log('Articles table exists:', articlesTableExists);
    
    // If articles table doesn't exist, create it
    if (!articlesTableExists) {
      console.log('Articles table does not exist, creating it...');
      
      // Read the articles migration file
      const articlesMigrationPath = path.join(__dirname, '..', 'drizzle', '0005_create_articles_table.sql');
      const articlesMigrationSQL = fs.readFileSync(articlesMigrationPath, 'utf8');
      
      // Execute the articles migration
      await pool.query(articlesMigrationSQL);
      console.log('Articles table created successfully');
    } else {
      console.log('Articles table already exists');
    }
    
    console.log('Database migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();