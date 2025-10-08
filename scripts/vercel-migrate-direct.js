const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function runDirectMigration() {
  console.log('🚀 Starting direct Vercel migration...');
  
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
      console.log('✅ All tables already exist, skipping migration');
      return;
    }

    // Read and execute migration files directly
    console.log('🔄 Running direct SQL migrations...');
    
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
              // Ignore "already exists" errors and transaction warnings
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
    
    console.log('✅ Direct migration completed successfully!');
    
    // Verify tables were created
    const newTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('home_content', 'about_content', 'articles', 'certifications', 'projects', 'user_profiles')
    `;
    
    console.log('📋 Tables after migration:', newTables.map(t => t.table_name));
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runDirectMigration();
