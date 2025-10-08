const https = require('https');

require('dotenv').config({ path: '.env.local' });

const {
  CLOUDFLARE_ACCOUNT_ID: ACCOUNT_ID = "",
  CLOUDFLARE_R2_BUCKET_NAME: BUCKET = "",
  CLOUDFLARE_R2_PUBLIC_URL: PUBLIC_URL = "",
} = process.env;

async function testUrlFormats() {
  console.log('🔍 Testing different URL formats...');
  console.log(`Account ID: ${ACCOUNT_ID}`);
  console.log(`Bucket: ${BUCKET}`);
  console.log(`Public URL: ${PUBLIC_URL}`);
  console.log('');
  
  const imageKey = 'profile-1759944791587-j4fcl4.png';
  
  // Test different URL formats
  const urls = [
    {
      name: 'Custom Domain URL (with bucket)',
      url: `${PUBLIC_URL}/${BUCKET}/${imageKey}`
    },
    {
      name: 'Custom Domain URL (without bucket)',
      url: `${PUBLIC_URL}/${imageKey}`
    },
    {
      name: 'Direct R2 URL',
      url: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET}/${imageKey}`
    },
    {
      name: 'R2 Dev Domain',
      url: `https://${BUCKET}.${ACCOUNT_ID}.r2.dev/${imageKey}`
    }
  ];
  
  for (const { name, url } of urls) {
    console.log(`\n📋 Testing: ${name}`);
    console.log(`URL: ${url}`);
    
    await testUrl(url);
  }
}

function testUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      console.log(`  Status Code: ${res.statusCode}`);
      console.log(`  Status Message: ${res.statusMessage}`);
      console.log(`  Content-Type: ${res.headers['content-type']}`);
      console.log(`  Content-Length: ${res.headers['content-length']}`);
      
      if (res.statusCode === 200) {
        console.log('  ✅ URL is accessible');
      } else {
        console.log('  ❌ URL is not accessible');
        
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (data && data.length > 0) {
            console.log(`  Response: ${data.substring(0, 100)}...`);
          }
          resolve();
        });
      }
    });
    
    req.on('error', (error) => {
      console.log(`  ❌ Error accessing URL: ${error.message}`);
      resolve();
    });
    
    req.setTimeout(10000, () => {
      console.log('  ❌ Request timed out');
      req.destroy();
      resolve();
    });
  });
}

testUrlFormats();