import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set in .env.local. Please provide a valid PostgreSQL connection string.'
  );
}

// Create a connection pool with better error handling and retry logic
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : { rejectUnauthorized: false }, // Secure SSL for production
  max: 10, // Reduced maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 5000, // Increased timeout for connection establishment
  query_timeout: 30000, // Timeout for queries
  keepAlive: true, // Keep the connection alive
  keepAliveInitialDelayMillis: 10000, // Initial delay before keep-alive
});

// Add error handling for the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Add connection event listeners for debugging
pool.on('connect', () => {
  // console.log('Connected to PostgreSQL database');
});

pool.on('remove', () => {
  // console.log('Client removed from pool');
});

// Create a function to test the database connection
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as now');
    client.release();
    console.log('Database connection successful at:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return false;
  }
};

// Export the database instance with schema
export const db = drizzle(pool, { 
  schema,
  logger: process.env.NODE_ENV === 'development' // Enable query logging in development
});

// Export the pool for direct queries if needed
export { pool };
