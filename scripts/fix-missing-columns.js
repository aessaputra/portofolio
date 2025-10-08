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

    // Fix about_content table - add missing about_me_text column
    console.log('🔧 Checking about_content table...');
    const aboutColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'about_content' 
      AND column_name = 'about_me_text'
    `;
    
    if (aboutColumns.length === 0) {
      console.log('➕ Adding about_me_text column to about_content...');
      await sql`ALTER TABLE about_content ADD COLUMN about_me_text TEXT DEFAULT ''`;
      await sql`ALTER TABLE about_content ALTER COLUMN about_me_text SET NOT NULL`;
      console.log('✅ about_me_text column added');
    } else {
      console.log('✅ about_me_text column already exists');
    }

    // Fix home_content table - add missing logo_text column
    console.log('🔧 Checking home_content table...');
    const homeColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'home_content' 
      AND column_name = 'logo_text'
    `;
    
    if (homeColumns.length === 0) {
      console.log('➕ Adding logo_text column to home_content...');
      await sql`ALTER TABLE home_content ADD COLUMN logo_text TEXT DEFAULT 'AES' NOT NULL`;
      console.log('✅ logo_text column added');
    } else {
      console.log('✅ logo_text column already exists');
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
