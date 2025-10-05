# Fix for PostgreSQL Error: "relation 'articles' does not exist"

## Problem Analysis

The error "relation 'articles' does not exist" (PostgreSQL error code 42P01) occurred when attempting to insert a new article record in the PostgreSQL backend. This error happened at line 76 in `src/app/api/admin/articles/route.ts` during a Drizzle ORM insert operation.

### Root Cause

The issue was caused by a mismatch between the database schema and the actual database state:

1. **Schema Definition**: The `articles` table was properly defined in `src/db/schema.ts` with all necessary fields.

2. **Migration File**: A migration file (`drizzle/0005_create_articles_table.sql`) was created with the correct SQL to create the table.

3. **Migration Execution Gap**: The custom migration script (`scripts/run-migration.js`) was updated to check for and create the `articles` table, but this update was not executed in the production environment.

4. **ORM-Generated Query Failure**: When the API routes tried to query the `articles` table using Drizzle ORM, PostgreSQL returned error code 42P01 because the table didn't exist in the database.

## Solution Implemented

### 1. Runtime Table Creation

Added a helper function `ensureArticlesTableExists()` to both API routes:

```typescript
async function ensureArticlesTableExists() {
  try {
    // Check if articles table exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'articles'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log("Articles table does not exist, creating it...");
      
      // Create the articles table
      await db.execute(sql`
        CREATE TABLE "articles" (
          "id" serial PRIMARY KEY NOT NULL,
          "name" text NOT NULL,
          "url" text NOT NULL,
          "enabled" boolean DEFAULT true NOT NULL,
          "display_order" integer DEFAULT 0 NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      
      console.log("Articles table created successfully");
      
      // Insert default articles
      await db.insert(articles).values(DEFAULT_ARTICLES);
      console.log("Default articles created successfully");
    }
  } catch (error) {
    console.error("Error ensuring articles table exists:", error);
    throw error;
  }
}
```

### 2. API Route Updates

Updated all API route handlers in both `src/app/api/admin/articles/route.ts` and `src/app/api/articles/route.ts` to call `ensureArticlesTableExists()` before any database operations:

- GET handler: Ensures table exists before fetching articles
- POST handler: Ensures table exists before creating new articles
- PUT handler: Ensures table exists before updating articles
- DELETE handler: Ensures table exists before deleting articles

### 3. Migration Script Update

Updated `scripts/run-migration.js` to include a check for the `articles` table and create it if it doesn't exist:

```javascript
// Check if articles table exists
const articlesTableCheck = await pool.query(`
  SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'articles'
  );
`);

const articlesTableExists = articlesTableCheck.rows[0].exists;
console.log('Articles table exists:', articlesTableExists);

// If articles table doesn't exist, create it
if (!articlesTableExists) {
  console.log('Articles table does not exist, creating it...');
  
  // Read the articles migration file
  const articlesMigrationPath = path.join(__dirname, '..', 'drizzle', '0005_create_articles_table.sql');
  const articlesMigrationSQL = fs.readFileSync(articlesMigrationPath, 'utf8');
  
  // Execute the articles migration
  await pool.query(articlesMigrationSQL);
  console.log('Articles table created successfully');
} else {
  console.log('Articles table already exists');
}
```

## How to Apply the Fix

### Immediate Fix (Runtime Table Creation)

The runtime table creation has already been implemented in the API routes. This will automatically create the `articles` table the first time an API endpoint is accessed, even if the migration script hasn't been run.

### Manual Migration (Recommended)

For a more robust solution, run the updated migration script:

```bash
node scripts/run-migration.js
```

This will create the `articles` table in the database using the migration file, which is the proper way to manage database schema changes.

## Prevention of Future Issues

### 1. Migration Workflow

Establish a proper migration workflow:

1. Always run migrations after deploying schema changes
2. Consider using Drizzle Kit's built-in migration system for more robust migration management
3. Add database schema checks to your deployment process

### 2. Error Handling

The API routes now include comprehensive error handling for cases where database tables don't exist, providing a better user experience.

### 3. Monitoring

Add monitoring to detect database schema inconsistencies early, before they affect users.

## Testing the Fix

1. **Access the Admin Panel**: Navigate to `/admin/articles` and try to add a new article source.
2. **Check the Articles Page**: Visit `/articles` to verify that articles are being fetched correctly.
3. **Monitor Logs**: Check the server logs for messages about the articles table being created.

## Files Modified

1. `src/app/api/admin/articles/route.ts` - Added runtime table creation and updated all handlers
2. `src/app/api/articles/route.ts` - Added runtime table creation
3. `scripts/run-migration.js` - Added check for articles table

## Summary

This fix ensures that the `articles` table exists in the database before any operations are performed on it, preventing the "relation 'articles' does not exist" error. The solution includes both immediate runtime table creation and a proper migration script for long-term database schema management.