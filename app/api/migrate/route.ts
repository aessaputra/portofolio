import { NextRequest, NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // Check if migration is already completed
    const sql = postgres(process.env.DATABASE_URL!, {
      ssl: 'require',
      max: 1,
    });

    const db = drizzle(sql);
    
    // Check if about_me_text column already exists
    const columnExists = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'about_content' 
      AND column_name = 'about_me_text'
    `;

    if (columnExists.length > 0) {
      await sql.end();
      return NextResponse.json({ 
        success: true, 
        message: 'Migration already completed' 
      });
    }

    // Run migration
    await migrate(db, { 
      migrationsFolder: path.join(process.cwd(), 'drizzle') 
    });

    await sql.end();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Migration completed successfully' 
    });
  } catch (error) {
    console.error('Migration failed:', error);
    return NextResponse.json(
      { success: false, error: 'Migration failed' },
      { status: 500 }
    );
  }
}
