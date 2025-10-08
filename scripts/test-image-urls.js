const https = require('https');
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

async function testImageUrls() {
  console.log('🔍 Testing image URL accessibility...');
  
  try {
    // Get home content
    const homeResult = await sql`SELECT * FROM home_content LIMIT 1`;
    
    if (!homeResult || homeResult.length === 0) {
      console.log('❌ No home content found');
      return;
    }
    
    const homeContent = homeResult[0];
    console.log('Home content profile_image_path:', homeContent.profile_image_path);
    
    // Test the home content profile image URL
    if (homeContent.profile_image_path) {
      await testUrl(homeContent.profile_image_path, 'Home content profile image');
    }
    
    // Get about content
    const aboutResult = await sql`SELECT * FROM about_content LIMIT 1`;
    
    if (aboutResult && aboutResult.length > 0) {
      const aboutContent = aboutResult[0];
      console.log('About content about_profile_image_path:', aboutContent.about_profile_image_path);
      
      // Test the about content profile image URL
      if (aboutContent.about_profile_image_path) {
        await testUrl(aboutContent.about_profile_image_path, 'About content profile image');
      }
    }
    
    // Test direct R2 URLs
    console.log('\n🔗 Testing direct R2 URLs...');
    
    const testKeys = [
      'profile-1759944063193-tt7wpv.png',
      'about-1759944351724-oky8kd.png'
    ];
    
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME;
    
    for (const key of testKeys) {
      const directUrl = `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${key}`;
      await testUrl(directUrl, `Direct R2 URL for ${key}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing image URLs:', error);
  } finally {
    await sql.end();
  }
}

function testUrl(url, description) {
  return new Promise((resolve) => {
    console.log(`\n📋 Testing: ${description}`);
    console.log(`URL: ${url}`);
    
    const req = https.get(url, (res) => {
      console.log(`Status Code: ${res.statusCode}`);
      console.log(`Status Message: ${res.statusMessage}`);
      console.log(`Content-Type: ${res.headers['content-type']}`);
      console.log(`Content-Length: ${res.headers['content-length']}`);
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ URL is accessible');
        } else {
          console.log('❌ URL is not accessible');
          console.log(`Response data: ${data.substring(0, 200)}...`);
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Error accessing URL: ${error.message}`);
      resolve();
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ Request timed out');
      req.destroy();
      resolve();
    });
  });
}

testImageUrls();