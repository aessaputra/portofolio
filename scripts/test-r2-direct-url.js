const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

require('dotenv').config({ path: '.env.local' });

const {
  CLOUDFLARE_ACCOUNT_ID: ACCOUNT_ID = "",
  CLOUDFLARE_R2_ACCESS_KEY_ID: ACCESS_KEY_ID = "",
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: SECRET_ACCESS_KEY = "",
  CLOUDFLARE_R2_BUCKET_NAME: BUCKET = "",
  CLOUDFLARE_R2_PUBLIC_URL: PUBLIC_URL = "",
} = process.env;

// Test image keys from the database
const testKeys = [
  'profile-1759941551429-hcsglj.png',
  'profile-1759941630754-nvsm6i.jpg'
];

// Generate direct R2 URL
function getDirectR2Url(key) {
  return `https://${ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET}/${key}`;
}

// Generate custom domain URL
function getCustomDomainUrl(key) {
  return `${PUBLIC_URL}/${BUCKET}/${key}`;
}

async function main() {
  console.log('🔗 Testing R2 URL accessibility...');
  console.log('Bucket:', BUCKET);
  console.log('Public URL:', PUBLIC_URL);
  console.log('Account ID:', ACCOUNT_ID);
  console.log('');
  
  for (const key of testKeys) {
    const directUrl = getDirectR2Url(key);
    const customUrl = getCustomDomainUrl(key);
    
    console.log(`Key: ${key}`);
    console.log(`Direct R2 URL: ${directUrl}`);
    console.log(`Custom Domain URL: ${customUrl}`);
    console.log('');
  }
}

main().catch(console.error);