import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import dotenv from 'dotenv';
dotenv.config();
// Check if DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in environment variables');
}
// Create a postgres client
const client = postgres(process.env.DATABASE_URL);
// Create a drizzle instance
export const db = drizzle(client, { schema });
