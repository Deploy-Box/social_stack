import { Router, Request, Response } from 'express';
import { workos, clientId } from '../config/workos';
import { pool } from '../config/database';
import { logger } from '../utils/logger';
import { authenticateUser } from '../middleware/auth';

const router = Router();

/**
 * GET /auth/login
 * Initiates WorkOS OAuth flow
 */
router.get('/login', (req: Request, res: Response) => {
    try {
        const redirectUri = process.env.WORKOS_REDIRECT_URI || 'http://localhost:3000/api/v1/auth/callback';

        // Generate authorization URL for WorkOS
        const authorizationUrl = workos.userManagement.getAuthorizationUrl({
            provider: 'authkit',
            clientId: clientId,
            redirectUri: redirectUri,
        });

        res.json({
            authorizationUrl: authorizationUrl
        });
    } catch (error: any) {
        logger.error('Login initiation failed:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to initiate login'
        });
    }
});

/**
 * GET /auth/callback
 * Handles WorkOS OAuth callback
 */
router.get('/callback', async (req: Request, res: Response) => {
    try {
        const { code } = req.query;

        if (!code || typeof code !== 'string') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Authorization code is required'
            });
        }

        // Exchange code for user profile
        const { user, accessToken } = await workos.userManagement.authenticateWithCode({
            clientId: clientId,
            code: code,
        });

        console.log("user has been authenticated");

        // Check if user exists in database
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE workos_user_id = $1',
            [user.id]
        );

        let dbUser;

        if (existingUser.rows.length === 0) {
            // Create new user
            const newUser = await pool.query(
                `INSERT INTO users (workos_user_id, email, name) 
                 VALUES ($1, $2, $3) 
                 RETURNING *`,
                [user.id, user.email, `${user.firstName} ${user.lastName}`]
            );

            // Create profile for new user
            await pool.query(
                `INSERT INTO profiles (user_id) VALUES ($1)`,
                [newUser.rows[0].id]
            );

            dbUser = newUser.rows[0];
            logger.info(`New user created: ${user.email}`);
        } else {
            dbUser = existingUser.rows[0];
        }

        // Return user data and access token
        res.json({
            user: {
                id: dbUser.id,
                workosUserId: dbUser.workos_user_id,
                email: dbUser.email,
                name: dbUser.name
            },
            accessToken: accessToken
        });
    } catch (error: any) {
        logger.error('OAuth callback failed:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Authentication failed'
        });
    }
});

/**
 * GET /auth/me
 * Get current authenticated user
 */
router.get('/me', authenticateUser, async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // Fetch full user data including profile
        const result = await pool.query(
            `SELECT u.*, p.display_name, p.bio, p.profile_image_url, p.cover_image_url, p.location, p.website
             FROM users u
             LEFT JOIN profiles p ON u.id = p.user_id
             WHERE u.workos_user_id = $1`,
            [req.user.workosUserId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: result.rows[0] });
    } catch (error: any) {
        logger.error('Get current user failed:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch user data'
        });
    }
});

/**
 * POST /auth/logout
 * Logout user (client should clear token)
 */
router.post('/logout', authenticateUser, (req: Request, res: Response) => {
    // With WorkOS, logout is primarily client-side (clearing the token)
    // You could also revoke the session here if using WorkOS session management
    res.json({ message: 'Logged out successfully' });
});

export default router;
