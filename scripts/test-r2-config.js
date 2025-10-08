const { buildR2PublicUrlFromKey, getR2PublicConfig } = require('../src/shared/lib/r2PublicUrl.js');

require('dotenv').config({ path: '.env.local' });

console.log('🔧 Testing R2 Configuration...');
console.log('CLOUDFLARE_R2_PUBLIC_URL:', process.env.CLOUDFLARE_R2_PUBLIC_URL);
console.log('CLOUDFLARE_R2_BUCKET_NAME:', process.env.CLOUDFLARE_R2_BUCKET_NAME);

try {
  const config = getR2PublicConfig();
  console.log('✅ R2 Config:', config);
  
  // Test URL construction with the actual image keys from the database
  const testKeys = [
    'profile-1759941551429-hcsglj.png',
    'profile-1759941630754-nvsm6i.jpg'
  ];
  
  console.log('\n🔗 Testing URL Construction:');
  testKeys.forEach(key => {
    const url = buildR2PublicUrlFromKey(key);
    console.log(`Key: ${key}`);
    console.log(`URL: ${url}`);
    console.log('---');
  });
  
} catch (error) {
  console.error('❌ Error:', error.message);
}