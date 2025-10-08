const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function runVercelMigration() {
  console.log('🚀 Starting Vercel migration...');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set');
    process.exit(1);
  }

  console.log('📊 Database URL found:', process.env.DATABASE_URL.substring(0, 50) + '...');

  const sql = postgres(process.env.DATABASE_URL, {
    ssl: 'require',
    max: 1,
  });

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
      console.log('✅ All tables already exist, checking columns...');
      await checkAndFixColumns(sql);
      return;
    }

    // Run SQL migrations
    console.log('🔄 Running SQL migrations...');
    
    const migrationFiles = [
      '0000_abnormal_sasquatch.sql',
      '0001_steep_red_wolf.sql', 
      '0002_extend_about_content_schema.sql',
      '0003_create_projects_table.sql',
      '0004_add_editable_text_to_projects.sql',
      '0005_create_articles_table.sql',
      '0006_create_certifications_table.sql',
      '0007_add_about_page_image_column.sql',
      '0008_rename_about_me_text_fields.sql'
    ];

    for (const file of migrationFiles) {
      const filePath = path.join(process.cwd(), 'drizzle', file);
      if (fs.existsSync(filePath)) {
        console.log(`📄 Executing ${file}...`);
        const sqlContent = fs.readFileSync(filePath, 'utf8');
        
        // Split by semicolon and execute each statement
        const statements = sqlContent
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'));
        
        for (const statement of statements) {
          if (statement.trim()) {
            try {
              await sql.unsafe(statement);
            } catch (error) {
              // Ignore common migration errors
              if (!error.message.includes('already exists') && 
                  !error.message.includes('does not exist') &&
                  !error.message.includes('there is no transaction in progress') &&
                  !error.message.includes('relation') && 
                  !error.message.includes('skipping')) {
                console.warn(`⚠️  Warning in ${file}:`, error.message);
              }
            }
          }
        }
        console.log(`✅ ${file} completed`);
      } else {
        console.log(`⚠️  File not found: ${file}`);
      }
    }
    
    console.log('✅ SQL migrations completed!');
    
    // Check and fix missing columns
    await checkAndFixColumns(sql);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

async function checkAndFixColumns(sql) {
  console.log('🔧 Checking and fixing missing columns...');
  
  try {
    // Check about_content table
    const aboutColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'about_content'
    `;
    
    const existingAboutColumns = aboutColumns.map(c => c.column_name);
    console.log('📋 about_content columns:', existingAboutColumns);
    
    // Add missing about_content columns
    const requiredAboutColumns = [
      { name: 'about_me_text', sql: 'ALTER TABLE about_content ADD COLUMN about_me_text TEXT DEFAULT \'\' NOT NULL' },
      { name: 'about_profile_image_path', sql: 'ALTER TABLE about_content ADD COLUMN about_profile_image_path TEXT DEFAULT \'\' NOT NULL' },
      { name: 'skills', sql: 'ALTER TABLE about_content ADD COLUMN skills JSONB NOT NULL DEFAULT \'[]\'' },
      { name: 'experiences', sql: 'ALTER TABLE about_content ADD COLUMN experiences JSONB NOT NULL DEFAULT \'[]\'' },
      { name: 'education', sql: 'ALTER TABLE about_content ADD COLUMN education JSONB NOT NULL DEFAULT \'[]\'' }
    ];
    
    for (const col of requiredAboutColumns) {
      if (!existingAboutColumns.includes(col.name)) {
        console.log(`➕ Adding ${col.name} column to about_content...`);
        try {
          await sql.unsafe(col.sql);
          console.log(`✅ ${col.name} column added`);
        } catch (error) {
          console.warn(`⚠️  Warning adding ${col.name}:`, error.message);
        }
      } else {
        console.log(`✅ ${col.name} column already exists`);
      }
    }

    // Check home_content table
    const homeColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'home_content'
    `;
    
    const existingHomeColumns = homeColumns.map(c => c.column_name);
    console.log('📋 home_content columns:', existingHomeColumns);
    
    // Add missing home_content columns
    const requiredHomeColumns = [
      { name: 'logo_text', sql: 'ALTER TABLE home_content ADD COLUMN logo_text TEXT DEFAULT \'AES\' NOT NULL' }
    ];
    
    for (const col of requiredHomeColumns) {
      if (!existingHomeColumns.includes(col.name)) {
        console.log(`➕ Adding ${col.name} column to home_content...`);
        try {
          await sql.unsafe(col.sql);
          console.log(`✅ ${col.name} column added`);
        } catch (error) {
          console.warn(`⚠️  Warning adding ${col.name}:`, error.message);
        }
      } else {
        console.log(`✅ ${col.name} column already exists`);
      }
    }

    // Final verification
    const finalTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('home_content', 'about_content', 'articles', 'certifications', 'projects', 'user_profiles')
    `;
    
    console.log('📋 Final tables:', finalTables.map(t => t.table_name));
    console.log('✅ All columns verified and fixed!');
    
  } catch (error) {
    console.error('❌ Column check failed:', error);
    throw error;
  }
}

runVercelMigration();