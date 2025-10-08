const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

require('dotenv').config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, {
  ssl: process.env.DATABASE_URL.includes('sslmode=require') ? 'require' : (process.env.NODE_ENV === 'production' ? 'require' : false),
  max: 1,
});

const db = drizzle(sql);

async function testHomeContentUpdate() {
  console.log('🔧 Testing home content update...');
  
  try {
    // Test data
    const testData = {
      headline: "Test Headline from Script",
      subheadline: "Test subheadline from script - this should appear on the website",
      resumeUrl: "https://example.com/resume",
      contactEmail: "test@example.com",
      githubUrl: "https://github.com/test",
      linkedinUrl: "https://linkedin.com/in/test",
      xUrl: "https://twitter.com/test",
      logoText: "TEST",
      showHireMe: true,
    };
    
    console.log('Test data:', testData);
    
    // Get current record
    const current = await sql`SELECT * FROM home_content LIMIT 1`;
    console.log('Current record:', current[0]);
    
    // Update record
    const [updated] = await sql`
      UPDATE home_content 
      SET 
        headline = ${testData.headline},
        subheadline = ${testData.subheadline},
        resume_url = ${testData.resumeUrl},
        contact_email = ${testData.contactEmail},
        github_url = ${testData.githubUrl},
        linkedin_url = ${testData.linkedinUrl},
        x_url = ${testData.xUrl},
        logo_text = ${testData.logoText},
        show_hire_me = ${testData.showHireMe},
        updated_at = NOW()
      WHERE id = ${current[0].id}
      RETURNING *
    `;
    
    console.log('✅ Updated record:', updated);
    
    // Verify update
    const verify = await sql`SELECT * FROM home_content LIMIT 1`;
    console.log('✅ Verified record:', verify[0]);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await sql.end();
  }
}

testHomeContentUpdate();