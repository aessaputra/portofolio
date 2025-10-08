const { S3Client, HeadObjectCommand } = require("@aws-sdk/client-s3");

require('dotenv').config({ path: '.env.local' });

const {
  CLOUDFLARE_ACCOUNT_ID: ACCOUNT_ID = "",
  CLOUDFLARE_R2_ACCESS_KEY_ID: ACCESS_KEY_ID = "",
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: SECRET_ACCESS_KEY = "",
  CLOUDFLARE_R2_BUCKET_NAME: BUCKET = "",
} = process.env;

// R2 client configuration
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { 
    accessKeyId: ACCESS_KEY_ID, 
    secretAccessKey: SECRET_ACCESS_KEY 
  },
  forcePathStyle: true,
});

// Test image keys from the database
const testKeys = [
  'profile-1759941551429-hcsglj.png',
  'profile-1759941630754-nvsm6i.jpg'
];

async function checkImageExists(key) {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });
    
    const result = await r2Client.send(command);
    console.log(`✅ Image exists: ${key}`);
    console.log(`   Content-Type: ${result.ContentType}`);
    console.log(`   Content-Length: ${result.ContentLength}`);
    console.log(`   Last-Modified: ${result.LastModified}`);
    return true;
  } catch (error) {
    if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
      console.log(`❌ Image not found: ${key}`);
    } else {
      console.log(`❌ Error checking ${key}:`, error.message);
    }
    return false;
  }
}

async function main() {
  console.log('🔍 Checking if images exist in R2...');
  console.log('Bucket:', BUCKET);
  console.log('');
  
  for (const key of testKeys) {
    await checkImageExists(key);
    console.log('---');
  }
}

main().catch(console.error);