require('dotenv').config({ path: '.env.local' });

console.log('🔧 Testing R2 Configuration...');
console.log('CLOUDFLARE_R2_PUBLIC_URL:', process.env.CLOUDFLARE_R2_PUBLIC_URL);
console.log('CLOUDFLARE_R2_BUCKET_NAME:', process.env.CLOUDFLARE_R2_BUCKET_NAME);

// Test URL construction manually
const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME;

if (!publicUrl || !bucket) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const normalizedPublicUrl = publicUrl.replace(/\/$/, '');
const normalizedBucket = bucket.replace(/^\/+|\/+$/g, '');

console.log('Normalized Public URL:', normalizedPublicUrl);
console.log('Normalized Bucket:', normalizedBucket);

// Test URL construction with the actual image keys from the database
const testKeys = [
  'profile-1759941551429-hcsglj.png',
  'profile-1759941630754-nvsm6i.jpg'
];

console.log('\n🔗 Testing URL Construction:');
testKeys.forEach(key => {
  // Check if public URL includes bucket name
  const publicUrlIncludesBucket = normalizedPublicUrl.endsWith(`/${normalizedBucket}`);
  
  let url;
  if (publicUrlIncludesBucket) {
    url = `${normalizedPublicUrl}/${key}`;
  } else {
    url = `${normalizedPublicUrl}/${normalizedBucket}/${key}`;
  }
  
  console.log(`Key: ${key}`);
  console.log(`URL: ${url}`);
  console.log('---');
});