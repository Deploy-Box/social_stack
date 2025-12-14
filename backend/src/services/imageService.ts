import { blobServiceClient, containerName } from '../config/azureStorage';
import { logger } from '../utils/logger';

interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

/**
 * Upload an image buffer to Azure Blob Storage
 * @param buffer Image buffer
 * @param filename Original filename 
 * @param folder Optional folder prefix (e.g., 'profiles', 'posts')
 * @returns Upload result with URL or error
 */
export const uploadImage = async (
    buffer: Buffer,
    filename: string,
    folder: string = 'general'
): Promise<UploadResult> => {
    if (!blobServiceClient) {
        return {
            success: false,
            error: 'Azure Storage not configured'
        };
    }

    try {
        const containerClient = blobServiceClient.getContainerClient(containerName);

        // Create container if it doesn't exist
        await containerClient.createIfNotExists({
            access: 'blob' // Public read access for blobs
        });

        // Generate unique blob name with timestamp
        const timestamp = Date.now();
        const extension = filename.split('.').pop();
        const blobName = `${folder}/${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;

        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Upload with content type
        const contentType = getContentType(extension || '');
        await blockBlobClient.upload(buffer, buffer.length, {
            blobHTTPHeaders: { blobContentType: contentType }
        });

        logger.info(`Image uploaded successfully: ${blobName}`);

        return {
            success: true,
            url: blockBlobClient.url
        };
    } catch (error: any) {
        logger.error('Image upload failed:', error);
        return {
            success: false,
            error: error.message || 'Upload failed'
        };
    }
};

/**
 * Delete an image from Azure Blob Storage
 * @param imageUrl Full URL of the image to delete
 */
export const deleteImage = async (imageUrl: string): Promise<boolean> => {
    if (!blobServiceClient) {
        logger.warn('Azure Storage not configured, cannot delete image');
        return false;
    }

    try {
        // Extract blob name from URL
        const url = new URL(imageUrl);
        const pathParts = url.pathname.split('/');
        const blobName = pathParts.slice(2).join('/'); // Skip container name

        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        await blockBlobClient.delete();
        logger.info(`Image deleted successfully: ${blobName}`);
        return true;
    } catch (error: any) {
        logger.error('Image deletion failed:', error);
        return false;
    }
};

/**
 * Get content type based on file extension
 */
const getContentType = (extension: string): string => {
    const types: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp'
    };
    return types[extension.toLowerCase()] || 'application/octet-stream';
};
