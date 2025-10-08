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

// Manual URL construction functions
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
  
  // For R2.dev domains, don't include bucket name in path
  if (normalizedPublicUrl.includes('.r2.dev') && !isProduction) {
    return `${normalizedPublicUrl}/${objectKey}`;
  }
  
  if (normalizedPublicUrl.endsWith(`/${normalizedBucket}`)) {
    return `${normalizedPublicUrl}/${objectKey}`;
  }
  
  return `${normalizedPublicUrl}/${normalizedBucket}/${objectKey}`;
}

function buildDirectR2Url(objectKey) {
  const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  
  if (!bucket || !accountId) {
    throw new Error('Missing required environment variables');
  }
  
  const normalizedBucket = bucket.replace(/^\/+|\/+$/g, '');
  const keyPart = objectKey.replace(/^\/+/, "");
  
  return `https://${accountId}.r2.cloudflarestorage.com/${normalizedBucket}/${keyPart}`;
}

function buildCustomDomainUrl(objectKey) {
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
  const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  
  if (!publicUrl || !bucket) {
    throw new Error('Missing required environment variables');
  }
  
  const normalizedPublicUrl = publicUrl.replace(/\/$/, '');
  const normalizedBucket = bucket.replace(/^\/+|\/+$/g, '');
  const keyPart = objectKey.replace(/^\/+/, "");
  
  if (normalizedPublicUrl.endsWith(`/${normalizedBucket}`)) {
    return `${normalizedPublicUrl}/${keyPart}`;
  }
  
  return `${normalizedPublicUrl}/${normalizedBucket}/${keyPart}`;
}

function getAllPossibleUrls(objectKey) {
  const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
  
  if (!bucket || !accountId || !publicUrl) {
    throw new Error('Missing required environment variables');
  }
  
  const normalizedPublicUrl = publicUrl.replace(/\/$/, '');
  const normalizedBucket = bucket.replace(/^\/+|\/+$/g, "");
  const keyPart = objectKey.replace(/^\/+/, "");
  
  return {
    customDomain: buildCustomDomainUrl(objectKey),
    directR2: buildDirectR2Url(objectKey),
    r2DevDomain: `https://${normalizedBucket}.${accountId}.r2.dev/${keyPart}`,
  };
}

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