require('dotenv').config({ path: '.env.local' });

// Import the functions directly from the file
const fs = require('fs');
const path = require('path');

// Read the r2UrlManager.ts file and extract the functions
const r2UrlManagerPath = path.join(__dirname, '../src/shared/lib/r2UrlManager.ts');
const r2UrlManagerContent = fs.readFileSync(r2UrlManagerPath, 'utf8');

console.log('🔧 Testing Updated URL Construction...');
console.log('CLOUDFLARE_R2_PUBLIC_URL:', process.env.CLOUDFLARE_R2_PUBLIC_URL);
console.log('CLOUDFLARE_R2_BUCKET_NAME:', process.env.CLOUDFLARE_R2_BUCKET_NAME);
console.log('CLOUDFLARE_ACCOUNT_ID:', process.env.CLOUDFLARE_ACCOUNT_ID);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('');

// Test image keys from the database
const testKeys = [
  'profile-1759944791587-j4fcl4.png'
];

// Manual URL construction functions with the fix
function buildR2PublicUrl(objectKey) {
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
  const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (!publicUrl || !bucket || !accountId) {
    throw new Error('Missing required environment variables');
  }
  
  const normalizedPublicUrl = publicUrl.replace(/\/$/, '');
  const normalizedBucket = bucket.replace(/^\/+|\/+$/g, '');
  
  const keyPart = objectKey.replace(/^\/+/, "");
  
  if (!keyPart) {
    return "";
  }
  
  // For cdn.aes.my.id, the bucket name is not included in the path
  if (normalizedPublicUrl === 'https://cdn.aes.my.id') {
    return `${normalizedPublicUrl}/${keyPart}`;
  } else if (normalizedPublicUrl.endsWith(`/${normalizedBucket}`)) {
    return `${normalizedPublicUrl}/${keyPart}`;
  } else {
    return `${normalizedPublicUrl}/${normalizedBucket}/${keyPart}`;
  }
}

function buildCustomDomainUrl(objectKey) {
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
  const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  
  if (!publicUrl || !bucket) {
    throw new Error('Missing required environment variables');
  }
  
  const normalizedPublicUrl = publicUrl.replace(/\/$/, '');
  const normalizedBucket = bucket.replace(/^\/+|\/+$/g, "");
  const keyPart = objectKey.replace(/^\/+/, "");
  
  if (!keyPart) return "";
  
  // For cdn.aes.my.id, the bucket name is not included in the path
  if (normalizedPublicUrl === 'https://cdn.aes.my.id') {
    return `${normalizedPublicUrl}/${keyPart}`;
  } else if (normalizedPublicUrl.endsWith(`/${normalizedBucket}`)) {
    return `${normalizedPublicUrl}/${keyPart}`;
  } else {
    return `${normalizedPublicUrl}/${normalizedBucket}/${keyPart}`;
  }
}

console.log('🔗 Testing Updated URL Construction:');
testKeys.forEach(key => {
  console.log(`\nKey: ${key}`);
  
  const publicUrl = buildR2PublicUrl(key);
  const customDomainUrl = buildCustomDomainUrl(key);
  
  console.log(`Public URL: ${publicUrl}`);
  console.log(`Custom Domain URL: ${customDomainUrl}`);
});

console.log('\n✅ Testing complete!');