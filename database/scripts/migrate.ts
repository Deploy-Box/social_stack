import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
const envPath = path.resolve(__dirname, '../../backend/.env');
console.log(`Loading environment from: ${envPath}`);
dotenv.config({ path: envPath });

console.log("running script");

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
}

// console.log(DATABASE_URL); // URL contains secrets, better not to log it explicitly

async function runMigrations() {
    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
    });

    try {
        console.log('🔌 Connecting to database...');
        await client.connect();
        console.log('✅ Connected to database');

        // Get all migration files from the migrations directory
        const migrationsDir = path.join(__dirname, '../schemas');
        const migrationFiles = fs
            .readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort(); // Sort to ensure migrations run in order

        console.log(`📁 Found ${migrationFiles.length} migration file(s)`);

        // Run each migration
        for (const migrationFile of migrationFiles) {
            const migrationPath = path.join(migrationsDir, migrationFile);
            const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

            console.log(`⏳ Running migration: ${migrationFile}...`);

            await client.query(migrationSQL);

            console.log(`✅ Migration completed: ${migrationFile}`);
        }

        console.log('🎉 All migrations completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await client.end();
        console.log('🔌 Database connection closed');
    }
}

// Run migrations
runMigrations();
