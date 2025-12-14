import { Pool, PoolConfig } from 'pg';
import './loadEnv'; // Load environment variables first
import { logger } from '../utils/logger';

const poolConfig: PoolConfig = {
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};

export const pool = new Pool(poolConfig);

// Test database connection
pool.on('connect', () => {
    logger.info('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    logger.error('❌ Unexpected database error:', err);
    process.exit(-1);
});

// Helper function to execute queries
export const query = async (text: string, params?: any[]) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        logger.debug('Executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        logger.error('Database query error:', error);
        throw error;
    }
};

export default pool;
