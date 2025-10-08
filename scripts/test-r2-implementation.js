const { buildR2PublicUrl, buildDirectR2Url, buildCustomDomainUrl, getAllPossibleUrls } = require('../src/shared/lib/r2UrlManager.js');

require('dotenv').config({ path: '.env.local' });

console.log('🔧 Testing Enhanced R2 Implementation...');
console.log('CLOUDFLARE_R2_PUBLIC_URL:', process.env.CLOUDFLARE_R2_PUBLIC_URL);
console.log('CLOUDFLARE_R2_BUCKET_NAME:', process.env.CLOUDFLARE_R2_BUCKET_NAME);
console.log('CLOUDFLARE_ACCOUNT_ID:', process.env.CLOUDFLARE_ACCOUNT_ID);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('');

// Test image keys from the database
const testKeys = [
  'profile-1759941551429-hcsglj.png',
  'profile-1759941630754-nvsm6i.jpg'
];

console.log('🔗 Testing URL Construction:');
testKeys.forEach(key => {
  console.log(`\nKey: ${key}`);
  
  const publicUrl = buildR2PublicUrl(key);
  const directUrl = buildDirectR2Url(key);
  const customDomainUrl = buildCustomDomainUrl(key);
  const allUrls = getAllPossibleUrls(key);
  
  console.log(`Public URL: ${publicUrl}`);
  console.log(`Direct R2 URL: ${directUrl}`);
  console.log(`Custom Domain URL: ${customDomainUrl}`);
  console.log('All URLs:', JSON.stringify(allUrls, null, 2));
});

console.log('\n✅ Testing complete!');