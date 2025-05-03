import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from './index.js';
// This will run migrations on the database, creating tables if they don't exist
// and running any pending migrations
async function main() {
    console.log('Running migrations...');
    try {
        await migrate(db, { migrationsFolder: 'drizzle' });
        console.log('Migrations completed successfully');
    }
    catch (error) {
        console.error('Error during migration:', error);
        process.exit(1);
    }
}
main();
