const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function fixMissingColumns() {
  console.log('🔧 Fixing missing columns...');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set');
    process.exit(1);
  }

  const sql = postgres(process.env.DATABASE_URL, {
    ssl: 'require',
    max: 1,
  });

  try {
    // Test connection
    await sql`SELECT 1`;
    console.log('✅ Database connection successful');

    // Fix about_content table - add all missing columns
    console.log('🔧 Checking about_content table...');
    
    const aboutColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'about_content'
    `;
    
    const existingAboutColumns = aboutColumns.map(c => c.column_name);
    console.log('📋 Existing about_content columns:', existingAboutColumns);
    
    // Add missing columns
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

    // Fix home_content table - add all missing columns
    console.log('🔧 Checking home_content table...');
    
    const homeColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'home_content'
    `;
    
    const existingHomeColumns = homeColumns.map(c => c.column_name);
    console.log('📋 Existing home_content columns:', existingHomeColumns);
    
    // Add missing columns
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

    // Verify all required columns exist
    console.log('🔍 Verifying all columns...');
    const aboutContentColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'about_content' 
      AND column_name IN ('about_me_text', 'skills', 'experiences', 'education')
    `;
    
    const homeContentColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'home_content' 
      AND column_name = 'logo_text'
    `;
    
    console.log('📋 about_content columns:', aboutContentColumns.map(c => c.column_name));
    console.log('📋 home_content columns:', homeContentColumns.map(c => c.column_name));
    
    console.log('✅ Missing columns fixed successfully!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

fixMissingColumns();
