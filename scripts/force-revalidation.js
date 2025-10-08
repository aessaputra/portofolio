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

async function forceRevalidation() {
  console.log('🔄 Forcing revalidation by updating home content...');
  
  try {
    // Get current home content
    const current = await sql`SELECT * FROM home_content LIMIT 1`;
    
    if (current.length === 0) {
      console.log('❌ No home content found');
      return;
    }
    
    const currentData = current[0];
    console.log('📝 Current headline:', currentData.headline);
    
    // Update with a small change to trigger revalidation
    const updatedAt = new Date().toISOString();
    await sql`
      UPDATE home_content 
      SET updated_at = ${updatedAt}
      WHERE id = ${currentData.id}
    `;
    
    console.log('✅ Home content updated with new timestamp');
    console.log('🕐 New updated_at:', updatedAt);
    
    // Also update about content if it exists
    const aboutCurrent = await sql`SELECT * FROM about_content LIMIT 1`;
    if (aboutCurrent.length > 0) {
      await sql`
        UPDATE about_content 
        SET updated_at = ${updatedAt}
        WHERE id = ${aboutCurrent[0].id}
      `;
      console.log('✅ About content also updated');
    }
    
    console.log('🎉 Revalidation triggered! Changes should be visible now.');
    
  } catch (error) {
    console.error('❌ Revalidation failed:', error);
  } finally {
    await sql.end();
  }
}

forceRevalidation();
