import { WorkOS } from '@workos-inc/node';
import './loadEnv'; // Load environment variables first

const apiKey = process.env.WORKOS_API_KEY;

if (!apiKey) {
    console.warn('⚠️  WorkOS API key not configured. Authentication endpoints will not work.');
    console.warn('   Please create a .env file in the backend folder and add WORKOS_API_KEY');
}

// Initialize WorkOS client (will use empty string if not configured - endpoints will fail gracefully)
const workos = new WorkOS(apiKey || 'not-configured');
const clientId = process.env.WORKOS_CLIENT_ID || '';

export { workos, clientId };
