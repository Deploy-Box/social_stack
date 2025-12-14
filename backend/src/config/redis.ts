import { createClient } from 'redis';
import './loadEnv'; // Load environment variables first
import { logger } from '../utils/logger';

const connectionString = process.env.AZURE_REDIS_CONNECTION_STRING;

// Create separate clients for publishing and subscribing
const createRedisClient = () => {
    if (!connectionString) {
        logger.warn('Azure Redis connection string not configured');
        return null;
    }



    try {
        // Parse Azure Redis connection string format: 
        // hostname:port,password=key,ssl=True,abortConnect=False
        // OR standard format: rediss://hostname:port

        let redisUrl: string;
        let password: string | undefined;

        // Check for standard Redis URL format first (includes localhost)
        if (connectionString.startsWith('redis://') || connectionString.startsWith('rediss://')) {
            // Standard Redis URL format (e.g., redis://localhost:6379 or rediss://host:port)
            redisUrl = connectionString;
            logger.info('Using standard Redis URL format');
        }
        else {
            // Azure format: hostname:port,password=key,ssl=True
            logger.info('Parsing Azure Redis connection string format');
            const parts = connectionString.split(',');
            const hostPort = parts[0].trim();

            // Extract password
            const passwordPart = parts.find(p => p.includes('password='));
            if (passwordPart) {
                password = passwordPart.split('=').slice(1).join('=').trim();
            }

            // Determine if SSL should be used
            const useSsl = parts.some(p => p.includes('ssl=True') || p.includes('ssl=true'));
            redisUrl = `${useSsl ? 'rediss' : 'redis'}://${hostPort}`;
        }

        logger.info(`Connecting to Redis at: ${redisUrl.replace(/:[^:@]*@/, ':***@')}`);
        logger.info(`Redis password configured: ${password ? `Yes (${password.length} chars)` : 'No'}`);

        const client = createClient({
            url: redisUrl,
            password: password,
            socket: {
                tls: redisUrl.startsWith('rediss://'),
                rejectUnauthorized: false, // For Azure Redis with self-signed certs
                connectTimeout: 10000, // 10 seconds
                keepAlive: 5000,
                reconnectStrategy: (retries) => {
                    if (retries > 3) {
                        logger.error('Redis max reconnection attempts reached');
                        return false; // Stop reconnecting
                    }
                    return Math.min(retries * 100, 3000);
                }
            }
        });

        client.on('error', (err: any) => {
            // Convert error to proper string format
            let errorMessage: string;
            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (typeof err === 'string') {
                errorMessage = err;
            } else {
                errorMessage = JSON.stringify(err);
            }
            logger.error(`Redis Client Error: ${errorMessage}`);
        });

        client.on('connect', () => {
            logger.info('Redis Client Connected successfully');
        });

        client.on('ready', () => {
            logger.info('Redis Client Ready for commands');
        });

        client.on('reconnecting', () => {
            logger.warn('Redis Client Reconnecting...');
        });

        return client;
    } catch (error: any) {
        logger.error('Failed to create Redis client:', error.message);
        return null;
    }
};

// Create publisher and subscriber clients
const redisPublisher = createRedisClient();
const redisSubscriber = createRedisClient();

// Connect clients
const connectRedis = async () => {
    if (!redisPublisher || !redisSubscriber) {
        logger.warn('Redis clients not initialized - messaging features will be unavailable');
        return;
    }

    try {
        logger.info('Connecting to Azure Redis...');
        await Promise.all([
            redisPublisher.connect(),
            redisSubscriber.connect()
        ]);
        logger.info('✅ Azure Redis clients connected successfully');
    } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('❌ Failed to connect to Azure Redis:', errorMessage);
        logger.warn('Messaging features will be unavailable');
        // Don't throw - let the server continue without Redis
    }
};

export { redisPublisher, redisSubscriber, connectRedis };
