import { BlobServiceClient } from '@azure/storage-blob';
import './loadEnv'; // Load environment variables first
import { logger } from '../utils/logger';

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'social-media-images';

if (!connectionString) {
    logger.warn('Azure Storage connection string not configured');
}

let blobServiceClient: BlobServiceClient | null = null;

if (connectionString) {
    try {
        blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        logger.info('Azure Blob Storage client initialized');
    } catch (error) {
        logger.error('Failed to initialize Azure Blob Storage client:', error);
    }
}

export { blobServiceClient, containerName };
