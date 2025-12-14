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

// Load .env file once when this module is first imported
const envPath = findEnvFile();
if (envPath) {
    dotenv.config({ path: envPath });
    console.log(`📝 Environment loaded from: ${envPath}`);
} else {
    console.warn('⚠️  No .env file found - using system environment variables');
}

// Export a flag to indicate if env was loaded
export const envLoaded = !!envPath;
