import { Pool } from 'pg';

const pool = new Pool({
    host: '127.0.0.1',
    port: 5432,
    database: 'social_stack_dev',
    user: 'devuser',
    password: 'devpassword',
});

async function testConnection() {
    try {
        console.log('Testing connection to 127.0.0.1...');
        const client = await pool.connect();
        console.log('✅ Connected successfully');

        const result = await client.query('SELECT current_database(), current_user, version()');
        console.log('Database:', result.rows[0]);

        client.release();
        await pool.end();
    } catch (error: any) {
        console.error('❌ Connection failed:', error.message);
        console.error('Full error details:', error);
        process.exit(1);
    }
}

testConnection();
