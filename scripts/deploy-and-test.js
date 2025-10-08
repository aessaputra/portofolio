const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting deployment and test process...');

try {
  // 1. Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  // 2. Run migration
  console.log('🗄️ Running database migration...');
  execSync('NODE_ENV=production npm run db:run-migration', { stdio: 'inherit' });
  
  // 3. Force revalidation
  console.log('🔄 Forcing revalidation...');
  execSync('NODE_ENV=production npm run db:revalidate', { stdio: 'inherit' });
  
  // 4. Build application
  console.log('🔨 Building application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Deployment process completed successfully!');
  console.log('🎉 Your changes should now be visible in production.');
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Commit and push your changes to trigger Vercel deployment');
  console.log('2. Wait for Vercel to complete the build');
  console.log('3. Check your production site for updated content');
  console.log('');
  console.log('🔧 If changes still don\'t appear:');
  console.log('- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)');
  console.log('- Check Vercel deployment logs');
  console.log('- Run: npm run db:debug to verify data');
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
