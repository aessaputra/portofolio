const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");

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

async function inventoryImages() {
  console.log('🔍 Inventorying images in database and R2 bucket...');
  
  try {
    // Get images from database
    console.log('\n📋 Images in database:');
    
    const homeResult = await sql`SELECT profile_image_path FROM home_content LIMIT 1`;
    const aboutResult = await sql`SELECT about_profile_image_path FROM about_content LIMIT 1`;
    
    const dbImages = [];
    
    if (homeResult && homeResult.length > 0 && homeResult[0].profile_image_path) {
      const homeImage = homeResult[0].profile_image_path;
      console.log(`Home content: ${homeImage}`);
      dbImages.push(homeImage);
    }
    
    if (aboutResult && aboutResult.length > 0 && aboutResult[0].about_profile_image_path) {
      const aboutImage = aboutResult[0].about_profile_image_path;
      console.log(`About content: ${aboutImage}`);
      dbImages.push(aboutImage);
    }
    
    // Get images from R2 bucket
    console.log('\n🪣 Images in R2 bucket:');
    
    const {
      CLOUDFLARE_ACCOUNT_ID: ACCOUNT_ID = "",
      CLOUDFLARE_R2_ACCESS_KEY_ID: ACCESS_KEY_ID = "",
      CLOUDFLARE_R2_SECRET_ACCESS_KEY: SECRET_ACCESS_KEY = "",
      CLOUDFLARE_R2_BUCKET_NAME: BUCKET = "",
    } = process.env;
    
    if (!ACCOUNT_ID || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY || !BUCKET) {
      console.error('Missing required Cloudflare R2 environment variables');
      return;
    }
    
    const r2Client = new S3Client({
      region: "auto",
      endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { 
        accessKeyId: ACCESS_KEY_ID, 
        secretAccessKey: SECRET_ACCESS_KEY 
      },
      forcePathStyle: true,
    });
    
    const command = new ListObjectsV2Command({
      Bucket: BUCKET,
    });
    
    const response = await r2Client.send(command);
    const r2Images = [];
    
    if (response.Contents) {
      for (const obj of response.Contents) {
        console.log(`R2 object: ${obj.Key} (${obj.Size} bytes)`);
        r2Images.push(obj.Key);
      }
    }
    
    // Compare and find discrepancies
    console.log('\n🔍 Analysis:');
    
    // Extract image keys from database URLs
    const dbImageKeys = dbImages.map(url => {
      const parts = url.split('/');
      return parts[parts.length - 1];
    });
    
    console.log('Database image keys:', dbImageKeys);
    console.log('R2 image keys:', r2Images);
    
    // Find missing images
    const missingInR2 = dbImageKeys.filter(key => !r2Images.includes(key));
    const extraInR2 = r2Images.filter(key => !dbImageKeys.includes(key));
    
    if (missingInR2.length > 0) {
      console.log('\n❌ Images referenced in database but missing in R2:');
      missingInR2.forEach(key => console.log(`  - ${key}`));
    }
    
    if (extraInR2.length > 0) {
      console.log('\n📦 Images in R2 but not referenced in database:');
      extraInR2.forEach(key => console.log(`  - ${key}`));
    }
    
    if (missingInR2.length === 0 && extraInR2.length === 0) {
      console.log('\n✅ All images are synchronized');
    }
    
  } catch (error) {
    console.error('❌ Error inventorying images:', error);
  } finally {
    await sql.end();
  }
}

inventoryImages();