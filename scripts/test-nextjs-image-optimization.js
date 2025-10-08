const https = require('https');

require('dotenv').config({ path: '.env.local' });

async function testNextJsImageOptimization() {
  console.log('🔍 Testing Next.js Image Optimization...');
  
  const imageUrl = 'https://cdn.aes.my.id/profile-1759944791587-j4fcl4.png';
  const encodedImageUrl = encodeURIComponent(imageUrl);
  
  // Test different Next.js image optimization endpoints
  const testUrls = [
    {
      name: 'Production Image Optimization',
      url: `https://aes.my.id/_next/image?url=${encodedImageUrl}&w=1920&q=95`
    },
    {
      name: 'Direct Image URL',
      url: imageUrl
    }
  ];
  
  for (const { name, url } of testUrls) {
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
      console.log(`  Cache-Control: ${res.headers['cache-control']}`);
      
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
            console.log(`  Response: ${data.substring(0, 200)}...`);
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

testNextJsImageOptimization();