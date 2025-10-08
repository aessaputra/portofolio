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

async function fixMalformedUrls() {
  console.log('🔧 Fixing malformed URLs in database...');
  
  try {
    // Get current home content
    const current = await sql`SELECT * FROM home_content LIMIT 1`;
    
    if (!current || current.length === 0) {
      console.log('❌ No home content found');
      return;
    }
    
    const homeContent = current[0];
    console.log('Current profile_image_path:', homeContent.profile_image_path);
    
    // Check if the URL is malformed (contains repeated patterns)
    const profileImagePath = homeContent.profile_image_path;
    if (!profileImagePath) {
      console.log('✅ No profile image path to fix');
      return;
    }
    
    // Fix the malformed URL by extracting the actual image path
    let fixedPath = profileImagePath;
    
    // If the URL contains repeated patterns, extract the actual image path
    if (profileImagePath.includes('cdn.aes.my.id/my-portofolio/')) {
      // Extract the last occurrence of the pattern
      const parts = profileImagePath.split('cdn.aes.my.id/my-portofolio/');
      const lastPart = parts[parts.length - 1];
      
      // Rebuild the correct URL
      fixedPath = `https://cdn.aes.my.id/my-portofolio/${lastPart}`;
      
      console.log('Fixed profile_image_path:', fixedPath);
      
      // Update the database
      const [updated] = await sql`
        UPDATE home_content 
        SET 
          profile_image_path = ${fixedPath},
          updated_at = NOW()
        WHERE id = ${homeContent.id}
        RETURNING *
      `;
      
      console.log('✅ Updated home content with fixed URL');
      console.log('Updated profile_image_path:', updated.profile_image_path);
    } else {
      console.log('✅ Profile image path appears to be correct');
    }
    
    // Also check about content
    const aboutCurrent = await sql`SELECT * FROM about_content LIMIT 1`;
    
    if (aboutCurrent && aboutCurrent.length > 0) {
      const aboutContent = aboutCurrent[0];
      console.log('Current about_profile_image_path:', aboutContent.about_profile_image_path);
      
      // Fix the about profile image path if needed
      const aboutProfileImagePath = aboutContent.about_profile_image_path;
      if (aboutProfileImagePath && aboutProfileImagePath.includes('cdn.aes.my.id/my-portofolio/')) {
        const parts = aboutProfileImagePath.split('cdn.aes.my.id/my-portofolio/');
        const lastPart = parts[parts.length - 1];
        
        const fixedAboutPath = `https://cdn.aes.my.id/my-portofolio/${lastPart}`;
        
        console.log('Fixed about_profile_image_path:', fixedAboutPath);
        
        // Update the database
        await sql`
          UPDATE about_content 
          SET 
            about_profile_image_path = ${fixedAboutPath},
            updated_at = NOW()
          WHERE id = ${aboutContent.id}
        `;
        
        console.log('✅ Updated about content with fixed URL');
      } else {
        console.log('✅ About profile image path appears to be correct');
      }
    }
    
  } catch (error) {
    console.error('❌ Error fixing malformed URLs:', error);
  } finally {
    await sql.end();
  }
}

fixMalformedUrls();