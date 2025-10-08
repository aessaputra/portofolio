const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

require('dotenv').config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, {
  ssl: process.env.DATABASE_URL.includes('sslmode=require') ? 'require' : (process.env.NODE_ENV === 'production' ? 'require' : false),
  max: 1,
});

const db = drizzle(sql);

async function updateDatabaseUrls() {
  console.log('🔧 Updating database URLs with corrected format...');
  
  try {
    // Get current home content
    const homeResult = await sql`SELECT * FROM home_content LIMIT 1`;
    
    if (!homeResult || homeResult.length === 0) {
      console.log('❌ No home content found');
      return;
    }
    
    const homeContent = homeResult[0];
    console.log('Current profile_image_path:', homeContent.profile_image_path);
    
    // Fix the home content profile image path
    if (homeContent.profile_image_path) {
      // Extract the image key from the URL
      const urlParts = homeContent.profile_image_path.split('/');
      const imageKey = urlParts[urlParts.length - 1];
      
      // Build the corrected URL without the bucket name
      const correctedUrl = `https://cdn.aes.my.id/${imageKey}`;
      
      console.log('Corrected profile_image_path:', correctedUrl);
      
      // Update the database
      const [updated] = await sql`
        UPDATE home_content 
        SET 
          profile_image_path = ${correctedUrl},
          updated_at = NOW()
        WHERE id = ${homeContent.id}
        RETURNING *
      `;
      
      console.log('✅ Updated home content with corrected URL');
      console.log('Updated profile_image_path:', updated.profile_image_path);
    }
    
    // Get about content
    const aboutResult = await sql`SELECT * FROM about_content LIMIT 1`;
    
    if (aboutResult && aboutResult.length > 0) {
      const aboutContent = aboutResult[0];
      console.log('Current about_profile_image_path:', aboutContent.about_profile_image_path);
      
      // Fix the about content profile image path
      if (aboutContent.about_profile_image_path) {
        // Extract the image key from the URL
        const urlParts = aboutContent.about_profile_image_path.split('/');
        const imageKey = urlParts[urlParts.length - 1];
        
        // Build the corrected URL without the bucket name
        const correctedUrl = `https://cdn.aes.my.id/${imageKey}`;
        
        console.log('Corrected about_profile_image_path:', correctedUrl);
        
        // Update the database
        await sql`
          UPDATE about_content 
          SET 
            about_profile_image_path = ${correctedUrl},
            updated_at = NOW()
          WHERE id = ${aboutContent.id}
        `;
        
        console.log('✅ Updated about content with corrected URL');
      }
    }
    
  } catch (error) {
    console.error('❌ Error updating database URLs:', error);
  } finally {
    await sql.end();
  }
}

updateDatabaseUrls();