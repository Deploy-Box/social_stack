import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Find .env file by walking up from current working directory
function findEnvFile(): string | null {
    let currentDir = process.cwd();

    // Walk up directory tree to find .env
    while (currentDir) {
        const envPath = path.join(currentDir, '.env');
        if (fs.existsSync(envPath)) {
            return envPath;
        }

        const parentDir = path.dirname(currentDir);
        // Stop if we've reached the root
        if (parentDir === currentDir) break;
        currentDir = parentDir;
    }

    return null;
}

// Load .env file
const envPath = findEnvFile();
if (envPath) {
    dotenv.config({ path: envPath });
    console.log(`📝 Loaded .env from: ${envPath}`);
} else {
    console.warn('⚠️  No .env file found in current directory or parent directories');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function testConnection() {
    try {
        console.log('DATABASE_URL:', process.env.DATABASE_URL);

        // Test connection
        const client = await pool.connect();
        console.log('✅ Connected to database successfully');

        // Check current database
        const dbResult = await client.query('SELECT current_database()');
        console.log('Current database:', dbResult.rows[0].current_database);

        // List all tables
        const tablesResult = await client.query(`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public' 
            ORDER BY tablename
        `);
        console.log('\nTables in database:');
        tablesResult.rows.forEach(row => console.log('  -', row.tablename));

        // Check if users table exists
        const usersCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM pg_tables 
                WHERE schemaname = 'public' 
                AND tablename = 'users'
            )
        `);
        console.log('\nUsers table exists:', usersCheck.rows[0].exists);

        // Try to query users table
        const usersResult = await client.query('SELECT COUNT(*) FROM users');
        console.log('Number of users in table:', usersResult.rows[0].count);

        client.release();
        await pool.end();

        console.log('\n✅ All tests passed!');
    } catch (error: any) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
        await pool.end();
        process.exit(1);
    }
}

testConnection();
